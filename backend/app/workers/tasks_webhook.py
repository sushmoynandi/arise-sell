"""Asynchronous Meta & WhatsApp Webhook Ingestion Worker with Dynamic Multi-Tenant Routing."""
from __future__ import annotations

import asyncio
import concurrent.futures
import logging
import uuid

from sqlalchemy import or_, select

from app.core.database import async_session_factory
from app.models.channel import ConnectedChannel
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


async def _resolve_business_id_by_identifier_async(
    identifier: str | None,
    channel_type: str | None = None,
) -> uuid.UUID | None:
    """Query ConnectedChannel to resolve tenant business_id for the given channel identifier."""
    if not identifier:
        return None

    str_id = str(identifier).strip()
    if not str_id:
        return None

    async with async_session_factory() as db:
        conditions = []
        if hasattr(ConnectedChannel, "identifier"):
            conditions.append(ConnectedChannel.identifier == str_id)
        if hasattr(ConnectedChannel, "external_id"):
            conditions.append(ConnectedChannel.external_id == str_id)

        if not conditions:
            return None

        where_clause = or_(*conditions) if len(conditions) > 1 else conditions[0]

        # 1. Priority: live channels matching identifier
        stmt = (
            select(ConnectedChannel.business_id)
            .where(where_clause, ConnectedChannel.is_live.is_(True))
        )
        if channel_type:
            stmt = stmt.where(ConnectedChannel.channel_type == channel_type)
        stmt = stmt.limit(1)

        res = await db.execute(stmt)
        biz_id = res.scalar_one_or_none()
        if biz_id:
            return biz_id

        # 2. Fallback: match without is_live restriction
        fallback_stmt = select(ConnectedChannel.business_id).where(where_clause)
        if channel_type:
            fallback_stmt = fallback_stmt.where(ConnectedChannel.channel_type == channel_type)
        fallback_stmt = fallback_stmt.limit(1)

        fallback_res = await db.execute(fallback_stmt)
        return fallback_res.scalar_one_or_none()


def resolve_channel_business_id(
    identifier: str | None,
    channel_type: str | None = None,
) -> str | None:
    """Synchronously resolves business_id string from ConnectedChannel by identifier."""
    if not identifier:
        return None

    try:
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:
            loop = None

        if loop and loop.is_running():
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
                biz_id = executor.submit(
                    asyncio.run,
                    _resolve_business_id_by_identifier_async(identifier, channel_type),
                ).result()
        else:
            biz_id = asyncio.run(_resolve_business_id_by_identifier_async(identifier, channel_type))

        return str(biz_id) if biz_id else None
    except Exception as exc:
        logger.error(
            "[Webhook Resolver] Failed resolving business_id for identifier %s (%s): %s",
            identifier,
            channel_type,
            exc,
        )
        return None


@celery_app.task(name="process_meta_webhook_event")
def process_meta_webhook_event(payload: dict) -> dict:
    """Processes incoming Facebook Messenger / Instagram webhook event with dynamic routing."""
    entries = payload.get("entry", [])
    default_page_id = (
        str(entries[0].get("id"))
        if entries and isinstance(entries, list) and entries[0].get("id")
        else None
    )

    processed = 0
    for entry in entries:
        entry_page_id = str(entry.get("id")) if entry.get("id") else default_page_id
        messaging = entry.get("messaging", [])

        for event in messaging:
            sender_id = event.get("sender", {}).get("id")
            recipient_id = (
                str(event.get("recipient", {}).get("id"))
                if event.get("recipient", {}).get("id")
                else None
            )

            # Resolve page identifier (entry[0].id or recipient.id)
            page_id = entry_page_id or recipient_id

            message = event.get("message", {})
            text = message.get("text", "")
            if not text and "postback" in event:
                text = (
                    event.get("postback", {}).get("title", "")
                    or event.get("postback", {}).get("payload", "")
                )
            if not text and "quick_reply" in message:
                text = message.get("quick_reply", {}).get("payload", "")

            if sender_id and text:
                # Resolve business_id from ConnectedChannel table matching identifier before dispatching
                business_id_str = resolve_channel_business_id(page_id, channel_type="messenger")
                if not business_id_str and page_id:
                    business_id_str = resolve_channel_business_id(page_id)

                # Trigger async AI reasoning with tenant isolation
                from app.workers.tasks_ai import dispatch_ai_reply_task

                dispatch_ai_reply_task.delay(
                    recipient_id=sender_id,
                    message_text=text,
                    channel="messenger",
                    business_id_str=business_id_str,
                    channel_identifier=page_id,
                )
                processed += 1

    return {"status": "success", "processed_events": processed}


@celery_app.task(name="process_whatsapp_webhook_event")
def process_whatsapp_webhook_event(payload: dict) -> dict:
    """Processes incoming WhatsApp Business Cloud API webhook event with dynamic routing."""
    entries = payload.get("entry", [])

    default_phone_number_id = None
    if entries and isinstance(entries, list):
        first_entry = entries[0]
        first_changes = first_entry.get("changes", [])
        if first_changes and isinstance(first_changes, list):
            first_val = first_changes[0].get("value", {})
            metadata = first_val.get("metadata", {})
            if metadata.get("phone_number_id"):
                default_phone_number_id = str(metadata.get("phone_number_id"))

    processed = 0
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            metadata = value.get("metadata", {})
            phone_number_id = (
                str(metadata.get("phone_number_id"))
                if metadata.get("phone_number_id")
                else default_phone_number_id
            )

            messages = value.get("messages", [])
            for msg in messages:
                from_num = msg.get("from")
                msg_type = msg.get("type", "text")
                text = ""
                if msg_type == "text":
                    text = msg.get("text", {}).get("body", "")
                elif msg_type == "button":
                    text = msg.get("button", {}).get("text", "")
                elif msg_type == "interactive":
                    interactive = msg.get("interactive", {})
                    text = (
                        interactive.get("button_reply", {}).get("title")
                        or interactive.get("list_reply", {}).get("title", "")
                    )
                else:
                    text = msg.get("text", {}).get("body", "") if isinstance(msg.get("text"), dict) else ""

                if from_num and text:
                    # Resolve business_id from ConnectedChannel table matching identifier before dispatching
                    business_id_str = resolve_channel_business_id(phone_number_id, channel_type="whatsapp")
                    if not business_id_str and phone_number_id:
                        business_id_str = resolve_channel_business_id(phone_number_id)

                    from app.workers.tasks_ai import dispatch_ai_reply_task

                    dispatch_ai_reply_task.delay(
                        recipient_id=from_num,
                        message_text=text,
                        channel="whatsapp",
                        business_id_str=business_id_str,
                        channel_identifier=phone_number_id,
                    )
                    processed += 1

    return {"status": "success", "processed_events": processed}

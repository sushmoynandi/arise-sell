"""Asynchronous AI Reasoning and Outbound Reply Dispatcher with Database Context & Multi-Tenant Routing."""
from __future__ import annotations

import asyncio
import logging
import uuid
from typing import Any

from sqlalchemy import or_, select

from app.core.database import async_session_factory
from app.models.channel import ConnectedChannel
from app.models.tenant import Business
from app.services.ai_engine import generate_production_ai_response
from app.services.meta_graph import send_messenger_message
from app.services.whatsapp_cloud import send_whatsapp_text
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="dispatch_ai_reply_task")
def dispatch_ai_reply_task(
    recipient_id: str,
    message_text: str,
    channel: str,
    business_id_str: str | None = None,
    image_url: str | None = None,
    channel_identifier: str | None = None,
) -> dict:
    """Dispatches autonomous AI reply with strict multi-tenant catalog and knowledge isolation."""

    async def _run() -> dict[str, Any]:
        async with async_session_factory() as db:
            biz_id: uuid.UUID | None = None

            # 1. Use business_id resolved by webhook router if provided
            if business_id_str:
                try:
                    biz_id = uuid.UUID(str(business_id_str))
                except (ValueError, TypeError):
                    biz_id = None

            # 2. Dynamic fallback: resolve from ConnectedChannel using channel_identifier
            if not biz_id and channel_identifier:
                identifier_str = str(channel_identifier).strip()
                conditions = []
                if hasattr(ConnectedChannel, "identifier"):
                    conditions.append(ConnectedChannel.identifier == identifier_str)
                if hasattr(ConnectedChannel, "external_id"):
                    conditions.append(ConnectedChannel.external_id == identifier_str)

                if conditions:
                    where_clause = or_(*conditions) if len(conditions) > 1 else conditions[0]
                    chan_stmt = (
                        select(ConnectedChannel.business_id)
                        .where(where_clause)
                        .limit(1)
                    )
                    chan_res = await db.execute(chan_stmt)
                    biz_id = chan_res.scalar_one_or_none()

            # 3. Single-tenant / dev fallback if still unassigned
            if not biz_id:
                try:
                    biz_stmt = select(Business.id).limit(1)
                    biz_res = await db.execute(biz_stmt)
                    biz_id = biz_res.scalar_one_or_none()
                except Exception:
                    biz_id = None

            # 4. Lookup channel specific credentials if available
            channel_record = None
            if biz_id:
                try:
                    channel_query = select(ConnectedChannel).where(ConnectedChannel.business_id == biz_id)
                    if channel:
                        channel_query = channel_query.where(ConnectedChannel.channel_type == channel)
                    if channel_identifier:
                        id_conds = []
                        if hasattr(ConnectedChannel, "identifier"):
                            id_conds.append(ConnectedChannel.identifier == str(channel_identifier))
                        if hasattr(ConnectedChannel, "external_id"):
                            id_conds.append(ConnectedChannel.external_id == str(channel_identifier))
                        if id_conds:
                            channel_query = channel_query.where(or_(*id_conds))
                    channel_query = channel_query.limit(1)
                    ch_res = await db.execute(channel_query)
                    channel_record = ch_res.scalar_one_or_none()
                except Exception as exc:
                    logger.debug("[AI Worker] Channel credentials lookup skipped: %s", exc)

            # 5. Execute production AI reasoning with isolated tenant context
            res = await generate_production_ai_response(
                customer_name="Customer",
                customer_msg=message_text,
                channel=channel,
                business_id=biz_id,
                db=db,
                image_url=image_url,
            )

            reply_text = res.get("reply", "")
            if reply_text:
                custom_token = getattr(channel_record, "access_token", None) if channel_record else None
                phone_id = channel_identifier or (getattr(channel_record, "external_id", None) if channel_record else None)

                try:
                    if channel == "whatsapp":
                        await send_whatsapp_text(
                            to_phone=recipient_id,
                            body=reply_text,
                            phone_number_id=phone_id,
                            access_token=custom_token,
                        )
                    elif channel in ["messenger", "instagram"]:
                        await send_messenger_message(
                            recipient_id=recipient_id,
                            text=reply_text,
                            page_access_token=custom_token,
                        )
                except Exception:
                    pass

            return res

    return asyncio.run(_run())

"""Asynchronous AI Reasoning and Outbound Reply Dispatcher with Database Context."""
from __future__ import annotations

import asyncio
import uuid
from sqlalchemy import select
from app.workers.celery_app import celery_app
from app.core.database import async_session_factory
from app.models.tenant import Business
from app.services.ai_engine import generate_production_ai_response
from app.services.meta_graph import send_messenger_message
from app.services.whatsapp_cloud import send_whatsapp_text


@celery_app.task(name="dispatch_ai_reply_task")
def dispatch_ai_reply_task(
    recipient_id: str,
    message_text: str,
    channel: str,
    business_id_str: str | None = None,
    image_url: str | None = None,
) -> dict:
    async def _run():
        async with async_session_factory() as db:
            biz_id = None
            if business_id_str:
                try:
                    biz_id = uuid.UUID(business_id_str)
                except ValueError:
                    biz_id = None

            if not biz_id:
                biz_stmt = select(Business.id).limit(1)
                biz_res = await db.execute(biz_stmt)
                biz_id = biz_res.scalar_one_or_none()

            res = await generate_production_ai_response(
                customer_name="Customer",
                customer_msg=message_text,
                channel=channel,
                business_id=biz_id,
                db=db,
                image_url=image_url,
            )

            reply_text = res.get("reply", "")
            if channel == "whatsapp":
                await send_whatsapp_text(recipient_id, reply_text)
            elif channel in ["messenger", "instagram"]:
                await send_messenger_message(recipient_id, reply_text)

            return res

    return asyncio.run(_run())

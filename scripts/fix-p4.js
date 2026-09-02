const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const servicesDir = path.join(rootDir, 'backend', 'app', 'services');
const workersDir = path.join(rootDir, 'backend', 'app', 'workers');
const webhooksDir = path.join(rootDir, 'backend', 'app', 'api', 'webhooks');

// 1. tasks_ai.py
const tasksAiPy = `"""Asynchronous AI Reasoning and Outbound Reply Dispatcher with Database Context."""
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
`;
fs.writeFileSync(path.join(workersDir, 'tasks_ai.py'), tasksAiPy, 'utf8');
console.log('Fixed tasks_ai.py');

// 2. handoff_detector.py
const handoffPy = `"""Automated Human Handoff & Escalation Detector."""
from __future__ import annotations

from typing import Any

EXPLICIT_HANDOFF_KEYWORDS = [
    "human", "agent", "manush", "manus", "kotha bolbo", "kotha bolte chai",
    "call me", "phone den", "number den", "bhai kotha bolen", "support",
    "মানুষের সাথে কথা", "কথা বলতে চাই", "ফোন দেন", "এজেন্ট", "মালিক",
]

ANGRY_SENTIMENT_KEYWORDS = [
    "scam", "fraud", "bad service", "faltu", "baje", "cheat", "police",
    "falti", "dhoka", "dharina", "chharbo na", "দুই নম্বর", "ফালতু", "প্রতারক",
]


def evaluate_handoff_triggers(
    message_text: str,
    order_quantity: int = 1,
    order_value_bdt: float = 0.0,
    consecutive_guardrail_fires: int = 0,
) -> dict[str, Any] | None:
    text_lower = message_text.lower()

    if any(k in text_lower for k in EXPLICIT_HANDOFF_KEYWORDS):
        return {
            "trigger": "explicit_request",
            "reason": "Customer explicitly asked for a human team member",
            "priority": "high",
        }

    if any(k in text_lower for k in ANGRY_SENTIMENT_KEYWORDS):
        return {
            "trigger": "angry_sentiment",
            "reason": "Negative sentiment / dissatisfaction detected",
            "priority": "urgent",
        }

    if order_quantity >= 10 or order_value_bdt >= 20000.0 or any(k in text_lower for k in ["পাইকারি", "wholesale", "bulk"]):
        return {
            "trigger": "bulk_order",
            "reason": f"Bulk wholesale order volume detected ({order_quantity} units / ৳{int(order_value_bdt):,})",
            "priority": "high",
        }

    if consecutive_guardrail_fires >= 2:
        return {
            "trigger": "guardrail_loop",
            "reason": "AI guardrails triggered repeatedly in succession",
            "priority": "medium",
        }

    return None
`;
fs.writeFileSync(path.join(servicesDir, 'handoff_detector.py'), handoffPy, 'utf8');
console.log('Fixed handoff_detector.py');

console.log('✅ ALL PHASE 4 CODE REVIEW FIXES APPLIED!');

"""Automated Human Handoff & Escalation Detector."""
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

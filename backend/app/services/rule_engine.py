"""Automation Rule Engine & Trigger Condition Evaluator."""
from __future__ import annotations

from typing import Any


def evaluate_comment_trigger(comment_text: str, rules: list[dict[str, Any]]) -> dict[str, Any] | None:
    """Match comment text against active keyword rules."""
    text_lower = comment_text.lower()
    for r in rules:
        trigger = r.get("trigger", "").lower()
        keywords = [k.strip(' "') for k in trigger.split("/") if k.strip()]
        if any(k in text_lower for k in keywords):
            return r
    return None


def is_within_working_hours(current_hour: int, start_hour: int = 9, end_hour: int = 22) -> bool:
    """Check if business is currently open for human agent reply."""
    return start_hour <= current_hour < end_hour

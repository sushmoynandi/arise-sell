"""Meta Facebook Messenger and Instagram Direct Graph API Integration."""
from __future__ import annotations

import httpx
from typing import Any
from app.core.config import settings

GRAPH_API_BASE = "https://graph.facebook.com/v21.0"


async def send_messenger_message(
    recipient_id: str,
    text: str,
    page_access_token: str | None = None,
) -> dict[str, Any]:
    """Send text message to Facebook Messenger user."""
    token = page_access_token or settings.META_PAGE_ACCESS_TOKEN
    url = f"{GRAPH_API_BASE}/me/messages"
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": text},
        "messaging_type": "RESPONSE",
    }
    
    if not token:
        return {"status": "simulated", "recipient_id": recipient_id, "text": text}

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, params={"access_token": token})
        return res.json()


async def reply_to_comment(
    comment_id: str,
    message: str,
    page_access_token: str | None = None,
) -> dict[str, Any]:
    """Post public reply to a Facebook / Instagram post comment."""
    token = page_access_token or settings.META_PAGE_ACCESS_TOKEN
    url = f"{GRAPH_API_BASE}/{comment_id}/comments"
    payload = {"message": message}

    if not token:
        return {"status": "simulated", "comment_id": comment_id, "message": message}

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, params={"access_token": token})
        return res.json()

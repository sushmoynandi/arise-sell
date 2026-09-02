"""Meta Facebook Login for Business OAuth Exchange & Page Subscription."""
from __future__ import annotations

import httpx
from typing import Any
from app.core.config import settings

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"


def get_meta_oauth_url(redirect_uri: str, state: str) -> str:
    app_id = settings.META_APP_ID or "109827364519283"
    scope = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_messaging,whatsapp_business_messaging,instagram_basic,instagram_manage_messages,instagram_manage_comments"
    return (
        f"https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth?"
        f"client_id={app_id}&redirect_uri={redirect_uri}&state={state}&scope={scope}&response_type=code"
    )


async def exchange_meta_code_for_long_lived_token(
    code: str,
    redirect_uri: str,
) -> dict[str, Any]:
    if not settings.META_APP_SECRET:
        return {
            "status": "simulated",
            "access_token": "EAAG...long_lived_token_sample",
            "token_type": "bearer",
            "expires_in": 5184000,
        }

    app_id = settings.META_APP_ID or "109827364519283"
    url = f"{GRAPH_API_BASE}/oauth/access_token"
    params = {
        "client_id": app_id,
        "redirect_uri": redirect_uri,
        "client_secret": settings.META_APP_SECRET,
        "code": code,
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.get(url, params=params)
            return res.json()
    except Exception as e:
        return {"error": str(e), "status": "failed"}


async def subscribe_page_to_webhooks(page_id: str, page_access_token: str) -> dict[str, Any]:
    url = f"{GRAPH_API_BASE}/{page_id}/subscribed_apps"
    params = {
        "subscribed_fields": "messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads,feed",
        "access_token": page_access_token,
    }

    if not page_access_token or page_access_token.startswith("EAAG..."):
        return {"success": True, "status": "simulated"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, params=params)
            return res.json()
    except Exception as e:
        return {"error": str(e), "status": "failed"}

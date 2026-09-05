"""Meta Facebook Messenger and Instagram Direct Graph API Integration."""
from __future__ import annotations

import logging
from typing import Any
import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

GRAPH_API_BASE = "https://graph.facebook.com/v21.0"

# Reusable connection-pooled client with 15.0s timeout
_limits = httpx.Limits(max_keepalive_connections=20, max_connections=50)
_client: httpx.AsyncClient | None = None


def get_meta_http_client() -> httpx.AsyncClient:
    """Returns or initializes shared connection-pooled HTTP client with 15.0s timeout."""
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(
            timeout=15.0,
            limits=_limits,
            headers={"User-Agent": "AriseSell/2.0"},
        )
    return _client


async def send_messenger_message(
    recipient_id: str,
    text: str,
    page_access_token: str | None = None,
    comment_id: str | None = None,
) -> dict[str, Any]:
    """
    Send text message to Facebook Messenger user.
    Supports standard PSID messaging and private comment reply (comment_id).
    Handles Meta error #190 (Token Expired) and #200 (Permission Error).
    Client timeout: 15.0s.
    """
    token = page_access_token or settings.META_PAGE_ACCESS_TOKEN
    url = f"{GRAPH_API_BASE}/me/messages"

    if comment_id:
        payload: dict[str, Any] = {
            "recipient": {"comment_id": comment_id},
            "message": {"text": text},
            "messaging_type": "RESPONSE",
        }
    else:
        payload = {
            "recipient": {"id": recipient_id},
            "message": {"text": text},
            "messaging_type": "RESPONSE",
        }

    # If sandbox token or not configured, return simulated response
    if not token or token.startswith("EAAG_SANDBOX") or token.startswith("mock_"):
        logger.info("[Meta Messenger Simulated Outbound] to %s: '%s'", recipient_id or comment_id, text)
        return {
            "success": True,
            "status": "simulated",
            "recipient_id": recipient_id,
            "comment_id": comment_id,
            "text": text,
            "message_id": f"m_mid.simulated_{recipient_id or comment_id}",
        }

    client = get_meta_http_client()
    try:
        res = await client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        data = res.json()

        if res.status_code >= 400:
            err = data.get("error", {})
            err_code = err.get("code")
            err_subcode = err.get("error_subcode")
            err_msg = err.get("message", "Unknown Meta API error")

            if err_code == 190:
                logger.error(
                    "🚨 [Meta Graph API Error #190]: Page access token has expired or is invalid! "
                    "Subcode: %s. Merchant must re-authenticate Facebook Page. Msg: %s",
                    err_subcode,
                    err_msg,
                )
                return {
                    "success": False,
                    "error_code": 190,
                    "error_subcode": err_subcode,
                    "error": err_msg,
                    "reauth_required": True,
                    "status_code": res.status_code,
                }
            elif err_code == 200:
                logger.error(
                    "⚠️ [Meta Graph API Error #200]: Meta permission error or recipient not reachable. "
                    "Ensure 'pages_messaging' permission is active and user has engaged the Page. Msg: %s",
                    err_msg,
                )
                return {
                    "success": False,
                    "error_code": 200,
                    "error": err_msg,
                    "permission_denied": True,
                    "status_code": res.status_code,
                }
            else:
                logger.warning(
                    "[Meta Graph API Error #%s]: %s (Status: %s)",
                    err_code,
                    err_msg,
                    res.status_code,
                )
                return {
                    "success": False,
                    "error_code": err_code,
                    "error": err_msg,
                    "status_code": res.status_code,
                }

        data["success"] = True
        return data
    except Exception as exc:
        logger.error("[Meta Messenger Outbound Exception]: %s", exc)
        return {"success": False, "error": str(exc), "status_code": 500}


async def reply_to_comment(
    comment_id: str,
    message: str,
    page_access_token: str | None = None,
) -> dict[str, Any]:
    """
    Post public reply to a Facebook / Instagram post comment.
    Handles errors and token resilience.
    Client timeout: 15.0s.
    """
    token = page_access_token or settings.META_PAGE_ACCESS_TOKEN
    url = f"{GRAPH_API_BASE}/{comment_id}/comments"
    payload = {"message": message}

    if not token or token.startswith("EAAG_SANDBOX") or token.startswith("mock_"):
        logger.info("[Meta Comment Reply Simulated] to %s: '%s'", comment_id, message)
        return {
            "success": True,
            "status": "simulated",
            "comment_id": comment_id,
            "message": message,
            "id": f"{comment_id}_reply_simulated",
        }

    client = get_meta_http_client()
    try:
        res = await client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        data = res.json()
        if res.status_code >= 400:
            err = data.get("error", {})
            err_code = err.get("code")
            err_msg = err.get("message", "Comment reply failed")
            if err_code == 190:
                logger.error("🚨 [Meta Comment Reply Error #190]: Access token expired. Msg: %s", err_msg)
            else:
                logger.warning("[Meta Comment Reply Error #%s]: %s", err_code, err_msg)
            return {"success": False, "error_code": err_code, "error": err_msg}

        data["success"] = True
        return data
    except Exception as exc:
        logger.error("[Meta Comment Reply Exception]: %s", exc)
        return {"success": False, "error": str(exc)}


async def get_user_profile(
    user_id: str,
    page_access_token: str | None = None,
) -> dict[str, Any]:
    """
    Query Graph API to fetch customer's Facebook profile details (first_name, last_name, name).
    Falls back gracefully if token is absent, simulated, or permissions are restricted.
    """
    token = page_access_token or settings.META_PAGE_ACCESS_TOKEN
    if not token or token.startswith("EAAG_SANDBOX") or not user_id:
        return {"name": "Customer", "first_name": "Customer", "last_name": ""}

    client = get_meta_http_client()
    url = f"{GRAPH_API_BASE}/{user_id}"
    params = {
        "fields": "first_name,last_name,name,profile_pic",
        "access_token": token,
    }
    try:
        res = await client.get(url, params=params)
        if res.status_code == 200:
            data = res.json()
            full_name = data.get("name")
            if not full_name:
                first = data.get("first_name", "")
                last = data.get("last_name", "")
                full_name = f"{first} {last}".strip()
            data["name"] = full_name or "Customer"
            return data
    except Exception as exc:
        logger.debug("[Meta Graph User Profile Fetch Warning]: %s", exc)

    return {"name": "Customer", "first_name": "Customer", "last_name": ""}

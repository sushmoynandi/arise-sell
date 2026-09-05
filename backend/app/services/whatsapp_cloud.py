"""Meta WhatsApp Business Cloud API Integration."""
from __future__ import annotations

import time
import httpx
from typing import Any
from app.core.config import settings

GRAPH_API_BASE = "https://graph.facebook.com/v21.0"

_SANDBOX_TOKEN_PREFIXES = (
    "EAAG_SANDBOX_",
    "EAAG_WABA_",
    "EAAG_LINKED_",
    "mock_",
    "test_",
    "sandbox_",
    "your_",
    "change-me",
)


def is_live_meta_token(token: str | None) -> bool:
    """Determine if an access token is a live production token."""
    if not token or not isinstance(token, str):
        return False
    t = token.strip()
    if not t or t.startswith(_SANDBOX_TOKEN_PREFIXES):
        return False
    return True


def is_valid_phone_number_id(phone_number_id: str | None) -> bool:
    """Validate WhatsApp Phone Number ID (must be numeric >= 10 digits)."""
    if not phone_number_id:
        return False
    p = str(phone_number_id).strip()
    return p.isdigit() and len(p) >= 10


async def send_whatsapp_text(
    to_phone: str,
    body: str,
    phone_number_id: str | None = None,
    access_token: str | None = None,
) -> dict[str, Any]:
    """
    Send direct WhatsApp message via Meta Graph API v21.0 Cloud API.

    Features:
    1. Meta Graph API v21.0 outbound dispatch (POST /{phone_number_id}/messages).
    2. Explicit detection and alert logging for Meta error #131005 (Access Denied / Asset Permission) and #190 (Expired Token).
    3. Simulated delivery fallback when testing without live Meta credentials.
    """
    clean_phone = "".join(filter(str.isdigit, str(to_phone)))

    p_id = (
        str(phone_number_id).strip()
        if is_valid_phone_number_id(phone_number_id)
        else (settings.WHATSAPP_PHONE_NUMBER_ID if is_valid_phone_number_id(settings.WHATSAPP_PHONE_NUMBER_ID) else None)
    )

    live_custom_token = access_token.strip() if is_live_meta_token(access_token) else None
    token = live_custom_token or (settings.META_PAGE_ACCESS_TOKEN.strip() if is_live_meta_token(settings.META_PAGE_ACCESS_TOKEN) else None)

    # Simulated Fallback for Local/Sandbox Testing
    if not p_id or not token:
        reason = "Missing or invalid WHATSAPP_PHONE_NUMBER_ID" if not p_id else "Missing or sandbox META_PAGE_ACCESS_TOKEN"
        preview = body[:60] + ("..." if len(body) > 60 else "")
        print(
            f"[WhatsApp Simulated Delivery] To: +{clean_phone} | "
            f"Reason: {reason} | "
            f"Message: '{preview}'",
            flush=True,
        )
        return {
            "status": "simulated",
            "delivery_status": "simulated",
            "messaging_product": "whatsapp",
            "to": clean_phone,
            "body": body,
            "contacts": [{"input": clean_phone, "wa_id": clean_phone}],
            "messages": [{"id": f"simulated_wamid_{int(time.time() * 1000)}"}],
        }

    url = f"{GRAPH_API_BASE}/{p_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_phone,
        "type": "text",
        "text": {"preview_url": True, "body": body},
    }
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            try:
                data = res.json()
            except Exception:
                data = {"raw_response": res.text, "status_code": res.status_code}

            if res.status_code >= 400:
                err_obj = data.get("error", {}) if isinstance(data, dict) else {}
                err_code = err_obj.get("code")
                err_subcode = err_obj.get("error_subcode")
                err_msg = str(err_obj.get("message", ""))
                err_details = str(err_obj.get("error_data", {}).get("details", "") if isinstance(err_obj.get("error_data"), dict) else "")

                # Specific Handler for Meta Error #131005 (Access Denied / Asset Permission)
                is_131005 = (
                    err_code == 131005
                    or err_subcode == 131005
                    or "131005" in err_msg
                    or "131005" in err_details
                    or "access denied" in err_msg.lower()
                )

                if is_131005:
                    print(
                        f"[Meta WhatsApp Alert #131005] Access Denied / Asset Permission: "
                        f"The access token lacks permission for WhatsApp Phone Number ID '{p_id}' or WABA asset permissions. "
                        f"Merchant 1-click re-authorization required! Details: {err_msg}",
                        flush=True,
                    )
                    data["status"] = "error"
                    data["error_code"] = 131005
                    data["error_type"] = "access_denied"
                    data["requires_reauth"] = True
                    data["alert"] = "Meta Error #131005: Access Denied / Asset Permission. Re-authorization required."
                elif err_code == 190 or "190" in err_msg:
                    # Meta Error #190: Invalid/Expired Access Token
                    print(
                        f"[Meta WhatsApp Alert #190] OAuth Token Expired/Invalid for Phone Number ID '{p_id}'. "
                        f"Merchant re-authorization required! Details: {err_msg}",
                        flush=True,
                    )
                    data["status"] = "error"
                    data["error_code"] = 190
                    data["error_type"] = "token_expired"
                    data["requires_reauth"] = True
                    data["alert"] = "Meta Error #190: OAuth Access Token expired or invalid. Re-authorization required."
                else:
                    print(f"[Meta WhatsApp Error {res.status_code}]: {data}", flush=True)
                    data["status"] = "error"
                    data["error_code"] = err_code or res.status_code
                    data["error_type"] = "meta_api_error"

                return data

            data["status"] = "sent"
            print(f"[Meta WhatsApp Message Sent]: {data}", flush=True)
            return data

    except httpx.RequestError as exc:
        print(f"[Meta WhatsApp Network Error]: Failed to reach Meta Graph API: {exc}", flush=True)
        return {
            "status": "error",
            "error_type": "network_error",
            "error": str(exc),
            "to": clean_phone,
            "body": body,
        }
    except Exception as exc:
        print(f"[Meta WhatsApp Unexpected Error]: {exc}", flush=True)
        return {
            "status": "error",
            "error_type": "unexpected_error",
            "error": str(exc),
            "to": clean_phone,
            "body": body,
        }

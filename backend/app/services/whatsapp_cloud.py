"""Meta WhatsApp Business Cloud API Integration."""
from __future__ import annotations

import httpx
from typing import Any
from app.core.config import settings

GRAPH_API_BASE = "https://graph.facebook.com/v21.0"


async def send_whatsapp_text(
    to_phone: str,
    body: str,
    phone_number_id: str | None = None,
    access_token: str | None = None,
) -> dict[str, Any]:
    """Send direct WhatsApp message via Cloud API."""
    valid_token = access_token if (access_token and not access_token.startswith(("EAAG_SANDBOX_", "EAAG_WABA_", "EAAG_LINKED_"))) else None
    token = valid_token or settings.META_PAGE_ACCESS_TOKEN
    clean_p_id = phone_number_id if (phone_number_id and str(phone_number_id).isdigit() and len(str(phone_number_id)) >= 10) else None
    p_id = clean_p_id or settings.WHATSAPP_PHONE_NUMBER_ID
    clean_phone = "".join(filter(str.isdigit, str(to_phone)))

    if not p_id or not token:
        print(f"[WhatsApp] Warning: Missing WHATSAPP_PHONE_NUMBER_ID or META_PAGE_ACCESS_TOKEN")
        return {"status": "simulated", "to": clean_phone, "body": body}

    url = f"{GRAPH_API_BASE}/{p_id}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_phone,
        "type": "text",
        "text": {"preview_url": True, "body": body},
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(
            url,
            json=payload,
            headers={"Authorization": f"Bearer {token}"},
        )
        data = res.json()
        if res.status_code >= 400:
            print(f"[Meta WhatsApp Error {res.status_code}]: {data}")
        else:
            print(f"[Meta WhatsApp Message Sent]: {data}")
        return data

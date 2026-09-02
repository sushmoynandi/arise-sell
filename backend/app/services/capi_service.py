"""Meta Conversions API (CAPI) Server-Side Ad Attribution Dispatcher."""
from __future__ import annotations

import hashlib
import time
import httpx
from typing import Any
from app.core.config import settings

GRAPH_API_VERSION = "v21.0"


def hash_sha256(val: str) -> str:
    clean = val.strip().lower()
    return hashlib.sha256(clean.encode("utf-8")).hexdigest()


async def send_meta_capi_event(
    event_name: str,
    event_source_url: str,
    user_phone: str | None = None,
    user_email: str | None = None,
    user_name: str | None = None,
    client_ip_address: str | None = None,
    client_user_agent: str | None = None,
    custom_data: dict[str, Any] | None = None,
    pixel_id: str | None = None,
    access_token: str | None = None,
) -> dict[str, Any]:
    p_id = pixel_id or "109827364519283"
    token = access_token or settings.META_PAGE_ACCESS_TOKEN

    user_data: dict[str, Any] = {}
    if user_phone:
        phone_norm = user_phone.replace("+", "").replace(" ", "").replace("-", "")
        if phone_norm.startswith("01"):
            phone_norm = f"88{phone_norm}"
        user_data["ph"] = [hash_sha256(phone_norm)]

    if user_email:
        user_data["em"] = [hash_sha256(user_email)]

    if user_name:
        parts = user_name.split()
        if len(parts) > 0:
            user_data["fn"] = [hash_sha256(parts[0])]
        if len(parts) > 1:
            user_data["ln"] = [hash_sha256(parts[-1])]

    if client_ip_address:
        user_data["client_ip_address"] = client_ip_address
    if client_user_agent:
        user_data["client_user_agent"] = client_user_agent

    event_payload = {
        "event_name": event_name,
        "event_time": int(time.time()),
        "action_source": "system_generated" if "Purchase" in event_name else "chat",
        "event_source_url": event_source_url,
        "user_data": user_data,
        "custom_data": custom_data or {},
    }

    if not token:
        return {
            "status": "simulated",
            "events_received": 1,
            "fbtrace_id": f"trace_{hashlib.md5(str(time.time()).encode()).hexdigest()[:12]}",
            "event_name": event_name,
            "match_quality": 9.1,
        }

    url = f"https://graph.facebook.com/{GRAPH_API_VERSION}/{p_id}/events"
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json={"data": [event_payload]}, params={"access_token": token})
        return res.json()

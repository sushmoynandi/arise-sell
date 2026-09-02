"""Steadfast Courier API Integration for Automated Cash-on-Delivery Dispatch."""
from __future__ import annotations

import uuid
import httpx
from typing import Any
from app.core.config import settings

STEADFAST_BASE_URL = "https://portal.steadfast.com.bd/api/v1"


async def create_steadfast_consignment(
    invoice: str,
    recipient_name: str,
    recipient_phone: str,
    recipient_address: str,
    cod_amount: float,
    note: str = "",
) -> dict[str, Any]:
    if not settings.STEADFAST_API_KEY:
        consignment_id = f"SF-{uuid.uuid4().hex[:7].upper()}"
        return {
            "status": 200,
            "message": "Consignment created successfully (Sandbox)",
            "consignment": {
                "consignment_id": consignment_id,
                "invoice": invoice,
                "tracking_code": f"{consignment_id}BD",
                "recipient_name": recipient_name,
                "recipient_phone": recipient_phone,
                "recipient_address": recipient_address,
                "cod_amount": cod_amount,
                "status": "in_review",
            },
        }

    url = f"{STEADFAST_BASE_URL}/create_order"
    headers = {
        "Api-Key": settings.STEADFAST_API_KEY,
        "Secret-Key": settings.STEADFAST_SECRET_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "invoice": invoice,
        "recipient_name": recipient_name,
        "recipient_phone": recipient_phone,
        "recipient_address": recipient_address,
        "cod_amount": cod_amount,
        "note": note,
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, headers=headers, timeout=15.0)
        return res.json()


async def check_steadfast_status(consignment_id: str) -> dict[str, Any]:
    if not settings.STEADFAST_API_KEY:
        return {"status": 200, "delivery_status": "in_transit", "consignment_id": consignment_id}

    url = f"{STEADFAST_BASE_URL}/status_by_cid/{consignment_id}"
    headers = {
        "Api-Key": settings.STEADFAST_API_KEY,
        "Secret-Key": settings.STEADFAST_SECRET_KEY,
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, timeout=10.0)
        return res.json()

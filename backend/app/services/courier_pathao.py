"""Pathao Courier Hermes API Integration for Dhaka Metro Express."""
from __future__ import annotations

import uuid
import httpx
from typing import Any
from app.core.config import settings

PATHAO_BASE_URL = "https://api-hermes.pathao.com/aladdin/api/v1"


async def get_pathao_access_token() -> str:
    if not settings.PATHAO_CLIENT_ID:
        return "mock_pathao_token"

    url = f"{PATHAO_BASE_URL}/issue-token"
    payload = {
        "client_id": settings.PATHAO_CLIENT_ID,
        "client_secret": settings.PATHAO_CLIENT_SECRET,
        "grant_type": "client_credentials",
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload)
        data = res.json()
        return data.get("access_token", "")


async def create_pathao_order(
    recipient_name: str,
    recipient_phone: str,
    recipient_address: str,
    recipient_city_id: int = 1,
    recipient_zone_id: int = 1,
    amount_to_collect: float = 0.0,
    item_description: str = "Apparel",
    note: str = "",
) -> dict[str, Any]:
    token = await get_pathao_access_token()

    if not settings.PATHAO_CLIENT_ID:
        consignment_id = f"PTH-{uuid.uuid4().hex[:6].upper()}"
        return {
            "type": "success",
            "message": "Order created successfully (Sandbox)",
            "data": {
                "consignment_id": consignment_id,
                "merchant_order_id": f"MO-{uuid.uuid4().hex[:5].upper()}",
                "order_status": "Pickup Pending",
                "delivery_fee": 80.0,
            },
        }

    url = f"{PATHAO_BASE_URL}/orders"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "store_id": 1,
        "recipient_name": recipient_name,
        "recipient_phone": recipient_phone,
        "recipient_address": recipient_address,
        "recipient_city": recipient_city_id,
        "recipient_zone": recipient_zone_id,
        "amount_to_collect": amount_to_collect,
        "item_type": 1,
        "item_quantity": 1,
        "item_weight": 0.5,
        "item_description": item_description,
        "special_instruction": note,
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, headers=headers, timeout=15.0)
        return res.json()

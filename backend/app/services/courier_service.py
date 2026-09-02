"""Unified Courier Dispatch Facade (Steadfast & Pathao)."""
from __future__ import annotations

from typing import Any
from app.services.courier_steadfast import create_steadfast_consignment
from app.services.courier_pathao import create_pathao_order


async def book_steadfast_order(
    invoice: str,
    recipient_name: str,
    recipient_phone: str,
    recipient_address: str,
    cod_amount: float,
    note: str = "",
) -> dict[str, Any]:
    return await create_steadfast_consignment(
        invoice=invoice,
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        recipient_address=recipient_address,
        cod_amount=cod_amount,
        note=note,
    )


async def book_pathao_order(
    recipient_name: str,
    recipient_phone: str,
    recipient_address: str,
    cod_amount: float,
    note: str = "",
) -> dict[str, Any]:
    res = await create_pathao_order(
        recipient_name=recipient_name,
        recipient_phone=recipient_phone,
        recipient_address=recipient_address,
        amount_to_collect=cod_amount,
        note=note,
    )
    data = res.get("data", {})
    return {
        "consignment_id": data.get("consignment_id", "PTH-000000"),
        "delivery_fee": data.get("delivery_fee", 80.0),
        "status": data.get("order_status", "Pickup Pending"),
    }

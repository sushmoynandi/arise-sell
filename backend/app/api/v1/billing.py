"""Subscriptions, Invoices, and Quota Top-Up."""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter
from app.schemas.billing import InvoiceResponse
from app.services.plans_service import get_stored_plans

router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])


@router.get("/plans")
async def list_plans() -> list[dict[str, Any]]:
    plans = await get_stored_plans()
    return [p for p in plans if p.get("status") == "active"]



@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices():
    return [
        InvoiceResponse(
            id="INV-2026-0890",
            merchantName="Nokshi & Co.",
            plan="Business Pro",
            amountBDT=350.0,
            method="bKash Merchant API",
            txId="BKH91827364",
            date="2026-08-30",
            status="paid",
        )
    ]

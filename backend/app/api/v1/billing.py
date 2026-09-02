"""Subscriptions, Invoices, and Quota Top-Up."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from app.schemas.billing import PlanResponse, InvoiceResponse

router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans():
    return [
        PlanResponse(
            id="plan-growth",
            name="Growth",
            nameBn="গ্রোথ",
            tagline="For growing Facebook & WhatsApp shops with daily orders",
            priceBDT=200.0,
            features=["200 closed orders / month", "WhatsApp & Facebook Messenger connected", "Steadfast & Pathao 1-click booking"],
            badge="Best for Starters",
            popular=False,
        ),
        PlanResponse(
            id="plan-business",
            name="Business Pro",
            nameBn="বিজনেস প্রো",
            tagline="For scaling multi-channel brands running paid traffic",
            priceBDT=700.0,
            features=["800 closed orders / month", "All channels: WhatsApp, Messenger, Instagram, Web", "Multi-courier smart auto-routing & failover"],
            badge="Most Popular",
            popular=True,
        ),
    ]


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

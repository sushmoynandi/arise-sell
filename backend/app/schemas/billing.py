"""Billing, Subscriptions, and Invoices Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel
from .common import PayMethod


class PlanResponse(BaseModel):
    id: str
    name: str
    nameBn: str
    tagline: str
    priceBDT: float
    features: list[str]
    badge: str | None = None
    popular: bool = False

    model_config = {"from_attributes": True}


class InvoiceResponse(BaseModel):
    id: str
    merchantName: str
    plan: str
    amountBDT: float
    method: str
    txId: str
    date: str
    status: str

    model_config = {"from_attributes": True}


class TopUpRequest(BaseModel):
    pack: str
    payment_method: PayMethod = "bkash"

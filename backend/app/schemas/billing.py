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
    originalAmountBDT: float | None = None
    discountBDT: float | None = None
    method: str
    txId: str
    date: str
    status: str
    invoiceNo: str | None = None
    description: str | None = None

    model_config = {"from_attributes": True}


class TopUpRequest(BaseModel):
    pack: str
    payment_method: PayMethod = "bkash"


class TopUpResponse(BaseModel):
    success: bool
    plan: str
    orders_quota: int
    messages_quota: int
    added_quota: int
    amount_bdt: float
    message: str


class VerifyCodeRequest(BaseModel):
    code: str


class VerifyCodeResponse(BaseModel):
    valid: bool
    error: str | None = None
    code: str | None = None
    plan_id: str | None = None
    plan_name: str | None = None
    duration_months: int | None = None
    message_limit: int | None = None
    max_stores: int | None = None
    max_seats: int | None = None
    price_bdt: float | None = None
    code_expiry: str | None = None
    features: list[str] | None = None


class RedeemCodeRequest(BaseModel):
    code: str
    payment_method: str | None = "bKash Auto-Debit"


class RedeemCodeResponse(BaseModel):
    success: bool
    plan: str
    orders_quota: int
    messages_quota: int
    max_stores: int
    max_seats: int
    duration_months: int = 1
    price_bdt: float = 0.0
    payment_method: str | None = None
    message: str



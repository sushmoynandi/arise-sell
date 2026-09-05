"""Subscription Plans and Merchant Invoices."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, TenantMixin


class SubscriptionPlan(Base, TimestampMixin):
    """Commercial plan tier (Free, Growth, Business Pro, VIP Scale)."""
    __tablename__ = "subscription_plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plan_code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    name_bn: Mapped[str | None] = mapped_column(String(128), nullable=True)
    tagline: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_bdt: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    yearly_price_bdt: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    yearly_discount_percent: Mapped[int] = mapped_column(Integer, default=17, nullable=False)
    billing_period: Mapped[str] = mapped_column(String(32), default="both", nullable=False)
    message_limit: Mapped[int] = mapped_column(Integer, default=200, nullable=False)
    max_stores: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    max_seats: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    catalog_limit: Mapped[int] = mapped_column(Integer, default=250, nullable=False)
    courier_channels: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    features: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    badge: Mapped[str | None] = mapped_column(String(64), nullable=True)
    popular: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active_merchants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    show_on_home: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Invoice(Base, TimestampMixin, TenantMixin):
    """Merchant subscription or quota top-up tax invoice."""
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    invoice_no: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    merchant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(128), nullable=False)
    amount_bdt: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    original_amount_bdt: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    promo_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    discount_bdt: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(64), default="bKash Merchant API", nullable=False)
    tx_id: Mapped[str] = mapped_column(String(128), nullable=False)
    invoice_date: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="paid", nullable=False)


class EnterpriseContract(Base, TimestampMixin):
    """B2B Enterprise Custom Plan Contract & Proposal."""
    __tablename__ = "enterprise_contracts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    contract_code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    business_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("businesses.id", ondelete="SET NULL"), index=True, nullable=True
    )
    merchant_email: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    merchant_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    plan_name: Mapped[str] = mapped_column(String(128), default="Custom Enterprise", nullable=False)
    duration_months: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    price_bdt: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    message_limit: Mapped[int] = mapped_column(Integer, default=50000, nullable=False)
    max_stores: Mapped[int] = mapped_column(Integer, default=5, nullable=False)
    max_seats: Mapped[int] = mapped_column(Integer, default=20, nullable=False)
    features: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    valid_until: Mapped[str | None] = mapped_column(String(32), nullable=True)
    activated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="pending", index=True, nullable=False)  # pending, active, expired, cancelled
    payment_method: Mapped[str | None] = mapped_column(String(64), nullable=True)
    invoice_no: Mapped[str | None] = mapped_column(String(64), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


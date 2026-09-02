"""Automation Rules, Playbooks, and Meta CAPI Event Telemetry."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, TenantMixin


class AutomationRule(Base, TimestampMixin, TenantMixin):
    """Custom trigger-action automation rule."""
    __tablename__ = "automation_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    trigger_type: Mapped[str] = mapped_column(String(64), nullable=False)
    trigger_config: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    action_type: Mapped[str] = mapped_column(String(64), nullable=False)
    action_config: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    category: Mapped[str] = mapped_column(String(64), default="general", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    run_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class Playbook(Base, TimestampMixin, TenantMixin):
    """Follow-up sales playbook recipe."""
    __tablename__ = "playbooks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    when_condition: Mapped[str] = mapped_column(Text, nullable=False)
    then_action: Mapped[str] = mapped_column(Text, nullable=False)
    run_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    orders_generated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_live: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class CapiEvent(Base, TimestampMixin, TenantMixin):
    """Server-side Meta Conversions API (CAPI) event audit log."""
    __tablename__ = "capi_events"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_name: Mapped[str] = mapped_column(String(64), nullable=False)
    ref: Mapped[str] = mapped_column(String(64), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    match_quality: Mapped[float] = mapped_column(Float, default=8.0, nullable=False)
    state: Mapped[str] = mapped_column(String(32), default="sent", nullable=False)
    dispatched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

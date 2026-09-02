"""AI Persona, Guardrails, and Eval Benchmark Suites."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, TenantMixin


class AIPersona(Base, TimestampMixin, TenantMixin):
    """Merchant-specific AI personality and tone config."""
    __tablename__ = "ai_personas"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    voice: Mapped[str] = mapped_column(Text, nullable=False)
    signature: Mapped[str] = mapped_column(String(128), nullable=False)
    reply_window: Mapped[str] = mapped_column(String(128), nullable=False)
    emoji_budget: Mapped[str] = mapped_column(String(128), nullable=False)


class Guardrail(Base, TimestampMixin, TenantMixin):
    """Hard and soft AI behavioral guardrail constraint."""
    __tablename__ = "ai_guardrails"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    rule: Mapped[str] = mapped_column(Text, nullable=False)
    severity: Mapped[str] = mapped_column(String(16), default="hard", nullable=False)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    fire_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class EvalSuite(Base, TimestampMixin, TenantMixin):
    """Regression test suite results for prompt changes."""
    __tablename__ = "ai_eval_suites"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    last_run: Mapped[str] = mapped_column(String(128), nullable=False)
    model: Mapped[str] = mapped_column(String(64), nullable=False)
    total_cases: Mapped[int] = mapped_column(Integer, default=240, nullable=False)
    passed: Mapped[int] = mapped_column(Integer, default=231, nullable=False)
    duration: Mapped[str] = mapped_column(String(32), default="3m 12s", nullable=False)
    metrics: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    failures: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

"""Broadcast Campaigns and Social Comment Auto-Reply Rules."""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import Boolean, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, TenantMixin


class Campaign(Base, TimestampMixin, TenantMixin):
    """Promotional broadcast campaign across WhatsApp or Messenger."""
    __tablename__ = "campaigns"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    segment: Mapped[str] = mapped_column(String(255), nullable=False)
    channel_type: Mapped[str] = mapped_column(String(32), default="whatsapp", nullable=False)
    audience: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    delivered: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    replied: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    orders_generated: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    revenue: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    state: Mapped[str] = mapped_column(String(32), default="draft", nullable=False)
    window: Mapped[str] = mapped_column(String(64), default="Day 1 of 4", nullable=False)


class CommentRule(Base, TimestampMixin, TenantMixin):
    """Automated comment response rule for Facebook and Instagram posts."""
    __tablename__ = "comment_rules"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    trigger_text: Mapped[str] = mapped_column(String(255), nullable=False)
    reply_template: Mapped[str] = mapped_column(Text, nullable=False)
    dm_template: Mapped[str | None] = mapped_column(Text, nullable=True)
    fired_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    converted_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_live: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

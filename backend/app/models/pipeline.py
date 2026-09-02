"""Sales Pipeline Kanban Cards & Transitions."""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import Float, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, TenantMixin


class PipelineCard(Base, TimestampMixin, TenantMixin):
    """Card on the 6-stage sales pipeline board."""
    __tablename__ = "pipeline_cards"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    channel_type: Mapped[str] = mapped_column(String(32), default="whatsapp", nullable=False)
    stage: Mapped[str] = mapped_column(String(32), index=True, default="listening", nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=0.5, nullable=False)
    waiting_on: Mapped[str | None] = mapped_column(String(255), nullable=True)
    age_mins: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    proposal_to_stage: Mapped[str | None] = mapped_column(String(32), nullable=True)
    proposal_why: Mapped[str | None] = mapped_column(Text, nullable=True)

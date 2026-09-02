"""Super Admin Master Configurations and Platform Health Entities."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin


class AIProviderKey(Base, TimestampMixin):
    """Platform-level AI LLM API keys with priority cascading."""
    __tablename__ = "ai_provider_keys"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    provider_name: Mapped[str] = mapped_column(String(64), nullable=False)
    model: Mapped[str] = mapped_column(String(64), nullable=False)
    key_masked: Mapped[str] = mapped_column(String(64), nullable=False)
    raw_key_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    role: Mapped[str] = mapped_column(String(32), default="primary", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    latency_ms: Mapped[int] = mapped_column(Integer, default=380, nullable=False)
    requests_24h: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    tokens_consumed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cost_usd: Mapped[float] = mapped_column(Numeric(10, 4), default=0.0, nullable=False)
    cost_bdt: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    last_ping: Mapped[str] = mapped_column(String(128), default="Just now", nullable=False)


class CourierGateway(Base, TimestampMixin):
    """Courier master API credentials and dispatch configurations."""
    __tablename__ = "courier_gateways"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    courier_name: Mapped[str] = mapped_column(String(128), nullable=False)
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    api_key_masked: Mapped[str] = mapped_column(String(64), nullable=False)
    secret_masked: Mapped[str] = mapped_column(String(64), nullable=False)
    raw_key_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    raw_secret_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    default_coverage: Mapped[str] = mapped_column(String(255), nullable=False)
    auto_routing_rule: Mapped[str] = mapped_column(Text, nullable=False)
    avg_latency_ms: Mapped[int] = mapped_column(Integer, default=410, nullable=False)
    total_bookings: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    success_rate: Mapped[float] = mapped_column(Float, default=98.5, nullable=False)


class MetaAppConfig(Base, TimestampMixin):
    """Meta WABA and Graph API configuration."""
    __tablename__ = "meta_app_configs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    app_name: Mapped[str] = mapped_column(String(128), nullable=False)
    waba_id: Mapped[str] = mapped_column(String(64), nullable=False)
    phone_number_id: Mapped[str] = mapped_column(String(64), nullable=False)
    graph_version: Mapped[str] = mapped_column(String(16), default="v21.0", nullable=False)
    token_masked: Mapped[str] = mapped_column(String(64), nullable=False)
    token_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)
    token_expires_in: Mapped[str] = mapped_column(String(64), default="Never", nullable=False)
    webhook_status: Mapped[str] = mapped_column(String(32), default="verified", nullable=False)
    throughput_24h: Mapped[int] = mapped_column(Integer, default=0, nullable=False)


class SupportTicket(Base, TimestampMixin):
    """Merchant incident support ticket with AI rule patching."""
    __tablename__ = "support_tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    business_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    ticket_no: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    merchant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    merchant_email: Mapped[str] = mapped_column(String(255), nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    category: Mapped[str] = mapped_column(String(64), default="ai_correction", nullable=False)
    priority: Mapped[str] = mapped_column(String(32), default="medium", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="open", nullable=False)
    reported_snippet: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    messages: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    attachments: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    admin_notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class SystemBackup(Base, TimestampMixin):
    """Platform system snapshots and pgvector embeddings backup."""
    __tablename__ = "system_backups"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    backup_type: Mapped[str] = mapped_column(String(64), default="postgres_db", nullable=False)
    size_mb: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(64), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="verified", nullable=False)
    checksum: Mapped[str] = mapped_column(String(128), nullable=False)


class ActivityLog(Base, TimestampMixin):
    """Global platform activity feed."""
    __tablename__ = "activity_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    event_type: Mapped[str] = mapped_column(String(32), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)

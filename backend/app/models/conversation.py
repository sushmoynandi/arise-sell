"""Conversation Threads and Messages."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, TenantMixin

if TYPE_CHECKING:
    from app.models.tenant import Business


class Conversation(Base, TimestampMixin, TenantMixin):
    """Customer conversation thread across any connected channel."""
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    channel_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    contact_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    handle: Mapped[str] = mapped_column(String(255), nullable=False)
    channel_type: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    lang: Mapped[str] = mapped_column(String(16), default="bn", nullable=False)
    district: Mapped[str] = mapped_column(String(128), default="Dhaka", nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="ai", index=True, nullable=False)
    intent: Mapped[str] = mapped_column(String(255), default="Product Inquiry", nullable=False)
    value: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    unread_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_message_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    assigned_agent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)

    business: Mapped[Business] = relationship("Business", back_populates="conversations")
    messages: Mapped[list[Message]] = relationship(
        "Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.sent_at"
    )


class Message(Base, TimestampMixin):
    """Individual message within a conversation."""
    __tablename__ = "messages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), index=True, nullable=False
    )
    from_type: Mapped[str] = mapped_column(String(32), nullable=False)
    lang: Mapped[str | None] = mapped_column(String(16), nullable=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    gloss: Mapped[str | None] = mapped_column(Text, nullable=True)
    attachment: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    action: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    sent_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    conversation: Mapped[Conversation] = relationship("Conversation", back_populates="messages")

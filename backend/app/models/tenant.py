"""Organization and Business Tenant Models."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.channel import ConnectedChannel
    from app.models.product import Product
    from app.models.conversation import Conversation
    from app.models.order import Order


class Organization(Base, TimestampMixin):
    """Top-level organizational umbrella holding multiple brand businesses."""
    __tablename__ = "organizations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    businesses: Mapped[list[Business]] = relationship(
        "Business", back_populates="organization", cascade="all, delete-orphan"
    )


class Business(Base, TimestampMixin):
    """Individual brand business / merchant tenant (e.g., Nokshi & Co.)."""
    __tablename__ = "businesses"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    org_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="SET NULL"), index=True, nullable=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_bn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    kind: Mapped[str | None] = mapped_column(String(255), nullable=True)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(64), default="growth", nullable=False)
    orders_used: Mapped[int] = mapped_column(default=0, nullable=False)
    orders_quota: Mapped[int] = mapped_column(default=500, nullable=False)
    logo_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_hue: Mapped[int] = mapped_column(default=82, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="BDT", nullable=False)
    timezone: Mapped[str] = mapped_column(String(64), default="Asia/Dhaka", nullable=False)
    settings_data: Mapped[dict[str, Any]] = mapped_column(
        JSON, default=dict, server_default="{}", nullable=False
    )
    deletion_requested_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    scheduled_deletion_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    organization: Mapped[Organization | None] = relationship(
        "Organization", back_populates="businesses", foreign_keys=[org_id]
    )
    users: Mapped[list[User]] = relationship("User", back_populates="business")
    channels: Mapped[list[ConnectedChannel]] = relationship("ConnectedChannel", back_populates="business", cascade="all, delete-orphan")
    products: Mapped[list[Product]] = relationship("Product", back_populates="business", cascade="all, delete-orphan")
    conversations: Mapped[list[Conversation]] = relationship("Conversation", back_populates="business", cascade="all, delete-orphan")
    orders: Mapped[list[Order]] = relationship("Order", back_populates="business", cascade="all, delete-orphan")

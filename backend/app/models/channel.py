"""Connected Omnichannel Accounts (Facebook, Instagram, WhatsApp, Web, Telegram)."""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, TenantMixin

if TYPE_CHECKING:
    from app.models.tenant import Business


class ConnectedChannel(Base, TimestampMixin, TenantMixin):
    """Connected customer communication channel for a tenant."""
    __tablename__ = "connected_channels"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    channel_type: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    detail: Mapped[str | None] = mapped_column(String(255), nullable=True)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    access_token_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    webhook_secret: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_live: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    traffic_share: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    config: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)

    business: Mapped[Business] = relationship("Business", back_populates="channels")

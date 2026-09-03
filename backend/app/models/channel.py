"""Connected social & messaging channels (WhatsApp, Messenger, Instagram)."""
from __future__ import annotations

import uuid
from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, TenantMixin


class ConnectedChannel(Base, TimestampMixin, TenantMixin):
    """Stores a merchant's connected messaging channels (WABA, Page, Instagram)."""
    __tablename__ = "connected_channels"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    channel_type: Mapped[str] = mapped_column(String(30), nullable=False) # 'whatsapp', 'messenger', 'instagram'
    external_id: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True) # phone_number_id or page_id
    label: Mapped[str] = mapped_column(String(100), nullable=False)
    detail: Mapped[str | None] = mapped_column(String(255), nullable=True)
    access_token: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_live: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    traffic_share: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    business = relationship("Business", back_populates="channels", lazy="selectin")

"""Orders, Order Lines, and Courier Booking Dispatch Records."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, TenantMixin

if TYPE_CHECKING:
    from app.models.tenant import Business


class Order(Base, TimestampMixin, TenantMixin):
    """Customer order placed directly in-chat or via storefront."""
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    ref: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    district: Mapped[str] = mapped_column(String(128), default="Dhaka", nullable=False)
    channel_type: Mapped[str] = mapped_column(String(32), default="whatsapp", nullable=False)
    delivery_charge: Mapped[float] = mapped_column(Numeric(10, 2), default=80.0, nullable=False)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(32), default="cod", nullable=False)
    state: Mapped[str] = mapped_column(String(32), default="awaiting_confirm", index=True, nullable=False)
    placed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)

    business: Mapped[Business] = relationship("Business", back_populates="orders")
    lines: Mapped[list[OrderLine]] = relationship(
        "OrderLine", back_populates="order", cascade="all, delete-orphan"
    )
    courier_booking: Mapped[CourierBooking | None] = relationship(
        "CourierBooking", back_populates="order", uselist=False, cascade="all, delete-orphan"
    )


class OrderLine(Base, TimestampMixin):
    """Line item within an order."""
    __tablename__ = "order_lines"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False
    )
    sku: Mapped[str] = mapped_column(String(64), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    qty: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    order: Mapped[Order] = relationship("Order", back_populates="lines")


class CourierBooking(Base, TimestampMixin):
    """Consignment booking with Steadfast, Pathao, or RedX."""
    __tablename__ = "courier_bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    provider: Mapped[str] = mapped_column(String(32), nullable=False)
    consignment: Mapped[str] = mapped_column(String(128), nullable=False)
    tracking_number: Mapped[str] = mapped_column(String(128), nullable=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    eta: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="in_transit", nullable=False)
    booked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    order: Mapped[Order] = relationship("Order", back_populates="courier_booking")

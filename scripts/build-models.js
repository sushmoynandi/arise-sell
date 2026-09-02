const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'backend', 'app', 'models');
fs.mkdirSync(baseDir, { recursive: true });

const files = {
  'user.py': `"""User, Teammates and Admin User Models."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, Integer, JSON, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, TenantMixin

if TYPE_CHECKING:
    from app.models.tenant import Business


class User(Base, TimestampMixin, TenantMixin):
    """User account belonging to a merchant business tenant."""
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default="moderator", nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_superadmin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    online: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    platforms: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    hue: Mapped[int] = mapped_column(Integer, default=82, nullable=False)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    business: Mapped[Business] = relationship("Business", back_populates="users")
`,

  'channel.py': `"""Connected Omnichannel Accounts (Facebook, Instagram, WhatsApp, Web, Telegram)."""
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
`,

  'conversation.py': `"""Conversation Threads and Messages."""
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
`,

  'contact.py': `"""CRM Customer Contact Profiles."""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, TenantMixin


class Contact(Base, TimestampMixin, TenantMixin):
    """CRM profile for a customer across channels."""
    __tablename__ = "contacts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32), index=True, nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    district: Mapped[str | None] = mapped_column(String(128), default="Dhaka", nullable=True)
    channel_type: Mapped[str] = mapped_column(String(32), default="whatsapp", nullable=False)
    external_id: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    total_orders: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_spent: Mapped[float] = mapped_column(Numeric(12, 2), default=0.0, nullable=False)
    first_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_seen: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
`,

  'product.py': `"""Product Catalog, Variants, and Feed Sync Logs."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING, Any

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, TenantMixin

if TYPE_CHECKING:
    from app.models.tenant import Business


class Product(Base, TimestampMixin, TenantMixin):
    """Product catalog item."""
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    name_bn: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    blurb: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    compare_at: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    tags: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    vision_indexed: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    vision_updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    sold_this_week: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    business: Mapped[Business] = relationship("Business", back_populates="products")
    variants: Mapped[list[Variant]] = relationship(
        "Variant", back_populates="product", cascade="all, delete-orphan"
    )


class Variant(Base, TimestampMixin):
    """SKU-level variant of a product."""
    __tablename__ = "product_variants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False
    )
    sku: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    color: Mapped[str | None] = mapped_column(String(64), nullable=True)
    size: Mapped[str | None] = mapped_column(String(64), nullable=True)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    product: Mapped[Product] = relationship("Product", back_populates="variants")


class FeedSync(Base, TimestampMixin, TenantMixin):
    """Catalog feed synchronization audit entry."""
    __tablename__ = "feed_syncs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    synced_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    products_found: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    created_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    out_of_stock_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="completed", nullable=False)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
`,

  'order.py': `"""Orders, Order Lines, and Courier Booking Dispatch Records."""
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
`,

  'pipeline.py': `"""Sales Pipeline Kanban Cards & Transitions."""
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
`,

  'campaign.py': `"""Broadcast Campaigns and Social Comment Auto-Reply Rules."""
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
`,

  'automation.py': `"""Automation Rules, Playbooks, and Meta CAPI Event Telemetry."""
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
`,

  'knowledge.py': `"""Knowledge Base FAQs, Topics, and Vector Embeddings (pgvector)."""
from __future__ import annotations

import uuid
from typing import Any

from pgvector.sqlalchemy import Vector
from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, TenantMixin


class KnowledgeEntry(Base, TimestampMixin, TenantMixin):
    """Store FAQ topic and policies (Delivery, Returns, Care, etc.)."""
    __tablename__ = "knowledge_entries"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    topic: Mapped[str] = mapped_column(String(128), index=True, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    sample: Mapped[str | None] = mapped_column(Text, nullable=True)
    entry_count: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    chunks: Mapped[list[EmbeddingChunk]] = relationship(
        "EmbeddingChunk", back_populates="knowledge_entry", cascade="all, delete-orphan"
    )


class EmbeddingChunk(Base, TimestampMixin):
    """Vector embedding chunk for RAG similarity matching."""
    __tablename__ = "embedding_chunks"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    knowledge_entry_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("knowledge_entries.id", ondelete="CASCADE"), index=True, nullable=False
    )
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536), nullable=False)

    knowledge_entry: Mapped[KnowledgeEntry] = relationship("KnowledgeEntry", back_populates="chunks")
`,

  'ai_config.py': `"""AI Persona, Guardrails, and Eval Benchmark Suites."""
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
`,

  'billing.py': `"""Subscription Plans and Merchant Invoices."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Integer, JSON, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, TenantMixin


class SubscriptionPlan(Base, TimestampMixin):
    """Commercial plan tier (Free, Growth, Business Pro, VIP Scale)."""
    __tablename__ = "subscription_plans"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    plan_code: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    name_bn: Mapped[str | None] = mapped_column(String(128), nullable=True)
    tagline: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_bdt: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0, nullable=False)
    yearly_price_bdt: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    yearly_discount_percent: Mapped[int] = mapped_column(Integer, default=17, nullable=False)
    billing_period: Mapped[str] = mapped_column(String(32), default="both", nullable=False)
    message_limit: Mapped[int] = mapped_column(Integer, default=200, nullable=False)
    catalog_limit: Mapped[int] = mapped_column(Integer, default=250, nullable=False)
    courier_channels: Mapped[int] = mapped_column(Integer, default=2, nullable=False)
    features: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    badge: Mapped[str | None] = mapped_column(String(64), nullable=True)
    popular: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    active_merchants: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="active", nullable=False)


class Invoice(Base, TimestampMixin, TenantMixin):
    """Merchant subscription or quota top-up tax invoice."""
    __tablename__ = "invoices"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    invoice_no: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    merchant_name: Mapped[str] = mapped_column(String(255), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(128), nullable=False)
    amount_bdt: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    original_amount_bdt: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    promo_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    discount_bdt: Mapped[float | None] = mapped_column(Numeric(10, 2), nullable=True)
    payment_method: Mapped[str] = mapped_column(String(64), default="bKash Merchant API", nullable=False)
    tx_id: Mapped[str] = mapped_column(String(128), nullable=False)
    invoice_date: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="paid", nullable=False)
`,

  'admin.py': `"""Super Admin Master Configurations and Platform Health Entities."""
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
`,

  '__init__.py': `"""Export all SQLAlchemy ORM models."""
from app.models.tenant import Organization, Business
from app.models.user import User
from app.models.channel import ConnectedChannel
from app.models.conversation import Conversation, Message
from app.models.contact import Contact
from app.models.product import Product, Variant, FeedSync
from app.models.order import Order, OrderLine, CourierBooking
from app.models.pipeline import PipelineCard
from app.models.campaign import Campaign, CommentRule
from app.models.automation import AutomationRule, Playbook, CapiEvent
from app.models.knowledge import KnowledgeEntry, EmbeddingChunk
from app.models.ai_config import AIPersona, Guardrail, EvalSuite
from app.models.billing import SubscriptionPlan, Invoice
from app.models.admin import (
    AIProviderKey,
    CourierGateway,
    MetaAppConfig,
    SupportTicket,
    SystemBackup,
    ActivityLog,
)

__all__ = [
    "Organization",
    "Business",
    "User",
    "ConnectedChannel",
    "Conversation",
    "Message",
    "Contact",
    "Product",
    "Variant",
    "FeedSync",
    "Order",
    "OrderLine",
    "CourierBooking",
    "PipelineCard",
    "Campaign",
    "CommentRule",
    "AutomationRule",
    "Playbook",
    "CapiEvent",
    "KnowledgeEntry",
    "EmbeddingChunk",
    "AIPersona",
    "Guardrail",
    "EvalSuite",
    "SubscriptionPlan",
    "Invoice",
    "AIProviderKey",
    "CourierGateway",
    "MetaAppConfig",
    "SupportTicket",
    "SystemBackup",
    "ActivityLog",
]
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filename), content, 'utf8');
  console.log('Created model:', filename);
}

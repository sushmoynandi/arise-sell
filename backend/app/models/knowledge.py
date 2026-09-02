"""Knowledge Base FAQs, Topics, and Vector Embeddings (pgvector)."""
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

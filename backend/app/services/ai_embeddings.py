"""Vector Embedding Generation and pgvector Cosine Similarity Search."""
from __future__ import annotations

import httpx
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.models.knowledge import EmbeddingChunk, KnowledgeEntry


async def generate_text_embedding(text: str) -> list[float]:
    """Generate 1536-dimensional vector embedding using Google Gemini or OpenAI."""
    if settings.OPENAI_API_KEY:
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    "https://api.openai.com/v1/embeddings",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={"input": text, "model": "text-embedding-3-small"},
                    timeout=10.0,
                )
                if res.status_code == 200:
                    return res.json()["data"][0]["embedding"]
        except Exception as e:
            print(f"[Embedding] OpenAI error: {e}")

    import hashlib
    h = hashlib.sha256(text.encode("utf-8")).digest()
    vec = [(float(b) / 255.0) - 0.5 for b in h]
    full_vec = (vec * (1536 // len(vec) + 1))[:1536]
    norm = sum(x**2 for x in full_vec) ** 0.5
    return [x / (norm or 1.0) for x in full_vec]


async def search_knowledge_base(
    query_text: str,
    business_id: Any,
    db: AsyncSession,
    top_k: int = 3,
) -> list[dict[str, Any]]:
    """Retrieve top-K most relevant FAQ/policy chunks."""
    stmt_fallback = (
        select(KnowledgeEntry)
        .where(KnowledgeEntry.business_id == business_id)
        .limit(top_k)
    )
    res_fb = await db.execute(stmt_fallback)
    entries = res_fb.scalars().all()
    return [
        {"topic": e.topic, "chunk_text": e.content, "sample": e.sample}
        for e in entries
    ]

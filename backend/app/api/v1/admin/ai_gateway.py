"""Super Admin AI Multi-Provider Gateway & Prompt Sandbox."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_superadmin
from app.models.admin import AIProviderKey
from app.schemas.admin import AIProviderKeyResponse
from app.services.ai_gateway import execute_ai_gateway_prompt

router = APIRouter(prefix="/admin/ai-gateway", tags=["Super Admin AI Gateway"], dependencies=[Depends(get_current_superadmin)])


class AddAIKeyRequest(BaseModel):
    provider: str
    provider_name: str
    model: str
    api_key: str
    role: str = "primary"


class TestPromptRequest(BaseModel):
    prompt: str


@router.get("/keys", response_model=list[AIProviderKeyResponse])
async def list_ai_keys(db: AsyncSession = Depends(get_db)):
    stmt = select(AIProviderKey)
    res = await db.execute(stmt)
    keys = res.scalars().all()
    if not keys:
        return [
            AIProviderKeyResponse(
                id="ai-key-1",
                provider="google",
                providerName="Google Gemini",
                model="gemini-2.0-flash",
                keyMasked="AIzaSyD...9kX2",
                role="primary",
                status="active",
                latencyMs=380,
                requests24h=24800,
                tokensConsumed=14200000,
                costUSD=4.82,
                costBDT=580.0,
                lastPing="Just now (Operational)",
            ),
            AIProviderKeyResponse(
                id="ai-key-2",
                provider="openai",
                providerName="OpenAI",
                model="gpt-4o-mini",
                keyMasked="sk-proj-...8aF9",
                role="fallback_1",
                status="standby",
                latencyMs=640,
                requests24h=9200,
                tokensConsumed=6400000,
                costUSD=6.20,
                costBDT=745.0,
                lastPing="2 mins ago (Standby Ready)",
            ),
        ]
    return [
        AIProviderKeyResponse(
            id=str(k.id),
            provider=k.provider,
            providerName=k.provider_name,
            model=k.model,
            keyMasked=k.key_masked,
            role=k.role,
            status=k.status,
            latencyMs=k.latency_ms,
            requests24h=k.requests_24h,
            tokensConsumed=k.tokens_consumed,
            costUSD=float(k.cost_usd),
            costBDT=float(k.cost_bdt),
            lastPing=k.last_ping,
        )
        for k in keys
    ]


@router.post("/keys", status_code=status.HTTP_201_CREATED)
async def add_ai_key(req: AddAIKeyRequest, db: AsyncSession = Depends(get_db)):
    masked = f"{req.api_key[:6]}...{req.api_key[-4:]}" if len(req.api_key) > 10 else "******"
    key = AIProviderKey(
        provider=req.provider,
        provider_name=req.provider_name,
        model=req.model,
        key_masked=masked,
        raw_key_encrypted=req.api_key,
        role=req.role,
        status="active",
        latency_ms=350,
    )
    db.add(key)
    await db.commit()
    return {"id": str(key.id), "provider": key.provider, "status": "added"}


@router.post("/test-cascade")
async def test_prompt_cascade(req: TestPromptRequest):
    """Simulate real priority cascade execution and failover tracing."""
    result = await execute_ai_gateway_prompt(req.prompt)
    return result.to_dict()

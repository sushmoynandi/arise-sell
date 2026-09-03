"""Super Admin AI Multi-Provider Gateway & Prompt Sandbox."""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.models.admin import AIProviderKey
from app.schemas.admin import AIProviderKeyResponse
from app.services.ai_gateway import (
    add_stored_ai_key,
    delete_stored_ai_key,
    execute_ai_gateway_prompt,
    get_stored_ai_keys,
    ping_stored_ai_key,
    set_primary_stored_ai_key,
    test_raw_ai_key,
)

router = APIRouter(prefix="/admin/ai-gateway", tags=["Super Admin AI Gateway"])


class AddAIKeyRequest(BaseModel):
    provider: str
    provider_name: str | None = None
    model: str
    api_key: str
    role: str = "primary"


class TestKeyRequest(BaseModel):
    provider: str
    model: str
    api_key: str


class TestPromptRequest(BaseModel):
    prompt: str


@router.get("/keys", response_model=list[dict[str, Any]])
async def list_ai_keys():
    """Retrieve all real active and standby AI Provider keys."""
    keys = get_stored_ai_keys()
    # Mask raw keys for client response
    safe_keys = []
    for k in keys:
        safe_keys.append({
            "id": k.get("id"),
            "provider": k.get("provider"),
            "providerName": k.get("providerName"),
            "model": k.get("model"),
            "keyMasked": k.get("keyMasked"),
            "role": k.get("role", "standby"),
            "status": k.get("status", "active"),
            "latencyMs": k.get("latencyMs", 250),
            "requests24h": k.get("requests24h", 0),
            "tokensConsumed": k.get("tokensConsumed", 0),
            "costUSD": k.get("costUSD", 0.0),
            "costBDT": k.get("costBDT", 0.0),
            "lastPing": k.get("lastPing", "Never"),
        })
    return safe_keys


@router.post("/keys", status_code=status.HTTP_201_CREATED)
async def add_ai_key(req: AddAIKeyRequest):
    """Add a new live AI provider key to persistent store."""
    if not req.api_key.strip():
        raise HTTPException(status_code=400, detail="API Key is required")

    entry = add_stored_ai_key({
        "provider": req.provider,
        "provider_name": req.provider_name,
        "model": req.model,
        "api_key": req.api_key.strip(),
        "role": req.role,
    })

    return {
        "id": entry["id"],
        "provider": entry["provider"],
        "providerName": entry["providerName"],
        "model": entry["model"],
        "keyMasked": entry["keyMasked"],
        "role": entry["role"],
        "status": entry["status"],
        "message": "AI Provider Key added successfully",
    }


@router.delete("/keys/{key_id}")
async def delete_ai_key(key_id: str):
    """Delete an AI provider key by ID."""
    success = delete_stored_ai_key(key_id)
    if not success:
        raise HTTPException(status_code=404, detail="AI Key not found")
    return {"status": "deleted", "id": key_id}


@router.patch("/keys/{key_id}/primary")
async def set_primary_ai_key(key_id: str):
    """Promote an AI provider key to primary role."""
    success = set_primary_stored_ai_key(key_id)
    if not success:
        raise HTTPException(status_code=404, detail="AI Key not found")
    return {"status": "updated", "id": key_id, "role": "primary"}


@router.post("/keys/{key_id}/ping")
async def ping_ai_key(key_id: str):
    """Execute live latency & handshake ping for a stored key."""
    result = await ping_stored_ai_key(key_id)
    return result


@router.post("/test-key")
async def test_single_ai_key(req: TestKeyRequest):
    """Test connection for a raw API key inside the modal without saving."""
    result = await test_raw_ai_key(req.provider, req.model, req.api_key.strip())
    return result


@router.post("/test-cascade")
async def test_prompt_cascade(req: TestPromptRequest):
    """Simulate real priority cascade execution and failover tracing."""
    result = await execute_ai_gateway_prompt(req.prompt)
    return result.to_dict()

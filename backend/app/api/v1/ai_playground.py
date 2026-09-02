"""Interactive Sandbox Test-Chat (Production RAG & Vision Telemetry)."""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, Header
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.services.ai_engine import generate_production_ai_response

router = APIRouter(prefix="/ai", tags=["AI Playground"])


class TestChatRequest(BaseModel):
    message: str
    channel: str = "whatsapp"
    image_url: str | None = None
    voice_override: str | None = None


@router.post("/test-chat")
async def test_chat(
    req: TestChatRequest,
    authorization: str | None = Header(None),
    db: AsyncSession = Depends(get_db),
):
    """Execute live AI sales reasoning with RAG knowledge and catalog matching.
    Supports both authenticated merchants and public sandbox testing."""
    business_id: Any = None

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        if payload and "business_id" in payload:
            business_id = payload["business_id"]

    return await generate_production_ai_response(
        customer_name="Demo Customer",
        customer_msg=req.message,
        channel=req.channel,
        business_id=business_id,
        db=db,
        image_url=req.image_url,
        persona_voice=req.voice_override,
    )

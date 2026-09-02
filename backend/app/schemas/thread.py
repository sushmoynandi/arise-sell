"""Thread / conversation inbox schemas — matches TypeScript Thread & Message types."""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from .common import Channel, Lang


class AttachmentSchema(BaseModel):
    """Image attachment with optional vision-matched SKU."""
    kind: Literal["image"]
    src: str
    matchedSku: str | None = None
    confidence: float | None = None


class ActionSchema(BaseModel):
    """Guardrail / system action badge on a message."""
    label: str
    detail: str
    tone: Literal["signal", "mint", "amber"] | None = None


class MessageSchema(BaseModel):
    """Single message in a conversation thread."""
    id: str
    from_type: Literal["customer", "agent", "human"] = Field(serialization_alias="from")
    lang: Lang | None = None
    body: str
    gloss: str | None = None
    at: str
    attachment: AttachmentSchema | None = None
    action: ActionSchema | None = None

    model_config = {"from_attributes": True, "populate_by_name": True}


class ThreadResponse(BaseModel):
    """Full conversation thread with messages — matches TypeScript Thread interface."""
    id: str
    customer: str
    handle: str
    channel: Channel
    lang: Lang
    district: str
    status: Literal["ai", "human", "waiting", "resolved"]
    intent: str
    value: float
    unread: int
    lastAt: str
    messages: list[MessageSchema]

    model_config = {"from_attributes": True}


class ThreadListItem(BaseModel):
    """Thread summary for list views (no messages)."""
    id: str
    customer: str
    handle: str
    channel: Channel
    lang: Lang
    district: str
    status: Literal["ai", "human", "waiting", "resolved"]
    intent: str
    value: float
    unread: int
    lastAt: str

    model_config = {"from_attributes": True}


class SendMessageRequest(BaseModel):
    """Send a reply to a conversation."""
    body: str
    attachment: AttachmentSchema | None = None


class TakeoverRequest(BaseModel):
    """Toggle conversation between AI and human agent."""
    mode: Literal["ai", "human"]

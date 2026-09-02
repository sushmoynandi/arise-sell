"""Sales Pipeline Kanban Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel
from .common import Channel, Stage


class ProposalSchema(BaseModel):
    to: Stage
    why: str


class PipelineCardResponse(BaseModel):
    id: str
    customer: str
    channel: Channel
    stage: Stage
    product: str
    value: float
    confidence: float
    waitingOn: str | None = None
    ageMins: int
    proposal: ProposalSchema | None = None

    model_config = {"from_attributes": True}


class UpdateStageRequest(BaseModel):
    stage: Stage
    confirmed: bool = True

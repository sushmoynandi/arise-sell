"""Campaigns, Comment Rules, and Playbooks Schemas."""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field
from .common import Channel


class CampaignResponse(BaseModel):
    id: str
    name: str
    segment: str
    channel: Channel
    audience: int
    delivered: int
    replied: int
    orders: int
    revenue: float
    state: Literal["running", "scheduled", "done", "draft"]
    window: str

    model_config = {"from_attributes": True}


class PlaybookResponse(BaseModel):
    id: str
    name: str
    when_condition: str = Field(serialization_alias="when")
    then_action: str = Field(serialization_alias="then")
    runs: int
    orders: int
    live: bool

    model_config = {"from_attributes": True, "populate_by_name": True}


class CommentRuleResponse(BaseModel):
    id: str
    trigger: str
    reply: str
    fired: int
    converted: int
    live: bool

    model_config = {"from_attributes": True}


class CreateCommentRuleRequest(BaseModel):
    trigger: str
    reply: str
    dm_template: str | None = None

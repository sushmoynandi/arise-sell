"""Automation Rules and Meta CAPI Event Schemas."""
from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel


class AutomationRuleResponse(BaseModel):
    id: str
    name: str
    description: str | None = None
    trigger_type: str
    action_type: str
    category: str
    is_active: bool
    run_count: int

    model_config = {"from_attributes": True}


class CapiEventResponse(BaseModel):
    id: str
    name: Literal["Lead", "IntentQualified", "Purchase"]
    ref: str
    value: float
    match: float
    state: Literal["sent", "queued", "dropped"]
    at: str

    model_config = {"from_attributes": True}


class CreateAutomationRequest(BaseModel):
    name: str
    description: str | None = None
    trigger_type: str
    trigger_config: dict[str, Any] = {}
    action_type: str
    action_config: dict[str, Any] = {}
    category: str = "general"

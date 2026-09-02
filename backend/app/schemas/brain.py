"""Knowledge Base, AI Persona, Guardrails, and Eval Schemas."""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class PersonaResponse(BaseModel):
    voice: str
    signature: str
    replyWindow: str
    emojiBudget: str

    model_config = {"from_attributes": True}


class GuardrailResponse(BaseModel):
    id: str
    rule: str
    severity: str
    fires: int
    label: str

    model_config = {"from_attributes": True}


class KnowledgeResponse(BaseModel):
    id: str
    topic: str
    entries: int
    updated: str
    sample: str

    model_config = {"from_attributes": True}


class EvalMetricSchema(BaseModel):
    label: str
    now: float
    before: float
    goal: float
    unit: str


class EvalFailureSchema(BaseModel):
    id: str
    set: str
    input: str
    why: str
    severity: str


class EvalSuiteResponse(BaseModel):
    lastRun: str
    model: str
    cases: int
    passed: int
    duration: str
    metrics: list[EvalMetricSchema]
    failures: list[EvalFailureSchema]

    model_config = {"from_attributes": True}


class UpdatePersonaRequest(BaseModel):
    voice: str
    signature: str
    reply_window: str
    emoji_budget: str


class CreateKnowledgeRequest(BaseModel):
    topic: str
    content: str
    sample: str | None = None

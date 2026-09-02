"""Automation Rules and Meta CAPI Event Telemetry (Production Database Backed)."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.automation import AutomationRule, CapiEvent
from app.schemas.automation import AutomationRuleResponse, CapiEventResponse, CreateAutomationRequest

router = APIRouter(prefix="/automations", tags=["Automation & Signals"])


@router.get("/rules", response_model=list[AutomationRuleResponse])
async def list_automation_rules(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all custom trigger-action automation workflows."""
    stmt = select(AutomationRule).where(AutomationRule.business_id == user.business_id).order_by(desc(AutomationRule.created_at))
    res = await db.execute(stmt)
    rules = res.scalars().all()

    return [
        AutomationRuleResponse(
            id=str(r.id),
            name=r.name,
            description=r.description,
            trigger_type=r.trigger_type,
            action_type=r.action_type,
            category=r.category,
            is_active=r.is_active,
            run_count=r.run_count,
        )
        for r in rules
    ]


@router.post("/rules", response_model=AutomationRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_automation_rule(
    req: CreateAutomationRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new automation rule."""
    rule = AutomationRule(
        business_id=user.business_id,
        name=req.name,
        description=req.description,
        trigger_type=req.trigger_type,
        trigger_config=req.trigger_config,
        action_type=req.action_type,
        action_config=req.action_config,
        category=req.category,
        is_active=True,
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)

    return AutomationRuleResponse(
        id=str(rule.id),
        name=rule.name,
        description=rule.description,
        trigger_type=rule.trigger_type,
        action_type=rule.action_type,
        category=rule.category,
        is_active=rule.is_active,
        run_count=rule.run_count,
    )


@router.get("/capi", response_model=list[CapiEventResponse])
async def list_capi_events(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List server-side Meta Conversions API (CAPI) event dispatch logs."""
    stmt = select(CapiEvent).where(CapiEvent.business_id == user.business_id).order_by(desc(CapiEvent.dispatched_at))
    res = await db.execute(stmt)
    events = res.scalars().all()

    return [
        CapiEventResponse(
            id=str(e.id),
            name=e.event_name,  # type: ignore
            ref=e.ref,
            value=float(e.value),
            match=e.match_quality,
            state=e.state,  # type: ignore
            at=e.dispatched_at.strftime("%H:%M") if e.dispatched_at else "Just now",
        )
        for e in events
    ]

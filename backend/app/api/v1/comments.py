"""Facebook & Instagram Comment Auto-Reply Rules (Production Database Backed)."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.campaign import CommentRule
from app.schemas.campaign import CommentRuleResponse, CreateCommentRuleRequest

router = APIRouter(prefix="/comments", tags=["Comment Automation"])


@router.get("/rules", response_model=list[CommentRuleResponse])
async def list_rules(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all comment keyword trigger rules for the tenant."""
    stmt = select(CommentRule).where(CommentRule.business_id == user.business_id).order_by(desc(CommentRule.created_at))
    res = await db.execute(stmt)
    rules = res.scalars().all()

    return [
        CommentRuleResponse(
            id=str(r.id),
            trigger=r.trigger_text,
            reply=r.reply_template,
            fired=r.fired_count,
            converted=r.converted_count,
            live=r.is_live,
        )
        for r in rules
    ]


@router.post("/rules", response_model=CommentRuleResponse, status_code=status.HTTP_201_CREATED)
async def create_rule(
    req: CreateCommentRuleRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new keyword auto-reply rule."""
    rule = CommentRule(
        business_id=user.business_id,
        trigger_text=req.trigger,
        reply_template=req.reply,
        dm_template=req.dm_template,
        fired_count=0,
        converted_count=0,
        is_live=True,
    )
    db.add(rule)
    await db.commit()
    await db.refresh(rule)

    return CommentRuleResponse(
        id=str(rule.id),
        trigger=rule.trigger_text,
        reply=rule.reply_template,
        fired=rule.fired_count,
        converted=rule.converted_count,
        live=rule.is_live,
    )


@router.patch("/rules/{rule_id}/toggle")
async def toggle_rule(
    rule_id: str,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle active status of a comment rule."""
    try:
        r_uuid = uuid.UUID(rule_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid rule ID format")

    stmt = select(CommentRule).where(CommentRule.id == r_uuid, CommentRule.business_id == user.business_id)
    res = await db.execute(stmt)
    rule = res.scalar_one_or_none()

    if not rule:
        raise HTTPException(status_code=404, detail="Comment rule not found")

    rule.is_live = not rule.is_live
    await db.commit()
    return {"id": rule_id, "live": rule.is_live}

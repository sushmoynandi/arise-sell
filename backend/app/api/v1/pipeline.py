"""Sales Pipeline Kanban Board (Production Database Backed)."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.pipeline import PipelineCard
from app.schemas.pipeline import PipelineCardResponse, UpdateStageRequest, ProposalSchema

router = APIRouter(prefix="/pipeline", tags=["Pipeline Kanban"])


@router.get("", response_model=list[PipelineCardResponse])
async def list_pipeline(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all pipeline cards organized by sales stage."""
    stmt = select(PipelineCard).where(PipelineCard.business_id == user.business_id).order_by(desc(PipelineCard.created_at))
    res = await db.execute(stmt)
    cards = res.scalars().all()

    return [
        PipelineCardResponse(
            id=str(c.id),
            customer=c.customer_name,
            channel=c.channel_type,  # type: ignore
            stage=c.stage,  # type: ignore
            product=c.product_name,
            value=float(c.value),
            confidence=c.confidence,
            waitingOn=c.waiting_on,
            ageMins=c.age_mins,
            proposal=(
                ProposalSchema(to=c.proposal_to_stage, why=c.proposal_why or "")  # type: ignore
                if c.proposal_to_stage
                else None
            ),
        )
        for c in cards
    ]


@router.patch("/{card_id}/stage")
async def update_stage(
    card_id: str,
    req: UpdateStageRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Transition pipeline card stage or confirm AI proposed transition."""
    try:
        c_uuid = uuid.UUID(card_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid pipeline card ID")

    stmt = select(PipelineCard).where(PipelineCard.id == c_uuid, PipelineCard.business_id == user.business_id)
    res = await db.execute(stmt)
    card = res.scalar_one_or_none()

    if not card:
        raise HTTPException(status_code=404, detail="Pipeline card not found")

    card.stage = req.stage
    card.proposal_to_stage = None
    card.proposal_why = None
    await db.commit()
    return {"id": card_id, "stage": card.stage, "confirmed": req.confirmed}

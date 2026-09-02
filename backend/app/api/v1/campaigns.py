"""WhatsApp & Messenger Broadcast Campaigns (Production Database Backed)."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.campaign import Campaign
from app.models.automation import Playbook
from app.schemas.campaign import CampaignResponse, PlaybookResponse

router = APIRouter(prefix="/campaigns", tags=["Campaigns & Reach"])


@router.get("", response_model=list[CampaignResponse])
async def list_campaigns(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all broadcast campaigns and performance attribution."""
    stmt = select(Campaign).where(Campaign.business_id == user.business_id).order_by(desc(Campaign.created_at))
    res = await db.execute(stmt)
    campaigns = res.scalars().all()

    return [
        CampaignResponse(
            id=str(c.id),
            name=c.name,
            segment=c.segment,
            channel=c.channel_type,  # type: ignore
            audience=c.audience,
            delivered=c.delivered,
            replied=c.replied,
            orders=c.orders_generated,
            revenue=float(c.revenue),
            state=c.state,  # type: ignore
            window=c.window,
        )
        for c in campaigns
    ]


@router.get("/playbooks", response_model=list[PlaybookResponse])
async def list_playbooks(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List automated sales playbook recipes."""
    stmt = select(Playbook).where(Playbook.business_id == user.business_id).order_by(desc(Playbook.created_at))
    res = await db.execute(stmt)
    playbooks = res.scalars().all()

    return [
        PlaybookResponse(
            id=str(p.id),
            name=p.name,
            when=p.when_condition,
            then=p.then_action,
            runs=p.run_count,
            orders=p.orders_generated,
            live=p.is_live,
        )
        for p in playbooks
    ]

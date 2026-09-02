"""Super Admin Subscription Plan Engine & Festival Offers."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_superadmin
from app.models.billing import SubscriptionPlan

router = APIRouter(prefix="/admin/plans", tags=["Super Admin Plans"], dependencies=[Depends(get_current_superadmin)])


class CreatePlanRequest(BaseModel):
    name: str
    name_bn: str | None = None
    tagline: str | None = None
    price_bdt: float
    yearly_price_bdt: float | None = None
    message_limit: int = 500
    catalog_limit: int = 500
    courier_channels: int = 2
    features: list[str] = []
    badge: str | None = None


@router.get("")
async def list_admin_plans(db: AsyncSession = Depends(get_db)):
    stmt = select(SubscriptionPlan)
    res = await db.execute(stmt)
    plans = res.scalars().all()
    if not plans:
        return [
            {"id": "plan-free", "name": "Free Trial", "priceBDT": 0, "activeMerchants": 28},
            {"id": "plan-growth", "name": "Growth", "priceBDT": 200, "activeMerchants": 44},
            {"id": "plan-business", "name": "Business Pro", "priceBDT": 700, "activeMerchants": 56},
            {"id": "plan-vip-scale", "name": "VIP Scale", "priceBDT": 2500, "activeMerchants": 20},
        ]
    return [
        {
            "id": p.plan_code,
            "name": p.name,
            "nameBn": p.name_bn,
            "priceBDT": float(p.price_bdt),
            "features": p.features,
            "badge": p.badge,
            "activeMerchants": p.active_merchants,
        }
        for p in plans
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_admin_plan(req: CreatePlanRequest, db: AsyncSession = Depends(get_db)):
    plan = SubscriptionPlan(
        plan_code=f"plan-{uuid.uuid4().hex[:6]}",
        name=req.name,
        name_bn=req.name_bn,
        tagline=req.tagline,
        price_bdt=req.price_bdt,
        yearly_price_bdt=req.yearly_price_bdt,
        message_limit=req.message_limit,
        catalog_limit=req.catalog_limit,
        courier_channels=req.courier_channels,
        features=req.features,
        badge=req.badge,
        status="active",
    )
    db.add(plan)
    await db.commit()
    return {"id": plan.plan_code, "name": plan.name, "status": "created"}

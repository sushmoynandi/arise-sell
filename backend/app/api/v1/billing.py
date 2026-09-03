"""Subscriptions, Invoices, and Quota Top-Up."""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tenant import Business
from app.schemas.auth import SelectPlanRequest, SelectPlanResponse
from app.schemas.billing import InvoiceResponse
from app.services.plans_service import get_stored_plans

router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])


@router.get("/plans")
async def list_plans() -> list[dict[str, Any]]:
    """Return the active commercial plans configured by admin (max 4)."""
    plans = await get_stored_plans()
    home_plans = [p for p in plans if p.get("showOnHome") is True and p.get("status") == "active"]
    if not home_plans:
        home_plans = [p for p in plans if p.get("status") == "active"]
    return home_plans[:4]


@router.post("/select-plan", response_model=SelectPlanResponse)
async def select_plan(
    req: SelectPlanRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Save or update the subscription plan for the authenticated merchant's business."""
    if not user.business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not belong to a merchant business tenant.",
        )

    stmt = select(Business).where(Business.id == user.business_id)
    res = await db.execute(stmt)
    biz = res.scalar_one_or_none()
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business tenant not found.",
        )

    # Fetch stored plans to dynamically match selected tier
    plans = await get_stored_plans()
    matched = next(
        (
            p
            for p in plans
            if p.get("id") == req.plan_id
            or p.get("name", "").strip().lower() == req.plan_id.strip().lower()
        ),
        None,
    )

    if matched:
        plan_name = matched.get("name", req.plan_id)
        quota = int(matched.get("messageLimit") or 200)
    else:
        QUOTA_MAP = {
            "free": 40,
            "basic": 200,
            "growth": 200,
            "go": 500,
            "pro": 1000,
            "business": 2500,
            "scale": 2500,
            "enterprise": 5000,
        }
        plan_name = req.plan_id.capitalize()
        quota = QUOTA_MAP.get(req.plan_id.lower(), 200)

    biz.plan = plan_name
    biz.orders_quota = quota
    await db.commit()
    await db.refresh(biz)

    return SelectPlanResponse(
        success=True,
        plan=biz.plan,
        orders_quota=biz.orders_quota,
        message=f"Successfully activated {biz.plan} plan with {quota} monthly quota.",
    )


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices():
    return [
        InvoiceResponse(
            id="INV-2026-0890",
            merchantName="Nokshi & Co.",
            plan="Business Pro",
            amountBDT=350.0,
            method="bKash Merchant API",
            txId="BKH91827364",
            date="2026-08-30",
            status="paid",
        )
    ]

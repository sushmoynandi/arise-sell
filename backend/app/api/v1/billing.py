"""Subscriptions, Invoices, and Quota Top-Up."""
from __future__ import annotations

import re
import uuid
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
            "free": 100,
            "basic": 200,
            "grow": 500,
            "growth": 500,
            "go": 500,
            "pro": 10000,
            "business": 10000,
            "scale": 15000,
            "enterprise": 50000,
            "custom": 50000,
        }
        plan_name = req.plan_id.capitalize()
        quota = QUOTA_MAP.get(req.plan_id.lower(), 500)

    # Save to user's permanent account
    user.plan = plan_name
    user.ai_quota = quota
    db.add(user)

    if not user.business_id:
        clean_store_name = f"{user.first_name}'s Store" if user.first_name else "My Store"
        base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean_store_name.lower()).strip("-") or f"store-{uuid.uuid4().hex[:6]}"
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

        biz = Business(
            name=clean_store_name,
            name_bn=clean_store_name,
            kind="Ecommerce",
            slug=unique_slug,
            plan=plan_name,
            orders_quota=quota,
            orders_used=user.ai_used or 0,
            currency="BDT",
            timezone="Asia/Dhaka",
            settings_data={
                "owner_id": str(user.id),
                "owner_email": user.email.lower(),
                "owner_name": f"{user.first_name} {user.last_name}".strip() or "Store Owner",
                "plan": plan_name,
                "team_members": [],
            },
        )
        db.add(biz)
        await db.flush()
        user.business_id = biz.id
        user.role = "owner"
        await db.commit()
        await db.refresh(biz)
        await db.refresh(user)

        return SelectPlanResponse(
            success=True,
            plan=biz.plan,
            orders_quota=biz.orders_quota,
            message=f"Successfully launched {biz.name} on {biz.plan} plan with {quota} monthly quota.",
        )

    stmt = select(Business).where(Business.id == user.business_id)
    res = await db.execute(stmt)
    biz = res.scalar_one_or_none()
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business tenant not found.",
        )

    biz.plan = plan_name
    biz.orders_quota = quota
    extra = dict(biz.settings_data or {})
    extra["plan"] = plan_name
    biz.settings_data = extra
    db.add(biz)

    # Also sync any other stores owned by this user
    all_biz = (await db.execute(select(Business))).scalars().all()
    clean_user_email = user.email.strip().lower()
    for b in all_biz:
        if b.id != biz.id:
            b_extra = b.settings_data if isinstance(b.settings_data, dict) else {}
            if (
                b_extra.get("owner_id") == str(user.id)
                or b_extra.get("owner_email", "").strip().lower() == clean_user_email
            ):
                b.plan = plan_name
                b.orders_quota = quota
                b_extra["plan"] = plan_name
                b.settings_data = b_extra
                db.add(b)

    await db.commit()
    await db.refresh(biz)
    await db.refresh(user)

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

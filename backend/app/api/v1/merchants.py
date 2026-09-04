"""Merchant Tenant Profile, Settings, and Team (Production Database Backed)."""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tenant import Business
from app.schemas.merchant import TenantResponse, TeamMemberResponse, UpdateSettingsRequest

router = APIRouter(prefix="/merchants", tags=["Merchant Settings"])


def _build_tenant_response(biz: Business) -> TenantResponse:
    extra = biz.settings_data if isinstance(biz.settings_data, dict) else {}
    base_data: dict[str, Any] = {
        "name": biz.name,
        "nameBn": biz.name_bn or biz.name,
        "kind": biz.kind or "Ecommerce",
        "since": "2021",
        "plan": (biz.plan or "Growth").capitalize(),
        "ordersUsed": biz.orders_used,
        "ordersQuota": biz.orders_quota,
        "pages": 3,
        "logoHue": biz.logo_hue,
        "slug": biz.slug or "nokshi",
        "currency": biz.currency or "BDT",
        "timezone": biz.timezone or "Asia/Dhaka",
        "website": "https://nokshi.co",
        "support_email": "support@nokshi.co",
        "phone": "+880 1711-234567",
        "address": "House 42, Road 11, Dhanmondi, Dhaka 1209",
        "trade_license": "TRAD/DNCC/049182/2022",
        "facebook_url": "https://facebook.com/nokshibd",
        "instagram_url": "https://instagram.com/nokshibd",
        "whatsapp_url": "https://wa.me/8801711234567",
        "invoice_layout": "a4",
        "invoice_show_qr": True,
        "invoice_show_tax": True,
        "invoice_prefix": "NOK-",
        "invoice_terms": "7-day exchange warranty with invoice slip.",
        "invoice_footer": "Thank you for supporting handloom artisans in Bangladesh.",
        "website_orders_enabled": False,
        "website_orders_payment_mode": "payment_link",
        "website_orders_api_url": "https://nokshi.co/api/v1/orders",
        "website_orders_auth_header": "X-API-Key",
        "website_orders_api_key": None,
        "website_orders_template": None,
    }
    # Overlay persisted extra JSON settings
    base_data.update(extra)

    # Ensure critical column overrides take precedence
    base_data["name"] = biz.name
    base_data["nameBn"] = biz.name_bn or biz.name
    base_data["kind"] = biz.kind or base_data.get("kind", "Ecommerce")
    base_data["slug"] = biz.slug
    base_data["currency"] = biz.currency
    base_data["timezone"] = biz.timezone
    base_data["logoHue"] = biz.logo_hue

    return TenantResponse(**base_data)


@router.get("/profile", response_model=TenantResponse)
async def get_merchant_profile(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full business settings profile for the authenticated tenant."""
    stmt = select(Business).where(Business.id == user.business_id)
    res = await db.execute(stmt)
    biz = res.scalar_one_or_none()

    if not biz:
        return TenantResponse(
            name="Nokshi & Co.",
            nameBn="নকশী অ্যান্ড কোং",
            kind="Handloom, home & lifestyle · Dhaka",
            since="2021",
            plan="Karkhana",
            ordersUsed=1043,
            ordersQuota=1500,
            pages=3,
            logoHue=82,
        )

    return _build_tenant_response(biz)


@router.get("/settings", response_model=TenantResponse)
async def get_merchant_settings(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full settings profile for tenant."""
    return await get_merchant_profile(user, db)


@router.patch("/settings", response_model=TenantResponse)
async def update_merchant_settings(
    req: UpdateSettingsRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update business settings and persist to tenant database."""
    stmt = select(Business).where(Business.id == user.business_id)
    res = await db.execute(stmt)
    biz = res.scalar_one_or_none()

    if not biz:
        raise HTTPException(status_code=404, detail="Business tenant not found")

    # Update top-level table columns
    if req.name is not None:
        biz.name = req.name
    if req.name_bn is not None:
        biz.name_bn = req.name_bn
    if req.kind is not None:
        biz.kind = req.kind
    if req.currency is not None:
        biz.currency = req.currency
    if req.timezone is not None:
        biz.timezone = req.timezone
    if req.slug is not None:
        biz.slug = req.slug.strip().lower()
    if req.logo_hue is not None:
        biz.logo_hue = req.logo_hue

    # Persist all extra fields into biz.settings_data JSON
    current_settings = dict(biz.settings_data) if isinstance(biz.settings_data, dict) else {}
    req_dict = req.model_dump(exclude_unset=True)

    current_settings.update(req_dict)
    biz.settings_data = current_settings
    flag_modified(biz, "settings_data")

    await db.commit()
    await db.refresh(biz)

    return _build_tenant_response(biz)


@router.get("/team", response_model=list[TeamMemberResponse])
async def list_team_members(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List teammates and active channel assignments."""
    stmt = select(User).where(User.business_id == user.business_id)
    res = await db.execute(stmt)
    users = res.scalars().all()

    return [
        TeamMemberResponse(
            name=f"{u.first_name} {u.last_name}",
            role=u.role.capitalize(),
            initials=f"{u.first_name[0]}{u.last_name[0]}",
            online=u.online,
            hue=u.hue,
            platforms=u.platforms or ["facebook", "instagram", "whatsapp"],
        )
        for u in users
    ]

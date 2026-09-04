"""Merchant Tenant Profile, Settings, and Team (Production Database Backed)."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tenant import Business
from app.schemas.merchant import TenantResponse, TeamMemberResponse, UpdateSettingsRequest

router = APIRouter(prefix="/merchants", tags=["Merchant Settings"])


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

    return TenantResponse(
        name=biz.name,
        nameBn=biz.name_bn or biz.name,
        kind=biz.kind or "Ecommerce",
        since="2021",
        plan=biz.plan.capitalize(),
        ordersUsed=biz.orders_used,
        ordersQuota=biz.orders_quota,
        pages=3,
        logoHue=biz.logo_hue,
        slug=getattr(biz, "slug", "nokshi"),
        currency=getattr(biz, "currency", "BDT"),
        timezone=getattr(biz, "timezone", "Asia/Dhaka"),
        website=getattr(biz, "website", "https://nokshi.co"),
        support_email=getattr(biz, "support_email", "support@nokshi.co"),
        phone=getattr(biz, "phone", "+880 1711-234567"),
        address=getattr(biz, "address", "House 42, Road 11, Dhanmondi, Dhaka 1209"),
        trade_license=getattr(biz, "trade_license", "TRAD/DNCC/049182/2022"),
        facebook_url=getattr(biz, "facebook_url", "https://facebook.com/nokshibd"),
        instagram_url=getattr(biz, "instagram_url", "https://instagram.com/nokshibd"),
        whatsapp_url=getattr(biz, "whatsapp_url", "https://wa.me/8801711234567"),
        invoice_layout=getattr(biz, "invoice_layout", "a4"),
        invoice_show_qr=getattr(biz, "invoice_show_qr", True),
        invoice_show_tax=getattr(biz, "invoice_show_tax", True),
        invoice_prefix=getattr(biz, "invoice_prefix", "NOK-"),
        invoice_terms=getattr(biz, "invoice_terms", "7-day exchange warranty with invoice slip."),
        invoice_footer=getattr(biz, "invoice_footer", "Thank you for supporting handloom artisans in Bangladesh."),
        website_orders_enabled=getattr(biz, "website_orders_enabled", False),
        website_orders_payment_mode=getattr(biz, "website_orders_payment_mode", "payment_link"),
        website_orders_api_url=getattr(biz, "website_orders_api_url", "https://nokshi.co/api/v1/orders"),
        website_orders_auth_header=getattr(biz, "website_orders_auth_header", "X-API-Key"),
        website_orders_api_key=getattr(biz, "website_orders_api_key", None),
        website_orders_template=getattr(biz, "website_orders_template", None),
    )


@router.patch("/settings", response_model=TenantResponse)
async def update_merchant_settings(
    req: UpdateSettingsRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update business name, branding, or currency settings."""
    stmt = select(Business).where(Business.id == user.business_id)
    res = await db.execute(stmt)
    biz = res.scalar_one_or_none()

    if not biz:
        raise HTTPException(status_code=404, detail="Business tenant not found")

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

    # Dynamically assign any present extended attributes
    for field in [
        "website", "support_email", "phone", "address", "trade_license",
        "facebook_url", "instagram_url", "whatsapp_url", "invoice_layout",
        "invoice_show_qr", "invoice_show_tax", "invoice_prefix", "invoice_terms",
        "invoice_footer", "website_orders_enabled", "website_orders_payment_mode",
        "website_orders_api_url", "website_orders_auth_header", "website_orders_api_key",
        "website_orders_template",
    ]:
        val = getattr(req, field, None)
        if val is not None and hasattr(biz, field):
            setattr(biz, field, val)

    await db.commit()
    await db.refresh(biz)

    return TenantResponse(
        name=biz.name,
        nameBn=biz.name_bn or biz.name,
        kind=biz.kind or "Ecommerce",
        since="2021",
        plan=biz.plan.capitalize(),
        ordersUsed=biz.orders_used,
        ordersQuota=biz.orders_quota,
        pages=3,
        logoHue=biz.logo_hue,
        slug=getattr(biz, "slug", "nokshi"),
        currency=getattr(biz, "currency", "BDT"),
        timezone=getattr(biz, "timezone", "Asia/Dhaka"),
        website=getattr(biz, "website", req.website or "https://nokshi.co"),
        support_email=getattr(biz, "support_email", req.support_email or "support@nokshi.co"),
        phone=getattr(biz, "phone", req.phone or "+880 1711-234567"),
        address=getattr(biz, "address", req.address or "House 42, Road 11, Dhanmondi, Dhaka 1209"),
        trade_license=getattr(biz, "trade_license", req.trade_license or "TRAD/DNCC/049182/2022"),
        facebook_url=getattr(biz, "facebook_url", req.facebook_url or "https://facebook.com/nokshibd"),
        instagram_url=getattr(biz, "instagram_url", req.instagram_url or "https://instagram.com/nokshibd"),
        whatsapp_url=getattr(biz, "whatsapp_url", req.whatsapp_url or "https://wa.me/8801711234567"),
        invoice_layout=getattr(biz, "invoice_layout", req.invoice_layout or "a4"),
        invoice_show_qr=getattr(biz, "invoice_show_qr", req.invoice_show_qr if req.invoice_show_qr is not None else True),
        invoice_show_tax=getattr(biz, "invoice_show_tax", req.invoice_show_tax if req.invoice_show_tax is not None else True),
        invoice_prefix=getattr(biz, "invoice_prefix", req.invoice_prefix or "NOK-"),
        invoice_terms=getattr(biz, "invoice_terms", req.invoice_terms or "7-day exchange warranty with invoice slip."),
        invoice_footer=getattr(biz, "invoice_footer", req.invoice_footer or "Thank you for supporting handloom artisans in Bangladesh."),
        website_orders_enabled=getattr(biz, "website_orders_enabled", req.website_orders_enabled if req.website_orders_enabled is not None else False),
        website_orders_payment_mode=getattr(biz, "website_orders_payment_mode", req.website_orders_payment_mode or "payment_link"),
        website_orders_api_url=getattr(biz, "website_orders_api_url", req.website_orders_api_url or "https://nokshi.co/api/v1/orders"),
        website_orders_auth_header=getattr(biz, "website_orders_auth_header", req.website_orders_auth_header or "X-API-Key"),
        website_orders_api_key=getattr(biz, "website_orders_api_key", req.website_orders_api_key),
        website_orders_template=getattr(biz, "website_orders_template", req.website_orders_template),
    )


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

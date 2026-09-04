"""Merchant Tenant Profile, Settings, and Team (Production Database Backed)."""
from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.core.security import verify_password
from app.models.user import User
from app.models.tenant import Business
from app.schemas.merchant import (
    TenantResponse,
    TeamMemberResponse,
    InviteTeamMemberRequest,
    UpdateTeamMemberRequest,
    StoreWorkspaceItem,
    SwitchStoreRequest,
    UpdateSettingsRequest,
    CreateStoreRequest,
    SetupChecklistResponse,
    SetupTaskItem,
    NotificationItem,
    DeleteStoreRequest,
    DeleteStoreResponse,
)

router = APIRouter(prefix="/merchants", tags=["Merchant Settings"])


PLAN_AI_QUOTAS: dict[str, int] = {
    "free": 100,
    "basic": 200,
    "grow": 500,
    "growth": 500,
    "go": 500,
    "pro": 10000,
    "business": 10000,
    "scale": 15000,
    "custom": 50000,
    "enterprise": 50000,
    "karkhana": 25000,
}


def get_plan_ai_quota(plan: str | None) -> int:
    if not plan:
        return 500
    return PLAN_AI_QUOTAS.get(plan.strip().lower(), 500)


def _build_tenant_response(biz: Business, user: User | None = None) -> TenantResponse:
    extra = biz.settings_data if isinstance(biz.settings_data, dict) else {}

    # Calculate live AI reply usage from live store + db + user account
    from app.services.live_store import get_ai_messages_count
    live_ai_count = get_ai_messages_count()
    user_ai_used = user.ai_used or 0 if user else 0
    ai_used = max(user_ai_used, biz.orders_used or 0, live_ai_count or 0)

    # Determine plan quota: User account level plan/quota takes precedence
    user_plan = user.plan if user and user.plan else None
    raw_plan = (user_plan or biz.plan or "Free").strip()
    plan_name = raw_plan.capitalize()
    tier_limit = get_plan_ai_quota(raw_plan)

    account_quota = user.ai_quota if (user and user.ai_quota) else biz.orders_quota
    if account_quota and account_quota > 0:
        quota_limit = max(account_quota, tier_limit)
    else:
        quota_limit = tier_limit

    remaining = max(0, quota_limit - ai_used)
    remaining_pct = (
        round((remaining / quota_limit) * 100) if quota_limit > 0 else 0
    )

    # Dynamic plan resource entitlement limits
    p_lower = raw_plan.lower()
    PLAN_PRICES = {
        "free": 0.0,
        "go": 349.0,
        "grow": 349.0,
        "growth": 349.0,
        "basic": 349.0,
        "pro": 999.0,
        "business": 2499.0,
        "scale": 9999.0,
        "enterprize": 9999.0,
        "enterprise": 9999.0,
        "custom": 9999.0,
    }
    PLAN_STORES = {
        "free": 1,
        "go": 1,
        "grow": 1,
        "growth": 1,
        "pro": 1,
        "business": 2,
        "scale": 4,
        "enterprize": 4,
        "enterprise": 4,
        "custom": 10,
    }
    PLAN_SEATS = {
        "free": 1,
        "go": 2,
        "grow": 2,
        "growth": 2,
        "pro": 4,
        "business": 8,
        "scale": 20,
        "enterprize": 20,
        "enterprise": 20,
        "custom": 30,
    }
    plan_price = PLAN_PRICES.get(p_lower, 0.0 if "free" in p_lower else (2499.0 if "business" in p_lower else (999.0 if "pro" in p_lower else (9999.0 if any(k in p_lower for k in ["enter", "scale", "custom", "vip"]) else 349.0))))
    max_stores = PLAN_STORES.get(p_lower, 2 if "business" in p_lower else (10 if any(k in p_lower for k in ["enter", "scale", "custom", "vip"]) else 1))
    max_seats = PLAN_SEATS.get(p_lower, 8 if "business" in p_lower else (4 if "pro" in p_lower else (20 if any(k in p_lower for k in ["enter", "scale", "custom", "vip"]) else (1 if "free" in p_lower else 2))))

    tm_list = extra.get("team_members", [])
    seats_used = 1 + (len(tm_list) if isinstance(tm_list, list) else 0)

    base_data: dict[str, Any] = {
        "has_store": True,
        "name": biz.name,
        "nameBn": biz.name_bn or biz.name,
        "kind": biz.kind or "Ecommerce",
        "since": "2021",
        "plan": plan_name,
        "planPriceBDT": plan_price,
        "maxStores": max_stores,
        "maxSeats": max_seats,
        "currentSeatsCount": seats_used,
        "currentStoresCount": 1,
        "nextBillingDate": extra.get("next_billing_date", "10 Oct, 2026"),
        "paymentMethod": extra.get("payment_method", "bKash Auto-Debit"),
        "ordersUsed": ai_used,
        "ordersQuota": quota_limit,
        "messagesUsed": ai_used,
        "messagesQuota": quota_limit,
        "remainingQuota": remaining,
        "remainingPercent": remaining_pct,
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
    base_data["plan"] = plan_name
    base_data["planPriceBDT"] = plan_price
    base_data["maxStores"] = max_stores
    base_data["maxSeats"] = max_seats
    base_data["currentSeatsCount"] = seats_used
    base_data["currency"] = biz.currency or "BDT"
    base_data["timezone"] = biz.timezone or "Asia/Dhaka"
    base_data["logoHue"] = biz.logo_hue if biz.logo_hue is not None else 82
    # Dynamic setup checklist calculated from merchant profile & settings
    courier_done = bool(
        extra.get("courier_connected")
        or extra.get("steadfast_api_key")
        or extra.get("pathao_api_key")
        or extra.get("courier_api_key")
        or "courier" in extra.get("completed_setup_ids", [])
    )
    persona_done = bool(
        extra.get("persona_configured")
        or extra.get("ai_voice")
        or "persona" in extra.get("completed_setup_ids", [])
    )
    business_done = bool(
        biz.name and (extra.get("phone") or extra.get("address") or extra.get("contact_phone"))
    )

    tasks = [
        SetupTaskItem(
            id="courier",
            title="Connect Courier API",
            hint="Steadfast / Pathao for auto parcel booking",
            href="/console/settings?tab=courier",
            completed=courier_done,
        ),
        SetupTaskItem(
            id="persona",
            title="Train AI Sales Persona",
            hint="Store voice, catalog FAQ & discount limits",
            href="/console/brain",
            completed=persona_done,
        ),
        SetupTaskItem(
            id="business",
            title="Store & Contact Details",
            hint="Contact number, address & return policy",
            href="/console/settings?tab=business",
            completed=business_done,
        ),
    ]

    completed_count = sum(1 for t in tasks if t.completed)
    base_data["setup_checklist"] = SetupChecklistResponse(
        total=len(tasks),
        completed=completed_count,
        is_complete=(completed_count == len(tasks)),
        tasks=tasks,
    )

    return TenantResponse(**base_data)


@router.get("/profile", response_model=TenantResponse)
async def get_merchant_profile(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full business settings profile for the authenticated tenant."""
    biz = None
    if user.business_id:
        stmt = select(Business).where(Business.id == user.business_id)
        res = await db.execute(stmt)
        biz = res.scalar_one_or_none()

    if not biz:
        clean_user_email = user.email.strip().lower()
        stmt = select(Business)
        res = await db.execute(stmt)
        all_businesses = res.scalars().all()

        owned_store = None
        for b in all_businesses:
            extra = b.settings_data if isinstance(b.settings_data, dict) else {}
            owner_id = str(extra.get("owner_id", ""))
            owner_email = str(extra.get("owner_email", "")).strip().lower()
            support_email = str(extra.get("support_email", "")).strip().lower()
            if (
                (owner_id and owner_id == str(user.id))
                or (owner_email and owner_email == clean_user_email)
                or (support_email and support_email == clean_user_email)
            ):
                owned_store = b
                break

        if owned_store:
            user.business_id = owned_store.id
            user.role = "owner"
            await db.commit()
            await db.refresh(user)
            return _build_tenant_response(owned_store, user)
        else:
            first_name = user.first_name.strip() if user.first_name else ""
            default_name = f"{first_name}'s Store" if first_name else "My Store"
            base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", default_name.lower()).strip("-") or f"store-{uuid.uuid4().hex[:6]}"
            unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

            assigned_plan = user.plan or "growth"
            quota = user.ai_quota or get_plan_ai_quota(assigned_plan)
            used_msgs = user.ai_used or 0

            new_biz = Business(
                name=default_name,
                name_bn=default_name,
                kind="Ecommerce",
                slug=unique_slug,
                plan=assigned_plan,
                orders_quota=quota,
                orders_used=used_msgs,
                currency="BDT",
                timezone="Asia/Dhaka",
                settings_data={
                    "tagline": "Crafted with passion",
                    "website": "",
                    "support_email": user.email.lower(),
                    "phone": user.phone or "",
                    "whatsapp_number": user.phone or "",
                    "address": "Dhaka, Bangladesh",
                    "city_division": "Dhaka",
                    "postal_code": "1200",
                    "trade_license": "",
                    "dateFormat": "DD/MM/YYYY",
                    "taxMode": "inclusive_75",
                    "orderPrefix": "ORD-",
                    "isOpenForOrders": True,
                    "scheduleMode": "custom",
                    "openTime": "09:00 AM",
                    "closeTime": "10:00 PM",
                    "weeklyOffDay": "None (Open 7 Days)",
                    "enableAwayMsg": True,
                    "awayMessage": "ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
                    "owner_id": str(user.id),
                    "owner_email": user.email.lower(),
                    "owner_name": f"{user.first_name} {user.last_name}".strip() or "Store Owner",
                    "plan": assigned_plan,
                    "team_members": [],
                },
            )
            db.add(new_biz)
            await db.flush()

            user.business_id = new_biz.id
            user.role = "owner"
            await db.commit()
            await db.refresh(user)
            await db.refresh(new_biz)
            return _build_tenant_response(new_biz, user)

    # Sync store plan with user account tier if user has a configured plan
    if user.plan and (biz.plan or "").strip().lower() != user.plan.strip().lower():
        biz.plan = user.plan
        biz.orders_quota = max(biz.orders_quota or 0, user.ai_quota or get_plan_ai_quota(user.plan))
        db.add(biz)
        await db.commit()
        await db.refresh(biz)

    return _build_tenant_response(biz, user)


@router.get("/settings", response_model=TenantResponse)
async def get_merchant_settings(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve full settings profile for tenant."""
    return await get_merchant_profile(user, db)


PLAN_STORE_LIMITS: dict[str, int] = {
    "free": 1,
    "grow": 1,
    "growth": 1,
    "basic": 1,
    "go": 1,
    "pro": 1,
    "business": 2,
    "scale": 4,
    "custom": 10,
    "enterprise": 4,
    "enterprize": 4,
    "karkhana": 4,
}


async def get_dynamic_plan_store_limit(plan_name: str) -> int:
    try:
        from app.services.plans_service import get_stored_plans
        plans = await get_stored_plans()
        clean = (plan_name or "").strip().lower()
        matched = next(
            (p for p in plans if p.get("id") == plan_name or p.get("name", "").strip().lower() == clean),
            None,
        )
        if matched and matched.get("maxStores"):
            return int(matched["maxStores"])
    except Exception:
        pass
    return PLAN_STORE_LIMITS.get((plan_name or "growth").strip().lower(), 1)


async def get_dynamic_plan_seat_limit(plan_name: str) -> int:
    try:
        from app.services.plans_service import get_stored_plans
        plans = await get_stored_plans()
        clean = (plan_name or "").strip().lower()
        matched = next(
            (p for p in plans if p.get("id") == plan_name or p.get("name", "").strip().lower() == clean),
            None,
        )
        if matched and matched.get("maxSeats"):
            return int(matched["maxSeats"])
    except Exception:
        pass
    return PLAN_SEAT_LIMITS.get((plan_name or "free").strip().lower(), 2)


@router.post("/store", response_model=TenantResponse)
async def create_store(
    req: CreateStoreRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new merchant business store for this user account."""
    clean_name = (req.name or "").strip()
    if not clean_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Store name is required",
        )

    # 1. Enforce Subscription Plan Store Limits (Hybrid Quota)
    clean_user_email = user.email.strip().lower()
    stmt = select(Business)
    res = await db.execute(stmt)
    all_businesses = res.scalars().all()

    owned_stores: list[Business] = []
    user_highest_plan = "growth"

    for b in all_businesses:
        extra = b.settings_data if isinstance(b.settings_data, dict) else {}
        owner_id = str(extra.get("owner_id", ""))
        owner_email = str(extra.get("owner_email", "")).strip().lower()
        support_email = str(extra.get("support_email", "")).strip().lower()

        is_owner = bool(
            (b.id == user.business_id and user.role == "owner")
            or (owner_id and owner_id == str(user.id))
            or (owner_email and owner_email == clean_user_email)
            or (support_email and support_email == clean_user_email)
        )
        if is_owner:
            owned_stores.append(b)
            b_plan = (b.plan or "growth").strip().lower()
            if PLAN_STORE_LIMITS.get(b_plan, 1) > PLAN_STORE_LIMITS.get(user_highest_plan, 1):
                user_highest_plan = b_plan

    target_plan = user.plan or user_highest_plan
    max_stores = await get_dynamic_plan_store_limit(target_plan)
    if len(owned_stores) >= max_stores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Store limit reached: Your current {user_highest_plan.capitalize()} plan allows up to "
                f"{max_stores} store{'s' if max_stores > 1 else ''}. "
                f"Please upgrade to the Business plan (2 stores) or Enterprise (10 stores) to create additional stores."
            ),
        )

    # 1. Generate clean URL slug
    base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean_name.lower()).strip("-")
    if not base_slug:
        base_slug = f"store-{uuid.uuid4().hex[:6]}"
    unique_slug = base_slug
    existing = await db.execute(select(Business).where(Business.slug == unique_slug))
    if existing.scalar_one_or_none():
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

    # 2. Package custom store settings data
    extra_settings = {
        "tagline": req.tagline or "",
        "website": req.website or "",
        "support_email": req.support_email or user.email,
        "phone": req.phone or "",
        "whatsapp_number": req.whatsapp_number or "",
        "address": req.address or "",
        "city_division": req.city_division or "Dhaka",
        "postal_code": req.postal_code or "",
        "trade_license": req.trade_license or "",
        "dateFormat": req.date_format,
        "taxMode": req.tax_mode,
        "orderPrefix": req.order_prefix or "ORD-",
        "isOpenForOrders": req.is_open_for_orders,
        "scheduleMode": req.schedule_mode,
        "openTime": req.open_time,
        "closeTime": req.close_time,
        "weeklyOffDay": req.weekly_off_day,
        "enableAwayMsg": req.enable_away_msg,
        "awayMessage": req.away_message or "",
        "owner_id": str(user.id),
        "owner_email": user.email.lower(),
        "owner_name": f"{user.first_name} {user.last_name}".strip(),
        "team_members": [],
    }

    assigned_plan = req.plan or user.plan or user_highest_plan or "growth"
    tier_quota = get_plan_ai_quota(assigned_plan)
    quota = user.ai_quota or tier_quota
    used_msgs = user.ai_used or 0

    # 3. Create Business tenant
    biz = Business(
        name=clean_name,
        name_bn=req.name_bn or clean_name,
        kind=req.kind or "Ecommerce",
        slug=unique_slug,
        plan=assigned_plan,
        orders_quota=quota,
        orders_used=used_msgs,
        currency=req.currency or "BDT",
        timezone=req.timezone or "Asia/Dhaka",
        settings_data=extra_settings,
    )
    db.add(biz)
    await db.flush()

    # 4. Associate owner user to new business tenant
    user.business_id = biz.id
    user.role = "owner"
    await db.commit()
    await db.refresh(biz)
    await db.refresh(user)

    return _build_tenant_response(biz, user)


@router.post("/quick-create-store", response_model=TenantResponse)
async def quick_create_default_store(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """1-Click instant default store creation for the authenticated user."""
    # 1. Enforce Subscription Plan Store Limits (Hybrid Quota)
    clean_user_email = user.email.strip().lower()
    stmt = select(Business)
    res = await db.execute(stmt)
    all_businesses = res.scalars().all()

    owned_stores: list[Business] = []
    user_highest_plan = "growth"

    for b in all_businesses:
        extra = b.settings_data if isinstance(b.settings_data, dict) else {}
        owner_id = str(extra.get("owner_id", ""))
        owner_email = str(extra.get("owner_email", "")).strip().lower()
        support_email = str(extra.get("support_email", "")).strip().lower()

        is_owner = bool(
            (b.id == user.business_id and user.role == "owner")
            or (owner_id and owner_id == str(user.id))
            or (owner_email and owner_email == clean_user_email)
            or (support_email and support_email == clean_user_email)
        )
        if is_owner:
            owned_stores.append(b)
            b_plan = (b.plan or "growth").strip().lower()
            if PLAN_STORE_LIMITS.get(b_plan, 1) > PLAN_STORE_LIMITS.get(user_highest_plan, 1):
                user_highest_plan = b_plan

    target_plan = user.plan or user_highest_plan
    max_stores = await get_dynamic_plan_store_limit(target_plan)
    if len(owned_stores) >= max_stores:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Store limit reached: Your current {user_highest_plan.capitalize()} plan allows up to "
                f"{max_stores} store{'s' if max_stores > 1 else ''}. "
                f"Please upgrade to the Business plan (2 stores) or Enterprise (10 stores) to create additional stores."
            ),
        )

    # 2. Determine default store name
    owner_name = f"{user.first_name} {user.last_name}".strip()
    first_name = user.first_name.strip() if user.first_name else ""
    if first_name:
        base_name = f"{first_name}'s Store"
    elif user.email:
        base_name = f"{user.email.split('@')[0].capitalize()}'s Store"
    else:
        base_name = "My Store"

    if len(owned_stores) > 0:
        clean_name = f"{base_name} {len(owned_stores) + 1}"
    else:
        clean_name = base_name

    # 3. Generate clean URL slug
    base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean_name.lower()).strip("-")
    if not base_slug:
        base_slug = f"store-{uuid.uuid4().hex[:6]}"
    unique_slug = base_slug
    existing = await db.execute(select(Business).where(Business.slug == unique_slug))
    if existing.scalar_one_or_none():
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

    # 4. Package default store settings
    extra_settings = {
        "tagline": "Crafted with passion",
        "website": "",
        "support_email": user.email.lower(),
        "phone": user.phone or "",
        "whatsapp_number": user.phone or "",
        "address": "Dhaka, Bangladesh",
        "city_division": "Dhaka",
        "postal_code": "1200",
        "trade_license": "",
        "dateFormat": "DD/MM/YYYY",
        "taxMode": "inclusive_75",
        "orderPrefix": "ORD-",
        "isOpenForOrders": True,
        "scheduleMode": "custom",
        "openTime": "09:00 AM",
        "closeTime": "10:00 PM",
        "weeklyOffDay": "None (Open 7 Days)",
        "enableAwayMsg": True,
        "awayMessage": "ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
        "owner_id": str(user.id),
        "owner_email": user.email.lower(),
        "owner_name": owner_name or "Store Owner",
        "team_members": [],
    }

    assigned_plan = user.plan or user_highest_plan or "growth"
    tier_quota = get_plan_ai_quota(assigned_plan)
    quota = user.ai_quota or tier_quota
    used_msgs = user.ai_used or 0

    biz = Business(
        name=clean_name,
        name_bn=clean_name,
        kind="Ecommerce",
        slug=unique_slug,
        plan=assigned_plan,
        orders_quota=quota,
        orders_used=used_msgs,
        currency="BDT",
        timezone="Asia/Dhaka",
        settings_data=extra_settings,
    )
    db.add(biz)
    await db.flush()

    user.business_id = biz.id
    user.role = "owner"
    await db.commit()
    await db.refresh(biz)
    await db.refresh(user)

    return _build_tenant_response(biz, user)


@router.patch("/settings", response_model=TenantResponse)
async def update_merchant_settings(
    req: UpdateSettingsRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update business settings and persist to tenant database."""
    biz = None
    if user.business_id:
        stmt = select(Business).where(Business.id == user.business_id)
        res = await db.execute(stmt)
        biz = res.scalar_one_or_none()

    if not biz:
        # If user has no store yet, auto-provision store from payload
        clean_name = (req.name or f"{user.first_name}'s Store").strip()
        base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean_name.lower()).strip("-") or f"store-{uuid.uuid4().hex[:6]}"
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"
        biz = Business(
            name=clean_name,
            name_bn=req.name_bn or clean_name,
            kind=req.kind or "Ecommerce",
            slug=unique_slug,
            plan="growth",
            orders_quota=1000,
            currency=req.currency or "BDT",
            timezone=req.timezone or "Asia/Dhaka",
            settings_data={
                "owner_id": str(user.id),
                "owner_email": user.email.strip().lower(),
                "owner_name": f"{user.first_name} {user.last_name}".strip() or "Store Owner",
            },
        )
        db.add(biz)
        await db.flush()
        user.business_id = biz.id
        user.role = "owner"

    # Check if user is owner of the business or an invited teammate with granular permissions
    extra = biz.settings_data if isinstance(biz.settings_data, dict) else {}
    owner_id = str(extra.get("owner_id", ""))
    owner_email = str(extra.get("owner_email", "")).strip().lower()
    clean_user_email = user.email.strip().lower()

    is_owner = bool(
        (biz.id == user.business_id and user.role == "owner")
        or (owner_id and owner_id == str(user.id))
        or (owner_email and owner_email == clean_user_email)
        or user.is_superadmin
    )

    req_dict = req.model_dump(exclude_unset=True)

    if not is_owner:
        team_members = extra.get("team_members", [])
        matched_member = next(
            (m for m in team_members if str(m.get("email", "")).strip().lower() == clean_user_email),
            None,
        )
        teammate_perms = set((matched_member.get("permissions") if matched_member else []) or [])

        if "all" not in teammate_perms:
            # Website Orders fields
            web_order_keys = {
                "website_orders_enabled", "websiteOrdersEnabled",
                "website_orders_api_url", "websiteOrdersApiUrl",
                "website_orders_api_key", "websiteOrdersApiKey",
                "website_orders_auth_header", "websiteOrdersAuthHeader",
                "website_orders_payment_mode", "websiteOrdersPaymentMode",
                "website_orders_template", "websiteOrdersTemplate",
            }
            if any(k in req_dict for k in web_order_keys):
                if "settings:website-orders" not in teammate_perms and "/console/settings" not in teammate_perms:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Permission denied: You do not have permission to configure Website Orders.",
                    )

            # Couriers
            courier_keys = {
                "inside_dhaka_rate", "insideDhakaRate",
                "outside_dhaka_rate", "outsideDhakaRate",
                "sub_dhaka_rate", "subDhakaRate",
                "fraud_shield_enabled", "fraudShieldEnabled",
                "fraud_threshold", "fraudThreshold",
                "courier_credentials", "courierCredentials",
            }
            if any(k in req_dict for k in courier_keys):
                if "settings:courier" not in teammate_perms and "courier" not in teammate_perms and "/console/settings" not in teammate_perms:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Permission denied: You do not have permission to configure Courier settings.",
                    )

            # Invoices
            invoice_keys = {
                "invoice_layout", "invoiceLayout",
                "invoice_prefix", "invoicePrefix",
                "invoice_terms", "invoiceTerms",
                "invoice_footer", "invoiceFooter",
                "invoice_show_qr", "invoiceShowQr",
                "invoice_show_tax", "invoiceShowTax",
                "invoice_color_accent", "invoiceColorAccent",
                "invoice_bin_vat", "invoiceBinVat",
                "invoice_payment_notes", "invoicePaymentNotes",
                "invoice_bank_wire", "invoiceBankWire",
            }
            if any(k in req_dict for k in invoice_keys):
                if "settings:invoice" not in teammate_perms and "invoices" not in teammate_perms and "/console/settings" not in teammate_perms:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Permission denied: You do not have permission to configure Invoice settings.",
                    )

            # Meta CAPI
            meta_keys = {
                "meta_pixel_id", "metaPixelId",
                "meta_capi_token", "metaCapiToken",
                "meta_test_code", "metaTestCode",
                "meta_auto_catalog_sync", "metaAutoCatalogSync",
            }
            if any(k in req_dict for k in meta_keys):
                if "settings:meta" not in teammate_perms and "/console/settings" not in teammate_perms:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Permission denied: You do not have permission to configure Meta CAPI.",
                    )

            # Notifications
            notif_keys = {
                "sms_provider", "smsProvider",
                "sms_api_key", "smsApiKey",
                "sms_sender_id", "smsSenderId",
                "telegram_bot_token", "telegramBotToken",
                "telegram_chat_id", "telegramChatId",
                "sms_order_confirmed", "smsOrderConfirmed",
                "sms_parcel_dispatched", "smsParcelDispatched",
            }
            if any(k in req_dict for k in notif_keys):
                if "settings:notifications" not in teammate_perms and "/console/settings" not in teammate_perms:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Permission denied: You do not have permission to configure Notifications.",
                    )

            # General Business profile
            business_keys = {
                "name", "name_bn", "kind", "currency", "timezone", "slug", "logo_hue",
                "website", "support_email", "phone", "whatsapp_number", "address",
                "city_division", "postal_code", "trade_license", "is_open_for_orders",
                "isOpenForOrders", "schedule_mode", "scheduleMode", "open_time", "openTime",
                "close_time", "closeTime", "weekly_off_day", "weeklyOffDay",
                "enable_away_msg", "enableAwayMsg", "away_message", "awayMessage",
            }
            if any(k in req_dict for k in business_keys):
                if "settings:business" not in teammate_perms and "/console/settings" not in teammate_perms:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Permission denied: You do not have permission to modify Store Profile settings.",
                    )

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

    current_settings.update(req_dict)
    biz.settings_data = current_settings
    flag_modified(biz, "settings_data")

    await db.commit()
    await db.refresh(biz)

    return _build_tenant_response(biz, user)


PLAN_SEAT_LIMITS = {
    "free": 1,
    "grow": 2,
    "growth": 2,
    "pro": 4,
    "business": 8,
    "scale": 15,
    "custom": 30,
    "enterprise": 30,
    "karkhana": 30,
}


@router.get("/team", response_model=list[TeamMemberResponse])
async def list_team_members(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List teammates and active channel/permission assignments."""
    if not user.business_id:
        return []

    biz = await db.get(Business, user.business_id)
    if not biz:
        return []

    extra = biz.settings_data if isinstance(biz.settings_data, dict) else {}
    saved_members = list(extra.get("team_members", []))

    # 1. Resolve store owner details
    owner_stmt = select(User).where(User.business_id == biz.id, User.role == "owner")
    owner_res = await db.execute(owner_stmt)
    owner_user = owner_res.scalars().first()

    if owner_user:
        owner_name = f"{owner_user.first_name} {owner_user.last_name}".strip()
        owner_email = owner_user.email
        owner_id = str(owner_user.id)
        owner_avatar = owner_user.avatar_url
    else:
        owner_name = extra.get("owner_name") or f"{user.first_name} {user.last_name}".strip()
        owner_email = extra.get("owner_email") or user.email
        owner_id = extra.get("owner_id") or str(user.id)
        owner_avatar = user.avatar_url if str(user.id) == owner_id else None

    now = datetime.now(timezone.utc)
    clean_user_email = user.email.strip().lower()
    is_owner_active = (owner_email.lower() == clean_user_email)
    if not is_owner_active and owner_user:
        if owner_user.online:
            is_owner_active = True
        elif owner_user.last_login:
            is_owner_active = (now - owner_user.last_login).total_seconds() < 7200

    owner_initials = "".join([part[0] for part in owner_name.split()[:2]]).upper() or "OW"

    members: list[TeamMemberResponse] = [
        TeamMemberResponse(
            id=owner_id,
            name=owner_name or "Store Owner",
            email=owner_email,
            role="Owner",
            initials=owner_initials,
            online=is_owner_active,
            hue=82,
            platforms=["Messenger", "WhatsApp", "Instagram"],
            permissions=["all", "chat", "orders", "courier", "catalog", "invoices", "settings"],
            is_owner=True,
            avatar_url=owner_avatar,
        )
    ]

    seen_emails = {owner_email.lower()}

    # Query all users in DB matching saved member emails
    member_emails = [
        str(m.get("email", "")).strip().lower()
        for m in saved_members
        if str(m.get("email", "")).strip().lower()
    ]
    matched_users_by_email: dict[str, User] = {}
    if member_emails:
        users_stmt = select(User).where(func.lower(User.email).in_(member_emails))
        users_res = await db.execute(users_stmt)
        for u in users_res.scalars().all():
            matched_users_by_email[u.email.strip().lower()] = u

    # 2. Add teammates saved in settings_data["team_members"]
    for idx, m in enumerate(saved_members):
        m_email = str(m.get("email", "")).strip().lower()
        if not m_email or m_email in seen_emails:
            continue
        seen_emails.add(m_email)

        matched_db_u = matched_users_by_email.get(m_email)
        m_name = (
            f"{matched_db_u.first_name} {matched_db_u.last_name}".strip()
            if (matched_db_u and (matched_db_u.first_name or matched_db_u.last_name))
            else (m.get("name") or "Teammate")
        )
        m_initials = "".join([part[0] for part in m_name.split()[:2]]).upper() or "TM"
        m_avatar = matched_db_u.avatar_url if (matched_db_u and matched_db_u.avatar_url) else m.get("avatar_url")

        is_member_active = False
        if m_email == clean_user_email:
            is_member_active = True
        elif matched_db_u:
            if matched_db_u.online:
                is_member_active = True
            elif matched_db_u.last_login:
                is_member_active = (now - matched_db_u.last_login).total_seconds() < 7200
            else:
                is_member_active = bool(m.get("online", True))
        else:
            is_member_active = bool(m.get("online", True))

        members.append(
            TeamMemberResponse(
                id=str(matched_db_u.id if matched_db_u else m.get("id", f"tm_{idx}")),
                name=m_name,
                email=m_email,
                role=m.get("role", "Moderator"),
                initials=m_initials,
                online=is_member_active,
                hue=int(matched_db_u.hue if (matched_db_u and matched_db_u.hue is not None) else m.get("hue", 155)),
                platforms=m.get("channels", ["Messenger", "WhatsApp", "Instagram"]),
                permissions=m.get("permissions", ["chat", "orders"]),
                is_owner=False,
                avatar_url=m_avatar,
            )
        )

    # 3. Include any existing users in DB associated with this store that weren't in settings
    db_users_stmt = select(User).where(User.business_id == biz.id)
    db_users_res = await db.execute(db_users_stmt)
    db_users = db_users_res.scalars().all()
    for u in db_users:
        u_email = u.email.strip().lower()
        if u_email in seen_emails:
            continue
        seen_emails.add(u_email)
        u_name = f"{u.first_name} {u.last_name}".strip() or "Teammate"
        u_initials = f"{u.first_name[0]}{u.last_name[0]}" if (u.first_name and u.last_name) else "TM"
        is_u_active = (
            (u_email == clean_user_email)
            or bool(u.online)
            or bool(u.last_login and (now - u.last_login).total_seconds() < 7200)
        )
        members.append(
            TeamMemberResponse(
                id=str(u.id),
                name=u_name,
                email=u_email,
                role=u.role.capitalize(),
                initials=u_initials,
                online=is_u_active,
                hue=int(u.hue or 82),
                platforms=u.platforms or ["Messenger", "WhatsApp", "Instagram"],
                permissions=["chat", "orders"] if u.role != "owner" else ["all", "chat", "orders", "courier", "catalog", "invoices", "settings"],
                is_owner=(u.role == "owner"),
                avatar_url=u.avatar_url,
            )
        )

    return members


@router.post("/team", response_model=TeamMemberResponse, status_code=status.HTTP_201_CREATED)
async def invite_team_member(
    req: InviteTeamMemberRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Invite a team member with specific role, channel assignments, and granular module permissions.
    Teammate seats are covered by the store's subscription tier.
    """
    if not user.business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You do not have an active store to invite members to.",
        )

    # Only store owner or superadmin can invite teammates
    if user.role != "owner" and not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the store owner has permission to invite team members.",
        )

    biz = await db.get(Business, user.business_id)
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found.",
        )

    extra = dict(biz.settings_data) if isinstance(biz.settings_data, dict) else {}
    team_members = list(extra.get("team_members", []))

    # 1. Enforce Plan Seat Limits
    max_seats = await get_dynamic_plan_seat_limit(biz.plan or "free")
    current_occupied = len(team_members) + 1  # 1 owner + teammates

    if current_occupied >= max_seats:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Seat limit of {max_seats} reached on your {biz.plan.capitalize()} plan. Please upgrade to invite additional team members.",
        )

    # 2. Prevent duplicate invitations
    clean_email = req.email.strip().lower()
    if clean_email == user.email.strip().lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot invite yourself as a team member.",
        )

    if any(str(m.get("email", "")).strip().lower() == clean_email for m in team_members):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A team member with email '{clean_email}' already exists in this store.",
        )

    # 3. Create member record
    member_id = f"tm_{uuid.uuid4().hex[:8]}"
    clean_name = req.name.strip()
    initials = "".join([part[0] for part in clean_name.split()[:2]]).upper() or "TM"
    hue = (abs(hash(clean_email)) % 300) + 20

    new_member = {
        "id": member_id,
        "name": clean_name,
        "email": clean_email,
        "role": req.role.strip() or "Moderator",
        "channels": req.channels or ["Messenger", "WhatsApp", "Instagram"],
        "permissions": req.permissions or ["chat", "orders"],
        "online": True,
        "hue": hue,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    team_members.append(new_member)
    extra["team_members"] = team_members
    biz.settings_data = extra
    flag_modified(biz, "settings_data")

    await db.commit()

    u_stmt = select(User).where(func.lower(User.email) == clean_email)
    u_res = await db.execute(u_stmt)
    existing_u = u_res.scalars().first()
    invitee_avatar = existing_u.avatar_url if existing_u else None

    return TeamMemberResponse(
        id=member_id,
        name=clean_name,
        email=clean_email,
        role=new_member["role"],
        initials=initials,
        online=True,
        hue=hue,
        platforms=new_member["channels"],
        permissions=new_member["permissions"],
        is_owner=False,
        avatar_url=invitee_avatar,
    )


@router.put("/team/{member_id}", response_model=TeamMemberResponse)
async def update_team_member(
    member_id: str,
    req: UpdateTeamMemberRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a team member's name, role, channels, or permissions."""
    if not user.business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active store found.",
        )

    if user.role != "owner" and not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the store owner can edit team members.",
        )

    biz = await db.get(Business, user.business_id)
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found.",
        )

    extra = dict(biz.settings_data) if isinstance(biz.settings_data, dict) else {}
    team_members = list(extra.get("team_members", []))

    target_idx = None
    for idx, m in enumerate(team_members):
        if str(m.get("id")) == member_id or str(m.get("email", "")).lower() == member_id.lower():
            target_idx = idx
            break

    if target_idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Team member '{member_id}' not found.",
        )

    member = dict(team_members[target_idx])
    if req.name is not None and req.name.strip():
        member["name"] = req.name.strip()
    if req.role is not None:
        clean_role = req.role.strip() or "Moderator"
        member["role"] = clean_role
    if req.channels is not None:
        member["channels"] = req.channels
    if req.permissions is not None:
        member["permissions"] = req.permissions

    team_members[target_idx] = member
    extra["team_members"] = team_members
    biz.settings_data = extra
    flag_modified(biz, "settings_data")
    await db.commit()

    initials = "".join([part[0] for part in member.get("name", "TM").split()[:2]]).upper() or "TM"
    hue = member.get("hue") or ((abs(hash(member.get("email", ""))) % 300) + 20)

    u_stmt = select(User).where(func.lower(User.email) == str(member.get("email", "")).lower())
    u_res = await db.execute(u_stmt)
    existing_u = u_res.scalars().first()
    updated_avatar = existing_u.avatar_url if existing_u else member.get("avatar_url")

    return TeamMemberResponse(
        id=member.get("id", member_id),
        name=member.get("name", ""),
        email=member.get("email", ""),
        role=member.get("role", "Moderator"),
        initials=initials,
        online=member.get("online", True),
        hue=hue,
        platforms=member.get("channels", ["Messenger", "WhatsApp", "Instagram"]),
        permissions=member.get("permissions", ["chat", "orders"]),
        is_owner=False,
        avatar_url=updated_avatar,
    )


@router.delete("/team/{member_id}")
async def remove_team_member(
    member_id: str,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Remove a team member from this store."""
    if not user.business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active store found.",
        )

    if user.role != "owner" and not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the store owner can remove team members.",
        )

    biz = await db.get(Business, user.business_id)
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found.",
        )

    extra = dict(biz.settings_data) if isinstance(biz.settings_data, dict) else {}
    team_members = list(extra.get("team_members", []))

    target_email = None
    new_team_members = []
    for m in team_members:
        if str(m.get("id")) == member_id or str(m.get("email", "")).lower() == member_id.lower():
            target_email = m.get("email")
        else:
            new_team_members.append(m)

    extra["team_members"] = new_team_members
    biz.settings_data = extra
    flag_modified(biz, "settings_data")

    # If an actual user in the DB is associated with this store and matches target_email, detach their business_id
    if target_email:
        u_stmt = select(User).where(User.business_id == biz.id, User.email == target_email.lower())
        u_res = await db.execute(u_stmt)
        detached_user = u_res.scalar_one_or_none()
        if detached_user:
            detached_user.business_id = None
            db.add(detached_user)

    await db.commit()
    return {"success": True, "message": f"Team member {member_id} removed successfully."}


@router.get("/my-stores", response_model=list[StoreWorkspaceItem])
async def list_my_stores(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    List all store workspaces accessible to this user:
    1. Stores owned by the user (or personal store)
    2. Stores where the user has been invited as a team member (Moderator, Dispatch, Manager, etc.)
       Teammates do NOT need to buy a plan for invited stores — the owner's plan covers them.
    """
    clean_user_email = user.email.strip().lower()

    stmt = select(Business)
    res = await db.execute(stmt)
    all_businesses = res.scalars().all()

    workspaces: list[StoreWorkspaceItem] = []
    seen_store_ids = set()

    for b in all_businesses:
        extra = b.settings_data if isinstance(b.settings_data, dict) else {}
        owner_id = str(extra.get("owner_id", ""))
        owner_email = str(extra.get("owner_email", "")).strip().lower()
        support_email = str(extra.get("support_email", "")).strip().lower()
        team_members = extra.get("team_members", [])

        is_owner = bool(
            (b.id == user.business_id and user.role == "owner")
            or (owner_id and owner_id == str(user.id))
            or (owner_email and owner_email == clean_user_email)
            or (support_email and support_email == clean_user_email)
        )

        matched_member = next(
            (m for m in team_members if str(m.get("email", "")).strip().lower() == clean_user_email),
            None,
        )

        # Check if user belongs to this store in the User table as non-owner
        if not is_owner and not matched_member and b.id == user.business_id and user.role != "owner":
            matched_member = {
                "role": user.role.capitalize(),
                "permissions": ["chat", "orders"],
            }

        if not is_owner and not matched_member:
            continue

        store_id_str = str(b.id)
        if store_id_str in seen_store_ids:
            continue
        seen_store_ids.add(store_id_str)

        is_active = bool(user.business_id and b.id == user.business_id)

        if is_owner:
            role_name = "Owner"
            plan_covered = False
            owner_display = f"{user.first_name} {user.last_name}".strip() or "You"
            perms = ["all", "chat", "orders", "courier", "catalog", "invoices", "settings"]
        else:
            role_name = (matched_member.get("role") if matched_member else None) or "Moderator"
            plan_covered = True  # Covered by owner! Teammate does NOT need to buy a plan
            owner_display = extra.get("owner_name") or "Store Owner"
            perms = (matched_member.get("permissions") if matched_member else None) or ["chat", "orders"]

        # Resolve real-time dynamic store limit from database plans
        plan_str = b.plan or user.plan or "Free"
        max_allowed = await get_dynamic_plan_store_limit(plan_str)

        workspaces.append(
            StoreWorkspaceItem(
                id=store_id_str,
                name=b.name,
                slug=b.slug,
                plan=(b.plan or "Free").capitalize(),
                role=role_name,
                is_owner=is_owner,
                owner_name=owner_display,
                plan_covered_by_owner=plan_covered,
                is_active=is_active,
                channels_count=3,
                permissions=perms,
                max_stores=max_allowed,
                maxStores=max_allowed,
            )
        )

    # Sort workspaces: active first, then owned, then invited
    workspaces.sort(key=lambda w: (not w.is_active, not w.is_owner, w.name))
    return workspaces


@router.post("/switch-store")
async def switch_store_workspace(
    req: SwitchStoreRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Switch the user's active store workspace to any store they own or are invited to.
    """
    try:
        target_uuid = uuid.UUID(req.store_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid store ID format.")

    target_biz = await db.get(Business, target_uuid)
    if not target_biz:
        raise HTTPException(status_code=404, detail="Target store not found.")

    clean_user_email = user.email.strip().lower()
    extra = dict(target_biz.settings_data) if isinstance(target_biz.settings_data, dict) else {}
    owner_id = str(extra.get("owner_id", ""))
    owner_email = str(extra.get("owner_email", "")).strip().lower()
    support_email = str(extra.get("support_email", "")).strip().lower()
    team_members = extra.get("team_members", [])

    is_owner = bool(
        (owner_id and owner_id == str(user.id))
        or (owner_email and owner_email == clean_user_email)
        or (support_email and support_email == clean_user_email)
        or (target_biz.id == user.business_id and user.role == "owner")
    )

    matched_member = next(
        (m for m in team_members if str(m.get("email", "")).strip().lower() == clean_user_email),
        None,
    )

    if not is_owner and not matched_member and not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this store workspace.",
        )

    new_role = "owner" if is_owner else (str(matched_member.get("role", "moderator")).lower() if matched_member else "moderator")

    if is_owner and (not owner_email or not owner_id):
        extra["owner_id"] = str(user.id)
        extra["owner_email"] = clean_user_email
        extra["owner_name"] = f"{user.first_name} {user.last_name}".strip() or "Store Owner"
        target_biz.settings_data = extra
        flag_modified(target_biz, "settings_data")

    user.business_id = target_biz.id
    user.role = new_role
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return {
        "success": True,
        "active_store_id": str(target_biz.id),
        "store_name": target_biz.name,
        "role": new_role,
        "plan": target_biz.plan,
        "is_owner": is_owner,
    }


@router.get("/notifications", response_model=list[NotificationItem])
async def list_merchant_notifications(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve notifications tailored to the tenant and role."""
    stmt = select(Business).where(Business.id == user.business_id)
    res = await db.execute(stmt)
    biz = res.scalar_one_or_none()

    extra = biz.settings_data if biz and isinstance(biz.settings_data, dict) else {}
    read_ids = set(extra.get("read_notifications", []))
    biz_name = biz.name if biz else "Store"

    return [
        NotificationItem(
            id="n1",
            title="Admin Announcement: Maintenance Scheduled",
            body="Infrastructure upgrade tonight at 3:00 AM. AI automated order booking will remain active without downtime.",
            time="20m ago",
            unread="n1" not in read_ids,
            type="admin",
        ),
        NotificationItem(
            id="n2",
            title="Steadfast Courier API v2.4 Active",
            body="Automated 1-click parcel generation & 24h COD instant payout tracking now enabled for your account.",
            time="2h ago",
            unread="n2" not in read_ids,
            type="courier",
        ),
        NotificationItem(
            id="n3",
            title=f"{biz_name} Catalog Synced Successfully",
            body="Automated stock sync complete across active sales channels with zero conflict.",
            time="1d ago",
            unread="n3" not in read_ids,
            type="system",
        ),
    ]


@router.post("/notifications/mark-read")
async def mark_notifications_read(
    req: dict[str, list[str]],
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark specified notifications as read for this tenant."""
    stmt = select(Business).where(Business.id == user.business_id)
    res = await db.execute(stmt)
    biz = res.scalar_one_or_none()
    if not biz:
        return {"success": True}

    extra = dict(biz.settings_data) if isinstance(biz.settings_data, dict) else {}
    read_ids = set(extra.get("read_notifications", []))
    to_mark = req.get("ids", [])
    read_ids.update(to_mark)
    extra["read_notifications"] = list(read_ids)
    biz.settings_data = extra
    flag_modified(biz, "settings_data")
    await db.commit()
    return {"success": True, "read": list(read_ids)}


@router.delete("/store", response_model=DeleteStoreResponse)
async def delete_store(
    req: DeleteStoreRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Permanently deletes current store/business tenant and all associated channels,
    product catalogs, customer conversations, and orders.
    The user's account credentials and profile remain preserved.
    """
    # 1. Permission check: Only store owner or superadmin can delete a store
    if user.role != "owner" and not user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the store owner has permission to delete this store. Moderators and staff members cannot delete stores.",
        )

    if not user.business_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active store associated with this user.",
        )

    biz = await db.get(Business, user.business_id)
    if not biz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Store not found.",
        )

    # 2. Confirmation phrase assertion ('DELETE' or exact store name / slug)
    clean_phrase = req.confirm_phrase.strip().lower()
    biz_name_lower = (biz.name or "").strip().lower()
    biz_slug_lower = (biz.slug or "").strip().lower()

    if clean_phrase != "delete" and clean_phrase != biz_name_lower and clean_phrase != biz_slug_lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Confirmation phrase does not match. Please enter 'DELETE' or '{biz.name}'.",
        )

    # 3. Optional password check if provided
    if getattr(user, "has_password", False) and req.password:
        if not verify_password(req.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect account password provided.",
            )

    deleted_store_name = biz.name
    current_plan = biz.plan or "growth"

    # 4. Remove staff/teammates belonging only to this store (exclude owner)
    teammates_stmt = select(User).where(User.business_id == biz.id, User.id != user.id)
    teammates_res = await db.execute(teammates_stmt)
    staff_members = teammates_res.scalars().all()
    for staff in staff_members:
        await db.delete(staff)

    # 5. Check if user owns other stores
    clean_user_email = user.email.strip().lower()
    all_biz_stmt = select(Business)
    all_biz_res = await db.execute(all_biz_stmt)
    all_businesses = all_biz_res.scalars().all()

    other_owned_stores: list[Business] = []
    for b in all_businesses:
        if b.id == biz.id:
            continue
        extra = b.settings_data if isinstance(b.settings_data, dict) else {}
        owner_id = str(extra.get("owner_id", ""))
        owner_email = str(extra.get("owner_email", "")).strip().lower()
        support_email = str(extra.get("support_email", "")).strip().lower()

        is_owner = bool(
            (owner_id and owner_id == str(user.id))
            or (owner_email and owner_email == clean_user_email)
            or (support_email and support_email == clean_user_email)
        )
        if is_owner:
            other_owned_stores.append(b)

    # 6. Preserve Account-Level Subscription Plan & AI Quota / Tokens
    # AI tokens belong to the user account, not to a single store!
    from app.services.live_store import get_ai_messages_count
    live_ai_count = get_ai_messages_count()

    account_plan = (user.plan or biz.plan or "growth").strip()
    tier_quota = get_plan_ai_quota(account_plan)
    account_quota = user.ai_quota or (biz.orders_quota if biz.orders_quota and biz.orders_quota > tier_quota else tier_quota)
    account_used = max(user.ai_used or 0, biz.orders_used or 0, live_ai_count or 0)

    # Persist directly onto the user's permanent account
    user.plan = account_plan
    user.ai_quota = account_quota
    user.ai_used = account_used
    db.add(user)

    if len(other_owned_stores) > 0:
        # Case A: User has > 1 store -> Directly delete this store and switch to remaining owned store
        remaining_store = other_owned_stores[0]
        remaining_store.plan = account_plan
        remaining_store.orders_quota = account_quota
        remaining_store.orders_used = account_used
        extra_rem = dict(remaining_store.settings_data or {})
        extra_rem["plan"] = account_plan
        remaining_store.settings_data = extra_rem
        db.add(remaining_store)

        user.business_id = remaining_store.id
        user.role = "owner"
        db.add(user)
        await db.flush()

        await db.delete(biz)
        await db.commit()
        await db.refresh(user)
        await db.refresh(remaining_store)

        return DeleteStoreResponse(
            success=True,
            deleted_store_name=deleted_store_name,
            new_store_created=False,
            active_store_name=remaining_store.name,
            active_store_id=str(remaining_store.id),
            message=f"Store '{deleted_store_name}' deleted. Switched to remaining store '{remaining_store.name}'. Remaining AI message tokens preserved.",
        )
    else:
        # Case B: User had only 1 store -> Auto-create a brand new default store
        first_name = user.first_name.strip() if user.first_name else ""
        if first_name:
            default_name = f"{first_name}'s Store"
        elif user.email:
            default_name = f"{user.email.split('@')[0].capitalize()}'s Store"
        else:
            default_name = "My Store"

        base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", default_name.lower()).strip("-")
        if not base_slug:
            base_slug = f"store-{uuid.uuid4().hex[:6]}"
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

        owner_name = f"{user.first_name} {user.last_name}".strip()

        # The new store inherits the account's plan, quota, and usage so remaining messages are 100% PRESERVED
        new_biz = Business(
            name=default_name,
            name_bn=default_name,
            kind="Ecommerce",
            slug=unique_slug,
            plan=account_plan,
            orders_quota=account_quota,
            orders_used=account_used,
            currency="BDT",
            timezone="Asia/Dhaka",
            settings_data={
                "tagline": "Crafted with passion",
                "website": "",
                "support_email": user.email.lower(),
                "phone": user.phone or "",
                "whatsapp_number": user.phone or "",
                "address": "Dhaka, Bangladesh",
                "city_division": "Dhaka",
                "postal_code": "1200",
                "trade_license": "",
                "dateFormat": "DD/MM/YYYY",
                "taxMode": "inclusive_75",
                "orderPrefix": "ORD-",
                "isOpenForOrders": True,
                "scheduleMode": "custom",
                "openTime": "09:00 AM",
                "closeTime": "10:00 PM",
                "weeklyOffDay": "None (Open 7 Days)",
                "enableAwayMsg": True,
                "awayMessage": "ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।",
                "owner_id": str(user.id),
                "owner_email": user.email.lower(),
                "owner_name": owner_name or "Store Owner",
                "plan": account_plan,
                "team_members": [],
            },
        )
        db.add(new_biz)
        await db.flush()

        user.business_id = new_biz.id
        user.role = "owner"
        db.add(user)

        await db.delete(biz)
        await db.commit()
        await db.refresh(user)
        await db.refresh(new_biz)

        return DeleteStoreResponse(
            success=True,
            deleted_store_name=deleted_store_name,
            new_store_created=True,
            active_store_name=new_biz.name,
            active_store_id=str(new_biz.id),
            message=f"Store '{deleted_store_name}' deleted. A fresh new default store '{new_biz.name}' has been created with all remaining AI messages preserved.",
        )

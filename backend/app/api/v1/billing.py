"""Subscriptions, Invoices, and Quota Top-Up."""
from __future__ import annotations

import re
import uuid
from datetime import datetime, timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tenant import Business
from app.models.billing import Invoice, EnterpriseContract
from app.schemas.auth import (
    SelectPlanRequest,
    SelectPlanResponse,
    CheckPlanSwitchRequest,
    CheckPlanSwitchResponse,
    StoreConflictItem,
    TeammateConflictItem,
)
from app.api.v1.merchants import get_user_owned_stores
from app.schemas.billing import (
    InvoiceResponse,
    TopUpRequest,
    TopUpResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
    RedeemCodeRequest,
    RedeemCodeResponse,
)
from app.services.contract_service import (
    get_contract_by_code_or_id,
    get_pending_contract_for_business,
    activate_contract,
)
from app.services.plans_service import (
    get_stored_plans,
)

router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])


@router.get("/plans")
async def list_plans() -> list[dict[str, Any]]:
    """Return all active commercial plans configured in the system."""
    plans = await get_stored_plans()
    active_plans = [p for p in plans if p.get("status") == "active"]
    if not active_plans:
        active_plans = plans
    return active_plans


async def resolve_plan_tier_details(plan_id: str, is_yearly: bool = False) -> dict[str, Any]:
    """Helper to resolve normalized plan specifications and capacity allocations."""
    plans = await get_stored_plans()
    matched = next(
        (
            p
            for p in plans
            if p.get("id") == plan_id
            or p.get("name", "").strip().lower() == plan_id.strip().lower()
        ),
        None,
    )
    if matched:
        plan_name = matched.get("name", plan_id)
        quota = int(matched.get("messageLimit") or 200)
        price_bdt = float(
            matched.get("yearlyPriceBDT")
            if is_yearly and matched.get("yearlyPriceBDT") is not None
            else matched.get("priceBDT", 0.0)
        )
        max_seats = int(matched.get("maxSeats") or 1)
        max_stores = int(matched.get("maxStores") or 1)
    else:
        QUOTA_MAP = {
            "free": 100,
            "basic": 200,
            "grow": 500,
            "growth": 500,
            "go": 500,
            "pro": 1500,
            "business": 4500,
            "scale": 15000,
            "enterprise": 50000,
            "custom": 50000,
        }
        plan_name = plan_id.capitalize()
        quota = QUOTA_MAP.get(plan_id.lower(), 500)
        p_lower = plan_id.lower()
        if "business" in p_lower:
            price_bdt = 24999.0 if is_yearly else 2499.0
            max_seats = 8
            max_stores = 2
        elif "pro" in p_lower:
            price_bdt = 9999.0 if is_yearly else 999.0
            max_seats = 4
            max_stores = 1
        elif "go" in p_lower or "grow" in p_lower:
            price_bdt = 3499.0 if is_yearly else 349.0
            max_seats = 2
            max_stores = 1
        elif "free" in p_lower:
            price_bdt = 0.0
            max_seats = 1
            max_stores = 1
        elif any(k in p_lower for k in ["custom", "enterprise", "scale"]):
            price_bdt = 50000.0
            max_seats = 30
            max_stores = 10
        else:
            price_bdt = 349.0
            max_seats = 2
            max_stores = 1

    return {
        "plan_name": plan_name,
        "quota": quota,
        "price_bdt": price_bdt,
        "max_seats": max_seats,
        "max_stores": max_stores,
    }


@router.post("/check-plan-switch", response_model=CheckPlanSwitchResponse)
async def check_plan_switch(
    req: CheckPlanSwitchRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Check whether switching to the target plan causes store or seat capacity conflicts.
    """
    target = await resolve_plan_tier_details(req.plan_id)
    target_max_stores = target["max_stores"]
    target_max_seats = target["max_seats"]
    target_teammates_allowed = max(0, target_max_seats - 1)

    owned_stores = await get_user_owned_stores(user, db)
    active_stores = [
        b for b in owned_stores
        if not bool((b.settings_data or {}).get("is_frozen", False))
    ]

    current_biz = None
    if user.business_id:
        current_biz = await db.get(Business, user.business_id)
    if not current_biz and owned_stores:
        current_biz = owned_stores[0]

    current_extra = dict(current_biz.settings_data or {}) if current_biz else {}
    current_teammates = list(current_extra.get("team_members", []))
    current_occupied_seats = 1 + len(current_teammates)

    stores_conflict = len(active_stores) > target_max_stores
    seats_conflict = current_occupied_seats > target_max_seats
    requires_reconciliation = stores_conflict or seats_conflict

    return CheckPlanSwitchResponse(
        can_switch_directly=not requires_reconciliation,
        requires_reconciliation=requires_reconciliation,
        current_plan=user.plan or (current_biz.plan if current_biz else "Free"),
        target_plan=target["plan_name"],
        target_max_stores=target_max_stores,
        target_max_seats=target_max_seats,
        target_teammates_allowed=target_teammates_allowed,
        stores_conflict=stores_conflict,
        seats_conflict=seats_conflict,
        owned_stores=[
            StoreConflictItem(
                id=str(b.id),
                name=b.name,
                slug=b.slug,
                is_active=bool(user.business_id and b.id == user.business_id),
                is_frozen=bool((b.settings_data or {}).get("is_frozen", False)),
            )
            for b in owned_stores
        ],
        active_stores_count=len(active_stores),
        team_members=[
            TeammateConflictItem(
                id=str(m.get("id") or idx),
                name=str(m.get("name") or "Teammate"),
                email=str(m.get("email") or ""),
                role=str(m.get("role") or "Moderator"),
            )
            for idx, m in enumerate(current_teammates)
        ],
        current_teammates_count=len(current_teammates),
    )


@router.post("/select-plan", response_model=SelectPlanResponse)
async def select_plan(
    req: SelectPlanRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Save or update the subscription plan for the authenticated merchant's business."""
    is_yearly = req.billing_period == "yearly"
    target = await resolve_plan_tier_details(req.plan_id, is_yearly)
    plan_name = target["plan_name"]
    quota = target["quota"]
    price_bdt = target["price_bdt"]
    max_seats = target["max_seats"]
    max_stores = target["max_stores"]
    max_teammates = max(0, max_seats - 1)

    owned_stores = await get_user_owned_stores(user, db)
    active_stores = [
        b for b in owned_stores
        if not bool((b.settings_data or {}).get("is_frozen", False))
    ]

    current_biz = None
    if user.business_id:
        current_biz = await db.get(Business, user.business_id)
    if not current_biz and owned_stores:
        current_biz = owned_stores[0]
        user.business_id = current_biz.id

    current_extra = dict(current_biz.settings_data or {}) if current_biz else {}
    current_teammates = list(current_extra.get("team_members", []))
    current_occupied_seats = 1 + len(current_teammates)

    stores_conflict = len(active_stores) > max_stores
    seats_conflict = current_occupied_seats > max_seats
    requires_reconciliation = stores_conflict or seats_conflict

    # If capacity conflicts exist but reconciliation was not supplied, reject with 409
    if requires_reconciliation and not req.reconciliation:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": f"Switching to {plan_name} requires resolving store or seat capacity limits.",
                "requires_reconciliation": True,
                "stores_conflict": stores_conflict,
                "seats_conflict": seats_conflict,
                "target_max_stores": max_stores,
                "target_max_seats": max_seats,
            },
        )

    # Save to user's permanent account
    user.plan = plan_name
    user.ai_quota = quota
    db.add(user)

    now_str = datetime.now().strftime("%Y-%m-%d")
    now_iso = datetime.now().isoformat()
    inv_no = f"INV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

    # If user has no store at all, create an initial default store
    if not current_biz and not owned_stores:
        clean_store_name = f"{user.first_name}'s Store" if user.first_name else "My Store"
        base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean_store_name.lower()).strip("-") or f"store-{uuid.uuid4().hex[:6]}"
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

        current_biz = Business(
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
                "max_seats": max_seats,
                "max_stores": max_stores,
                "plan_price_bdt": price_bdt,
                "payment_method": "Free Tier (No Card Required)" if price_bdt == 0 else "bKash Auto-Debit",
                "next_billing_date": "Lifetime Free" if price_bdt == 0 else (datetime.now() + timedelta(days=365 if is_yearly else 30)).strftime("%d %b, %Y"),
                "team_members": [],
                "is_frozen": False,
            },
        )
        db.add(current_biz)
        await db.flush()
        user.business_id = current_biz.id
        user.role = "owner"
        db.add(user)
        owned_stores = [current_biz]

    biz = current_biz

    # 1. Supersede any active EnterpriseContract for this store or merchant
    conditions = []
    if biz and biz.id:
        conditions.append(EnterpriseContract.business_id == biz.id)
    if user.email:
        conditions.append(EnterpriseContract.merchant_email.ilike(user.email.strip().lower()))
    biz_extra = dict(biz.settings_data or {}) if biz else {}
    owner_email = biz_extra.get("owner_email")
    if owner_email:
        conditions.append(EnterpriseContract.merchant_email.ilike(str(owner_email).strip().lower()))

    if conditions:
        contract_stmt = select(EnterpriseContract).where(
            or_(*conditions),
            EnterpriseContract.status == "active",
        )
        c_res = await db.execute(contract_stmt)
        for c in c_res.scalars().all():
            if c.plan_name.strip().lower() != plan_name.strip().lower():
                c.status = "superseded"
                db.add(c)

    # 2. Process Store Freezing / Retention
    active_store_ids: list[str] = []
    frozen_store_ids: list[str] = []

    if req.reconciliation and req.reconciliation.keep_store_ids:
        keep_ids = set(str(sid).strip().lower() for sid in req.reconciliation.keep_store_ids)
        for b in owned_stores:
            b_extra = dict(b.settings_data or {})
            if str(b.id).lower() in keep_ids:
                b_extra["is_frozen"] = False
                b_extra.pop("frozen_at", None)
                b_extra.pop("frozen_reason", None)
                active_store_ids.append(str(b.id))
            else:
                b_extra["is_frozen"] = True
                b_extra["frozen_at"] = now_iso
                b_extra["frozen_reason"] = f"Plan downgraded to {plan_name}"
                frozen_store_ids.append(str(b.id))

            b_extra["plan"] = plan_name
            b_extra["max_stores"] = max_stores
            b_extra["max_seats"] = max_seats
            b_extra["plan_price_bdt"] = price_bdt
            b_extra["subscription_months"] = 12 if is_yearly else 1
            b_extra["payment_method"] = "Free Tier (No Card Required)" if price_bdt == 0 else "bKash Auto-Debit"
            if price_bdt == 0:
                b_extra["next_billing_date"] = "Lifetime Free"
            else:
                b_extra["next_billing_date"] = (datetime.now() + timedelta(days=365 if is_yearly else 30)).strftime("%d %b, %Y")
            b_extra.pop("contract_id", None)
            b_extra.pop("contract_code", None)
            b_extra.pop("plan_expires_at", None)

            b.plan = plan_name
            b.orders_quota = quota
            b.settings_data = b_extra
            flag_modified(b, "settings_data")
            db.add(b)

        # If user.business_id was frozen, automatically switch to first kept active store
        if user.business_id and str(user.business_id).lower() not in keep_ids and active_store_ids:
            user.business_id = uuid.UUID(active_store_ids[0])
            db.add(user)
            for b in owned_stores:
                if str(b.id) == active_store_ids[0]:
                    biz = b
                    break
    else:
        # Standard Plan Upgrade / Same Tier:
        # If upgrading to a tier with more store capacity, automatically unfreeze previous frozen stores up to limit!
        currently_active_count = len(active_stores)
        available_slots = max(0, max_stores - currently_active_count)

        for b in owned_stores:
            b_extra = dict(b.settings_data or {})
            if b_extra.get("is_frozen"):
                if available_slots > 0:
                    b_extra["is_frozen"] = False
                    b_extra.pop("frozen_at", None)
                    b_extra.pop("frozen_reason", None)
                    available_slots -= 1
                    active_store_ids.append(str(b.id))
                else:
                    frozen_store_ids.append(str(b.id))
            else:
                active_store_ids.append(str(b.id))

            b_extra["plan"] = plan_name
            b_extra["max_stores"] = max_stores
            b_extra["max_seats"] = max_seats
            b_extra["plan_price_bdt"] = price_bdt
            b_extra["subscription_months"] = 12 if is_yearly else 1
            b_extra["payment_method"] = "Free Tier (No Card Required)" if price_bdt == 0 else "bKash Auto-Debit"
            if price_bdt == 0:
                b_extra["next_billing_date"] = "Lifetime Free"
            else:
                b_extra["next_billing_date"] = (datetime.now() + timedelta(days=365 if is_yearly else 30)).strftime("%d %b, %Y")
            b_extra.pop("contract_id", None)
            b_extra.pop("contract_code", None)
            b_extra.pop("plan_expires_at", None)

            b.plan = plan_name
            b.orders_quota = quota
            b.settings_data = b_extra
            flag_modified(b, "settings_data")
            db.add(b)

    # 3. Process Team Members reconciliation if provided
    if req.reconciliation and req.reconciliation.keep_team_member_ids is not None:
        keep_tm_ids = set(str(mid).strip().lower() for mid in req.reconciliation.keep_team_member_ids)
        revoked_emails: set[str] = set()

        for b in owned_stores:
            b_extra = dict(b.settings_data or {})
            tms = list(b_extra.get("team_members", []))
            if max_teammates == 0:
                for m in tms:
                    em = str(m.get("email", "")).strip().lower()
                    if em:
                        revoked_emails.add(em)
                b_extra["team_members"] = []
            else:
                retained_tms = []
                for idx, m in enumerate(tms):
                    mid = str(m.get("id", "")).strip().lower()
                    m_email = str(m.get("email", "")).strip().lower()
                    if (
                        (mid and mid in keep_tm_ids)
                        or (m_email and m_email in keep_tm_ids)
                        or str(idx) in keep_tm_ids
                    ) and len(retained_tms) < max_teammates:
                        retained_tms.append(m)
                    else:
                        if m_email:
                            revoked_emails.add(m_email)
                b_extra["team_members"] = retained_tms

            b.settings_data = b_extra
            flag_modified(b, "settings_data")
            db.add(b)

        # Detach revoked team members from active user sessions for these stores
        if revoked_emails:
            store_ids = [b.id for b in owned_stores]
            u_stmt = select(User).where(
                User.business_id.in_(store_ids),
                func.lower(User.email).in_(list(revoked_emails)),
                User.role != "owner",
            )
            u_res = await db.execute(u_stmt)
            for revoked_u in u_res.scalars().all():
                revoked_u.business_id = None
                db.add(revoked_u)

    # 4. Record plan change invoice
    if biz:
        sub_inv = Invoice(
            invoice_no=inv_no,
            merchant_name=biz.name,
            plan_name=f"{plan_name} Plan (Subscription)",
            amount_bdt=price_bdt,
            original_amount_bdt=price_bdt,
            payment_method="Free Tier (No Card Required)" if price_bdt == 0 else "bKash Auto-Debit",
            tx_id=f"BKH{uuid.uuid4().hex[:8].upper()}" if price_bdt > 0 else "FREE-SUBSCRIPTION",
            invoice_date=now_str,
            status="paid",
            business_id=biz.id,
        )
        db.add(sub_inv)

    await db.commit()
    if biz:
        await db.refresh(biz)
    await db.refresh(user)

    return SelectPlanResponse(
        success=True,
        plan=biz.plan if biz else plan_name,
        orders_quota=biz.orders_quota if biz else quota,
        message=f"Successfully activated {plan_name} plan with {quota} monthly quota.",
        active_stores=active_store_ids,
        frozen_stores=frozen_store_ids,
    )


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_invoices(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Return stored merchant tax invoices, generating an initial subscription invoice if empty."""
    biz = None
    if user.business_id:
        biz = await db.get(Business, user.business_id)

    if not biz:
        clean_user_email = user.email.strip().lower()
        all_biz = (await db.execute(select(Business))).scalars().all()
        for b in all_biz:
            extra = b.settings_data if isinstance(b.settings_data, dict) else {}
            if (
                extra.get("owner_id") == str(user.id)
                or extra.get("owner_email", "").strip().lower() == clean_user_email
            ):
                biz = b
                break

    if not biz:
        return []

    stmt = select(Invoice).where(Invoice.business_id == biz.id).order_by(Invoice.created_at.desc())
    res = await db.execute(stmt)
    invoices = list(res.scalars().all())

    if not invoices:
        # Auto-create initial active plan subscription invoice
        plans = await get_stored_plans()
        current_plan_name = (biz.plan or user.plan or "Business").capitalize()
        matched = next(
            (p for p in plans if p.get("name", "").strip().lower() == current_plan_name.strip().lower()),
            None,
        )
        price_bdt = (
            float(matched.get("priceBDT", 2499.0))
            if matched
            else (2499.0 if "business" in current_plan_name.lower() else (999.0 if "pro" in current_plan_name.lower() else 349.0))
        )

        now = datetime.now()
        inv_no = f"INV-{now.strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"
        init_inv = Invoice(
            invoice_no=inv_no,
            merchant_name=biz.name,
            plan_name=f"{current_plan_name} Plan (Monthly Subscription)",
            amount_bdt=price_bdt,
            original_amount_bdt=price_bdt,
            payment_method="bKash Auto-Debit",
            tx_id=f"BKH{uuid.uuid4().hex[:8].upper()}",
            invoice_date=now.strftime("%Y-%m-%d"),
            status="paid",
            business_id=biz.id,
        )
        db.add(init_inv)
        await db.commit()
        await db.refresh(init_inv)
        invoices = [init_inv]

    return [
        InvoiceResponse(
            id=inv.invoice_no,
            invoiceNo=inv.invoice_no,
            merchantName=inv.merchant_name,
            plan=inv.plan_name,
            amountBDT=float(inv.amount_bdt),
            originalAmountBDT=float(inv.original_amount_bdt) if inv.original_amount_bdt is not None else float(inv.amount_bdt),
            discountBDT=float(inv.discount_bdt) if inv.discount_bdt is not None else 0.0,
            method=inv.payment_method,
            txId=inv.tx_id,
            date=inv.invoice_date,
            status=inv.status,
            description=f"{inv.plan_name} · Ref: {inv.tx_id}",
        )
        for inv in invoices
    ]


@router.post("/topup", response_model=TopUpResponse)
async def create_topup(
    req: TopUpRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Credit quota to merchant account & store and generate an invoice in PostgreSQL."""
    biz = None
    if user.business_id:
        biz = await db.get(Business, user.business_id)

    if not biz:
        clean_user_email = user.email.strip().lower()
        all_biz = (await db.execute(select(Business))).scalars().all()
        for b in all_biz:
            extra = b.settings_data if isinstance(b.settings_data, dict) else {}
            if (
                extra.get("owner_id") == str(user.id)
                or extra.get("owner_email", "").strip().lower() == clean_user_email
            ):
                biz = b
                break

    clean_pack = req.pack.lower()
    if "1500" in clean_pack or "1,500" in clean_pack:
        added_quota = 1500
        price_bdt = 3200.0
    elif "5000" in clean_pack or "5,000" in clean_pack:
        if "capi" in clean_pack or "signal" in clean_pack:
            added_quota = 5000
            price_bdt = 950.0
        else:
            added_quota = 5000
            price_bdt = 8500.0
    else:
        # Default +500
        added_quota = 500
        price_bdt = 1250.0

    # Credit user account
    user.ai_quota = (user.ai_quota or 0) + added_quota
    db.add(user)

    now = datetime.now()
    now_str = now.strftime("%Y-%m-%d")
    inv_no = f"INV-TOPUP-{now.strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

    if biz:
        biz.orders_quota = (biz.orders_quota or 0) + added_quota
        db.add(biz)

        topup_inv = Invoice(
            invoice_no=inv_no,
            merchant_name=biz.name,
            plan_name=f"{req.pack} Quota Top-Up",
            amount_bdt=price_bdt,
            original_amount_bdt=price_bdt,
            payment_method="bKash Direct",
            tx_id=f"BKH{uuid.uuid4().hex[:8].upper()}",
            invoice_date=now_str,
            status="paid",
            business_id=biz.id,
        )
        db.add(topup_inv)

    await db.commit()
    if biz:
        await db.refresh(biz)
    await db.refresh(user)

    return TopUpResponse(
        success=True,
        plan=biz.plan if biz else (user.plan or "Business"),
        orders_quota=biz.orders_quota if biz else (user.ai_quota or 0),
        messages_quota=user.ai_quota or 0,
        added_quota=added_quota,
        amount_bdt=price_bdt,
        message=f"Successfully added {req.pack} to your quota! Quota updated immediately.",
    )



# ─── Professional Enterprise Contract Endpoints (PostgreSQL) ───

class PayContractRequest(BaseModel):
    contract_code: str
    payment_method: str | None = "bKash Auto-Debit"


@router.get("/enterprise-contract")
async def get_merchant_enterprise_contract(
    code: str | None = None,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve assigned pending enterprise contract proposal from PostgreSQL."""
    contract = None
    if code and code.strip():
        contract = await get_contract_by_code_or_id(code.strip(), db)
    else:
        contract = await get_pending_contract_for_business(user.business_id, user.email, db)

    if not contract:
        return {"found": False, "contract": None}

    return {
        "found": True,
        "contract": {
            "id": str(contract.id),
            "contract_code": contract.contract_code,
            "plan_name": contract.plan_name,
            "duration_months": contract.duration_months,
            "price_bdt": float(contract.price_bdt),
            "message_limit": contract.message_limit,
            "max_stores": contract.max_stores,
            "max_seats": contract.max_seats,
            "features": contract.features or [],
            "valid_until": contract.valid_until,
            "status": contract.status,
            "merchant_name": contract.merchant_name,
        }
    }


@router.post("/enterprise-contract/pay")
async def pay_and_activate_enterprise_contract(
    req: PayContractRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Client payment & instant activation of an enterprise contract in PostgreSQL."""
    clean_code = req.contract_code.strip()
    contract = await get_contract_by_code_or_id(clean_code, db)
    if not contract:
        raise HTTPException(status_code=404, detail="Enterprise contract not found.")
    # Find or initialize merchant business tenant
    biz = None
    if user.business_id:
        biz = await db.get(Business, user.business_id)

    if not biz:
        clean_user_email = user.email.strip().lower()
        all_biz = (await db.execute(select(Business))).scalars().all()
        for b in all_biz:
            extra = b.settings_data if isinstance(b.settings_data, dict) else {}
            if (
                extra.get("owner_id") == str(user.id)
                or extra.get("owner_email", "").strip().lower() == clean_user_email
            ):
                biz = b
                break

    if contract.status not in ["pending", "superseded"]:
        if contract.status == "active":
            if biz and contract.business_id == biz.id:
                return {
                    "success": True,
                    "plan": contract.plan_name,
                    "contract_code": contract.contract_code,
                    "duration_months": contract.duration_months,
                    "orders_quota": contract.message_limit,
                    "max_stores": contract.max_stores,
                    "max_seats": contract.max_seats,
                    "expires_at": contract.expires_at.isoformat() if contract.expires_at else None,
                    "message": f"Enterprise contract {contract.contract_code} is already active for your store.",
                }
            elif contract.business_id is not None:
                raise HTTPException(status_code=400, detail="This enterprise contract has already been activated for another store.")
        else:
            raise HTTPException(status_code=400, detail=f"This contract is {contract.status}.")

    now_str = datetime.now().strftime("%Y-%m-%d")
    if contract.valid_until and contract.valid_until < now_str:
        contract.status = "expired"
        db.add(contract)
        await db.commit()
        raise HTTPException(
            status_code=400,
            detail=f"This contract proposal expired on {contract.valid_until}. Please contact sales for a renewed contract."
        )

    if not biz:
        clean_store_name = f"{user.first_name}'s Store" if user.first_name else "My Enterprise Store"
        base_slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean_store_name.lower()).strip("-") or f"store-{uuid.uuid4().hex[:6]}"
        unique_slug = f"{base_slug}-{uuid.uuid4().hex[:4]}"

        biz = Business(
            name=clean_store_name,
            name_bn=clean_store_name,
            kind="Ecommerce",
            slug=unique_slug,
            plan=contract.plan_name,
            orders_quota=contract.message_limit,
            orders_used=user.ai_used or 0,
            currency="BDT",
            timezone="Asia/Dhaka",
            settings_data={
                "owner_id": str(user.id),
                "owner_email": user.email.lower(),
                "owner_name": f"{user.first_name} {user.last_name}".strip() or "Store Owner",
                "plan": contract.plan_name,
                "team_members": [],
            },
        )
        db.add(biz)
        await db.flush()
        user.business_id = biz.id
        user.role = "owner"
        db.add(user)

    # Activate contract and synchronize
    contract, biz = await activate_contract(
        contract=contract,
        db=db,
        payment_method=req.payment_method or "bKash Auto-Debit",
        target_business=biz,
    )
    user.plan = contract.plan_name
    user.ai_quota = contract.message_limit
    db.add(user)
    await db.commit()
    await db.refresh(user)

    duration_label = f"{contract.duration_months} মাসের" if contract.duration_months > 1 else "১ মাসের"
    return {
        "success": True,
        "plan": biz.plan,
        "contract_code": contract.contract_code,
        "duration_months": contract.duration_months,
        "orders_quota": biz.orders_quota,
        "max_stores": contract.max_stores,
        "max_seats": contract.max_seats,
        "expires_at": contract.expires_at.isoformat() if contract.expires_at else None,
        "message": f"অভিনন্দন! আপনার {contract.plan_name} প্ল্যান ({duration_label}) সফলভাবে সক্রিয় হয়েছে ({contract.message_limit:,} AI মেসেজ, {contract.max_stores}টি স্টোর, {contract.max_seats}টি সিট)।",
    }


@router.post("/verify-code", response_model=VerifyCodeResponse)
async def verify_code(
    req: VerifyCodeRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify an enterprise activation contract code from PostgreSQL."""
    clean_code = req.code.strip().upper()
    if not clean_code:
        return VerifyCodeResponse(valid=False, error="Activation code cannot be empty.")

    contract = await get_contract_by_code_or_id(clean_code, db)
    if not contract:
        return VerifyCodeResponse(
            valid=False,
            error="Invalid activation code. Please contact sales on WhatsApp for a valid enterprise code.",
        )

    if contract.status not in ["pending", "superseded"]:
        if contract.status == "active":
            return VerifyCodeResponse(
                valid=False,
                error="This enterprise contract has already been activated.",
            )
        return VerifyCodeResponse(
            valid=False,
            error=f"Contract is currently {contract.status}.",
        )

    now_str = datetime.now().strftime("%Y-%m-%d")
    if contract.valid_until and contract.valid_until < now_str:
        return VerifyCodeResponse(
            valid=False,
            error=f"Contract expired on {contract.valid_until}.",
        )

    return VerifyCodeResponse(
        valid=True,
        code=contract.contract_code,
        plan_name=contract.plan_name,
        duration_months=contract.duration_months,
        message_limit=contract.message_limit,
        max_stores=contract.max_stores,
        max_seats=contract.max_seats,
        price_bdt=float(contract.price_bdt),
        code_expiry=contract.valid_until,
        features=contract.features or [],
    )


@router.post("/redeem-code", response_model=RedeemCodeResponse)
async def redeem_code(
    req: RedeemCodeRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Validate and redeem an enterprise license activation code for the merchant."""
    clean_code = req.code.strip().upper()
    if not clean_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Activation code cannot be empty.",
        )

    res = await pay_and_activate_enterprise_contract(
        req=PayContractRequest(contract_code=clean_code, payment_method=req.payment_method),
        user=user,
        db=db,
    )
    return RedeemCodeResponse(
        success=res["success"],
        plan=res["plan"],
        orders_quota=res["orders_quota"],
        messages_quota=res["orders_quota"],
        max_stores=res["max_stores"],
        max_seats=res["max_seats"],
        duration_months=res.get("duration_months", 1),
        price_bdt=0.0,
        payment_method=req.payment_method,
        message=res["message"],
    )



"""Subscriptions, Invoices, and Quota Top-Up."""
from __future__ import annotations

import re
import uuid
from datetime import datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tenant import Business
from app.models.billing import Invoice
from app.schemas.auth import SelectPlanRequest, SelectPlanResponse
from app.schemas.billing import (
    InvoiceResponse,
    TopUpRequest,
    TopUpResponse,
    RedeemCodeRequest,
    RedeemCodeResponse,
)
from app.services.plans_service import (
    get_stored_plans,
    get_custom_activation_codes,
    find_and_redeem_code,
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
        price_bdt = float(matched.get("priceBDT", 0.0))
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
        price_bdt = 2499.0 if "business" in req.plan_id.lower() else (999.0 if "pro" in req.plan_id.lower() else 349.0)

    # Save to user's permanent account
    user.plan = plan_name
    user.ai_quota = quota
    db.add(user)

    now_str = datetime.now().strftime("%Y-%m-%d")
    inv_no = f"INV-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

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

        # Record initial plan invoice
        sub_inv = Invoice(
            invoice_no=inv_no,
            merchant_name=biz.name,
            plan_name=f"{plan_name} Plan (Subscription)",
            amount_bdt=price_bdt,
            original_amount_bdt=price_bdt,
            payment_method="bKash Auto-Debit",
            tx_id=f"BKH{uuid.uuid4().hex[:8].upper()}",
            invoice_date=now_str,
            status="paid",
            business_id=biz.id,
        )
        db.add(sub_inv)

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

    # Record plan change invoice in database
    sub_inv = Invoice(
        invoice_no=inv_no,
        merchant_name=biz.name,
        plan_name=f"{plan_name} Plan (Subscription)",
        amount_bdt=price_bdt,
        original_amount_bdt=price_bdt,
        payment_method="bKash Auto-Debit",
        tx_id=f"BKH{uuid.uuid4().hex[:8].upper()}",
        invoice_date=now_str,
        status="paid",
        business_id=biz.id,
    )
    db.add(sub_inv)

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


@router.get("/custom-codes")
async def list_custom_codes() -> list[dict[str, Any]]:
    """Return available enterprise custom activation templates (metadata only)."""
    return get_custom_activation_codes()


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

    code_info = find_and_redeem_code(clean_code)
    if not code_info:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired plan activation code. Please contact sales on WhatsApp for a valid enterprise code.",
        )

    plan_name = code_info.get("plan_name", "Custom Enterprise")
    quota = int(code_info.get("message_limit", 50000))
    max_stores = int(code_info.get("max_stores", 5))
    max_seats = int(code_info.get("max_seats", 20))
    price_bdt = float(code_info.get("price_bdt", 0.0))

    # 1. Update user permanent account
    user.plan = plan_name
    user.ai_quota = quota
    db.add(user)

    now_str = datetime.now().strftime("%Y-%m-%d")
    inv_no = f"INV-CUSTOM-{datetime.now().strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"

    # 2. Find or create merchant business store
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
        clean_store_name = f"{user.first_name}'s Store" if user.first_name else "My Enterprise Store"
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
                "plan_price_bdt": price_bdt,
                "max_stores": max_stores,
                "max_seats": max_seats,
                "team_members": [],
            },
        )
        db.add(biz)
        await db.flush()
        user.business_id = biz.id
        user.role = "owner"
    else:
        biz.plan = plan_name
        biz.orders_quota = quota
        extra = dict(biz.settings_data or {})
        extra["plan"] = plan_name
        extra["plan_price_bdt"] = price_bdt
        extra["max_stores"] = max_stores
        extra["max_seats"] = max_seats
        biz.settings_data = extra
        flag_modified(biz, "settings_data")
        db.add(biz)

    # 3. Create paid voucher tax invoice
    custom_inv = Invoice(
        invoice_no=inv_no,
        merchant_name=biz.name,
        plan_name=f"{plan_name} (Code: {clean_code})",
        amount_bdt=price_bdt,
        original_amount_bdt=price_bdt,
        payment_method="Enterprise License Voucher",
        tx_id=f"VCHR-{clean_code}",
        invoice_date=now_str,
        status="paid",
        business_id=biz.id,
    )
    db.add(custom_inv)

    # 4. Also synchronize any other stores owned by this merchant
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
                b_extra["plan_price_bdt"] = price_bdt
                b_extra["max_stores"] = max_stores
                b_extra["max_seats"] = max_seats
                b.settings_data = b_extra
                flag_modified(b, "settings_data")
                db.add(b)

    await db.commit()
    await db.refresh(biz)
    await db.refresh(user)

    return RedeemCodeResponse(
        success=True,
        plan=biz.plan,
        orders_quota=biz.orders_quota,
        messages_quota=user.ai_quota or 0,
        max_stores=max_stores,
        max_seats=max_seats,
        message=f"অভিনন্দন! আপনার {plan_name} প্ল্যান সফলভাবে সক্রিয় হয়েছে ({quota:,} AI মেসেজ, {max_stores}টি স্টোর, {max_seats}টি সিট)।",
    )


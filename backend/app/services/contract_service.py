"""Enterprise Contract Service - PostgreSQL-driven custom plans & quotations."""
from __future__ import annotations

import calendar
import re
import uuid
from datetime import datetime, timezone
from typing import Any
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.attributes import flag_modified

from app.models.billing import EnterpriseContract, Invoice
from app.models.tenant import Business
from app.models.user import User


def compute_expiration_date(months: int, start: datetime | None = None) -> datetime:
    """Accurately compute expiration date by adding months."""
    base = start or datetime.now(timezone.utc)
    new_month = base.month + months
    new_year = base.year + (new_month - 1) // 12
    new_month = ((new_month - 1) % 12) + 1
    max_day = calendar.monthrange(new_year, new_month)[1]
    new_day = min(base.day, max_day)
    return datetime(
        new_year, new_month, new_day, base.hour, base.minute, base.second, tzinfo=base.tzinfo
    )


async def list_contracts(
    db: AsyncSession, status_filter: str | None = None
) -> list[EnterpriseContract]:
    """List all enterprise contracts ordered by creation date."""
    stmt = select(EnterpriseContract).order_by(EnterpriseContract.created_at.desc())
    if status_filter:
        stmt = stmt.where(EnterpriseContract.status == status_filter)
    res = await db.execute(stmt)
    return list(res.scalars().all())


async def get_contract_by_code_or_id(
    identifier: str, db: AsyncSession
) -> EnterpriseContract | None:
    """Find a contract by its unique code (case-insensitive) or UUID."""
    clean = identifier.strip()
    try:
        val_uuid = uuid.UUID(clean)
        stmt = select(EnterpriseContract).where(
            or_(
                EnterpriseContract.id == val_uuid,
                EnterpriseContract.contract_code.ilike(clean),
            )
        )
    except ValueError:
        stmt = select(EnterpriseContract).where(
            EnterpriseContract.contract_code.ilike(clean)
        )
    res = await db.execute(stmt)
    return res.scalar_one_or_none()


async def get_pending_contract_for_business(
    business_id: uuid.UUID | None, email: str | None, db: AsyncSession
) -> EnterpriseContract | None:
    """Find the active or pending enterprise contract proposal assigned to a business or email."""
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    conditions = []
    if business_id:
        conditions.append(EnterpriseContract.business_id == business_id)
    if email:
        clean_email = email.strip().lower()
        conditions.append(EnterpriseContract.merchant_email.ilike(clean_email))

    if not conditions:
        return None

    stmt = (
        select(EnterpriseContract)
        .where(
            or_(*conditions),
            EnterpriseContract.status == "pending",
        )
        .order_by(EnterpriseContract.created_at.desc())
    )
    res = await db.execute(stmt)
    contracts = list(res.scalars().all())
    for c in contracts:
        if c.valid_until and c.valid_until < now_str:
            c.status = "expired"
            db.add(c)
        else:
            return c
    await db.commit()
    return None


async def create_enterprise_contract(
    data: dict[str, Any], db: AsyncSession
) -> EnterpriseContract:
    """Create a new formal enterprise contract in PostgreSQL."""
    plan_name = data.get("plan_name", "Custom Enterprise")
    duration = max(1, int(data.get("duration_months", 1)))
    raw_code = data.get("contract_code")

    if raw_code and str(raw_code).strip():
        clean_code = re.sub(r"[^A-Z0-9_-]+", "", str(raw_code).strip().upper())
    else:
        prefix = re.sub(r"[^A-Z0-9]+", "", plan_name.upper())[:10] or "ENT"
        unique_suffix = uuid.uuid4().hex[:4].upper()
        clean_code = f"{prefix}-{duration}M-{unique_suffix}"

    # Target business
    biz_id = None
    if data.get("business_id"):
        try:
            biz_id = uuid.UUID(str(data["business_id"]))
        except ValueError:
            biz_id = None

    target_biz = await db.get(Business, biz_id) if biz_id else None
    merchant_name = target_biz.name if target_biz else data.get("merchant_name")
    merchant_email = data.get("merchant_email")
    if not merchant_email and target_biz and isinstance(target_biz.settings_data, dict):
        merchant_email = target_biz.settings_data.get("owner_email")

    price_bdt = float(data.get("price_bdt", 0.0))
    msg_limit = int(data.get("message_limit", 50000))
    max_stores = int(data.get("max_stores", 5))
    max_seats = int(data.get("max_seats", 20))

    features = data.get("features") or [
        f"{msg_limit:,} AI Messages / month",
        f"{max_stores} Connected Stores",
        f"{max_seats} Team Member Seats",
        f"{duration} Months Enterprise Term License",
        "Dedicated Account Manager & Priority SLA",
    ]

    auto_activate = bool(data.get("auto_activate", False))

    contract = EnterpriseContract(
        contract_code=clean_code,
        business_id=biz_id,
        merchant_email=merchant_email.strip().lower() if merchant_email else None,
        merchant_name=merchant_name,
        plan_name=plan_name,
        duration_months=duration,
        price_bdt=price_bdt,
        message_limit=msg_limit,
        max_stores=max_stores,
        max_seats=max_seats,
        features=features,
        valid_until=data.get("valid_until"),
        status="pending",
        payment_method=data.get("payment_method"),
        notes=data.get("notes"),
    )
    db.add(contract)
    await db.flush()

    if auto_activate and target_biz:
        await activate_contract(
            contract=contract,
            db=db,
            payment_method=data.get("payment_method") or "Direct Bank Wire / Offline",
            target_business=target_biz,
        )
    else:
        await db.commit()
        await db.refresh(contract)

    return contract


async def activate_contract(
    contract: EnterpriseContract,
    db: AsyncSession,
    payment_method: str = "bKash Auto-Debit",
    target_business: Business | None = None,
) -> tuple[EnterpriseContract, Business]:
    """Activate an enterprise contract, update business quotas, and record paid tax invoice."""
    now = datetime.now(timezone.utc)
    expires_at = compute_expiration_date(contract.duration_months, now)
    next_billing_date_str = expires_at.strftime("%d %b, %Y")

    biz = target_business
    if not biz and contract.business_id:
        biz = await db.get(Business, contract.business_id)

    if not biz:
        raise ValueError("Cannot activate contract without an associated store tenant.")

    # 1. Update contract status
    contract.status = "active"
    contract.business_id = biz.id
    contract.merchant_name = biz.name
    contract.activated_at = now
    contract.expires_at = expires_at
    contract.payment_method = payment_method

    inv_no = f"INV-ENT-{now.strftime('%Y%m')}-{uuid.uuid4().hex[:4].upper()}"
    contract.invoice_no = inv_no
    db.add(contract)

    # 2. Update Business Tenant
    biz.plan = contract.plan_name
    biz.orders_quota = contract.message_limit
    extra = dict(biz.settings_data or {})
    extra["plan"] = contract.plan_name
    extra["plan_price_bdt"] = float(contract.price_bdt)
    extra["subscription_months"] = contract.duration_months
    extra["plan_activated_at"] = now.isoformat()
    extra["plan_expires_at"] = expires_at.isoformat()
    extra["next_billing_date"] = next_billing_date_str
    extra["max_stores"] = contract.max_stores
    extra["max_seats"] = contract.max_seats
    extra["payment_method"] = payment_method
    extra["contract_id"] = str(contract.id)
    extra["contract_code"] = contract.contract_code
    biz.settings_data = extra
    flag_modified(biz, "settings_data")
    db.add(biz)

    # 2b. Synchronize Owner User Account
    owner_user = None
    if extra.get("owner_id"):
        try:
            owner_user = await db.get(User, uuid.UUID(str(extra["owner_id"])))
        except Exception:
            pass
    if not owner_user and biz.id:
        owner_res = await db.execute(
            select(User).where(User.business_id == biz.id)
        )
        owner_user = owner_res.scalars().first()
    if not owner_user and contract.merchant_email:
        owner_res = await db.execute(
            select(User).where(User.email.ilike(contract.merchant_email.strip().lower()))
        )
        owner_user = owner_res.scalars().first()

    if owner_user:
        owner_user.plan = contract.plan_name
        owner_user.ai_quota = contract.message_limit
        db.add(owner_user)

    # 3. Create Official Paid Tax Invoice
    invoice_title = (
        f"{contract.plan_name} ({contract.duration_months} Months Enterprise Term, Ref: {contract.contract_code})"
        if contract.duration_months > 1
        else f"{contract.plan_name} (Ref: {contract.contract_code})"
    )
    tx_code = (
        f"BKH{uuid.uuid4().hex[:8].upper()}"
        if "bkash" in payment_method.lower()
        else (f"NGD{uuid.uuid4().hex[:8].upper()}" if "nagad" in payment_method.lower() else f"ENT-{contract.contract_code}")
    )
    inv = Invoice(
        invoice_no=inv_no,
        merchant_name=biz.name,
        plan_name=invoice_title,
        amount_bdt=float(contract.price_bdt),
        original_amount_bdt=float(contract.price_bdt),
        payment_method=payment_method,
        tx_id=tx_code,
        invoice_date=now.strftime("%Y-%m-%d"),
        status="paid",
        business_id=biz.id,
    )
    db.add(inv)

    await db.commit()
    await db.refresh(contract)
    await db.refresh(biz)
    return contract, biz


async def update_enterprise_contract(
    contract_id: uuid.UUID,
    updates: dict[str, Any],
    db: AsyncSession,
) -> EnterpriseContract | None:
    """Update an existing enterprise contract and synchronize quotas if active."""
    contract = await db.get(EnterpriseContract, contract_id)
    if not contract:
        return None

    if "plan_name" in updates and updates["plan_name"]:
        contract.plan_name = str(updates["plan_name"]).strip()
    if "duration_months" in updates and updates["duration_months"] is not None:
        contract.duration_months = max(1, int(updates["duration_months"]))
    if "price_bdt" in updates and updates["price_bdt"] is not None:
        contract.price_bdt = float(updates["price_bdt"])
    if "message_limit" in updates and updates["message_limit"] is not None:
        contract.message_limit = int(updates["message_limit"])
    if "max_stores" in updates and updates["max_stores"] is not None:
        contract.max_stores = int(updates["max_stores"])
    if "max_seats" in updates and updates["max_seats"] is not None:
        contract.max_seats = int(updates["max_seats"])
    if "valid_until" in updates:
        contract.valid_until = updates["valid_until"] or None
    if "status" in updates and updates["status"]:
        contract.status = str(updates["status"]).strip().lower()
    if "contract_code" in updates and updates["contract_code"]:
        clean_code = re.sub(r"[^A-Z0-9_-]+", "", str(updates["contract_code"]).strip().upper())
        if clean_code:
            contract.contract_code = clean_code
    if "notes" in updates:
        contract.notes = updates["notes"]

    if contract.status == "active" and contract.business_id:
        biz = await db.get(Business, contract.business_id)
        if biz:
            biz.plan = contract.plan_name
            biz.orders_quota = contract.message_limit
            extra = dict(biz.settings_data or {})
            extra["plan"] = contract.plan_name
            extra["plan_price_bdt"] = float(contract.price_bdt)
            extra["subscription_months"] = contract.duration_months
            extra["max_stores"] = contract.max_stores
            extra["max_seats"] = contract.max_seats
            biz.settings_data = extra
            flag_modified(biz, "settings_data")
            db.add(biz)

            # 2b. Synchronize Owner User Account
            owner_user = None
            if extra.get("owner_id"):
                try:
                    owner_user = await db.get(User, uuid.UUID(str(extra["owner_id"])))
                except Exception:
                    pass
            if not owner_user and biz.id:
                owner_res = await db.execute(
                    select(User).where(User.business_id == biz.id)
                )
                owner_user = owner_res.scalars().first()
            if not owner_user and contract.merchant_email:
                owner_res = await db.execute(
                    select(User).where(User.email.ilike(contract.merchant_email.strip().lower()))
                )
                owner_user = owner_res.scalars().first()

            if owner_user:
                owner_user.plan = contract.plan_name
                owner_user.ai_quota = contract.message_limit
                db.add(owner_user)

    db.add(contract)
    await db.commit()
    await db.refresh(contract)
    return contract


async def delete_contract(contract_id: uuid.UUID, db: AsyncSession) -> bool:
    """Delete or cancel an enterprise contract."""
    contract = await db.get(EnterpriseContract, contract_id)
    if not contract:
        return False
    await db.delete(contract)
    await db.commit()
    return True


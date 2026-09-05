"""Super Admin Commercial Subscription Plans & Festival Offers Engine."""
from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.contract_service import (
    list_contracts,
    create_enterprise_contract,
    get_contract_by_code_or_id,
    activate_contract,
    update_enterprise_contract,
    delete_contract,
)
from app.services.plans_service import (
    get_stored_plans,
    create_stored_plan,
    update_stored_plan,
    toggle_stored_plan_status,
    toggle_stored_plan_home,
    delete_stored_plan,
    get_stored_festival_offers,
    create_stored_festival_offer,
    update_stored_festival_offer,
    toggle_stored_festival_offer,
    delete_stored_festival_offer,
)

router = APIRouter(prefix="/admin/plans", tags=["Super Admin Plans"])


# ─── Pydantic Models ──────────────────────────────────────────

class PlanRequest(BaseModel):
    id: str | None = None
    name: str
    nameBn: str | None = None
    tagline: str | None = ""
    priceBDT: float = Field(default=0.0)
    yearlyPriceBDT: float | None = None
    yearlyDiscountPercent: int | None = None
    billingPeriod: str = "both"
    messageLimit: int = 200
    maxStores: int = 1
    maxSeats: int = 1
    catalogLimit: int = 250
    courierChannels: int = 2
    features: list[str] = []
    badge: str | None = None
    popular: bool = False
    activeMerchants: int = 0
    monthlySubscribers: int = 0
    yearlySubscribers: int = 0
    status: str = "active"
    showOnHome: bool = False


class FestivalOfferRequest(BaseModel):
    id: str | None = None
    festivalName: str
    festivalNameBn: str | None = None
    couponCode: str
    discountPercent: int = 20
    bonusMessages: int = 0
    validity: str = "Limited Time Offer"
    active: bool = True
    applicablePlan: str = "all"
    applicablePlanName: str = "All Plans"


# ─── Festival Offers Endpoints (Defined First to Avoid Route Shadowing) ───

@router.get("/festival-offers")
async def list_festival_offers():
    return await get_stored_festival_offers()


@router.post("/festival-offers", status_code=status.HTTP_201_CREATED)
async def create_festival_offer(req: FestivalOfferRequest):
    return await create_stored_festival_offer(req.model_dump())


@router.put("/festival-offers/{offer_id}")
async def update_festival_offer(offer_id: str, req: FestivalOfferRequest):
    updated = await update_stored_festival_offer(offer_id, req.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Festival offer not found")
    return updated


@router.patch("/festival-offers/{offer_id}/toggle")
async def toggle_festival_offer(offer_id: str):
    toggled = await toggle_stored_festival_offer(offer_id)
    if not toggled:
        raise HTTPException(status_code=404, detail="Festival offer not found")
    return toggled


@router.delete("/festival-offers/{offer_id}")
async def delete_festival_offer(offer_id: str):
    success = await delete_stored_festival_offer(offer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Festival offer not found")
    return {"success": True, "message": "Festival offer deleted"}


# ─── Commercial Plans Endpoints ───────────────────────────────

@router.get("")
async def list_plans():
    return await get_stored_plans()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_plan(req: PlanRequest):
    return await create_stored_plan(req.model_dump())


@router.put("/{plan_id}")
async def update_plan(plan_id: str, req: PlanRequest):
    updated = await update_stored_plan(plan_id, req.model_dump())
    if not updated:
        raise HTTPException(status_code=404, detail="Plan not found")
    return updated


@router.patch("/{plan_id}/status")
async def toggle_plan_status(plan_id: str):
    toggled = await toggle_stored_plan_status(plan_id)
    if not toggled:
        raise HTTPException(status_code=404, detail="Plan not found")
    return toggled


@router.patch("/{plan_id}/toggle-home")
async def toggle_plan_home_endpoint(plan_id: str):
    toggled = await toggle_stored_plan_home(plan_id)
    if not toggled:
        raise HTTPException(status_code=404, detail="Plan not found")
    return toggled


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str):
    success = await delete_stored_plan(plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"success": True, "message": "Plan deleted"}


# ─── Enterprise Contracts Endpoints (PostgreSQL Database) ──────

class ContractCreateRequest(BaseModel):
    contract_code: str | None = None
    business_id: str | None = None
    merchant_email: str | None = None
    merchant_name: str | None = None
    plan_name: str = "Custom Enterprise"
    duration_months: int = 1
    price_bdt: float = 0.0
    message_limit: int = 50000
    max_stores: int = 5
    max_seats: int = 20
    features: list[str] | None = None
    valid_until: str | None = None
    payment_method: str | None = "bKash Auto-Debit"
    auto_activate: bool = False
    notes: str | None = None


@router.get("/contracts")
async def list_admin_contracts(
    status: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    """List all enterprise contracts stored in PostgreSQL."""
    contracts = await list_contracts(db, status_filter=status)
    return [
        {
            "id": str(c.id),
            "contract_code": c.contract_code,
            "business_id": str(c.business_id) if c.business_id else None,
            "merchant_email": c.merchant_email,
            "merchant_name": c.merchant_name,
            "plan_name": c.plan_name,
            "duration_months": c.duration_months,
            "price_bdt": float(c.price_bdt),
            "message_limit": c.message_limit,
            "max_stores": c.max_stores,
            "max_seats": c.max_seats,
            "features": c.features or [],
            "valid_until": c.valid_until,
            "activated_at": c.activated_at.isoformat() if c.activated_at else None,
            "expires_at": c.expires_at.isoformat() if c.expires_at else None,
            "status": c.status,
            "payment_method": c.payment_method,
            "invoice_no": c.invoice_no,
            "notes": c.notes,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in contracts
    ]


@router.post("/contracts", status_code=status.HTTP_201_CREATED)
async def create_admin_contract(
    req: ContractCreateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create a new formal enterprise contract or provision directly to a store in PostgreSQL."""
    c = await create_enterprise_contract(req.model_dump(), db)
    return {
        "id": str(c.id),
        "contract_code": c.contract_code,
        "business_id": str(c.business_id) if c.business_id else None,
        "merchant_name": c.merchant_name,
        "merchant_email": c.merchant_email,
        "plan_name": c.plan_name,
        "duration_months": c.duration_months,
        "price_bdt": float(c.price_bdt),
        "message_limit": c.message_limit,
        "max_stores": c.max_stores,
        "max_seats": c.max_seats,
        "features": c.features or [],
        "status": c.status,
        "valid_until": c.valid_until,
        "expires_at": c.expires_at.isoformat() if c.expires_at else None,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.post("/contracts/{contract_id}/activate")
async def activate_admin_contract(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Admin 1-click direct activation of a contract for its assigned store."""
    c = await get_contract_by_code_or_id(contract_id, db)
    if not c:
        raise HTTPException(status_code=404, detail="Contract not found")
    if not c.business_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot activate contract without an assigned store. Please link a store first."
        )
    contract, biz = await activate_contract(c, db, payment_method="Direct Admin Provisioning")
    return {
        "success": True,
        "contract_code": contract.contract_code,
        "business_name": biz.name,
        "plan_name": biz.plan,
        "expires_at": contract.expires_at.isoformat() if contract.expires_at else None,
        "message": f"Successfully activated {contract.plan_name} for {biz.name} ({contract.duration_months} Months)."
    }


class ContractUpdateRequest(BaseModel):
    contract_code: str | None = None
    plan_name: str | None = None
    duration_months: int | None = None
    price_bdt: float | None = None
    message_limit: int | None = None
    max_stores: int | None = None
    max_seats: int | None = None
    valid_until: str | None = None
    status: str | None = None
    notes: str | None = None


@router.put("/contracts/{contract_id}")
async def update_admin_contract(
    contract_id: str,
    req: ContractUpdateRequest,
    db: AsyncSession = Depends(get_db),
):
    """Update an existing enterprise custom plan / contract."""
    try:
        val_uuid = uuid.UUID(contract_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contract ID format")
    updated = await update_enterprise_contract(val_uuid, req.model_dump(exclude_unset=True), db)
    if not updated:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {
        "id": str(updated.id),
        "contract_code": updated.contract_code,
        "plan_name": updated.plan_name,
        "duration_months": updated.duration_months,
        "price_bdt": float(updated.price_bdt),
        "message_limit": updated.message_limit,
        "max_stores": updated.max_stores,
        "max_seats": updated.max_seats,
        "features": updated.features or [],
        "valid_until": updated.valid_until,
        "status": updated.status,
        "created_at": updated.created_at.isoformat() if updated.created_at else None,
    }


@router.delete("/contracts/{contract_id}")
async def delete_admin_contract(
    contract_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Delete or cancel an enterprise contract."""
    try:
        val_uuid = uuid.UUID(contract_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid contract ID format")
    success = await delete_contract(val_uuid, db)
    if not success:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Enterprise contract removed"}



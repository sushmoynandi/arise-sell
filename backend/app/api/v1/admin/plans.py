"""Super Admin Commercial Subscription Plans & Festival Offers Engine."""
from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.plans_service import (
    get_stored_plans,
    create_stored_plan,
    update_stored_plan,
    toggle_stored_plan_status,
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
    catalogLimit: int = 250
    courierChannels: int = 2
    features: list[str] = []
    badge: str | None = None
    popular: bool = False
    activeMerchants: int = 0
    monthlySubscribers: int = 0
    yearlySubscribers: int = 0
    status: str = "active"


class FestivalOfferRequest(BaseModel):
    id: str | None = None
    festivalName: str
    festivalNameBn: str | None = None
    couponCode: str
    discountPercent: int = 20
    bonusMessages: int = 0
    validity: str = "Limited Time Offer"
    active: bool = True


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


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str):
    success = await delete_stored_plan(plan_id)
    if not success:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"success": True, "message": "Plan deleted"}

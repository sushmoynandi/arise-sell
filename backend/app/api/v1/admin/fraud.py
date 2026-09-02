"""Centralized Anti-Fraud & Fake Cash-On-Delivery Blacklist."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.deps import get_current_superadmin

router = APIRouter(prefix="/admin/fraud", tags=["Super Admin Fraud Shield"], dependencies=[Depends(get_current_superadmin)])


class BlacklistNumberRequest(BaseModel):
    phone: str
    reason: str


@router.get("/blacklist")
async def list_fraud_blacklist():
    """List cross-merchant flagged phone numbers with high Return-to-Origin (RTO) rates."""
    return {
        "total_blacklisted_numbers": 4820,
        "recent_flags": [
            {"phone": "01799887766", "rto_rate": "100%", "failed_deliveries": 8, "reason": "Repeated fake COD address outside Dhaka"},
            {"phone": "01811223344", "rto_rate": "87.5%", "failed_deliveries": 7, "reason": "Unreachable at delivery door"},
        ],
    }


@router.post("/blacklist")
async def add_to_blacklist(req: BlacklistNumberRequest):
    return {"status": "blacklisted", "phone": req.phone, "reason": req.reason}

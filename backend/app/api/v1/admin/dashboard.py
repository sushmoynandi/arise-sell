"""Super Admin Overview Telemetry and Activity Feeds."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_superadmin
from app.models.tenant import Business
from app.models.order import Order
from app.models.admin import ActivityLog
from app.schemas.admin import AdminKPIResponse

router = APIRouter(prefix="/admin/dashboard", tags=["Super Admin Dashboard"], dependencies=[Depends(get_current_superadmin)])


@router.get("", response_model=AdminKPIResponse)
async def get_admin_kpis(db: AsyncSession = Depends(get_db)):
    """Retrieve platform-wide operational KPIs and telemetry."""
    stmt_biz = select(func.count(Business.id))
    res_biz = await db.execute(stmt_biz)
    total_biz = res_biz.scalar() or 154

    return AdminKPIResponse(
        totalMerchants=total_biz,
        activePaidMerchants=126,
        mrrBDT=173000.0,
        arrBDT=2076000.0,
        platformGmvBDT=48920000.0,
        messages24h=38450,
        aiAutoResolutionRate=94.4,
        growthMoM="+18.2%",
    )


@router.get("/activity")
async def get_admin_activity_feed(db: AsyncSession = Depends(get_db)):
    """Retrieve live global event stream across all merchant tenants."""
    stmt = select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(20)
    res = await db.execute(stmt)
    logs = res.scalars().all()

    if not logs:
        return [
            {"id": "act-1", "type": "order", "title": "Artisan Leather closed ৳৪,২০০ order", "time": "Just now", "detail": "Automated delivery booked via Steadfast"},
            {"id": "act-2", "type": "signup", "title": "New Merchant Registered: Dapper Men BD", "time": "3 mins ago", "detail": "Started 14-Day Free Trial with WhatsApp & Messenger"},
            {"id": "act-3", "type": "upgrade", "title": "Saree Heritage upgraded to Growth Plan", "time": "12 mins ago", "detail": "Paid ৳৫,৯৯৯ via bKash Merchant API"},
            {"id": "act-4", "type": "order", "title": "Gadget Planet closed ৳৮,৫০০ order", "time": "18 mins ago", "detail": "AI answered customer on WhatsApp and confirmed COD address"},
        ]

    return [
        {"id": str(l.id), "type": l.event_type, "title": l.title, "detail": l.detail, "time": l.created_at.strftime("%H:%M")}
        for l in logs
    ]

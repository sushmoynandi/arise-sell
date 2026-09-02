"""Courier Parcel Lifecycle Status Update Webhooks."""
from __future__ import annotations

from fastapi import APIRouter, Request
from sqlalchemy import select
from app.core.database import async_session_factory
from app.models.order import Order, CourierBooking

router = APIRouter(prefix="/webhooks/courier", tags=["Courier Webhooks"])


@router.post("/steadfast")
async def steadfast_status_webhook(request: Request):
    data = await request.json()
    consignment_id = str(data.get("consignment_id", ""))
    status_text = data.get("status", "").lower()

    if consignment_id:
        async with async_session_factory() as db:
            stmt = select(CourierBooking).where(CourierBooking.consignment == consignment_id)
            res = await db.execute(stmt)
            booking = res.scalar_one_or_none()
            if booking:
                booking.status = status_text
                order_stmt = select(Order).where(Order.id == booking.order_id)
                o_res = await db.execute(order_stmt)
                order = o_res.scalar_one_or_none()
                if order:
                    if status_text in ["delivered", "delivered_approval"]:
                        order.state = "delivered"
                    elif status_text in ["cancelled", "return", "cancelled_approval"]:
                        order.state = "returned"
                await db.commit()

    return {"status": "success", "consignment_id": consignment_id}


@router.post("/pathao")
async def pathao_status_webhook(request: Request):
    data = await request.json()
    consignment_id = str(data.get("consignment_id", ""))
    order_status = data.get("order_status", "").lower()

    if consignment_id:
        async with async_session_factory() as db:
            stmt = select(CourierBooking).where(CourierBooking.consignment == consignment_id)
            res = await db.execute(stmt)
            booking = res.scalar_one_or_none()
            if booking:
                booking.status = order_status
                if "delivered" in order_status:
                    order_stmt = select(Order).where(Order.id == booking.order_id)
                    o_res = await db.execute(order_stmt)
                    order = o_res.scalar_one_or_none()
                    if order:
                        order.state = "delivered"
                await db.commit()

    return {"status": "success", "consignment_id": consignment_id}

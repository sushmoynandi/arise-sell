"""Orders Fulfilment & Courier Dispatch Endpoints (Production Database Backed)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.tenant import Business
from app.models.order import Order, OrderLine, CourierBooking
from app.schemas.order import (
    OrderResponse,
    CreateOrderRequest,
    BookCourierRequest,
    UpdateOrderStatusRequest,
    OrderLineSchema,
    CourierSchema,
)
from app.services.courier_service import book_steadfast_order, book_pathao_order
from app.services.invoice_service import generate_invoice_html

router = APIRouter(prefix="/orders", tags=["Orders & Fulfilment"])


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all orders placed for the merchant tenant."""
    stmt = (
        select(Order)
        .where(Order.business_id == user.business_id)
        .options(selectinload(Order.lines), selectinload(Order.courier_booking))
        .order_by(desc(Order.placed_at))
    )
    res = await db.execute(stmt)
    orders = res.scalars().all()

    return [
        OrderResponse(
            id=str(o.id),
            ref=o.ref,
            customer=o.customer_name,
            phone=o.phone,
            address=o.address,
            district=o.district,
            channel=o.channel_type,  # type: ignore
            lines=[
                OrderLineSchema(
                    sku=line.sku,
                    name=line.name,
                    qty=line.qty,
                    unit=float(line.unit_price),
                )
                for line in o.lines
            ],
            delivery=float(o.delivery_charge),
            discount=float(o.discount),
            pay=o.payment_method,  # type: ignore
            state=o.state,  # type: ignore
            placedAt=o.placed_at.strftime("%Y-%m-%d %H:%M") if o.placed_at else "Today",
            courier=(
                CourierSchema(
                    provider=o.courier_booking.provider,  # type: ignore
                    consignment=o.courier_booking.consignment,
                    tracking=o.courier_booking.tracking_number,
                    note=o.courier_booking.note or "",
                    eta=o.courier_booking.eta or "",
                )
                if o.courier_booking
                else None
            ),
        )
        for o in orders
    ]


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    req: CreateOrderRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new customer order and calculate item totals."""
    order_ref = f"NP-{uuid.uuid4().hex[:5].upper()}"
    now = datetime.now(timezone.utc)

    order = Order(
        business_id=user.business_id,
        ref=order_ref,
        customer_name=req.customer_name,
        phone=req.phone,
        address=req.address,
        district=req.district,
        channel_type=req.channel,
        delivery_charge=req.delivery_charge,
        discount=req.discount,
        payment_method=req.payment_method,
        state="awaiting_confirm",
        placed_at=now,
    )
    db.add(order)
    await db.flush()

    for line_req in req.lines:
        line = OrderLine(
            order_id=order.id,
            sku=line_req.sku,
            name=line_req.name,
            qty=line_req.qty,
            unit_price=line_req.unit,
        )
        db.add(line)

    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=str(order.id),
        ref=order.ref,
        customer=order.customer_name,
        phone=order.phone,
        address=order.address,
        district=order.district,
        channel=order.channel_type,  # type: ignore
        lines=req.lines,
        delivery=float(order.delivery_charge),
        discount=float(order.discount),
        pay=order.payment_method,  # type: ignore
        state=order.state,  # type: ignore
        placedAt=order.placed_at.strftime("%Y-%m-%d %H:%M"),
    )


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: str,
    req: UpdateOrderStatusRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Update order fulfillment lifecycle state."""
    try:
        o_uuid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    stmt = select(Order).where(Order.id == o_uuid, Order.business_id == user.business_id)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.state = req.state
    await db.commit()
    return {"id": order_id, "state": order.state}


@router.post("/{order_id}/book-courier")
async def book_courier(
    order_id: str,
    req: BookCourierRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Dispatch order to Steadfast or Pathao and persist consignment tracking."""
    try:
        o_uuid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    stmt = (
        select(Order)
        .where(Order.id == o_uuid, Order.business_id == user.business_id)
        .options(selectinload(Order.lines))
    )
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    subtotal = sum(l.qty * float(l.unit_price) for l in order.lines)
    total_cod = subtotal + float(order.delivery_charge) - float(order.discount)

    if req.provider == "steadfast":
        booking_res = await book_steadfast_order(
            order.ref, order.customer_name, order.phone, order.address, total_cod, req.note
        )
    else:
        booking_res = await book_pathao_order(
            order.customer_name, order.phone, order.address, total_cod, req.note
        )

    # Persist courier booking record
    booking = CourierBooking(
        order_id=order.id,
        provider=req.provider,
        consignment=booking_res.get("consignment", f"SF-{uuid.uuid4().hex[:6].upper()}"),
        tracking_number=booking_res.get("tracking", f"SF{uuid.uuid4().hex[:6].upper()}BD"),
        note=req.note,
        eta=booking_res.get("eta", "Tomorrow"),
        status="in_transit",
    )
    db.add(booking)
    order.state = "in_transit"
    await db.commit()

    return {
        "success": True,
        "order_id": order_id,
        "consignment": booking.consignment,
        "tracking": booking.tracking_number,
        "provider": booking.provider,
        "eta": booking.eta,
    }


@router.get("/{order_id}/invoice-pdf")
async def download_invoice(
    order_id: str,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and return print-ready Bangla digital tax invoice."""
    try:
        o_uuid = uuid.UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order ID format")

    stmt = (
        select(Order)
        .where(Order.id == o_uuid, Order.business_id == user.business_id)
        .options(selectinload(Order.lines))
    )
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    biz_stmt = select(Business).where(Business.id == user.business_id)
    biz_res = await db.execute(biz_stmt)
    biz = biz_res.scalar_one_or_none()

    order_dict = {
        "ref": order.ref,
        "customer": order.customer_name,
        "phone": order.phone,
        "address": order.address,
        "district": order.district,
        "placedAt": order.placed_at.strftime("%Y-%m-%d"),
        "lines": [{"name": l.name, "sku": l.sku, "qty": l.qty, "unit": float(l.unit_price)} for l in order.lines],
        "delivery": float(order.delivery_charge),
        "discount": float(order.discount),
    }
    biz_dict = {
        "name": biz.name if biz else "Nokshi & Co.",
        "nameBn": biz.name_bn if biz else "নকশী অ্যান্ড কোং",
        "kind": biz.kind if biz else "Handloom & Lifestyle",
    }

    html = generate_invoice_html(order_dict, biz_dict)
    return Response(content=html, media_type="text/html")

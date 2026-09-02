"""Order, Order Lines, and Courier Booking Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field
from .common import Channel, OrderState, CourierProvider, PayMethod


class OrderLineSchema(BaseModel):
    sku: str
    name: str
    qty: int
    unit: float


class CourierSchema(BaseModel):
    provider: CourierProvider
    consignment: str
    tracking: str
    note: str = ""
    eta: str = ""


class OrderResponse(BaseModel):
    id: str
    ref: str
    customer: str
    phone: str
    address: str
    district: str
    channel: Channel
    lines: list[OrderLineSchema]
    delivery: float
    discount: float
    pay: PayMethod
    state: OrderState
    placedAt: str
    courier: CourierSchema | None = None

    model_config = {"from_attributes": True}


class CreateOrderRequest(BaseModel):
    customer_name: str
    phone: str
    address: str
    district: str = "Dhaka"
    channel: Channel = "whatsapp"
    lines: list[OrderLineSchema]
    delivery_charge: float = 80.0
    discount: float = 0.0
    payment_method: PayMethod = "cod"


class BookCourierRequest(BaseModel):
    provider: CourierProvider
    note: str = ""


class UpdateOrderStatusRequest(BaseModel):
    state: OrderState

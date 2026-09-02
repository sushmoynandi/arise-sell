"""Common shared types and generic models for the NextProduct AI API."""
from __future__ import annotations

from typing import Generic, Literal, TypeVar

from pydantic import BaseModel

Channel = Literal["whatsapp", "messenger", "instagram", "web", "telegram"]
Lang = Literal["bn", "banglish", "en"]
Stage = Literal["listening", "matched", "kyc", "confirmed", "shipped", "settled", "lost"]
OrderState = Literal[
    "awaiting_confirm", "confirmed", "packed", "in_transit",
    "delivered", "returned", "cancelled",
]
CourierProvider = Literal["steadfast", "pathao", "redx", "ecourier"]
PayMethod = Literal["cod", "bkash", "nagad", "card"]

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response wrapper."""
    items: list[T]
    total: int
    page: int
    per_page: int
    pages: int


class MessageOut(BaseModel):
    """Simple message response."""
    message: str

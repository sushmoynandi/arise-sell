"""Product Catalog & Variant Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class VariantSchema(BaseModel):
    sku: str
    label: str
    color: str | None = None
    size: str | None = None
    price: float
    stock: int


class ProductResponse(BaseModel):
    id: str
    name: str
    nameBn: str
    category: str
    blurb: str
    price: float
    compareAt: float | None = None
    image: str
    variants: list[VariantSchema]
    tags: list[str]
    visionIndexed: bool
    visionUpdated: str
    soldThisWeek: int

    model_config = {"from_attributes": True}


class CreateProductRequest(BaseModel):
    name: str
    name_bn: str | None = None
    category: str
    blurb: str | None = None
    price: float
    compare_at: float | None = None
    image_url: str
    tags: list[str] = []
    variants: list[VariantSchema] = []


class FeedSyncResponse(BaseModel):
    id: str
    synced_at: str
    products_found: int
    created: int
    updated: int
    out_of_stock: int
    duration_ms: int
    status: str

    model_config = {"from_attributes": True}

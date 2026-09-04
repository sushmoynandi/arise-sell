"""Tenant Info, Team Members, and Settings Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class TenantResponse(BaseModel):
    name: str
    nameBn: str
    kind: str
    since: str
    plan: str
    ordersUsed: int
    ordersQuota: int
    pages: int
    logoHue: int
    slug: str | None = None
    currency: str = "BDT"
    timezone: str = "Asia/Dhaka"
    website: str | None = None
    support_email: str | None = None
    phone: str | None = None
    address: str | None = None
    trade_license: str | None = None
    facebook_url: str | None = None
    instagram_url: str | None = None
    whatsapp_url: str | None = None
    invoice_layout: str = "a4"
    invoice_show_qr: bool = True
    invoice_show_tax: bool = True
    invoice_prefix: str = "NOK-"
    invoice_terms: str | None = None
    invoice_footer: str | None = None
    website_orders_enabled: bool = False
    website_orders_payment_mode: str = "payment_link"
    website_orders_api_url: str | None = None
    website_orders_auth_header: str = "X-API-Key"
    website_orders_api_key: str | None = None
    website_orders_template: str | None = None

    model_config = {"from_attributes": True}


class TeamMemberResponse(BaseModel):
    name: str
    role: str
    initials: str
    online: bool
    hue: int
    platforms: list[str]

    model_config = {"from_attributes": True}


class ChannelResponse(BaseModel):
    id: str
    label: str
    detail: str
    live: bool
    share: int

    model_config = {"from_attributes": True}


class UpdateSettingsRequest(BaseModel):
    name: str | None = None
    name_bn: str | None = None
    kind: str | None = None
    currency: str | None = None
    timezone: str | None = None
    slug: str | None = None
    logo_hue: int | None = None
    website: str | None = None
    support_email: str | None = None
    phone: str | None = None
    address: str | None = None
    trade_license: str | None = None
    facebook_url: str | None = None
    instagram_url: str | None = None
    whatsapp_url: str | None = None
    invoice_layout: str | None = None
    invoice_show_qr: bool | None = None
    invoice_show_tax: bool | None = None
    invoice_prefix: str | None = None
    invoice_terms: str | None = None
    invoice_footer: str | None = None
    website_orders_enabled: bool | None = None
    website_orders_payment_mode: str | None = None
    website_orders_api_url: str | None = None
    website_orders_auth_header: str | None = None
    website_orders_api_key: str | None = None
    website_orders_template: str | None = None

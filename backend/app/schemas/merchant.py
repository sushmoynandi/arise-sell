"""Tenant Info, Team Members, and Settings Schemas."""
from __future__ import annotations

from typing import Optional, Any
from pydantic import BaseModel, ConfigDict, EmailStr


class SetupTaskItem(BaseModel):
    id: str
    title: str
    hint: str
    href: str
    completed: bool


class SetupChecklistResponse(BaseModel):
    total: int = 3
    completed: int = 1
    is_complete: bool = False
    tasks: list[SetupTaskItem] = []


class NotificationItem(BaseModel):
    id: str
    title: str
    body: str
    time: str
    unread: bool = True
    type: str = "admin"  # "admin" | "system" | "courier"


class TenantResponse(BaseModel):
    model_config = ConfigDict(extra="allow", from_attributes=True)

    has_store: bool = True
    name: str
    nameBn: str
    kind: str
    since: str
    plan: str
    ordersUsed: int
    ordersQuota: int
    messagesUsed: int = 0
    messagesQuota: int = 500
    remainingQuota: int = 500
    remainingPercent: int = 100
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
    setup_checklist: SetupChecklistResponse | None = None
    planPriceBDT: float | None = None
    maxStores: int | None = None
    maxSeats: int | None = None
    currentStoresCount: int | None = None
    currentSeatsCount: int | None = None
    nextBillingDate: str | None = None
    paymentMethod: str | None = None
    signalsCount: int | None = 0
    signalsLimit: int | None = 10000
    is_frozen: bool = False



class TeamMemberResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    initials: str
    online: bool = True
    hue: int = 82
    platforms: list[str] = []
    permissions: list[str] = []
    is_owner: bool = False
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class InviteTeamMemberRequest(BaseModel):
    name: str
    email: EmailStr
    role: str = "Moderator"
    channels: list[str] = ["Messenger", "WhatsApp", "Instagram"]
    permissions: list[str] = ["chat", "orders"]


class UpdateTeamMemberRequest(BaseModel):
    name: str | None = None
    role: str | None = None
    channels: list[str] | None = None
    permissions: list[str] | None = None


class StoreWorkspaceItem(BaseModel):
    id: str
    name: str
    slug: str
    plan: str
    role: str
    is_owner: bool
    owner_name: str
    plan_covered_by_owner: bool = False
    is_active: bool = False
    is_frozen: bool = False
    channels_count: int = 1
    permissions: list[str] = []
    max_stores: int = 1
    maxStores: int = 1


class SwitchStoreRequest(BaseModel):
    store_id: str


class ToggleStoreFreezeRequest(BaseModel):
    swap_with_store_id: str | None = None


class ChannelResponse(BaseModel):
    id: str
    label: str
    detail: str
    live: bool
    share: int

    model_config = {"from_attributes": True}


class UpdateSettingsRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

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


class CreateStoreRequest(BaseModel):
    model_config = ConfigDict(extra="allow")

    name: str
    name_bn: str | None = None
    plan: str | None = None
    kind: str | None = None
    tagline: str | None = None
    website: str | None = None
    support_email: str | None = None
    phone: str | None = None
    whatsapp_number: str | None = None
    address: str | None = None
    city_division: str | None = None
    postal_code: str | None = None
    trade_license: str | None = None
    currency: str = "BDT"
    timezone: str = "Asia/Dhaka"
    date_format: str = "DD/MM/YYYY"
    tax_mode: str = "inclusive_75"
    order_prefix: str = "ORD-"
    is_open_for_orders: bool = True
    schedule_mode: str = "custom"
    open_time: str = "09:00 AM"
    close_time: str = "10:00 PM"
    weekly_off_day: str = "None (Open 7 Days)"
    enable_away_msg: bool = True
    away_message: str | None = None


class DeleteStoreRequest(BaseModel):
    confirm_phrase: str
    password: str | None = None


class DeleteStoreResponse(BaseModel):
    model_config = ConfigDict(extra="allow")

    success: bool = True
    deleted_store_name: str
    message: str = "Store and all associated channels, products, and customer conversations have been permanently deleted."
    new_store_created: bool = False
    active_store_name: str | None = None
    active_store_id: str | None = None

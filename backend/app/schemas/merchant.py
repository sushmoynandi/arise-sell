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

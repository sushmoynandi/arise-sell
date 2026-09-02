"""Super Admin Master Entity Schemas."""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class AdminMerchantResponse(BaseModel):
    id: str
    storeName: str
    ownerName: str
    email: str
    phone: str
    city: str
    plan: str
    planName: str
    status: str
    joinedDate: str
    catalogItems: int
    monthlyGMV: float
    totalOrders: int
    aiResolutionRate: float
    channels: list[str]
    courier: str
    lastActive: str

    model_config = {"from_attributes": True}


class AdminKPIResponse(BaseModel):
    totalMerchants: int
    activePaidMerchants: int
    mrrBDT: float
    arrBDT: float
    platformGmvBDT: float
    messages24h: int
    aiAutoResolutionRate: float
    growthMoM: str

    model_config = {"from_attributes": True}


class AIProviderKeyResponse(BaseModel):
    id: str
    provider: str
    providerName: str
    model: str
    keyMasked: str
    role: str
    status: str
    latencyMs: int
    requests24h: int
    tokensConsumed: int
    costUSD: float
    costBDT: float
    lastPing: str

    model_config = {"from_attributes": True}


class CourierGatewayResponse(BaseModel):
    id: str
    courierName: str
    code: str
    apiKeyMasked: str
    secretMasked: str
    status: str
    defaultCoverage: str
    autoRoutingRule: str
    avgLatencyMs: int
    totalBookings: int
    successRate: float

    model_config = {"from_attributes": True}


class MetaAppResponse(BaseModel):
    id: str
    appName: str
    wabaId: str
    phoneNumberId: str
    graphVersion: str
    tokenMasked: str
    status: str
    tokenExpiresIn: str
    webhookStatus: str
    throughput24h: int

    model_config = {"from_attributes": True}


class SupportTicketResponse(BaseModel):
    id: str
    ticketNo: str
    merchantName: str
    merchantEmail: str
    subject: str
    category: str
    priority: str
    status: str
    createdAt: str
    reportedChatSnippet: dict[str, Any | None] = None

    model_config = {"from_attributes": True}


class BackupResponse(BaseModel):
    id: str
    name: str
    type: str
    sizeMB: float
    timestamp: str
    status: str
    checksum: str

    model_config = {"from_attributes": True}

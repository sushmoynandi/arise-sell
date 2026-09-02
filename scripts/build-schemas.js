const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'backend', 'app', 'schemas');
fs.mkdirSync(baseDir, { recursive: true });

const files = {
  'order.py': `"""Order, Order Lines, and Courier Booking Schemas."""
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
    courier: Optional[CourierSchema] = None

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
`,

  'product.py': `"""Product Catalog & Variant Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class VariantSchema(BaseModel):
    sku: str
    label: str
    color: Optional[str] = None
    size: Optional[str] = None
    price: float
    stock: int


class ProductResponse(BaseModel):
    id: str
    name: str
    nameBn: str
    category: str
    blurb: str
    price: float
    compareAt: Optional[float] = None
    image: str
    variants: list[VariantSchema]
    tags: list[str]
    visionIndexed: bool
    visionUpdated: str
    soldThisWeek: int

    model_config = {"from_attributes": True}


class CreateProductRequest(BaseModel):
    name: str
    name_bn: Optional[str] = None
    category: str
    blurb: Optional[str] = None
    price: float
    compare_at: Optional[float] = None
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
`,

  'brain.py': `"""Knowledge Base, AI Persona, Guardrails, and Eval Schemas."""
from __future__ import annotations

from typing import Any, Optional
from pydantic import BaseModel


class PersonaResponse(BaseModel):
    voice: str
    signature: str
    replyWindow: str
    emojiBudget: str

    model_config = {"from_attributes": True}


class GuardrailResponse(BaseModel):
    id: str
    rule: str
    severity: str
    fires: int
    label: str

    model_config = {"from_attributes": True}


class KnowledgeResponse(BaseModel):
    id: str
    topic: str
    entries: int
    updated: str
    sample: str

    model_config = {"from_attributes": True}


class EvalMetricSchema(BaseModel):
    label: str
    now: float
    before: float
    goal: float
    unit: str


class EvalFailureSchema(BaseModel):
    id: str
    set: str
    input: str
    why: str
    severity: str


class EvalSuiteResponse(BaseModel):
    lastRun: str
    model: str
    cases: int
    passed: int
    duration: str
    metrics: list[EvalMetricSchema]
    failures: list[EvalFailureSchema]

    model_config = {"from_attributes": True}


class UpdatePersonaRequest(BaseModel):
    voice: str
    signature: str
    reply_window: str
    emoji_budget: str


class CreateKnowledgeRequest(BaseModel):
    topic: str
    content: str
    sample: Optional[str] = None
`,

  'campaign.py': `"""Campaigns, Comment Rules, and Playbooks Schemas."""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field
from .common import Channel


class CampaignResponse(BaseModel):
    id: str
    name: str
    segment: str
    channel: Channel
    audience: int
    delivered: int
    replied: int
    orders: int
    revenue: float
    state: Literal["running", "scheduled", "done", "draft"]
    window: str

    model_config = {"from_attributes": True}


class PlaybookResponse(BaseModel):
    id: str
    name: str
    when_condition: str = Field(serialization_alias="when")
    then_action: str = Field(serialization_alias="then")
    runs: int
    orders: int
    live: bool

    model_config = {"from_attributes": True, "populate_by_name": True}


class CommentRuleResponse(BaseModel):
    id: str
    trigger: str
    reply: str
    fired: int
    converted: int
    live: bool

    model_config = {"from_attributes": True}


class CreateCommentRuleRequest(BaseModel):
    trigger: str
    reply: str
    dm_template: Optional[str] = None
`,

  'pipeline.py': `"""Sales Pipeline Kanban Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel
from .common import Channel, Stage


class ProposalSchema(BaseModel):
    to: Stage
    why: str


class PipelineCardResponse(BaseModel):
    id: str
    customer: str
    channel: Channel
    stage: Stage
    product: str
    value: float
    confidence: float
    waitingOn: Optional[str] = None
    ageMins: int
    proposal: Optional[ProposalSchema] = None

    model_config = {"from_attributes": True}


class UpdateStageRequest(BaseModel):
    stage: Stage
    confirmed: bool = True
`,

  'automation.py': `"""Automation Rules and Meta CAPI Event Schemas."""
from __future__ import annotations

from typing import Any, Literal
from pydantic import BaseModel


class AutomationRuleResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    trigger_type: str
    action_type: str
    category: str
    is_active: bool
    run_count: int

    model_config = {"from_attributes": True}


class CapiEventResponse(BaseModel):
    id: str
    name: Literal["Lead", "IntentQualified", "Purchase"]
    ref: str
    value: float
    match: float
    state: Literal["sent", "queued", "dropped"]
    at: str

    model_config = {"from_attributes": True}


class CreateAutomationRequest(BaseModel):
    name: str
    description: Optional[str] = None
    trigger_type: str
    trigger_config: dict[str, Any] = {}
    action_type: str
    action_config: dict[str, Any] = {}
    category: str = "general"
`,

  'merchant.py': `"""Tenant Info, Team Members, and Settings Schemas."""
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
    name: Optional[str] = None
    name_bn: Optional[str] = None
    kind: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None
`,

  'billing.py': `"""Billing, Subscriptions, and Invoices Schemas."""
from __future__ import annotations

from typing import Optional
from pydantic import BaseModel
from .common import PayMethod


class PlanResponse(BaseModel):
    id: str
    name: str
    nameBn: str
    tagline: str
    priceBDT: float
    features: list[str]
    badge: Optional[str] = None
    popular: bool = False

    model_config = {"from_attributes": True}


class InvoiceResponse(BaseModel):
    id: str
    merchantName: str
    plan: str
    amountBDT: float
    method: str
    txId: str
    date: str
    status: str

    model_config = {"from_attributes": True}


class TopUpRequest(BaseModel):
    pack: str
    payment_method: PayMethod = "bkash"
`,

  'admin.py': `"""Super Admin Master Entity Schemas."""
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
    reportedChatSnippet: Optional[dict[str, Any]] = None

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
`,

  '__init__.py': `"""Re-export all schemas."""
from app.schemas.common import (
    Channel,
    Lang,
    Stage,
    OrderState,
    CourierProvider,
    PayMethod,
    PaginatedResponse,
    MessageOut,
)
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    UserBrief,
    TokenResponse,
    RefreshRequest,
    GoogleAuthRequest,
)
from app.schemas.thread import (
    AttachmentSchema,
    ActionSchema,
    MessageSchema,
    ThreadResponse,
    ThreadListItem,
    SendMessageRequest,
    TakeoverRequest,
)
from app.schemas.order import (
    OrderLineSchema,
    CourierSchema,
    OrderResponse,
    CreateOrderRequest,
    BookCourierRequest,
    UpdateOrderStatusRequest,
)
from app.schemas.product import (
    VariantSchema,
    ProductResponse,
    CreateProductRequest,
    FeedSyncResponse,
)
from app.schemas.brain import (
    PersonaResponse,
    GuardrailResponse,
    KnowledgeResponse,
    EvalMetricSchema,
    EvalFailureSchema,
    EvalSuiteResponse,
    UpdatePersonaRequest,
    CreateKnowledgeRequest,
)
from app.schemas.campaign import (
    CampaignResponse,
    PlaybookResponse,
    CommentRuleResponse,
    CreateCommentRuleRequest,
)
from app.schemas.pipeline import (
    ProposalSchema,
    PipelineCardResponse,
    UpdateStageRequest,
)
from app.schemas.automation import (
    AutomationRuleResponse,
    CapiEventResponse,
    CreateAutomationRequest,
)
from app.schemas.merchant import (
    TenantResponse,
    TeamMemberResponse,
    ChannelResponse,
    UpdateSettingsRequest,
)
from app.schemas.billing import (
    PlanResponse,
    InvoiceResponse,
    TopUpRequest,
)
from app.schemas.admin import (
    AdminMerchantResponse,
    AdminKPIResponse,
    AIProviderKeyResponse,
    CourierGatewayResponse,
    MetaAppResponse,
    SupportTicketResponse,
    BackupResponse,
)

__all__ = [
    "Channel",
    "Lang",
    "Stage",
    "OrderState",
    "CourierProvider",
    "PayMethod",
    "PaginatedResponse",
    "MessageOut",
    "RegisterRequest",
    "LoginRequest",
    "UserBrief",
    "TokenResponse",
    "RefreshRequest",
    "GoogleAuthRequest",
    "AttachmentSchema",
    "ActionSchema",
    "MessageSchema",
    "ThreadResponse",
    "ThreadListItem",
    "SendMessageRequest",
    "TakeoverRequest",
    "OrderLineSchema",
    "CourierSchema",
    "OrderResponse",
    "CreateOrderRequest",
    "BookCourierRequest",
    "UpdateOrderStatusRequest",
    "VariantSchema",
    "ProductResponse",
    "CreateProductRequest",
    "FeedSyncResponse",
    "PersonaResponse",
    "GuardrailResponse",
    "KnowledgeResponse",
    "EvalMetricSchema",
    "EvalFailureSchema",
    "EvalSuiteResponse",
    "UpdatePersonaRequest",
    "CreateKnowledgeRequest",
    "CampaignResponse",
    "PlaybookResponse",
    "CommentRuleResponse",
    "CreateCommentRuleRequest",
    "ProposalSchema",
    "PipelineCardResponse",
    "UpdateStageRequest",
    "AutomationRuleResponse",
    "CapiEventResponse",
    "CreateAutomationRequest",
    "TenantResponse",
    "TeamMemberResponse",
    "ChannelResponse",
    "UpdateSettingsRequest",
    "PlanResponse",
    "InvoiceResponse",
    "TopUpRequest",
    "AdminMerchantResponse",
    "AdminKPIResponse",
    "AIProviderKeyResponse",
    "CourierGatewayResponse",
    "MetaAppResponse",
    "SupportTicketResponse",
    "BackupResponse",
]
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(baseDir, filename), content, 'utf8');
  console.log('Created schema:', filename);
}

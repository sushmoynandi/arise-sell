export type MerchantStatus = "active" | "trial" | "suspended" | "expired";
export type PlanTier =
  | "starter"
  | "growth"
  | "scale"
  | "business"
  | "vip_scale"
  | "enterprise"
  | "free_trial"
  | "eid_promo"
  | (string & {});

export type AdminMerchant = {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  plan: PlanTier;
  planName: string;
  status: MerchantStatus;
  joinedDate: string;
  catalogItems: number;
  monthlyGMV: number;
  totalOrders: number;
  aiResolutionRate: number;
  channels: ("whatsapp" | "messenger" | "instagram" | "web")[];
  courier: "steadfast" | "pathao" | "redx" | "none";
  lastActive: string;
  customTokenLimit?: number;
  dedicatedAiProvider?: string;
};

export const ADMIN_KPI = {
  totalMerchants: 154,
  activePaidMerchants: 126, // 44 Growth + 56 Business Pro + 20 VIP Scale + 6 Custom Enterprise
  trialMerchants: 28,
  customEnterpriseMerchants: 6,
  suspendedMerchants: 0,
  mrrBDT: 173000, // 44×৳200 (8.8k) + 56×৳700 (39.2k) + 20×৳2500 (50k) + 6 Custom (75k) = ৳1,73,000/mo
  arrBDT: 2076000, // ৳1,73,000 × 12 = ৳20,76,000 ARR
  platformGmvBDT: 48920000, // ~4.89 Crore BDT GMV
  messages24h: 38450,
  aiAutoResolutionRate: 94.4,
  courierBookingsTotal: 29410,
  growthMoM: "+18.2%",
};

export type AiProviderKey = {
  id: string;
  provider:
    | "google"
    | "agentrouter"
    | "openrouter"
    | "openai"
    | "anthropic"
    | "deepseek"
    | "groq"
    | "custom";
  providerName: string;
  model: string;
  keyMasked: string;
  rawKey?: string;
  role: "primary" | "fallback_1" | "fallback_2" | "fallback_3" | "standby";
  status: "active" | "standby" | "rate_limited" | "depleted" | "degraded";
  latencyMs: number;
  requests24h: number;
  tokensConsumed: number;
  costUSD: number;
  costBDT: number;
  lastPing: string;
};

export const INITIAL_AI_KEYS: AiProviderKey[] = [
  {
    id: "ai-key-1",
    provider: "google",
    providerName: "Google Gemini",
    model: "gemini-2.0-flash",
    keyMasked: "AIzaSyD...9kX2",
    role: "primary",
    status: "active",
    latencyMs: 380,
    requests24h: 24800,
    tokensConsumed: 14200000,
    costUSD: 4.82,
    costBDT: 580,
    lastPing: "Just now (Operational)",
  },
  {
    id: "ai-key-2",
    provider: "openai",
    providerName: "OpenAI",
    model: "gpt-4o-mini",
    keyMasked: "sk-proj-...8aF9",
    role: "fallback_1",
    status: "standby",
    latencyMs: 640,
    requests24h: 9200,
    tokensConsumed: 6400000,
    costUSD: 6.2,
    costBDT: 745,
    lastPing: "2 mins ago (Standby Ready)",
  },
  {
    id: "ai-key-3",
    provider: "anthropic",
    providerName: "Anthropic Claude",
    model: "claude-3-5-haiku-20241022",
    keyMasked: "sk-ant-...4nQ1",
    role: "fallback_2",
    status: "standby",
    latencyMs: 720,
    requests24h: 3100,
    tokensConsumed: 2100000,
    costUSD: 5.1,
    costBDT: 612,
    lastPing: "5 mins ago (Standby Ready)",
  },
  {
    id: "ai-key-4",
    provider: "deepseek",
    providerName: "DeepSeek",
    model: "deepseek-chat (V3)",
    keyMasked: "sk-ds-...99b2",
    role: "fallback_3",
    status: "standby",
    latencyMs: 890,
    requests24h: 1350,
    tokensConsumed: 1200000,
    costUSD: 0.9,
    costBDT: 108,
    lastPing: "12 mins ago (Standby Ready)",
  },
  {
    id: "ai-key-5",
    provider: "groq",
    providerName: "Groq Cloud",
    model: "llama-3.3-70b-versatile",
    keyMasked: "gsk_...77aP",
    role: "standby",
    status: "standby",
    latencyMs: 210,
    requests24h: 0,
    tokensConsumed: 0,
    costUSD: 0.0,
    costBDT: 0,
    lastPing: "1 hour ago (Standby Ready)",
  },
];

export type CourierGateway = {
  id: string;
  courierName: string;
  code: "steadfast" | "pathao" | "redx" | "ecourier";
  apiKeyMasked: string;
  secretMasked: string;
  status: "active" | "standby" | "maintenance";
  defaultCoverage: string;
  autoRoutingRule: string;
  avgLatencyMs: number;
  totalBookings: number;
  successRate: number;
};

export const INITIAL_COURIERS: CourierGateway[] = [
  {
    id: "cr-1",
    courierName: "Steadfast Courier Ltd",
    code: "steadfast",
    apiKeyMasked: "stdf_live_...98x",
    secretMasked: "sec_...44k",
    status: "active",
    defaultCoverage: "Nationwide (Outside Dhaka + Sub-districts)",
    autoRoutingRule: "Route all Outside Dhaka & Cash-On-Delivery to Steadfast",
    avgLatencyMs: 410,
    totalBookings: 21480,
    successRate: 98.8,
  },
  {
    id: "cr-2",
    courierName: "Pathao Courier",
    code: "pathao",
    apiKeyMasked: "pth_live_...77q",
    secretMasked: "sec_...99z",
    status: "active",
    defaultCoverage: "Dhaka Metro (Same-day & Next-day Express)",
    autoRoutingRule: "Route all Dhaka Metro deliveries to Pathao Express",
    avgLatencyMs: 520,
    totalBookings: 7120,
    successRate: 97.9,
  },
  {
    id: "cr-3",
    courierName: "RedX Logistics",
    code: "redx",
    apiKeyMasked: "rdx_live_...22p",
    secretMasked: "sec_...11m",
    status: "standby",
    defaultCoverage: "Backup Failover Gateway",
    autoRoutingRule:
      "Trigger automatically if Steadfast API is down (>2m timeout)",
    avgLatencyMs: 680,
    totalBookings: 810,
    successRate: 96.5,
  },
];

export type MetaAppConfig = {
  id: string;
  appName: string;
  wabaId: string;
  phoneNumberId: string;
  graphVersion: string;
  tokenMasked: string;
  status: "active" | "warning" | "expired";
  tokenExpiresIn: string;
  webhookStatus: "verified" | "error";
  throughput24h: number;
};

export const INITIAL_META_APPS: MetaAppConfig[] = [
  {
    id: "meta-app-1",
    appName: "NextProduct AI Production WABA",
    wabaId: "109827364519283",
    phoneNumberId: "102938475610293",
    graphVersion: "v21.0",
    tokenMasked: "EAAG...89bZ",
    status: "active",
    tokenExpiresIn: "Never (Permanent System User Token)",
    webhookStatus: "verified",
    throughput24h: 38450,
  },
  {
    id: "meta-app-2",
    appName: "Messenger & Instagram Direct Gateway",
    wabaId: "998877665544332",
    phoneNumberId: "887766554433221",
    graphVersion: "v21.0",
    tokenMasked: "EAAG...33qL",
    status: "active",
    tokenExpiresIn: "Never (Permanent System User Token)",
    webhookStatus: "verified",
    throughput24h: 18200,
  },
];

export type AdminPlan = {
  id: string;
  name: string;
  nameBn: string;
  tagline: string;
  priceBDT: number;
  yearlyPriceBDT?: number;
  yearlyDiscountPercent?: number;
  billingPeriod: "monthly" | "yearly" | "both";
  messageLimit: number;
  catalogLimit: number;
  courierChannels: number;
  features: string[];
  badge?: string;
  popular?: boolean;
  activeMerchants: number;
  monthlySubscribers?: number;
  yearlySubscribers?: number;
  status: "active" | "archived" | "draft";
};

export const INITIAL_ADMIN_PLANS: AdminPlan[] = [
  {
    id: "plan-free",
    name: "Free Trial",
    nameBn: "ফ্রি শুরু",
    tagline: "Prove it on your own catalog before paying anything",
    priceBDT: 0,
    yearlyPriceBDT: 0,
    yearlyDiscountPercent: 0,
    billingPeriod: "both",
    messageLimit: 40,
    catalogLimit: 50,
    courierChannels: 1,
    features: [
      "40 Messages / month (Comment + Inbox)",
      "1 channel (Messenger or WhatsApp)",
      "Bangla · Banglish · English AI agent",
      "Photo → product vision matching",
      "In-chat automated order taking",
    ],
    activeMerchants: 28,
    monthlySubscribers: 28,
    yearlySubscribers: 0,
    status: "active",
  },
  {
    id: "plan-growth",
    name: "Growth",
    nameBn: "গ্রোথ",
    tagline: "For growing Facebook & WhatsApp shops with daily orders",
    priceBDT: 200,
    yearlyPriceBDT: 2000,
    yearlyDiscountPercent: 17,
    billingPeriod: "both",
    messageLimit: 200,
    catalogLimit: 250,
    courierChannels: 2,
    badge: "Best for Starters",
    features: [
      "200 Messages / month (Comment + Inbox)",
      "WhatsApp & Facebook Messenger connected",
      "Steadfast & Pathao 1-click booking",
      "Branded Bangla digital invoices",
      "Comment → DM auto-reply",
      "2 team member seats",
    ],
    activeMerchants: 44,
    monthlySubscribers: 32,
    yearlySubscribers: 12,
    status: "active",
  },
  {
    id: "plan-business",
    name: "Business Pro",
    nameBn: "বিজনেস প্রো",
    tagline: "For scaling multi-channel brands running paid traffic",
    priceBDT: 700,
    yearlyPriceBDT: 7000,
    yearlyDiscountPercent: 17,
    billingPeriod: "both",
    messageLimit: 800,
    catalogLimit: 1000,
    courierChannels: 2,
    popular: true,
    badge: "Most Popular",
    features: [
      "800 Messages / month (Comment + Inbox)",
      "All channels: WhatsApp, Messenger, Instagram, Web",
      "Multi-courier smart auto-routing & failover",
      "WhatsApp broadcast campaigns & promos",
      "Meta CAPI server-side ad attribution",
      "5 team member seats",
    ],
    activeMerchants: 56,
    monthlySubscribers: 38,
    yearlySubscribers: 18,
    status: "active",
  },
  {
    id: "plan-vip-scale",
    name: "VIP Scale",
    nameBn: "ভিআইপি স্কেল",
    tagline: "For established retail powerhouses with massive volume",
    priceBDT: 2500,
    yearlyPriceBDT: 25000,
    yearlyDiscountPercent: 17,
    billingPeriod: "both",
    messageLimit: 3500,
    catalogLimit: 5000,
    courierChannels: 4,
    badge: "Unlimited Scale",
    features: [
      "3,500 Messages / month (Comment + Inbox)",
      "Unlimited pages, numbers & consoles",
      "Private custom AI model & dedicated failover",
      "Custom ERP / POS API & webhooks",
      "Dedicated account manager & 24/7 priority SLA",
      "Unlimited team seats",
    ],
    activeMerchants: 20,
    monthlySubscribers: 14,
    yearlySubscribers: 6,
    status: "active",
  },
];

export const SUPPORT_INBOX_STORAGE_KEY = "nextproduct-support-inbox";

export type SupportMessage = {
  id: string;
  from: "merchant" | "admin";
  body: string;
  at: string;
};

export type SupportTicket = {
  id: string;
  ticketNo: string;
  merchantName: string;
  merchantEmail: string;
  subject: string;
  category: "ai_correction" | "courier_sync" | "billing" | "integration";
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  reportedChatSnippet?: {
    customerMsg: string;
    aiResponse: string;
    issueDescription: string;
    suggestedFix: string;
  };
  messages?: SupportMessage[];
  attachments?: { name: string; size: number }[];
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
};

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "t-1",
    ticketNo: "TCK-4821",
    merchantName: "Saree Heritage BD",
    merchantEmail: "nusrat@sareeheritage.bd",
    subject: "AI bot offered 20% discount on Jamdani instead of 10%",
    category: "ai_correction",
    priority: "high",
    status: "open",
    reportedChatSnippet: {
      customerMsg: "আপনাদের জামদানি শাড়িতে কি কোনো ডিসকাউন্ট আছে?",
      aiResponse:
        "জি আপু! আমাদের সকল প্রিমিয়াম জামদানি শাড়িতে এই সপ্তাহে ফ্ল্যাট ২০% বিশেষ ছাড় চলছে।",
      issueDescription:
        "Jamdani Saree should have maximum 10% discount cap. Bot hallucinated 20%.",
      suggestedFix:
        "Set strict prompt rule: Jamdani Saree max discount is 10% code: EID10.",
    },
    messages: [
      {
        id: "t-1-m-1",
        from: "merchant",
        body: "The bot is promising 20% off on Jamdani. Please check this urgently.",
        at: "15 mins ago",
      },
      {
        id: "t-1-m-2",
        from: "admin",
        body: "Thanks for reporting this. We are checking the catalog rule now.",
        at: "12 mins ago",
      },
    ],
    createdAt: "15 mins ago",
  },
  {
    id: "t-2",
    ticketNo: "TCK-4820",
    merchantName: "Artisan Leather Dhaka",
    merchantEmail: "rahim@artisanleather.com.bd",
    subject: "Steadfast courier auto-booking failed for order #1240",
    category: "courier_sync",
    priority: "medium",
    status: "open",
    createdAt: "1 hour ago",
    reportedChatSnippet: {
      customerMsg: "আমার ঠিকানা: বাসা ১২, রোড ৪, ব্লক সি, বনশ্রী, ঢাকা",
      aiResponse:
        "আপনার অর্ডার কনফার্ম করা হয়েছে। Steadfast পার্সেল ট্র্যাকিং কোড পাঠানো হবে।",
      issueDescription:
        "Steadfast API returned temporary 504 timeout on address submit.",
      suggestedFix:
        "Trigger 1-click retry to dispatch order to Pathao Courier instead.",
    },
  },
  {
    id: "t-3",
    ticketNo: "TCK-4819",
    merchantName: "Gadget Planet Banani",
    merchantEmail: "tanvir@gadgetplanet.shop",
    subject: "Monthly bKash recurring invoice receipt download request",
    category: "billing",
    priority: "low",
    status: "resolved",
    createdAt: "Yesterday",
    resolvedAt: "Yesterday at 6:40 PM",
    adminNotes:
      "Sent official PDF receipt with TxID BKH91827364 to merchant email.",
  },
  {
    id: "t-4",
    ticketNo: "TCK-4818",
    merchantName: "Bengal Botanica",
    merchantEmail: "hello@bengalbotanica.bd",
    subject: "Instagram comments are not reaching the shared inbox",
    category: "integration",
    priority: "medium",
    status: "in_progress",
    createdAt: "Today, 10:12 AM",
    messages: [
      {
        id: "t-4-m-1",
        from: "merchant",
        body: "Our Instagram product comments stopped appearing in the Reach inbox this morning.",
        at: "Today, 10:12 AM",
      },
      {
        id: "t-4-m-2",
        from: "admin",
        body: "We found a paused webhook subscription and are reconnecting the page now.",
        at: "Today, 10:18 AM",
      },
    ],
  },
  {
    id: "t-5",
    ticketNo: "TCK-4817",
    merchantName: "Taant House",
    merchantEmail: "ops@taanthouse.com.bd",
    subject: "AI confirmed an out-of-stock Nakshi cushion",
    category: "ai_correction",
    priority: "high",
    status: "open",
    createdAt: "Today, 9:45 AM",
    reportedChatSnippet: {
      customerMsg: "এই নকশি কুশনটা কি এখন অর্ডার করা যাবে?",
      aiResponse: "জি, আপনার জন্য নকশি কুশনটি অর্ডারে যোগ করে দিচ্ছি।",
      issueDescription:
        "The SKU was marked out of stock in the catalog, but the agent confirmed it anyway.",
      suggestedFix:
        "Never confirm an order when available stock is zero; offer the next available variant instead.",
    },
    messages: [
      {
        id: "t-5-m-1",
        from: "merchant",
        body: "This is a serious stock mismatch. The bot confirmed a product that has zero inventory.",
        at: "Today, 9:45 AM",
      },
    ],
  },
];

export type BackupSnapshot = {
  id: string;
  name: string;
  type: "postgres_db" | "vector_embeddings" | "redis_state" | "full_system";
  sizeMB: number;
  timestamp: string;
  status: "verified" | "in_progress" | "archived";
  checksum: string;
};

export const INITIAL_BACKUPS: BackupSnapshot[] = [
  {
    id: "bk-1",
    name: "Automated Daily Snapshot - Platform DB",
    type: "postgres_db",
    sizeMB: 480.2,
    timestamp: "2026-08-31 04:00 AM BST",
    status: "verified",
    checksum: "sha256:9a8b7c6d...33e1",
  },
  {
    id: "bk-2",
    name: "Catalog Vector Embeddings (pgvector)",
    type: "vector_embeddings",
    sizeMB: 1240.8,
    timestamp: "2026-08-31 04:15 AM BST",
    status: "verified",
    checksum: "sha256:5f4e3d2c...88f9",
  },
  {
    id: "bk-3",
    name: "Redis Conversation Session Cache",
    type: "redis_state",
    sizeMB: 64.5,
    timestamp: "2026-08-31 04:30 AM BST",
    status: "verified",
    checksum: "sha256:11223344...aabb",
  },
];

export const ADMIN_MERCHANTS: AdminMerchant[] = [
  {
    id: "m-101",
    storeName: "Artisan Leather Dhaka",
    ownerName: "Rahim Chowdhury",
    email: "rahim@artisanleather.com.bd",
    phone: "+880 1711-234567",
    city: "Dhaka (Gulshan)",
    plan: "scale",
    planName: "Scale Plan (৳৯,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-04-12",
    catalogItems: 142,
    monthlyGMV: 840000,
    totalOrders: 1240,
    aiResolutionRate: 96.2,
    channels: ["whatsapp", "messenger", "instagram"],
    courier: "steadfast",
    lastActive: "2 mins ago",
    customTokenLimit: 10000000,
    dedicatedAiProvider: "Gemini 2.0 Flash + GPT-4o-mini Failover",
  },
  {
    id: "m-102",
    storeName: "Saree Heritage BD",
    ownerName: "Nusrat Jahan",
    email: "nusrat@sareeheritage.bd",
    phone: "+880 1819-876543",
    city: "Dhaka (Banani)",
    plan: "growth",
    planName: "Growth Plan (৳৫,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-05-01",
    catalogItems: 380,
    monthlyGMV: 620000,
    totalOrders: 890,
    aiResolutionRate: 94.8,
    channels: ["messenger", "instagram", "whatsapp"],
    courier: "pathao",
    lastActive: "Just now",
  },
  {
    id: "m-103",
    storeName: "Gadget Planet Banani",
    ownerName: "Tanvir Ahmed",
    email: "tanvir@gadgetplanet.shop",
    phone: "+880 1912-345678",
    city: "Dhaka (Banani)",
    plan: "scale",
    planName: "Scale Plan (৳৯,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-03-18",
    catalogItems: 520,
    monthlyGMV: 1450000,
    totalOrders: 2180,
    aiResolutionRate: 97.1,
    channels: ["whatsapp", "messenger", "web"],
    courier: "steadfast",
    lastActive: "5 mins ago",
  },
  {
    id: "m-104",
    storeName: "Organic Food Sylhet",
    ownerName: "Mahmud Hasan",
    email: "hasan@organicfoodsylhet.com",
    phone: "+880 1714-556677",
    city: "Sylhet (Zindabazar)",
    plan: "starter",
    planName: "Starter Plan (৳২,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-06-10",
    catalogItems: 48,
    monthlyGMV: 240000,
    totalOrders: 420,
    aiResolutionRate: 92.5,
    channels: ["whatsapp", "messenger"],
    courier: "steadfast",
    lastActive: "14 mins ago",
  },
  {
    id: "m-105",
    storeName: "Chorkhi Lifestyle",
    ownerName: "Samira Karim",
    email: "samira@chorkhibd.com",
    phone: "+880 1618-998877",
    city: "Chattogram (GEC)",
    plan: "growth",
    planName: "Growth Plan (৳৫,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-05-18",
    catalogItems: 210,
    monthlyGMV: 510000,
    totalOrders: 730,
    aiResolutionRate: 95.3,
    channels: ["instagram", "messenger"],
    courier: "pathao",
    lastActive: "22 mins ago",
  },
  {
    id: "m-106",
    storeName: "Dapper Men BD",
    ownerName: "Asif Iqbal",
    email: "asif@dappermen.bd",
    phone: "+880 1715-112233",
    city: "Dhaka (Dhanmondi)",
    plan: "free_trial",
    planName: "14-Day Free Trial",
    status: "trial",
    joinedDate: "2026-08-25",
    catalogItems: 85,
    monthlyGMV: 110000,
    totalOrders: 140,
    aiResolutionRate: 91.8,
    channels: ["whatsapp", "messenger"],
    courier: "steadfast",
    lastActive: "1 hour ago",
  },
  {
    id: "m-107",
    storeName: "Bongo Cosmetics",
    ownerName: "Tasnim Farhana",
    email: "tasnim@bongocosmetics.com",
    phone: "+880 1812-445566",
    city: "Dhaka (Uttara)",
    plan: "enterprise",
    planName: "Enterprise Tier (Custom)",
    status: "active",
    joinedDate: "2026-02-14",
    catalogItems: 1100,
    monthlyGMV: 3200000,
    totalOrders: 4800,
    aiResolutionRate: 98.2,
    channels: ["whatsapp", "messenger", "instagram", "web"],
    courier: "steadfast",
    lastActive: "Just now",
  },
  {
    id: "m-108",
    storeName: "Khulna Honey & Agro",
    ownerName: "Golam Mostafa",
    email: "mostafa@khulnahoney.com",
    phone: "+880 1915-778899",
    city: "Khulna (Shibbari)",
    plan: "starter",
    planName: "Starter Plan (৳২,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-07-01",
    catalogItems: 22,
    monthlyGMV: 180000,
    totalOrders: 310,
    aiResolutionRate: 93.1,
    channels: ["whatsapp"],
    courier: "steadfast",
    lastActive: "3 hours ago",
  },
  {
    id: "m-109",
    storeName: "Sneaker Station BD",
    ownerName: "Nafis Imtiaz",
    email: "nafis@sneakerstation.bd",
    phone: "+880 1718-334455",
    city: "Dhaka (Mirpur)",
    plan: "free_trial",
    planName: "14-Day Free Trial",
    status: "trial",
    joinedDate: "2026-08-28",
    catalogItems: 95,
    monthlyGMV: 95000,
    totalOrders: 82,
    aiResolutionRate: 89.4,
    channels: ["instagram", "messenger"],
    courier: "pathao",
    lastActive: "35 mins ago",
  },
  {
    id: "m-110",
    storeName: "Rajshahi Silk House",
    ownerName: "Mokbul Hossain",
    email: "mokbul@rajshahisilk.com",
    phone: "+880 1710-998811",
    city: "Rajshahi (Shaheb Bazar)",
    plan: "starter",
    planName: "Starter Plan (৳২,৯৯৯/mo)",
    status: "suspended",
    joinedDate: "2026-03-05",
    catalogItems: 60,
    monthlyGMV: 40000,
    totalOrders: 50,
    aiResolutionRate: 85.0,
    channels: ["messenger"],
    courier: "none",
    lastActive: "5 days ago",
  },
  {
    id: "m-111",
    storeName: "Modest Wear BD",
    ownerName: "Farzana Akter",
    email: "farzana@modestwear.bd",
    phone: "+880 1814-776655",
    city: "Dhaka (Baily Road)",
    plan: "growth",
    planName: "Growth Plan (৳৫,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-04-20",
    catalogItems: 180,
    monthlyGMV: 580000,
    totalOrders: 890,
    aiResolutionRate: 95.8,
    channels: ["whatsapp", "messenger", "instagram"],
    courier: "pathao",
    lastActive: "10 mins ago",
  },
  {
    id: "m-112",
    storeName: "Tech Haven BD",
    ownerName: "Zubair Rahman",
    email: "zubair@techhaven.bd",
    phone: "+880 1918-223344",
    city: "Dhaka (Elephant Road)",
    plan: "scale",
    planName: "Scale Plan (৳৯,৯৯৯/mo)",
    status: "active",
    joinedDate: "2026-03-29",
    catalogItems: 340,
    monthlyGMV: 1150000,
    totalOrders: 1650,
    aiResolutionRate: 96.5,
    channels: ["whatsapp", "messenger", "web"],
    courier: "steadfast",
    lastActive: "1 min ago",
  },
];

export type AdminInvoice = {
  id: string;
  merchantName: string;
  plan: string;
  amountBDT: number;
  originalAmountBDT?: number;
  promoCode?: string;
  discountBDT?: number;
  method: string;
  txId: string;
  date: string;
  status: "paid" | "pending" | "refunded";
};

export const ADMIN_INVOICES: AdminInvoice[] = [
  {
    id: "INV-2026-0895",
    merchantName: "Aarong Fashion Flagship",
    plan: "Enterprize",
    amountBDT: 10000,
    method: "bKash Merchant API",
    txId: "BKH99441188",
    date: "2026-09-02",
    status: "paid",
  },
  {
    id: "INV-2026-0894",
    merchantName: "Bata Shoes Bangladesh",
    plan: "Enterprize",
    amountBDT: 100000,
    method: "SSLCommerz (Corporate Visa)",
    txId: "SSL77229911",
    date: "2026-09-01",
    status: "paid",
  },
  {
    id: "INV-2026-0893",
    merchantName: "Bongo Cosmetics",
    plan: "Business",
    amountBDT: 1600,
    originalAmountBDT: 2000,
    promoCode: "SCALEVIP20",
    discountBDT: 400,
    method: "bKash Merchant API",
    txId: "BKH92819827",
    date: "2026-08-31",
    status: "paid",
  },
  {
    id: "INV-2026-0892",
    merchantName: "Gadget Planet Banani",
    plan: "Pro",
    amountBDT: 499,
    originalAmountBDT: 999,
    promoCode: "BOISHAKH50",
    discountBDT: 500,
    method: "bKash Merchant API",
    txId: "BKH91827364",
    date: "2026-08-30",
    status: "paid",
  },
  {
    id: "INV-2026-0891",
    merchantName: "Tech Haven BD",
    plan: "Business",
    amountBDT: 2000,
    method: "SSLCommerz (Visa)",
    txId: "SSL88291029",
    date: "2026-08-29",
    status: "paid",
  },
  {
    id: "INV-2026-0890",
    merchantName: "Artisan Leather Dhaka",
    plan: "Pro",
    amountBDT: 799,
    originalAmountBDT: 999,
    promoCode: "EIDMUBARAK",
    discountBDT: 200,
    method: "Nagad Gateway",
    txId: "NGD77625143",
    date: "2026-08-28",
    status: "paid",
  },
  {
    id: "INV-2026-0889",
    merchantName: "Saree Heritage BD",
    plan: "go",
    amountBDT: 100,
    originalAmountBDT: 200,
    promoCode: "STARTUP50",
    discountBDT: 100,
    method: "bKash Merchant API",
    txId: "BKH66251428",
    date: "2026-08-27",
    status: "paid",
  },
  {
    id: "INV-2026-0888",
    merchantName: "Chorkhi Lifestyle",
    plan: "go",
    amountBDT: 200,
    method: "SSLCommerz (Mastercard)",
    txId: "SSL55443322",
    date: "2026-08-26",
    status: "paid",
  },
  {
    id: "INV-2026-0887",
    merchantName: "Modest Wear BD",
    plan: "Pro",
    amountBDT: 799,
    originalAmountBDT: 999,
    promoCode: "EIDMUBARAK",
    discountBDT: 200,
    method: "bKash Merchant API",
    txId: "BKH44332211",
    date: "2026-08-25",
    status: "paid",
  },
  {
    id: "INV-2026-0886",
    merchantName: "Organic Food Sylhet",
    plan: "go",
    amountBDT: 100,
    originalAmountBDT: 200,
    promoCode: "STARTUP50",
    discountBDT: 100,
    method: "Nagad Gateway",
    txId: "NGD33221100",
    date: "2026-08-24",
    status: "paid",
  },
];

export const SYSTEM_SERVICES = [
  {
    name: "Meta WhatsApp Cloud API",
    category: "Messaging Gateway",
    latency: "142ms",
    uptime: "99.98%",
    status: "operational" as const,
    load: "34.2 req/s",
  },
  {
    name: "Meta Messenger Graph API",
    category: "Messaging Gateway",
    latency: "168ms",
    uptime: "99.95%",
    status: "operational" as const,
    load: "21.6 req/s",
  },
  {
    name: "AI Intent Engine (Bangla NLU)",
    category: "Core Inference",
    latency: "1.12s",
    uptime: "100.0%",
    status: "operational" as const,
    load: "58.4 req/s",
  },
  {
    name: "Product Vision Matcher (VectorDB)",
    category: "Catalog Intelligence",
    latency: "280ms",
    uptime: "99.99%",
    status: "operational" as const,
    load: "12.8 req/s",
  },
  {
    name: "Steadfast Courier API Gateway",
    category: "Fulfilment Bridge",
    latency: "410ms",
    uptime: "99.90%",
    status: "operational" as const,
    load: "8.2 req/s",
  },
  {
    name: "Pathao Merchant API Gateway",
    category: "Fulfilment Bridge",
    latency: "520ms",
    uptime: "99.85%",
    status: "operational" as const,
    load: "5.1 req/s",
  },
];

export const LIVE_ACTIVITY_FEED = [
  {
    id: "act-1",
    type: "order" as const,
    title: "Artisan Leather closed ৳৪,২০০ order",
    time: "Just now",
    detail: "Automated delivery booked via Steadfast (Gulshan to Dhanmondi)",
  },
  {
    id: "act-2",
    type: "signup" as const,
    title: "New Merchant Registered: Dapper Men BD",
    time: "3 mins ago",
    detail: "Started 14-Day Free Trial with WhatsApp & Messenger channels",
  },
  {
    id: "act-3",
    type: "upgrade" as const,
    title: "Saree Heritage upgraded to Growth Plan",
    time: "12 mins ago",
    detail: "Paid ৳৫,৯৯৯ via bKash Merchant API (TxID: BKH66251428)",
  },
  {
    id: "act-4",
    type: "order" as const,
    title: "Gadget Planet closed ৳৮,৫০০ order",
    time: "18 mins ago",
    detail: "AI answered customer on WhatsApp and confirmed COD address",
  },
  {
    id: "act-5",
    type: "order" as const,
    title: "Dhaka Wardrobe closed ৳৩,৬৫০ order",
    time: "26 mins ago",
    detail: "WhatsApp bot closed order, Pathao Express parcel auto-dispatched",
  },
  {
    id: "act-6",
    type: "signup" as const,
    title: "Chittagong Organic connected WhatsApp",
    time: "34 mins ago",
    detail: "Catalog synced (84 organic items indexed for AI Vision search)",
  },
  {
    id: "act-7",
    type: "order" as const,
    title: "Smart Watch BD closed ৳২,৯০০ order",
    time: "41 mins ago",
    detail: "bKash Tokenized checkout confirmed, Steadfast tracking generated",
  },
  {
    id: "act-8",
    type: "system" as const,
    title: "Bangla NLU model weights synced",
    time: "55 mins ago",
    detail: "240 eval benchmark suites passed with 98.4% accuracy",
  },
];

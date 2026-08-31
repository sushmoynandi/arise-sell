import type { Campaign, CapiEvent, Order, PipelineCard, Stage } from "./types";

/* ---------------------------------------------------------------- Pipeline */

export const STAGES: Array<{ id: Stage; label: string; note: string }> = [
  { id: "listening", label: "Listening", note: "Intent detected, nothing committed" },
  { id: "matched", label: "Matched", note: "Product + variant locked" },
  { id: "kyc", label: "Details", note: "Name, phone, address being collected" },
  { id: "confirmed", label: "Confirmed", note: "Order committed, awaiting pickup" },
  { id: "shipped", label: "Shipped", note: "With the courier" },
  { id: "settled", label: "Settled", note: "Delivered and COD reconciled" },
];

export const PIPELINE: PipelineCard[] = [
  { id: "pc-01", customer: "Sumaiya Islam", channel: "whatsapp", stage: "kyc", product: "Jamdani Saree · Indigo", value: 6930, confidence: 0.94, waitingOn: "Full address", ageMins: 3 },
  { id: "pc-02", customer: "Tanjila Akter", channel: "instagram", stage: "listening", product: "Khadi Kurta · XXL", value: 2390, confidence: 0.41, waitingOn: "Restock alert", ageMins: 18 },
  { id: "pc-03", customer: "Rezaul Karim", channel: "messenger", stage: "matched", product: "Kantha × 40 (bulk)", value: 188000, confidence: 0.72, waitingOn: "Human quote", ageMins: 34 },
  { id: "pc-04", customer: "Nabila Hoque", channel: "whatsapp", stage: "confirmed", product: "Jute Tote · Natural", value: 3060, confidence: 0.98, ageMins: 52, proposal: { to: "shipped", why: "Steadfast pickup scan received at 15:40" } },
  { id: "pc-05", customer: "Arif Mahmud", channel: "web", stage: "matched", product: "Brass Kolshi · Large", value: 4980, confidence: 0.66, waitingOn: "Gift wrap?", ageMins: 12 },
  { id: "pc-06", customer: "Shirin Sultana", channel: "messenger", stage: "kyc", product: "Cushion Set of 4", value: 1730, confidence: 0.88, waitingOn: "Phone number", ageMins: 7 },
  { id: "pc-07", customer: "Mostafa Jamal", channel: "whatsapp", stage: "shipped", product: "Khadi Kurta · L ×2", value: 4660, confidence: 0.99, ageMins: 320 },
  { id: "pc-08", customer: "Rumana Haque", channel: "instagram", stage: "settled", product: "Nakshi Kantha · Queen", value: 4780, confidence: 1, ageMins: 1440 },
  { id: "pc-09", customer: "Kamrul Hasan", channel: "whatsapp", stage: "listening", product: "Saree — browsing", value: 6850, confidence: 0.28, ageMins: 41 },
  { id: "pc-10", customer: "Farzana Yasmin", channel: "web", stage: "confirmed", product: "Cushion Set ×3", value: 5030, confidence: 0.95, ageMins: 96, proposal: { to: "shipped", why: "Pathao consignment created, rider assigned" } },
];

/* ------------------------------------------------------------------ Orders */

export const ORDERS: Order[] = [
  {
    id: "ord-20447",
    ref: "NP-20447",
    customer: "Nabila Hoque",
    phone: "01712045590",
    address: "House 42, Road 7, Sector 7, Uttara, Dhaka 1230",
    district: "Dhaka",
    channel: "whatsapp",
    lines: [{ sku: "JT-NAT", name: "Jute & Leather Tote · Natural", qty: 1, unit: 2980 }],
    delivery: 80,
    discount: 0,
    pay: "cod",
    state: "in_transit",
    placedAt: "Today 15:12",
    courier: { provider: "steadfast", consignment: "SF-7719042", tracking: "SF7719042BD", note: "Call before delivery", eta: "Tomorrow, before 2pm" },
  },
  {
    id: "ord-20446",
    ref: "NP-20446",
    customer: "Farzana Yasmin",
    phone: "01819237741",
    address: "Flat B4, Lake Circus, Kalabagan, Dhaka 1205",
    district: "Dhaka",
    channel: "web",
    lines: [{ sku: "TC-SET4", name: "Terracotta Cushion Set of 4", qty: 3, unit: 1650 }],
    delivery: 80,
    discount: 200,
    pay: "bkash",
    state: "packed",
    placedAt: "Today 13:48",
    courier: { provider: "pathao", consignment: "PTH-441902", tracking: "PT441902", note: "Fragile — inserts", eta: "Tomorrow evening" },
  },
  {
    id: "ord-20445",
    ref: "NP-20445",
    customer: "Mostafa Jamal",
    phone: "01911284470",
    address: "Holding 19, Zindabazar, Sylhet 3100",
    district: "Sylhet",
    channel: "whatsapp",
    lines: [{ sku: "KK-L", name: "Khadi Cotton Kurta · L", qty: 2, unit: 2290 }],
    delivery: 130,
    discount: 0,
    pay: "cod",
    state: "in_transit",
    placedAt: "Today 09:20",
    courier: { provider: "steadfast", consignment: "SF-7718811", tracking: "SF7718811BD", note: "", eta: "Tomorrow" },
  },
  {
    id: "ord-20444",
    ref: "NP-20444",
    customer: "Rumana Haque",
    phone: "01614009823",
    address: "Villa 3, Khulshi Hills, Chattogram 4225",
    district: "Chattogram",
    channel: "instagram",
    lines: [{ sku: "NK-QUEEN", name: "Nakshi Kantha Bedspread · Queen", qty: 1, unit: 4700 }],
    delivery: 130,
    discount: 50,
    pay: "cod",
    state: "delivered",
    placedAt: "Yesterday 11:05",
    courier: { provider: "pathao", consignment: "PTH-441744", tracking: "PT441744", note: "", eta: "Delivered 14:20" },
  },
  {
    id: "ord-20443",
    ref: "NP-20443",
    customer: "Shirin Sultana",
    phone: "01521449077",
    address: "Ward 4, Station Road, Bogura 5800",
    district: "Bogura",
    channel: "messenger",
    lines: [
      { sku: "TC-SET2", name: "Terracotta Cushion Set of 2", qty: 1, unit: 890 },
      { sku: "BV-SM", name: 'Brass Kolshi Vase · 8"', qty: 1, unit: 3450 },
    ],
    delivery: 130,
    discount: 0,
    pay: "cod",
    state: "awaiting_confirm",
    placedAt: "Today 15:41",
  },
  {
    id: "ord-20441",
    ref: "NP-20441",
    customer: "Ashraful Alam",
    phone: "01777320145",
    address: "Road 3, Housing Estate, Rajshahi 6000",
    district: "Rajshahi",
    channel: "whatsapp",
    lines: [{ sku: "JD-TER", name: "Jamdani Saree · Terracotta", qty: 1, unit: 6850 }],
    delivery: 130,
    discount: 0,
    pay: "cod",
    state: "returned",
    placedAt: "3 days ago",
    courier: { provider: "steadfast", consignment: "SF-7716220", tracking: "SF7716220BD", note: "Customer unreachable ×3", eta: "Returned to hub" },
  },
];

/* ------------------------------------------------------------------- Reach */

export const CAMPAIGNS: Campaign[] = [
  { id: "cp-11", name: "Eid handloom preview", segment: "Bought ≥2 times, last 90 days", channel: "whatsapp", audience: 2140, delivered: 2118, replied: 743, orders: 187, revenue: 986400, state: "running", window: "Day 3 of 7" },
  { id: "cp-12", name: "Kantha restock nudge", segment: "Asked about kantha, never ordered", channel: "whatsapp", audience: 612, delivered: 604, replied: 271, orders: 68, revenue: 327600, state: "running", window: "Day 1 of 4" },
  { id: "cp-13", name: "Cushion bundle · winback", segment: "Quiet 120+ days", channel: "messenger", audience: 1890, delivered: 1755, replied: 402, orders: 71, revenue: 132900, state: "done", window: "Ended Tue" },
  { id: "cp-14", name: "VIP first-look: brass line", segment: "Top 5% lifetime value", channel: "whatsapp", audience: 148, delivered: 148, replied: 96, orders: 41, revenue: 178900, state: "scheduled", window: "Starts Sat 10:00" },
];

export const COMMENT_RULES = [
  { id: "cr-1", trigger: 'Comment contains "দাম" / "price" / "koto"', reply: "Public: price + link · DM: full catalog card", fired: 1284, converted: 217, live: true },
  { id: "cr-2", trigger: 'Comment contains "inbox" / "ইনবক্স"', reply: "Public: acknowledge · DM: open conversation", fired: 940, converted: 168, live: true },
  { id: "cr-3", trigger: "Comment is abusive or spam", reply: "Hide comment, no DM, flag for review", fired: 62, converted: 0, live: true },
  { id: "cr-4", trigger: 'Comment contains "stock" / "ache"', reply: "Public: live stock count · DM: variant picker", fired: 511, converted: 133, live: false },
];

/* ----------------------------------------------------------------- Signals */

export const CAPI_EVENTS: CapiEvent[] = [
  { id: "ev-8801", name: "Purchase", ref: "NP-20447", value: 3060, match: 9.1, state: "sent", at: "15:12" },
  { id: "ev-8800", name: "Purchase", ref: "NP-20446", value: 5030, match: 8.7, state: "sent", at: "13:48" },
  { id: "ev-8799", name: "IntentQualified", ref: "th-8841", value: 6930, match: 7.4, state: "sent", at: "14:33" },
  { id: "ev-8798", name: "Lead", ref: "th-8840", value: 0, match: 6.2, state: "sent", at: "14:19" },
  { id: "ev-8797", name: "IntentQualified", ref: "th-8839", value: 188000, match: 5.9, state: "queued", at: "14:03" },
  { id: "ev-8796", name: "Lead", ref: "th-8836", value: 0, match: 2.1, state: "dropped", at: "13:20" },
];

/** 14-day series driving the Pulse + Signals charts. */
export const SERIES = {
  days: ["18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"],
  revenue: [82, 96, 71, 104, 128, 143, 119, 152, 168, 141, 187, 204, 196, 231],
  orders: [31, 37, 26, 41, 48, 54, 45, 58, 63, 52, 71, 78, 74, 88],
  threads: [210, 246, 189, 268, 301, 334, 288, 356, 388, 322, 421, 448, 430, 502],
  adSpend: [14, 15, 12, 16, 18, 19, 17, 20, 21, 18, 23, 24, 23, 26],
};

export const KPIS = [
  { label: "Revenue closed", value: 231400, prefix: "৳", delta: 18.2, spark: SERIES.revenue },
  { label: "Orders shipped", value: 88, delta: 19.0, spark: SERIES.orders },
  { label: "Threads handled", value: 502, delta: 16.7, spark: SERIES.threads },
  { label: "Handoff rate", value: 6.4, suffix: "%", delta: -2.1, spark: [11, 10, 10, 9, 9, 8, 9, 8, 7, 8, 7, 7, 6, 6] },
];

/** AI spend guardrail — the ceiling the old system tracked but never enforced. */
export const SPEND = {
  monthCapBdt: 12000,
  monthUsedBdt: 7420,
  todayBdt: 386,
  breakdown: [
    { label: "Conversation reasoning", bdt: 4180, hue: 82 },
    { label: "Vision matching", bdt: 1960, hue: 200 },
    { label: "Voice transcription", bdt: 810, hue: 320 },
    { label: "Campaign drafting", bdt: 470, hue: 26 },
  ],
};

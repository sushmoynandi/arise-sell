/** Shared domain types for the demo dataset. */

export type Channel = "whatsapp" | "messenger" | "instagram" | "web" | "telegram";

export type Lang = "bn" | "banglish" | "en";

export type Stage = "listening" | "matched" | "kyc" | "confirmed" | "shipped" | "settled" | "lost";

export type OrderState =
  | "awaiting_confirm"
  | "confirmed"
  | "packed"
  | "in_transit"
  | "delivered"
  | "returned"
  | "cancelled";

export type Courier = "steadfast" | "pathao";

export type PayMethod = "cod" | "bkash" | "nagad" | "card";

export interface Variant {
  sku: string;
  label: string;
  color?: string;
  size?: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  blurb: string;
  price: number;
  compareAt?: number;
  image: string;
  variants: Variant[];
  tags: string[];
  /** Vision index freshness — powers the "photo → SKU" match. */
  visionIndexed: boolean;
  visionUpdated: string;
  soldThisWeek: number;
}

export interface Message {
  id: string;
  from: "customer" | "agent" | "human";
  lang?: Lang;
  body: string;
  gloss?: string;
  at: string;
  attachment?: { kind: "image"; src: string; matchedSku?: string; confidence?: number };
  action?: { label: string; detail: string; tone?: "signal" | "mint" | "amber" };
}

export interface Thread {
  id: string;
  customer: string;
  handle: string;
  channel: Channel;
  lang: Lang;
  district: string;
  status: "ai" | "human" | "waiting" | "resolved";
  intent: string;
  value: number;
  unread: number;
  lastAt: string;
  messages: Message[];
}

export interface PipelineCard {
  id: string;
  customer: string;
  channel: Channel;
  stage: Stage;
  product: string;
  value: number;
  confidence: number;
  waitingOn?: string;
  ageMins: number;
  /** AI proposed the next stage; a human confirms. */
  proposal?: { to: Stage; why: string };
}

export interface OrderLine {
  sku: string;
  name: string;
  qty: number;
  unit: number;
}

export interface Order {
  id: string;
  ref: string;
  customer: string;
  phone: string;
  address: string;
  district: string;
  channel: Channel;
  lines: OrderLine[];
  delivery: number;
  discount: number;
  pay: PayMethod;
  state: OrderState;
  placedAt: string;
  courier?: { provider: Courier; consignment: string; tracking: string; note: string; eta: string };
}

export interface Campaign {
  id: string;
  name: string;
  segment: string;
  channel: Channel;
  audience: number;
  delivered: number;
  replied: number;
  orders: number;
  revenue: number;
  state: "running" | "scheduled" | "done" | "draft";
  window: string;
}

export interface CapiEvent {
  id: string;
  name: "Lead" | "IntentQualified" | "Purchase";
  ref: string;
  value: number;
  match: number;
  state: "sent" | "queued" | "dropped";
  at: string;
}

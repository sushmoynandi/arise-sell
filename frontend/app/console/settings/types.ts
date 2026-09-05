/* ─── 10 Clean Tabs (Account -> Store -> Channels -> Logistics -> Operations) ─── */
export const TABS = [
  { id: "account", label: "Account" },
  { id: "business", label: "General" },
  { id: "branding", label: "Branding" },
  { id: "invoice", label: "Invoice" },
  { id: "website-orders", label: "Website Orders" },
  { id: "courier", label: "Couriers" },
  { id: "meta", label: "Meta CAPI" },
  { id: "product-feed", label: "Product Feed" },
  { id: "notifications", label: "Notifications" },
  { id: "billing", label: "Billing" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

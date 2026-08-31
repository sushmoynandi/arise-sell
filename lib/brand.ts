/**
 * Single source of truth for product identity + navigation.
 * Positioning note: we sell *shipped orders*, not *answered messages*.
 */

export const BRAND = {
  name: "NextProduct",
  nameFull: "NextProduct AI",
  mark: "NP",
  domain: "nextproduct.ai",
  tagline: "The commerce engine that closes the order",
  taglineBn: "কথা থেকে অর্ডার, অর্ডার থেকে ডেলিভারি",
  description:
    "NextProduct runs the whole sale — reads the message, matches the product, takes the address, books the courier and reports the revenue. One engine across WhatsApp, Messenger, Instagram and your storefront.",
  supportEmail: "hello@nextproduct.ai",
} as const;

export const SITE_NAV = [
  { label: "Platform", href: "/platform" },
  { label: "Pricing", href: "/pricing" },
  { label: "Developers", href: "/docs" },
  { label: "Story", href: "/story" },
] as const;

/**
 * Console IA — organised by *stage of the sale*, not by feature module.
 * Each route owns one contiguous slice of the lifecycle.
 */
export const CONSOLE_NAV = [
  {
    group: "Run",
    items: [
      { label: "Pulse", href: "/console", icon: "pulse", hint: "Live revenue stream" },
      { label: "Threads", href: "/console/threads", icon: "threads", hint: "Every conversation", badge: "4" },
      { label: "Pipeline", href: "/console/pipeline", icon: "pipeline", hint: "Intent → order" },
      { label: "Fulfilment", href: "/console/fulfilment", icon: "truck", hint: "Order, courier, invoice" },
    ],
  },
  {
    group: "Build",
    items: [
      { label: "Catalog", href: "/console/catalog", icon: "box", hint: "Products & vision index" },
      { label: "Reach", href: "/console/reach", icon: "megaphone", hint: "Campaigns & comments" },
      { label: "Brain", href: "/console/brain", icon: "brain", hint: "Persona, rules, evals" },
      { label: "Signals", href: "/console/signals", icon: "chart", hint: "Attribution & spend" },
    ],
  },
] as const;

export const SOCIALS = {
  x: "https://x.com/nextproductai",
  github: "https://github.com/nextproductai",
  linkedin: "https://linkedin.com/company/nextproductai",
} as const;

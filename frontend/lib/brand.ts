/**
 * Single source of truth for product identity + navigation.
 * Positioning note: we sell *shipped orders*, not *answered messages*.
 */

export const BRAND = {
  name: "AriseSell",
  nameFull: "AriseSell",
  mark: "NP",
  domain: "arisesell.com",
  tagline: "The commerce engine that closes the order",
  taglineBn: "কথা থেকে অর্ডার, অর্ডার থেকে ডেলিভারি",
  description:
    "AriseSell runs the whole sale — reads the message, matches the product, takes the address, books the courier and reports the revenue. One engine across WhatsApp, Messenger, Instagram and your storefront.",
  supportEmail: "hello@arisesell.com",
} as const;

export const SITE_NAV = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Story", href: "/#story" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Seller Console IA — Modern Commerce OS Architecture:
 * 1. OPERATIONS (Dashboard, Live Inbox, Comments Auto-Reply, Orders, Leads)
 * 2. GROWTH & AUTOMATION (Campaigns, Automation Tools, Integrations)
 * 3. AI SALES ENGINE (Products, Knowledge Base, AI Playground)
 */
export const CONSOLE_NAV = [
  {
    group: "OPERATIONS",
    items: [
      {
        label: "Dashboard",
        href: "/console",
        icon: "pulse",
        hint: "Daily activity, revenue & operations",
      },
      {
        label: "Inbox",
        href: "/console/inbox",
        icon: "threads",
        hint: "Omnichannel customer conversations",
        badge: "4",
      },
      {
        label: "Comments",
        href: "/console/comments",
        icon: "comments",
        hint: "Post & ad comment auto-responder",
      },
      {
        label: "Orders",
        href: "/console/orders",
        icon: "truck",
        hint: "Courier bookings & COD status",
      },
      {
        label: "Leads & Pipeline",
        href: "/console/pipeline",
        icon: "pipeline",
        hint: "Buyer pipeline & follow-ups",
      },
    ],
  },
  {
    group: "GROWTH & AUTOMATION",
    items: [
      {
        label: "Campaigns",
        href: "/console/campaigns",
        icon: "megaphone",
        hint: "Targeted promos & broadcasts",
        badge: "BETA",
      },
      {
        label: "Automation Tools",
        href: "/console/automation",
        icon: "zap",
        hint: "Ad signals, CAPI & auto-triggers",
      },
      {
        label: "Integrations",
        href: "/console/integrations",
        icon: "plug",
        hint: "Meta, WhatsApp & Courier API",
      },
    ],
  },
  {
    group: "AI SALES ENGINE",
    items: [
      {
        label: "Products",
        href: "/console/products",
        icon: "box",
        hint: "Products, stock & vision index",
      },
      {
        label: "Knowledge Base",
        href: "/console/brain",
        icon: "brain",
        hint: "Store knowledge, FAQs & policies",
      },
      {
        label: "AI Playground",
        href: "/console/playground",
        icon: "bot",
        hint: "Live simulator & chat testing",
      },
    ],
  },
] as const;

export const SOCIALS = {
  x: "https://x.com/arisesellai",
  github: "https://github.com/arisesellai",
  linkedin: "https://linkedin.com/company/arisesellai",
} as const;

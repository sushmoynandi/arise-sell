/**
 * Billing is metered on **closed orders**, not conversations.
 * The merchant only pays on revenue the engine actually produced.
 */

export const PLANS = [
  {
    id: "shuru",
    name: "Shuru",
    nameBn: "শুরু",
    price: 0,
    period: "free forever",
    orders: 40,
    blurb: "Prove it on your own catalog before you pay anything.",
    cta: "Start free",
    featured: false,
    features: [
      "40 closed orders / month",
      "One channel of your choice",
      "Bangla · Banglish · English agent",
      "Photo → product matching",
      "In-chat order taking",
      "Small NextProduct badge on replies",
    ],
    absent: ["Courier auto-booking", "Campaigns", "Meta CAPI"],
  },
  {
    id: "bazaar",
    name: "Bazaar",
    nameBn: "বাজার",
    price: 1190,
    period: "per month",
    orders: 400,
    blurb: "For a shop already taking orders in the inbox every day.",
    cta: "Start 14-day trial",
    featured: true,
    features: [
      "400 closed orders / month",
      "Every channel — WhatsApp, Messenger, Instagram, web",
      "Steadfast & Pathao auto-booking",
      "Branded Bangla invoices",
      "Comment → DM automation",
      "Badge removed",
      "3 team seats",
    ],
    absent: ["Campaigns", "Agent evals"],
  },
  {
    id: "karkhana",
    name: "Karkhana",
    nameBn: "কারখানা",
    price: 3490,
    period: "per month",
    orders: 1500,
    blurb: "For brands running paid traffic into the inbox at volume.",
    cta: "Start 14-day trial",
    featured: false,
    features: [
      "1,500 closed orders / month",
      "Everything in Bazaar",
      "WhatsApp campaigns & win-back playbooks",
      "Meta CAPI server-side attribution",
      "Agent eval harness on every change",
      "Up to 5 pages, one console",
      "AI spend ceilings & alerts",
      "Unlimited seats",
    ],
    absent: [],
  },
] as const;

export const ENTERPRISE = {
  name: "Enterprise",
  blurb:
    "Above 1,500 orders a month, or you need a private model, on-prem catalog, HMAC-signed feeds and an SLA.",
  points: ["Custom order volume", "Private model routing", "SSO + audit log", "Named engineer", "99.9% SLA"],
};

export const OVERAGE = "৳4 per extra closed order — never a surprise cap, never a hard stop.";

export const FAQS = [
  {
    q: "What counts as a closed order?",
    a: "An order the agent took end-to-end and you accepted — item, quantity, verified 11-digit number and a deliverable address. Chats that never become orders cost you nothing, and a cancelled order is credited back on the next invoice.",
  },
  {
    q: "Why bill on orders instead of conversations?",
    a: "Because conversations are our cost, not your value. If the agent talks to two hundred people and closes four orders, you had a bad day and shouldn't pay for two hundred of anything. Order-based pricing puts us on the same side of the table.",
  },
  {
    q: "Will my WhatsApp number get banned?",
    a: "No. We run on the official WhatsApp Business Platform through Meta Cloud API — not an unofficial bridge or a bulk sender. Templates go through Meta's own approval flow and every broadcast carries a one-tap opt-out.",
  },
  {
    q: "Does it really understand Banglish?",
    a: "That's the part we test hardest. Every persona change replays 240 recorded conversations — Bangla script, phonetic Banglish, Sylheti and Chattogram phrasing, plus adversarial haggling — and we block the change if order completion or price accuracy drops.",
  },
  {
    q: "What happens when the AI doesn't know?",
    a: "It hands over. Guardrails escalate bulk orders, discount requests and anything the catalog can't answer to a human, with the full thread in view. It never guesses stock or invents a delivery date.",
  },
  {
    q: "Can I keep my existing website and courier accounts?",
    a: "Yes — that's the normal setup. We pull your catalog from a JSON feed, push confirmed orders back to your own order endpoint, and book on your own Steadfast or Pathao merchant account so the COD lands in your wallet, not ours.",
  },
];

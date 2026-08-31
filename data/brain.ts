/** Persona, guardrails, knowledge and the eval harness. */

export const PERSONA = {
  voice: "Warm, unhurried, uses আপনি. Bangla script by default; mirrors Banglish if the customer writes it.",
  signature: "নকশী থেকে 🌾",
  replyWindow: "Answers within 4 seconds, batches messages sent inside 8 seconds.",
  emojiBudget: "At most one emoji per message.",
};

export const GUARDRAILS = [
  { id: "g1", rule: "Never claim stock the catalog does not show", severity: "hard", fires: 214, label: "Stock honesty" },
  { id: "g2", rule: "Discounts above 5% escalate to a human", severity: "hard", fires: 38, label: "Discount ceiling" },
  { id: "g3", rule: "Orders over ৳50,000 escalate before confirming", severity: "hard", fires: 6, label: "Bulk handoff" },
  { id: "g4", rule: "Never invent a delivery date — quote the courier SLA only", severity: "hard", fires: 91, label: "Delivery honesty" },
  { id: "g5", rule: "Ask for a photo when the product is ambiguous", severity: "soft", fires: 402, label: "Disambiguate" },
  { id: "g6", rule: "Do not discuss competitors or other merchants", severity: "soft", fires: 12, label: "Stay in lane" },
];

export const KNOWLEDGE = [
  { id: "k1", topic: "Delivery", entries: 6, updated: "2d ago", sample: "Inside Dhaka ৳80 / 24h · Outside ৳130 / 48–72h" },
  { id: "k2", topic: "Returns", entries: 4, updated: "9d ago", sample: "7-day exchange on unworn items with the packing slip" },
  { id: "k3", topic: "Fabric care", entries: 11, updated: "4d ago", sample: "Jamdani: dry clean only, never wring" },
  { id: "k4", topic: "Payments", entries: 5, updated: "2d ago", sample: "COD nationwide · bKash / Nagad advance for bulk" },
  { id: "k5", topic: "Sizing", entries: 8, updated: "1d ago", sample: "Khadi runs relaxed — size down if between sizes" },
  { id: "k6", topic: "About Nokshi", entries: 3, updated: "21d ago", sample: "Founded 2021, 40 weaver families in Rupganj" },
];

/**
 * The evaluation harness — replayed on every persona or model change.
 * The old system had no way to prove a prompt edit didn't break anything.
 */
export const EVAL_SUITE = {
  lastRun: "Today 11:40 · after persona edit #47",
  model: "claude-opus-5",
  cases: 240,
  passed: 231,
  duration: "3m 12s",
  metrics: [
    { label: "Order completion", now: 94.2, before: 91.8, goal: 90, unit: "%" },
    { label: "Price accuracy", now: 100, before: 100, goal: 100, unit: "%" },
    { label: "Stock accuracy", now: 99.6, before: 97.1, goal: 99, unit: "%" },
    { label: "Correct escalation", now: 96.7, before: 96.9, goal: 95, unit: "%" },
    { label: "Bangla fluency (rated)", now: 4.7, before: 4.5, goal: 4.3, unit: "/5" },
    { label: "Avg turns to order", now: 5.1, before: 6.4, goal: 7, unit: "" },
  ],
  failures: [
    { id: "f1", set: "Banglish · slang", input: "vaii eta ki jinis er? shudhu chobi diyen na dam bolen", why: "Answered with a photo before the price", severity: "minor" },
    { id: "f2", set: "Bangla · dialect (Sylheti)", input: "ইতা কিতা দাম কিতা অইব", why: "Asked for clarification instead of answering", severity: "minor" },
    { id: "f3", set: "Adversarial · discount", input: "amar friend ke 40% e diyechen, amake den", why: "Did not escalate; restated policy twice", severity: "major" },
  ],
};

export const PLAYBOOKS = [
  { id: "pb1", name: "Silent cart rescue", when: "Details collected, no confirm in 20 min", then: "One nudge with the exact total, then stop", runs: 1104, orders: 288, live: true },
  { id: "pb2", name: "COD risk check", when: "New number + order over ৳5,000 + outside Dhaka", then: "Ask for ৳500 bKash advance", runs: 214, orders: 141, live: true },
  { id: "pb3", name: "Restock alert", when: "Asked for an out-of-stock variant", then: "Message the moment the feed shows stock", runs: 386, orders: 97, live: true },
  { id: "pb4", name: "Post-delivery review", when: "Courier reports delivered + 2 days", then: "Ask for a photo review, offer 5% off next", runs: 512, orders: 63, live: false },
];

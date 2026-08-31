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
    blurbBn: "টাকা দেওয়ার আগে নিজের পণ্য দিয়েই যাচাই করে নিন।",
    cta: "Start free",
    ctaBn: "ফ্রি শুরু করুন",
    featured: false,
    features: [
      "40 closed orders / month",
      "One channel of your choice",
      "Bangla · Banglish · English agent",
      "Photo → product matching",
      "In-chat order taking",
      "Small NextProduct badge on replies",
    ],
    featuresBn: [
      "মাসে ৪০টি সফল অর্ডার",
      "পছন্দের যেকোনো ১টি চ্যানেল",
      "বাংলা · বাংলিশ · ইংরেজি এজেন্ট",
      "ছবি থেকে পণ্য শনাক্তকরণ",
      "চ্যাটেই সরাসরি অর্ডার সম্পন্ন",
      "উত্তরে ছোট NextProduct ব্যাজ",
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
    blurbBn: "যাঁরা প্রতিদিনই ইনবক্সে অর্ডার নিচ্ছেন তাঁদের জন্য।",
    cta: "Start 14-day trial",
    ctaBn: "১৪ দিনের ট্রায়াল",
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
    featuresBn: [
      "মাসে ৪০০টি সফল অর্ডার",
      "সব চ্যানেল — WhatsApp, Messenger, Instagram",
      "স্টেডফাস্ট ও পাঠাও অটো বুকিং",
      "দোকানের নামে বাংলা চালান",
      "কমেন্ট থেকে ইনবক্স অটোমেশন",
      "NextProduct ব্যাজ থাকবে না",
      "৩ জন টিম মেম্বার সিট",
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
    blurbBn: "যাঁরা বিজ্ঞাপন চালিয়ে প্রচুর মেসেজ পান তাঁদের জন্য।",
    cta: "Start 14-day trial",
    ctaBn: "১৪ দিনের ট্রায়াল",
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
    featuresBn: [
      "মাসে ১,৫০০টি সফল অর্ডার",
      "বাজার প্ল্যানের সবকিছু",
      "হোয়াটসঅ্যাপ ক্যাম্পেইন ও ব্রডকাস্ট",
      "Meta CAPI বিজ্ঞাপন ট্র্যাকিং",
      "এআই কোয়ালিটি মূল্যায়ন সিস্টেম",
      "এক ড্যাশবোর্ডে ৫টি পেজ",
      "এআই খরচ নিয়ন্ত্রণ ও অ্যালার্ট",
      "আনলিমিটেড টিম মেম্বার",
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
export const OVERAGE_BN = "লিমিট শেষ হলে প্রতি অতিরিক্ত অর্ডারে মাত্র ৳৪ — হঠাৎ বন্ধ হয়ে যাওয়ার ভয় নেই।";

export const FAQS = [
  {
    q: "What counts as a closed order?",
    qBn: "কোনটাকে ‘ক্লোজড অর্ডার’ ধরা হয়?",
    a: "An order the agent took end-to-end and you accepted — item, quantity, verified 11-digit number and a deliverable address. Chats that never become orders cost you nothing, and a cancelled order is credited back on the next invoice.",
    aBn: "যে অর্ডারটি এআই পুরোপুরি নিয়েছে এবং আপনি গ্রহণ করেছেন — পণ্য, পরিমাণ, যাচাই করা ১১ ডিজিটের নাম্বার আর ডেলিভারিযোগ্য ঠিকানাসহ। যেসব চ্যাট অর্ডারে পরিণত হয় না, সেগুলোর কোনো খরচ নেই। আর অর্ডার বাতিল হলে পরের বিলে টাকা ফেরত পাবেন।",
  },
  {
    q: "Why bill on orders instead of conversations?",
    qBn: "কথার বদলে অর্ডারের হিসাবে বিল কেন?",
    a: "Because conversations are our cost, not your value. If the agent talks to two hundred people and closes four orders, you had a bad day and shouldn't pay for two hundred of anything. Order-based pricing puts us on the same side of the table.",
    aBn: "কারণ কথা বলাটা আমাদের খরচ, আপনার লাভ নয়। এআই দুইশ জনের সাথে কথা বলে যদি মাত্র চারটা অর্ডার হয়, তাহলে সেটা আপনার খারাপ দিন — দুইশ জনের জন্য আপনার টাকা দেওয়া উচিত নয়। অর্ডারভিত্তিক দাম আমাদের দুজনকে একই দিকে রাখে।",
  },
  {
    q: "Will my WhatsApp number get banned?",
    qBn: "আমার হোয়াটসঅ্যাপ নাম্বার কি ব্যান হয়ে যাবে?",
    a: "No. We run on the official WhatsApp Business Platform through Meta Cloud API — not an unofficial bridge or a bulk sender. Templates go through Meta's own approval flow and every broadcast carries a one-tap opt-out.",
    aBn: "না। আমরা মেটার অফিসিয়াল হোয়াটসঅ্যাপ বিজনেস প্ল্যাটফর্ম ব্যবহার করি — কোনো আনঅফিসিয়াল টুল বা বাল্ক সেন্ডার নয়। টেমপ্লেট মেটার নিজস্ব অনুমোদন প্রক্রিয়ায় যায়, আর প্রতিটি ব্রডকাস্টে এক ট্যাপে বন্ধ করার সুযোগ থাকে।",
  },
  {
    q: "Does it really understand Banglish?",
    qBn: "এটা কি সত্যিই বাংলিশ বোঝে?",
    a: "That's the part we test hardest. Every persona change replays 240 recorded conversations — Bangla script, phonetic Banglish, Sylheti and Chattogram phrasing, plus adversarial haggling — and we block the change if order completion or price accuracy drops.",
    aBn: "এই জায়গাটাই আমরা সবচেয়ে বেশি পরীক্ষা করি। প্রতিবার সেটিং বদলালে ২৪০টি রেকর্ড করা কথোপকথন আবার চালানো হয় — বাংলা, বাংলিশ, সিলেটি ও চট্টগ্রামের ভাষা, এমনকি দামাদামিও। অর্ডার সম্পন্ন হওয়ার হার বা দামের নির্ভুলতা কমলে সেই পরিবর্তন আমরা আটকে দিই।",
  },
  {
    q: "What happens when the AI doesn't know?",
    qBn: "এআই না জানলে কী হয়?",
    a: "It hands over. Guardrails escalate bulk orders, discount requests and anything the catalog can't answer to a human, with the full thread in view. It never guesses stock or invents a delivery date.",
    aBn: "তখন সে আপনার হাতে ছেড়ে দেয়। বড় অর্ডার, ছাড়ের অনুরোধ বা ক্যাটালগে নেই এমন কিছু হলে পুরো কথোপকথনসহ একজন মানুষের কাছে পাঠিয়ে দেয়। স্টক নিয়ে আন্দাজ করে না, ডেলিভারির তারিখও বানিয়ে বলে না।",
  },
  {
    q: "Can I keep my existing website and courier accounts?",
    qBn: "আমার ওয়েবসাইট আর কুরিয়ার অ্যাকাউন্ট কি আগেরটাই থাকবে?",
    a: "Yes — that's the normal setup. We pull your catalog from a JSON feed, push confirmed orders back to your own order endpoint, and book on your own Steadfast or Pathao merchant account so the COD lands in your wallet, not ours.",
    aBn: "হ্যাঁ — সাধারণত এভাবেই হয়। আপনার ওয়েবসাইট থেকে পণ্যের তালিকা নেওয়া হয়, কনফার্ম হওয়া অর্ডার আপনার সিস্টেমেই পাঠানো হয়, আর বুকিং হয় আপনার নিজের স্টেডফাস্ট বা পাঠাও অ্যাকাউন্টে — যাতে ক্যাশ অন ডেলিভারির টাকা আপনার কাছেই যায়, আমাদের কাছে নয়।",
  },
];

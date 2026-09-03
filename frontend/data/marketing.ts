/**
 * Landing-page content, bilingual.
 * Written for shop owners, not engineers — every line answers "what do I get".
 * `*Bn` fields are the Bangla the toggle switches to.
 */

export type Tint = "jade" | "azure" | "iris" | "amber" | "rose" | "teal";

export const FEATURES: Array<{
  icon: string;
  tint: Tint;
  title: string;
  titleBn: string;
  body: string;
  bodyBn: string;
}> = [
  {
    icon: "chat",
    tint: "jade",
    title: "Replies in 3 seconds, day or night",
    titleBn: "দিনরাত ৩ সেকেন্ডে উত্তর",
    body: "Midnight, Eid morning, the middle of your daughter's wedding — every customer gets an answer before they go ask another page.",
    bodyBn:
      "রাত ২টা হোক বা ঈদের সকাল — কাস্টমার অন্য পেজে চলে যাওয়ার আগেই উত্তর পেয়ে যায়। আপনাকে ফোন হাতে বসে থাকতে হয় না।",
  },
  {
    icon: "bangla",
    tint: "iris",
    title: "Understands real Bangla",
    titleBn: "আসল বাংলা বোঝে",
    body: "“দাম কত?”, “vai eta ache?”, Sylheti, Chittagonian, half-English — it reads how your customers actually type, and answers the same way.",
    bodyBn:
      "“দাম কত?”, “vai eta ache?”, সিলেটি, চাটগাঁইয়া, আধা ইংরেজি — কাস্টমার যেভাবে লেখে সেভাবেই বোঝে, আর সেভাবেই উত্তর দেয়।",
  },
  {
    icon: "camera",
    tint: "azure",
    title: "Knows the product from a photo",
    titleBn: "ছবি দেখেই পণ্য চেনে",
    body: "Customers send a blurry screenshot of your old Facebook post. It finds the exact item, colour and size — and tells them what's in stock.",
    bodyBn:
      "পুরোনো পোস্টের ঝাপসা স্ক্রিনশট পাঠালেও ঠিক পণ্যটা, রঙ আর সাইজ বের করে ফেলে — আর কোনটা স্টকে আছে তাও বলে দেয়।",
  },
  {
    icon: "cart",
    tint: "amber",
    title: "Takes the full order in chat",
    titleBn: "চ্যাটেই পুরো অর্ডার নেয়",
    body: "Name, number, full address, size, quantity, payment — collected properly, so you never chase a customer for a missing detail again.",
    bodyBn:
      "নাম, নাম্বার, পুরো ঠিকানা, সাইজ, পরিমাণ, পেমেন্ট — সব ঠিকভাবে নিয়ে নেয়। ঠিকানার জন্য আর বারবার মেসেজ দিতে হয় না।",
  },
  {
    icon: "truck",
    tint: "teal",
    title: "Books Steadfast & Pathao itself",
    titleBn: "নিজেই কুরিয়ার বুক করে",
    body: "The parcel is booked on your own courier account and the tracking code goes straight back to the customer. No more copy-pasting into portals at night.",
    bodyBn:
      "আপনার নিজের কুরিয়ার অ্যাকাউন্টেই পার্সেল বুক হয়, ট্র্যাকিং কোড কাস্টমারকে পাঠিয়ে দেয়। রাত জেগে পোর্টালে টাইপ করতে হয় না।",
  },
  {
    icon: "invoice",
    tint: "rose",
    title: "Sends a proper Bangla invoice",
    titleBn: "বাংলায় চালান পাঠায়",
    body: "Your logo, itemised products, delivery charge and total — a clean চালান your customer trusts, generated the moment the order is confirmed.",
    bodyBn:
      "আপনার লোগো, পণ্যের তালিকা, ডেলিভারি চার্জ আর সর্বমোট — অর্ডার কনফার্ম হওয়ার সাথে সাথেই পরিষ্কার একটা চালান তৈরি হয়ে যায়।",
  },
  {
    icon: "megaphone",
    tint: "jade",
    title: "Brings old customers back",
    titleBn: "পুরোনো কাস্টমার ফেরায়",
    body: "One-tap WhatsApp campaigns to people who bought before, or asked and never ordered. They reply, and the agent closes the sale for you.",
    bodyBn:
      "আগে কিনেছেন বা দাম জিজ্ঞেস করে চলে গেছেন — তাদের কাছে এক ক্লিকে হোয়াটসঅ্যাপ অফার যায়। রিপ্লাই এলে বাকিটা এআই-ই সামলায়।",
  },
  {
    icon: "chart",
    tint: "azure",
    title: "Shows exactly what your ads earned",
    titleBn: "বিজ্ঞাপনের আসল হিসাব",
    body: "Every sale is reported back to Facebook, so your ads stop guessing and start finding more people who actually buy.",
    bodyBn:
      "প্রতিটা বিক্রি ফেসবুককে জানিয়ে দেওয়া হয়, ফলে আপনার অ্যাড আন্দাজে না চলে সত্যিকারের ক্রেতা খুঁজে বের করে।",
  },
];

/** Three big features that deserve a full block with a picture. */
export const SPOTLIGHTS = [
  {
    kicker: "বাংলা · Banglish · English",
    title: "Your customer writes however they like. It still understands.",
    titleBn: "কাস্টমার যেভাবেই লিখুক, এআই ঠিকই বুঝে নেয়।",
    body: "Most bots break the moment someone types “vaiya eita koto?” instead of proper Bangla. This one was built for how Bangladeshi customers actually message — mixed script, no punctuation, voice notes, three messages in a row.",
    bodyBn:
      "শুদ্ধ বাংলা না লিখে কেউ “vaiya eita koto?” লিখলেই বেশিরভাগ বট আটকে যায়। এটা বানানোই হয়েছে বাংলাদেশি কাস্টমার যেভাবে মেসেজ করে সেভাবে — মিশ্র লেখা, বিরামচিহ্ন ছাড়া, ভয়েস নোট, পরপর তিনটা মেসেজ।",
    points: [
      "Bangla script, phonetic Banglish and English",
      "Sylheti and Chittagonian phrasing",
      "Waits for the customer to finish typing before replying",
    ],
    pointsBn: [
      "বাংলা, বাংলিশ আর ইংরেজি — তিনটাই",
      "সিলেটি ও চাটগাঁইয়া ভাষার ধরন বোঝে",
      "কাস্টমারের লেখা শেষ হওয়া পর্যন্ত অপেক্ষা করে",
    ],
    demo: "chat" as const,
  },
  {
    kicker: "ছবি থেকে পণ্য",
    title: "A screenshot is enough. It finds the item and the size.",
    titleBn: "একটা স্ক্রিনশটই যথেষ্ট — পণ্য আর সাইজ বের করে ফেলে।",
    body: "Your customers rarely know the product name. They send a cropped photo from an old post and ask “eita ache?”. The agent matches it to the real item in your catalog, checks stock, and quotes the correct price.",
    bodyBn:
      "কাস্টমার সাধারণত পণ্যের নাম জানে না। পুরোনো পোস্ট থেকে কেটে নেওয়া ছবি পাঠিয়ে লেখে “eita ache?”। এআই সেটা আপনার ক্যাটালগের আসল পণ্যের সাথে মিলিয়ে স্টক দেখে সঠিক দাম বলে দেয়।",
    points: [
      "Matches cropped and low-quality photos",
      "Shows real warehouse photos when asked",
      "Never claims stock you don't have",
    ],
    pointsBn: [
      "কাটা বা ঝাপসা ছবিও মিলিয়ে ফেলে",
      "চাইলে গুদামের আসল ছবি পাঠায়",
      "স্টকে নেই এমন পণ্য কখনো আছে বলে না",
    ],
    demo: "match" as const,
  },
  {
    kicker: "অর্ডার থেকে ডেলিভারি",
    title: "It doesn't stop at “order confirmed”. It ships the parcel.",
    titleBn: "“অর্ডার কনফার্ম” বলেই থেমে যায় না — পার্সেলটা পাঠিয়েও দেয়।",
    body: "The address is checked, the phone number is validated, the courier is booked on your own Steadfast or Pathao account, and the tracking code goes back into the same chat — all before you've opened your laptop.",
    bodyBn:
      "ঠিকানা যাচাই হয়, নাম্বার ঠিক আছে কিনা দেখা হয়, আপনার নিজের স্টেডফাস্ট বা পাঠাও অ্যাকাউন্টে কুরিয়ার বুক হয়, আর ট্র্যাকিং কোড চ্যাটেই চলে যায় — আপনি ল্যাপটপ খোলার আগেই।",
    points: [
      "11-digit number checked before confirming",
      "Steadfast & Pathao, your own account",
      "COD money settles directly to you",
    ],
    pointsBn: [
      "কনফার্ম করার আগে ১১ ডিজিটের নাম্বার যাচাই",
      "স্টেডফাস্ট ও পাঠাও — আপনার নিজের অ্যাকাউন্টে",
      "ক্যাশ অন ডেলিভারির টাকা সরাসরি আপনার কাছে",
    ],
    demo: "courier" as const,
  },
];

export const STEPS = [
  {
    n: "১",
    title: "Connect your page",
    titleBn: "পেজ কানেক্ট করুন",
    body: "Log in with Facebook and pick the page or WhatsApp number you sell from. Takes about two minutes.",
    bodyBn:
      "ফেসবুক দিয়ে লগইন করে যে পেজ বা হোয়াটসঅ্যাপ নাম্বারে বিক্রি করেন সেটা বেছে নিন। দুই মিনিটের কাজ।",
  },
  {
    n: "২",
    title: "Add your products",
    titleBn: "পণ্য যোগ করুন",
    body: "Import from your Facebook posts, upload a CSV, or connect your website. Prices and stock stay in sync on their own.",
    bodyBn:
      "ফেসবুক পোস্ট থেকে আনুন, সিএসভি আপলোড করুন, বা ওয়েবসাইট কানেক্ট করুন। দাম আর স্টক নিজে থেকেই আপডেট থাকে।",
  },
  {
    n: "৩",
    title: "Let it sell",
    titleBn: "বিক্রি শুরু",
    body: "Watch the first orders come in. Step in whenever you want — you can take over any chat with one tap.",
    bodyBn:
      "প্রথম অর্ডারগুলো আসতে দেখুন। যখন খুশি নিজে ঢুকে পড়ুন — এক ট্যাপেই যেকোনো চ্যাট নিজের হাতে নিতে পারবেন।",
  },
];

export const TESTIMONIALS = [
  {
    quote:
      "Before this I was answering messages until 2am and still losing orders. Now I wake up to eight confirmed parcels already booked with Steadfast.",
    quoteBn:
      "আগে রাত ২টা পর্যন্ত মেসেজের উত্তর দিতাম, তাও অর্ডার হারাতাম। এখন ঘুম থেকে উঠে দেখি আটটা পার্সেল স্টেডফাস্টে বুক হয়ে আছে।",
    name: "Farhana Rahman",
    nameBn: "ফারহানা রহমান",
    shop: "Nokshi & Co. · Handloom, Dhaka",
    shopBn: "নকশী অ্যান্ড কোং · তাঁত, ঢাকা",
    hue: 82,
    result: "+38% orders",
    resultBn: "+৩৮% অর্ডার",
    detail: "in the first two months",
    detailBn: "প্রথম দুই মাসেই",
  },
  {
    quote:
      "The Bangla is the part that surprised me. My customers write in Banglish and it replies properly — they don't realise it isn't my staff.",
    quoteBn:
      "বাংলাটাই আমাকে সবচেয়ে অবাক করেছে। কাস্টমার বাংলিশে লেখে আর এটা ঠিকঠাক উত্তর দেয় — কেউ বুঝতেই পারে না এটা আমার স্টাফ না।",
    name: "Imran Kabir",
    nameBn: "ইমরান কবির",
    shop: "Dhaka Denim · Apparel",
    shopBn: "ঢাকা ডেনিম · পোশাক",
    hue: 200,
    result: "3.8 sec",
    resultBn: "৩.৮ সেকেন্ড",
    detail: "average reply time",
    detailBn: "গড় উত্তরের সময়",
  },
  {
    quote:
      "I used to pay two people just to reply on Messenger. Now one person handles the difficult cases and the rest runs itself.",
    quoteBn:
      "শুধু মেসেঞ্জারে উত্তর দেওয়ার জন্য দুইজনকে বেতন দিতাম। এখন একজন কঠিন কেসগুলো দেখে, বাকিটা নিজে নিজেই চলে।",
    name: "Sadia Noor",
    nameBn: "সাদিয়া নূর",
    shop: "Bengal Botanica · Skincare",
    shopBn: "বেঙ্গল বোটানিকা · স্কিনকেয়ার",
    hue: 320,
    result: "৳34,000",
    resultBn: "৳৩৪,০০০",
    detail: "saved every month",
    detailBn: "প্রতি মাসে সাশ্রয়",
  },
];

export const HEADLINE_STATS = [
  { value: "410+", valueBn: "৪১০+", label: "shops selling with it", labelBn: "দোকান ব্যবহার করছে" },
  { value: "৳2.3 crore", valueBn: "৳২.৩ কোটি", label: "orders closed last month", labelBn: "গত মাসের অর্ডার" },
  { value: "3.8s", valueBn: "৩.৮ সে.", label: "average first reply", labelBn: "গড় উত্তরের সময়" },
  { value: "93.6%", valueBn: "৯৩.৬%", label: "handled without staff", labelBn: "স্টাফ ছাড়াই সম্পন্ন" },
];

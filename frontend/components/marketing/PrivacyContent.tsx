"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow, Badge, Panel } from "@/components/ui/primitives";
import {
  IconShield,
  IconClock,
} from "@/components/ui/icons";
import { Reveal } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { cx } from "@/lib/format";

const LAST_UPDATED = "September 4, 2026";

const SECTIONS = [
  { id: "overview", labelEn: "1. Overview & Scope", labelBn: "১. সার্বিক বিবরণ ও পরিধি" },
  { id: "information-collected", labelEn: "2. Information We Collect", labelBn: "২. সংগৃহীত তথ্যাবলী" },
  { id: "how-we-use", labelEn: "3. How We Use Data", labelBn: "৩. তথ্যের ব্যবহার" },
  { id: "meta-compliance", labelEn: "4. Meta Platform & WhatsApp Compliance", labelBn: "৪. মেটা ও হোয়াটসঅ্যাপ নীতিমালা" },
  { id: "third-party", labelEn: "5. Third-Party Integrations & Sharing", labelBn: "৫. থার্ড-পার্টি ইন্টিগ্রেশন ও শেয়ারিং" },
  { id: "security-retention", labelEn: "6. Security & Data Retention", labelBn: "৬. নিরাপত্তা ও তথ্য সংরক্ষণ" },
  { id: "data-deletion", labelEn: "7. User Data Deletion Instructions", labelBn: "৭. তথ্য মুছে ফেলার নির্দেশিকা" },
  { id: "user-rights", labelEn: "8. Your Rights & Choices", labelBn: "৮. আপনার অধিকার ও নিয়ন্ত্রণ" },
  { id: "cookies", labelEn: "9. Cookies & Analytics", labelBn: "৯. কুকিজ ও ট্র্যাকিং" },
  { id: "contact-legal", labelEn: "10. Contact & Data Protection Officer", labelBn: "১০. যোগাযোগ ও আইনি সহায়তা" },
];

export default function PrivacyContent() {
  const { t } = useLang();
  const [activeSection, setActiveSection] = useState("overview");

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="relative mx-auto max-w-7xl px-5 pt-28 pb-20 lg:px-8 lg:pt-36">
      {/* Header Banner */}
      <div className="max-w-3xl">
        <Reveal>
          <div className="flex flex-wrap items-center gap-2.5">
            <Eyebrow>{t("Legal & Compliance", "আইনি ও পলিসি সংক্রান্ত")}</Eyebrow>
            <Badge tone="signal" dot>
              {t("Meta Cloud API Certified", "মেটা ক্লাউড এপিআই সমর্থিত")}
            </Badge>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-text">
            {t("Privacy Policy", "প্রাইভেসি পলিসি")}
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-text-2">
            {t(
              "How AriseSell collects, protects, processes, and respects merchant and customer data across WhatsApp Cloud API, Facebook Messenger, Instagram DM, courier networks, and automated checkout.",
              "হোয়াটসঅ্যাপ, ফেসবুক মেসেঞ্জার, ইনস্টাগ্রাম এবং কুরিয়ার ও পেমেন্ট অটোমেশনে AriseSell কীভাবে মার্চেন্ট ও ক্রেতাদের ব্যক্তিগত তথ্যের সর্বোচ্চ নিরাপত্তা এবং সুরক্ষা নিশ্চিত করে।"
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[12.5px] text-text-3">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <IconClock width={13} height={13} className="text-signal" />
              {t("Last Updated:", "সর্বশেষ পরিমার্জন:")} {LAST_UPDATED}
            </span>
            <span>·</span>
            <span>{t("Effective Date: Immediate", "কার্যকর তারিখ: তাৎক্ষণিক")}</span>
            <span>·</span>
            <span className="font-mono text-signal font-medium">v2.4.0-BD</span>
          </div>
        </Reveal>
      </div>

      {/* Main Content Layout */}
      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[280px_1fr] items-start">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="sticky top-28 hidden lg:block">
          <div className="rounded-2xl border border-line bg-surface/90 p-5 backdrop-blur-md shadow-xs">
            <h3 className="font-display text-[13px] font-bold uppercase tracking-wider text-text mb-3">
              {t("Table of Contents", "সূচিপত্র")}
            </h3>
            <nav className="space-y-1">
              {SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollTo(sec.id)}
                  className={cx(
                    "block w-full text-left rounded-lg px-3 py-2 text-[12.5px] font-medium transition-all cursor-pointer",
                    activeSection === sec.id
                      ? "bg-signal-wash text-signal font-semibold"
                      : "text-text-2 hover:bg-black/4 hover:text-text"
                  )}
                >
                  {t(sec.labelEn, sec.labelBn)}
                </button>
              ))}
            </nav>

            <div className="mt-6 pt-5 border-t border-line">
              <div className="rounded-xl border border-signal/20 bg-signal-wash/50 p-3.5">
                <div className="flex items-center gap-2 text-signal text-[12.5px] font-semibold">
                  <IconShield width={14} height={14} />
                  <span>{t("Data Protection", "ডাটা সুরক্ষা")}</span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-text-2">
                  {t(
                    "We never sell customer conversations or use merchant proprietary stock for general AI model training.",
                    "আমরা কখনোই গ্রাহকের চ্যাট বা মার্চেন্টের স্টক তথ্য কোনো তৃতীয় পক্ষের কাছে বিক্রি করি না।"
                  )}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Legal Text Articles */}
        <article className="space-y-12 text-text-2 text-[14.5px] leading-relaxed">
          {/* Section 1: Overview */}
          <section id="overview" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">01</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("1. Overview & Scope", "১. সার্বিক বিবরণ ও পরিধি")}
              </h2>
            </div>
            <p>
              {t(
                "Welcome to AriseSell (also operating under the technology identifier AriseSell, accessible via arisesell.com, alapai.app, and related portals). AriseSell is an enterprise SaaS platform engineered to provide autonomous conversational commerce, AI sales assistance, order management, and fulfillment automation for online merchants in Bangladesh and globally.",
                "AriseSell (AriseSell হিসেবে পরিচালিত) প্ল্যাটফর্মে আপনাকে স্বাগতম। AriseSell হলো একটি আধুনিক কনভারসেশনাল কমার্স ও অটোমেশন প্ল্যাটফর্ম যা বাংলাদেশের অনলাইন মার্চেন্টদের হোয়াটসঅ্যাপ, ফেসবুক মেসেঞ্জার, ইনস্টাগ্রাম এবং ইকমার্স স্টোরের মাধ্যমে স্বয়ংক্রিয়ভাবে সেলস ক্লোজ ও ডেলিভারি নিশ্চিত করতে সহায়তা করে।"
              )}
            </p>
            <p>
              {t(
                "This Privacy Policy describes how we collect, use, store, process, and disclose information when you (the 'Merchant', 'Store Owner', or 'User') register for our services, connect your Meta/Facebook pages, WhatsApp Business numbers, courier accounts, and when end-consumers communicate with your automated storefront.",
                "এই প্রাইভেসি পলিসি ব্যাখ্যা করে যে কীভাবে আমরা আপনার (মার্চেন্ট বা ব্যবহারকারী) তথ্য সংগ্রহ, ব্যবহার, সংরক্ষণ ও নিরাপত্তা বিধান করি যখন আপনি আমাদের সেবা ব্যবহার করেন অথবা যখন কাস্টমার আপনার স্টোরে মেসেজ পাঠান।"
              )}
            </p>
          </section>

          {/* Section 2: Information Collected */}
          <section id="information-collected" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">02</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("2. Information We Collect", "২. সংগৃহীত তথ্যাবলী")}
              </h2>
            </div>
            <p>
              {t(
                "We collect information strictly necessary to provide reliable commerce automation, conversational intelligence, and delivery dispatching:",
                "নির্বিঘ্নে বিক্রয় ও কুরিয়ার বুকিং সেবা প্রদানের জন্য আমরা নির্দিষ্ট কিছু তথ্য সংগ্রহ করি:"
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Panel className="p-5">
                <h3 className="font-display text-[15px] font-semibold text-text">
                  {t("A. Merchant Account Information", "ক. মার্চেন্ট অ্যাকাউন্ট সংক্রান্ত")}
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-[13px] list-disc list-inside text-text-2">
                  <li>{t("Full Name, business email, and phone number", "নাম, ব্যবসায়িক ইমেইল এবং মোবাইল নম্বর")}</li>
                  <li>{t("Store / Brand name, logo, and physical location", "স্টোরের নাম, লোগো এবং ঠিকানা")}</li>
                  <li>{t("Login credentials with secure bcrypt password hashing", "এনক্রিপ্টেড পাসওয়ার্ড ও লগইন তথ্য")}</li>
                  <li>{t("Billing tier, subscription status, and invoice history", "প্ল্যান, বিলিং হিস্ট্রি ও সাবস্ক্রিপশন তথ্য")}</li>
                </ul>
              </Panel>
              <Panel className="p-5">
                <h3 className="font-display text-[15px] font-semibold text-text">
                  {t("B. Messaging & Conversation Logs", "খ. মেসেজিং ও কাস্টমার কথোপকথন")}
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-[13px] list-disc list-inside text-text-2">
                  <li>{t("Inbound customer messages (Text, Bangla/Banglish, Audio, Image screenshots)", "ক্রেতার পাঠানো মেসেজ, ছবি বা স্ক্রিনশট")}</li>
                  <li>{t("Sender Platform User IDs (PSID, WABA Phone Number, IG User ID)", "মেটা প্রেরকের আইডি ও হোয়াটসঅ্যাপ নম্বর")}</li>
                  <li>{t("Conversation timestamps, message status, and AI responses", "মেসেজের সময় ও এআই সেলস রেসপন্স")}</li>
                </ul>
              </Panel>
              <Panel className="p-5">
                <h3 className="font-display text-[15px] font-semibold text-text">
                  {t("C. Customer Orders & Delivery Data", "গ. কাস্টমার অর্ডার ও ডেলিভারি তথ্য")}
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-[13px] list-disc list-inside text-text-2">
                  <li>{t("Customer delivery name, validated 11-digit phone number (01XXXXXXXXX)", "গ্রাহকের নাম ও ১১ ডিজিটের সঠিক মোবাইল নম্বর")}</li>
                  <li>{t("Delivery address, District, and Thana / Upazila in Bangladesh", "ডেলিভারি ঠিকানা, জেলা ও থানা")}</li>
                  <li>{t("Itemized order variants, quantities, delivery charges, and COD totals", "অর্ডারের প্রডাক্ট, পরিমাণ ও ক্যাশ অন ডেলিভারি মূল্য")}</li>
                </ul>
              </Panel>
              <Panel className="p-5">
                <h3 className="font-display text-[15px] font-semibold text-text">
                  {t("D. Connected Channel Credentials", "ঘ. কানেক্টেড চ্যানেলের ক্রেডেনশিয়ালস")}
                </h3>
                <ul className="mt-2.5 space-y-1.5 text-[13px] list-disc list-inside text-text-2">
                  <li>{t("Meta Page Access Tokens & WhatsApp Phone Number IDs", "মেটা পেজ এক্সেস টোকেন ও হোয়াটসঅ্যাপ আইডি")}</li>
                  <li>{t("Steadfast API Key & Pathao Hermes Courier Credentials", "কুরিয়ার এপিআই কি ও সিক্রেট")}</li>
                  <li>{t("bKash Merchant Keys / SSLCommerz Store IDs (Encrypted in DB)", "এনক্রিপ্টেড পেমেন্ট গেটওয়ে ক্রেডেনশিয়াল")}</li>
                </ul>
              </Panel>
            </div>
          </section>

          {/* Section 3: How We Use */}
          <section id="how-we-use" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">03</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("3. How We Use Your Information", "৩. তথ্যের ব্যবহার")}
              </h2>
            </div>
            <p>
              {t(
                "We use the collected information for the following specific purposes:",
                "আমরা নিচের সুনির্দিষ্ট উদ্দেশ্যে তথ্যাবলী ব্যবহার করে থাকি:"
              )}
            </p>
            <ul className="space-y-2 text-[14px] list-disc list-inside">
              <li>
                <strong className="text-text">{t("Autonomous Conversational Sales: ", "স্বয়ংক্রিয় বিক্রয় কার্যক্রম: ")}</strong>
                {t(
                  "Enabling the AI Sales Assistant to answer customer product inquiries, parse Bangla/Banglish idioms, match product images, check stock availability, and collect checkout addresses.",
                  "কাস্টমারের মেসেজের উত্তর দেওয়া, প্রডাক্ট ম্যাচিং করা এবং ক্যাশ অন ডেলিভারি অর্ডার চূড়ান্ত করা।"
                )}
              </li>
              <li>
                <strong className="text-text">{t("Automated Courier Dispatch: ", "স্বয়ংক্রিয় কুরিয়ার পার্সেল তৈরি: ")}</strong>
                {t(
                  "Transmitting delivery address and COD amounts directly to Steadfast Courier or Pathao Courier APIs to generate official consignment tracking codes.",
                  "অর্ডার কনফার্ম হওয়ার সাথে সাথে স্টিডফাস্ট বা পাঠাও কুরিয়ারে অটোমেটিক পার্সেল এন্ট্রি করা।"
                )}
              </li>
              <li>
                <strong className="text-text">{t("Merchant Operations & Live Inbox: ", "মার্চেন্ট ড্যাশবোর্ড ও ইনবক্স: ")}</strong>
                {t(
                  "Providing store owners with live monitoring of ongoing customer threads, instant manual takeover capabilities, order fulfillment metrics, and revenue analytics.",
                  "লাইভ চ্যাট মনিটর করা, প্রয়োজনে ম্যানুয়াল টেকওভার নেওয়া এবং দৈনিক সেলস রিপোর্ট প্রদর্শন করা।"
                )}
              </li>
              <li>
                <strong className="text-text">{t("Security & Fraud Prevention: ", "নিরাপত্তা ও প্রতারণা রোধ: ")}</strong>
                {t(
                  "Validating HMAC-SHA256 signatures on inbound Meta webhooks, preventing replay attacks, and detecting fraudulent order submissions.",
                  "ভুয়া অর্ডার রোধ এবং সিস্টেমের সম্পূর্ণ সাইবার নিরাপত্তা বজায় রাখা।"
                )}
              </li>
            </ul>
          </section>

          {/* Section 4: Meta Compliance */}
          <section id="meta-compliance" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">04</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("4. Meta Platform & WhatsApp Cloud API Compliance", "৪. মেটা প্ল্যাটফর্ম ও হোয়াটসঅ্যাপ নীতিমালা")}
              </h2>
            </div>
            <div className="rounded-xl border border-signal/25 bg-signal-wash/40 p-4 mb-2">
              <p className="text-[13.5px] font-medium text-signal">
                {t(
                  "AriseSell strictly adheres to the Meta Platform Terms, Developer Policies, and WhatsApp Business Messaging Policies.",
                  "AriseSell মেটা প্ল্যাটফর্মের সমস্ত ডেভেলপার পলিসি ও হোয়াটসঅ্যাপ বিজনেস টার্মস শতভাগ মেনে চলে।"
                )}
              </p>
            </div>
            <p>
              {t(
                "When merchants connect their Facebook Pages, Instagram Accounts, or WhatsApp Business Accounts (WABA) to AriseSell:",
                "মার্চেন্ট যখন ফেসবুক পেজ বা হোয়াটসঅ্যাপ AriseSell-এ যুক্ত করেন:"
              )}
            </p>
            <ul className="space-y-2 text-[14px] list-disc list-inside">
              <li>
                {t(
                  "We act solely as a Data Processor on behalf of the Merchant (the Data Controller).",
                  "আমরা শুধুমাত্র মার্চেন্টের পক্ষে প্রযুক্তিগত ডাটা প্রসেসর হিসেবে কাজ করি।"
                )}
              </li>
              <li>
                {t(
                  "Customer message contents and phone numbers received via Meta Graph / Cloud API are used strictly to reply to customer inquiries and facilitate the merchant's legitimate business transactions.",
                  "হোয়াটসঅ্যাপের মেসেজ ও কন্টেন্ট শুধুমাত্র সংশ্লিষ্ট কাস্টমারের অর্ডারের প্রয়োজনে ব্যবহৃত হয়।"
                )}
              </li>
              <li>
                {t(
                  "We NEVER sell, rent, broker, or monetize Meta user data or customer information.",
                  "আমরা কখনোই কোনো মেটা ইউজার ডাটা বা গ্রাহকের তথ্য বিক্রি বা বাণিজ্যিক উদ্দেশ্যে প্রদান করি না।"
                )}
              </li>
              <li>
                {t(
                  "Customer chat transcripts are isolated per-tenant and are never pooled into global foundation model training corpuses.",
                  "এক মার্চেন্টের গ্রাহকের ডাটা অন্য মার্চেন্টের ডাটার সাথে মেশানো হয় না এবং কোনো মডেল ট্রেনিংয়ে ব্যবহৃত হয় না।"
                )}
              </li>
            </ul>
          </section>

          {/* Section 5: Third-Party Integrations */}
          <section id="third-party" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">05</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("5. Third-Party Integrations & Sharing", "৫. থার্ড-পার্টি ইন্টিগ্রেশন ও শেয়ারিং")}
              </h2>
            </div>
            <p>
              {t(
                "To deliver full-stack e-commerce automation, we integrate with trusted third-party infrastructure providers:",
                "ইকমার্স কার্যক্রম পরিচালনার জন্য আমরা নিচের নির্ভরযোগ্য সেবাদাতাদের সাথে সমন্বয় করি:"
              )}
            </p>
            <div className="space-y-3 pt-1">
              <div className="rounded-xl border border-line p-4">
                <h4 className="font-semibold text-text text-[14px]">
                  {t("Meta Platforms, Inc. (WhatsApp & Messenger Graph API)", "মেটা প্ল্যাটফর্মস (হোয়াটসঅ্যাপ ও মেসেঞ্জার)")}
                </h4>
                <p className="mt-1 text-[13px] text-text-3">
                  {t(
                    "Receiving webhook payloads and transmitting outbound automated chat bubbles via Meta's secure Cloud API edge.",
                    "হোয়াটসঅ্যাপ ও ফেসবুকের মেসেজ আদান-প্রদান।"
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-line p-4">
                <h4 className="font-semibold text-text text-[14px]">
                  {t("Google Cloud & Gemini API (AI Reasoning Engine)", "গুগল ক্লাউড ও জেমিনি এআই")}
                </h4>
                <p className="mt-1 text-[13px] text-text-3">
                  {t(
                    "High-speed conversational inference, Bangla intent understanding, and product catalog grounding with enterprise data privacy guarantees.",
                    "বাংলা ভাষার সঠিক অর্থ অনুধাবন ও প্রোডাক্টের বিবরণ প্রস্তুতকরণ।"
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-line p-4">
                <h4 className="font-semibold text-text text-[14px]">
                  {t("Courier Partners (Steadfast Courier & Pathao Hermes)", "কুরিয়ার পার্টনার (স্টিডফাস্ট ও পাঠাও)")}
                </h4>
                <p className="mt-1 text-[13px] text-text-3">
                  {t(
                    "Consignment creation, shipping label generation, and automated COD reconciliation across 64 districts of Bangladesh.",
                    "বাংলাদেশের ৬৪ জেলায় হোম ডেলিভারি ও পার্সেল ট্র্যাকিং।"
                  )}
                </p>
              </div>

              <div className="rounded-xl border border-line p-4">
                <h4 className="font-semibold text-text text-[14px]">
                  {t("Payment Gateways (bKash & SSLCommerz)", "পেমেন্ট গেটওয়ে (বিকাশ ও এসএসএলকমার্স)")}
                </h4>
                <p className="mt-1 text-[13px] text-text-3">
                  {t(
                    "Generating tokenized payment links and verifying transaction status. Sensitive payment credentials (card numbers, PINs) are processed directly on PCI-DSS certified gateway servers and are NEVER stored by AriseSell.",
                    "বিকাশ বা পেমেন্ট লিংক তৈরি ও ভেরিফিকেশন। কোনো পিন বা কার্ড নম্বর আমরা সংরক্ষণ করি না।"
                  )}
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Security & Retention */}
          <section id="security-retention" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">06</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("6. Security & Data Retention", "৬. নিরাপত্তা ও তথ্য সংরক্ষণ")}
              </h2>
            </div>
            <p>
              {t(
                "We implement industry-grade technical and organizational security measures:",
                "আমরা সর্বোচ্চ সাইবার সিকিউরিটি স্ট্যান্ডার্ড মেনে চলি:"
              )}
            </p>
            <ul className="space-y-2 text-[14px] list-disc list-inside">
              <li>{t("All data in transit is encrypted using TLS 1.3 / 256-bit SSL encryption.", "সকল ডাটা ট্রানজিটে ২৫৬-বিট এসএসএল দ্বারা সুরক্ষিত।")}</li>
              <li>{t("Database storage in PostgreSQL with tenant-isolated row policies and vector isolation.", "ডাটাবেজে মার্চেন্টভিত্তিক আলাদা ও সুরক্ষিত ডাটা আইসোলেশন।")}</li>
              <li>{t("Webhook verification with HMAC-SHA256 signatures to reject forged or spoofed requests.", "মেটার প্রতিটি ওয়েবহুক সিগনেচার নিখুঁতভাবে যাচাইকরণ।")}</li>
              <li>{t("Two-Factor Authentication (2FA) and cryptographic token rotation for merchant consoles.", "মার্চেন্টদের জন্য নিরাপদ লগইন ও ২-ফ্যাক্টর নিরাপত্তা ব্যবস্থা।")}</li>
            </ul>
            <p className="pt-2">
              {t(
                "Conversation transcripts and order records are retained as long as the merchant's account remains active, or until the merchant requests their deletion via the console or legal request.",
                "মার্চেন্টের অ্যাকাউন্ট সচল থাকা পর্যন্ত অথবা মুছে ফেলার আবেদন না করা পর্যন্ত ডাটা সংরক্ষিত থাকে।"
              )}
            </p>
          </section>

          {/* Section 7: User Data Deletion */}
          <section id="data-deletion" className="scroll-mt-28 space-y-4 rounded-2xl border border-signal/30 bg-signal-wash/20 p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">07</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("7. User Data Deletion Instructions (Meta Compliance)", "৭. তথ্য মুছে ফেলার নির্দেশিকা (মেটা কমপ্লায়েন্স)")}
              </h2>
            </div>
            <p>
              {t(
                "In accordance with Meta Platform Policy and global data protection laws, any merchant or end-user has the right to request the complete deletion of their personal data and associated Meta conversation records.",
                "মেটা প্ল্যাটফর্ম পলিসি অনুসারে মার্চেন্ট বা কোনো গ্রাহক চাইলে তাদের সম্পূর্ণ ডাটা মুছে ফেলার অনুরোধ করতে পারবেন।"
              )}
            </p>
            <div className="rounded-xl border border-line bg-white p-5 space-y-3">
              <h4 className="font-semibold text-text text-[14px]">
                {t("How to Request Immediate Data Deletion:", "ডাটা মুছে ফেলার সহজ নিয়মাবলী:")}
              </h4>
              <ol className="space-y-2 text-[13.5px] list-decimal list-inside text-text-2">
                <li>
                  {t(
                    "Send an email from your registered account to: ",
                    "আপনার রেজিস্টার্ড ইমেইল থেকে ইমেইল পাঠান: "
                  )}
                  <a href={`mailto:${BRAND.supportEmail}?subject=Data%20Deletion%20Request`} className="font-semibold text-signal hover:underline">
                    {BRAND.supportEmail}
                  </a>
                  {t(" with the subject 'Data Deletion Request'.", " (বিষয়: Data Deletion Request)।")}
                </li>
                <li>
                  {t(
                    "Or if you connected via Facebook Login / Meta App, visit your Facebook Profile > Settings & Privacy > Settings > Apps and Websites > Find AriseSell > Click Remove, then click 'Send Request' for data deletion callback.",
                    "অথবা ফেসবুকের Settings > Apps and Websites থেকে AriseSell রিমুভ করে ডাটা ডিলিশন রিকোয়েস্ট পাঠাতে পারেন।"
                  )}
                </li>
                <li>
                  {t(
                    "Our automated data deletion service will purge your chat logs, tokens, and customer identity indices within 72 business hours and return a confirmation tracking code.",
                    "আমাদের সিস্টেম ৭২ ঘণ্টার মধ্যে আপনার সকল রেকর্ড ডিলিট করে কনফার্মেশন কোড প্রদান করবে।"
                  )}
                </li>
              </ol>
            </div>
          </section>

          {/* Section 8: User Rights */}
          <section id="user-rights" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">08</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("8. Your Rights & Choices", "৮. আপনার অধিকার ও নিয়ন্ত্রণ")}
              </h2>
            </div>
            <p>
              {t(
                "You have the right to access, rectify, download, or restrict the processing of your personal information at any time directly through the AriseSell Merchant Console or by contacting our support team.",
                "আপনি যেকোনো সময় আপনার ডাটা ডাউনলোড করতে, সংশোধন করতে অথবা সম্পূর্ণ মুছে ফেলতে পারবেন।"
              )}
            </p>
          </section>

          {/* Section 9: Cookies */}
          <section id="cookies" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">09</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("9. Cookies & Session Management", "৯. কুকিজ ও সেশন")}
              </h2>
            </div>
            <p>
              {t(
                "We use essential session cookies (np_access_token, np_refresh_token, np-lang) solely to authenticate merchant console logins, maintain security sessions, and preserve your preferred language (English or Bangla). We do not use third-party invasive ad tracking cookies.",
                "আমরা শুধুমাত্র লগইন সেশন নিরাপদ রাখতে এবং আপনার নির্বাচিত ভাষা মনে রাখতে প্রয়োজনীয় সিকিউর কুকিজ ব্যবহার করি।"
              )}
            </p>
          </section>

          {/* Section 10: Contact */}
          <section id="contact-legal" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">10</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("10. Contact & Data Protection Officer", "১০. যোগাযোগ ও আইনি সহায়তা")}
              </h2>
            </div>
            <p>
              {t(
                "If you have any questions, feedback, or compliance inquiries regarding this Privacy Policy or data processing practices, please contact us:",
                "এই প্রাইভেসি পলিসি বা ডাটা সংক্রান্ত যেকোনো তথ্যের জন্য আমাদের সাথে সরাসরি যোগাযোগ করুন:"
              )}
            </p>
            <div className="rounded-xl border border-line bg-surface p-5 text-[13.5px] space-y-1.5">
              <p className="font-semibold text-text">{BRAND.nameFull} / AriseSell Data Protection Office</p>
              <p className="text-text-2">Banani, Dhaka 1213, Bangladesh</p>
              <p className="text-text-2">
                Email:{" "}
                <a href={`mailto:${BRAND.supportEmail}`} className="text-signal font-medium hover:underline">
                  {BRAND.supportEmail}
                </a>
              </p>
              <p className="text-text-2">
                WhatsApp Support:{" "}
                <a href="https://wa.me/8801401411091" target="_blank" rel="noopener noreferrer" className="text-signal font-medium hover:underline">
                  +880 1401-411091
                </a>
              </p>
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

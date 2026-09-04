"use client";

import { useState } from "react";
import Link from "next/link";
import { Eyebrow, Badge, Panel } from "@/components/ui/primitives";
import {
  IconShield,
  IconClock,
  IconCheck,
} from "@/components/ui/icons";
import { Reveal } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { cx } from "@/lib/format";

const LAST_UPDATED = "September 4, 2026";

const SECTIONS = [
  { id: "acceptance", labelEn: "1. Acceptance of Terms", labelBn: "১. শর্তাবলীর গ্রহণযোগ্যতা" },
  { id: "services", labelEn: "2. Description of Services", labelBn: "২. সেবার বিবরণ" },
  { id: "merchant-accounts", labelEn: "3. Merchant Account & Security", labelBn: "৩. অ্যাকাউন্ট ও নিরাপত্তা" },
  { id: "acceptable-use", labelEn: "4. Acceptable Use & Messaging Rules", labelBn: "৪. অনুমোদনযোগ্য ব্যবহারের নিয়মাবলী" },
  { id: "ai-disclaimers", labelEn: "5. AI Sales Engine & Responsibilities", labelBn: "৫. এআই ইঞ্জিন ও মার্চেন্টের দায়িত্ব" },
  { id: "billing-pricing", labelEn: "6. Plans, Billing & Closed Orders", labelBn: "৬. প্ল্যান ও বিলিং পলিসি" },
  { id: "courier-payment", labelEn: "7. Courier & Payment Integrations", labelBn: "৭. কুরিয়ার ও পেমেন্ট সংযোগ" },
  { id: "intellectual-property", labelEn: "8. Data Ownership & IP Rights", labelBn: "৮. তথ্যের মালিকানা ও মেধা স্বত্ব" },
  { id: "liability", labelEn: "9. Limitation of Liability", labelBn: "৯. দায়বদ্ধতার সীমাবদ্ধতা" },
  { id: "termination", labelEn: "10. Termination & Suspension", labelBn: "১০. অ্যাকাউন্ট বাতিল ও স্থগিতকরণ" },
  { id: "governing-law", labelEn: "11. Governing Law (Bangladesh)", labelBn: "১১. প্রযোজ্য আইন (বাংলাদেশ)" },
  { id: "contact-terms", labelEn: "12. Contact Information", labelBn: "১২. যোগাযোগ" },
];

export default function TermsContent() {
  const { t } = useLang();
  const [activeSection, setActiveSection] = useState("acceptance");

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
            <Eyebrow>{t("Legal & Terms", "শর্তাবলী ও নিয়মাবলী")}</Eyebrow>
            <Badge tone="neutral" dot>
              {t("Commercial SaaS Agreement", "বাণিজ্যিক সেবার চুক্তি")}
            </Badge>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2.2rem,4.4vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-text">
            {t("Terms of Service", "ব্যবহারের শর্তাবলী")}
          </h1>
          <p className="mt-4 text-[15.5px] leading-relaxed text-text-2">
            {t(
              "Please read these Terms of Service carefully before utilizing the AriseSell (NextProduct AI) platform, connected messaging channels, AI sales agent, or automated fulfillment services.",
              "AriseSell (NextProduct AI) প্ল্যাটফর্ম, এর এআই সেলস অ্যাসিস্ট্যান্ট, কানেক্টেড চ্যানেল এবং কুরিয়ার অটোমেশন ব্যবহার করার পূর্বে অনুগ্রহ করে ব্যবহারের শর্তাবলীগুলো ভালোভাবে পড়ে নিন।"
            )}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-[12.5px] text-text-3">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <IconClock width={13} height={13} className="text-signal" />
              {t("Last Updated:", "সর্বশেষ পরিমার্জন:")} {LAST_UPDATED}
            </span>
            <span>·</span>
            <span>{t("Jurisdiction: Dhaka, Bangladesh", "আদালতের এখতিয়ার: ঢাকা, বাংলাদেশ")}</span>
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
                  <IconCheck width={14} height={14} />
                  <span>{t("Fair Merchant Guarantee", "স্বচ্ছ ও ন্যায্য নীতি")}</span>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-text-2">
                  {t(
                    "You own 100% of your store catalog, customer relationships, and revenues. We only bill on closed orders.",
                    "আপনার কাস্টমার ও প্রোডাক্টের শতভাগ মালিক আপনি। আমরা কেবল সফলভাবে ক্লোজ হওয়া অর্ডারে বিল করি।"
                  )}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Terms Content Articles */}
        <article className="space-y-12 text-text-2 text-[14.5px] leading-relaxed">
          {/* Section 1: Acceptance */}
          <section id="acceptance" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">01</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("1. Acceptance of Terms & Eligibility", "১. শর্তাবলীর গ্রহণযোগ্যতা ও যোগ্যতা")}
              </h2>
            </div>
            <p>
              {t(
                "By creating an account, connecting a Meta/WhatsApp channel, accessing the merchant dashboard, or integrating the AriseSell API, you agree to be bound by these Terms of Service ('Terms'). If you are entering into these Terms on behalf of a company, business, or legal entity, you represent that you have the authority to bind such entity to these Terms.",
                "অ্যাকাউন্ট খোলার মাধ্যমে, ফেসবুক বা হোয়াটসঅ্যাপ চ্যানেল কানেক্ট করার মাধ্যমে অথবা AriseSell ড্যাশবোর্ড ব্যবহারের মাধ্যমে আপনি এই ব্যবহারের শর্তাবলী মেনে নিতে সম্মত হচ্ছেন। আপনি যদি কোনো ব্যবসায়িক প্রতিষ্ঠানের পক্ষে চুক্তি করেন, তবে উক্ত প্রতিষ্ঠানের পক্ষে সিদ্ধান্ত গ্রহণের পূর্ণ বৈধ ক্ষমতা আপনার রয়েছে বলে গণ্য হবে।"
              )}
            </p>
            <p>
              {t(
                "You must be at least 18 years of age or the legal age of majority in your jurisdiction to create an account and operate commerce automation tools.",
                "AriseSell-এ মার্চেন্ট অ্যাকাউন্ট খোলার জন্য আপনার বয়স ন্যূনতম ১৮ বছর বা তদূর্ধ্ব হতে হবে।"
              )}
            </p>
          </section>

          {/* Section 2: Services */}
          <section id="services" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">02</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("2. Description of Services", "২. সেবার বিবরণ")}
              </h2>
            </div>
            <p>
              {t(
                "AriseSell (NextProduct AI) provides a multi-tenant cloud software platform that enables e-commerce and social commerce sellers to:",
                "AriseSell মার্চেন্টদের নিম্নলিখিত আধুনিক স্বয়ংক্রিয় সেবা প্রদান করে:"
              )}
            </p>
            <ul className="space-y-2 text-[14px] list-disc list-inside">
              <li>{t("Deploy 24/7 AI conversational sales agents across WhatsApp Cloud API, Messenger, and Instagram.", "হোয়াটসঅ্যাপ, মেসেঞ্জার এবং ইনস্টাগ্রামে ২৪/৭ এআই সেলস অ্যাসিস্ট্যান্ট পরিচালনা।")}</li>
              <li>{t("Match customer screenshots to specific stock keeping units (SKUs) using visual recognition indices.", "কাস্টমারের পাঠানো স্ক্রিনশট দেখে নিখুঁতভাবে প্রডাক্ট শনাক্তকরণ।")}</li>
              <li>{t("Validate customer phone numbers (013-019) and delivery addresses across all 64 districts.", "গ্রাহকের ১১ ডিজিটের নম্বর ও জেলা-থানা ভিত্তিক সঠিক ঠিকানা যাচাই।")}</li>
              <li>{t("Automatically book courier consignments via Steadfast Courier and Pathao Hermes express APIs.", "স্টিডফাস্ট ও পাঠাও কুরিয়ারে স্বয়ংক্রিয়ভাবে পার্সেল বুকিং।")}</li>
              <li>{t("Generate instant bKash payment links or manage Cash on Delivery (COD) order pipelines.", "বিকাশ পেমেন্ট লিংক প্রদান ও ক্যাশ অন ডেলিভারি অর্ডার ট্র্যাকিং।")}</li>
            </ul>
          </section>

          {/* Section 3: Merchant Accounts */}
          <section id="merchant-accounts" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">03</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("3. Merchant Account, Access & Security", "৩. মার্চেন্ট অ্যাকাউন্ট ও নিরাপত্তা")}
              </h2>
            </div>
            <p>
              {t(
                "You are responsible for maintaining the confidentiality of your login credentials, API secrets, Meta system tokens, and courier API keys. You must immediately notify AriseSell of any unauthorized use or security breach involving your account.",
                "আপনার পাসওয়ার্ড, মেটা টোকেন ও কুরিয়ার এপিআই কি-এর নিরাপত্তা বজায় রাখার দায়িত্ব সম্পূর্ণ আপনার। অ্যাকাউন্টে অনাকাঙ্ক্ষিত কোনো প্রবেশ লক্ষ্য করলে তাৎক্ষণিকভাবে আমাদের জানাতে হবে।"
              )}
            </p>
            <p>
              {t(
                "We implement industry-standard encryption (bcrypt, AES-256) and 2-Factor Authentication (2FA) options in the console to protect merchant assets.",
                "মার্চেন্টের তথ্য সুরক্ষায় আমরা স্ট্রং এনক্রিপশন ও ২-ফ্যাক্টর অথেনটিকেশন সুবিধা প্রদান করি।"
              )}
            </p>
          </section>

          {/* Section 4: Acceptable Use */}
          <section id="acceptable-use" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">04</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("4. Acceptable Use & Messaging Rules", "৪. অনুমোদনযোগ্য ব্যবহারের নিয়মাবলী")}
              </h2>
            </div>
            <p>
              {t(
                "You agree NOT to use the AriseSell platform to:",
                "AriseSell ব্যবহার করে নিচের কোনো কর্মকাণ্ড করা সম্পূর্ণ নিষিদ্ধ:"
              )}
            </p>
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.04] p-5 space-y-2 text-[13.5px]">
              <ul className="space-y-1.5 list-disc list-inside text-text-2">
                <li>{t("Send unsolicited mass spam or promotional broadcasts in violation of Meta WhatsApp Business Policies.", "মেটার নীতিমালা ভঙ্গ করে অনাকাঙ্ক্ষিত স্প্যাম বা স্প্যাম ব্রডকাস্ট পাঠানো।")}</li>
                <li>{t("Sell illegal goods, narcotics, counterfeit items, firearms, or banned commodities under Bangladesh law.", "বাংলাদেশের আইনে নিষিদ্ধ বা নকল কোনো পণ্য কেনাবেচা করা।")}</li>
                <li>{t("Harass, deceive, or defraud consumers with misleading pricing or false shipment claims.", "ভুল দাম বা মিথ্যা ডেলিভারি তথ্য দিয়ে গ্রাহকদের প্রতারিত করা।")}</li>
                <li>{t("Attempt to reverse engineer, decompile, or bypass the platform's security mechanisms.", "সিস্টেম রিভার্স ইঞ্জিনিয়ারিং বা হ্যাকিংয়ের চেষ্টা করা।")}</li>
              </ul>
            </div>
            <p className="pt-2 text-[13.5px] text-text-3">
              {t(
                "Violation of these rules may result in immediate suspension or termination of your account and reporting to Meta Platforms.",
                "এই নিয়মগুলো অমান্য করলে অ্যাকাউন্ট সাময়িক বা স্থায়ীভাবে বাতিল করা হতে পারে।"
              )}
            </p>
          </section>

          {/* Section 5: AI Disclaimers */}
          <section id="ai-disclaimers" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">05</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("5. AI Sales Engine Capabilities & Merchant Oversight", "৫. এআই সেলস ইঞ্জিন ও মার্চেন্টের দায়িত্ব")}
              </h2>
            </div>
            <p>
              {t(
                "The AI assistant relies on the product catalog, pricing, inventory stock counts, and store knowledge rules provided by the merchant. While our AI architecture includes robust anti-hallucination guardrails and fallback protocols:",
                "এআই সেলস অ্যাসিস্ট্যান্ট মার্চেন্টের দেওয়া প্রোডাক্ট তথ্য, স্টক ও প্রাইস তালিকার ওপর ভিত্তি করে কাজ করে। আমাদের সিস্টেমে সর্বোচ্চ সুরক্ষা ব্যবস্থা থাকা সত্ত্বেও:"
              )}
            </p>
            <ul className="space-y-2 text-[14px] list-disc list-inside">
              <li>
                {t(
                  "Merchants are responsible for keeping catalog prices, sizes, and stock availability accurate in the console.",
                  "প্রোডাক্টের সঠিক দাম, সাইজ ও স্টক আপডেট রাখার দায়িত্ব মার্চেন্টের।"
                )}
              </li>
              <li>
                {t(
                  "Merchants can monitor live chats in real-time (`/console/inbox`) and take over any conversation manually with one click.",
                  "মার্চেন্ট যেকোনো সময় লাইভ চ্যাট দেখতে পারবেন এবং প্রয়োজনে এক ক্লিকে ম্যানুয়াল টেকওভার নিতে পারবেন।"
                )}
              </li>
              <li>
                {t(
                  "AriseSell is not liable for merchant business losses arising from incorrect product specifications entered by the merchant.",
                  "মার্চেন্ট কর্তৃক ইনপুটে ভুল তথ্যের কারণে কোনো ব্যবসায়িক ক্ষতির জন্য AriseSell দায়ী থাকবে না।"
                )}
              </li>
            </ul>
          </section>

          {/* Section 6: Billing & Pricing */}
          <section id="billing-pricing" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">06</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("6. Subscription Plans, Billing & Pay-per-Closed-Order", "৬. প্ল্যান, বিলিং ও ক্লোজড অর্ডার পলিসি")}
              </h2>
            </div>
            <p>
              {t(
                "AriseSell prices subscriptions primarily based on successful Closed Orders rather than conversation volume:",
                "AriseSell-এর বিলিং মূলত সফল ক্লোজড অর্ডারের সংখ্যার ওপর ভিত্তি করে নির্ধারিত:"
              )}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
              <div className="rounded-xl border border-line bg-surface p-4 text-center">
                <h4 className="font-semibold text-text text-[14px]">Shuru (Free)</h4>
                <p className="text-[20px] font-bold text-signal mt-1">৳0</p>
                <p className="text-[12px] text-text-3 mt-1">40 Free Closed Orders</p>
              </div>
              <div className="rounded-xl border border-signal/30 bg-signal-wash/30 p-4 text-center">
                <h4 className="font-semibold text-text text-[14px]">Bazaar</h4>
                <p className="text-[20px] font-bold text-signal mt-1">৳1,190 <span className="text-[12px] font-normal text-text-3">/mo</span></p>
                <p className="text-[12px] text-text-3 mt-1">400 Included Orders</p>
              </div>
              <div className="rounded-xl border border-line bg-surface p-4 text-center">
                <h4 className="font-semibold text-text text-[14px]">Karkhana</h4>
                <p className="text-[20px] font-bold text-signal mt-1">৳3,490 <span className="text-[12px] font-normal text-text-3">/mo</span></p>
                <p className="text-[12px] text-text-3 mt-1">1,500 Included Orders</p>
              </div>
            </div>
            <p className="pt-2 text-[13.5px]">
              {t(
                "Orders exceeding the plan quota are billed at the standard overage rate of ৳4 per closed order. All subscription fees are in Bangladeshi Taka (BDT) and are non-refundable once the billing cycle commences.",
                "প্ল্যানের অতিরিক্ত অর্ডারের ক্ষেত্রে প্রতি সফল অর্ডারে ৪ টাকা হারে বিল হবে। সকল পেমেন্ট বাংলাদেশি টাকায় (BDT) পরিশোধযোগ্য।"
              )}
            </p>
          </section>

          {/* Section 7: Courier & Payment Integrations */}
          <section id="courier-payment" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">07</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("7. Courier & Payment Integrations", "৭. কুরিয়ার ও পেমেন্ট সংযোগ")}
              </h2>
            </div>
            <p>
              {t(
                "AriseSell provides direct API bridges to third-party logistics (Steadfast, Pathao) and payment providers (bKash, SSLCommerz). While we ensure 99.9% uptime on our API integrations, actual physical parcel delivery and bank fund settlements are solely executed by the respective courier and payment companies under their own commercial agreements with you.",
                "AriseSell স্টিডফাস্ট, পাঠাও এবং বিকাশের সাথে এপিআই সংযোগ নিশ্চিত করে। পার্সেল ডেলিভারি এবং ব্যাংক অ্যাকাউন্টে টাকা জমার মূল দায়িত্ব সংশ্লিষ্ট কুরিয়ার ও পেমেন্ট কোম্পানির নিজস্ব পলিসির আওতাধীন।"
              )}
            </p>
          </section>

          {/* Section 8: IP & Ownership */}
          <section id="intellectual-property" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">08</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("8. Data Ownership & Intellectual Property", "৮. তথ্যের মালিকানা ও মেধা স্বত্ব")}
              </h2>
            </div>
            <p>
              {t(
                "You retain all ownership rights to your product catalog, media assets, trademarks, brand identity, and customer relationships. AriseSell retains all intellectual property rights in its proprietary software, AI algorithms, user interface, and system designs.",
                "আপনার পণ্যের ক্যাটালগ, ছবি, ব্র্যান্ড নাম এবং গ্রাহক তথ্যের একক মালিক আপনি। AriseSell প্ল্যাটফর্মের কোড, এলগোরিদম এবং সফটওয়্যার ডিজাইনের স্বত্ব AriseSell-এর।"
              )}
            </p>
          </section>

          {/* Section 9: Liability */}
          <section id="liability" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">09</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("9. Limitation of Liability", "৯. দায়বদ্ধতার সীমাবদ্ধতা")}
              </h2>
            </div>
            <p>
              {t(
                "To the maximum extent permitted by applicable law, AriseSell shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising out of or related to your use of the service.",
                "প্রযোজ্য আইনের সর্বোচ্চ সীমা অনুযায়ী, কোনো পরোক্ষ বা আনুষঙ্গিক ব্যবসায়িক ক্ষতির জন্য AriseSell দায়বদ্ধ থাকবে না।"
              )}
            </p>
          </section>

          {/* Section 10: Termination */}
          <section id="termination" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">10</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("10. Termination & Suspension", "১০. অ্যাকাউন্ট বাতিল ও স্থগিতকরণ")}
              </h2>
            </div>
            <p>
              {t(
                "You may cancel your subscription at any time via the console settings. Upon cancellation, your account will remain active until the end of your current billing period. We reserve the right to suspend or terminate accounts that violate Meta policies or these Terms.",
                "আপনি যেকোনো সময় আপনার সাবস্ক্রিপশন বাতিল করতে পারেন। মেটার নীতিমালা বা এই শর্তাবলী লঙ্ঘনকারী অ্যাকাউন্ট বন্ধের অধিকার আমাদের সংরক্ষিত।"
              )}
            </p>
          </section>

          {/* Section 11: Governing Law */}
          <section id="governing-law" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">11</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("11. Governing Law & Dispute Resolution", "১১. প্রযোজ্য আইন (বাংলাদেশ)")}
              </h2>
            </div>
            <p>
              {t(
                "These Terms and any dispute arising from them shall be governed by and construed in accordance with the laws of the People's Republic of Bangladesh. Any legal proceeding shall be subject to the exclusive jurisdiction of the competent courts in Dhaka, Bangladesh.",
                "এই শর্তাবলী গণপ্রজাতন্ত্রী বাংলাদেশের প্রচলিত আইন অনুযায়ী পরিচালিত হবে এবং যেকোনো আইনি বিরোধ ঢাকা, বাংলাদেশের উপযুক্ত আদালতের এখতিয়ারাধীন থাকবে।"
              )}
            </p>
          </section>

          {/* Section 12: Contact */}
          <section id="contact-terms" className="scroll-mt-28 space-y-4 rounded-2xl border border-line bg-white p-7 lg:p-9 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider">12</span>
              <h2 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("12. Contact Information", "১২. যোগাযোগ")}
              </h2>
            </div>
            <p>
              {t(
                "For questions regarding these Terms of Service, please contact our team:",
                "এই শর্তাবলী সম্পর্কিত যেকোনো প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন:"
              )}
            </p>
            <div className="rounded-xl border border-line bg-surface p-5 text-[13.5px] space-y-1.5">
              <p className="font-semibold text-text">{BRAND.nameFull} / AriseSell Legal Operations</p>
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

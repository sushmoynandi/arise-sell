"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Eyebrow, Panel } from "@/components/ui/primitives";
import {
  IconArrow,
  IconCheck,
  IconClock,
  IconGlobe,
  IconWhatsApp,
} from "@/components/ui/icons";
import { Reveal, SPRING_SOFT } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";
import { cx } from "@/lib/format";

const PHONE = "017 1000 0000";
const PHONE_INT = "+8801710000000";

const ORDER_RANGES = [
  { id: "starter", en: "10–30 orders/day", bn: "দৈনিক ১০–৩০ অর্ডার" },
  { id: "growth", en: "30–100 orders/day", bn: "দৈনিক ৩০–১০০ অর্ডার" },
  { id: "scale", en: "100–300 orders/day", bn: "দৈনিক ১০০–৩০০ অর্ডার" },
  { id: "enterprise", en: "300+ orders/day", bn: "দৈনিক ৩০০+ অর্ডার" },
];

const CONTACT_FAQS = [
  {
    qEn: "How fast can we go live?",
    qBn: "কত দ্রুত চালু করা সম্ভব?",
    aEn: "Usually in under 10 minutes. You connect your Facebook/Instagram page, sync your products or catalog, and test a conversation right in your own chat.",
    aBn: "সাধারণত ১০ মিনিটের মধ্যে। ফেসবুক বা ইনস্টাগ্রাম পেজ কানেক্ট করে প্রোডাক্ট যুক্ত করলেই আপনি সরাসরি চ্যাটে টেস্ট করতে পারবেন।",
  },
  {
    qEn: "Do I need a technical person to manage this?",
    qBn: "এটি চালাতে কি কোনো টেকনিক্যাল লোক লাগবে?",
    aEn: "Not at all. If you can use Facebook and WhatsApp, you can manage AriseSell effortlessly. Everything is designed in plain Bangla and English.",
    aBn: "একদমই না। আপনি যদি ফেসবুক বা হোয়াটসঅ্যাপ চালাতে পারেন, তবে খুব সহজেই এটি চালাতে পারবেন। সবকিছু সহজ বাংলা ও ইংরেজিতে সাজানো।",
  },
  {
    qEn: "Can I test with real customers before paying?",
    qBn: "টাকা দেওয়ার আগে কি লাইভ কাস্টমারদের সাথে টেস্ট করা যাবে?",
    aEn: "Yes! Every account starts with 40 completely free closed orders. No credit card, no advance fee.",
    aBn: "হ্যাঁ! প্রতিটি অ্যাকাউন্টে প্রথম ৪০টি ক্লোজড অর্ডার সম্পূর্ণ ফ্রি। কোনো কার্ড বা অগ্রিম টাকা লাগবে না।",
  },
];

export default function ContactSection() {
  const { t } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [volume, setVolume] = useState("starter");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitted(true);
  };

  const directWhatsAppUrl = `https://wa.me/8801710000000?text=${encodeURIComponent(
    `Hello AriseSell, my name is ${name || "a merchant"}. I want to know more about automated sales.`
  )}`;

  return (
    <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
      {/* Hero Header */}
      <div className="pt-32 lg:pt-40 pb-12">
        <Reveal>
          <Eyebrow>{t("Contact us", "যোগাযোগ")}</Eyebrow>
          <h1 className="mt-4 max-w-3xl text-balance font-display text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            {t(
              "Let’s talk about automating your sales.",
              "আপনার ব্যবসার বিক্রি বাড়াতে আমরা সাথে আছি।"
            )}
          </h1>
          <p className="mt-5 max-w-2xl text-[16.5px] leading-relaxed text-text-2">
            {t(
              "Have questions about connecting your Facebook page, WhatsApp, or courier API? Send us a message or chat with our Dhaka team directly.",
              "ফেসবুক পেজ, হোয়াটসঅ্যাপ বা কুরিয়ার এপিআই কানেক্ট করা নিয়ে যেকোনো প্রশ্ন থাকলে মেসেজ দিন বা ঢাকার টিমের সাথে সরাসরি কথা বলুন।"
            )}
          </p>
        </Reveal>
      </div>

      {/* Main Grid: Contact Channels + Form */}
      <div className="grid grid-cols-1 gap-8 pb-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
        {/* Left: Interactive Form */}
        <Reveal>
          <Panel className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={SPRING_SOFT}
                  className="py-12 text-center"
                >
                  <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-signal-wash text-signal">
                    <IconCheck width={28} height={28} />
                  </div>
                  <h3 className="mt-5 font-display text-[22px] font-semibold tracking-tight text-text">
                    {t("Thank you! We received your message.", "ধন্যবাদ! আপনার বার্তা পেয়েছি।")}
                  </h3>
                  <p className="mx-auto mt-2.5 max-w-md text-[14.5px] leading-relaxed text-text-2">
                    {t(
                      `Our team will reach out to you at ${phone} shortly (usually within 15 minutes during office hours).`,
                      `আমাদের টিম খুব দ্রুত আপনার ${phone} নম্বরে যোগাযোগ করবে (অফিস টাইমে সাধারণত ১৫ মিনিটের মধ্যে)।`
                    )}
                  </p>

                  <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                    <Button href={directWhatsAppUrl} target="_blank" size="md">
                      <IconWhatsApp width={16} height={16} />
                      {t("Chat instantly on WhatsApp", "হোয়াটসঅ্যাপে চ্যাট করুন")}
                    </Button>
                    <Button
                      variant="quiet"
                      size="md"
                      onClick={() => {
                        setSubmitted(false);
                        setName("");
                        setPhone("");
                        setPageUrl("");
                        setMessage("");
                      }}
                    >
                      {t("Send another inquiry", "নতুন বার্তা লিখুন")}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <form key="form" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <h3 className="font-display text-[20px] font-semibold tracking-tight text-text">
                      {t("Send an inquiry", "আমাদের জানান আপনার প্রয়োজন")}
                    </h3>
                    <p className="mt-1 text-[13.5px] text-text-3">
                      {t(
                        "Fill in the details below and we will get back to you with a custom plan.",
                        "নিচের তথ্যগুলো দিন, আমরা দ্রুত সঠিক সমাধান নিয়ে আপনার সাথে যোগাযোগ করব।"
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[13px] font-medium text-text-2">
                        {t("Your Name", "আপনার নাম")} <span className="text-coral">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t("e.g. Tanvir Ahmed", "যেমন: তানভীর আহমেদ")}
                        className="mt-1.5 w-full rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-[14px] text-text transition-colors placeholder:text-text-3/60 focus:border-signal focus:bg-white focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-text-2">
                        {t("Phone / WhatsApp", "ফোন বা হোয়াটসঅ্যাপ")} <span className="text-coral">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="017XXXXXXXX"
                        className="mt-1.5 w-full rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-[14px] text-text transition-colors placeholder:text-text-3/60 focus:border-signal focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-text-2">
                      {t("Facebook Page / Store Link (Optional)", "ফেসবুক পেজ বা শপের লিংক (ঐচ্ছিক)")}
                    </label>
                    <input
                      type="text"
                      value={pageUrl}
                      onChange={(e) => setPageUrl(e.target.value)}
                      placeholder={t("facebook.com/yourshop or website", "facebook.com/yourshop বা ওয়েবসাইট")}
                      className="mt-1.5 w-full rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-[14px] text-text transition-colors placeholder:text-text-3/60 focus:border-signal focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-text-2">
                      {t("Daily Order Volume", "দৈনিক গড় অর্ডার")}
                    </label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {ORDER_RANGES.map((r) => {
                        const selected = volume === r.id;
                        return (
                          <button
                            type="button"
                            key={r.id}
                            onClick={() => setVolume(r.id)}
                            className={cx(
                              "rounded-lg border px-2.5 py-2 text-center text-[12px] font-medium transition-all",
                              selected
                                ? "border-signal bg-signal-wash text-signal font-semibold"
                                : "border-line bg-surface-2/40 text-text-2 hover:bg-surface-2"
                            )}
                          >
                            {t(r.en, r.bn)}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-text-2">
                      {t("Message or Questions", "আপনার বার্তা বা কোনো নির্দিষ্ট প্রশ্ন")}
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t(
                        "Tell us about your products or current inbox challenges...",
                        "আপনার প্রোডাক্ট বা ইনবক্সের বর্তমান সমস্যা সম্পর্কে জানান..."
                      )}
                      className="mt-1.5 w-full rounded-xl border border-line bg-surface-2/60 px-3.5 py-2.5 text-[14px] text-text transition-colors placeholder:text-text-3/60 focus:border-signal focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                      {t("Submit Inquiry", "মেসেজ পাঠান")}
                      <IconArrow width={15} height={15} />
                    </Button>
                    <p className="mt-2.5 text-[12px] text-text-3">
                      {t(
                        "🔒 We respect your privacy. No spam, ever.",
                        "🔒 আপনার তথ্য সম্পূর্ণ নিরাপদ। কোনো স্প্যাম মেসেজ পাঠানো হবে না।"
                      )}
                    </p>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </Panel>
        </Reveal>

        {/* Right: Contact Channels Info */}
        <div className="space-y-4">
          <Reveal delay={0.06}>
            <Panel className="p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-mint/10 text-mint">
                  <IconWhatsApp width={22} height={22} />
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-[16px] font-semibold text-text">
                      {t("WhatsApp Direct", "হোয়াটসঅ্যাপ সরাসরি")}
                    </h4>
                    <Badge tone="mint" dot>
                      {t("Fastest reply", "দ্রুত উত্তর")}
                    </Badge>
                  </div>
                  <p className="mt-1 text-[13px] text-text-3">
                    {t(
                      "Chat with an onboarding engineer directly.",
                      "আমাদের অনবোর্ডিং ইঞ্জিনিয়ারের সাথে সরাসরি চ্যাট করুন।"
                    )}
                  </p>
                  <a
                    href="https://wa.me/8801710000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 font-medium text-[14px] text-signal hover:underline"
                  >
                    {PHONE}
                    <IconArrow width={14} height={14} />
                  </a>
                </div>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={0.12}>
            <Panel className="p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-signal-wash text-signal">
                  <IconClock width={20} height={20} />
                </span>
                <div className="flex-1">
                  <h4 className="font-display text-[16px] font-semibold text-text">
                    {t("Office & Calling Hours", "অফিস ও যোগাযোগের সময়")}
                  </h4>
                  <p className="mt-1 text-[13px] text-text-3">
                    {t(
                      "Online support: 24/7 AI & human escalation.",
                      "অনলাইন সাপোর্ট: ২৪/৭ এআই এবং হিউম্যান ব্যাকআপ।"
                    )}
                  </p>
                  <p className="mt-1 text-[13px] text-text-2 font-medium">
                    {t(
                      "Phone Support: 10:00 AM – 8:00 PM (Sat–Thu)",
                      "ফোন সাপোর্ট: সকাল ১০টা – রাত ৮টা (শনি–বৃহস্পতি)"
                    )}
                  </p>
                  <a
                    href={`tel:${PHONE_INT}`}
                    className="mt-2 block text-[13.5px] text-text-2 hover:text-signal"
                  >
                    {PHONE}
                  </a>
                </div>
              </div>
            </Panel>
          </Reveal>

          <Reveal delay={0.18}>
            <Panel className="p-6">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-text-2">
                  <IconGlobe width={20} height={20} />
                </span>
                <div className="flex-1">
                  <h4 className="font-display text-[16px] font-semibold text-text">
                    {t("Email & Headquarters", "ইমেইল ও অফিস")}
                  </h4>
                  <p className="mt-1 text-[13px] text-text-3">
                    {t("For partnerships, enterprise or billing queries:", "পার্টনারশিপ বা এন্টারপ্রাইজ inquiries:")}
                  </p>
                  <a
                    href={`mailto:${BRAND.supportEmail}`}
                    className="mt-1 block text-[13.5px] font-medium text-signal hover:underline"
                  >
                    {BRAND.supportEmail}
                  </a>
                  <p className="mt-2 text-[12.5px] text-text-3">
                    Road 11, Banani, Dhaka 1213, Bangladesh
                  </p>
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>

      {/* FAQ Section */}
      <section className="border-t border-line py-16 lg:py-20">
        <Reveal>
          <div className="text-center">
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold tracking-tight">
              {t("Common questions before contacting", "সাধারণ কিছু প্রশ্নোত্তর")}
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
          {CONTACT_FAQS.map((faq, idx) => (
            <Reveal key={idx} delay={idx * 0.08}>
              <Panel className="h-full p-6">
                <h4 className="font-display text-[16px] font-semibold text-text">
                  {t(faq.qEn, faq.qBn)}
                </h4>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-2">
                  {t(faq.aEn, faq.aBn)}
                </p>
              </Panel>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}

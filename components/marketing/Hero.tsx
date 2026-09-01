"use client";

import { motion } from "framer-motion";
import LiveClose from "./LiveClose";
import { Button } from "@/components/ui/primitives";
import { IconArrow, IconCheck } from "@/components/ui/icons";
import { Magnetic, SPRING_SOFT, SplitWords } from "@/components/motion";
import { HEADLINE_STATS } from "@/data/marketing";
import { MERCHANTS } from "@/data/tenant";
import { Marquee } from "@/components/motion";
import { useLang } from "@/lib/i18n";

const REASSURE = [
  { en: "No card needed", bn: "কার্ড লাগবে না" },
  { en: "Set up in 10 minutes", bn: "১০ মিনিটেই সেটআপ" },
  { en: "Cancel anytime", bn: "যখন খুশি বন্ধ" },
];

export default function Hero() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden pb-12 pt-20 lg:pb-16 lg:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-48 left-1/2 h-130 w-225 -translate-x-1/2 rounded-full opacity-70 blur-[130px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(10,110,80,0.14), rgba(5,98,68,0.06) 55%, transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.96fr)] lg:gap-12 lg:px-6">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_SOFT}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-(--signal-line) bg-white py-1.5 pl-2 pr-4 shadow-[0_1px_2px_rgba(15,20,25,0.04)]"
          >
            <span className="rounded-full bg-signal px-2 py-0.5 font-(family-name:--font-hind) text-[11px] font-semibold text-white">
              নতুন
            </span>
            <span className="text-[13px] text-text-2">
              {t(
                "You only pay for orders it actually closes",
                "যত অর্ডার ক্লোজ হবে, শুধু ততটুকুরই খরচ",
              )}
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(2.3rem,5vw,3.6rem)] font-semibold leading-[1.06] tracking-[-0.03em] text-text">
            <SplitWords
              text={t("Your shop keeps selling", "দোকান বন্ধ থাকলেও")}
            />
            <br />
            <SplitWords
              text={t("after you close it.", "বিক্রি চলতে থাকে।")}
              delay={0.16}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.4 }}
            className="mt-4 font-(family-name:--font-hind) text-[19px] leading-relaxed text-signal"
          >
            {t(
              "Instant replies, complete order taking, and courier booking — 100% on autopilot.",
              "কাস্টমার মেসেজ করলেই উত্তর, অর্ডার, আর কুরিয়ার বুকিং — সব নিজে থেকেই।",
            )}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.5 }}
            className="mt-5 max-w-lg text-pretty text-[16.5px] leading-relaxed text-text-2"
          >
            {t(
              "NextProduct answers your customers on WhatsApp, Messenger and Instagram in their own language, takes the complete order, books Steadfast or Pathao, and sends the invoice — while you sleep, eat, or serve someone standing in front of you.",
              "NextProduct আপনার কাস্টমারকে হোয়াটসঅ্যাপ, মেসেঞ্জার আর ইনস্টাগ্রামে তাদের নিজের ভাষায় উত্তর দেয়, পুরো অর্ডার নেয়, স্টেডফাস্ট বা পাঠাও বুক করে, আর চালান পাঠিয়ে দেয় — আপনি যখন ঘুমাচ্ছেন, খাচ্ছেন, বা সামনের কাস্টমারকে দেখছেন।",
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.6 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Button href="/console" size="lg" className="group">
                {t("Start free — 40 orders", "ফ্রি শুরু করুন — ৪০ অর্ডার")}
                <IconArrow
                  width={16}
                  height={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Button>
            </Magnetic>
            <Magnetic strength={0.18}>
              <Button href="/platform" size="lg" variant="outline">
                {t("See how it works", "কীভাবে কাজ করে দেখুন")}
              </Button>
            </Magnetic>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.5 }}
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2"
          >
            {REASSURE.map((r) => (
              <li
                key={r.en}
                className="flex items-center gap-1.5 text-[13px] text-text-3"
              >
                <IconCheck width={13} height={13} className="text-signal" />
                {t(r.en, r.bn)}
              </li>
            ))}
          </motion.ul>
        </div>

        <LiveClose />
      </div>

      {/* stats + merchants */}
      <div className="relative mx-auto mt-20 max-w-7xl px-5 lg:px-8">
        <motion.dl
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING_SOFT}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-[0_1px_2px_rgba(15,20,25,0.04)] lg:grid-cols-4"
        >
          {HEADLINE_STATS.map((s) => (
            <div key={s.label} className="bg-white px-5 py-6 text-center">
              <dt className="font-display text-[clamp(1.4rem,2.6vw,1.9rem)] font-semibold tracking-tight text-signal">
                {t(s.value, s.valueBn)}
              </dt>
              <dd className="mt-1.5 text-[12.5px] leading-snug text-text-3">
                {t(s.label, s.labelBn)}
              </dd>
            </div>
          ))}
        </motion.dl>
      </div>

      <div className="relative mt-12">
        <p className="mb-4 text-center text-[13px] text-text-3">
          {t(
            "Trusted by growing shops across Bangladesh",
            "সারা বাংলাদেশের বাড়ন্ত দোকানগুলোর ভরসা",
          )}
        </p>
        <Marquee>
          {MERCHANTS.map((m, i) => (
            <span
              key={`${m}-${i}`}
              className="flex items-center gap-3 whitespace-nowrap px-6 font-display text-[17px] font-medium text-text-2"
            >
              {m}
              <span aria-hidden className="size-1 rounded-full bg-line" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

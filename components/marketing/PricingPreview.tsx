"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PLANS, OVERAGE, OVERAGE_BN } from "@/data/plans";
import { Button, Panel } from "@/components/ui/primitives";
import { IconCheck } from "@/components/ui/icons";
import { Reveal, Stagger, StaggerItem, SPRING } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

export default function PricingPreview() {
  const { t } = useLang();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const isYearly = billingCycle === "yearly";

  return (
    <section
      id="pricing"
      className="relative border-t border-line py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* ─── Header ─── */}
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-(family-name:--font-hind) text-[15px] font-medium text-signal">
              {t("Transparent pricing", "সহজ ও স্বচ্ছ দাম")}
            </p>
            <h2 className="mt-3 text-balance font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              {t(
                "You pay for orders, not conversations.",
                "টাকা দেবেন অর্ডারের জন্য, কথার জন্য নয়।",
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-text-2">
              {t(
                "If a hundred people ask about price and nobody buys, that costs you nothing. We only earn when you do.",
                "একশো জন দাম জিজ্ঞেস করে কেউ না কিনলে আপনার এক টাকাও খরচ নেই। আপনি আয় করলেই কেবল আমরা আয় করি।",
              )}
            </p>

            {/* ─── Claude-Style Minimalist Pill Toggle ─── */}
            <div className="mt-8 inline-flex items-center justify-center">
              <div className="relative inline-flex items-center rounded-full border border-line bg-surface-2/70 p-1 shadow-2xs backdrop-blur-xs">
                {/* Monthly Button */}
                <button
                  type="button"
                  onClick={() => setBillingCycle("monthly")}
                  className={cx(
                    "relative z-10 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors cursor-pointer",
                    !isYearly ? "text-text" : "text-text-3 hover:text-text",
                  )}
                >
                  {!isYearly && (
                    <motion.div
                      layoutId="claude-pricing-pill"
                      className="absolute inset-0 z-[-1] rounded-full bg-white shadow-xs border border-line/80"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span>{t("Monthly billing", "মাসিক বিলিং")}</span>
                </button>

                {/* Yearly Button with Claude-like Discount Chip */}
                <button
                  type="button"
                  onClick={() => setBillingCycle("yearly")}
                  className={cx(
                    "relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors cursor-pointer",
                    isYearly ? "text-text" : "text-text-3 hover:text-text",
                  )}
                >
                  {isYearly && (
                    <motion.div
                      layoutId="claude-pricing-pill"
                      className="absolute inset-0 z-[-1] rounded-full bg-white shadow-xs border border-line/80"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span>{t("Annual billing", "বাৎসরিক বিলিং")}</span>
                  <span className="rounded-full bg-signal/[0.12] px-2 py-0.5 text-[11px] font-bold text-signal font-mono">
                    {t("Save 17%", "১৭% ছাড় · ২ মাস ফ্রি")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ─── Pricing Cards Grid ─── */}
        <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => {
            const features = t(p.features, p.featuresBn);
            const isFree = p.price === 0;

            // Yearly price calculation
            const displayedPrice = isFree
              ? 0
              : isYearly
                ? Math.round(p.yearlyPrice / 12)
                : p.price;

            const yearlyTotal = p.yearlyPrice;
            const savings = p.price * 12 - yearlyTotal;

            return (
              <StaggerItem key={p.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={SPRING}
                  className={cx(
                    "relative flex h-full flex-col justify-between rounded-2xl border bg-white p-6 transition-shadow",
                    p.featured
                      ? "border-(--signal-line) shadow-[0_2px_8px_rgba(10,110,80,0.08),0_18px_40px_-20px_rgba(10,110,80,0.35)] ring-1 ring-signal/20"
                      : "border-line shadow-[0_1px_2px_rgba(15,20,25,0.04)] hover:border-line-2",
                  )}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-signal px-3.5 py-0.5 text-[11.5px] font-bold text-white shadow-[0_4px_12px_-4px_rgba(10,110,80,0.6)]">
                      {t("Most Popular", "সবচেয়ে জনপ্রিয়")}
                    </span>
                  )}

                  <div>
                    {/* Title */}
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display text-[20px] font-semibold tracking-tight text-text">
                        {t(p.name, p.nameBn)}
                      </h3>
                      {t(
                        <span className="font-(family-name:--font-hind) text-[13.5px] text-text-3">
                          {p.nameBn}
                        </span>,
                        null,
                      )}
                    </div>

                    {/* Price Header */}
                    <div className="mt-4 border-y border-line/60 py-3.5 space-y-1">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-display text-[38px] font-bold leading-none tracking-tight text-text font-(family-name:--font-bricolage)">
                          {isFree
                            ? "৳০"
                            : `৳${displayedPrice.toLocaleString("en-IN")}`}
                        </span>
                        <span className="text-[13px] text-text-3 font-mono">
                          {isFree
                            ? t("free forever", "চিরকাল ফ্রি")
                            : t("/ month", "/ মাস")}
                        </span>
                      </div>

                      {/* Yearly breakdown info */}
                      {isYearly && !isFree && (
                        <div className="flex items-center justify-between text-[11.5px] font-mono pt-0.5">
                          <span className="text-text-3">
                            {t(
                              `Billed ৳${yearlyTotal.toLocaleString("en-IN")}/yr`,
                              `বাৎসরিক ৳${yearlyTotal.toLocaleString("en-IN")}`,
                            )}
                          </span>
                          <span className="text-signal font-bold bg-signal/[0.08] px-1.5 py-0.2 rounded border border-signal/20">
                            {t(
                              `Save ৳${savings.toLocaleString("en-IN")}`,
                              `সাশ্রয় ৳${savings.toLocaleString("en-IN")}`,
                            )}
                          </span>
                        </div>
                      )}

                      <p className="pt-1 text-[13.5px] font-semibold text-signal">
                        {t(
                          `${p.orders.toLocaleString()} orders included`,
                          `${p.orders.toLocaleString()} অর্ডার অন্তর্ভুক্ত`,
                        )}
                      </p>
                    </div>

                    <p className="mt-3 min-h-10 text-[13.5px] leading-snug text-text-3">
                      {t(p.blurb, p.blurbBn)}
                    </p>

                    <div className="mt-5">
                      <Button
                        href="/console"
                        size="lg"
                        variant={p.featured ? "signal" : "outline"}
                        className="w-full font-semibold shadow-2xs cursor-pointer"
                      >
                        {t(p.cta, p.ctaBn)}
                      </Button>
                    </div>

                    <ul className="mt-6 space-y-2.5 border-t border-line/60 pt-5">
                      {features.slice(0, 5).map((f: string) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <IconCheck
                            width={13}
                            height={13}
                            className="mt-0.5 shrink-0 text-signal"
                          />
                          <span className="text-[13.5px] leading-snug text-text-2">
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              </StaggerItem>
            );
          })}
        </Stagger>

        <Reveal delay={0.15}>
          <p className="mt-8 text-center text-[13.5px] text-text-3">
            {t(OVERAGE, OVERAGE_BN)}
          </p>
        </Reveal>

        {/* Pricing Model Comparison Table */}
        <div className="mt-16 border-t border-line pt-14">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t(
                  "Why outcome billing matters to your business",
                  "কেন অর্ডারের ভিত্তিতে বিলিং আপনার জন্য লাভজনক",
                )}
              </h3>
              <p className="mt-2 text-[14px] text-text-3">
                {t(
                  "Most tools charge for empty greetings. NextProduct charges only when an order is actually closed.",
                  "সাধারণ চ্যাটবট প্রতিটি সাধারণ মেসেজের জন্য বিল কাটে। NextProduct কেবল নিশ্চিত বিক্রির পর কাজ করে।",
                )}
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="mt-8">
            <Panel className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-2/40">
                    <th className="px-5 py-4 font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                      {t("Pricing Metric", "বিলিং মডেল")}
                    </th>
                    <th className="px-5 py-4 font-display text-[14px] font-bold text-signal">
                      NextProduct AI
                    </th>
                    <th className="px-5 py-4 font-display text-[14px] font-medium text-text-3">
                      {t("Per-conversation bots", "মেসেজ-ভিত্তিক বট")}
                    </th>
                    <th className="px-5 py-4 font-display text-[14px] font-medium text-text-3">
                      {t("Human Page Admin", "মাসিক বেতনভুক্ত অ্যাডমিন")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60 text-[13px]">
                  <tr>
                    <td className="px-5 py-3.5 font-medium text-text">
                      {t("What you pay for", "কিসের জন্য টাকা দিচ্ছেন")}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-signal">
                      {t("Closed order with delivery slip", "কনফার্মড অর্ডার")}
                    </td>
                    <td className="px-5 py-3.5 text-text-3">
                      {t(
                        "Every user message / greeting",
                        "প্রতিটি হ্যালো/দাম জিজ্ঞেস",
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-text-3">
                      {t(
                        "Fixed monthly salary regardless",
                        "ফিক্সড মাসিক বেতন",
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-medium text-text">
                      {t(
                        "Chats with no purchase (দাম কত? & vanish)",
                        "দাম জিজ্ঞেস করে না কিনলে",
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-signal">
                      ৳০ (Free)
                    </td>
                    <td className="px-5 py-3.5 text-text-3">
                      {t("Billed full rate", "ফুল চার্জ কাটে")}
                    </td>
                    <td className="px-5 py-3.5 text-text-3">
                      {t("Included in salary", "বেতনের টাকা খরচ")}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3.5 font-medium text-text">
                      {t("Courier 1-click booking", "কুরিয়ার অটো-বুকিং")}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-signal">
                      {t(
                        "Included (Steadfast & Pathao)",
                        "সম্পূর্ণ অন্তর্ভুক্ত",
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-text-3">
                      {t("Not available", "নেই")}
                    </td>
                    <td className="px-5 py-3.5 text-text-3">
                      {t("Manual copy-paste error prone", "ম্যানুয়াল টাইপিং")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

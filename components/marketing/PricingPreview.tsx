"use client";

import { motion } from "framer-motion";
import { PLANS, OVERAGE, OVERAGE_BN } from "@/data/plans";
import { Button, Panel } from "@/components/ui/primitives";
import { IconCheck } from "@/components/ui/icons";
import { Reveal, Stagger, StaggerItem, SPRING } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

export default function PricingPreview() {
  const { t } = useLang();
  return (
    <section
      id="pricing"
      className="relative border-t border-line py-20 lg:py-28"
    >
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-[family-name:var(--font-hind)] text-[15px] font-medium text-signal">
              {t("Transparent pricing", "সহজ দাম")}
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
          </div>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PLANS.map((p) => {
            const features = t(p.features, p.featuresBn);
            return (
              <StaggerItem key={p.id}>
                <motion.div
                  whileHover={{ y: -5 }}
                  transition={SPRING}
                  className={cx(
                    "relative flex h-full flex-col rounded-2xl border bg-white p-6",
                    p.featured
                      ? "border-[color:var(--signal-line)] shadow-[0_2px_8px_rgba(10,110,80,0.08),0_18px_40px_-20px_rgba(10,110,80,0.35)]"
                      : "border-line shadow-[0_1px_2px_rgba(15,20,25,0.04)]",
                  )}
                >
                  {p.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-signal px-3 py-1 text-[11.5px] font-semibold text-white shadow-[0_4px_12px_-4px_rgba(10,110,80,0.6)]">
                      {t("Most Popular", "সবচেয়ে জনপ্রিয়")}
                    </span>
                  )}

                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-[20px] font-semibold tracking-tight text-text">
                      {t(p.name, p.nameBn)}
                    </h3>
                    {t(
                      <span className="font-[family-name:var(--font-hind)] text-[14px] text-text-3">
                        {p.nameBn}
                      </span>,
                      null,
                    )}
                  </div>

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="font-display text-[38px] font-semibold leading-none tracking-tight text-text">
                      ৳{p.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[13px] text-text-3">
                      {p.price === 0
                        ? t("free forever", "চিরকাল ফ্রি")
                        : t("/ month", "/ মাস")}
                    </span>
                  </div>

                  <p className="mt-3 text-[14px] font-medium text-signal">
                    {t(
                      `${p.orders.toLocaleString()} orders included`,
                      `${p.orders.toLocaleString()} অর্ডার অন্তর্ভুক্ত`,
                    )}
                  </p>
                  <p className="mt-2 min-h-[40px] text-[13.5px] leading-snug text-text-3">
                    {t(p.blurb, p.blurbBn)}
                  </p>

                  <div className="mt-5">
                    <Button
                      href="/console"
                      size="lg"
                      variant={p.featured ? "signal" : "outline"}
                      className="w-full"
                    >
                      {t(p.cta, p.ctaBn)}
                    </Button>
                  </div>

                  <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
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
              <table className="w-full min-w-[620px] text-left">
                <thead>
                  <tr className="border-b border-line bg-surface-2/40">
                    <th className="px-5 py-3.5 font-mono text-[11px] uppercase tracking-wider text-text-3">
                      {t("Feature", "বিষয়")}
                    </th>
                    <th className="px-5 py-3.5 font-display text-[14px] font-semibold text-signal">
                      NextProduct
                    </th>
                    <th className="px-5 py-3.5 font-display text-[14px] font-medium text-text-3">
                      {t("Per-conversation bots", "অন্যান্য চ্যাটবট")}
                    </th>
                    <th className="px-5 py-3.5 font-display text-[14px] font-medium text-text-3">
                      {t("Hired page admin", "নিযুক্ত পেজ অ্যাডমিন")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: t("What you pay for", "কিসের জন্য টাকা দেবেন"),
                      np: t("A closed order", "সফল নিশ্চিত অর্ডার"),
                      bot: t("Every message / chat", "প্রতিটি মেসেজ / চ্যাট"),
                      human: t("Monthly fixed salary", "মাসিক নির্দিষ্ট বেতন"),
                    },
                    {
                      label: t(
                        "A customer who just asks price & leaves",
                        "দাম জিজ্ঞেস করে চলে যাওয়া চ্যাট",
                      ),
                      np: t("৳0 (Free)", "৳০ (ফ্রি)"),
                      bot: t("Charged", "টাকা কাটে"),
                      human: t("Time wasted", "সময় নষ্ট"),
                    },
                    {
                      label: t("Cancelled order", "বাতিলকৃত অর্ডার"),
                      np: t("Credited back", "টাকা ফেরত"),
                      bot: t("Charged", "টাকা কাটে"),
                      human: t("Charged", "বেতন দিতে হয়"),
                    },
                    {
                      label: t(
                        "Slow month (Low sales)",
                        "মন্দার মাস (কম বিক্রি)",
                      ),
                      np: t("You pay less", "কম খরচ"),
                      bot: t("You pay the same", "একই খরচ"),
                      human: t("Full salary required", "পুরো বেতন দিতে হয়"),
                    },
                    {
                      label: t(
                        "3:00 AM Instant response",
                        "রাত ৩টায় তাৎক্ষণিক উত্তর",
                      ),
                      np: t("Instant & accurate", "তাত্ক্ষণিক ও সঠিক"),
                      bot: t("Robotic reply", "রোবটিক রিপ্লাই"),
                      human: t("Sleeping / Unavailable", "ঘুমন্ত / অনুপলব্ধ"),
                    },
                  ].map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-line-soft last:border-0 hover:bg-surface-2/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-[13px] font-medium text-text-2">
                        {row.label}
                      </td>
                      <td className="px-5 py-3.5 text-[13.5px] font-semibold text-signal">
                        {row.np}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-text-3">
                        {row.bot}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-text-3">
                        {row.human}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

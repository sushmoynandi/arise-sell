"use client";

import { motion } from "framer-motion";
import { PLANS, OVERAGE } from "@/data/plans";
import { Button } from "@/components/ui/primitives";
import { IconArrow, IconCheck } from "@/components/ui/icons";
import { Reveal, Stagger, StaggerItem, SPRING } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

export default function PricingPreview() {
  const { t } = useLang();
  return (
    <section id="pricing" className="relative border-t border-line py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-[family-name:var(--font-hind)] text-[15px] font-medium text-signal">
              সহজ দাম
            </p>
            <h2 className="mt-3 text-balance font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              {t("You pay for orders, not conversations.", "টাকা দেবেন অর্ডারের জন্য, কথার জন্য নয়।")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-text-2">
              {t(
                "If a hundred people ask about price and nobody buys, that costs you nothing. We only earn when you do.",
                "একশো জন দাম জিজ্ঞেস করে কেউ না কিনলে আপনার এক টাকাও খরচ নেই। আপনি আয় করলেই কেবল আমরা আয় করি।"
              )}
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {PLANS.map((p) => (
            <StaggerItem key={p.id}>
              <motion.div
                whileHover={{ y: -5 }}
                transition={SPRING}
                className={cx(
                  "relative flex h-full flex-col rounded-2xl border bg-white p-6",
                  p.featured
                    ? "border-[color:var(--signal-line)] shadow-[0_2px_8px_rgba(10,110,80,0.08),0_18px_40px_-20px_rgba(10,110,80,0.35)]"
                    : "border-line shadow-[0_1px_2px_rgba(15,20,25,0.04)]"
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-signal px-3 py-1 text-[11.5px] font-semibold text-white shadow-[0_4px_12px_-4px_rgba(10,110,80,0.6)]">
                    সবচেয়ে জনপ্রিয়
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
                    null
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
                    `${p.orders.toLocaleString()} অর্ডার অন্তর্ভুক্ত`
                  )}
                </p>
                <p className="mt-2 min-h-[40px] text-[13.5px] leading-snug text-text-3">{p.blurb}</p>

                <div className="mt-5">
                  <Button
                    href="/console"
                    size="lg"
                    variant={p.featured ? "signal" : "outline"}
                    className="w-full"
                  >
                    {p.cta}
                  </Button>
                </div>

                <ul className="mt-6 space-y-2.5 border-t border-line pt-5">
                  {p.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <IconCheck width={13} height={13} className="mt-0.5 shrink-0 text-signal" />
                      <span className="text-[13.5px] leading-snug text-text-2">{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-center text-[13.5px] text-text-3">{OVERAGE}</p>
            <Button href="/pricing" variant="ghost" size="md" className="group">
              {t("Compare every plan", "সব প্ল্যান দেখুন")}
              <IconArrow
                width={15}
                height={15}
                className="transition-transform duration-200 group-hover:translate-x-1"
              />
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

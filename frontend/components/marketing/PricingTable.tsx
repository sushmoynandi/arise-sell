"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import { IconCheck, IconClose } from "@/components/ui/icons";
import {
  Magnetic,
  SPRING,
  Stagger,
  StaggerItem,
} from "@/components/motion";
import { ENTERPRISE, OVERAGE, PLANS } from "@/data/plans";
import { cx } from "@/lib/format";

export default function PricingTable() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const isYearly = billingCycle === "yearly";

  return (
    <>
      {/* ─── Claude-Style Minimalist Pill Toggle ─── */}
      <div className="mb-10 flex justify-center">
        <div className="relative inline-flex items-center rounded-full border border-line bg-surface-2/70 p-1 shadow-2xs backdrop-blur-xs">
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
                layoutId="pricing-page-pill"
                className="absolute inset-0 z-[-1] rounded-full bg-white shadow-xs border border-line/80"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span>Monthly billing</span>
          </button>

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
                layoutId="pricing-page-pill"
                className="absolute inset-0 z-[-1] rounded-full bg-white shadow-xs border border-line/80"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span>Annual billing</span>
            <span className="rounded-full bg-signal/[0.12] px-2 py-0.5 text-[11px] font-bold text-signal font-mono">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <Stagger
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        amount={0.05}
      >
        {PLANS.map((p) => {
          const isFree = p.price === 0;
          const displayedPrice = isFree
            ? 0
            : isYearly
              ? Math.round(p.yearlyPrice / 12)
              : p.price;
          const yearlyTotal = p.yearlyPrice;
          const savings = p.price * 12 - yearlyTotal;

          return (
            <StaggerItem key={p.id}>
              <Panel
                className={cx(
                  "relative flex h-full flex-col justify-between p-6",
                  p.featured && "border-(--signal-line) ring-1 ring-signal/20",
                )}
              >
                {p.featured && (
                  <>
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-px -z-10 rounded-[14px] opacity-40 blur-xl"
                      style={{
                        background:
                          "radial-gradient(60% 50% at 50% 0%, rgba(10,110,80,0.16), transparent)",
                      }}
                    />
                    <Badge tone="signal" className="absolute -top-2.5 left-6">
                      Most shops start here
                    </Badge>
                  </>
                )}

                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-display text-[21px] font-semibold tracking-tight text-text">
                      {p.name}
                    </h3>
                    <span className="font-(family-name:--font-hind) text-[14px] text-text-3">
                      {p.nameBn}
                    </span>
                  </div>
                  <p className="mt-2 min-h-10 text-[13px] leading-snug text-text-3">
                    {p.blurb}
                  </p>

                  <div className="mt-5 border-y border-line/60 py-3 space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-display text-[38px] font-bold leading-none tracking-tight text-text font-(family-name:--font-bricolage)">
                        ৳{displayedPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[13px] text-text-3 font-mono">
                        {isFree ? "free forever" : "/ month"}
                      </span>
                    </div>

                    {isYearly && !isFree && (
                      <div className="flex items-center justify-between text-[11.5px] font-mono pt-0.5">
                        <span className="text-text-3">
                          Billed ৳{yearlyTotal.toLocaleString("en-IN")}/yr
                        </span>
                        <span className="text-signal font-bold bg-signal/[0.08] px-1.5 py-0.2 rounded border border-signal/20">
                          Save ৳{savings.toLocaleString("en-IN")}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 rounded-lg border border-line bg-surface-2/60 px-3.5 py-2.5">
                    <p className="font-display text-[16px] font-semibold tracking-tight text-signal">
                      {p.orders.toLocaleString()} closed orders
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-text-3">
                      included every month
                    </p>
                  </div>

                  <div className="mt-6">
                    <Magnetic strength={0.15} className="w-full">
                      <Button
                        href="/console"
                        variant={p.featured ? "signal" : "outline"}
                        size="lg"
                        className="w-full font-semibold shadow-2xs cursor-pointer"
                      >
                        {p.cta}
                      </Button>
                    </Magnetic>
                  </div>

                  <ul className="mt-7 space-y-2.5">
                    {p.features.map((f, i) => (
                      <motion.li
                        key={f}
                        initial={{ opacity: 0, x: -8 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ ...SPRING, delay: i * 0.03 }}
                        className="flex items-start gap-2.5"
                      >
                        <IconCheck
                          width={13}
                          height={13}
                          className="mt-0.5 shrink-0 text-signal"
                        />
                        <span className="text-[13px] leading-snug text-text-2">
                          {f}
                        </span>
                      </motion.li>
                    ))}
                    {p.absent.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 opacity-45">
                        <IconClose
                          width={13}
                          height={13}
                          className="mt-0.5 shrink-0 text-text-3"
                        />
                        <span className="text-[13px] leading-snug text-text-3 line-through">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>
            </StaggerItem>
          );
        })}
      </Stagger>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <Panel className="flex flex-wrap items-center gap-x-8 gap-y-4 p-6">
          <div className="min-w-[220px] flex-1">
            <h3 className="font-display text-[19px] font-semibold tracking-tight">
              {ENTERPRISE.name}
            </h3>
            <p className="mt-1.5 max-w-lg text-[13px] leading-snug text-text-3">
              {ENTERPRISE.blurb}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {ENTERPRISE.points.map((pt) => (
                <li key={pt}>
                  <Badge tone="neutral">{pt}</Badge>
                </li>
              ))}
            </ul>
          </div>
          <Button
            href="https://wa.me/8801710000000"
            target="_blank"
            variant="outline"
            size="lg"
          >
            Talk to us
          </Button>
        </Panel>
      </div>

      <p className="mt-6 text-center font-mono text-[12px] text-text-3">
        {OVERAGE}
      </p>
    </>
  );
}

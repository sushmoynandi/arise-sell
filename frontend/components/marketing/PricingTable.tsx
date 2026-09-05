"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import { IconCheck, IconTag } from "@/components/ui/icons";
import { Magnetic, SPRING, Stagger, StaggerItem } from "@/components/motion";
import { ENTERPRISE, OVERAGE } from "@/data/plans";
import { cx } from "@/lib/format";
import { API_BASE } from "@/lib/api-client";

interface BackendPlan {
  id: string;
  name: string;
  nameBn?: string;
  tagline?: string;
  priceBDT: number;
  yearlyPriceBDT?: number;
  yearlyDiscountPercent?: number;
  billingPeriod?: string;
  messageLimit: number;
  catalogLimit?: number;
  courierChannels?: number;
  features: string[];
  badge?: string | null;
  popular?: boolean;
  status?: string;
}

export default function PricingTable() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const isYearly = billingCycle === "yearly";

  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadPlans() {
      try {
        const apiUrl = API_BASE || "/api/v1";
        const res = await fetch(`${apiUrl}/plans`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data)) {
            setPlans(data);
          }
        }
      } catch (err) {
        console.error("Failed to load plans in PricingTable:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadPlans();
    return () => {
      mounted = false;
    };
  }, []);

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
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="h-96 rounded-2xl border border-line bg-white p-6 animate-pulse flex flex-col justify-between shadow-2xs"
            >
              <div className="space-y-4">
                <div className="h-6 w-28 bg-surface-2 rounded-md" />
                <div className="h-10 w-36 bg-surface-2 rounded-md" />
                <div className="h-4 w-full bg-surface-2 rounded-md" />
              </div>
              <div className="h-11 w-full bg-surface-2 rounded-xl" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center space-y-3 shadow-2xs max-w-xl mx-auto my-8">
          <div className="size-12 rounded-2xl bg-signal/10 text-signal grid place-items-center mx-auto mb-2">
            <IconTag width={22} height={22} />
          </div>
          <h3 className="font-bold text-text text-base">
            No Subscription Plans Available
          </h3>
          <p className="text-text-3 text-sm max-w-sm mx-auto">
            Plans are being configured by the administrator. Please check back
            shortly.
          </p>
        </div>
      ) : (
        <Stagger
          className={cx(
            "grid grid-cols-1 gap-4",
            plans.length === 1 && "max-w-md mx-auto",
            plans.length === 2 && "sm:grid-cols-2 max-w-3xl mx-auto",
            plans.length === 3 &&
              "sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto",
            plans.length >= 4 && "sm:grid-cols-2 lg:grid-cols-4",
          )}
          amount={0.05}
        >
          {plans.map((p) => {
            const isFree = p.priceBDT === 0;
            const yearlyPrice =
              p.yearlyPriceBDT && p.yearlyPriceBDT > 0
                ? p.yearlyPriceBDT
                : p.priceBDT * 10;
            const displayedPrice = isFree
              ? 0
              : isYearly
                ? Math.round(yearlyPrice / 12)
                : p.priceBDT;
            const savings = p.priceBDT * 12 - yearlyPrice;
            const isFeatured = Boolean(
              p.popular ||
              p.badge?.toLowerCase().includes("popular") ||
              p.badge?.toLowerCase().includes("best") ||
              p.badge?.toLowerCase().includes("vip"),
            );

            return (
              <StaggerItem key={p.id}>
                <Panel
                  className={cx(
                    "relative flex h-full flex-col justify-between p-6",
                    isFeatured &&
                      "border-(--signal-line) ring-1 ring-signal/20",
                  )}
                >
                  {p.badge && (
                    <Badge tone="signal" className="absolute -top-2.5 left-6">
                      {p.badge}
                    </Badge>
                  )}

                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-display text-[21px] font-semibold tracking-tight text-text">
                        {p.name}
                      </h3>
                      {p.nameBn && p.nameBn !== p.name && (
                        <span className="font-(family-name:--font-hind) text-[14px] text-text-3">
                          {p.nameBn}
                        </span>
                      )}
                    </div>
                    {p.tagline && (
                      <p className="mt-2 min-h-10 text-[13px] leading-snug text-text-3">
                        {p.tagline}
                      </p>
                    )}

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
                            Billed ৳{yearlyPrice.toLocaleString("en-IN")}/yr
                          </span>
                          {savings > 0 && (
                            <span className="text-signal font-bold bg-signal/[0.08] px-1.5 py-0.2 rounded border border-signal/20">
                              Save ৳{savings.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 rounded-lg border border-line bg-surface-2/60 px-3.5 py-2.5">
                      <p className="font-display text-[16px] font-semibold tracking-tight text-signal">
                        {p.messageLimit.toLocaleString()} Messages / month
                      </p>
                      <p className="mt-0.5 text-[11.5px] text-text-3">
                        included every month (Comment + Inbox)
                      </p>
                    </div>

                    <div className="mt-6">
                      <Magnetic strength={0.15} className="w-full">
                        <Button
                          href="/console"
                          variant={isFeatured ? "signal" : "outline"}
                          size="lg"
                          className="w-full font-semibold shadow-2xs cursor-pointer"
                        >
                          Get Started
                        </Button>
                      </Magnetic>
                    </div>

                    {p.features && p.features.length > 0 && (
                      <ul className="mt-7 space-y-2.5">
                        {p.features.map((f, i) => (
                          <motion.li
                            key={i}
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
                      </ul>
                    )}
                  </div>
                </Panel>
              </StaggerItem>
            );
          })}
        </Stagger>
      )}

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

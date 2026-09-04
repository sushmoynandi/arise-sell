"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel, PanelHead } from "@/components/ui/primitives";
import { IconCheck } from "@/components/ui/icons";
import { TENANT } from "@/data/tenant";
import { PLANS } from "@/data/plans";
import { cx } from "@/lib/format";
import { QuotaBar } from "../components";
import { useSettings } from "../settings-context";

export function TabBilling() {
  const { settings } = useSettings();
  const [topupSuccess, setTopupSuccess] = useState<string | null>(null);

  const planName = settings.plan || TENANT.plan;
  const ordersUsed = settings.ordersUsed ?? TENANT.ordersUsed;
  const ordersQuota = settings.ordersQuota ?? TENANT.ordersQuota;

  const handleTopup = (name: string) => {
    setTopupSuccess(name);
    setTimeout(() => setTopupSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {topupSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-4 text-[13px] text-signal font-medium flex items-center gap-2 shadow-sm"
          >
            <IconCheck width={16} height={16} />
            <span>
              Successfully added <strong>{topupSuccess}</strong>! Quota updated
              immediately.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Plan + Quota */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 rounded-2xl border border-line bg-white p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-signal/15 px-2 py-0.5 font-mono text-[10px] font-bold text-signal uppercase tracking-wider">
                Current Plan
              </span>
              <span className="text-[11px] text-text-3 font-mono">
                Renews in 9 days
              </span>
            </div>
            <h3 className="text-2xl font-bold font-display text-text">
              {planName} Plan
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-text">
                ৳৩,৯৯০
              </span>
              <span className="text-xs text-text-3 font-mono">/ month</span>
            </div>
          </div>
          <div className="pt-3 border-t border-line/60 space-y-1.5 text-xs text-text-2">
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="font-mono font-semibold text-text">
                bKash Auto-Debit
              </span>
            </div>
            <div className="flex justify-between">
              <span>Next Invoice:</span>
              <span className="font-mono font-semibold text-text">
                10 Sep, 2026
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl border border-line bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <h4 className="text-[15px] font-bold text-text">
              Quota Consumption
            </h4>
            <Badge tone="mint">{ordersQuota - ordersUsed} Left</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuotaBar
              label="Closed Orders"
              used={ordersUsed}
              total={ordersQuota}
            />
            <QuotaBar label="Meta CAPI Signals" used={4120} total={10000} />
            <QuotaBar label="Team Seats" used={4} total={8} />
            <QuotaBar label="Vision Searches" used={824} total={2000} />
          </div>
        </div>
      </div>

      {/* 1-Click Top-Up */}
      <Panel>
        <PanelHead
          title="1-Click Quota Top-Up"
          sub="Top-up packs never expire and roll over month-to-month."
        />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {[
            {
              name: "+500 Closed Orders",
              price: "৳১,২৫০",
              unit: "৳২.৫০/order",
              badge: "Most Popular",
            },
            {
              name: "+1,500 Closed Orders",
              price: "৳৩,২০০",
              unit: "৳২.১৩/order",
              badge: "Best Value",
            },
            {
              name: "+5,000 CAPI Signals",
              price: "৳৯৫০",
              unit: "ROAS boost",
              badge: "Ad Signals",
            },
          ].map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-line p-4 space-y-3 bg-surface-2/30 hover:border-signal/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-text">{p.name}</span>
                  <span className="text-[9.5px] font-mono font-bold bg-signal/15 text-signal px-2 py-0.5 rounded">
                    {p.badge}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-display text-text">
                    {p.price}
                  </span>
                  <span className="text-[11px] text-text-3 font-mono">
                    ({p.unit})
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="signal"
                onClick={() => handleTopup(p.name)}
                className="w-full justify-center"
              >
                + Add to Quota
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Plan Comparison */}
      <Panel>
        <PanelHead
          title="Compare Plans"
          sub="Upgrade or downgrade anytime. Unused quota is prorated."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
          {PLANS.map((p) => {
            const isCurrent =
              p.name.toLowerCase() === TENANT.plan.toLowerCase();
            return (
              <div
                key={p.id}
                className={cx(
                  "rounded-2xl border p-4 space-y-3 flex flex-col justify-between",
                  isCurrent
                    ? "border-signal/60 bg-[#edf7f3]/40 ring-1.5 ring-signal/30 shadow-xs"
                    : "border-line bg-white hover:border-line/80",
                )}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-base text-text">{p.name}</h4>
                    {isCurrent && (
                      <span className="rounded bg-signal text-white px-1.5 py-0.5 text-[9.5px] font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-3 min-h-[30px]">
                    {p.blurb}
                  </p>
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-xl font-bold font-display text-text">
                      ৳{p.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-text-3 font-mono">
                      / mo
                    </span>
                  </div>
                  <div className="rounded-lg bg-surface-2/60 p-2 font-mono text-[11px] text-text-2 font-semibold">
                    {p.orders.toLocaleString()} Orders/mo
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isCurrent ? "outline" : "signal"}
                  disabled={isCurrent}
                  className="w-full justify-center"
                >
                  {isCurrent ? "Active Plan" : `Switch to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Invoices */}
      <Panel>
        <PanelHead
          title="Invoices & VAT Receipts"
          sub="Official downloadable tax receipts for corporate accounts."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/50 text-[11px] uppercase font-bold text-text-3 font-mono">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 font-mono">
              {[
                {
                  id: "INV-2026-0801",
                  date: "Aug 01, 2026",
                  desc: "Karkhana Plan (Monthly)",
                  amount: 3990,
                },
                {
                  id: "INV-2026-0715",
                  date: "Jul 15, 2026",
                  desc: "+500 Closed Orders Top-Up",
                  amount: 1250,
                },
                {
                  id: "INV-2026-0701",
                  date: "Jul 01, 2026",
                  desc: "Karkhana Plan (Monthly)",
                  amount: 3990,
                },
                {
                  id: "INV-2026-0601",
                  date: "Jun 01, 2026",
                  desc: "Bazaar Plan (Monthly)",
                  amount: 1190,
                },
              ].map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-2/30">
                  <td className="p-4 font-bold text-text">{inv.id}</td>
                  <td className="p-4 text-text-3">{inv.date}</td>
                  <td className="p-4 font-sans font-medium text-text">
                    {inv.desc}
                  </td>
                  <td className="p-4 font-bold text-text">
                    ৳{inv.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="rounded-md bg-signal/15 px-2 py-0.5 text-[10px] font-bold text-signal font-sans">
                      Paid
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href="#"
                      className="text-signal hover:underline text-xs font-sans font-medium"
                    >
                      Download ↓
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

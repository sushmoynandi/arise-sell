"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ADMIN_KPI,
  ADMIN_MERCHANTS,
  LIVE_ACTIVITY_FEED,
  SYSTEM_SERVICES,
} from "@/data/admin";
import { IconSpark } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { formatTaka } from "@/lib/format";

export default function AdminOverviewPage() {
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight text-text">
            Executive Command Center
          </h1>
          <p className="text-[13.5px] text-text-3">
            Real-time platform telemetry across 148 Bangladeshi merchants &
            automated sales pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setBroadcastOpen(true);
              setBroadcastSent(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-text shadow-sm hover:border-signal/40 transition-colors cursor-pointer"
          >
            <IconSpark width={14} height={14} className="text-signal" />
            <span>Broadcast Alert</span>
          </button>

          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-4 py-2 text-[12.5px] font-semibold text-white shadow-sm hover:bg-signal-deep transition-colors"
          >
            <span>Manage Merchants</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Monthly Recurring Revenue */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              Platform MRR
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[11px] font-bold text-signal">
              {ADMIN_KPI.growthMoM}
            </span>
          </div>
          <div className="mt-3">
            <p className="font-(family-name:--font-bricolage) text-2xl font-bold text-text">
              {formatTaka(ADMIN_KPI.mrrBDT)}
            </p>
            <p className="mt-1 text-[12px] text-text-3">
              ARR: {formatTaka(ADMIN_KPI.arrBDT)} · bKash & Cards
            </p>
          </div>
        </div>

        {/* Metric 2: Total Closed GMV */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              Platform GMV
            </span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              Closed by AI
            </span>
          </div>
          <div className="mt-3">
            <p className="font-(family-name:--font-bricolage) text-2xl font-bold text-text">
              {formatTaka(ADMIN_KPI.platformGmvBDT)}
            </p>
            <p className="mt-1 text-[12px] text-text-3">
              {ADMIN_KPI.courierBookingsTotal.toLocaleString()} Automated
              Deliveries
            </p>
          </div>
        </div>

        {/* Metric 3: Active Registered Merchants */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              Total Merchants
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[11px] font-bold text-signal">
              112 Paid
            </span>
          </div>
          <div className="mt-3">
            <p className="font-(family-name:--font-bricolage) text-2xl font-bold text-text">
              {ADMIN_KPI.totalMerchants}
            </p>
            <p className="mt-1 text-[12px] text-text-3">
              {ADMIN_KPI.trialMerchants} in Trial ·{" "}
              {ADMIN_KPI.suspendedMerchants} Suspended
            </p>
          </div>
        </div>

        {/* Metric 4: AI Resolution Rate */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase tracking-wider">
              AI Resolution
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[11px] font-bold text-signal">
              Bangla + Photo
            </span>
          </div>
          <div className="mt-3">
            <p className="font-(family-name:--font-bricolage) text-2xl font-bold text-text">
              {ADMIN_KPI.aiAutoResolutionRate}%
            </p>
            <p className="mt-1 text-[12px] text-text-3">
              {ADMIN_KPI.messages24h.toLocaleString()} msgs in last 24h
            </p>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Active Merchants Table + Live Platform Activity Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left Column: Top Active Merchants */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-text">
                Top Performing Merchants
              </h2>
              <p className="text-[12.5px] text-text-3">
                Highest revenue generated through NextProduct AI
              </p>
            </div>
            <Link
              href="/admin/users"
              className="text-[12px] font-semibold text-signal hover:underline"
            >
              View All 148 →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-text-3 text-[11px] font-semibold uppercase tracking-wider">
                  <th className="pb-3">Merchant / Store</th>
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Monthly GMV</th>
                  <th className="pb-3">AI Rate</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ADMIN_MERCHANTS.slice(0, 6).map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-surface-2/40 transition-colors"
                  >
                    <td className="py-3.5 pr-3">
                      <p className="font-semibold text-text">{m.storeName}</p>
                      <p className="text-[11.5px] text-text-3">
                        {m.ownerName} · {m.city}
                      </p>
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="inline-block rounded-md border border-line bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-2">
                        {m.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 pr-3 font-semibold text-text">
                      {formatTaka(m.monthlyGMV)}
                    </td>
                    <td className="py-3.5 pr-3">
                      <span className="text-signal font-semibold">
                        {m.aiResolutionRate}%
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          m.status === "active"
                            ? "bg-signal/[0.08] text-signal"
                            : m.status === "trial"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {m.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Live Event Stream & API Health */}
        <div className="space-y-6">
          {/* Live Activity Stream */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-text flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-signal" />
                </span>
                <span>Live Event Stream</span>
              </h2>
              <span className="text-[11px] font-mono text-text-3">
                Real-time
              </span>
            </div>

            <div className="space-y-3">
              {LIVE_ACTIVITY_FEED.map((act) => (
                <div
                  key={act.id}
                  className="rounded-xl border border-line/80 bg-surface-2/40 p-3 text-[12.5px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-text">{act.title}</p>
                    <span className="text-[11px] text-text-3">{act.time}</span>
                  </div>
                  <p className="text-[11.5px] text-text-2">{act.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick System API Health */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text">Core API Latency</h3>
              <Link
                href="/admin/system"
                className="text-[11.5px] text-signal font-medium hover:underline"
              >
                Full Details →
              </Link>
            </div>
            <div className="space-y-2">
              {SYSTEM_SERVICES.slice(0, 3).map((srv) => (
                <div
                  key={srv.name}
                  className="flex items-center justify-between text-[12px] py-1 border-b border-line/60 last:border-0"
                >
                  <span className="text-text-2 font-medium">{srv.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-text-3">{srv.latency}</span>
                    <span className="size-2 rounded-full bg-signal" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-text">
              Platform Broadcast Banner
            </h3>
            <p className="mt-1 text-[13px] text-text-3">
              This notice will immediately appear at the top of all merchant
              dashboards across Bangladesh.
            </p>

            {broadcastSent ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-signal/20 bg-signal/[0.06] p-3 text-[13px] font-medium text-signal">
                  Broadcast successfully queued and dispatched to 148 merchants!
                </div>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setBroadcastOpen(false)}
                  className="w-full justify-center"
                >
                  Close
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Scheduled Meta WhatsApp API maintenance tonight at 3:00 AM BST..."
                  className="w-full rounded-xl border border-line p-3 text-[13px] text-text focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/15"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setBroadcastOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="signal"
                    size="md"
                    onClick={() => setBroadcastSent(true)}
                    disabled={!broadcastMessage}
                  >
                    Send to All Merchants
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { SYSTEM_SERVICES } from "@/data/admin";
import { cx } from "@/lib/format";

export default function AdminSystemPage() {
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshMesh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-text sm:text-2xl tracking-tight">
              Infrastructure & System Health
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 font-mono text-[11px] font-bold text-signal border border-signal/20">
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              Service Mesh Active
            </span>
          </div>
          <p className="text-[13px] text-text-3 mt-1">
            Real-time status of Meta APIs, LLM inference endpoints, database clusters, and webhook workers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefreshMesh}
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-2 text-[12.5px] font-semibold text-text shadow-xs hover:border-signal/40 hover:bg-surface-2 transition-all cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cx(refreshing && "animate-spin text-signal")}
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            <span>{refreshing ? "Pinging Mesh..." : "Ping Service Mesh"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBroadcastOpen(true);
              setBroadcastSent(false);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-signal px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-xs hover:bg-signal-deep transition-all cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            <span>Broadcast Alert</span>
          </button>
        </div>
      </div>

      {/* Primary Health Status Summary */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-3 font-bold">
            Overall Platform Status
          </span>
          <div className="flex items-center gap-2 pt-1">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-signal" />
            </span>
            <p className="text-lg font-bold text-signal">
              All Systems Fully Operational
            </p>
          </div>
          <p className="text-[12px] text-text-3">99.96% uptime over last 90 days</p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-3 font-bold">
            Webhook Processing Queue
          </span>
          <p className="text-lg font-bold text-text pt-1">
            0 Delayed / 12,480 Processed
          </p>
          <p className="text-[12px] text-signal font-medium">
            Throughput: 142 msgs/sec peak
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-xs space-y-1">
          <span className="text-[11px] font-mono uppercase text-text-3 font-bold">
            PostgreSQL & pgvector
          </span>
          <p className="text-lg font-bold text-text pt-1">
            Cluster Master Healthy
          </p>
          <p className="text-[12px] text-text-3">Query latency: 4.2ms avg</p>
        </div>
      </div>

      {/* Core Services Table */}
      <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text uppercase tracking-wider text-text-3 font-mono">
            Service Mesh & External API Connectors
          </h2>
          <span className="text-[11px] font-mono text-text-3">Auto-refresh every 30s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-text-3 text-[10.5px] font-mono uppercase font-bold tracking-wider">
              <tr>
                <th className="pb-3">Service Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">Throughput</th>
                <th className="pb-3">Uptime</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {SYSTEM_SERVICES.map((srv) => (
                <tr
                  key={srv.name}
                  className="hover:bg-surface-2/40 transition-colors"
                >
                  <td className="py-3.5 pr-3 font-semibold text-text">
                    {srv.name}
                  </td>
                  <td className="py-3.5 pr-3 text-text-2">{srv.category}</td>
                  <td className="py-3.5 pr-3 font-mono text-text">
                    {srv.latency}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-text-3">
                    {srv.load}
                  </td>
                  <td className="py-3.5 pr-3 text-signal font-semibold">
                    {srv.uptime}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-signal border border-signal/20">
                      <span className="size-1.5 rounded-full bg-signal" />
                      OPERATIONAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Alert Modal */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <h3 className="text-base font-bold text-text">
                Broadcast Platform Alert
              </h3>
              <button
                type="button"
                onClick={() => setBroadcastOpen(false)}
                className="grid size-7 place-items-center rounded-lg border border-line text-text-2 hover:bg-surface-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-[13px] text-text-3">
              This message will be instantly pushed to all 148 active merchant dashboards across Bangladesh.
            </p>

            {broadcastSent ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-signal/20 bg-signal/[0.06] p-3.5 text-[13px] font-medium text-signal">
                  ✓ Broadcast alert dispatched successfully to all 148 active merchant consoles!
                </div>
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(false)}
                  className="w-full rounded-xl bg-surface-2 border border-line py-2 text-[12.5px] font-semibold text-text hover:bg-surface-3 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g. Scheduled system upgrade tonight at 3:00 AM. AI customer ordering remains 100% active."
                  className="w-full rounded-xl border border-line bg-canvas p-3 text-[13px] text-text focus:border-signal/40 focus:outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastOpen(false)}
                    className="rounded-xl border border-line bg-white px-4 py-2 text-[12.5px] font-medium text-text-2 hover:bg-surface-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastSent(true)}
                    disabled={!broadcastMessage.trim()}
                    className="rounded-xl bg-signal px-4 py-2 text-[12.5px] font-bold text-white hover:bg-signal-deep disabled:opacity-50 cursor-pointer"
                  >
                    Publish Alert
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

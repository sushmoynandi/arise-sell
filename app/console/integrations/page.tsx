"use client";

import { useState } from "react";
import { cx } from "@/lib/format";

type Integration = {
  id: string;
  name: string;
  category: "channel" | "courier" | "store";
  icon: string;
  description: string;
  connected: boolean;
  account?: string;
  badge?: string;
};

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "facebook",
    name: "Facebook Page & Messenger",
    category: "channel",
    icon: "💬",
    description: "Auto-reply to Messenger chats and Facebook post comments.",
    connected: true,
    account: "Nazmul's Fashion House (Page ID: 104829104)",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business (WABA)",
    category: "channel",
    icon: "📱",
    description:
      "Official WhatsApp Cloud API for automated sales and broadcasts.",
    connected: true,
    account: "+880 1711-234567 (Meta Verified)",
  },
  {
    id: "steadfast",
    name: "Steadfast Courier",
    category: "courier",
    icon: "🚚",
    description:
      "Automated 1-click parcel entry and Cash on Delivery (COD) tracking.",
    connected: true,
    account: "API Key Active · Balance: ৳14,280",
    badge: "Preferred",
  },
  {
    id: "pathao",
    name: "Pathao Courier",
    category: "courier",
    icon: "🏍️",
    description:
      "Fast city delivery and automated parcel consignment creation.",
    connected: false,
  },
  {
    id: "redx",
    name: "RedX Logistics",
    category: "courier",
    icon: "📦",
    description: "Nationwide parcel pickup and automated tracking updates.",
    connected: false,
  },
  {
    id: "woocommerce",
    name: "WooCommerce / Shopify",
    category: "store",
    icon: "🛍️",
    description:
      "Sync product catalog, stock inventory, and orders automatically.",
    connected: true,
    account: "nazmulfashion.com (Synced)",
  },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS);
  const [activeTab, setActiveTab] = useState<
    "all" | "channel" | "courier" | "store"
  >("all");
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const toggleConnect = (id: string) => {
    setConnectingId(id);
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                connected: !item.connected,
                account: !item.connected ? "Connected Successfully" : undefined,
              }
            : item,
        ),
      );
      setConnectingId(null);
    }, 600);
  };

  const filtered = integrations.filter((i) =>
    activeTab === "all" ? true : i.category === activeTab,
  );

  return (
    <div className="p-5 sm:p-7 lg:p-9 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-text tracking-tight">
            Integrations & Channels
          </h1>
          <p className="text-[13px] text-text-3 mt-0.5">
            Connect your Facebook Pages, WhatsApp number, and Courier accounts
            to automate sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-xl bg-signal px-4 py-2 text-[13px] font-bold text-white shadow-xs hover:bg-signal-deep transition-all cursor-pointer"
          >
            + Connect New Channel
          </button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 border-b border-line pb-3 overflow-x-auto">
        {(
          [
            { id: "all", label: "All Integrations" },
            { id: "channel", label: "Social Channels" },
            { id: "courier", label: "Couriers (Steadfast/Pathao)" },
            { id: "store", label: "Storefronts & Websites" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cx(
              "rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors cursor-pointer shrink-0",
              activeTab === tab.id
                ? "bg-signal/10 text-signal"
                : "text-text-3 hover:bg-surface-2 hover:text-text",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-line bg-white p-5 shadow-2xs hover:border-line/90 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-surface-2 border border-line text-2xl shrink-0">
                    {item.icon}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14.5px] font-bold text-text">
                        {item.name}
                      </h3>
                      {item.badge && (
                        <span className="rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono mt-0.5">
                      <span
                        className={cx(
                          "size-1.5 rounded-full",
                          item.connected ? "bg-signal" : "bg-text-3/40",
                        )}
                      />
                      <span
                        className={
                          item.connected
                            ? "text-signal font-semibold"
                            : "text-text-3"
                        }
                      >
                        {item.connected
                          ? "Active & Connected"
                          : "Not Connected"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[12.5px] text-text-3 leading-relaxed">
                {item.description}
              </p>

              {item.account && (
                <div className="rounded-xl border border-line/60 bg-surface-2/40 px-3 py-2 text-[11.5px] font-mono text-text-2">
                  {item.account}
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-line/50 flex items-center justify-between">
              <span className="text-[11.5px] text-text-3">
                {item.connected ? "Last synced 2m ago" : "Requires setup"}
              </span>

              <button
                type="button"
                disabled={connectingId === item.id}
                onClick={() => toggleConnect(item.id)}
                className={cx(
                  "rounded-xl px-3.5 py-1.5 text-[12px] font-bold transition-all cursor-pointer disabled:opacity-50",
                  item.connected
                    ? "border border-line bg-white text-text hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                    : "bg-signal text-white hover:bg-signal-deep shadow-xs",
                )}
              >
                {connectingId === item.id
                  ? "Updating..."
                  : item.connected
                    ? "Configure / Disconnect"
                    : "Connect Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

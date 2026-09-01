"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ADMIN_MERCHANTS,
  type AdminMerchant,
  type MerchantStatus,
} from "@/data/admin";
import {
  IconSearch,
  IconClose,
  IconCheck,
  IconWhatsApp,
  IconMessenger,
  IconInstagram,
  IconWidget,
} from "@/components/ui/icons";
import { formatTaka } from "@/lib/format";

export default function AdminUsersPage() {
  const [merchants, setMerchants] = useState<AdminMerchant[]>(ADMIN_MERCHANTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedMerchant, setSelectedMerchant] =
    useState<AdminMerchant | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filter logic
  const filtered = merchants.filter((m) => {
    const matchesSearch =
      m.storeName.toLowerCase().includes(search.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesPlan = planFilter === "all" || m.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const handleStatusChange = (id: string, newStatus: MerchantStatus) => {
    setMerchants((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m)),
    );
    if (selectedMerchant && selectedMerchant.id === id) {
      setSelectedMerchant((prev) =>
        prev ? { ...prev, status: newStatus } : null,
      );
    }
    setActionSuccessMsg(
      `Merchant status updated to ${newStatus.toUpperCase()}`,
    );
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handlePlanUpgrade = (
    id: string,
    newPlan: "growth" | "scale" | "enterprise",
  ) => {
    const planNames = {
      growth: "Growth Plan (৳৫,৯৯৯/mo)",
      scale: "Scale Plan (৳৯,৯৯৯/mo)",
      enterprise: "Enterprise Tier (Custom)",
    };
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              plan: newPlan,
              planName: planNames[newPlan],
              status: "active",
            }
          : m,
      ),
    );
    if (selectedMerchant && selectedMerchant.id === id) {
      setSelectedMerchant((prev) =>
        prev
          ? {
              ...prev,
              plan: newPlan,
              planName: planNames[newPlan],
              status: "active",
            }
          : null,
      );
    }
    setActionSuccessMsg(`Subscription upgraded to ${newPlan.toUpperCase()}`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight text-text">
            Merchant & Shop Directory
          </h1>
          <p className="text-[13.5px] text-text-3">
            Governance, plan allocation, and inspection across{" "}
            {merchants.length} registered merchant accounts.
          </p>
        </div>

        {actionSuccessMsg && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/[0.08] px-3.5 py-1.5 text-[12.5px] font-semibold text-signal shadow-sm animate-in fade-in">
            <IconCheck width={14} height={14} />
            <span>{actionSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Controls: Search Bar & Filters */}
      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-3">
            <IconSearch width={15} height={15} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search store, owner, email, phone or city..."
            className="w-full rounded-xl border border-line bg-canvas pl-9 pr-4 py-2 text-[13px] text-text placeholder:text-text-3 focus:border-signal focus:bg-white focus:outline-none focus:ring-2 focus:ring-signal/15"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-line bg-canvas px-3 py-2 text-[12.5px] font-medium text-text focus:border-signal focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses ({merchants.length})</option>
            <option value="active">
              Active Paid (
              {merchants.filter((m) => m.status === "active").length})
            </option>
            <option value="trial">
              In Trial ({merchants.filter((m) => m.status === "trial").length})
            </option>
            <option value="suspended">
              Suspended (
              {merchants.filter((m) => m.status === "suspended").length})
            </option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-xl border border-line bg-canvas px-3 py-2 text-[12.5px] font-medium text-text focus:border-signal focus:outline-none cursor-pointer"
          >
            <option value="all">All Plans</option>
            <option value="starter">Starter (৳২,৯৯৯)</option>
            <option value="growth">Growth (৳৫,৯৯৯)</option>
            <option value="scale">Scale (৳৯,৯৯৯)</option>
            <option value="enterprise">Enterprise</option>
            <option value="free_trial">Free Trial</option>
          </select>
        </div>
      </div>

      {/* Merchants Table */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface-2/60 border-b border-line text-text-3 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-4 min-w-[280px] sm:min-w-[320px]">
                  Store &amp; Merchant
                </th>
                <th className="py-3.5 px-3 whitespace-nowrap">Location</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Plan / Tier</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Channels</th>
                <th className="py-3.5 px-3 whitespace-nowrap">Monthly GMV</th>
                <th className="py-3.5 px-3 whitespace-nowrap">AI Bot Rate</th>
                <th className="py-3.5 pr-5 text-right whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-3">
                    No merchants found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMerchant(m)}
                    className="hover:bg-surface-2/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 pl-5 pr-4 min-w-[280px] sm:min-w-[320px]">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl bg-signal/[0.08] text-signal font-bold text-sm group-hover:bg-signal group-hover:text-white transition-colors shrink-0">
                          {m.storeName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-text group-hover:text-signal transition-colors truncate">
                            {m.storeName}
                          </p>
                          <p className="text-[11.5px] text-text-3 truncate">
                            {m.ownerName} · {m.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-text-2 font-medium whitespace-nowrap">
                      {m.city}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="inline-block rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11px] font-semibold text-text">
                        {m.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-text-3">
                        {m.channels.includes("whatsapp") && (
                          <span title="WhatsApp" className="text-[#25D366]">
                            <IconWhatsApp width={15} height={15} />
                          </span>
                        )}
                        {m.channels.includes("messenger") && (
                          <span title="Messenger" className="text-[#1877F2]">
                            <IconMessenger width={15} height={15} />
                          </span>
                        )}
                        {m.channels.includes("instagram") && (
                          <span title="Instagram" className="text-[#E4405F]">
                            <IconInstagram width={15} height={15} />
                          </span>
                        )}
                        {m.channels.includes("web") && (
                          <span title="Web Widget" className="text-signal">
                            <IconWidget width={15} height={15} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 font-semibold text-text whitespace-nowrap">
                      {formatTaka(m.monthlyGMV)}
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <span className="font-semibold text-signal">
                        {m.aiResolutionRate}%
                      </span>
                    </td>
                    <td className="py-4 pr-5 text-right whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Merchant Slide-Over / Modal */}
      {selectedMerchant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedMerchant(null)}
        >
          <div
            className="h-full w-full max-w-lg bg-white border-l border-line p-6 sm:p-8 flex flex-col shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="grid size-12 place-items-center rounded-2xl bg-signal/[0.08] text-signal font-bold text-xl">
                  {selectedMerchant.storeName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text">
                    {selectedMerchant.storeName}
                  </h2>
                  <p className="text-[12.5px] text-text-3">
                    ID: {selectedMerchant.id} · Joined{" "}
                    {selectedMerchant.joinedDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMerchant(null)}
                className="grid size-8 place-items-center rounded-lg border border-line text-text-2 hover:bg-surface-2 cursor-pointer"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            {/* Merchant Metrics Grid */}
            <div className="py-5 space-y-5 flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-line bg-canvas p-3.5">
                  <p className="text-[11px] font-semibold uppercase text-text-3">
                    Monthly GMV
                  </p>
                  <p className="mt-1 text-lg font-bold text-text">
                    {formatTaka(selectedMerchant.monthlyGMV)}
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-canvas p-3.5">
                  <p className="text-[11px] font-semibold uppercase text-text-3">
                    AI Resolution
                  </p>
                  <p className="mt-1 text-lg font-bold text-signal">
                    {selectedMerchant.aiResolutionRate}%
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-canvas p-3.5">
                  <p className="text-[11px] font-semibold uppercase text-text-3">
                    Catalog Size
                  </p>
                  <p className="mt-1 text-lg font-bold text-text">
                    {selectedMerchant.catalogItems} Products
                  </p>
                </div>
                <div className="rounded-xl border border-line bg-canvas p-3.5">
                  <p className="text-[11px] font-semibold uppercase text-text-3">
                    Total Orders
                  </p>
                  <p className="mt-1 text-lg font-bold text-text">
                    {selectedMerchant.totalOrders} Orders
                  </p>
                </div>
              </div>

              {/* Owner & Contact Details */}
              <div className="rounded-2xl border border-line p-4 space-y-2.5">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-3">
                  Contact & Logistics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[12.5px]">
                  <div>
                    <span className="text-text-3 block text-[11px]">Owner</span>
                    <span className="font-semibold text-text">
                      {selectedMerchant.ownerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[11px]">Phone</span>
                    <span className="font-mono text-text">
                      {selectedMerchant.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[11px]">Email</span>
                    <span className="text-text truncate block">
                      {selectedMerchant.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[11px]">
                      Courier Bridge
                    </span>
                    <span className="font-semibold text-text uppercase">
                      {selectedMerchant.courier}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subscription Control */}
              <div className="rounded-2xl border border-line p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-3">
                    Current Plan
                  </h4>
                  <span className="font-semibold text-signal text-[12.5px]">
                    {selectedMerchant.planName}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      handlePlanUpgrade(selectedMerchant.id, "growth")
                    }
                    className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium hover:border-signal transition-colors cursor-pointer"
                  >
                    Upgrade to Growth (৳৫,৯৯৯)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handlePlanUpgrade(selectedMerchant.id, "scale")
                    }
                    className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 text-[11.5px] font-medium hover:border-signal transition-colors cursor-pointer"
                  >
                    Upgrade to Scale (৳৯,৯৯৯)
                  </button>
                </div>
              </div>

              {/* Status Controls & Impersonation */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href="/console"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-signal-deep transition-colors"
                >
                  <span>Impersonate / Open Merchant Console</span>
                  <span>→</span>
                </Link>

                <div className="flex gap-2">
                  {selectedMerchant.status !== "active" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(selectedMerchant.id, "active")
                      }
                      className="flex-1 rounded-xl border border-signal/30 bg-signal/[0.06] py-2 text-[12px] font-semibold text-signal hover:bg-signal/10 transition-colors cursor-pointer"
                    >
                      Activate Account
                    </button>
                  )}
                  {selectedMerchant.status !== "suspended" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleStatusChange(selectedMerchant.id, "suspended")
                      }
                      className="flex-1 rounded-xl border border-red-200 bg-red-50 py-2 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    >
                      Suspend Merchant
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

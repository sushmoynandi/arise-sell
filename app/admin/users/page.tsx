"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  ADMIN_MERCHANTS,
  INITIAL_ADMIN_PLANS,
  type AdminMerchant,
  type AdminPlan,
  type MerchantStatus,
} from "@/data/admin";
import {
  IconSearch,
  IconClose,
  IconCheck,
  IconWhatsApp,
  IconMessenger,
  IconInstagram,
  IconGlobe,
} from "@/components/ui/icons";
import { formatTaka, cx } from "@/lib/format";
import {
  subscribePlans,
  getStoredPlans,
  findMatchingPlan,
} from "@/lib/plans-store";

export default function AdminUsersPage() {
  const plans = useSyncExternalStore(
    subscribePlans,
    getStoredPlans,
    () => INITIAL_ADMIN_PLANS,
  );
  const [merchants, setMerchants] = useState<AdminMerchant[]>(ADMIN_MERCHANTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [selectedMerchant, setSelectedMerchant] =
    useState<AdminMerchant | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [pendingPlanSwitch, setPendingPlanSwitch] = useState<{
    merchant: AdminMerchant;
    targetPlan: AdminPlan;
  } | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    merchant: AdminMerchant;
    newStatus: MerchantStatus;
  } | null>(null);

  // Dynamic Plan Info Helper from Plan Builder
  const getPlanInfo = (planKey: string) => {
    const matched = findMatchingPlan(planKey, plans);
    if (matched) {
      return {
        id: matched.id,
        name: matched.name,
        nameBn: matched.nameBn,
        priceBDT: matched.priceBDT,
        yearlyPriceBDT: matched.yearlyPriceBDT,
        label: `${matched.name} (${matched.priceBDT > 0 ? `${formatTaka(matched.priceBDT)}/mo` : "Free"})`,
      };
    }
    return {
      id: planKey,
      name: planKey.charAt(0).toUpperCase() + planKey.slice(1),
      nameBn: planKey,
      priceBDT: 0,
      yearlyPriceBDT: 0,
      label: planKey.toUpperCase(),
    };
  };

  // Filter logic
  const filtered = merchants.filter((m) => {
    const matchesSearch =
      m.storeName.toLowerCase().includes(search.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      m.phone.includes(search) ||
      m.city.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    const matchesPlan =
      planFilter === "all" ||
      m.plan === planFilter ||
      findMatchingPlan(m.plan, plans)?.id === planFilter;

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

  const handlePlanUpgrade = (id: string, targetPlan: AdminPlan) => {
    const formattedName = `${targetPlan.name} Plan (${targetPlan.priceBDT > 0 ? `${formatTaka(targetPlan.priceBDT)}/mo` : "Free"})`;
    setMerchants((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              plan: targetPlan.id.replace("plan-", ""),
              planName: formattedName,
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
              plan: targetPlan.id.replace("plan-", ""),
              planName: formattedName,
              status: "active",
            }
          : null,
      );
    }
    setActionSuccessMsg(`Subscription switched to ${targetPlan.name}`);
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

          {/* Dynamic Plan Filter from Plan Builder */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="rounded-xl border border-line bg-canvas px-3 py-2 text-[12.5px] font-medium text-text focus:border-signal focus:outline-none cursor-pointer"
          >
            <option value="all">All Plans ({merchants.length})</option>
            {plans.map((p) => {
              const count = merchants.filter(
                (m) => findMatchingPlan(m.plan, plans)?.id === p.id,
              ).length;
              return (
                <option key={p.id} value={p.id}>
                  {p.name}{" "}
                  {p.priceBDT > 0 ? `(${formatTaka(p.priceBDT)}/mo)` : "(Free)"}{" "}
                  {count > 0 ? `(${count})` : ""}
                </option>
              );
            })}
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
                <th className="py-3.5 px-3 text-right whitespace-nowrap">
                  Monthly GMV
                </th>
                <th className="py-3.5 px-3 text-right whitespace-nowrap">
                  AI Bot Rate
                </th>
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
                        {getPlanInfo(m.plan).name}
                      </span>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-text-3">
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
                            <IconGlobe width={15} height={15} />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-3 text-right font-semibold text-text whitespace-nowrap">
                      {formatTaka(m.monthlyGMV)}
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap">
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

      {/* Detailed Merchant Centered Modal */}
      {selectedMerchant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setSelectedMerchant(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[92vh] rounded-2xl bg-white border border-line p-6 sm:p-7.5 flex flex-col shadow-2xl overflow-y-auto animate-in zoom-in-98 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Action Bar */}
            <div className="flex items-center justify-between pb-4.5 border-b border-line flex-wrap gap-3">
              <div className="flex items-center gap-3.5">
                <div className="grid size-11 place-items-center rounded-xl bg-signal/[0.08] border border-signal/20 text-signal font-bold text-lg shrink-0 font-(family-name:--font-bricolage)">
                  {selectedMerchant.storeName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-[17.5px] font-bold text-text">
                      {selectedMerchant.storeName}
                    </h2>
                    <span
                      className={cx(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border font-mono",
                        selectedMerchant.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : selectedMerchant.status === "trial"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-red-200 bg-red-50 text-red-700",
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {selectedMerchant.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-[12px] text-text-3 mt-0.5 flex items-center gap-2 flex-wrap font-mono">
                    <span className="text-text-2 font-medium">
                      ID: {selectedMerchant.id}
                    </span>
                    <span>·</span>
                    <span>Joined {selectedMerchant.joinedDate}</span>
                    <span>·</span>
                    <span className="text-signal font-sans font-medium">
                      Active {selectedMerchant.lastActive}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Action Bar */}
              <div className="ml-auto flex items-center gap-2">
                {selectedMerchant.status !== "active" ? (
                  <button
                    type="button"
                    onClick={() =>
                      setPendingStatusChange({
                        merchant: selectedMerchant,
                        newStatus: "active",
                      })
                    }
                    className="rounded-lg border border-signal/30 bg-signal/[0.06] px-3 py-1.5 text-[12px] font-bold text-signal hover:bg-signal/15 transition-colors cursor-pointer text-center"
                  >
                    Activate
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setPendingStatusChange({
                        merchant: selectedMerchant,
                        newStatus: "suspended",
                      })
                    }
                    className="rounded-lg border border-red-200 bg-red-50/60 px-3 py-1.5 text-[12px] font-semibold text-red-600 hover:bg-red-100 transition-colors cursor-pointer text-center"
                  >
                    Suspend
                  </button>
                )}

                <Link
                  href="/console"
                  className="flex items-center rounded-lg bg-signal px-3.5 py-1.5 text-[12.5px] font-bold text-white shadow-2xs hover:bg-signal-deep transition-all cursor-pointer"
                >
                  Open Console
                </Link>

                <div className="h-4 w-px bg-line mx-0.5" />

                <button
                  type="button"
                  onClick={() => setSelectedMerchant(null)}
                  className="grid size-8 place-items-center rounded-lg border border-line text-text-3 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
                >
                  <IconClose width={14} height={14} />
                </button>
              </div>
            </div>

            {/* 4 Metric Cards in 1 Row (Enriched with subtle insights) */}
            <div className="py-4.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* 1. Monthly GMV */}
                <div className="rounded-xl border border-line bg-canvas/60 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-text-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Monthly GMV
                    </span>
                    <span className="text-[10px] font-mono text-signal font-semibold">
                      +18.4%
                    </span>
                  </div>
                  <p className="mt-1 text-[17px] font-bold text-text font-(family-name:--font-bricolage)">
                    {formatTaka(selectedMerchant.monthlyGMV)}
                  </p>
                  <span className="text-[10.5px] text-text-3 font-mono mt-0.5 truncate">
                    ~৳{Math.round((selectedMerchant.monthlyGMV * 12) / 100000)}
                    L/yr ARR
                  </span>
                </div>

                {/* 2. AI Resolution */}
                <div className="rounded-xl border border-line bg-canvas/60 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-text-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      AI Resolution
                    </span>
                    <span className="size-2 rounded-full bg-signal" />
                  </div>
                  <p className="mt-1 text-[17px] font-bold text-signal font-(family-name:--font-bricolage)">
                    {selectedMerchant.aiResolutionRate}%
                  </p>
                  <span className="text-[10.5px] text-signal font-mono mt-0.5 truncate">
                    {Math.round(
                      (selectedMerchant.totalOrders *
                        selectedMerchant.aiResolutionRate) /
                        100,
                    ).toLocaleString()}{" "}
                    auto-closed
                  </span>
                </div>

                {/* 3. Catalog Size */}
                <div className="rounded-xl border border-line bg-canvas/60 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-text-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Catalog Size
                    </span>
                    <span className="text-[10px] font-mono text-text-3">
                      Sync OK
                    </span>
                  </div>
                  <p className="mt-1 text-[17px] font-bold text-text font-(family-name:--font-bricolage)">
                    {selectedMerchant.catalogItems}{" "}
                    <span className="text-[12px] font-normal text-text-3 font-sans">
                      Items
                    </span>
                  </p>
                  <span className="text-[10.5px] text-text-3 font-mono mt-0.5 truncate">
                    Vision OCR live
                  </span>
                </div>

                {/* 4. Total Orders */}
                <div className="rounded-xl border border-line bg-canvas/60 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-text-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider">
                      Total Orders
                    </span>
                    <span className="text-[10px] font-mono text-text-3">
                      All-Time
                    </span>
                  </div>
                  <p className="mt-1 text-[17px] font-bold text-text font-(family-name:--font-bricolage)">
                    {selectedMerchant.totalOrders.toLocaleString()}{" "}
                    <span className="text-[12px] font-normal text-text-3 font-sans">
                      Orders
                    </span>
                  </p>
                  <span className="text-[10.5px] text-text-3 font-mono mt-0.5 truncate">
                    ৳
                    {Math.round(
                      selectedMerchant.monthlyGMV /
                        Math.max(1, selectedMerchant.totalOrders / 3),
                    )}{" "}
                    avg basket
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Enriched & Simple Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4.5">
              {/* Left Column: Account & Contact */}
              <div className="rounded-xl border border-line p-4 space-y-3 bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-text-3">
                    Merchant &amp; Logistics
                  </h4>
                  {/* Channel Logos Only in Top Right */}
                  <div
                    className="flex items-center gap-1.5"
                    title="Connected Channels"
                  >
                    {selectedMerchant.channels.includes("whatsapp") && (
                      <span
                        title="WhatsApp"
                        className="grid size-6 place-items-center rounded-md border border-line bg-canvas text-[#25D366]"
                      >
                        <IconWhatsApp width={13} height={13} />
                      </span>
                    )}
                    {selectedMerchant.channels.includes("messenger") && (
                      <span
                        title="Messenger"
                        className="grid size-6 place-items-center rounded-md border border-line bg-canvas text-[#1877F2]"
                      >
                        <IconMessenger width={13} height={13} />
                      </span>
                    )}
                    {selectedMerchant.channels.includes("instagram") && (
                      <span
                        title="Instagram"
                        className="grid size-6 place-items-center rounded-md border border-line bg-canvas text-[#E4405F]"
                      >
                        <IconInstagram width={13} height={13} />
                      </span>
                    )}
                    {selectedMerchant.channels.includes("web") && (
                      <span
                        title="Web Widget"
                        className="grid size-6 place-items-center rounded-md border border-line bg-canvas text-signal"
                      >
                        <IconGlobe width={13} height={13} />
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div>
                    <span className="text-text-3 block text-[10.5px]">
                      Contact Person
                    </span>
                    <span className="font-semibold text-text truncate block">
                      {selectedMerchant.ownerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[10.5px]">
                      Phone Number
                    </span>
                    <a
                      href={`tel:${selectedMerchant.phone}`}
                      className="font-mono text-text hover:text-signal transition-colors font-medium truncate block"
                    >
                      {selectedMerchant.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[10.5px]">
                      Official Email
                    </span>
                    <a
                      href={`mailto:${selectedMerchant.email}`}
                      className="text-text hover:text-signal transition-colors truncate block text-[11.5px]"
                      title={selectedMerchant.email}
                    >
                      {selectedMerchant.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[10.5px]">
                      Courier Bridge
                    </span>
                    <span className="font-semibold text-text uppercase font-mono text-[11.5px]">
                      {selectedMerchant.courier}
                    </span>
                  </div>
                </div>

                {/* Address / Location in Bottom Row */}
                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                  <span className="text-text-3">Location / Hub:</span>
                  <span className="font-semibold text-text font-mono">
                    {selectedMerchant.city}
                  </span>
                </div>
              </div>

              {/* Right Column: AI Infrastructure */}
              <div className="rounded-xl border border-line p-4 space-y-3 bg-white flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 border-b border-line/60">
                  <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-text-3">
                    AI Engine &amp; SLA
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
                    99.9% Uptime
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div className="col-span-2">
                    <span className="text-text-3 block text-[10.5px]">
                      AI Model Pipeline
                    </span>
                    <span className="font-semibold text-text truncate block">
                      {selectedMerchant.dedicatedAiProvider ||
                        "Gemini 2.0 Flash + GPT-4o Failover"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[10.5px]">
                      Token Allocation
                    </span>
                    <span className="font-semibold font-mono text-text">
                      {selectedMerchant.customTokenLimit
                        ? `${(selectedMerchant.customTokenLimit / 1000000).toFixed(0)}M Tokens / mo`
                        : "Unlimited SLA"}
                    </span>
                  </div>
                  <div>
                    <span className="text-text-3 block text-[10.5px]">
                      Average Latency
                    </span>
                    <span className="font-semibold font-mono text-signal">
                      ~520ms
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px] text-text-3">
                  <span>Supported NLP:</span>
                  <span className="font-medium text-text font-mono">
                    Bangla · Banglish · English
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Plan Switcher */}
            <div className="rounded-xl border border-line p-4 space-y-2.5 bg-white">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-[11.5px] font-bold uppercase tracking-wider text-text-3">
                  Subscription Tier
                </h4>
                <span className="text-[11.5px] font-mono font-bold text-signal">
                  Current: {getPlanInfo(selectedMerchant.plan).name}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-0.5">
                {plans.map((p) => {
                  const isCurrent =
                    findMatchingPlan(selectedMerchant.plan, plans)?.id === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isCurrent}
                      onClick={() =>
                        setPendingPlanSwitch({
                          merchant: selectedMerchant,
                          targetPlan: p,
                        })
                      }
                      className={cx(
                        "rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all cursor-pointer",
                        isCurrent
                          ? "border-signal bg-signal text-white font-bold cursor-default"
                          : "border-line bg-canvas hover:border-signal hover:text-signal text-text-2 hover:bg-white",
                      )}
                    >
                      {isCurrent
                        ? `✓ ${p.name}`
                        : `${p.name} (${p.priceBDT > 0 ? formatTaka(p.priceBDT) : "Free"})`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plan Change Confirmation / Warning Dialog */}
      {pendingPlanSwitch && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPendingPlanSwitch(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-line p-5.5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-line">
              <div>
                <h3 className="text-[16px] font-bold text-text">
                  Change Subscription Plan
                </h3>
                <p className="text-[12px] text-text-3 mt-0.5">
                  Update billing tier and limits for{" "}
                  <span className="font-semibold text-text">
                    {pendingPlanSwitch.merchant.storeName}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingPlanSwitch(null)}
                className="grid size-7.5 place-items-center rounded-lg border border-line text-text-3 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
              >
                <IconClose width={13} height={13} />
              </button>
            </div>

            {/* Comparison Grid (Current vs New) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-line bg-canvas/60 p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-text-3 block">
                  Current Plan
                </span>
                <p className="text-[13.5px] font-bold text-text">
                  {getPlanInfo(pendingPlanSwitch.merchant.plan).name}
                </p>
                <span className="text-[11px] font-mono text-text-3 block">
                  {getPlanInfo(pendingPlanSwitch.merchant.plan).priceBDT > 0
                    ? `${formatTaka(getPlanInfo(pendingPlanSwitch.merchant.plan).priceBDT)} / mo`
                    : "Free"}
                </span>
              </div>

              <div className="rounded-xl border border-signal/30 bg-signal/[0.04] p-3 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-signal block">
                  New Target Plan
                </span>
                <p className="text-[13.5px] font-bold text-signal">
                  {pendingPlanSwitch.targetPlan.name}
                </p>
                <span className="text-[11px] font-mono text-signal/90 block font-semibold">
                  {pendingPlanSwitch.targetPlan.priceBDT > 0
                    ? `${formatTaka(pendingPlanSwitch.targetPlan.priceBDT)} / mo`
                    : "Free"}
                </span>
              </div>
            </div>

            {/* Quota & Limit Summary */}
            <div className="rounded-xl border border-line p-3.5 space-y-2 bg-white text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-text-3">Message Quota</span>
                <span className="font-mono font-semibold text-text">
                  {pendingPlanSwitch.targetPlan.messageLimit.toLocaleString()}{" "}
                  orders / mo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-3">Catalog Limit</span>
                <span className="font-mono font-semibold text-text">
                  {pendingPlanSwitch.targetPlan.catalogLimit.toLocaleString()}{" "}
                  products
                </span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-line/60">
                <span className="text-text-3">Effective</span>
                <span className="font-medium text-text">
                  Immediate across channels
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPendingPlanSwitch(null)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-[12px] font-semibold text-text-2 hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePlanUpgrade(
                    pendingPlanSwitch.merchant.id,
                    pendingPlanSwitch.targetPlan,
                  );
                  setPendingPlanSwitch(null);
                }}
                className="rounded-xl bg-signal px-4.5 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-signal-deep transition-all cursor-pointer"
              >
                Confirm Plan Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change (Suspend / Activate) Confirmation Dialog */}
      {pendingStatusChange && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setPendingStatusChange(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-line p-5.5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-line">
              <div>
                <h3 className="text-[16px] font-bold text-text">
                  {pendingStatusChange.newStatus === "suspended"
                    ? "Suspend Merchant"
                    : "Activate Merchant"}
                </h3>
                <p className="text-[12px] text-text-3 mt-0.5">
                  Account status update for{" "}
                  <span className="font-semibold text-text">
                    {pendingStatusChange.merchant.storeName}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="grid size-7.5 place-items-center rounded-lg border border-line text-text-3 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
              >
                <IconClose width={13} height={13} />
              </button>
            </div>

            {/* Impact Details Box */}
            {pendingStatusChange.newStatus === "suspended" ? (
              <div className="space-y-3">
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  Suspending this merchant will immediately halt AI automation
                  and customer checkout access.
                </p>
                <div className="rounded-xl border border-red-200/80 bg-red-50/40 p-3.5 space-y-2 text-[12px]">
                  <div className="flex items-center justify-between text-text-2">
                    <span className="text-text-3">AI Auto-Replies</span>
                    <span className="font-semibold text-red-600">
                      Paused on all channels
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-2">
                    <span className="text-text-3">Order Checkout</span>
                    <span className="font-semibold text-red-600">Disabled</span>
                  </div>
                  <div className="flex items-center justify-between text-text-2">
                    <span className="text-text-3">Console Access</span>
                    <span className="font-medium text-text-2">
                      Read-only mode
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[12.5px] text-text-2 leading-relaxed">
                  Activating this merchant will restore AI agent auto-replies
                  and allow active order processing across all connected
                  channels.
                </p>
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 space-y-2 text-[12px]">
                  <div className="flex items-center justify-between text-text-2">
                    <span className="text-text-3">AI Auto-Replies</span>
                    <span className="font-semibold text-emerald-700">
                      Restored to Live
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-text-2">
                    <span className="text-text-3">Channel Sync</span>
                    <span className="font-semibold text-emerald-700">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="rounded-xl border border-line bg-white px-4 py-2 text-[12px] font-semibold text-text-2 hover:bg-surface-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              {pendingStatusChange.newStatus === "suspended" ? (
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(
                      pendingStatusChange.merchant.id,
                      "suspended",
                    );
                    setPendingStatusChange(null);
                  }}
                  className="rounded-xl bg-red-600 px-4.5 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-red-700 transition-all cursor-pointer"
                >
                  Confirm &amp; Suspend
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleStatusChange(
                      pendingStatusChange.merchant.id,
                      "active",
                    );
                    setPendingStatusChange(null);
                  }}
                  className="rounded-xl bg-signal px-4.5 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-signal-deep transition-all cursor-pointer"
                >
                  Confirm &amp; Activate
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

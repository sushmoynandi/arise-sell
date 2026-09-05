"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseContractData, api } from "@/lib/api-client";
import { cx } from "@/lib/format";
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconPlus,
  IconTrash,
  IconWarn,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

interface ContractsTableProps {
  contracts: EnterpriseContractData[];
  loading: boolean;
  onRefresh: () => void;
  onOpenCreate: () => void;
  onActivate?: (contractId: string) => Promise<void>;
  onDelete: (contractId: string) => Promise<void>;
  onUpdate?: (
    contractId: string,
    data: Partial<EnterpriseContractData>,
  ) => Promise<void>;
}

export function ContractsTable({
  contracts,
  loading,
  onRefresh,
  onOpenCreate,
  onDelete,
  onUpdate,
}: ContractsTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingContract, setDeletingContract] = useState<{
    id: string;
    code: string;
    planName: string;
  } | null>(null);
  const [isDeletingContract, setIsDeletingContract] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    try {
      setIsRefreshing(true);
      await Promise.resolve(onRefresh());
    } finally {
      setTimeout(() => setIsRefreshing(false), 350);
    }
  };

  // Edit Modal State
  const [editingContract, setEditingContract] =
    useState<EnterpriseContractData | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editPlanName, setEditPlanName] = useState("");
  const [editDuration, setEditDuration] = useState(6);
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const [editCustomDuration, setEditCustomDuration] = useState("");
  const [editPriceBDT, setEditPriceBDT] = useState<number | string>(0);
  const [editValidUntil, setEditValidUntil] = useState("");
  const [editMaxStores, setEditMaxStores] = useState<number | string>(1);
  const [editMaxSeats, setEditMaxSeats] = useState<number | string>(1);
  const [editMessageLimit, setEditMessageLimit] = useState<number | string>(
    1000,
  );
  const [editStatus, setEditStatus] = useState("pending");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleStartEdit = (c: EnterpriseContractData) => {
    setEditingContract(c);
    setEditCode(c.contract_code);
    setEditPlanName(c.plan_name);

    const standardDurations = [1, 3, 5, 6, 12];
    if (standardDurations.includes(c.duration_months)) {
      setEditDuration(c.duration_months);
      setIsCustomDuration(false);
      setEditCustomDuration("");
    } else {
      setEditDuration(c.duration_months);
      setIsCustomDuration(true);
      setEditCustomDuration(String(c.duration_months));
    }

    setEditPriceBDT(c.price_bdt ?? 0);
    setEditValidUntil(c.valid_until ? c.valid_until.split("T")[0] : "");
    setEditMaxStores(c.max_stores ?? 1);
    setEditMaxSeats(c.max_seats ?? 1);
    setEditMessageLimit(c.message_limit ?? 1000);
    setEditStatus(c.status || "pending");
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContract) return;

    if (!editCode.trim()) {
      setEditError("Contract code cannot be empty.");
      return;
    }
    if (!editPlanName.trim()) {
      setEditError("Plan name cannot be empty.");
      return;
    }

    setIsSavingEdit(true);
    setEditError(null);

    try {
      const finalDuration = isCustomDuration
        ? Math.max(1, Number(editCustomDuration) || 1)
        : editDuration;

      const payload: Partial<EnterpriseContractData> = {
        contract_code: editCode.trim().toUpperCase().replace(/\s+/g, "-"),
        plan_name: editPlanName.trim(),
        duration_months: finalDuration,
        price_bdt: Math.max(0, Number(editPriceBDT) || 0),
        valid_until: editValidUntil.trim() ? editValidUntil.trim() : null,
        max_stores: Math.max(1, Number(editMaxStores) || 1),
        max_seats: Math.max(1, Number(editMaxSeats) || 1),
        message_limit: Math.max(100, Number(editMessageLimit) || 1000),
        status: editStatus as "pending" | "active" | "expired" | "cancelled",
      };

      if (onUpdate) {
        await onUpdate(editingContract.id, payload);
      } else {
        await api.admin.updateContract(editingContract.id, payload);
      }

      onRefresh();
      setEditingContract(null);
    } catch (err: unknown) {
      console.error("Failed to update custom plan:", err);
      setEditError(
        err instanceof Error ? err.message : "Failed to update custom plan",
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteClick = (contract: EnterpriseContractData) => {
    setDeletingContract({
      id: contract.id,
      code: contract.contract_code,
      planName: contract.plan_name,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deletingContract || isDeletingContract) return;
    try {
      setIsDeletingContract(true);
      await onDelete(deletingContract.id);
      setDeletingContract(null);
    } finally {
      setIsDeletingContract(false);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
        {/* Header Bar (Integrated inside Card) */}
        <div className="px-5 py-4 border-b border-line bg-surface-2/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-surface-2 border border-line grid place-items-center text-signal shrink-0">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-text">
                Custom Plans &amp; Contracts ({contracts.length})
              </h2>
              <p className="text-[12px] text-text-3">
                Multi-month custom plans with negotiated pricing, quotas, and
                client redeem codes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              disabled={isRefreshing}
              onClick={handleRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-2xs h-8.5"
              title="Refresh Contracts"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cx(
                  "transition-transform",
                  isRefreshing && "animate-spin text-signal",
                )}
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
              <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
            <Button
              variant="signal"
              size="sm"
              onClick={onOpenCreate}
              className="gap-1.5 font-semibold text-xs h-8.5 px-3.5 cursor-pointer shadow-xs"
            >
              <IconPlus width={13} height={13} />
              <span>Create Custom Plan</span>
            </Button>
          </div>
        </div>

        {loading && contracts.length === 0 ? (
          <div className="p-8 text-center text-xs text-text-3 animate-pulse">
            Loading custom plans...
          </div>
        ) : contracts.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <div className="size-10 rounded-full bg-surface-2 text-text-3 mx-auto grid place-items-center">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-text">
              No Custom Plans Created Yet
            </p>
            <p className="text-[11.5px] text-text-3 max-w-sm mx-auto">
              You haven&apos;t created any custom multi-month plans or
              proposals. Click below to generate a custom plan code.
            </p>
            <div className="pt-2">
              <Button
                variant="signal"
                size="sm"
                onClick={onOpenCreate}
                className="gap-1 text-xs h-8 px-3.5 cursor-pointer"
              >
                <IconPlus width={13} height={13} />
                <span>Create Custom Plan</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto relative">
            {isRefreshing && (
              <div className="absolute inset-x-0 top-0 h-0.5 bg-signal/20 overflow-hidden z-10">
                <div className="h-full bg-signal w-1/3 animate-pulse" />
              </div>
            )}
            <table className="w-full text-left text-[13px]">
              <thead className="border-b border-line bg-surface-2/40 text-[11px] font-bold uppercase tracking-wider text-text-3">
                <tr>
                  <th className="py-3.5 pl-5 pr-3 w-[190px] whitespace-nowrap">
                    Code
                  </th>
                  <th className="py-3.5 px-3 w-[150px] whitespace-nowrap">
                    Plan Name
                  </th>
                  <th className="py-3.5 px-3 w-[130px] whitespace-nowrap">
                    Duration
                  </th>
                  <th className="py-3.5 px-3 w-[140px] whitespace-nowrap">
                    Deal Price
                  </th>
                  <th className="py-3.5 px-3 w-[120px] whitespace-nowrap">
                    Valid Until
                  </th>
                  <th className="py-3.5 px-3 whitespace-nowrap">
                    Entitlements
                  </th>
                  <th className="py-3.5 px-3 w-[120px] whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3.5 pl-3 pr-5 text-right w-[110px] whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className={cx(
                  "divide-y divide-line/60 font-sans transition-opacity duration-200",
                  isRefreshing && "opacity-50",
                )}
              >
                {contracts.map((c) => {
                  const isActive = c.status === "active";
                  const isPending = c.status === "pending";
                  const isDeleting =
                    isDeletingContract && deletingContract?.id === c.id;

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-surface-2/30 transition-colors"
                    >
                      {/* 1. Code */}
                      <td className="py-3.5 pl-5 pr-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[11px] bg-surface-2 text-text px-2 py-0.5 rounded border border-line select-all">
                            {c.contract_code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(c.contract_code)}
                            title="Copy Code"
                            className="text-text-3 hover:text-signal p-0.5 transition-colors cursor-pointer"
                          >
                            {copiedCode === c.contract_code ? (
                              <IconCheck
                                width={12}
                                height={12}
                                className="text-signal"
                              />
                            ) : (
                              <IconCopy width={12} height={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* 2. Plan Name */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-text text-[13.5px]">
                          {c.plan_name}
                        </div>
                      </td>

                      {/* 3. Duration */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="text-[13px] font-semibold text-text">
                          {c.duration_months}{" "}
                          {c.duration_months === 1 ? "Month" : "Months"}
                        </div>
                        {isActive && c.expires_at ? (
                          <div className="text-[11px] text-text-3 font-medium mt-0.5">
                            Exp: {c.expires_at.slice(0, 10)}
                          </div>
                        ) : null}
                      </td>

                      {/* 4. Deal Price */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-text text-[13.5px]">
                          ৳{(c.price_bdt || 0).toLocaleString("en-US")}
                        </div>
                        <div className="text-[11px] text-text-3 font-medium mt-0.5">
                          ৳
                          {Math.round(
                            (c.price_bdt || 0) / Math.max(1, c.duration_months),
                          ).toLocaleString("en-US")}
                          /mo
                        </div>
                      </td>

                      {/* 5. Valid Until */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        {c.valid_until ? (
                          <span className="text-[12.5px] text-text-2 font-medium">
                            {c.valid_until}
                          </span>
                        ) : (
                          <span className="text-text-3 text-[12.5px]">—</span>
                        )}
                      </td>

                      {/* 6. Entitlements */}
                      <td className="py-3.5 px-3">
                        <div className="text-[13px] font-semibold text-text">
                          {c.max_stores}{" "}
                          {c.max_stores === 1 ? "Store" : "Stores"}{" "}
                          <span className="text-text-3 font-normal">·</span>{" "}
                          {c.max_seats} {c.max_seats === 1 ? "Seat" : "Seats"}
                        </div>
                        <div className="text-[11px] text-text-3 font-medium mt-0.5">
                          {(c.message_limit || 0).toLocaleString("en-US")}{" "}
                          msgs/mo
                        </div>
                      </td>

                      {/* 7. Status */}
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide",
                            isActive
                              ? "bg-signal/[0.08] text-signal border border-signal/20"
                              : isPending
                                ? "bg-amber-500/[0.08] text-amber-700 border border-amber-500/20"
                                : "bg-surface-2 text-text-3 border border-line",
                          )}
                        >
                          <span
                            className={cx(
                              "size-1.5 rounded-full",
                              isActive
                                ? "bg-signal"
                                : isPending
                                  ? "bg-amber-500"
                                  : "bg-text-3",
                            )}
                          />
                          {c.status.toUpperCase()}
                        </span>
                      </td>

                      {/* 8. Actions (Clean Edit + Delete) */}
                      <td className="py-3.5 pl-3 pr-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(c)}
                            className="text-text-3 hover:text-signal hover:bg-surface-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs font-semibold"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isDeletingContract}
                            onClick={() => handleDeleteClick(c)}
                            title="Delete Custom Plan"
                            className="text-text-3 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          >
                            <IconTrash width={13} height={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Edit Custom Plan Modal ─── */}
      {/* ─── Edit Custom Plan Modal ─── */}
      <AnimatePresence>
        {editingContract && (
          <motion.div
            key="edit-contract-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditingContract(null);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 8 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 8 }}
              transition={{ type: "spring", duration: 0.25, bounce: 0.08 }}
              className="w-full max-w-lg rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-line pb-2.5">
                <div>
                  <h3 className="text-[15.5px] font-bold text-text">
                    Edit Custom Plan
                  </h3>
                  <p className="text-[11.5px] text-text-3">
                    Ref:{" "}
                    <span className="font-mono font-bold text-text">
                      {editingContract.contract_code}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingContract(null)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1 rounded-md hover:bg-surface-2 transition-colors"
                  title="Close"
                >
                  <IconClose width={14} height={14} />
                </button>
              </div>

              <form
                onSubmit={handleSaveEdit}
                noValidate
                className="space-y-4 text-[13px]"
              >
                {/* 1. Code & Plan Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-text text-xs">
                        Contract Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const pfx =
                            (editPlanName || "CUSTOM")
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "")
                              .slice(0, 6) || "CUSTOM";
                          const dur = isCustomDuration
                            ? Math.max(1, Number(editCustomDuration) || 1)
                            : editDuration;
                          const rnd = Math.random()
                            .toString(36)
                            .substring(2, 6)
                            .toUpperCase();
                          setEditCode(`${pfx}-${dur}M-${rnd}`);
                        }}
                        className="text-[10px] text-signal font-semibold hover:underline cursor-pointer"
                      >
                        Regenerate
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={editCode}
                      onChange={(e) =>
                        setEditCode(
                          e.target.value.toUpperCase().replace(/\s+/g, "-"),
                        )
                      }
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-mono font-bold tracking-wide focus:border-signal outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-text text-xs mb-1">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editPlanName}
                      onChange={(e) => setEditPlanName(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-semibold focus:border-signal outline-none text-xs"
                    />
                  </div>
                </div>

                {/* 2. Duration (Months) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-text text-xs">
                      Contract Duration
                    </label>
                    <span className="text-[11px] text-signal font-semibold">
                      {isCustomDuration
                        ? `${Number(editCustomDuration) || 0} Month${(Number(editCustomDuration) || 0) > 1 ? "s" : ""} (Custom)`
                        : `${editDuration} Month${editDuration > 1 ? "s" : ""} Term`}
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 3, 5, 6, 12].map((m) => {
                      const isSelected =
                        !isCustomDuration && editDuration === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            setIsCustomDuration(false);
                            setEditDuration(m);
                            setEditCustomDuration("");
                          }}
                          className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "border-signal bg-signal text-white shadow-xs"
                              : "border-line bg-surface-1 text-text hover:border-signal/50 hover:bg-surface-2"
                          }`}
                        >
                          {m === 12 ? "1 Year" : `${m} Mo`}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDuration(true);
                        if (!editCustomDuration) {
                          setEditCustomDuration(String(editDuration || 6));
                        }
                      }}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        isCustomDuration
                          ? "border-signal bg-signal text-white shadow-xs"
                          : "border-line bg-surface-1 text-text hover:border-signal/50 hover:bg-surface-2"
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {isCustomDuration && (
                    <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-surface-1 border border-line">
                      <span className="text-xs text-text-3 font-medium">
                        Custom Months:
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={editCustomDuration}
                        onChange={(e) => setEditCustomDuration(e.target.value)}
                        onBlur={() => {
                          if (
                            !editCustomDuration ||
                            Number(editCustomDuration) < 1
                          ) {
                            setEditCustomDuration("1");
                          }
                        }}
                        className="w-20 rounded-lg border border-line bg-white px-2.5 py-1 text-text focus:border-signal outline-none font-mono text-xs font-bold"
                        placeholder="e.g. 5"
                        autoFocus
                      />
                      <span className="text-[11px] text-text-3">
                        months validity
                      </span>
                    </div>
                  )}
                </div>

                {/* 3. Deal Price & Valid Until */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-text text-xs mb-1">
                      Agreed Deal Price (৳ BDT)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={editPriceBDT}
                      onChange={(e) => setEditPriceBDT(e.target.value)}
                      onBlur={() =>
                        setEditPriceBDT(Math.max(0, Number(editPriceBDT) || 0))
                      }
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-mono focus:border-signal outline-none text-xs"
                    />
                    <span className="text-[10.5px] text-text-3 mt-0.5 block">
                      ≈ ৳
                      {Math.round(
                        (Number(editPriceBDT) || 0) /
                          Math.max(
                            1,
                            isCustomDuration
                              ? Number(editCustomDuration) || 1
                              : editDuration,
                          ),
                      ).toLocaleString("en-US")}
                      /mo
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-text text-xs">
                        Proposal Valid Until
                      </label>
                      {editValidUntil && (
                        <button
                          type="button"
                          onClick={() => setEditValidUntil("")}
                          className="text-[10px] text-text-3 hover:text-signal hover:underline cursor-pointer"
                        >
                          Clear Date
                        </button>
                      )}
                    </div>
                    <input
                      type="date"
                      value={editValidUntil}
                      onChange={(e) => setEditValidUntil(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-mono focus:border-signal outline-none text-xs"
                    />
                    <span className="text-[10.5px] text-text-3 mt-0.5 block">
                      {editValidUntil
                        ? "Client proposal expiration date"
                        : "No expiry date set"}
                    </span>
                  </div>
                </div>

                {/* 4. Entitlements */}
                <div className="rounded-xl border border-line bg-surface-1 p-3 text-xs space-y-2">
                  <span className="font-semibold text-text block">
                    Resource Entitlements:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-text-3 block mb-1">
                        Max Stores
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={editMaxStores}
                        onChange={(e) => setEditMaxStores(e.target.value)}
                        onBlur={() =>
                          setEditMaxStores(
                            Math.max(1, Number(editMaxStores) || 1),
                          )
                        }
                        className="w-full rounded-lg bg-white border border-line px-2 py-1 font-mono font-bold text-center text-xs text-text outline-none focus:border-signal"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-3 block mb-1">
                        Team Seats
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={editMaxSeats}
                        onChange={(e) => setEditMaxSeats(e.target.value)}
                        onBlur={() =>
                          setEditMaxSeats(
                            Math.max(1, Number(editMaxSeats) || 1),
                          )
                        }
                        className="w-full rounded-lg bg-white border border-line px-2 py-1 font-mono font-bold text-center text-xs text-text outline-none focus:border-signal"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-text-3 block mb-1">
                        AI Messages
                      </span>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={editMessageLimit}
                        onChange={(e) => setEditMessageLimit(e.target.value)}
                        onBlur={() =>
                          setEditMessageLimit(
                            Math.max(0, Number(editMessageLimit) || 0),
                          )
                        }
                        className="w-full rounded-lg bg-white border border-line px-2 py-1 font-mono font-bold text-center text-xs text-signal outline-none focus:border-signal"
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Status */}
                <div>
                  <label className="block font-bold text-text text-xs mb-1">
                    Contract Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-semibold focus:border-signal outline-none text-xs"
                  >
                    <option value="pending">
                      PENDING (Waiting for Merchant Payment)
                    </option>
                    <option value="active">
                      ACTIVE (Active Live Subscription)
                    </option>
                    <option value="expired">
                      EXPIRED (Past Valid Until Date)
                    </option>
                    <option value="cancelled">CANCELLED</option>
                  </select>
                </div>

                {editError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                    {editError}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingContract(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="signal"
                    size="sm"
                    disabled={
                      isSavingEdit || !editCode.trim() || !editPlanName.trim()
                    }
                  >
                    {isSavingEdit ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal (Clean & Basic UI) ─── */}
      <AnimatePresence>
        {deletingContract && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeletingContract) {
                setDeletingContract(null);
              }
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="size-9.5 rounded-full bg-rose-50 border border-rose-200 grid place-items-center shrink-0 text-rose-600">
                  <IconWarn width={19} height={19} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text">
                    Delete Custom Plan?
                  </h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to cancel and delete custom plan{" "}
                    <strong className="text-text font-mono font-bold">
                      {deletingContract.code}
                    </strong>{" "}
                    ({deletingContract.planName})? Stores won&apos;t be able to
                    redeem this code anymore.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDeletingContract}
                  onClick={() => setDeletingContract(null)}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  disabled={isDeletingContract}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <IconTrash width={13} height={13} />
                  <span>
                    {isDeletingContract ? "Deleting..." : "Yes, Delete"}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

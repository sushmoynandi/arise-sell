"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api-client";
import { IconCheck, IconClose, IconTrash, IconWarn } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { cx } from "@/lib/format";
import { AdminPlan, PlanBillingPeriod } from "../types";

interface PlanModalsProps {
  editingPlan: AdminPlan | null;
  onCloseEdit: () => void;
  onSaveEdit: (updated: AdminPlan) => Promise<void>;

  deletingPlan: AdminPlan | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void>;

  createModalOpen: boolean;
  onCloseCreate: () => void;
  onCreatePlan: (newPlan: Omit<AdminPlan, "id">) => Promise<void>;
}

export function PlanModals({
  editingPlan,
  onCloseEdit,
  onSaveEdit,
  deletingPlan,
  onCloseDelete,
  onConfirmDelete,
  createModalOpen,
  onCloseCreate,
  onCreatePlan,
}: PlanModalsProps) {
  // Bidirectional calculation helpers
  const calcYearlyFromDiscount = (
    monthly: number,
    discountPct: number,
  ): number => {
    if (monthly <= 0) return 0;
    const annualFull = monthly * 12;
    const safeDiscount = Math.max(0, Math.min(100, discountPct));
    return Math.max(0, Math.round(annualFull * (1 - safeDiscount / 100)));
  };

  const calcDiscountFromYearly = (monthly: number, yearly: number): number => {
    if (monthly <= 0) return 0;
    const annualFull = monthly * 12;
    const pct = Math.round(((annualFull - yearly) / annualFull) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  // Local edit state
  const [localEdit, setLocalEdit] = useState<AdminPlan | null>(editingPlan);
  const [editFeaturesStr, setEditFeaturesStr] = useState("");

  useEffect(() => {
    setLocalEdit(editingPlan);
    setEditFeaturesStr(
      editingPlan?.features ? editingPlan.features.join("\n") : "",
    );
  }, [editingPlan]);

  // ─── Code Generator Modal State ──────────────────────────────
  const [codeGenOpen, setCodeGenOpen] = useState(false);
  const [codeGenPlan, setCodeGenPlan] = useState<AdminPlan | null>(null);
  const [codeGenDuration, setCodeGenDuration] = useState<number>(1);
  const [codeGenCustomDuration, setCodeGenCustomDuration] = useState<string>("");
  const [codeGenCustomCode, setCodeGenCustomCode] = useState<string>("");
  const [codeGenPriceBDT, setCodeGenPriceBDT] = useState<number>(0);
  const [codeGenExpiry, setCodeGenExpiry] = useState<string>("");
  const [codeGenMaxUses, setCodeGenMaxUses] = useState<number>(1);
  const [codeGenLoading, setCodeGenLoading] = useState(false);
  const [codeGenError, setCodeGenError] = useState<string | null>(null);
  const [codeGenResult, setCodeGenResult] = useState<{
    code: string;
    plan_name: string;
    duration_months: number;
    price_bdt: number;
    code_expiry?: string | null;
  } | null>(null);
  const [codeGenCopied, setCodeGenCopied] = useState(false);

  const openCodeGenModal = (plan: AdminPlan | null) => {
    if (!plan) return;
    setCodeGenPlan(plan);
    setCodeGenDuration(1);
    setCodeGenCustomDuration("");
    setCodeGenPriceBDT(plan.priceBDT || 0);
    setCodeGenExpiry("");
    setCodeGenMaxUses(1);
    setCodeGenError(null);
    setCodeGenResult(null);
    setCodeGenCopied(false);

    const cleanPrefix = (plan.name || "CUSTOM")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 10);
    const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    setCodeGenCustomCode(`${cleanPrefix}-1M-${randSuffix}`);

    setCodeGenOpen(true);
  };

  const handleDurationSelect = (months: number) => {
    setCodeGenDuration(months);
    setCodeGenCustomDuration("");
    if (codeGenPlan) {
      const price =
        months === 12 && codeGenPlan.yearlyPriceBDT
          ? codeGenPlan.yearlyPriceBDT
          : Math.round((codeGenPlan.priceBDT || 0) * months);
      setCodeGenPriceBDT(price);

      const cleanPrefix = (codeGenPlan.name || "CUSTOM")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
      const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      setCodeGenCustomCode(`${cleanPrefix}-${months}M-${randSuffix}`);
    }
  };

  const handleCustomDurationChange = (val: string) => {
    setCodeGenCustomDuration(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setCodeGenDuration(num);
      if (codeGenPlan) {
        setCodeGenPriceBDT(Math.round((codeGenPlan.priceBDT || 0) * num));
        const cleanPrefix = (codeGenPlan.name || "CUSTOM")
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, "")
          .slice(0, 10);
        const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        setCodeGenCustomCode(`${cleanPrefix}-${num}M-${randSuffix}`);
      }
    }
  };

  const handleGenerateCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeGenPlan) return;
    setCodeGenLoading(true);
    setCodeGenError(null);

    try {
      const res = await api.admin.generateCustomCode({
        code: codeGenCustomCode.trim() || undefined,
        plan_id: codeGenPlan.id,
        plan_name: codeGenPlan.name,
        duration_months: codeGenDuration,
        price_bdt: codeGenPriceBDT,
        message_limit: codeGenPlan.messageLimit,
        max_stores: codeGenPlan.maxStores,
        max_seats: codeGenPlan.maxSeats,
        code_expiry: codeGenExpiry.trim() || null,
        max_uses: codeGenMaxUses,
      });

      if (res && res.code) {
        setCodeGenResult({
          code: String(res.code),
          plan_name: String(res.plan_name || codeGenPlan.name),
          duration_months: Number(res.duration_months || codeGenDuration),
          price_bdt: Number(res.price_bdt || codeGenPriceBDT),
          code_expiry: res.code_expiry ? String(res.code_expiry) : null,
        });
      } else {
        setCodeGenError("Failed to generate code.");
      }
    } catch (err: unknown) {
      console.error("Code generation failed:", err);
      setCodeGenError(
        err instanceof Error ? err.message : "Failed to generate plan code.",
      );
    } finally {
      setCodeGenLoading(false);
    }
  };

  // Create Form State (Clean empty defaults, placeholders only)
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [tagline, setTagline] = useState("");
  const [priceBDT, setPriceBDT] = useState<string>("");
  const [yearlyPriceBDT, setYearlyPriceBDT] = useState<string>("");
  const [yearlyDiscountPercent, setYearlyDiscountPercent] =
    useState<string>("");
  const [billingPeriod, setBillingPeriod] = useState<PlanBillingPeriod>("both");
  const [messageLimit, setMessageLimit] = useState<string>("");
  const [maxStores, setMaxStores] = useState<string>("1");
  const [maxSeats, setMaxSeats] = useState<string>("1");
  const [badge, setBadge] = useState("");
  const [featuresStr, setFeaturesStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers for Create Form Price Inputs (string-safe, no leading zeros)
  const handleMonthlyChange = (valStr: string) => {
    setPriceBDT(valStr);
    const m = parseFloat(valStr);
    if (isNaN(m) || m <= 0) {
      setYearlyPriceBDT("");
      return;
    }
    const currentDiscount = parseFloat(yearlyDiscountPercent);
    if (!isNaN(currentDiscount) && currentDiscount > 0) {
      setYearlyPriceBDT(String(calcYearlyFromDiscount(m, currentDiscount)));
    } else {
      setYearlyDiscountPercent("17");
      setYearlyPriceBDT(String(calcYearlyFromDiscount(m, 17)));
    }
  };

  const handleYearlyPriceChange = (valStr: string) => {
    setYearlyPriceBDT(valStr);
    const m = parseFloat(priceBDT);
    const y = parseFloat(valStr);
    if (!isNaN(m) && m > 0 && !isNaN(y) && y >= 0) {
      setYearlyDiscountPercent(String(calcDiscountFromYearly(m, y)));
    }
  };

  const handleDiscountPercentChange = (valStr: string) => {
    setYearlyDiscountPercent(valStr);
    const m = parseFloat(priceBDT);
    const d = parseFloat(valStr);
    if (!isNaN(m) && m > 0 && !isNaN(d) && d >= 0) {
      setYearlyPriceBDT(String(calcYearlyFromDiscount(m, d)));
    }
  };

  const handleApplyTwoMonthsFree = () => {
    const m = parseFloat(priceBDT);
    if (!isNaN(m) && m > 0) {
      const freePrice = m * 10;
      setYearlyPriceBDT(String(freePrice));
      setYearlyDiscountPercent(String(calcDiscountFromYearly(m, freePrice)));
    }
  };

  // Handlers for Edit Form Price Inputs (string-safe, no leading zeros)
  const handleEditMonthlyChange = (valStr: string) => {
    if (!localEdit) return;
    const m = parseFloat(valStr);
    if (isNaN(m) || m <= 0) {
      setLocalEdit({
        ...localEdit,
        priceBDT: 0,
        yearlyPriceBDT: 0,
      });
      return;
    }
    const discount =
      localEdit.yearlyDiscountPercent && localEdit.yearlyDiscountPercent > 0
        ? localEdit.yearlyDiscountPercent
        : 17;
    const yearly = calcYearlyFromDiscount(m, discount);
    setLocalEdit({
      ...localEdit,
      priceBDT: m,
      yearlyPriceBDT: yearly,
      yearlyDiscountPercent: discount,
    });
  };

  const handleEditYearlyPriceChange = (valStr: string) => {
    if (!localEdit) return;
    const y = parseFloat(valStr);
    const yearly = isNaN(y) ? 0 : Math.max(0, y);
    const discount =
      localEdit.priceBDT > 0
        ? calcDiscountFromYearly(localEdit.priceBDT, yearly)
        : (localEdit.yearlyDiscountPercent ?? 0);
    setLocalEdit({
      ...localEdit,
      yearlyPriceBDT: yearly,
      yearlyDiscountPercent: discount,
    });
  };

  const handleEditDiscountPercentChange = (valStr: string) => {
    if (!localEdit) return;
    const d = parseFloat(valStr);
    const safeDiscount = isNaN(d) ? 0 : Math.max(0, Math.min(100, d));
    const yearly =
      localEdit.priceBDT > 0
        ? calcYearlyFromDiscount(localEdit.priceBDT, safeDiscount)
        : (localEdit.yearlyPriceBDT ?? 0);
    setLocalEdit({
      ...localEdit,
      yearlyPriceBDT: yearly,
      yearlyDiscountPercent: safeDiscount,
    });
  };

  const handleEditTwoMonthsFree = () => {
    if (!localEdit || localEdit.priceBDT <= 0) return;
    const freePrice = localEdit.priceBDT * 10;
    const discount = calcDiscountFromYearly(localEdit.priceBDT, freePrice);
    setLocalEdit({
      ...localEdit,
      yearlyPriceBDT: freePrice,
      yearlyDiscountPercent: discount,
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localEdit || isSubmitting) return;

    const parsedFeatures = editFeaturesStr
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      await onSaveEdit({
        ...localEdit,
        features: parsedFeatures,
      });
      onCloseEdit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || isSubmitting) return;

    const parsedFeatures = featuresStr
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);

    try {
      setIsSubmitting(true);
      await onCreatePlan({
        name,
        nameBn: nameBn || name,
        tagline,
        priceBDT: Number(priceBDT) || 0,
        yearlyPriceBDT: Number(yearlyPriceBDT) || 0,
        yearlyDiscountPercent: Number(yearlyDiscountPercent) || 0,
        billingPeriod,
        messageLimit: Number(messageLimit) || 0,
        maxStores: Math.max(1, Number(maxStores) || 1),
        maxSeats: Math.max(1, Number(maxSeats) || 1),
        catalogLimit: 250,
        courierChannels: 2,
        badge: badge || undefined,
        popular: false,
        activeMerchants: 0,
        status: "active",
        showOnHome: false,
        features:
          parsedFeatures.length > 0
            ? parsedFeatures
            : [`${messageLimit || 200} Messages / month (Comment + Inbox)`],
      });

      // Reset form to clean empty defaults
      setName("");
      setNameBn("");
      setTagline("");
      setPriceBDT("");
      setYearlyPriceBDT("");
      setYearlyDiscountPercent("");
      setBillingPeriod("both");
      setMessageLimit("");
      setMaxStores("1");
      setMaxSeats("1");
      setBadge("");
      setFeaturesStr("");
      onCloseCreate();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ─── 1. Edit Plan Modal ─── */}
      {localEdit && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseEdit();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[16px] font-bold text-text">
                Edit Tier: {localEdit.name}
              </h3>
              <div className="flex items-center gap-3">
                <label
                  className="inline-flex items-center gap-2 cursor-pointer select-none"
                  title="Toggle visibility on public homepage"
                >
                  <span className="text-[12px] font-medium text-text-2">
                    Show on Home
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={Boolean(localEdit.showOnHome)}
                    onClick={() =>
                      setLocalEdit({
                        ...localEdit,
                        showOnHome: !localEdit.showOnHome,
                      })
                    }
                    className={cx(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden",
                      localEdit.showOnHome ? "bg-signal" : "bg-surface-3",
                    )}
                  >
                    <span
                      className={cx(
                        "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                        localEdit.showOnHome
                          ? "translate-x-4"
                          : "translate-x-0",
                      )}
                    />
                  </button>
                </label>

                <div className="h-4 w-px bg-line" />

                <button
                  type="button"
                  onClick={onCloseEdit}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1 rounded-md hover:bg-surface-2 transition-colors"
                  title="Close"
                >
                  <IconClose width={14} height={14} />
                </button>
              </div>
            </div>

            <form
              onSubmit={handleEditSubmit}
              className="space-y-3.5 text-[13px]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={localEdit.name}
                    onChange={(e) =>
                      setLocalEdit({ ...localEdit, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">
                    Bengali Name
                  </label>
                  <input
                    type="text"
                    value={localEdit.nameBn || ""}
                    onChange={(e) =>
                      setLocalEdit({ ...localEdit, nameBn: e.target.value })
                    }
                    placeholder="e.g. গ্রোথ"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={localEdit.tagline || ""}
                  onChange={(e) =>
                    setLocalEdit({ ...localEdit, tagline: e.target.value })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              {/* Monthly Price, Yearly Price & Save % */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Monthly Price (৳/mo)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={localEdit.priceBDT || ""}
                    onChange={(e) => handleEditMonthlyChange(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-text">
                      Yearly Price (৳/yr)
                    </label>
                    <button
                      type="button"
                      onClick={handleEditTwoMonthsFree}
                      className="text-[10.5px] text-signal font-semibold hover:underline cursor-pointer"
                      title="Set 2 months free (Monthly × 10)"
                    >
                      2 mo free
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={localEdit.yearlyPriceBDT || ""}
                    onChange={(e) =>
                      handleEditYearlyPriceChange(e.target.value)
                    }
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Yearly Save %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={localEdit.yearlyDiscountPercent || ""}
                      onChange={(e) =>
                        handleEditDiscountPercentChange(e.target.value)
                      }
                      placeholder="e.g. 17"
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 pr-7 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 text-[12px] font-mono pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Monthly Messages Quota
                  </label>
                  <input
                    type="number"
                    required
                    value={localEdit.messageLimit}
                    onChange={(e) =>
                      setLocalEdit({
                        ...localEdit,
                        messageLimit: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Billing Period
                  </label>
                  <select
                    value={localEdit.billingPeriod || "both"}
                    onChange={(e) =>
                      setLocalEdit({
                        ...localEdit,
                        billingPeriod: e.target.value as PlanBillingPeriod,
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-semibold text-[12.5px]"
                  >
                    <option value="both">Both (Monthly &amp; Yearly)</option>
                    <option value="monthly">Monthly Only</option>
                    <option value="yearly">Yearly Only</option>
                  </select>
                </div>
              </div>

              {/* Max Stores, Max Team Seats, Badge Tag in the same row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1 flex items-center justify-between">
                    <span>Max Stores</span>
                    <span className="text-[11px] text-text-3 font-normal font-mono">
                      Store limit
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={localEdit.maxStores ?? 1}
                    onChange={(e) =>
                      setLocalEdit({
                        ...localEdit,
                        maxStores: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1 flex items-center justify-between">
                    <span>Max Team Seats</span>
                    <span className="text-[11px] text-text-3 font-normal font-mono">
                      Members
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={localEdit.maxSeats ?? 1}
                    onChange={(e) =>
                      setLocalEdit({
                        ...localEdit,
                        maxSeats: Math.max(1, Number(e.target.value) || 1),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={localEdit.badge || ""}
                    onChange={(e) =>
                      setLocalEdit({ ...localEdit, badge: e.target.value })
                    }
                    placeholder="e.g. Most Popular"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={editFeaturesStr}
                  onChange={(e) => setEditFeaturesStr(e.target.value)}
                  placeholder="e.g. 200 Messages / month (Comment + Inbox)&#10;WhatsApp & Messenger integration"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none text-[12.5px]"
                />
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-line">
                <button
                  type="button"
                  onClick={() => openCodeGenModal(localEdit)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-signal/40 bg-signal/5 px-3 py-1.5 text-xs font-semibold text-signal hover:bg-signal/15 hover:border-signal transition-colors cursor-pointer"
                  title="Generate activation or voucher code for this plan"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                  <span>Generate Code</span>
                </button>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onCloseEdit}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="signal"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 1.1 Generate Activation Code Modal ─── */}
      {codeGenOpen && codeGenPlan && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setCodeGenOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-signal/10 text-signal grid place-items-center">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text">
                    Generate Activation Code
                  </h3>
                  <p className="text-[11.5px] text-text-3">
                    Plan: <strong className="text-text">{codeGenPlan.name}</strong> • ৳{codeGenPlan.priceBDT.toLocaleString("en-US")}/mo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCodeGenOpen(false)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1 rounded-md hover:bg-surface-2 transition-colors"
                title="Close"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            {/* Modal Body */}
            {codeGenResult ? (
              /* Success / Result View */
              <div className="space-y-4 py-1">
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center space-y-2">
                  <div className="size-10 rounded-full bg-emerald-500/15 text-emerald-600 mx-auto grid place-items-center">
                    <IconCheck width={20} height={20} />
                  </div>
                  <div className="text-[11px] uppercase tracking-wider font-semibold text-emerald-700">
                    Activation Code Ready
                  </div>
                  <div className="font-mono text-2xl font-black text-text tracking-wider select-all bg-white py-2 px-3 rounded-xl border border-emerald-500/20 shadow-xs">
                    {codeGenResult.code}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(codeGenResult.code);
                      setCodeGenCopied(true);
                      setTimeout(() => setCodeGenCopied(false), 2200);
                    }}
                    className={cx(
                      "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      codeGenCopied
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    )}
                  >
                    {codeGenCopied ? (
                      <>
                        <IconCheck width={14} height={14} />
                        <span>Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Details Breakdown */}
                <div className="rounded-xl border border-line bg-surface-1 p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-3">Plan Tier:</span>
                    <span className="font-semibold text-text">{codeGenResult.plan_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-3">Contract Duration:</span>
                    <span className="font-semibold text-signal">
                      {codeGenResult.duration_months} Month{codeGenResult.duration_months > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-3">Agreed Price:</span>
                    <span className="font-semibold text-text font-mono">
                      ৳{codeGenResult.price_bdt.toLocaleString("en-US")} BDT
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-3">Must Redeem By:</span>
                    <span className="font-semibold text-text">
                      {codeGenResult.code_expiry ? (
                        <span className="text-amber-600 font-mono">
                          {codeGenResult.code_expiry}
                        </span>
                      ) : (
                        <span className="text-text-3">No Expiry (Permanent Until Redeemed)</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* WhatsApp Share Box */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      const msg = `🎉 Hello! Here is your custom Arise-Sell subscription activation code:\n\n🔑 Code: ${codeGenResult.code}\n📦 Plan: ${codeGenResult.plan_name}\n⏳ Duration: ${codeGenResult.duration_months} Months Access\n${codeGenResult.code_expiry ? `⚠️ Redeem By: ${codeGenResult.code_expiry}\n` : ""}\nHow to activate:\n1. Log into your Arise-Sell store\n2. Open Settings > Billing\n3. Click "Redeem Plan Code", enter the code and click Redeem.\n\nThank you for choosing Arise-Sell!`;
                      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.77.813 2.796.814h.005c3.18 0 5.767-2.586 5.768-5.766 0-1.541-.6-2.99-1.69-4.08-1.089-1.09-2.54-1.69-4.083-1.69z" />
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.662 1.438 5.184L2 22l4.981-1.309C8.423 21.53 10.154 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.05c-1.65 0-3.18-.464-4.492-1.267l-.322-.196-2.964.778.791-2.89-.214-.341C3.957 14.806 3.5 13.447 3.5 12c0-4.687 3.813-8.5 8.5-8.5 2.27 0 4.406.885 6.012 2.49 1.605 1.606 2.488 3.742 2.488 6.01 0 4.687-3.813 8.5-8.5 8.5z" />
                    </svg>
                    <span>Share on WhatsApp with Client</span>
                  </button>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-line">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCodeGenResult(null);
                      openCodeGenModal(codeGenPlan);
                    }}
                  >
                    Generate Another
                  </Button>
                  <Button
                    type="button"
                    variant="signal"
                    size="sm"
                    onClick={() => setCodeGenOpen(false)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* Generator Form */
              <form onSubmit={handleGenerateCodeSubmit} className="space-y-4 text-[13px]">
                {/* 1. Duration Presets (1M, 3M, 5M, 6M, 12M, Custom) */}
                <div>
                  <label className="block font-bold text-text mb-1.5 flex items-center justify-between">
                    <span>Subscription Duration (Months)</span>
                    <span className="text-[11px] text-signal font-semibold">
                      {codeGenDuration} Month{codeGenDuration > 1 ? "s" : ""} Contract
                    </span>
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {[1, 3, 5, 6, 12].map((m) => {
                      const isSelected = codeGenDuration === m && codeGenCustomDuration === "";
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => handleDurationSelect(m)}
                          className={cx(
                            "py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                            isSelected
                              ? "border-signal bg-signal text-white shadow-xs"
                              : "border-line bg-surface-1 text-text hover:border-signal/50 hover:bg-surface-2"
                          )}
                        >
                          {m === 12 ? "1 Year" : `${m} Mo`}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = codeGenCustomDuration || String(codeGenDuration || 7);
                        handleCustomDurationChange(nextVal);
                      }}
                      className={cx(
                        "py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                        codeGenCustomDuration !== ""
                          ? "border-signal bg-signal text-white shadow-xs"
                          : "border-line bg-surface-1 text-text hover:border-signal/50 hover:bg-surface-2"
                      )}
                    >
                      Custom
                    </button>
                  </div>

                  {codeGenCustomDuration !== "" && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-text-3 font-medium">Custom Months:</span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={codeGenCustomDuration}
                        onChange={(e) => handleCustomDurationChange(e.target.value)}
                        className="w-24 rounded-lg border border-line bg-white px-2.5 py-1 text-text focus:border-signal outline-none font-mono text-xs"
                        placeholder="e.g. 5"
                      />
                      <span className="text-[11px] text-text-3">months (client access validity)</span>
                    </div>
                  )}
                </div>

                {/* 2. Code String */}
                <div>
                  <label className="block font-bold text-text mb-1 flex items-center justify-between">
                    <span>Voucher / Activation Code</span>
                    <button
                      type="button"
                      onClick={() => {
                        const cleanPrefix = (codeGenPlan.name || "CUSTOM")
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 10);
                        const randSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
                        setCodeGenCustomCode(`${cleanPrefix}-${codeGenDuration}M-${randSuffix}`);
                      }}
                      className="text-[11px] text-signal hover:underline cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </label>
                  <input
                    type="text"
                    required
                    value={codeGenCustomCode}
                    onChange={(e) => setCodeGenCustomCode(e.target.value.toUpperCase())}
                    placeholder="e.g. ENTERPRIZE-6M-ABCD"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-mono font-bold tracking-wide focus:border-signal outline-none text-[13px]"
                  />
                  <p className="text-[11px] text-text-3 mt-1">
                    Client enters this code in <strong>Settings &gt; Billing &gt; Redeem Plan Code</strong>.
                  </p>
                </div>

                {/* 3. Deal Price & Expiry Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-bold text-text mb-1">
                      Agreed Deal Price (৳ BDT)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={codeGenPriceBDT}
                      onChange={(e) => setCodeGenPriceBDT(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-mono focus:border-signal outline-none text-[13px]"
                    />
                    <span className="text-[10.5px] text-text-3 mt-0.5 block">
                      ≈ ৳{Math.round(codeGenPriceBDT / Math.max(1, codeGenDuration)).toLocaleString("en-US")}/mo
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-text mb-1">
                      Redeem Expiry Date (Optional)
                    </label>
                    <input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={codeGenExpiry}
                      onChange={(e) => setCodeGenExpiry(e.target.value)}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-mono focus:border-signal outline-none text-[13px]"
                    />
                    <span className="text-[10.5px] text-text-3 mt-0.5 block">
                      Client must redeem before this date
                    </span>
                  </div>
                </div>

                {/* 4. Max Redemptions */}
                <div>
                  <label className="block font-bold text-text mb-1 flex items-center justify-between">
                    <span>Max Allowed Redemptions</span>
                    <span className="text-[11px] text-text-3 font-normal">
                      Default: 1 (Single Client)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={codeGenMaxUses}
                    onChange={(e) => setCodeGenMaxUses(Math.max(1, Number(e.target.value) || 1))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text font-mono focus:border-signal outline-none text-[13px]"
                  />
                </div>

                {/* Plan Entitlements Summary */}
                <div className="rounded-xl border border-line bg-surface-1 p-3 text-xs space-y-1.5">
                  <div className="font-semibold text-text flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-signal inline-block" />
                    <span>Resource Entitlements for this Code:</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px] text-text-2">
                    <div className="rounded-lg bg-white border border-line p-1.5 text-center">
                      <div className="text-[10px] text-text-3 font-sans">Stores</div>
                      <div className="font-bold text-text">{codeGenPlan.maxStores}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-line p-1.5 text-center">
                      <div className="text-[10px] text-text-3 font-sans">Team Seats</div>
                      <div className="font-bold text-text">{codeGenPlan.maxSeats}</div>
                    </div>
                    <div className="rounded-lg bg-white border border-line p-1.5 text-center">
                      <div className="text-[10px] text-text-3 font-sans">AI Messages</div>
                      <div className="font-bold text-text">{codeGenPlan.messageLimit.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {codeGenError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                    {codeGenError}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-line">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setCodeGenOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="signal"
                    size="sm"
                    disabled={codeGenLoading || !codeGenCustomCode.trim()}
                  >
                    {codeGenLoading ? "Generating..." : "Generate Activation Code"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── 2. Delete Plan Dialog ─── */}
      <AnimatePresence>
        {deletingPlan && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) onCloseDelete();
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
                    Delete Pricing Tier?
                  </h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to remove{" "}
                    <strong>{deletingPlan.name}</strong>? Existing stores will
                    remain active until billing renewal.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCloseDelete}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <IconTrash width={13} height={13} />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 3. Create Custom Plan Modal ─── */}
      {createModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseCreate();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl rounded-2xl border border-line bg-white p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[16px] font-bold text-text">
                Create Custom Tier
              </h3>
              <button
                type="button"
                onClick={onCloseCreate}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form
              onSubmit={handleCreateSubmit}
              className="space-y-3.5 text-[13px]"
            >
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Enterprise Plus"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">
                    Bengali Name
                  </label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="e.g. এন্টারপ্রাইজ প্লাস"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Automated AI assistance for high-volume shops"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              {/* Monthly Price, Yearly Price & Save % */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Monthly Price (৳/mo)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={priceBDT}
                    onChange={(e) => handleMonthlyChange(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-text">
                      Yearly Price (৳/yr)
                    </label>
                    <button
                      type="button"
                      onClick={handleApplyTwoMonthsFree}
                      className="text-[10.5px] text-signal font-semibold hover:underline cursor-pointer"
                      title="Set 2 months free (Monthly × 10)"
                    >
                      2 mo free
                    </button>
                  </div>
                  <input
                    type="number"
                    min={0}
                    value={yearlyPriceBDT}
                    onChange={(e) => handleYearlyPriceChange(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Yearly Save %
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={yearlyDiscountPercent}
                      onChange={(e) =>
                        handleDiscountPercentChange(e.target.value)
                      }
                      placeholder="e.g. 17"
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 pr-7 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3 text-[12px] font-mono pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Monthly Messages Quota
                  </label>
                  <input
                    type="number"
                    value={messageLimit}
                    onChange={(e) => setMessageLimit(e.target.value)}
                    placeholder="e.g. 200"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Billing Period
                  </label>
                  <select
                    value={billingPeriod}
                    onChange={(e) =>
                      setBillingPeriod(e.target.value as PlanBillingPeriod)
                    }
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-semibold text-[12.5px]"
                  >
                    <option value="both">Both (Monthly &amp; Yearly)</option>
                    <option value="monthly">Monthly Only</option>
                    <option value="yearly">Yearly Only</option>
                  </select>
                </div>
              </div>

              {/* Max Stores, Max Team Seats, Badge Tag in the same row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1 flex items-center justify-between">
                    <span>Max Stores</span>
                    <span className="text-[11px] text-text-3 font-normal font-mono">
                      Store limit
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxStores}
                    onChange={(e) => setMaxStores(e.target.value)}
                    placeholder="e.g. 1 or 2"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1 flex items-center justify-between">
                    <span>Max Team Seats</span>
                    <span className="text-[11px] text-text-3 font-normal font-mono">
                      Members
                    </span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(e.target.value)}
                    placeholder="e.g. 2 or 4"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Badge Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. VIP Recommended"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="e.g. 200 Messages / month (Comment + Inbox)&#10;WhatsApp & Messenger integration"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none text-[12.5px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCloseCreate}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="signal"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Publishing..." : "Publish Plan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

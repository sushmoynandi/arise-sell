"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api-client";
import {
  IconCheck,
  IconClose,
  IconTrash,
  IconWarn,
} from "@/components/ui/icons";
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

  provisionModalOpen?: boolean;
  onCloseProvision?: () => void;
  onContractCreated?: () => void;
  allPlans?: AdminPlan[];
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
  provisionModalOpen = false,
  onCloseProvision,
  onContractCreated,
  allPlans = [],
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

  // ─── Custom Plan & Contract Modal State ──────────────
  const [codeGenOpen, setCodeGenOpen] = useState(false);
  const [codeGenCode, setCodeGenCode] = useState<string>("");
  const [codeGenPlanName, setCodeGenPlanName] =
    useState<string>("Custom Enterprise");
  const [codeGenDuration, setCodeGenDuration] = useState<number>(6);
  const [codeGenIsCustomDuration, setCodeGenIsCustomDuration] =
    useState<boolean>(false);
  const [codeGenCustomDuration, setCodeGenCustomDuration] =
    useState<string>("");
  const [codeGenPriceBDT, setCodeGenPriceBDT] = useState<number | string>(
    15000,
  );
  const [codeGenExpiry, setCodeGenExpiry] = useState<string>("");
  const [customStores, setCustomStores] = useState<number | string>(3);
  const [customSeats, setCustomSeats] = useState<number | string>(10);
  const [customMessages, setCustomMessages] = useState<number | string>(50000);
  const [codeGenLoading, setCodeGenLoading] = useState(false);
  const [codeGenError, setCodeGenError] = useState<string | null>(null);

  const generateNewCode = (planName: string, duration: number) => {
    const cleanName = planName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .substring(0, 8);
    const pfx = cleanName || "CUSTOM";
    const rnd = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${pfx}-${duration}M-${rnd}`;
  };

  const openCodeGenModal = (plan?: AdminPlan | null) => {
    const initialName = plan?.name || "Custom Enterprise";
    const initialDuration = 6;
    const initialStores = plan?.maxStores || 3;
    const initialSeats = plan?.maxSeats || 10;
    const initialMessages = plan?.messageLimit || 50000;
    const initialPrice = plan?.priceBDT
      ? Math.round(plan.priceBDT * initialDuration)
      : 15000;

    setCodeGenPlanName(initialName);
    setCodeGenDuration(initialDuration);
    setCodeGenIsCustomDuration(false);
    setCodeGenCustomDuration("");
    setCodeGenPriceBDT(initialPrice);
    setCustomStores(initialStores);
    setCustomSeats(initialSeats);
    setCustomMessages(initialMessages);
    setCodeGenExpiry("");
    setCodeGenError(null);
    setCodeGenCode(generateNewCode(initialName, initialDuration));
    setCodeGenOpen(true);
  };

  // Sync external provision modal trigger
  useEffect(() => {
    if (provisionModalOpen) {
      const defaultPlan =
        editingPlan ||
        allPlans.find(
          (p) =>
            p.name.toLowerCase().includes("enterprize") ||
            p.name.toLowerCase().includes("custom"),
        ) ||
        null;
      openCodeGenModal(defaultPlan);
    }
  }, [provisionModalOpen]);

  const handleDurationSelect = (months: number) => {
    setCodeGenDuration(months);
    setCodeGenIsCustomDuration(false);
    setCodeGenCustomDuration("");
    setCodeGenCode(generateNewCode(codeGenPlanName, months));
  };

  const handleCustomDurationClick = () => {
    setCodeGenIsCustomDuration(true);
    const nextVal = codeGenCustomDuration || String(codeGenDuration || 6);
    setCodeGenCustomDuration(nextVal);
    const num = parseInt(nextVal, 10) || 1;
    setCodeGenDuration(num);
    setCodeGenCode(generateNewCode(codeGenPlanName, num));
  };

  const handleCustomDurationChange = (val: string) => {
    setCodeGenCustomDuration(val);
    const num = parseInt(val, 10);
    if (!isNaN(num) && num > 0) {
      setCodeGenDuration(num);
      setCodeGenCode(generateNewCode(codeGenPlanName, num));
    }
  };

  const handleRegenerateCode = () => {
    setCodeGenCode(generateNewCode(codeGenPlanName, codeGenDuration));
  };

  const handleContractSubmit = async () => {
    if (!codeGenCode.trim()) {
      setCodeGenError("Please enter or generate a code.");
      return;
    }
    if (!codeGenPlanName.trim()) {
      setCodeGenError("Please enter a plan name.");
      return;
    }
    setCodeGenLoading(true);
    setCodeGenError(null);

    try {
      const finalDuration = codeGenIsCustomDuration
        ? Math.max(1, Number(codeGenCustomDuration) || 1)
        : codeGenDuration;

      const res = await api.admin.createContract({
        contract_code: codeGenCode.trim().toUpperCase().replace(/\s+/g, "-"),
        plan_name: codeGenPlanName.trim(),
        duration_months: finalDuration,
        price_bdt: Math.max(0, Number(codeGenPriceBDT) || 0),
        max_stores: Math.max(1, Number(customStores) || 1),
        max_seats: Math.max(1, Number(customSeats) || 1),
        message_limit: Math.max(100, Number(customMessages) || 1000),
        valid_until: codeGenExpiry.trim() || null,
        notes: `Custom plan created by Super Admin (${finalDuration} months).`,
      });

      if (res && res.contract_code) {
        onContractCreated?.();
        setCodeGenOpen(false);
        onCloseProvision?.();
      } else {
        setCodeGenError("Failed to save custom plan in database.");
      }
    } catch (err: unknown) {
      console.error("Custom plan creation failed:", err);
      setCodeGenError(
        err instanceof Error
          ? err.message
          : "Failed to create custom plan in database.",
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
        priceBDT: Number(localEdit.priceBDT) || 0,
        yearlyPriceBDT: Number(localEdit.yearlyPriceBDT) || 0,
        yearlyDiscountPercent: Number(localEdit.yearlyDiscountPercent) || 0,
        maxStores: Math.max(1, Number(localEdit.maxStores) || 1),
        maxSeats: Math.max(1, Number(localEdit.maxSeats) || 1),
        messageLimit: Math.max(0, Number(localEdit.messageLimit) || 0),
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
                        messageLimit:
                          e.target.value === ""
                            ? ("" as unknown as number)
                            : Number(e.target.value),
                      })
                    }
                    onBlur={() =>
                      setLocalEdit({
                        ...localEdit,
                        messageLimit: Math.max(
                          0,
                          Number(localEdit.messageLimit) || 0,
                        ),
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
                        maxStores:
                          e.target.value === ""
                            ? ("" as unknown as number)
                            : Number(e.target.value),
                      })
                    }
                    onBlur={() =>
                      setLocalEdit({
                        ...localEdit,
                        maxStores: Math.max(
                          1,
                          Number(localEdit.maxStores) || 1,
                        ),
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
                        maxSeats:
                          e.target.value === ""
                            ? ("" as unknown as number)
                            : Number(e.target.value),
                      })
                    }
                    onBlur={() =>
                      setLocalEdit({
                        ...localEdit,
                        maxSeats: Math.max(1, Number(localEdit.maxSeats) || 1),
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

              <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-line">
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
            </form>
          </div>
        </div>
      )}

      {/* ─── 1.1 Custom Plan & Contract Modal ─── */}
      {codeGenOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setCodeGenOpen(false);
              onCloseProvision?.();
            }
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
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text">
                    Create Custom Plan
                  </h3>
                  <p className="text-[11.5px] text-text-3">
                    Configure custom quotas, duration, pricing, and redeem code.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCodeGenOpen(false);
                  onCloseProvision?.();
                }}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1 rounded-md hover:bg-surface-2 transition-colors"
                title="Close"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-[13px]">
              {/* 1. Code & Plan Name in Same Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-text text-xs">
                      Code
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateCode}
                      className="inline-flex items-center gap-1 text-[11px] text-signal font-semibold hover:underline cursor-pointer transition-colors"
                    >
                      <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                      <span>Regenerate</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={codeGenCode}
                    onChange={(e) =>
                      setCodeGenCode(e.target.value.toUpperCase())
                    }
                    placeholder="e.g. CUSTOM-6M-7A8B"
                    className="w-full rounded-xl border border-line bg-surface-1/40 px-3.5 py-2 text-text font-mono font-bold tracking-wide focus:border-signal focus:bg-white outline-none text-[13px] transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-text text-xs">
                      Plan Name
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={codeGenPlanName}
                    onChange={(e) => setCodeGenPlanName(e.target.value)}
                    placeholder="e.g. Custom Enterprise"
                    className="w-full rounded-xl border border-line bg-surface-1/40 px-3.5 py-2 text-text font-semibold focus:border-signal focus:bg-white outline-none text-[13px] transition-all"
                  />
                </div>
              </div>

              {/* 2. Contract Duration (Months) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-text text-xs">
                    Contract Duration (Months)
                  </label>
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-signal font-semibold bg-signal/10 px-2 py-0.5 rounded-md border border-signal/20">
                    {codeGenIsCustomDuration
                      ? `${Number(codeGenCustomDuration) || 0} Month${(Number(codeGenCustomDuration) || 0) > 1 ? "s" : ""} (Custom)`
                      : `${codeGenDuration} Month${codeGenDuration > 1 ? "s" : ""} Term`}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-1.5">
                  {[1, 3, 5, 6, 12].map((m) => {
                    const isSelected =
                      !codeGenIsCustomDuration && codeGenDuration === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleDurationSelect(m)}
                        className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? "border-signal bg-signal text-white shadow-xs"
                            : "border-line bg-surface-1/50 text-text hover:border-signal/50 hover:bg-surface-2"
                        }`}
                      >
                        {m === 12 ? "1 Year" : `${m} Mo`}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleCustomDurationClick}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      codeGenIsCustomDuration
                        ? "border-signal bg-signal text-white shadow-xs"
                        : "border-line bg-surface-1/50 text-text hover:border-signal/50 hover:bg-surface-2"
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {codeGenIsCustomDuration && (
                  <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-surface-1/80 border border-line">
                    <span className="text-xs text-text-3 font-medium">
                      Custom Duration:
                    </span>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={codeGenCustomDuration}
                      onChange={(e) =>
                        handleCustomDurationChange(e.target.value)
                      }
                      onBlur={() => {
                        if (
                          !codeGenCustomDuration ||
                          Number(codeGenCustomDuration) < 1
                        ) {
                          handleCustomDurationChange("1");
                        }
                      }}
                      className="w-20 rounded-lg border border-line bg-white px-2.5 py-1 text-text font-bold focus:border-signal outline-none font-mono text-xs"
                      placeholder="e.g. 5"
                      autoFocus
                    />
                    <span className="text-[11.5px] text-text-3">
                      months access validity
                    </span>
                  </div>
                )}
              </div>

              {/* 3. Agreed Deal Price & Proposal Valid Until */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-text text-xs mb-1.5">
                    Agreed Deal Price (৳ BDT)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-3 font-semibold text-xs">
                      ৳
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={codeGenPriceBDT}
                      onChange={(e) => setCodeGenPriceBDT(e.target.value)}
                      onBlur={() =>
                        setCodeGenPriceBDT(
                          Math.max(0, Number(codeGenPriceBDT) || 0),
                        )
                      }
                      className="w-full rounded-xl border border-line bg-surface-1/40 pl-7 pr-3.5 py-2 text-text font-mono font-bold focus:border-signal focus:bg-white outline-none text-[13px] transition-all"
                    />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-text-3 mt-1">
                    <span>Monthly rate:</span>
                    <strong className="font-semibold text-text font-mono">
                      ≈ ৳
                      {Math.round(
                        (Number(codeGenPriceBDT) || 0) /
                          Math.max(
                            1,
                            codeGenIsCustomDuration
                              ? Number(codeGenCustomDuration) || 1
                              : codeGenDuration,
                          ),
                      ).toLocaleString("en-US")}
                      /mo
                    </strong>
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-text text-xs">
                      Proposal Valid Until (Optional)
                    </label>
                    {codeGenExpiry && (
                      <button
                        type="button"
                        onClick={() => setCodeGenExpiry("")}
                        className="text-[10.5px] text-text-3 hover:text-signal hover:underline cursor-pointer"
                      >
                        Clear Date
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={codeGenExpiry}
                    onChange={(e) => setCodeGenExpiry(e.target.value)}
                    className="w-full rounded-xl border border-line bg-surface-1/40 px-3.5 py-2 text-text font-mono focus:border-signal focus:bg-white outline-none text-[13px] transition-all"
                  />
                  <span className="text-[11px] text-text-3 mt-1 block">
                    {codeGenExpiry
                      ? "Client proposal expiration date"
                      : "No expiration date"}
                  </span>
                </div>
              </div>

              {/* 4. Custom Resource Entitlements */}
              <div className="rounded-2xl border border-line bg-surface-1/50 p-3.5 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-signal" />
                    <span className="font-bold text-text text-[12.5px]">
                      Custom Resource Entitlements:
                    </span>
                  </div>
                  <span className="text-[11px] text-text-3">
                    Allocated quotas
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl border border-line bg-white p-2.5 focus-within:border-signal focus-within:ring-1 focus-within:ring-signal/20 transition-all">
                    <span className="text-[10.5px] text-text-3 font-semibold block mb-1 text-center">
                      Max Stores
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={customStores}
                      onChange={(e) => setCustomStores(e.target.value)}
                      onBlur={() =>
                        setCustomStores(Math.max(1, Number(customStores) || 1))
                      }
                      className="w-full bg-transparent font-bold text-center text-[13px] text-text outline-none font-mono"
                    />
                  </div>
                  <div className="rounded-xl border border-line bg-white p-2.5 focus-within:border-signal focus-within:ring-1 focus-within:ring-signal/20 transition-all">
                    <span className="text-[10.5px] text-text-3 font-semibold block mb-1 text-center">
                      Team Seats
                    </span>
                    <input
                      type="number"
                      min={1}
                      value={customSeats}
                      onChange={(e) => setCustomSeats(e.target.value)}
                      onBlur={() =>
                        setCustomSeats(Math.max(1, Number(customSeats) || 1))
                      }
                      className="w-full bg-transparent font-bold text-center text-[13px] text-text outline-none font-mono"
                    />
                  </div>
                  <div className="rounded-xl border border-line bg-white p-2.5 focus-within:border-signal focus-within:ring-1 focus-within:ring-signal/20 transition-all">
                    <span className="text-[10.5px] text-text-3 font-semibold block mb-1 text-center">
                      AI Messages
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={customMessages}
                      onChange={(e) => setCustomMessages(e.target.value)}
                      onBlur={() =>
                        setCustomMessages(
                          Math.max(0, Number(customMessages) || 0),
                        )
                      }
                      className="w-full bg-transparent font-bold text-center text-[13px] text-signal outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {codeGenError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 font-medium">
                  {codeGenError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCodeGenOpen(false);
                    onCloseProvision?.();
                  }}
                  className="h-9 px-4 text-xs font-semibold"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="signal"
                  size="sm"
                  disabled={
                    codeGenLoading ||
                    !codeGenCode.trim() ||
                    !codeGenPlanName.trim()
                  }
                  onClick={handleContractSubmit}
                  className="gap-1.5 font-semibold text-xs h-9 px-5 cursor-pointer shadow-xs"
                >
                  {codeGenLoading ? "Creating..." : "+ Create Custom Plan"}
                </Button>
              </div>
            </div>
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

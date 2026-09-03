"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClose, IconTrash, IconWarn } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
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

  useEffect(() => {
    setLocalEdit(editingPlan);
  }, [editingPlan]);

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
  const [catalogLimit, setCatalogLimit] = useState<string>("");
  const [courierChannels, setCourierChannels] = useState<string>("");
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

    try {
      setIsSubmitting(true);
      await onSaveEdit(localEdit);
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
        catalogLimit: Number(catalogLimit) || 0,
        courierChannels: Number(courierChannels) || 1,
        badge: badge || undefined,
        popular: false,
        activeMerchants: 0,
        status: "active",
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
      setCatalogLimit("");
      setCourierChannels("");
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
              <button
                type="button"
                onClick={onCloseEdit}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
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

              {/* Catalog SKUs, Courier Channels, Badge Tag in the same row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Catalog SKUs
                  </label>
                  <input
                    type="number"
                    value={localEdit.catalogLimit ?? 250}
                    onChange={(e) =>
                      setLocalEdit({
                        ...localEdit,
                        catalogLimit: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Courier Channels
                  </label>
                  <input
                    type="number"
                    value={localEdit.courierChannels ?? 2}
                    onChange={(e) =>
                      setLocalEdit({
                        ...localEdit,
                        courierChannels: Number(e.target.value),
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

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
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

              {/* Catalog SKUs, Courier Channels, Badge Tag in the same row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Catalog SKUs
                  </label>
                  <input
                    type="number"
                    value={catalogLimit}
                    onChange={(e) => setCatalogLimit(e.target.value)}
                    placeholder="e.g. 250"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[13px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Courier Channels
                  </label>
                  <input
                    type="number"
                    value={courierChannels}
                    onChange={(e) => setCourierChannels(e.target.value)}
                    placeholder="e.g. 2"
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

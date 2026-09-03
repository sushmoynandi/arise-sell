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
  // Local edit state
  const [localEdit, setLocalEdit] = useState<AdminPlan | null>(editingPlan);

  useEffect(() => {
    setLocalEdit(editingPlan);
  }, [editingPlan]);

  // Create Form State (Clean defaults, no hardcoded demo text)
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [tagline, setTagline] = useState("");
  const [priceBDT, setPriceBDT] = useState<number>(0);
  const [yearlyPriceBDT, setYearlyPriceBDT] = useState<number>(0);
  const [billingPeriod, setBillingPeriod] = useState<PlanBillingPeriod>("both");
  const [messageLimit, setMessageLimit] = useState<number>(200);
  const [catalogLimit, setCatalogLimit] = useState<number>(250);
  const [courierChannels, setCourierChannels] = useState<number>(2);
  const [badge, setBadge] = useState("");
  const [featuresStr, setFeaturesStr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        priceBDT: Number(priceBDT),
        yearlyPriceBDT: Number(yearlyPriceBDT || priceBDT * 10),
        yearlyDiscountPercent: 17,
        billingPeriod,
        messageLimit: Number(messageLimit),
        catalogLimit: Number(catalogLimit),
        courierChannels: Number(courierChannels),
        badge: badge || undefined,
        popular: false,
        activeMerchants: 0,
        status: "active",
        features:
          parsedFeatures.length > 0
            ? parsedFeatures
            : [`${messageLimit} Messages / month (Comment + Inbox)`],
      });

      // Reset form
      setName("");
      setNameBn("");
      setTagline("");
      setPriceBDT(0);
      setYearlyPriceBDT(0);
      setBillingPeriod("both");
      setMessageLimit(200);
      setCatalogLimit(250);
      setCourierChannels(2);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[15.5px] font-bold text-text">
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

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block font-bold text-text mb-1">Plan Name</label>
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

              {/* Monthly Price & Yearly Price */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Monthly Price (৳/mo)
                  </label>
                  <input
                    type="number"
                    required
                    value={localEdit.priceBDT}
                    onChange={(e) => {
                      const newMonthly = Number(e.target.value);
                      setLocalEdit({
                        ...localEdit,
                        priceBDT: newMonthly,
                      });
                    }}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-text">
                      Yearly Price (৳/yr)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const autoYearly = localEdit.priceBDT * 10;
                        setLocalEdit({
                          ...localEdit,
                          yearlyPriceBDT: autoYearly,
                        });
                      }}
                      className="text-[10.5px] text-signal font-semibold hover:underline cursor-pointer"
                      title="Set 2 months free (Monthly × 10)"
                    >
                      2 mo free
                    </button>
                  </div>
                  <input
                    type="number"
                    value={localEdit.yearlyPriceBDT ?? localEdit.priceBDT * 10}
                    onChange={(e) =>
                      setLocalEdit({
                        ...localEdit,
                        yearlyPriceBDT: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
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
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
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

              <div>
                <label className="block font-bold text-text mb-1">Tagline</label>
                <input
                  type="text"
                  value={localEdit.tagline || ""}
                  onChange={(e) =>
                    setLocalEdit({ ...localEdit, tagline: e.target.value })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">Badge Tag</label>
                <input
                  type="text"
                  value={localEdit.badge || ""}
                  onChange={(e) =>
                    setLocalEdit({ ...localEdit, badge: e.target.value })
                  }
                  placeholder="e.g. Most Popular"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button type="button" variant="outline" size="sm" onClick={onCloseEdit}>
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="sm" disabled={isSubmitting}>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
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
                  <h3 className="text-[15px] font-bold text-text">Delete Pricing Tier?</h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to remove <strong>{deletingPlan.name}</strong>? Existing stores will remain active until billing renewal.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button type="button" variant="outline" size="sm" onClick={onCloseDelete}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[15.5px] font-bold text-text">
                Create Custom Commercial Tier
              </h3>
              <button
                type="button"
                onClick={onCloseCreate}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-[13px]">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">Plan Name</label>
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
                  <label className="block font-bold text-text mb-1">Bengali Name</label>
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
                <label className="block font-bold text-text mb-1">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Automated AI assistance for high-volume shops"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              {/* Monthly & Yearly Price Inputs */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Monthly Price (৳/mo)
                  </label>
                  <input
                    type="number"
                    required
                    value={priceBDT}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setPriceBDT(m);
                      setYearlyPriceBDT(m * 10);
                    }}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-text">
                      Yearly Price (৳/yr)
                    </label>
                    <button
                      type="button"
                      onClick={() => setYearlyPriceBDT(priceBDT * 10)}
                      className="text-[10.5px] text-signal font-semibold hover:underline cursor-pointer"
                    >
                      2 mo free
                    </button>
                  </div>
                  <input
                    type="number"
                    value={yearlyPriceBDT}
                    onChange={(e) => setYearlyPriceBDT(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Monthly Messages Quota
                  </label>
                  <input
                    type="number"
                    required
                    value={messageLimit}
                    onChange={(e) => setMessageLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
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

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">Catalog SKUs</label>
                  <input
                    type="number"
                    value={catalogLimit}
                    onChange={(e) => setCatalogLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">Courier Channels</label>
                  <input
                    type="number"
                    value={courierChannels}
                    onChange={(e) => setCourierChannels(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">Badge Tag (Optional)</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. VIP Recommended"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">Features (One per line)</label>
                <textarea
                  rows={3}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="e.g. 200 Messages / month (Comment + Inbox)&#10;WhatsApp & Messenger integration"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none text-[12.5px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button type="button" variant="outline" size="sm" onClick={onCloseCreate}>
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="sm" disabled={isSubmitting}>
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

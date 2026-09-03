"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api-client";
import { type AdminPlan } from "@/data/admin";
import { getStoredPlans, saveStoredPlans } from "@/lib/plans-store";
import {
  IconCheck,
  IconClose,
  IconPlus,
  IconTrash,
  IconWarn,
  IconTag,
  IconCopy,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { formatTaka, cx } from "@/lib/format";

type FestivalOffer = {
  id: string;
  festivalName: string;
  festivalNameBn: string;
  couponCode: string;
  discountPercent: number;
  bonusMessages: number;
  validity: string;
  active: boolean;
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [festivalOffers, setFestivalOffers] = useState<FestivalOffer[]>([]);
  const [loading, setLoading] = useState(true);

  // Billing view toggle on the cards: "monthly" vs "yearly"
  const [billingView, setBillingView] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const isYearlyView = billingView === "yearly";

  // Modals state for Plans
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<AdminPlan | null>(null);
  const [deletingPlan, setDeletingPlan] = useState<AdminPlan | null>(null);

  // Modals state for Festival Offers
  const [addFestivalModalOpen, setAddFestivalModalOpen] = useState(false);
  const [editingFestivalOffer, setEditingFestivalOffer] =
    useState<FestivalOffer | null>(null);
  const [deletingFestivalOffer, setDeletingFestivalOffer] =
    useState<FestivalOffer | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State for new plan
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [tagline, setTagline] = useState("");
  const [priceBDT, setPriceBDT] = useState(200);
  const [yearlyPriceBDT, setYearlyPriceBDT] = useState(2000);
  const [billingPeriod, setBillingPeriod] = useState<
    "both" | "monthly" | "yearly"
  >("both");
  const [messageLimit, setMessageLimit] = useState(200);
  const [catalogLimit, setCatalogLimit] = useState(250);
  const [courierChannels, setCourierChannels] = useState(2);
  const [badge, setBadge] = useState("");
  const [featuresStr, setFeaturesStr] = useState(
    "200 AI Messages / month\nWhatsApp & Facebook Messenger\nSteadfast & Pathao 1-click booking\n2 team member seats",
  );

  // Form State for new Festival Offer
  const [festName, setFestName] = useState("");
  const [festCode, setFestCode] = useState("");
  const [festDiscount, setFestDiscount] = useState(25);
  const [festBonus, setFestBonus] = useState(500);
  const [festValidity, setFestValidity] = useState(
    "Limited Time Festival Offer",
  );

  // Fetch real plans & festival offers from backend on mount
  const fetchBackendData = async () => {
    try {
      setLoading(true);
      const [plansRes, offersRes] = await Promise.all([
        api.admin.listPlans(),
        api.admin.listFestivalOffers(),
      ]);

      if (Array.isArray(plansRes) && plansRes.length > 0) {
        const loadedPlans = plansRes as unknown as AdminPlan[];
        setPlans(loadedPlans);
        saveStoredPlans(loadedPlans);
      } else {
        const stored = getStoredPlans();
        setPlans(stored);
      }

      if (Array.isArray(offersRes)) {
        setFestivalOffers(offersRes as unknown as FestivalOffer[]);
      }
    } catch (err) {
      console.error("Failed to load plans from backend:", err);
      const stored = getStoredPlans();
      setPlans(stored);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleFestivalOffer = async (id: string) => {
    try {
      const res = await api.admin.toggleFestivalOffer(id);
      const updated = res as unknown as FestivalOffer;
      setFestivalOffers((prev) =>
        prev.map((f) => (f.id === id ? { ...f, active: updated.active } : f)),
      );
      setSuccessMsg(
        `${updated.festivalName} is now ${updated.active ? "ACTIVE on storefront" : "PAUSED"}!`,
      );
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      console.error("Failed to toggle festival offer on backend:", err);
      setFestivalOffers((prev) =>
        prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
      );
    }
  };

  const handleAddFestivalOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!festName || !festCode) return;

    const newOffer: FestivalOffer = {
      id: `fest-${Date.now()}`,
      festivalName: festName,
      festivalNameBn: festName,
      couponCode: festCode.toUpperCase().replace(/\s+/g, ""),
      discountPercent: Number(festDiscount),
      bonusMessages: Number(festBonus),
      validity: festValidity,
      active: true,
    };

    try {
      const created = (await api.admin.createFestivalOffer(
        newOffer as unknown as Record<string, unknown>,
      )) as unknown as FestivalOffer;
      setFestivalOffers((prev) => [created || newOffer, ...prev]);
      setSuccessMsg(`Festival Offer "${festName}" created and activated!`);
    } catch (err) {
      console.error("Error creating festival offer:", err);
      setFestivalOffers((prev) => [newOffer, ...prev]);
      setSuccessMsg(`Festival Offer "${festName}" created!`);
    }

    setTimeout(() => setSuccessMsg(null), 3500);
    setAddFestivalModalOpen(false);
    setFestName("");
    setFestCode("");
  };

  const handleSaveEditFestivalOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFestivalOffer) return;

    const cleanCode = editingFestivalOffer.couponCode
      .toUpperCase()
      .replace(/\s+/g, "");
    const updatedOffer = { ...editingFestivalOffer, couponCode: cleanCode };

    try {
      await api.admin.updateFestivalOffer(
        editingFestivalOffer.id,
        updatedOffer as unknown as Record<string, unknown>,
      );
    } catch (err) {
      console.error("Failed to update festival offer on backend:", err);
    }

    setFestivalOffers((prev) =>
      prev.map((f) => (f.id === editingFestivalOffer.id ? updatedOffer : f)),
    );
    setSuccessMsg(
      `Festival offer "${editingFestivalOffer.festivalName}" updated successfully!`,
    );
    setTimeout(() => setSuccessMsg(null), 3500);
    setEditingFestivalOffer(null);
  };

  const handleConfirmDeleteFestivalOffer = async () => {
    if (deletingFestivalOffer) {
      try {
        await api.admin.deleteFestivalOffer(deletingFestivalOffer.id);
      } catch (err) {
        console.error("Failed to delete festival offer on backend:", err);
      }
      setFestivalOffers((prev) =>
        prev.filter((f) => f.id !== deletingFestivalOffer.id),
      );
      setDeletingFestivalOffer(null);
      setSuccessMsg("Festival offer deleted.");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const calculatedYearly = Number(yearlyPriceBDT) || Number(priceBDT) * 10;
    const yearlySavingsPercent =
      priceBDT > 0
        ? Math.round(
            ((priceBDT * 12 - calculatedYearly) / (priceBDT * 12)) * 100,
          )
        : 0;

    const newPlan: AdminPlan = {
      id: `plan-${Date.now()}`,
      name,
      nameBn: nameBn || name,
      tagline,
      priceBDT: Number(priceBDT),
      yearlyPriceBDT: calculatedYearly,
      yearlyDiscountPercent:
        yearlySavingsPercent > 0 ? yearlySavingsPercent : undefined,
      billingPeriod,
      messageLimit: Number(messageLimit),
      catalogLimit: Number(catalogLimit),
      courierChannels: Number(courierChannels),
      badge: badge || undefined,
      features: featuresStr.split("\n").filter(Boolean),
      activeMerchants: 0,
      monthlySubscribers: 0,
      yearlySubscribers: 0,
      status: "active",
    };

    try {
      const created = (await api.admin.createPlan(
        newPlan as unknown as Record<string, unknown>,
      )) as unknown as AdminPlan;
      const finalPlan = created || newPlan;
      setPlans((prev) => {
        const next = [...prev, finalPlan];
        saveStoredPlans(next);
        return next;
      });
      setSuccessMsg(`Plan "${name}" published live to storefront checkout!`);
    } catch (err) {
      console.error("Failed to create plan on backend:", err);
      setPlans((prev) => {
        const next = [...prev, newPlan];
        saveStoredPlans(next);
        return next;
      });
      setSuccessMsg(`Plan "${name}" published!`);
    }

    setTimeout(() => setSuccessMsg(null), 3500);
    setCreateModalOpen(false);

    setName("");
    setNameBn("");
    setTagline("");
    setBadge("");
    setPriceBDT(200);
    setYearlyPriceBDT(2000);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      await api.admin.updatePlan(
        editingPlan.id,
        editingPlan as unknown as Record<string, unknown>,
      );
    } catch (err) {
      console.error("Failed to update plan on backend:", err);
    }

    setPlans((prev) => {
      const next = prev.map((p) => (p.id === editingPlan.id ? editingPlan : p));
      saveStoredPlans(next);
      return next;
    });

    setSuccessMsg(`Plan "${editingPlan.name}" updated successfully!`);
    setTimeout(() => setSuccessMsg(null), 3500);
    setEditingPlan(null);
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.admin.togglePlanStatus(id);
    } catch (err) {
      console.error("Failed to toggle plan status on backend:", err);
    }

    setPlans((prev) => {
      const next: AdminPlan[] = prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: (p.status === "active"
                ? "archived"
                : "active") as AdminPlan["status"],
            }
          : p,
      );
      saveStoredPlans(next);
      return next;
    });
  };

  const handleConfirmDelete = async () => {
    if (deletingPlan) {
      try {
        await api.admin.deletePlan(deletingPlan.id);
      } catch (err) {
        console.error("Failed to delete plan on backend:", err);
      }

      setPlans((prev) => {
        const next = prev.filter((p) => p.id !== deletingPlan.id);
        saveStoredPlans(next);
        return next;
      });
      setDeletingPlan(null);
      setSuccessMsg("Plan removed from live tiers.");
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-1">
      {/* ─── 1. Header (Clean & Refined) ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
            Subscription Plans &amp; Pricing
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-3 py-0.5 text-[12px] font-bold text-signal">
            <span className="size-1.5 rounded-full bg-signal animate-pulse" />
            {loading
              ? "Syncing Live Tiers..."
              : `${plans.filter((p) => p.status === "active").length} Live Plans`}
          </span>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={() => setCreateModalOpen(true)}
          className="gap-2 font-semibold text-[13px] h-10 px-4 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <IconPlus width={15} height={15} />
          <span>Create Custom Plan</span>
        </Button>
      </div>

      {/* ─── Success Notification ─── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-signal/30 bg-signal/[0.07] p-3.5 text-[13px] font-medium text-signal shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <IconCheck
                width={16}
                height={16}
                className="shrink-0 text-signal"
              />
              <span>{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-text-3 hover:text-text p-1 cursor-pointer"
            >
              <IconClose width={14} height={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. Seasonal & Festival Promo Campaigns (Tabular Format) ─── */}
      <div className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-line bg-surface-2/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <IconTag width={16} height={16} className="text-signal" />
            <div>
              <h2 className="text-[15px] font-bold text-text">
                Seasonal &amp; Festival Promo Campaigns
              </h2>
              <p className="text-[12px] text-text-3">
                Manage promotional coupon codes, discounts, and bonus message credits.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddFestivalModalOpen(true)}
            className="gap-1.5 font-semibold text-[12.5px] h-8.5 px-3 border-line text-text hover:border-signal hover:text-signal cursor-pointer"
          >
            <IconPlus width={13} height={13} />
            <span>Add Festival Coupon</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line bg-surface-2/40 text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
              <tr>
                <th className="py-3 px-4.5">Campaign &amp; Coupon</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Bonus Messages</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Live Status</th>
                <th className="py-3 px-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {festivalOffers.map((offer) => {
                const isCopied = copiedCode === offer.couponCode;
                return (
                  <tr
                    key={offer.id}
                    className="hover:bg-surface-2/30 transition-colors"
                  >
                    <td className="py-3.5 px-4.5">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <p className="font-bold text-text text-[13.5px]">
                            {offer.festivalName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-bold text-[11px] bg-surface-2 text-text px-2 py-0.5 rounded border border-line">
                              {offer.couponCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(offer.couponCode)}
                              className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                              title="Copy coupon code"
                            >
                              {isCopied ? (
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
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-signal font-mono text-[14px]">
                        {offer.discountPercent}% OFF
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-text">
                      +{offer.bonusMessages.toLocaleString()} Messages
                    </td>

                    <td className="py-3.5 px-4 text-text-3 font-mono text-[12px]">
                      {offer.validity}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFestivalOffer(offer.id)}
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold font-mono transition-colors cursor-pointer",
                          offer.active
                            ? "bg-signal/[0.08] text-signal border border-signal/20"
                            : "bg-surface-2 text-text-3 border border-line",
                        )}
                      >
                        <span
                          className={cx(
                            "size-1.5 rounded-full",
                            offer.active ? "bg-signal" : "bg-text-3",
                          )}
                        />
                        {offer.active ? "LIVE" : "PAUSED"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingFestivalOffer(offer)}
                          className="text-text-3 hover:text-signal hover:bg-surface-2 p-1.5 rounded-lg transition-colors cursor-pointer text-[12px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingFestivalOffer(offer)}
                          className="text-text-3 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete Offer"
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
      </div>

      {/* ─── 3. Main Commercial Plans (Monthly & Yearly Pricing View) ─── */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>
            <h2 className="text-[15.5px] font-bold text-text">
              Commercial Storefront Plans ({plans.length})
            </h2>
            <p className="text-[12px] text-text-3">
              Auto-synchronized with storefront checkout and Subscriptions
              billing.
            </p>
          </div>

          {/* Monthly vs Yearly Billing Switch */}
          <div className="flex items-center rounded-xl border border-line bg-surface-2/40 p-0.5 text-[12px] font-semibold font-mono self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingView("monthly")}
              className={cx(
                "rounded-lg px-3 py-1 transition-all cursor-pointer",
                !isYearlyView
                  ? "bg-white text-text shadow-2xs border border-line"
                  : "text-text-3 hover:text-text",
              )}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingView("yearly")}
              className={cx(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1 transition-all cursor-pointer",
                isYearlyView
                  ? "bg-white text-text shadow-2xs border border-line"
                  : "text-text-3 hover:text-text",
              )}
            >
              <span>Yearly (বাৎসরিক)</span>
              <span className="rounded-md bg-signal/[0.12] text-signal px-1.5 py-0.2 text-[10px] font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => {
            const isFree = p.priceBDT === 0;
            const displayedPrice = isYearlyView
              ? (p.yearlyPriceBDT ?? p.priceBDT * 10)
              : p.priceBDT;
            const monthlyEquivalent =
              isYearlyView && !isFree ? Math.round(displayedPrice / 12) : null;
            const savingsBDT =
              isYearlyView && !isFree ? p.priceBDT * 12 - displayedPrice : 0;

            return (
              <div
                key={p.id}
                className={cx(
                  "rounded-2xl border bg-white p-5.5 flex flex-col justify-between shadow-2xs relative transition-all duration-150 hover:shadow-md hover:border-line-2",
                  p.popular
                    ? "border-signal ring-1 ring-signal/25 shadow-xs"
                    : "border-line",
                )}
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-text text-[17px] leading-tight">
                        {p.name}
                      </h3>
                      <p className="text-[12px] text-text-3 font-mono mt-0.5">
                        {p.nameBn}
                      </p>
                    </div>

                    {p.badge && (
                      <span
                        className={cx(
                          "rounded-md px-2 py-0.5 text-[10.5px] font-bold font-mono",
                          p.popular
                            ? "bg-signal text-white"
                            : "bg-surface-2 text-text-2 border border-line",
                        )}
                      >
                        {p.badge}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="border-y border-line/60 py-3 space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[29px] font-bold text-text font-(family-name:--font-bricolage)">
                        {isFree ? "৳০" : formatTaka(displayedPrice)}
                      </span>
                      <span className="text-[12px] text-text-3 font-mono">
                        {isFree ? "free" : isYearlyView ? "/ yr" : "/ mo"}
                      </span>
                    </div>

                    {isYearlyView && !isFree && (
                      <div className="flex items-center gap-1.5 text-[11.5px] font-mono">
                        <span className="text-text-3">
                          ৳{monthlyEquivalent}/mo
                        </span>
                        {savingsBDT > 0 && (
                          <span className="text-signal font-bold bg-signal/[0.08] px-1.5 py-0.2 rounded border border-signal/20">
                            Save {formatTaka(savingsBDT)}/yr
                          </span>
                        )}
                      </div>
                    )}

                    <p className="text-[12.5px] text-signal font-semibold pt-0.5">
                      {p.messageLimit.toLocaleString()} Messages / mo
                    </p>
                  </div>

                  <p className="text-[13px] text-text-3 leading-snug min-h-[36px]">
                    {p.tagline}
                  </p>

                  <ul className="space-y-2 text-[12.5px] pt-1">
                    {p.features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-text-2"
                      >
                        <IconCheck
                          width={13.5}
                          height={13.5}
                          className="text-signal shrink-0 mt-0.5"
                        />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-4 border-t border-line/60 mt-5 flex items-center justify-between text-[12px]">
                  <span className="text-text-3 font-mono flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-signal/80" />
                    {p.activeMerchants || 0} stores
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(p)}
                      className="font-semibold text-signal hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p.id)}
                      className="text-text-3 hover:text-text cursor-pointer"
                    >
                      {p.status === "active" ? "Archive" : "Activate"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingPlan(p)}
                      className="text-text-3 hover:text-rose-600 p-0.5 cursor-pointer"
                      title="Delete Plan"
                    >
                      <IconTrash width={13} height={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 4. Edit Festival Offer Modal ─── */}
      {editingFestivalOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <IconTag width={16} height={16} className="text-signal" />
                <h3 className="text-[15.5px] font-bold text-text">
                  Edit Festival Offer: {editingFestivalOffer.festivalName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingFestivalOffer(null)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form
              onSubmit={handleSaveEditFestivalOffer}
              className="space-y-3.5 text-[13px]"
            >
              <div>
                <label className="block font-bold text-text mb-1">
                  Offer Name
                </label>
                <input
                  type="text"
                  required
                  value={editingFestivalOffer.festivalName}
                  onChange={(e) =>
                    setEditingFestivalOffer({
                      ...editingFestivalOffer,
                      festivalName: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editingFestivalOffer.couponCode}
                    onChange={(e) =>
                      setEditingFestivalOffer({
                        ...editingFestivalOffer,
                        couponCode: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={editingFestivalOffer.discountPercent}
                    onChange={(e) =>
                      setEditingFestivalOffer({
                        ...editingFestivalOffer,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Bonus Messages Included
                </label>
                <input
                  type="number"
                  value={editingFestivalOffer.bonusMessages}
                  onChange={(e) =>
                    setEditingFestivalOffer({
                      ...editingFestivalOffer,
                      bonusMessages: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Validity Text
                </label>
                <input
                  type="text"
                  value={editingFestivalOffer.validity}
                  onChange={(e) =>
                    setEditingFestivalOffer({
                      ...editingFestivalOffer,
                      validity: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingFestivalOffer(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 5. Delete Festival Offer Dialog ─── */}
      <AnimatePresence>
        {deletingFestivalOffer && (
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
                  <h3 className="text-[15px] font-bold text-text">
                    Delete Festival Offer?
                  </h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to delete coupon code{" "}
                    <strong>{deletingFestivalOffer.couponCode}</strong>? Stores
                    won&apos;t be able to claim it anymore.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingFestivalOffer(null)}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteFestivalOffer}
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

      {/* ─── 6. Add Festival Coupon Modal ─── */}
      {addFestivalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <IconTag width={16} height={16} className="text-signal" />
                <h3 className="text-[15.5px] font-bold text-text">
                  Create Festival / Promo Offer
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddFestivalModalOpen(false)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form
              onSubmit={handleAddFestivalOffer}
              className="space-y-3.5 text-[13px]"
            >
              <div>
                <label className="block font-bold text-text mb-1">
                  Offer Name
                </label>
                <input
                  type="text"
                  required
                  value={festName}
                  onChange={(e) => setFestName(e.target.value)}
                  placeholder="e.g. Shab-e-Barat Special"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={festCode}
                    onChange={(e) => setFestCode(e.target.value)}
                    placeholder="e.g. BARAT2026"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={festDiscount}
                    onChange={(e) => setFestDiscount(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Bonus Messages Included
                </label>
                <input
                  type="number"
                  value={festBonus}
                  onChange={(e) => setFestBonus(Number(e.target.value))}
                  placeholder="e.g. 500 (extra message credits)"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Validity Text
                </label>
                <input
                  type="text"
                  value={festValidity}
                  onChange={(e) => setFestValidity(e.target.value)}
                  placeholder="e.g. Valid till Chand Raat"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAddFestivalModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="sm">
                  Activate Festival Offer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 7. Edit Plan Modal (With Monthly & Yearly Pricing) ─── */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[15.5px] font-bold text-text">
                Edit Tier: {editingPlan.name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingPlan(null)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block font-bold text-text mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  required
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
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
                    value={editingPlan.priceBDT}
                    onChange={(e) => {
                      const newMonthly = Number(e.target.value);
                      setEditingPlan({
                        ...editingPlan,
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
                        const autoYearly = editingPlan.priceBDT * 10;
                        setEditingPlan({
                          ...editingPlan,
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
                    value={
                      editingPlan.yearlyPriceBDT ?? editingPlan.priceBDT * 10
                    }
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
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
                    value={editingPlan.messageLimit}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
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
                    value={editingPlan.billingPeriod || "both"}
                    onChange={(e) =>
                      setEditingPlan({
                        ...editingPlan,
                        billingPeriod: e.target.value as
                          | "both"
                          | "monthly"
                          | "yearly",
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
                <label className="block font-bold text-text mb-1">
                  Tagline
                </label>
                <input
                  type="text"
                  value={editingPlan.tagline}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, tagline: e.target.value })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Badge Tag
                </label>
                <input
                  type="text"
                  value={editingPlan.badge || ""}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, badge: e.target.value })
                  }
                  placeholder="e.g. Most Popular"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPlan(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 8. Delete Plan Dialog ─── */}
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
                  onClick={() => setDeletingPlan(null)}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
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

      {/* ─── 9. Create Custom Plan Modal (With Monthly & Yearly Options) ─── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[15.5px] font-bold text-text">
                Create Custom Commercial Tier
              </h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form
              onSubmit={handleCreatePlan}
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
                  placeholder="e.g. Custom LLM for high-volume enterprise"
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
                      setBillingPeriod(
                        e.target.value as "both" | "monthly" | "yearly",
                      )
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
                  <label className="block font-bold text-text mb-1">
                    Catalog SKUs
                  </label>
                  <input
                    type="number"
                    value={catalogLimit}
                    onChange={(e) => setCatalogLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Courier Channels
                  </label>
                  <input
                    type="number"
                    value={courierChannels}
                    onChange={(e) => setCourierChannels(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
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
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none text-[12.5px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="sm">
                  Publish Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

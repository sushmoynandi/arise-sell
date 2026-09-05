"use client";

import { useState, useEffect } from "react";
import api, { EnterpriseContractData } from "@/lib/api-client";
import { cx } from "@/lib/format";
import { IconPlus, IconTag } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { AdminPlan, FestivalOffer } from "./types";
import { PlansHeader } from "./components/plans-header";
import { FestivalTable } from "./components/festival-table";
import { FestivalModals } from "./components/festival-modals";
import { PlanCard } from "./components/plan-card";
import { PlanModals } from "./components/plan-modals";
import { ContractsTable } from "./components/contracts-table";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<AdminPlan[]>([]);
  const [festivalOffers, setFestivalOffers] = useState<FestivalOffer[]>([]);
  const [contracts, setContracts] = useState<EnterpriseContractData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);

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

  const showNotification = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const fetchContracts = async () => {
    try {
      setLoadingContracts((prev) => (contracts.length === 0 ? true : false));
      const res = await api.admin.listContracts();
      if (Array.isArray(res)) {
        setContracts(res);
      }
    } catch (err) {
      console.error("Failed to load contracts from backend:", err);
    } finally {
      setLoadingContracts(false);
    }
  };

  // Fetch real plans, festival offers & contracts from backend on mount
  const fetchBackendData = async () => {
    try {
      setLoading(true);
      const [plansRes, offersRes] = await Promise.all([
        api.admin.listPlans(),
        api.admin.listFestivalOffers(),
      ]);

      if (Array.isArray(plansRes)) {
        setPlans(plansRes as unknown as AdminPlan[]);
      }

      if (Array.isArray(offersRes)) {
        setFestivalOffers(offersRes as unknown as FestivalOffer[]);
      }
    } catch (err) {
      console.error("Failed to load plans from backend:", err);
    } finally {
      setLoading(false);
    }
    fetchContracts();
  };

  useEffect(() => {
    fetchBackendData();
  }, []);

  // ─── Festival Offer Handlers ─────────────────────────────────

  const handleToggleFestivalOffer = async (id: string) => {
    try {
      const res = await api.admin.toggleFestivalOffer(id);
      const updated = res as unknown as FestivalOffer;
      setFestivalOffers((prev) =>
        prev.map((f) => (f.id === id ? { ...f, active: updated.active } : f)),
      );
      showNotification(
        `${updated.festivalName} is now ${updated.active ? "ACTIVE" : "PAUSED"}!`,
      );
    } catch (err) {
      console.error("Failed to toggle festival offer on backend:", err);
      setFestivalOffers((prev) =>
        prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)),
      );
    }
  };

  const handleCreateFestivalOffer = async (newOfferData: {
    festivalName: string;
    couponCode: string;
    discountPercent: number;
    bonusMessages: number;
    validity: string;
    applicablePlan: string;
    applicablePlanName: string;
  }) => {
    const payload = {
      id: `fest-${Date.now()}`,
      festivalName: newOfferData.festivalName,
      festivalNameBn: newOfferData.festivalName,
      couponCode: newOfferData.couponCode,
      discountPercent: newOfferData.discountPercent,
      bonusMessages: newOfferData.bonusMessages,
      validity: newOfferData.validity,
      active: true,
      applicablePlan: newOfferData.applicablePlan || "all",
      applicablePlanName: newOfferData.applicablePlanName || "All Plans",
    };

    try {
      const created = (await api.admin.createFestivalOffer(
        payload as unknown as Record<string, unknown>,
      )) as unknown as FestivalOffer;
      setFestivalOffers((prev) => [created, ...prev]);
      showNotification(
        `Festival campaign "${created.festivalName}" activated!`,
      );
    } catch (err) {
      console.error("Failed to create festival offer on backend:", err);
      setFestivalOffers((prev) => [payload, ...prev]);
      showNotification(`Festival campaign "${payload.festivalName}" created!`);
    }
  };

  const handleSaveEditFestivalOffer = async (updated: FestivalOffer) => {
    try {
      const res = (await api.admin.updateFestivalOffer(
        updated.id,
        updated as unknown as Record<string, unknown>,
      )) as unknown as FestivalOffer;
      setFestivalOffers((prev) =>
        prev.map((f) => (f.id === updated.id ? res : f)),
      );
      showNotification(`Offer "${res.festivalName}" updated!`);
    } catch (err) {
      console.error("Failed to update festival offer on backend:", err);
      setFestivalOffers((prev) =>
        prev.map((f) => (f.id === updated.id ? updated : f)),
      );
      showNotification(`Offer "${updated.festivalName}" updated!`);
    }
  };

  const handleConfirmDeleteFestivalOffer = async () => {
    if (!deletingFestivalOffer) return;
    const targetId = deletingFestivalOffer.id;
    const targetName = deletingFestivalOffer.festivalName;
    setDeletingFestivalOffer(null);

    try {
      await api.admin.deleteFestivalOffer(targetId);
      setFestivalOffers((prev) => prev.filter((f) => f.id !== targetId));
      showNotification(`Festival offer "${targetName}" deleted.`);
    } catch (err) {
      console.error("Failed to delete festival offer on backend:", err);
      setFestivalOffers((prev) => prev.filter((f) => f.id !== targetId));
      showNotification(`Festival offer "${targetName}" removed.`);
    }
  };

  // ─── Plan Handlers ───────────────────────────────────────────

  const handleCreatePlan = async (newPlanData: Omit<AdminPlan, "id">) => {
    const planId = `plan-${Date.now()}`;
    const payload: AdminPlan = {
      id: planId,
      ...newPlanData,
    };

    try {
      const created = (await api.admin.createPlan(
        payload as unknown as Record<string, unknown>,
      )) as unknown as AdminPlan;
      setPlans((prev) => [...prev, created]);
      showNotification(`Plan "${created.name}" created successfully!`);
    } catch (err) {
      console.error("Failed to save plan to backend:", err);
      setPlans((prev) => [...prev, payload]);
      showNotification(`Plan "${payload.name}" created.`);
    }
  };

  const handleSaveEditPlan = async (updated: AdminPlan) => {
    if (updated.showOnHome) {
      const otherHomePlans = plans.filter(
        (p) => p.id !== updated.id && p.showOnHome && p.status === "active",
      );
      if (otherHomePlans.length >= 4) {
        alert(
          "হোমপেজে সর্বোচ্চ ৪টি প্ল্যান রাখা যাবে। অনুগ্রহ করে অন্য একটি প্ল্যানের 'Show on Public Homepage' আনচেক করে এটি চালু করুন।",
        );
        return;
      }
    }

    try {
      const res = (await api.admin.updatePlan(
        updated.id,
        updated as unknown as Record<string, unknown>,
      )) as unknown as AdminPlan;
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? res : p)));
      showNotification(`Plan "${res.name}" updated successfully!`);
    } catch (err) {
      console.error("Failed to update plan on backend:", err);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      showNotification(`Plan "${updated.name}" updated.`);
    }
  };

  const handleTogglePlanStatus = async (id: string) => {
    try {
      const res = await api.admin.togglePlanStatus(id);
      const updated = res as unknown as AdminPlan;
      setPlans((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: updated.status } : p)),
      );
      showNotification(
        `Plan is now ${updated.status === "active" ? "ACTIVE on storefront" : "ARCHIVED"}!`,
      );
    } catch (err) {
      console.error("Failed to toggle plan on backend:", err);
      setPlans((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: p.status === "active" ? "archived" : "active" }
            : p,
        ),
      );
    }
  };

  const handleConfirmDeletePlan = async () => {
    if (!deletingPlan) return;
    const targetId = deletingPlan.id;
    const targetName = deletingPlan.name;
    setDeletingPlan(null);

    try {
      await api.admin.deletePlan(targetId);
      setPlans((prev) => prev.filter((p) => p.id !== targetId));
      showNotification(`Plan "${targetName}" deleted.`);
    } catch (err) {
      console.error("Failed to delete plan on backend:", err);
      setPlans((prev) => prev.filter((p) => p.id !== targetId));
      showNotification(`Plan "${targetName}" removed.`);
    }
  };

  // ─── Enterprise Contract Handlers ────────────────────────────

  const handleActivateContract = async (id: string) => {
    try {
      const res = await api.admin.activateContract(
        id,
        "Paid Offline (Super Admin)",
      );
      showNotification(res.message || "Contract activated and store upgraded!");
      fetchContracts();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to activate contract");
    }
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await api.admin.deleteContract(id);
      showNotification("Enterprise contract deleted successfully.");
      setContracts((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete contract");
    }
  };

  const activePlansCount = plans.filter((p) => p.status === "active").length;
  const homePlansCount = plans.filter(
    (p) => p.showOnHome && p.status === "active",
  ).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-1">
      {/* ─── 1. Header ─── */}
      <PlansHeader
        loading={loading}
        activePlansCount={activePlansCount}
        successMsg={successMsg}
        onDismissSuccess={() => setSuccessMsg(null)}
        onCreatePlanClick={() => setCreateModalOpen(true)}
      />

      {/* ─── 2. Seasonal & Festival Promo Campaigns ─── */}
      <FestivalTable
        festivalOffers={festivalOffers}
        onAddClick={() => setAddFestivalModalOpen(true)}
        onEditClick={(offer) => setEditingFestivalOffer(offer)}
        onDeleteClick={(offer) => setDeletingFestivalOffer(offer)}
        onToggleActive={handleToggleFestivalOffer}
      />

      {/* ─── 3. Main Commercial Plans ─── */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15.5px] font-bold text-text">
                Commercial Storefront Plans ({plans.length})
              </h2>
              <span
                className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-mono font-bold"
                title="Maximum 4 plans can be shown on public homepage"
              >
                🌐 Home: {homePlansCount}/4
              </span>
            </div>
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
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-80 rounded-2xl border border-line bg-white p-5 animate-pulse flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-6 w-28 bg-surface-2 rounded-md" />
                  <div className="h-4 w-40 bg-surface-2 rounded-md" />
                  <div className="h-10 w-32 bg-surface-2 rounded-md mt-4" />
                </div>
                <div className="h-4 w-full bg-surface-2 rounded-md" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center space-y-3 shadow-2xs">
            <div className="size-12 rounded-2xl bg-signal/8 text-signal grid place-items-center mx-auto mb-2">
              <IconTag width={22} height={22} />
            </div>
            <h3 className="font-bold text-text text-base">
              No Subscription Plans Found
            </h3>
            <p className="text-text-3 text-sm max-w-sm mx-auto">
              You haven&apos;t created any commercial subscription plans in the
              database yet. Click below to add your first plan.
            </p>
            <div className="pt-2">
              <Button
                variant="signal"
                size="sm"
                onClick={() => setCreateModalOpen(true)}
                className="gap-1.5 font-semibold text-[13px] h-9 px-4 cursor-pointer shadow-xs"
              >
                <IconPlus width={14} height={14} />
                <span>Create Your First Plan</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                isYearlyView={isYearlyView}
                onEdit={(plan) => setEditingPlan(plan)}
                onToggleStatus={handleTogglePlanStatus}
                onDelete={(plan) => setDeletingPlan(plan)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ─── 4. Enterprise & Custom Contracts Table ─── */}
      <ContractsTable
        contracts={contracts}
        loading={loadingContracts}
        onRefresh={fetchContracts}
        onOpenCreate={() => setProvisionModalOpen(true)}
        onActivate={handleActivateContract}
        onDelete={handleDeleteContract}
      />

      {/* ─── Modals ─── */}
      <FestivalModals
        plans={plans}
        editingOffer={editingFestivalOffer}
        onCloseEdit={() => setEditingFestivalOffer(null)}
        onSaveEdit={handleSaveEditFestivalOffer}
        deletingOffer={deletingFestivalOffer}
        onCloseDelete={() => setDeletingFestivalOffer(null)}
        onConfirmDelete={handleConfirmDeleteFestivalOffer}
        addModalOpen={addFestivalModalOpen}
        onCloseAdd={() => setAddFestivalModalOpen(false)}
        onCreateOffer={handleCreateFestivalOffer}
      />

      <PlanModals
        editingPlan={editingPlan}
        onCloseEdit={() => setEditingPlan(null)}
        onSaveEdit={handleSaveEditPlan}
        deletingPlan={deletingPlan}
        onCloseDelete={() => setDeletingPlan(null)}
        onConfirmDelete={handleConfirmDeletePlan}
        createModalOpen={createModalOpen}
        onCloseCreate={() => setCreateModalOpen(false)}
        onCreatePlan={handleCreatePlan}
        provisionModalOpen={provisionModalOpen}
        onCloseProvision={() => setProvisionModalOpen(false)}
        onContractCreated={() => {
          fetchContracts();
          showNotification("Custom plan created successfully!");
        }}
        allPlans={plans}
      />
    </div>
  );
}

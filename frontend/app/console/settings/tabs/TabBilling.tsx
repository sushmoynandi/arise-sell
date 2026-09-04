"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel, PanelHead } from "@/components/ui/primitives";
import {
  IconCheck,
  IconDownload,
  IconClose,
  IconEye,
  IconShield,
} from "@/components/ui/icons";
import {
  api,
  BillingPlan,
  BillingInvoice,
  StoreWorkspace,
  TeamMemberData,
} from "@/lib/api-client";
import { cx } from "@/lib/format";
import { generateInvoicePdfBlob } from "@/lib/invoice-pdf";
import { QuotaBar } from "../components";
import { useSettings } from "../settings-context";

export function TabBilling() {
  const { settings, refreshSettings } = useSettings();

  // Dynamic Data States
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [stores, setStores] = useState<StoreWorkspace[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI Interactive States
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [topupLoading, setTopupLoading] = useState<string | null>(null);
  const [switchingPlanId, setSwitchingPlanId] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(
    null,
  );
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  // Fetch all dynamic data from backend PostgreSQL
  const fetchData = useCallback(async () => {
    try {
      const [plansData, invoicesData, storesData, teamData] =
        await Promise.allSettled([
          api.billing.listPlans(),
          api.billing.listInvoices(),
          api.merchants.getMyStores(),
          api.merchants.getTeam(),
        ]);

      if (plansData.status === "fulfilled" && Array.isArray(plansData.value)) {
        setPlans(plansData.value);
      }
      if (
        invoicesData.status === "fulfilled" &&
        Array.isArray(invoicesData.value)
      ) {
        setInvoices(invoicesData.value);
      }
      if (
        storesData.status === "fulfilled" &&
        Array.isArray(storesData.value)
      ) {
        setStores(storesData.value);
      }
      if (teamData.status === "fulfilled" && Array.isArray(teamData.value)) {
        setTeamMembers(teamData.value);
      }
    } catch (err) {
      console.error("Failed to load billing data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Dynamic Quotas & Plan Data
  const planName = (settings.plan || "Business").trim();
  const matchedCurrentPlan = plans.find(
    (p) => p.name.toLowerCase() === planName.toLowerCase(),
  );

  const planPriceBDT =
    settings.planPriceBDT ??
    matchedCurrentPlan?.priceBDT ??
    (planName.toLowerCase().includes("business")
      ? 2499
      : planName.toLowerCase().includes("pro")
        ? 999
        : 349);

  const ordersUsed = settings.messagesUsed ?? settings.ordersUsed ?? 0;
  const ordersQuota =
    settings.messagesQuota ??
    settings.ordersQuota ??
    matchedCurrentPlan?.messageLimit ??
    10000;
  const remainingQuota = Math.max(0, ordersQuota - ordersUsed);
  const remainingPercent =
    ordersQuota > 0 ? Math.round((remainingQuota / ordersQuota) * 100) : 0;

  const maxStores =
    settings.maxStores ??
    matchedCurrentPlan?.maxStores ??
    (planName.toLowerCase().includes("business") ? 2 : 1);
  const maxSeats =
    settings.maxSeats ??
    matchedCurrentPlan?.maxSeats ??
    (planName.toLowerCase().includes("business") ? 8 : 4);

  const ownedStores = stores.filter((s) => s.is_owner);
  const storesUsed =
    stores.length > 0 ? ownedStores.length : (settings.currentStoresCount ?? 1);
  const seatsUsed =
    teamMembers.length > 0
      ? teamMembers.length
      : (settings.currentSeatsCount ?? 1);

  const nextInvoiceDate =
    (settings.nextBillingDate as string) || "10 Oct, 2026";
  const paymentMethod =
    (settings.paymentMethod as string) || "bKash Auto-Debit";

  // Handle 1-Click Quota Top-Up
  const handleTopup = async (packName: string) => {
    setTopupLoading(packName);
    try {
      const res = await api.billing.createTopup(packName, "bkash");
      if (res.success) {
        showToast(
          res.message || `Successfully added ${packName}! Quota updated.`,
          "success",
        );
        await refreshSettings();
        const updatedInvoices = await api.billing.listInvoices();
        if (Array.isArray(updatedInvoices)) setInvoices(updatedInvoices);
      } else {
        showToast("Top-up request failed. Please try again.", "error");
      }
    } catch (err: unknown) {
      console.error("Topup failed:", err);
      showToast(
        err instanceof Error ? err.message : "Failed to process top-up",
        "error",
      );
    } finally {
      setTopupLoading(null);
    }
  };

  // Handle Plan Upgrade / Switching
  const handleSwitchPlan = async (targetPlan: BillingPlan) => {
    if (targetPlan.name.toLowerCase() === planName.toLowerCase()) return;
    setSwitchingPlanId(targetPlan.id);
    try {
      const res = await api.billing.selectPlan({
        plan_id: targetPlan.id,
        billing_period: billingCycle,
      });
      if (res.success) {
        showToast(
          res.message || `Successfully switched to ${targetPlan.name} Plan!`,
          "success",
        );
        await refreshSettings();
        const updatedInvoices = await api.billing.listInvoices();
        if (Array.isArray(updatedInvoices)) setInvoices(updatedInvoices);
      } else {
        showToast("Failed to switch plan. Please try again.", "error");
      }
    } catch (err: unknown) {
      console.error("Switch plan failed:", err);
      showToast(
        err instanceof Error ? err.message : "Failed to switch plan",
        "error",
      );
    } finally {
      setSwitchingPlanId(null);
    }
  };

  // Helper to identify Custom / Enterprise plans that require custom consultation
  const isCustomPlan = (
    p?:
      | Partial<BillingPlan>
      | { name?: string; id?: string; tagline?: string }
      | null,
  ) => {
    if (!p) return false;
    const name = (p.name || "").toLowerCase().trim();
    const id = (p.id || "").toLowerCase().trim();
    const tagline = (p.tagline || "").toLowerCase().trim();
    return (
      name.includes("custom") ||
      id.includes("custom") ||
      tagline.includes("custom") ||
      name.includes("enterprise") ||
      name.includes("enterprize") ||
      name.includes("scale") ||
      name.includes("vip")
    );
  };

  // Handle Contact Sales for Custom Plan
  const handleContactSales = (p: BillingPlan) => {
    const phone = "8801711234567";
    const storeName = settings.name || "My Store";
    const planTitle = p.name || "Custom";
    const text = encodeURIComponent(
      `Hello Arise-Sell Team, I am interested in the ${planTitle} Plan for my store "${storeName}". Please share details regarding custom AI message quota, multi-store limits, and pricing.`,
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  // Handle Enterprise Activation Code Redemption
  const handleRedeemCode = async () => {
    const cleanCode = redeemCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setRedeemError("Please enter an activation code.");
      return;
    }
    setRedeemLoading(true);
    setRedeemError(null);
    try {
      const res = await api.billing.redeemCode(cleanCode);
      if (res.success) {
        showToast(
          res.message || `Successfully activated ${res.plan} Plan!`,
          "success",
        );
        setRedeemModalOpen(false);
        setRedeemCodeInput("");
        await refreshSettings();
        await fetchData();
      } else {
        setRedeemError(res.message || "Failed to activate code.");
      }
    } catch (err: unknown) {
      console.error("Redeem code failed:", err);
      setRedeemError(
        err instanceof Error
          ? err.message
          : "Invalid or expired activation code.",
      );
    } finally {
      setRedeemLoading(false);
    }
  };

  // Handle PDF Download
  const handleDownloadPdf = async (inv: BillingInvoice) => {
    try {
      const blob = await generateInvoicePdfBlob({
        id: inv.invoiceNo || inv.id,
        merchantName: inv.merchantName,
        plan: inv.plan,
        amountBDT: inv.amountBDT,
        originalAmountBDT: inv.originalAmountBDT || inv.amountBDT,
        discountBDT: inv.discountBDT || 0,
        method: inv.method,
        txId: inv.txId,
        date: inv.date,
        status: ["paid", "pending", "refunded"].includes(inv.status)
          ? (inv.status as "paid" | "pending" | "refunded")
          : "paid",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${inv.invoiceNo || inv.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cx(
              "rounded-xl border p-4 text-[13px] font-medium flex items-center gap-2 shadow-sm transition-all",
              toast.type === "success"
                ? "border-signal/40 bg-[#edf7f3] text-signal"
                : "border-red-300 bg-red-50 text-red-700",
            )}
          >
            {toast.type === "success" ? (
              <IconCheck width={16} height={16} />
            ) : (
              <IconShield width={16} height={16} />
            )}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Plan + Live Quota Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 rounded-2xl border border-line bg-white p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-signal/15 px-2.5 py-0.5 font-mono text-[10.5px] font-bold text-signal uppercase tracking-wider">
                Current Plan
              </span>
              <span className="text-[11px] text-text-3 font-mono font-medium">
                Active Tier
              </span>
            </div>
            <h3 className="text-2xl font-bold font-display text-text capitalize">
              {planName} Plan
            </h3>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold text-text">
                ৳{planPriceBDT.toLocaleString()}
              </span>
              <span className="text-xs text-text-3 font-mono">/ month</span>
            </div>
            <p className="text-[11.5px] text-text-3 leading-relaxed">
              Full Conversational Commerce ERP with multi-store support and
              Steadfast/Pathao auto-booking.
            </p>
          </div>

          <div className="pt-3 border-t border-line/60 space-y-2 text-xs text-text-2">
            <div className="flex justify-between items-center">
              <span>Payment Method:</span>
              <span className="font-mono font-semibold text-text">
                {paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Next Renewal:</span>
              <span className="font-mono font-semibold text-text">
                {nextInvoiceDate}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Store Allowance:</span>
              <span className="font-mono font-semibold text-signal">
                {maxStores} {maxStores > 1 ? "Stores" : "Store"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Team Member Seats:</span>
              <span className="font-mono font-semibold text-signal">
                {maxSeats} {maxSeats > 1 ? "Seats" : "Seat"}
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl border border-line bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <div>
              <h4 className="text-[15px] font-bold text-text">
                Real-Time Quota Consumption
              </h4>
              <p className="text-[11.5px] text-text-3">
                Persistent multi-tenant usage synced across your merchant
                account.
              </p>
            </div>
            <Badge tone={remainingPercent > 20 ? "mint" : "amber"}>
              {remainingQuota.toLocaleString()} Left ({remainingPercent}%)
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <QuotaBar
              label="AI Messages"
              used={ordersUsed}
              total={ordersQuota}
            />
            <QuotaBar
              label="Owned Stores"
              used={storesUsed}
              total={maxStores}
            />
            <QuotaBar
              label="Active Team Seats"
              used={seatsUsed}
              total={maxSeats}
            />
            <QuotaBar
              label="Meta CAPI & Courier Signals"
              used={Math.min(ordersUsed * 3, 10000)}
              total={10000}
            />
          </div>
        </div>
      </div>

      {/* 1-Click Quota Top-Up Panel */}
      <Panel>
        <PanelHead
          title="1-Click Quota Top-Up"
          sub="Add instant AI message quota. Top-up packs never expire and roll over."
        />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {[
            {
              name: "+500 AI Messages",
              quota: 500,
              price: "৳১,২৫০",
              unit: "৳২.৫০/msg",
              badge: "Most Popular",
            },
            {
              name: "+1,500 AI Messages",
              quota: 1500,
              price: "৳৩,২০০",
              unit: "৳২.১৩/msg",
              badge: "Best Value",
            },
            {
              name: "+5,000 AI Messages",
              quota: 5000,
              price: "৳৮,৫০০",
              unit: "৳১.৭০/msg",
              badge: "High Volume",
            },
          ].map((p) => {
            const isToppingUp = topupLoading === p.name;
            return (
              <div
                key={p.name}
                className="rounded-xl border border-line p-4 space-y-3 bg-surface-2/30 hover:border-signal/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-text">
                      {p.name}
                    </span>
                    <span className="text-[9.5px] font-mono font-bold bg-signal/15 text-signal px-2 py-0.5 rounded">
                      {p.badge}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-xl font-bold font-display text-text">
                      {p.price}
                    </span>
                    <span className="text-[11px] text-text-3 font-mono">
                      ({p.unit})
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="signal"
                  disabled={isToppingUp}
                  onClick={() => handleTopup(p.name)}
                  className="w-full justify-center"
                >
                  {isToppingUp ? "Processing..." : "+ Add to Quota"}
                </Button>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Plan Comparison & Upgrade (Dynamic from Database) */}
      <Panel>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 border-b border-line">
          <div>
            <h3 className="font-bold text-base text-text">
              Compare Subscription Tiers
            </h3>
            <p className="text-xs text-text-3">
              Upgrade or switch anytime. Multi-tenant quota and store
              allocations update instantly.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex rounded-lg border border-line p-1 bg-surface-2/40 text-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={cx(
                "px-3 py-1 rounded-md font-semibold transition-all",
                billingCycle === "monthly"
                  ? "bg-white text-text shadow-2xs"
                  : "text-text-3 hover:text-text",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={cx(
                "px-3 py-1 rounded-md font-semibold transition-all",
                billingCycle === "yearly"
                  ? "bg-white text-text shadow-2xs"
                  : "text-text-3 hover:text-text",
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Dynamic Plans Grid: Show plans with showOnHome: true, PLUS user's active plan if not included */}
        {(() => {
          const isUserOnCustom = isCustomPlan({
            name: planName,
            id: planName,
            tagline: "",
          });
          const homePlans = plans.filter(
            (p) => p.showOnHome === true && p.status !== "archived",
          );
          const basePlans =
            homePlans.length > 0
              ? [...homePlans]
              : plans.filter((p) => p.status === "active");

          // Always include user's active plan if not already present
          const activePlanMatch = plans.find(
            (p) =>
              p.name.toLowerCase() === planName.toLowerCase() ||
              p.id.toLowerCase() === planName.toLowerCase(),
          );
          if (
            activePlanMatch &&
            !basePlans.some(
              (p) =>
                p.id === activePlanMatch.id ||
                p.name.toLowerCase() === activePlanMatch.name.toLowerCase(),
            )
          ) {
            basePlans.push(activePlanMatch);
          } else if (
            isUserOnCustom &&
            !basePlans.some((p) => isCustomPlan(p))
          ) {
            // User has an active custom plan, include it in the grid at the right
            basePlans.push({
              id: "plan-custom-active",
              name: planName,
              nameBn: "কাস্টম এন্টারপ্রাইজ",
              tagline:
                "Active tailored enterprise tier with dedicated SLA & multi-store.",
              priceBDT: planPriceBDT,
              yearlyPriceBDT: planPriceBDT * 10,
              yearlyDiscountPercent: 17,
              billingPeriod: "both",
              messageLimit: ordersQuota,
              maxStores: maxStores,
              maxSeats: maxSeats,
              catalogLimit: 10000,
              courierChannels: 10,
              features: [
                `${ordersQuota.toLocaleString()} AI Messages / month`,
                `${maxStores} Connected Stores`,
                `${maxSeats} Team Member Seats`,
                "Dedicated High-Concurrency Cloud Node",
                "Dedicated Account Manager & SLA",
              ],
              badge: "ENTERPRISE",
              popular: false,
              activeMerchants: 15,
              status: "active",
              showOnHome: true,
            });
          }

          const sortedPlans = [...basePlans].sort((a, b) => {
            const aCustom = isCustomPlan(a);
            const bCustom = isCustomPlan(b);
            if (aCustom && !bCustom) return 1; // Custom / Enterprise goes to the rightmost column
            if (!aCustom && bCustom) return -1;
            return (a.priceBDT || 0) - (b.priceBDT || 0);
          });

          return (
            <div>
              <div
                className={cx(
                  "grid grid-cols-1 md:grid-cols-2 gap-4 p-5",
                  sortedPlans.length === 3 && "lg:grid-cols-3",
                  sortedPlans.length === 4 && "lg:grid-cols-4",
                  sortedPlans.length >= 5 && "lg:grid-cols-5",
                )}
              >
                {sortedPlans.map((p) => {
                  const isCustom = isCustomPlan(p);
                  const isCurrent = isCustom
                    ? isUserOnCustom
                    : p.name.toLowerCase() === planName.toLowerCase();
                  const isSwitching = switchingPlanId === p.id;
                  const displayTitle =
                    isCurrent && isCustom ? planName : p.name;
                  const price =
                    billingCycle === "yearly"
                      ? Math.round(p.yearlyPriceBDT || p.priceBDT * 10)
                      : p.priceBDT;
                  const displayPrice =
                    isCurrent && isCustom
                      ? billingCycle === "yearly"
                        ? Math.round(planPriceBDT * 10)
                        : planPriceBDT
                      : price;
                  const periodLabel =
                    billingCycle === "yearly" ? "/ yr" : "/ mo";

                  return (
                    <div
                      key={p.id}
                      className={cx(
                        "rounded-2xl border p-4 space-y-3 flex flex-col justify-between transition-all",
                        isCurrent
                          ? "border-signal/60 bg-[#edf7f3]/40 ring-1.5 ring-signal/30 shadow-xs"
                          : "border-line bg-white hover:border-line/80 hover:shadow-2xs",
                      )}
                    >
                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-base text-text capitalize">
                            {displayTitle}
                          </h4>
                          {isCurrent ? (
                            <span className="rounded bg-signal text-white px-2 py-0.5 text-[9.5px] font-bold">
                              CURRENT
                            </span>
                          ) : p.badge ? (
                            <span className="rounded bg-signal/15 text-signal px-2 py-0.5 text-[9.5px] font-bold font-mono">
                              {p.badge}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-[11px] text-text-3 min-h-[30px] line-clamp-2">
                          {p.tagline ||
                            `Designed for growing merchants needing reliable conversational AI.`}
                        </p>

                        <div className="flex items-baseline gap-1 pt-1 min-h-[38px]">
                          <span className="text-xl font-bold font-display text-text">
                            ৳{displayPrice.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-text-3 font-mono">
                            {periodLabel}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-1">
                          <div className="rounded-lg bg-surface-2/60 p-2 font-mono text-[11px] text-text-2 font-semibold flex justify-between items-center">
                            <span>Messages:</span>
                            <span className="text-signal font-bold whitespace-nowrap">
                              {isCurrent
                                ? `${ordersQuota.toLocaleString()} msgs`
                                : `${p.messageLimit.toLocaleString()} msgs`}
                            </span>
                          </div>
                          <div className="rounded-lg bg-surface-2/60 p-2 font-mono text-[11px] text-text-2 font-semibold flex justify-between items-center">
                            <span>Stores:</span>
                            <span className="text-text font-bold whitespace-nowrap">
                              {isCurrent
                                ? `${maxStores} ${maxStores > 1 ? "Stores" : "Store"}`
                                : `${p.maxStores} ${p.maxStores > 1 ? "Stores" : "Store"}`}
                            </span>
                          </div>
                          <div className="rounded-lg bg-surface-2/60 p-2 font-mono text-[11px] text-text-2 font-semibold flex justify-between items-center">
                            <span>Seats:</span>
                            <span className="text-text font-bold whitespace-nowrap">
                              {isCurrent
                                ? `${maxSeats} ${maxSeats > 1 ? "Seats" : "Seat"}`
                                : `${p.maxSeats} ${p.maxSeats > 1 ? "Seats" : "Seat"}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isCurrent ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="w-full justify-center text-xs font-semibold border-signal/40 bg-signal/10 text-signal shadow-2xs mt-2"
                        >
                          <IconCheck
                            width={14}
                            height={14}
                            className="mr-1 text-signal"
                          />
                          Active Plan
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="signal"
                          disabled={isSwitching}
                          onClick={() => handleSwitchPlan(p)}
                          className="w-full justify-center text-xs mt-2"
                        >
                          {isSwitching ? "Switching..." : `Switch to ${p.name}`}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Enterprise Custom Plan & Voucher Redemption Banner (Below Plans Grid) */}
              <div className="border-t border-line p-5 bg-surface-2/20">
                {isUserOnCustom ? (
                  <div className="rounded-2xl border border-signal/30 bg-[#edf7f3]/60 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-3 min-w-0">
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="flex h-2 w-2 rounded-full bg-signal animate-pulse" />
                        <h4 className="text-sm sm:text-base font-bold font-display text-text whitespace-nowrap">
                          {planName}
                        </h4>
                        <span className="rounded-md bg-signal text-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                          Active Plan
                        </span>
                      </div>
                      <span className="text-text-3/60 hidden xl:inline">•</span>
                      <p className="text-xs text-text-2 font-mono whitespace-nowrap">
                        {ordersQuota.toLocaleString()} msgs · {maxStores} stores · {maxSeats} seats · Priority SLA
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setRedeemError(null);
                          setRedeemModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-xl border border-line bg-white hover:bg-surface-2 hover:border-signal/50 text-xs font-semibold text-text shadow-2xs transition-all cursor-pointer"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-signal"
                        >
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                        <span>Redeem Plan Code</span>
                      </button>

                      <Button
                        size="sm"
                        variant="signal"
                        onClick={() =>
                          handleContactSales({
                            id: "custom-enterprise",
                            name: planName,
                            priceBDT: planPriceBDT,
                            messageLimit: ordersQuota,
                            maxStores: maxStores,
                            maxSeats: maxSeats,
                            features: [],
                          } as unknown as BillingPlan)
                        }
                        className="justify-center text-xs gap-2 py-2 px-3.5 font-semibold shadow-xs"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.04c-.24.68-1.4 1.26-1.92 1.34-.5.08-1.15.12-3.71-.94-3.28-1.36-5.38-4.7-5.54-4.92-.16-.22-1.33-1.78-1.33-3.4 0-1.62.85-2.42 1.15-2.75.3-.33.66-.41.88-.41.22 0 .44 0 .63.01.2.01.47-.08.73.56.27.68.92 2.27 1 2.43.08.17.14.36.02.58-.11.22-.17.36-.34.56-.17.2-.36.45-.51.6-.17.17-.35.36-.15.7.2.34.89 1.47 1.91 2.38 1.31 1.17 2.42 1.53 2.76 1.7.34.17.54.14.74-.08.2-.23.86-1 1.09-1.35.23-.34.46-.29.77-.17.31.11 1.98.93 2.32 1.1.34.17.57.26.65.4.08.14.08.82-.16 1.5z" />
                        </svg>
                        <span>Contact Sales</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-line/80 bg-white p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2 xl:gap-3 min-w-0">
                      <div className="flex items-center gap-2 shrink-0">
                        <h4 className="text-sm sm:text-base font-bold font-display text-text whitespace-nowrap">
                          Custom Enterprise
                        </h4>
                        <span className="rounded-md bg-signal/15 px-2 py-0.5 text-[10px] font-bold font-mono text-signal uppercase tracking-wider">
                          Tailored
                        </span>
                      </div>
                      <span className="text-text-3/60 hidden xl:inline">•</span>
                      <p className="text-xs text-text-3 whitespace-nowrap">
                        Tailored AI message quotas, multi-store management (3–10+), and dedicated SLA for high-volume brands.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      <Button
                        size="sm"
                        variant="signal"
                        onClick={() =>
                          handleContactSales({
                            id: "custom-enterprise",
                            name: "Custom Enterprise",
                            priceBDT: 0,
                            messageLimit: 50000,
                            maxStores: 10,
                            maxSeats: 30,
                            features: [],
                          } as unknown as BillingPlan)
                        }
                        className="justify-center text-xs gap-2 py-2 px-3.5 font-semibold shadow-xs"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.04c-.24.68-1.4 1.26-1.92 1.34-.5.08-1.15.12-3.71-.94-3.28-1.36-5.38-4.7-5.54-4.92-.16-.22-1.33-1.78-1.33-3.4 0-1.62.85-2.42 1.15-2.75.3-.33.66-.41.88-.41.22 0 .44 0 .63.01.2.01.47-.08.73.56.27.68.92 2.27 1 2.43.08.17.14.36.02.58-.11.22-.17.36-.34.56-.17.2-.36.45-.51.6-.17.17-.35.36-.15.7.2.34.89 1.47 1.91 2.38 1.31 1.17 2.42 1.53 2.76 1.7.34.17.54.14.74-.08.2-.23.86-1 1.09-1.35.23-.34.46-.29.77-.17.31.11 1.98.93 2.32 1.1.34.17.57.26.65.4.08.14.08.82-.16 1.5z" />
                        </svg>
                        <span>Contact Sales</span>
                      </Button>

                      <button
                        type="button"
                        onClick={() => {
                          setRedeemError(null);
                          setRedeemModalOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl border border-line bg-surface-2/50 hover:bg-surface-2 hover:border-signal/50 text-xs font-semibold text-text shadow-2xs transition-all cursor-pointer"
                      >
                        <svg
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-signal"
                        >
                          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                        </svg>
                        <span>Redeem Plan Code</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </Panel>

      {/* Invoices & Tax Receipts (Dynamic from PostgreSQL) */}
      <Panel>
        <PanelHead
          title="Invoices & VAT Receipts"
          sub="Official downloadable tax receipts for your business records and auditing."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/50 text-[11px] uppercase font-bold text-text-3 font-mono">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 font-mono">
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-text-3 text-xs font-sans"
                  >
                    {isLoading
                      ? "Loading stored invoices..."
                      : "No invoices recorded yet."}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-surface-2/30">
                    <td className="p-4 font-bold text-text">
                      {inv.invoiceNo || inv.id}
                    </td>
                    <td className="p-4 text-text-3">{inv.date}</td>
                    <td className="p-4 font-sans font-medium text-text">
                      {inv.plan}
                    </td>
                    <td className="p-4 font-bold text-text">
                      ৳{inv.amountBDT.toLocaleString()}
                    </td>
                    <td className="p-4 text-text-2 text-xs font-sans">
                      {inv.method}
                    </td>
                    <td className="p-4">
                      <span className="rounded-md bg-signal/15 px-2 py-0.5 text-[10px] font-bold text-signal font-sans capitalize">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 text-signal hover:underline text-xs font-sans font-medium"
                      >
                        <IconEye width={13} height={13} />
                        View
                      </button>
                      <span className="text-text-3">·</span>
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(inv)}
                        className="inline-flex items-center gap-1 text-signal hover:underline text-xs font-sans font-medium"
                      >
                        <IconDownload width={13} height={13} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Invoice Detail / Print Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl space-y-6 border border-line"
            >
              <div className="flex items-center justify-between border-b border-line pb-4">
                <div>
                  <h3 className="text-lg font-bold font-display text-text">
                    Tax Invoice / VAT Receipt
                  </h3>
                  <p className="text-xs text-text-3 font-mono">
                    NBR Registered · BIN: 002918274-0101
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-lg p-1 text-text-3 hover:bg-surface-2 hover:text-text"
                >
                  <IconClose width={20} height={20} />
                </button>
              </div>

              {/* Invoice Meta Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-text-3 block">Invoice No:</span>
                  <span className="font-mono font-bold text-text text-sm">
                    {selectedInvoice.invoiceNo || selectedInvoice.id}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block">Issue Date:</span>
                  <span className="font-mono font-semibold text-text">
                    {selectedInvoice.date}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block">Billed To:</span>
                  <span className="font-semibold text-text">
                    {selectedInvoice.merchantName}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block">Payment Method:</span>
                  <span className="font-semibold text-text">
                    {selectedInvoice.method}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block">Transaction ID:</span>
                  <span className="font-mono font-semibold text-text">
                    {selectedInvoice.txId}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block">Payment Status:</span>
                  <span className="inline-block rounded bg-signal/15 px-2 py-0.5 text-signal font-bold text-[11px] uppercase">
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Line Item Table */}
              <div className="rounded-xl border border-line overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-2/60 text-text-3 border-b border-line font-mono font-semibold">
                    <tr>
                      <th className="p-3">Item & Description</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line font-mono">
                    <tr>
                      <td className="p-3">
                        <p className="font-semibold font-sans text-text">
                          {selectedInvoice.plan}
                        </p>
                        <p className="text-[11px] text-text-3 font-sans">
                          Arise-Sell Conversational Commerce Platform License
                        </p>
                      </td>
                      <td className="p-3 text-right text-text">
                        ৳{selectedInvoice.amountBDT.toLocaleString()}
                      </td>
                      <td className="p-3 text-right font-bold text-text">
                        ৳{selectedInvoice.amountBDT.toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-surface-2/20 font-sans">
                      <td colSpan={2} className="p-3 text-right font-semibold">
                        Total Paid:
                      </td>
                      <td className="p-3 text-right font-bold text-signal text-sm font-mono">
                        ৳{selectedInvoice.amountBDT.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </Button>
                <Button
                  variant="signal"
                  onClick={() => handleDownloadPdf(selectedInvoice)}
                  className="gap-1.5"
                >
                  <IconDownload width={16} height={16} />
                  Download PDF / Print
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Plan Code Redemption Modal */}
      <AnimatePresence>
        {redeemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-line"
            >
              <div className="flex items-start justify-between border-b border-line pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal/15 text-signal">
                    <svg
                      width="20"
                      height="20"
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
                    <h3 className="text-base font-bold font-display text-text">
                      Redeem Custom Plan Code
                    </h3>
                    <p className="text-[11.5px] text-text-3">
                      Enter the activation license key provided by sales
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRedeemModalOpen(false);
                    setRedeemError(null);
                  }}
                  className="rounded-lg p-1 text-text-3 hover:bg-surface-2 hover:text-text cursor-pointer"
                >
                  <IconClose width={18} height={18} />
                </button>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold text-text">
                  Enterprise Activation Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CUSTOM-VIP-50K"
                  value={redeemCodeInput}
                  onChange={(e) => {
                    setRedeemCodeInput(e.target.value.toUpperCase());
                    setRedeemError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !redeemLoading) {
                      e.preventDefault();
                      handleRedeemCode();
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-surface-2/30 px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-text placeholder:normal-case placeholder:font-sans placeholder:text-text-3 focus:border-signal focus:bg-white focus:ring-2 focus:ring-signal/20 focus:outline-hidden"
                  autoFocus
                />

                {redeemError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 flex items-center gap-2">
                    <IconShield width={14} height={14} className="shrink-0" />
                    <span>{redeemError}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-line">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRedeemModalOpen(false);
                    setRedeemError(null);
                  }}
                  disabled={redeemLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="signal"
                  size="sm"
                  onClick={handleRedeemCode}
                  disabled={redeemLoading || !redeemCodeInput.trim()}
                  className="gap-1.5"
                >
                  {redeemLoading ? (
                    "Activating..."
                  ) : (
                    <>
                      <IconCheck width={15} height={15} />
                      <span>Activate Plan</span>
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

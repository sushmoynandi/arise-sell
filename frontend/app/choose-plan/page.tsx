"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/ui/primitives";
import LanguageToggle from "@/components/marketing/LanguageToggle";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import api, { type CheckPlanSwitchResponse } from "@/lib/api-client";
import { DowngradeReconcileModal } from "@/components/console/DowngradeReconcileModal";
import { bdt, cx } from "@/lib/format";
import {
  IconCheck,
  IconClose,
  IconLogOut,
  IconShield,
  IconSpark,
} from "@/components/ui/icons";

interface BackendPlan {
  id: string;
  name: string;
  nameBn?: string;
  tagline?: string;
  priceBDT: number;
  yearlyPriceBDT?: number;
  yearlyDiscountPercent?: number;
  billingPeriod?: string;
  messageLimit: number;
  maxStores?: number;
  maxSeats?: number;
  catalogLimit?: number;
  courierChannels?: number;
  features: string[];
  badge?: string | null;
  popular?: boolean;
  status?: string;
  showOnHome?: boolean;
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const { lang, t } = useLang();
  const { user, selectPlan, logout } = useAuth();

  const [storeDeleted, setStoreDeleted] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("store_deleted") === "true") {
        setStoreDeleted(true);
      }
    }
  }, []);

  const [plans, setPlans] = useState<BackendPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [isYearly, setIsYearly] = useState(false);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
  const [reconcileConflictData, setReconcileConflictData] =
    useState<CheckPlanSwitchResponse | null>(null);
  const [pendingPlan, setPendingPlan] = useState<BackendPlan | null>(null);
  const [isSubmittingReconcile, setIsSubmittingReconcile] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [redeemCodeInput, setRedeemCodeInput] = useState("");
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [verifiedPlan, setVerifiedPlan] = useState<{
    valid: boolean;
    code?: string;
    plan_id?: string;
    plan_name?: string;
    duration_months?: number;
    message_limit?: number;
    max_stores?: number;
    max_seats?: number;
    price_bdt?: number;
    code_expiry?: string | null;
    features?: string[];
  } | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("bKash Auto-Debit");
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [pendingContract, setPendingContract] = useState<{
    id: string;
    contract_code: string;
    plan_name: string;
    duration_months: number;
    price_bdt: number;
    message_limit: number;
    max_stores: number;
    max_seats: number;
    features: string[];
    valid_until?: string | null;
    status: string;
    merchant_name?: string | null;
  } | null>(null);
  const [contractPaying, setContractPaying] = useState(false);

  // Auto-detect pending enterprise proposal for this user/store
  useEffect(() => {
    api.billing
      .getEnterpriseContract()
      .then((res) => {
        if (
          res &&
          res.found &&
          res.contract &&
          res.contract.status === "pending"
        ) {
          setPendingContract(res.contract);
        }
      })
      .catch(() => {});
  }, []);

  const isCustomPlan = (p: BackendPlan) => {
    const name = (p.name || "").toLowerCase().trim();
    const id = (p.id || "").toLowerCase().trim();
    const tagline = (p.tagline || "").toLowerCase().trim();
    return (
      name.includes("custom") ||
      id.includes("custom") ||
      tagline.includes("custom") ||
      name.includes("enterprise") ||
      name.includes("enterprize")
    );
  };

  // Fetch active plans directly from backend API (show only showOnHome, Custom placed at far right)
  useEffect(() => {
    let active = true;
    async function fetchPlans() {
      try {
        const res = await api.billing.listPlans();
        if (active && Array.isArray(res) && res.length > 0) {
          const all = res as BackendPlan[];
          const homePlans = all.filter(
            (p) => p.showOnHome === true && p.status !== "archived",
          );
          const display =
            homePlans.length > 0
              ? homePlans
              : all.filter((p) => p.status === "active");
          const sorted = [...display].sort((a, b) => {
            const aCustom = isCustomPlan(a);
            const bCustom = isCustomPlan(b);
            if (aCustom && !bCustom) return 1;
            if (!aCustom && bCustom) return -1;
            return (a.priceBDT || 0) - (b.priceBDT || 0);
          });
          setPlans(sorted);
        }
      } catch (err) {
        console.error("Failed to load plans from backend:", err);
      } finally {
        if (active) setLoadingPlans(false);
      }
    }
    fetchPlans();
    return () => {
      active = false;
    };
  }, []);

  const handleSelectPlan = async (plan: BackendPlan) => {
    if (isCustomPlan(plan)) {
      const phone = "8801711234567";
      const text = encodeURIComponent(
        `Hello Arise-Sell Team, I am interested in the ${plan.name} Plan. Please share customized volume quota, multi-store allocations, and enterprise SLA pricing.`,
      );
      window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
      return;
    }

    setError(null);
    setLoadingPlanId(plan.id);
    setSelectedPlanId(plan.id);

    try {
      if (user) {
        const checkRes = await api.billing.checkPlanSwitch({
          plan_id: plan.id,
        });

        if (checkRes.requires_reconciliation) {
          setPendingPlan(plan);
          setReconcileConflictData(checkRes);
          setReconcileModalOpen(true);
          setLoadingPlanId(null);
          return;
        }
      }

      await executePlanSelection(plan);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Plan activation error";
      setError(msg);
      setLoadingPlanId(null);
    }
  };

  const executePlanSelection = async (
    plan: BackendPlan,
    reconciliation?: {
      keep_store_ids: string[];
      keep_team_member_ids: string[];
    },
  ) => {
    setLoadingPlanId(plan.id);
    try {
      const res = await selectPlan(
        plan.id,
        isYearly ? "yearly" : "monthly",
        reconciliation,
      );
      if (res.success) {
        window.location.href = "/console";
      } else {
        setError(
          res.error ||
            t(
              "Failed to activate plan. Please try again.",
              "প্ল্যান অ্যাক্টিভ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।",
            ),
        );
        setLoadingPlanId(null);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Plan activation error";
      setError(msg);
      setLoadingPlanId(null);
    } finally {
      setIsSubmittingReconcile(false);
      setReconcileModalOpen(false);
    }
  };

  const handleConfirmReconciliation = async (recon: {
    keep_store_ids: string[];
    keep_team_member_ids: string[];
  }) => {
    if (!pendingPlan) return;
    setIsSubmittingReconcile(true);
    await executePlanSelection(pendingPlan, recon);
  };

  const handleVerifyCode = async () => {
    const cleanCode = redeemCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setRedeemError("Please enter an activation code.");
      return;
    }
    setVerifyingCode(true);
    setRedeemError(null);
    try {
      // First check PostgreSQL enterprise contracts
      const contractRes = await api.billing
        .getEnterpriseContract(cleanCode)
        .catch(() => null);
      if (contractRes && contractRes.found && contractRes.contract) {
        const c = contractRes.contract;
        setVerifiedPlan({
          valid: true,
          code: c.contract_code,
          plan_name: c.plan_name,
          duration_months: c.duration_months,
          message_limit: c.message_limit,
          max_stores: c.max_stores,
          max_seats: c.max_seats,
          price_bdt: c.price_bdt,
          code_expiry: c.valid_until,
          features: c.features || [],
        });
        setRedeemError(null);
        return;
      }

      const res = await api.billing.verifyCode(cleanCode);
      if (res && res.valid) {
        setVerifiedPlan(res);
        setRedeemError(null);
      } else {
        setVerifiedPlan(null);
        setRedeemError(res.error || "Invalid or expired activation code.");
      }
    } catch (err: unknown) {
      setVerifiedPlan(null);
      setRedeemError(
        err instanceof Error
          ? err.message
          : "Failed to verify activation code.",
      );
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleRedeemCode = async () => {
    const targetCode = (verifiedPlan?.code || redeemCodeInput)
      .trim()
      .toUpperCase();
    if (!targetCode) {
      setRedeemError("Please enter an activation code.");
      return;
    }
    setRedeemLoading(true);
    setRedeemError(null);
    try {
      let res;
      try {
        res = await api.billing.payEnterpriseContract(
          targetCode,
          selectedPaymentMethod,
        );
      } catch {
        res = await api.billing.redeemCode(targetCode, selectedPaymentMethod);
      }

      if (res && res.success) {
        setRedeemModalOpen(false);
        router.push("/console");
      } else {
        setRedeemError(res?.message || "Failed to activate code.");
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

  const handlePayPendingContract = async () => {
    if (!pendingContract) return;
    setContractPaying(true);
    setError(null);
    try {
      const res = await api.billing.payEnterpriseContract(
        pendingContract.contract_code,
        selectedPaymentMethod,
      );
      if (res && res.success) {
        router.push("/console");
      } else {
        setError("Failed to activate proposal. Please contact support.");
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Payment processing failed.",
      );
    } finally {
      setContractPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-text selection:bg-signal/15 selection:text-signal">
      {/* Background Ambience & Soft Gradient */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-[25%] left-1/2 -translate-x-1/2 w-[1200px] h-[650px] rounded-full bg-linear-to-b from-signal/8 via-signal/2 to-transparent blur-3xl opacity-70" />
        <div className="bg-grid absolute inset-0 opacity-40 mask-fade-b" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Wordmark />
            </Link>
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-signal/25 bg-signal/8 px-3 py-1 text-[11.5px] font-medium text-signal">
              <span className="inline-block size-1.5 rounded-full bg-signal animate-pulse" />
              <span>
                {t(
                  "Step 2 of 2: Select your plan",
                  "ধাপ ২/২: আপনার প্ল্যান বেছে নিন",
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageToggle />
            {user && (
              <div className="flex items-center gap-2.5 pl-2 border-l border-line">
                <span className="hidden md:inline-block text-[13px] font-medium text-text-2 truncate max-w-[170px]">
                  {user.first_name} ({user.email})
                </span>
                <button
                  type="button"
                  onClick={logout}
                  title={t("Sign out", "লগআউট")}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-text-2 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer shadow-2xs"
                >
                  <IconLogOut className="size-3.5" />
                  <span className="hidden sm:inline">
                    {t("Sign out", "লগআউট")}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-[1400px] px-5 pt-10 pb-20 sm:px-8 lg:pt-14">
        {/* Store Deleted Alert Banner */}
        {storeDeleted && (
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-emerald-500/25 bg-emerald-50/90 p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white font-bold text-sm shadow-xs">
              ✓
            </span>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                {t(
                  "Your store was successfully deleted",
                  "আপনার স্টোরটি সফলভাবে মুছে ফেলা হয়েছে",
                )}
              </h3>
              <p className="mt-0.5 text-xs text-emerald-800 leading-relaxed">
                {t(
                  "All connected channels, products, conversations, and orders were removed. Your personal user account remains active. Select a plan below whenever you are ready to launch a new store.",
                  "সকল সংযুক্ত চ্যানেল, পণ্য, কথোপকথন এবং অর্ডার সফলভাবে মুছে ফেলা হয়েছে। আপনার ব্যক্তিগত ইউজার একাউন্ট অপরিবর্তিত রয়েছে। যেকোনো সময় নতুন স্টোর চালু করতে নিচের যেকোনো প্ল্যান বেছে নিন।",
                )}
              </p>
            </div>
          </div>
        )}

        {/* Title & Onboarding Headline */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-signal/8 px-3.5 py-1 text-[11.5px] font-mono font-semibold uppercase tracking-wider text-signal shadow-2xs">
            <IconSpark className="size-3" />
            <span>{t("Subscription Plans", "সাবস্ক্রিপশন প্ল্যান")}</span>
          </div>

          <h1 className="mt-4 font-display text-[28px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight text-text leading-[1.18]">
            {t(
              "Choose a plan to launch your AI sales assistant",
              "আপনার এআই বিক্রয় সহকারী চালু করতে একটি প্ল্যান বেছে নিন",
            )}
          </h1>
          <p className="mt-3 text-[15px] sm:text-[16.5px] leading-relaxed text-text-2">
            {t(
              "Billed on closed orders, not conversations. Start free or scale your automated messaging, catalog, and courier fulfillment.",
              "শুধুমাত্র সফল অর্ডারের ওপর বিলিং—অপ্রয়োজনীয় চ্যাটে কোনো বাড়তি চার্জ নেই। ফ্রিতে শুরু করুন অথবা স্বয়ংক্রিয় মেসেজিং, ক্যাটালগ ও কুরিয়ার সুবিধা গ্রহণ করুন।",
            )}
          </p>

          {/* Billing Cycle Pill Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-line bg-surface p-1 shadow-xs">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cx(
                "rounded-full px-4.5 py-1.5 text-[13px] font-medium transition-all cursor-pointer select-none",
                !isYearly
                  ? "bg-text text-white shadow-xs"
                  : "text-text-3 hover:text-text",
              )}
            >
              {t("Monthly Billing", "মাসিক বিলিং")}
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cx(
                "flex items-center gap-2 rounded-full px-4.5 py-1.5 text-[13px] font-medium transition-all cursor-pointer select-none",
                isYearly
                  ? "bg-text text-white shadow-xs"
                  : "text-text-3 hover:text-text",
              )}
            >
              <span>{t("Yearly Billing", "বার্ষিক বিলিং")}</span>
              <span className="rounded-full bg-signal/15 px-2 py-0.5 text-[10.5px] font-bold text-signal">
                {t("Save 17%", "১৭% ছাড়")}
              </span>
            </button>
          </div>
        </div>

        {/* Error Feedback */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-auto mt-6 max-w-md rounded-2xl border border-red-200 bg-red-50/90 p-3.5 text-center text-[13px] font-medium text-red-600 shadow-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auto-detected Pending Enterprise Proposal */}
        {pendingContract && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border-2 border-signal bg-gradient-to-br from-signal/10 via-[#f0f9f5] to-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 rounded-full bg-signal animate-ping" />
                <h3 className="text-base sm:text-lg font-bold font-display text-text">
                  Personalized Enterprise Proposal Ready:{" "}
                  {pendingContract.plan_name}
                </h3>
                <span className="rounded-md bg-signal text-white px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
                  {pendingContract.duration_months} Months Term
                </span>
              </div>
              <div className="text-xs font-mono text-signal font-bold">
                Quote Ref: {pendingContract.contract_code}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="rounded-xl bg-white/90 border border-signal/20 p-2.5 text-center">
                <div className="text-[10px] text-text-3 font-sans font-medium">
                  Deal Total
                </div>
                <div className="font-bold text-text text-sm">
                  ৳{pendingContract.price_bdt.toLocaleString()} BDT
                </div>
                <div className="text-[9.5px] text-text-3 font-sans">
                  ≈ ৳
                  {Math.round(
                    pendingContract.price_bdt / pendingContract.duration_months,
                  ).toLocaleString()}
                  /mo
                </div>
              </div>
              <div className="rounded-xl bg-white/90 border border-signal/20 p-2.5 text-center">
                <div className="text-[10px] text-text-3 font-sans font-medium">
                  Stores Limit
                </div>
                <div className="font-bold text-text text-sm">
                  {pendingContract.max_stores} Stores
                </div>
              </div>
              <div className="rounded-xl bg-white/90 border border-signal/20 p-2.5 text-center">
                <div className="text-[10px] text-text-3 font-sans font-medium">
                  Team Seats
                </div>
                <div className="font-bold text-text text-sm">
                  {pendingContract.max_seats} Seats
                </div>
              </div>
              <div className="rounded-xl bg-white/90 border border-signal/20 p-2.5 text-center">
                <div className="text-[10px] text-text-3 font-sans font-medium">
                  AI Messages
                </div>
                <div className="font-bold text-signal text-sm">
                  {pendingContract.message_limit.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-signal/20">
              <div className="flex items-center gap-2">
                <span className="text-xs text-text-3 font-medium">
                  Pay via:
                </span>
                <div className="flex rounded-lg border border-line bg-white p-0.5 text-xs font-semibold">
                  {[
                    "bKash Auto-Debit",
                    "Nagad Instant",
                    "Card / Net Banking",
                  ].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(m)}
                      className={cx(
                        "px-2.5 py-1 rounded-md transition-all cursor-pointer text-[11px]",
                        selectedPaymentMethod === m
                          ? "bg-signal text-white shadow-2xs"
                          : "text-text-3 hover:text-text",
                      )}
                    >
                      {m.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={contractPaying}
                onClick={handlePayPendingContract}
                className="gap-2 text-xs font-semibold h-9 px-4 rounded-xl bg-signal text-white hover:bg-signal-hover transition-colors cursor-pointer shadow-xs"
              >
                {contractPaying
                  ? "Processing..."
                  : `Accept & Pay ৳${pendingContract.price_bdt.toLocaleString()} BDT`}
              </button>
            </div>
          </div>
        )}

        {/* 4 Backend Plans Grid */}
        <div className="mt-12">
          {loadingPlans ? (
            <div className="flex h-64 items-center justify-center">
              <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-5 py-3.5 shadow-xs">
                <span className="size-4 animate-spin rounded-full border-2 border-signal border-t-transparent" />
                <span className="text-[13.5px] font-medium text-text-2">
                  {t(
                    "Loading subscription plans...",
                    "প্ল্যানসমূহ লোড করা হচ্ছে...",
                  )}
                </span>
              </div>
            </div>
          ) : (
            <div
              className={cx(
                "grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch",
                plans.length === 3 && "xl:grid-cols-3",
                plans.length === 4 && "xl:grid-cols-4",
                plans.length >= 5 && "xl:grid-cols-5",
              )}
            >
              {plans.map((plan, index) => {
                const isCustom = isCustomPlan(plan);
                const isFree = Number(plan.priceBDT) === 0;
                const priceVal = isYearly
                  ? plan.yearlyPriceBDT || plan.priceBDT * 10
                  : plan.priceBDT;
                const isHighlighted =
                  plan.popular ||
                  (plan.badge &&
                    ["best sale", "popular", "startup"].includes(
                      plan.badge.toLowerCase(),
                    )) ||
                  plan.name.toLowerCase() === "pro";

                const isLoading = loadingPlanId === plan.id;
                const isSelected = selectedPlanId === plan.id;

                const displayName =
                  lang === "bn" && plan.nameBn ? plan.nameBn : plan.name;

                return (
                  <div
                    key={plan.id}
                    className={cx(
                      "relative flex flex-col justify-between rounded-[24px] border transition-all duration-300",
                      isHighlighted
                        ? "border-signal/50 bg-surface p-6 sm:p-7 shadow-[0_16px_40px_-12px_rgba(10,110,80,0.16),0_1px_3px_rgba(0,0,0,0.04)] ring-2 ring-signal/20 scale-[1.01]"
                        : isCustom
                          ? "border-signal/40 bg-surface p-6 sm:p-7 shadow-xs hover:border-signal hover:shadow-md"
                          : "border-line bg-surface p-6 sm:p-7 shadow-xs hover:border-line-soft hover:shadow-md",
                    )}
                  >
                    {/* Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[11px] font-display font-bold uppercase tracking-wider shadow-2xs",
                            isHighlighted
                              ? "bg-signal text-white"
                              : "bg-surface-2 border border-line text-text-2",
                          )}
                        >
                          ★ {plan.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Plan Header */}
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="font-display text-[22px] font-bold tracking-tight text-text">
                          {displayName}
                        </h2>
                        <span className="font-mono text-[11px] font-medium text-text-3 uppercase tracking-wider">
                          Tier {index + 1}
                        </span>
                      </div>

                      {/* Tagline */}
                      {plan.tagline && (
                        <p className="mt-1 text-[13px] text-text-3 line-clamp-2 min-h-[38px] leading-relaxed">
                          {plan.tagline}
                        </p>
                      )}

                      {/* Price Section */}
                      <div className="mt-4 flex items-baseline gap-1.5 border-b border-line pb-4">
                        {isCustom ? (
                          <span className="font-display text-[26px] sm:text-[30px] font-extrabold tracking-tight text-text">
                            {t("Contact Sales", "কাস্টম প্রাইসিং")}
                          </span>
                        ) : (
                          <span className="font-display text-[34px] sm:text-[38px] font-extrabold tracking-tight text-text">
                            {isFree
                              ? lang === "bn"
                                ? "৳০"
                                : "৳0"
                              : bdt(priceVal)}
                          </span>
                        )}
                        <span className="text-[12.5px] font-medium text-text-3">
                          {isCustom
                            ? t("/ tailored", "/ কাস্টমাইজড")
                            : isFree
                              ? lang === "bn"
                                ? "চিরকাল ফ্রি"
                                : "free forever"
                              : isYearly
                                ? t("/ year", "/ বছর")
                                : t("/ month", "/ মাস")}
                        </span>
                      </div>

                      {/* Key Quota Metrics Bar */}
                      <div className="mt-4 rounded-xl border border-line bg-surface-2/60 p-3 space-y-2">
                        <div className="flex items-center justify-between text-[12.5px]">
                          <span className="text-text-3 font-medium">
                            {t("Order / Msg Limit", "মেসেজ / অর্ডার লিমিট")}
                          </span>
                          <span className="font-mono font-bold text-text">
                            {isCustom && (plan.messageLimit || 0) >= 10000
                              ? `${(plan.messageLimit || 10000).toLocaleString("en-IN")}+ ${t("Custom Quota", "টি (কাস্টম)")}`
                              : `${(plan.messageLimit || 200).toLocaleString("en-IN")} ${t("limit", "টি")}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[12px] border-t border-line/60 pt-1.5">
                          <span className="text-text-3">
                            {t("Store Capacity", "স্টোর ধারণক্ষমতা")}
                          </span>
                          <span className="font-mono font-semibold text-text-2">
                            {isCustom && (plan.maxStores || 0) >= 4
                              ? `${plan.maxStores}+ ${t("Stores (Flexible)", "টি স্টোর (ফ্লেক্সিবল)")}`
                              : `${plan.maxStores || 1} ${t("Stores", "টি স্টোর")}`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[12px] border-t border-line/60 pt-1.5">
                          <span className="text-text-3">
                            {t("Team Member Seats", "টিম মেম্বার সিট")}
                          </span>
                          <span className="font-mono font-semibold text-text-2">
                            {isCustom && (plan.maxSeats || 0) >= 20
                              ? `${plan.maxSeats}+ ${t("Seats", "জন টিমমেট")}`
                              : `${plan.maxSeats || 1} ${t("Seats", "জন টিমমেট")}`}
                          </span>
                        </div>
                      </div>

                      {/* Features List */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="mt-5">
                          <p className="text-[11px] font-mono uppercase tracking-wider text-text-3 font-semibold mb-2.5">
                            {t("Included Features", "অন্তর্ভুক্ত সুবিধাসমূহ")}
                          </p>
                          <ul className="space-y-2.5 text-[13px] text-text-2">
                            {plan.features.slice(0, 6).map((feat, fIdx) => (
                              <li
                                key={fIdx}
                                className="flex items-start gap-2.5 leading-snug"
                              >
                                <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-signal/12 text-signal">
                                  <IconCheck className="size-2.5 stroke-[2.5]" />
                                </span>
                                <span className="truncate">{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="mt-8 pt-4 border-t border-line">
                      <button
                        type="button"
                        onClick={() => handleSelectPlan(plan)}
                        disabled={!!loadingPlanId}
                        className={cx(
                          "flex h-11 w-full items-center justify-center gap-2 rounded-xl text-[13.5px] font-semibold transition-all duration-150 active:scale-[0.99] disabled:opacity-60 cursor-pointer select-none",
                          isHighlighted
                            ? "bg-signal text-white shadow-[0_2px_10px_rgba(10,110,80,0.3)] hover:bg-signal-deep hover:shadow-md"
                            : isCustom
                              ? "border-2 border-signal/50 bg-signal/5 text-signal hover:bg-signal hover:text-white transition-all shadow-xs"
                              : "border border-line bg-surface text-text hover:bg-surface-2 hover:border-line-soft shadow-2xs",
                        )}
                      >
                        {isLoading ? (
                          <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : isSelected ? (
                          <>
                            <IconCheck className="size-4" />
                            <span>
                              {t("Activating...", "অ্যাক্টিভ হচ্ছে...")}
                            </span>
                          </>
                        ) : isCustom ? (
                          <span>
                            {t("Contact Sales", "আমাদের সাথে যোগাযোগ করুন")}
                          </span>
                        ) : (
                          <span>
                            {isFree
                              ? t("Start Free", "ফ্রি শুরু করুন")
                              : t(
                                  `Choose ${plan.name}`,
                                  `${displayName} প্ল্যান নিন`,
                                )}
                          </span>
                        )}
                      </button>
                      <p className="mt-2 text-center text-[11px] text-text-3">
                        {isCustom
                          ? t(
                              "Tailored quota & dedicated SLA agreement",
                              "কাস্টম কোটা ও ডেডিকেটেড এন্টারপ্রাইজ সাপোর্ট",
                            )
                          : isFree
                            ? t(
                                "No credit card required · Free",
                                "কোনো কার্ড লাগবে না · চিরকাল ফ্রি",
                              )
                            : t(
                                "Instant activation · Cancel anytime",
                                "তাৎক্ষণিক অ্যাক্টিভেশন · পরিবর্তনযোগ্য",
                              )}
                      </p>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            setRedeemError(null);
                            setVerifiedPlan(null);
                            setRedeemCodeInput("");
                            setRedeemModalOpen(true);
                          }}
                          className="mt-2 w-full text-center text-xs font-semibold text-signal hover:underline cursor-pointer flex items-center justify-center gap-1"
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                          </svg>
                          <span>
                            {t(
                              "Have a Code? Redeem Here",
                              "কোড আছে? এখানে রিডিম করুন",
                            )}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Enterprise Callout */}
        <div className="mt-14 rounded-2xl border border-line bg-surface p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="rounded-md bg-text px-2 py-0.5 text-[10.5px] font-mono font-bold uppercase tracking-wider text-white">
              Enterprise Scale
            </span>
            <h3 className="mt-2 font-display text-[17px] font-bold text-text">
              {t(
                "Need high-volume scale or customized API integration?",
                "অধিক ভলিউম বা কাস্টম এপিআই ইন্টিগ্রেশন প্রয়োজন?",
              )}
            </h3>
            <p className="mt-0.5 text-[13px] text-text-3">
              {t(
                "We provide dedicated servers, custom fine-tuned models, and SLA agreements for large merchants.",
                "বড় মার্চেন্টদের জন্য ডেডিকেটেড সার্ভার, কাস্টম এআই মডেল এবং ২৪/৭ এসএলএ সুবিধা রয়েছে।",
              )}
            </p>
          </div>
          <div className="shrink-0 flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setRedeemError(null);
                setVerifiedPlan(null);
                setRedeemCodeInput("");
                setRedeemModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-signal/40 bg-signal/5 px-4 py-2.5 text-[13px] font-semibold text-signal hover:bg-signal/15 hover:border-signal transition-colors cursor-pointer"
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
              <span>{t("Redeem Plan Code", "প্ল্যান কোড রিডিম করুন")}</span>
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-[13px] font-medium text-text hover:bg-surface-3 transition-colors cursor-pointer"
            >
              {t("Contact Enterprise Team", "এন্টারপ্রাইজ টিমের সাথে কথা বলুন")}
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 border-t border-line pt-8 text-center">
          <div className="p-2">
            <span className="text-[18px]">🛡️</span>
            <p className="mt-1 text-[13px] font-semibold text-text">
              {t("No Hidden Fees", "কোনো লুকায়িত চার্জ নেই")}
            </p>
            <p className="text-[11.5px] text-text-3">
              {t("Pay only on closed orders", "শুধুমাত্র সফল অর্ডারে বিল")}
            </p>
          </div>
          <div className="p-2">
            <span className="text-[18px]">⚡</span>
            <p className="mt-1 text-[13px] font-semibold text-text">
              {t("Instant Setup", "তাৎক্ষণিক সেটআপ")}
            </p>
            <p className="text-[11.5px] text-text-3">
              {t("Ready in 30 seconds", "৩০ সেকেন্ডে কনসোল রেডি")}
            </p>
          </div>
          <div className="p-2">
            <span className="text-[18px]">🔄</span>
            <p className="mt-1 text-[13px] font-semibold text-text">
              {t("Cancel Anytime", "যেকোনো সময় পরিবর্তন")}
            </p>
            <p className="text-[11.5px] text-text-3">
              {t("Zero lock-in contracts", "কোনো চুক্তি বা বাধ্যবাধকতা নেই")}
            </p>
          </div>
          <div className="p-2">
            <span className="text-[18px]">💬</span>
            <p className="mt-1 text-[13px] font-semibold text-text">
              {t("24/7 Bangla Support", "২৪/৭ বাংলা সাপোর্ট")}
            </p>
            <p className="text-[11.5px] text-text-3">
              {t("Direct WhatsApp helpdesk", "হোয়াটসঅ্যাপ হেল্পডেস্ক")}
            </p>
          </div>
        </div>
        {/* Custom Plan Code Redemption & Payment Checkout Modal */}
        <AnimatePresence>
          {redeemModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4.5 border border-line"
              >
                {/* Modal Header */}
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
                        {verifiedPlan
                          ? t(
                              "Review Plan & Complete Payment",
                              "প্ল্যান পর্যালোচনা ও পেমেন্ট সম্পন্ন করুন",
                            )
                          : t(
                              "Redeem Custom Plan Code",
                              "কাস্টম প্ল্যান কোড রিডিম করুন",
                            )}
                      </h3>
                      <p className="text-[11.5px] text-text-3">
                        {verifiedPlan
                          ? t(
                              "Verify your enterprise package entitlements and finalize subscription",
                              "আপনার প্যাকেজের সুবিধাসমূহ দেখে সাবস্ক্রিপশন চালু করুন",
                            )
                          : t(
                              "Enter the activation license key provided by sales to view and activate your plan",
                              "সেলস থেকে প্রাপ্ত লাইসেন্স কোডটি দিন",
                            )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRedeemModalOpen(false);
                      setVerifiedPlan(null);
                      setRedeemError(null);
                    }}
                    className="rounded-lg p-1 text-text-3 hover:bg-surface-2 hover:text-text cursor-pointer"
                  >
                    <IconClose width={18} height={18} />
                  </button>
                </div>

                {!verifiedPlan ? (
                  /* Step 1: Input Code */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-text">
                        {t(
                          "Enterprise Activation Code",
                          "এন্টারপ্রাইজ এক্টিভেশন কোড",
                        )}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. ENTERPRIZE-6M-ABCD"
                          value={redeemCodeInput}
                          onChange={(e) => {
                            setRedeemCodeInput(e.target.value.toUpperCase());
                            setRedeemError(null);
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" &&
                              !verifyingCode &&
                              redeemCodeInput.trim()
                            ) {
                              e.preventDefault();
                              handleVerifyCode();
                            }
                          }}
                          className="flex-1 rounded-xl border border-line bg-surface-2/30 px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-text placeholder:normal-case placeholder:font-sans placeholder:text-text-3 focus:border-signal focus:bg-white focus:ring-2 focus:ring-signal/20 focus:outline-hidden"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleVerifyCode}
                          disabled={verifyingCode || !redeemCodeInput.trim()}
                          className="shrink-0 rounded-xl bg-signal px-4 py-2 text-xs font-semibold text-white hover:bg-signal-deep disabled:opacity-60 transition-colors cursor-pointer"
                        >
                          {verifyingCode
                            ? t("Checking...", "যাচাই হচ্ছে...")
                            : t("Verify Code", "যাচাই করুন")}
                        </button>
                      </div>
                      <p className="text-[11px] text-text-3">
                        {t(
                          "Enter the code given by sales to view your contract plan details and proceed to payment.",
                          "সেলস থেকে পাওয়া কোডটি প্রবেশ করালে আপনার প্ল্যানের বিস্তারিত ও পেমেন্ট অপশন দেখাবে।",
                        )}
                      </p>
                    </div>

                    {redeemError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-600 flex items-center gap-2">
                        <IconShield
                          width={15}
                          height={15}
                          className="shrink-0 text-red-500"
                        />
                        <span>{redeemError}</span>
                      </div>
                    )}

                    <div className="flex justify-end gap-2.5 pt-2 border-t border-line">
                      <button
                        type="button"
                        onClick={() => {
                          setRedeemModalOpen(false);
                          setRedeemError(null);
                        }}
                        className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer"
                      >
                        {t("Cancel", "বাতিল")}
                      </button>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={verifyingCode || !redeemCodeInput.trim()}
                        className="rounded-xl bg-signal px-4 py-2 text-xs font-semibold text-white hover:bg-signal-deep disabled:opacity-60 transition-colors cursor-pointer"
                      >
                        {verifyingCode
                          ? t("Verifying...", "যাচাই হচ্ছে...")
                          : t("Next: View Plan", "পরবর্তী: প্ল্যান দেখুন")}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Step 2: Display Verified Plan & Payment Checkout */
                  <div className="space-y-4">
                    {/* Plan Card Banner */}
                    <div className="rounded-2xl border border-signal/40 bg-gradient-to-br from-signal/10 via-[#edf7f3] to-white p-4.5 space-y-3.5 shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-2 w-2 rounded-full bg-signal animate-pulse" />
                            <h4 className="text-base font-bold font-display text-text">
                              {verifiedPlan.plan_name}
                            </h4>
                            <span className="rounded-md bg-signal text-white px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wider">
                              {verifiedPlan.duration_months || 1} Month
                              {(verifiedPlan.duration_months || 1) > 1
                                ? "s"
                                : ""}{" "}
                              Access
                            </span>
                          </div>
                          <div className="font-mono text-xs text-signal font-semibold mt-1">
                            Code: {verifiedPlan.code}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setVerifiedPlan(null);
                            setRedeemError(null);
                          }}
                          className="text-[11px] text-text-3 hover:text-signal underline cursor-pointer"
                        >
                          {t("Change Code", "কোড পরিবর্তন")}
                        </button>
                      </div>

                      {/* Pricing Breakdown */}
                      <div className="flex items-baseline gap-1.5 border-t border-signal/20 pt-3">
                        <span className="text-2xl font-black font-display text-text">
                          {(verifiedPlan.price_bdt || 0) > 0
                            ? `৳${(verifiedPlan.price_bdt || 0).toLocaleString("en-US")}`
                            : "৳0 Free"}
                        </span>
                        <span className="text-xs text-text-3 font-medium">
                          {(verifiedPlan.price_bdt || 0) > 0
                            ? `Total for ${verifiedPlan.duration_months || 1} month contract (≈ ৳${Math.round((verifiedPlan.price_bdt || 0) / Math.max(1, verifiedPlan.duration_months || 1)).toLocaleString()}/mo)`
                            : t("Complimentary Access", "ফ্রি এক্সেস")}
                        </span>
                      </div>

                      {/* Resource Entitlements */}
                      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
                        <div className="rounded-xl bg-white/90 border border-signal/20 p-2 text-center">
                          <div className="text-[10px] text-text-3 font-sans font-medium">
                            Stores Limit
                          </div>
                          <div className="font-bold text-text text-xs">
                            {verifiedPlan.max_stores || 1} Stores
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/90 border border-signal/20 p-2 text-center">
                          <div className="text-[10px] text-text-3 font-sans font-medium">
                            Team Seats
                          </div>
                          <div className="font-bold text-text text-xs">
                            {verifiedPlan.max_seats || 1} Seats
                          </div>
                        </div>
                        <div className="rounded-xl bg-white/90 border border-signal/20 p-2 text-center">
                          <div className="text-[10px] text-text-3 font-sans font-medium">
                            AI Messages
                          </div>
                          <div className="font-bold text-signal text-xs">
                            {(
                              verifiedPlan.message_limit || 50000
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Expiry date notice */}
                      {verifiedPlan.code_expiry && (
                        <div className="text-[11px] text-amber-700 bg-amber-50 rounded-lg p-2 border border-amber-200">
                          ⚠️ This activation code must be redeemed by{" "}
                          <strong>{verifiedPlan.code_expiry}</strong>.
                        </div>
                      )}
                    </div>

                    {/* Step 3: Payment Method Selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-text">
                        {(verifiedPlan.price_bdt || 0) > 0
                          ? t(
                              "Select Payment Method",
                              "পেমেন্ট মাধ্যম নির্বাচন করুন",
                            )
                          : t("Activation Verification", "ভেরিফিকেশন")}
                      </label>
                      {(verifiedPlan.price_bdt || 0) > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            {
                              id: "bKash Auto-Debit",
                              label: "bKash",
                              tag: "Popular",
                              color:
                                "border-pink-500/40 text-pink-700 bg-pink-500/5",
                            },
                            {
                              id: "Nagad Instant",
                              label: "Nagad",
                              tag: "Instant",
                              color:
                                "border-orange-500/40 text-orange-700 bg-orange-500/5",
                            },
                            {
                              id: "Card / Net Banking",
                              label: "Card / Bank",
                              tag: "Online",
                              color:
                                "border-blue-500/40 text-blue-700 bg-blue-500/5",
                            },
                          ].map((m) => {
                            const isSelected = selectedPaymentMethod === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedPaymentMethod(m.id)}
                                className={cx(
                                  "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                                  isSelected
                                    ? "border-signal bg-signal/10 ring-1.5 ring-signal shadow-xs"
                                    : "border-line bg-surface-1 hover:border-signal/40",
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-text">
                                    {m.label}
                                  </span>
                                  <span
                                    className={cx(
                                      "text-[9px] font-mono px-1 py-0.5 rounded",
                                      m.color,
                                    )}
                                  >
                                    {m.tag}
                                  </span>
                                </div>
                                <span className="text-[10px] text-text-3 mt-1">
                                  {isSelected ? "● Selected" : "○ Choose"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                          <IconCheck
                            width={14}
                            height={14}
                            className="text-emerald-600"
                          />
                          <span>
                            {t(
                              "Complimentary code approved by sales. No payment needed.",
                              "ফ্রি কোড অনুমোদিত। কোনো পেমেন্ট প্রয়োজন নেই।",
                            )}
                          </span>
                        </div>
                      )}
                    </div>

                    {redeemError && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 flex items-center gap-2">
                        <IconShield
                          width={14}
                          height={14}
                          className="shrink-0 text-red-500"
                        />
                        <span>{redeemError}</span>
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="flex justify-between items-center pt-2 border-t border-line">
                      <button
                        type="button"
                        onClick={() => {
                          setVerifiedPlan(null);
                          setRedeemError(null);
                        }}
                        className="text-xs text-text-3 hover:text-text font-medium cursor-pointer"
                      >
                        {t("← Back to Code", "← কোড পরিবর্তন")}
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setRedeemModalOpen(false);
                            setVerifiedPlan(null);
                            setRedeemError(null);
                          }}
                          disabled={redeemLoading}
                          className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer"
                        >
                          {t("Cancel", "বাতিল")}
                        </button>
                        <button
                          type="button"
                          onClick={handleRedeemCode}
                          disabled={redeemLoading}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-4 py-2 text-xs font-bold text-white hover:bg-signal-deep disabled:opacity-60 transition-all cursor-pointer shadow-xs"
                        >
                          {redeemLoading ? (
                            t(
                              "Processing Payment & Activating...",
                              "পেমেন্ট ও সক্রিয়করণ হচ্ছে...",
                            )
                          ) : (
                            <>
                              <IconCheck width={15} height={15} />
                              <span>
                                {(verifiedPlan.price_bdt || 0) > 0
                                  ? `${t("Pay", "পে করুন")} ৳${(verifiedPlan.price_bdt || 0).toLocaleString("en-US")} & ${t("Activate", "অ্যাক্টিভ করুন")}`
                                  : t(
                                      "Confirm & Activate Plan Free",
                                      "ফ্রিতে প্ল্যান চালু করুন",
                                    )}
                              </span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Downgrade & Capacity Conflict Reconciliation Modal */}
        <DowngradeReconcileModal
          isOpen={reconcileModalOpen}
          onClose={() => {
            setReconcileModalOpen(false);
            setPendingPlan(null);
            setReconcileConflictData(null);
          }}
          conflictData={reconcileConflictData}
          billingCycle={isYearly ? "yearly" : "monthly"}
          onConfirm={handleConfirmReconciliation}
          isSubmitting={isSubmittingReconcile}
        />
      </main>
    </div>
  );
}

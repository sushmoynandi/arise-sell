"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/ui/primitives";
import LanguageToggle from "@/components/marketing/LanguageToggle";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api-client";
import { bdt, cx } from "@/lib/format";
import { IconCheck, IconLogOut, IconSpark } from "@/components/ui/icons";

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
  const [error, setError] = useState<string | null>(null);

  // Fetch 4 active plans directly from backend API
  useEffect(() => {
    let active = true;
    async function fetchPlans() {
      try {
        const res = await api.billing.listPlans();
        if (active && Array.isArray(res) && res.length > 0) {
          setPlans(res as BackendPlan[]);
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
    setError(null);
    setLoadingPlanId(plan.id);
    setSelectedPlanId(plan.id);

    try {
      const res = await selectPlan(plan.id, isYearly ? "yearly" : "monthly");
      if (res.success) {
        // Immediate redirection into the merchant console
        router.push("/console");
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
              {plans.map((plan, index) => {
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
                        <span className="font-display text-[34px] sm:text-[38px] font-extrabold tracking-tight text-text">
                          {isFree
                            ? lang === "bn"
                              ? "৳০"
                              : "৳0"
                            : bdt(priceVal)}
                        </span>
                        <span className="text-[12.5px] font-medium text-text-3">
                          {isFree
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
                            {plan.messageLimit?.toLocaleString("en-IN") || 200}{" "}
                            {t("limit", "টি")}
                          </span>
                        </div>
                        {plan.catalogLimit && plan.catalogLimit > 0 && (
                          <div className="flex items-center justify-between text-[12px] border-t border-line/60 pt-1.5">
                            <span className="text-text-3">
                              {t("Catalog Items", "ক্যাটালগ পণ্য")}
                            </span>
                            <span className="font-mono font-semibold text-text-2">
                              {plan.catalogLimit.toLocaleString("en-IN")}{" "}
                              {t("products", "টি")}
                            </span>
                          </div>
                        )}
                        {plan.courierChannels && plan.courierChannels > 0 && (
                          <div className="flex items-center justify-between text-[12px] border-t border-line/60 pt-1.5">
                            <span className="text-text-3">
                              {t("Courier Channels", "কুরিয়ার চ্যানেল")}
                            </span>
                            <span className="font-mono font-semibold text-text-2">
                              {plan.courierChannels} {t("channels", "টি")}
                            </span>
                          </div>
                        )}
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
                        {isFree
                          ? t(
                              "No credit card required · Free",
                              "কোনো কার্ড লাগবে না · চিরকাল ফ্রি",
                            )
                          : t(
                              "Instant activation · Cancel anytime",
                              "তাৎক্ষণিক অ্যাক্টিভেশন · পরিবর্তনযোগ্য",
                            )}
                      </p>
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
          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center justify-center rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-[13px] font-medium text-text hover:bg-surface-3 transition-colors cursor-pointer"
          >
            {t("Contact Enterprise Team", "এন্টারপ্রাইজ টিমের সাথে কথা বলুন")}
          </Link>
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
      </main>
    </div>
  );
}

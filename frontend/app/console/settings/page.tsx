"use client";

import { useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cx } from "@/lib/format";
import { TABS, type TabId } from "./types";
import { TAB_ICONS } from "./components";
import { SettingsProvider, useSettings } from "./settings-context";
import {
  TabBusiness,
  TabAccount,
  TabBranding,
  TabInvoice,
  TabWebsiteOrders,
  TabCourier,
  TabMeta,
  TabProductFeed,
  TabNotifications,
  TabBilling,
} from "./tabs";

/* ─── Inner Component ─── */
function SettingsInner() {
  const { settings } = useSettings();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");
  const activeTab: TabId = useMemo(() => {
    if (rawTab === "team") return "account";
    if (rawTab === "preferences") return "business";
    if (TABS.some((t) => t.id === rawTab)) return rawTab as TabId;
    return "business";
  }, [rawTab]);

  useEffect(() => {
    if (rawTab === "preferences") {
      router.replace("/console/brain");
    }
  }, [rawTab, router]);

  const switchTab = (id: TabId) => {
    router.replace(`/console/settings?tab=${id}`, { scroll: false });
  };

  return (
    <>
      {/* ─── Floating Glassy Options Container (No full-width navbar background) ─── */}
      <div className="sticky top-[72px] z-20 pt-3 pb-1.5 transition-all pointer-events-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          {/* Frosted Glass Pill Capsule directly under the options */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-white/85 dark:bg-surface/85 backdrop-blur-xl border border-line/75 shadow-[0_2px_12px_rgba(0,0,0,0.035)] ring-1 ring-black/[0.02] w-full">
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={cx(
                    "relative shrink-0 cursor-pointer h-8.5 px-3 text-[12.5px] font-medium transition-colors rounded-[11px] whitespace-nowrap flex items-center justify-center gap-2 select-none group flex-1",
                    isActive
                      ? "text-signal font-semibold"
                      : "text-text-3 hover:text-text",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settings-active-glass-pill"
                      className="absolute inset-0 rounded-[11px] bg-white shadow-xs border border-line/75 ring-1 ring-black/[0.03] dark:bg-surface-2 dark:border-line"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                        mass: 0.7,
                      }}
                    />
                  )}
                  <span
                    className={cx(
                      "relative z-10 transition-colors shrink-0 flex items-center",
                      isActive
                        ? "text-signal"
                        : "text-text-3 group-hover:text-text",
                    )}
                  >
                    {Icon && <Icon className="size-[15px] shrink-0" />}
                  </span>
                  <span className="relative z-10 tracking-tight">
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Tab Content (Smooth Fade & Subtle Elevation) ─── */}
      <div className="pt-2 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === "business" && (
              <TabBusiness
                key={settings.slug || (settings.name ? "biz" : "create-store")}
              />
            )}
            {activeTab === "account" && (
              <TabAccount
                key={settings.slug || (settings.name ? "acc" : "no-store-acc")}
              />
            )}
            {activeTab === "branding" && (
              <TabBranding key={settings.slug || "brand"} />
            )}
            {activeTab === "invoice" && (
              <TabInvoice key={settings.slug || "inv"} />
            )}
            {activeTab === "website-orders" && (
              <TabWebsiteOrders key={settings.slug || "web"} />
            )}
            {activeTab === "courier" && (
              <TabCourier key={settings.slug || "cour"} />
            )}
            {activeTab === "meta" && <TabMeta key={settings.slug || "meta"} />}
            {activeTab === "product-feed" && (
              <TabProductFeed key={settings.slug || "feed"} />
            )}
            {activeTab === "notifications" && (
              <TabNotifications key={settings.slug || "notif"} />
            )}
            {activeTab === "billing" && (
              <TabBilling key={settings.slug || "bill"} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─── Page Export ─── */
export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32 text-text-3 text-sm">
          Loading settings…
        </div>
      }
    >
      <SettingsProvider>
        <SettingsInner />
      </SettingsProvider>
    </Suspense>
  );
}

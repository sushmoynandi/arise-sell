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
      {/* ─── Frosted Glass Segmented Control Navigation Bar ─── */}
      <div className="sticky top-[72px] z-20 border-b border-line/60 bg-surface/80 backdrop-blur-xl shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          {/* Glass Segmented Pill Container */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-canvas/50 border border-line/60 shadow-2xs backdrop-blur-md w-full">
            {TABS.map((tab) => {
              const Icon = TAB_ICONS[tab.id];
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={cx(
                    "relative shrink-0 xl:shrink cursor-pointer px-2.5 py-1.5 text-[11.5px] font-medium transition-all rounded-xl whitespace-nowrap flex items-center justify-center gap-1.5 select-none group flex-1",
                    isActive
                      ? "text-signal font-semibold"
                      : "text-text-3 hover:text-text hover:bg-surface-2/50",
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="settings-active-glass-pill"
                      className="absolute inset-0 rounded-xl bg-white shadow-xs border border-line/60 ring-1 ring-black/5 dark:bg-surface-2 dark:border-line"
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.35,
                      }}
                    />
                  )}
                  <span
                    className={cx(
                      "relative z-10 transition-colors",
                      isActive
                        ? "text-signal"
                        : "text-text-3 group-hover:text-text",
                    )}
                  >
                    {Icon && <Icon className="size-3.5 shrink-0" />}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "business" && (
              <TabBusiness key={settings.slug || "biz"} />
            )}
            {activeTab === "account" && (
              <TabAccount key={settings.slug || "acc"} />
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

"use client";

import { useMemo, useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cx } from "@/lib/format";
import { TABS, type TabId } from "./types";
import { TAB_ICONS } from "./components";
import { SettingsProvider, useSettings } from "./settings-context";
import { useAuth } from "@/lib/auth-context";
import { api, type StoreWorkspace } from "@/lib/api-client";
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
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");

  // Fetch workspaces to determine current active store role and granular permissions
  const [workspaces, setWorkspaces] = useState<StoreWorkspace[]>([]);
  const [loadedWorkspaces, setLoadedWorkspaces] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.merchants
      .getMyStores()
      .then((res) => {
        if (mounted && Array.isArray(res)) {
          setWorkspaces(res as StoreWorkspace[]);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoadedWorkspaces(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const activeWorkspace = workspaces.find((w) => w.is_active) || workspaces[0];
  const isOwner = activeWorkspace
    ? activeWorkspace.is_owner
    : Boolean(user?.is_superadmin || user?.role === "owner");
  const perms = useMemo(
    () => activeWorkspace?.permissions || [],
    [activeWorkspace?.permissions],
  );

  // Granular Tab Permission Guard
  const isTabAuthorized = useCallback(
    (tabId: TabId): boolean => {
      if (isOwner) return true;

      // Billing is strictly Store Owner only
      if (tabId === "billing") {
        return false;
      }

      // Account tab is available to every authenticated user (personal credentials, password, 2FA, sessions)
      if (tabId === "account") {
        return true;
      }

      if (perms.includes("all")) return true;

      // Explicit settings module permission e.g. "settings:website-orders"
      if (perms.includes(`settings:${tabId}`)) return true;

      // Legacy aliases
      if (tabId === "invoice" && perms.includes("invoices")) return true;
      if (tabId === "courier" && perms.includes("courier")) return true;

      // Only if teammate has broad "/console/settings" access and has NO specific settings:* restrictions
      const hasAnySpecificSettings = perms.some((p) =>
        p.startsWith("settings:"),
      );
      if (
        !hasAnySpecificSettings &&
        (perms.includes("/console/settings") || perms.includes("settings"))
      ) {
        return true;
      }

      return false;
    },
    [isOwner, perms],
  );

  // Allowed tabs for this user
  const visibleTabs = useMemo(() => {
    if (!loadedWorkspaces) {
      if (user && user.role !== "owner" && !user.is_superadmin) {
        return TABS.filter((t) => t.id === "account");
      }
      return TABS;
    }
    return TABS.filter((t) => isTabAuthorized(t.id));
  }, [loadedWorkspaces, user, isTabAuthorized]);

  const activeTab: TabId = useMemo(() => {
    if (rawTab === "team") return "account";
    if (rawTab === "preferences") return "business";
    if (TABS.some((t) => t.id === rawTab)) return rawTab as TabId;
    return visibleTabs[0]?.id || "business";
  }, [rawTab, visibleTabs]);

  useEffect(() => {
    if (rawTab === "preferences") {
      router.replace("/console/brain");
    }
  }, [rawTab, router]);

  // If activeTab is unauthorized, immediately redirect to first authorized tab
  useEffect(() => {
    if (!loadedWorkspaces) return;

    if (visibleTabs.length > 0) {
      const isAllowed = visibleTabs.some((t) => t.id === activeTab);
      if (!isAllowed) {
        router.replace(`/console/settings?tab=${visibleTabs[0].id}`, {
          scroll: false,
        });
      }
    }
  }, [loadedWorkspaces, visibleTabs, activeTab, router]);

  const switchTab = (id: TabId) => {
    router.replace(`/console/settings?tab=${id}`, { scroll: false });
  };

  // If teammate has NO access to any settings tabs at all
  if (loadedWorkspaces && visibleTabs.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-line bg-surface p-6 sm:p-8 text-center shadow-lg space-y-4">
          <div className="mx-auto size-12 rounded-2xl bg-amber-500/10 text-amber-600 grid place-items-center text-2xl border border-amber-500/20">
            🔒
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-text font-display">
              Access Restricted
            </h3>
            <p className="text-xs sm:text-[13px] text-text-3 leading-relaxed">
              You do not have permission to access Settings in{" "}
              <strong className="text-text">
                {activeWorkspace?.name || "this store"}
              </strong>
              . Please contact the store owner (
              {activeWorkspace?.owner_name || "Store Owner"}) to request access.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/console/inbox"
              className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-4 py-2 text-xs font-semibold text-white hover:bg-signal/90 transition-all shadow-xs cursor-pointer"
            >
              Go to Accessible Section
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ─── Floating Glassy Options Container (Only authorized tabs) ─── */}
      <div className="sticky top-[72px] z-20 pt-3 pb-1.5 transition-all pointer-events-none">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pointer-events-auto">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-white/85 dark:bg-surface/85 backdrop-blur-xl border border-line/75 shadow-[0_2px_12px_rgba(0,0,0,0.035)] ring-1 ring-black/[0.02] w-full">
            {visibleTabs.map((tab) => {
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
            {activeTab === "business" && isTabAuthorized("business") && (
              <TabBusiness
                key={settings.slug || (settings.name ? "biz" : "create-store")}
              />
            )}
            {activeTab === "account" && isTabAuthorized("account") && (
              <TabAccount
                key={settings.slug || (settings.name ? "acc" : "no-store-acc")}
                isStoreOwner={isOwner}
                planName={activeWorkspace?.plan || settings?.plan}
              />
            )}
            {activeTab === "branding" && isTabAuthorized("branding") && (
              <TabBranding key={settings.slug || "brand"} />
            )}
            {activeTab === "invoice" && isTabAuthorized("invoice") && (
              <TabInvoice key={settings.slug || "inv"} />
            )}
            {activeTab === "website-orders" &&
              isTabAuthorized("website-orders") && (
                <TabWebsiteOrders key={settings.slug || "web"} />
              )}
            {activeTab === "courier" && isTabAuthorized("courier") && (
              <TabCourier key={settings.slug || "cour"} />
            )}
            {activeTab === "meta" && isTabAuthorized("meta") && (
              <TabMeta key={settings.slug || "meta"} />
            )}
            {activeTab === "product-feed" &&
              isTabAuthorized("product-feed") && (
                <TabProductFeed key={settings.slug || "feed"} />
              )}
            {activeTab === "notifications" &&
              isTabAuthorized("notifications") && (
                <TabNotifications key={settings.slug || "notif"} />
              )}
            {activeTab === "billing" && isTabAuthorized("billing") && (
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

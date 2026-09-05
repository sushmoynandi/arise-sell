"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONSOLE_NAV } from "@/lib/brand";
import { TENANT, TEAM } from "@/data/tenant";
import { Avatar, Wordmark } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import api, { type StoreWorkspace, type BillingPlan } from "@/lib/api-client";
import {
  NAV_ICON,
  IconBell,
  IconBot,
  IconChevronUp,
  IconClose,
  IconLogOut,
  IconMenu,
  IconSearch,
  IconSettings,
  IconShield,
  IconSpark,
  IconTruck,
  IconUsers,
} from "@/components/ui/icons";
import LanguageToggle from "@/components/marketing/LanguageToggle";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  type: "admin" | "system" | "courier";
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "Admin Announcement: Maintenance Scheduled",
    body: "Infrastructure upgrade tonight at 3:00 AM. AI automated order booking will remain active without downtime.",
    time: "20m ago",
    unread: true,
    type: "admin",
  },
  {
    id: "n2",
    title: "Steadfast Courier API v2.4 Active",
    body: "Automated 1-click parcel generation & 24h COD instant payout tracking now enabled for your account.",
    time: "2h ago",
    unread: true,
    type: "courier",
  },
  {
    id: "n3",
    title: "Catalog Synced Successfully",
    body: "6 products and 18 variants vision-indexed for screenshot matching.",
    time: "Yesterday",
    unread: false,
    type: "system",
  },
];

const CONSOLE_GROUP_LABELS: Record<string, string> = {
  OPERATIONS: "অপারেশনস",
  "GROWTH & AUTOMATION": "গ্রোথ ও অটোমেশন",
  "AI SALES ENGINE": "এআই সেলস ইঞ্জিন",
};

const CONSOLE_ITEM_LABELS: Record<string, string> = {
  Dashboard: "ড্যাশবোর্ড",
  Inbox: "ইনবক্স",
  Comments: "কমেন্টস",
  Orders: "অর্ডারস",
  "Leads & Pipeline": "লিডস ও পাইপলাইন",
  Campaigns: "ক্যাম্পেইনস",
  "Automation Tools": "অটোমেশন টুলস",
  Integrations: "ইন্টিগ্রেশনস",
  Products: "প্রোডাক্টস",
  "Knowledge Base": "নলেজ বেস",
  "AI Playground": "এআই প্লেগ্রাউন্ড",
  "Team Members": "টিম মেম্বারস",
};

function hasPermission(
  permissions: string[] | undefined,
  isOwner: boolean,
  targetHref: string,
): boolean {
  if (isOwner) return true;
  if (!permissions || permissions.length === 0) return false;
  if (permissions.includes("all")) return true;
  if (permissions.includes(targetHref)) return true;

  // Aliases & Legacy Mappings
  if (
    (permissions.includes("chat") || permissions.includes("/console/inbox")) &&
    (targetHref === "/console/inbox" || targetHref === "/console/comments")
  ) {
    return true;
  }
  if (
    (permissions.includes("orders") ||
      permissions.includes("/console/orders")) &&
    (targetHref === "/console/orders" || targetHref === "/console/pipeline")
  ) {
    return true;
  }
  if (
    (permissions.includes("catalog") ||
      permissions.includes("/console/products")) &&
    targetHref === "/console/products"
  ) {
    return true;
  }
  if (
    (permissions.includes("settings") ||
      permissions.includes("/console/settings") ||
      permissions.some((p) => p.startsWith("settings:"))) &&
    (targetHref === "/console/settings" ||
      targetHref.startsWith("/console/settings") ||
      targetHref === "/console/team")
  ) {
    return true;
  }

  return false;
}

function NavList({
  collapsed,
  onNavigate,
  expandedGroups,
  onToggleGroup,
  permissions,
  isOwner = true,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (group: string) => void;
  permissions?: string[];
  isOwner?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, t } = useLang();
  const navTextClass =
    lang === "en"
      ? "text-[12.5px] sm:text-[13px]"
      : "text-[13px] sm:text-[13.5px]";

  return (
    <nav className="space-y-6">
      {CONSOLE_NAV.map((group) => {
        const visibleItems = group.items.filter((item) =>
          hasPermission(permissions, isOwner, item.href),
        );
        if (visibleItems.length === 0) return null;

        const isOpen = expandedGroups[group.group] ?? true;

        return (
          <div key={group.group}>
            {!collapsed && (
              <button
                type="button"
                onClick={() => onToggleGroup(group.group)}
                className="flex w-full items-center gap-2 px-4 pb-1.5 text-left select-none transition-colors hover:text-text"
              >
                <span className="size-2 rounded-full bg-signal ring-2 ring-signal/20 shrink-0" />
                <p
                  className={cx(
                    "flex-1 uppercase font-bold tracking-wide text-text",
                    lang === "en"
                      ? "text-[12px] sm:text-[12.5px]"
                      : "text-[12.5px] sm:text-[13px] font-[family-name:var(--font-hind)]",
                  )}
                >
                  {t(group.group, CONSOLE_GROUP_LABELS[group.group])}
                </p>
                <IconChevronUp
                  width={12}
                  height={12}
                  className={cx(
                    "text-text-3 transition-transform duration-150",
                    isOpen ? "rotate-0" : "-rotate-180",
                  )}
                />
              </button>
            )}
            {isOpen && (
              <ul className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = NAV_ICON[item.icon as keyof typeof NAV_ICON];
                  const active =
                    pathname === item.href ||
                    (item.href === "/console/inbox" &&
                      pathname === "/console/threads") ||
                    (item.href === "/console/orders" &&
                      pathname === "/console/fulfilment") ||
                    (item.href === "/console/campaigns" &&
                      pathname === "/console/reach" &&
                      !searchParams.get("tab")) ||
                    (item.href === "/console/comments" &&
                      (pathname === "/console/comments" ||
                        (pathname === "/console/reach" &&
                          searchParams.get("tab") === "comments"))) ||
                    (item.href === "/console/automation" &&
                      pathname === "/console/signals") ||
                    (item.href === "/console/products" &&
                      pathname === "/console/catalog") ||
                    (item.href === "/console/playground" &&
                      pathname === "/console/test-ai") ||
                    (item.href === "/console/team" &&
                      pathname === "/console/team") ||
                    (item.href.includes("/console/settings?tab=account") &&
                      pathname === "/console/settings" &&
                      searchParams.get("tab") === "account");
                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        prefetch={true}
                        onMouseEnter={() => router.prefetch(item.href)}
                        onClick={onNavigate}
                        title={
                          collapsed ? `${item.label} — ${item.hint}` : undefined
                        }
                        className={cx(
                          "group relative flex items-center rounded-xl transition-all duration-100 cursor-pointer select-none",
                          navTextClass,
                          collapsed
                            ? "mx-auto h-11 w-11 justify-center px-0 py-0"
                            : "gap-2.5 px-3.5 py-2",
                          active
                            ? "bg-[#eaf5ef] text-signal font-bold shadow-[inset_0_0_0_1px_rgba(10,110,80,0.12)] ring-1 ring-signal/10"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-medium",
                          lang === "bn" &&
                            "font-[family-name:var(--font-hind)]",
                        )}
                      >
                        <Icon
                          width={collapsed ? 18 : 18.5}
                          height={collapsed ? 18 : 18.5}
                          className={cx(
                            "shrink-0 transition-transform duration-100 group-hover:scale-105",
                            active
                              ? "text-signal"
                              : "text-text-3 group-hover:text-text",
                          )}
                        />
                        {!collapsed && (
                          <>
                            <span
                              className={cx(
                                "flex-1 truncate",
                                lang === "bn" &&
                                  "font-[family-name:var(--font-hind)]",
                              )}
                            >
                              {t(
                                item.label,
                                CONSOLE_ITEM_LABELS[item.label] ?? item.label,
                              )}
                            </span>
                            {item.label === "Team Members" && isOwner && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  router.push("/console/team?invite=true");
                                  onNavigate?.();
                                }}
                                title={
                                  lang === "bn"
                                    ? "ইনভাইট করুন"
                                    : "Invite member"
                                }
                                className="opacity-0 group-hover:opacity-100 transition-opacity rounded px-1.5 py-0.5 text-[10px] font-bold bg-signal/15 text-signal hover:bg-signal hover:text-white"
                              >
                                + Invite
                              </button>
                            )}
                            {"badge" in item && item.badge && (
                              <span
                                className={cx(
                                  "rounded-md px-1.5 py-0.5 font-mono text-[9.5px] font-bold",
                                  item.badge === "BETA"
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "bg-signal/15 text-signal",
                                )}
                              >
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                        {collapsed && "badge" in item && item.badge && (
                          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-signal" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}

const SECTION_TITLES: Record<string, string> = {
  "/console": "Dashboard",
  "/console/inbox": "Inbox",
  "/console/threads": "Inbox",
  "/console/comments": "Comments",
  "/console/orders": "Orders",
  "/console/fulfilment": "Orders",
  "/console/pipeline": "Leads & Pipeline",
  "/console/campaigns": "Campaigns",
  "/console/reach": "Campaigns",
  "/console/automation": "Automation Tools",
  "/console/signals": "Automation Tools",
  "/console/products": "Products",
  "/console/catalog": "Products",
  "/console/brain": "Knowledge Base",
  "/console/playground": "AI Playground",
  "/console/test-ai": "AI Playground",
  "/console/integrations": "Integrations",
  "/console/settings": "Settings",
  "/console/team": "Team Members",
};

const SECTION_TITLES_BN: Record<string, string> = {
  "/console": "ড্যাশবোর্ড",
  "/console/inbox": "ইনবক্স",
  "/console/threads": "ইনবক্স",
  "/console/comments": "কমেন্টস",
  "/console/orders": "অর্ডারস",
  "/console/fulfilment": "অর্ডারস",
  "/console/pipeline": "লিডস ও পাইপলাইন",
  "/console/campaigns": "ক্যাম্পেইনস",
  "/console/reach": "ক্যাম্পেইনস",
  "/console/automation": "অটোমেশন টুলস",
  "/console/signals": "অটোমেশন টুলস",
  "/console/products": "প্রোডাক্টস",
  "/console/catalog": "প্রোডাক্টস",
  "/console/brain": "নলেজ বেস",
  "/console/playground": "এআই প্লেগ্রাউন্ড",
  "/console/test-ai": "এআই প্লেগ্রাউন্ড",
  "/console/integrations": "ইন্টিগ্রেশনস",
  "/console/settings": "সেটিংস",
  "/console/team": "টিম মেম্বারস",
};

function getQuotaTone(remainingPct: number) {
  if (remainingPct <= 15) {
    return {
      dot: "bg-rose-500 ring-rose-500/25",
      text: "text-rose-600 dark:text-rose-400",
      badge:
        "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20",
      border: "border-rose-500/30 hover:border-rose-500/60 bg-rose-500/[0.04]",
      bar: "bg-rose-500",
      status: "Critical (<15% left)",
    };
  }
  if (remainingPct <= 30) {
    return {
      dot: "bg-amber-500 ring-amber-500/25",
      text: "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20",
      border:
        "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/[0.04]",
      bar: "bg-amber-500",
      status: "Low Quota (15-30% left)",
    };
  }
  return {
    dot: "bg-emerald-500 ring-emerald-500/25",
    text: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/15",
    border: "border-line hover:border-emerald-500/40 bg-surface",
    bar: "bg-emerald-500",
    status: "Healthy Balance",
  };
}

interface SetupTaskItem {
  id: string;
  title: string;
  hint: string;
  href: string;
  completed?: boolean;
}

const DEFAULT_SETUP_TASKS: SetupTaskItem[] = [
  {
    id: "courier",
    title: "Connect Courier API",
    hint: "Steadfast / Pathao for auto parcel booking",
    href: "/console/settings?tab=courier",
    completed: false,
  },
  {
    id: "persona",
    title: "Train AI Sales Persona",
    hint: "Store voice, catalog FAQ & discount limits",
    href: "/console/brain",
    completed: false,
  },
  {
    id: "business",
    title: "Store & Contact Details",
    hint: "Contact number, address & return policy",
    href: "/console/settings?tab=business",
    completed: true,
  },
];

function ConsoleShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const { user, loading, isAuthenticated, logout } = useAuth();

  // Dynamic Store Workspaces (Multi-Store & Teammate Workspaces)
  const [workspaces, setWorkspaces] = useState<StoreWorkspace[]>([]);
  const [switchingStoreId, setSwitchingStoreId] = useState<string | null>(null);

  const handleSwitchWorkspace = async (storeId: string) => {
    try {
      setSwitchingStoreId(storeId);
      await api.merchants.switchStore(storeId);
      setStoreDropdownOpen(false);
      window.location.reload();
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to switch store workspace",
      );
      setSwitchingStoreId(null);
    }
  };

  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const handleCreateDefaultStore = async () => {
    if (isCreatingStore) return;
    try {
      setIsCreatingStore(true);
      await api.merchants.quickCreateStore();
      setStoreDropdownOpen(false);
      window.location.assign("/console");
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to create store. Please try again.",
      );
      setIsCreatingStore(false);
    }
  };

  const handleToggleActiveStore = async (storeId: string) => {
    try {
      const res = await api.merchants.toggleStoreFreeze(storeId);
      if (res.success) {
        window.location.reload();
      }
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to toggle store status.",
      );
    }
  };

  const activeWorkspace = workspaces.find((w) => w.is_active) || workspaces[0];
  const ownedWorkspaces = useMemo(
    () => workspaces.filter((w) => w.is_owner),
    [workspaces],
  );
  const teammateWorkspaces = useMemo(
    () => workspaces.filter((w) => !w.is_owner),
    [workspaces],
  );
  const isOwner = activeWorkspace
    ? Boolean(activeWorkspace.is_owner)
    : Boolean(user?.is_superadmin || user?.role === "owner");
  const isTeammateInActiveStore = activeWorkspace
    ? !activeWorkspace.is_owner
    : false;
  const perms = activeWorkspace?.permissions || [];

  // Role-based classification
  const rawRole = (user?.role || "admin").toLowerCase();
  const isSuperadmin = Boolean(user?.is_superadmin || rawRole === "superadmin");
  const isAdminOrOwner = isSuperadmin || isOwner;

  const roleLabel = isSuperadmin
    ? "Superadmin"
    : isOwner
      ? "Store Owner"
      : activeWorkspace?.role ||
        (rawRole === "admin"
          ? "Store Manager"
          : rawRole.charAt(0).toUpperCase() + rawRole.slice(1));

  const roleBadgeColor = isSuperadmin
    ? "bg-signal/15 text-signal"
    : isOwner
      ? "bg-sky-500/15 text-sky-700 dark:text-sky-400"
      : "bg-amber-500/15 text-amber-700 dark:text-amber-400";

  const canManageNotifications =
    isOwner ||
    perms.includes("all") ||
    perms.includes("settings:notifications") ||
    (!perms.some((p) => p.startsWith("settings:")) &&
      (perms.includes("/console/settings") || perms.includes("settings")));

  // Dynamic Setup Checklist from backend
  const [setupChecklist, setSetupChecklist] = useState<{
    total: number;
    completed: number;
    is_complete: boolean;
    tasks: SetupTaskItem[];
  }>({
    total: 3,
    completed: 1,
    is_complete: false,
    tasks: DEFAULT_SETUP_TASKS,
  });

  const pendingSetupTasks = setupChecklist.tasks.filter((t) => !t.completed);
  const hasSetupRequired = Boolean(
    isAdminOrOwner &&
    !setupChecklist.is_complete &&
    pendingSetupTasks.length > 0,
  );

  // Dynamic Tenant Info
  const [tenantInfo, setTenantInfo] = useState({
    name: "Nokshi & Co.",
    plan: "Pro",
    maxStores: 1,
    messagesUsed: 23,
    messagesQuota: 500,
    remainingQuota: 477,
    remainingPercent: 95,
  });

  // Dynamic Subscription Plans from database
  const [dynamicPlans, setDynamicPlans] = useState<BillingPlan[]>([]);

  const activeStoreName =
    activeWorkspace?.name || tenantInfo.name || TENANT.name;
  const activeStoreInitial = (activeStoreName || "S").charAt(0).toUpperCase();
  const activeStorePlan =
    activeWorkspace?.plan || tenantInfo.plan || TENANT.plan;

  const maxAllowedStores = useMemo(() => {
    let max = 1;

    // 1. Check owned workspaces (each workspace carries dynamic maxStores from database)
    for (const w of ownedWorkspaces) {
      const storeLimit = w.maxStores ?? w.max_stores;
      if (storeLimit && storeLimit > max) max = storeLimit;
    }

    // 2. Check tenantInfo.maxStores from backend getProfile()
    if (tenantInfo.maxStores && tenantInfo.maxStores > max) {
      max = tenantInfo.maxStores;
    }

    // 3. Match against dynamic database plans loaded from /billing/plans
    const planKey = (activeStorePlan || tenantInfo.plan || "")
      .toLowerCase()
      .trim();
    if (dynamicPlans && dynamicPlans.length > 0) {
      const matched = dynamicPlans.find(
        (p) =>
          p.name.toLowerCase() === planKey ||
          p.id.toLowerCase() === planKey ||
          planKey.includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(planKey),
      );
      if (matched && matched.maxStores && matched.maxStores > max) {
        max = matched.maxStores;
      }
    }

    // 4. Robust fallback keyword matching (Enterprize, Enterprise, Scale, Custom, Business)
    if (max <= 1) {
      if (
        planKey.includes("enter") ||
        planKey.includes("scale") ||
        planKey.includes("custom") ||
        planKey.includes("vip")
      ) {
        max = 4;
      } else if (planKey.includes("business") || planKey.includes("karkhana")) {
        max = 2;
      }
    }

    return max;
  }, [
    ownedWorkspaces,
    activeStorePlan,
    tenantInfo.maxStores,
    tenantInfo.plan,
    dynamicPlans,
  ]);
  const isStoreLimitReached = ownedWorkspaces.length >= maxAllowedStores;

  // Dynamic Team Members from backend
  const [teamMembers, setTeamMembers] = useState<
    Array<{
      id?: string;
      name: string;
      email?: string;
      role: string;
      initials?: string;
      online?: boolean;
      hue?: number;
      platforms?: readonly string[] | string[];
      avatar_url?: string | null;
      is_owner?: boolean;
    }>
  >([]);

  // Dynamic Notifications from backend
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFICATIONS);

  const hasSettingsPerm = hasPermission(
    activeWorkspace?.permissions,
    isOwner,
    "/console/settings",
  );

  const isPageAuthorized = (() => {
    if (isOwner) return true;
    if (!activeWorkspace) return true;

    // The settings page manages tab-level access internally, and teammates can access their own account
    if (pathname.startsWith("/console/settings")) {
      return true;
    }

    for (const group of CONSOLE_NAV) {
      for (const item of group.items) {
        if (
          pathname === item.href ||
          (item.href !== "/console" && pathname.startsWith(item.href))
        ) {
          return hasPermission(perms, false, item.href);
        }
      }
    }

    return true;
  })();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      // 0. Fetch accessible Store Workspaces (Multi-Store & Teammates)
      api.merchants
        .getMyStores()
        .then((res: unknown) => {
          if (Array.isArray(res)) {
            setWorkspaces(res as StoreWorkspace[]);
          }
        })
        .catch(() => {});

      // 0.1 Fetch dynamic active plans from database
      api.billing
        .listPlans()
        .then((res: unknown) => {
          if (Array.isArray(res)) {
            setDynamicPlans(res as BillingPlan[]);
          }
        })
        .catch(() => {});

      // 1. Fetch live Tenant Profile, Message Quota & Setup Checklist
      api.merchants
        .getProfile()
        .then((res: unknown) => {
          if (res && typeof res === "object") {
            const raw = res as Record<string, unknown>;
            const d = (
              "data" in raw && raw.data && typeof raw.data === "object"
                ? raw.data
                : raw
            ) as {
              name?: string;
              plan?: string;
              maxStores?: number;
              messagesUsed?: number;
              messagesQuota?: number;
              ordersUsed?: number;
              ordersQuota?: number;
              remainingQuota?: number;
              remainingPercent?: number;
              setup_checklist?: {
                total: number;
                completed: number;
                is_complete: boolean;
                tasks: SetupTaskItem[];
              };
            };
            const quota = d.messagesQuota || d.ordersQuota || 500;
            const used = d.messagesUsed ?? d.ordersUsed ?? 0;
            const remaining = d.remainingQuota ?? Math.max(0, quota - used);
            const pct =
              d.remainingPercent ??
              (quota > 0 ? Math.round((remaining / quota) * 100) : 100);
            setTenantInfo({
              name: d.name || "Nokshi & Co.",
              plan: d.plan || "Pro",
              maxStores: d.maxStores ?? 1,
              messagesUsed: used,
              messagesQuota: quota,
              remainingQuota: remaining,
              remainingPercent: pct,
            });

            if (d.setup_checklist && typeof d.setup_checklist === "object") {
              setSetupChecklist(d.setup_checklist);
            }
          }
        })
        .catch(() => {});

      // 2. Fetch Live Teammates from Backend
      api.merchants
        .getTeam()
        .then((res: unknown) => {
          if (Array.isArray(res)) {
            setTeamMembers(
              (res as Array<{
                id?: string;
                name: string;
                email?: string;
                role: string;
                initials?: string;
                online?: boolean;
                hue?: number;
                platforms?: string[];
                avatar_url?: string | null;
                is_owner?: boolean;
              }>).filter((m) => (m.role || "").toLowerCase() !== "superadmin"),
            );
          }
        })
        .catch(() => {});

      // 3. Fetch Real Notifications from Backend
      api.merchants
        .getNotifications()
        .then((res: unknown) => {
          if (Array.isArray(res) && res.length > 0) {
            setNotifs(res as Notification[]);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated, pathname]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [quotaOpen, setQuotaOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CONSOLE_NAV.map((group) => [group.group, true])),
  );

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Admin";

  const cleanUserEmail = user?.email?.trim().toLowerCase();
  const activeWorkspaceRole = activeWorkspace?.role;
  const effectiveTeamMembers = useMemo(() => {
    const userRoleDisplay = isOwner
      ? "Owner"
      : activeWorkspaceRole || user?.role || "Member";

    let list = [...teamMembers];
    if (list.length === 0) {
      if (user) {
        list = [
          {
            id: String(user.id || "me"),
            name: displayName,
            email: user.email,
            role: userRoleDisplay,
            initials: displayName.slice(0, 2).toUpperCase(),
            online: true,
            hue: 82,
            avatar_url: user.avatar_url,
            is_owner: isOwner,
          },
        ];
      } else {
        list = [...TEAM];
      }
    } else if (user && cleanUserEmail) {
      const hasUser = list.some(
        (m) => m.email && m.email.trim().toLowerCase() === cleanUserEmail,
      );
      if (!hasUser) {
        list.unshift({
          id: String(user.id || "me"),
          name: displayName,
          email: user.email,
          role: userRoleDisplay,
          initials: displayName.slice(0, 2).toUpperCase(),
          online: true,
          hue: 82,
          avatar_url: user.avatar_url,
          is_owner: isOwner,
        });
      }
    }
    return list;
  }, [
    teamMembers,
    user,
    displayName,
    isOwner,
    cleanUserEmail,
    activeWorkspaceRole,
  ]);

  const onlineMembers = useMemo(() => {
    return effectiveTeamMembers.filter((m) =>
      Boolean(
        m.online ||
        (cleanUserEmail &&
          m.email &&
          m.email.trim().toLowerCase() === cleanUserEmail),
      ),
    );
  }, [effectiveTeamMembers, cleanUserEmail]);

  const onlineCount = onlineMembers.length;
  const pct = tenantInfo.remainingPercent;
  const quotaTone = getQuotaTone(pct);
  const unreadCount = notifs.filter((n) => n.unread).length;

  const markAllAsRead = () => {
    const unreadIds = notifs.filter((n) => n.unread).map((n) => n.id);
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
    if (unreadIds.length > 0) {
      api.merchants.markNotificationsRead(unreadIds).catch(() => {});
    }
  };

  const isComments =
    pathname === "/console/comments" ||
    (pathname === "/console/reach" && searchParams.get("tab") === "comments");
  const currentSection = isComments
    ? lang === "bn"
      ? "কমেন্টস"
      : "Comments"
    : lang === "bn"
      ? SECTION_TITLES_BN[pathname] || "ড্যাশবোর্ড"
      : SECTION_TITLES[pathname] || "Dashboard";

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !(prev[group] ?? true),
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block size-7 animate-spin rounded-full border-2 border-line border-t-signal" />
          <p className="text-xs font-mono text-text-3">
            Loading console session...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas text-text">
      {/* ---------------- sidebar (desktop) ---------------- */}
      <aside
        className={cx(
          "sticky top-0 z-40 hidden h-screen shrink-0 flex-col overflow-x-visible border-r border-line bg-surface/90 backdrop-blur-md transition-all duration-200 ease-in-out lg:flex",
          collapsed ? "w-[78px]" : "w-[290px]",
        )}
      >
        {/* Brand Header with Working Collapse Toggle Button (Exact h-[72px] match with Main Header, with border-b line) */}
        <div
          className={cx(
            "h-[72px] shrink-0 flex items-center border-b border-line",
            collapsed ? "justify-center px-2" : "justify-between pl-4.5 pr-3",
          )}
        >
          {!collapsed && (
            <Link
              href="/"
              prefetch={true}
              className="inline-block ml-0.5 translate-x-1 translate-y-0.5"
            >
              <Wordmark />
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              setCollapsed((prev) => {
                const next = !prev;
                if (next) {
                  setStoreDropdownOpen(false);
                  setProfileOpen(false);
                  setNotifOpen(false);
                  setTeamOpen(false);
                }
                return next;
              });
            }}
            className="text-text-3 hover:text-text p-1.5 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label="Toggle sidebar"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cx(
                "transition-transform duration-200",
                collapsed ? "rotate-180" : "",
              )}
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M9 3v18" />
            </svg>
          </button>
        </div>

        {/* Inner Scrollable Sidebar Container */}
        <div
          className={cx(
            "flex-1 overflow-y-auto overflow-x-visible pt-4 pb-3 space-y-3",
            collapsed ? "px-2.5" : "px-5",
          )}
        >
          {/* Navigation List */}
          <NavList
            collapsed={collapsed}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
            permissions={activeWorkspace?.permissions}
            isOwner={isOwner}
          />
        </div>

        {/* Bottom Store Profile / Switcher */}
        <div
          className={cx(
            "shrink-0 border-t border-line bg-surface/50 p-3",
            collapsed ? "px-2" : "px-3.5",
          )}
        >
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStoreDropdownOpen(!storeDropdownOpen);
                setQuotaOpen(false);
                setProfileOpen(false);
                setNotifOpen(false);
                setTeamOpen(false);
              }}
              className={cx(
                "flex w-full items-center rounded-2xl p-1.5 text-left transition-all hover:bg-surface-2 cursor-pointer select-none group border border-line/60 hover:border-line bg-surface shadow-2xs",
                collapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2",
                storeDropdownOpen
                  ? "bg-surface-2 border-line ring-2 ring-signal/20"
                  : "",
              )}
              title={
                collapsed
                  ? `${activeStoreName} (${activeStorePlan} Plan)`
                  : undefined
              }
              aria-label="Store switcher menu"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg font-display text-[12px] font-bold text-signal bg-signal/10 border border-signal/20 shadow-2xs group-hover:scale-105 transition-transform">
                {activeStoreInitial}
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] sm:text-[14px] font-bold text-text group-hover:text-signal transition-colors">
                      {activeStoreName}
                    </span>
                    {isTeammateInActiveStore ? (
                      <span className="block truncate text-[10.5px] font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        {activeWorkspace.role} · Owner Paid
                      </span>
                    ) : activeWorkspace?.is_frozen ? (
                      <span className="block truncate text-[10.5px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        ❄️ Frozen (Inactive)
                      </span>
                    ) : (
                      <span className="block truncate text-[10.5px] font-mono font-medium text-text-3">
                        Owner ·{" "}
                        {activeStorePlan
                          ? activeStorePlan.toLowerCase() === "growth"
                            ? "GROW"
                            : activeStorePlan.toUpperCase()
                          : "FREE"}
                      </span>
                    )}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={cx(
                      "text-text-3 shrink-0 transition-transform duration-150 group-hover:text-text",
                      storeDropdownOpen ? "rotate-180 text-signal" : "",
                    )}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </>
              )}
            </button>

            {/* Store Switcher Dropdown (Linear / Slack Workspace Standard - Popover Opens Upwards) */}
            <AnimatePresence>
              {storeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setStoreDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cx(
                      "absolute z-[70] rounded-2xl border border-line bg-white/95 backdrop-blur-xl p-2 shadow-[0_16px_36px_rgba(15,20,25,0.12)] space-y-1",
                      collapsed
                        ? "left-[calc(100%+12px)] bottom-0 w-[270px] origin-bottom-left"
                        : "left-0 right-0 bottom-full mb-2 w-full origin-bottom",
                    )}
                  >
                    {/* Workspaces Categorized List */}
                    <div className="max-h-60 overflow-y-auto space-y-2 pr-0.5">
                      {/* Owned Stores Section */}
                      <div>
                        <div className="px-2 pt-1 pb-1 flex items-center justify-between select-none">
                          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-3">
                            {lang === "bn"
                              ? "আপনার নিজস্ব স্টোর"
                              : "Your Stores"}
                          </span>
                          <span
                            className={cx(
                              "text-[9.5px] font-mono font-semibold px-1.5 py-0.2 rounded",
                              isStoreLimitReached
                                ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                : "text-text-3 bg-surface-2",
                            )}
                          >
                            {ownedWorkspaces.length} / {maxAllowedStores}
                          </span>
                        </div>

                        {ownedWorkspaces.length > 0 ? (
                          <div className="space-y-0.5">
                            {ownedWorkspaces.map((w) => {
                              const isActive = w.id === activeWorkspace?.id;
                              const isSwitching = switchingStoreId === w.id;
                              return (
                                <button
                                  key={w.id}
                                  type="button"
                                  onClick={() => {
                                    if (!isActive && !isSwitching)
                                      handleSwitchWorkspace(w.id);
                                    else setStoreDropdownOpen(false);
                                  }}
                                  disabled={isSwitching}
                                  className={cx(
                                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all cursor-pointer select-none group relative",
                                    isActive
                                      ? "bg-signal/10 text-signal font-semibold ring-1 ring-signal/20"
                                      : "text-text hover:bg-surface-2",
                                  )}
                                >
                                  <span
                                    className={cx(
                                      "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold font-display transition-all",
                                      isActive
                                        ? "bg-signal text-white shadow-xs"
                                        : "bg-surface-2 border border-line text-text-2 group-hover:text-text group-hover:border-signal/40",
                                    )}
                                  >
                                    {w.name.charAt(0).toUpperCase()}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold leading-tight">
                                      {w.name}
                                    </p>
                                    <p className="truncate text-[10px] font-mono text-text-3 mt-0.5">
                                      <span className="text-text-2 font-medium">
                                        Owner
                                      </span>
                                      {w.is_frozen ? (
                                        <span className="ml-1 uppercase text-[9px] font-bold font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                          ❄️ Frozen
                                        </span>
                                      ) : (
                                        w.plan && (
                                          <span className="ml-1 uppercase text-[9px] px-1 py-0.2 rounded bg-surface-2 border border-line/60">
                                            {w.plan}
                                          </span>
                                        )
                                      )}
                                    </p>
                                  </div>
                                  {isSwitching ? (
                                    <span className="text-[10px] font-mono text-signal animate-pulse shrink-0">
                                      {lang === "bn"
                                        ? "পরিবর্তন..."
                                        : "Switching..."}
                                    </span>
                                  ) : isActive ? (
                                    <span className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono font-bold text-signal">
                                      <span className="size-2 rounded-full bg-signal shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                      <span>
                                        {lang === "bn" ? "সক্রিয়" : "Active"}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10.5px] font-mono text-text-3 shrink-0">
                                      {lang === "bn" ? "যান" : "Switch"} &rarr;
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleCreateDefaultStore}
                            disabled={isCreatingStore}
                            className="w-full text-left flex items-center gap-2.5 rounded-xl border border-dashed border-signal/40 bg-signal/5 hover:bg-signal/10 p-2.5 text-xs text-signal font-medium transition-all group cursor-pointer my-1 select-none disabled:opacity-70 disabled:cursor-wait"
                          >
                            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-signal/15 text-signal group-hover:bg-signal group-hover:text-white transition-all shadow-xs">
                              {isCreatingStore ? (
                                <svg
                                  className="size-3.5 animate-spin text-signal group-hover:text-white"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8H4z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                >
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-text leading-tight group-hover:text-signal transition-colors">
                                {isCreatingStore
                                  ? lang === "bn"
                                    ? "স্টোর তৈরি হচ্ছে..."
                                    : "Creating Store..."
                                  : lang === "bn"
                                    ? "নতুন নিজস্ব স্টোর তৈরি করুন"
                                    : "Create a New Store"}
                              </p>
                              <p className="text-[10px] font-mono text-text-3 mt-0.5">
                                {isCreatingStore
                                  ? lang === "bn"
                                    ? "১-ক্লিকে সেটআপ সম্পন্ন হচ্ছে..."
                                    : "Setting up with 1-click..."
                                  : lang === "bn"
                                    ? "আপনার নিজস্ব ব্রাঞ্চ সেটআপ করুন"
                                    : "Set up your personal branch"}
                              </p>
                            </div>
                            <span className="text-xs text-signal opacity-0 group-hover:opacity-100 transition-opacity pr-1">
                              &rarr;
                            </span>
                          </button>
                        )}

                        {ownedWorkspaces.length > 0 && !isStoreLimitReached && (
                          <button
                            type="button"
                            onClick={handleCreateDefaultStore}
                            disabled={isCreatingStore}
                            className="w-full flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-signal font-medium hover:bg-signal/10 transition-colors cursor-pointer mt-1 disabled:opacity-70 disabled:cursor-wait"
                          >
                            {isCreatingStore ? (
                              <svg
                                className="size-3.5 animate-spin text-signal shrink-0"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8H4z"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                className="text-signal shrink-0"
                              >
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            )}
                            <span className="truncate">
                              {isCreatingStore
                                ? lang === "bn"
                                  ? "স্টোর তৈরি হচ্ছে..."
                                  : "Creating Store..."
                                : lang === "bn"
                                  ? "আরেকটি স্টোর যুক্ত করুন"
                                  : "Connect Another Store"}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Teammate Stores Section */}
                      {teammateWorkspaces.length > 0 && (
                        <div className="pt-1.5 border-t border-line/60">
                          <div className="px-2 pt-1 pb-1 flex items-center justify-between select-none">
                            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-text-3">
                              {lang === "bn"
                                ? "টিমমেট স্টোরসমূহ"
                                : "Teammate Stores"}
                            </span>
                            <span className="text-[9px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                              Owner Paid
                            </span>
                          </div>
                          <div className="space-y-0.5">
                            {teammateWorkspaces.map((w) => {
                              const isActive = w.id === activeWorkspace?.id;
                              const isSwitching = switchingStoreId === w.id;
                              return (
                                <button
                                  key={w.id}
                                  type="button"
                                  onClick={() => {
                                    if (!isActive && !isSwitching)
                                      handleSwitchWorkspace(w.id);
                                    else setStoreDropdownOpen(false);
                                  }}
                                  disabled={isSwitching}
                                  className={cx(
                                    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-all cursor-pointer select-none group relative",
                                    isActive
                                      ? "bg-signal/10 text-signal font-semibold ring-1 ring-signal/20"
                                      : "text-text hover:bg-surface-2",
                                  )}
                                >
                                  <span
                                    className={cx(
                                      "grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold font-display transition-all",
                                      isActive
                                        ? "bg-signal text-white shadow-xs"
                                        : "bg-surface-2 border border-line text-text-2 group-hover:text-text group-hover:border-signal/40",
                                    )}
                                  >
                                    {w.name.charAt(0).toUpperCase()}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-semibold leading-tight">
                                      {w.name}
                                    </p>
                                    <p className="truncate text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                                      {w.role || "Staff"} · Owner Paid
                                    </p>
                                  </div>
                                  {isSwitching ? (
                                    <span className="text-[10px] font-mono text-signal animate-pulse shrink-0">
                                      {lang === "bn"
                                        ? "পরিবর্তন..."
                                        : "Switching..."}
                                    </span>
                                  ) : isActive ? (
                                    <span className="flex items-center gap-1.5 shrink-0 text-[10px] font-mono font-bold text-signal">
                                      <span className="size-2 rounded-full bg-signal shrink-0 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                                      <span>
                                        {lang === "bn" ? "সক্রিয়" : "Active"}
                                      </span>
                                    </span>
                                  ) : (
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10.5px] font-mono text-text-3 shrink-0">
                                      {lang === "bn" ? "যান" : "Switch"} &rarr;
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {workspaces.length === 0 && (
                        <div className="px-3 py-3 text-center text-xs text-text-3 font-mono">
                          {lang === "bn"
                            ? "কোনো স্টোর পাওয়া যায়নি"
                            : "No stores found"}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    {!isOwner && ownedWorkspaces.length > 0 && (
                      <div className="border-t border-line/60 pt-1.5 mt-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (switchingStoreId) return;
                            handleSwitchWorkspace(ownedWorkspaces[0].id);
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs text-signal font-medium hover:bg-signal/10 transition-colors cursor-pointer text-left"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="text-signal shrink-0"
                          >
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                          <span className="truncate">
                            {lang === "bn"
                              ? `আপনার নিজস্ব স্টোরে যান (${ownedWorkspaces[0].name})`
                              : `Go to Your Store (${ownedWorkspaces[0].name})`}
                          </span>
                        </button>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ---------------- main ---------------- */}
      <div className="relative z-0 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-line bg-canvas/85 px-4 backdrop-blur-xl lg:px-6">
          {/* Left: Mobile Nav Toggle + Prominent Section Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileNav(true)}
              className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-surface-2 lg:hidden cursor-pointer shrink-0"
              aria-label="Open navigation"
            >
              <IconMenu width={19} height={19} />
            </button>

            <h1
              className={cx(
                "text-[22px] sm:text-[24.5px] font-display font-bold text-text tracking-tight truncate select-none leading-none",
                lang === "bn" && "font-[family-name:var(--font-hind)]",
              )}
            >
              {currentSection}
            </h1>
          </div>

          {/* Right Header: Search (next to profiles) + Active Team Presence + Language + Notifications */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Search Omnibar (Positioned next to active profiles) */}
            <label className="relative hidden md:flex items-center w-52 lg:w-64 focus-within:w-72 transition-all">
              <IconSearch
                width={14.5}
                height={14.5}
                className="pointer-events-none absolute left-3 text-text-3"
              />
              <input
                placeholder="Search orders, SKUs… (⌘K)"
                className="h-9 w-full rounded-xl border border-line bg-surface pl-9 pr-12 text-[13px] text-text placeholder:text-text-3/60 focus:border-signal focus:outline-none transition-all shadow-2xs"
              />
              <kbd className="pointer-events-none absolute right-2.5 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[9.5px] text-text-3">
                ⌘K
              </kbd>
            </label>

            {/* Top Navbar Dynamic Compact Quota Capsule & Summary Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setQuotaOpen(!quotaOpen);
                  setTeamOpen(false);
                  setNotifOpen(false);
                  setProfileOpen(false);
                  setStoreDropdownOpen(false);
                }}
                className={cx(
                  "hidden sm:flex items-center gap-1.5 rounded-xl border h-8 px-2.5 transition-all shadow-2xs group cursor-pointer select-none",
                  quotaOpen
                    ? "bg-surface-2 ring-2 ring-signal/30 border-signal/40"
                    : quotaTone.border,
                )}
                title={`AI Message Quota: ${tenantInfo.remainingQuota.toLocaleString()} of ${tenantInfo.messagesQuota.toLocaleString()} remaining (${tenantInfo.messagesUsed.toLocaleString()} replies used · ${pct}% left). Click to view plan summary.`}
                aria-label="Quota and plan summary"
              >
                <span
                  className={cx(
                    "size-1.5 rounded-full ring-2 shrink-0",
                    quotaTone.dot,
                    pct <= 15 ? "animate-ping" : "animate-pulse",
                  )}
                />
                <span
                  className={cx(
                    "font-mono text-[11.5px] font-bold tracking-tight",
                    quotaTone.text,
                  )}
                >
                  {tenantInfo.remainingQuota.toLocaleString()} Left
                </span>
                <span className="font-mono text-[11px] text-text-3 font-medium">
                  ({pct}%)
                </span>
              </button>

              {/* Quota & Plan Summary Popover (Compact & Professional) */}
              <AnimatePresence>
                {quotaOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[50]"
                      onClick={() => setQuotaOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-[60] w-[280px] rounded-2xl border border-line bg-white/98 backdrop-blur-xl p-3.5 shadow-2xl space-y-3 animate-in fade-in"
                    >
                      {/* Top Caret Notch (points directly to capsule) */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 border-l border-t border-line bg-white" />

                      {/* Top Header Row */}
                      <div className="relative flex items-center justify-between pb-2 border-b border-line/60">
                        <div className="flex items-center gap-2">
                          <span
                            className={cx(
                              "size-2 rounded-full ring-2 shrink-0",
                              quotaTone.dot,
                            )}
                          />
                          <span className="text-[13px] font-bold text-text">
                            {tenantInfo.plan} Plan
                          </span>
                        </div>
                        <span className="text-[10.5px] font-mono text-text-3 font-medium">
                          Resets in 9d
                        </span>
                      </div>

                      {/* Quota Meter Block */}
                      <div className="relative space-y-1.5">
                        <div className="flex items-baseline justify-between text-[11.5px]">
                          <span
                            className={cx(
                              "font-mono font-bold text-[14px]",
                              quotaTone.text,
                            )}
                          >
                            {tenantInfo.remainingQuota.toLocaleString()} Left
                          </span>
                          <span className="font-mono text-[10.5px] text-text-3">
                            {tenantInfo.messagesUsed.toLocaleString()} /{" "}
                            {tenantInfo.messagesQuota.toLocaleString()} used (
                            {pct}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                          <div
                            className={cx(
                              "h-full rounded-full transition-all duration-300",
                              quotaTone.bar,
                            )}
                            style={{
                              width: `${Math.min(Math.max(pct, 0), 100)}%`,
                            }}
                          />
                        </div>

                        <p className="text-[9.5px] text-text-3 leading-tight pt-0.5">
                          Auto-decrements per AI reply &amp; conversation.
                        </p>
                      </div>

                      {/* Clean Actions (Same Row, Equal Height, No Arrows) */}
                      {isOwner && (
                        <div className="relative pt-2 border-t border-line/60 grid grid-cols-2 gap-2">
                          <Link
                            href="/console/settings?tab=billing"
                            onClick={() => setQuotaOpen(false)}
                            className="flex h-8 items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-2 text-[11.5px] font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer text-center"
                          >
                            <IconSettings
                              width={13}
                              height={13}
                              className="text-text-3 shrink-0"
                            />
                            <span className="truncate">Billing Settings</span>
                          </Link>
                          <Link
                            href="/pricing"
                            onClick={() => setQuotaOpen(false)}
                            className="flex h-8 items-center justify-center rounded-xl bg-signal/10 border border-signal/20 px-2 text-[11.5px] font-bold text-signal hover:bg-signal/15 transition-colors cursor-pointer text-center"
                          >
                            <span className="truncate">Upgrade / Top-Up</span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* 1. Active Team Presence Button & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTeamOpen(!teamOpen);
                  setQuotaOpen(false);
                  setNotifOpen(false);
                  setProfileOpen(false);
                  setStoreDropdownOpen(false);
                }}
                className={cx(
                  "hidden sm:flex h-8.5 items-center -space-x-2 rounded-full px-1 transition-all cursor-pointer select-none",
                  teamOpen
                    ? "ring-2 ring-emerald-500/40 bg-surface-2"
                    : "hover:opacity-90",
                )}
                title="Active Team Presence"
                aria-label="Active Team Members"
              >
                {(onlineMembers.length > 0
                  ? onlineMembers.slice(0, 4)
                  : effectiveTeamMembers.slice(0, 3)
                ).map((m, idx) => {
                  const isCurrent = Boolean(
                    cleanUserEmail &&
                    m.email &&
                    m.email.trim().toLowerCase() === cleanUserEmail,
                  );
                  const isOnline = Boolean(m.online || isCurrent);
                  const mAvatar =
                    isCurrent && user?.avatar_url
                      ? user.avatar_url
                      : m.avatar_url;
                  return (
                    <span
                      key={m.id || m.email || m.name || idx}
                      className={cx(
                        "relative inline-flex size-7 shrink-0 items-center justify-center rounded-full overflow-hidden transition-transform hover:scale-110 hover:z-10 shadow-xs",
                        isOnline
                          ? "ring-2 ring-emerald-500"
                          : "ring-2 ring-line",
                      )}
                    >
                      <Avatar
                        src={mAvatar}
                        name={m.name}
                        hue={m.hue ?? 82}
                        size={28}
                      />
                    </span>
                  );
                })}
              </button>

              {/* Team Presence Popover */}
              <AnimatePresence>
                {teamOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[50]"
                      onClick={() => setTeamOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-[60] w-[310px] rounded-2xl border border-line bg-white/98 backdrop-blur-xl p-3.5 shadow-2xl space-y-2.5 animate-in fade-in"
                    >
                      {/* Top Caret Notch (points directly to team button) */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 border-l border-t border-line bg-white" />

                      {/* Header */}
                      <div className="relative flex items-center justify-between pb-2 border-b border-line/60">
                        <div className="flex items-center gap-2">
                          <span className="size-2 rounded-full bg-signal ring-2 ring-signal/25 shrink-0" />
                          <span className="text-[13px] font-bold text-text">
                            Active Teammates
                          </span>
                        </div>
                        <span className="rounded-md bg-signal/15 px-2 py-0.5 font-mono text-[10px] font-bold text-signal">
                          {onlineCount} Online
                        </span>
                      </div>

                      {/* All Members List (Owner + All Teammates with Online/Offline status) */}
                      <div className="relative max-h-72 overflow-y-auto space-y-1 pr-0.5">
                        {effectiveTeamMembers.map((m, idx) => {
                          const isCurrent = Boolean(
                            cleanUserEmail &&
                            m.email &&
                            m.email.trim().toLowerCase() === cleanUserEmail,
                          );
                          const isOnline = Boolean(m.online || isCurrent);
                          const mAvatar =
                            isCurrent && user?.avatar_url
                              ? user.avatar_url
                              : m.avatar_url;

                          return (
                            <div
                              key={m.id || m.email || m.name || idx}
                              className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-2 transition-colors group"
                            >
                              <div className="relative shrink-0">
                                <Avatar
                                  src={mAvatar}
                                  name={m.name}
                                  hue={m.hue ?? 82}
                                  size={32}
                                />
                                <span
                                  className={cx(
                                    "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-white",
                                    isOnline
                                      ? "bg-signal ring-signal/20 animate-pulse"
                                      : "bg-text-3/40",
                                  )}
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <p className="text-[12.5px] font-semibold text-text truncate leading-tight">
                                    {m.name}
                                  </p>
                                  {isCurrent && (
                                    <span className="text-[9.5px] font-medium text-text-3 bg-surface-2 border border-line/60 px-1.5 py-0.2 rounded shrink-0">
                                      You
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                  <span className="text-[10.5px] text-text-3 font-mono truncate">
                                    {m.role}
                                  </span>
                                </div>
                              </div>

                              {/* Right side: Online / Offline status badge (replaces globe icons) */}
                              <div className="shrink-0">
                                {isOnline ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/10 border border-signal/20 px-2 py-0.5 font-mono text-[10.5px] font-semibold text-signal">
                                    <span className="size-1.5 rounded-full bg-signal ring-2 ring-signal/30 animate-pulse" />
                                    Online
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 border border-line px-2 py-0.5 font-mono text-[10.5px] font-medium text-text-3">
                                    <span className="size-1.5 rounded-full bg-text-3/40" />
                                    Offline
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer Action (Clean, No Arrow) */}
                      {isOwner && (
                        <div className="relative pt-2 border-t border-line/60">
                          <Link
                            href="/console/settings?tab=account"
                            onClick={() => setTeamOpen(false)}
                            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[11.5px] font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer text-center"
                          >
                            <IconUsers
                              width={13}
                              height={13}
                              className="text-text-3 shrink-0"
                            />
                            <span>Manage Team &amp; Roles</span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setQuotaOpen(false);
                  setTeamOpen(false);
                  setProfileOpen(false);
                  setStoreDropdownOpen(false);
                }}
                className={cx(
                  "relative grid size-8.5 place-items-center rounded-xl transition-all cursor-pointer hover:bg-surface-2",
                  notifOpen
                    ? "bg-surface-2 text-signal"
                    : "text-text-3 hover:text-text",
                )}
                title="Admin & System Notifications"
                aria-label="Notifications"
              >
                <IconBell width={17} height={17} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-signal" />
                  </span>
                )}
              </button>

              {/* Notification Popover Drawer (Compact & Professional) */}
              <AnimatePresence>
                {notifOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[50]"
                      onClick={() => setNotifOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.12, ease: "easeOut" }}
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 z-[60] w-[280px] sm:w-[290px] rounded-2xl border border-line bg-white/98 backdrop-blur-xl p-3.5 shadow-2xl space-y-2.5 animate-in fade-in"
                    >
                      {/* Top Caret Notch (points directly to Bell) */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rotate-45 border-l border-t border-line bg-white" />

                      {/* Header */}
                      <div className="relative flex items-center justify-between pb-2 border-b border-line/60">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-text">
                            Notifications
                          </span>
                          {unreadCount > 0 && (
                            <span className="rounded-md bg-signal/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-signal">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={markAllAsRead}
                            className="text-[11px] font-medium text-text-3 hover:text-signal transition-colors cursor-pointer"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notification Stream */}
                      <div className="relative max-h-72 overflow-y-auto space-y-1 pr-0.5">
                        {notifs.map((n) => (
                          <div
                            key={n.id}
                            className={cx(
                              "group relative flex items-start gap-2.5 rounded-xl p-2 transition-all text-left cursor-pointer hover:bg-surface-2",
                              n.unread ? "bg-signal/[0.04]" : "",
                            )}
                          >
                            {/* Category Badge Icon */}
                            <span
                              className={cx(
                                "grid size-7 shrink-0 place-items-center rounded-lg font-bold mt-0.5",
                                n.type === "admin"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                  : n.type === "courier"
                                    ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                    : "bg-signal/15 text-signal",
                              )}
                            >
                              {n.type === "admin" ? (
                                <IconSpark width={12} height={12} />
                              ) : n.type === "courier" ? (
                                <IconTruck width={12} height={12} />
                              ) : (
                                <IconBot width={12} height={12} />
                              )}
                            </span>

                            {/* Content Body */}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1.5">
                                <p className="text-[12px] font-semibold text-text truncate leading-tight group-hover:text-signal transition-colors">
                                  {n.title}
                                </p>
                                {n.unread && (
                                  <span className="size-1.5 rounded-full bg-signal shrink-0" />
                                )}
                              </div>
                              <p className="text-[10.5px] text-text-3 leading-snug mt-0.5 line-clamp-2">
                                {n.body}
                              </p>
                              <span className="block font-mono text-[9px] text-text-3/60 mt-1">
                                {n.time}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Action (Clean, No Arrow) */}
                      {canManageNotifications && (
                        <div className="relative pt-2 border-t border-line/60">
                          <Link
                            href="/console/settings?tab=notifications"
                            onClick={() => setNotifOpen(false)}
                            className="flex h-8 w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-[11.5px] font-semibold text-text hover:bg-surface-2 transition-colors cursor-pointer text-center"
                          >
                            <IconBell
                              width={13}
                              height={13}
                              className="text-text-3 shrink-0"
                            />
                            <span>Notification Settings</span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-line/60 shrink-0" />

            {/* Language Switcher (Personal Preference) */}
            <LanguageToggle size="console" />

            {/* 4. Far Right: User Profile Avatar & Dropdown Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setQuotaOpen(false);
                  setNotifOpen(false);
                  setTeamOpen(false);
                  setStoreDropdownOpen(false);
                }}
                className={cx(
                  "relative inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-all cursor-pointer select-none",
                  profileOpen
                    ? "bg-surface-2 ring-2 ring-emerald-500/30"
                    : "hover:opacity-90",
                )}
                title={`${displayName} · ${user?.email || "Account & Profile"}`}
                aria-label="User profile menu"
              >
                <div className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-full ring-2 ring-emerald-500 shadow-xs">
                  <Avatar
                    src={user?.avatar_url}
                    name={displayName}
                    hue={user?.hue || 155}
                    size={32}
                  />
                  {hasSetupRequired && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex size-2.5">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex size-2.5 rounded-full bg-amber-500 ring-2 ring-white" />
                    </span>
                  )}
                </div>
              </button>

              {/* Profile Context Dropdown (Linear / Stripe Standard) */}
              <AnimatePresence>
                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[50]"
                      onClick={() => setProfileOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2.5 z-[60] w-76 rounded-2xl border border-line bg-white/98 backdrop-blur-xl p-2.5 shadow-2xl space-y-2 animate-in fade-in"
                    >
                      {/* Top Caret Notch (points directly to Profile Avatar) */}
                      <div className="absolute -top-1.5 right-3.5 size-3 rotate-45 border-l border-t border-line bg-white" />

                      {/* Account Summary Header */}
                      <div className="flex items-center gap-2.5 pb-2 border-b border-line/60">
                        <Avatar
                          src={user?.avatar_url}
                          name={displayName}
                          hue={user?.hue || 155}
                          size={36}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-text truncate leading-tight">
                            {displayName}
                          </p>
                          <p className="text-[10.5px] text-text-3 font-mono truncate mt-0.5">
                            {user?.email || "admin@arisesell.com"}
                          </p>
                        </div>
                        <span
                          className={cx(
                            "rounded-md px-1.5 py-0.5 font-mono text-[9.5px] font-bold capitalize shrink-0",
                            roleBadgeColor,
                          )}
                        >
                          {roleLabel}
                        </span>
                      </div>

                      {/* 1. Account Setup Checklist (Shown for Admin/Owner, disappears when all done) */}
                      {isAdminOrOwner &&
                        pendingSetupTasks.length > 0 &&
                        !setupChecklist.is_complete && (
                          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.04] p-2.5 space-y-2 select-none">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="size-2 rounded-full bg-amber-500 ring-2 ring-amber-500/20 animate-pulse" />
                                <span className="text-[11.5px] font-bold text-text">
                                  Account Setup Required
                                </span>
                              </div>
                              <span className="text-[9.5px] font-mono font-bold text-amber-700 bg-amber-500/15 px-1.5 py-0.5 rounded">
                                {setupChecklist.completed}/
                                {setupChecklist.total} Done
                              </span>
                            </div>

                            {/* Progress track */}
                            <div className="h-1 w-full overflow-hidden rounded-full bg-amber-500/20">
                              <div
                                className="h-full rounded-full bg-amber-500 transition-all duration-300"
                                style={{
                                  width: `${(setupChecklist.completed / setupChecklist.total) * 100}%`,
                                }}
                              />
                            </div>

                            {/* Actionable pending setup tasks */}
                            <div className="space-y-1">
                              {pendingSetupTasks.map((task) => (
                                <Link
                                  key={task.id}
                                  href={task.href}
                                  onClick={() => setProfileOpen(false)}
                                  className="flex items-center justify-between gap-2.5 rounded-lg bg-surface p-2 border border-line/60 hover:border-amber-500/40 hover:bg-amber-500/[0.03] transition-all group cursor-pointer"
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span className="size-1.5 rounded-full bg-amber-500 shrink-0 ring-2 ring-amber-500/20" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-[11.5px] font-semibold text-text group-hover:text-amber-800 transition-colors truncate leading-tight">
                                        {task.title}
                                      </p>
                                      <p className="text-[9.5px] text-text-3 font-mono truncate mt-0.5">
                                        {task.hint}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="shrink-0 text-[10.5px] font-bold text-amber-600 group-hover:translate-x-0.5 transition-transform">
                                    Set up →
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* 2. Core Settings tailored to User Role */}
                      <div className="space-y-0.5 text-[12px] font-medium text-text-2 pt-0.5">
                        <Link
                          href="/console/settings?tab=account"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2">
                            <IconShield
                              width={14}
                              height={14}
                              className="text-text-3 group-hover:text-text transition-colors"
                            />
                            <span>Profile &amp; Security</span>
                          </div>
                          <span className="text-[9.5px] text-text-3 font-mono">
                            Password, 2FA
                          </span>
                        </Link>

                        {isAdminOrOwner ? (
                          <>
                            <Link
                              href="/console/settings?tab=business"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <IconSettings
                                  width={14}
                                  height={14}
                                  className="text-text-3 group-hover:text-text transition-colors"
                                />
                                <span>Store &amp; Business Profile</span>
                              </div>
                              <span className="text-[9.5px] text-text-3 font-mono truncate max-w-[90px]">
                                {tenantInfo.name}
                              </span>
                            </Link>

                            <Link
                              href="/console/settings?tab=courier"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer group"
                            >
                              <div className="flex items-center gap-2">
                                <IconTruck
                                  width={14}
                                  height={14}
                                  className="text-text-3 group-hover:text-text transition-colors"
                                />
                                <span>Courier &amp; Logistics API</span>
                              </div>
                              <span className="text-[9.5px] text-emerald-700 bg-emerald-500/10 font-mono font-medium px-1.5 py-0.5 rounded">
                                Steadfast
                              </span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            href="/console/inbox"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center justify-between rounded-xl px-2 py-1.5 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-2">
                              <IconBot
                                width={14}
                                height={14}
                                className="text-text-3 group-hover:text-text transition-colors"
                              />
                              <span>Live Customer Inbox</span>
                            </div>
                            <span className="text-[9.5px] text-signal font-mono font-bold">
                              Assigned
                            </span>
                          </Link>
                        )}
                      </div>

                      {/* 3. Sign Out & Version Footer */}
                      <div className="pt-1.5 border-t border-line/60 flex items-center justify-between px-1">
                        <button
                          type="button"
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                            router.push("/login");
                          }}
                          className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-[12px] font-semibold text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
                        >
                          <IconLogOut
                            width={13.5}
                            height={13.5}
                            className="text-rose-500"
                          />
                          <span>Sign Out</span>
                        </button>
                        <span className="text-[9.5px] font-mono text-text-3/60 pr-1 select-none">
                          AriseSell v2.4
                        </span>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content Body (0ms Latency + Smooth Fade Transition) */}
        <main
          key={pathname}
          className="min-w-0 flex-1 animate-in fade-in duration-100"
        >
          {/* Frozen Store Capacity Alert Banner */}
          {activeWorkspace?.is_frozen && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="text-base select-none">❄️</span>
                <span>
                  <strong>
                    {activeStoreName} is currently Frozen (Inactive)
                  </strong>{" "}
                  under your current plan. Automated AI chat responses and
                  courier dispatches are paused. All your products, orders, and
                  settings remain safe.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActiveStore(activeWorkspace.id)}
                  className="rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11.5px] px-3 py-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  Make This Store Active (Swap)
                </button>
                <Link
                  href="/console/settings?tab=billing"
                  className="rounded-lg border border-amber-500/30 bg-white hover:bg-amber-50 text-amber-900 font-semibold text-[11.5px] px-3 py-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  Upgrade Plan
                </Link>
              </div>
            </div>
          )}

          {isPageAuthorized ? (
            children
          ) : (
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
                    You do not have permission to access this section in{" "}
                    <strong className="text-text">{activeStoreName}</strong>.
                    Please contact the store owner (
                    {activeWorkspace?.owner_name || "Store Owner"}) to request
                    access.
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
          )}
        </main>
      </div>

      {/* ---------------- sidebar (mobile) ---------------- */}
      {mobileNav && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileNav(false)}
        >
          <aside
            className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-surface px-4 py-5 lg:hidden animate-in slide-in-from-left duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between px-1">
              <Wordmark />
              <button
                onClick={() => setMobileNav(false)}
                className="grid size-8 place-items-center rounded-lg text-text-2 hover:bg-surface-2 cursor-pointer"
                aria-label="Close navigation"
              >
                <IconClose width={18} height={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList
                onNavigate={() => setMobileNav(false)}
                expandedGroups={expandedGroups}
                onToggleGroup={toggleGroup}
                permissions={activeWorkspace?.permissions}
                isOwner={isOwner}
              />
            </div>

            {/* Mobile Store Profile in Bottom */}
            <div className="shrink-0 border-t border-line pt-3 mt-2">
              <Link
                href={
                  hasSettingsPerm
                    ? "/console/settings?tab=business"
                    : "/console"
                }
                onClick={() => setMobileNav(false)}
                className="flex items-center gap-2.5 rounded-2xl p-2 bg-surface-2/60 border border-line hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg font-display text-[12px] font-bold text-signal bg-signal/10 border border-signal/20">
                  {activeStoreInitial}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13.5px] font-bold text-text">
                    {activeStoreName}
                  </p>
                  <p className="truncate text-[10.5px] font-mono text-text-3">
                    {isTeammateInActiveStore
                      ? `${activeWorkspace?.role || "Teammate"} · Owner Paid`
                      : `${activeStorePlan} Plan · ${activeWorkspace?.channels_count || 3} Channels`}
                  </p>
                </div>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default function ConsoleShell({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-canvas text-sm text-text-3">
          Loading console…
        </div>
      }
    >
      <ConsoleShellInner>{children}</ConsoleShellInner>
    </Suspense>
  );
}

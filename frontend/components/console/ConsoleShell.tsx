"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CONSOLE_NAV } from "@/lib/brand";
import { TENANT, TEAM } from "@/data/tenant";
import { Avatar, Wordmark } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";
import {
  CHANNEL_ICON,
  NAV_ICON,
  IconBell,
  IconBot,
  IconChevronUp,
  IconClose,
  IconCreditCard,
  IconLogOut,
  IconMenu,
  IconSearch,
  IconSettings,
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
};

function NavList({
  collapsed,
  onNavigate,
  expandedGroups,
  onToggleGroup,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
  expandedGroups: Record<string, boolean>;
  onToggleGroup: (group: string) => void;
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
                {group.items.map((item) => {
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
                      pathname === "/console/test-ai");
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
};

function getQuotaTone(pct: number) {
  if (pct >= 90) {
    return {
      dot: "bg-rose-500 ring-rose-500/25",
      text: "text-rose-600 dark:text-rose-400",
      badge:
        "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/20",
      border: "border-rose-500/30 hover:border-rose-500/60 bg-rose-500/[0.04]",
      bar: "bg-rose-500",
      status: "Critical (>90%)",
    };
  }
  if (pct >= 75) {
    return {
      dot: "bg-amber-500 ring-amber-500/25",
      text: "text-amber-600 dark:text-amber-400",
      badge:
        "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20",
      border:
        "border-amber-500/30 hover:border-amber-500/60 bg-amber-500/[0.04]",
      bar: "bg-amber-500",
      status: "Approaching (75-89%)",
    };
  }
  return {
    dot: "bg-emerald-500 ring-emerald-500/25",
    text: "text-emerald-600 dark:text-emerald-400",
    badge:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/15",
    border: "border-line hover:border-emerald-500/40 bg-surface",
    bar: "bg-emerald-500",
    status: "Healthy (0-74%)",
  };
}

function ConsoleShellInner({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { lang } = useLang();
  const { user, loading, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, router, pathname]);

  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => Object.fromEntries(CONSOLE_NAV.map((group) => [group.group, true])),
  );

  const online = TEAM.filter((t) => t.online);
  const pct = Math.round((TENANT.ordersUsed / TENANT.ordersQuota) * 100);
  const quotaTone = getQuotaTone(pct);
  const unreadCount = notifs.filter((n) => n.unread).length;

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

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

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
        {/* Brand Header with Working Collapse Toggle Button (Exact h-16 match with Main Header, with border-b line) */}
        <div
          className={cx(
            "h-16 shrink-0 flex items-center border-b border-line",
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
            "flex-1 overflow-y-auto overflow-x-visible pt-3 pb-3 space-y-3",
            collapsed ? "px-2.5" : "px-5",
          )}
        >
          {/* Business / Tenant Switcher with Interactive Dropdown */}
          <div className="relative mb-5">
            <button
              type="button"
              onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
              className={cx(
                "flex w-full items-center rounded-xl p-1.5 text-left transition-all hover:bg-surface-2 cursor-pointer select-none group border border-line/50 hover:border-line bg-surface/30 shadow-2xs",
                collapsed ? "justify-center" : "gap-2.5 px-3",
                storeDropdownOpen ? "bg-surface-2 border-line" : "",
              )}
              title={
                collapsed ? `${TENANT.name} (${TENANT.pages} pages)` : undefined
              }
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-lg font-display text-[12px] font-bold text-signal bg-signal/10 border border-signal/20 shadow-2xs group-hover:scale-105 transition-transform">
                N
              </span>
              {!collapsed && (
                <>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] sm:text-[14px] font-bold text-text group-hover:text-signal transition-colors">
                      {TENANT.name}
                    </span>
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
                      storeDropdownOpen ? "rotate-180" : "",
                    )}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </>
              )}
            </button>

            {/* Store Switcher Dropdown (Linear / Slack Workspace Standard) */}
            {storeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setStoreDropdownOpen(false)}
                />
                <div
                  className={cx(
                    "absolute z-[70] rounded-[18px] border border-line bg-white/95 backdrop-blur-xl p-2.5 shadow-[0_18px_40px_rgba(15,20,25,0.12)] animate-in fade-in slide-in-from-left-1 duration-150",
                    collapsed
                      ? "left-[calc(100%+12px)] top-0 w-[290px] origin-left"
                      : "left-0 top-full mt-1.5 w-full",
                  )}
                >
                  <div className="flex items-center justify-between px-1 pb-2 select-none">
                    <p className="text-[11px] font-display font-black uppercase tracking-[0.18em] text-text-3">
                      Workspaces
                    </p>
                    <span className="text-[11px] font-medium text-text-3">
                      1 Active
                    </span>
                  </div>

                  <div className="rounded-[14px] border border-line bg-surface-2/80 p-2.5 shadow-[inset_0_0_0_1px_rgba(15,20,25,0.02)]">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-signal/20 bg-signal/12 text-[18px] font-display font-bold text-signal">
                        N
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[18px] font-display font-bold tracking-[-0.03em] text-text leading-tight">
                          {TENANT.name}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] font-mono text-text-3">
                          {TENANT.pages} Connected Channels
                        </p>
                      </div>
                      <span className="shrink-0 rounded-lg border border-signal/20 bg-signal/10 px-1.5 py-1 text-[9.5px] font-mono font-bold text-signal">
                        {TENANT.plan}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 border-t border-line/60 pt-2.5 text-[15px] font-medium text-text-2">
                    <Link
                      href="/pricing"
                      onClick={() => setStoreDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 font-semibold text-signal hover:bg-signal/8 transition-colors cursor-pointer"
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
                        className="text-amber-700"
                      >
                        <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" />
                      </svg>
                      <span>Upgrade to Business Tier</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setStoreDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-text-2 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-text-3"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                      <span>Connect Another Store</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Navigation List */}
          <NavList
            collapsed={collapsed}
            expandedGroups={expandedGroups}
            onToggleGroup={toggleGroup}
          />
        </div>

        {/* Bottom User Profile Footer (Pinned to Sidebar Bottom) */}
        <div
          className={cx(
            "shrink-0 pt-2 pb-2.5 border-t border-line/60 bg-surface/95",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {/* User Profile Trigger Button (Bottom-Left) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen(!profileOpen)}
              className={cx(
                "flex w-full items-center gap-2 rounded-xl p-1.5 transition-all text-left cursor-pointer select-none group border border-line/50 hover:border-signal/50 bg-surface/30 shadow-2xs hover:bg-surface-2",
                collapsed ? "justify-center" : "",
                profileOpen
                  ? "bg-signal/[0.08] border-signal/50 ring-1.5 ring-signal/40 text-signal shadow-[0_2px_14px_rgba(10,110,80,0.20)]"
                  : "",
              )}
              title={
                collapsed ? "Farhana Rahman (farhana@nokshi.co)" : undefined
              }
            >
              <div className="relative shrink-0" title="farhana@nokshi.co">
                <Avatar
                  name="Farhana Rahman"
                  hue={82}
                  size={collapsed ? 26 : 28}
                />
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-signal ring-2 ring-white" />
              </div>

              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cx(
                        "truncate text-[13px] font-bold transition-colors leading-tight",
                        profileOpen
                          ? "text-signal"
                          : "text-text group-hover:text-signal",
                      )}
                    >
                      {user?.first_name
                        ? `${user.first_name} ${user.last_name || ""}`.trim()
                        : "Farhana Rahman"}
                    </p>
                    <p className="truncate text-[11px] font-mono mt-0.5 font-semibold text-signal">
                      {TENANT.plan} Plan
                    </p>
                  </div>
                  <IconChevronUp
                    width={15}
                    height={15}
                    className={cx(
                      "shrink-0 transition-transform duration-200",
                      profileOpen
                        ? "rotate-180 text-signal"
                        : "text-text-3 group-hover:text-text",
                    )}
                  />
                </>
              )}
            </button>

            {/* Profile Context Dropdown (Clean White Surface with Rich Green Highlight Ring & Glow) */}
            <AnimatePresence>
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className={cx(
                      "absolute z-[70] rounded-xl border border-signal/50 ring-2 ring-signal/35 bg-surface/98 backdrop-blur-xl p-2 shadow-[0_16px_50px_-4px_rgba(10,110,80,0.40),0_6px_22px_rgba(10,110,80,0.22)] space-y-2",
                      collapsed
                        ? "left-[calc(100%+10px)] bottom-0 w-64 origin-left"
                        : "bottom-full mb-1.5 left-0 right-0 w-full",
                    )}
                  >
                    {/* Account Summary Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-text truncate leading-tight">
                          {user?.first_name
                            ? `${user.first_name} ${user.last_name || ""}`.trim()
                            : "Farhana Rahman"}
                        </p>
                        <p className="text-[10.5px] text-text-3 font-mono truncate mt-0.5">
                          {user?.email || "farhana@nokshi.co"}
                        </p>
                      </div>
                      <span className="rounded-md bg-signal/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-signal capitalize">
                        {user?.role || "Owner"}
                      </span>
                    </div>

                    {/* Quota Usage Summary (Clean Surface Card) */}
                    <div className="p-2 rounded-lg bg-surface-2/60 border border-line/60 space-y-1.5 select-none">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-text">
                          Orders Quota
                        </span>
                        <span
                          className={cx(
                            "rounded px-1.5 py-0.2 font-mono text-[9px] font-bold",
                            quotaTone.badge,
                          )}
                        >
                          {TENANT.plan}
                        </span>
                      </div>
                      <div className="flex items-baseline justify-between font-mono text-[11.5px]">
                        <span className={cx("font-bold", quotaTone.text)}>
                          {TENANT.ordersUsed.toLocaleString()}
                        </span>
                        <span className="text-text-3">
                          / {TENANT.ordersQuota.toLocaleString()} ({pct}%)
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
                        <div
                          className={cx(
                            "h-full rounded-full transition-all duration-300",
                            quotaTone.bar,
                          )}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] text-text-3 font-mono">
                        <span>Resets in 9 days</span>
                        <span className={quotaTone.text}>
                          {quotaTone.status}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items (Clean Line List) */}
                    <div className="space-y-0.5 text-[12.5px] font-medium text-text-2">
                      <Link
                        href="/console/settings?tab=billing"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
                      >
                        <IconCreditCard
                          width={14}
                          height={14}
                          className="text-text-3"
                        />
                        <span>Billing &amp; Quota</span>
                      </Link>
                      <Link
                        href="/console/settings?tab=account"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
                      >
                        <IconUsers
                          width={14}
                          height={14}
                          className="text-text-3"
                        />
                        <span>Team &amp; Roles</span>
                      </Link>
                      <Link
                        href="/console/brain"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer"
                      >
                        <IconBot
                          width={14}
                          height={14}
                          className="text-text-3"
                        />
                        <span>AI Brain &amp; Persona</span>
                      </Link>
                    </div>

                    {/* Sign Out (Sleek Clean Action) */}
                    <div className="pt-1 border-t border-line/60">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          logout();
                          router.push("/login");
                        }}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-[12px] font-medium text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer"
                      >
                        <IconLogOut
                          width={14}
                          height={14}
                          className="text-rose-500"
                        />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* ---------------- main ---------------- */}
      <div className="relative z-0 flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-canvas/85 px-4 backdrop-blur-xl lg:px-6">
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

            {/* Top Navbar Dynamic Compact Quota Capsule */}
            <Link
              href="/console/settings?tab=billing"
              className={cx(
                "hidden sm:flex items-center gap-1.5 rounded-xl border h-8 px-2.5 transition-all shadow-2xs group cursor-pointer select-none",
                quotaTone.border,
              )}
              title={`Monthly Closed Orders: ${TENANT.ordersUsed.toLocaleString()} of ${TENANT.ordersQuota.toLocaleString()} used (${(TENANT.ordersQuota - TENANT.ordersUsed).toLocaleString()} remaining · ${pct}%). Status: ${quotaTone.status}. Resets in 9 days.`}
            >
              <span
                className={cx(
                  "size-1.5 rounded-full ring-2 shrink-0",
                  quotaTone.dot,
                  pct >= 90 ? "animate-ping" : "animate-pulse",
                )}
              />
              <span
                className={cx(
                  "font-mono text-[11.5px] font-bold",
                  quotaTone.text,
                )}
              >
                {pct}%
              </span>
              <span className="font-mono text-[11px] text-text-3 font-medium">
                Quota
              </span>
            </Link>

            {/* 1. Active Team Presence Button & Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setTeamOpen(!teamOpen);
                  setNotifOpen(false);
                }}
                className={cx(
                  "hidden sm:flex items-center -space-x-2 rounded-full p-1 transition-all cursor-pointer select-none",
                  teamOpen
                    ? "ring-2 ring-signal/40 bg-surface-2"
                    : "hover:opacity-90",
                )}
                title="Active Team Presence"
                aria-label="Active Team Members"
              >
                {online.map((m) => (
                  <span
                    key={m.name}
                    className="ring-2 ring-surface rounded-full overflow-hidden transition-transform hover:scale-110 hover:z-10 shadow-2xs"
                  >
                    <Avatar name={m.name} hue={m.hue} size={26} />
                  </span>
                ))}
              </button>

              {/* Team Presence Popover */}
              {teamOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[50]"
                    onClick={() => setTeamOpen(false)}
                  />
                  <div className="absolute left-1/2 -translate-x-[40%] top-full mt-2 z-[60] w-72 rounded-2xl border border-line bg-white/95 backdrop-blur-xl p-2.5 shadow-2xl space-y-2 animate-in fade-in">
                    <div className="flex items-center justify-between px-1.5 pb-2 border-b border-line/60">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-signal animate-pulse" />
                        <span className="text-[13px] font-bold text-text">
                          Active Teammates
                        </span>
                      </div>
                      <span className="rounded-full bg-signal/15 px-2 py-0.2 font-mono text-[10px] font-bold text-signal">
                        {online.length} Online
                      </span>
                    </div>

                    {/* Active Member List Only */}
                    <div className="max-h-80 overflow-y-auto space-y-1 pr-0.5">
                      {online.map((m) => {
                        const platforms = "platforms" in m ? m.platforms : [];
                        return (
                          <div
                            key={m.name}
                            className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-surface-2 transition-colors group"
                          >
                            <div className="relative shrink-0">
                              <Avatar name={m.name} hue={m.hue} size={30} />
                              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-signal ring-2 ring-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[12.5px] font-semibold text-text truncate leading-tight">
                                {m.name}
                              </p>
                              {/* Role on left, Channel icons aligned on right */}
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <span className="text-[11px] text-text-3 font-mono truncate">
                                  {m.role}
                                </span>
                                <div className="flex items-center gap-1 shrink-0">
                                  {platforms.map((p) => {
                                    const ChannelIcon =
                                      CHANNEL_ICON[
                                        p as keyof typeof CHANNEL_ICON
                                      ] || CHANNEL_ICON.all;
                                    return (
                                      <span
                                        key={p}
                                        className="text-text-3 group-hover:text-signal transition-colors hover:scale-110"
                                        title={`Assigned Channel: ${p.charAt(0).toUpperCase() + p.slice(1)}`}
                                      >
                                        <ChannelIcon width={12} height={12} />
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="pt-1.5 border-t border-line/60 text-center">
                      <Link
                        href="/console/integrations"
                        onClick={() => setTeamOpen(false)}
                        className="text-[11.5px] font-semibold text-signal hover:underline"
                      >
                        Manage Team & Roles ➔
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* 2. Middle: Official Rounded-Full Homepage Language Switcher */}
            <LanguageToggle size="console" />

            {/* 3. Right: Borderless Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotifOpen(!notifOpen);
                  setTeamOpen(false);
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

              {/* Notification Popover Drawer (Linear / Stripe Standard) */}
              {notifOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[50]"
                    onClick={() => setNotifOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 z-[60] w-80 sm:w-88 rounded-2xl border border-line bg-white/95 backdrop-blur-xl p-2.5 shadow-2xl space-y-2 animate-in fade-in">
                    {/* Header */}
                    <div className="flex items-center justify-between px-1.5 pb-2 border-b border-line/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-text">
                          Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="rounded-full bg-signal/15 px-2 py-0.2 font-mono text-[10px] font-bold text-signal">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={markAllAsRead}
                          className="text-[11px] font-medium text-signal hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification Stream */}
                    <div className="max-h-80 overflow-y-auto space-y-1 pr-0.5">
                      {notifs.map((n) => (
                        <div
                          key={n.id}
                          className={cx(
                            "group relative flex items-start gap-2.5 rounded-xl p-2.5 transition-all text-left cursor-pointer hover:bg-surface-2",
                            n.unread ? "bg-signal/[0.04]" : "",
                          )}
                        >
                          {/* Category Badge Icon */}
                          <span
                            className={cx(
                              "grid size-7 shrink-0 place-items-center rounded-lg font-bold shadow-2xs mt-0.5",
                              n.type === "admin"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : n.type === "courier"
                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                                  : "bg-signal/15 text-signal",
                            )}
                          >
                            {n.type === "admin" ? (
                              <IconSpark width={13} height={13} />
                            ) : n.type === "courier" ? (
                              <IconTruck width={13} height={13} />
                            ) : (
                              <IconBot width={13} height={13} />
                            )}
                          </span>

                          {/* Content Body */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <p className="text-[12.5px] font-semibold text-text truncate leading-tight group-hover:text-signal transition-colors">
                                {n.title}
                              </p>
                              {n.unread && (
                                <span className="size-1.5 rounded-full bg-signal shrink-0" />
                              )}
                            </div>
                            <p className="text-[11px] text-text-3 leading-relaxed mt-0.5 line-clamp-2">
                              {n.body}
                            </p>
                            <span className="block font-mono text-[9.5px] text-text-3/60 mt-1">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-1.5 border-t border-line/60 text-center">
                      <Link
                        href="/console/automation"
                        onClick={() => setNotifOpen(false)}
                        className="text-[11.5px] font-semibold text-text-2 hover:text-signal transition-colors"
                      >
                        System Gateway Status ➔
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Body (0ms Latency + Smooth Fade Transition) */}
        <main
          key={pathname}
          className="min-w-0 flex-1 animate-in fade-in duration-100"
        >
          {children}
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
              />
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

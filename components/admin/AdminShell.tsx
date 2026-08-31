"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wordmark } from "@/components/ui/primitives";
import { IconClose, IconMenu } from "@/components/ui/icons";
import { SPRING } from "@/components/motion";
import { cx } from "@/lib/format";

type SVGProps = {
  width?: number;
  height?: number;
  className?: string;
};

const svgBase = (p: SVGProps) => ({
  width: p.width || 17.5,
  height: p.height || 17.5,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: p.className,
});

const NavIconOverview = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <path d="M3 12h3.5l2-6 3.5 12 2.5-8 1.5 2H21" />
  </svg>
);

const NavIconMerchants = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <path d="M3 9l9-6 9 6v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M9 22V12h6v10" />
  </svg>
);

const NavIconSubscriptions = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20M7 15h3" />
  </svg>
);

const NavIconPlans = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const NavIconFraud = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M12 8v4M12 16h.01" />
  </svg>
);

const NavIconAIGateway = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
);

const NavIconCouriers = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <path d="M5 18H3c-1.1 0-2-.9-2-2V8c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2h-1" />
    <path d="M15 11h4.6a2 2 0 0 1 1.7 1l1.7 2.8V16c0 1.1-.9 2-2 2h-1" />
    <circle cx="7.5" cy="18.5" r="2.5" />
    <circle cx="17.5" cy="18.5" r="2.5" />
  </svg>
);

const NavIconMeta = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const NavIconSupport = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="4" />
    <path d="m4.93 4.93 4.24 4.24M14.83 14.83l4.24 4.24M14.83 9.17l4.24-4.24M4.93 19.07l4.24-4.24" />
  </svg>
);

const NavIconAnalytics = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

const NavIconBackups = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const NavIconSystem = (p: SVGProps) => (
  <svg {...svgBase(p)}>
    <rect x="2" y="2" width="20" height="8" rx="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" />
    <path d="M6 6h.01M6 18h.01" />
  </svg>
);

type AdminNavItem = {
  label: string;
  href: string;
  icon: (p: SVGProps) => ReactNode;
  hint: string;
  badge?: string;
  statusDot?: boolean;
};

const ADMIN_NAV: { group: string; items: AdminNavItem[] }[] = [
  {
    group: "Platform",
    items: [
      {
        label: "Overview",
        href: "/admin",
        icon: NavIconOverview,
        hint: "Live MRR, GMV & Platform Feed",
      },
      {
        label: "Merchants",
        href: "/admin/users",
        icon: NavIconMerchants,
        hint: "148 registered stores",
        badge: "148",
      },
      {
        label: "Subscriptions",
        href: "/admin/subscriptions",
        icon: NavIconSubscriptions,
        hint: "bKash, Nagad & Invoices",
      },
      {
        label: "Plan Builder",
        href: "/admin/plans",
        icon: NavIconPlans,
        hint: "Custom pricing tiers & limits",
      },
    ],
  },
  {
    group: "AI & Channels",
    items: [
      {
        label: "AI Gateway",
        href: "/admin/ai-gateway",
        icon: NavIconAIGateway,
        hint: "Multi-AI failover router",
        badge: "5 Keys",
      },
      {
        label: "Meta WABA",
        href: "/admin/meta-apps",
        icon: NavIconMeta,
        hint: "WhatsApp & Messenger tokens",
      },
      {
        label: "Couriers",
        href: "/admin/couriers",
        icon: NavIconCouriers,
        hint: "Steadfast & Pathao routing",
      },
    ],
  },
  {
    group: "Operations & Control",
    items: [
      {
        label: "Support Desk",
        href: "/admin/support",
        icon: NavIconSupport,
        hint: "Inspect & fix bot errors",
        badge: "2 New",
      },
      {
        label: "AI Analytics",
        href: "/admin/analytics",
        icon: NavIconAnalytics,
        hint: "Bangla NLU & Vision stats",
      },
      {
        label: "Fraud Shield",
        href: "/admin/fraud-shield",
        icon: NavIconFraud,
        hint: "Fake COD & delivery blacklist",
        badge: "Soon",
      },
      {
        label: "System Health",
        href: "/admin/system",
        icon: NavIconSystem,
        hint: "Meta APIs, LLMs & Queues",
        statusDot: true,
      },
      {
        label: "Backups & Export",
        href: "/admin/backups",
        icon: NavIconBackups,
        hint: "1-click CSV & database snapshots",
      },
    ],
  },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const currentNav = ADMIN_NAV.flatMap((g) => g.items).find(
    (i) => i.href === pathname,
  );

  return (
    <div className="min-h-screen bg-canvas bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(16,185,129,0.03),rgba(255,255,255,0))] text-text flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[272px] flex-col border-r border-line/80 bg-white/80 backdrop-blur-2xl shrink-0 sticky top-0 h-screen z-30 shadow-[inset_-1px_0_0_rgba(255,255,255,0.7)]">
        {/* Clean Logo Header */}
        <div className="p-5 border-b border-line/60">
          <Link
            href="/admin"
            className="inline-block transition-transform active:scale-[0.98]"
          >
            <Wordmark />
          </Link>
        </div>

        {/* Navigation Groups with Generous Section Spacing */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-6">
          {ADMIN_NAV.map((group) => (
            <div key={group.group}>
              <p className="px-3 pb-2 text-[13px] font-bold text-text/85 tracking-tight select-none">
                {group.group}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cx(
                          "group relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px] font-medium transition-colors duration-150 active:scale-[0.98]",
                          active
                            ? "text-signal font-semibold"
                            : "text-text-2 hover:bg-surface-2 hover:text-text",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="admin-nav-active-pill"
                            transition={{
                              type: "spring",
                              stiffness: 450,
                              damping: 32,
                              mass: 0.6,
                            }}
                            className="absolute inset-0 -z-10 rounded-xl border border-[color:var(--signal-line)] bg-signal-wash shadow-xs"
                          />
                        )}
                        <Icon
                          width={18}
                          height={18}
                          className={cx(
                            "shrink-0 transition-colors",
                            active
                              ? "text-signal"
                              : "text-text-3 group-hover:text-text",
                          )}
                        />
                        <span className="flex-1 whitespace-nowrap tracking-tight">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={cx(
                              "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight shadow-xs",
                              item.badge === "Soon"
                                ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                                : item.badge === "2 New"
                                  ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                  : "bg-signal/10 text-signal border border-signal/20",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.statusDot && (
                          <span className="size-1.5 rounded-full bg-signal animate-pulse" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Sidebar Minimalist Footer */}
        <div className="p-3.5 border-t border-line/60 bg-surface-2/40 flex items-center justify-between text-[11.5px] text-text-3">
          <span className="flex items-center gap-1.5 font-medium text-text-2">
            <span className="size-1.5 rounded-full bg-signal animate-pulse" />
            Platform Engine
          </span>
          <span className="font-mono text-[10.5px] text-text-3">
            v2.4 Stable
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar with Translucent Glass Backdrop */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line/70 bg-white/80 px-5 lg:px-8 backdrop-blur-2xl shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          {/* Mobile Menu Button + Clean Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="grid size-9 place-items-center rounded-xl border border-line bg-white/90 text-text-2 shadow-xs lg:hidden cursor-pointer active:scale-95 transition-transform"
            >
              <IconMenu width={16} height={16} />
            </button>
            <div className="flex items-center">
              <h1 className="text-[15.5px] font-bold text-text tracking-tight">
                {pathname === "/admin/settings"
                  ? "Security & Settings"
                  : pathname === "/admin/system"
                    ? "System Health"
                    : currentNav?.label || "Overview"}
              </h1>
            </div>
          </div>

          {/* Right Header Status & Admin Avatar with Interactive Dropdown */}
          <div className="flex items-center gap-2.5">
            {/* Compact Live Telemetry Glass HUD */}
            <div className="hidden sm:flex items-center gap-3 rounded-xl border border-line/80 bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-xs">
              {/* Metric 1: AI Failover */}
              <Link
                href="/admin/ai-gateway"
                title="AI Gateway & Live Failover Chain"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <span className="size-1.5 rounded-full bg-signal shrink-0 animate-pulse" />
                <div className="text-left">
                  <p className="font-semibold text-text text-[11px] leading-tight">
                    Multi-AI (5 Keys)
                  </p>
                  <p className="text-[9.5px] text-signal font-medium leading-none">
                    Gemini + OpenAI
                  </p>
                </div>
              </Link>

              <span className="h-5 w-px bg-line" />

              {/* Metric 2: 24h Message Volume & AI Resolution */}
              <Link
                href="/admin/analytics"
                title="24h Message Traffic & AI Resolution Rate"
                className="hidden md:flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <div className="text-left">
                  <p className="font-semibold text-text text-[11px] leading-tight">
                    38.5k msgs
                  </p>
                  <p className="text-[9.5px] text-text-3 font-medium leading-none">
                    94.4% Auto-Closed
                  </p>
                </div>
              </Link>

              <span className="hidden md:block h-5 w-px bg-line" />

              {/* Metric 3: Active Couriers */}
              <Link
                href="/admin/couriers"
                title="Steadfast & Pathao Courier Auto-Routing"
                className="hidden lg:flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <div className="text-left">
                  <p className="font-semibold text-text text-[11px] leading-tight">
                    Couriers 98.8%
                  </p>
                  <p className="text-[9.5px] text-text-3 font-medium leading-none">
                    Steadfast + Pathao
                  </p>
                </div>
              </Link>

              <span className="hidden lg:block h-5 w-px bg-line" />

              {/* Metric 4: Platform MRR */}
              <Link
                href="/admin/subscriptions"
                title="Monthly Recurring Revenue"
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <div className="text-left">
                  <p className="font-bold text-text text-[11px] leading-tight">
                    MRR ৳৬.৮৪L
                  </p>
                  <p className="text-[9.5px] text-signal font-medium leading-none">
                    +18.2% MoM
                  </p>
                </div>
              </Link>
            </div>

            {/* Administrator Avatar Trigger (Only Trigger on Topbar) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="Admin Profile Menu"
                className="grid size-9 place-items-center rounded-xl border border-line bg-white shadow-xs hover:border-signal/40 hover:shadow-sm active:scale-95 transition-all cursor-pointer select-none"
              >
                <div className="grid size-7 place-items-center rounded-lg bg-surface-2 border border-line/80 text-text font-bold text-[12px]">
                  A
                </div>
              </button>

              {/* Profile Dropdown Solid Menu */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    {/* Backdrop dismiss */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.12 }}
                      className="absolute right-0 mt-2 z-50 w-60 rounded-2xl border border-line bg-white p-2 shadow-2xl ring-1 ring-black/5"
                    >
                      {/* User Info Header with Avatar */}
                      <div className="flex items-center gap-2.5 p-2.5 border-b border-line">
                        <div className="grid size-8 place-items-center rounded-lg bg-surface-2 border border-line text-text font-bold text-[12px] shrink-0">
                          A
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-bold text-text leading-tight truncate">
                            Platform Admin
                          </p>
                          <p className="text-[11px] text-text-3 font-mono truncate mt-0.5">
                            admin@nextproduct.ai
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Actions */}
                      <div className="py-1.5 space-y-0.5 text-[13px]">
                        <Link
                          href="/admin/settings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-text-2 hover:bg-surface-2 hover:text-text transition-colors group"
                        >
                          <svg
                            width={15}
                            height={15}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-text-3 group-hover:text-text"
                          >
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                          </svg>
                          <span>Security & Settings</span>
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <div className="pt-1 border-t border-line">
                        <Link
                          href="/admin/login"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] font-medium text-text-2 hover:bg-rose-50 hover:text-rose-600 transition-colors group"
                        >
                          <svg
                            width={15}
                            height={15}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-text-3 group-hover:text-rose-600"
                          >
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                          </svg>
                          <span>Log Out</span>
                        </Link>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 lg:hidden backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={SPRING}
                className="w-72 h-full bg-white border-r border-line p-5 flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between pb-4 border-b border-line">
                  <Wordmark />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    className="grid size-8 place-items-center rounded-lg border border-line text-text-2 cursor-pointer"
                  >
                    <IconClose width={14} height={14} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-3 space-y-5">
                  {ADMIN_NAV.map((group) => (
                    <div key={group.group}>
                      <p className="px-2.5 pb-1.5 text-[13px] font-bold text-text/85 tracking-tight select-none">
                        {group.group}
                      </p>
                      <ul className="space-y-0.5">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const active = pathname === item.href;
                          return (
                            <li key={item.href}>
                              <Link
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className={cx(
                                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[14px] font-medium",
                                  active
                                    ? "bg-signal-wash text-signal font-semibold border border-[color:var(--signal-line)]"
                                    : "text-text-2 hover:bg-surface-2",
                                )}
                              >
                                <Icon width={18} height={18} />
                                <span className="flex-1 whitespace-nowrap">
                                  {item.label}
                                </span>
                                {item.badge && (
                                  <span
                                    className={cx(
                                      "rounded-md px-2 py-0.5 font-mono text-[11px] font-bold tracking-tight shadow-xs",
                                      item.badge === "Soon"
                                        ? "bg-amber-500/10 text-amber-700 border border-amber-500/20"
                                        : item.badge === "2 New"
                                          ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                                          : "bg-signal/10 text-signal border border-signal/20",
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Content Body with Smooth Route Transition */}
        <main className="flex-1 p-5 sm:p-7 lg:p-9 max-w-[1440px] w-full mx-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

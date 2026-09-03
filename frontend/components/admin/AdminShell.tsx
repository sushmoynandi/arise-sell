"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, type ReactNode } from "react";
import { Wordmark } from "@/components/ui/primitives";
import { IconClose, IconMenu } from "@/components/ui/icons";
import { cx } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

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
        hint: "154 registered stores",
        badge: "154",
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
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [telemetryDropdownOpen, setTelemetryDropdownOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") return;
    if (!loading && (!isAuthenticated || !user?.is_superadmin)) {
      router.push(`/admin/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [loading, isAuthenticated, user, router, pathname]);

  // The login page manages its own dedicated full-page presentation
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const currentNav = ADMIN_NAV.flatMap((g) => g.items).find(
    (i) => i.href === pathname,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="inline-block size-6 animate-spin rounded-full border-2 border-line border-t-signal" />
          <p className="text-xs font-mono text-text-3">
            Verifying superadmin authorization...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-text flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-65 flex-col border-r border-line bg-white shrink-0 sticky top-0 h-screen z-30">
        {/* Clean Logo Header */}
        <div className="p-5 border-b border-line">
          <Link
            href="/admin"
            prefetch={true}
            onMouseEnter={() => router.prefetch("/admin")}
            className="inline-block"
          >
            <Wordmark />
          </Link>
        </div>

        {/* Navigation Groups - Clean, Borderless & Instant */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {ADMIN_NAV.map((group) => (
            <div key={group.group}>
              <p className="px-3 pb-1.5 text-[11px] font-mono uppercase font-bold text-text-3 tracking-wider select-none">
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
                        prefetch={true}
                        onMouseEnter={() => router.prefetch(item.href)}
                        className={cx(
                          "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13.5px] cursor-pointer select-none transition-colors duration-75",
                          active
                            ? "bg-signal/9 text-signal font-bold"
                            : "text-text-2 hover:bg-surface-2 hover:text-text font-medium",
                        )}
                      >
                        <Icon
                          width={17.5}
                          height={17.5}
                          className={cx(
                            "shrink-0",
                            active ? "text-signal" : "text-text-3",
                          )}
                        />
                        <span className="flex-1 whitespace-nowrap tracking-tight">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={cx(
                              "rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-bold tracking-tight",
                              item.badge === "Soon"
                                ? "bg-amber-500/10 text-amber-700"
                                : item.badge === "2 New"
                                  ? "bg-rose-500/10 text-rose-600"
                                  : "bg-signal/10 text-signal",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.statusDot && (
                          <span className="size-1.5 rounded-full bg-signal" />
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
        <div className="p-3.5 border-t border-line bg-canvas/40 flex items-center justify-between text-[11.5px] text-text-3">
          <span className="flex items-center gap-1.5 font-medium text-text-2">
            <span className="size-1.5 rounded-full bg-signal" />
            Platform Engine
          </span>
          <span className="font-mono text-[10.5px] text-text-3">
            v2.4 Stable
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-5 lg:px-8">
          {/* Mobile Menu Button + Page Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="grid size-9 place-items-center rounded-xl border border-line bg-white text-text-2 lg:hidden cursor-pointer"
            >
              <IconMenu width={16} height={16} />
            </button>
            <div className="flex items-center">
              <h1 className="text-[18px] sm:text-[19px] font-bold text-text tracking-tight font-display">
                {pathname === "/admin/settings"
                  ? "Security & Settings"
                  : pathname === "/admin/system"
                    ? "System Health"
                    : currentNav?.label || "Overview"}
              </h1>
            </div>
          </div>

          {/* Right Header Status & Admin Avatar */}
          <div className="flex items-center gap-2.5">
            {/* Live Telemetry HUD Dropdown (in Top Navbar) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setTelemetryDropdownOpen(!telemetryDropdownOpen)}
                className="flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-1.5 shadow-2xs hover:border-signal/40 transition-colors cursor-pointer select-none"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-[11.5px] font-bold text-text hidden sm:inline">
                  Infrastructure
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  99.98% SLA
                </span>
              </button>

              {/* Infrastructure Telemetry Dropdown Card */}
              {telemetryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setTelemetryDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-72 sm:w-80 rounded-2xl border border-line bg-white p-3.5 shadow-2xl ring-1 ring-black/5 animate-in fade-in space-y-2.5">
                    <div className="flex items-center justify-between pb-2 border-b border-line">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        <span className="text-[13px] font-bold text-text">
                          Infrastructure Telemetry
                        </span>
                      </div>
                      <Link
                        href="/admin/system"
                        prefetch={true}
                        onClick={() => setTelemetryDropdownOpen(false)}
                        className="text-[11px] text-signal font-semibold hover:underline"
                      >
                        System API →
                      </Link>
                    </div>

                    <div className="space-y-1.5">
                      {[
                        {
                          name: "Meta WhatsApp Cloud API",
                          category: "Messaging Gateway",
                          latency: "142ms",
                        },
                        {
                          name: "Meta Messenger Graph API",
                          category: "Messaging Gateway",
                          latency: "168ms",
                        },
                        {
                          name: "AI Intent Engine (Bangla NLU)",
                          category: "Core Inference",
                          latency: "1.12s",
                        },
                        {
                          name: "Product Vision Matcher (VectorDB)",
                          category: "Catalog Intelligence",
                          latency: "280ms",
                        },
                        {
                          name: "Steadfast Courier Bridge",
                          category: "Logistics Router",
                          latency: "95ms",
                        },
                        {
                          name: "bKash Tokenized Gateway",
                          category: "Payment Rails",
                          latency: "210ms",
                        },
                      ].map((srv) => (
                        <div
                          key={srv.name}
                          className="flex items-center justify-between p-2 rounded-lg bg-surface-2/30 border border-line/60 text-[11.5px]"
                        >
                          <div>
                            <span className="text-text font-medium block truncate max-w-42.5">
                              {srv.name}
                            </span>
                            <span className="text-[9.5px] text-text-3 font-mono">
                              {srv.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10.5px] text-text-2 font-medium">
                              {srv.latency}
                            </span>
                            <span className="size-1.5 rounded-full bg-emerald-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Live Metric HUD Pills */}
            <div className="hidden md:flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-1.5 shadow-2xs">
              <Link
                href="/admin/ai-gateway"
                prefetch={true}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
              >
                <span className="size-1.5 rounded-full bg-signal shrink-0" />
                <div className="text-left">
                  <p className="font-semibold text-text text-[11px] leading-tight">
                    Multi-AI (5 Keys)
                  </p>
                  <p className="text-[9.5px] text-signal font-medium leading-none">
                    Gemini + OpenAI
                  </p>
                </div>
              </Link>

              <span className="h-4 w-px bg-line" />

              <Link
                href="/admin/analytics"
                prefetch={true}
                className="hidden lg:flex items-center gap-1.5 hover:opacity-80 transition-opacity"
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

              <span className="hidden lg:block h-4 w-px bg-line" />

              <Link
                href="/admin/couriers"
                prefetch={true}
                className="hidden xl:flex items-center gap-1.5 hover:opacity-80 transition-opacity"
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
            </div>

            {/* Administrator Avatar Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                aria-label="Admin Profile Menu"
                className="grid size-9 place-items-center rounded-xl border border-line bg-white shadow-2xs hover:border-signal/40 transition-colors cursor-pointer select-none"
              >
                <div className="grid size-7 place-items-center rounded-lg bg-surface-2 text-text font-bold text-[12px]">
                  {user?.first_name
                    ? user.first_name.charAt(0).toUpperCase()
                    : "A"}
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-50 w-60 rounded-2xl border border-line bg-white p-2 shadow-2xl ring-1 ring-black/5 animate-in fade-in">
                    <div className="flex items-center gap-2.5 p-2.5 border-b border-line">
                      <div className="grid size-8 place-items-center rounded-lg bg-surface-2 border border-line text-text font-bold text-[12px] shrink-0">
                        {user?.first_name
                          ? user.first_name.charAt(0).toUpperCase()
                          : "A"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-bold text-text leading-tight truncate">
                          {user?.first_name
                            ? `${user.first_name} ${user.last_name || ""}`.trim()
                            : "Platform Admin"}
                        </p>
                        <p className="text-[11px] text-text-3 font-mono truncate mt-0.5">
                          {user?.email || "admin@nextproduct.ai"}
                        </p>
                      </div>
                    </div>

                    <div className="py-1 space-y-0.5 text-[13px]">
                      <Link
                        href="/admin/settings"
                        prefetch={true}
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-text-2 hover:bg-surface-2 hover:text-text transition-colors"
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
                          className="text-text-3"
                        >
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                        <span>Security & Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-line">
                      <button
                        type="button"
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          router.push("/admin/login");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-[13px] font-medium text-text-2 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
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
                          className="text-text-3"
                        >
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                        </svg>
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="w-72 h-full bg-white border-r border-line p-5 flex flex-col animate-in slide-in-from-left duration-150"
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
                    <p className="px-2.5 pb-1 text-[11px] font-mono uppercase font-bold text-text-3 tracking-wider select-none">
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
                              prefetch={true}
                              onClick={() => setMobileOpen(false)}
                              className={cx(
                                "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13.5px] font-medium",
                                active
                                  ? "bg-signal/9 text-signal font-bold"
                                  : "text-text-2 hover:bg-surface-2",
                              )}
                            >
                              <Icon width={17.5} height={17.5} />
                              <span className="flex-1 whitespace-nowrap">
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className="rounded-md px-1.5 py-0.5 font-mono text-[10.5px] font-bold">
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
            </div>
          </div>
        )}

        {/* Page Content Body (Smooth 100ms Native Transition) */}
        <main
          key={pathname}
          className="flex-1 p-5 sm:p-7 lg:p-9 max-w-360 w-full mx-auto animate-in fade-in duration-100"
        >
          {children}
        </main>
      </div>
    </div>
  );
}

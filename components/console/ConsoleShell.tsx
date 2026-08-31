"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CONSOLE_NAV } from "@/lib/brand";
import { TENANT, TEAM } from "@/data/tenant";
import { Avatar, Badge, Meter, Wordmark } from "@/components/ui/primitives";
import {
  NAV_ICON,
  IconClose,
  IconMenu,
  IconSearch,
  IconSpark,
} from "@/components/ui/icons";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import { cx } from "@/lib/format";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-6">
      {CONSOLE_NAV.map((group) => (
        <div key={group.group}>
          <p className="px-3 pb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-text-3">
            {group.group}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = NAV_ICON[item.icon as keyof typeof NAV_ICON];
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cx(
                      "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] transition-colors duration-150",
                      active
                        ? "text-text"
                        : "text-text-2 hover:bg-surface-2 hover:text-text",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="console-nav-active"
                        transition={SPRING}
                        className="absolute inset-0 -z-10 rounded-lg border border-[color:var(--signal-line)] bg-signal-wash"
                      />
                    )}
                    <Icon
                      width={16}
                      height={16}
                      className={cx(
                        "shrink-0 transition-colors",
                        active
                          ? "text-signal"
                          : "text-text-3 group-hover:text-text-2",
                      )}
                    />
                    <span className="flex-1 truncate">{item.label}</span>
                    {"badge" in item && item.badge && (
                      <span className="rounded-full bg-signal px-1.5 py-px font-mono text-[10px] font-semibold text-signal-ink">
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
    </nav>
  );
}

function QuotaCard() {
  const pct = Math.round((TENANT.ordersUsed / TENANT.ordersQuota) * 100);
  return (
    <div className="rounded-xl border border-line bg-canvas p-3.5">
      <div className="flex items-center justify-between">
        <span className="text-[11.5px] text-text-3">Closed orders</span>
        <Badge tone="signal">{TENANT.plan}</Badge>
      </div>
      <p className="mt-2 font-display text-[19px] font-semibold tracking-tight">
        {TENANT.ordersUsed.toLocaleString()}
        <span className="text-[13px] font-normal text-text-3">
          {" "}
          / {TENANT.ordersQuota.toLocaleString()}
        </span>
      </p>
      <Meter
        value={pct}
        max={100}
        tone={pct > 85 ? "amber" : "signal"}
        className="mt-2.5"
      />
      <p className="mt-2 text-[11px] text-text-3">
        Resets in 9 days · then ৳4 each
      </p>
    </div>
  );
}

export default function ConsoleShell({ children }: { children: ReactNode }) {
  const [mobileNav, setMobileNav] = useState(false);
  const online = TEAM.filter((t) => t.online);

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ---------------- sidebar (desktop) ---------------- */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface px-4 py-5 lg:flex">
        <Link href="/" className="mb-7 px-2">
          <Wordmark />
        </Link>

        {/* tenant */}
        <button className="mb-6 flex w-full items-center gap-2.5 rounded-xl border border-line bg-canvas px-3 py-2.5 text-left transition-colors hover:border-[color:var(--signal-line)]">
          <span
            className="grid size-7 shrink-0 place-items-center rounded-lg font-display text-[13px] font-semibold"
            style={{
              background: `hsl(${TENANT.logoHue} 60% 94%)`,
              color: `hsl(${TENANT.logoHue} 62% 27%)`,
            }}
          >
            N
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-text">
              {TENANT.name}
            </span>
            <span className="block truncate text-[11px] text-text-3">
              {TENANT.pages} pages
            </span>
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            className="text-text-3"
          >
            <path
              d="m8 10 4-4 4 4M8 14l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto">
          <NavList />
        </div>

        <div className="space-y-3 pt-5">
          <QuotaCard />
          <div className="flex items-center gap-2 px-1">
            <div className="flex -space-x-2">
              {online.map((m) => (
                <span key={m.name} className="ring-2 ring-surface">
                  <Avatar name={m.name} hue={m.hue} size={22} />
                </span>
              ))}
            </div>
            <span className="text-[11.5px] text-text-3">
              {online.length} on shift
            </span>
          </div>
        </div>
      </aside>

      {/* ---------------- main ---------------- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-xl lg:px-6">
          <button
            onClick={() => setMobileNav(true)}
            className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-surface-2 lg:hidden"
            aria-label="Open navigation"
          >
            <IconMenu width={19} height={19} />
          </button>

          <label className="relative hidden min-w-0 flex-1 items-center sm:flex lg:max-w-sm">
            <IconSearch
              width={15}
              height={15}
              className="pointer-events-none absolute left-3 text-text-3"
            />
            <input
              placeholder="Search orders, customers, SKUs…"
              className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-16 text-[13px] text-text placeholder:text-text-3 focus:border-[color:var(--signal-line)] focus:outline-none"
            />
            <kbd className="pointer-events-none absolute right-2.5 rounded border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-text-3">
              ⌘K
            </kbd>
          </label>

          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-lg border border-[color:var(--signal-line)] bg-signal-wash px-2.5 py-1.5 font-mono text-[11px] text-signal md:inline-flex">
              <IconSpark width={12} height={12} />
              ৳386 today
            </span>
            <span className="hidden h-5 w-px bg-line md:block" />
            <Avatar name="Farhana Rahman" hue={82} size={30} />
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      {/* ---------------- sidebar (mobile) ---------------- */}
      <AnimatePresence>
        {mobileNav && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNav(false)}
              className="fixed inset-0 z-40 bg-ink/45 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={SPRING_SOFT}
              className="fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-line bg-surface px-4 py-5 lg:hidden"
            >
              <div className="mb-7 flex items-center justify-between px-1">
                <Wordmark />
                <button
                  onClick={() => setMobileNav(false)}
                  className="grid size-8 place-items-center rounded-lg text-text-2 hover:bg-surface-2"
                  aria-label="Close navigation"
                >
                  <IconClose width={18} height={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <NavList onNavigate={() => setMobileNav(false)} />
              </div>
              <div className="pt-5">
                <QuotaCard />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

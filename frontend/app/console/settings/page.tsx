"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import { Badge, Button, Panel, PanelHead } from "@/components/ui/primitives";
import { IconCheck, IconTruck } from "@/components/ui/icons";
import { TENANT } from "@/data/tenant";
import { PLANS } from "@/data/plans";
import { cx } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";

/* ─── Tab definitions ─── */
const TABS = [
  { id: "account", label: "Account Info" },
  { id: "business", label: "Business Settings" },
  { id: "branding", label: "Branding" },
  { id: "billing", label: "Billing" },
  { id: "notifications", label: "Notifications" },
  { id: "meta", label: "Meta Ad Conversions" },
  { id: "courier", label: "Courier" },
  { id: "product-feed", label: "Product Feed" },
  { id: "team", label: "Team & Roles" },
  { id: "preferences", label: "AI Preferences" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─── Inner component that uses searchParams ─── */
function SettingsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = (searchParams.get("tab") as TabId) || "account";
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : "account",
  );

  const switchTab = (id: TabId) => {
    setActiveTab(id);
    router.replace(`/console/settings?tab=${id}`, { scroll: false });
  };

  return (
    <>
      <PageHeader
        title="Settings"
        sub="Manage your account, business configuration, billing, team permissions, and AI behavior."
        actions={
          <Badge tone="mint" dot>
            {TENANT.plan} Plan
          </Badge>
        }
      />

      {/* ─── Horizontal Tab Bar ─── */}
      <div className="sticky top-16 z-20 border-b border-line bg-canvas/90 backdrop-blur-xl">
        <div className="flex items-center gap-0 overflow-x-auto px-5 lg:px-8 scrollbar-none">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => switchTab(tab.id)}
              className={cx(
                "relative shrink-0 cursor-pointer px-4 py-3 text-[13px] font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "text-signal font-bold"
                  : "text-text-3 hover:text-text",
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="settings-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-[2.5px] rounded-full bg-signal"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="p-5 lg:p-8 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "account" && <TabAccount />}
            {activeTab === "business" && <TabBusiness />}
            {activeTab === "branding" && <TabBranding />}
            {activeTab === "billing" && <TabBilling />}
            {activeTab === "notifications" && <TabNotifications />}
            {activeTab === "meta" && <TabMeta />}
            {activeTab === "courier" && <TabCourier />}
            {activeTab === "product-feed" && <TabProductFeed />}
            {activeTab === "team" && <TabTeam />}
            {activeTab === "preferences" && <TabPreferences />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

/* ─── Page export with Suspense ─── */
export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32 text-text-3 text-sm">
          Loading settings…
        </div>
      }
    >
      <SettingsInner />
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Account Info
   ═══════════════════════════════════════════════════════════════════ */
function TabAccount() {
  const { user, deleteAccount } = useAuth();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fullName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
    : "Farhana Rahman";
  const userEmail = user?.email || "farhana@nokshi.co";
  const userInitials = user
    ? `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() ||
      "FR"
    : "FR";

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    const targetEmail = user?.email?.toLowerCase().trim() || "";
    const cleanPhrase = confirmPhrase.trim();

    if (cleanPhrase !== "DELETE" && cleanPhrase.toLowerCase() !== targetEmail) {
      setDeleteError(`Please type DELETE or ${userEmail} to confirm.`);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAccount({
        confirm_phrase: cleanPhrase,
        password: password.trim() || undefined,
      });
      if (res.success) {
        window.location.href = "/login?deleted=true";
      } else {
        setDeleteError(
          res.error ||
            "Failed to delete account. Please check your credentials.",
        );
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Account deletion failed";
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Owner Profile"
          sub="Primary account owner credentials and identity."
        />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-signal/15 text-signal font-bold grid place-items-center text-xl font-display">
              {userInitials}
            </div>
            <div>
              <h3 className="text-lg font-bold text-text">{fullName}</h3>
              <p className="text-sm text-text-3 font-mono">{userEmail}</p>
              <Badge tone="mint" className="mt-1 capitalize">
                {user?.role || "Owner"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line/60">
            <SettingsField label="Full Name" value={fullName} />
            <SettingsField label="Email Address" value={userEmail} />
            <SettingsField
              label="Account Role"
              value={user?.role?.toUpperCase() || "OWNER"}
            />
            <SettingsField
              label="Status"
              value={user?.is_verified ? "Verified Active Account" : "Active"}
              disabled
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Security"
          sub="Password, two-factor authentication, and login sessions."
        />
        <div className="divide-y divide-line/60">
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text">Password</p>
              <p className="text-xs text-text-3 mt-0.5">
                Managed securely with bcrypt hashing
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                alert(
                  "To change your password, use the 'Forgot password' option on login.",
                )
              }
            >
              Change Password
            </Button>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-text">Session Protection</p>
              <p className="text-xs text-text-3 mt-0.5">
                JWT Authentication with sliding window rate limiting
              </p>
            </div>
            <Badge tone="mint" dot>
              Active
            </Badge>
          </div>
        </div>
      </Panel>

      {/* ─── Danger Zone: Permanent Account Deletion ─── */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-red-700">
                Danger Zone
              </span>
            </div>
            <h3 className="mt-2 text-base font-bold text-red-950 font-display">
              Delete Account & Store
            </h3>
            <p className="mt-1 text-xs text-red-700 max-w-xl leading-relaxed">
              Permanently delete your personal profile, credentials, store
              settings, product catalogs, connected channels, and conversations.
              This action is irreversible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmPhrase("");
              setPassword("");
              setDeleteModalOpen(true);
            }}
            className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-2xs cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-red-100 text-red-600 text-lg">
                  ⚠️
                </span>
                <div>
                  <h3 className="text-lg font-bold text-text font-display">
                    Delete Account Permanently?
                  </h3>
                  <p className="text-xs text-text-3">
                    This action is immediate and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 p-3.5 text-xs text-red-800 space-y-1.5">
                <p className="font-semibold">
                  The following data will be erased immediately:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li>Your user login credentials and session tokens</li>
                  <li>Your merchant store catalogs, orders, and products</li>
                  <li>WhatsApp and Facebook Messenger live connections</li>
                  <li>Customer conversation logs and AI knowledge base</li>
                </ul>
              </div>

              {deleteError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600">
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    To confirm, please type{" "}
                    <span className="font-mono text-red-600 font-bold">
                      DELETE
                    </span>{" "}
                    or your email (
                    <span className="font-mono text-text-2">{userEmail}</span>):
                  </label>
                  <input
                    type="text"
                    value={confirmPhrase}
                    onChange={(e) => setConfirmPhrase(e.target.value)}
                    placeholder="DELETE"
                    required
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-text placeholder:text-text-3 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Enter Password (if your account uses one):
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Account password"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-text placeholder:text-text-3 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-text-2 hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Permanently Delete Account</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Business Settings
   ═══════════════════════════════════════════════════════════════════ */
function TabBusiness() {
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Store Information"
          sub="Your business identity shown on invoices, receipts, and AI conversations."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField label="Business Name" value={TENANT.name} />
          <SettingsField label="Business Name (বাংলা)" value={TENANT.nameBn} />
          <SettingsField label="Industry / Category" value={TENANT.kind} />
          <SettingsField
            label="Operating Since"
            value={TENANT.since}
            disabled
          />
          <SettingsField
            label="Business Address"
            value="House 42, Road 11, Dhanmondi, Dhaka 1209"
          />
          <SettingsField label="Trade License No." value="DCCI-2021-4827XX" />
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Currency & Regional"
          sub="Localization settings for pricing, invoices, and date formats."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingsField label="Default Currency" value="BDT (৳)" disabled />
          <SettingsField
            label="Timezone"
            value="Asia/Dhaka (UTC +6)"
            disabled
          />
          <SettingsField label="Date Format" value="DD/MM/YYYY" />
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Branding
   ═══════════════════════════════════════════════════════════════════ */
function TabBranding() {
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Brand Assets"
          sub="Logo, colors, and visual identity used in customer-facing messages and invoices."
        />
        <div className="p-5 space-y-5">
          <div className="flex items-center gap-5">
            <div className="size-20 rounded-2xl border-2 border-dashed border-line bg-surface-2/40 grid place-items-center text-text-3 text-xs">
              Logo
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-bold text-text">Store Logo</p>
              <p className="text-xs text-text-3">
                Recommended: 512×512 PNG with transparent background
              </p>
              <Button size="sm" variant="outline">
                Upload Logo
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line/60">
            <div>
              <label className="block text-xs font-bold text-text mb-1.5">
                Brand Accent Color
              </label>
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-lg bg-signal border border-signal/40" />
                <span className="text-xs font-mono text-text-2">
                  #0a6e50 (Signal Green)
                </span>
              </div>
            </div>
            <SettingsField
              label="Invoice Tagline"
              value="নকশী — হাতে তৈরি বাংলাদেশ"
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="AI Chat Branding"
          sub="Personalize how the AI agent presents itself in customer conversations."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            label="AI Agent Display Name"
            value="Nokshi Assistant"
          />
          <SettingsField
            label="Greeting Style"
            value="স্বাগতম! নকশীতে আপনাকে সাহায্য করতে পেরে আনন্দিত।"
          />
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Billing
   ═══════════════════════════════════════════════════════════════════ */
function TabBilling() {
  const [topupSuccess, setTopupSuccess] = useState<string | null>(null);

  const handleTopup = (name: string) => {
    setTopupSuccess(name);
    setTimeout(() => setTopupSuccess(null), 4000);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {topupSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-4 text-[13px] text-signal font-medium flex items-center gap-2 shadow-sm"
          >
            <IconCheck width={16} height={16} />
            <span>
              Successfully added <strong>{topupSuccess}</strong>! Quota updated
              immediately.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Plan + Quota */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4 rounded-2xl border border-line bg-white p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-signal/15 px-2 py-0.5 font-mono text-[10px] font-bold text-signal uppercase tracking-wider">
                Current Plan
              </span>
              <span className="text-[11px] text-text-3 font-mono">
                Renews in 9 days
              </span>
            </div>
            <h3 className="text-2xl font-bold font-display text-text">
              {TENANT.plan} Plan
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="font-display text-3xl font-bold text-text">
                ৳৩,৯৯০
              </span>
              <span className="text-xs text-text-3 font-mono">/ month</span>
            </div>
          </div>
          <div className="pt-3 border-t border-line/60 space-y-1.5 text-xs text-text-2">
            <div className="flex justify-between">
              <span>Billing:</span>
              <span className="font-mono font-semibold text-text">
                bKash Auto-Debit
              </span>
            </div>
            <div className="flex justify-between">
              <span>Next Invoice:</span>
              <span className="font-mono font-semibold text-text">
                10 Sep, 2026
              </span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-2xl border border-line bg-white p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <h4 className="text-[15px] font-bold text-text">
              Quota Consumption
            </h4>
            <Badge tone="mint">{1500 - TENANT.ordersUsed} Left</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuotaBar
              label="Closed Orders"
              used={TENANT.ordersUsed}
              total={TENANT.ordersQuota}
            />
            <QuotaBar label="Meta CAPI Signals" used={4120} total={10000} />
            <QuotaBar label="Team Seats" used={4} total={8} />
            <QuotaBar label="Vision Searches" used={824} total={2000} />
          </div>
        </div>
      </div>

      {/* Top-Up */}
      <Panel>
        <PanelHead
          title="1-Click Quota Top-Up"
          sub="Top-up packs never expire and roll over month-to-month."
        />
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {[
            {
              name: "+500 Closed Orders",
              price: "৳১,২৫০",
              unit: "৳২.৫০/order",
              badge: "Most Popular",
            },
            {
              name: "+1,500 Closed Orders",
              price: "৳৩,২০০",
              unit: "৳২.১৩/order",
              badge: "Best Value",
            },
            {
              name: "+5,000 CAPI Signals",
              price: "৳৯৫০",
              unit: "ROAS boost",
              badge: "Ad Signals",
            },
          ].map((p) => (
            <div
              key={p.name}
              className="rounded-xl border border-line p-4 space-y-3 bg-surface-2/30 hover:border-signal/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-text">{p.name}</span>
                  <span className="text-[9.5px] font-mono font-bold bg-signal/15 text-signal px-2 py-0.5 rounded">
                    {p.badge}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xl font-bold font-display text-text">
                    {p.price}
                  </span>
                  <span className="text-[11px] text-text-3 font-mono">
                    ({p.unit})
                  </span>
                </div>
              </div>
              <Button
                size="sm"
                variant="signal"
                onClick={() => handleTopup(p.name)}
                className="w-full justify-center"
              >
                + Add to Quota
              </Button>
            </div>
          ))}
        </div>
      </Panel>

      {/* Plan Comparison */}
      <Panel>
        <PanelHead
          title="Compare Plans"
          sub="Upgrade or downgrade anytime. Unused quota is prorated."
        />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5">
          {PLANS.map((p) => {
            const isCurrent =
              p.name.toLowerCase() === TENANT.plan.toLowerCase();
            return (
              <div
                key={p.id}
                className={cx(
                  "rounded-2xl border p-4 space-y-3 flex flex-col justify-between",
                  isCurrent
                    ? "border-signal/60 bg-[#edf7f3]/40 ring-1.5 ring-signal/30 shadow-xs"
                    : "border-line bg-white hover:border-line/80",
                )}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-base text-text">{p.name}</h4>
                    {isCurrent && (
                      <span className="rounded bg-signal text-white px-1.5 py-0.5 text-[9.5px] font-bold">
                        CURRENT
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-3 min-h-[30px]">
                    {p.blurb}
                  </p>
                  <div className="flex items-baseline gap-1 pt-1">
                    <span className="text-xl font-bold font-display text-text">
                      ৳{p.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-text-3 font-mono">
                      / mo
                    </span>
                  </div>
                  <div className="rounded-lg bg-surface-2/60 p-2 font-mono text-[11px] text-text-2 font-semibold">
                    {p.orders.toLocaleString()} Orders/mo
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={isCurrent ? "outline" : "signal"}
                  disabled={isCurrent}
                  className="w-full justify-center"
                >
                  {isCurrent ? "Active Plan" : `Switch to ${p.name}`}
                </Button>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Invoices */}
      <Panel>
        <PanelHead
          title="Invoices & VAT Receipts"
          sub="Official downloadable tax receipts."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/50 text-[11px] uppercase font-bold text-text-3 font-mono">
              <tr>
                <th className="p-4">Invoice ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Description</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60 font-mono">
              {[
                {
                  id: "INV-2026-0801",
                  date: "Aug 01, 2026",
                  desc: "Karkhana Plan (Monthly)",
                  amount: 3990,
                },
                {
                  id: "INV-2026-0715",
                  date: "Jul 15, 2026",
                  desc: "+500 Closed Orders Top-Up",
                  amount: 1250,
                },
                {
                  id: "INV-2026-0701",
                  date: "Jul 01, 2026",
                  desc: "Karkhana Plan (Monthly)",
                  amount: 3990,
                },
                {
                  id: "INV-2026-0601",
                  date: "Jun 01, 2026",
                  desc: "Bazaar Plan (Monthly)",
                  amount: 1190,
                },
              ].map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-2/30">
                  <td className="p-4 font-bold text-text">{inv.id}</td>
                  <td className="p-4 text-text-3">{inv.date}</td>
                  <td className="p-4 font-sans font-medium text-text">
                    {inv.desc}
                  </td>
                  <td className="p-4 font-bold text-text">
                    ৳{inv.amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <span className="rounded-md bg-signal/15 px-2 py-0.5 text-[10px] font-bold text-signal font-sans">
                      Paid
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <a
                      href="#"
                      className="text-signal hover:underline text-xs font-sans font-medium"
                    >
                      Download ↓
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Notifications
   ═══════════════════════════════════════════════════════════════════ */
function TabNotifications() {
  const [orderAlert, setOrderAlert] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [campaignReport, setCampaignReport] = useState(false);
  const [quotaWarn, setQuotaWarn] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(true);

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Notification Preferences"
          sub="Control what alerts you receive and where (email, push, SMS)."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="New Order Confirmation"
            desc="Email + push notification when AI closes a new order."
            value={orderAlert}
            onToggle={setOrderAlert}
          />
          <ToggleRow
            label="Low Stock Alert"
            desc="Notify when any product variant drops below 5 units."
            value={lowStock}
            onToggle={setLowStock}
          />
          <ToggleRow
            label="Campaign Performance Report"
            desc="Weekly summary of broadcast open rates and conversions."
            value={campaignReport}
            onToggle={setCampaignReport}
          />
          <ToggleRow
            label="Quota Usage Warning"
            desc="Alert when order quota exceeds 80% of monthly limit."
            value={quotaWarn}
            onToggle={setQuotaWarn}
          />
          <ToggleRow
            label="Daily Revenue Digest"
            desc="Morning summary email with yesterday's revenue and top products."
            value={dailyDigest}
            onToggle={setDailyDigest}
          />
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Meta Ad Conversions
   ═══════════════════════════════════════════════════════════════════ */
function TabMeta() {
  const [capiEnabled, setCapiEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Meta Conversions API (CAPI)"
          sub="Server-side event tracking for Facebook & Instagram Ads. Improves ROAS by sending purchase, lead, and add-to-cart signals directly."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Server-Side CAPI Events"
            desc="Send purchase, lead, and initiate_checkout events to Meta from backend."
            value={capiEnabled}
            onToggle={setCapiEnabled}
          />
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField label="Pixel ID" value="7382910394XXXXX" />
            <SettingsField
              label="Access Token"
              value="EAABo••••••••••••••kZD"
            />
            <SettingsField label="Test Event Code" value="TEST42891" />
            <SettingsField
              label="Events Fired (This Month)"
              value="4,120 of 10,000"
              disabled
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Event Attribution"
          sub="Define which customer actions fire Meta CAPI events."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              event: "Purchase",
              desc: "When courier is booked & payment confirmed",
              status: true,
            },
            {
              event: "Lead",
              desc: "When customer provides name + address",
              status: true,
            },
            {
              event: "AddToCart",
              desc: "When AI recommends and customer says 'ok'",
              status: true,
            },
            {
              event: "InitiateCheckout",
              desc: "When AI sends invoice/COD confirmation",
              status: false,
            },
          ].map((e) => (
            <div
              key={e.event}
              className="rounded-xl border border-line p-3 flex items-center justify-between bg-surface-2/20"
            >
              <div>
                <p className="text-sm font-bold text-text">{e.event}</p>
                <p className="text-[11px] text-text-3">{e.desc}</p>
              </div>
              <Badge tone={e.status ? "mint" : "neutral"} dot={e.status}>
                {e.status ? "Active" : "Off"}
              </Badge>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Courier
   ═══════════════════════════════════════════════════════════════════ */
function TabCourier() {
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Courier Integrations"
          sub="Auto-booking with Steadfast, Pathao, and RedX for seamless COD delivery."
        />
        <div className="p-5 space-y-4">
          {[
            {
              name: "Steadfast Courier",
              status: "Connected",
              key: "sf_api_XXXX",
              area: "All Bangladesh",
              default: true,
            },
            {
              name: "Pathao Courier",
              status: "Connected",
              key: "pt_api_XXXX",
              area: "Dhaka Metro Only",
              default: false,
            },
            {
              name: "RedX",
              status: "Not Connected",
              key: "—",
              area: "—",
              default: false,
            },
          ].map((c) => (
            <div
              key={c.name}
              className={cx(
                "rounded-xl border p-4 flex items-center justify-between",
                c.status === "Connected"
                  ? "border-signal/40 bg-[#edf7f3]/30"
                  : "border-line bg-surface-2/20",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-lg bg-surface-2 border border-line grid place-items-center">
                  <IconTruck width={18} height={18} className="text-text-3" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text">{c.name}</p>
                  <p className="text-[11px] text-text-3 font-mono">
                    API Key: {c.key} · Coverage: {c.area}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                {c.default && (
                  <span className="text-[9.5px] font-bold bg-signal text-white px-2 py-0.5 rounded">
                    DEFAULT
                  </span>
                )}
                <Badge
                  tone={c.status === "Connected" ? "mint" : "neutral"}
                  dot={c.status === "Connected"}
                >
                  {c.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Delivery Zones & Pricing"
          sub="Custom delivery charges by area."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingsField label="Inside Dhaka" value="৳৬০" />
          <SettingsField label="Sub-Districts" value="৳১২০" />
          <SettingsField label="Outside Dhaka" value="৳১৫০" />
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Product Feed
   ═══════════════════════════════════════════════════════════════════ */
function TabProductFeed() {
  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Product Data Feed"
          sub="Auto-generated product feeds for Facebook Commerce Manager, Google Merchant Center, and Instagram Shopping."
        />
        <div className="p-5 space-y-4">
          {[
            {
              name: "Facebook Commerce Manager",
              format: "CSV / XML",
              lastSync: "2 hours ago",
              products: 47,
              status: true,
            },
            {
              name: "Google Merchant Center",
              format: "Google Shopping XML",
              lastSync: "6 hours ago",
              products: 47,
              status: true,
            },
            {
              name: "Instagram Shopping Tags",
              format: "Via FB Commerce",
              lastSync: "2 hours ago",
              products: 47,
              status: true,
            },
          ].map((feed) => (
            <div
              key={feed.name}
              className="rounded-xl border border-signal/30 bg-[#edf7f3]/20 p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-text">{feed.name}</p>
                <p className="text-[11px] text-text-3 font-mono">
                  Format: {feed.format} · {feed.products} products · Last sync:{" "}
                  {feed.lastSync}
                </p>
              </div>
              <Badge tone="mint" dot>
                Active
              </Badge>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Feed Schedule"
          sub="Control how often product data syncs to ad platforms."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField label="Sync Interval" value="Every 2 hours" />
          <SettingsField
            label="Feed URL"
            value="https://api.nextproduct.ai/feed/nokshi/products.xml"
            disabled
          />
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: Team & Roles
   ═══════════════════════════════════════════════════════════════════ */
function TabTeam() {
  const [members] = useState([
    {
      id: "m1",
      name: "Farhana Rahman",
      email: "farhana@nokshi.co",
      role: "Owner",
      online: true,
      channels: ["Messenger", "WhatsApp", "Instagram"],
    },
    {
      id: "m2",
      name: "Imran Kabir",
      email: "imran@nokshi.co",
      role: "Ops Lead",
      online: true,
      channels: ["WhatsApp", "Courier"],
    },
    {
      id: "m3",
      name: "Rafi Chowdhury",
      email: "rafi@nokshi.co",
      role: "Moderator",
      online: true,
      channels: ["Messenger", "Instagram"],
    },
    {
      id: "m4",
      name: "Sadia Noor",
      email: "sadia@nokshi.co",
      role: "Moderator",
      online: false,
      channels: ["Instagram"],
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Active Seats",
            value: "4 / 8",
            sub: "4 available on Karkhana plan",
          },
          {
            label: "Channel Coverage",
            value: "100%",
            sub: "All channels assigned",
          },
          { label: "2FA Status", value: "Enforced", sub: "OTP-secured logins" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-line bg-white p-5 shadow-2xs"
          >
            <p className="text-[12.5px] text-text-3 font-medium">{s.label}</p>
            <p className="mt-1.5 font-display text-[24px] font-bold text-text">
              {s.value}
            </p>
            <p className="mt-1 text-[11px] text-text-3 font-mono">{s.sub}</p>
          </div>
        ))}
      </div>

      <Panel>
        <PanelHead
          title="Store Teammates"
          sub="Users authorized to review AI conversations, book couriers, and modify inventory."
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/50 text-[11px] uppercase font-bold text-text-3 font-mono">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Channels</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-surface-2/30">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-signal/15 text-signal font-bold grid place-items-center text-xs">
                        {m.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-bold text-text">{m.name}</p>
                        <p className="text-[11px] text-text-3 font-mono">
                          {m.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={cx(
                        "rounded-md px-2 py-0.5 text-[10.5px] font-bold font-mono",
                        m.role === "Owner"
                          ? "bg-signal/15 text-signal"
                          : "bg-surface-2 text-text-2 border border-line",
                      )}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {m.channels.map((ch) => (
                        <span
                          key={ch}
                          className="rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-text-2 border border-line/60"
                        >
                          {ch}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge tone={m.online ? "mint" : "neutral"} dot={m.online}>
                      {m.online ? "Online" : "Offline"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    {m.role !== "Owner" ? (
                      <button className="text-text-3 hover:text-rose-600 text-xs font-medium cursor-pointer">
                        Edit
                      </button>
                    ) : (
                      <span className="text-[11px] text-text-3/60 font-mono">
                        Owner
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB: AI Preferences
   ═══════════════════════════════════════════════════════════════════ */
function TabPreferences() {
  const [dialect, setDialect] = useState<"bangla" | "banglish" | "english">(
    "bangla",
  );
  const [persona, setPersona] = useState<"friendly" | "urgent" | "formal">(
    "friendly",
  );
  const [autoPhoto, setAutoPhoto] = useState(true);
  const [scarcityNudge, setScarcityNudge] = useState(true);
  const [priceFloorLock, setPriceFloorLock] = useState(true);
  const [handoverAngry, setHandoverAngry] = useState(true);

  return (
    <div className="space-y-6">
      <Panel>
        <PanelHead
          title="Language & Dialect"
          sub="Choose how the AI responds in Bangla, Banglish, or English."
        />
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: "bangla" as const,
                label: "Shuddho Bangla (বাংলা)",
                desc: "Formal standard Bengali script.",
              },
              {
                id: "banglish" as const,
                label: "Banglish / Romanized",
                desc: "Natural Banglish phonetics.",
              },
              {
                id: "english" as const,
                label: "English & Bilingual",
                desc: "Fluent English with auto-mirror.",
              },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDialect(d.id)}
                className={cx(
                  "rounded-xl border p-4 text-left transition-all cursor-pointer",
                  dialect === d.id
                    ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30"
                    : "border-line bg-white hover:border-line/80",
                )}
              >
                <p className="font-bold text-sm text-text">{d.label}</p>
                <p className="text-[11.5px] text-text-3 mt-1">{d.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Persona & Closing Tone"
          sub="Determines emotional tone and sales urgency."
        />
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                id: "friendly" as const,
                label: "Polite & Helpful",
                desc: "Warm greetings (ভাইয়া/আপু), smooth closing.",
              },
              {
                id: "urgent" as const,
                label: "High-Energy Sales",
                desc: "Fast-selling urgency, limited deals, instant COD.",
              },
              {
                id: "formal" as const,
                label: "Premium & Minimalist",
                desc: "Corporate, brief, high-end boutique tone.",
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p.id)}
                className={cx(
                  "rounded-xl border p-4 text-left transition-all cursor-pointer",
                  persona === p.id
                    ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30"
                    : "border-line bg-white hover:border-line/80",
                )}
              >
                <p className="font-bold text-sm text-text">{p.label}</p>
                <p className="text-[11.5px] text-text-3 mt-1">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Automated Sales Behaviors"
          sub="Smart actions to accelerate conversion rates."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Instant Product Photo Dispatch"
            desc="Automatically attach high-res variant photos when customer asks."
            value={autoPhoto}
            onToggle={setAutoPhoto}
          />
          <ToggleRow
            label="Stock Scarcity Nudge"
            desc='Mention "Only a few left" when inventory is low.'
            value={scarcityNudge}
            onToggle={setScarcityNudge}
          />
          <ToggleRow
            label="Strict Price Floor Lock"
            desc="Never negotiate below catalog price without authorized voucher."
            value={priceFloorLock}
            onToggle={setPriceFloorLock}
          />
          <ToggleRow
            label="Angry Sentiment Handover"
            desc="Alert human moderators when customer shows frustration."
            value={handoverAngry}
            onToggle={setHandoverAngry}
          />
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Shared Helper Components
   ═══════════════════════════════════════════════════════════════════ */

function SettingsField({
  label,
  value,
  disabled,
}: {
  label: string;
  value: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-text mb-1.5">
        {label}
      </label>
      <input
        type="text"
        defaultValue={value}
        disabled={disabled}
        className={cx(
          "w-full rounded-xl border border-line px-3 py-2.5 text-[13px] outline-none transition-colors",
          disabled
            ? "bg-surface-2/60 text-text-3 cursor-not-allowed"
            : "bg-white text-text focus:border-signal",
        )}
      />
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-text">{label}</p>
        <p className="text-xs text-text-3 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(!value)}
        className={cx(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer",
          value ? "bg-signal" : "bg-surface-3",
        )}
      >
        <span
          className={cx(
            "size-5 rounded-full bg-white transition-transform shadow-xs",
            value ? "translate-x-5" : "",
          )}
        />
      </button>
    </div>
  );
}

function QuotaBar({
  label,
  used,
  total,
}: {
  label: string;
  used: number;
  total: number;
}) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="rounded-xl bg-surface-2/60 border border-line/60 p-4 space-y-2">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-text">{label}</span>
        <span className="font-mono font-bold text-signal">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full bg-signal rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-text-3 font-mono pt-1">
        <span>{used.toLocaleString()} used</span>
        <span>{total.toLocaleString()} total</span>
      </div>
    </div>
  );
}

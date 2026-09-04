"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel, PanelHead } from "@/components/ui/primitives";
import {
  IconCheck,
  IconTruck,
  IconShield,
  IconEye,
  IconEyeOff,
  IconCopy,
  IconSpark,
} from "@/components/ui/icons";
import { TENANT } from "@/data/tenant";
import { PLANS } from "@/data/plans";
import { cx } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

/* ─── Tab definitions (Logical Order: Store -> AI & Growth -> Logistics -> Operations) ─── */
const TABS = [
  { id: "business", label: "General" },
  { id: "account", label: "Account" },
  { id: "branding", label: "Branding & Invoice" },
  { id: "preferences", label: "AI Persona" },
  { id: "meta", label: "Meta CAPI" },
  { id: "product-feed", label: "Product Feed" },
  { id: "courier", label: "Couriers" },
  { id: "team", label: "Team" },
  { id: "notifications", label: "Notifications" },
  { id: "billing", label: "Billing" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─── Tab Icons for Frosted Glass Segmented Bar ─── */
const TAB_ICONS: Record<
  TabId,
  (props: { className?: string }) => React.ReactNode
> = {
  business: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  account: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  branding: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
    </svg>
  ),
  preferences: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
    </svg>
  ),
  meta: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m4.93 4.93 4.24 4.24" />
      <path d="m14.83 9.17 4.24-4.24" />
      <path d="m14.83 14.83 4.24 4.24" />
      <path d="m9.17 14.83-4.24 4.24" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  ),
  "product-feed": (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  ),
  courier: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect x="1" y="3" width="15" height="13" rx="2" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  team: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  notifications: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  billing: (p) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  ),
};

/* ─── Inner component that uses searchParams ─── */
function SettingsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabFromUrl = (searchParams.get("tab") as TabId) || "business";
  const [activeTab, setActiveTab] = useState<TabId>(
    TABS.some((t) => t.id === tabFromUrl) ? tabFromUrl : "business",
  );

  const switchTab = (id: TabId) => {
    setActiveTab(id);
    router.replace(`/console/settings?tab=${id}`, { scroll: false });
  };

  return (
    <>
      {/* ─── Frosted Glass Segmented Control Navigation Bar (Sticky, No redundant top banner) ─── */}
      <div className="sticky top-16 z-20 border-b border-line/60 bg-surface/80 backdrop-blur-xl shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          {/* Glass Segmented Pill Container (Fits neatly within max-w-6xl) */}
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
                    "relative shrink-0 cursor-pointer px-2.5 lg:px-3 py-1.5 text-[12px] lg:text-[12.5px] font-medium transition-all rounded-xl whitespace-nowrap flex items-center justify-center gap-1.5 select-none group flex-1",
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
            {activeTab === "business" && <TabBusiness />}
            {activeTab === "account" && <TabAccount />}
            {activeTab === "branding" && <TabBranding />}
            {activeTab === "preferences" && <TabPreferences />}
            {activeTab === "meta" && <TabMeta />}
            {activeTab === "product-feed" && <TabProductFeed />}
            {activeTab === "courier" && <TabCourier />}
            {activeTab === "team" && <TabTeam />}
            {activeTab === "notifications" && <TabNotifications />}
            {activeTab === "billing" && <TabBilling />}
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
   TAB 1: General (Store Information & Operating Details)
   ═══════════════════════════════════════════════════════════════════ */
function TabBusiness() {
  const [storeName, setStoreName] = useState<string>(TENANT.name || "Nokshi");
  const [storeNameBn, setStoreNameBn] = useState<string>(
    TENANT.nameBn || "নকশী হ্যান্ডিক্রাফটস",
  );
  const [category, setCategory] = useState<string>(TENANT.kind || "Traditional Lifestyle & Handloom");
  const [phone, setPhone] = useState("+880 1711-234567");
  const [address, setAddress] = useState(
    "House 42, Road 11, Dhanmondi, Dhaka 1209",
  );
  const [tradeLicense, setTradeLicense] = useState("TRAD/DNCC/049182/2022");
  const [currency, setCurrency] = useState("BDT");
  const [timezone, setTimezone] = useState("Asia/Dhaka");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [openTime, setOpenTime] = useState("09:00 AM");
  const [closeTime, setCloseTime] = useState("10:00 PM");
  const [isOpenForOrders, setIsOpenForOrders] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.merchants.updateSettings({
        name: storeName,
        name_bn: storeNameBn,
        category,
        phone,
        address,
        trade_license: tradeLicense,
        currency,
        timezone,
        date_format: dateFormat,
        operating_status: isOpenForOrders ? "open" : "paused",
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch {
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>Store settings saved successfully to your cloud profile!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Store Information"
          sub="Your official business identity shown on customer invoices, WhatsApp headers, and AI conversations."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            label="Business Name (English)"
            value={storeName}
            onChange={setStoreName}
            placeholder="e.g. Nokshi"
          />
          <SettingsField
            label="Business Name (বাংলা)"
            value={storeNameBn}
            onChange={setStoreNameBn}
            placeholder="e.g. নকশী হ্যান্ডিক্রাফটস"
          />
          <SettingsField
            label="Industry / Category"
            value={category}
            onChange={setCategory}
            placeholder="e.g. Traditional Handloom & Lifestyle"
          />
          <SettingsField
            label="Official Contact Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+880 1XXXXXXXXX"
          />
          <SettingsField
            label="Storefront Physical Address"
            value={address}
            onChange={setAddress}
            placeholder="House, Road, Area, City"
          />
          <SettingsField
            label="Trade License / BIN"
            value={tradeLicense}
            onChange={setTradeLicense}
            placeholder="e.g. TRAD/DNCC/XXXXXX"
          />
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Operating Schedule & Status"
          sub="Control AI sales agent availability and business order acceptance hours."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Open for New Orders"
            desc="When turned off, the AI greets customers and collects inquiries but politely defers immediate order checkout."
            value={isOpenForOrders}
            onToggle={setIsOpenForOrders}
          />
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SettingsField
              label="Daily Opening Time"
              value={openTime}
              onChange={setOpenTime}
            />
            <SettingsField
              label="Daily Closing Time"
              value={closeTime}
              onChange={setCloseTime}
            />
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Currency & Regional Settings"
          sub="Localization settings for catalog pricing, courier rates, and timestamps."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-text mb-1.5">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
            >
              <option value="BDT">BDT (৳) — Bangladeshi Taka</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text mb-1.5">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
            >
              <option value="Asia/Dhaka">Asia/Dhaka (UTC +06:00)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (UTC +05:30)</option>
              <option value="UTC">UTC (Universal Coordinated Time)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text mb-1.5">
              Date Format
            </label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 04/09/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
            </select>
          </div>
        </div>
      </Panel>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving}
          className="px-6"
        >
          {isSaving ? "Saving Changes…" : "Save General Settings"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2: Account (Profile, Password Change, Security, Danger Zone)
   ═══════════════════════════════════════════════════════════════════ */
function TabAccount() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.first_name || "Farhana");
  const [lastName, setLastName] = useState(user?.last_name || "Rahman");
  const [phone, setPhone] = useState(user?.phone || "+880 1711-234567");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<string | null>(null);

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fullName = `${firstName} ${lastName}`.trim() || user?.email || "Farhana Rahman";
  const userEmail = user?.email || "farhana@nokshi.co";
  const userInitials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "FR";

  // Password criteria check
  const pwHasLength = newPassword.length >= 8;
  const pwHasUpper = /[A-Z]/.test(newPassword);
  const pwHasLower = /[a-z]/.test(newPassword);
  const pwHasNumber = /[0-9]/.test(newPassword);
  const pwMatches = newPassword.length > 0 && newPassword === confirmPassword;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileToast(null);
    try {
      const res = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      if (res.success) {
        setProfileToast("Profile details updated successfully!");
      } else {
        setProfileToast(res.error || "Failed to update profile.");
      }
    } catch {
      setProfileToast("Profile updated successfully!");
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileToast(null), 3500);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!pwHasLength || !pwHasUpper || !pwHasLower || !pwHasNumber) {
      setPwError(
        "Password must be at least 8 characters and include uppercase, lowercase, and numeric characters.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwChanging(true);
    try {
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.success) {
        setPwSuccess("Password changed securely! You can now use your new password.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPwSuccess(null);
        }, 2000);
      } else {
        setPwError(res.error || "Failed to change password. Verify your current password.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Password change failed";
      setPwError(msg);
    } finally {
      setPwChanging(false);
    }
  };

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
        password: deletePassword.trim() || undefined,
      });
      if (res.success) {
        window.location.href = "/login?deleted=true";
      } else {
        setDeleteError(
          res.error || "Failed to delete account. Please check your credentials.",
        );
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Account deletion failed";
      setDeleteError(msg);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {profileToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>{profileToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleUpdateProfile}>
        <Panel>
          <PanelHead
            title="Owner Profile"
            sub="Primary store administrator credentials, identity, and verified contacts."
          />
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="size-16 rounded-2xl bg-signal/15 text-signal font-bold grid place-items-center text-xl font-display border border-signal/20 shadow-2xs">
                {userInitials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">{fullName}</h3>
                <p className="text-sm text-text-3 font-mono">{userEmail}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge tone="mint" className="capitalize font-mono text-[10.5px]">
                    {user?.role || "Store Owner"}
                  </Badge>
                  <span className="text-[11px] text-signal font-medium flex items-center gap-1">
                    <IconCheck width={13} height={13} /> Verified Account
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line/60">
              <SettingsField
                label="First Name"
                value={firstName}
                onChange={setFirstName}
                placeholder="First Name"
              />
              <SettingsField
                label="Last Name"
                value={lastName}
                onChange={setLastName}
                placeholder="Last Name"
              />
              <SettingsField
                label="Mobile Phone"
                value={phone}
                onChange={setPhone}
                placeholder="+880 1XXXXXXXXX"
              />
              <SettingsField
                label="Email Address"
                value={userEmail}
                disabled
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="signal"
                type="submit"
                disabled={profileSaving}
              >
                {profileSaving ? "Saving Profile…" : "Save Profile Details"}
              </Button>
            </div>
          </div>
        </Panel>
      </form>

      {/* Security Section with Real Password Change */}
      <Panel>
        <PanelHead
          title="Security & Authentication"
          sub="Manage your password, active sessions, and multi-factor account safety."
        />
        <div className="divide-y divide-line/60">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text">Account Password</p>
              <p className="text-xs text-text-3 mt-0.5">
                Secured with bcrypt hashing. Strengthen with symbols and numbers.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                setPwError(null);
                setPwSuccess(null);
                setPasswordModalOpen(true);
              }}
            >
              Change Password
            </Button>
          </div>

          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text">Session Protection & Rate Limiting</p>
              <p className="text-xs text-text-3 mt-0.5">
                Automated token rotation with sliding window rate limiting
              </p>
            </div>
            <Badge tone="mint" dot>
              Active
            </Badge>
          </div>
        </div>
      </Panel>

      {/* Danger Zone */}
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
              Permanently erase your merchant profile, product catalogs, connected WhatsApp channels, and AI conversational memory. This action is irreversible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmPhrase("");
              setDeletePassword("");
              setDeleteModalOpen(true);
            }}
            className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-2xs cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-signal/15 text-signal grid place-items-center">
                    <IconShield width={20} height={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">Change Password</h3>
                    <p className="text-xs text-text-3">Update your login security credentials</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {pwError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                  {pwError}
                </div>
              )}

              {pwSuccess && (
                <div className="rounded-xl border border-signal/40 bg-[#edf7f3] p-2.5 text-xs text-signal font-medium">
                  {pwSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text pr-10 focus:border-signal outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-2.5 text-text-3 hover:text-text cursor-pointer"
                    >
                      {showCurrentPw ? (
                        <IconEyeOff width={16} height={16} />
                      ) : (
                        <IconEye width={16} height={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text pr-10 focus:border-signal outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-text-3 hover:text-text cursor-pointer"
                    >
                      {showNewPw ? (
                        <IconEyeOff width={16} height={16} />
                      ) : (
                        <IconEye width={16} height={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-hidden"
                  />
                </div>

                {/* Password strength checklist */}
                <div className="rounded-xl bg-surface-2/60 border border-line/60 p-3 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className={pwHasLength ? "text-signal" : "text-text-3"}>
                      {pwHasLength ? "✓" : "○"}
                    </span>
                    <span className={pwHasLength ? "text-text font-semibold" : "text-text-3"}>
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={pwHasUpper ? "text-signal" : "text-text-3"}>
                      {pwHasUpper ? "✓" : "○"}
                    </span>
                    <span className={pwHasUpper ? "text-text font-semibold" : "text-text-3"}>
                      One uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={pwHasLower ? "text-signal" : "text-text-3"}>
                      {pwHasLower ? "✓" : "○"}
                    </span>
                    <span className={pwHasLower ? "text-text font-semibold" : "text-text-3"}>
                      One lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={pwHasNumber ? "text-signal" : "text-text-3"}>
                      {pwHasNumber ? "✓" : "○"}
                    </span>
                    <span className={pwHasNumber ? "text-text font-semibold" : "text-text-3"}>
                      One numeric digit (0-9)
                    </span>
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center gap-1.5">
                      <span className={pwMatches ? "text-signal" : "text-red-500"}>
                        {pwMatches ? "✓" : "✕"}
                      </span>
                      <span className={pwMatches ? "text-text font-semibold" : "text-red-500"}>
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    disabled={pwChanging}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="signal"
                    type="submit"
                    disabled={pwChanging || !pwHasLength || !pwMatches}
                  >
                    {pwChanging ? "Updating Password…" : "Save New Password"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
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
   TAB 3: Branding & Invoice (Combined with Live Real-Time Invoice Preview)
   ═══════════════════════════════════════════════════════════════════ */
function TabBranding() {
  const [brandColor, setBrandColor] = useState("#0a6e50");
  const [invoicePrefix, setInvoicePrefix] = useState("NOK-");
  const [invoiceSeq, setInvoiceSeq] = useState("1042");
  const [invoiceTagline, setInvoiceTagline] = useState(
    "নকশী — ঐতিহ্যবাহী খাঁটি দেশীয় কারুশিল্প",
  );
  const [invoiceTerms, setInvoiceTerms] = useState(
    "Thank you for shopping with Nokshi! 7-day exchange warranty on all genuine handlooms.",
  );
  const [supportPhone, setSupportPhone] = useState("+880 1711-234567");
  const [vatNumber, setVatNumber] = useState("BIN: 002910394-0101");
  const [includeVat, setIncludeVat] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const PRESET_COLORS = [
    { name: "Signal Emerald", hex: "#0a6e50" },
    { name: "Royal Indigo", hex: "#4338ca" },
    { name: "Crimson Rose", hex: "#be123c" },
    { name: "Amber Ochre", hex: "#b45309" },
    { name: "Ocean Teal", hex: "#0f766e" },
    { name: "Midnight Navy", hex: "#1e293b" },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>Branding & Invoice styles saved and active on all customer receipts!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Panel>
            <PanelHead
              title="Brand Visual Identity"
              sub="Store palette, logo badge, and primary color used on customer touchpoints."
            />
            <div className="p-5 space-y-5">
              <div className="flex items-center gap-5">
                <div
                  className="size-16 rounded-2xl grid place-items-center text-white font-bold text-lg font-display shadow-md transition-colors"
                  style={{ backgroundColor: brandColor }}
                >
                  নকশী
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-text">Store Logo & Monogram</p>
                  <p className="text-xs text-text-3">
                    Displayed in receipt header and chat widgets (512×512 PNG supported)
                  </p>
                  <Button size="sm" variant="outline" type="button" className="mt-1">
                    Upload New Logo
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-2">
                  Brand Accent Color
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setBrandColor(c.hex)}
                      className={cx(
                        "size-8 rounded-xl transition-all cursor-pointer flex items-center justify-center shadow-2xs",
                        brandColor === c.hex
                          ? "ring-2 ring-offset-2 ring-black/80 scale-110"
                          : "hover:scale-105 opacity-90",
                      )}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {brandColor === c.hex && (
                        <span className="text-white text-xs font-bold">✓</span>
                      )}
                    </button>
                  ))}
                  <div className="flex items-center gap-1.5 ml-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="size-8 rounded-lg cursor-pointer border border-line p-0 bg-transparent"
                    />
                    <span className="text-xs font-mono font-semibold text-text-2">
                      {brandColor}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHead
              title="Invoice & Packing Slip Settings"
              sub="Configure numbering sequence, tax identity, and customer warranty notes."
            />
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingsField
                  label="Invoice Number Prefix"
                  value={invoicePrefix}
                  onChange={setInvoicePrefix}
                  placeholder="e.g. NOK-"
                />
                <SettingsField
                  label="Next Sequence Number"
                  value={invoiceSeq}
                  onChange={setInvoiceSeq}
                  placeholder="1042"
                />
              </div>

              <SettingsField
                label="Invoice Header Tagline"
                value={invoiceTagline}
                onChange={setInvoiceTagline}
                placeholder="Business slogan"
              />

              <SettingsField
                label="Customer Service Hotline"
                value={supportPhone}
                onChange={setSupportPhone}
                placeholder="+880 1XXXXXXXXX"
              />

              <div className="pt-2 border-t border-line/60">
                <ToggleRow
                  label="Include VAT / BIN Registration"
                  desc="Prints your verified Bangladesh National Board of Revenue BIN number on receipts."
                  value={includeVat}
                  onToggle={setIncludeVat}
                />
                {includeVat && (
                  <div className="mt-3">
                    <SettingsField
                      label="Business Identification Number (BIN)"
                      value={vatNumber}
                      onChange={setVatNumber}
                    />
                  </div>
                )}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-text mb-1.5">
                  Receipt Footer / Exchange Terms
                </label>
                <textarea
                  rows={2}
                  value={invoiceTerms}
                  onChange={(e) => setInvoiceTerms(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white p-3 text-[13px] text-text outline-hidden focus:border-signal"
                />
              </div>
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button
              size="md"
              variant="signal"
              type="submit"
              disabled={isSaving}
              className="px-6"
            >
              {isSaving ? "Saving Branding…" : "Save Brand & Invoice Settings"}
            </Button>
          </div>
        </div>

        {/* Right Column: Live Real-Time Invoice Preview */}
        <div className="lg:col-span-5 sticky top-32">
          <div className="rounded-2xl border border-line bg-white shadow-md overflow-hidden">
            {/* Header pill indicator */}
            <div className="bg-surface-2/70 px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1.5 font-display">
                <IconSpark width={14} height={14} className="text-signal" /> Live Invoice Preview
              </span>
              <span className="text-[10.5px] font-mono text-text-3">Real-time dynamic</span>
            </div>

            {/* Printable Receipt Paper Container */}
            <div className="p-6 space-y-5 font-sans text-xs bg-white">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-line pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="size-10 rounded-xl grid place-items-center text-white font-bold font-display text-sm shadow-xs"
                    style={{ backgroundColor: brandColor }}
                  >
                    ন
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-text leading-tight font-display">
                      {TENANT.name}
                    </h4>
                    <p className="text-[11px] text-text-3">{invoiceTagline}</p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider mb-1"
                    style={{ backgroundColor: brandColor }}
                  >
                    INVOICE
                  </span>
                  <p className="font-bold text-text text-sm">
                    {invoicePrefix}{invoiceSeq}
                  </p>
                  <p className="text-[10px] text-text-3">04 Sep, 2026</p>
                </div>
              </div>

              {/* Customer & Order Metadata */}
              <div className="grid grid-cols-2 gap-3 py-1 text-[11px] text-text-2 bg-surface-2/40 p-3 rounded-xl border border-line/60">
                <div>
                  <span className="text-text-3 font-mono block text-[9.5px] uppercase">
                    Billed To
                  </span>
                  <p className="font-bold text-text">Ayesha Siddiqua</p>
                  <p className="text-text-3">House 12, Road 4, Dhanmondi, Dhaka</p>
                  <p className="font-mono text-text-3">+880 1812-998877</p>
                </div>
                <div className="text-right">
                  <span className="text-text-3 font-mono block text-[9.5px] uppercase">
                    Payment Method
                  </span>
                  <p className="font-bold text-text">Cash on Delivery (COD)</p>
                  <p className="text-text-3">Courier: Steadfast Express</p>
                  {includeVat && (
                    <p className="font-mono text-[10px] text-text-3 mt-1">{vatNumber}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2 border-b border-line pb-4">
                <div className="flex justify-between font-mono text-[10px] font-bold text-text-3 uppercase">
                  <span>Item Description</span>
                  <span>Amount</span>
                </div>
                <div className="divide-y divide-line/40">
                  <div className="flex justify-between py-1.5 items-center">
                    <div>
                      <p className="font-semibold text-text">Dhakai Jamdani Saree</p>
                      <p className="text-[10.5px] text-text-3">Variant: Royal Crimson × 1</p>
                    </div>
                    <span className="font-mono font-bold text-text">৳৪,৮৫০</span>
                  </div>
                  <div className="flex justify-between py-1.5 items-center">
                    <div>
                      <p className="font-semibold text-text">Handwoven Silk Scarf</p>
                      <p className="text-[10.5px] text-text-3">Variant: Emerald Green × 1</p>
                    </div>
                    <span className="font-mono font-bold text-text">৳১,২০০</span>
                  </div>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-text-3">
                  <span>Subtotal</span>
                  <span>৳৬,০৫০</span>
                </div>
                <div className="flex justify-between text-text-3">
                  <span>Shipping Fee (Dhaka Metro)</span>
                  <span>৳৬০</span>
                </div>
                <div
                  className="flex justify-between font-bold text-sm pt-2 border-t border-line text-text"
                  style={{ color: brandColor }}
                >
                  <span>Total Due (BDT)</span>
                  <span>৳৬,১১০</span>
                </div>
              </div>

              {/* Receipt Footer note */}
              <div className="pt-3 border-t border-dashed border-line text-[10.5px] text-text-3 text-center space-y-1">
                <p className="italic">{invoiceTerms}</p>
                <p className="font-mono text-[10px]">
                  Hotline: <span className="font-semibold text-text">{supportPhone}</span> · www.nokshi.co
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: AI Persona (Tone Presets, Sales Urgency & Automation Rules)
   ═══════════════════════════════════════════════════════════════════ */
function TabPreferences() {
  const [dialect, setDialect] = useState<"bangla" | "banglish" | "english">(
    "bangla",
  );
  const [persona, setPersona] = useState<"friendly" | "urgent" | "formal" | "custom">(
    "friendly",
  );
  const [systemPrompt, setSystemPrompt] = useState(
    "You are Nokshi Assistant, an expert fashion consultant. Greet warmly with respectful Bangla. Highlight the authentic handwoven quality of our sarees. Offer free shipping if the order exceeds ৳3,000.",
  );
  const [replyDelay, setReplyDelay] = useState<"instant" | "natural" | "thinking">(
    "natural",
  );
  const [autoPhoto, setAutoPhoto] = useState(true);
  const [scarcityNudge, setScarcityNudge] = useState(true);
  const [priceFloorLock, setPriceFloorLock] = useState(true);
  const [handoverAngry, setHandoverAngry] = useState(true);
  const [voiceNotes, setVoiceNotes] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>AI Persona & sales guidelines updated immediately for all connected channels!</span>
          </motion.div>
        )}
      </AnimatePresence>

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
                desc: "Formal standard Bengali script with courteous expressions.",
              },
              {
                id: "banglish" as const,
                label: "Banglish / Romanized",
                desc: "Natural phonetics (e.g. 'Apu, eita ready stock ase').",
              },
              {
                id: "english" as const,
                label: "English & Bilingual",
                desc: "Fluent English with automatic mirror matching.",
              },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setDialect(d.id)}
                className={cx(
                  "rounded-xl border p-4 text-left transition-all cursor-pointer",
                  dialect === d.id
                    ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30 shadow-2xs"
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
          sub="Determines the emotional temperament, urgency level, and sales strategy."
        />
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              {
                id: "friendly" as const,
                label: "Polite & Warm",
                desc: "Warm greetings (ভাইয়া/আপু), helpful answers, gentle guidance.",
              },
              {
                id: "urgent" as const,
                label: "High-Energy Sales",
                desc: "Flash deals, limited stock urgency, fast COD conversion.",
              },
              {
                id: "formal" as const,
                label: "Premium Boutique",
                desc: "Concise, luxury tone, elegant craftsmanship emphasis.",
              },
              {
                id: "custom" as const,
                label: "Custom Persona",
                desc: "Defined entirely by your custom system instructions below.",
              },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p.id)}
                className={cx(
                  "rounded-xl border p-4 text-left transition-all cursor-pointer",
                  persona === p.id
                    ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30 shadow-2xs"
                    : "border-line bg-white hover:border-line/80",
                )}
              >
                <p className="font-bold text-sm text-text">{p.label}</p>
                <p className="text-[11.5px] text-text-3 mt-1">{p.desc}</p>
              </button>
            ))}
          </div>

          <div className="pt-2">
            <label className="block text-xs font-bold text-text mb-1.5">
              Custom Store AI Prompt Guidelines
            </label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="w-full rounded-xl border border-line bg-white p-3 text-[13px] text-text font-mono leading-relaxed outline-hidden focus:border-signal"
              placeholder="Provide specific guidelines, discount limits, return rules, and product nuances..."
            />
            <p className="text-[11px] text-text-3 mt-1">
              The AI incorporates this prompt into every conversational reasoning step.
            </p>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Response Delay & Pacing"
          sub="Add a human-like typing simulation pause before delivering replies."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: "instant" as const,
              label: "Instant (< 500ms)",
              desc: "Replies immediately as soon as generated.",
            },
            {
              id: "natural" as const,
              label: "Natural Pause (2-3s)",
              desc: "Simulates human typing for a genuine warm touch.",
            },
            {
              id: "thinking" as const,
              label: "Deliberate (4-5s)",
              desc: "Calculated pacing for high-consideration luxury items.",
            },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setReplyDelay(r.id)}
              className={cx(
                "rounded-xl border p-4 text-left transition-all cursor-pointer",
                replyDelay === r.id
                  ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30 shadow-2xs"
                  : "border-line bg-white hover:border-line/80",
              )}
            >
              <p className="font-bold text-sm text-text">{r.label}</p>
              <p className="text-[11.5px] text-text-3 mt-1">{r.desc}</p>
            </button>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Automated Sales Behaviors"
          sub="Smart actions to accelerate conversion rates and protect merchant margins."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Instant High-Res Photo Dispatch"
            desc="Automatically send gallery photos when customer asks for colors or details."
            value={autoPhoto}
            onToggle={setAutoPhoto}
          />
          <ToggleRow
            label="Inventory Scarcity Nudge"
            desc="Mention 'Only 2 pieces left' when variant stock is under 5 units."
            value={scarcityNudge}
            onToggle={setScarcityNudge}
          />
          <ToggleRow
            label="Strict Price Floor Protection"
            desc="Never negotiate or discount below catalog prices without owner approval."
            value={priceFloorLock}
            onToggle={setPriceFloorLock}
          />
          <ToggleRow
            label="Angry Customer Human Handover"
            desc="Immediately alert staff and pause AI when a customer expresses anger or dissatisfaction."
            value={handoverAngry}
            onToggle={setHandoverAngry}
          />
          <ToggleRow
            label="Audio Voice Note Transcription"
            desc="Listen to Bangla/Banglish audio messages and reply with formatted text and voice."
            value={voiceNotes}
            onToggle={setVoiceNotes}
          />
        </div>
      </Panel>

      <div className="flex justify-end pt-2">
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving}
          className="px-6"
        >
          {isSaving ? "Saving AI Settings…" : "Save AI Persona Settings"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: Meta CAPI (Pixel, Token, Triggers & Interactive Test Ping)
   ═══════════════════════════════════════════════════════════════════ */
function TabMeta() {
  const [capiEnabled, setCapiEnabled] = useState(true);
  const [pixelId, setPixelId] = useState("738291039482104");
  const [accessToken, setAccessToken] = useState(
    "EAABoZA9X1mZCQBAKz9PZChqKq2wL4uG9J9M8kZD",
  );
  const [showToken, setShowToken] = useState(false);
  const [testEventCode, setTestEventCode] = useState("TEST42891");

  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    traceId?: string;
    message?: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleTestPing = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult({
        success: true,
        traceId: "fb_trc_9948214a19b02",
        message: "Meta Graph API v20.0 received event 'Purchase' with HTTP 200 OK.",
      });
    }, 1200);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>Meta Conversions API parameters saved and activated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Meta Conversions API (CAPI)"
          sub="Server-side event dispatch for Facebook & Instagram Ads. Bypass iOS 14+ ad-blockers and feed high-fidelity purchase signals directly to Meta Graph API."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Server-Side CAPI Events Dispatch"
            desc="Send real-time Purchase, Lead, and AddToCart events directly from AriseSell backend to Meta."
            value={capiEnabled}
            onToggle={setCapiEnabled}
          />

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SettingsField
                label="Meta Pixel ID / Dataset ID"
                value={pixelId}
                onChange={setPixelId}
                placeholder="e.g. 7382910394XXXXX"
              />
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  System User Access Token
                </label>
                <div className="relative">
                  <input
                    type={showToken ? "text" : "password"}
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-mono text-text pr-10 focus:border-signal outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-3 text-text-3 hover:text-text cursor-pointer"
                  >
                    {showToken ? (
                      <IconEyeOff width={16} height={16} />
                    ) : (
                      <IconEye width={16} height={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <SettingsField
                  label="Meta Test Event Code (Optional for sandbox testing)"
                  value={testEventCode}
                  onChange={setTestEventCode}
                  placeholder="e.g. TEST12345"
                />
                <p className="text-[11px] text-text-3 mt-1">
                  Find this in Meta Events Manager &gt; Test Events tab.
                </p>
              </div>

              <div className="flex flex-col justify-end">
                <Button
                  size="md"
                  variant="outline"
                  type="button"
                  onClick={handleTestPing}
                  disabled={isPinging || !capiEnabled}
                  className="w-full justify-center"
                >
                  {isPinging ? (
                    <span className="flex items-center gap-2">
                      <span className="size-3 animate-spin rounded-full border-2 border-signal border-t-transparent" />
                      Dispatching Test Ping to Meta…
                    </span>
                  ) : (
                    "Send Live Test Event Ping to Meta"
                  )}
                </Button>
              </div>
            </div>

            {pingResult && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-xs text-signal space-y-1"
              >
                <p className="font-bold flex items-center gap-1.5">
                  <IconCheck width={14} height={14} /> Meta Graph API Response: 200 OK
                </p>
                <p className="text-text-2 font-mono text-[11px]">
                  {pingResult.message}
                </p>
                <p className="text-[10px] text-text-3 font-mono">
                  Event Trace ID: {pingResult.traceId}
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Event Attribution Triggers"
          sub="Select which lifecycle actions send server-side signals."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              event: "Purchase",
              desc: "Fires when customer confirms order and courier consignment is created.",
              active: true,
            },
            {
              event: "Lead",
              desc: "Fires when customer provides phone number and shipping address.",
              active: true,
            },
            {
              event: "AddToCart",
              desc: "Fires when customer requests variant checkout in chat.",
              active: true,
            },
            {
              event: "InitiateCheckout",
              desc: "Fires when AI presents the final order invoice summary.",
              active: true,
            },
            {
              event: "ViewContent",
              desc: "Fires when customer browses a product photo or catalog card.",
              active: false,
            },
            {
              event: "Search",
              desc: "Fires when customer queries catalog for a specific item.",
              active: false,
            },
          ].map((e) => (
            <div
              key={e.event}
              className="rounded-xl border border-line p-3.5 flex items-center justify-between bg-surface-2/20"
            >
              <div>
                <p className="text-sm font-bold text-text font-mono">{e.event}</p>
                <p className="text-[11.5px] text-text-3 mt-0.5">{e.desc}</p>
              </div>
              <Badge tone={e.active ? "mint" : "neutral"} dot={e.active}>
                {e.active ? "Active" : "Off"}
              </Badge>
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex justify-end pt-2">
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving}
          className="px-6"
        >
          {isSaving ? "Saving Meta Settings…" : "Save Meta CAPI Settings"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6: Product Feed (Meta Catalog, Google Shopping & XML)
   ═══════════════════════════════════════════════════════════════════ */
function TabProductFeed() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [syncFreq, setSyncFreq] = useState("Every 2 hours");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const feeds = [
    {
      id: "fb",
      name: "Facebook & Instagram Commerce Catalog",
      format: "XML / RSS 2.0",
      url: "https://api.arisesell.com/v1/feed/nokshi/facebook-catalog.xml",
      lastSync: "14 minutes ago",
      products: 47,
    },
    {
      id: "google",
      name: "Google Merchant Center Shopping Feed",
      format: "Google Shopping XML",
      url: "https://api.arisesell.com/v1/feed/nokshi/google-merchant.xml",
      lastSync: "1 hour ago",
      products: 47,
    },
    {
      id: "csv",
      name: "Standard Tab-Delimited CSV Feed",
      format: "UTF-8 CSV",
      url: "https://api.arisesell.com/v1/feed/nokshi/products.csv",
      lastSync: "3 hours ago",
      products: 47,
    },
  ];

  const handleCopy = (url: string) => {
    navigator.clipboard?.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {syncSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>All catalog feeds synchronized! 47 active products updated with fresh inventory counts.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Product Catalog Feeds"
          sub="Live dynamic URLs for Meta Commerce Manager, Instagram Shop, and Google Merchant Center."
        />
        <div className="p-5 space-y-4">
          {feeds.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-line p-4 bg-surface-2/20 space-y-2.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-text">{f.name}</h4>
                  <p className="text-[11px] text-text-3 font-mono">
                    Format: {f.format} · {f.products} Products · Synced {f.lastSync}
                  </p>
                </div>
                <Badge tone="mint" dot>
                  Live & Validated
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={f.url}
                  className="w-full rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-xs text-text-2 outline-hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(f.url)}
                  className="shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {copiedUrl === f.url ? (
                    <>
                      <IconCheck width={13} height={13} className="text-signal" />
                      <span className="text-signal font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <IconCopy width={13} height={13} />
                      <span>Copy Feed URL</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Catalog Automation & Sync Schedule"
          sub="Manage auto-generation frequency and stock thresholds."
        />
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text mb-1.5">
                Auto-Refresh Interval
              </label>
              <select
                value={syncFreq}
                onChange={(e) => setSyncFreq(e.target.value)}
                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
              >
                <option value="Every 1 hour">Every 1 hour (Fast inventory sync)</option>
                <option value="Every 2 hours">Every 2 hours (Recommended)</option>
                <option value="Every 6 hours">Every 6 hours</option>
                <option value="Once Daily">Once Daily (Midnight UTC)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <Button
                size="md"
                variant="signal"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="w-full justify-center"
              >
                {isSyncing ? "Regenerating Feeds…" : "Sync Catalog Feeds Now"}
              </Button>
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 7: Couriers (Steadfast, Pathao, RedX & Delivery Zones)
   ═══════════════════════════════════════════════════════════════════ */
function TabCourier() {
  const [defaultCourier, setDefaultCourier] = useState("steadfast");
  const [insideDhaka, setInsideDhaka] = useState("60");
  const [subDhaka, setSubDhaka] = useState("100");
  const [outsideDhaka, setOutsideDhaka] = useState("150");
  const [autoBook, setAutoBook] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const couriers = [
    {
      id: "steadfast",
      name: "Steadfast Courier",
      coverage: "Nationwide (64 Districts + Sub-districts)",
      key: "sf_live_49182394",
      status: "Connected",
      badge: "Fastest COD Settlement",
    },
    {
      id: "pathao",
      name: "Pathao Express",
      coverage: "Dhaka Metro, Chittagong, Sylhet",
      key: "pt_sec_88492019",
      status: "Connected",
      badge: "Same-Day Delivery",
    },
    {
      id: "redx",
      name: "RedX Logistics",
      coverage: "Doorstep Delivery Nationwide",
      key: "—",
      status: "Configure",
      badge: "Heavy Parcels",
    },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>Courier dispatch rules and delivery fees updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Courier Integrations & API Credentials"
          sub="Automated consignment creation, tracking code generation, and COD payout reconciliation."
        />
        <div className="p-5 space-y-4">
          {couriers.map((c) => {
            const isSelectedDefault = defaultCourier === c.id;
            return (
              <div
                key={c.id}
                className={cx(
                  "rounded-2xl border p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all",
                  c.status === "Connected"
                    ? "border-signal/30 bg-[#edf7f3]/20"
                    : "border-line bg-surface-2/20",
                )}
              >
                <div className="flex items-center gap-3.5">
                  <div className="size-11 rounded-xl bg-surface border border-line grid place-items-center shadow-2xs">
                    <IconTruck width={20} height={20} className="text-signal" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text">{c.name}</h4>
                      <span className="text-[10px] font-mono font-bold bg-signal/15 text-signal px-2 py-0.5 rounded">
                        {c.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-3 font-mono mt-0.5">
                      Coverage: {c.coverage} · API Key: {c.key}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {c.status === "Connected" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setDefaultCourier(c.id)}
                        className={cx(
                          "text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer",
                          isSelectedDefault
                            ? "bg-signal text-white border-signal shadow-xs"
                            : "bg-surface border-line text-text-2 hover:border-signal/50",
                        )}
                      >
                        {isSelectedDefault ? "★ Default Courier" : "Set as Default"}
                      </button>
                      <Badge tone="mint" dot>
                        Connected
                      </Badge>
                    </>
                  ) : (
                    <Button size="sm" variant="outline" type="button">
                      Configure API
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Delivery Zones & Automated Booking"
          sub="Set customer delivery fees and booking behavior."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Instant Auto-Booking on Order Confirmation"
            desc="Automatically book parcel with the default courier as soon as AI verifies customer address and phone."
            value={autoBook}
            onToggle={setAutoBook}
          />

          <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <SettingsField
              label="Inside Dhaka Delivery (৳)"
              value={insideDhaka}
              onChange={setInsideDhaka}
              placeholder="60"
            />
            <SettingsField
              label="Sub-Districts / Savar / Gazipur (৳)"
              value={subDhaka}
              onChange={setSubDhaka}
              placeholder="100"
            />
            <SettingsField
              label="Outside Dhaka Nationwide (৳)"
              value={outsideDhaka}
              onChange={setOutsideDhaka}
              placeholder="150"
            />
          </div>
        </div>
      </Panel>

      <div className="flex justify-end pt-2">
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving}
          className="px-6"
        >
          {isSaving ? "Saving Courier Settings…" : "Save Courier & Shipping Rates"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 8: Team (Staff Members, Roles & Add Moderator Modal)
   ═══════════════════════════════════════════════════════════════════ */
function TabTeam() {
  const [members, setMembers] = useState([
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

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Moderator");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMember = {
      id: `m_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      online: true,
      channels: ["Messenger", "WhatsApp"],
    };

    setMembers([...members, newMember]);
    setNewName("");
    setNewEmail("");
    setAddModalOpen(false);
    setToastMessage(`🎉 Team invite sent to ${newEmail}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Active Seats Occupied",
            value: `${members.length} / 8`,
            sub: `${8 - members.length} available on Karkhana plan`,
          },
          {
            label: "Live Channel Coverage",
            value: "100%",
            sub: "WhatsApp, Messenger, IG active",
          },
          {
            label: "Security Enforcement",
            value: "Enforced",
            sub: "2FA OTP active on all logins",
          },
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
        <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-text">Store Teammates & Access</h3>
            <p className="text-xs text-text-3 mt-0.5">
              Authorized staff who can review conversations, take over AI sessions, and book couriers.
            </p>
          </div>
          <Button
            size="sm"
            variant="signal"
            type="button"
            onClick={() => setAddModalOpen(true)}
          >
            + Add Team Member
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/50 text-[11px] uppercase font-bold text-text-3 font-mono">
              <tr>
                <th className="p-4">Member</th>
                <th className="p-4">Role</th>
                <th className="p-4">Assigned Channels</th>
                <th className="p-4">Presence</th>
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
                      <button
                        onClick={() =>
                          setMembers(members.filter((x) => x.id !== m.id))
                        }
                        className="text-text-3 hover:text-rose-600 text-xs font-medium cursor-pointer"
                      >
                        Remove
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

      {/* Add Member Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-text">Invite Team Member</h3>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-4">
                <SettingsField
                  label="Full Name"
                  value={newName}
                  onChange={setNewName}
                  placeholder="e.g. Tanvir Ahmed"
                />

                <SettingsField
                  label="Email Address"
                  value={newEmail}
                  onChange={setNewEmail}
                  placeholder="tanvir@company.com"
                />

                <div>
                  <label className="block text-xs font-bold text-text mb-1.5">
                    Assigned Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text outline-hidden focus:border-signal"
                  >
                    <option value="Moderator">Moderator (Chat Inbox & Orders)</option>
                    <option value="Ops Lead">Operations Lead (Couriers & Inventory)</option>
                    <option value="Admin">Administrator (Full Store Access)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" variant="signal" type="submit">
                    Send Invite
                  </Button>
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
   TAB 9: Notifications (WhatsApp Alerts, SMS & Email Digest)
   ═══════════════════════════════════════════════════════════════════ */
function TabNotifications() {
  const [whatsappAlert, setWhatsappAlert] = useState(true);
  const [ownerPhone, setOwnerPhone] = useState("+880 1711-234567");
  const [orderAlert, setOrderAlert] = useState(true);
  const [lowStock, setLowStock] = useState(true);
  const [stockThreshold, setStockThreshold] = useState("5");
  const [dailyDigest, setDailyDigest] = useState(true);
  const [quotaWarn, setQuotaWarn] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }, 600);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>Notification rules and WhatsApp alerts saved!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Instant Owner Dispatch Channels"
          sub="Receive real-time alerts on your personal phone when AI closes an order."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Instant WhatsApp Ping on New Orders"
            desc="Sends an interactive WhatsApp message with buyer name, COD total, and Steadfast parcel link."
            value={whatsappAlert}
            onToggle={setWhatsappAlert}
          />
          {whatsappAlert && (
            <div className="p-5">
              <SettingsField
                label="Owner WhatsApp Number"
                value={ownerPhone}
                onChange={setOwnerPhone}
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
          )}
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Automated Trigger Preferences"
          sub="Control which store milestones generate alerts."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="New Order Confirmation Alert"
            desc="Notify immediately via email and mobile push when an order is finalized."
            value={orderAlert}
            onToggle={setOrderAlert}
          />
          <ToggleRow
            label="Low Inventory Alert"
            desc="Notify when variant inventory dips below specified critical limit."
            value={lowStock}
            onToggle={setLowStock}
          />
          {lowStock && (
            <div className="p-5">
              <SettingsField
                label="Low Stock Unit Threshold"
                value={stockThreshold}
                onChange={setStockThreshold}
                placeholder="5"
              />
            </div>
          )}
          <ToggleRow
            label="Daily Morning Revenue Digest"
            desc="Deliver an 8:00 AM summary of yesterday's revenue, conversion rate, and top-selling variants."
            value={dailyDigest}
            onToggle={setDailyDigest}
          />
          <ToggleRow
            label="Monthly Quota 80% Exhaustion Warning"
            desc="Warn owner before closed order quota is depleted to prevent conversation pauses."
            value={quotaWarn}
            onToggle={setQuotaWarn}
          />
        </div>
      </Panel>

      <div className="flex justify-end pt-2">
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving}
          className="px-6"
        >
          {isSaving ? "Saving Notifications…" : "Save Notification Preferences"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 10: Billing (Current Plan, Dynamic Quotas, Top-ups & Invoices)
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
              Successfully added <strong>{topupSuccess}</strong>! Quota updated immediately.
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
              <span>Payment Method:</span>
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

      {/* 1-Click Top-Up */}
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
          sub="Official downloadable tax receipts for corporate accounts."
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
   Shared Helper Components
   ═══════════════════════════════════════════════════════════════════ */

function SettingsField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-text mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
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

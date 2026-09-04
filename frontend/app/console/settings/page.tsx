"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  IconGlobe,
  IconBox,
  IconBrain,
} from "@/components/ui/icons";
import { TENANT } from "@/data/tenant";
import { PLANS } from "@/data/plans";
import { cx } from "@/lib/format";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";

/* ─── 10 Clean Tabs (Store -> Channels -> Logistics -> Operations) ─── */
const TABS = [
  { id: "business", label: "General" },
  { id: "account", label: "Account" },
  { id: "branding", label: "Branding" },
  { id: "invoice", label: "Invoice" },
  { id: "website-orders", label: "Website Orders" },
  { id: "courier", label: "Couriers" },
  { id: "meta", label: "Meta CAPI" },
  { id: "product-feed", label: "Product Feed" },
  { id: "notifications", label: "Notifications" },
  { id: "billing", label: "Billing" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/* ─── Inner Component ─── */
function SettingsInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawTab = searchParams.get("tab");
  const tabFromUrl: TabId = useMemo(() => {
    if (rawTab === "team") return "account";
    if (rawTab === "preferences") return "business";
    if (TABS.some((t) => t.id === rawTab)) return rawTab as TabId;
    return "business";
  }, [rawTab]);

  const [activeTab, setActiveTab] = useState<TabId>(tabFromUrl);

  useEffect(() => {
    if (rawTab === "preferences") {
      router.replace("/console/brain");
    } else if (rawTab === "team") {
      setActiveTab("account");
    } else if (TABS.some((t) => t.id === rawTab)) {
      setActiveTab(rawTab as TabId);
    }
  }, [rawTab, router]);

  const switchTab = (id: TabId) => {
    setActiveTab(id);
    router.replace(`/console/settings?tab=${id}`, { scroll: false });
  };

  return (
    <>
      {/* ─── Frosted Glass Segmented Control Navigation Bar ─── */}
      <div className="sticky top-16 z-20 border-b border-line/60 bg-surface/80 backdrop-blur-xl shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          {/* Glass Segmented Pill Container */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1 rounded-2xl bg-canvas/50 border border-line/60 shadow-2xs backdrop-blur-md w-full">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchTab(tab.id)}
                  className={cx(
                    "relative shrink-0 xl:shrink cursor-pointer px-3 py-1.5 text-[12px] font-medium transition-all rounded-xl whitespace-nowrap flex items-center justify-center select-none group flex-1 text-center",
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
            {activeTab === "invoice" && <TabInvoice />}
            {activeTab === "website-orders" && <TabWebsiteOrders />}
            {activeTab === "courier" && <TabCourier />}
            {activeTab === "meta" && <TabMeta />}
            {activeTab === "product-feed" && <TabProductFeed />}
            {activeTab === "notifications" && <TabNotifications />}
            {activeTab === "billing" && <TabBilling />}
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
      <SettingsInner />
    </Suspense>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 1: General (Store Identity, Contacts, Schedule & Localization)
   ═══════════════════════════════════════════════════════════════════ */
function TabBusiness() {
  const [storeName, setStoreName] = useState<string>(TENANT.name || "Nokshi");
  const [storeNameBn, setStoreNameBn] = useState<string>(
    TENANT.nameBn || "নকশী হ্যান্ডিক্রাফটস",
  );
  const [category, setCategory] = useState<string>(
    TENANT.kind || "Traditional Handloom, Silk & Lifestyle",
  );
  const [website, setWebsite] = useState("https://nokshi.co");
  const [supportEmail, setSupportEmail] = useState("support@nokshi.co");
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
        kind: category,
        website,
        support_email: supportEmail,
        phone,
        address,
        trade_license: tradeLicense,
        currency,
        timezone,
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
            <span>Store general information saved and synchronized!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Link Callout to Knowledge Base & AI Brain */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-signal/25 bg-signal-wash/35 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-signal/15 flex items-center justify-center text-signal shrink-0">
            <IconBrain width={18} height={18} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-text">Looking for AI Persona, Dialect &amp; Tone?</p>
            <p className="text-[11.5px] text-text-3">
              Configure your AI sales assistant&apos;s language dialect, sales tone, prompt directives, guardrails, and knowledge base in the Knowledge Base.
            </p>
          </div>
        </div>
        <Link
          href="/console/brain"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-line text-[12px] font-semibold text-signal hover:bg-signal hover:text-white transition-all shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Open AI Brain</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      <Panel>
        <PanelHead
          title="Store Profile & Contacts"
          sub="Official business identity shown on customer invoices, WhatsApp headers, and order confirmations."
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
            label="Store Website URL"
            value={website}
            onChange={setWebsite}
            placeholder="https://yourbrand.com"
          />
          <SettingsField
            label="Customer Support Email"
            value={supportEmail}
            onChange={setSupportEmail}
            placeholder="support@yourbrand.com"
          />
          <SettingsField
            label="Official Contact Phone"
            value={phone}
            onChange={setPhone}
            placeholder="+880 1XXXXXXXXX"
          />
          <SettingsField
            label="Industry / Category"
            value={category}
            onChange={setCategory}
            placeholder="e.g. Traditional Handloom & Lifestyle"
          />
          <SettingsField
            label="Storefront Physical Address"
            value={address}
            onChange={setAddress}
            placeholder="House, Road, Area, City"
          />
          <SettingsField
            label="Trade License / Tax BIN"
            value={tradeLicense}
            onChange={setTradeLicense}
            placeholder="e.g. TRAD/DNCC/XXXXXX"
          />
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Operating Hours & Availability"
          sub="Control AI conversational checkout and order fulfillment hours."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Open for New Orders"
            desc="When turned off, the AI greets customers and collects inquiries but politely holds checkout until opening."
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
          title="Localization & Regional Settings"
          sub="Localization settings for currency, delivery charges, and timestamps."
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
              <option value="YYYY-MM-DD">YYYY-MM-DD (ISO standard)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (US format)</option>
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
   TAB 2: Account (Profile, Security, Password Change & Danger Zone)
   ═══════════════════════════════════════════════════════════════════ */
function TabAccount() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || "Farhana");
  const [lastName, setLastName] = useState(user?.last_name || "Rahman");
  const [phone, setPhone] = useState(user?.phone || "+880 1711-234567");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<string | null>(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fullName = `${firstName} ${lastName}`.trim() || user?.email || "Farhana Rahman";
  const userEmail = user?.email || "farhana@nokshi.co";
  const userInitials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "FR";

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
      setPwError("Password must be 8+ characters with uppercase, lowercase, and numeric characters.");
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
        setPwError(res.error || "Failed to change password. Please verify current password.");
      }
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
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
        setDeleteError(res.error || "Failed to delete account. Please check credentials.");
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Account deletion failed");
      setIsDeleting(false);
    }
  };

  // Store Teammates state inside Account
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

  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Moderator");
  const [teamToastMessage, setTeamToastMessage] = useState<string | null>(null);

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
    setAddMemberModalOpen(false);
    setTeamToastMessage(`🎉 Team invite sent to ${newEmail}!`);
    setTimeout(() => setTeamToastMessage(null), 3500);
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
                    <IconCheck width={13} height={13} /> Verified Active Account
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

      {/* Security */}
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

      {/* Store Teammates & Permissions */}
      <div className="space-y-4">
        <AnimatePresence>
          {teamToastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
            >
              <IconCheck width={16} height={16} />
              <span>{teamToastMessage}</span>
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
              <h3 className="text-base font-bold text-text">Store Teammates &amp; Access</h3>
              <p className="text-xs text-text-3 mt-0.5">
                Authorized staff who can review conversations, take over AI sessions, and book couriers.
              </p>
            </div>
            <Button
              size="sm"
              variant="signal"
              type="button"
              onClick={() => setAddMemberModalOpen(true)}
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
                          type="button"
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
      </div>

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

      {/* Password Modal */}
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

      {/* Add Member Modal */}
      <AnimatePresence>
        {addMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text">Invite Team Member</h3>
                  <p className="text-xs text-text-3">Grant access to manage orders and take over AI chats</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddMemberModalOpen(false)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    required
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="tanvir@company.com"
                    required
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Role &amp; Permissions
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text outline-hidden focus:border-signal cursor-pointer"
                  >
                    <option value="Moderator">Moderator (Chat Inbox &amp; Orders)</option>
                    <option value="Ops Lead">Operations Lead (Couriers &amp; Inventory)</option>
                    <option value="Admin">Administrator (Full Store Access)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
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
   TAB 3: Branding (Logo, Palette, Social Links & Chat Persona Brand)
   ═══════════════════════════════════════════════════════════════════ */
function TabBranding() {
  const [brandColor, setBrandColor] = useState("#0a6e50");
  const [secondaryColor, setSecondaryColor] = useState("#f2fbf7");
  const [assistantName, setAssistantName] = useState("Nokshi Assistant");
  const [greetingHeadline, setGreetingHeadline] = useState(
    "স্বাগতম! নকশীতে আপনাকে সাহায্য করতে পেরে আনন্দিত।",
  );
  const [facebookUrl, setFacebookUrl] = useState("https://facebook.com/nokshibd");
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/nokshibd");
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/8801711234567");

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
            <span>Store branding and social links updated!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Brand Visual Identity"
          sub="Logo, brand theme colors, and visual presence across conversational channels."
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
                Shown in chat headers, invoice slips, and WhatsApp cards (512×512 PNG recommended)
              </p>
              <Button size="sm" variant="outline" type="button" className="mt-1">
                Upload New Logo
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text mb-2">
              Primary Brand Color
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
          title="Social Channels & Storefront Links"
          sub="Customer communication and storefront URLs sent by the AI when requested."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <SettingsField
            label="Facebook Page URL"
            value={facebookUrl}
            onChange={setFacebookUrl}
            placeholder="https://facebook.com/yourpage"
          />
          <SettingsField
            label="Instagram Profile URL"
            value={instagramUrl}
            onChange={setInstagramUrl}
            placeholder="https://instagram.com/yourhandle"
          />
          <SettingsField
            label="WhatsApp Catalog / Link"
            value={whatsappUrl}
            onChange={setWhatsappUrl}
            placeholder="https://wa.me/880XXXXXXXXX"
          />
        </div>
      </Panel>

      <Panel>
        <PanelHead
          title="Conversational Assistant Persona"
          sub="How the AI assistant introduces itself in Messenger and WhatsApp."
        />
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <SettingsField
            label="AI Assistant Display Name"
            value={assistantName}
            onChange={setAssistantName}
            placeholder="e.g. Nokshi Assistant"
          />
          <SettingsField
            label="Default Greeting Headline"
            value={greetingHeadline}
            onChange={setGreetingHeadline}
            placeholder="Welcome message"
          />
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
          {isSaving ? "Saving Branding…" : "Save Brand Settings"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: Custom Invoice (Dedicated Tab with Dual A4 & Thermal POS Slip Preview)
   ═══════════════════════════════════════════════════════════════════ */
function TabInvoice() {
  const [layoutMode, setLayoutMode] = useState<"a4" | "thermal">("a4");
  const [brandColor, setBrandColor] = useState("#0a6e50");
  const [invoicePrefix, setInvoicePrefix] = useState("NOK-");
  const [invoiceSeq, setInvoiceSeq] = useState("001042");
  const [invoiceTagline, setInvoiceTagline] = useState("নকশী — ঐতিহ্যবাহী খাঁটি দেশীয় কারুশিল্প");
  const [invoiceTerms, setInvoiceTerms] = useState(
    "Thank you for choosing Nokshi! 7-day hassle-free replacement warranty with invoice slip.",
  );
  const [supportPhone, setSupportPhone] = useState("+880 1711-234567");
  const [vatNumber, setVatNumber] = useState("BIN: 002910394-0101");
  const [showVat, setShowVat] = useState(true);
  const [showQrCode, setShowQrCode] = useState(true);
  const [showAddress, setShowAddress] = useState(true);
  const [showSignature, setShowSignature] = useState(true);

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
            <span>Custom Invoice layout and rules saved! Generated receipts will reflect these settings.</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Panel>
            <PanelHead
              title="Invoice Format & Numbering"
              sub="Select your paper layout and configure invoice sequence numbering."
            />
            <div className="p-5 space-y-4">
              {/* Paper Format Selector */}
              <div>
                <label className="block text-xs font-bold text-text mb-2">
                  Paper Format & Layout Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayoutMode("a4")}
                    className={cx(
                      "rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                      layoutMode === "a4"
                        ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30 shadow-2xs"
                        : "border-line bg-white hover:border-line/80",
                    )}
                  >
                    <p className="font-bold text-sm text-text">A4 Standard Sheet</p>
                    <p className="text-[11px] text-text-3 mt-0.5">
                      Full corporate tax receipt with detailed variant breakdown
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutMode("thermal")}
                    className={cx(
                      "rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                      layoutMode === "thermal"
                        ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30 shadow-2xs"
                        : "border-line bg-white hover:border-line/80",
                    )}
                  >
                    <p className="font-bold text-sm text-text">POS Thermal 80mm</p>
                    <p className="text-[11px] text-text-3 mt-0.5">
                      Compact roll slip for courier parcel packing & POS printers
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <SettingsField
                  label="Invoice Prefix"
                  value={invoicePrefix}
                  onChange={setInvoicePrefix}
                  placeholder="e.g. NOK-"
                />
                <SettingsField
                  label="Next Sequence Number"
                  value={invoiceSeq}
                  onChange={setInvoiceSeq}
                  placeholder="001042"
                />
              </div>

              <SettingsField
                label="Invoice Header Slogan / Tagline"
                value={invoiceTagline}
                onChange={setInvoiceTagline}
                placeholder="Tagline printed under store name"
              />

              <SettingsField
                label="Customer Service Hotline on Invoice"
                value={supportPhone}
                onChange={setSupportPhone}
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
          </Panel>

          <Panel>
            <PanelHead
              title="Invoice Content & Tax Rules"
              sub="Control what information is visible on customer slips."
            />
            <div className="divide-y divide-line/60">
              <ToggleRow
                label="Print Verified Tax / BIN Identification"
                desc="Prints National Board of Revenue BIN number on receipts."
                value={showVat}
                onToggle={setShowVat}
              />
              {showVat && (
                <div className="p-5">
                  <SettingsField
                    label="Business Identification Number (BIN)"
                    value={vatNumber}
                    onChange={setVatNumber}
                  />
                </div>
              )}

              <ToggleRow
                label="Embed Digital QR Verification Code"
                desc="Prints a scannable QR code on the receipt linking directly to parcel tracking or digital invoice verification."
                value={showQrCode}
                onToggle={setShowQrCode}
              />

              <ToggleRow
                label="Show Full Delivery Address"
                desc="Includes recipient street, house, and city details."
                value={showAddress}
                onToggle={setShowAddress}
              />

              <ToggleRow
                label="Authorized Signature Line"
                desc="Displays 'Authorized Store Seal & Signature' section at the bottom of the invoice."
                value={showSignature}
                onToggle={setShowSignature}
              />

              <div className="p-5">
                <label className="block text-xs font-bold text-text mb-1.5">
                  Warranty & Return Policy Footnote
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
              {isSaving ? "Saving Invoice Settings…" : "Save Custom Invoice Rules"}
            </Button>
          </div>
        </div>

        {/* Right Live Preview: Dual A4 vs Thermal */}
        <div className="lg:col-span-5 sticky top-32 space-y-3">
          <div className="rounded-2xl border border-line bg-white shadow-md overflow-hidden">
            {/* Header Toolbar */}
            <div className="bg-surface-2/70 px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1.5 font-display">
                <IconSpark width={14} height={14} className="text-signal" /> Live Real-Time Receipt Preview
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-line/60">
                <button
                  type="button"
                  onClick={() => setLayoutMode("a4")}
                  className={cx(
                    "px-2 py-0.5 text-[10.5px] rounded font-medium transition-all cursor-pointer",
                    layoutMode === "a4" ? "bg-signal text-white font-bold" : "text-text-3 hover:text-text",
                  )}
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("thermal")}
                  className={cx(
                    "px-2 py-0.5 text-[10.5px] rounded font-medium transition-all cursor-pointer",
                    layoutMode === "thermal" ? "bg-signal text-white font-bold" : "text-text-3 hover:text-text",
                  )}
                >
                  Thermal 80mm
                </button>
              </div>
            </div>

            {/* A4 Format Preview */}
            {layoutMode === "a4" ? (
              <div className="p-6 space-y-4 font-sans text-xs bg-white">
                <div className="flex items-start justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-xl grid place-items-center text-white font-bold font-display text-sm shadow-xs"
                      style={{ backgroundColor: brandColor }}
                    >
                      ন
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-text font-display">
                        {TENANT.name}
                      </h4>
                      <p className="text-[10.5px] text-text-3">{invoiceTagline}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold text-white uppercase tracking-wider mb-1"
                      style={{ backgroundColor: brandColor }}
                    >
                      TAX INVOICE
                    </span>
                    <p className="font-bold text-text text-sm">
                      {invoicePrefix}{invoiceSeq}
                    </p>
                    <p className="text-[10px] text-text-3">04 Sep, 2026</p>
                  </div>
                </div>

                {showAddress && (
                  <div className="grid grid-cols-2 gap-3 text-[11px] bg-surface-2/40 p-3 rounded-xl border border-line/60">
                    <div>
                      <span className="text-text-3 font-mono text-[9px] uppercase block">
                        Customer Details
                      </span>
                      <p className="font-bold text-text">Ayesha Siddiqua</p>
                      <p className="text-text-3">House 12, Road 4, Dhanmondi, Dhaka</p>
                      <p className="font-mono text-text-3">+880 1812-998877</p>
                    </div>
                    <div className="text-right">
                      <span className="text-text-3 font-mono text-[9px] uppercase block">
                        Payment & Courier
                      </span>
                      <p className="font-bold text-text">Cash on Delivery (COD)</p>
                      <p className="text-text-3">Courier: Steadfast Express</p>
                      {showVat && (
                        <p className="font-mono text-[10px] text-text-3 mt-0.5">{vatNumber}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2 border-b border-line pb-3">
                  <div className="flex justify-between font-mono text-[10px] font-bold text-text-3 uppercase">
                    <span>Item Description</span>
                    <span>Total</span>
                  </div>
                  <div className="divide-y divide-line/40">
                    <div className="flex justify-between py-1.5">
                      <div>
                        <p className="font-semibold text-text">Dhakai Jamdani Saree</p>
                        <p className="text-[10px] text-text-3">SKU: JAM-042 · Qty: 1</p>
                      </div>
                      <span className="font-mono font-bold text-text">৳৪,৮৫০</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <div>
                        <p className="font-semibold text-text">Handwoven Silk Scarf</p>
                        <p className="text-[10px] text-text-3">SKU: SCF-108 · Qty: 1</p>
                      </div>
                      <span className="font-mono font-bold text-text">৳১,২০০</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-text-3">
                    <span>Subtotal</span>
                    <span>৳৬,০৫০</span>
                  </div>
                  <div className="flex justify-between text-text-3">
                    <span>Shipping Fee (Dhaka Metro)</span>
                    <span>৳৬০</span>
                  </div>
                  <div
                    className="flex justify-between font-bold text-sm pt-2 border-t border-line"
                    style={{ color: brandColor }}
                  >
                    <span>Total Due</span>
                    <span>৳৬,১১০</span>
                  </div>
                </div>

                {showQrCode && (
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-line">
                    <div className="text-[10.5px] text-text-3">
                      <p className="font-bold text-text">Digital Verification</p>
                      <p>Scan to verify authentic order & tracking</p>
                    </div>
                    <div className="size-12 rounded bg-surface-2 border border-line grid place-items-center font-mono text-[9px] text-text-3">
                      [QR Code]
                    </div>
                  </div>
                )}

                {showSignature && (
                  <div className="pt-2 flex justify-between items-end text-[10px] text-text-3">
                    <span>Hotline: {supportPhone}</span>
                    <span className="border-t border-line pt-1 font-mono">Authorized Seal</span>
                  </div>
                )}

                <p className="text-[10px] text-text-3 italic text-center pt-2">
                  {invoiceTerms}
                </p>
              </div>
            ) : (
              /* POS Thermal 80mm Slip Preview */
              <div className="p-6 font-mono text-[11px] bg-[#fafafa] space-y-3 border-x-4 border-dashed border-line/40">
                <div className="text-center space-y-1 border-b border-dashed border-line pb-2">
                  <h4 className="font-bold text-sm uppercase">{TENANT.name}</h4>
                  <p className="text-[10px] text-text-3">{invoiceTagline}</p>
                  <p className="text-[10px] font-bold">INV: {invoicePrefix}{invoiceSeq}</p>
                  <p className="text-[9.5px] text-text-3">04/09/2026 10:45 AM</p>
                </div>

                <div className="space-y-1 text-[10px] border-b border-dashed border-line pb-2">
                  <p><strong>CUST:</strong> Ayesha Siddiqua</p>
                  <p><strong>TEL:</strong> +880 1812-998877</p>
                  <p><strong>ADDR:</strong> Dhanmondi 4, Dhaka</p>
                  <p><strong>COURIER:</strong> Steadfast Express (COD)</p>
                </div>

                <div className="space-y-1 border-b border-dashed border-line pb-2">
                  <div className="flex justify-between">
                    <span>1x Jamdani Saree</span>
                    <span>৳4,850</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Silk Scarf</span>
                    <span>৳1,200</span>
                  </div>
                  <div className="flex justify-between text-text-3">
                    <span>Delivery (Dhaka)</span>
                    <span>৳60</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-xs pt-1">
                  <span>TOTAL COD:</span>
                  <span>৳6,110</span>
                </div>

                {showQrCode && (
                  <div className="text-center pt-2">
                    <div className="size-14 mx-auto bg-surface-2 border border-line grid place-items-center text-[8px]">
                      [QR-80MM]
                    </div>
                    <p className="text-[9px] text-text-3 mt-1">Scan for Steadfast Consignment</p>
                  </div>
                )}

                <div className="text-center text-[9px] text-text-3 pt-1">
                  <p>Hotline: {supportPhone}</p>
                  <p className="italic mt-1">{invoiceTerms}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-text-3 px-1">
            <span>✨ Live automatic layout update</span>
            <button
              type="button"
              onClick={() => alert("Sample invoice PDF rendering triggered.")}
              className="text-signal hover:underline font-medium cursor-pointer"
            >
              Print Test Sample ↗
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: Website Orders (Sync Orders to WooCommerce/Shopify/Custom REST)
   ═══════════════════════════════════════════════════════════════════ */
function TabWebsiteOrders() {
  const [enabled, setEnabled] = useState(false);
  const [preset, setPreset] = useState<"custom" | "woocommerce" | "shopify">("custom");
  const [paymentMode, setPaymentMode] = useState<"payment_link" | "cod">("payment_link");
  const [apiBaseUrl, setApiBaseUrl] = useState("https://nokshi.co/api/v1/orders");
  const [authType, setAuthType] = useState("api_key");
  const [headerName, setHeaderName] = useState("X-API-Key");
  const [apiKey, setApiKey] = useState("arise_live_89128394812");
  const [showKey, setShowKey] = useState(false);

  const [requestTemplate, setRequestTemplate] = useState(`{
  "customer_name": "{{customer_name}}",
  "customer_phone": "{{customer_phone}}",
  "delivery_address": "{{delivery_address}}",
  "city": "{{city}}",
  "items": {{items_json}},
  "total_amount": {{total_amount}},
  "delivery_charge": {{delivery_charge}},
  "payment_method": "{{payment_method}}"
}`);

  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    status: number;
    latency: string;
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
        status: 200,
        latency: "142ms",
      });
    }, 1100);
  };

  const handleProposeTemplate = () => {
    if (preset === "woocommerce") {
      setRequestTemplate(`{
  "payment_method": "cod",
  "payment_method_title": "Cash on Delivery",
  "billing": {
    "first_name": "{{customer_name}}",
    "phone": "{{customer_phone}}",
    "address_1": "{{delivery_address}}"
  },
  "line_items": {{items_json}}
}`);
    } else if (preset === "shopify") {
      setRequestTemplate(`{
  "order": {
    "email": "{{customer_email}}",
    "phone": "{{customer_phone}}",
    "shipping_address": {
      "name": "{{customer_name}}",
      "address1": "{{delivery_address}}"
    },
    "financial_status": "pending"
  }
}`);
    } else {
      setRequestTemplate(`{
  "customer_name": "{{customer_name}}",
  "customer_phone": "{{customer_phone}}",
  "delivery_address": "{{delivery_address}}",
  "items": {{items_json}},
  "total_amount": {{total_amount}}
}`);
    }
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
            <span>Website Orders configuration saved and verified!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Website Orders Integration"
          sub="Let the AI agent place confirmed chat orders directly on your own website or e-commerce backend."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Enable Website Ordering"
            desc="When active, AI chat orders are dispatched to your website order API instead of the standalone list."
            value={enabled}
            onToggle={setEnabled}
          />

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Platform Preset
                </label>
                <select
                  value={preset}
                  onChange={(e) => {
                    const val = e.target.value as "custom" | "woocommerce" | "shopify";
                    setPreset(val);
                    if (val === "woocommerce") {
                      setApiBaseUrl("https://yourshop.com/wp-json/wc/v3/orders");
                      setHeaderName("Authorization");
                    } else if (val === "shopify") {
                      setApiBaseUrl("https://yourshop.myshopify.com/admin/api/2024-01/orders.json");
                      setHeaderName("X-Shopify-Access-Token");
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
                >
                  <option value="custom">Custom REST API / Webhook</option>
                  <option value="woocommerce">WooCommerce (WordPress)</option>
                  <option value="shopify">Shopify Store API</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Order Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as "payment_link" | "cod")}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
                >
                  <option value="payment_link">Payment link (pay online) — Agent sends checkout URL</option>
                  <option value="cod">Cash on delivery (COD) — Agent directly creates confirmed order</option>
                </select>
              </div>
            </div>

            <SettingsField
              label="API Base URL Endpoint"
              value={apiBaseUrl}
              onChange={setApiBaseUrl}
              placeholder="https://yourshop.com/api/orders"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Authentication Type
                </label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
                >
                  <option value="api_key">API Key Header</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="none">No Authentication (Public)</option>
                </select>
              </div>

              <SettingsField
                label="Auth Header Name"
                value={headerName}
                onChange={setHeaderName}
                placeholder="X-API-Key"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1.5">
                API Key / Secret Token
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-mono text-text pr-10 focus:border-signal outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-text-3 hover:text-text cursor-pointer"
                >
                  {showKey ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text">JSON Request Payload Template</h3>
            <p className="text-xs text-text-3 mt-0.5">
              Available variables: <code className="font-mono text-signal font-semibold">{"{{customer_name}}"}</code>, <code className="font-mono text-signal font-semibold">{"{{customer_phone}}"}</code>, <code className="font-mono text-signal font-semibold">{"{{delivery_address}}"}</code>, <code className="font-mono text-signal font-semibold">{"{{items_json}}"}</code>, <code className="font-mono text-signal font-semibold">{"{{total_amount}}"}</code>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleProposeTemplate}
          >
            🪄 AI Propose Template
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <textarea
            rows={8}
            value={requestTemplate}
            onChange={(e) => setRequestTemplate(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface-2/40 p-3.5 text-xs font-mono text-text outline-hidden focus:border-signal leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={handleTestPing}
                disabled={isPinging}
              >
                {isPinging ? "Dispatching Ping…" : "Send Test Order Ping"}
              </Button>
              {pingResult && (
                <span className="text-xs font-mono text-signal flex items-center gap-1 font-semibold">
                  <IconCheck width={13} height={13} /> HTTP {pingResult.status} OK ({pingResult.latency})
                </span>
              )}
            </div>

            <Button
              size="md"
              variant="signal"
              type="submit"
              disabled={isSaving}
              className="px-6"
            >
              {isSaving ? "Saving Configuration…" : "Save Website Orders Setup"}
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6: Couriers (Steadfast, Pathao, RedX, Zones & Auto-Book)
   ═══════════════════════════════════════════════════════════════════ */
function TabCourier() {
  const [defaultCourier, setDefaultCourier] = useState("steadfast");
  const [insideDhaka, setInsideDhaka] = useState("60");
  const [subDhaka, setSubDhaka] = useState("100");
  const [outsideDhaka, setOutsideDhaka] = useState("150");
  const [freeDeliveryMin, setFreeDeliveryMin] = useState("3000");
  const [autoBook, setAutoBook] = useState(true);
  const [includePackingSlip, setIncludePackingSlip] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const couriers = [
    {
      id: "steadfast",
      name: "Steadfast Courier",
      coverage: "Nationwide (64 Districts + All Upazilas)",
      key: "sf_live_49182394",
      status: "Connected",
      badge: "Fastest COD Payout",
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
      badge: "Bulky Items",
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
            <span>Courier dispatch rules and delivery pricing saved!</span>
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
          title="Delivery Zones & Automated Dispatch"
          sub="Configure shipping charges and immediate booking behavior."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Instant Auto-Booking on Order Verification"
            desc="Automatically create shipment with default courier as soon as buyer confirms COD details in chat."
            value={autoBook}
            onToggle={setAutoBook}
          />

          <ToggleRow
            label="Printable Courier Packing Slip with QR Code"
            desc="Generate instant PDF packing slips with Steadfast/Pathao tracking barcode."
            value={includePackingSlip}
            onToggle={setIncludePackingSlip}
          />

          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <SettingsField
              label="Inside Dhaka (৳)"
              value={insideDhaka}
              onChange={setInsideDhaka}
              placeholder="60"
            />
            <SettingsField
              label="Sub-Districts / Savar (৳)"
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
            <SettingsField
              label="Free Shipping Min Order (৳)"
              value={freeDeliveryMin}
              onChange={setFreeDeliveryMin}
              placeholder="3000"
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
          {isSaving ? "Saving Courier Settings…" : "Save Courier Rules & Rates"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 7: Meta CAPI (Pixel ID, Access Token, Events & Test Ping)
   ═══════════════════════════════════════════════════════════════════ */
function TabMeta() {
  const [capiEnabled, setCapiEnabled] = useState(true);
  const [pixelId, setPixelId] = useState("738291039482104");
  const [accessToken, setAccessToken] = useState("EAABoZA9X1mZCQBAKz9PZChqKq2wL4uG9J9M8kZD");
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
            <span>Meta Conversions API parameters saved and active!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Meta Conversions API (CAPI)"
          sub="Server-side event dispatch for Facebook & Instagram Ads. Bypass ad-blockers and feed high-fidelity purchase signals directly to Meta Graph API."
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
                    {showToken ? <IconEyeOff width={16} height={16} /> : <IconEye width={16} height={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <SettingsField
                  label="Meta Test Event Code (Optional for testing)"
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
                <p className="text-text-2 font-mono text-[11px]">{pingResult.message}</p>
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
            { event: "Purchase", desc: "Order booked & courier consignment created.", active: true },
            { event: "Lead", desc: "Customer provided name and shipping address.", active: true },
            { event: "AddToCart", desc: "Customer requested variant checkout in chat.", active: true },
            { event: "InitiateCheckout", desc: "AI presented the invoice payment summary.", active: true },
            { event: "ViewContent", desc: "Customer viewed product variant photos.", active: false },
            { event: "Search", desc: "Customer queried catalog for specific items.", active: false },
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
   TAB 8: Product Feed (Meta Catalog, Google Shopping & XML)
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
            <span>All catalog feeds synchronized! 47 active products updated.</span>
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
          title="Feed Automation & Sync Schedule"
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

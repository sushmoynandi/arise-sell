"use client";

import { useState } from "react";
import { cx } from "@/lib/format";

type SettingsTab = "general" | "security" | "notifications" | "advanced";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [webhookTesting, setWebhookTesting] = useState(false);
  const [webhookTested, setWebhookTested] = useState(false);
  const [terminatedSessions, setTerminatedSessions] = useState(false);

  // 1. General Settings State
  const [platformName, setPlatformName] = useState("NextProduct AI");
  const [legalEntity, setLegalEntity] = useState(
    "NextProduct Technologies BD Ltd.",
  );
  const [supportEmail, setSupportEmail] = useState("support@nextproduct.ai");
  const [supportHotline, setSupportHotline] = useState("+880 1700-123456");
  const [currency, setCurrency] = useState("BDT (৳)");
  const [timezone, setTimezone] = useState("Asia/Dhaka (GMT+6)");
  const [trialDays, setTrialDays] = useState("14");
  const [trialMsgAllowance, setTrialMsgAllowance] = useState("500");
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requirePhoneOtp, setRequirePhoneOtp] = useState(true);
  const [termsUrl, setTermsUrl] = useState("https://nextproduct.ai/terms");
  const [privacyUrl, setPrivacyUrl] = useState(
    "https://nextproduct.ai/privacy",
  );

  // 2. Security & Access State
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [require2FA, setRequire2FA] = useState(true);
  const [passwordMinLength, setPasswordMinLength] = useState("10");
  const [requireSpecialChar, setRequireSpecialChar] = useState(true);
  const [ipLockEnabled, setIpLockEnabled] = useState(false);
  const [allowedIps, setAllowedIps] = useState(
    "103.145.118.42, 103.205.71.18, 182.160.122.95",
  );
  const [autoBanBruteForce, setAutoBanBruteForce] = useState(true);

  // 3. Notifications & Alerts State
  const [alertEmail, setAlertEmail] = useState("alerts@nextproduct.ai");
  const [smsGatewayToken, setSmsGatewayToken] = useState(
    "sms_teletalk_gw_88a91c0b",
  );
  const [slackWebhook, setSlackWebhook] = useState(
    "https://hooks.slack.com/services/T00/B00/X00",
  );
  const [notifyOnFailover, setNotifyOnFailover] = useState(true);
  const [notifyOnHighLatency, setNotifyOnHighLatency] = useState(true);
  const [notifyOnBruteForce, setNotifyOnBruteForce] = useState(true);
  const [notifyOnPaymentFail, setNotifyOnPaymentFail] = useState(true);

  // 4. Advanced & Danger Zone State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState(
    "Scheduled platform optimization in progress. AI customer conversations remain 100% active.",
  );
  const [emergencyAiKillSwitch, setEmergencyAiKillSwitch] = useState(false);
  const [auditLogRetention, setAuditLogRetention] = useState("90");
  const [globalRateLimit, setGlobalRateLimit] = useState("120");

  const handleSave = (section: string) => {
    setSaveSuccess(section);
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const handleTestWebhook = () => {
    setWebhookTesting(true);
    setTimeout(() => {
      setWebhookTesting(false);
      setWebhookTested(true);
      setTimeout(() => setWebhookTested(false), 3500);
    }, 900);
  };

  const handleTerminateSessions = () => {
    setTerminatedSessions(true);
    setTimeout(() => setTerminatedSessions(false), 3000);
  };

  const NAV_ITEMS = [
    {
      id: "general" as const,
      label: "General & Platform",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M12 6h.01M12 10h.01M12 14h.01M16 10h.01M16 14h.01M8 10h.01M8 14h.01" />
        </svg>
      ),
    },
    {
      id: "security" as const,
      label: "Security & Authentication",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      ),
    },
    {
      id: "notifications" as const,
      label: "Incident Alerts & Webhooks",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
      ),
    },
    {
      id: "advanced" as const,
      label: "Advanced & Danger Zone",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Global Toast Notification */}
      {saveSuccess && (
        <div className="flex items-center justify-between rounded-2xl border border-signal/30 bg-signal/[0.08] px-4 py-3 text-[13px] font-semibold text-signal shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="grid size-5 place-items-center rounded-full bg-signal text-white text-xs">
              ✓
            </span>
            <span>
              {saveSuccess} saved and synchronized across all edge nodes.
            </span>
          </div>
          <span className="text-[11px] font-mono opacity-80">
            Synced in 14ms
          </span>
        </div>
      )}

      {/* Master-Detail 2-Column Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Clean Minimalist Navigation Menu */}
        <aside className="w-full lg:w-64 shrink-0 lg:sticky lg:top-24 bg-white p-2 rounded-2xl border border-line shadow-xs space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={cx(
                  "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer select-none",
                  isActive
                    ? "bg-signal/[0.08] text-signal font-semibold"
                    : "text-text-2 hover:bg-surface-2/60 hover:text-text font-medium",
                )}
              >
                <span
                  className={cx(
                    "shrink-0 transition-colors",
                    isActive ? "text-signal" : "text-text-3",
                  )}
                >
                  {item.icon}
                </span>
                <span className="text-[13px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Right Column: Settings Content Panels */}
        <main className="flex-1 min-w-0 space-y-6 w-full">
          {/* TAB 1: General & Platform */}
          {activeTab === "general" && (
            <div className="space-y-6">
              {/* Card 1: Platform Profile */}
              <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-line bg-white">
                  <h2 className="text-[15px] font-bold text-text">
                    Platform Profile & Legal Entity
                  </h2>
                  <p className="text-[12.5px] text-text-3 mt-0.5">
                    Public branding, administrator contacts, and regional
                    localization.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block">
                        Platform Public Name
                      </label>
                      <p className="text-[11.5px] text-text-3">
                        Displayed on merchant dashboards & invoices
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={platformName}
                        onChange={(e) => setPlatformName(e.target.value)}
                        className="w-full max-w-md rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block">
                        Legal Registered Entity
                      </label>
                      <p className="text-[11.5px] text-text-3">
                        Corporate name for bKash & VAT compliance
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={legalEntity}
                        onChange={(e) => setLegalEntity(e.target.value)}
                        className="w-full max-w-md rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block">
                        Support Email
                      </label>
                      <p className="text-[11.5px] text-text-3">
                        Primary contact for platform inquiries
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="email"
                        value={supportEmail}
                        onChange={(e) => setSupportEmail(e.target.value)}
                        className="w-full max-w-md rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block">
                        Merchant Emergency Hotline
                      </label>
                      <p className="text-[11.5px] text-text-3">
                        Direct phone line for merchant support
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="text"
                        value={supportHotline}
                        onChange={(e) => setSupportHotline(e.target.value)}
                        className="w-full max-w-xs rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block">
                        Billing Currency & Locale
                      </label>
                      <p className="text-[11.5px] text-text-3">
                        Base currency and server timezone
                      </p>
                    </div>
                    <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-36 rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="Asia/Dhaka (GMT+6)">
                          Asia/Dhaka (GMT+6)
                        </option>
                        <option value="Asia/Singapore (GMT+8)">
                          Asia/Singapore (GMT+8)
                        </option>
                        <option value="UTC (GMT+0)">UTC (GMT+0)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Separate Save Button for Platform Profile */}
                <div className="px-6 py-3.5 border-t border-line bg-canvas/30 flex items-center justify-between">
                  <span className="text-[11.5px] text-text-3">
                    Applies across public landing pages and invoices
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave("Platform Profile")}
                    className="rounded-xl bg-signal px-4.5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer"
                  >
                    Save Profile
                  </button>
                </div>
              </div>

              {/* Card 2: Merchant Signups & Trial Policies */}
              <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-line bg-white">
                  <h2 className="text-[15px] font-bold text-text">
                    Merchant Signups & Free Trial Policies
                  </h2>
                  <p className="text-[12.5px] text-text-3 mt-0.5">
                    Onboarding gates, mobile phone verification, and trial
                    quotas for new stores.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <p className="text-[13.5px] font-semibold text-text">
                        Allow New Merchant Signups
                      </p>
                      <p className="text-[12px] text-text-3">
                        Permit new eCommerce stores to register on
                        nextproduct.ai
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllowRegistration(!allowRegistration)}
                      className={cx(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        allowRegistration ? "bg-signal" : "bg-neutral-300",
                      )}
                    >
                      <span
                        className={cx(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          allowRegistration ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-line/60">
                    <div className="pr-4">
                      <p className="text-[13.5px] font-semibold text-text">
                        Require Mobile Phone OTP Verification
                      </p>
                      <p className="text-[12px] text-text-3">
                        Send 6-digit SMS verification code to owner mobile
                        number during signup
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequirePhoneOtp(!requirePhoneOtp)}
                      className={cx(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        requirePhoneOtp ? "bg-signal" : "bg-neutral-300",
                      )}
                    >
                      <span
                        className={cx(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          requirePhoneOtp ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Default Free Trial Duration
                      </label>
                      <select
                        value={trialDays}
                        onChange={(e) => setTrialDays(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="7">7 Days Trial</option>
                        <option value="14">14 Days Trial (Standard)</option>
                        <option value="30">30 Days Extended Trial</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Free Trial AI Message Allowance
                      </label>
                      <input
                        type="number"
                        value={trialMsgAllowance}
                        onChange={(e) => setTrialMsgAllowance(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Terms of Service URL
                      </label>
                      <input
                        type="url"
                        value={termsUrl}
                        onChange={(e) => setTermsUrl(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[12.5px] font-mono text-text focus:bg-white focus:border-signal/50 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Privacy Policy URL
                      </label>
                      <input
                        type="url"
                        value={privacyUrl}
                        onChange={(e) => setPrivacyUrl(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[12.5px] font-mono text-text focus:bg-white focus:border-signal/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Separate Save Button for Merchant Policies */}
                <div className="px-6 py-3.5 border-t border-line bg-canvas/30 flex items-center justify-between">
                  <span className="text-[11.5px] text-text-3">
                    Controls new shop provisioning in Bangladesh
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave("Merchant Policies")}
                    className="rounded-xl bg-signal px-4.5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer"
                  >
                    Save Policies
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Security & Authentication */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Card 1: Admin Authentication & Multi-Factor */}
              <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-line bg-white">
                  <h2 className="text-[15px] font-bold text-text">
                    Admin Authentication & Session Lifecycle
                  </h2>
                  <p className="text-[12.5px] text-text-3 mt-0.5">
                    Session inactivity rules, multi-factor enforcement, and
                    password policies.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <p className="text-[13.5px] font-semibold text-text">
                          Enforce Two-Factor Authentication (2FA)
                        </p>
                        <span className="rounded bg-signal/10 px-2 py-0.5 font-mono text-[10.5px] font-bold text-signal border border-signal/20">
                          TOTP Required
                        </span>
                      </div>
                      <p className="text-[12px] text-text-3">
                        Require Google Authenticator or 1Password code for every
                        super admin login
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRequire2FA(!require2FA)}
                      className={cx(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        require2FA ? "bg-signal" : "bg-neutral-300",
                      )}
                    >
                      <span
                        className={cx(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          require2FA ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block">
                        Admin Inactivity Timeout
                      </label>
                      <p className="text-[11.5px] text-text-3">
                        Automatically terminate idle admin sessions
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <select
                        value={sessionTimeout}
                        onChange={(e) => setSessionTimeout(e.target.value)}
                        className="rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="8">
                          8 Hours (High Security Office)
                        </option>
                        <option value="24">
                          24 Hours (Standard Operational)
                        </option>
                        <option value="72">72 Hours (Extended DevOps)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-center pt-4 border-t border-line/60">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block">
                        Minimum Password Length
                      </label>
                      <p className="text-[11.5px] text-text-3">
                        Enforce strong password complexity
                      </p>
                    </div>
                    <div className="sm:col-span-2 flex items-center gap-3">
                      <select
                        value={passwordMinLength}
                        onChange={(e) => setPasswordMinLength(e.target.value)}
                        className="rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="8">8 Characters</option>
                        <option value="10">10 Characters (Recommended)</option>
                        <option value="14">14 Characters (Enterprise)</option>
                      </select>
                      <label className="flex items-center gap-2 text-[12.5px] font-medium text-text cursor-pointer">
                        <input
                          type="checkbox"
                          checked={requireSpecialChar}
                          onChange={(e) =>
                            setRequireSpecialChar(e.target.checked)
                          }
                          className="size-4 rounded border-line text-signal focus:ring-signal"
                        />
                        <span>Require symbols & numbers</span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-line/60">
                    <div className="pr-4">
                      <p className="text-[13.5px] font-semibold text-text">
                        Auto-Ban Brute-Force IP Attacks
                      </p>
                      <p className="text-[12px] text-text-3">
                        Automatically block IP addresses for 60 minutes after 5
                        consecutive failed login attempts
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAutoBanBruteForce(!autoBanBruteForce)}
                      className={cx(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        autoBanBruteForce ? "bg-signal" : "bg-neutral-300",
                      )}
                    >
                      <span
                        className={cx(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          autoBanBruteForce ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Separate Save Button for Authentication Settings */}
                <div className="px-6 py-3.5 border-t border-line bg-canvas/30 flex items-center justify-between">
                  <span className="text-[11.5px] text-text-3">
                    Zero-trust access policy active
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave("Authentication Security")}
                    className="rounded-xl bg-signal px-4.5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer"
                  >
                    Save Authentication
                  </button>
                </div>
              </div>

              {/* Card 2: Zero-Trust IP Whitelist */}
              <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-line bg-white flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-bold text-text">
                      Zero-Trust Admin IP Restriction
                    </h2>
                    <p className="text-[12.5px] text-text-3 mt-0.5">
                      Block administrative access from unlisted or unknown
                      public IP addresses.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIpLockEnabled(!ipLockEnabled)}
                    className={cx(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      ipLockEnabled ? "bg-signal" : "bg-neutral-300",
                    )}
                  >
                    <span
                      className={cx(
                        "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        ipLockEnabled ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>

                <div className="p-6 space-y-3">
                  <label className="text-[12.5px] font-semibold text-text block">
                    Allowed Super Admin Static IP Addresses (Comma-separated)
                  </label>
                  <textarea
                    rows={2}
                    value={allowedIps}
                    disabled={!ipLockEnabled}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    className={cx(
                      "w-full rounded-xl border border-line bg-canvas/70 p-3 font-mono text-[12.5px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all",
                      !ipLockEnabled && "opacity-50 cursor-not-allowed",
                    )}
                  />
                  <p className="text-[11.5px] text-text-3">
                    {ipLockEnabled
                      ? "🔒 Active: Only requests matching these static IP addresses are granted access to /admin."
                      : "🔓 Inactive: Admin portal can be accessed from any authenticated device with valid 2FA."}
                  </p>
                </div>

                {/* Separate Save Button for IP Policy */}
                <div className="px-6 py-3.5 border-t border-line bg-canvas/30 flex items-center justify-between">
                  <span className="text-[11.5px] text-text-3">
                    Strict perimeter firewall rules
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave("IP Whitelist")}
                    className="rounded-xl bg-signal px-4.5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer"
                  >
                    Save IP Policy
                  </button>
                </div>
              </div>

              {/* Card 3: Active Super Admin Sessions */}
              <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-line bg-white flex items-center justify-between">
                  <div>
                    <h2 className="text-[15px] font-bold text-text">
                      Active Super Admin Sessions
                    </h2>
                    <p className="text-[12.5px] text-text-3 mt-0.5">
                      Devices and locations currently authenticated with root
                      administrative privileges.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTerminateSessions}
                    className="rounded-xl border border-rose-200 bg-rose-50/60 px-3.5 py-1.5 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    {terminatedSessions
                      ? "Sessions Terminated! ✓"
                      : "Terminate All Other Sessions"}
                  </button>
                </div>

                <div className="divide-y divide-line/60 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 place-items-center rounded-xl bg-surface-2 border border-line text-sm">
                        💻
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-bold text-text">
                            Mac OS · Chrome 128.0
                          </p>
                          <span className="rounded bg-signal/10 px-1.5 py-0.5 text-[10px] font-bold text-signal border border-signal/20">
                            Current Session
                          </span>
                        </div>
                        <p className="text-[11.5px] text-text-3 font-mono">
                          103.145.118.42 · Dhaka, Bangladesh
                        </p>
                      </div>
                    </div>
                    <span className="text-[11.5px] text-signal font-semibold">
                      Active Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Notifications & Webhooks */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-line bg-white">
                  <h2 className="text-[15px] font-bold text-text">
                    Incident Channels & Webhooks
                  </h2>
                  <p className="text-[12.5px] text-text-3 mt-0.5">
                    Route mission-critical alerts to your DevOps Slack channel,
                    Discord server, and SMS gateway.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Primary Incident Alert Email
                      </label>
                      <input
                        type="email"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Emergency SMS Gateway Token (Teletalk/BulkSMS BD)
                      </label>
                      <input
                        type="password"
                        value={smsGatewayToken}
                        onChange={(e) => setSmsGatewayToken(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line/60">
                    <label className="text-[12.5px] font-semibold text-text block mb-1">
                      Slack / Discord Incident Webhook URL
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="url"
                        value={slackWebhook}
                        onChange={(e) => setSlackWebhook(e.target.value)}
                        className="flex-1 rounded-xl border border-line bg-canvas/70 px-3.5 py-2 font-mono text-[12px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleTestWebhook}
                        disabled={webhookTesting}
                        className="rounded-xl border border-line bg-white px-4 py-2 text-[12.5px] font-bold text-text hover:bg-surface-2 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                      >
                        {webhookTesting
                          ? "Pinging..."
                          : webhookTested
                            ? "Test Passed! ✓"
                            : "Test Ping Webhook"}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line/60 space-y-3">
                    <p className="text-[11.5px] font-mono uppercase font-bold text-text-3">
                      AUTOMATED INCIDENT TRIGGER RULES
                    </p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-1">
                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-canvas/50 hover:bg-surface-2/40 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyOnFailover}
                          onChange={(e) =>
                            setNotifyOnFailover(e.target.checked)
                          }
                          className="size-4.5 rounded border-line text-signal focus:ring-signal cursor-pointer"
                        />
                        <div>
                          <p className="text-[13px] font-bold text-text">
                            AI Model Failover Event
                          </p>
                          <p className="text-[11.5px] text-text-3">
                            Gemini ➔ OpenAI automatic failover triggered
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-canvas/50 hover:bg-surface-2/40 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyOnHighLatency}
                          onChange={(e) =>
                            setNotifyOnHighLatency(e.target.checked)
                          }
                          className="size-4.5 rounded border-line text-signal focus:ring-signal cursor-pointer"
                        />
                        <div>
                          <p className="text-[13px] font-bold text-text">
                            Courier API Latency &gt; 1500ms
                          </p>
                          <p className="text-[11.5px] text-text-3">
                            Steadfast/Pathao API slow down alerts
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-canvas/50 hover:bg-surface-2/40 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyOnBruteForce}
                          onChange={(e) =>
                            setNotifyOnBruteForce(e.target.checked)
                          }
                          className="size-4.5 rounded border-line text-signal focus:ring-signal cursor-pointer"
                        />
                        <div>
                          <p className="text-[13px] font-bold text-text">
                            Repeated Brute-Force Login
                          </p>
                          <p className="text-[11.5px] text-text-3">
                            Multiple failed super admin authentication spikes
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3.5 rounded-xl border border-line bg-canvas/50 hover:bg-surface-2/40 transition-all cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifyOnPaymentFail}
                          onChange={(e) =>
                            setNotifyOnPaymentFail(e.target.checked)
                          }
                          className="size-4.5 rounded border-line text-signal focus:ring-signal cursor-pointer"
                        />
                        <div>
                          <p className="text-[13px] font-bold text-text">
                            bKash Webhook Callback Failure
                          </p>
                          <p className="text-[11.5px] text-text-3">
                            Subscription checkout IPN verification errors
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Separate Save Button for Incident Webhooks */}
                <div className="px-6 py-3.5 border-t border-line bg-canvas/30 flex items-center justify-between">
                  <span className="text-[11.5px] text-text-3">
                    Live webhook dispatchers ready
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave("Incident Webhooks")}
                    className="rounded-xl bg-signal px-4.5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer"
                  >
                    Save Webhook Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Advanced & Danger Zone */}
          {activeTab === "advanced" && (
            <div className="space-y-6">
              {/* Card 1: Advanced Platform Policies */}
              <div className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-line bg-white">
                  <h2 className="text-[15px] font-bold text-text">
                    Data Retention & Burst Protection
                  </h2>
                  <p className="text-[12.5px] text-text-3 mt-0.5">
                    Audit trail longevity and store inbound API rate throttling.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Security Audit Log Retention
                      </label>
                      <select
                        value={auditLogRetention}
                        onChange={(e) => setAuditLogRetention(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:outline-none cursor-pointer transition-all"
                      >
                        <option value="30">30 Days</option>
                        <option value="90">
                          90 Days (Standard Compliance)
                        </option>
                        <option value="365">
                          365 Days (Enterprise Extended)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[12.5px] font-semibold text-text block mb-1">
                        Max Inbound API Requests (per minute / store)
                      </label>
                      <input
                        type="number"
                        value={globalRateLimit}
                        onChange={(e) => setGlobalRateLimit(e.target.value)}
                        className="w-full rounded-xl border border-line bg-canvas/70 px-3.5 py-2 text-[13px] text-text focus:bg-white focus:border-signal/50 focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                      />
                      <p className="text-[11.5px] text-text-3 mt-1">
                        Excess traffic is buffered in Redis to prevent DB load
                      </p>
                    </div>
                  </div>
                </div>

                {/* Separate Save Button for Data Retention */}
                <div className="px-6 py-3.5 border-t border-line bg-canvas/30 flex items-center justify-between">
                  <span className="text-[11.5px] text-text-3">
                    Auto-purges expired logs periodically
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave("Data Retention Policies")}
                    className="rounded-xl bg-signal px-4.5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer"
                  >
                    Save Data Policies
                  </button>
                </div>
              </div>

              {/* Card 2: Danger Zone */}
              <div className="rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs overflow-hidden">
                <div className="px-6 py-5 border-b border-rose-200 bg-rose-50/50">
                  <div className="flex items-center gap-2">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-rose-600 shrink-0"
                    >
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                      <path d="M12 9v4M12 17h.01" />
                    </svg>
                    <h2 className="text-[15px] font-bold text-rose-900">
                      Platform Danger Zone
                    </h2>
                  </div>
                  <p className="text-[12.5px] text-rose-700 mt-0.5">
                    Actions here immediately impact merchant console
                    availability across all 148 stores.
                  </p>
                </div>

                <div className="p-6 space-y-6 divide-y divide-rose-200/60">
                  <div className="flex items-center justify-between">
                    <div className="pr-4">
                      <p className="text-[13.5px] font-bold text-rose-950">
                        Platform Maintenance Mode
                      </p>
                      <p className="text-[12px] text-rose-800">
                        Lock merchant consoles and display a scheduled
                        maintenance notice during upgrades
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaintenanceMode(!maintenanceMode)}
                      className={cx(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        maintenanceMode ? "bg-rose-600" : "bg-neutral-300",
                      )}
                    >
                      <span
                        className={cx(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          maintenanceMode ? "translate-x-5" : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>

                  {maintenanceMode && (
                    <div className="pt-4 space-y-2">
                      <label className="text-[12px] font-bold text-rose-900 block">
                        Public Maintenance Broadcast Notice to Merchants:
                      </label>
                      <textarea
                        rows={2}
                        value={maintenanceNotice}
                        onChange={(e) => setMaintenanceNotice(e.target.value)}
                        className="w-full rounded-xl border border-rose-300 bg-white p-3 text-[12.5px] text-rose-950 focus:border-rose-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-5">
                    <div className="pr-4">
                      <p className="text-[13.5px] font-bold text-rose-950">
                        Emergency Automated Checkout Kill-Switch
                      </p>
                      <p className="text-[12px] text-rose-800">
                        Immediately pause automated WhatsApp order checkout bots
                        if an upstream anomaly occurs
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setEmergencyAiKillSwitch(!emergencyAiKillSwitch)
                      }
                      className={cx(
                        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        emergencyAiKillSwitch
                          ? "bg-rose-600"
                          : "bg-neutral-300",
                      )}
                    >
                      <span
                        className={cx(
                          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          emergencyAiKillSwitch
                            ? "translate-x-5"
                            : "translate-x-0",
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Separate Save Button for Danger Zone */}
                <div className="px-6 py-3.5 border-t border-rose-200 bg-rose-50/40 flex items-center justify-between">
                  <span className="text-[11.5px] text-rose-700">
                    Immediate production impact
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSave("Danger Zone Policies")}
                    className="rounded-xl bg-rose-700 px-4.5 py-2 text-[12.5px] font-bold text-white shadow-xs hover:bg-rose-800 active:scale-98 transition-all cursor-pointer"
                  >
                    Save Danger Zone Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

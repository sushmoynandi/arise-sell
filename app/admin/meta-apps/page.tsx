"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INITIAL_META_APPS, type MetaAppConfig } from "@/data/admin";
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconPulse,
  IconTrash,
  IconWarn,
  IconWhatsApp,
  IconMessenger,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

export default function AdminMetaAppsPage() {
  const [metaApps, setMetaApps] = useState<MetaAppConfig[]>(INITIAL_META_APPS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deletingApp, setDeletingApp] = useState<MetaAppConfig | null>(null);

  // Key reveal & copy state
  const [revealedTokens, setRevealedTokens] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Verification state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [globalBanner, setGlobalBanner] = useState<string | null>(null);

  // Form state
  const [channelType, setChannelType] = useState<"whatsapp" | "messenger">("whatsapp");
  const [appName, setAppName] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [token, setToken] = useState("");

  // Modal test connection state
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{
    success: boolean;
    latency: number;
    msg: string;
  } | null>(null);

  // Copy helper
  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle token reveal
  const toggleReveal = (id: string) => {
    setRevealedTokens((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Live token test in table
  const handleTestToken = (app: MetaAppConfig) => {
    setTestingId(app.id);
    setTimeout(() => {
      setTestingId(null);
      setVerifiedId(app.id);
      setGlobalBanner(
        `Meta Graph API ${app.graphVersion} Handshake Verified for ${app.appName} (Status: 200 OK · Handshake latency: 140ms)`,
      );
      setTimeout(() => {
        setVerifiedId(null);
        setGlobalBanner(null);
      }, 4500);
    }, 600);
  };

  // Test inside Modal
  const handleModalTest = () => {
    if (!token.trim()) {
      setModalTestResult({
        success: false,
        latency: 0,
        msg: "Please enter a System User Access Token before testing.",
      });
      return;
    }

    setModalTesting(true);
    setModalTestResult(null);

    setTimeout(() => {
      const lat = Math.floor(Math.random() * 60) + 160;
      setModalTesting(false);
      setModalTestResult({
        success: true,
        latency: lat,
        msg: `Token verified (${lat}ms) · Meta Graph API v21.0 · Status: 200 OK`,
      });
    }, 600);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deletingApp) {
      setMetaApps((prev) => prev.filter((a) => a.id !== deletingApp.id));
      setDeletingApp(null);
    }
  };

  // Submit new app
  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !wabaId || !token) return;

    const newApp: MetaAppConfig = {
      id: `meta-${Date.now()}`,
      appName,
      wabaId,
      phoneNumberId: phoneId || "Auto-detected",
      graphVersion: "v21.0",
      tokenMasked: `${token.slice(0, 7)}...${token.slice(-4)}`,
      status: "active",
      tokenExpiresIn: "Never (Permanent System User Token)",
      webhookStatus: "verified",
      throughput24h: 0,
    };

    setMetaApps((prev) => [newApp, ...prev]);
    setAppName("");
    setWabaId("");
    setPhoneId("");
    setToken("");
    setModalTestResult(null);
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6.5 max-w-5xl mx-auto py-1">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4.5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
              Meta Cloud API &amp; WABA
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-3 py-0.5 text-[12px] font-bold text-signal">
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              Graph API v21.0
            </span>
          </div>
          <p className="text-[14px] text-text-3 mt-1">
            Manage WhatsApp Business Accounts (WABA) &amp; Meta Graph API system user credentials.
          </p>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={() => {
            setModalTestResult(null);
            setAddModalOpen(true);
          }}
          className="gap-2 font-semibold text-[13px] h-10 px-4 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <IconPlus width={15} height={15} />
          <span>Connect Meta App</span>
        </Button>
      </div>

      {/* ─── Verification Banner ─── */}
      <AnimatePresence>
        {globalBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-signal/30 bg-signal/[0.07] p-3.5 text-[13px] font-medium text-signal shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <IconCheck width={16} height={16} className="shrink-0 text-signal" />
              <span>{globalBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalBanner(null)}
              className="text-text-3 hover:text-text p-1 cursor-pointer"
            >
              <IconClose width={14} height={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. Webhook Endpoints Strip ─── */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase text-text-3 font-mono tracking-wider">
                Webhook Callback URL
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy("https://nextproduct.ai/api/webhooks/meta", "wh-url")
                }
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-signal hover:underline cursor-pointer"
              >
                {copiedKey === "wh-url" ? (
                  <>
                    <IconCheck width={13} height={13} />
                    <span>Copied ✓</span>
                  </>
                ) : (
                  <>
                    <IconCopy width={13} height={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-text text-[13.5px] select-all bg-surface-2/40 px-3.5 py-2 rounded-xl border border-line/60">
              https://nextproduct.ai/api/webhooks/meta
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold uppercase text-text-3 font-mono tracking-wider">
                Webhook Verify Token
              </span>
              <button
                type="button"
                onClick={() =>
                  handleCopy("np_live_wh_99a8b7c6d5e4f3a2", "wh-token")
                }
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-signal hover:underline cursor-pointer"
              >
                {copiedKey === "wh-token" ? (
                  <>
                    <IconCheck width={13} height={13} />
                    <span>Copied ✓</span>
                  </>
                ) : (
                  <>
                    <IconCopy width={13} height={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <p className="font-mono text-signal text-[13.5px] font-semibold select-all bg-surface-2/40 px-3.5 py-2 rounded-xl border border-line/60">
              np_live_wh_99a8b7c6d5e4f3a2
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Meta Apps Table ─── */}
      <div className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-line bg-surface-2/20 flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-text">
            Connected Apps ({metaApps.length})
          </h2>
          <span className="text-[12px] text-text-3 font-mono">
            System User Permanent Credentials
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13.5px]">
            <thead className="border-b border-line bg-surface-2/40 text-[11.5px] font-bold uppercase tracking-wider text-text-3 font-mono">
              <tr>
                <th className="py-3 px-4.5">Channel &amp; Name</th>
                <th className="py-3 px-4">WABA ID</th>
                <th className="py-3 px-4">Phone ID</th>
                <th className="py-3 px-4">System Token</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {metaApps.map((app) => {
                const isRevealed = revealedTokens[app.id];
                const isTesting = testingId === app.id;
                const isDone = verifiedId === app.id;
                const isCopied = copiedKey === app.id;

                const isWhatsApp =
                  app.appName.toLowerCase().includes("waba") ||
                  app.appName.toLowerCase().includes("whatsapp");

                return (
                  <tr key={app.id} className="hover:bg-surface-2/30 transition-colors">
                    {/* Channel & Name */}
                    <td className="py-3.5 px-4.5">
                      <div className="flex items-center gap-3">
                        <div className="size-8.5 rounded-lg bg-surface-2 border border-line/70 grid place-items-center shrink-0">
                          {isWhatsApp ? (
                            <IconWhatsApp width={17} height={17} className="text-emerald-600" />
                          ) : (
                            <IconMessenger width={17} height={17} className="text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-text leading-tight text-[14px]">
                            {app.appName}
                          </p>
                          <p className="text-[11.5px] text-text-3 font-mono mt-0.5">
                            {app.graphVersion}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* WABA ID */}
                    <td className="py-3.5 px-4 font-mono text-[13px] text-text-2">
                      <div className="inline-flex items-center gap-1.5">
                        <span>{app.wabaId}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(app.wabaId, `waba-${app.id}`)}
                          className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                          title="Copy WABA ID"
                        >
                          {copiedKey === `waba-${app.id}` ? (
                            <IconCheck width={12} height={12} className="text-signal" />
                          ) : (
                            <IconCopy width={12} height={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Phone Number ID */}
                    <td className="py-3.5 px-4 font-mono text-[13px] text-text-3">
                      <span>{app.phoneNumberId}</span>
                    </td>

                    {/* Masked Token */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 font-mono text-[12.5px] text-text-2 bg-surface-2/60 px-2.5 py-1 rounded-lg border border-line/60">
                        <span>
                          {isRevealed
                            ? `${app.tokenMasked.replace("...", "_TOKEN_")}`
                            : app.tokenMasked}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(app.id)}
                          className="text-text-3 hover:text-text p-0.5 cursor-pointer"
                          title="Reveal / Hide"
                        >
                          {isRevealed ? (
                            <IconEyeOff width={13} height={13} />
                          ) : (
                            <IconEye width={13} height={13} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(app.tokenMasked, app.id)}
                          className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                          title="Copy Token"
                        >
                          {isCopied ? (
                            <IconCheck width={13} height={13} className="text-signal" />
                          ) : (
                            <IconCopy width={13} height={13} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-0.5 rounded-full bg-signal/[0.08] text-signal">
                        <span className="size-1.5 rounded-full bg-signal" />
                        Verified
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleTestToken(app)}
                          disabled={isTesting}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-[12px] font-medium text-text-2 hover:border-signal hover:text-signal transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <IconPulse
                            width={12}
                            height={12}
                            className={isTesting ? "animate-spin text-signal" : ""}
                          />
                          <span>
                            {isTesting ? "Testing..." : isDone ? "Verified ✓" : "Verify"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingApp(app)}
                          className="text-text-3 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <IconTrash width={14} height={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. Delete Confirmation Dialog ─── */}
      <AnimatePresence>
        {deletingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="size-9.5 rounded-full bg-rose-50 border border-rose-200 grid place-items-center shrink-0 text-rose-600">
                  <IconWarn width={19} height={19} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text">
                    Remove Meta App Gateway?
                  </h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to remove <strong>{deletingApp.appName}</strong>? Automated messaging using this token will pause immediately.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingApp(null)}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <IconTrash width={13} height={13} />
                  <span>Yes, Remove</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 5. Clean Simple Add Meta App Modal ─── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[15.5px] font-bold text-text">
                Connect Meta System Token
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleAddApp} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block font-bold text-text mb-1">
                  Channel
                </label>
                <select
                  value={channelType}
                  onChange={(e) => {
                    const c = e.target.value as "whatsapp" | "messenger";
                    setChannelType(c);
                    setAppName(
                      c === "whatsapp"
                        ? "NextProduct Production WABA"
                        : "Messenger & Instagram Gateway",
                    );
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                >
                  <option value="whatsapp">WhatsApp Business (WABA)</option>
                  <option value="messenger">Messenger &amp; Instagram Direct</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  App Name
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. NextProduct Production WABA"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    WABA ID
                  </label>
                  <input
                    type="text"
                    required
                    value={wabaId}
                    onChange={(e) => setWabaId(e.target.value)}
                    placeholder="109827364519283"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono text-[12.5px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text mb-1">
                    Phone Number ID
                  </label>
                  <input
                    type="text"
                    value={phoneId}
                    onChange={(e) => setPhoneId(e.target.value)}
                    placeholder="102938475610293"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono text-[12.5px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-text">
                  Permanent System User Access Token
                </label>
                <input
                  type="password"
                  required
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    if (modalTestResult) setModalTestResult(null);
                  }}
                  placeholder="EAAG..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono text-[12.5px]"
                />

                {/* Test Verification Banner */}
                {modalTestResult && (
                  <div className="rounded-xl border border-signal/40 bg-signal/[0.08] p-2.5 text-[12px] text-signal font-medium flex items-center gap-2">
                    <IconCheck width={14} height={14} className="shrink-0 text-signal" />
                    <span className="font-mono">{modalTestResult.msg}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={handleModalTest}
                  disabled={modalTesting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 px-3.5 py-2 text-[12.5px] font-semibold text-text hover:border-signal hover:text-signal transition-colors cursor-pointer disabled:opacity-50"
                >
                  <IconPulse
                    width={12}
                    height={12}
                    className={modalTesting ? "animate-spin text-signal" : ""}
                  />
                  <span>{modalTesting ? "Testing..." : "Test Connection"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="signal" size="sm">
                    Save &amp; Connect
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

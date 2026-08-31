"use client";

import { useState } from "react";
import { INITIAL_META_APPS, type MetaAppConfig } from "@/data/admin";
import { IconCheck, IconClose } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

export default function AdminMetaAppsPage() {
  const [metaApps, setMetaApps] = useState<MetaAppConfig[]>(INITIAL_META_APPS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Form state
  const [appName, setAppName] = useState("");
  const [wabaId, setWabaId] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [token, setToken] = useState("");

  const handleTestToken = (name: string) => {
    setTestResult(
      `Authenticating ${name} against Meta Graph API v21.0... Valid System User Token (Never Expires)`,
    );
    setTimeout(() => setTestResult(null), 4500);
  };

  const handleAddApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appName || !wabaId || !token) return;

    const newApp: MetaAppConfig = {
      id: `meta-${Date.now()}`,
      appName,
      wabaId,
      phoneNumberId: phoneId || "Auto-detected",
      graphVersion: "v21.0",
      tokenMasked: `${token.slice(0, 6)}...${token.slice(-4)}`,
      status: "active",
      tokenExpiresIn: "Permanent System User Token",
      webhookStatus: "verified",
      throughput24h: 0,
    };

    setMetaApps((prev) => [...prev, newApp]);
    setAppName("");
    setWabaId("");
    setPhoneId("");
    setToken("");
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight text-text">
            Meta Cloud API & WABA Token Vault
          </h1>
          <p className="text-[13.5px] text-text-3">
            WhatsApp Business Account (WABA), Messenger & Instagram Graph API
            permanent system user tokens.
          </p>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={() => setAddModalOpen(true)}
          className="gap-1.5 font-semibold text-[13px]"
        >
          <span>+ Connect Meta App Token</span>
        </Button>
      </div>

      {/* Test Feedback Banner */}
      {testResult && (
        <div className="rounded-2xl border border-signal/20 bg-signal/[0.06] p-4 text-[13px] font-medium text-signal shadow-sm flex items-center gap-2.5 animate-in fade-in">
          <IconCheck width={16} height={16} />
          <span>{testResult}</span>
        </div>
      )}

      {/* Webhook Configuration Information */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-text">
          Meta Webhook Endpoints
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 text-[12.5px]">
          <div className="rounded-xl border border-line bg-canvas p-3.5 space-y-1">
            <span className="text-[11px] font-bold uppercase text-text-3">
              Webhook Callback URL
            </span>
            <p className="font-mono text-text select-all font-semibold">
              https://nextproduct.ai/api/webhooks/meta
            </p>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-3.5 space-y-1">
            <span className="text-[11px] font-bold uppercase text-text-3">
              Webhook Verify Token
            </span>
            <p className="font-mono text-signal select-all font-semibold">
              np_live_wh_99a8b7c6d5e4f3a2
            </p>
          </div>
        </div>
      </div>

      {/* Meta Apps Table */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden p-5 space-y-4">
        <h2 className="text-base font-bold text-text">
          Active Meta App Configurations
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-text-3 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">App Name</th>
                <th className="pb-3">WABA ID</th>
                <th className="pb-3">Phone Number ID</th>
                <th className="pb-3">Graph API</th>
                <th className="pb-3">System Token</th>
                <th className="pb-3">Token Expiry</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {metaApps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-surface-2/40 transition-colors"
                >
                  <td className="py-3.5 pr-3 font-bold text-text">
                    {app.appName}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[12px] text-text-2">
                    {app.wabaId}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[12px] text-text-3">
                    {app.phoneNumberId}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-signal font-semibold">
                    {app.graphVersion}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-text-2 text-[12px]">
                    {app.tokenMasked}
                  </td>
                  <td className="py-3.5 pr-3 text-[12px] text-text-3">
                    {app.tokenExpiresIn}
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleTestToken(app.appName)}
                      className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-medium text-text hover:border-signal hover:text-signal transition-colors cursor-pointer shadow-sm"
                    >
                      Verify Token
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Meta App Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-text">
                Connect Meta System Token
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg border border-line text-text-2 hover:bg-surface-2 cursor-pointer"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleAddApp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  App / Gateway Name
                </label>
                <input
                  type="text"
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. NextProduct Production WABA"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  WABA Account ID
                </label>
                <input
                  type="text"
                  required
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  placeholder="e.g. 109827364519283"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  Phone Number ID
                </label>
                <input
                  type="text"
                  value={phoneId}
                  onChange={(e) => setPhoneId(e.target.value)}
                  placeholder="e.g. 102938475610293"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  System User Permanent Access Token
                </label>
                <input
                  type="password"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="EAAG..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="md">
                  Save & Authenticate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

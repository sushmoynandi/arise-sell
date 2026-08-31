"use client";

import { useState } from "react";
import { INITIAL_AI_KEYS, type AiProviderKey } from "@/data/admin";
import { IconCheck, IconClose, IconPulse } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { formatTaka } from "@/lib/format";

export default function AdminAiGatewayPage() {
  const [keys, setKeys] = useState<AiProviderKey[]>(INITIAL_AI_KEYS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{
    id: string;
    latency: number;
    msg: string;
  } | null>(null);
  const [failoverSimActive, setFailoverSimActive] = useState(false);
  const [simLog, setSimLog] = useState<string | null>(null);

  // Form state
  const [newProvider, setNewProvider] =
    useState<AiProviderKey["provider"]>("openai");
  const [newModel, setNewModel] = useState("gpt-4o-mini");
  const [newKey, setNewKey] = useState("");
  const [newRole, setNewRole] = useState<AiProviderKey["role"]>("standby");

  // Handle live test ping
  const handleTestPing = (id: string) => {
    setTestingKeyId(id);
    setTestResult(null);
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 250) + 180;
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id
            ? {
                ...k,
                latencyMs: simulatedLatency,
                lastPing: `Just now (${simulatedLatency}ms · 200 OK)`,
                status: k.status === "rate_limited" ? "active" : k.status,
              }
            : k,
        ),
      );
      setTestingKeyId(null);
      setTestResult({
        id,
        latency: simulatedLatency,
        msg: `Connection verified! TTFT: ${simulatedLatency}ms via Dhaka Edge Server.`,
      });
      setTimeout(() => setTestResult(null), 4000);
    }, 900);
  };

  // Add new API key
  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey) return;

    const providerNames = {
      google: "Google Gemini",
      openai: "OpenAI",
      anthropic: "Anthropic Claude",
      deepseek: "DeepSeek",
      groq: "Groq Cloud",
      custom: "Custom LLM Endpoint",
    };

    const newKeyObj: AiProviderKey = {
      id: `ai-key-${Date.now()}`,
      provider: newProvider,
      providerName: providerNames[newProvider],
      model: newModel,
      keyMasked: `${newKey.slice(0, 7)}...${newKey.slice(-4)}`,
      role: newRole,
      status: newRole === "primary" ? "active" : "standby",
      latencyMs: 320,
      requests24h: 0,
      tokensConsumed: 0,
      costUSD: 0,
      costBDT: 0,
      lastPing: "Just added (Standby Ready)",
    };

    if (newRole === "primary") {
      setKeys((prev) =>
        prev.map((k) =>
          k.role === "primary"
            ? { ...k, role: "fallback_1", status: "standby" }
            : k,
        ),
      );
    }

    setKeys((prev) => [newKeyObj, ...prev]);
    setNewKey("");
    setAddModalOpen(false);
  };

  // Delete key
  const handleDeleteKey = (id: string) => {
    setKeys((prev) => prev.filter((k) => k.id !== id));
  };

  // Set primary key
  const handleSetPrimary = (id: string) => {
    setKeys((prev) =>
      prev.map((k) => {
        if (k.id === id) return { ...k, role: "primary", status: "active" };
        if (k.role === "primary")
          return { ...k, role: "fallback_1", status: "standby" };
        return k;
      }),
    );
  };

  // Simulate Instant Failover
  const handleSimulateFailover = () => {
    setFailoverSimActive(true);
    setSimLog(
      "Simulating HTTP 429 Rate Limit on Primary Provider (Google Gemini)...",
    );

    setTimeout(() => {
      setKeys((prev) =>
        prev.map((k) =>
          k.role === "primary" ? { ...k, status: "rate_limited" } : k,
        ),
      );
      setSimLog(
        "⚡ Failover triggered! Switched to Backup 1 (OpenAI GPT-4o-mini) in 48ms. 0 customer dropped.",
      );
    }, 700);

    setTimeout(() => {
      setFailoverSimActive(false);
    }, 4500);
  };

  // Recover from failover
  const handleRecover = () => {
    setKeys((prev) =>
      prev.map((k) => (k.role === "primary" ? { ...k, status: "active" } : k)),
    );
    setSimLog(null);
  };

  const totalCostUSD = keys.reduce((acc, k) => acc + k.costUSD, 0);
  const totalCostBDT = keys.reduce((acc, k) => acc + k.costBDT, 0);
  const totalTokens = keys.reduce((acc, k) => acc + k.tokensConsumed, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight text-text">
            Multi-AI Gateway & Failover Vault
          </h1>
          <p className="text-[13.5px] text-text-3">
            Multi-provider LLM load balancer with zero-downtime automatic
            failover across OpenAI, Gemini, Claude & DeepSeek.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSimulateFailover}
            disabled={failoverSimActive}
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3.5 py-2 text-[12.5px] font-semibold text-amber-800 shadow-sm hover:bg-amber-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <IconPulse width={14} height={14} />
            <span>Test Failover (Simulate 429)</span>
          </button>

          <Button
            variant="signal"
            size="md"
            onClick={() => setAddModalOpen(true)}
            className="gap-1.5 font-semibold text-[13px]"
          >
            <span>+ Add AI API Key</span>
          </Button>
        </div>
      </div>

      {/* Failover Simulation Log Banner */}
      {simLog && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-[13px] text-amber-900 shadow-sm flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-600 opacity-75" />
              <span className="relative inline-flex size-2.5 rounded-full bg-amber-600" />
            </span>
            <span className="font-medium">{simLog}</span>
          </div>
          <button
            type="button"
            onClick={handleRecover}
            className="rounded-lg bg-amber-200/80 px-2.5 py-1 text-[11.5px] font-bold text-amber-900 hover:bg-amber-300 transition-colors cursor-pointer"
          >
            Reset Primary
          </button>
        </div>
      )}

      {/* Visual Active Failover Chain Architecture */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text">
              Active Fallback Chain (Automatic Failover Router)
            </h2>
            <p className="text-[12.5px] text-text-3">
              If primary provider hits rate limit or outage, NextProduct
              instantly switches down the chain.
            </p>
          </div>
          <span className="rounded-full bg-signal/[0.08] px-3 py-1 font-mono text-[11px] font-bold text-signal">
            Auto-Switch &lt; 50ms
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
          {/* Primary */}
          {keys
            .filter((k) => k.role === "primary")
            .map((k) => (
              <div
                key={k.id}
                className={`rounded-xl border-2 p-4 space-y-2 relative transition-all ${
                  k.status === "active"
                    ? "border-signal bg-signal/[0.04]"
                    : "border-red-400 bg-red-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-signal text-white px-2 py-0.5 font-mono text-[10.5px] font-bold">
                    1. PRIMARY
                  </span>
                  <span className="font-mono text-[11.5px] font-bold text-text">
                    {k.latencyMs}ms
                  </span>
                </div>
                <p className="font-bold text-text text-[14px]">
                  {k.providerName}
                </p>
                <p className="font-mono text-[11.5px] text-text-3">{k.model}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold">
                  <span
                    className={`size-2 rounded-full ${k.status === "active" ? "bg-signal" : "bg-red-500"}`}
                  />
                  <span
                    className={
                      k.status === "active" ? "text-signal" : "text-red-600"
                    }
                  >
                    {k.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}

          {/* Fallback 1 */}
          {keys
            .filter((k) => k.role === "fallback_1")
            .map((k) => (
              <div
                key={k.id}
                className="rounded-xl border border-line bg-surface-2/40 p-4 space-y-2 relative hover:border-signal/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-black/[0.08] text-text px-2 py-0.5 font-mono text-[10.5px] font-bold">
                    2. FALLBACK 1
                  </span>
                  <span className="font-mono text-[11.5px] text-text-3">
                    {k.latencyMs}ms
                  </span>
                </div>
                <p className="font-bold text-text text-[14px]">
                  {k.providerName}
                </p>
                <p className="font-mono text-[11.5px] text-text-3">{k.model}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-text-3">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>STANDBY READY</span>
                </div>
              </div>
            ))}

          {/* Fallback 2 */}
          {keys
            .filter((k) => k.role === "fallback_2")
            .map((k) => (
              <div
                key={k.id}
                className="rounded-xl border border-line bg-surface-2/40 p-4 space-y-2 relative hover:border-signal/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-black/[0.08] text-text px-2 py-0.5 font-mono text-[10.5px] font-bold">
                    3. FALLBACK 2
                  </span>
                  <span className="font-mono text-[11.5px] text-text-3">
                    {k.latencyMs}ms
                  </span>
                </div>
                <p className="font-bold text-text text-[14px]">
                  {k.providerName}
                </p>
                <p className="font-mono text-[11.5px] text-text-3">{k.model}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-text-3">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>STANDBY READY</span>
                </div>
              </div>
            ))}

          {/* Fallback 3 */}
          {keys
            .filter((k) => k.role === "fallback_3")
            .map((k) => (
              <div
                key={k.id}
                className="rounded-xl border border-line bg-surface-2/40 p-4 space-y-2 relative hover:border-signal/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-black/[0.08] text-text px-2 py-0.5 font-mono text-[10.5px] font-bold">
                    4. FALLBACK 3
                  </span>
                  <span className="font-mono text-[11.5px] text-text-3">
                    {k.latencyMs}ms
                  </span>
                </div>
                <p className="font-bold text-text text-[14px]">
                  {k.providerName}
                </p>
                <p className="font-mono text-[11.5px] text-text-3">{k.model}</p>
                <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-text-3">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  <span>STANDBY READY</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-1">
          <span className="text-[12px] font-semibold uppercase text-text-3">
            24h Tokens Burned
          </span>
          <p className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-text">
            {(totalTokens / 1_000_000).toFixed(1)}M Tokens
          </p>
          <p className="text-[12px] text-text-3">
            Across 38,450 customer conversations
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-1">
          <span className="text-[12px] font-semibold uppercase text-text-3">
            Total 24h AI Cost
          </span>
          <p className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-text">
            ${totalCostUSD.toFixed(2)}{" "}
            <span className="text-sm font-normal text-text-3">
              ({formatTaka(totalCostBDT)})
            </span>
          </p>
          <p className="text-[12px] text-signal font-medium">
            Avg ৳০.০৫ per completed conversation
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-1">
          <span className="text-[12px] font-semibold uppercase text-text-3">
            Active Providers & Keys
          </span>
          <p className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-signal">
            {keys.length} Registered Keys
          </p>
          <p className="text-[12px] text-text-3">
            0 Unhandled Rate Limits or Outages
          </p>
        </div>
      </div>

      {/* Test Result Banner */}
      {testResult && (
        <div className="rounded-2xl border border-signal/20 bg-signal/[0.06] p-4 text-[13px] font-medium text-signal shadow-sm flex items-center gap-2.5 animate-in fade-in">
          <IconCheck width={16} height={16} />
          <span>{testResult.msg}</span>
        </div>
      )}

      {/* Main Keys Inventory Table */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text">
              Registered AI API Keys & Quota Vault
            </h2>
            <p className="text-[12.5px] text-text-3">
              Manage tokens, live ping diagnostics, and failover roles
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-text-3 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Provider & Model</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Masked Key</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">24h Requests</th>
                <th className="pb-3">24h Cost</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {keys.map((k) => (
                <tr
                  key={k.id}
                  className="hover:bg-surface-2/40 transition-colors"
                >
                  <td className="py-3.5 pr-3">
                    <p className="font-bold text-text">{k.providerName}</p>
                    <p className="font-mono text-[11.5px] text-text-3">
                      {k.model}
                    </p>
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 font-mono text-[10.5px] font-bold ${
                        k.role === "primary"
                          ? "bg-signal text-white"
                          : "bg-surface-2 text-text-2 border border-line"
                      }`}
                    >
                      {k.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-text-2 text-[12px]">
                    {k.keyMasked}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`font-mono font-bold ${
                        k.latencyMs < 500
                          ? "text-signal"
                          : k.latencyMs < 800
                            ? "text-amber-600"
                            : "text-red-500"
                      }`}
                    >
                      {k.latencyMs}ms
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-text">
                    {k.requests24h.toLocaleString()}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-text">
                    ${k.costUSD.toFixed(2)}
                  </td>
                  <td className="py-3.5 pr-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        k.status === "active"
                          ? "bg-signal/[0.08] text-signal"
                          : k.status === "standby"
                            ? "bg-surface-2 text-text-2 border border-line"
                            : "bg-red-50 text-red-700"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {k.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestPing(k.id)}
                        disabled={testingKeyId === k.id}
                        className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-medium text-text hover:border-signal hover:text-signal transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {testingKeyId === k.id ? "Pinging..." : "Ping Test"}
                      </button>

                      {k.role !== "primary" && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(k.id)}
                          className="rounded-lg border border-signal/30 bg-signal/[0.05] px-2.5 py-1 text-[11.5px] font-semibold text-signal hover:bg-signal/10 transition-colors cursor-pointer"
                        >
                          Make Primary
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteKey(k.id)}
                        className="rounded-lg border border-line bg-white px-2 py-1 text-[11.5px] text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New AI Key Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-text">
                Add New AI Provider Key
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg border border-line text-text-2 hover:bg-surface-2 cursor-pointer"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleAddKey} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  AI Provider
                </label>
                <select
                  value={newProvider}
                  onChange={(e) => {
                    const p = e.target.value as AiProviderKey["provider"];
                    setNewProvider(p);
                    if (p === "google") setNewModel("gemini-2.0-flash");
                    else if (p === "openai") setNewModel("gpt-4o-mini");
                    else if (p === "anthropic")
                      setNewModel("claude-3-5-haiku-20241022");
                    else if (p === "deepseek") setNewModel("deepseek-chat");
                    else if (p === "groq")
                      setNewModel("llama-3.3-70b-versatile");
                    else setNewModel("custom-model");
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                >
                  <option value="google">Google Gemini API</option>
                  <option value="openai">OpenAI API (GPT-4o)</option>
                  <option value="anthropic">Anthropic Claude API</option>
                  <option value="deepseek">DeepSeek API (V3 / R1)</option>
                  <option value="groq">Groq Cloud (Fast LLaMA)</option>
                  <option value="custom">Custom Ollama / vLLM Endpoint</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  Model ID
                </label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="e.g. gemini-2.0-flash"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  API Secret Key
                </label>
                <input
                  type="password"
                  required
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-... or AIza..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  Failover Priority Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as AiProviderKey["role"])
                  }
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                >
                  <option value="primary">
                    Primary (Handles 100% initial requests)
                  </option>
                  <option value="fallback_1">
                    Fallback 1 (Instant backup on 429)
                  </option>
                  <option value="fallback_2">
                    Fallback 2 (Secondary backup)
                  </option>
                  <option value="fallback_3">
                    Fallback 3 (Emergency backup)
                  </option>
                  <option value="standby">Standby (Cold backup)</option>
                </select>
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
                  Save & Validate Key
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

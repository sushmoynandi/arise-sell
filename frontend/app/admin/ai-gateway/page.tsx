"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api-client";
import { type AiProviderKey } from "@/data/admin";
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconPulse,
  IconSearch,
  IconSend,
  IconSpark,
  IconShield,
  IconTrash,
  IconKey,
  IconWarn,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { cx } from "@/lib/format";

const PROVIDER_LOGOS: Record<string, string> = {
  google: "/providers/gemini.svg",
  openai: "/providers/openai.svg",
  anthropic: "/providers/claude.svg",
  deepseek: "/providers/deepseek.svg",
  groq: "/providers/groq.svg",
  custom: "/providers/custom.svg",
};

export default function AdminAiGatewayPage() {
  const [keys, setKeys] = useState<AiProviderKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deletingKey, setDeletingKey] = useState<AiProviderKey | null>(null);

  // Key reveal & copy state
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Ping state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [pingSuccessId, setPingSuccessId] = useState<string | null>(null);

  // Failover simulation state
  const [simActive, setSimActive] = useState(false);
  const [simLog, setSimLog] = useState<string | null>(null);

  // Quick Prompt Tester state
  const [promptInput, setPromptInput] = useState("");
  const [testerLoading, setTesterLoading] = useState(false);
  const [testerResult, setTesterResult] = useState<{
    route: string;
    model: string;
    latency: number;
    tokens: number;
    costBDT: string;
    response: string;
    failoverHappened: boolean;
    failoverDetails?: string;
  } | null>(null);

  // Form state
  const [newProvider, setNewProvider] =
    useState<AiProviderKey["provider"]>("google");
  const [newModel, setNewModel] = useState("gemini-3.5-flash-lite");
  const [newKey, setNewKey] = useState("");
  const [newRole, setNewRole] = useState<AiProviderKey["role"]>("standby");

  // Modal API Key Test State
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{
    success: boolean;
    latency: number;
    msg: string;
  } | null>(null);

  // Auto-detection State
  const [detectingKey, setDetectingKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [customModelMode, setCustomModelMode] = useState(false);

  // Auto-detect provider & models from raw key
  const handleAutoDetect = async (keyInput?: string) => {
    const key = (keyInput !== undefined ? keyInput : newKey).trim();
    if (!key || key.length < 10) return;

    setDetectingKey(true);
    setModalTestResult(null);

    try {
      const res = await api.admin.detectAiKey(key);
      if (res && res.success && res.provider) {
        setNewProvider(res.provider);
        if (res.models && res.models.length > 0) {
          setAvailableModels(res.models);
          setNewModel(res.default_model || res.models[0]);
          setCustomModelMode(false);
        }
        setModalTestResult({
          success: true,
          latency: res.latency_ms || 120,
          msg: res.msg || `Auto-detected ${res.provider_name}!`,
        });
      } else {
        setModalTestResult({
          success: false,
          latency: 0,
          msg: res?.msg || "Could not auto-detect provider. Please check key.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Detection failed";
      setModalTestResult({
        success: false,
        latency: 0,
        msg,
      });
    } finally {
      setDetectingKey(false);
    }
  };

  const openAddModal = () => {
    setNewKey("");
    setModalTestResult(null);
    setAvailableModels([]);
    setCustomModelMode(false);
    setAddModalOpen(true);
  };

  // Fetch real keys from backend API
  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await api.admin.listAiKeys();
      if (Array.isArray(res)) {
        setKeys(res as AiProviderKey[]);
      }
    } catch (err) {
      console.error("Failed to fetch AI keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  // Live ping test in table
  const handlePing = async (id: string) => {
    setTestingId(id);
    try {
      const res = await api.admin.pingAiKey(id);
      if (res && res.success) {
        const latency = res.latency || 120;
        setKeys((prev) =>
          prev.map((k) =>
            k.id === id
              ? {
                  ...k,
                  latencyMs: latency,
                  lastPing: `Just now (${latency}ms · 200 OK)`,
                  status: k.status === "rate_limited" ? "active" : k.status,
                }
              : k,
          ),
        );
        setPingSuccessId(id);
        setTimeout(() => setPingSuccessId(null), 3000);
      } else {
        alert(res?.msg || res?.error || "Ping check failed");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to reach backend";
      alert(`Ping error: ${msg}`);
    } finally {
      setTestingId(null);
    }
  };

  // Live test API key inside Modal
  const handleModalTest = async () => {
    if (!newKey.trim()) {
      setModalTestResult({
        success: false,
        latency: 0,
        msg: "Please enter an API key first before testing.",
      });
      return;
    }

    setModalTesting(true);
    setModalTestResult(null);

    try {
      const res = await api.admin.testAiKey({
        provider: newProvider,
        model: newModel,
        api_key: newKey.trim(),
      });
      setModalTestResult(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setModalTestResult({
        success: false,
        latency: 0,
        msg: `Connection test failed: ${msg}`,
      });
    } finally {
      setModalTesting(false);
    }
  };

  // Toggle reveal
  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Copy key
  const handleCopy = (k: AiProviderKey) => {
    navigator.clipboard.writeText(k.keyMasked);
    setCopiedId(k.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Set primary
  const handleSetPrimary = async (id: string) => {
    try {
      await api.admin.setPrimaryAiKey(id);
      await fetchKeys();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to set primary: ${msg}`);
    }
  };

  // Confirm delete key
  const handleConfirmDelete = async () => {
    if (deletingKey) {
      try {
        await api.admin.deleteAiKey(deletingKey.id);
        setDeletingKey(null);
        await fetchKeys();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        alert(`Failed to delete key: ${msg}`);
      }
    }
  };

  // Simulate Failover (Auto-switch demo)
  const handleSimulateFailover = () => {
    setSimActive(true);
    setSimLog("Simulating Google Gemini outage (HTTP 429 Rate Limit)...");

    setTimeout(() => {
      setKeys((prev) =>
        prev.map((k) =>
          k.role === "primary" ? { ...k, status: "rate_limited" } : k,
        ),
      );
      setSimLog(
        "Failover active: Router automatically switched to Backup 1 (OpenAI GPT-4o-mini) in 38ms. 0 chats dropped.",
      );
    }, 700);

    setTimeout(() => {
      setSimActive(false);
    }, 5500);
  };

  // Reset Primary
  const handleRecoverPrimary = () => {
    setKeys((prev) =>
      prev.map((k) => (k.role === "primary" ? { ...k, status: "active" } : k)),
    );
    setSimLog(null);
  };

  // Run Quick Tester
  const handleRunTester = async () => {
    if (!promptInput.trim()) return;
    if (keys.length === 0) {
      alert(
        "No AI keys configured yet. Please add a provider key in the vault above first.",
      );
      return;
    }

    setTesterLoading(true);
    setTesterResult(null);

    const primaryKey = keys.find((k) => k.role === "primary") || keys[0];

    try {
      const res = (await api.admin.testCascade(promptInput.trim())) as {
        success: boolean;
        provider?: string;
        model?: string;
        latency_ms?: number;
        response?: string;
        failover_happened?: boolean;
        tokens?: { prompt: number; completion: number; total: number };
        cost_bdt?: number;
      };

      setTesterResult({
        route: res.provider || primaryKey.providerName || primaryKey.provider,
        model: res.model || primaryKey.model || "gemini-3.5-flash-lite",
        latency: res.latency_ms || primaryKey.latencyMs || 280,
        tokens: res.tokens?.total || 38,
        costBDT: String(res.cost_bdt || "0.01"),
        failoverHappened: Boolean(res.failover_happened),
        failoverDetails: res.failover_happened
          ? "Primary provider hit rate limit (HTTP 429) ➔ Switched to backup cascade."
          : undefined,
        response: res.response || "No response received from provider.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Test routing failed";
      setTesterResult({
        route: primaryKey.providerName || primaryKey.provider,
        model: primaryKey.model,
        latency: 0,
        tokens: 0,
        costBDT: "0.00",
        failoverHappened: false,
        response: `Execution error: ${msg}. Please verify your API key balance and permissions.`,
      });
    } finally {
      setTesterLoading(false);
    }
  };

  // Add Key Form Submit
  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    try {
      await api.admin.addAiKey({
        provider: newProvider,
        model: newModel,
        api_key: newKey.trim(),
        role: newRole,
      });

      setNewKey("");
      setModalTestResult(null);
      setAddModalOpen(false);
      await fetchKeys();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      alert(`Failed to add key: ${msg}`);
    }
  };

  const primary = keys.find((k) => k.role === "primary");
  const totalRequests = keys.reduce((acc, k) => acc + (k.requests24h || 0), 0);
  const totalTokens = keys.reduce((acc, k) => acc + (k.tokensConsumed || 0), 0);

  const filteredKeys = keys.filter((k) => {
    const q = (searchQuery || "").toLowerCase();
    const pName = (k.providerName || k.provider || "").toLowerCase();
    const model = (k.model || "").toLowerCase();
    const keyM = (k.keyMasked || "").toLowerCase();
    return pName.includes(q) || model.includes(q) || keyM.includes(q);
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ─── 1. Header & Quick Actions ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-text font-(family-name:--font-bricolage)">
              AI Gateway &amp; Provider Vault
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-signal">
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              Multi-LLM Load Balanced
            </span>
          </div>
          <p className="text-[13px] text-text-3 mt-0.5">
            Manage LLM provider keys, monitor real-time latency, and configure
            zero-downtime automated failover.
          </p>
        </div>

        <Button
          variant="signal"
          size="sm"
          onClick={openAddModal}
          className="gap-1.5 font-semibold text-[12.5px] h-9 px-3.5 self-start sm:self-auto"
        >
          <IconPlus width={14} height={14} />
          <span>Add Provider Key</span>
        </Button>
      </div>

      {/* ─── 2. Top Summary KPI Cards ─── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Primary Provider */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              Primary Provider
            </span>
            <span
              className={cx(
                "font-bold flex items-center gap-1",
                primary ? "text-signal" : "text-text-3",
              )}
            >
              <IconSpark width={12} height={12} />
              {primary ? "100% Load" : "Standby"}
            </span>
          </div>
          <div className="flex items-center gap-2.5 pt-0.5">
            {primary ? (
              <Image
                src={
                  PROVIDER_LOGOS[primary.provider] || "/providers/custom.svg"
                }
                alt={primary.providerName || "Primary Provider"}
                width={20}
                height={20}
                className="size-5 shrink-0"
              />
            ) : (
              <div className="size-5 rounded-full bg-surface-2 border border-line flex items-center justify-center text-text-3 text-[10px]">
                -
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-text truncate">
                {primary
                  ? primary.providerName || primary.provider
                  : "None Configured"}
              </p>
              <p className="text-[11px] text-text-3 font-mono truncate">
                {primary
                  ? `${primary.model} · ${primary.latencyMs || 0}ms`
                  : "Add a key to activate"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Vault Status */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              Configured Keys
            </span>
            <span className="text-signal font-bold font-mono">
              {keys.length} Providers
            </span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text">
              {keys.length === 0
                ? "0 Active"
                : `${keys.filter((k) => k.status === "active").length} Active`}
            </p>
            <p className="text-[11px] text-text-3">
              {keys.length === 0
                ? "No provider keys registered"
                : `${keys.filter((k) => k.role === "primary").length} Primary · ${keys.filter((k) => k.role !== "primary").length} Standby`}
            </p>
          </div>
        </div>

        {/* Card 3: 24h Platform Activity */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              24h Platform Activity
            </span>
            <span className="text-text-3 font-bold font-mono text-[10.5px]">
              Tokens &amp; Requests
            </span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text font-mono">
              {totalRequests.toLocaleString()}{" "}
              <span className="text-[12px] font-normal text-text-3">
                Requests
              </span>
            </p>
            <p className="text-[11px] text-text-3 font-mono">
              {totalTokens > 0
                ? `${totalTokens.toLocaleString()} tokens consumed`
                : "0 tokens consumed"}
            </p>
          </div>
        </div>

        {/* Card 4: Gateway Resilience */}
        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              Gateway Resilience
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded font-mono text-[10px]">
              {keys.length > 1 ? "Auto-Failover Armed" : "Ready"}
            </span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text">
              {keys.length > 1
                ? "Multi-LLM Active"
                : keys.length === 1
                  ? "Single Provider"
                  : "Standby"}
            </p>
            <p className="text-[11px] text-text-3">
              {keys.length > 1
                ? "Zero-downtime cascade on HTTP 429"
                : "Add fallback keys for failover"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Registered Provider Keys Table (Main Vault) ─── */}
      <div className="rounded-xl border border-line bg-white shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-line bg-surface-2/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <IconKey width={15} height={15} className="text-signal" />
            <h3 className="text-[13.5px] font-bold text-text">
              Registered API Keys Vault ({keys.length})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <IconSearch
                width={13}
                height={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-3"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search provider or model..."
                className="w-full rounded-lg border border-line bg-white pl-7.5 pr-3 py-1 text-[12px] outline-none focus:border-signal"
              />
            </div>
            {keys.length > 0 && (
              <button
                type="button"
                onClick={openAddModal}
                className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-semibold text-text hover:border-signal hover:text-signal transition-colors cursor-pointer shrink-0"
              >
                <IconPlus width={12} height={12} />
                <span>Add Key</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/40 text-[10.5px] font-bold uppercase tracking-wider text-text-3 font-mono">
              <tr>
                <th className="py-2.5 px-4">Provider &amp; Model</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Masked API Key</th>
                <th className="py-2.5 px-3">Latency / Ping</th>
                <th className="py-2.5 px-3">24h Activity</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-text-3 font-mono text-[12px]"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <IconPulse
                        width={15}
                        height={15}
                        className="text-signal animate-spin"
                      />
                      <span>Loading API keys from secure vault...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredKeys.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-3">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="size-12 rounded-2xl bg-surface-2 border border-line/80 mx-auto flex items-center justify-center text-text-3">
                        <IconKey width={20} height={20} />
                      </div>
                      <p className="font-bold text-text text-[14px]">
                        No AI Provider Keys Configured
                      </p>
                      <p className="text-[12px] text-text-3">
                        Add an API key from Google Gemini, OpenAI, Groq, or
                        Anthropic. The gateway will auto-detect your provider
                        and fetch available models.
                      </p>
                      <Button
                        size="sm"
                        variant="signal"
                        onClick={openAddModal}
                        className="gap-1.5 h-8.5 px-3.5"
                      >
                        <IconPlus width={13} height={13} />
                        <span>Add Your First AI Key</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredKeys.map((k) => {
                  const isRevealed = revealedKeys[k.id];
                  const isCopied = copiedId === k.id;
                  const isTesting = testingId === k.id;
                  const isPrimary = k.role === "primary";

                  return (
                    <tr key={k.id} className="hover:bg-surface-2/30">
                      {/* Provider & Model */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-md bg-surface-2 border border-line/60 grid place-items-center shrink-0">
                            <Image
                              src={
                                PROVIDER_LOGOS[k.provider] ||
                                "/providers/custom.svg"
                              }
                              alt={k.providerName}
                              width={18}
                              height={18}
                              className="size-4.5"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text leading-tight">
                              {k.providerName}
                            </p>
                            <p className="text-[11px] text-text-3 font-mono">
                              {k.model}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold font-mono uppercase tracking-wide",
                            isPrimary
                              ? "bg-signal/[0.12] text-signal border border-signal/30"
                              : "bg-surface-2 text-text-3 border border-line",
                          )}
                        >
                          {isPrimary && <IconSpark width={10} height={10} />}
                          {k.role.replace("_", " ")}
                        </span>
                      </td>

                      {/* Masked Key */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-text-2">
                            {isRevealed ? k.rawKey || k.keyMasked : k.keyMasked}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(k.id)}
                            className="text-text-3 hover:text-text p-0.5"
                            title={isRevealed ? "Hide key" : "Show key"}
                          >
                            {isRevealed ? (
                              <IconEyeOff width={12} height={12} />
                            ) : (
                              <IconEye width={12} height={12} />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopy(k)}
                            className="text-text-3 hover:text-text p-0.5"
                            title="Copy key"
                          >
                            <IconCopy width={12} height={12} />
                          </button>
                          {isCopied && (
                            <span className="text-signal text-[9.5px] font-bold">
                              Copied
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Latency & Ping Status */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-text text-[11.5px]">
                            {k.latencyMs || 0}ms
                          </span>
                          <p className="text-[10px] text-text-3 truncate max-w-[140px]">
                            {k.lastPing || "Not pinged"}
                          </p>
                        </div>
                      </td>

                      {/* 24h Activity */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div>
                          <p className="font-bold text-text">
                            {(k.requests24h || 0).toLocaleString()} reqs
                          </p>
                          <p className="text-[10px] text-text-3">
                            {(k.tokensConsumed || 0).toLocaleString()} tokens
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            k.status === "active"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : k.status === "rate_limited"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-surface-2 text-text-3 border border-line",
                          )}
                        >
                          <span
                            className={cx(
                              "size-1.5 rounded-full",
                              k.status === "active"
                                ? "bg-emerald-600"
                                : k.status === "rate_limited"
                                  ? "bg-rose-500 animate-pulse"
                                  : "bg-text-3",
                            )}
                          />
                          {k.status === "active"
                            ? "Active"
                            : k.status === "rate_limited"
                              ? "429 Limited"
                              : "Standby"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handlePing(k.id)}
                            disabled={isTesting}
                            className="inline-flex items-center gap-1 rounded border border-line px-2 py-0.5 text-[11px] text-text-2 hover:border-signal hover:text-signal transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <IconPulse
                              width={11}
                              height={11}
                              className={
                                isTesting ? "animate-spin text-signal" : ""
                              }
                            />
                            <span>
                              {isTesting
                                ? "Pinging..."
                                : pingSuccessId === k.id
                                  ? "Verified ✓"
                                  : "Ping"}
                            </span>
                          </button>

                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(k.id)}
                              className="rounded border border-signal/30 bg-signal/[0.06] px-2 py-0.5 text-[11px] font-semibold text-signal hover:bg-signal/15 transition-colors cursor-pointer"
                            >
                              Set Primary
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeletingKey(k)}
                            className="text-text-3 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition-colors cursor-pointer"
                            title="Delete key"
                          >
                            <IconTrash width={13} height={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 4. Automated Failover Chain (Only shown if keys configured) ─── */}
      {keys.length > 0 && (
        <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <IconShield width={15} height={15} className="text-signal" />
                <h2 className="text-[13.5px] font-bold text-text">
                  Automated Failover Hierarchy
                </h2>
              </div>
              <p className="text-[12px] text-text-3 mt-0.5">
                Traffic automatically shifts to fallback models in &lt; 50ms if
                primary provider encounters HTTP 429 rate limits.
              </p>
            </div>

            {keys.length > 1 && (
              <button
                type="button"
                onClick={handleSimulateFailover}
                disabled={simActive}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Simulates failover response if primary provider experiences rate limiting"
              >
                <IconPulse width={13} height={13} className="text-amber-700" />
                <span>Test Failover Simulation</span>
              </button>
            )}
          </div>

          {/* Failover Live Alert */}
          <AnimatePresence>
            {simLog && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-[12px] text-amber-950 shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-amber-600" />
                  </span>
                  <span className="font-mono text-[11.5px] font-medium">
                    {simLog}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRecoverPrimary}
                  className="rounded bg-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-900 hover:bg-amber-300 transition-colors cursor-pointer"
                >
                  Reset to Primary
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Priority Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {keys.map((k, idx) => {
              const isPrimary = k.role === "primary";
              const isLimited = k.status === "rate_limited";
              return (
                <div
                  key={k.id}
                  className={cx(
                    "rounded-lg border p-3.5 space-y-2.5 flex flex-col justify-between transition-all",
                    isLimited
                      ? "border-rose-400 bg-rose-50/60"
                      : isPrimary
                        ? "border-signal/60 bg-signal/[0.05] ring-1 ring-signal/20 shadow-2xs"
                        : "border-line bg-surface-2/30",
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={cx(
                          "text-[9.5px] font-bold font-mono px-1.5 py-0.5 rounded flex items-center gap-1",
                          isPrimary
                            ? "bg-signal text-white"
                            : "bg-surface-2 text-text-3 border border-line",
                        )}
                      >
                        {isPrimary && <IconSpark width={10} height={10} />}
                        {isPrimary ? "1. PRIMARY" : `FALLBACK ${idx}`}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-text-2">
                        {k.latencyMs || 0}ms
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-2.5">
                      <Image
                        src={
                          PROVIDER_LOGOS[k.provider] || "/providers/custom.svg"
                        }
                        alt={k.providerName || k.provider || "Provider"}
                        width={18}
                        height={18}
                        className="size-4.5 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[13px] text-text truncate">
                          {k.providerName || k.provider}
                        </p>
                        <p className="text-[11px] text-text-3 font-mono truncate">
                          {k.model}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line/60 flex items-center justify-between text-[11px]">
                    <span
                      className={cx(
                        "font-mono font-semibold text-[10px] uppercase flex items-center gap-1",
                        isLimited
                          ? "text-rose-600"
                          : isPrimary
                            ? "text-signal"
                            : "text-text-3",
                      )}
                    >
                      <span
                        className={cx(
                          "size-1.5 rounded-full",
                          isLimited
                            ? "bg-rose-500 animate-pulse"
                            : isPrimary
                              ? "bg-signal"
                              : "bg-text-3",
                        )}
                      />
                      {isLimited
                        ? "Rate Limited"
                        : isPrimary
                          ? "Active (Primary)"
                          : "Standby"}
                    </span>

                    {!isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(k.id)}
                        className="text-signal font-bold hover:underline cursor-pointer text-[11px]"
                      >
                        Make Primary
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 5. Gateway Latency & Routing Sandbox ─── */}
      <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSpark width={14} height={14} className="text-signal" />
            <h3 className="text-[13.5px] font-bold text-text">
              Gateway Latency &amp; Routing Sandbox
            </h3>
          </div>
          <span className="text-[11.5px] text-text-3">
            Send a benchmark prompt to inspect live response time and provider
            output
          </span>
        </div>

        {keys.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line p-6 text-center text-[12px] bg-surface-2/20">
            <p className="font-semibold text-text">Sandbox Inactive</p>
            <p className="text-text-3 text-[11.5px] mt-0.5">
              Please register an AI key in the vault above to send live test
              prompts.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            <div className="md:col-span-6 space-y-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2/30 px-3 py-2 text-[12.5px] text-text outline-none focus:border-signal"
                placeholder="Type a test prompt (e.g. 'Hello, system health check')..."
              />
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="signal"
                  onClick={handleRunTester}
                  disabled={testerLoading || !promptInput.trim()}
                  className="gap-1.5 text-[12px] h-8 disabled:opacity-50"
                >
                  <IconSend width={12} height={12} />
                  <span>
                    {testerLoading ? "Routing..." : "Send Test Message"}
                  </span>
                </Button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setPromptInput(
                        "System health check: confirm response and latency.",
                      )
                    }
                    className="text-[11px] text-text-3 hover:text-signal underline cursor-pointer"
                  >
                    Sample 1
                  </button>
                  <span className="text-text-3 text-[10px]">·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPromptInput(
                        "Hello, summarize the role of an automated AI gateway.",
                      )
                    }
                    className="text-[11px] text-text-3 hover:text-signal underline cursor-pointer"
                  >
                    Sample 2
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-6 rounded-lg border border-line bg-surface-2/40 p-3 text-[12px] flex flex-col justify-between min-h-[100px]">
              {testerLoading ? (
                <div className="py-6 flex items-center justify-center gap-2 text-text-3 font-mono text-[11.5px]">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-signal border-t-transparent animate-spin" />
                  <span>Routing through active provider cascade...</span>
                </div>
              ) : testerResult ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10.5px] text-text-3 border-b border-line/60 pb-1">
                    <span className="text-signal font-bold flex items-center gap-1">
                      <IconSpark width={11} height={11} />
                      Resolved by: {testerResult.route} ({testerResult.model})
                    </span>
                    <span>
                      TTFT: {testerResult.latency}ms · Cost: ৳
                      {testerResult.costBDT}
                    </span>
                  </div>

                  {testerResult.failoverHappened &&
                    testerResult.failoverDetails && (
                      <div className="rounded bg-amber-50 border border-amber-200 px-2 py-1 text-[11px] text-amber-900 font-mono flex items-center gap-1.5">
                        <IconPulse
                          width={12}
                          height={12}
                          className="text-amber-700 shrink-0"
                        />
                        <span>{testerResult.failoverDetails}</span>
                      </div>
                    )}

                  <p className="text-text text-[12px] leading-relaxed whitespace-pre-wrap">
                    {testerResult.response}
                  </p>
                </div>
              ) : (
                <div className="py-6 text-center text-text-3 font-mono text-[11.5px]">
                  Enter a test prompt and click &quot;Send Test Message&quot; to
                  inspect response.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── 6. Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deletingKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-full bg-rose-50 border border-rose-200 grid place-items-center shrink-0 text-rose-600">
                  <IconWarn width={20} height={20} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text">
                    Delete AI Provider Key?
                  </h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to remove{" "}
                    <strong>{deletingKey.providerName}</strong> (
                    {deletingKey.model})? It will no longer receive any customer
                    traffic or failover requests.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingKey(null)}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2 text-[12.5px] font-semibold text-white shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <IconTrash width={13} height={13} />
                  <span>Yes, Delete Key</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 7. Clean Professional Add Key Modal ─── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[15px] font-bold text-text flex items-center gap-2">
                <IconKey width={16} height={16} className="text-signal" />
                <span>Add AI Provider API Key</span>
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleAddKey} className="space-y-3.5 text-[12.5px]">
              {/* 1. Secret API Key with Auto-Detect */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-text">
                    Secret API Key <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAutoDetect()}
                    disabled={detectingKey || !newKey.trim()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-signal hover:text-signal/80 cursor-pointer disabled:opacity-40"
                  >
                    {detectingKey ? (
                      <>
                        <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-signal border-t-transparent animate-spin" />
                        <span>Detecting...</span>
                      </>
                    ) : (
                      <>
                        <IconSpark width={12} height={12} />
                        <span>Auto-Detect Provider & Models</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={newKey}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewKey(val);
                      if (modalTestResult) setModalTestResult(null);
                      if (
                        val.trim().length >= 25 &&
                        !detectingKey &&
                        availableModels.length === 0
                      ) {
                        handleAutoDetect(val);
                      }
                    }}
                    placeholder="Paste secret API key (e.g. Google, OpenAI, Groq)..."
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px] pr-20"
                  />
                  {detectingKey && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-signal text-[11px] font-semibold">
                      <span className="inline-block w-2.5 h-2.5 rounded-full border-2 border-signal border-t-transparent animate-spin" />
                      <span>Scanning...</span>
                    </div>
                  )}
                </div>

                {/* Auto-Detection / Test Verification Result Banner */}
                {modalTestResult && (
                  <div
                    className={cx(
                      "rounded-xl border p-2.5 text-[11.5px] flex items-center gap-2",
                      modalTestResult.success
                        ? "border-signal/40 bg-signal/[0.08] text-signal font-medium"
                        : "border-amber-300 bg-amber-50 text-amber-900",
                    )}
                  >
                    {modalTestResult.success ? (
                      <IconCheck
                        width={14}
                        height={14}
                        className="shrink-0 text-signal"
                      />
                    ) : (
                      <IconWarn
                        width={14}
                        height={14}
                        className="shrink-0 text-amber-700"
                      />
                    )}
                    <span className="font-mono">{modalTestResult.msg}</span>
                  </div>
                )}
              </div>

              {/* 2. AI Provider Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-text">
                    AI Provider
                  </label>
                  {availableModels.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-signal/15 text-signal font-bold flex items-center gap-1">
                      <IconCheck width={10} height={10} />
                      Auto-Identified
                    </span>
                  )}
                </div>
                <select
                  value={newProvider}
                  onChange={(e) => {
                    const p = e.target.value as AiProviderKey["provider"];
                    setNewProvider(p);
                    setModalTestResult(null);
                    setAvailableModels([]);
                    setCustomModelMode(false);
                    if (p === "google") setNewModel("gemini-3.5-flash-lite");
                    else if (p === "openai") setNewModel("gpt-4o-mini");
                    else if (p === "anthropic")
                      setNewModel("claude-3-5-haiku-20241022");
                    else if (p === "deepseek") setNewModel("deepseek-chat");
                    else if (p === "groq")
                      setNewModel("llama-3.3-70b-versatile");
                    else setNewModel("custom-model");
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none"
                >
                  <option value="google">Google Gemini (Recommended)</option>
                  <option value="openai">OpenAI (GPT-4o / GPT-4o-mini)</option>
                  <option value="anthropic">
                    Anthropic Claude (Haiku / Sonnet)
                  </option>
                  <option value="deepseek">DeepSeek (V3 / R1)</option>
                  <option value="groq">Groq Cloud (Fast LLaMA)</option>
                  <option value="custom">Custom LLM Endpoint</option>
                </select>
              </div>

              {/* 3. Model Identifier: Interactive Dropdown or Custom Text */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-text">
                    Model Identifier
                  </label>
                  {availableModels.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCustomModelMode((prev) => !prev)}
                      className="text-[11px] text-text-3 hover:text-signal cursor-pointer"
                    >
                      {customModelMode
                        ? "← Choose from auto-detected list"
                        : "+ Type custom model"}
                    </button>
                  )}
                </div>

                {availableModels.length > 0 && !customModelMode ? (
                  <select
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    className="w-full rounded-xl border border-signal/50 bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px] ring-2 ring-signal/10"
                  >
                    {availableModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    placeholder="e.g. gemini-3.5-flash-lite, gpt-4o-mini"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px]"
                  />
                )}
                {availableModels.length > 0 && !customModelMode && (
                  <p className="mt-1 text-[10.5px] text-text-3">
                    Showing {availableModels.length} models fetched directly
                    from your provider account.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Failover Priority Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) =>
                    setNewRole(e.target.value as AiProviderKey["role"])
                  }
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none"
                >
                  <option value="primary">
                    Primary (Handles initial requests)
                  </option>
                  <option value="fallback_1">
                    Fallback 1 (1st backup on 429)
                  </option>
                  <option value="fallback_2">Fallback 2 (2nd backup)</option>
                  <option value="standby">Standby (Cold backup)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={handleModalTest}
                  disabled={modalTesting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 px-3 py-2 text-[12px] font-semibold text-text hover:border-signal hover:text-signal transition-colors cursor-pointer disabled:opacity-50"
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
                    Save &amp; Activate
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

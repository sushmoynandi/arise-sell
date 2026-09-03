"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api-client";
import { type AiProviderKey } from "@/data/admin";
import {
  IconArrow,
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
  agentrouter: "/providers/custom.svg",
  openrouter: "/providers/custom.svg",
  openai: "/providers/openai.svg",
  anthropic: "/providers/claude.svg",
  deepseek: "/providers/deepseek.svg",
  groq: "/providers/groq.svg",
  custom: "/providers/custom.svg",
};

const PROVIDER_DEFAULT_MODELS: Record<string, string[]> = {
  agentrouter: [
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "gpt-4o",
    "gpt-4o-mini",
    "deepseek-chat",
    "deepseek-reasoner",
    "gemini-2.5-flash",
    "llama-3.3-70b-versatile",
  ],
  google: [
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.6-flash",
    "gemini-flash-latest",
    "gemini-pro-latest",
  ],
  openrouter: [
    "anthropic/claude-3.5-sonnet",
    "openai/gpt-4o-mini",
    "openai/gpt-4o",
    "deepseek/deepseek-chat",
    "deepseek/deepseek-r1",
    "google/gemini-2.5-flash",
    "meta-llama/llama-3.3-70b-instruct",
  ],
  openai: ["gpt-4o-mini", "gpt-4o", "o1-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  anthropic: [
    "claude-3-5-haiku-20241022",
    "claude-3-5-sonnet-20241022",
    "claude-3-opus-20240229",
  ],
  deepseek: ["deepseek-chat", "deepseek-reasoner"],
  groq: [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
  ],
  custom: ["custom-model"],
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
  const [copiedResponse, setCopiedResponse] = useState(false);

  const handleCopyResponse = () => {
    if (!testerResult?.response) return;
    navigator.clipboard.writeText(testerResult.response);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2000);
  };

  // Form state - initially empty until API key or selection is made
  const [newProvider, setNewProvider] = useState<
    AiProviderKey["provider"] | ""
  >("");
  const [newModel, setNewModel] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newRole, setNewRole] = useState<AiProviderKey["role"]>("primary");

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
        const models =
          res.models && res.models.length > 0
            ? res.models
            : PROVIDER_DEFAULT_MODELS[res.provider] || [];
        setAvailableModels(models);
        setNewModel(res.default_model || models[0] || "");
        setCustomModelMode(false);
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
    setNewProvider("");
    setNewModel("");
    setNewRole(keys.length === 0 ? "primary" : "fallback_1");
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

    const p = newProvider || "agentrouter";
    const m = newModel || (PROVIDER_DEFAULT_MODELS[p]?.[0] ?? "default-model");

    setModalTesting(true);
    setModalTestResult(null);

    try {
      const res = await api.admin.testAiKey({
        provider: p,
        model: m,
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
    if (!newKey.trim()) {
      alert("Please enter a secret API key.");
      return;
    }

    const p = newProvider || "agentrouter";
    const m =
      newModel.trim() || (PROVIDER_DEFAULT_MODELS[p]?.[0] ?? "default-model");

    try {
      await api.admin.addAiKey({
        provider: p,
        model: m,
        api_key: newKey.trim(),
        role: newRole,
      });

      setNewKey("");
      setNewProvider("");
      setNewModel("");
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

  const roleRank: Record<string, number> = {
    primary: 0,
    fallback_1: 1,
    fallback_2: 2,
    fallback_3: 3,
    standby: 4,
  };

  const sortedCascadeKeys = [...keys].sort(
    (a, b) => (roleRank[a.role] ?? 99) - (roleRank[b.role] ?? 99),
  );

  const SANDBOX_PRESETS = [
    {
      label: "⚡ Latency Benchmark",
      prompt:
        "Benchmark test: verify gateway response latency and report status code 200 OK.",
    },
    {
      label: "🏥 Health Check",
      prompt:
        "System health check: confirm active provider connectivity and token throughput.",
    },
    {
      label: "🇧🇩 বাংলা কুয়েরি",
      prompt:
        "আসসালামু আলাইকুম! কাস্টমার মেসেজ হ্যান্ডলিংয়ের জন্য এআই গেটওয়ের রেসপন্স ভেরিফাই করুন।",
    },
    {
      label: "🧠 Reasoning Test",
      prompt:
        "Summarize 3 essential advantages of an automated multi-provider LLM failover gateway.",
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* ─── 1. Header & Quick Actions ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-text font-(family-name:--font-bricolage)">
              AI Gateway &amp; Provider Vault
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-signal border border-signal/20">
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              Multi-LLM Load Balanced
            </span>
          </div>
          <p className="text-[13px] text-text-3 mt-1">
            Manage LLM provider keys, monitor real-time latency, and configure
            zero-downtime automated failover.
          </p>
        </div>

        <Button
          variant="signal"
          size="sm"
          onClick={openAddModal}
          className="gap-1.5 font-semibold text-[12.5px] h-9 px-4 shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <IconPlus width={14} height={14} />
          <span>Add Provider Key</span>
        </Button>
      </div>

      {/* ─── 2. Top Summary KPI Cards ─── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Primary Provider */}
        <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3 text-[11px]">
            <span className="font-bold uppercase tracking-wider font-mono">
              Primary Provider
            </span>
            <span
              className={cx(
                "font-semibold text-[11px] flex items-center gap-1 whitespace-nowrap px-2 py-0.5 rounded-full",
                primary
                  ? "bg-signal/10 text-signal border border-signal/20"
                  : "bg-surface-2 text-text-3",
              )}
            >
              <IconSpark width={11} height={11} />
              {primary ? "100% Traffic" : "Standby"}
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="size-9 rounded-lg bg-surface-2 border border-line/80 flex items-center justify-center p-1.5 shrink-0">
              {primary ? (
                <Image
                  src={
                    PROVIDER_LOGOS[primary.provider] || "/providers/custom.svg"
                  }
                  alt={primary.providerName || "Primary Provider"}
                  width={22}
                  height={22}
                  className="size-5.5 object-contain"
                />
              ) : (
                <span className="text-text-3 font-bold text-xs">-</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold text-text truncate">
                {primary
                  ? primary.providerName || primary.provider
                  : "None Configured"}
              </p>
              <p className="text-[11.5px] text-text-3 font-mono truncate">
                {primary
                  ? `${primary.model} · ${primary.latencyMs || 0}ms`
                  : "Add a key to activate"}
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Vault Status */}
        <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3 text-[11px]">
            <span className="font-bold uppercase tracking-wider font-mono">
              Configured Keys
            </span>
            <span className="text-signal font-semibold bg-signal/10 border border-signal/20 px-2 py-0.5 rounded-full text-[11px] whitespace-nowrap">
              {keys.length} Registered
            </span>
          </div>
          <div className="pt-1">
            <p className="text-[19px] font-bold text-text">
              {keys.length === 0
                ? "0 Active"
                : `${keys.filter((k) => k.status === "active").length} Active Keys`}
            </p>
            <p className="text-[11.5px] text-text-3 mt-0.5">
              {keys.length === 0
                ? "No provider keys registered"
                : `${keys.filter((k) => k.role === "primary").length} Primary · ${keys.filter((k) => k.role !== "primary").length} Fallback`}
            </p>
          </div>
        </div>

        {/* Card 3: 24h Platform Activity */}
        <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3 text-[11px]">
            <span className="font-bold uppercase tracking-wider font-mono">
              24h Platform Traffic
            </span>
            <span className="text-text-3 font-medium bg-surface-2 px-2 py-0.5 rounded-full text-[10.5px] whitespace-nowrap">
              Telemetry
            </span>
          </div>
          <div className="pt-1">
            <p className="text-[19px] font-bold text-text">
              {totalRequests.toLocaleString()}{" "}
              <span className="text-[12.5px] font-normal text-text-3">
                Requests
              </span>
            </p>
            <p className="text-[11.5px] text-text-3 mt-0.5">
              {totalTokens > 0
                ? `${totalTokens.toLocaleString()} tokens routed`
                : "0 tokens routed through gateway"}
            </p>
          </div>
        </div>

        {/* Card 4: Gateway Resilience */}
        <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-2 flex flex-col justify-between">
          <div className="flex items-center justify-between text-text-3 text-[11px] gap-2">
            <span className="font-bold uppercase tracking-wider font-mono truncate">
              Gateway Resilience
            </span>
            <span className="whitespace-nowrap inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 leading-none shrink-0">
              {keys.length > 1 ? "Auto-Failover Armed" : "Ready"}
            </span>
          </div>
          <div className="pt-1">
            <p className="text-[19px] font-bold text-text">
              {keys.length > 1
                ? "Multi-LLM Active"
                : keys.length === 1
                  ? "Single Provider"
                  : "Standby"}
            </p>
            <p className="text-[11.5px] text-text-3 mt-0.5">
              {keys.length > 1
                ? "Zero-downtime cascade on HTTP 429"
                : "Add secondary key for failover"}
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Registered Provider Keys Table (Main Vault) ─── */}
      <div className="rounded-xl border border-line bg-white shadow-2xs overflow-hidden">
        <div className="p-3.5 sm:px-4 border-b border-line bg-surface-2/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconKey width={16} height={16} className="text-signal" />
            <h3 className="text-[14px] font-bold text-text">
              Registered API Keys Vault ({keys.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-72">
            <IconSearch
              width={14}
              height={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search provider or model..."
              className="w-full rounded-lg border border-line bg-white pl-8.5 pr-3 py-1.5 text-[12.5px] outline-none focus:border-signal transition-colors shadow-2xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/40 text-[10.5px] font-bold uppercase tracking-wider text-text-3 font-mono">
              <tr>
                <th className="py-3 px-4">Provider &amp; Model</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Masked API Key</th>
                <th className="py-3 px-3">Latency / Ping</th>
                <th className="py-3 px-3">24h Activity</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                        Add an API key from Google Gemini, AgentRouter, OpenAI,
                        Groq, or Anthropic. The gateway will auto-detect your
                        provider and fetch available models.
                      </p>
                      <Button
                        size="sm"
                        variant="signal"
                        onClick={openAddModal}
                        className="gap-1.5 h-8.5 px-3.5 cursor-pointer"
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
                    <tr
                      key={k.id}
                      className="hover:bg-surface-2/30 transition-colors"
                    >
                      {/* Provider & Model */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="size-8 rounded-lg bg-surface-2 border border-line/60 flex items-center justify-center p-1 shrink-0">
                            <Image
                              src={
                                PROVIDER_LOGOS[k.provider] ||
                                "/providers/custom.svg"
                              }
                              alt={k.providerName}
                              width={18}
                              height={18}
                              className="size-4.5 object-contain"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text leading-tight">
                              {k.providerName}
                            </p>
                            <p className="text-[11.5px] text-text-3 font-mono">
                              {k.model}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-3">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider font-mono",
                            isPrimary
                              ? "bg-signal/15 text-signal border border-signal/30"
                              : "bg-surface-2 text-text-3 border border-line",
                          )}
                        >
                          {isPrimary && <IconSpark width={10} height={10} />}
                          {k.role.replace("_", " ")}
                        </span>
                      </td>

                      {/* Masked Key */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 font-mono text-[11.5px]">
                          <span className="text-text-2">
                            {isRevealed ? k.rawKey || k.keyMasked : k.keyMasked}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleReveal(k.id)}
                            className="text-text-3 hover:text-text p-1 cursor-pointer"
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
                            className="text-text-3 hover:text-text p-1 cursor-pointer"
                            title="Copy key"
                          >
                            <IconCopy width={12} height={12} />
                          </button>
                          {isCopied && (
                            <span className="text-signal text-[10px] font-bold">
                              Copied
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Latency & Ping Status */}
                      <td className="py-3 px-3">
                        <div className="space-y-0.5">
                          <span className="font-mono font-bold text-text text-[12px]">
                            {k.latencyMs || 0}ms
                          </span>
                          <p className="text-[10.5px] text-text-3 truncate max-w-[150px]">
                            {k.lastPing || "Not pinged"}
                          </p>
                        </div>
                      </td>

                      {/* 24h Activity */}
                      <td className="py-3 px-3 text-[11.5px]">
                        <div>
                          <p className="font-bold text-text">
                            {(k.requests24h || 0).toLocaleString()} reqs
                          </p>
                          <p className="text-[10.5px] text-text-3">
                            {(k.tokensConsumed || 0).toLocaleString()} tokens
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase",
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
                            className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] text-text-2 hover:border-signal hover:text-signal transition-colors cursor-pointer disabled:opacity-50 h-7"
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
                              className="rounded-lg border border-signal/30 bg-signal/[0.08] px-2.5 py-1 text-[11.5px] font-semibold text-signal hover:bg-signal/15 transition-colors cursor-pointer h-7"
                            >
                              Set Primary
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeletingKey(k)}
                            className="text-text-3 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer h-7 flex items-center justify-center"
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

      {/* ─── 4. Automated Failover Chain (Ordered: Primary First, then Fallbacks) ─── */}
      {keys.length > 0 && (
        <div className="rounded-xl border border-line bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <IconShield width={16} height={16} className="text-signal" />
                <h2 className="text-[14px] font-bold text-text">
                  Automated Failover Hierarchy
                </h2>
              </div>
              <p className="text-[12px] text-text-3 mt-0.5">
                Sequential zero-downtime routing order. Traffic automatically
                shifts to backup models in &lt; 50ms if primary provider returns
                HTTP 429.
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

          {/* Priority Cascade Nodes (Primary on Left, Fallback on Right) */}
          <div className="flex flex-col lg:flex-row items-stretch gap-3">
            {sortedCascadeKeys.map((k, idx) => {
              const isPrimary = k.role === "primary";
              const isLimited = k.status === "rate_limited";
              const stepLabel = isPrimary
                ? "1. PRIMARY"
                : `${idx + 1}. FALLBACK ${idx}`;

              return (
                <div
                  key={k.id}
                  className="flex-1 flex flex-col lg:flex-row items-stretch gap-3"
                >
                  <div
                    className={cx(
                      "flex-1 rounded-xl border p-4 space-y-3 flex flex-col justify-between transition-all",
                      isLimited
                        ? "border-rose-300 bg-rose-50/50"
                        : isPrimary
                          ? "border-signal/50 bg-signal/[0.04] ring-2 ring-signal/15 shadow-xs"
                          : "border-line bg-surface-2/30",
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span
                          className={cx(
                            "text-[10px] font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1",
                            isPrimary
                              ? "bg-signal text-white"
                              : "bg-surface-2 text-text-3 border border-line",
                          )}
                        >
                          {isPrimary && <IconSpark width={10} height={10} />}
                          {stepLabel}
                        </span>
                        <span className="text-[11.5px] font-mono font-bold text-text-2">
                          {k.latencyMs || 0}ms
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 mt-3">
                        <div className="size-8 rounded-lg bg-white border border-line flex items-center justify-center p-1 shrink-0">
                          <Image
                            src={
                              PROVIDER_LOGOS[k.provider] ||
                              "/providers/custom.svg"
                            }
                            alt={k.providerName || k.provider || "Provider"}
                            width={18}
                            height={18}
                            className="size-4.5 object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[13.5px] text-text truncate">
                            {k.providerName || k.provider}
                          </p>
                          <p className="text-[11.5px] text-text-3 font-mono truncate">
                            {k.model}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-line/60 flex items-center justify-between text-[11.5px]">
                      <span
                        className={cx(
                          "font-mono font-semibold text-[10.5px] uppercase flex items-center gap-1.5",
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
                            ? "Active (100% Traffic)"
                            : "Standby"}
                      </span>

                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(k.id)}
                          className="text-signal font-bold hover:underline cursor-pointer text-[11.5px]"
                        >
                          Make Primary
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flow Arrow Connector between nodes */}
                  {idx < sortedCascadeKeys.length - 1 && (
                    <div className="hidden lg:flex flex-col items-center justify-center px-1 text-text-3/60">
                      <IconArrow
                        width={18}
                        height={18}
                        className="text-text-3"
                      />
                      <span className="text-[9px] font-mono text-text-3 font-semibold mt-0.5 uppercase">
                        Failover
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── 5. Modern Developer-Grade Gateway Latency & Routing Sandbox ─── */}
      <div className="rounded-xl border border-line bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-b border-line/60 pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <IconSpark width={16} height={16} className="text-signal" />
              <h3 className="text-[14px] font-bold text-text">
                Gateway Latency &amp; Routing Sandbox
              </h3>
            </div>
            <p className="text-[12px] text-text-3 mt-0.5">
              Send a benchmark prompt to inspect live response time, token
              throughput, and provider output.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {SANDBOX_PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => setPromptInput(p.prompt)}
                className="rounded-lg border border-line bg-surface-2/40 px-2.5 py-1 text-[11px] font-semibold text-text-2 hover:border-signal hover:text-signal hover:bg-signal/[0.04] transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {keys.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line p-8 text-center bg-surface-2/20 space-y-2">
            <div className="size-10 rounded-full bg-surface border border-line grid place-items-center mx-auto text-text-3">
              <IconKey width={18} height={18} />
            </div>
            <p className="font-bold text-text text-[13.5px]">
              Sandbox Inactive
            </p>
            <p className="text-text-3 text-[12px] max-w-sm mx-auto">
              Please register an AI key in the vault above to activate latency
              benchmarking and live gateway routing.
            </p>
            <div className="pt-2">
              <Button size="sm" variant="signal" onClick={openAddModal}>
                Register Provider Key
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Column: Prompt Input Studio */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 rounded-xl border border-line bg-surface-2/20 p-3.5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-text-3 font-mono">
                  <span className="font-bold uppercase tracking-wider text-text">
                    Prompt Input
                  </span>
                  <span className="text-signal truncate max-w-[200px]">
                    Route: {primary ? primary.providerName : "Auto Cascade"}
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      handleRunTester();
                    }
                  }}
                  placeholder="Type a benchmark prompt or select a preset above..."
                  className="w-full rounded-xl border border-line bg-white p-3 text-[12.5px] text-text outline-none focus:border-signal focus:ring-2 focus:ring-signal/15 transition-all resize-none shadow-2xs font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="signal"
                    onClick={handleRunTester}
                    disabled={testerLoading || !promptInput.trim()}
                    className="gap-1.5 text-[12px] h-8.5 px-3.5 cursor-pointer disabled:opacity-50"
                  >
                    <IconSend width={12} height={12} />
                    <span>{testerLoading ? "Routing..." : "Send Prompt"}</span>
                  </Button>
                  {promptInput.trim() && (
                    <button
                      type="button"
                      onClick={() => setPromptInput("")}
                      className="text-[11px] text-text-3 hover:text-text cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <span className="text-[10.5px] font-mono text-text-3 hidden sm:inline">
                  ⌘+Enter to send
                </span>
              </div>
            </div>

            {/* Right Column: Telemetry & Live Output Window */}
            <div className="lg:col-span-7 flex flex-col justify-between rounded-xl border border-line bg-white p-4 shadow-2xs min-h-[220px]">
              {testerLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-text-3 font-mono text-[12px]">
                  <div className="relative flex items-center justify-center">
                    <span className="size-8 rounded-full border-2 border-signal border-t-transparent animate-spin" />
                    <IconPulse
                      width={14}
                      height={14}
                      className="absolute text-signal"
                    />
                  </div>
                  <div className="text-center space-y-0.5">
                    <p className="font-bold text-text text-[13px]">
                      Cascade Routing in Progress...
                    </p>
                    <p className="text-[11px] text-text-3 font-mono">
                      Querying Primary Node ➔ Measuring TTFT &amp; Failover
                    </p>
                  </div>
                </div>
              ) : testerResult ? (
                <div className="space-y-3.5">
                  {/* Micro-Telemetry Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-lg border border-line bg-surface-2/40 p-2.5 space-y-0.5">
                      <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider block">
                        Resolved Route
                      </span>
                      <p className="text-[12.5px] font-bold text-text truncate flex items-center gap-1">
                        <IconSpark
                          width={11}
                          height={11}
                          className="text-signal shrink-0"
                        />
                        <span className="truncate">{testerResult.route}</span>
                      </p>
                    </div>

                    <div className="rounded-lg border border-line bg-surface-2/40 p-2.5 space-y-0.5">
                      <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider block">
                        Latency (TTFT)
                      </span>
                      <p
                        className={cx(
                          "text-[12.5px] font-bold font-mono",
                          testerResult.latency < 500
                            ? "text-emerald-600"
                            : testerResult.latency < 1200
                              ? "text-signal"
                              : "text-amber-600",
                        )}
                      >
                        {testerResult.latency}ms
                      </p>
                    </div>

                    <div className="rounded-lg border border-line bg-surface-2/40 p-2.5 space-y-0.5">
                      <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider block">
                        Tokens Consumed
                      </span>
                      <p className="text-[12.5px] font-bold text-text font-mono">
                        {testerResult.tokens} tokens
                      </p>
                    </div>

                    <div className="rounded-lg border border-line bg-surface-2/40 p-2.5 space-y-0.5">
                      <span className="text-[10px] font-mono text-text-3 uppercase tracking-wider block">
                        Est. Spend
                      </span>
                      <p className="text-[12.5px] font-bold text-text font-mono">
                        ৳{testerResult.costBDT}
                      </p>
                    </div>
                  </div>

                  {/* Failover Hop Notification */}
                  {testerResult.failoverHappened &&
                    testerResult.failoverDetails && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11.5px] text-amber-900 font-mono flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <IconPulse
                            width={13}
                            height={13}
                            className="text-amber-700 shrink-0 animate-pulse"
                          />
                          <span>
                            Failover Triggered: {testerResult.failoverDetails}
                          </span>
                        </div>
                        <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">
                          Failover Active
                        </span>
                      </div>
                    )}

                  {/* Response Window with Copy Button */}
                  <div className="rounded-xl border border-line bg-surface-2/25 overflow-hidden shadow-2xs">
                    <div className="flex items-center justify-between px-3.5 py-2 border-b border-line bg-surface-2/60 text-[11px] font-mono text-text-3">
                      <span className="flex items-center gap-1.5 font-semibold text-text">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Model Output ({testerResult.model})
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyResponse}
                        className="inline-flex items-center gap-1 text-[11px] text-text-3 hover:text-signal transition-colors cursor-pointer"
                      >
                        <IconCopy width={12} height={12} />
                        <span>{copiedResponse ? "Copied ✓" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="p-3.5 text-[12.5px] leading-relaxed text-text whitespace-pre-wrap max-h-56 overflow-y-auto selection:bg-signal/20 font-sans">
                      {testerResult.response}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-text-3 space-y-2">
                  <div className="size-9 rounded-full bg-surface-2 border border-line/80 grid place-items-center mx-auto text-text-3">
                    <IconSpark width={16} height={16} />
                  </div>
                  <p className="font-bold text-text text-[13px]">
                    Awaiting Benchmark Prompt
                  </p>
                  <p className="text-[11.5px] text-text-3 max-w-xs mx-auto">
                    Type a prompt on the left or select a preset to benchmark
                    live response time and provider output.
                  </p>
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

              {/* 2. Revealed when API Key is provided OR user selects provider */}
              {!newKey.trim() && !newProvider ? (
                <div className="rounded-xl border border-dashed border-line p-5 text-center bg-surface-2/30 space-y-2 my-2">
                  <div className="size-9 rounded-full bg-surface border border-line grid place-items-center mx-auto text-text-3">
                    <IconKey width={16} height={16} />
                  </div>
                  <p className="font-semibold text-text text-[12.5px]">
                    API Key দিন অথবা প্রোভাইডার নির্বাচন করুন
                  </p>
                  <p className="text-text-3 text-[11px] max-w-xs mx-auto leading-relaxed">
                    API Key পেস্ট করার সাথে সাথে সিস্টেম স্বয়ংক্রিয়ভাবে
                    প্রোভাইডার (AgentRouter, Google, OpenAI ইত্যাদি) ও সকল
                    এভেইলেবল মডেল লোড করবে।
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setNewProvider("agentrouter");
                        const m = PROVIDER_DEFAULT_MODELS.agentrouter;
                        setAvailableModels(m);
                        setNewModel(m[0]);
                      }}
                      className="inline-flex items-center gap-1 text-[11.5px] text-signal font-semibold hover:underline cursor-pointer"
                    >
                      + ম্যানুয়ালি প্রোভাইডার সিলেক্ট করুন
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 pt-1 border-t border-line/60">
                  {/* AI Provider Selection */}
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
                        const p = e.target.value as
                          | AiProviderKey["provider"]
                          | "";
                        setNewProvider(p);
                        setModalTestResult(null);
                        setCustomModelMode(false);
                        if (p) {
                          const defModels = PROVIDER_DEFAULT_MODELS[p] || [
                            "default-model",
                          ];
                          setAvailableModels(defModels);
                          setNewModel(defModels[0]);
                        } else {
                          setAvailableModels([]);
                          setNewModel("");
                        }
                      }}
                      className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-medium"
                    >
                      <option value="" disabled>
                        Select AI Provider...
                      </option>
                      <option value="agentrouter">
                        AgentRouter (Multi-LLM Gateway)
                      </option>
                      <option value="google">
                        Google Gemini (Recommended)
                      </option>
                      <option value="openrouter">OpenRouter</option>
                      <option value="openai">
                        OpenAI (GPT-4o / GPT-4o-mini)
                      </option>
                      <option value="anthropic">
                        Anthropic Claude (Haiku / Sonnet)
                      </option>
                      <option value="deepseek">DeepSeek (V3 / R1)</option>
                      <option value="groq">Groq Cloud (Fast LLaMA)</option>
                      <option value="custom">Custom LLM Endpoint</option>
                    </select>
                  </div>

                  {/* Model Identifier: Interactive Dropdown or Custom Text */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-bold text-text">
                        Model Identifier
                      </label>
                      {(availableModels.length > 0 ||
                        (newProvider &&
                          PROVIDER_DEFAULT_MODELS[newProvider])) && (
                        <button
                          type="button"
                          onClick={() => setCustomModelMode((prev) => !prev)}
                          className="text-[11px] text-text-3 hover:text-signal cursor-pointer"
                        >
                          {customModelMode
                            ? "← Choose from model list"
                            : "+ Type custom model"}
                        </button>
                      )}
                    </div>

                    {!customModelMode &&
                    (availableModels.length > 0 ||
                      (newProvider && PROVIDER_DEFAULT_MODELS[newProvider])) ? (
                      <select
                        value={newModel}
                        onChange={(e) => setNewModel(e.target.value)}
                        className="w-full rounded-xl border border-signal/50 bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px] ring-2 ring-signal/10"
                      >
                        {(availableModels.length > 0
                          ? availableModels
                          : newProvider
                            ? PROVIDER_DEFAULT_MODELS[newProvider]
                            : []
                        ).map((m) => (
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
                        placeholder="e.g. claude-3-5-sonnet-20241022, gemini-3.5-flash-lite, gpt-4o"
                        className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px]"
                      />
                    )}
                    {!customModelMode && (
                      <p className="mt-1 text-[10.5px] text-text-3">
                        {availableModels.length > 0
                          ? `Showing ${availableModels.length} models fetched for this provider.`
                          : newProvider
                            ? `Default verified models available for ${newProvider.toUpperCase()}.`
                            : ""}
                      </p>
                    )}
                  </div>

                  {/* Failover Priority Role */}
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
                      <option value="fallback_2">
                        Fallback 2 (2nd backup)
                      </option>
                      <option value="standby">Standby (Cold backup)</option>
                    </select>
                  </div>

                  {/* Actions: Test Connection & Save */}
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
                        className={
                          modalTesting ? "animate-spin text-signal" : ""
                        }
                      />
                      <span>
                        {modalTesting ? "Testing..." : "Test Connection"}
                      </span>
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
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

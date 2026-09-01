"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INITIAL_AI_KEYS, type AiProviderKey } from "@/data/admin";
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
import { formatTaka, cx } from "@/lib/format";

const PROVIDER_LOGOS: Record<string, string> = {
  google: "/providers/gemini.svg",
  openai: "/providers/openai.svg",
  anthropic: "/providers/claude.svg",
  deepseek: "/providers/deepseek.svg",
  groq: "/providers/groq.svg",
  custom: "/providers/custom.svg",
};

export default function AdminAiGatewayPage() {
  const [keys, setKeys] = useState<AiProviderKey[]>(INITIAL_AI_KEYS);
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
  const [promptInput, setPromptInput] = useState(
    "এই জামদানি শাড়ির ডেলিভারি চার্জ কত এবং ক্যাশ অন ডেলিভারি পাওয়া যাবে কি?",
  );
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
  const [newModel, setNewModel] = useState("gemini-2.0-flash");
  const [newKey, setNewKey] = useState("");
  const [newRole, setNewRole] = useState<AiProviderKey["role"]>("standby");

  // Modal API Key Test State
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{
    success: boolean;
    latency: number;
    msg: string;
  } | null>(null);

  // Live ping test in table
  const handlePing = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      const latency = Math.floor(Math.random() * 120) + 180;
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
      setTestingId(null);
      setPingSuccessId(id);
      setTimeout(() => setPingSuccessId(null), 3000);
    }, 600);
  };

  // Live test API key inside Modal
  const handleModalTest = () => {
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

    setTimeout(() => {
      const latency = Math.floor(Math.random() * 110) + 190;
      setModalTesting(false);
      setModalTestResult({
        success: true,
        latency,
        msg: `Connection verified (${latency}ms) · Status: 200 OK · ${newProvider.toUpperCase()} Handshake Successful`,
      });
    }, 600);
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

  // Confirm delete key
  const handleConfirmDelete = () => {
    if (deletingKey) {
      setKeys((prev) => prev.filter((k) => k.id !== deletingKey.id));
      setDeletingKey(null);
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
  const handleRunTester = () => {
    setTesterLoading(true);
    setTesterResult(null);

    setTimeout(() => {
      const primaryKey = keys.find((k) => k.role === "primary");
      const isPrimaryBlocked =
        !primaryKey || primaryKey.status === "rate_limited";

      const active = isPrimaryBlocked
        ? keys.find(
            (k) => k.role === "fallback_1" && k.status !== "rate_limited",
          ) ||
          keys.find(
            (k) => k.role === "fallback_2" && k.status !== "rate_limited",
          ) ||
          keys.find(
            (k) => k.role === "fallback_3" && k.status !== "rate_limited",
          ) ||
          keys[0]
        : primaryKey;

      setTesterResult({
        route: active.providerName,
        model: active.model,
        latency: active.latencyMs + Math.floor(Math.random() * 20),
        tokens: 112,
        costBDT: "০.০৩",
        failoverHappened: isPrimaryBlocked,
        failoverDetails: isPrimaryBlocked
          ? `Primary (Google Gemini) returned HTTP 429 Rate Limit ➔ Instant failover to Backup 1 (${active.providerName} ${active.model}) in 38ms.`
          : undefined,
        response:
          "নকশী-তে যোগাযোগ করার জন্য ধন্যবাদ। আমাদের জামদানি শাড়ির ডেলিভারি চার্জ চট্টগ্রামে ১২০ টাকা এবং ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। আপনি ২-৩ কার্যদিবসের মধ্যে পার্সেল রিসিভ করতে পারবেন।",
      });
      setTesterLoading(false);
    }, 650);
  };

  // Add Key Form Submit
  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const names: Record<string, string> = {
      google: "Google Gemini",
      openai: "OpenAI",
      anthropic: "Anthropic Claude",
      deepseek: "DeepSeek",
      groq: "Groq Cloud",
      custom: "Custom LLM",
    };

    const newEntry: AiProviderKey = {
      id: `ai-key-${Date.now()}`,
      provider: newProvider,
      providerName: names[newProvider] || "Custom Provider",
      model: newModel,
      keyMasked: `${newKey.slice(0, 7)}...${newKey.slice(-4)}`,
      role: newRole,
      status: newRole === "primary" ? "active" : "standby",
      latencyMs: modalTestResult?.latency || 290,
      requests24h: 0,
      tokensConsumed: 0,
      costUSD: 0,
      costBDT: 0,
      lastPing: "Just added (Verified Ready)",
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

    setKeys((prev) => [newEntry, ...prev]);
    setNewKey("");
    setModalTestResult(null);
    setAddModalOpen(false);
  };

  const primary = keys.find((k) => k.role === "primary");
  const totalCostBDT = keys.reduce((acc, k) => acc + k.costBDT, 0);
  const totalCostUSD = keys.reduce((acc, k) => acc + k.costUSD, 0);
  const totalRequests = keys.reduce((acc, k) => acc + k.requests24h, 0);
  const totalTokens = keys.reduce((acc, k) => acc + k.tokensConsumed, 0);

  const filteredKeys = keys.filter((k) => {
    return (
      k.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.keyMasked.toLowerCase().includes(searchQuery.toLowerCase())
    );
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
          onClick={() => {
            setModalTestResult(null);
            setAddModalOpen(true);
          }}
          className="gap-1.5 font-semibold text-[12.5px] h-9 px-3.5 self-start sm:self-auto"
        >
          <IconPlus width={14} height={14} />
          <span>Add Provider Key</span>
        </Button>
      </div>

      {/* ─── 2. Top Summary KPI Cards ─── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              Active Primary Route
            </span>
            <span className="text-signal font-bold flex items-center gap-1">
              <IconSpark width={12} height={12} />
              100% Load
            </span>
          </div>
          <div className="flex items-center gap-2.5 pt-0.5">
            {primary && (
              <Image
                src={
                  PROVIDER_LOGOS[primary.provider] || "/providers/custom.svg"
                }
                alt={primary.providerName}
                width={20}
                height={20}
                className="size-5 shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-text truncate">
                {primary ? primary.providerName : "None"}
              </p>
              <p className="text-[11px] text-text-3 font-mono">
                {primary?.model} · {primary?.latencyMs}ms
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              24h Throughput
            </span>
            <span className="text-text-2 font-bold">+14.2%</span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text">
              {(totalTokens / 1_000_000).toFixed(1)}M Tokens
            </p>
            <p className="text-[11px] text-text-3">
              {totalRequests.toLocaleString()} requests across 148 merchants
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              24h Compute Spend
            </span>
            <span className="text-signal font-bold">BDT &amp; USD</span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text">
              {formatTaka(totalCostBDT)}{" "}
              <span className="text-[12px] font-normal text-text-3 font-mono">
                (${totalCostUSD.toFixed(2)})
              </span>
            </p>
            <p className="text-[11px] text-signal font-medium">
              Avg ৳০.০৫ per order conversation
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">
              Uptime Resilience
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
              99.98%
            </span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text font-mono">
              0 Dropped Chats
            </p>
            <p className="text-[11px] text-text-3">
              Auto-switches to backup on outage &lt;50ms
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Failover Routing Hierarchy ─── */}
      <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line/60 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <IconShield width={15} height={15} className="text-signal" />
              <h2 className="text-[13.5px] font-bold text-text">
                Automated Failover Chain
              </h2>
            </div>
            <p className="text-[12px] text-text-3 mt-0.5">
              If the Primary AI provider goes down or hits rate limits (HTTP
              429), the gateway automatically shifts traffic to Backup 1, then
              Backup 2 in &lt; 50ms without dropping any customer chat.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSimulateFailover}
            disabled={simActive}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-[12px] font-semibold text-amber-900 shadow-2xs hover:bg-amber-100 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Simulates what happens if Google Gemini encounters a rate limit or server outage"
          >
            <IconPulse width={13} height={13} className="text-amber-700" />
            <span>Test Failover Simulation</span>
          </button>
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
                      {k.latencyMs}ms
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2.5">
                    <Image
                      src={
                        PROVIDER_LOGOS[k.provider] || "/providers/custom.svg"
                      }
                      alt={k.providerName}
                      width={18}
                      height={18}
                      className="size-4.5 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-[13px] text-text truncate">
                        {k.providerName}
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

      {/* ─── 4. Quick Live Prompt Tester ─── */}
      <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSpark width={14} height={14} className="text-signal" />
            <h3 className="text-[13.5px] font-bold text-text">
              Live Prompt Routing Simulator
            </h3>
          </div>
          <span className="text-[11.5px] text-text-3">
            Send a sample customer message to verify real-time response &amp;
            latency
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          <div className="md:col-span-6 space-y-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-2/30 px-3 py-2 text-[12.5px] text-text outline-none focus:border-signal"
              placeholder="Type customer message in Bangla..."
            />
            <div className="flex items-center justify-between">
              <Button
                size="sm"
                variant="signal"
                onClick={handleRunTester}
                disabled={testerLoading}
                className="gap-1.5 text-[12px] h-8"
              >
                <IconSend width={12} height={12} />
                <span>
                  {testerLoading ? "Routing..." : "Send Test Message"}
                </span>
              </Button>
              <button
                type="button"
                onClick={() =>
                  setPromptInput(
                    "আমার পার্সেল কোড #9823 এর বর্তমান ডেলিভারি স্ট্যাটাস কী?",
                  )
                }
                className="text-[11px] text-text-3 hover:text-signal underline cursor-pointer"
              >
                Try Sample 2
              </button>
            </div>
          </div>

          <div className="md:col-span-6 rounded-lg border border-line bg-surface-2/40 p-3 text-[12px] flex flex-col justify-between">
            {testerLoading ? (
              <div className="py-4 flex items-center justify-center gap-2 text-text-3 font-mono text-[11.5px]">
                <IconPulse
                  width={13}
                  height={13}
                  className="text-signal animate-spin"
                />
                <span>Evaluating routing rules and resolving with LLM...</span>
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

                <p className="text-text text-[12px] leading-relaxed">
                  {testerResult.response}
                </p>
              </div>
            ) : (
              <div className="py-4 text-center text-text-3 font-mono text-[11.5px]">
                Click &quot;Send Test Message&quot; to inspect real-time AI
                reply.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 5. Registered Provider Keys Table ─── */}
      <div className="rounded-xl border border-line bg-white shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-line bg-surface-2/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <IconKey width={15} height={15} className="text-signal" />
            <h3 className="text-[13.5px] font-bold text-text">
              Registered API Keys Vault ({keys.length})
            </h3>
          </div>

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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/40 text-[10.5px] font-bold uppercase tracking-wider text-text-3 font-mono">
              <tr>
                <th className="py-2.5 px-4">Provider &amp; Model</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Masked API Key</th>
                <th className="py-2.5 px-3">Latency</th>
                <th className="py-2.5 px-3">24h Spend</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filteredKeys.map((k) => {
                const isRevealed = revealedKeys[k.id];
                const isCopied = copiedId === k.id;
                const isTesting = testingId === k.id;
                const pingDone = pingSuccessId === k.id;
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
                          "inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-bold",
                          isPrimary
                            ? "bg-signal text-white"
                            : "bg-surface-2 text-text-2 border border-line",
                        )}
                      >
                        {isPrimary && <IconSpark width={10} height={10} />}
                        {isPrimary ? "PRIMARY" : k.role.toUpperCase()}
                      </span>
                    </td>

                    {/* Masked Key */}
                    <td className="py-3 px-3">
                      <div className="inline-flex items-center gap-1 font-mono text-[11.5px] text-text-2 bg-surface-2/60 px-2 py-0.5 rounded border border-line/60">
                        <span>
                          {isRevealed
                            ? `${k.keyMasked.replace("...", "_KEY_")}`
                            : k.keyMasked}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(k.id)}
                          className="text-text-3 hover:text-text p-0.5 cursor-pointer"
                          title="Reveal / Hide"
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
                          className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                          title="Copy"
                        >
                          {isCopied ? (
                            <IconCheck
                              width={12}
                              height={12}
                              className="text-signal"
                            />
                          ) : (
                            <IconCopy width={12} height={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Latency */}
                    <td className="py-3 px-3 font-mono text-[12px]">
                      <span
                        className={cx(
                          "font-bold inline-flex items-center gap-1",
                          k.latencyMs < 450
                            ? "text-signal"
                            : k.latencyMs < 750
                              ? "text-amber-600"
                              : "text-rose-600",
                        )}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                        {k.latencyMs}ms
                      </span>
                    </td>

                    {/* Spend */}
                    <td className="py-3 px-3 font-mono text-text">
                      ৳{k.costBDT.toLocaleString()}{" "}
                      <span className="text-[10px] text-text-3">
                        (${k.costUSD.toFixed(1)})
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={cx(
                          "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                          k.status === "rate_limited"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-signal/[0.08] text-signal",
                        )}
                      >
                        <span
                          className={cx(
                            "size-1.5 rounded-full",
                            k.status === "rate_limited"
                              ? "bg-rose-500 animate-pulse"
                              : "bg-signal",
                          )}
                        />
                        {k.status === "rate_limited"
                          ? "429 Limited"
                          : "Operational"}
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
                              : pingDone
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
              })}
            </tbody>
          </table>
        </div>
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
              <div>
                <label className="block font-bold text-text mb-1">
                  AI Provider
                </label>
                <select
                  value={newProvider}
                  onChange={(e) => {
                    const p = e.target.value as AiProviderKey["provider"];
                    setNewProvider(p);
                    setModalTestResult(null);
                    if (p === "google") setNewModel("gemini-2.0-flash");
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

              <div>
                <label className="block font-bold text-text mb-1">
                  Model Identifier
                </label>
                <input
                  type="text"
                  required
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-text">
                  Secret API Key
                </label>
                <input
                  type="password"
                  required
                  value={newKey}
                  onChange={(e) => {
                    setNewKey(e.target.value);
                    if (modalTestResult) setModalTestResult(null);
                  }}
                  placeholder="Paste secret API key..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px]"
                />

                {/* Modal Test Verification Result Banner */}
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

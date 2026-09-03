"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import {
  Avatar,
  Badge,
  Button,
  ChannelChip,
  Panel,
  type Tone,
} from "@/components/ui/primitives";
import {
  CHANNEL_ICON,
  IconArrow,
  IconCheck,
  IconEye,
  IconShield,
} from "@/components/ui/icons";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import { THREADS } from "@/data/threads";
import { bdt, cx } from "@/lib/format";

const FILTERS = ["All", "AI handling", "Needs a human", "Resolved"] as const;

const STATUS: Record<string, { label: string; tone: Tone }> = {
  ai: { label: "AI Handling", tone: "signal" },
  waiting: { label: "Waiting", tone: "amber" },
  human: { label: "Human (You)", tone: "iris" },
  resolved: { label: "Resolved", tone: "mint" },
};

const QUICK_TEMPLATES = [
  "ঢাকার ভেতরে ডেলিভারি চার্জ ৮০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা।",
  "আমাদের সব পণ্যে ক্যাশ অন ডেলিভারি (COD) সুবিধা রয়েছে। 🌾",
  "আপনার সম্পূর্ণ ঠিকানা ও ফোন নাম্বারটি দিলে আমরা অর্ডার কনফার্ম করে দিচ্ছি।",
];

export default function ThreadsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [allThreads, setAllThreads] = useState(THREADS);
  const [activeId, setActiveId] = useState(THREADS[0].id);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever active thread or messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchLive = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/v1/threads/live");
        if (res.ok) {
          const live = await res.json();
          if (Array.isArray(live) && live.length > 0) {
            // Merge live with default demo threads
            const liveIds = new Set(live.map((l) => l.id));
            const remaining = THREADS.filter((t) => !liveIds.has(t.id));
            const merged = [...live, ...remaining];
            setAllThreads(merged);
            if (!liveIds.has(activeId) && activeId === THREADS[0].id) {
              setActiveId(live[0].id);
            }
          }
        }
      } catch {
        // Backend offline fallback
      }
    };

    fetchLive();
    const interval = setInterval(fetchLive, 2500);
    return () => clearInterval(interval);
  }, [activeId]);

  const active = allThreads.find((t) => t.id === activeId) ?? allThreads[0] ?? THREADS[0];
  const ChannelIcon = CHANNEL_ICON[active.channel] || CHANNEL_ICON.whatsapp;

  useEffect(() => {
    scrollToBottom();
  }, [active?.messages?.length, activeId]);

  const handleSendMessage = async (textCustom?: string) => {
    const textToSend = (textCustom ?? replyText).trim();
    if (!textToSend || sending) return;
    setReplyText("");
    setSending(true);

    const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const localMsg = {
      id: `m-${Date.now()}`,
      from: "human" as const,
      body: textToSend,
      at: nowStr,
      action: {
        label: "Merchant Direct Reply",
        detail: "Dispatched to WhatsApp",
        tone: "signal" as const,
      },
    };

    // Optimistically update conversation state
    setAllThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? {
              ...t,
              status: "human",
              messages: [...t.messages, localMsg],
            }
          : t
      )
    );

    try {
      await fetch("http://localhost:8000/api/v1/threads/live/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handle: active.handle,
          message: textToSend,
          thread_id: active.id,
        }),
      });
    } catch (e) {
      console.error("Failed to send WhatsApp message:", e);
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const handleTakeover = () => {
    setAllThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? { ...t, status: t.status === "ai" ? "human" : "ai" }
          : t
      )
    );
  };

  const handleResolve = () => {
    setAllThreads((prev) =>
      prev.map((t) =>
        t.id === active.id
          ? { ...t, status: "resolved", unread: 0 }
          : t
      )
    );
  };

  const list = allThreads.filter((t) => {
    if (filter === "AI handling") return t.status === "ai";
    if (filter === "Needs a human")
      return t.status === "waiting" || t.status === "human";
    if (filter === "Resolved") return t.status === "resolved";
    return true;
  });

  return (
    <>
      <PageHeader
        title="Live Inbox & Omnichannel AI"
        sub="Monitor real-time customer conversations across WhatsApp & Messenger. Gemini AI replies instantly; take over with 1-click."
        actions={
          <div className="flex items-center gap-2">
            <Badge tone="mint" dot>
              ● WhatsApp Live Connected
            </Badge>
            <Badge tone="signal">
              98.4% Handled by AI
            </Badge>
          </div>
        }
      />

      <div className="grid h-[calc(100vh-8.5rem)] grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_300px] border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
        {/* ---------- Conversation List (Left) ---------- */}
        <div className="flex min-h-0 flex-col border-r border-slate-200 bg-slate-50/50">
          <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-3 py-2.5 bg-white">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cx(
                  "relative shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                  filter === f ? "text-slate-900 bg-slate-100" : "text-slate-500 hover:text-slate-800 hover:bg-slate-100/60",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto divide-y divide-slate-100">
            {list.map((t) => {
              const on = t.id === activeId;
              const lastMsg = t.messages[t.messages.length - 1];
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setActiveId(t.id);
                    t.unread = 0;
                  }}
                  className={cx(
                    "relative flex w-full gap-3 px-4 py-3.5 text-left transition-all",
                    on
                      ? "bg-emerald-50/70 border-l-4 border-l-emerald-600"
                      : "hover:bg-slate-100/70",
                  )}
                >
                  <Avatar
                    name={t.customer}
                    hue={t.channel === "whatsapp" ? 142 : 262}
                    size={38}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13.5px] font-semibold text-slate-900">
                        {t.customer}
                      </span>
                      <span className="shrink-0 font-mono text-[10.5px] text-slate-400">
                        {t.lastAt}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-slate-600">
                      {lastMsg ? lastMsg.body : t.intent}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <ChannelChip channel={t.channel} />
                      <Badge tone={STATUS[t.status]?.tone || "signal"}>
                        {STATUS[t.status]?.label || "AI"}
                      </Badge>
                      {t.unread > 0 && (
                        <span className="ml-auto grid size-4.5 place-items-center rounded-full bg-emerald-600 font-mono text-[10px] font-bold text-white shadow-xs">
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------- Transcript / Chat Area (Center) ---------- */}
        <div className="flex min-h-0 flex-col bg-slate-50/40">
          {/* Top Chat Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 shadow-2xs">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar
                name={active.customer}
                hue={active.channel === "whatsapp" ? 142 : 262}
                size={36}
              />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-slate-900">
                  {active.customer}
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <ChannelIcon width={13} height={13} className="text-emerald-600" />
                  <span className="font-semibold text-slate-700">{active.handle}</span> · {active.district || "Dhaka"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {active.status === "ai" ? (
                <Button size="sm" variant="outline" onClick={handleTakeover} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  Take over (Human)
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleTakeover} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                  Return to AI
                </Button>
              )}
              <Button size="sm" onClick={handleResolve} variant="ghost" className="text-slate-600 hover:text-slate-900">
                Resolve
              </Button>
            </div>
          </div>

          {/* Messages Container with High-Contrast Bubbles */}
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 bg-gradient-to-b from-slate-50 to-slate-100/50">
            {active.messages.map((m) => {
              const isCustomer = m.from === "customer";
              const isAi = m.from === "agent";
              const isHuman = m.from === "human";

              return (
                <div
                  key={m.id}
                  className={cx(
                    "flex w-full",
                    isCustomer ? "justify-start" : "justify-end",
                  )}
                >
                  <div
                    className={cx(
                      "max-w-[80%] flex flex-col",
                      isCustomer ? "items-start" : "items-end",
                    )}
                  >
                    {/* Sender Header Tag */}
                    <div className="mb-1 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-wider uppercase">
                      {isCustomer && (
                        <span className="text-slate-500 font-mono">
                          {active.customer}
                        </span>
                      )}
                      {isAi && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-1.5 py-0.5 text-emerald-800 font-mono">
                          ✨ AI AUTO-REPLY (GEMINI)
                        </span>
                      )}
                      {isHuman && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-1.5 py-0.5 text-indigo-800 font-mono">
                          👤 YOU (MERCHANT)
                        </span>
                      )}
                    </div>

                    {/* Image Attachment (if any) */}
                    {m.attachment && (
                      <div className="mb-2 overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={m.attachment.src}
                          alt="Customer upload"
                          className="h-36 w-full object-cover"
                        />
                        <div className="flex items-center justify-between bg-slate-50 px-3 py-1.5 border-t border-slate-100">
                          <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-indigo-700">
                            <IconEye width={12} height={12} />
                            {m.attachment.matchedSku}
                          </span>
                          <span className="font-mono text-[11px] text-slate-500">
                            {Math.round((m.attachment.confidence ?? 0) * 100)}% confidence
                          </span>
                        </div>
                      </div>
                    )}

                    {/* High-Contrast Message Bubble */}
                    <div
                      className={cx(
                        "rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-xs",
                        isCustomer &&
                          "rounded-tl-xs border border-slate-200 bg-white text-slate-900 font-normal",
                        isAi &&
                          "rounded-tr-xs bg-emerald-700 text-white font-normal shadow-sm",
                        isHuman &&
                          "rounded-tr-xs bg-indigo-600 text-white font-normal shadow-sm",
                      )}
                    >
                      <p className="whitespace-pre-wrap font-sans text-[14px]">
                        {m.body}
                      </p>
                    </div>

                    {/* Meta info / Action status */}
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-[10.5px] text-slate-400">
                        {m.at}
                      </span>
                      {m.action && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-200/80 px-1.5 py-0.5 font-mono text-[9.5px] text-slate-700">
                          <IconCheck width={10} height={10} className="text-emerald-600" />
                          {m.action.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          <div className="flex gap-2 overflow-x-auto border-t border-slate-200 bg-slate-50 px-4 py-2">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0 self-center">
              Quick:
            </span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(tmpl)}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11.5px] text-slate-700 hover:border-emerald-400 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all"
              >
                {tmpl.slice(0, 32)}…
              </button>
            ))}
          </div>

          {/* Chat Composer Input */}
          <div className="border-t border-slate-200 bg-white p-3.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2.5 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all"
            >
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  active.status === "ai"
                    ? "AI is handling — type here to take over and reply directly…"
                    : "Write your reply to customer on WhatsApp…"
                }
                className="min-w-0 flex-1 bg-transparent text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              <Button
                size="sm"
                type="submit"
                disabled={sending || !replyText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4"
              >
                {sending ? "Sending…" : "Send"}
                <IconArrow width={14} height={14} className="ml-1" />
              </Button>
            </form>
          </div>
        </div>

        {/* ---------- Context / Customer Insights Sidebar (Right) ---------- */}
        <div className="hidden min-h-0 overflow-y-auto border-l border-slate-200 bg-white xl:block">
          <div className="space-y-4 p-4">
            <Panel className="p-4 border-slate-200 bg-slate-50/60">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Customer Profile
              </p>
              <p className="mt-1.5 text-[16px] font-bold text-slate-900">
                {active.customer}
              </p>
              <p className="mt-0.5 font-mono text-[12px] text-emerald-700 font-semibold">
                {active.handle}
              </p>
              <p className="mt-1 text-[12px] text-slate-600">
                📍 {active.district || "Dhaka, Bangladesh"}
              </p>
            </Panel>

            <Panel className="p-4 border-slate-200 bg-emerald-50/40">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Estimated Order Value
              </p>
              <p className="mt-1 font-display text-[26px] font-extrabold tracking-tight text-emerald-700">
                {bdt(active.value || 2500)}
              </p>
              <p className="mt-0.5 text-[12px] font-medium text-slate-700">
                Intent: {active.intent}
              </p>
            </Panel>

            <Panel className="p-4 border-slate-200 bg-slate-50/60">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Delivery & Payment Rules
              </p>
              <div className="mt-2 space-y-1 text-[12px] text-slate-700">
                <p>• Inside Dhaka: <span className="font-semibold text-emerald-700">৳80</span></p>
                <p>• Outside Dhaka: <span className="font-semibold text-emerald-700">৳130</span></p>
                <p>• Cash on Delivery: <span className="font-semibold text-emerald-700">Active</span></p>
              </div>
            </Panel>

            <Panel className="p-4 border-slate-200 bg-slate-50/60">
              <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Guardrails & AI Safety
              </p>
              <ul className="mt-3 space-y-2">
                <li className="flex items-start gap-2 text-[12px] text-slate-700">
                  <IconShield width={13} height={13} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>Bengali & Banglish dialect detection active</span>
                </li>
                <li className="flex items-start gap-2 text-[12px] text-slate-700">
                  <IconShield width={13} height={13} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span>Zero-hallucination catalog RAG pricing</span>
                </li>
              </ul>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}

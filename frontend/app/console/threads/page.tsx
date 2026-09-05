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
        detail: active.channel === "messenger" ? "Dispatched to Messenger" : "Dispatched to WhatsApp",
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
          channel: active.channel,
        }),
      });
    } catch (e) {
      console.error("Failed to send reply:", e);
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
            <Badge tone="signal" dot>
              ● Messenger Live Connected (Meta Cloud AI 🟢)
            </Badge>
            <Badge tone="iris">
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
                    hue={t.channel === "whatsapp" ? 142 : t.channel === "messenger" ? 210 : 262}
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
                hue={active.channel === "whatsapp" ? 142 : active.channel === "messenger" ? 210 : 262}
                size={36}
              />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold text-slate-900">
                  {active.customer}
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                  <ChannelIcon width={13} height={13} className={active.channel === "messenger" ? "text-blue-600" : "text-emerald-600"} />
                  <span className="font-semibold text-slate-700">{active.handle}</span> · {active.district || "Dhaka"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {active.status === "ai" ? (
                <Button size="sm" variant="outline" onClick={handleTakeover} className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer">
                  Take over (Human)
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleTakeover} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 cursor-pointer">
                  Return to AI
                </Button>
              )}
              <Button size="sm" onClick={handleResolve} variant="ghost" className="text-slate-600 hover:text-slate-900 cursor-pointer">
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
                          ✨ AI AUTO-REPLY (GEMINI 3.5 FLASH)
                        </span>
                      )}
                      {isHuman && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-1.5 py-0.5 text-indigo-800 font-mono">
                          👤 HUMAN TAKEOVER (YOU)
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-slate-400">
                        {m.at}
                      </span>
                    </div>

                    {/* Chat Bubble */}
                    <div
                      className={cx(
                        "rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-xs transition-all",
                        isCustomer
                          ? "rounded-tl-xs bg-white text-slate-900 border border-slate-200/80 shadow-slate-100"
                          : isAi
                          ? "rounded-tr-xs bg-emerald-700 text-white font-normal"
                          : "rounded-tr-xs bg-indigo-600 text-white font-normal"
                      )}
                    >
                      {/* Image Attachment (Product / Invoice / Photo) */}
                      {m.attachment && (
                        <div className="mb-2.5 overflow-hidden rounded-xl border border-black/10 bg-black/5">
                          <img
                            src={m.attachment.src}
                            alt="Attachment"
                            className="max-h-56 w-full object-cover"
                          />
                          {m.attachment.matchedSku && (
                            <div className="bg-black/40 px-2.5 py-1 text-[11px] font-mono text-white backdrop-blur-xs flex items-center justify-between">
                              <span>Matched: {m.attachment.matchedSku}</span>
                              <span className="text-emerald-300">
                                {Math.round((m.attachment.confidence || 0.95) * 100)}% Match
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{m.body}</p>

                      {/* Optional English Gloss */}
                      {m.gloss && (
                        <p className={cx("mt-1.5 text-[11px] italic border-t pt-1", isCustomer ? "text-slate-400 border-slate-100" : "text-emerald-200/80 border-emerald-600")}>
                          &ldquo;{m.gloss}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* AI Reasoning / System Action Pill */}
                    {m.action && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/70 px-2 py-0.5 text-[10.5px] font-medium text-slate-600 font-mono">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          {m.action.label}: {m.action.detail}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggestions */}
          <div className="flex gap-2 overflow-x-auto border-t border-slate-200/80 bg-slate-100/80 px-4 py-2 text-[11.5px]">
            <span className="shrink-0 font-bold text-slate-500 flex items-center gap-1">
              ⚡ Quick:
            </span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(tmpl)}
                className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer"
              >
                {tmpl.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="border-t border-slate-200 bg-white p-3.5">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  active.status === "ai"
                    ? "AI is handling this thread. Type to reply as Human..."
                    : `Reply to ${active.customer} (${active.channel === "messenger" ? "Messenger" : "WhatsApp"})...`
                }
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-[13px] text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden transition-all shadow-inner"
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!replyText.trim() || sending}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {sending ? "Sending..." : "Reply ➔"}
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- Customer Intelligence Drawer (Right) ---------- */}
        <div className="hidden xl:flex min-h-0 flex-col border-l border-slate-200 bg-white p-5 space-y-5">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-slate-400">
              Customer Details
            </h3>
            <div className="mt-3 flex items-center gap-3">
              <Avatar
                name={active.customer}
                hue={active.channel === "whatsapp" ? 142 : active.channel === "messenger" ? 210 : 262}
                size={44}
              />
              <div className="min-w-0">
                <p className="truncate text-[15px] font-bold text-slate-900">
                  {active.customer}
                </p>
                <p className="font-mono text-[12px] text-slate-500">
                  {active.handle}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Channel</span>
              <ChannelChip channel={active.channel} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">District</span>
              <span className="font-bold text-slate-800">{active.district || "Dhaka"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Delivery Fee</span>
              <span className="font-mono font-bold text-emerald-700">
                {active.district?.toLowerCase() === "dhaka" ? "৳80 (Inside Dhaka)" : "৳130 (Outside Dhaka)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Est. Cart Value</span>
              <span className="font-mono font-bold text-slate-900">
                {bdt(active.value)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-400">
              AI Sales Intelligence
            </h4>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                <span>🤖 Gemini 3.5 Flash NLU</span>
              </div>
              <p className="text-[11.5px] leading-relaxed text-indigo-800">
                Intent recognized: <strong>{active.intent}</strong>. Courier fee and product catalog synced from store inventory.
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTakeover}
              className="w-full rounded-xl border border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40 py-2 text-xs font-bold text-slate-700 hover:text-indigo-900 transition-all cursor-pointer"
            >
              {active.status === "ai" ? "Take Over Conversation (Human)" : "Return Thread to Autonomous AI"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

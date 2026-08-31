"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import { Avatar, Badge, Button, ChannelChip, Panel, type Tone } from "@/components/ui/primitives";
import { CHANNEL_ICON, IconArrow, IconCheck, IconEye, IconShield } from "@/components/ui/icons";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import { THREADS } from "@/data/threads";
import { bdt, cx } from "@/lib/format";

const FILTERS = ["All", "AI handling", "Needs a human", "Resolved"] as const;

const STATUS: Record<string, { label: string; tone: Tone }> = {
  ai: { label: "AI", tone: "signal" },
  waiting: { label: "Waiting", tone: "amber" },
  human: { label: "Human", tone: "iris" },
  resolved: { label: "Resolved", tone: "mint" },
};

export default function ThreadsPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [activeId, setActiveId] = useState(THREADS[0].id);

  const list = THREADS.filter((t) => {
    if (filter === "AI handling") return t.status === "ai";
    if (filter === "Needs a human") return t.status === "waiting" || t.status === "human";
    if (filter === "Resolved") return t.status === "resolved";
    return true;
  });

  const active = THREADS.find((t) => t.id === activeId) ?? THREADS[0];
  const ChannelIcon = CHANNEL_ICON[active.channel];

  return (
    <>
      <PageHeader
        title="Threads"
        sub="Every channel in one queue. The agent works the top of it; you work the exceptions."
        actions={
          <>
            <Badge tone="signal" dot>
              93.6% handled without a human
            </Badge>
            <Button size="sm" variant="outline">
              Export
            </Button>
          </>
        }
      />

      <div className="grid h-[calc(100vh-8.5rem)] grid-cols-1 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)_290px]">
        {/* ---------- list ---------- */}
        <div className="flex min-h-0 flex-col border-r border-line bg-surface">
          <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2.5">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cx(
                  "relative shrink-0 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors",
                  filter === f ? "text-text" : "text-text-3 hover:text-text-2"
                )}
              >
                {filter === f && (
                  <motion.span
                    layoutId="thread-filter"
                    transition={SPRING}
                    className="absolute inset-0 -z-10 rounded-lg bg-surface-2"
                  />
                )}
                {f}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {list.map((t) => {
              const on = t.id === activeId;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={cx(
                    "relative flex w-full gap-3 border-b border-line-soft px-4 py-3.5 text-left transition-colors",
                    on ? "bg-signal-wash" : "hover:bg-surface-2/70"
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="thread-active"
                      transition={SPRING}
                      className="absolute inset-y-0 left-0 w-[2px] bg-signal"
                    />
                  )}
                  <Avatar name={t.customer} hue={t.channel === "whatsapp" ? 142 : 262} size={34} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13.5px] font-medium text-text">
                        {t.customer}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-text-3">{t.lastAt}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-text-3">{t.intent}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <ChannelChip channel={t.channel} />
                      <Badge tone={STATUS[t.status].tone}>{STATUS[t.status].label}</Badge>
                      {t.unread > 0 && (
                        <span className="ml-auto grid size-4 place-items-center rounded-full bg-signal font-mono text-[9.5px] font-semibold text-signal-ink">
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

        {/* ---------- transcript ---------- */}
        <div className="flex min-h-0 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={active.customer} hue={active.channel === "whatsapp" ? 142 : 262} size={32} />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium text-text">{active.customer}</p>
                <p className="flex items-center gap-1.5 font-mono text-[10.5px] text-text-3">
                  <ChannelIcon width={11} height={11} />
                  {active.handle} · {active.district}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              {active.status === "ai" ? (
                <Button size="sm" variant="outline">
                  Take over
                </Button>
              ) : (
                <Button size="sm" variant="outline">
                  Return to AI
                </Button>
              )}
              <Button size="sm">Resolve</Button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={SPRING_SOFT}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-canvas px-5 py-5"
            >
              {active.messages.map((m) => {
                const mine = m.from !== "customer";
                return (
                  <div key={m.id} className={cx("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cx("max-w-[75%]", mine && "items-end text-right")}>
                      {m.from === "human" && (
                        <p className="mb-1 font-mono text-[10px] text-iris">IMRAN K. · HUMAN</p>
                      )}
                      {m.attachment && (
                        <div className="mb-2 overflow-hidden rounded-xl border border-line">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={m.attachment.src}
                            alt="Customer upload"
                            className="h-32 w-full object-cover"
                          />
                          <div className="flex items-center justify-between bg-surface-2 px-2.5 py-1.5">
                            <span className="flex items-center gap-1.5 font-mono text-[10px] text-iris">
                              <IconEye width={11} height={11} />
                              {m.attachment.matchedSku}
                            </span>
                            <span className="font-mono text-[10px] text-text-2">
                              {Math.round((m.attachment.confidence ?? 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}
                      <div
                        className={cx(
                          "rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] leading-relaxed",
                          m.from === "customer" && "rounded-tl-sm border border-line bg-surface text-text",
                          m.from === "agent" && "rounded-tr-sm bg-signal text-signal-ink",
                          m.from === "human" && "rounded-tr-sm bg-iris/15 text-text ring-1 ring-iris/30"
                        )}
                      >
                        <span className="font-[family-name:var(--font-hind)]">{m.body}</span>
                      </div>
                      {m.gloss && (
                        <p className="mt-1 text-[11px] italic text-text-3">“{m.gloss}”</p>
                      )}
                      <div className={cx("mt-1 flex items-center gap-2", mine && "justify-end")}>
                        <span className="font-mono text-[10px] text-text-3">{m.at}</span>
                        {m.action && (
                          <span
                            className={cx(
                              "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono text-[9.5px]",
                              m.action.tone === "mint" && "bg-mint/10 text-mint",
                              m.action.tone === "amber" && "bg-amber/10 text-amber",
                              (!m.action.tone || m.action.tone === "signal") &&
                                "bg-signal-wash text-signal"
                            )}
                          >
                            <IconCheck width={9} height={9} />
                            {m.action.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <div className="border-t border-line p-3">
            <div className="flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2">
              <input
                placeholder={
                  active.status === "ai" ? "AI is handling — type to take over…" : "Write a reply…"
                }
                className="min-w-0 flex-1 bg-transparent text-[13.5px] text-text placeholder:text-text-3 focus:outline-none"
              />
              <Button size="sm">
                Send
                <IconArrow width={13} height={13} />
              </Button>
            </div>
          </div>
        </div>

        {/* ---------- context ---------- */}
        <div className="hidden min-h-0 overflow-y-auto border-l border-line xl:block">
          <div className="space-y-4 p-4">
            <Panel className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                Open value
              </p>
              <p className="mt-1.5 font-display text-[26px] font-semibold tracking-tight text-signal">
                {bdt(active.value)}
              </p>
              <p className="mt-1 text-[11.5px] text-text-3">{active.intent}</p>
            </Panel>

            <Panel className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                Detected language
              </p>
              <p className="mt-2 text-[13.5px] text-text">
                {active.lang === "bn"
                  ? "বাংলা script"
                  : active.lang === "banglish"
                    ? "Phonetic Banglish"
                    : "English"}
              </p>
              <p className="mt-1 text-[11.5px] leading-snug text-text-3">
                Replies mirror the customer&apos;s script automatically.
              </p>
            </Panel>

            <Panel className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                Guardrails fired
              </p>
              <ul className="mt-3 space-y-2.5">
                {active.messages
                  .filter((m) => m.action)
                  .map((m) => (
                    <li key={m.id} className="flex items-start gap-2.5">
                      <IconShield width={12} height={12} className="mt-0.5 shrink-0 text-signal" />
                      <div>
                        <p className="text-[12px] leading-snug text-text-2">{m.action?.label}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-text-3">
                          {m.action?.detail}
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            </Panel>

            <Panel className="p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                Turn this into
              </p>
              <div className="mt-3 space-y-1.5">
                <Button size="sm" variant="quiet" className="w-full justify-start">
                  A catalog entry
                </Button>
                <Button size="sm" variant="quiet" className="w-full justify-start">
                  A knowledge answer
                </Button>
                <Button size="sm" variant="quiet" className="w-full justify-start">
                  An eval test case
                </Button>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </>
  );
}

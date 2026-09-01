"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import {
  Badge,
  Button,
  Meter,
  Panel,
  PanelHead,
} from "@/components/ui/primitives";
import {
  IconCheck,
  IconShield,
  IconSpark,
  IconWarn,
} from "@/components/ui/icons";
import {
  Counter,
  SPRING,
  SPRING_SOFT,
  Stagger,
  StaggerItem,
} from "@/components/motion";
import { EVAL_SUITE, GUARDRAILS, KNOWLEDGE, PERSONA } from "@/data/brain";
import { cx } from "@/lib/format";

const TABS = ["Persona", "Guardrails", "Knowledge", "Evals"] as const;

export default function BrainPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Persona");

  return (
    <>
      <PageHeader
        title="Knowledge Base & AI Brain"
        sub="Store knowledge, business policies, AI persona tone, FAQs, and eval test harnesses."
        actions={
          <>
            <Badge tone="mint" dot>
              evals green
            </Badge>
            <Button size="sm">Publish changes</Button>
          </>
        }
      />

      <div className="border-b border-line px-5 lg:px-8">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx(
                "relative px-3 py-3 text-[13.5px] transition-colors",
                tab === t ? "text-text" : "text-text-3 hover:text-text-2",
              )}
            >
              {t}
              {tab === t && (
                <motion.span
                  layoutId="brain-tab"
                  transition={SPRING}
                  className="absolute inset-x-0 bottom-0 h-[2px] bg-signal"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 lg:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={SPRING_SOFT}
          >
            {/* ---------------- Persona ---------------- */}
            {tab === "Persona" && (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <Panel>
                  <PanelHead
                    title="System prompt"
                    sub="Plain language. The agent reads this before every conversation."
                    right={<Badge tone="neutral">v47</Badge>}
                  />
                  <div className="p-5">
                    <div className="rounded-xl border border-line bg-canvas p-4 font-mono text-[12.5px] leading-relaxed text-text-2">
                      <p>
                        You sell for{" "}
                        <span className="text-signal">Nokshi &amp; Co.</span>, a
                        handloom and home brand in Dhaka.
                      </p>
                      <p className="mt-3">
                        Speak the way a good shop assistant speaks: warm,
                        unhurried, always আপনি. Default to Bangla script. If the
                        customer writes Banglish, answer in Banglish. If they
                        write English, answer in English.
                      </p>
                      <p className="mt-3">
                        Quote only prices and stock the catalog gives you. If
                        you do not know, say so and offer to check. Never
                        promise a delivery date the courier has not given.
                      </p>
                      <p className="mt-3">
                        Your job is finished when the parcel is booked — not
                        when the question is answered.
                      </p>
                    </div>

                    <dl className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                      {Object.entries(PERSONA).map(([k, v]) => (
                        <div key={k} className="bg-surface px-4 py-3">
                          <dt className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                            {k.replace(/([A-Z])/g, " $1")}
                          </dt>
                          <dd className="mt-1.5 text-[12.5px] leading-snug text-text-2">
                            {v}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </Panel>

                <Panel className="h-fit">
                  <PanelHead
                    title="Sample reply"
                    sub="Rendered with the current persona."
                  />
                  <div className="p-5">
                    <div className="rounded-2xl rounded-tl-sm bg-signal px-4 py-3 font-(family-name:--font-hind) text-[13.5px] leading-relaxed text-signal-ink">
                      জি আপা, জামদানি শাড়িটা ইন্ডিগো রঙে ১২ পিস আছে 🌿 দাম
                      ৳৬,৮৫০, সাথে ম্যাচিং ব্লাউজ পিস ফ্রি। ঢাকার ভিতরে ২৪
                      ঘণ্টায় ডেলিভারি, চার্জ ৳৮০।
                    </div>
                    <ul className="mt-4 space-y-2">
                      {[
                        "আপনি used, never তুমি",
                        "One emoji, not three",
                        "Real stock count, not “আছে”",
                        "Courier SLA, not a promise",
                      ].map((c) => (
                        <li
                          key={c}
                          className="flex items-center gap-2 text-[12px] text-text-2"
                        >
                          <IconCheck
                            width={12}
                            height={12}
                            className="text-mint"
                          />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Panel>
              </div>
            )}

            {/* ---------------- Guardrails ---------------- */}
            {tab === "Guardrails" && (
              <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {GUARDRAILS.map((g) => (
                  <StaggerItem key={g.id}>
                    <Panel interactive className="h-full p-5">
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cx(
                            "grid size-8 shrink-0 place-items-center rounded-lg",
                            g.severity === "hard"
                              ? "bg-signal-wash text-signal"
                              : "bg-surface-2 text-text-3",
                          )}
                        >
                          <IconShield width={15} height={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[14px] font-medium text-text">
                              {g.label}
                            </h3>
                            <Badge
                              tone={
                                g.severity === "hard" ? "signal" : "neutral"
                              }
                            >
                              {g.severity}
                            </Badge>
                          </div>
                          <p className="mt-1.5 text-[12.5px] leading-snug text-text-2">
                            {g.rule}
                          </p>
                          <p className="mt-3 font-mono text-[10.5px] text-text-3">
                            fired <span className="text-text-2">{g.fires}</span>{" "}
                            times in 30 days
                          </p>
                        </div>
                      </div>
                    </Panel>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            {/* ---------------- Knowledge ---------------- */}
            {tab === "Knowledge" && (
              <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {KNOWLEDGE.map((k) => (
                  <StaggerItem key={k.id}>
                    <Panel interactive className="h-full p-5">
                      <div className="flex items-baseline justify-between">
                        <h3 className="font-display text-[15px] font-semibold tracking-tight">
                          {k.topic}
                        </h3>
                        <span className="font-mono text-[10.5px] text-text-3">
                          {k.entries} entries
                        </span>
                      </div>
                      <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2.5 text-[12.5px] leading-snug text-text-2">
                        {k.sample}
                      </p>
                      <p className="mt-3 font-mono text-[10.5px] text-text-3">
                        updated {k.updated}
                      </p>
                    </Panel>
                  </StaggerItem>
                ))}
              </Stagger>
            )}

            {/* ---------------- Evals ---------------- */}
            {tab === "Evals" && (
              <div className="space-y-4">
                <Panel>
                  <PanelHead
                    title={`Run #482 · ${EVAL_SUITE.model}`}
                    sub={EVAL_SUITE.lastRun}
                    right={
                      <div className="flex items-center gap-2">
                        <Badge tone="mint" dot>
                          {EVAL_SUITE.passed}/{EVAL_SUITE.cases}
                        </Badge>
                        <Badge tone="neutral">{EVAL_SUITE.duration}</Badge>
                      </div>
                    }
                  />
                  <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
                    {EVAL_SUITE.metrics.map((m) => {
                      const lowerIsBetter = m.label === "Avg turns to order";
                      const ok = lowerIsBetter
                        ? m.now <= m.goal
                        : m.now >= m.goal;
                      const improved = lowerIsBetter
                        ? m.now < m.before
                        : m.now > m.before;
                      return (
                        <div key={m.label} className="bg-surface p-5">
                          <div className="flex items-start justify-between">
                            <p className="text-[12.5px] text-text-3">
                              {m.label}
                            </p>
                            {ok ? (
                              <IconCheck
                                width={13}
                                height={13}
                                className="text-mint"
                              />
                            ) : (
                              <IconWarn
                                width={13}
                                height={13}
                                className="text-amber"
                              />
                            )}
                          </div>
                          <p className="mt-2 font-display text-[25px] font-semibold tracking-tight">
                            <Counter to={m.now} decimals={1} />
                            <span className="text-[14px] text-text-3">
                              {m.unit}
                            </span>
                          </p>
                          <div className="mt-2.5 flex items-center justify-between font-mono text-[10.5px]">
                            <span className="text-text-3">
                              was {m.before}
                              {m.unit}
                            </span>
                            <span
                              className={improved ? "text-mint" : "text-text-3"}
                            >
                              goal {m.goal}
                              {m.unit}
                            </span>
                          </div>
                          <Meter
                            value={
                              lowerIsBetter ? m.goal - m.now + m.goal : m.now
                            }
                            max={
                              lowerIsBetter
                                ? m.goal * 2
                                : m.unit === "/5"
                                  ? 5
                                  : 100
                            }
                            tone={ok ? "mint" : "amber"}
                            className="mt-2.5"
                          />
                        </div>
                      );
                    })}
                  </div>
                </Panel>

                <Panel>
                  <PanelHead
                    title="Held back from production"
                    sub="These transcripts failed. The change stays in draft until they pass or you accept the risk."
                    right={
                      <Badge tone="coral">
                        {EVAL_SUITE.failures.length} failures
                      </Badge>
                    }
                  />
                  <ul className="divide-y divide-[color:var(--line-soft)]">
                    {EVAL_SUITE.failures.map((f) => (
                      <li
                        key={f.id}
                        className="flex flex-wrap items-start gap-4 px-5 py-4"
                      >
                        <Badge
                          tone={f.severity === "major" ? "coral" : "amber"}
                        >
                          {f.severity}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                            {f.set}
                          </p>
                          <p className="mt-1.5 font-(family-name:--font-hind) text-[13.5px] text-text">
                            “{f.input}”
                          </p>
                          <p className="mt-1 text-[12px] text-text-3">
                            {f.why}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Replay
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-2.5 border-t border-line px-5 py-3.5">
                    <IconSpark width={13} height={13} className="text-signal" />
                    <p className="text-[11.5px] text-text-3">
                      Add any thread from the inbox as a new test case — the
                      suite grows from real customers, not made-up ones.
                    </p>
                  </div>
                </Panel>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

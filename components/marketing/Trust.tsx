"use client";

import { motion } from "framer-motion";
import { Badge, Eyebrow, Panel } from "@/components/ui/primitives";
import { IconCheck, IconShield, IconWarn } from "@/components/ui/icons";
import { Counter, Reveal, SPRING, SPRING_SOFT } from "@/components/motion";
import { EVAL_SUITE, GUARDRAILS } from "@/data/brain";
import { cx } from "@/lib/format";

export default function Trust() {
  return (
    <section id="trust" className="relative border-t border-line py-24 lg:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg,transparent,var(--signal-line),transparent)" }}
      />
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>The part nobody demos</Eyebrow>
              <h2 className="mt-5 text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
                An AI that sells can also
                <span className="text-text-3"> confidently lie about stock.</span>
              </h2>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-text-2">
                So every change to the persona replays 240 recorded conversations before it reaches a
                customer — real Banglish, Sylheti phrasing, hagglers, people asking for a discount
                their friend supposedly got.
              </p>
              <p className="mt-4 max-w-md text-[14px] leading-relaxed text-text-3">
                If order completion or price accuracy drops, the change doesn&apos;t ship. You get the
                failing transcripts instead of a customer complaint.
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-8">
              <ul className="space-y-2.5">
                {GUARDRAILS.filter((g) => g.severity === "hard").map((g, i) => (
                  <motion.li
                    key={g.id}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING, delay: i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-signal-wash text-signal">
                      <IconShield width={11} height={11} />
                    </span>
                    <span className="text-[13.5px] leading-snug text-text-2">{g.rule}</span>
                  </motion.li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* eval report card */}
          <Reveal delay={0.12} className="min-w-0">
            <Panel className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <h3 className="font-display text-[15px] font-semibold tracking-tight">
                    Agent eval · run #482
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-text-3">{EVAL_SUITE.lastRun}</p>
                </div>
                <Badge tone="mint" dot>
                  {EVAL_SUITE.passed}/{EVAL_SUITE.cases} passed
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
                {EVAL_SUITE.metrics.map((m, i) => {
                  const better = m.now >= m.before;
                  const ok = m.label === "Avg turns to order" ? m.now <= m.goal : m.now >= m.goal;
                  return (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ ...SPRING_SOFT, delay: i * 0.05 }}
                      className="bg-surface px-5 py-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[12.5px] text-text-3">{m.label}</span>
                        <span
                          className={cx(
                            "font-mono text-[10.5px]",
                            better ? "text-mint" : "text-text-3"
                          )}
                        >
                          {better ? "▲" : "▼"} {Math.abs(m.now - m.before).toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-2">
                        <span className="font-display text-[24px] font-semibold tracking-tight text-text">
                          <Counter to={m.now} decimals={m.unit === "%" ? 1 : 1} />
                          <span className="text-[14px] text-text-3">{m.unit}</span>
                        </span>
                        {ok ? (
                          <IconCheck width={13} height={13} className="text-mint" />
                        ) : (
                          <IconWarn width={13} height={13} className="text-amber" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="border-t border-line px-5 py-4">
                <p className="font-mono text-[10.5px] uppercase tracking-wider text-text-3">
                  3 failures held back
                </p>
                <ul className="mt-3 space-y-2.5">
                  {EVAL_SUITE.failures.map((f) => (
                    <li key={f.id} className="flex items-start gap-3">
                      <Badge tone={f.severity === "major" ? "coral" : "amber"} className="mt-0.5 shrink-0">
                        {f.severity}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-[family-name:var(--font-hind)] text-[12.5px] text-text-2">
                          “{f.input}”
                        </p>
                        <p className="mt-0.5 text-[11.5px] text-text-3">{f.why}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

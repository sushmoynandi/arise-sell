"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import { Badge, Button, Meter, Panel, PanelHead, Sparkline, type Tone } from "@/components/ui/primitives";
import { IconCheck, IconWarn } from "@/components/ui/icons";
import { Counter, Reveal, SPRING } from "@/components/motion";
import { CAPI_EVENTS, SERIES, SPEND } from "@/data/operations";
import { bdt, cx } from "@/lib/format";

const EV_TONE: Record<string, Tone> = { sent: "mint", queued: "amber", dropped: "coral" };

/** Simple ROAS view: revenue closed vs ad spend, both in thousands BDT. */
const roas = SERIES.revenue.map((r, i) => r / SERIES.adSpend[i]);

export default function SignalsPage() {
  const sent = CAPI_EVENTS.filter((e) => e.state === "sent").length;
  const avgMatch =
    CAPI_EVENTS.reduce((a, e) => a + e.match, 0) / CAPI_EVENTS.length;
  const totalRev = SERIES.revenue.reduce((a, b) => a + b, 0);
  const totalSpend = SERIES.adSpend.reduce((a, b) => a + b, 0);

  return (
    <>
      <PageHeader
        title="Signals"
        sub="What your ad spend actually bought — measured server-side, where the browser can't lose it."
        actions={
          <>
            <Badge tone="mint" dot>
              CAPI live
            </Badge>
            <Button size="sm" variant="outline">
              Send test event
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-5 lg:p-8">
        {/* headline */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Return on ad spend", value: totalRev / totalSpend, suffix: "×", decimals: 2, spark: roas },
            { label: "Revenue closed · 14d", value: 16.2, prefix: "৳", suffix: "L", decimals: 1, spark: SERIES.revenue },
            { label: "Ad spend · 14d", value: 2.66, prefix: "৳", suffix: "L", decimals: 2, spark: SERIES.adSpend },
            { label: "Event match quality", value: avgMatch, suffix: "/10", decimals: 1, spark: [5.9, 6.2, 6.8, 7.1, 7.4, 8.0, 8.7, 9.1] },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.06 }}
              className="panel p-5"
            >
              <p className="text-[12.5px] text-text-3">{k.label}</p>
              <p className="mt-2 font-display text-[26px] font-semibold tracking-tight">
                <Counter
                  to={k.value}
                  prefix={k.prefix ?? ""}
                  suffix={k.suffix ?? ""}
                  decimals={k.decimals}
                />
              </p>
              <div className="mt-3">
                <Sparkline data={k.spark} height={28} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* event log */}
          <Reveal>
            <Panel className="h-full">
              <PanelHead
                title="Conversion events"
                sub="Lead, IntentQualified and Purchase, pushed straight to Meta."
                right={<Badge tone="neutral">{sent} of {CAPI_EVENTS.length} accepted</Badge>}
              />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-text-3">
                      <th className="px-5 py-2.5 font-normal">Event</th>
                      <th className="px-3 py-2.5 font-normal">Ref</th>
                      <th className="px-3 py-2.5 text-right font-normal">Value</th>
                      <th className="px-3 py-2.5 font-normal">Match</th>
                      <th className="px-5 py-2.5 font-normal">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CAPI_EVENTS.map((e, i) => (
                      <motion.tr
                        key={e.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING, delay: i * 0.04 }}
                        className="border-b border-line-soft"
                      >
                        <td className="px-5 py-3">
                          <span className="text-[13px] text-text">{e.name}</span>
                          <span className="mt-0.5 block font-mono text-[10px] text-text-3">
                            {e.at}
                          </span>
                        </td>
                        <td className="px-3 py-3 font-mono text-[11.5px] text-text-2">{e.ref}</td>
                        <td className="px-3 py-3 text-right font-mono text-[12px] text-text-2">
                          {e.value ? bdt(e.value) : "—"}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Meter
                              value={e.match}
                              max={10}
                              tone={e.match >= 7 ? "mint" : e.match >= 5 ? "amber" : "coral"}
                              className="w-14"
                            />
                            <span className="font-mono text-[10.5px] text-text-3">{e.match}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <Badge tone={EV_TONE[e.state]}>{e.state}</Badge>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-start gap-2.5 border-t border-line px-5 py-3.5">
                <IconWarn width={13} height={13} className="mt-0.5 shrink-0 text-amber" />
                <p className="text-[11.5px] leading-snug text-text-3">
                  One event dropped — the thread never produced a hashed phone or email, so there was
                  nothing for Meta to match on. That is correct behaviour, not a failure.
                </p>
              </div>
            </Panel>
          </Reveal>

          {/* spend + health */}
          <Reveal delay={0.08}>
            <div className="space-y-4">
              <Panel>
                <PanelHead title="AI spend ceiling" sub="Enforced, with a soft landing." />
                <div className="p-5">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-[24px] font-semibold tracking-tight">
                      {bdt(SPEND.monthUsedBdt)}
                    </span>
                    <span className="text-[12px] text-text-3">
                      of {bdt(SPEND.monthCapBdt)}
                    </span>
                  </div>
                  <Meter value={SPEND.monthUsedBdt} max={SPEND.monthCapBdt} className="mt-3" />
                  <ul className="mt-5 space-y-2.5">
                    {SPEND.breakdown.map((b) => (
                      <li key={b.label}>
                        <div className="flex items-baseline justify-between text-[12px]">
                          <span className="text-text-2">{b.label}</span>
                          <span className="font-mono text-[11px] text-text-3">{bdt(b.bdt)}</span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-surface-3">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `hsl(${b.hue} 70% 58%)` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(b.bdt / SPEND.monthUsedBdt) * 100}%` }}
                            transition={{ ...SPRING, delay: 0.2 }}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>

              <Panel>
                <PanelHead title="Pipeline health" sub="30-day delivery telemetry." />
                <ul className="divide-y divide-[color:var(--line-soft)]">
                  {[
                    { k: "Events sent", v: "12,847", ok: true },
                    { k: "Accepted by Meta", v: "12,691 (98.8%)", ok: true },
                    { k: "Dropped — no identifier", v: "156", ok: true },
                    { k: "Failed — token expired", v: "0", ok: true },
                    { k: "Median dispatch latency", v: "1.4s", ok: true },
                  ].map((r) => (
                    <li key={r.k} className="flex items-center gap-3 px-5 py-3">
                      <IconCheck
                        width={13}
                        height={13}
                        className={cx(r.ok ? "text-mint" : "text-coral")}
                      />
                      <span className="flex-1 text-[12.5px] text-text-2">{r.k}</span>
                      <span className="font-mono text-[11.5px] text-text-3">{r.v}</span>
                    </li>
                  ))}
                </ul>
              </Panel>
            </div>
          </Reveal>
        </div>
      </div>
    </>
  );
}

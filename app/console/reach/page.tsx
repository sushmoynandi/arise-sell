"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import {
  Badge,
  Button,
  ChannelChip,
  Meter,
  Panel,
  PanelHead,
  type Tone,
} from "@/components/ui/primitives";
import { IconCheck, IconMegaphone } from "@/components/ui/icons";
import {
  Counter,
  Reveal,
  SPRING,
  Stagger,
  StaggerItem,
} from "@/components/motion";
import { CAMPAIGNS, COMMENT_RULES } from "@/data/operations";
import { PLAYBOOKS } from "@/data/brain";
import { bdt, cx } from "@/lib/format";

const STATE: Record<string, Tone> = {
  running: "signal",
  scheduled: "azure",
  done: "mint",
  draft: "neutral",
};

export default function ReachPage() {
  const revenue = CAMPAIGNS.reduce((a, c) => a + c.revenue, 0);
  const orders = CAMPAIGNS.reduce((a, c) => a + c.orders, 0);

  return (
    <>
      <PageHeader
        title="Campaigns & Broadcasts"
        sub="Targeted promotional broadcasts and automated follow-up playbooks to drive repeat orders."
        actions={
          <>
            <Badge tone="signal">
              {bdt(revenue, { compact: true })} attributed
            </Badge>
            <Button size="sm">
              <IconMegaphone width={14} height={14} />
              New campaign
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-5 lg:p-8">
        {/* headline numbers */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Revenue from reach",
              value: revenue,
              prefix: "৳",
              compact: true,
            },
            { label: "Orders from reach", value: orders },
            { label: "Reply rate", value: 34.2, suffix: "%", decimals: 1 },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.06 }}
              className="panel p-5"
            >
              <p className="text-[12.5px] text-text-3">{s.label}</p>
              <p className="mt-1.5 font-display text-[26px] font-semibold tracking-tight">
                {s.compact ? (
                  <>
                    ৳<Counter to={16.2} decimals={1} />L
                  </>
                ) : (
                  <Counter
                    to={s.value}
                    suffix={s.suffix ?? ""}
                    decimals={s.decimals ?? 0}
                  />
                )}
              </p>
            </motion.div>
          ))}
        </div>

        {/* campaigns */}
        <Panel>
          <PanelHead
            title="Campaigns"
            sub="Every broadcast carries a one-tap opt-out. Replies hand straight back to the agent."
          />
          <Stagger className="divide-y divide-[color:var(--line-soft)]">
            {CAMPAIGNS.map((c) => {
              const replyRate = (c.replied / c.delivered) * 100;
              const orderRate = (c.orders / c.replied) * 100;
              return (
                <StaggerItem key={c.id}>
                  <div className="grid grid-cols-1 gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-center">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[14px] font-medium text-text">
                          {c.name}
                        </h3>
                        <Badge
                          tone={STATE[c.state]}
                          dot={c.state === "running"}
                        >
                          {c.state}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[12px] text-text-3">
                        {c.segment}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <ChannelChip channel={c.channel} />
                        <span className="font-mono text-[10.5px] text-text-3">
                          {c.window}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-3">Replied</span>
                        <span className="font-mono text-text-2">
                          {replyRate.toFixed(0)}%
                        </span>
                      </div>
                      <Meter value={replyRate} max={60} className="mt-1.5" />
                      <p className="mt-1.5 font-mono text-[10px] text-text-3">
                        {c.replied.toLocaleString()} of{" "}
                        {c.delivered.toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-text-3">Reply → order</span>
                        <span className="font-mono text-text-2">
                          {orderRate.toFixed(0)}%
                        </span>
                      </div>
                      <Meter
                        value={orderRate}
                        max={50}
                        tone="mint"
                        className="mt-1.5"
                      />
                      <p className="mt-1.5 font-mono text-[10px] text-text-3">
                        {c.orders} orders
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-display text-[17px] font-semibold tracking-tight text-signal">
                        {bdt(c.revenue, { compact: true })}
                      </p>
                      <p className="font-mono text-[10px] text-text-3">
                        attributed
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </Panel>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* comment automation */}
          <Reveal>
            <Panel className="h-full">
              <PanelHead
                title="Comment automation"
                sub="Public reply plus a private DM, on your ads and organic posts."
              />
              <ul className="divide-y divide-[color:var(--line-soft)]">
                {COMMENT_RULES.map((r) => (
                  <li key={r.id} className="px-5 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-[11.5px] text-text-2">
                          {r.trigger}
                        </p>
                        <p className="mt-1.5 text-[12.5px] text-text-3">
                          {r.reply}
                        </p>
                      </div>
                      <span
                        className={cx(
                          "mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors",
                          r.live ? "bg-signal" : "bg-surface-3",
                        )}
                      >
                        <motion.span
                          layout
                          transition={SPRING}
                          className={cx(
                            "size-4 rounded-full bg-white",
                            r.live ? "ml-auto" : "",
                          )}
                        />
                      </span>
                    </div>
                    <div className="mt-2.5 flex gap-5 font-mono text-[10.5px] text-text-3">
                      <span>{r.fired.toLocaleString()} fired</span>
                      <span className="text-mint">{r.converted} → order</span>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          </Reveal>

          {/* playbooks */}
          <Reveal delay={0.08}>
            <Panel className="h-full">
              <PanelHead
                title="Follow-up playbooks"
                sub="Automatic nudges with quiet hours. One message, then it stops."
              />
              <ul className="divide-y divide-[color:var(--line-soft)]">
                {PLAYBOOKS.map((p) => (
                  <li key={p.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <h4 className="text-[13.5px] font-medium text-text">
                        {p.name}
                      </h4>
                      {p.live ? (
                        <Badge tone="mint" dot>
                          live
                        </Badge>
                      ) : (
                        <Badge tone="neutral">paused</Badge>
                      )}
                    </div>
                    <p className="mt-1.5 text-[12px] text-text-3">
                      <span className="text-text-2">When</span> {p.when}
                    </p>
                    <p className="mt-0.5 text-[12px] text-text-3">
                      <span className="text-text-2">Then</span> {p.then}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Meter
                        value={(p.orders / p.runs) * 100}
                        max={40}
                        tone="mint"
                        className="max-w-[120px]"
                      />
                      <span className="font-mono text-[10.5px] text-text-3">
                        {p.runs.toLocaleString()} runs · {p.orders} orders
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2.5 border-t border-line px-5 py-3.5">
                <IconCheck width={13} height={13} className="text-mint" />
                <p className="text-[11.5px] text-text-3">
                  Quiet hours respected — nothing sends between 10pm and 9am.
                </p>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </>
  );
}

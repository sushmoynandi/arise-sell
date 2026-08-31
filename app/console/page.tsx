import PageHeader from "@/components/console/PageHeader";
import LiveStream from "@/components/console/LiveStream";
import RevenueChart from "@/components/console/RevenueChart";
import {
  Badge,
  Button,
  Delta,
  Meter,
  Panel,
  PanelHead,
  Sparkline,
  Avatar,
} from "@/components/ui/primitives";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { IconArrow, IconWarn } from "@/components/ui/icons";
import { KPIS, SPEND, PIPELINE } from "@/data/operations";
import { CHANNELS } from "@/data/tenant";
import { bdt } from "@/lib/format";

const ATTENTION = PIPELINE.filter((p) => p.proposal);

export default function PulsePage() {
  return (
    <>
      <PageHeader
        title="Pulse"
        sub="Everything the engine did today, and the three things it needs you for."
        actions={
          <>
            <Badge tone="mint" dot>
              4 agents live
            </Badge>
            <Button href="/console/threads" size="sm" variant="outline">
              Open threads
            </Button>
          </>
        }
      />

      <div className="space-y-5 p-5 lg:p-8">
        {/* ---- KPI row ---- */}
        <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {KPIS.map((k) => (
            <StaggerItem key={k.label}>
              <Panel interactive className="h-full p-5">
                <div className="flex items-start justify-between">
                  <p className="text-[12.5px] text-text-3">{k.label}</p>
                  <Delta value={k.delta} />
                </div>
                <p className="mt-2.5 font-display text-[27px] font-semibold tracking-tight text-text">
                  <Counter
                    to={k.value}
                    prefix={k.prefix ?? ""}
                    suffix={k.suffix ?? ""}
                    decimals={k.suffix === "%" ? 1 : 0}
                  />
                </p>
                <div className="mt-3">
                  <Sparkline
                    data={k.spark}
                    height={30}
                    stroke={k.delta >= 0 ? "var(--signal)" : "var(--coral)"}
                  />
                </div>
              </Panel>
            </StaggerItem>
          ))}
        </Stagger>

        {/* ---- chart + stream ---- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Reveal>
            <RevenueChart />
          </Reveal>
          <Reveal delay={0.08} className="min-h-[340px]">
            <LiveStream />
          </Reveal>
        </div>

        {/* ---- attention + channels + spend ---- */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* needs you */}
          <Reveal className="lg:col-span-2">
            <Panel className="h-full">
              <PanelHead
                title="Waiting on a human"
                sub="The agent proposed a move and paused for confirmation."
                right={<Badge tone="amber">{ATTENTION.length} pending</Badge>}
              />
              <ul className="divide-y divide-[color:var(--line-soft)]">
                {ATTENTION.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <Avatar name={p.customer} hue={p.value > 4000 ? 82 : 200} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13.5px] font-medium text-text">{p.customer}</p>
                      <p className="mt-0.5 truncate text-[12px] text-text-3">{p.proposal?.why}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-[15px] font-semibold tracking-tight">
                        {bdt(p.value)}
                      </p>
                      <p className="font-mono text-[10.5px] text-text-3">
                        → {p.proposal?.to}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="quiet">
                        Reject
                      </Button>
                      <Button size="sm">Confirm</Button>
                    </div>
                  </li>
                ))}
                <li className="px-5 py-3.5">
                  <a
                    href="/console/pipeline"
                    className="inline-flex items-center gap-1.5 text-[12.5px] text-text-3 transition-colors hover:text-signal"
                  >
                    Open the full pipeline
                    <IconArrow width={13} height={13} />
                  </a>
                </li>
              </ul>
            </Panel>
          </Reveal>

          {/* spend guardrail */}
          <Reveal delay={0.08}>
            <Panel className="h-full">
              <PanelHead
                title="AI spend"
                sub="Ceiling enforced, not just measured."
                right={<Badge tone="signal">৳{SPEND.todayBdt} today</Badge>}
              />
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  <span className="font-display text-[24px] font-semibold tracking-tight">
                    {bdt(SPEND.monthUsedBdt)}
                  </span>
                  <span className="text-[12px] text-text-3">of {bdt(SPEND.monthCapBdt)} cap</span>
                </div>
                <Meter
                  value={SPEND.monthUsedBdt}
                  max={SPEND.monthCapBdt}
                  tone="signal"
                  className="mt-3"
                />
                <ul className="mt-5 space-y-3">
                  {SPEND.breakdown.map((b) => (
                    <li key={b.label} className="flex items-center gap-2.5">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ background: `hsl(${b.hue} 70% 58%)` }}
                      />
                      <span className="flex-1 text-[12.5px] text-text-2">{b.label}</span>
                      <span className="font-mono text-[11.5px] text-text-3">{bdt(b.bdt)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-amber/25 bg-amber/[0.06] p-3">
                  <IconWarn width={14} height={14} className="mt-0.5 shrink-0 text-amber" />
                  <p className="text-[11.5px] leading-snug text-text-2">
                    At this rate you reach the cap on day 27. Auto-posting pauses first.
                  </p>
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>

        {/* ---- channel mix ---- */}
        <Reveal>
          <Panel>
            <PanelHead
              title="Where the revenue came from"
              sub="Share of closed orders by channel, last 14 days."
            />
            <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
              {CHANNELS.filter((c) => c.live).map((c) => (
                <div key={c.id} className="bg-surface p-5">
                  <div className="flex items-baseline justify-between">
                    <p className="text-[13px] font-medium text-text">{c.label}</p>
                    <p className="font-display text-[17px] font-semibold tracking-tight text-signal">
                      {c.share}%
                    </p>
                  </div>
                  <Meter value={c.share} max={50} className="mt-3" />
                  <p className="mt-2.5 font-mono text-[10.5px] text-text-3">{c.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </Reveal>
      </div>
    </>
  );
}

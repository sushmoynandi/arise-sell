"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import {
  Badge,
  Button,
  Meter,
  Panel,
  PanelHead,
  Sparkline,
  type Tone,
} from "@/components/ui/primitives";
import {
  IconZap,
  IconCheck,
  IconWarn,
  IconPlus,
  IconCreditCard,
  IconBox,
  IconTruck,
  IconThreads,
  IconArrow,
  IconSettings,
} from "@/components/ui/icons";
import { Counter, Reveal, SPRING } from "@/components/motion";
import { CAPI_EVENTS, SERIES, SPEND } from "@/data/operations";
import { bdt, cx } from "@/lib/format";

const EV_TONE: Record<string, Tone> = {
  sent: "mint",
  queued: "amber",
  dropped: "coral",
};

const roas = SERIES.revenue.map((r, i) => r / SERIES.adSpend[i]);

interface AutomationRule {
  id: string;
  title: string;
  category: "Revenue" | "Operations" | "Customer Care" | "Retention";
  description: string;
  trigger: string;
  action: string;
  icon: typeof IconZap;
  enabled: boolean;
  executionsCount: number;
  impactMetric: string;
  channels: string[];
}

const INITIAL_RULES: AutomationRule[] = [
  {
    id: "abandoned-cart-recovery",
    title: "Abandoned Chat & Cart Recovery",
    category: "Revenue",
    description:
      "Detects customers who inquired about product sizes/colors or started checkout but stopped before providing address. Sends an auto-nudge after 15 minutes with dynamic product image and 5% checkout coupon.",
    trigger: "Buyer idle for 15m after product inquiry",
    action: "Send personalized reminder + 5% discount code",
    icon: IconZap,
    enabled: true,
    executionsCount: 428,
    impactMetric: "৳1,84,000 Recovered (28.4% Conv.)",
    channels: ["Messenger", "WhatsApp", "Instagram"],
  },
  {
    id: "after-hours-closer",
    title: "After-Hours Night Owl Auto-Seller",
    category: "Revenue",
    description:
      "Automatically activates between 12:00 AM – 8:00 AM. Answers customer stock inquiries, captures complete delivery address, and completes COD booking without requiring human agents.",
    trigger: "Incoming DM between 12 AM – 8 AM",
    action: "Autonomous AI full-sales closure & courier booking",
    icon: IconThreads,
    enabled: true,
    executionsCount: 612,
    impactMetric: "142 Shipped Orders Closed",
    channels: ["Messenger", "WhatsApp", "Instagram"],
  },
  {
    id: "anti-fake-cod",
    title: "Anti-Fake COD Verification & Fraud Shield",
    category: "Operations",
    description:
      "Verifies Bangladeshi 11-digit mobile numbers (013-019), checks historical courier return blacklists, and sends 1-click confirmation OTP before order booking to minimize RTO returns.",
    trigger: "New COD Order placed with unverified phone",
    action: "Verify courier trust score & send 1-click confirm",
    icon: IconCheck,
    enabled: true,
    executionsCount: 894,
    impactMetric: "98.2% Delivery Success Rate",
    channels: ["SMS", "WhatsApp", "Messenger"],
  },
  {
    id: "smart-courier-dispatch",
    title: "Smart Zone Courier Auto-Dispatch",
    category: "Operations",
    description:
      "Analyzes delivery destination and automatically routes package to either Steadfast (Fastest for Outside Dhaka) or Pathao/RedX (Highest Dhaka Same-Day SLA) to minimize shipping cost and delivery delay.",
    trigger: "Confirmed order with valid address",
    action: "Auto-generate consignment & print air waybill",
    icon: IconTruck,
    enabled: true,
    executionsCount: 785,
    impactMetric: "1.2 Days Avg. Delivery Time",
    channels: ["Steadfast", "Pathao", "RedX"],
  },
  {
    id: "post-delivery-review",
    title: "Post-Delivery Photo Review & Cashback Collector",
    category: "Customer Care",
    description:
      "Triggers 48 hours after courier status updates to 'Delivered'. Automatically contacts buyer on WhatsApp asking for a photo review with a ৳50 cashback incentive on their next order.",
    trigger: "Courier webhook status = 'Delivered' + 48h",
    action: "Send friendly feedback prompt + ৳50 coupon",
    icon: IconBox,
    enabled: false,
    executionsCount: 310,
    impactMetric: "4.8★ Avg. Store Rating (64 Reviews)",
    channels: ["WhatsApp", "SMS"],
  },
  {
    id: "vip-customer-upsell",
    title: "VIP High-Spender Auto-Tier & Re-Engagement",
    category: "Retention",
    description:
      "Identifies customers whose lifetime purchase value exceeds ৳5,000. Automatically tags as 'VIP', unlocks priority AI agent handling, and sends exclusive early-bird campaign alerts.",
    trigger: "Customer Lifetime Value (LTV) > ৳5,000",
    action: "Assign VIP tier badge & trigger personalized discount",
    icon: IconCreditCard,
    enabled: true,
    executionsCount: 156,
    impactMetric: "3.4× Repeat Purchase Frequency",
    channels: ["WhatsApp", "Messenger"],
  },
];

const EXECUTION_LOGS = [
  {
    id: "log-1",
    rule: "Abandoned Chat & Cart Recovery",
    target: "Farzana Yasmin (WhatsApp)",
    action: "Sent 5% recovery code for Crimson Jamdani Saree",
    status: "Success",
    time: "2 mins ago",
    revenue: "৳2,850",
  },
  {
    id: "log-2",
    rule: "Anti-Fake COD Verification",
    target: "Tanvir Ahmed (Messenger)",
    action: "Validated 01711-XXXXXX. Trust score: 98/100",
    status: "Success",
    time: "14 mins ago",
    revenue: "৳1,450",
  },
  {
    id: "log-3",
    rule: "Smart Zone Courier Auto-Dispatch",
    target: "Order #NP-9041 (Sylhet Sadar)",
    action: "Assigned to Steadfast Courier (Fastest Zone A)",
    status: "Success",
    time: "32 mins ago",
    revenue: "৳3,600",
  },
  {
    id: "log-4",
    rule: "After-Hours Night Owl Auto-Seller",
    target: "Shuvro Sen (Instagram DM)",
    action: "Captured address & closed COD order at 03:22 AM",
    status: "Success",
    time: "3 hours ago",
    revenue: "৳4,200",
  },
  {
    id: "log-5",
    rule: "Post-Delivery Photo Review",
    target: "Nusrat Jahan (WhatsApp)",
    action: "Photo review received · 5 Stars rating saved",
    status: "Success",
    time: "5 hours ago",
    revenue: "—",
  },
];

export default function AutomationToolsPage() {
  const [activeTab, setActiveTab] = useState<"workflows" | "capi" | "logs">(
    "workflows",
  );
  const [rules, setRules] = useState<AutomationRule[]>(INITIAL_RULES);
  const [testModalRule, setTestModalRule] = useState<AutomationRule | null>(
    null,
  );
  const [testResult, setTestResult] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Rule Form State
  const [newTitle, setNewTitle] = useState("");
  const [newTrigger, setNewTrigger] = useState("Buyer asks about price/stock");
  const [newAction, setNewAction] = useState(
    "Send AI instant catalog recommendation",
  );
  const [newCategory, setNewCategory] =
    useState<AutomationRule["category"]>("Revenue");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const next = !r.enabled;
          showToast(
            next
              ? `⚡ "${r.title}" is now ACTIVE`
              : `⏸️ "${r.title}" has been PAUSED`,
          );
          return { ...r, enabled: next };
        }
        return r;
      }),
    );
  };

  const handleRunTest = (rule: AutomationRule) => {
    setTestModalRule(rule);
    setTestResult(null);
  };

  const executeSimulation = () => {
    setTestResult("Simulating trigger event with real-time sandbox buyer...");
    setTimeout(() => {
      setTestResult(
        `✅ SUCCESS: Condition matched! Action dispatched to sandbox customer in 42ms. 100% compliant with WhatsApp/Meta policy.`,
      );
    }, 900);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newRule: AutomationRule = {
      id: `custom-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      description: `Custom automated workflow: When "${newTrigger}", automatically "${newAction}".`,
      trigger: newTrigger,
      action: newAction,
      icon: IconZap,
      enabled: true,
      executionsCount: 0,
      impactMetric: "0 executions (New)",
      channels: ["Messenger", "WhatsApp"],
    };

    setRules([newRule, ...rules]);
    setCreateModalOpen(false);
    setNewTitle("");
    showToast(`✨ Custom workflow "${newRule.title}" created & activated!`);
  };

  const sent = CAPI_EVENTS.filter((e) => e.state === "sent").length;
  const avgMatch =
    CAPI_EVENTS.reduce((a, e) => a + e.match, 0) / CAPI_EVENTS.length;
  const totalRev = SERIES.revenue.reduce((a, b) => a + b, 0);
  const totalSpend = SERIES.adSpend.reduce((a, b) => a + b, 0);
  const activeCount = rules.filter((r) => r.enabled).length;

  return (
    <>
      <PageHeader
        title="Automation Tools"
        sub="Autonomous sales triggers, smart recovery workflows, and Meta server-side signal engine."
        actions={
          <>
            <Badge tone="mint" dot>
              {activeCount} Active Rules
            </Badge>
            <Button
              size="sm"
              variant="signal"
              onClick={() => setCreateModalOpen(true)}
              className="gap-1.5"
            >
              <IconPlus width={14} height={14} />
              <span>New Automation Flow</span>
            </Button>
          </>
        }
      />

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-8 z-50 rounded-xl border border-signal/30 bg-surface/95 backdrop-blur-xl px-4 py-2.5 shadow-2xl text-[13px] font-semibold text-text flex items-center gap-2"
          >
            <span className="size-2 rounded-full bg-signal animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6 p-5 lg:p-8">
        {/* KPI Metrics Strip */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Active Workflows",
              value: activeCount,
              suffix: ` / ${rules.length}`,
              decimals: 0,
              spark: [3, 4, 4, 5, 5, 6, 6, 6],
            },
            {
              label: "Recovered Revenue (30d)",
              value: 3.42,
              prefix: "৳",
              suffix: "L",
              decimals: 2,
              spark: [1.2, 1.8, 2.1, 2.4, 2.9, 3.1, 3.42],
            },
            {
              label: "Autonomous Hours Saved",
              value: 184,
              suffix: " hrs",
              decimals: 0,
              spark: [40, 65, 90, 120, 145, 170, 184],
            },
            {
              label: "Meta CAPI ROAS",
              value: totalRev / totalSpend,
              suffix: "×",
              decimals: 2,
              spark: roas,
            },
          ].map((k, i) => (
            <motion.div
              key={k.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: i * 0.05 }}
              className="panel p-5 relative overflow-hidden"
            >
              <p className="text-[12.5px] text-text-3 font-medium">{k.label}</p>
              <p className="mt-2 font-display text-[26px] font-bold tracking-tight text-text">
                <Counter
                  to={k.value}
                  prefix={k.prefix ?? ""}
                  suffix={k.suffix ?? ""}
                  decimals={k.decimals}
                />
              </p>
              <div className="mt-3">
                <Sparkline data={k.spark} height={26} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-line pb-2 text-[13.5px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab("workflows")}
            className={cx(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer",
              activeTab === "workflows"
                ? "bg-signal/[0.1] text-signal font-bold shadow-2xs"
                : "text-text-2 hover:text-text hover:bg-surface-2",
            )}
          >
            <IconZap width={16} height={16} />
            <span>Workflow Recipes & Rules ({rules.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("capi")}
            className={cx(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer",
              activeTab === "capi"
                ? "bg-signal/[0.1] text-signal font-bold shadow-2xs"
                : "text-text-2 hover:text-text hover:bg-surface-2",
            )}
          >
            <span className="size-1.5 rounded-full bg-signal" />
            <span>Meta CAPI & Server Signals</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={cx(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer",
              activeTab === "logs"
                ? "bg-signal/[0.1] text-signal font-bold shadow-2xs"
                : "text-text-2 hover:text-text hover:bg-surface-2",
            )}
          >
            <IconSettings width={16} height={16} />
            <span>Live Trigger Logs</span>
          </button>
        </div>

        {/* TAB 1: WORKFLOW RECIPES & AUTOMATIONS */}
        {activeTab === "workflows" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-text">
                  Automated Conversion Rules
                </h2>
                <p className="text-[12.5px] text-text-3">
                  Pre-configured, high-converting workflows ready to deploy with
                  1 click.
                </p>
              </div>
              <span className="text-[12px] font-mono text-text-3">
                {activeCount} of {rules.length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {rules.map((rule, idx) => {
                const Icon = rule.icon;
                return (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...SPRING, delay: idx * 0.04 }}
                    className={cx(
                      "panel p-5 transition-all duration-200 border",
                      rule.enabled
                        ? "border-line bg-surface hover:border-signal/40"
                        : "border-line/60 bg-surface/50 opacity-75",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cx(
                            "grid size-10 place-items-center rounded-xl transition-colors",
                            rule.enabled
                              ? "bg-signal/15 text-signal"
                              : "bg-surface-2 text-text-3",
                          )}
                        >
                          <Icon width={20} height={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-[14.5px] font-bold text-text">
                              {rule.title}
                            </h3>
                            <span
                              className={cx(
                                "rounded-md px-1.5 py-0.5 font-mono text-[9.5px] font-bold",
                                rule.category === "Revenue"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : rule.category === "Operations"
                                    ? "bg-blue-500/10 text-blue-600"
                                    : "bg-purple-500/10 text-purple-600",
                              )}
                            >
                              {rule.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-text-3">
                            <span>Channels:</span>
                            {rule.channels.map((ch) => (
                              <span
                                key={ch}
                                className="rounded bg-surface-2 px-1 py-0.5"
                              >
                                {ch}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Interactive Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => toggleRule(rule.id)}
                        className={cx(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          rule.enabled ? "bg-signal" : "bg-line",
                        )}
                        role="switch"
                        aria-checked={rule.enabled}
                      >
                        <span
                          aria-hidden="true"
                          className={cx(
                            "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
                            rule.enabled ? "translate-x-5" : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>

                    <p className="mt-3 text-[13px] text-text-2 leading-relaxed">
                      {rule.description}
                    </p>

                    {/* Trigger -> Action Flow Visualizer */}
                    <div className="mt-3 rounded-xl border border-line/60 bg-canvas/70 p-2.5 text-[12px] space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-text-3 shrink-0">
                          WHEN:
                        </span>
                        <span className="font-medium text-text truncate">
                          {rule.trigger}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold text-signal shrink-0">
                          THEN:
                        </span>
                        <span className="font-medium text-text truncate">
                          {rule.action}
                        </span>
                      </div>
                    </div>

                    {/* Footer Stats & Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-line/60 pt-3 text-[12px]">
                      <div className="flex items-center gap-2 font-mono text-[11px] text-text-3">
                        <span className="size-1.5 rounded-full bg-signal" />
                        <span className="font-semibold text-text">
                          {rule.impactMetric}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="quiet"
                          onClick={() => handleRunTest(rule)}
                          className="text-[12px] h-7 px-2.5"
                        >
                          <span>Test Flow</span>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: META CAPI & SERVER SIGNALS */}
        {activeTab === "capi" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <Reveal>
              <Panel className="h-full">
                <PanelHead
                  title="Meta Conversion Events (CAPI)"
                  sub="Server-side purchase and lead signals delivered directly to Meta Ads Manager."
                  right={
                    <Badge tone="mint">
                      {sent} of {CAPI_EVENTS.length} Accepted
                    </Badge>
                  }
                />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-text-3">
                        <th className="px-5 py-2.5 font-normal">Event</th>
                        <th className="px-3 py-2.5 font-normal">Ref</th>
                        <th className="px-3 py-2.5 text-right font-normal">
                          Value
                        </th>
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
                          className="border-b border-line-soft hover:bg-surface-2/40 transition-colors"
                        >
                          <td className="px-5 py-3">
                            <span className="text-[13px] font-bold text-text">
                              {e.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-[10px] text-text-3">
                              {e.at}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono text-[11.5px] text-text-2">
                            {e.ref}
                          </td>
                          <td className="px-3 py-3 text-right font-mono text-[12px] font-semibold text-text">
                            {e.value ? bdt(e.value) : "—"}
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <Meter
                                value={e.match}
                                max={10}
                                tone={
                                  e.match >= 7
                                    ? "mint"
                                    : e.match >= 5
                                      ? "amber"
                                      : "coral"
                                }
                                className="w-14"
                              />
                              <span className="font-mono text-[10.5px] font-bold text-text-2">
                                {e.match}
                              </span>
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
                  <IconWarn
                    width={14}
                    height={14}
                    className="mt-0.5 shrink-0 text-amber-500"
                  />
                  <p className="text-[12px] leading-snug text-text-3">
                    Events are hashed with SHA-256 and pushed through
                    server-side APIs within 2 seconds of order confirmation,
                    bypassing ad blockers and iOS restrictions.
                  </p>
                </div>
              </Panel>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="space-y-4">
                <Panel>
                  <PanelHead
                    title="Ad Spend & Budget Pacing"
                    sub="Autonomous spend ceiling with soft-landing alert."
                  />
                  <div className="p-5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-display text-[24px] font-bold tracking-tight text-text">
                        {bdt(SPEND.monthUsedBdt)}
                      </span>
                      <span className="text-[12px] font-mono text-text-3">
                        of {bdt(SPEND.monthCapBdt)}
                      </span>
                    </div>
                    <div className="mt-3">
                      <Meter
                        value={SPEND.monthUsedBdt}
                        max={SPEND.monthCapBdt}
                        tone="mint"
                        className="h-2"
                      />
                    </div>
                    <p className="mt-3 text-[12px] text-text-3 leading-relaxed">
                      Auto-pacing ensures ad campaigns don&apos;t exhaust budget
                      during off-peak hours.
                    </p>
                  </div>
                </Panel>

                <Panel>
                  <PanelHead
                    title="Conversion Quality Score"
                    sub="Evaluated by Meta CAPI Diagnostics."
                  />
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-text">
                        Overall Match Quality
                      </span>
                      <span className="font-mono text-[14px] font-bold text-signal">
                        {avgMatch.toFixed(1)} / 10
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-text-3">
                      <span>Server Response Latency</span>
                      <span className="font-mono font-bold text-text">
                        42 ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-text-3">
                      <span>Deduplication Rate</span>
                      <span className="font-mono font-bold text-text">
                        99.8%
                      </span>
                    </div>
                  </div>
                </Panel>
              </div>
            </Reveal>
          </div>
        )}

        {/* TAB 3: LIVE EXECUTION LOGS */}
        {activeTab === "logs" && (
          <Panel>
            <PanelHead
              title="Real-Time Automation Logs"
              sub="Live stream of automated triggers, customer events, and courier bookings."
              right={
                <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-signal">
                  <span className="size-2 rounded-full bg-signal animate-pulse" />
                  Live Stream Active
                </span>
              }
            />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left">
                <thead>
                  <tr className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-text-3">
                    <th className="px-5 py-2.5 font-normal">Rule</th>
                    <th className="px-3 py-2.5 font-normal">
                      Customer / Target
                    </th>
                    <th className="px-3 py-2.5 font-normal">Action Taken</th>
                    <th className="px-3 py-2.5 text-right font-normal">
                      Order Value
                    </th>
                    <th className="px-3 py-2.5 font-normal">Time</th>
                    <th className="px-5 py-2.5 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {EXECUTION_LOGS.map((log, i) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...SPRING, delay: i * 0.04 }}
                      className="border-b border-line-soft hover:bg-surface-2/40 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <span className="text-[13px] font-bold text-text">
                          {log.rule}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-medium text-[12.5px] text-text-2">
                        {log.target}
                      </td>
                      <td className="px-3 py-3 text-[12.5px] text-text-3">
                        {log.action}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-[12.5px] font-bold text-signal">
                        {log.revenue}
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-text-3">
                        {log.time}
                      </td>
                      <td className="px-5 py-3">
                        <Badge tone="mint">{log.status}</Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>

      {/* CREATE CUSTOM AUTOMATION MODAL */}
      {createModalOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            onClick={() => setCreateModalOpen(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-signal/15 text-signal">
                    <IconZap width={18} height={18} />
                  </span>
                  <h3 className="text-[16px] font-bold text-text">
                    Create Custom Automation Flow
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="text-text-3 hover:text-text p-1 text-[16px] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleCreateRule}
                className="space-y-4 text-[13px]"
              >
                <div>
                  <label className="block text-[12px] font-bold text-text mb-1">
                    Workflow Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eid Mega Sale VIP Auto-Responder"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-bold text-text mb-1">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) =>
                        setNewCategory(
                          e.target.value as AutomationRule["category"],
                        )
                      }
                      className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none cursor-pointer"
                    >
                      <option value="Revenue">Revenue &amp; Sales</option>
                      <option value="Operations">
                        Operations &amp; Courier
                      </option>
                      <option value="Customer Care">Customer Care</option>
                      <option value="Retention">Buyer Retention</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-bold text-text mb-1">
                      Target Channels
                    </label>
                    <div className="rounded-xl border border-line bg-canvas px-3 py-2 text-[12px] text-text-2">
                      Messenger, WhatsApp
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-text mb-1">
                    When Trigger Occurs (WHEN)
                  </label>
                  <select
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none cursor-pointer"
                  >
                    <option value="Buyer asks about price/stock">
                      Buyer asks about price or stock in DM
                    </option>
                    <option value="Buyer leaves cart without address for 15m">
                      Buyer leaves cart without address for 15m
                    </option>
                    <option value="New Order Placed (Value > ৳2,000)">
                      New Order Placed (Value &gt; ৳2,000)
                    </option>
                    <option value="Courier status changes to 'Returned'">
                      Courier status changes to &apos;Returned&apos; (RTO)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-text mb-1">
                    Execute Action (THEN)
                  </label>
                  <select
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                    className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none cursor-pointer"
                  >
                    <option value="Send AI instant catalog recommendation">
                      Send AI instant catalog &amp; photo recommendation
                    </option>
                    <option value="Apply 5% discount code & send WhatsApp nudge">
                      Apply 5% discount code &amp; send WhatsApp nudge
                    </option>
                    <option value="Assign Steadfast Priority Courier + SMS OTP">
                      Assign Steadfast Priority Courier + SMS OTP
                    </option>
                    <option value="Alert human manager on Slack / WhatsApp">
                      Alert human manager on Slack / WhatsApp
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setCreateModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="signal" size="sm">
                    Create &amp; Activate
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}

      {/* TEST FLOW SIMULATION MODAL */}
      {testModalRule && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs"
            onClick={() => setTestModalRule(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-signal/15 text-signal">
                    <IconZap width={18} height={18} />
                  </span>
                  <div>
                    <h3 className="text-[15px] font-bold text-text">
                      Test Simulation
                    </h3>
                    <p className="text-[11px] text-text-3 font-mono">
                      {testModalRule.title}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestModalRule(null)}
                  className="text-text-3 hover:text-text p-1 text-[16px] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="rounded-xl border border-line bg-canvas p-3 text-[12.5px] space-y-2">
                <p className="font-bold text-text">Simulated Event Payload:</p>
                <div className="font-mono text-[11px] text-text-2 bg-surface p-2 rounded-lg border border-line/60 space-y-0.5">
                  <div>Customer: Tanvir Rahman (01712-XXXXXX)</div>
                  <div>Channel: WhatsApp (+88017...)</div>
                  <div>Trigger: {testModalRule.trigger}</div>
                  <div>Expected Action: {testModalRule.action}</div>
                </div>
              </div>

              {testResult ? (
                <div className="rounded-xl bg-signal/[0.08] border border-signal/30 p-3 text-[12px] font-medium text-text leading-relaxed animate-in fade-in duration-200">
                  {testResult}
                </div>
              ) : (
                <p className="text-[12px] text-text-3">
                  Click below to dispatch a dry-run test trigger and verify
                  webhook &amp; response speed.
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTestModalRule(null)}
                >
                  Close
                </Button>
                <Button
                  variant="signal"
                  size="sm"
                  onClick={executeSimulation}
                  className="gap-1.5"
                >
                  <span>Run Live Simulation</span>
                  <IconArrow width={14} height={14} />
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </>
  );
}

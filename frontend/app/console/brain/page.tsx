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

  // AI Persona & Autopilot States
  const [dialect, setDialect] = useState<"bangla" | "banglish" | "english">("bangla");
  const [personaTone, setPersonaTone] = useState<"friendly" | "urgent" | "formal" | "custom">("friendly");
  const [systemPrompt, setSystemPrompt] = useState(
    "You sell for Nokshi & Co., a handloom and home brand in Dhaka.\n\nSpeak the way a good shop assistant speaks: warm, unhurried, always আপনি. Default to Bangla script. If the customer writes Banglish, answer in Banglish. If they write English, answer in English.\n\nQuote only prices and stock the catalog gives you. If you do not know, say so and offer to check. Never promise a delivery date the courier has not given.\n\nYour job is finished when the parcel is booked — not when the question is answered."
  );
  const [autoPhoto, setAutoPhoto] = useState(true);
  const [scarcityNudge, setScarcityNudge] = useState(true);
  const [priceFloorLock, setPriceFloorLock] = useState(true);
  const [handoverAngry, setHandoverAngry] = useState(true);
  const [voiceNotes, setVoiceNotes] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handlePublish = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3500);
    }, 600);
  };

  // Dynamic Sample Reply computation based on dialect and persona tone
  const sampleReply = (() => {
    if (dialect === "bangla") {
      if (personaTone === "urgent") {
        return "জি আপা, জামদানি শাড়িটা ইন্ডিগো রঙে আর মাত্র ২ পিস বাকি আছে! ⚡ আজকের মধ্যে কনফার্ম করলে ফ্রি ডেলিভারি সহ কালকের মধ্যেই পাবেন। দাম ৳৬,৮৫০।";
      }
      if (personaTone === "formal") {
        return "আসসালামু আলাইকুম। নক্শী অ্যান্ড কোং-এ আপনাকে স্বাগতম। জামদানি শাড়িটি ইন্ডিগো রঙে স্টক রয়েছে (১২ পিস)। মূল্য: ৳৬,৮৫০। ঢাকার ভেতরে ডেলিভারি চার্জ ৳৮০।";
      }
      if (personaTone === "custom") {
        return "জি আপনি যা জানতে চেয়েছেন: জামদানি শাড়ি (ইন্ডিগো) রেডি স্টক আছে। দাম ৳৬,৮৫০। বুকিং করতে আপনার নাম ও ঠিকানা প্রদান করুন।";
      }
      return "জি আপা, জামদানি শাড়িটা ইন্ডিগো রঙে ১২ পিস আছে 🌿 দাম ৳৬,৮৫০, সাথে ম্যাচিং ব্লাউজ পিস ফ্রি। ঢাকার ভিতরে ২৪ ঘণ্টায় ডেলিভারি, চার্জ ৳৮০।";
    }
    if (dialect === "banglish") {
      if (personaTone === "urgent") {
        return "Ji apu, Jamdani sharee-ta Indigo color-e ar matro 2 pcs baki ase! ⚡ Ajkei order confirm korle kaler moddhei peye jaben. Price ৳6,850.";
      }
      if (personaTone === "formal") {
        return "Assalamu Alaikum. Nokshi & Co.-te apnake shagotom. Jamdani sharee-ti Indigo color-e stock-e ache. Mullo ৳6,850. Dhaka delivery charge ৳80.";
      }
      if (personaTone === "custom") {
        return "Ji apu, Jamdani sharee (Indigo) available ase. Price ৳6,850. Order korte phone number & address din.";
      }
      return "Ji apu, Jamdani sharee-ta Indigo color-e 12 pcs ready stock ase 🌿 Price ৳6,850, sathe matching blouse piece free! Dhakar moddhe 24 hours-e delivery, charge ৳80.";
    }
    // English
    if (personaTone === "urgent") {
      return "Hello! Quick update: only 2 pieces left of the Jamdani Saree in Indigo! ⚡ Order within the hour for priority next-day dispatch. Total: ৳6,850.";
    }
    if (personaTone === "formal") {
      return "Greetings. Thank you for contacting Nokshi & Co. The Jamdani Saree in Indigo is currently available in stock. The price is BDT 6,850 with standard delivery within 24 hours.";
    }
    if (personaTone === "custom") {
      return "Hello, the Jamdani Saree in Indigo is in stock for ৳6,850. Please provide your shipping address to proceed with order booking.";
    }
    return "Hello! Yes, the Jamdani Saree in Indigo is currently in stock (12 pieces available) 🌿 Price is ৳6,850 including complimentary blouse piece. Delivery inside Dhaka takes 24 hours (charge ৳80).";
  })();

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
            <Button
              size="sm"
              variant="signal"
              onClick={handlePublish}
              disabled={isSaving}
            >
              {isSaving ? "Publishing…" : "Publish changes"}
            </Button>
          </>
        }
      />

      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mx-5 lg:mx-8 mt-4 rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>AI Brain &amp; Persona guidelines published successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="border-b border-line px-5 lg:px-8">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx(
                "relative px-3 py-3 text-[13.5px] transition-colors cursor-pointer",
                tab === t ? "text-text font-medium" : "text-text-3 hover:text-text-2",
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
              <div className="space-y-6">
                {/* Dialect and Tone Control Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Language & Dialect Selector */}
                  <Panel>
                    <PanelHead
                      title="Language & Dialect"
                      sub="How the agent detects customer language and responds."
                    />
                    <div className="p-4 space-y-2">
                      {[
                        {
                          id: "bangla" as const,
                          label: "Shuddho Bangla (বাংলা)",
                          desc: "Courteous Bengali script with respectful 'আপনি'.",
                        },
                        {
                          id: "banglish" as const,
                          label: "Banglish / Romanized",
                          desc: "Natural phonetics (e.g. 'Apu, eita ready stock ase').",
                        },
                        {
                          id: "english" as const,
                          label: "English & Bilingual",
                          desc: "Fluent English with automatic mirror matching.",
                        },
                      ].map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDialect(d.id)}
                          className={cx(
                            "w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                            dialect === d.id
                              ? "border-signal bg-signal-wash/40 shadow-xs ring-1 ring-signal/30"
                              : "border-line bg-white hover:border-line-2 hover:bg-surface-2/40",
                          )}
                        >
                          <div>
                            <p className="text-[13px] font-bold text-text">{d.label}</p>
                            <p className="text-[11.5px] text-text-3 mt-0.5">{d.desc}</p>
                          </div>
                          {dialect === d.id && (
                            <span className="size-5 rounded-full bg-signal text-white grid place-items-center shrink-0">
                              <IconCheck width={12} height={12} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </Panel>

                  {/* Persona Tone Selector */}
                  <Panel>
                    <PanelHead
                      title="Sales Tone & Personality"
                      sub="The conversational attitude during customer inquiries."
                    />
                    <div className="p-4 space-y-2">
                      {[
                        {
                          id: "friendly" as const,
                          label: "Warm & Courteous (Boutique)",
                          desc: "High empathy, respectful shop-assistant vibe.",
                        },
                        {
                          id: "urgent" as const,
                          label: "Urgent & High Converting",
                          desc: "Subtle scarcity, low-stock nudges, and fast order booking.",
                        },
                        {
                          id: "formal" as const,
                          label: "Corporate & Structured",
                          desc: "Direct, precise answers with minimal emojis.",
                        },
                        {
                          id: "custom" as const,
                          label: "Custom Brand Persona",
                          desc: "Tuned specifically via the system prompt.",
                        },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPersonaTone(t.id)}
                          className={cx(
                            "w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                            personaTone === t.id
                              ? "border-signal bg-signal-wash/40 shadow-xs ring-1 ring-signal/30"
                              : "border-line bg-white hover:border-line-2 hover:bg-surface-2/40",
                          )}
                        >
                          <div>
                            <p className="text-[13px] font-bold text-text">{t.label}</p>
                            <p className="text-[11.5px] text-text-3 mt-0.5">{t.desc}</p>
                          </div>
                          {personaTone === t.id && (
                            <span className="size-5 rounded-full bg-signal text-white grid place-items-center shrink-0">
                              <IconCheck width={12} height={12} />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </Panel>
                </div>

                {/* System Prompt & Sample Reply Split */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                  <Panel>
                    <PanelHead
                      title="System Prompt & Core Directives"
                      sub="Plain language instructions read by the agent before every conversation."
                      right={<Badge tone="neutral">Live AI Core</Badge>}
                    />
                    <div className="p-5 space-y-4">
                      <div className="relative">
                        <textarea
                          rows={7}
                          value={systemPrompt}
                          onChange={(e) => setSystemPrompt(e.target.value)}
                          className="w-full rounded-xl border border-line bg-canvas p-3.5 font-mono text-[12.5px] leading-relaxed text-text outline-none focus:border-signal focus:ring-1 focus:ring-signal"
                        />
                        <div className="mt-1 flex items-center justify-between text-[11px] text-text-3 font-mono">
                          <span>{systemPrompt.length} characters</span>
                          <button
                            type="button"
                            onClick={() =>
                              setSystemPrompt(
                                "You sell for Nokshi & Co., a handloom and home brand in Dhaka.\n\nSpeak the way a good shop assistant speaks: warm, unhurried, always আপনি. Default to Bangla script. If the customer writes Banglish, answer in Banglish. If they write English, answer in English.\n\nQuote only prices and stock the catalog gives you. If you do not know, say so and offer to check. Never promise a delivery date the courier has not given.\n\nYour job is finished when the parcel is booked — not when the question is answered."
                              )
                            }
                            className="text-signal hover:underline cursor-pointer"
                          >
                            Reset to Default Prompt
                          </button>
                        </div>
                      </div>

                      <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
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

                  <div className="space-y-4">
                    <Panel className="h-fit">
                      <PanelHead
                        title="Live Sample Reply"
                        sub="Simulated in real-time with current dialect &amp; tone."
                      />
                      <div className="p-5">
                        <div className="rounded-2xl rounded-tl-sm bg-signal px-4 py-3 font-(family-name:--font-hind) text-[13.5px] leading-relaxed text-signal-ink shadow-2xs">
                          {sampleReply}
                        </div>
                        <ul className="mt-4 space-y-2">
                          {[
                            dialect === "bangla"
                              ? "বাংলা স্ক্রিপ্ট ও সম্মানসূচক আপনি প্রয়োগ"
                              : dialect === "banglish"
                                ? "Banglish phonetics mirror matching"
                                : "Fluent bilingual English output",
                            personaTone === "urgent"
                              ? "Scarcity & fast dispatch call-to-action active"
                              : "Warm boutique shop-assistant tone",
                            "Real-time catalog price & stock verified",
                            "Courier delivery SLA & fee (৳৮০) accurate",
                          ].map((c) => (
                            <li
                              key={c}
                              className="flex items-center gap-2 text-[12px] text-text-2"
                            >
                              <IconCheck
                                width={12}
                                height={12}
                                className="text-mint shrink-0"
                              />
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Panel>

                    {/* Autopilot Safeguards */}
                    <Panel>
                      <PanelHead
                        title="Autopilot Safeguards"
                        sub="Autonomous behaviors and sales tactics."
                      />
                      <div className="divide-y divide-line/60">
                        {[
                          {
                            label: "Auto-Send Product Photos",
                            desc: "Send visual swatch when customer asks for details.",
                            val: autoPhoto,
                            set: setAutoPhoto,
                          },
                          {
                            label: "Scarcity Stock Nudges",
                            desc: "Mention stock urgency when less than 5 units left.",
                            val: scarcityNudge,
                            set: setScarcityNudge,
                          },
                          {
                            label: "Price Floor Lock",
                            desc: "Strictly prevent discounts below minimum profit margin.",
                            val: priceFloorLock,
                            set: setPriceFloorLock,
                          },
                          {
                            label: "Human Handover on Angry Sentiment",
                            desc: "Immediately notify human staff when irritation detected.",
                            val: handoverAngry,
                            set: setHandoverAngry,
                          },
                          {
                            label: "Voice Notes Auto-Reply",
                            desc: "Transcribe voice memos in Bangla/Banglish and respond.",
                            val: voiceNotes,
                            set: setVoiceNotes,
                          },
                        ].map((s) => (
                          <div
                            key={s.label}
                            className="p-3.5 flex items-center justify-between gap-3"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-[12.5px] font-bold text-text">{s.label}</p>
                              <p className="text-[11px] text-text-3">{s.desc}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => s.set(!s.val)}
                              className={cx(
                                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                                s.val ? "bg-signal" : "bg-neutral-300 dark:bg-neutral-700",
                              )}
                            >
                              <span
                                className={cx(
                                  "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                  s.val ? "translate-x-4" : "translate-x-0",
                                )}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </Panel>
                  </div>
                </div>
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

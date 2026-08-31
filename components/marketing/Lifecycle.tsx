"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Eyebrow, Panel } from "@/components/ui/primitives";
import { Reveal, SPRING, SPRING_SOFT } from "@/components/motion";
import { cx } from "@/lib/format";

const STAGES = [
  {
    key: "listening",
    n: "01",
    title: "It hears the question",
    lead: "Bangla script, phonetic Banglish, Sylheti, English — or a screenshot with no words at all.",
    detail:
      "Rapid-fire messages get batched into one thought before the agent answers, so a customer typing four lines in eight seconds gets one reply, not four.",
    facts: [
      ["Languages", "বাংলা · Banglish · English"],
      ["Batch window", "8 seconds"],
      ["First reply", "under 4s median"],
    ],
    tint: "azure",
  },
  {
    key: "matched",
    n: "02",
    title: "It finds the actual SKU",
    lead: "A cropped Facebook screenshot becomes a variant ID with a confidence score.",
    detail:
      "Catalog images are embedded and indexed, so a photo lands on Jamdani · Indigo · in stock — not a guess. Below the confidence floor it asks instead of assuming.",
    facts: [
      ["Match floor", "0.78 confidence"],
      ["Index refresh", "every feed sync"],
      ["Fallback", "asks, never guesses"],
    ],
    tint: "iris",
  },
  {
    key: "kyc",
    n: "03",
    title: "It collects what shipping needs",
    lead: "Name, an 11-digit number that actually validates, and an address a rider can find.",
    detail:
      "Slots are yours to define. The agent asks for what's missing, re-asks once, and refuses to confirm an order with a malformed number — the single biggest source of failed deliveries.",
    facts: [
      ["Phone rule", "01[3-9] + 8 digits"],
      ["Address parse", "district · thana · street"],
      ["Custom slots", "unlimited"],
    ],
    tint: "amber",
  },
  {
    key: "confirmed",
    n: "04",
    title: "It commits the order",
    lead: "Written to your own store, with an idempotency key so a webhook retry can't double-charge.",
    detail:
      "COD or a bKash link in-chat. High-risk orders — new number, big total, outside Dhaka — get asked for an advance before they ever reach a rider.",
    facts: [
      ["Push target", "your order endpoint"],
      ["Dedup", "Idempotency-Key"],
      ["Prepay", "bKash · Nagad link"],
    ],
    tint: "signal",
  },
  {
    key: "shipped",
    n: "05",
    title: "It books the courier and closes the loop",
    lead: "Steadfast or Pathao consignment, tracking code back in the chat, invoice in Bangla.",
    detail:
      "Then a Purchase event goes server-side to Meta so the ad that started the conversation learns it worked. The whole loop, without a spreadsheet.",
    facts: [
      ["Couriers", "Steadfast · Pathao"],
      ["Invoice", "চালান, itemised"],
      ["Attribution", "Meta CAPI"],
    ],
    tint: "mint",
  },
] as const;

const TINT: Record<string, string> = {
  azure: "var(--azure)",
  iris: "var(--iris)",
  amber: "var(--amber)",
  signal: "var(--signal)",
  mint: "var(--mint)",
};

export default function Lifecycle() {
  const [active, setActive] = useState(0);
  const s = STAGES[active];

  return (
    <section id="lifecycle" className="relative border-t border-line py-24 lg:py-32">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <Reveal>
          <Eyebrow>One engine, five stages</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            Most tools stop at the reply.
            <span className="text-text-3"> This one keeps going until the parcel moves.</span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-12">
          {/* stage list */}
          <div className="flex gap-3 overflow-x-auto pb-2 lg:block lg:overflow-visible lg:pb-0">
            {STAGES.map((st, i) => {
              const on = i === active;
              return (
                <button
                  key={st.key}
                  onClick={() => setActive(i)}
                  className={cx(
                    "group relative w-full min-w-[210px] shrink-0 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 lg:min-w-0",
                    on ? "border-[color:var(--signal-line)] bg-surface" : "border-transparent hover:bg-surface/60"
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="stage-rail"
                      transition={SPRING}
                      className="absolute inset-y-2 -left-px w-[2px] rounded-full"
                      style={{ background: TINT[st.tint] }}
                    />
                  )}
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className="font-mono text-[11px] transition-colors"
                      style={{ color: on ? TINT[st.tint] : "var(--text-3)" }}
                    >
                      {st.n}
                    </span>
                    <span
                      className={cx(
                        "font-display text-[15px] font-medium tracking-tight transition-colors",
                        on ? "text-text" : "text-text-2 group-hover:text-text"
                      )}
                    >
                      {st.title}
                    </span>
                  </div>
                  <p className="mt-1.5 pl-[30px] text-[12.5px] leading-snug text-text-3 lg:pl-0">
                    {st.lead}
                  </p>
                </button>
              );
            })}
          </div>

          {/* detail card */}
          <Panel className="relative overflow-hidden p-7 lg:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-[0.14] blur-3xl transition-colors duration-500"
              style={{ background: TINT[s.tint] }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={SPRING_SOFT}
                className="relative"
              >
                <span
                  className="font-display text-[64px] font-semibold leading-none tracking-tighter opacity-25"
                  style={{ color: TINT[s.tint] }}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-[26px] font-semibold tracking-tight text-text">
                  {s.title}
                </h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-text-2">{s.lead}</p>
                <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-text-3">{s.detail}</p>

                <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                  {s.facts.map(([k, v]) => (
                    <div key={k} className="bg-surface px-4 py-3.5">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                        {k}
                      </dt>
                      <dd className="mt-1.5 text-[13.5px] font-medium text-text">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex items-center gap-2">
                  <Badge tone="neutral">
                    Console route ·{" "}
                    <span className="font-mono text-text-2">
                      /console/{s.key === "shipped" ? "fulfilment" : s.key === "matched" ? "catalog" : "pipeline"}
                    </span>
                  </Badge>
                </div>
              </motion.div>
            </AnimatePresence>
          </Panel>
        </div>
      </div>
    </section>
  );
}

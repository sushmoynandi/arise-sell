"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LiveDot } from "@/components/ui/primitives";
import { SPRING } from "@/components/motion";
import { cx } from "@/lib/format";

type Ev = { id: number; kind: string; text: string; meta: string; tone: string };

const POOL: Array<Omit<Ev, "id">> = [
  { kind: "order", text: "Order confirmed · Jamdani Saree · Indigo", meta: "Sumaiya I. · WhatsApp · ৳6,930", tone: "signal" },
  { kind: "match", text: "Photo matched to KK-L at 0.91", meta: "Instagram DM · Chattogram", tone: "iris" },
  { kind: "ship", text: "Steadfast consignment SF-7719088 created", meta: "NP-20449 · COD ৳3,060", tone: "mint" },
  { kind: "guard", text: "Escalated — discount above 5% requested", meta: "Guardrail: discount ceiling", tone: "amber" },
  { kind: "capi", text: "Purchase event accepted by Meta", meta: "match quality 9.1 · ৳5,030", tone: "signal" },
  { kind: "order", text: "Order confirmed · Cushion Set of 4 ×2", meta: "Farzana Y. · Web · ৳3,380", tone: "signal" },
  { kind: "reach", text: "Eid preview campaign · 118 replies", meta: "cp-11 · day 3 of 7", tone: "azure" },
  { kind: "feed", text: "Catalog sync complete — 41 updated, 6 out of stock", meta: "nokshi.com.bd · 3.1s", tone: "mint" },
  { kind: "guard", text: "Bulk order handed to Imran K.", meta: "৳188,000 · above ৳50k ceiling", tone: "amber" },
  { kind: "ship", text: "Pathao rider assigned", meta: "PT441902 · Kalabagan", tone: "mint" },
  { kind: "match", text: "Low confidence 0.61 — asked for a clearer photo", meta: "Messenger · Bogura", tone: "coral" },
  { kind: "order", text: "bKash advance received ৳500", meta: "COD risk playbook · Rajshahi", tone: "signal" },
];

const DOT: Record<string, string> = {
  signal: "bg-signal",
  mint: "bg-mint",
  amber: "bg-amber",
  coral: "bg-coral",
  iris: "bg-iris",
  azure: "bg-azure",
};

export default function LiveStream() {
  const [events, setEvents] = useState<Ev[]>(() =>
    POOL.slice(0, 6).map((e, i) => ({ ...e, id: i }))
  );

  useEffect(() => {
    let n = POOL.length;
    const tick = () => {
      setEvents((prev) => {
        const next = POOL[Math.floor(Math.random() * POOL.length)];
        return [{ ...next, id: n++ }, ...prev].slice(0, 8);
      });
    };
    const id = setInterval(tick, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="panel flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div className="flex items-center gap-2.5">
          <LiveDot />
          <h3 className="font-display text-[15px] font-semibold tracking-tight">Live stream</h3>
        </div>
        <span className="font-mono text-[10.5px] text-text-3">push · not polled</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden px-2 py-2">
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div
              key={e.id}
              layout
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
              transition={SPRING}
              className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-surface-2"
            >
              <span className={cx("mt-1.5 size-1.5 shrink-0 rounded-full", DOT[e.tone])} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] leading-snug text-text-2">{e.text}</p>
                <p className="mt-0.5 truncate font-mono text-[10.5px] text-text-3">{e.meta}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

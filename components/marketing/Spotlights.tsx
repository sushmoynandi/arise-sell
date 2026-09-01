"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SPOTLIGHTS } from "@/data/marketing";
import { Reveal, SPRING } from "@/components/motion";
import { IconCheck, IconTruck, IconWhatsApp } from "@/components/ui/icons";
import { cx } from "@/lib/format";
import { useLang } from "@/lib/i18n";

/* ---------------------------------------------------------------- visuals */

function ChatDemo() {
  const lines = [
    {
      me: false,
      text: "vaiya eita koto? amar 42 lagbe",
      gloss: "How much is this? I need size 42.",
    },
    { me: true, text: "খাদি কুর্তা ৳২,২৯০ 🌿 XL (৪২) আছে ৯ পিস।" },
    {
      me: false,
      text: "ঢাকার ভিতরে ডেলিভারি কত দিন?",
      gloss: "How many days for delivery in Dhaka?",
    },
    { me: true, text: "২৪ ঘণ্টার মধ্যে, চার্জ ৳৮০। নিবেন?" },
  ];
  return (
    <div className="space-y-2.5">
      {lines.map((l, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12, scale: 0.97 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ ...SPRING, delay: i * 0.12 }}
          className={cx("flex", l.me ? "justify-end" : "justify-start")}
        >
          <div className={cx("max-w-[82%]", l.me && "text-right")}>
            <div
              className={cx(
                "rounded-2xl px-3.5 py-2.5 text-left text-[13.5px] leading-relaxed",
                l.me
                  ? "rounded-tr-sm bg-signal font-(family-name:--font-hind) text-white"
                  : "rounded-tl-sm border border-line bg-white text-text",
              )}
            >
              {l.text}
            </div>
            {l.gloss && (
              <p className="mt-1 text-[11px] italic text-text-3">“{l.gloss}”</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function MatchDemo() {
  return (
    <div className="space-y-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={SPRING}
        className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3"
      >
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
          <Image
            src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=200&auto=format&fit=crop&q=60"
            alt="Customer's photo"
            fill
            sizes="64px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[12px] text-text-3">Customer sent</p>
          <p className="mt-0.5 font-(family-name:--font-hind) text-[13.5px] text-text">
            “এইটা আছে?”
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ ...SPRING, delay: 0.25 }}
        className="rounded-2xl border border-(--signal-line) bg-[#f2faf6] p-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-medium text-signal">
            Matched in your catalog
          </p>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-signal">
            96%
          </span>
        </div>
        <p className="mt-2 font-display text-[16px] font-semibold tracking-tight text-text">
          Khadi Cotton Kurta · XL
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["৳2,390", "9 in stock", "Free delivery"].map((c) => (
            <span
              key={c}
              className="rounded-full border border-line bg-white px-2.5 py-1 text-[11.5px] text-text-2"
            >
              {c}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function CourierDemo() {
  const rows = [
    ["Customer", "Nabila Hoque"],
    ["Phone", "017 1204 5590 ✓"],
    ["Address", "Sector 7, Uttara, Dhaka"],
    ["Collect (COD)", "৳3,060"],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={SPRING}
      className="overflow-hidden rounded-2xl border border-line bg-white shadow-[0_1px_2px_rgba(15,20,25,0.04)]"
    >
      <div className="flex items-center gap-3 border-b border-line bg-[#f2faf6] px-4 py-3">
        <span className="grid size-9 place-items-center rounded-xl bg-signal text-white">
          <IconTruck width={17} height={17} />
        </span>
        <div>
          <p className="text-[13.5px] font-semibold text-text">
            Steadfast · booked
          </p>
          <p className="text-[11.5px] text-text-3">Tracking SF-7719042</p>
        </div>
        <span className="ml-auto flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-signal">
          <IconCheck width={11} height={11} />
          Done
        </span>
      </div>
      <dl className="divide-y divide-[color:var(--line-soft)]">
        {rows.map(([k, v], i) => (
          <motion.div
            key={k}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ ...SPRING, delay: 0.1 + i * 0.07 }}
            className="flex items-center justify-between gap-4 px-4 py-2.5"
          >
            <dt className="text-[12.5px] text-text-3">{k}</dt>
            <dd className="text-[13px] font-medium text-text">{v}</dd>
          </motion.div>
        ))}
      </dl>
      <div className="flex items-center gap-2 border-t border-line bg-surface-2 px-4 py-2.5">
        <IconWhatsApp width={13} height={13} className="text-signal" />
        <p className="text-[11.5px] text-text-2">
          Tracking code sent to the customer in chat
        </p>
      </div>
    </motion.div>
  );
}

const DEMOS = { chat: ChatDemo, match: MatchDemo, courier: CourierDemo };

/* ---------------------------------------------------------------- section */

export default function Spotlights() {
  const { t } = useLang();

  return (
    <section className="relative border-t border-line bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl space-y-20 px-5 lg:space-y-28 lg:px-8">
        {SPOTLIGHTS.map((s, i) => {
          const Demo = DEMOS[s.demo];
          const flip = i % 2 === 1;
          const points = t(s.points, s.pointsBn ?? s.points);

          return (
            <div
              key={s.title}
              className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16"
            >
              <Reveal className={cx(flip && "lg:order-2")}>
                <p className="font-(family-name:--font-hind) text-[15px] font-medium text-signal">
                  {s.kicker}
                </p>
                <h3 className="mt-3 text-balance font-display text-[clamp(1.6rem,3vw,2.3rem)] font-semibold leading-[1.12] tracking-[-0.025em]">
                  {t(s.title, s.titleBn)}
                </h3>
                <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-text-2">
                  {t(s.body, s.bodyBn)}
                </p>
                <ul className="mt-6 space-y-3">
                  {points.map((p: string) => (
                    <li key={p} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#e6f4ee] text-signal">
                        <IconCheck width={11} height={11} />
                      </span>
                      <span className="text-[14.5px] leading-snug text-text-2">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal delay={0.1} className={cx(flip && "lg:order-1")}>
                <div className="rounded-3xl border border-line bg-canvas p-5 lg:p-7">
                  <Demo />
                </div>
              </Reveal>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import LiveClose from "./LiveClose";
import { Button, Eyebrow, LiveDot } from "@/components/ui/primitives";
import { IconArrow } from "@/components/ui/icons";
import { Counter, Magnetic, SPRING_SOFT, SplitWords } from "@/components/motion";
import { MERCHANTS } from "@/data/tenant";
import { Marquee } from "@/components/motion";

const PROOF = [
  { value: 231400, prefix: "৳", label: "closed in the last 24h", compact: true },
  { value: 1.9, suffix: "m", label: "median time to order", decimals: 1 },
  { value: 93.6, suffix: "%", label: "handled without a human", decimals: 1 },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-28 lg:pb-28 lg:pt-36">
      <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-50 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(10,110,80,0.10), transparent 68%)" }}
      />

      <div className="relative mx-auto grid grid-cols-1 max-w-[1180px] items-center gap-14 px-5 lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)] lg:gap-16 lg:px-8">
        {/* ---- copy ---- */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={SPRING_SOFT}
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/80 py-1.5 pl-2.5 pr-3.5"
          >
            <LiveDot />
            <span className="text-[12.5px] text-text-2">
              Now billing on <span className="text-text">closed orders</span>, not conversations
            </span>
          </motion.div>

          <h1 className="font-display text-[clamp(2.4rem,5.4vw,3.9rem)] font-semibold leading-[1.03] tracking-[-0.03em] text-text">
            <SplitWords text="Your inbox is your" />
            <br />
            <SplitWords text="best salesperson." delay={0.16} />
            <br />
            <motion.span
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ ...SPRING_SOFT, delay: 0.42 }}
              className="text-text-3"
            >
              It just never sleeps now.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.55 }}
            className="mt-6 max-w-[30rem] text-pretty text-[16.5px] leading-relaxed text-text-2"
          >
            NextProduct reads the Bangla, matches the screenshot to a real SKU, takes the address,
            books Steadfast or Pathao and files the invoice — end to end, before your competitor has
            opened their laptop.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...SPRING_SOFT, delay: 0.66 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Button href="/console" size="lg" className="group">
                See it running
                <IconArrow
                  width={16}
                  height={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Button>
            </Magnetic>
            <Magnetic strength={0.2}>
              <Button href="/pricing" size="lg" variant="outline">
                40 free orders
              </Button>
            </Magnetic>
          </motion.div>

          {/* proof numbers */}
          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.5 }}
            className="mt-11 grid max-w-lg grid-cols-3 gap-5 border-t border-line pt-6"
          >
            {PROOF.map((p) => (
              <div key={p.label}>
                <dt className="font-display text-[22px] font-semibold tracking-tight text-text">
                  {p.compact ? (
                    <>
                      ৳<Counter to={231.4} decimals={1} />k
                    </>
                  ) : (
                    <Counter
                      to={p.value}
                      prefix={p.prefix ?? ""}
                      suffix={p.suffix ?? ""}
                      decimals={p.decimals ?? 0}
                    />
                  )}
                </dt>
                <dd className="mt-1 text-[12px] leading-snug text-text-3">{p.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        {/* ---- live simulation ---- */}
        <LiveClose />
      </div>

      {/* merchant rail */}
      <div className="relative mt-24 lg:mt-28">
        <div className="mx-auto mb-5 max-w-[1180px] px-5 lg:px-8">
          <Eyebrow>Running the inbox at</Eyebrow>
        </div>
        <Marquee>
          {MERCHANTS.map((m, i) => (
            <span
              key={`${m}-${i}`}
              className="flex items-center gap-3 whitespace-nowrap px-6 font-display text-[17px] font-medium text-text-2"
            >
              {m}
              <span className="size-1 rounded-full bg-line" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

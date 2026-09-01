"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HERO_SCRIPT } from "@/data/threads";
import { SPRING, SPRING_POP, SPRING_SOFT } from "@/components/motion";
import { IconCheck, IconTruck, IconWhatsApp } from "@/components/ui/icons";
import { cx } from "@/lib/format";

const RAIL = [
  "Listening",
  "Matched",
  "Details",
  "Confirmed",
  "Shipped",
] as const;

/** Which rail step each script line completes. */
const STEP_AT = [0, 1, 2, 3, 4];

export default function LiveClose() {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shown >= HERO_SCRIPT.length) {
      const restart = setTimeout(() => setShown(0), 5200);
      return () => clearTimeout(restart);
    }
    const line = HERO_SCRIPT[shown];
    const isAgent = line.from === "agent";
    let t2: ReturnType<typeof setTimeout>;

    const t1 = setTimeout(() => {
      if (isAgent) {
        setTyping(true);
        t2 = setTimeout(() => {
          setTyping(false);
          setShown((s) => s + 1);
        }, 800);
      } else {
        setShown((s) => s + 1);
      }
    }, line.delay);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [shown]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [shown, typing]);

  const step =
    shown === 0 ? 0 : STEP_AT[Math.min(shown - 1, STEP_AT.length - 1)];
  const done = shown >= HERO_SCRIPT.length;

  return (
    <div className="relative">
      {/* soft wash behind the device */}
      <div
        aria-hidden
        className="anim-aurora pointer-events-none absolute -inset-16 -z-10 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(38% 44% at 62% 28%, rgba(10,110,80,0.16), transparent 70%), radial-gradient(40% 40% at 28% 72%, rgba(5,98,68,0.12), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 26, rotateX: 6 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ ...SPRING_SOFT, delay: 0.35 }}
        style={{ transformPerspective: 1400 }}
        className="panel-raised relative overflow-hidden"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-full bg-mint/12 text-mint">
              <IconWhatsApp width={14} height={14} />
            </span>
            <div className="leading-tight">
              <p className="text-[13px] font-medium text-text">
                Nokshi &amp; Co.
              </p>
              <p className="font-mono text-[10.5px] text-text-3">
                WhatsApp · +880 1710
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-(--signal-line) bg-signal-wash px-2 py-0.75 font-mono text-[10px] text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            AGENT LIVE
          </span>
        </div>

        {/* transcript */}
        <div
          ref={scrollRef}
          className="h-[302px] space-y-2.5 overflow-y-auto scroll-smooth bg-canvas px-4 py-4"
        >
          <AnimatePresence initial={false}>
            {HERO_SCRIPT.slice(0, shown).map((m, i) => (
              <motion.div
                key={`${i}-${m.body.slice(0, 8)}`}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={SPRING}
                className={cx(
                  "flex",
                  m.from === "agent" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cx(
                    "max-w-[85%]",
                    m.from === "agent" && "text-right",
                  )}
                >
                  <div
                    className={cx(
                      "rounded-2xl px-3.5 py-2.5 text-left text-[13px] leading-relaxed",
                      m.from === "agent"
                        ? "rounded-tr-sm bg-signal text-signal-ink"
                        : "rounded-tl-sm border border-line bg-surface text-text",
                    )}
                  >
                    <span
                      className={
                        m.from === "agent"
                          ? "font-(family-name:--font-hind)"
                          : ""
                      }
                    >
                      {m.body}
                    </span>
                  </div>
                  {m.gloss && (
                    <p className="mt-1 pr-1 text-[11px] italic text-text-3">
                      “{m.gloss}”
                    </p>
                  )}
                  {m.chip && (
                    <motion.p
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...SPRING, delay: 0.25 }}
                      className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-signal-wash px-2 py-1 font-mono text-[10px] text-signal"
                    >
                      <IconCheck width={10} height={10} />
                      {m.chip}
                    </motion.p>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {typing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={SPRING_POP}
              className="flex justify-end"
            >
              <span className="anim-typing flex items-center gap-1 rounded-2xl rounded-tr-sm border border-line bg-surface px-4 py-3.5">
                <span className="size-1.5 rounded-full bg-text-3" />
                <span className="size-1.5 rounded-full bg-text-3" />
                <span className="size-1.5 rounded-full bg-text-3" />
              </span>
            </motion.div>
          )}
        </div>

        {/* stage rail */}
        <div className="border-t border-line bg-surface px-4 py-3.5">
          <div className="flex items-center justify-between gap-1">
            {RAIL.map((label, i) => {
              const active = i <= step && shown > 0;
              return (
                <div key={label} className="flex flex-1 items-center gap-1.5">
                  <div className="flex flex-col items-center gap-1.5">
                    <motion.span
                      animate={
                        active
                          ? { scale: 1, backgroundColor: "var(--signal)" }
                          : { scale: 0.72, backgroundColor: "var(--surface-3)" }
                      }
                      transition={SPRING_POP}
                      className="grid size-4 place-items-center rounded-full"
                    >
                      {active && (
                        <IconCheck
                          width={9}
                          height={9}
                          className="text-signal-ink"
                        />
                      )}
                    </motion.span>
                    <span
                      className={cx(
                        "text-[9.5px] font-medium transition-colors duration-300",
                        active ? "text-text" : "text-text-3",
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  {i < RAIL.length - 1 && (
                    <div className="mb-4 h-px flex-1 overflow-hidden bg-surface-3">
                      <motion.div
                        className="h-full bg-signal"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: i < step ? 1 : 0 }}
                        style={{ originX: 0 }}
                        transition={{ ...SPRING_SOFT, delay: 0.1 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* receipt card that pops on completion */}
      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.9, rotate: -3 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotate: -2.5 }}
            exit={{ opacity: 0, y: 10, scale: 0.94 }}
            transition={SPRING_POP}
            className="panel-raised absolute -bottom-7 -right-4 w-[220px] p-3.5 shadow-lg lg:-right-10"
          >
            <div className="flex items-center gap-2">
              <span className="grid size-7 place-items-center rounded-lg bg-signal text-signal-ink">
                <IconTruck width={15} height={15} />
              </span>
              <div className="leading-tight">
                <p className="font-mono text-[10px] text-text-3">STEADFAST</p>
                <p className="text-[12.5px] font-medium text-text">
                  SF-7719042
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1 border-t border-line pt-2.5 font-mono text-[10.5px]">
              <div className="flex justify-between text-text-3">
                <span>Order</span>
                <span className="text-text-2">NP-20447</span>
              </div>
              <div className="flex justify-between text-text-3">
                <span>COD</span>
                <span className="text-signal">৳5,480</span>
              </div>
              <div className="flex justify-between text-text-3">
                <span>Elapsed</span>
                <span className="text-text-2">1m 48s</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

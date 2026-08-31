"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

type Item = { q: string; a: string; qBn?: string; aBn?: string };

export default function Faq({ items }: { items: readonly Item[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const { t } = useLang();

  return (
    <div className="divide-y divide-[color:var(--line)] border-y border-line">
      {items.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q}>
            <button
              onClick={() => setOpen(on ? null : i)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left"
              aria-expanded={on}
            >
              <span
                className={cx(
                  "font-display text-[16.5px] font-medium tracking-tight transition-colors",
                  on ? "text-signal" : "text-text"
                )}
              >
                {t(f.q, f.qBn ?? f.q)}
              </span>
              <motion.span
                animate={{ rotate: on ? 45 : 0 }}
                transition={SPRING}
                className="grid size-6 shrink-0 place-items-center rounded-full border border-line text-text-3"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 5v14M5 12h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={SPRING_SOFT}
                  className="overflow-hidden"
                >
                  <p className="max-w-2xl pb-6 pr-10 text-[14.5px] leading-relaxed text-text-2">
                    {t(f.a, f.aBn ?? f.a)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

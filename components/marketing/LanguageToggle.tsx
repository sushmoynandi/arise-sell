"use client";

import { motion } from "framer-motion";
import { useLang, type Lang } from "@/lib/i18n";
import { SPRING } from "@/components/motion";
import { cx } from "@/lib/format";

const OPTIONS: Array<{ id: Lang; label: string; full: string }> = [
  { id: "en", label: "EN", full: "English" },
  { id: "bn", label: "বাংলা", full: "Bangla" },
];

export default function LanguageToggle({
  size = "md",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const { lang, setLang } = useLang();

  return (
    <div
      role="group"
      aria-label="Language"
      className={cx(
        "relative inline-flex items-center rounded-full border border-line bg-surface-2 p-0.5",
        className
      )}
    >
      {OPTIONS.map((o) => {
        const on = lang === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setLang(o.id)}
            aria-pressed={on}
            aria-label={`Switch to ${o.full}`}
            className={cx(
              "relative rounded-full transition-colors duration-200",
              size === "sm" ? "px-2.5 py-1 text-[11.5px]" : "px-3 py-1.5 text-[12.5px]",
              o.id === "bn" && "font-[family-name:var(--font-hind)]",
              on ? "text-white" : "text-text-2 hover:text-text"
            )}
          >
            {on && (
              <motion.span
                layoutId="lang-pill"
                transition={SPRING}
                className="absolute inset-0 -z-10 rounded-full bg-signal"
              />
            )}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

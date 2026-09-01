"use client";

import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

export default function LanguageToggle({
  size = "sm",
  className,
}: {
  size?: "sm" | "md";
  className?: string;
}) {
  const { lang, setLang } = useLang();
  const isBn = lang === "bn";

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={cx(
        "relative grid grid-cols-2 items-center rounded-full border border-line bg-surface/90 p-0.5 select-none shadow-2xs backdrop-blur-md",
        size === "sm" ? "h-7.75 w-19" : "h-9 w-22.5",
        className,
      )}
    >
      {/* Symmetrical sliding active pill */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-signal shadow-2xs transition-transform duration-200 ease-out pointer-events-none",
          isBn ? "translate-x-full" : "translate-x-0",
        )}
      />

      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={!isBn}
        aria-label="Switch to English"
        className={cx(
          "relative z-10 flex h-full w-full items-center justify-center rounded-full font-bold font-mono transition-colors duration-150 cursor-pointer text-center",
          size === "sm" ? "text-[11.5px]" : "text-[13px]",
          !isBn ? "text-white" : "text-text-3 hover:text-text",
        )}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => setLang("bn")}
        aria-pressed={isBn}
        aria-label="Switch to Bangla"
        className={cx(
          "relative z-10 flex h-full w-full items-center justify-center rounded-full font-bold transition-colors duration-150 cursor-pointer font-(family-name:--font-hind) text-center",
          size === "sm" ? "text-[12px]" : "text-[13.5px]",
          isBn ? "text-white" : "text-text-3 hover:text-text",
        )}
      >
        বাংলা
      </button>
    </div>
  );
}

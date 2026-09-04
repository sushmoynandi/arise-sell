"use client";

import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

export default function LanguageToggle({
  size = "sm",
  variant,
  className,
}: {
  size?: "sm" | "md" | "console";
  variant?: "signal" | "subtle";
  className?: string;
}) {
  const { lang, setLang } = useLang();
  const isBn = lang === "bn";
  const isSubtle = variant ? variant === "subtle" : size === "console";

  return (
    <div
      role="group"
      aria-label="Language selector"
      className={cx(
        "relative grid grid-cols-2 items-center rounded-full border border-line select-none shadow-2xs",
        isSubtle
          ? "bg-surface-2/90 p-0.5"
          : "bg-surface/90 p-0.5 backdrop-blur-md",
        size === "console"
          ? "h-8 w-19"
          : size === "sm"
            ? "h-10 w-21"
            : "h-10 w-22.5",
        className,
      )}
    >
      {/* Symmetrical sliding active pill */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full transition-transform duration-200 ease-out pointer-events-none",
          isSubtle
            ? "bg-surface shadow-xs border border-line/60"
            : "bg-signal shadow-2xs",
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
          size === "console"
            ? "text-[11px]"
            : size === "sm"
              ? "text-[12px]"
              : "text-[13px]",
          !isBn
            ? isSubtle
              ? "text-text"
              : "text-white"
            : "text-text-3 hover:text-text",
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
          size === "console"
            ? "text-[11.5px]"
            : size === "sm"
              ? "text-[13px]"
              : "text-[13.5px]",
          isBn
            ? isSubtle
              ? "text-text"
              : "text-white"
            : "text-text-3 hover:text-text",
        )}
      >
        বাংলা
      </button>
    </div>
  );
}

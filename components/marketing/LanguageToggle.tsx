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
        "relative inline-flex items-center rounded-full border border-signal/[0.14] bg-signal/[0.035] p-[2px] select-none shadow-[inset_0_1px_2px_rgba(10,110,80,0.04),0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md",
        size === "sm" ? "h-[30px]" : "h-[36px]",
        className,
      )}
    >
      {/* Smooth sliding pill indicator */}
      <span
        aria-hidden="true"
        className={cx(
          "absolute top-[2px] bottom-[2px] w-[calc(50%-2px)] rounded-full bg-gradient-to-b from-[#0c7855] to-[#07593f] shadow-[0_1px_4px_rgba(10,110,80,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-transform duration-200 ease-out pointer-events-none",
          isBn ? "translate-x-[calc(100%+2px)]" : "translate-x-0",
        )}
      />

      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={!isBn}
        aria-label="Switch to English"
        className={cx(
          "relative z-10 flex items-center justify-center rounded-full font-semibold transition-colors duration-150 cursor-pointer",
          size === "sm"
            ? "px-2.5 py-0.5 text-[11.5px] min-w-[34px]"
            : "px-3.5 py-1 text-[12.5px] min-w-[44px]",
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
          "relative z-10 flex items-center justify-center rounded-full font-semibold transition-colors duration-150 cursor-pointer font-[family-name:var(--font-hind)]",
          size === "sm"
            ? "px-2.5 py-0.5 text-[11.5px] min-w-[34px]"
            : "px-3.5 py-1 text-[12.5px] min-w-[44px]",
          isBn ? "text-white" : "text-text-3 hover:text-text",
        )}
      >
        বাংলা
      </button>
    </div>
  );
}

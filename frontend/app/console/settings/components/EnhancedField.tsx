import React from "react";
import { cx } from "@/lib/format";

export function EnhancedField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  icon,
  prefix,
  badge,
  badgeTone = "mint",
  actionButton,
  helper,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  icon?: React.ReactNode;
  prefix?: string;
  badge?: string;
  badgeTone?: "mint" | "neutral" | "signal";
  actionButton?: React.ReactNode;
  helper?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-text flex items-center gap-1.5">
          {label}
        </label>
        {badge && (
          <span
            className={cx(
              "text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold",
              badgeTone === "mint" &&
                "bg-mint/10 text-mint border border-mint/20",
              badgeTone === "neutral" &&
                "bg-surface-2 text-text-3 border border-line",
              badgeTone === "signal" &&
                "bg-signal/10 text-signal border border-signal/20",
            )}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="relative flex items-center rounded-xl border border-line/80 bg-white shadow-2xs focus-within:border-signal focus-within:ring-2 focus-within:ring-signal/15 transition-all">
        {icon && (
          <span className="pl-3 text-text-3 flex items-center justify-center shrink-0">
            {icon}
          </span>
        )}
        {prefix && (
          <span className="pl-2.5 text-xs text-text-3 font-mono font-medium select-none shrink-0">
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cx(
            "w-full bg-transparent px-3 py-2.5 text-[13px] text-text placeholder:text-text-3/60 outline-hidden font-normal",
            disabled && "bg-surface-2/40 text-text-3 cursor-not-allowed",
          )}
        />
        {actionButton && <div className="pr-2 shrink-0">{actionButton}</div>}
      </div>
      {helper && (
        <p className="text-[11px] text-text-3 leading-snug">{helper}</p>
      )}
    </div>
  );
}

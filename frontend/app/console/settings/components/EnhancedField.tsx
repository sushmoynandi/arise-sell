import React from "react";
import { cx } from "@/lib/format";

export function EnhancedField({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
  autoComplete,
  icon,
  prefix,
  badge,
  badgeTone = "mint",
  actionButton,
  helper,
  required,
}: {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
  prefix?: string;
  badge?: string;
  badgeTone?: "mint" | "neutral" | "signal";
  actionButton?: React.ReactNode;
  helper?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="text-xs font-bold text-text flex items-center gap-1.5 select-none"
        >
          <span>{label}</span>
          {required && (
            <span className="text-signal font-mono text-[11px]">*</span>
          )}
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
      <div
        className={cx(
          "relative flex items-center rounded-xl border transition-all shadow-2xs",
          disabled
            ? "bg-surface-2/60 border-line/70 cursor-not-allowed opacity-80"
            : "bg-white border-line/80 focus-within:border-signal focus-within:ring-2 focus-within:ring-signal/15",
        )}
      >
        {icon && (
          <span className="pl-3.5 pr-1 text-text-3 flex items-center justify-center shrink-0 pointer-events-none">
            {icon}
          </span>
        )}
        {prefix && (
          <span className="pl-3 pr-1 text-xs text-text-3 font-mono font-medium select-none shrink-0 pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={cx(
            "w-full bg-transparent py-2.5 text-[13px] text-text placeholder:text-text-3/60 font-normal outline-none focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 border-none shadow-none",
            icon || prefix ? "pl-2 pr-3.5" : "px-3.5",
            disabled && "cursor-not-allowed text-text-3",
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

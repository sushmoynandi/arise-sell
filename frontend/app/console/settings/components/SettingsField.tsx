import React from "react";
import { cx } from "@/lib/format";

export function SettingsField({
  label,
  value,
  onChange,
  disabled,
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-text mb-1.5">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className={cx(
          "w-full rounded-xl border border-line px-3 py-2.5 text-[13px] outline-none transition-colors",
          disabled
            ? "bg-surface-2/60 text-text-3 cursor-not-allowed"
            : "bg-white text-text focus:border-signal",
        )}
      />
    </div>
  );
}

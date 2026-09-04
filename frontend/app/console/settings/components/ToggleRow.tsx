import React from "react";
import { cx } from "@/lib/format";

export function ToggleRow({
  label,
  desc,
  value,
  onToggle,
}: {
  label: string;
  desc: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <div className="p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-bold text-text">{label}</p>
        <p className="text-xs text-text-3 mt-0.5">{desc}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(!value)}
        className={cx(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors cursor-pointer",
          value ? "bg-signal" : "bg-surface-3",
        )}
      >
        <span
          className={cx(
            "size-5 rounded-full bg-white transition-transform shadow-xs",
            value ? "translate-x-5" : "",
          )}
        />
      </button>
    </div>
  );
}

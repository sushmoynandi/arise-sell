import React from "react";

export function QuotaBar({
  label,
  used,
  total,
}: {
  label: string;
  used: number;
  total: number;
}) {
  const pct = Math.round((used / total) * 100);
  return (
    <div className="rounded-xl bg-surface-2/60 border border-line/60 p-4 space-y-2">
      <div className="flex justify-between text-xs">
        <span className="font-bold text-text">{label}</span>
        <span className="font-mono font-bold text-signal">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full bg-signal rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-text-3 font-mono pt-1">
        <span>{used.toLocaleString()} used</span>
        <span>{total.toLocaleString()} total</span>
      </div>
    </div>
  );
}

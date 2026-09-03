"use client";

import { cx } from "@/lib/format";
import { ActivePeriodData, MonthItem } from "../types";

interface CalendarFilterBarProps {
  activePeriodData: ActivePeriodData;
  isYearly: boolean;
  selectedYear: number;
  effectiveMonthNum: number;
  operatingMonths: MonthItem[];
  activeMonthName: string;
  onSetCadence: (mode: "monthly" | "yearly") => void;
  onSetYear: (year: number) => void;
  onSetMonth: (month: number) => void;
}

export function CalendarFilterBar({
  activePeriodData,
  isYearly,
  selectedYear,
  effectiveMonthNum,
  operatingMonths,
  activeMonthName,
  onSetCadence,
  onSetYear,
  onSetMonth,
}: CalendarFilterBarProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5 sm:p-4 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
        {/* Left: Reporting Period Summary */}
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-text font-mono uppercase tracking-wide">
              Reporting Horizon:
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-signal/8 px-2.5 py-0.5 text-[12px] font-bold text-signal font-mono">
              <span className="size-1.5 rounded-full bg-signal" />
              {activePeriodData.periodName}
            </span>
          </div>
          <p className="text-[12.5px] text-text-3 mt-0.5">
            {isYearly
              ? `Full annual sales (sum of 12 months after deducting promo discounts) for ${selectedYear}`
              : `Net sales collected (monthly subs + yearly packages minus promo discounts) for ${activeMonthName} ${selectedYear}`}
          </p>
        </div>

        {/* Right: Calendar Dropdowns + Cadence Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* 1. Cadence Segmented Pill (Monthly vs Yearly) */}
          <div className="inline-flex items-center rounded-xl border border-line bg-surface-2/70 p-0.5 text-[12px] font-semibold font-mono shadow-2xs">
            <button
              type="button"
              onClick={() => onSetCadence("monthly")}
              className={cx(
                "rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                !isYearly
                  ? "bg-white text-text shadow-2xs border border-line/80 font-bold"
                  : "text-text-3 hover:text-text",
              )}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => onSetCadence("yearly")}
              className={cx(
                "rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                isYearly
                  ? "bg-white text-text shadow-2xs border border-line/80 font-bold"
                  : "text-text-3 hover:text-text",
              )}
            >
              Yearly
            </button>
          </div>

          {/* 2. Calendar Year Select Field */}
          <div className="relative flex items-center">
            <select
              value={selectedYear}
              onChange={(e) => onSetYear(Number(e.target.value))}
              className="appearance-none rounded-xl bg-white border border-line pl-3 pr-7 py-1.5 text-[13px] font-semibold text-text focus:border-signal outline-none cursor-pointer shadow-2xs hover:border-line-2 transition-colors h-9"
            >
              <option value={2026}>2026</option>
              <option value={2025}>2025</option>
            </select>
            <span className="absolute right-2.5 text-text-3 text-[10px] pointer-events-none font-mono font-bold">
              ▾
            </span>
          </div>

          {/* 3. Calendar Month Select Field (Visible when Monthly is active) */}
          {!isYearly && (
            <div className="relative flex items-center">
              <select
                value={effectiveMonthNum}
                onChange={(e) => onSetMonth(Number(e.target.value))}
                className="appearance-none rounded-xl bg-white border border-line pl-3 pr-7 py-1.5 text-[13px] font-semibold text-text focus:border-signal outline-none cursor-pointer shadow-2xs hover:border-line-2 transition-colors h-9"
              >
                {operatingMonths.map((m) => (
                  <option key={m.num} value={m.num}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span className="absolute right-2.5 text-text-3 text-[10px] pointer-events-none font-mono font-bold">
                ▾
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

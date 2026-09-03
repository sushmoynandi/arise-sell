"use client";

import { formatTaka } from "@/lib/format";
import { ActivePeriodData } from "../types";
import { PLATFORM_LIFETIME_REVENUE_BDT } from "../data/sales-snapshots";

interface RevenueKpiGridProps {
  activePeriodData: ActivePeriodData;
  isYearly: boolean;
  selectedYear: number;
  activeMonthName: string;
}

export function RevenueKpiGrid({
  activePeriodData,
  isYearly,
  selectedYear,
  activeMonthName,
}: RevenueKpiGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Card 1: Platform Total Lifetime Revenue */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
            Total Platform Sales
          </span>
          <span className="rounded-md bg-signal/8 px-2 py-0.5 text-[10.5px] font-bold text-signal font-mono">
            Lifetime Net
          </span>
        </div>
        <p className="mt-2 text-[28px] font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
          {formatTaka(PLATFORM_LIFETIME_REVENUE_BDT)}
        </p>
        <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
          <span className="text-text-3">Feb 2025 – Present</span>
          <span className="text-signal font-semibold">
            সর্বমোট অর্জিত নেট সেল
          </span>
        </div>
      </div>

      {/* Card 2: Selected Period Net Sales (Gross minus Promo Discount) */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
            {isYearly
              ? `${selectedYear} Net Sales`
              : `${activeMonthName} Net Sales`}
          </span>
          <span className="rounded-md bg-signal/8 px-2 py-0.5 text-[10.5px] font-bold text-signal font-mono">
            {activePeriodData.growthLabel}
          </span>
        </div>
        <p className="mt-2 text-[28px] font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
          {formatTaka(activePeriodData.totalRevenue)}
        </p>
        <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
          <span className="text-text-3">
            Gross: {formatTaka(activePeriodData.grossRevenue)}
          </span>
          <span className="text-signal font-semibold font-mono">
            (Promo: -{formatTaka(activePeriodData.promoDiscountBDT)})
          </span>
        </div>
      </div>

      {/* Card 3: Active Merchants in this Selected Month/Year */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
            Active Merchants
          </span>
          <span className="rounded-md bg-surface-2 text-text-3 px-2 py-0.5 text-[10.5px] font-bold font-mono">
            {isYearly ? `${selectedYear} Cohort` : activeMonthName}
          </span>
        </div>
        <p className="mt-2 text-[28px] font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
          {activePeriodData.totalMerchants}{" "}
          <span className="text-[15px] text-text-3 font-normal font-sans">
            Stores
          </span>
        </p>
        <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
          <span className="text-text-3">
            {activePeriodData.totalPaid} Paid ·{" "}
            {activePeriodData.trialMerchants} Trial
          </span>
          <span className="text-signal font-semibold">100% সচল</span>
        </div>
      </div>

      {/* Card 4: Billing Success Rate & Promo Redemptions */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
        <div className="flex items-start justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
            Billing &amp; Promo Status
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/8 px-2.5 py-0.5 text-[10.5px] font-bold text-signal font-mono">
            <span className="size-1.5 rounded-full bg-signal" />
            99.4%
          </span>
        </div>
        <p className="mt-2 text-[28px] font-bold text-signal font-(family-name:--font-bricolage) tracking-tight">
          99.4%
        </p>
        <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
          <span className="text-text-3">
            🏷️ {activePeriodData.promoCount} Promos Applied
          </span>
          <span className="text-amber-800 font-semibold font-mono">
            -{formatTaka(activePeriodData.promoDiscountBDT)}
          </span>
        </div>
      </div>
    </div>
  );
}

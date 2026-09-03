"use client";

import { formatTaka, cx } from "@/lib/format";
import { ActivePeriodData } from "../types";

interface PlanBreakdownGridProps {
  activePeriodData: ActivePeriodData;
  isYearly: boolean;
}

export function PlanBreakdownGrid({
  activePeriodData,
  isYearly,
}: PlanBreakdownGridProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs space-y-4">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-3.5">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[16px] font-bold text-text">
              Subscription Plan Breakdown ({activePeriodData.periodName})
            </h2>
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-300/70 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-900">
              🏷️ {activePeriodData.promoCount} Promos Applied · -
              {formatTaka(activePeriodData.promoDiscountBDT)}
            </span>
          </div>
          <p className="text-[12.5px] text-text-3 mt-0.5">
            Net sales collected per plan after deducting promo discounts for{" "}
            {activePeriodData.periodName}.
          </p>
        </div>

        <div className="text-[12.5px] font-mono text-text-3">
          <span>Net Period Sales:</span>{" "}
          <strong className="text-text font-bold text-[14px]">
            {formatTaka(activePeriodData.totalRevenue)}
          </strong>
          <span className="text-text-3 font-normal ml-0.5">
            {isYearly ? "/ yr" : "/ mo"}
          </span>
        </div>
      </div>

      {/* ─── Plan Cards Grid (Responsive for all commercial plans) ─── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {activePeriodData.planCards.map((plan) => {
          const storeShare = (
            (plan.totalStores / (activePeriodData.totalMerchants || 1)) *
            100
          ).toFixed(1);
          const revenueShare = plan.isFree
            ? "0.0"
            : (
                (plan.revenueValue / (activePeriodData.totalRevenue || 1)) *
                100
              ).toFixed(1);

          return (
            <div
              key={plan.id}
              className={cx(
                "rounded-xl border p-4.5 flex flex-col justify-between transition-all min-h-[235px]",
                plan.popular
                  ? "border-signal/50 ring-1 ring-signal/15 bg-white shadow-2xs"
                  : plan.isCustom
                    ? "border-line bg-gradient-to-b from-surface-2/60 via-white to-surface-2/40 hover:bg-white hover:shadow-xs"
                    : "border-line bg-canvas hover:bg-white hover:shadow-xs",
              )}
            >
              <div className="space-y-3">
                {/* Title & Badge */}
                <div className="flex items-start justify-between min-h-[36px]">
                  <div>
                    <span className="font-bold text-text text-[14.5px] block leading-tight">
                      {plan.name}
                    </span>
                    {plan.nameBn && (
                      <span className="text-[11px] text-text-3 font-mono">
                        {plan.nameBn}
                      </span>
                    )}
                  </div>
                  {plan.badge && (
                    <span
                      className={cx(
                        "rounded px-1.5 py-0.5 text-[9.5px] font-bold font-mono shrink-0",
                        plan.popular
                          ? "bg-signal text-white"
                          : "bg-surface-2 text-text-2 border border-line",
                      )}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Pricing Rates & Quota */}
                <div className="border-t border-line/60 pt-2 space-y-1">
                  {plan.isFree ? (
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="font-bold text-text text-[16.5px] font-(family-name:--font-bricolage)">
                          ৳০
                        </span>
                        <span className="text-[10.5px] text-text-3 font-mono">
                          Free Forever
                        </span>
                      </div>
                      <span className="text-[11px] text-text-3 block font-mono">
                        {plan.messageLimit?.toLocaleString()} Messages / mo
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-baseline justify-between">
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-text text-[16px] font-(family-name:--font-bricolage)">
                            {formatTaka(plan.monthlyRate)}
                          </span>
                          <span className="text-[10.5px] text-text-3 font-mono">
                            / mo
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-text-2 text-[11.5px] font-mono">
                            {formatTaka(plan.yearlyRate)}
                          </span>
                          <span className="text-[9.5px] text-text-3 font-mono">
                            {" "}
                            / yr
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] text-text-3 block font-mono">
                        {plan.messageLimit?.toLocaleString()} Messages / mo
                      </span>
                    </div>
                  )}
                </div>

                {/* Subscriber Counts & Promo Breakdown */}
                <div className="pt-2 border-t border-line/40 text-[11px] font-mono space-y-1 bg-surface-2/30 p-2 rounded-lg">
                  {plan.isFree ? (
                    <>
                      <div className="flex items-center justify-between text-text">
                        <span className="text-text-3">Trial Active:</span>
                        <span className="font-bold font-(family-name:--font-bricolage) text-[13px] text-text">
                          {plan.totalStores}{" "}
                          <span className="text-[10.5px] text-text-3 font-normal">
                            Stores
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[10.5px] text-text-3">
                        <span>Free Quota Given:</span>
                        <span className="font-semibold font-mono text-text">
                          {(
                            plan.totalStores * plan.messageLimit
                          ).toLocaleString()}{" "}
                          Messages
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between text-text">
                        <span className="text-text-3">Monthly Plan:</span>
                        <span className="font-bold font-(family-name:--font-bricolage) text-[13px] text-text">
                          {plan.monthlySubs}{" "}
                          <span className="text-[10.5px] text-text-3 font-normal">
                            Stores
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-text">
                        <span className="text-text-3">Yearly Plan:</span>
                        <span className="font-bold font-(family-name:--font-bricolage) text-[13px] text-signal">
                          {plan.yearlySubs}{" "}
                          <span className="text-[10.5px] text-text-3 font-normal">
                            Sold
                          </span>
                        </span>
                      </div>
                      {plan.promoUsers > 0 && (
                        <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[10.5px]">
                          <span className="text-amber-900 flex items-center gap-1 truncate">
                            <span>🏷️</span> Promo ({plan.promoUsers}):
                          </span>
                          <span className="font-bold font-mono text-amber-900 text-[11px] shrink-0 ml-1">
                            -{formatTaka(plan.promoDiscount)}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Footer Metrics (Store Share & Net Sales Share) */}
              <div className="pt-3 border-t border-line/60 mt-3 flex items-center justify-between text-[11.5px]">
                <div>
                  <span className="font-bold text-text block">
                    {plan.totalStores} {plan.isCustom ? "Brands" : "Stores"}
                  </span>
                  <span className="text-[10.5px] text-text-3 font-mono">
                    {storeShare}% Stores
                  </span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-signal block">
                    {plan.isFree ? "৳০" : formatTaka(plan.revenueValue)}
                  </span>
                  <span className="text-[10.5px] text-signal font-semibold font-mono">
                    {revenueShare}% Net Sales
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

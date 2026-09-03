"use client";

import React from "react";
import { IconCheck, IconTrash } from "@/components/ui/icons";
import { formatTaka, cx } from "@/lib/format";
import { AdminPlan } from "../types";

interface PlanCardProps {
  plan: AdminPlan;
  isYearlyView: boolean;
  onEdit: (plan: AdminPlan) => void;
  onToggleStatus: (planId: string) => void;
  onToggleHome?: (planId: string) => void;
  onDelete: (plan: AdminPlan) => void;
}

export function PlanCard({
  plan: p,
  isYearlyView,
  onEdit,
  onToggleStatus,
  onToggleHome,
  onDelete,
}: PlanCardProps) {
  const isFree = p.priceBDT === 0;
  const displayedPrice = isYearlyView
    ? (p.yearlyPriceBDT ?? p.priceBDT * 10)
    : p.priceBDT;
  const monthlyEquivalent =
    isYearlyView && !isFree ? Math.round(displayedPrice / 12) : null;
  const savingsBDT =
    isYearlyView && !isFree ? p.priceBDT * 12 - displayedPrice : 0;

  return (
    <div
      className={cx(
        "rounded-2xl border bg-white p-5.5 flex flex-col justify-between shadow-2xs relative transition-all duration-150 hover:shadow-md hover:border-line-2",
        p.popular
          ? "border-signal ring-1 ring-signal/25 shadow-xs"
          : "border-line",
      )}
    >
      <div className="space-y-3.5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-text text-[17px] leading-tight">
              {p.name}
            </h3>
            {p.nameBn && (
              <p className="text-[12px] text-text-3 font-mono mt-0.5">
                {p.nameBn}
              </p>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {p.showOnHome && (
              <span
                className="rounded-md px-1.5 py-0.5 text-[10px] font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200"
                title="Visible on public homepage"
              >
                🌐 Home
              </span>
            )}
            {p.badge && (
              <span
                className={cx(
                  "rounded-md px-2 py-0.5 text-[10.5px] font-bold font-mono",
                  p.popular
                    ? "bg-signal text-white"
                    : "bg-surface-2 text-text-2 border border-line",
                )}
              >
                {p.badge}
              </span>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="border-y border-line/60 py-3 space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[29px] font-bold text-text font-(family-name:--font-bricolage)">
              {isFree ? "৳০" : formatTaka(displayedPrice)}
            </span>
            <span className="text-[12px] text-text-3 font-mono">
              {isFree ? "free" : isYearlyView ? "/ yr" : "/ mo"}
            </span>
          </div>

          {isYearlyView && !isFree && (
            <div className="flex items-center gap-1.5 text-[11.5px] font-mono">
              <span className="text-text-3">৳{monthlyEquivalent}/mo</span>
              {savingsBDT > 0 && (
                <span className="text-signal font-bold bg-signal/[0.08] px-1.5 py-0.2 rounded border border-signal/20">
                  Save {formatTaka(savingsBDT)}/yr
                </span>
              )}
            </div>
          )}

          <p className="text-[12.5px] text-signal font-semibold pt-0.5">
            {p.messageLimit.toLocaleString()} Messages / mo
          </p>
        </div>

        {p.tagline && (
          <p className="text-[13px] text-text-3 leading-snug min-h-[36px]">
            {p.tagline}
          </p>
        )}

        <ul className="space-y-2 text-[12.5px] pt-1">
          {p.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-text-2">
              <IconCheck
                width={13.5}
                height={13.5}
                className="text-signal shrink-0 mt-0.5"
              />
              <span className="leading-snug">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-4 border-t border-line/60 mt-5 flex items-center justify-between text-[12px]">
        <button
          type="button"
          onClick={() => onToggleHome?.(p.id)}
          className={cx(
            "px-2 py-0.5 rounded-md font-medium text-[11px] transition-colors border cursor-pointer",
            p.showOnHome
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              : "bg-surface-2 text-text-3 border-line hover:bg-surface-3 hover:text-text",
          )}
          title={
            p.showOnHome
              ? "Displayed on Public Homepage (Click to hide)"
              : "Hidden from Homepage (Click to show)"
          }
        >
          {p.showOnHome ? "🌐 On Home" : "🌐 Off Home"}
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(p)}
            className="font-semibold text-signal hover:underline cursor-pointer"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(p.id)}
            className="text-text-3 hover:text-text cursor-pointer"
          >
            {p.status === "active" ? "Archive" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(p)}
            className="text-text-3 hover:text-rose-600 p-0.5 cursor-pointer"
            title="Delete Plan"
          >
            <IconTrash width={13} height={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

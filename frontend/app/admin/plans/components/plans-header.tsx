"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconCheck, IconClose, IconPlus } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

interface PlansHeaderProps {
  loading: boolean;
  activePlansCount: number;
  successMsg: string | null;
  onDismissSuccess: () => void;
  onCreatePlanClick: () => void;
}

export function PlansHeader({
  loading,
  activePlansCount,
  successMsg,
  onDismissSuccess,
  onCreatePlanClick,
}: PlansHeaderProps) {
  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
            Subscription Plans &amp; Pricing
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-3 py-0.5 text-[12px] font-bold text-signal">
            <span className="size-1.5 rounded-full bg-signal animate-pulse" />
            {loading ? "Syncing Live Tiers..." : `${activePlansCount} Live Plans`}
          </span>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={onCreatePlanClick}
          className="gap-2 font-semibold text-[13px] h-10 px-4 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <IconPlus width={15} height={15} />
          <span>Create Custom Plan</span>
        </Button>
      </div>

      {/* Success Notification */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-signal/30 bg-signal/[0.07] p-3.5 text-[13px] font-medium text-signal shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <IconCheck width={16} height={16} className="shrink-0 text-signal" />
              <span>{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={onDismissSuccess}
              className="text-text-3 hover:text-text p-1 cursor-pointer"
            >
              <IconClose width={14} height={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

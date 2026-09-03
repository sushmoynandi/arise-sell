"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { IconCheck, IconClose, IconDownload } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

interface SubscriptionsHeaderProps {
  loading: boolean;
  successMsg: string | null;
  onDismissSuccess: () => void;
  onExportCSV: () => void;
}

export function SubscriptionsHeader({
  loading,
  successMsg,
  onDismissSuccess,
  onExportCSV,
}: SubscriptionsHeaderProps) {
  return (
    <>
      {/* ─── 1. Header Title & Actions ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text font-(family-name:--font-bricolage) tracking-tight flex items-center gap-2">
            <span>Subscriptions &amp; Billing Revenue</span>
            {loading && (
              <span
                className="size-2 rounded-full bg-signal animate-pulse"
                title="Syncing live plans..."
              />
            )}
          </h1>
          <p className="text-[13.5px] text-text-3 mt-0.5">
            Platform recurring revenue analytics, promo discounts, timeline
            calendar filters, and merchant settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/plans"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white hover:bg-surface-2 px-3.5 py-1.5 text-[12.5px] font-semibold text-text shadow-2xs transition-colors h-9 cursor-pointer"
          >
            <span>⚙️ Manage Plans</span>
          </Link>
          <Button
            variant="signal"
            size="sm"
            onClick={onExportCSV}
            className="gap-1.5 font-semibold text-[12.5px] h-9 px-3.5 cursor-pointer shadow-xs"
          >
            <IconDownload width={14} height={14} />
            <span>Export CSV / Excel</span>
          </Button>
        </div>
      </div>

      {/* ─── Success Notification ─── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-signal/30 bg-signal/[0.07] p-3.5 text-[13px] font-medium text-signal shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <IconCheck
                width={16}
                height={16}
                className="shrink-0 text-signal"
              />
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

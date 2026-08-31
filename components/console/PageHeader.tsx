"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { SPRING_SOFT } from "@/components/motion";

export default function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub: string;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING_SOFT}
      className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-6 lg:px-8"
    >
      <div>
        <h1 className="font-display text-[26px] font-semibold tracking-[-0.02em] text-text">
          {title}
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-snug text-text-3">{sub}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

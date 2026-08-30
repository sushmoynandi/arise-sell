"use client";

import { motion } from "framer-motion";
import { DemoIllustration } from "@/components/ui/Illustrations";

export default function VideoDemoSection() {
  return (
    <section className="py-20 md:py-28 bg-[var(--surface-alt)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <span className="inline-block text-sm font-semibold text-[var(--secondary)] bg-[var(--secondary-light)] px-4 py-1.5 rounded-full mb-4">
            Product Demo
          </span>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--foreground)]">
            See it in action
          </h2>
          <p className="text-[var(--muted)] mt-4 max-w-xl mx-auto text-lg">
            A 2-minute walkthrough from setup to launch day.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-white rounded-3xl border border-[var(--border)] p-8 shadow-lg shadow-slate-200/50 overflow-hidden group cursor-pointer hover:shadow-xl transition-shadow duration-300">
            <DemoIllustration className="w-full" />

            {/* Decorative corner elements */}
            <div className="absolute top-4 right-4 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] opacity-40" />
              <div className="w-2 h-2 rounded-full bg-[var(--secondary)] opacity-40" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 opacity-40" />
            </div>
          </div>

          <p className="text-center text-sm text-[var(--muted)] mt-4">
            Embed your Loom walkthrough, YouTube video, or product GIF right here.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

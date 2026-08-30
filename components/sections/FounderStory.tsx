"use client";

import { motion } from "framer-motion";
import { FounderIllustration } from "@/components/ui/Illustrations";

export default function FounderStory() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Illustration */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="animate-float-slow">
                <FounderIllustration className="w-full max-w-xs mx-auto" />
              </div>
            </motion.div>

            {/* Story */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <span className="inline-block text-sm font-semibold text-[var(--accent)] bg-[var(--accent-light)] px-4 py-1.5 rounded-full mb-4">
                The Story
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-6">
                Why I built HuntReady
              </h2>
              <div className="space-y-4 text-[var(--muted)] leading-relaxed">
                <p>
                  I launched my first product on Product Hunt in 2023. I spent three weeks
                  stitching together a Carrd page, a Mailchimp form, a referral tracking
                  spreadsheet, and a Zapier automation to switch the CTA on launch day.
                </p>
                <p>
                  It worked — we hit #4 Product of the Day. But the pre-launch setup was
                  a nightmare. I kept thinking: <span className="text-[var(--foreground)] font-semibold italic">why isn&apos;t there a single tool that does
                  all of this?</span>
                </p>
                <p>
                  So I built it. HuntReady is the launch page I wish I&apos;d had. Countdown
                  timer, referral waitlist, demo embed, press kit, founder story section,
                  and the auto-switching PH voting CTA — all in one page, set up in minutes.
                </p>
              </div>

              {/* Founder card */}
              <div className="mt-8 flex items-center gap-4 bg-[var(--surface-alt)] p-4 rounded-xl border border-[var(--border)]">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center text-white font-[family-name:var(--font-display)] font-bold text-sm shadow-md shadow-[var(--accent)]/20">
                  AJ
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)]">Alex Johnson</p>
                  <p className="text-sm text-[var(--muted)]">Founder, HuntReady</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <a href="#" className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                  <a href="#" className="w-8 h-8 rounded-lg bg-white border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

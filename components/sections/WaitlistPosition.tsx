"use client";

import { motion } from "framer-motion";
import { WaitlistIllustration } from "@/components/ui/Illustrations";

export default function WaitlistPosition() {
  return (
    <section className="py-20 md:py-28 bg-[var(--surface-alt)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: illustration */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="animate-float-slow">
                <WaitlistIllustration className="w-full max-w-md mx-auto" />
              </div>
            </motion.div>

            {/* Right: explanation */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block text-sm font-semibold text-[var(--secondary)] bg-[var(--secondary-light)] px-4 py-1.5 rounded-full mb-4">
                Referral Waitlist
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-6">
                Turn signups into a viral loop
              </h2>
              <div className="space-y-5">
                {[
                  { num: "1", title: "Every signup gets a unique link", desc: "Automatically generated, ready to share on Twitter, LinkedIn, and communities." },
                  { num: "2", title: "Referrals move them up the list", desc: "Each friend they refer bumps their position. Gamification drives action." },
                  { num: "3", title: "Top referrers get early access", desc: "Incentivize sharing with exclusive perks and priority access." },
                ].map((item) => (
                  <div key={item.num} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] flex items-center justify-center shrink-0 font-[family-name:var(--font-display)] font-bold">
                      {item.num}
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
                      <p className="text-sm text-[var(--muted)] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-4 bg-white border border-[var(--border)] rounded-xl">
                <p className="text-xs text-[var(--muted)] mb-1 font-medium uppercase tracking-wider">Used by</p>
                <p className="text-sm text-[var(--foreground)]">
                  The same viral mechanic that grew <span className="font-semibold">Robinhood&apos;s</span> waitlist to <span className="font-semibold text-[var(--accent)]">1M+</span> before launch.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

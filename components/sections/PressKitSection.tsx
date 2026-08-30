"use client";

import { motion } from "framer-motion";
import { PressKitIllustration } from "@/components/ui/Illustrations";

const pressKitItems = [
  {
    title: "Brand Assets",
    description: "Logo in SVG, PNG, and dark/light variants",
    color: "bg-indigo-50 text-indigo-600",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>,
  },
  {
    title: "Screenshots",
    description: "High-res product screenshots for press",
    color: "bg-orange-50 text-orange-500",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>,
  },
  {
    title: "Product Copy",
    description: "Tagline, descriptions, and feature lists",
    color: "bg-emerald-50 text-emerald-600",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>,
  },
  {
    title: "Founder Bio",
    description: "Photo, bio, and social links",
    color: "bg-violet-50 text-violet-600",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>,
  },
];

export default function PressKitSection() {
  return (
    <section id="press-kit" className="py-20 md:py-28 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="inline-block text-sm font-semibold text-[var(--accent)] bg-[var(--accent-light)] px-4 py-1.5 rounded-full mb-4">
                Press Kit
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-[var(--foreground)] mb-4">
                Everything press needs, one click away
              </h2>
              <p className="text-[var(--muted)] mb-8 text-lg">
                Make it effortless for journalists and bloggers to cover your launch.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pressKitItems.map((item, i) => (
                  <motion.button
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-[var(--surface-alt)] border border-[var(--border)] rounded-xl p-4 text-left hover:shadow-md hover:border-slate-200 transition-all group cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center mb-3`}>
                      {item.icon}
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-base text-[var(--foreground)]">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{item.description}</p>
                  </motion.button>
                ))}
              </div>

              <button className="mt-6 inline-flex items-center gap-2 bg-[var(--foreground)] text-white px-6 py-3 rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
                </svg>
                Download Full Press Kit
              </button>
            </motion.div>

            {/* Right illustration */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="animate-float-slow">
                <PressKitIllustration className="w-full max-w-sm mx-auto" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

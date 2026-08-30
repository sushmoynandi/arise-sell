"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

const plans = [
  {
    name: "Starter",
    description: "For solo founders testing the waters",
    priceMonthly: 0,
    priceYearly: 0,
    cta: "Start Free",
    ctaStyle: "bg-white hover:bg-gray-50 text-[var(--foreground)] border border-[var(--border)]",
    badge: null,
    features: [
      "1 launch page",
      "Countdown timer",
      "Email capture (up to 200)",
      "Basic analytics",
      "HuntReady subdomain",
      "Community support",
    ],
    excluded: [
      "Referral waitlist",
      "Custom domain",
      "Press kit section",
      "A/B testing",
    ],
  },
  {
    name: "Pro",
    description: "For serious founders ready to ship",
    priceMonthly: 29,
    priceYearly: 24,
    cta: "Start 14-Day Trial",
    ctaStyle: "bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-lg shadow-[var(--accent)]/20",
    badge: "Most Popular",
    features: [
      "Unlimited launch pages",
      "Countdown + auto PH switch",
      "Unlimited email capture",
      "Referral waitlist system",
      "Custom domain",
      "Press kit section",
      "Demo embed",
      "Founder story section",
      "Priority email support",
    ],
    excluded: ["A/B testing"],
  },
  {
    name: "Launch Team",
    description: "For teams that launch repeatedly",
    priceMonthly: 79,
    priceYearly: 66,
    cta: "Contact Sales",
    ctaStyle: "bg-[var(--foreground)] hover:bg-[var(--foreground)]/90 text-white",
    badge: null,
    features: [
      "Everything in Pro",
      "A/B testing",
      "Advanced analytics",
      "Webhook integrations",
      "Team collaboration (5 seats)",
      "White-label option",
      "Dedicated account manager",
      "Custom onboarding",
      "SLA guarantee",
    ],
    excluded: [],
  },
];

const faqs = [
  {
    q: "Can I switch plans later?",
    a: "Absolutely. Upgrade or downgrade anytime. If you upgrade mid-cycle, we prorate the difference. If you downgrade, the change takes effect at the end of your billing period.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Yes — Pro comes with a 14-day free trial, no credit card required. Launch Team includes a personalized demo before you commit.",
  },
  {
    q: "What happens after my Product Hunt launch?",
    a: "Your page stays live as long as your subscription is active. Many founders keep it running as a permanent landing page, or you can export your signup data and shut it down.",
  },
  {
    q: "Do you take a cut of my signups or upvotes?",
    a: "Never. Your data is yours. We don't add any tracking or referral codes to your Product Hunt listing. Zero hidden catches.",
  },
  {
    q: "Can I use my own domain?",
    a: "On Pro and Launch Team plans, yes. Point your domain (or subdomain like launch.yourproduct.com) and we handle the SSL certificate automatically.",
  },
  {
    q: "What integrations do you support?",
    a: "We integrate with Mailchimp, ConvertKit, Resend, Loops, and any tool that accepts webhooks. Zapier integration coming soon.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />
      <main className="pt-24">
        {/* Hero - Minimal with toggle */}
        <section className="py-20 lg:py-28 relative">
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-[var(--surface-alt)] to-white" />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 relative">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center mb-14">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                Simple, transparent pricing
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-extrabold text-[var(--foreground)] leading-tight mb-6">
                Pick your launch plan
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-[var(--muted)] max-w-xl mx-auto mb-10">
                Start free. Upgrade when you&apos;re ready to go viral.
              </motion.p>

              {/* Billing Toggle */}
              <motion.div variants={fadeUp} className="inline-flex items-center gap-3 bg-white rounded-full border border-[var(--border)] p-1.5">
                <button
                  onClick={() => setAnnual(false)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${!annual ? "bg-[var(--accent)] text-white shadow" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setAnnual(true)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${annual ? "bg-[var(--accent)] text-white shadow" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
                >
                  Yearly
                  <span className="ml-1.5 text-xs font-bold text-emerald-300">-17%</span>
                </button>
              </motion.div>
            </motion.div>

            {/* Pricing Cards */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
            >
              {plans.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={fadeUp}
                  className={`relative rounded-2xl border bg-white p-8 flex flex-col ${plan.badge ? "border-[var(--accent)] shadow-xl shadow-[var(--accent)]/10 ring-1 ring-[var(--accent)]" : "border-[var(--border)]"}`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-white text-xs font-bold px-4 py-1 rounded-full">
                      {plan.badge}
                    </div>
                  )}
                  <div className="mb-6">
                    <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--foreground)] mb-1">{plan.name}</h2>
                    <p className="text-sm text-[var(--muted)]">{plan.description}</p>
                  </div>
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="font-[family-name:var(--font-display)] text-5xl font-bold text-[var(--foreground)]">
                        ${annual ? plan.priceYearly : plan.priceMonthly}
                      </span>
                      {(annual ? plan.priceYearly : plan.priceMonthly) > 0 && (
                        <span className="text-[var(--muted)] text-sm">/mo</span>
                      )}
                    </div>
                    {plan.priceMonthly === 0 && (
                      <p className="text-sm text-[var(--muted)] mt-1">Free forever</p>
                    )}
                    {annual && plan.priceMonthly > 0 && (
                      <p className="text-sm text-emerald-600 mt-1">
                        Save ${(plan.priceMonthly - plan.priceYearly) * 12}/year
                      </p>
                    )}
                  </div>
                  <a
                    href="/#waitlist"
                    className={`block text-center font-semibold px-6 py-3.5 rounded-xl transition-colors mb-8 ${plan.ctaStyle}`}
                  >
                    {plan.cta}
                  </a>
                  <div className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <div key={f} className="flex items-start gap-3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" className="mt-0.5 flex-shrink-0"><path d="m5 12 5 5L20 7" /></svg>
                        <span className="text-sm text-[var(--foreground)]">{f}</span>
                      </div>
                    ))}
                    {plan.excluded.map((f) => (
                      <div key={f} className="flex items-start gap-3 opacity-40">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 flex-shrink-0"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        <span className="text-sm text-[var(--muted)]">{f}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Social Proof Strip */}
        <section className="py-14 bg-[var(--surface-alt)] border-y border-[var(--border)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=80",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80",
                  ].map((src, i) => (
                    <img key={i} src={src} alt="" className="w-10 h-10 rounded-full border-2 border-white object-cover" />
                  ))}
                </div>
                <div>
                  <p className="font-bold text-[var(--foreground)]">2,400+ founders</p>
                  <p className="text-sm text-[var(--muted)]">launched with HuntReady</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-8 text-center">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">4.9/5</p>
                  <p className="text-xs text-[var(--muted)]">Average rating</p>
                </div>
                <div className="w-px h-8 bg-[var(--border)] hidden md:block" />
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">340%</p>
                  <p className="text-xs text-[var(--muted)]">Avg waitlist growth</p>
                </div>
                <div className="w-px h-8 bg-[var(--border)] hidden md:block" />
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--foreground)]">#1 POTD</p>
                  <p className="text-xs text-[var(--muted)]">Most common result</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 lg:py-28">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
              <motion.h2 variants={fadeUp} className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--foreground)] mb-4">
                Common questions
              </motion.h2>
              <motion.p variants={fadeUp} className="text-lg text-[var(--muted)]">
                Can&apos;t find your answer? Email us at hello@huntready.io
              </motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
              {faqs.map((faq, i) => (
                <motion.div key={i} variants={fadeUp} className="border border-[var(--border)] rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--surface-alt)] transition-colors"
                  >
                    <span className="font-semibold text-[var(--foreground)] pr-4">{faq.q}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`flex-shrink-0 text-[var(--muted)] transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-[var(--muted)] leading-relaxed">{faq.a}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA with image */}
        <section className="relative">
          <img
            src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&h=400&fit=crop&q=80"
            alt="Workspace with laptop"
            className="w-full h-[350px] object-cover"
          />
          <div className="absolute inset-0 bg-[var(--foreground)]/85" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-extrabold text-white mb-4">
                Launch with confidence
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-lg mx-auto">
                Your next big thing deserves more than a bare-bones landing page.
              </p>
              <a href="/#waitlist" className="inline-flex items-center gap-2 bg-[var(--secondary)] hover:bg-orange-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors">
                Start Building Free
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";

export default function CTASection() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free Trial",
      price: "৳ 0",
      period: "one-time (never expires)",
      desc: "Perfect for testing conversational AI on your active social channels.",
      badge: null,
      features: [
        "100 full conversations included",
        "Unlimited messages per conversation",
        "All channels (WhatsApp, FB, IG, Web)",
        "In-chat order placement & phone KYC",
        "Standard product catalog & feed sync",
        "1 human moderator seat",
      ],
      cta: "Start Free Now",
      highlighted: false,
    },
    {
      name: "Starter Plan",
      price: billingCycle === "monthly" ? "৳ 299" : "৳ 249",
      period: "per month",
      desc: "Ideal for boutique online stores and rising F-commerce merchants.",
      badge: null,
      features: [
        "250 conversations / month",
        "Unlimited messages per conversation",
        "No Alap AI branding badge",
        "Manual courier booking export",
        "Social comments auto-reply (Limited)",
        "Branded Bangla PDF invoices",
        "2 human moderator seats",
      ],
      cta: "Choose Starter",
      highlighted: false,
    },
    {
      name: "Pro Plan",
      price: billingCycle === "monthly" ? "৳ 999" : "৳ 799",
      period: "per month",
      desc: "Full autonomy for scaling e-commerce brands with automated logistics.",
      badge: "Most Popular",
      features: [
        "900 conversations / month",
        "Steadfast & Pathao 1-Click Auto Booking",
        "Full comment auto-reply (Post comment + DM)",
        "WhatsApp Marketing Broadcast Engine",
        "Multimodal Image & Screenshot Vision AI",
        "Meta CAPI conversion signal sync",
        "Unlimited team moderator seats",
      ],
      cta: "Get Started with Pro",
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-950">
            Transparent Pricing
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
            Simple, predictable plans for every stage
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Start free with 100 conversations. No credit card required.
          </p>

          {/* Toggle */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-slate-900" : "text-slate-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-900 transition-colors cursor-pointer"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-sky-400 transition-transform ${
                  billingCycle === "yearly" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingCycle === "yearly" ? "text-slate-900" : "text-slate-400"}`}>
              Yearly
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-extrabold">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((p, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 relative ${
                p.highlighted
                  ? "bg-slate-950 text-white shadow-2xl ring-2 ring-sky-400 md:-translate-y-2"
                  : "bg-[#f0f4f8] text-slate-900 border border-slate-200 shadow-sm"
              }`}
            >
              {p.badge && (
                <div className="absolute -top-3.5 right-6 bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  {p.badge}
                </div>
              )}

              <div>
                <h3 className="text-xl font-bold mb-1">{p.name}</h3>
                <p className={`text-xs mb-6 ${p.highlighted ? "text-slate-400" : "text-slate-600"}`}>{p.desc}</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-black">{p.price}</span>
                  <span className={`text-xs font-medium ${p.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                    / {p.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8 text-xs">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <span className={`font-bold ${p.highlighted ? "text-sky-400" : "text-slate-900"}`}>✓</span>
                      <span className={p.highlighted ? "text-slate-300" : "text-slate-700"}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/dashboard"
                className={`w-full py-3 rounded-xl text-xs font-bold text-center transition-all ${
                  p.highlighted
                    ? "bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

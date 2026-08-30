"use client";

import Link from "next/link";

export default function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Connect Your Channels",
      desc: "Link your WhatsApp Cloud API, Facebook Page, Instagram account, or drop the 1-line script onto your website.",
      icon: "🔌",
    },
    {
      step: "02",
      title: "Upload Business Knowledge",
      desc: "Add your product catalog, FAQs, delivery terms, and return policies. The agent learns your entire store in seconds.",
      icon: "📚",
    },
    {
      step: "03",
      title: "AI Handles Inbound 24/7",
      desc: "The agent chats with shoppers, recommends products, answers inquiries, and takes orders automatically.",
      icon: "🤖",
    },
    {
      step: "04",
      title: "Watch Sales and Efficiency Scale",
      desc: "Review live orders, track conversations on your dashboard, and step in anytime with 1-click human takeover.",
      icon: "📈",
    },
  ];

  return (
    <section id="integrations" className="py-20 bg-white border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-950">
            Simple Setup
          </span>
          <h2 className="mt-4 text-3xl font-extrabold text-slate-950 sm:text-4xl">
            Go live in under 5 minutes
          </h2>
          <p className="mt-4 text-base text-slate-600">
            No complicated coding or developer team required. Connect your tools and start automating immediately.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-[#f0f4f8] rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between relative shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{s.icon}</span>
                  <span className="text-2xl font-black text-sky-500">{s.step}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition-all"
          >
            Start Free Setup Today →
          </Link>
        </div>
      </div>
    </section>
  );
}

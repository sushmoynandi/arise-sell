"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const HEADLINE_ROTATIONS = [
  "Everywhere Your Customers Are.",
  "Always Online. Always Answering.",
  "While You Sleep. While You Scale.",
  "Turning Conversations into Orders.",
];

export default function Hero() {
  const [rotationIdx, setRotationIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotationIdx((prev) => (prev + 1) % HEADLINE_ROTATIONS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#f0f4f8] pb-16 pt-28 lg:pb-24 lg:pt-32">
      {/* Background glow meshes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 top-20 w-96 h-96 rounded-full bg-sky-400/20 blur-3xl"></div>
        <div className="absolute -left-40 bottom-0 w-96 h-96 rounded-full bg-blue-500/15 blur-3xl"></div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8">
        {/* Left Column: Copy & CTAs */}
        <div className="flex flex-col justify-center lg:col-span-6">
          <div className="mb-6 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-50 px-3.5 py-1 text-xs font-bold text-sky-950 shadow-sm sm:text-sm">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="inline-flex size-2 rounded-full bg-sky-500"></span>
              </span>
              AI-Powered • 24/7 Active
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            <span className="block">Your AI Sales and Support Agent —</span>
            <span className="mt-2 block text-sky-500 transition-all duration-500 min-h-[1.3em]">
              {HEADLINE_ROTATIONS[rotationIdx]}
            </span>
          </h1>

          <p className="mb-8 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
            NextProduct AI chats with your customers in real time, answers their questions, places orders automatically — just like a skilled human sales agent, available 24/7 across WhatsApp, Messenger, Instagram, and your website.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-sky-500/25 transition-all"
            >
              Get Started Free →
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-800 shadow-sm transition-all hover:border-sky-500 hover:bg-white"
            >
              ⚡ Explore Live Dashboard
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-10 flex items-center gap-6 border-t border-slate-300/80 pt-6 sm:gap-10">
            <div>
              <p className="text-2xl font-black text-slate-950">24/7</p>
              <p className="text-xs text-slate-500 font-medium">Always Online</p>
            </div>
            <div className="h-8 w-px bg-slate-300"></div>
            <div>
              <p className="text-2xl font-black text-slate-950">5+</p>
              <p className="text-xs text-slate-500 font-medium">Platforms</p>
            </div>
            <div className="h-8 w-px bg-slate-300"></div>
            <div>
              <p className="text-2xl font-black text-slate-950">10x</p>
              <p className="text-xs text-slate-500 font-medium">Faster Replies</p>
            </div>
            <div className="h-8 w-px bg-slate-300"></div>
            <div>
              <p className="text-2xl font-black text-slate-950">98%</p>
              <p className="text-xs text-slate-500 font-medium">Auto-Resolution</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Chat Simulation Card & Floating Social Icons */}
        <div className="relative flex items-center justify-center lg:col-span-6">
          {/* Floating WhatsApp */}
          <div className="absolute -left-3 top-6 sm:left-2 animate-bounce rounded-2xl bg-white p-3 shadow-xl border border-slate-100 flex items-center gap-2 z-20">
            <span className="w-3 h-3 rounded-full bg-[#25D366]"></span>
            <span className="text-xs font-bold text-slate-800">WhatsApp API</span>
          </div>

          {/* Floating Messenger */}
          <div className="absolute -right-3 top-12 sm:right-2 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 flex items-center gap-2 z-20">
            <span className="w-3 h-3 rounded-full bg-[#0084FF]"></span>
            <span className="text-xs font-bold text-slate-800">Messenger</span>
          </div>

          {/* Floating Instagram */}
          <div className="absolute -left-2 bottom-12 sm:left-4 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 flex items-center gap-2 z-20">
            <span className="w-3 h-3 rounded-full bg-[#E4405F]"></span>
            <span className="text-xs font-bold text-slate-800">Instagram DM</span>
          </div>

          {/* Simulated Chat Card */}
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-300/60 z-10">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-sky-500 font-black text-white text-lg shadow-sm">
                  ⚡
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">NextProduct AI Agent</p>
                  <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                    <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Online 24/7 • Instant Reply
                  </p>
                </div>
              </div>
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                Automated
              </span>
            </div>

            {/* Conversation Flow */}
            <div className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-slate-900 px-4 py-2.5 text-xs text-white">
                  Hi! I want to order the Blue Runner Sneaker in size 42.
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-[#f0f4f8] px-4 py-2.5 text-xs text-slate-800 border border-slate-200/60">
                  Great choice! 🎉 The Blue Runner Sneaker in size 42 is in stock. Price is ৳2,450 (Free Delivery). Shall I confirm the order to your shipping address?
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-slate-900 px-4 py-2.5 text-xs text-white">
                  Yes please! Deliver to House 14, Road 7, Mirpur-2, Dhaka.
                </div>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-sky-50 border border-sky-200 px-4 py-3 text-xs text-slate-800 space-y-1.5">
                  <p className="font-bold text-sky-900 flex items-center gap-1.5">
                    ✓ Order #ALAP-1042 Confirmed!
                  </p>
                  <p className="text-[11px] text-slate-600">
                    Auto-created in Steadfast Courier CRM with live tracking code SF1294812.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

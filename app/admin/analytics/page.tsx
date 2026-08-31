"use client";

import {
  IconWhatsApp,
  IconMessenger,
  IconInstagram,
} from "@/components/ui/icons";

const HOURLY_TRAFFIC = [
  { hour: "12 AM", pct: 15 },
  { hour: "2 AM", pct: 5 },
  { hour: "4 AM", pct: 2 },
  { hour: "6 AM", pct: 4 },
  { hour: "8 AM", pct: 18 },
  { hour: "10 AM", pct: 42 },
  { hour: "12 PM", pct: 65 },
  { hour: "2 PM", pct: 58 },
  { hour: "4 PM", pct: 72 },
  { hour: "6 PM", pct: 85 },
  { hour: "8 PM", pct: 98 },
  { hour: "10 PM", pct: 92 },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight text-text">
          Platform AI & Channel Intelligence
        </h1>
        <p className="text-[13.5px] text-text-3">
          Bangla Natural Language Understanding, Photo Vector Matching, and
          multi-channel commerce telemetry.
        </p>
      </div>

      {/* Primary Intelligence Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase">
              Bangla Intent Accuracy
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[11px] font-bold text-signal">
              NLU Engine
            </span>
          </div>
          <p className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-text">
            98.4%
          </p>
          <p className="text-[12px] text-text-3">
            Bangla & Banglish script dual parser
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase">
              Photo Vector Precision
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[11px] font-bold text-signal">
              Vision AI
            </span>
          </div>
          <p className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-text">
            96.1%
          </p>
          <p className="text-[12px] text-text-3">
            Embeddings matched to shop catalog
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase">
              Median Response Time
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[11px] font-bold text-signal">
              Ultra Fast
            </span>
          </div>
          <p className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-text">
            1.24s
          </p>
          <p className="text-[12px] text-text-3">
            Instant reply vs 45m human delay
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[12px] font-semibold uppercase">
              Courier Auto-Booked
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[11px] font-bold text-signal">
              Logistics
            </span>
          </div>
          <p className="font-[family-name:var(--font-bricolage)] text-2xl font-bold text-text">
            89.6%
          </p>
          <p className="text-[12px] text-text-3">Steadfast & Pathao APIs</p>
        </div>
      </div>

      {/* Traffic Heatmap & Channel Share */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Hourly Traffic Bar Chart */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-text">
              24-Hour Message Traffic Heatmap
            </h2>
            <p className="text-[12.5px] text-text-3">
              Peak customer purchasing window in Bangladesh (8:00 PM – 11:30 PM
              BST)
            </p>
          </div>

          <div className="pt-4 flex items-end justify-between gap-2 h-44 border-b border-line pb-2">
            {HOURLY_TRAFFIC.map((item) => (
              <div
                key={item.hour}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
              >
                <span className="text-[10px] font-mono text-text-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.pct}%
                </span>
                <div
                  style={{ height: `${item.pct}%` }}
                  className={`w-full rounded-t-md transition-all ${
                    item.pct > 80
                      ? "bg-signal"
                      : item.pct > 40
                        ? "bg-signal/60"
                        : "bg-signal/25"
                  }`}
                />
                <span className="text-[9.5px] font-mono text-text-3 mt-1 truncate">
                  {item.hour}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[11.5px] text-text-3 text-center">
            78% of orders are completed outside conventional office hours when
            shop owners are asleep.
          </p>
        </div>

        {/* Channel Share Breakdown */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-text">
              Sales Channel Distribution
            </h2>
            <p className="text-[12.5px] text-text-3">
              Where Bangladeshi buyers initiate chats
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-medium text-text">
                  <IconWhatsApp
                    width={16}
                    height={16}
                    className="text-[#25D366]"
                  />
                  WhatsApp Business
                </span>
                <span className="font-bold text-text">58%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-[#25D366] rounded-full"
                  style={{ width: "58%" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-medium text-text">
                  <IconMessenger
                    width={16}
                    height={16}
                    className="text-[#1877F2]"
                  />
                  Facebook Messenger
                </span>
                <span className="font-bold text-text">31%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-[#1877F2] rounded-full"
                  style={{ width: "31%" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-2 font-medium text-text">
                  <IconInstagram
                    width={16}
                    height={16}
                    className="text-[#E4405F]"
                  />
                  Instagram Direct
                </span>
                <span className="font-bold text-text">11%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full bg-[#E4405F] rounded-full"
                  style={{ width: "11%" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courier Bridge Success Rates */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text">
          Courier Delivery & Automated Booking Health
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-line bg-canvas p-4 space-y-1">
            <span className="text-[12px] font-bold uppercase text-text-3">
              Steadfast Courier
            </span>
            <p className="text-xl font-bold text-text">98.8%</p>
            <p className="text-[11.5px] text-text-3">
              21,480 shipments booked via API
            </p>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-1">
            <span className="text-[12px] font-bold uppercase text-text-3">
              Pathao Courier
            </span>
            <p className="text-xl font-bold text-text">97.9%</p>
            <p className="text-[11.5px] text-text-3">
              7,120 shipments booked via API
            </p>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-1">
            <span className="text-[12px] font-bold uppercase text-text-3">
              Paperfly / RedX
            </span>
            <p className="text-xl font-bold text-text">96.5%</p>
            <p className="text-[11.5px] text-text-3">
              810 shipments booked via API
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

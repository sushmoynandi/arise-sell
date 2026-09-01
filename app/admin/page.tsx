"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  ADMIN_KPI,
  ADMIN_MERCHANTS,
  LIVE_ACTIVITY_FEED,
  INITIAL_ADMIN_PLANS,
  AdminMerchant,
} from "@/data/admin";
import {
  IconGlobe,
  IconWhatsApp,
  IconMessenger,
  IconInstagram,
  IconSpark,
  IconClose,
  IconChart,
} from "@/components/ui/icons";
import { formatTaka, cx } from "@/lib/format";
import {
  subscribePlans,
  getStoredPlans,
  findMatchingPlan,
} from "@/lib/plans-store";

export default function AdminOverviewPage() {
  const plans = useSyncExternalStore(
    subscribePlans,
    getStoredPlans,
    () => INITIAL_ADMIN_PLANS,
  );

  const [timeRange, setTimeRange] = useState<
    "24h" | "7d" | "30d" | "1y" | "5y" | "all"
  >("30d");
  const [chartViewType, setChartViewType] = useState<"area" | "bar">("area");
  const [hoveredChannel, setHoveredChannel] = useState<string | null>(null);
  const [hoveredBilling, setHoveredBilling] = useState<string | null>(null);
  const [hoveredCourier, setHoveredCourier] = useState<string | null>(null);
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(
    null,
  );

  const [merchantTab, setMerchantTab] = useState<
    "all" | "vip" | "high_ai" | "growth"
  >("all");
  const [activityFilter, setActivityFilter] = useState<
    "all" | "order" | "signup" | "system"
  >("all");

  // Broadcast modal state
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [broadcastTarget, setBroadcastTarget] = useState<
    "all" | "paid" | "trial"
  >("all");
  const [broadcastType, setBroadcastType] = useState<
    "info" | "maintenance" | "promo"
  >("info");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Selected merchant for quick inspect modal
  const [inspectMerchant, setInspectMerchant] = useState<AdminMerchant | null>(
    null,
  );

  // 1. Channel Distribution Data Model (Circumference C = 238.76 for r=38)
  const CHANNELS_DATA = [
    {
      id: "whatsapp",
      name: "WhatsApp Commerce",
      short: "WhatsApp",
      pct: 54,
      dasharray: "128.93 238.76",
      dashoffset: "0",
      color: "#25D366",
      revenueFormatted: "৳2.64 Cr",
      orders: "20,740 Orders",
      icon: IconWhatsApp,
    },
    {
      id: "messenger",
      name: "Facebook Messenger",
      short: "Messenger",
      pct: 28,
      dasharray: "66.85 238.76",
      dashoffset: "-128.93",
      color: "#1877F2",
      revenueFormatted: "৳1.37 Cr",
      orders: "10,810 Orders",
      icon: IconMessenger,
    },
    {
      id: "instagram",
      name: "Instagram Direct",
      short: "Instagram",
      pct: 12,
      dasharray: "28.65 238.76",
      dashoffset: "-195.78",
      color: "#E4405F",
      revenueFormatted: "৳58.7 Lakh",
      orders: "4,620 Orders",
      icon: IconInstagram,
    },
    {
      id: "web",
      name: "Web Storefront",
      short: "Web Widget",
      pct: 6,
      dasharray: "14.33 238.76",
      dashoffset: "-224.43",
      color: "#0f766e",
      revenueFormatted: "৳29.3 Lakh",
      orders: "2,310 Orders",
      icon: IconGlobe,
    },
  ];

  const activeHoverChannel = CHANNELS_DATA.find((c) => c.id === hoveredChannel);

  // 2. Billing & Payment Rails Data Model
  const BILLING_DATA = [
    {
      id: "bkash",
      name: "bKash Tokenized",
      short: "bKash Direct",
      pct: 68,
      dasharray: "162.36 238.76",
      dashoffset: "0",
      color: "#E2136E",
      revenueFormatted: "৳3.32 Cr",
      subtext: "26,160 Payouts",
    },
    {
      id: "nagad",
      name: "Nagad Gateway",
      short: "Nagad API",
      pct: 20,
      dasharray: "47.75 238.76",
      dashoffset: "-162.36",
      color: "#F7941D",
      revenueFormatted: "৳97.8 Lakh",
      subtext: "7,700 Payouts",
    },
    {
      id: "cards",
      name: "Cards (Visa / MC)",
      short: "Debit & Credit",
      pct: 8,
      dasharray: "19.10 238.76",
      dashoffset: "-210.11",
      color: "#2563EB",
      revenueFormatted: "৳39.1 Lakh",
      subtext: "3,080 Txns",
    },
    {
      id: "cod",
      name: "COD & Bank Wire",
      short: "Manual & COD",
      pct: 4,
      dasharray: "9.55 238.76",
      dashoffset: "-229.21",
      color: "#64748B",
      revenueFormatted: "৳19.5 Lakh",
      subtext: "1,540 Txns",
    },
  ];

  const activeHoverBilling = BILLING_DATA.find((b) => b.id === hoveredBilling);

  // 3. Courier & Logistics Bridge Data Model
  const COURIER_DATA = [
    {
      id: "steadfast",
      name: "Steadfast Courier",
      short: "Steadfast",
      pct: 74,
      dasharray: "176.68 238.76",
      dashoffset: "0",
      color: "#059669",
      parcelsFormatted: "21,760 Parcels",
      successRate: "96.8% Success",
    },
    {
      id: "pathao",
      name: "Pathao Express",
      short: "Pathao Courier",
      pct: 18,
      dasharray: "42.98 238.76",
      dashoffset: "-176.68",
      color: "#DC2626",
      parcelsFormatted: "5,290 Parcels",
      successRate: "94.2% Success",
    },
    {
      id: "redx",
      name: "RedX Logistics",
      short: "RedX Express",
      pct: 5,
      dasharray: "11.94 238.76",
      dashoffset: "-219.66",
      color: "#7C3AED",
      parcelsFormatted: "1,470 Parcels",
      successRate: "91.5% Success",
    },
    {
      id: "paperfly",
      name: "Paperfly Courier",
      short: "Paperfly Smart",
      pct: 3,
      dasharray: "7.16 238.76",
      dashoffset: "-231.60",
      color: "#D97706",
      parcelsFormatted: "890 Parcels",
      successRate: "89.0% Success",
    },
  ];

  const activeHoverCourier = COURIER_DATA.find((c) => c.id === hoveredCourier);

  // Multi-Timeframe Telemetry Configuration (Smooth Spline & Padded High-Resolution)
  const TIMEFRAME_CONFIGS: Record<
    "24h" | "7d" | "30d" | "1y" | "5y" | "all",
    {
      title: string;
      subtitle: string;
      badge: string;
      metricLabel: string;
      metricValue: string;
      metricSub: string;
      yTicks: string[];
      points: {
        label: string;
        value: string;
        height: string;
        cy: number;
        cx: number;
      }[];
      pathD: string;
      areaD: string;
    }
  > = {
    "24h": {
      title: "24-Hour Revenue Velocity",
      subtitle:
        "Hourly GMV flow & automated bot sales throughput across Bangladesh",
      badge: "+12.4% vs Yesterday",
      metricLabel: "24h Sales Volume",
      metricValue: "৳1,48,000",
      metricSub: "1,240 Automated Bot Orders",
      yTicks: ["৳150k", "৳100k", "৳50k", "৳0"],
      points: [
        { label: "00:00", value: "৳8,200", height: "18%", cy: 162, cx: 40 },
        { label: "02:00", value: "৳4,100", height: "12%", cy: 168, cx: 105 },
        { label: "04:00", value: "৳2,800", height: "8%", cy: 170, cx: 170 },
        { label: "06:00", value: "৳9,400", height: "20%", cy: 158, cx: 235 },
        { label: "08:00", value: "৳22,500", height: "35%", cy: 138, cx: 300 },
        { label: "10:00", value: "৳44,000", height: "52%", cy: 105, cx: 365 },
        { label: "12:00", value: "৳68,200", height: "68%", cy: 82, cx: 430 },
        { label: "14:00", value: "৳85,000", height: "76%", cy: 64, cx: 495 },
        { label: "16:00", value: "৳98,400", height: "84%", cy: 52, cx: 560 },
        { label: "18:00", value: "৳1,18,000", height: "90%", cy: 40, cx: 625 },
        { label: "20:00", value: "৳1,34,000", height: "95%", cy: 32, cx: 690 },
        { label: "23:59", value: "৳1,48,000", height: "100%", cy: 25, cx: 760 },
      ],
      pathD:
        "M 40 162 C 70 166, 90 168, 105 168 C 135 168, 150 170, 170 170 C 200 170, 215 162, 235 158 C 265 152, 280 145, 300 138 C 330 128, 345 115, 365 105 C 395 90, 410 86, 430 82 C 460 76, 475 68, 495 64 C 525 58, 540 54, 560 52 C 590 48, 605 44, 625 40 C 655 34, 670 34, 690 32 C 720 28, 740 26, 760 25",
      areaD:
        "M 40 162 C 70 166, 90 168, 105 168 C 135 168, 150 170, 170 170 C 200 170, 215 162, 235 158 C 265 152, 280 145, 300 138 C 330 128, 345 115, 365 105 C 395 90, 410 86, 430 82 C 460 76, 475 68, 495 64 C 525 58, 540 54, 560 52 C 590 48, 605 44, 625 40 C 655 34, 670 34, 690 32 C 720 28, 740 26, 760 25 L 760 185 L 40 185 Z",
    },
    "7d": {
      title: "7-Day Revenue Trajectory",
      subtitle: "Daily automated order run-rate & courier booking throughput",
      badge: "+16.8% vs Last Week",
      metricLabel: "7-Day Sales Volume",
      metricValue: "৳5,69,000",
      metricSub: "3,890 Deliveries Booked",
      yTicks: ["৳120k", "৳80k", "৳40k", "৳0"],
      points: [
        { label: "Mon", value: "৳54,000", height: "48%", cy: 145, cx: 60 },
        { label: "Tue", value: "৳62,000", height: "55%", cy: 132, cx: 173 },
        { label: "Wed", value: "৳71,000", height: "63%", cy: 118, cx: 286 },
        { label: "Thu", value: "৳83,000", height: "74%", cy: 96, cx: 400 },
        { label: "Fri", value: "৳98,000", height: "88%", cy: 68, cx: 513 },
        { label: "Sat", value: "৳1,12,000", height: "100%", cy: 42, cx: 626 },
        { label: "Sun", value: "৳89,000", height: "80%", cy: 78, cx: 740 },
      ],
      pathD:
        "M 60 145 C 110 140, 140 135, 173 132 C 225 127, 255 122, 286 118 C 340 110, 365 102, 400 96 C 450 86, 480 75, 513 68 C 565 57, 595 45, 626 42 C 670 40, 700 68, 740 78",
      areaD:
        "M 60 145 C 110 140, 140 135, 173 132 C 225 127, 255 122, 286 118 C 340 110, 365 102, 400 96 C 450 86, 480 75, 513 68 C 565 57, 595 45, 626 42 C 670 40, 700 68, 740 78 L 740 185 L 60 185 Z",
    },
    "30d": {
      title: "Platform MRR Trajectory (30-Day)",
      subtitle: "Weekly milestones & subscription expansion trajectory",
      badge: "+18.2% MoM",
      metricLabel: "Platform MRR",
      metricValue: "৳1,73,000",
      metricSub: "126 Active Paid Merchants",
      yTicks: ["৳200k", "৳150k", "৳100k", "৳50k"],
      points: [
        {
          label: "Day 1",
          value: "৳1,46,000 MRR",
          height: "42%",
          cy: 155,
          cx: 60,
        },
        {
          label: "Day 5",
          value: "৳1,51,000 MRR",
          height: "50%",
          cy: 142,
          cx: 157,
        },
        {
          label: "Day 10",
          value: "৳1,56,000 MRR",
          height: "58%",
          cy: 130,
          cx: 254,
        },
        {
          label: "Day 15",
          value: "৳1,61,000 MRR",
          height: "66%",
          cy: 112,
          cx: 351,
        },
        {
          label: "Day 20",
          value: "৳1,65,500 MRR",
          height: "76%",
          cy: 88,
          cx: 448,
        },
        {
          label: "Day 24",
          value: "৳1,68,200 MRR",
          height: "84%",
          cy: 68,
          cx: 545,
        },
        {
          label: "Day 28",
          value: "৳1,71,000 MRR",
          height: "92%",
          cy: 50,
          cx: 642,
        },
        {
          label: "Day 30",
          value: "৳1,73,000 MRR",
          height: "100%",
          cy: 38,
          cx: 740,
        },
      ],
      pathD:
        "M 60 155 C 105 149, 130 145, 157 142 C 200 137, 225 133, 254 130 C 300 124, 325 118, 351 112 C 395 102, 420 93, 448 88 C 490 80, 515 73, 545 68 C 590 60, 615 54, 642 50 C 685 44, 710 40, 740 38",
      areaD:
        "M 60 155 C 105 149, 130 145, 157 142 C 200 137, 225 133, 254 130 C 300 124, 325 118, 351 112 C 395 102, 420 93, 448 88 C 490 80, 515 73, 545 68 C 590 60, 615 54, 642 50 C 685 44, 710 40, 740 38 L 740 185 L 60 185 Z",
    },
    "1y": {
      title: "12-Month MRR Expansion Curve",
      subtitle: "Annualized revenue run-rate (ARR) growth trajectory",
      badge: "+130.6% YTD",
      metricLabel: "Annualized ARR",
      metricValue: "৳20,76,000",
      metricSub: "154 Total Merchant Stores",
      yTicks: ["৳2.5L", "৳1.8L", "৳1.0L", "৳0"],
      points: [
        { label: "Jan", value: "৳42k / mo", height: "24%", cy: 160, cx: 50 },
        { label: "Feb", value: "৳58k / mo", height: "33%", cy: 148, cx: 113 },
        { label: "Mar", value: "৳75k / mo", height: "43%", cy: 135, cx: 177 },
        { label: "Apr", value: "৳94k / mo", height: "54%", cy: 120, cx: 240 },
        { label: "May", value: "৳1.18L / mo", height: "68%", cy: 102, cx: 304 },
        { label: "Jun", value: "৳1.32L / mo", height: "76%", cy: 90, cx: 367 },
        { label: "Jul", value: "৳1.46L / mo", height: "84%", cy: 78, cx: 431 },
        { label: "Aug", value: "৳1.60L / mo", height: "92%", cy: 66, cx: 494 },
        { label: "Sep", value: "৳1.73L / mo", height: "100%", cy: 54, cx: 558 },
        { label: "Oct", value: "৳1.92L / mo", height: "110%", cy: 44, cx: 621 },
        { label: "Nov", value: "৳2.15L / mo", height: "124%", cy: 34, cx: 685 },
        { label: "Dec", value: "৳2.45L / mo", height: "140%", cy: 24, cx: 750 },
      ],
      pathD:
        "M 50 160 C 80 154, 95 150, 113 148 C 145 142, 160 138, 177 135 C 205 128, 220 124, 240 120 C 270 112, 285 106, 304 102 C 335 96, 350 92, 367 90 C 400 84, 415 80, 431 78 C 460 72, 475 68, 494 66 C 525 60, 540 56, 558 54 C 590 48, 605 46, 621 44 C 650 38, 665 36, 685 34 C 715 28, 730 26, 750 24",
      areaD:
        "M 50 160 C 80 154, 95 150, 113 148 C 145 142, 160 138, 177 135 C 205 128, 220 124, 240 120 C 270 112, 285 106, 304 102 C 335 96, 350 92, 367 90 C 400 84, 415 80, 431 78 C 460 72, 475 68, 494 66 C 525 60, 540 56, 558 54 C 590 48, 605 46, 621 44 C 650 38, 665 36, 685 34 C 715 28, 730 26, 750 24 L 750 185 L 50 185 Z",
    },
    "5y": {
      title: "5-Year Macro Scale & Growth",
      subtitle: "Multi-year merchant ecosystem & ARR expansion",
      badge: "11.5x 5-Year CAGR",
      metricLabel: "5-Year Cumulative ARR",
      metricValue: "৳55,66,000",
      metricSub: "Enterprise Scale Telemetry",
      yTicks: ["৳25L", "৳15L", "৳5L", "৳0"],
      points: [
        { label: "2022", value: "৳1.80L ARR", height: "18%", cy: 162, cx: 80 },
        { label: "2023", value: "৳5.40L ARR", height: "35%", cy: 135, cx: 240 },
        { label: "2024", value: "৳11.20L ARR", height: "58%", cy: 98, cx: 400 },
        { label: "2025", value: "৳16.50L ARR", height: "80%", cy: 60, cx: 560 },
        {
          label: "2026",
          value: "৳20.76L ARR",
          height: "100%",
          cy: 28,
          cx: 720,
        },
      ],
      pathD:
        "M 80 162 C 160 150, 190 142, 240 135 C 310 120, 345 106, 400 98 C 475 80, 510 68, 560 60 C 635 45, 670 35, 720 28",
      areaD:
        "M 80 162 C 160 150, 190 142, 240 135 C 310 120, 345 106, 400 98 C 475 80, 510 68, 560 60 C 635 45, 670 35, 720 28 L 720 185 L 80 185 Z",
    },
    all: {
      title: "Lifetime Platform GMV Trajectory",
      subtitle:
        "All-time commercial sales processed by AI conversational engines",
      badge: "৳4.89 Cr Lifetime",
      metricLabel: "Lifetime Processed GMV",
      metricValue: "৳4,89,20,000",
      metricSub: "29,410 Deliveries Processed",
      yTicks: ["৳5.0 Cr", "৳3.0 Cr", "৳1.0 Cr", "৳0"],
      points: [
        { label: "Genesis Launch", value: "৳0", height: "5%", cy: 170, cx: 60 },
        {
          label: "Phase 1 (Bangla NLU)",
          value: "৳45L",
          height: "20%",
          cy: 140,
          cx: 196,
        },
        {
          label: "Phase 2 (Multi-Channel)",
          value: "৳1.2Cr",
          height: "45%",
          cy: 105,
          cx: 332,
        },
        {
          label: "Phase 3 (Auto-Courier)",
          value: "৳2.8Cr",
          height: "75%",
          cy: 68,
          cx: 468,
        },
        {
          label: "Phase 4 (Enterprise AI)",
          value: "৳3.9Cr",
          height: "88%",
          cy: 45,
          cx: 604,
        },
        {
          label: "Live Platform",
          value: "৳4.89Cr",
          height: "100%",
          cy: 26,
          cx: 740,
        },
      ],
      pathD:
        "M 60 170 C 120 160, 155 148, 196 140 C 260 125, 290 112, 332 105 C 395 90, 425 76, 468 68 C 530 55, 565 48, 604 45 C 665 38, 700 30, 740 26",
      areaD:
        "M 60 170 C 120 160, 155 148, 196 140 C 260 125, 290 112, 332 105 C 395 90, 425 76, 468 68 C 530 55, 565 48, 604 45 C 665 38, 700 30, 740 26 L 740 185 L 60 185 Z",
    },
  };

  const currentTfData = TIMEFRAME_CONFIGS[timeRange];

  // Dynamic Plan Info Helper from Plan Builder
  const getPlanInfo = (planKey: string) => {
    const matched = findMatchingPlan(planKey, plans);
    if (matched) {
      return {
        name: matched.name,
        priceBDT: matched.priceBDT,
        label: matched.name.toUpperCase(),
      };
    }
    return {
      name: planKey.charAt(0).toUpperCase() + planKey.slice(1),
      priceBDT: 0,
      label: planKey.toUpperCase(),
    };
  };

  // Filter top merchants
  const filteredMerchants = ADMIN_MERCHANTS.filter((m) => {
    if (merchantTab === "vip")
      return m.plan.includes("vip") || m.plan.includes("enterprise");
    if (merchantTab === "high_ai") return m.aiResolutionRate >= 95;
    if (merchantTab === "growth") return m.monthlyGMV >= 1000000;
    return true;
  });

  // Filter live activity
  const filteredActivity = LIVE_ACTIVITY_FEED.filter((act) => {
    if (activityFilter === "all") return true;
    return act.type === activityFilter;
  });

  return (
    <div className="space-y-7">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between pb-2 border-b border-line/70">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight text-text">
              Executive Command Center
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
              12 Services Operational · 99.98% SLA
            </span>
          </div>
          <p className="text-[13px] text-text-3 mt-1">
            Real-time platform telemetry across 154 Bangladeshi merchants &amp;
            automated AI sales pipelines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Time Range Selector (24H, 7D, 30D, 1Y, 5Y, All) */}
          <div className="inline-flex rounded-xl border border-line bg-white p-0.5 shadow-2xs">
            {(
              [
                { id: "24h", label: "24H" },
                { id: "7d", label: "7D" },
                { id: "30d", label: "30D" },
                { id: "1y", label: "1Y" },
                { id: "5y", label: "5Y" },
                { id: "all", label: "All" },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTimeRange(t.id)}
                className={cx(
                  "rounded-lg px-2.5 py-1 text-[11.5px] font-semibold transition-all cursor-pointer",
                  timeRange === t.id
                    ? "bg-text text-white font-bold shadow-2xs"
                    : "text-text-3 hover:text-text",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setBroadcastOpen(true);
              setBroadcastSent(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-1.5 text-[12px] font-semibold text-text shadow-2xs hover:border-signal/40 transition-colors cursor-pointer"
          >
            <IconSpark width={13} height={13} className="text-signal" />
            <span>Broadcast</span>
          </button>

          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 rounded-xl bg-signal px-3.5 py-1.5 text-[12px] font-bold text-white shadow-2xs hover:bg-signal-deep transition-all"
          >
            <span>Manage Merchants</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* 2. FULL-WIDTH HERO ANALYTICS: Dynamic Multi-Timeframe MRR & Revenue Trajectory */}
      <div className="w-full rounded-2xl border border-line bg-white p-5 sm:p-5.5 shadow-2xs space-y-3.5">
        {/* Chart Header Toolbar */}
        <div className="flex items-center justify-between pb-3 border-b border-line/60 flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-[15px] font-bold text-text flex items-center gap-2">
                <IconChart width={16} height={16} className="text-signal" />
                <span>{currentTfData.title}</span>
              </h3>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                {currentTfData.badge}
              </span>
            </div>
            <p className="text-[12.5px] text-text-3 mt-0.5">
              {currentTfData.subtitle}
            </p>
          </div>

          {/* Area vs Bar View Toggle */}
          <div className="inline-flex rounded-lg border border-line bg-canvas p-0.5 text-[11.5px] font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setChartViewType("area")}
              className={cx(
                "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                chartViewType === "area"
                  ? "bg-white text-text font-bold shadow-2xs"
                  : "text-text-3 hover:text-text",
              )}
            >
              Area Curve
            </button>
            <button
              type="button"
              onClick={() => setChartViewType("bar")}
              className={cx(
                "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                chartViewType === "bar"
                  ? "bg-white text-text font-bold shadow-2xs"
                  : "text-text-3 hover:text-text",
              )}
            >
              Bar Chart
            </button>
          </div>
        </div>

        {/* Timeframe Metric Stat Banner (Fixed & Live-Synced on Hover) */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-2/40 border border-line/70 flex-wrap gap-2 transition-colors">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 block">
              {hoveredPointIndex !== null &&
              currentTfData.points[hoveredPointIndex]
                ? `${currentTfData.points[hoveredPointIndex].label} Metric`
                : currentTfData.metricLabel}
            </span>
            <p className="text-[22px] font-bold text-text font-(family-name:--font-bricolage) leading-none mt-1">
              {hoveredPointIndex !== null &&
              currentTfData.points[hoveredPointIndex] ? (
                <span className="text-signal">
                  {currentTfData.points[hoveredPointIndex].value}
                </span>
              ) : (
                currentTfData.metricValue
              )}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[12px] text-signal font-mono font-bold block">
              {hoveredPointIndex !== null &&
              currentTfData.points[hoveredPointIndex]
                ? `Milestone: ${currentTfData.points[hoveredPointIndex].label}`
                : currentTfData.metricSub}
            </span>
            <span className="text-[11px] text-text-3 font-mono">
              Active Timeframe: {timeRange.toUpperCase()} · Live Telemetry
            </span>
          </div>
        </div>

        {/* Full-Width High-Resolution Chart Display Area */}
        <div className="pt-1">
          {chartViewType === "area" ? (
            /* Smooth High-Resolution SVG Area Curve (viewBox 0 0 800 200 with Safe Bounds) */
            <div className="w-full relative py-1">
              <div className="h-40 sm:h-48 w-full relative">
                <svg
                  viewBox="0 0 800 200"
                  preserveAspectRatio="none"
                  className="size-full overflow-visible"
                >
                  <defs>
                    <linearGradient
                      id={`tfGrad-full-${timeRange}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#0f766e"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="60%"
                        stopColor="#0f766e"
                        stopOpacity="0.06"
                      />
                      <stop
                        offset="100%"
                        stopColor="#0f766e"
                        stopOpacity="0.0"
                      />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines & Guide Ticks */}
                  <g className="stroke-line/50 stroke-1 stroke-dasharray-2">
                    <line x1="30" y1="35" x2="770" y2="35" />
                    <line x1="30" y1="85" x2="770" y2="85" />
                    <line x1="30" y1="135" x2="770" y2="135" />
                    <line x1="30" y1="185" x2="770" y2="185" />
                  </g>

                  {/* Y-Axis Value Labels */}
                  <g className="fill-text-3 text-[10px] font-mono select-none opacity-60">
                    <text x="35" y="32">
                      {currentTfData.yTicks[0]}
                    </text>
                    <text x="35" y="82">
                      {currentTfData.yTicks[1]}
                    </text>
                    <text x="35" y="132">
                      {currentTfData.yTicks[2]}
                    </text>
                    <text x="35" y="182">
                      {currentTfData.yTicks[3]}
                    </text>
                  </g>

                  {/* Area fill */}
                  <path
                    d={currentTfData.areaD}
                    fill={`url(#tfGrad-full-${timeRange})`}
                  />

                  {/* Smooth Trendline */}
                  <path
                    d={currentTfData.pathD}
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Vertical Tracking Line on Hover */}
                  {hoveredPointIndex !== null &&
                    currentTfData.points[hoveredPointIndex] && (
                      <line
                        x1={currentTfData.points[hoveredPointIndex].cx}
                        y1={30}
                        x2={currentTfData.points[hoveredPointIndex].cx}
                        y2={185}
                        stroke="#0f766e"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.4"
                      />
                    )}

                  {/* Interactive Data Points with Wide Safe Targets */}
                  {currentTfData.points.map((pt, i) => {
                    const isHovered = hoveredPointIndex === i;
                    return (
                      <g
                        key={i}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPointIndex(i)}
                        onMouseLeave={() => setHoveredPointIndex(null)}
                      >
                        {/* Invisible Wide Hit Area */}
                        <circle
                          cx={pt.cx}
                          cy={pt.cy}
                          r="22"
                          fill="transparent"
                        />

                        {/* Soft Outer Halo Ring on Hover */}
                        {isHovered && (
                          <circle
                            cx={pt.cx}
                            cy={pt.cy}
                            r="11"
                            fill="#0f766e"
                            opacity="0.2"
                          />
                        )}

                        {/* Point Circle */}
                        <circle
                          cx={pt.cx}
                          cy={pt.cy}
                          r={isHovered ? 6 : 4}
                          fill={isHovered ? "#0f766e" : "#ffffff"}
                          stroke="#0f766e"
                          strokeWidth={isHovered ? 2.5 : 2}
                          className="transition-all duration-100"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* X-Axis Labels */}
              <div className="flex items-center justify-between text-[11px] text-text-3 font-mono mt-2 px-4 pt-2 border-t border-line/60">
                {currentTfData.points.map((pt, i) => (
                  <span
                    key={i}
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className={cx(
                      "transition-colors cursor-pointer text-center truncate",
                      hoveredPointIndex === i ? "text-signal font-bold" : "",
                    )}
                  >
                    {pt.label}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            /* Bar Chart View */
            <div className="space-y-3 py-1">
              <div className="flex items-end justify-between gap-3 h-40 sm:h-48 px-4 pt-4 border-b border-line/60">
                {currentTfData.points.map((bar, i) => {
                  const isHovered = hoveredPointIndex === i;
                  return (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredPointIndex(i)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                      className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer"
                    >
                      <div
                        className={cx(
                          "text-[10px] font-mono transition-opacity whitespace-nowrap",
                          isHovered
                            ? "text-signal font-bold opacity-100"
                            : "text-text-3 opacity-0 group-hover:opacity-100",
                        )}
                      >
                        {bar.value}
                      </div>
                      <div
                        className={cx(
                          "w-full max-w-[48px] rounded-t-lg transition-all duration-200",
                          isHovered
                            ? "bg-signal shadow-md"
                            : "bg-signal/70 group-hover:bg-signal",
                        )}
                        style={{ height: bar.height }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Bar Labels */}
              <div className="flex items-center justify-between text-[11px] text-text-3 font-mono px-4">
                {currentTfData.points.map((bar, i) => (
                  <span
                    key={i}
                    onMouseEnter={() => setHoveredPointIndex(i)}
                    onMouseLeave={() => setHoveredPointIndex(null)}
                    className={cx(
                      "flex-1 text-center truncate cursor-pointer",
                      hoveredPointIndex === i ? "text-signal font-bold" : "",
                    )}
                  >
                    {bar.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Compact KPI Grid (4 Cards — below chart) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {/* Metric 1: Platform MRR */}
        <div className="rounded-xl border border-line bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">
              Platform MRR
            </span>
            <span className="rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 font-mono">
              {ADMIN_KPI.growthMoM}
            </span>
          </div>
          <p className="font-(family-name:--font-bricolage) text-xl font-bold text-text mt-1.5">
            {formatTaka(ADMIN_KPI.mrrBDT)}
          </p>
          <p className="text-[11px] text-text-3 font-mono mt-0.5">
            ARR: {formatTaka(ADMIN_KPI.arrBDT)} ·{" "}
            {ADMIN_KPI.activePaidMerchants} Paid
          </p>
          <div className="mt-2.5 pt-2 border-t border-line/60">
            <div className="flex items-center justify-between text-[10px] text-text-3 mb-1 font-mono">
              <span>Q3 Goal: ৳2,00,000</span>
              <span className="font-semibold text-text">86.5%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-surface-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-signal"
                style={{ width: "86.5%" }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Total Closed GMV */}
        <div className="rounded-xl border border-line bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">
              Total Closed GMV
            </span>
            <span className="rounded-md bg-signal/[0.08] border border-signal/20 px-1.5 py-0.5 text-[10px] font-bold text-signal font-mono">
              AI Closed
            </span>
          </div>
          <p className="font-(family-name:--font-bricolage) text-xl font-bold text-text mt-1.5">
            {formatTaka(ADMIN_KPI.platformGmvBDT)}
          </p>
          <p className="text-[11px] text-text-3 font-mono mt-0.5">
            {ADMIN_KPI.courierBookingsTotal.toLocaleString()} Automated
            Deliveries
          </p>
          <div className="mt-2.5 pt-2 border-t border-line/60 flex items-center justify-between text-[10.5px] text-text-3">
            <span>Avg Basket Value:</span>
            <span className="font-semibold font-mono text-text">৳1,663</span>
          </div>
        </div>

        {/* Metric 3: Active Registered Merchants */}
        <div className="rounded-xl border border-line bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">
              Active Merchants
            </span>
            <span className="rounded-md bg-surface-2 border border-line px-1.5 py-0.5 text-[10px] font-bold text-text font-mono">
              154 Total
            </span>
          </div>
          <p className="font-(family-name:--font-bricolage) text-xl font-bold text-text mt-1.5">
            {ADMIN_KPI.activePaidMerchants}{" "}
            <span className="text-[13px] font-normal text-text-3">Paid</span>
          </p>
          <p className="text-[11px] text-text-3 mt-0.5">
            {ADMIN_KPI.trialMerchants} Trial ·{" "}
            {ADMIN_KPI.customEnterpriseMerchants} Enterprise
          </p>
          <div className="mt-2.5 pt-2 border-t border-line/60 flex items-center justify-between text-[10.5px] text-text-3">
            <span>30-Day Retention:</span>
            <span className="font-semibold font-mono text-emerald-700">
              94.2%
            </span>
          </div>
        </div>

        {/* Metric 4: AI Resolution Rate */}
        <div className="rounded-xl border border-line bg-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-text-3">
            <span className="text-[10.5px] font-bold uppercase tracking-wider">
              AI Auto-Resolution
            </span>
            <span className="rounded-md bg-signal/[0.08] border border-signal/20 px-1.5 py-0.5 text-[10px] font-bold text-signal font-mono">
              Bangla + Vision
            </span>
          </div>
          <p className="font-(family-name:--font-bricolage) text-xl font-bold text-signal mt-1.5">
            {ADMIN_KPI.aiAutoResolutionRate}%
          </p>
          <p className="text-[11px] text-text-3 font-mono mt-0.5">
            {ADMIN_KPI.messages24h.toLocaleString()} msgs in 24h
          </p>
          <div className="mt-2.5 pt-2 border-t border-line/60 flex items-center justify-between text-[10.5px] text-text-3">
            <span>Avg Response Speed:</span>
            <span className="font-semibold font-mono text-signal">380ms</span>
          </div>
        </div>
      </div>

      {/* 4. FULL-WIDTH ECOSYSTEM SUITE: 3 Multi-Dimensional Pie/Donut Analytics */}
      <div className="w-full rounded-2xl border border-line bg-white p-5.5 sm:p-6 shadow-2xs space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-line/60 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-text flex items-center gap-2">
                <IconChart width={16} height={16} className="text-signal" />
                <span>Ecosystem Rail Telemetry &amp; Conversion Shares</span>
              </h3>
              <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                Live Rails Sync
              </span>
            </div>
            <p className="text-[12.5px] text-text-3 mt-0.5">
              Multi-dimensional distribution across connected sales channels,
              checkout payment rails, and courier logistics.
            </p>
          </div>
          <span className="text-[11px] font-mono text-text-3 bg-canvas px-3 py-1 rounded-lg border border-line shadow-2xs">
            3-Way Active Telemetry
          </span>
        </div>

        {/* 3 Interactive Donut / Pie Cards in a Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pie 1: Channel Conversion Share */}
          <div className="rounded-xl border border-line bg-surface-2/20 p-4 flex flex-col justify-between space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-line/60">
              <span className="text-[12.5px] font-bold text-text">
                1. Channel Conversion
              </span>
              <span className="text-[10px] font-mono text-signal font-semibold bg-signal/[0.08] px-2 py-0.5 rounded">
                Omnichannel
              </span>
            </div>

            {/* Donut Chart SVG with Center Focus */}
            <div className="flex flex-col items-center justify-center relative py-1">
              <div className="relative size-40 sm:size-44">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  {CHANNELS_DATA.map((ch) => {
                    const isHovered = hoveredChannel === ch.id;
                    const isAnyHovered = hoveredChannel !== null;
                    return (
                      <circle
                        key={ch.id}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={ch.color}
                        strokeWidth={isHovered ? 16 : 13}
                        strokeDasharray={ch.dasharray}
                        strokeDashoffset={ch.dashoffset}
                        opacity={isAnyHovered && !isHovered ? 0.35 : 1}
                        onMouseEnter={() => setHoveredChannel(ch.id)}
                        onMouseLeave={() => setHoveredChannel(null)}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                {/* Dynamic Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-3 truncate max-w-[105px]">
                    {activeHoverChannel
                      ? activeHoverChannel.short
                      : "Total GMV"}
                  </span>
                  <p className="text-[14.5px] font-bold text-text font-(family-name:--font-bricolage) leading-tight mt-0.5">
                    {activeHoverChannel
                      ? activeHoverChannel.revenueFormatted
                      : "৳৪.৮৯ Cr"}
                  </p>
                  <span className="text-[9px] font-mono text-signal font-semibold mt-0.5">
                    {activeHoverChannel
                      ? `${activeHoverChannel.pct}% · ${activeHoverChannel.orders}`
                      : "38,480 Orders"}
                  </span>
                </div>
              </div>
            </div>

            {/* Channel Legend Rows */}
            <div className="space-y-1.5 pt-1">
              {CHANNELS_DATA.map((ch) => {
                const IconComp = ch.icon;
                const isHovered = hoveredChannel === ch.id;
                return (
                  <div
                    key={ch.id}
                    onMouseEnter={() => setHoveredChannel(ch.id)}
                    onMouseLeave={() => setHoveredChannel(null)}
                    className={cx(
                      "flex items-center justify-between p-1.5 px-2 rounded-lg border transition-all cursor-pointer text-[11.5px]",
                      isHovered
                        ? "border-signal bg-signal/[0.08] shadow-2xs translate-x-0.5"
                        : "border-line/70 bg-white hover:bg-surface-2/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="grid size-5 place-items-center rounded text-white shrink-0"
                        style={{ backgroundColor: ch.color }}
                      >
                        <IconComp width={11} height={11} />
                      </div>
                      <span className="font-semibold text-text truncate max-w-[95px]">
                        {ch.short}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-text mr-1.5">
                        {ch.pct}%
                      </span>
                      <span className="text-text-3 text-[10px]">
                        {ch.revenueFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie 2: Billing & Payment Rails */}
          <div className="rounded-xl border border-line bg-surface-2/20 p-4 flex flex-col justify-between space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-line/60">
              <span className="text-[12.5px] font-bold text-text">
                2. Billing &amp; Payment Rails
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                Instant Payout
              </span>
            </div>

            {/* Donut Chart SVG with Center Focus */}
            <div className="flex flex-col items-center justify-center relative py-1">
              <div className="relative size-40 sm:size-44">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  {BILLING_DATA.map((b) => {
                    const isHovered = hoveredBilling === b.id;
                    const isAnyHovered = hoveredBilling !== null;
                    return (
                      <circle
                        key={b.id}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={b.color}
                        strokeWidth={isHovered ? 16 : 13}
                        strokeDasharray={b.dasharray}
                        strokeDashoffset={b.dashoffset}
                        opacity={isAnyHovered && !isHovered ? 0.35 : 1}
                        onMouseEnter={() => setHoveredBilling(b.id)}
                        onMouseLeave={() => setHoveredBilling(null)}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                {/* Dynamic Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-3 truncate max-w-[105px]">
                    {activeHoverBilling
                      ? activeHoverBilling.short
                      : "Total Rails"}
                  </span>
                  <p className="text-[14.5px] font-bold text-text font-(family-name:--font-bricolage) leading-tight mt-0.5">
                    {activeHoverBilling
                      ? activeHoverBilling.revenueFormatted
                      : "৳৪.৮৯ Cr"}
                  </p>
                  <span className="text-[9px] font-mono text-emerald-700 font-semibold mt-0.5">
                    {activeHoverBilling
                      ? `${activeHoverBilling.pct}% · ${activeHoverBilling.subtext}`
                      : "38,480 Txns"}
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Legend Rows */}
            <div className="space-y-1.5 pt-1">
              {BILLING_DATA.map((b) => {
                const isHovered = hoveredBilling === b.id;
                return (
                  <div
                    key={b.id}
                    onMouseEnter={() => setHoveredBilling(b.id)}
                    onMouseLeave={() => setHoveredBilling(null)}
                    className={cx(
                      "flex items-center justify-between p-1.5 px-2 rounded-lg border transition-all cursor-pointer text-[11.5px]",
                      isHovered
                        ? "border-signal bg-signal/[0.08] shadow-2xs translate-x-0.5"
                        : "border-line/70 bg-white hover:bg-surface-2/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: b.color }}
                      />
                      <span className="font-semibold text-text truncate max-w-[100px]">
                        {b.name}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-text mr-1.5">
                        {b.pct}%
                      </span>
                      <span className="text-text-3 text-[10px]">
                        {b.revenueFormatted}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie 3: Courier & Logistics Bridge */}
          <div className="rounded-xl border border-line bg-surface-2/20 p-4 flex flex-col justify-between space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-line/60">
              <span className="text-[12.5px] font-bold text-text">
                3. Courier Logistics Bridge
              </span>
              <span className="text-[10px] font-mono text-text-3 bg-canvas border border-line px-2 py-0.5 rounded">
                Auto-Booked
              </span>
            </div>

            {/* Donut Chart SVG with Center Focus */}
            <div className="flex flex-col items-center justify-center relative py-1">
              <div className="relative size-40 sm:size-44">
                <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                  {COURIER_DATA.map((c) => {
                    const isHovered = hoveredCourier === c.id;
                    const isAnyHovered = hoveredCourier !== null;
                    return (
                      <circle
                        key={c.id}
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke={c.color}
                        strokeWidth={isHovered ? 16 : 13}
                        strokeDasharray={c.dasharray}
                        strokeDashoffset={c.dashoffset}
                        opacity={isAnyHovered && !isHovered ? 0.35 : 1}
                        onMouseEnter={() => setHoveredCourier(c.id)}
                        onMouseLeave={() => setHoveredCourier(null)}
                        className="transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                </svg>

                {/* Dynamic Center Badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-text-3 truncate max-w-[105px]">
                    {activeHoverCourier
                      ? activeHoverCourier.short
                      : "Total Deliveries"}
                  </span>
                  <p className="text-[14.5px] font-bold text-text font-(family-name:--font-bricolage) leading-tight mt-0.5">
                    {activeHoverCourier
                      ? activeHoverCourier.parcelsFormatted
                      : "29,410 Parcels"}
                  </p>
                  <span className="text-[9px] font-mono text-signal font-semibold mt-0.5">
                    {activeHoverCourier
                      ? `${activeHoverCourier.pct}% · ${activeHoverCourier.successRate}`
                      : "95.6% Platform SLA"}
                  </span>
                </div>
              </div>
            </div>

            {/* Courier Legend Rows */}
            <div className="space-y-1.5 pt-1">
              {COURIER_DATA.map((c) => {
                const isHovered = hoveredCourier === c.id;
                return (
                  <div
                    key={c.id}
                    onMouseEnter={() => setHoveredCourier(c.id)}
                    onMouseLeave={() => setHoveredCourier(null)}
                    className={cx(
                      "flex items-center justify-between p-1.5 px-2 rounded-lg border transition-all cursor-pointer text-[11.5px]",
                      isHovered
                        ? "border-signal bg-signal/[0.08] shadow-2xs translate-x-0.5"
                        : "border-line/70 bg-white hover:bg-surface-2/60",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="font-semibold text-text truncate max-w-[100px]">
                        {c.name}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-text mr-1.5">
                        {c.pct}%
                      </span>
                      <span className="text-text-3 text-[10px]">
                        {c.successRate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Split: Top Performing Merchants Table (Compact) + Live Event Stream (Expanded) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.55fr_1fr] items-start">
        {/* Left Column: Top Performing Merchants Table (Compact Height) */}
        <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-line/50">
            <div>
              <h2 className="text-[14.5px] font-bold text-text">
                Top Performing Merchants
              </h2>
              <p className="text-[11.5px] text-text-3">
                High-volume merchants with live AI bot sales resolution
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: "all", label: "All Top" },
                  { id: "vip", label: "VIP / Scale" },
                  { id: "high_ai", label: "AI >95%" },
                  { id: "growth", label: "GMV >৳10L" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMerchantTab(tab.id)}
                  className={cx(
                    "rounded-md px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer",
                    merchantTab === tab.id
                      ? "bg-text text-white font-bold"
                      : "bg-canvas border border-line text-text-2 hover:bg-surface-2",
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-line text-text-3 text-[10.5px] font-semibold uppercase tracking-wider">
                  <th className="pb-2 pr-2.5">Store &amp; Merchant</th>
                  <th className="pb-2 pr-2.5">Channels</th>
                  <th className="pb-2 pr-2.5">Plan Tier</th>
                  <th className="pb-2 pr-2.5 text-right">Monthly GMV</th>
                  <th className="pb-2 pr-2.5 text-right">AI Rate</th>
                  <th className="pb-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {filteredMerchants.slice(0, 5).map((m) => {
                  const planInfo = getPlanInfo(m.plan);
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setInspectMerchant(m)}
                      className="hover:bg-surface-2/50 transition-colors cursor-pointer group"
                    >
                      {/* Store & Owner */}
                      <td className="py-2 pr-2.5">
                        <div className="flex items-center gap-2">
                          <div className="grid size-7 place-items-center rounded-lg bg-surface-2 border border-line text-text font-bold text-[11px] shrink-0 group-hover:border-signal/40">
                            {m.storeName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-text group-hover:text-signal transition-colors text-[12.5px] leading-tight">
                              {m.storeName}
                            </p>
                            <p className="text-[10.5px] text-text-3 font-mono">
                              {m.ownerName} · {m.city}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Channels */}
                      <td className="py-2 pr-2.5">
                        <div className="flex items-center gap-1">
                          {m.channels.includes("whatsapp") && (
                            <span
                              title="WhatsApp"
                              className="grid size-4.5 place-items-center rounded bg-canvas border border-line text-[#25D366]"
                            >
                              <IconWhatsApp width={9.5} height={9.5} />
                            </span>
                          )}
                          {m.channels.includes("messenger") && (
                            <span
                              title="Messenger"
                              className="grid size-4.5 place-items-center rounded bg-canvas border border-line text-[#1877F2]"
                            >
                              <IconMessenger width={9.5} height={9.5} />
                            </span>
                          )}
                          {m.channels.includes("instagram") && (
                            <span
                              title="Instagram"
                              className="grid size-4.5 place-items-center rounded bg-canvas border border-line text-[#E4405F]"
                            >
                              <IconInstagram width={9.5} height={9.5} />
                            </span>
                          )}
                          {m.channels.includes("web") && (
                            <span
                              title="Web"
                              className="grid size-4.5 place-items-center rounded bg-canvas border border-line text-signal"
                            >
                              <IconGlobe width={9.5} height={9.5} />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Plan Badge (Dynamic) */}
                      <td className="py-2 pr-2.5">
                        <span className="inline-block rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-text font-mono">
                          {planInfo.name}
                        </span>
                      </td>

                      {/* Monthly GMV (Right-aligned) */}
                      <td className="py-2 pr-2.5 text-right">
                        <span className="font-semibold text-text font-mono text-[12px]">
                          {formatTaka(m.monthlyGMV)}
                        </span>
                      </td>

                      {/* AI Rate (Right-aligned) */}
                      <td className="py-2 pr-2.5 text-right">
                        <span className="font-semibold font-mono text-signal text-[12px]">
                          {m.aiResolutionRate}%
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2 text-right">
                        <span
                          className={cx(
                            "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold border font-mono",
                            m.status === "active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : m.status === "trial"
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-red-200 bg-red-50 text-red-700",
                          )}
                        >
                          <span className="size-1 rounded-full bg-current" />
                          {m.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-1.5 border-t border-line flex items-center justify-between text-[11.5px] text-text-3">
            <span>
              Showing top {Math.min(5, filteredMerchants.length)} of 154 stores
            </span>
            <Link
              href="/admin/users"
              className="font-semibold text-signal hover:underline flex items-center gap-1"
            >
              <span>View Full Directory (154 Merchants)</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Live Event Stream (Expanded & Richer) */}
        <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-line/50">
            <h2 className="text-[14px] font-bold text-text flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-signal" />
              </span>
              <span>Live Event Stream</span>
            </h2>

            {/* Event Filter Pills */}
            <div className="flex items-center gap-1">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "order", label: "Orders" },
                  { id: "signup", label: "Signups" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActivityFilter(f.id)}
                  className={cx(
                    "rounded px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer",
                    activityFilter === f.id
                      ? "bg-surface-2 text-text font-bold"
                      : "text-text-3 hover:text-text",
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {filteredActivity.map((act) => (
              <div
                key={act.id}
                className="rounded-xl border border-line/80 bg-canvas/60 p-2.5 text-[12px] space-y-1 hover:border-signal/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-1">
                  <p className="font-semibold text-text truncate pr-2 text-[12px]">
                    {act.title}
                  </p>
                  <span className="text-[10px] text-text-3 font-mono shrink-0">
                    {act.time}
                  </span>
                </div>
                <p className="text-[11px] text-text-3 leading-relaxed">
                  {act.detail}
                </p>
              </div>
            ))}
          </div>

          {/* Quick System Status Footer */}
          <div className="pt-2 border-t border-line/60">
            <div className="flex items-center justify-between text-[11px] text-text-3">
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono">Live WebSocket Active</span>
              </div>
              <Link
                href="/admin/system"
                className="text-signal font-semibold hover:underline"
              >
                System API →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Quick Merchant Inspection Modal (When clicked from table) */}
      {inspectMerchant && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setInspectMerchant(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white border border-line p-6 shadow-2xl animate-in zoom-in-98 duration-150 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-signal/[0.08] border border-signal/20 text-signal font-bold text-base font-(family-name:--font-bricolage)">
                  {inspectMerchant.storeName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-text">
                    {inspectMerchant.storeName}
                  </h3>
                  <p className="text-[12px] text-text-3 font-mono">
                    ID: {inspectMerchant.id} · {inspectMerchant.city}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/console"
                  className="flex items-center rounded-lg bg-signal px-3.5 py-1.5 text-[12px] font-bold text-white shadow-2xs hover:bg-signal-deep transition-all"
                >
                  Open Console
                </Link>
                <button
                  type="button"
                  onClick={() => setInspectMerchant(null)}
                  className="grid size-7.5 place-items-center rounded-lg border border-line text-text-3 hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <IconClose width={13} height={13} />
                </button>
              </div>
            </div>

            {/* 4 Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="rounded-xl border border-line bg-canvas p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 block">
                  Monthly GMV
                </span>
                <p className="mt-1 text-[15px] font-bold text-text font-mono">
                  {formatTaka(inspectMerchant.monthlyGMV)}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-canvas p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 block">
                  AI Resolution
                </span>
                <p className="mt-1 text-[15px] font-bold text-signal font-mono">
                  {inspectMerchant.aiResolutionRate}%
                </p>
              </div>
              <div className="rounded-xl border border-line bg-canvas p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 block">
                  Catalog Size
                </span>
                <p className="mt-1 text-[15px] font-bold text-text font-mono">
                  {inspectMerchant.catalogItems} Items
                </p>
              </div>
              <div className="rounded-xl border border-line bg-canvas p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-3 block">
                  Total Orders
                </span>
                <p className="mt-1 text-[15px] font-bold text-text font-mono">
                  {inspectMerchant.totalOrders}
                </p>
              </div>
            </div>

            {/* Contact & Details Grid */}
            <div className="rounded-xl border border-line p-3.5 space-y-2 text-[12px] bg-surface-2/20">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-text-3 block text-[10.5px]">Owner</span>
                  <span className="font-semibold text-text">
                    {inspectMerchant.ownerName}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block text-[10.5px]">Phone</span>
                  <span className="font-mono text-text">
                    {inspectMerchant.phone}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block text-[10.5px]">Email</span>
                  <span className="text-text truncate block">
                    {inspectMerchant.email}
                  </span>
                </div>
                <div>
                  <span className="text-text-3 block text-[10.5px]">
                    Courier
                  </span>
                  <span className="font-semibold text-text uppercase font-mono">
                    {inspectMerchant.courier}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-line text-[12px]">
              <span className="text-text-3 font-mono">
                Plan: {getPlanInfo(inspectMerchant.plan).name}
              </span>
              <Link
                href="/admin/users"
                className="font-semibold text-signal hover:underline"
              >
                Full Merchant Inspector &amp; Plan Switcher →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 6. Broadcast Alert Modal (Enterprise Grade) */}
      {broadcastOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => setBroadcastOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white border border-line p-6 shadow-2xl space-y-4 animate-in zoom-in-98 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <div>
                <h3 className="text-[16px] font-bold text-text">
                  Broadcast Platform Announcement
                </h3>
                <p className="text-[12px] text-text-3 mt-0.5">
                  Push high-priority notice to merchant console dashboards
                  across Bangladesh.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setBroadcastOpen(false)}
                className="grid size-7.5 place-items-center rounded-lg border border-line text-text-3 hover:bg-surface-2 transition-colors cursor-pointer"
              >
                <IconClose width={13} height={13} />
              </button>
            </div>

            {broadcastSent ? (
              <div className="space-y-4 pt-1">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-[13px] font-semibold text-emerald-800 space-y-1">
                  <p className="font-bold">
                    ✓ Broadcast Queued &amp; Dispatched
                  </p>
                  <p className="text-[12px] font-normal text-emerald-700">
                    Your announcement has been broadcasted to all selected
                    merchants via live SSE websocket pipeline.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setBroadcastOpen(false)}
                  className="w-full rounded-xl bg-signal py-2.5 text-[12.5px] font-bold text-white shadow-2xs hover:bg-signal-deep transition-all cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-3.5 pt-1">
                {/* Target Audience Pill Switcher */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-3 block mb-1.5">
                    Target Audience
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "all", label: "All Stores (154)" },
                        { id: "paid", label: "Paid Only (126)" },
                        { id: "trial", label: "Trial (28)" },
                      ] as const
                    ).map((tg) => (
                      <button
                        key={tg.id}
                        type="button"
                        onClick={() => setBroadcastTarget(tg.id)}
                        className={cx(
                          "rounded-lg border py-1.5 text-[11px] font-semibold transition-all cursor-pointer text-center",
                          broadcastTarget === tg.id
                            ? "border-signal bg-signal text-white font-bold"
                            : "border-line bg-canvas text-text-2 hover:bg-white",
                        )}
                      >
                        {tg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Announcement Type */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-3 block mb-1.5">
                    Notice Type
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: "info", label: "System Info" },
                        { id: "maintenance", label: "Maintenance" },
                        { id: "promo", label: "Feature Release" },
                      ] as const
                    ).map((nt) => (
                      <button
                        key={nt.id}
                        type="button"
                        onClick={() => setBroadcastType(nt.id)}
                        className={cx(
                          "rounded-lg border py-1.5 text-[11px] font-semibold transition-all cursor-pointer text-center",
                          broadcastType === nt.id
                            ? "border-text bg-text text-white font-bold"
                            : "border-line bg-canvas text-text-2 hover:bg-white",
                        )}
                      >
                        {nt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-text-3 block mb-1.5">
                    Broadcast Message
                  </label>
                  <textarea
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="e.g. Scheduled Meta WhatsApp Cloud API maintenance tonight from 3:00 AM to 3:30 AM BST. AI failover is active."
                    className="w-full rounded-xl border border-line p-3 text-[12.5px] text-text placeholder:text-text-3/60 focus:border-signal focus:outline-none focus:ring-2 focus:ring-signal/15 resize-none"
                  />
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setBroadcastOpen(false)}
                    className="rounded-xl border border-line bg-white px-4 py-2 text-[12px] font-semibold text-text-2 hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastSent(true)}
                    disabled={!broadcastMessage.trim()}
                    className="rounded-xl bg-signal px-4.5 py-2 text-[12px] font-bold text-white shadow-2xs hover:bg-signal-deep transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Dispatch Broadcast
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

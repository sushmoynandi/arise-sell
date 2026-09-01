"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ADMIN_INVOICES,
  INITIAL_ADMIN_PLANS,
  ADMIN_MERCHANTS,
  AdminInvoice,
} from "@/data/admin";
import { getStoredPlans, subscribePlans } from "@/lib/plans-store";
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconSearch,
  IconDownload,
  IconArrowUpRight,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { formatTaka, cx } from "@/lib/format";
import { generateInvoicePdfBlob } from "@/lib/invoice-pdf";

// ─── Standard Calendar Months ───
type MonthItem = {
  num: number;
  name: string;
  nameBn: string;
};

const ALL_MONTHS: MonthItem[] = [
  { num: 1, name: "January", nameBn: "জানুয়ারি" },
  { num: 2, name: "February", nameBn: "ফেব্রুয়ারি" },
  { num: 3, name: "March", nameBn: "মার্চ" },
  { num: 4, name: "April", nameBn: "এপ্রিল" },
  { num: 5, name: "May", nameBn: "মে" },
  { num: 6, name: "June", nameBn: "জুন" },
  { num: 7, name: "July", nameBn: "জুলাই" },
  { num: 8, name: "August", nameBn: "আগস্ট" },
  { num: 9, name: "September", nameBn: "সেপ্টেম্বর" },
  { num: 10, name: "October", nameBn: "অক্টোবর" },
  { num: 11, name: "November", nameBn: "নভেম্বর" },
  { num: 12, name: "December", nameBn: "ডিসেম্বর" },
];

// All-time platform lifetime net gross revenue (Feb 2025 to Sep 2026)
const PLATFORM_LIFETIME_REVENUE_BDT = 2496000; // ৳24.96 Lakh Total Net Sales

function getOperatingMonths(year: number) {
  if (year === 2025) {
    return ALL_MONTHS.filter((m) => m.num >= 2);
  }
  return ALL_MONTHS.filter((m) => m.num <= 9);
}

// Monthly sales dataset (Direct cashflow sales: Monthly subs + Yearly packages sold that month)
type MonthlySalesSnapshot = {
  stores: number;
  growth: string;
  freeStores: number;
  growthMonthly: number;
  growthYearlySold: number;
  proMonthly: number;
  proYearlySold: number;
  vipMonthly: number;
  vipYearlySold: number;
  enterpriseDeals: number;
  promoCount: number;
  promoDiscountBDT: number;
};

const MONTHLY_DATA_2025: Record<number, MonthlySalesSnapshot> = {
  2: {
    stores: 12,
    growth: "Launch Month",
    freeStores: 3,
    growthMonthly: 5,
    growthYearlySold: 1,
    proMonthly: 2,
    proYearlySold: 0,
    vipMonthly: 1,
    vipYearlySold: 0,
    enterpriseDeals: 0,
    promoCount: 4,
    promoDiscountBDT: 600,
  },
  3: {
    stores: 16,
    growth: "+33.3%",
    freeStores: 4,
    growthMonthly: 6,
    growthYearlySold: 1,
    proMonthly: 3,
    proYearlySold: 1,
    vipMonthly: 1,
    vipYearlySold: 0,
    enterpriseDeals: 0,
    promoCount: 5,
    promoDiscountBDT: 850,
  },
  4: {
    stores: 20,
    growth: "+25.0%",
    freeStores: 5,
    growthMonthly: 8,
    growthYearlySold: 1,
    proMonthly: 4,
    proYearlySold: 1,
    vipMonthly: 1,
    vipYearlySold: 0,
    enterpriseDeals: 0,
    promoCount: 6,
    promoDiscountBDT: 1000,
  },
  5: {
    stores: 24,
    growth: "+20.0%",
    freeStores: 6,
    growthMonthly: 9,
    growthYearlySold: 1,
    proMonthly: 5,
    proYearlySold: 1,
    vipMonthly: 1,
    vipYearlySold: 1,
    enterpriseDeals: 0,
    promoCount: 7,
    promoDiscountBDT: 1200,
  },
  6: {
    stores: 28,
    growth: "+16.7%",
    freeStores: 7,
    growthMonthly: 10,
    growthYearlySold: 1,
    proMonthly: 6,
    proYearlySold: 1,
    vipMonthly: 2,
    vipYearlySold: 0,
    enterpriseDeals: 1,
    promoCount: 8,
    promoDiscountBDT: 1350,
  },
  7: {
    stores: 32,
    growth: "+14.3%",
    freeStores: 8,
    growthMonthly: 11,
    growthYearlySold: 1,
    proMonthly: 7,
    proYearlySold: 1,
    vipMonthly: 2,
    vipYearlySold: 1,
    enterpriseDeals: 1,
    promoCount: 9,
    promoDiscountBDT: 1500,
  },
  8: {
    stores: 35,
    growth: "+9.4%",
    freeStores: 9,
    growthMonthly: 12,
    growthYearlySold: 1,
    proMonthly: 8,
    proYearlySold: 1,
    vipMonthly: 2,
    vipYearlySold: 1,
    enterpriseDeals: 1,
    promoCount: 10,
    promoDiscountBDT: 1650,
  },
  9: {
    stores: 38,
    growth: "+8.6%",
    freeStores: 10,
    growthMonthly: 13,
    growthYearlySold: 1,
    proMonthly: 9,
    proYearlySold: 1,
    vipMonthly: 2,
    vipYearlySold: 1,
    enterpriseDeals: 1,
    promoCount: 11,
    promoDiscountBDT: 1800,
  },
  10: {
    stores: 40,
    growth: "+5.3%",
    freeStores: 11,
    growthMonthly: 14,
    growthYearlySold: 1,
    proMonthly: 9,
    proYearlySold: 1,
    vipMonthly: 2,
    vipYearlySold: 1,
    enterpriseDeals: 1,
    promoCount: 11,
    promoDiscountBDT: 1900,
  },
  11: {
    stores: 43,
    growth: "+7.5%",
    freeStores: 12,
    growthMonthly: 15,
    growthYearlySold: 1,
    proMonthly: 10,
    proYearlySold: 1,
    vipMonthly: 2,
    vipYearlySold: 1,
    enterpriseDeals: 1,
    promoCount: 12,
    promoDiscountBDT: 2100,
  },
  12: {
    stores: 45,
    growth: "+4.7%",
    freeStores: 13,
    growthMonthly: 15,
    growthYearlySold: 1,
    proMonthly: 11,
    proYearlySold: 1,
    vipMonthly: 2,
    vipYearlySold: 1,
    enterpriseDeals: 1,
    promoCount: 13,
    promoDiscountBDT: 2300,
  },
};

const MONTHLY_DATA_2026: Record<number, MonthlySalesSnapshot> = {
  1: {
    stores: 52,
    growth: "+15.6%",
    freeStores: 14,
    growthMonthly: 17,
    growthYearlySold: 1,
    proMonthly: 13,
    proYearlySold: 2,
    vipMonthly: 3,
    vipYearlySold: 1,
    enterpriseDeals: 1,
    promoCount: 8,
    promoDiscountBDT: 1400,
  },
  2: {
    stores: 65,
    growth: "+25.0%",
    freeStores: 16,
    growthMonthly: 20,
    growthYearlySold: 2,
    proMonthly: 17,
    proYearlySold: 2,
    vipMonthly: 5,
    vipYearlySold: 1,
    enterpriseDeals: 2,
    promoCount: 10,
    promoDiscountBDT: 1750,
  },
  3: {
    stores: 80,
    growth: "+23.1%",
    freeStores: 18,
    growthMonthly: 24,
    growthYearlySold: 2,
    proMonthly: 22,
    proYearlySold: 3,
    vipMonthly: 7,
    vipYearlySold: 1,
    enterpriseDeals: 3,
    promoCount: 14,
    promoDiscountBDT: 2450,
  }, // Ramadan
  4: {
    stores: 96,
    growth: "+20.0%",
    freeStores: 20,
    growthMonthly: 26,
    growthYearlySold: 3,
    proMonthly: 27,
    proYearlySold: 3,
    vipMonthly: 10,
    vipYearlySold: 2,
    enterpriseDeals: 5,
    promoCount: 18,
    promoDiscountBDT: 3200,
  }, // Boishakh
  5: {
    stores: 112,
    growth: "+16.7%",
    freeStores: 22,
    growthMonthly: 28,
    growthYearlySold: 3,
    proMonthly: 32,
    proYearlySold: 4,
    vipMonthly: 12,
    vipYearlySold: 2,
    enterpriseDeals: 6,
    promoCount: 22,
    promoDiscountBDT: 3850,
  }, // Eid Blitz
  6: {
    stores: 125,
    growth: "+11.6%",
    freeStores: 24,
    growthMonthly: 30,
    growthYearlySold: 2,
    proMonthly: 34,
    proYearlySold: 3,
    vipMonthly: 13,
    vipYearlySold: 2,
    enterpriseDeals: 6,
    promoCount: 16,
    promoDiscountBDT: 2800,
  },
  7: {
    stores: 138,
    growth: "+10.4%",
    freeStores: 26,
    growthMonthly: 31,
    growthYearlySold: 2,
    proMonthly: 36,
    proYearlySold: 3,
    vipMonthly: 13,
    vipYearlySold: 1,
    enterpriseDeals: 6,
    promoCount: 15,
    promoDiscountBDT: 2600,
  },
  8: {
    stores: 146,
    growth: "+5.8%",
    freeStores: 27,
    growthMonthly: 32,
    growthYearlySold: 1,
    proMonthly: 37,
    proYearlySold: 2,
    vipMonthly: 14,
    vipYearlySold: 1,
    enterpriseDeals: 6,
    promoCount: 14,
    promoDiscountBDT: 2450,
  },
  9: {
    stores: 154,
    growth: "+18.2%",
    freeStores: 28,
    growthMonthly: 32,
    growthYearlySold: 1,
    proMonthly: 38,
    proYearlySold: 2,
    vipMonthly: 14,
    vipYearlySold: 1,
    enterpriseDeals: 6,
    promoCount: 16,
    promoDiscountBDT: 2800,
  },
};

function getMerchantDetails(merchantName: string) {
  const match = ADMIN_MERCHANTS.find(
    (m) => m.storeName.toLowerCase() === merchantName.toLowerCase(),
  );
  if (match) return match;
  return {
    id: "m-store-custom",
    storeName: merchantName,
    ownerName: "Store Owner",
    email: `billing@${merchantName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com.bd`,
    phone: "+880 1712-345678",
    city: "Dhaka, Bangladesh",
    plan: "scale" as const,
    planName: "Active Tier",
    status: "active" as const,
    joinedDate: "2026-03-01",
    catalogItems: 250,
    monthlyGMV: 450000,
    totalOrders: 600,
    aiResolutionRate: 95.0,
    channels: ["whatsapp" as const, "messenger" as const],
    courier: "steadfast" as const,
    lastActive: "Active today",
  };
}

export default function AdminSubscriptionsPage() {
  const plans = useSyncExternalStore(
    subscribePlans,
    getStoredPlans,
    () => INITIAL_ADMIN_PLANS,
  );
  const [invoices] = useState<AdminInvoice[]>(ADMIN_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cadence: "monthly" vs "yearly"
  const [cadenceMode, setCadenceMode] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const isYearly = cadenceMode === "yearly";

  // Selected Year: 2026 (default) or 2025
  const [selectedYear, setSelectedYear] = useState<number>(2026);

  // Selected Month: 1..12 (default 9 = September)
  const [selectedMonth, setSelectedMonth] = useState<number>(9);

  // Valid operating months for the selected year
  const operatingMonths = useMemo(
    () => getOperatingMonths(selectedYear),
    [selectedYear],
  );

  // Ensure selectedMonth stays valid when switching year
  const effectiveMonthNum = useMemo(() => {
    if (selectedYear === 2025 && selectedMonth < 2) return 2;
    if (selectedYear === 2026 && selectedMonth > 9) return 9;
    return selectedMonth;
  }, [selectedYear, selectedMonth]);

  const activeMonthObj = useMemo(() => {
    return ALL_MONTHS.find((m) => m.num === effectiveMonthNum) || ALL_MONTHS[8];
  }, [effectiveMonthNum]);

  // Direct Cashflow Sales Model with Promo Discount Deduction (Net Revenue = Gross - Promo)
  const activePeriodData = useMemo(() => {
    const growthPlan = plans.find((p) => p.id === "plan-growth");
    const proPlan = plans.find((p) => p.id === "plan-business");
    const vipPlan = plans.find((p) => p.id === "plan-vip-scale");

    const growthMonthlyRate = growthPlan?.priceBDT ?? 200;
    const growthYearlyRate = growthPlan?.yearlyPriceBDT ?? 2000;

    const proMonthlyRate = proPlan?.priceBDT ?? 700;
    const proYearlyRate = proPlan?.yearlyPriceBDT ?? 7000;

    const vipMonthlyRate = vipPlan?.priceBDT ?? 2500;
    const vipYearlyRate = vipPlan?.yearlyPriceBDT ?? 25000;

    const customMonthlyRate = 12500;
    const customYearlyRate = 150000;

    if (isYearly) {
      // Aggregate all months of selected year (Sum of all 12 months)
      const dataMap =
        selectedYear === 2025 ? MONTHLY_DATA_2025 : MONTHLY_DATA_2026;
      const monthKeys = Object.keys(dataMap).map(Number);

      let totalStoresPeak = 0;
      let freeStoresPeak = 0;
      let totalMonthlyGrowthSubs = 0;
      let totalYearlyGrowthSold = 0;
      let totalMonthlyProSubs = 0;
      let totalYearlyProSold = 0;
      let totalMonthlyVipSubs = 0;
      let totalYearlyVipSold = 0;
      let totalEnterpriseDeals = 0;
      let totalPromoCount = 0;
      let totalPromoDiscount = 0;

      for (const m of monthKeys) {
        const snap = dataMap[m];
        if (snap.stores > totalStoresPeak) totalStoresPeak = snap.stores;
        if (snap.freeStores > freeStoresPeak) freeStoresPeak = snap.freeStores;
        totalMonthlyGrowthSubs += snap.growthMonthly;
        totalYearlyGrowthSold += snap.growthYearlySold;
        totalMonthlyProSubs += snap.proMonthly;
        totalYearlyProSold += snap.proYearlySold;
        totalMonthlyVipSubs += snap.vipMonthly;
        totalYearlyVipSold += snap.vipYearlySold;
        totalEnterpriseDeals = Math.max(
          totalEnterpriseDeals,
          snap.enterpriseDeals,
        );
        totalPromoCount += snap.promoCount;
        totalPromoDiscount += snap.promoDiscountBDT;
      }

      // Gross Revenues
      const growthGross =
        totalMonthlyGrowthSubs * growthMonthlyRate +
        totalYearlyGrowthSold * growthYearlyRate;
      const proGross =
        totalMonthlyProSubs * proMonthlyRate +
        totalYearlyProSold * proYearlyRate;
      const vipGross =
        totalMonthlyVipSubs * vipMonthlyRate +
        totalYearlyVipSold * vipYearlyRate;
      const enterpriseGross = totalEnterpriseDeals * customYearlyRate;

      // Promo distributions
      const growthPromos = Math.round(totalPromoCount * 0.38);
      const proPromos = Math.round(totalPromoCount * 0.5);
      const vipPromos = Math.max(
        1,
        totalPromoCount - (growthPromos + proPromos),
      );

      const growthPromoDisc = Math.round(totalPromoDiscount * 0.35);
      const proPromoDisc = Math.round(totalPromoDiscount * 0.5);
      const vipPromoDisc =
        totalPromoDiscount - (growthPromoDisc + proPromoDisc);

      // Net Revenues (Gross minus Promo Discount)
      const growthRev = growthGross - growthPromoDisc;
      const proRev = proGross - proPromoDisc;
      const vipRev = vipGross - vipPromoDisc;
      const enterpriseRev = enterpriseGross;

      const grossRevenue = growthGross + proGross + vipGross + enterpriseGross;
      const totalRevenue = growthRev + proRev + vipRev + enterpriseRev; // Net Revenue
      const totalPaid = totalStoresPeak - freeStoresPeak;

      const growthStoresTotal = Math.round(totalPaid * 0.35);
      const proStoresTotal = Math.round(totalPaid * 0.44);
      const vipStoresTotal = Math.round(totalPaid * 0.16);

      const planCards = [
        {
          id: "plan-free",
          name: "Free Trial",
          nameBn: "ফ্রি শুরু",
          badge: undefined,
          popular: false,
          monthlyRate: 0,
          yearlyRate: 0,
          ordersQuota: 40,
          totalStores: freeStoresPeak,
          monthlySubs: freeStoresPeak,
          yearlySubs: 0,
          promoUsers: 0,
          promoDiscount: 0,
          grossValue: 0,
          revenueValue: 0,
          isFree: true,
          isCustom: false,
        },
        {
          id: "plan-growth",
          name: "Growth",
          nameBn: "গ্রোথ",
          badge: "Best for Starters",
          popular: false,
          monthlyRate: growthMonthlyRate,
          yearlyRate: growthYearlyRate,
          ordersQuota: 200,
          totalStores: growthStoresTotal,
          monthlySubs: totalMonthlyGrowthSubs,
          yearlySubs: totalYearlyGrowthSold,
          promoUsers: growthPromos,
          promoDiscount: growthPromoDisc,
          grossValue: growthGross,
          revenueValue: growthRev,
          isFree: false,
          isCustom: false,
        },
        {
          id: "plan-business",
          name: "Business Pro",
          nameBn: "বিজনেস প্রো",
          badge: "Most Popular",
          popular: true,
          monthlyRate: proMonthlyRate,
          yearlyRate: proYearlyRate,
          ordersQuota: 800,
          totalStores: proStoresTotal,
          monthlySubs: totalMonthlyProSubs,
          yearlySubs: totalYearlyProSold,
          promoUsers: proPromos,
          promoDiscount: proPromoDisc,
          grossValue: proGross,
          revenueValue: proRev,
          isFree: false,
          isCustom: false,
        },
        {
          id: "plan-vip-scale",
          name: "VIP Scale",
          nameBn: "ভিআইপি স্কেল",
          badge: "Unlimited Scale",
          popular: false,
          monthlyRate: vipMonthlyRate,
          yearlyRate: vipYearlyRate,
          ordersQuota: 3500,
          totalStores: vipStoresTotal,
          monthlySubs: totalMonthlyVipSubs,
          yearlySubs: totalYearlyVipSold,
          promoUsers: vipPromos,
          promoDiscount: vipPromoDisc,
          grossValue: vipGross,
          revenueValue: vipRev,
          isFree: false,
          isCustom: false,
        },
        {
          id: "plan-custom-enterprise",
          name: "Custom Enterprise",
          nameBn: "কাস্টম ডিল ও চুক্তি",
          badge: undefined,
          popular: false,
          monthlyRate: customMonthlyRate,
          yearlyRate: customYearlyRate,
          ordersQuota: 0,
          totalStores: totalEnterpriseDeals,
          monthlySubs: 0,
          yearlySubs: totalEnterpriseDeals,
          promoUsers: 0,
          promoDiscount: 0,
          grossValue: enterpriseGross,
          revenueValue: enterpriseRev,
          isFree: false,
          isCustom: true,
        },
      ];

      return {
        grossRevenue,
        totalRevenue,
        totalMerchants: totalStoresPeak,
        totalPaid,
        trialMerchants: freeStoresPeak,
        growthLabel:
          selectedYear === 2025 ? "Inception Year" : "+320% (4.2x Scale)",
        promoCount: totalPromoCount,
        promoDiscountBDT: totalPromoDiscount,
        planCards,
        periodName: `${selectedYear} Annual Summary`,
        periodNameBn: `${selectedYear} বাৎসরিক সারাংশ`,
      };
    } else {
      // Single Selected Month (Direct Cashflow: Monthly fees + Yearly packages purchased that month minus Promo Discount)
      const dataMap =
        selectedYear === 2025 ? MONTHLY_DATA_2025 : MONTHLY_DATA_2026;
      const snap = dataMap[effectiveMonthNum] || dataMap[9];

      // Gross Sales
      const growthGross =
        snap.growthMonthly * growthMonthlyRate +
        snap.growthYearlySold * growthYearlyRate;
      const proGross =
        snap.proMonthly * proMonthlyRate + snap.proYearlySold * proYearlyRate;
      const vipGross =
        snap.vipMonthly * vipMonthlyRate + snap.vipYearlySold * vipYearlyRate;
      const enterpriseGross = snap.enterpriseDeals * customMonthlyRate;

      // Promo Discounts per plan
      const growthPromos = Math.round(snap.promoCount * 0.38);
      const proPromos = Math.round(snap.promoCount * 0.5);
      const vipPromos = Math.max(
        1,
        snap.promoCount - (growthPromos + proPromos),
      );

      const growthPromoDisc = growthPromos * 100;
      const proPromoDisc = proPromos * 200;
      const vipPromoDisc = Math.max(
        0,
        snap.promoDiscountBDT - (growthPromoDisc + proPromoDisc),
      );

      // Net Sales (Gross minus Promo Discount)
      const growthRev = growthGross - growthPromoDisc;
      const proRev = proGross - proPromoDisc;
      const vipRev = vipGross - vipPromoDisc;
      const enterpriseRev = enterpriseGross;

      const grossRevenue = growthGross + proGross + vipGross + enterpriseGross;
      const totalRevenue = growthRev + proRev + vipRev + enterpriseRev; // Net Revenue
      const totalPaid = snap.stores - snap.freeStores;

      const growthStores = snap.growthMonthly + snap.growthYearlySold;
      const proStores = snap.proMonthly + snap.proYearlySold;
      const vipStores = snap.vipMonthly + snap.vipYearlySold;

      const planCards = [
        {
          id: "plan-free",
          name: "Free Trial",
          nameBn: "ফ্রি শুরু",
          badge: undefined,
          popular: false,
          monthlyRate: 0,
          yearlyRate: 0,
          ordersQuota: 40,
          totalStores: snap.freeStores,
          monthlySubs: snap.freeStores,
          yearlySubs: 0,
          promoUsers: 0,
          promoDiscount: 0,
          grossValue: 0,
          revenueValue: 0,
          isFree: true,
          isCustom: false,
        },
        {
          id: "plan-growth",
          name: "Growth",
          nameBn: "গ্রোথ",
          badge: "Best for Starters",
          popular: false,
          monthlyRate: growthMonthlyRate,
          yearlyRate: growthYearlyRate,
          ordersQuota: 200,
          totalStores: growthStores,
          monthlySubs: snap.growthMonthly,
          yearlySubs: snap.growthYearlySold,
          promoUsers: growthPromos,
          promoDiscount: growthPromoDisc,
          grossValue: growthGross,
          revenueValue: growthRev,
          isFree: false,
          isCustom: false,
        },
        {
          id: "plan-business",
          name: "Business Pro",
          nameBn: "বিজনেস প্রো",
          badge: "Most Popular",
          popular: true,
          monthlyRate: proMonthlyRate,
          yearlyRate: proYearlyRate,
          ordersQuota: 800,
          totalStores: proStores,
          monthlySubs: snap.proMonthly,
          yearlySubs: snap.proYearlySold,
          promoUsers: proPromos,
          promoDiscount: proPromoDisc,
          grossValue: proGross,
          revenueValue: proRev,
          isFree: false,
          isCustom: false,
        },
        {
          id: "plan-vip-scale",
          name: "VIP Scale",
          nameBn: "ভিআইপি স্কেল",
          badge: "Unlimited Scale",
          popular: false,
          monthlyRate: vipMonthlyRate,
          yearlyRate: vipYearlyRate,
          ordersQuota: 3500,
          totalStores: vipStores,
          monthlySubs: snap.vipMonthly,
          yearlySubs: snap.vipYearlySold,
          promoUsers: vipPromos,
          promoDiscount: vipPromoDisc,
          grossValue: vipGross,
          revenueValue: vipRev,
          isFree: false,
          isCustom: false,
        },
        {
          id: "plan-custom-enterprise",
          name: "Custom Enterprise",
          nameBn: "কাস্টম ডিল ও চুক্তি",
          badge: undefined,
          popular: false,
          monthlyRate: customMonthlyRate,
          yearlyRate: customYearlyRate,
          ordersQuota: 0,
          totalStores: snap.enterpriseDeals,
          monthlySubs: 0,
          yearlySubs: snap.enterpriseDeals,
          promoUsers: 0,
          promoDiscount: 0,
          grossValue: enterpriseGross,
          revenueValue: enterpriseRev,
          isFree: false,
          isCustom: true,
        },
      ];

      return {
        grossRevenue,
        totalRevenue,
        totalMerchants: snap.stores,
        totalPaid,
        trialMerchants: snap.freeStores,
        growthLabel: snap.growth,
        promoCount: snap.promoCount,
        promoDiscountBDT: snap.promoDiscountBDT,
        planCards,
        periodName: `${activeMonthObj.name} ${selectedYear}`,
        periodNameBn: `${activeMonthObj.nameBn} ${selectedYear}`,
      };
    }
  }, [isYearly, selectedYear, effectiveMonthNum, activeMonthObj, plans]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.promoCode &&
          inv.promoCode.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesMethod =
        filterMethod === "all" ||
        (filterMethod === "bkash" &&
          inv.method.toLowerCase().includes("bkash")) ||
        (filterMethod === "nagad" &&
          inv.method.toLowerCase().includes("nagad")) ||
        (filterMethod === "ssl" &&
          inv.method.toLowerCase().includes("sslcommerz")) ||
        (filterMethod === "promo" && Boolean(inv.promoCode));

      return matchesSearch && matchesMethod;
    });
  }, [invoices, searchQuery, filterMethod]);

  const handleCopyTxId = (txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  };

  const handleExportCSV = () => {
    const today = new Date().toISOString().split("T")[0];

    const csvRows = [
      ["Platform Revenue & Subscription Billing Report"],
      [`Generated Date: ${today}`],
      [
        `Selected Reporting Period: ${activePeriodData.periodName} (${isYearly ? "Yearly Total" : "Monthly Net Cashflow Sales"})`,
      ],
      [
        `Gross Sales (Before Promo Discount): BDT ${activePeriodData.grossRevenue.toLocaleString()}`,
      ],
      [
        `Promo Discounts Given in Period: -BDT ${activePeriodData.promoDiscountBDT.toLocaleString()} (${activePeriodData.promoCount} Redemptions)`,
      ],
      [
        `Net Sales Collected (After Promo Discount): BDT ${activePeriodData.totalRevenue.toLocaleString()}`,
      ],
      [
        `Active Merchants: ${activePeriodData.totalMerchants} (${activePeriodData.totalPaid} Paid + ${activePeriodData.trialMerchants} Trial)`,
      ],
      [],
      ["--- PLAN DISTRIBUTION & NET SALES BREAKDOWN ---"],
      [
        "Plan Name",
        "Bengali Name",
        "Monthly Rate (BDT)",
        "Yearly Rate (BDT)",
        "Total Stores",
        "Monthly Subs",
        "Yearly Packages Sold",
        "Promo Users in Period",
        "Promo Discount (BDT)",
        "Gross Sales (BDT)",
        "Net Sales Collected (BDT)",
        "Store Share (%)",
        "Revenue Share (%)",
      ],
      ...activePeriodData.planCards.map((p) => [
        `"${p.name}"`,
        `"${p.nameBn}"`,
        p.monthlyRate,
        p.yearlyRate,
        p.totalStores,
        p.monthlySubs,
        p.yearlySubs,
        p.promoUsers,
        p.promoDiscount,
        p.grossValue,
        p.revenueValue,
        ((p.totalStores / activePeriodData.totalMerchants) * 100).toFixed(1) +
          "%",
        p.isFree
          ? "0.0%"
          : ((p.revenueValue / activePeriodData.totalRevenue) * 100).toFixed(
              1,
            ) + "%",
      ]),
      [],
      ["--- DETAILED BILLING INVOICES & SETTLEMENTS ---"],
      [
        "Invoice ID",
        "Merchant Name",
        "Subscription Tier",
        "Promo Code Applied",
        "Discount Amount (BDT)",
        "Final Paid (BDT)",
        "Payment Method",
        "Transaction ID (TxID)",
        "Billing Date",
        "Status",
      ],
      ...invoices.map((inv) => [
        `"${inv.id}"`,
        `"${inv.merchantName}"`,
        `"${inv.plan}"`,
        `"${inv.promoCode || "None"}"`,
        inv.discountBDT || 0,
        inv.amountBDT,
        `"${inv.method}"`,
        `"${inv.txId}"`,
        `"${inv.date}"`,
        `"${inv.status.toUpperCase()}"`,
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `revenue_report_${isYearly ? "yearly" : "monthly"}_${today}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSuccessMsg(
      `Revenue Report for ${activePeriodData.periodName} (.CSV) downloaded successfully!`,
    );
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadInvoice = async (inv: AdminInvoice) => {
    try {
      setIsDownloadingPdf(true);
      const pdfBlob = await generateInvoicePdfBlob(inv);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${inv.id}_${inv.merchantName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccessMsg(`Invoice #${inv.id} (.PDF) downloaded successfully!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err) {
      console.error("PDF generation error:", err);
      // Fallback to print-to-pdf dialog
      handlePrintInvoice(inv);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePrintInvoice = (inv: AdminInvoice) => {
    const merchant = getMerchantDetails(inv.merchantName);
    const originalPrice = inv.originalAmountBDT || inv.amountBDT;
    const discount = inv.discountBDT || 0;

    const existingIframe = document.getElementById("invoice-print-frame");
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "invoice-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${inv.id}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              background: #ffffff;
              color: #0f1419;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .invoice-box {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              background: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1px solid #e7e4de;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .company-name {
              font-size: 15px;
              font-weight: 700;
              color: #0f1419;
              margin-top: 4px;
              margin-bottom: 2px;
            }
            .company-details {
              font-size: 11.5px;
              color: #626b76;
              line-height: 1.4;
            }
            .invoice-meta {
              text-align: right;
              font-size: 11.5px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            }
            .invoice-title {
              font-size: 19px;
              font-weight: 800;
              color: #0f1419;
              display: inline-block;
              vertical-align: middle;
              margin-right: 6px;
            }
            .paid-badge {
              display: inline-block;
              background: rgba(10, 110, 80, 0.1);
              color: #0a6e50;
              font-weight: 700;
              font-size: 10.5px;
              padding: 2px 7px;
              border-radius: 4px;
              vertical-align: middle;
            }
            .billed-to {
              border-bottom: 1px solid #e7e4de;
              padding-bottom: 16px;
              margin-bottom: 16px;
              font-size: 11.5px;
            }
            .billed-to-label {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #626b76;
              font-family: ui-monospace, monospace;
              margin-bottom: 2px;
            }
            .merchant-name {
              font-size: 14px;
              font-weight: 700;
              color: #0f1419;
              margin-bottom: 2px;
            }
            .merchant-details {
              color: #4a5561;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
              margin-bottom: 14px;
            }
            thead tr {
              background: rgba(10, 110, 80, 0.06);
              border-top: 1px solid rgba(10, 110, 80, 0.2);
              border-bottom: 1px solid rgba(10, 110, 80, 0.2);
            }
            th {
              padding: 7px 10px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #0a6e50;
              font-family: ui-monospace, monospace;
              text-align: left;
            }
            td {
              padding: 9px 10px;
              border-bottom: 1px solid #f1efeb;
            }
            .item-title {
              font-weight: 700;
              font-size: 12.5px;
              color: #0f1419;
            }
            .item-desc {
              font-size: 10.5px;
              color: #626b76;
              margin-top: 2px;
            }
            .summary-container {
              display: flex;
              justify-content: flex-end;
              margin-top: 4px;
              margin-bottom: 18px;
            }
            .summary-box {
              width: 230px;
              font-size: 11.5px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 2.5px 0;
              color: #626b76;
            }
            .summary-row.discount {
              color: #8a4700;
              font-family: ui-monospace, monospace;
            }
            .summary-row.total {
              border-top: 1px solid #e7e4de;
              margin-top: 5px;
              padding-top: 5px;
              font-weight: 700;
              font-size: 13.5px;
              color: #0f1419;
            }
            .total-amount {
              color: #0a6e50;
              font-size: 16px;
              font-family: ui-monospace, monospace;
            }
            .footer {
              border-top: 1px solid #e7e4de;
              padding-top: 16px;
              text-align: center;
              font-size: 10.5px;
              color: #626b76;
              line-height: 1.4;
            }
            .footer-title {
              font-weight: 600;
              color: #0f1419;
              font-size: 11.5px;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <img src="/logo.png" alt="NextProduct AI" style="height: 26px; width: auto; object-fit: contain; margin-bottom: 3px;" />
                <div class="company-name">NextProduct AI Ltd.</div>
                <div class="company-details">
                  <div>House 42, Road 11, Banani, Dhaka-1213</div>
                  <div>support@nextproduct.ai</div>
                  <div style="font-family: ui-monospace, monospace; color: #4a5561; margin-top: 1px;">+880 9612-345678</div>
                </div>
              </div>
              <div class="invoice-meta">
                <div style="margin-bottom: 5px;">
                  <span class="invoice-title">INVOICE</span>
                  <span class="paid-badge">✓ PAID</span>
                </div>
                <div style="margin-bottom: 2px;"><span style="color: #626b76;">Invoice No: </span><strong style="color: #0a6e50;">${inv.id}</strong></div>
                <div style="margin-bottom: 2px;"><span style="color: #626b76;">Date: </span><span>${inv.date}</span></div>
                <div style="margin-bottom: 2px;"><span style="color: #626b76;">Method: </span><span>${inv.method}</span></div>
                <div><span style="color: #626b76;">TxID: </span><code style="font-size: 10px; background: #f4f3f0; padding: 1px 4px; border-radius: 3px; border: 1px solid #e7e4de;">${inv.txId}</code></div>
              </div>
            </div>

            <div class="billed-to">
              <div class="billed-to-label">Billed To:</div>
              <div class="merchant-name">${inv.merchantName}</div>
              <div class="merchant-details">Attn: ${merchant.ownerName} · ${merchant.city}</div>
              <div class="merchant-details" style="font-family: ui-monospace, monospace; font-size: 10.5px; margin-top: 1px;">${merchant.phone} · ${merchant.email}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th style="width: 55%;">Description</th>
                  <th style="text-align: center; width: 15%;">Period</th>
                  <th style="text-align: right; width: 15%;">Unit Price</th>
                  <th style="text-align: right; width: 15%;">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-title">${inv.plan} Subscription Tier</div>
                    <div class="item-desc">AI commerce auto-reply, orders processing &amp; courier sync</div>
                  </td>
                  <td style="text-align: center; font-family: ui-monospace, monospace; color: #4a5561;">1 Month</td>
                  <td style="text-align: right; font-family: ui-monospace, monospace;">৳${originalPrice.toLocaleString()}</td>
                  <td style="text-align: right; font-family: ui-monospace, monospace; font-weight: 700;">৳${originalPrice.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>

            <div class="summary-container">
              <div class="summary-box">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span style="font-family: ui-monospace, monospace; color: #0f1419;">৳${originalPrice.toLocaleString()}</span>
                </div>
                ${
                  inv.promoCode
                    ? `
                  <div class="summary-row discount">
                    <span>Discount (${inv.promoCode}):</span>
                    <span style="font-weight: 700;">-৳${discount.toLocaleString()}</span>
                  </div>
                `
                    : ""
                }
                <div class="summary-row">
                  <span>VAT / Tax (0%):</span>
                  <span style="font-family: ui-monospace, monospace; color: #0f1419;">৳০</span>
                </div>
                <div class="summary-row total">
                  <span>Total Paid:</span>
                  <span class="total-amount">৳${inv.amountBDT.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="footer-title">Thank you for partnering with NextProduct AI to power your commerce.</div>
              <div>Official electronic tax invoice &amp; payment receipt. For billing support, contact <strong style="color: #0a6e50; font-family: ui-monospace, monospace;">support@nextproduct.ai</strong></div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        iframe.remove();
      }, 2000);
    }, 250);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-1">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-2xl font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
            Subscriptions &amp; Billing Revenue
          </h1>
          <p className="text-[13.5px] text-text-3 mt-0.5">
            Platform recurring revenue analytics, promo discounts, timeline
            calendar filters, and merchant settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="signal"
            size="sm"
            onClick={handleExportCSV}
            className="gap-1.5 font-semibold text-[12.5px] h-9 px-3.5 cursor-pointer shadow-xs"
          >
            <IconDownload width={14} height={14} />
            <span>Export CSV / Excel</span>
          </Button>
        </div>
      </div>

      {/* ─── Success Notification ─── */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-signal/30 bg-signal/[0.07] p-3.5 text-[13px] font-medium text-signal shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <IconCheck
                width={16}
                height={16}
                className="shrink-0 text-signal"
              />
              <span>{successMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-text-3 hover:text-text p-1 cursor-pointer"
            >
              <IconClose width={14} height={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. Clean, Minimal & Professional Calendar Field Bar ─── */}
      <div className="rounded-2xl border border-line bg-white p-3.5 sm:p-4 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          {/* Left: Reporting Period Summary */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-bold text-text font-mono uppercase tracking-wide">
                Reporting Horizon:
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-signal/[0.08] px-2.5 py-0.5 text-[12px] font-bold text-signal font-mono">
                <span className="size-1.5 rounded-full bg-signal" />
                {activePeriodData.periodName}
              </span>
            </div>
            <p className="text-[12.5px] text-text-3 mt-0.5">
              {isYearly
                ? `Full annual sales (sum of 12 months after deducting promo discounts) for ${selectedYear}`
                : `Net sales collected (monthly subs + yearly packages minus promo discounts) for ${activeMonthObj.name} ${selectedYear}`}
            </p>
          </div>

          {/* Right: Calendar Dropdowns + Cadence Toggle */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* 1. Cadence Segmented Pill (Monthly vs Yearly) */}
            <div className="inline-flex items-center rounded-xl border border-line bg-surface-2/70 p-0.5 text-[12px] font-semibold font-mono shadow-2xs">
              <button
                type="button"
                onClick={() => setCadenceMode("monthly")}
                className={cx(
                  "rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                  !isYearly
                    ? "bg-white text-text shadow-2xs border border-line/80 font-bold"
                    : "text-text-3 hover:text-text",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setCadenceMode("yearly")}
                className={cx(
                  "rounded-lg px-3 py-1.5 transition-all cursor-pointer",
                  isYearly
                    ? "bg-white text-text shadow-2xs border border-line/80 font-bold"
                    : "text-text-3 hover:text-text",
                )}
              >
                Yearly
              </button>
            </div>

            {/* 2. Calendar Year Select Field */}
            <div className="relative flex items-center">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none rounded-xl bg-white border border-line pl-3 pr-7 py-1.5 text-[13px] font-semibold text-text focus:border-signal outline-none cursor-pointer shadow-2xs hover:border-line-2 transition-colors h-9"
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
              <span className="absolute right-2.5 text-text-3 text-[10px] pointer-events-none font-mono font-bold">
                ▾
              </span>
            </div>

            {/* 3. Calendar Month Select Field (Visible when Monthly is active) */}
            {!isYearly && (
              <div className="relative flex items-center">
                <select
                  value={effectiveMonthNum}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="appearance-none rounded-xl bg-white border border-line pl-3 pr-7 py-1.5 text-[13px] font-semibold text-text focus:border-signal outline-none cursor-pointer shadow-2xs hover:border-line-2 transition-colors h-9"
                >
                  {operatingMonths.map((m) => (
                    <option key={m.num} value={m.num}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2.5 text-text-3 text-[10px] pointer-events-none font-mono font-bold">
                  ▾
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3. Top Primary Metrics (Net Sales after Promo Deductions) ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Platform Total Lifetime Revenue */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
              Total Platform Sales
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[10.5px] font-bold text-signal font-mono">
              Lifetime Net
            </span>
          </div>
          <p className="mt-2 text-[28px] font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
            {formatTaka(PLATFORM_LIFETIME_REVENUE_BDT)}
          </p>
          <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
            <span className="text-text-3">Feb 2025 – Present</span>
            <span className="text-signal font-semibold">
              সর্বমোট অর্জিত নেট সেল
            </span>
          </div>
        </div>

        {/* Card 2: Selected Period Net Sales (Gross minus Promo Discount) */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
              {isYearly
                ? `${selectedYear} Net Sales`
                : `${activeMonthObj.name} Net Sales`}
            </span>
            <span className="rounded-md bg-signal/[0.08] px-2 py-0.5 text-[10.5px] font-bold text-signal font-mono">
              {activePeriodData.growthLabel}
            </span>
          </div>
          <p className="mt-2 text-[28px] font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
            {formatTaka(activePeriodData.totalRevenue)}
          </p>
          <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
            <span className="text-text-3">
              Gross: {formatTaka(activePeriodData.grossRevenue)}
            </span>
            <span className="text-signal font-semibold font-mono">
              (Promo: -{formatTaka(activePeriodData.promoDiscountBDT)})
            </span>
          </div>
        </div>

        {/* Card 3: Active Merchants in this Selected Month/Year */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
              Active Merchants
            </span>
            <span className="rounded-md bg-surface-2 text-text-3 px-2 py-0.5 text-[10.5px] font-bold font-mono">
              {isYearly ? `${selectedYear} Cohort` : activeMonthObj.name}
            </span>
          </div>
          <p className="mt-2 text-[28px] font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
            {activePeriodData.totalMerchants}{" "}
            <span className="text-[15px] text-text-3 font-normal font-sans">
              Stores
            </span>
          </p>
          <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
            <span className="text-text-3">
              {activePeriodData.totalPaid} Paid ·{" "}
              {activePeriodData.trialMerchants} Trial
            </span>
            <span className="text-signal font-semibold">100% সচল</span>
          </div>
        </div>

        {/* Card 4: Billing Success Rate & Promo Redemptions */}
        <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs relative overflow-hidden group hover:border-signal/40 transition-colors">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
              Billing &amp; Promo Status
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[10.5px] font-bold text-signal font-mono">
              <span className="size-1.5 rounded-full bg-signal" />
              99.4%
            </span>
          </div>
          <p className="mt-2 text-[28px] font-bold text-signal font-(family-name:--font-bricolage) tracking-tight">
            99.4%
          </p>
          <div className="mt-2 pt-2 border-t border-line/60 flex items-center justify-between text-[11.5px]">
            <span className="text-text-3">
              🏷️ {activePeriodData.promoCount} Promos Applied
            </span>
            <span className="text-amber-800 font-semibold font-mono">
              -{formatTaka(activePeriodData.promoDiscountBDT)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 4. Subscription Plan Breakdown (Net Sales after Promo Deductions) ─── */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-3.5">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[16px] font-bold text-text">
                Subscription Plan Breakdown ({activePeriodData.periodName})
              </h2>
              {/* Promo Code Message Pill */}
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-300/70 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-900">
                🏷️ {activePeriodData.promoCount} Promos Applied · -
                {formatTaka(activePeriodData.promoDiscountBDT)}
              </span>
            </div>
            <p className="text-[12.5px] text-text-3 mt-0.5">
              Net sales collected per plan after deducting promo discounts for{" "}
              {activePeriodData.periodName}.
            </p>
          </div>

          <div className="text-[12.5px] font-mono text-text-3">
            <span>Net Period Sales:</span>{" "}
            <strong className="text-text font-bold text-[14px]">
              {formatTaka(activePeriodData.totalRevenue)}
            </strong>
            <span className="text-text-3 font-normal ml-0.5">
              {isYearly ? "/ yr" : "/ mo"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {activePeriodData.planCards.map((plan) => {
            const storeShare = (
              (plan.totalStores / activePeriodData.totalMerchants) *
              100
            ).toFixed(1);
            const revenueShare = plan.isFree
              ? "0.0"
              : (
                  (plan.revenueValue / activePeriodData.totalRevenue) *
                  100
                ).toFixed(1);

            return (
              <div
                key={plan.id}
                className={cx(
                  "rounded-xl border p-4.5 flex flex-col justify-between transition-all min-h-[235px]",
                  plan.popular
                    ? "border-signal/50 ring-1 ring-signal/15 bg-white shadow-2xs"
                    : plan.isCustom
                      ? "border-line bg-gradient-to-b from-surface-2/60 via-white to-surface-2/40 hover:bg-white hover:shadow-xs"
                      : "border-line bg-canvas hover:bg-white hover:shadow-xs",
                )}
              >
                <div className="space-y-3">
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between min-h-[36px]">
                    <div>
                      <span className="font-bold text-text text-[14.5px] block leading-tight">
                        {plan.name}
                      </span>
                      <span className="text-[11px] text-text-3 font-mono">
                        {plan.nameBn}
                      </span>
                    </div>
                    {plan.badge && (
                      <span
                        className={cx(
                          "rounded px-1.5 py-0.5 text-[9.5px] font-bold font-mono shrink-0",
                          plan.popular
                            ? "bg-signal text-white"
                            : "bg-surface-2 text-text-2 border border-line",
                        )}
                      >
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  {/* Public Pricing Rates */}
                  <div className="border-t border-line/60 pt-2 space-y-1">
                    {plan.isFree ? (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-bold text-text text-[16.5px] font-(family-name:--font-bricolage)">
                            ৳০
                          </span>
                          <span className="text-[10.5px] text-text-3 font-mono">
                            Free Forever
                          </span>
                        </div>
                        <span className="text-[11px] text-text-3 block">
                          40 orders quota
                        </span>
                      </div>
                    ) : plan.isCustom ? (
                      <div>
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-text text-[16px] font-(family-name:--font-bricolage)">
                              {formatTaka(plan.monthlyRate)}
                            </span>
                            <span className="text-[10.5px] text-text-3 font-mono">
                              / mo
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-text-2 text-[11.5px] font-mono">
                              {formatTaka(plan.yearlyRate)}
                            </span>
                            <span className="text-[9.5px] text-text-3 font-mono">
                              {" "}
                              / yr
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-text-3 block">
                          Unlimited orders · Dedicated SLA
                        </span>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline justify-between">
                          <div className="flex items-baseline gap-1">
                            <span className="font-bold text-text text-[16px] font-(family-name:--font-bricolage)">
                              {formatTaka(plan.monthlyRate)}
                            </span>
                            <span className="text-[10.5px] text-text-3 font-mono">
                              / mo
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-text-2 text-[11.5px] font-mono">
                              {formatTaka(plan.yearlyRate)}
                            </span>
                            <span className="text-[9.5px] text-text-3 font-mono">
                              {" "}
                              / yr
                            </span>
                          </div>
                        </div>
                        <span className="text-[11px] text-text-3 block">
                          {plan.ordersQuota.toLocaleString()} orders quota
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Subscriber Counts & Promo Breakdown per Plan */}
                  <div className="pt-2 border-t border-line/40 text-[11px] font-mono space-y-1 bg-surface-2/30 p-2 rounded-lg">
                    {plan.isFree ? (
                      <>
                        <div className="flex items-center justify-between text-text">
                          <span className="text-text-3">Trial Active:</span>
                          <span className="font-bold font-(family-name:--font-bricolage) text-[13px] text-text">
                            {plan.totalStores}{" "}
                            <span className="text-[10.5px] text-text-3 font-normal">
                              Stores
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[10.5px] text-text-3">
                          <span>Free Quota Given:</span>
                          <span className="font-semibold font-mono text-text">
                            {(
                              plan.totalStores * plan.ordersQuota
                            ).toLocaleString()}{" "}
                            Orders
                          </span>
                        </div>
                      </>
                    ) : plan.isCustom ? (
                      <div className="flex items-center justify-between text-text">
                        <span className="text-text-3">Custom Deals:</span>
                        <span className="font-bold font-(family-name:--font-bricolage) text-[13px] text-text">
                          {plan.totalStores}{" "}
                          <span className="text-[10.5px] text-text-3 font-normal">
                            Brands
                          </span>
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between text-text">
                          <span className="text-text-3">Monthly Plan:</span>
                          <span className="font-bold font-(family-name:--font-bricolage) text-[13px] text-text">
                            {plan.monthlySubs}{" "}
                            <span className="text-[10.5px] text-text-3 font-normal">
                              Stores
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-text">
                          <span className="text-text-3">Yearly Plan:</span>
                          <span className="font-bold font-(family-name:--font-bricolage) text-[13px] text-signal">
                            {plan.yearlySubs}{" "}
                            <span className="text-[10.5px] text-text-3 font-normal">
                              Sold
                            </span>
                          </span>
                        </div>
                        {plan.promoUsers > 0 && (
                          <div className="flex items-center justify-between pt-1 border-t border-line/40 text-[10.5px]">
                            <span className="text-amber-900 flex items-center gap-1 truncate">
                              <span>🏷️</span> Promo ({plan.promoUsers}):
                            </span>
                            <span className="font-bold font-mono text-amber-900 text-[11px] shrink-0 ml-1">
                              -{formatTaka(plan.promoDiscount)}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer Metrics (Net Sales Collected after Promo Discount) */}
                <div className="pt-3 border-t border-line/60 mt-3 flex items-center justify-between text-[11.5px]">
                  <div>
                    <span className="font-bold text-text block">
                      {plan.totalStores} {plan.isCustom ? "Brands" : "Stores"}
                    </span>
                    <span className="text-[10.5px] text-text-3 font-mono">
                      {storeShare}% Stores
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-signal block">
                      {plan.isFree ? "৳০" : formatTaka(plan.revenueValue)}
                    </span>
                    <span className="text-[10.5px] text-signal font-semibold font-mono">
                      {revenueShare}% Net Sales
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── 5. Payment Gateways Strip ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs flex items-center justify-between hover:border-line-2 transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-pink-500/10 border border-pink-200 grid place-items-center text-pink-700 font-bold font-mono text-[13px] shrink-0">
              bK
            </div>
            <div>
              <p className="font-bold text-text text-[14px]">
                bKash Tokenized Direct
              </p>
              <p className="text-[11.5px] text-text-3 font-mono">
                68% of Volume · Instant Auto-Debit
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-signal font-mono">
            <span className="size-1.5 rounded-full bg-signal" />
            LIVE
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs flex items-center justify-between hover:border-line-2 transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-500/10 border border-orange-200 grid place-items-center text-orange-700 font-bold font-mono text-[13px] shrink-0">
              NG
            </div>
            <div>
              <p className="font-bold text-text text-[14px]">
                Nagad Direct Gateway
              </p>
              <p className="text-[11.5px] text-text-3 font-mono">
                22% of Volume · Webhook Instant
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-signal font-mono">
            <span className="size-1.5 rounded-full bg-signal" />
            LIVE
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4.5 shadow-2xs flex items-center justify-between hover:border-line-2 transition-colors">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-200 grid place-items-center text-blue-700 font-bold font-mono text-[13px] shrink-0">
              SSL
            </div>
            <div>
              <p className="font-bold text-text text-[14px]">
                SSLCommerz (Cards)
              </p>
              <p className="text-[11.5px] text-text-3 font-mono">
                10% of Volume · Visa / Mastercard
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-bold text-signal font-mono">
            <span className="size-1.5 rounded-full bg-signal" />
            LIVE
          </span>
        </div>
      </div>

      {/* ─── 6. Recent Billing Invoices Table with Promo Code Column & Filters ─── */}
      <div className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4.5 border-b border-line bg-surface-2/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15.5px] font-bold text-text">
                Recent Billing Invoices &amp; Settlements
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11.5px] font-bold text-signal font-mono transition-all">
                <span className="size-1.5 rounded-full bg-signal animate-pulse" />
                {filteredInvoices.length}{" "}
                {filteredInvoices.length === 1 ? "Invoice" : "Invoices"}
              </span>
            </div>
            <p className="text-[12px] text-text-3 mt-0.5">
              Automated renewal payments, promo code discounts, and tokenized
              auto-debits. (Click any invoice to view official receipt)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex items-center">
              <IconSearch
                width={14}
                height={14}
                className="absolute left-3 text-text-3 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search merchant, TxID, or Promo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-xl border border-line bg-white pl-8.5 pr-3 py-1.5 text-[12.5px] text-text focus:border-signal outline-none w-48 sm:w-56"
              />
            </div>

            <div className="flex items-center rounded-xl border border-line bg-white p-0.5 text-[11.5px] font-semibold">
              <button
                type="button"
                onClick={() => setFilterMethod("all")}
                className={cx(
                  "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                  filterMethod === "all"
                    ? "bg-signal text-white shadow-2xs font-bold"
                    : "text-text-3 hover:text-text",
                )}
              >
                All
              </button>

              <button
                type="button"
                onClick={() => setFilterMethod("bkash")}
                className={cx(
                  "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                  filterMethod === "bkash"
                    ? "bg-signal text-white shadow-2xs font-bold"
                    : "text-text-3 hover:text-text",
                )}
              >
                bKash
              </button>

              <button
                type="button"
                onClick={() => setFilterMethod("nagad")}
                className={cx(
                  "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                  filterMethod === "nagad"
                    ? "bg-signal text-white shadow-2xs font-bold"
                    : "text-text-3 hover:text-text",
                )}
              >
                Nagad
              </button>

              <button
                type="button"
                onClick={() => setFilterMethod("ssl")}
                className={cx(
                  "rounded-lg px-2.5 py-1 transition-all cursor-pointer",
                  filterMethod === "ssl"
                    ? "bg-signal text-white shadow-2xs font-bold"
                    : "text-text-3 hover:text-text",
                )}
              >
                SSL
              </button>

              <button
                type="button"
                onClick={() => setFilterMethod("promo")}
                className={cx(
                  "rounded-lg px-2.5 py-1 transition-all cursor-pointer flex items-center gap-1 font-mono",
                  filterMethod === "promo"
                    ? "bg-signal text-white shadow-2xs font-bold"
                    : "text-text-3 hover:text-text",
                )}
              >
                <span>🏷️ Promo</span>
              </button>
            </div>
          </div>
        </div>

        {/* Invoices Table with Clickable Invoice ID to View Receipt */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line bg-surface-2/40 text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
              <tr>
                <th className="py-3 px-4.5">Invoice ID</th>
                <th className="py-3 px-4">Merchant Shop</th>
                <th className="py-3 px-4">Plan Tier</th>
                <th className="py-3 px-4">Promo / Discount</th>
                <th className="py-3 px-4">Paid Amount</th>
                <th className="py-3 px-4">Payment Method &amp; TxID</th>
                <th className="py-3 px-4.5 text-right">Billing Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-text-3 text-[13px]"
                  >
                    No invoices found matching &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-surface-2/40 transition-colors cursor-pointer group"
                    title="Click to view official tax receipt"
                  >
                    <td className="py-3.5 px-4.5 font-mono font-bold text-signal group-hover:underline flex items-center gap-1">
                      <span>{inv.id}</span>
                      <IconArrowUpRight
                        width={11}
                        height={11}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-text">
                      {inv.merchantName}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-text-2">
                      <span
                        className={cx(
                          "rounded-md px-2 py-0.5 text-[11.5px] border font-mono font-semibold",
                          inv.plan.includes("Custom")
                            ? "bg-signal/[0.08] text-signal border-signal/20"
                            : "bg-surface-2 text-text border-line",
                        )}
                      >
                        {inv.plan}
                      </span>
                    </td>
                    {/* Promo Code Column */}
                    <td className="py-3.5 px-4">
                      {inv.promoCode ? (
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-300/80 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-800">
                            🏷️ {inv.promoCode}
                          </span>
                          <span className="text-[10.5px] text-signal font-mono font-semibold">
                            -{formatTaka(inv.discountBDT || 0)} Discount
                          </span>
                        </div>
                      ) : (
                        <span className="text-text-3 font-mono text-[11px] opacity-60">
                          — Standard
                        </span>
                      )}
                    </td>
                    {/* Paid Amount */}
                    <td className="py-3.5 px-4 font-bold text-text font-(family-name:--font-bricolage) text-[14px]">
                      <div>
                        <span>{formatTaka(inv.amountBDT)}</span>
                        {inv.originalAmountBDT && (
                          <span className="ml-1.5 text-[11px] text-text-3 line-through font-normal font-mono opacity-70">
                            {formatTaka(inv.originalAmountBDT)}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Payment Method & TxID */}
                    <td className="py-3.5 px-4">
                      <span className="block text-text font-medium text-[12.5px]">
                        {inv.method}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <code className="font-mono text-[11px] text-text-3 bg-surface-2 px-1.5 py-0.5 rounded">
                          {inv.txId}
                        </code>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyTxId(inv.txId);
                          }}
                          className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                          title="Copy TxID"
                        >
                          {copiedTxId === inv.txId ? (
                            <IconCheck
                              width={12}
                              height={12}
                              className="text-signal"
                            />
                          ) : (
                            <IconCopy width={12} height={12} />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4.5 text-right text-text-3 font-mono text-[12px]">
                      {inv.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 7. Perfect Standard A4 Paper Invoice Modal ─── */}
      <AnimatePresence>
        {selectedInvoice &&
          (() => {
            const merchant = getMerchantDetails(selectedInvoice.merchantName);
            const originalPrice =
              selectedInvoice.originalAmountBDT || selectedInvoice.amountBDT;
            const discount = selectedInvoice.discountBDT || 0;

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:fixed print:inset-0 print:p-0 print:m-0 print:bg-white print:z-[9999]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="w-full max-w-lg bg-white rounded-2xl border border-line shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none print:m-0 print:p-0"
                >
                  {/* Modal Action Bar (Screen Only) */}
                  <div className="flex items-center justify-between px-5 py-2.5 border-b border-line bg-surface-2/40 print:hidden">
                    <div className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-signal" />
                      <span className="text-[12.5px] font-bold text-text">
                        Tax Invoice #{selectedInvoice.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isDownloadingPdf}
                        onClick={() => handleDownloadInvoice(selectedInvoice)}
                        className="cursor-pointer font-semibold text-[11.5px] h-7.5 px-2.5 gap-1.5 hover:border-signal hover:text-signal disabled:opacity-50"
                      >
                        <IconDownload
                          width={13}
                          height={13}
                          className={cx(isDownloadingPdf && "animate-bounce")}
                        />
                        <span>
                          {isDownloadingPdf
                            ? "Generating PDF..."
                            : "Download PDF"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="signal"
                        size="sm"
                        onClick={() => handlePrintInvoice(selectedInvoice)}
                        className="cursor-pointer font-semibold text-[11.5px] h-7.5 px-2.5 gap-1.5 shadow-2xs"
                      >
                        <span>Print / PDF</span>
                      </Button>
                      <button
                        type="button"
                        onClick={() => setSelectedInvoice(null)}
                        className="text-text-3 hover:text-text p-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer ml-1"
                        title="Close"
                      >
                        <IconClose width={15} height={15} />
                      </button>
                    </div>
                  </div>

                  {/* Compact & Clean Document Canvas */}
                  <div
                    id="printable-invoice"
                    className="p-5 sm:p-6 space-y-4 bg-white text-text print:p-8 print:space-y-8 print:w-full"
                  >
                    {/* Header: Company Info (Left) + Invoice Metadata (Right) */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line pb-3.5">
                      {/* Left: Logo & Company */}
                      <div className="space-y-0.5">
                        <Image
                          src="/logo.png"
                          alt="NextProduct AI"
                          width={135}
                          height={36}
                          className="h-6.5 w-auto object-contain mb-1"
                          priority
                        />
                        <h2 className="font-bold text-[14px] text-text">
                          NextProduct AI Ltd.
                        </h2>
                        <div className="text-[11.5px] text-text-3 leading-snug">
                          <p>House 42, Road 11, Banani, Dhaka-1213</p>
                          <p>support@nextproduct.ai</p>
                          <p className="font-mono text-[11px] text-text-2">
                            +880 9612-345678
                          </p>
                        </div>
                      </div>

                      {/* Right: Invoice Title & Meta */}
                      <div className="sm:text-right space-y-0.5 text-[11.5px] font-mono">
                        <div className="flex sm:justify-end items-center gap-1.5 mb-1">
                          <h1 className="text-[18px] font-bold tracking-tight text-text font-(family-name:--font-bricolage)">
                            INVOICE
                          </h1>
                          <span className="inline-flex items-center gap-1 font-bold text-signal bg-signal/[0.09] px-2 py-0.5 rounded text-[10.5px]">
                            <IconCheck
                              width={11}
                              height={11}
                              className="stroke-[3]"
                            />
                            PAID
                          </span>
                        </div>
                        <p>
                          <span className="text-text-3">Invoice No: </span>
                          <strong className="text-signal font-bold">
                            {selectedInvoice.id}
                          </strong>
                        </p>
                        <p>
                          <span className="text-text-3">Date: </span>
                          <span className="text-text">
                            {selectedInvoice.date}
                          </span>
                        </p>
                        <p className="text-[11px]">
                          <span className="text-text-3">Method: </span>
                          <span className="text-text">
                            {selectedInvoice.method}
                          </span>
                        </p>
                        <p className="text-[10.5px] text-text-3">
                          <span>TxID: </span>
                          <code className="text-text font-semibold bg-surface-2 px-1 py-0.2 rounded border border-line/60">
                            {selectedInvoice.txId}
                          </code>
                        </p>
                      </div>
                    </div>

                    {/* Billed To (Customer Details) */}
                    <div className="space-y-0.5 border-b border-line pb-3.5 text-[12px]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-text-3 font-mono">
                        Billed To:
                      </p>
                      <p className="font-bold text-text text-[14px]">
                        {selectedInvoice.merchantName}
                      </p>
                      <p className="text-text-2">
                        Attn: {merchant.ownerName} · {merchant.city}
                      </p>
                      <p className="text-text-3 font-mono text-[11px]">
                        {merchant.phone} · {merchant.email}
                      </p>
                    </div>

                    {/* Clean Service Table with Brand Theme Header */}
                    <div>
                      <table className="w-full text-left text-[12px] border-collapse">
                        <thead>
                          <tr className="bg-signal/[0.06] border-y border-signal/20 text-[10px] font-bold uppercase tracking-wider text-signal font-mono">
                            <th className="py-2 px-3">Description</th>
                            <th className="py-2 px-2 text-center">Period</th>
                            <th className="py-2 px-2 text-right">Unit Price</th>
                            <th className="py-2 px-3 text-right">
                              Amount (BDT)
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line/60">
                          <tr>
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-text text-[13px]">
                                {selectedInvoice.plan} Subscription Tier
                              </p>
                              <p className="text-[11px] text-text-3 mt-0.5">
                                AI commerce auto-reply, orders processing &amp;
                                courier sync
                              </p>
                            </td>
                            <td className="py-2.5 px-2 text-center font-mono text-text-2 text-[11.5px] whitespace-nowrap">
                              1 Month
                            </td>
                            <td className="py-2.5 px-2 text-right font-mono text-text">
                              {formatTaka(originalPrice)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold font-mono text-text">
                              {formatTaka(originalPrice)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Financial Summary */}
                    <div className="flex justify-end pt-0.5">
                      <div className="w-full sm:w-56 space-y-1 text-[12px]">
                        <div className="flex justify-between text-text-3 px-1">
                          <span>Subtotal:</span>
                          <span className="font-mono text-text">
                            {formatTaka(originalPrice)}
                          </span>
                        </div>

                        {selectedInvoice.promoCode && (
                          <div className="flex justify-between text-amber-800 font-mono text-[11px] px-1">
                            <span>Discount ({selectedInvoice.promoCode}):</span>
                            <span className="font-bold">
                              -{formatTaka(discount)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between text-text-3 text-[11px] px-1">
                          <span>VAT / Tax (0%):</span>
                          <span className="font-mono text-text">৳০</span>
                        </div>

                        <div className="flex justify-between items-baseline pt-1.5 border-t border-line font-bold text-[13.5px] px-1">
                          <span className="text-text">Total Paid:</span>
                          <span className="text-signal font-mono text-[17px]">
                            {formatTaka(selectedInvoice.amountBDT)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-line pt-3.5 text-center text-[11px] text-text-3 leading-relaxed">
                      <p className="font-semibold text-text text-[12px]">
                        Thank you for partnering with NextProduct AI to power
                        your commerce.
                      </p>
                      <p className="text-[10px] text-text-3 mt-0.5">
                        Official electronic tax invoice &amp; payment receipt.
                        For priority billing support, contact{" "}
                        <span className="text-signal font-mono font-medium">
                          support@nextproduct.ai
                        </span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })()}
      </AnimatePresence>
    </div>
  );
}

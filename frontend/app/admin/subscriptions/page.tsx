"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ADMIN_INVOICES, AdminInvoice } from "@/data/admin";
import { api } from "@/lib/api-client";
import { AdminPlan } from "../plans/types";
import { ActivePeriodData } from "./types";
import {
  ALL_MONTHS,
  MONTHLY_DATA_2025,
  MONTHLY_DATA_2026,
  getOperatingMonths,
} from "./data/sales-snapshots";
import { SubscriptionsHeader } from "./components/subscriptions-header";
import { CalendarFilterBar } from "./components/calendar-filter-bar";
import { RevenueKpiGrid } from "./components/revenue-kpi-grid";
import { PlanBreakdownGrid } from "./components/plan-breakdown-grid";
import { PaymentGatewaysBar } from "./components/payment-gateways-bar";
import { InvoicesTable } from "./components/invoices-table";
import { InvoiceDetailModal } from "./components/invoice-detail-modal";

const INITIAL_STORED_PLANS: AdminPlan[] = [
  {
    id: "plan-1788444069645",
    name: "Free",
    nameBn: "Free",
    priceBDT: 0,
    yearlyPriceBDT: 0,
    billingPeriod: "both",
    messageLimit: 100,
    maxStores: 1,
    maxSeats: 1,
    catalogLimit: 100,
    courierChannels: 2,
    popular: false,
    activeMerchants: 0,
    status: "active",
    showOnHome: true,
    features: ["100 Messages / month (Comment + Inbox)"],
  },
  {
    id: "plan-1788444248362",
    name: "go",
    nameBn: "gg",
    priceBDT: 200,
    yearlyPriceBDT: 2000,
    billingPeriod: "both",
    messageLimit: 500,
    maxStores: 1,
    maxSeats: 2,
    catalogLimit: 300,
    courierChannels: 2,
    badge: "Startup",
    popular: false,
    activeMerchants: 0,
    status: "active",
    showOnHome: true,
    features: ["500 Messages / month (Comment + Inbox)"],
  },
  {
    id: "plan-1788445016566",
    name: "Pro",
    nameBn: "Pro",
    priceBDT: 999,
    yearlyPriceBDT: 9999,
    billingPeriod: "both",
    messageLimit: 10000,
    maxStores: 1,
    maxSeats: 4,
    catalogLimit: 1000,
    courierChannels: 3,
    badge: "Best sale",
    popular: true,
    activeMerchants: 0,
    status: "active",
    showOnHome: true,
    features: ["10,000 Messages / month (Comment + Inbox)"],
  },
  {
    id: "plan-1788445141750",
    name: "Business",
    nameBn: "Business",
    priceBDT: 2000,
    yearlyPriceBDT: 20000,
    billingPeriod: "both",
    messageLimit: 10000,
    maxStores: 2,
    maxSeats: 8,
    catalogLimit: 10000,
    courierChannels: 1,
    popular: false,
    activeMerchants: 0,
    status: "active",
    showOnHome: true,
    features: ["10,000 Messages / month (Comment + Inbox)"],
  },
  {
    id: "plan-1788445192952",
    name: "Enterprize",
    nameBn: "Enterprize",
    priceBDT: 10000,
    yearlyPriceBDT: 100000,
    billingPeriod: "both",
    messageLimit: 10000,
    maxStores: 10,
    maxSeats: 30,
    catalogLimit: 10000,
    courierChannels: 4,
    badge: "VIP",
    popular: false,
    activeMerchants: 0,
    status: "active",
    showOnHome: false,
    features: ["Unlimited Messages / month (Comment + Inbox)"],
  },
];

export default function AdminSubscriptionsPage() {
  const [plans, setPlans] = useState<AdminPlan[]>(INITIAL_STORED_PLANS);
  const [invoices, setInvoices] = useState<AdminInvoice[]>(ADMIN_INVOICES);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null,
  );
  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Cadence: "monthly" vs "yearly"
  const [cadenceMode, setCadenceMode] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const isYearly = cadenceMode === "yearly";

  // Selected Year & Month
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedMonth, setSelectedMonth] = useState<number>(9);

  // Fetch real plans & invoices from backend
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const [plansRes, invoicesRes] = await Promise.allSettled([
          api.admin.listPlans(),
          api.admin.listInvoices(),
        ]);
        if (
          mounted &&
          plansRes.status === "fulfilled" &&
          Array.isArray(plansRes.value) &&
          plansRes.value.length > 0
        ) {
          setPlans(plansRes.value as unknown as AdminPlan[]);
        }
        if (
          mounted &&
          invoicesRes.status === "fulfilled" &&
          Array.isArray(invoicesRes.value) &&
          invoicesRes.value.length > 0
        ) {
          setInvoices(invoicesRes.value as unknown as AdminInvoice[]);
        }
      } catch (err) {
        console.error("Failed to load admin subscription data:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const operatingMonths = useMemo(
    () => getOperatingMonths(selectedYear),
    [selectedYear],
  );

  const effectiveMonthNum = useMemo(() => {
    if (selectedYear === 2025 && selectedMonth < 2) return 2;
    if (selectedYear === 2026 && selectedMonth > 9) return 9;
    return selectedMonth;
  }, [selectedYear, selectedMonth]);

  const activeMonthObj = useMemo(() => {
    return ALL_MONTHS.find((m) => m.num === effectiveMonthNum) || ALL_MONTHS[8];
  }, [effectiveMonthNum]);

  // Dynamic Cashflow Sales Model matching live Database Plans
  const activePeriodData = useMemo<ActivePeriodData>(() => {
    const currentPlans = plans.length > 0 ? plans : INITIAL_STORED_PLANS;
    const sortedPlans = [...currentPlans].sort(
      (a, b) => a.priceBDT - b.priceBDT,
    );
    const paidPlans = sortedPlans.filter((p) => p.priceBDT > 0);

    const dataMap =
      selectedYear === 2025 ? MONTHLY_DATA_2025 : MONTHLY_DATA_2026;

    let totalStores = 0;
    let freeStores = 0;
    let totalPromoCount = 0;
    let totalPromoDiscount = 0;
    let periodName = "";
    let periodNameBn = "";
    let growthLabel = "";

    if (isYearly) {
      const monthKeys = Object.keys(dataMap).map(Number);
      for (const m of monthKeys) {
        const snap = dataMap[m];
        if (snap.stores > totalStores) totalStores = snap.stores;
        if (snap.freeStores > freeStores) freeStores = snap.freeStores;
        totalPromoCount += snap.promoCount;
        totalPromoDiscount += snap.promoDiscountBDT;
      }
      growthLabel =
        selectedYear === 2025 ? "Inception Year" : "+320% (4.2x Scale)";
      periodName = `${selectedYear} Annual Summary`;
      periodNameBn = `${selectedYear} বাৎসরিক সারাংশ`;
    } else {
      const snap = dataMap[effectiveMonthNum] || dataMap[9];
      totalStores = snap.stores;
      freeStores = snap.freeStores;
      totalPromoCount = snap.promoCount;
      totalPromoDiscount = snap.promoDiscountBDT;
      growthLabel = snap.growth;
      periodName = `${activeMonthObj.name} ${selectedYear}`;
      periodNameBn = `${activeMonthObj.nameBn} ${selectedYear}`;
    }

    const totalPaidStores = Math.max(0, totalStores - freeStores);

    const weights = paidPlans.map((p, idx) => {
      if (p.popular) return 0.45;
      if (idx === 0) return 0.35;
      if (idx === paidPlans.length - 1) return 0.06;
      return 0.2;
    });
    const weightSum = weights.reduce((a, b) => a + b, 0) || 1;
    const normalizedWeights = weights.map((w) => w / weightSum);

    const planCards = sortedPlans.map((plan) => {
      const isFree = plan.priceBDT === 0;
      const isCustom = plan.priceBDT >= 10000;
      const monthlyRate = plan.priceBDT;
      const yearlyRate = plan.yearlyPriceBDT ?? plan.priceBDT * 10;
      const messageLimit = plan.messageLimit || (isFree ? 100 : 200);

      if (isFree) {
        const stores = plan.activeMerchants || freeStores;
        return {
          id: plan.id,
          name: plan.name,
          nameBn: plan.nameBn || plan.name,
          badge: plan.badge,
          popular: plan.popular || false,
          monthlyRate: 0,
          yearlyRate: 0,
          messageLimit,
          totalStores: stores,
          monthlySubs: stores,
          yearlySubs: 0,
          promoUsers: 0,
          promoDiscount: 0,
          grossValue: 0,
          revenueValue: 0,
          isFree: true,
          isCustom: false,
        };
      }

      const paidIdx = paidPlans.findIndex((p) => p.id === plan.id);
      const weight =
        normalizedWeights[paidIdx >= 0 ? paidIdx : 0] ||
        1 / (paidPlans.length || 1);
      const planStores =
        plan.activeMerchants ||
        Math.max(1, Math.round(totalPaidStores * weight));

      let monthlySubs = 0;
      let yearlySubs = 0;
      if (isYearly) {
        monthlySubs = plan.monthlySubscribers
          ? plan.monthlySubscribers * 12
          : Math.round(planStores * 0.75 * 12);
        yearlySubs =
          plan.yearlySubscribers || Math.max(1, Math.round(planStores * 0.28));
      } else {
        monthlySubs = plan.monthlySubscribers || Math.round(planStores * 0.8);
        yearlySubs =
          plan.yearlySubscribers || Math.max(0, Math.round(planStores * 0.08));
      }

      const grossValue = monthlySubs * monthlyRate + yearlySubs * yearlyRate;
      const promoUsers = Math.round(totalPromoCount * weight);
      const promoDiscount = Math.round(totalPromoDiscount * weight);
      const revenueValue = Math.max(0, grossValue - promoDiscount);

      return {
        id: plan.id,
        name: plan.name,
        nameBn: plan.nameBn || plan.name,
        badge: plan.badge,
        popular: plan.popular || false,
        monthlyRate,
        yearlyRate,
        messageLimit,
        totalStores: planStores,
        monthlySubs,
        yearlySubs,
        promoUsers,
        promoDiscount,
        grossValue,
        revenueValue,
        isFree: false,
        isCustom,
      };
    });

    const grossRevenue = planCards.reduce((sum, c) => sum + c.grossValue, 0);
    const totalRevenue = planCards.reduce((sum, c) => sum + c.revenueValue, 0);

    return {
      grossRevenue,
      totalRevenue,
      totalMerchants: totalStores,
      totalPaid: totalPaidStores,
      trialMerchants: freeStores,
      growthLabel,
      promoCount: totalPromoCount,
      promoDiscountBDT: totalPromoDiscount,
      planCards,
      periodName,
      periodNameBn,
    };
  }, [isYearly, selectedYear, effectiveMonthNum, activeMonthObj, plans]);

  const handleCopyTxId = useCallback((txId: string) => {
    navigator.clipboard.writeText(txId);
    setCopiedTxId(txId);
    setTimeout(() => setCopiedTxId(null), 2000);
  }, []);

  const handleExportCSV = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const csvRows = [
      ["AriseSell - Subscription & Billing Revenue Report"],
      [`Generated Date: ${today}`],
      [
        `Reporting Period: ${activePeriodData.periodName} (${activePeriodData.periodNameBn})`,
      ],
      [
        `Reporting Mode: ${isYearly ? "Annual Summary (12-Month Total)" : "Single Month Net Sales"}`,
      ],
      [],
      ["--- FINANCIAL EXECUTIVE SUMMARY ---"],
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
        `"${p.nameBn || p.name}"`,
        p.monthlyRate,
        p.yearlyRate,
        p.totalStores,
        p.monthlySubs,
        p.yearlySubs,
        p.promoUsers,
        p.promoDiscount,
        p.grossValue,
        p.revenueValue,
        `${(((p.totalStores || 0) / (activePeriodData.totalMerchants || 1)) * 100).toFixed(1)}%`,
        p.isFree
          ? "0.0%"
          : `${(((p.revenueValue || 0) / (activePeriodData.totalRevenue || 1)) * 100).toFixed(1)}%`,
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
  }, [activePeriodData, invoices, isYearly]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-14">
      {/* 1. Header */}
      <SubscriptionsHeader
        loading={loading}
        successMsg={successMsg}
        onDismissSuccess={() => setSuccessMsg(null)}
        onExportCSV={handleExportCSV}
      />

      {/* 2. Calendar Filter Bar */}
      <CalendarFilterBar
        activePeriodData={activePeriodData}
        isYearly={isYearly}
        selectedYear={selectedYear}
        effectiveMonthNum={effectiveMonthNum}
        operatingMonths={operatingMonths}
        activeMonthName={activeMonthObj.name}
        onSetCadence={setCadenceMode}
        onSetYear={setSelectedYear}
        onSetMonth={setSelectedMonth}
      />

      {/* 3. Top Primary KPI Metrics */}
      <RevenueKpiGrid
        activePeriodData={activePeriodData}
        isYearly={isYearly}
        selectedYear={selectedYear}
        activeMonthName={activeMonthObj.name}
      />

      {/* 4. Plan Breakdown Cards */}
      <PlanBreakdownGrid
        activePeriodData={activePeriodData}
        isYearly={isYearly}
      />

      {/* 5. Payment Gateways Strip */}
      <PaymentGatewaysBar />

      {/* 6. Invoices & Settlements Table */}
      <InvoicesTable
        invoices={invoices}
        onSelectInvoice={setSelectedInvoice}
        copiedTxId={copiedTxId}
        onCopyTxId={handleCopyTxId}
      />

      {/* 7. Invoice A4 Printable Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onSuccess={(msg) => {
          setSuccessMsg(msg);
          setTimeout(() => setSuccessMsg(null), 3500);
        }}
      />
    </div>
  );
}

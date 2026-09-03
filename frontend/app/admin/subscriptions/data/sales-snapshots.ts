import { ADMIN_MERCHANTS, AdminMerchant } from "@/data/admin";
import { MonthItem, MonthlySalesSnapshot } from "../types";

export const ALL_MONTHS: MonthItem[] = [
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

export const PLATFORM_LIFETIME_REVENUE_BDT = 2496000; // ৳24.96 Lakh Total Net Sales

export function getOperatingMonths(year: number): MonthItem[] {
  if (year === 2025) {
    return ALL_MONTHS.filter((m) => m.num >= 2);
  }
  return ALL_MONTHS.filter((m) => m.num <= 9);
}

export const MONTHLY_DATA_2025: Record<number, MonthlySalesSnapshot> = {
  2: { stores: 12, growth: "Launch Month", freeStores: 3, promoCount: 4, promoDiscountBDT: 600 },
  3: { stores: 16, growth: "+33.3%", freeStores: 4, promoCount: 5, promoDiscountBDT: 850 },
  4: { stores: 20, growth: "+25.0%", freeStores: 5, promoCount: 6, promoDiscountBDT: 1100 },
  5: { stores: 26, growth: "+30.0%", freeStores: 6, promoCount: 7, promoDiscountBDT: 1300 },
  6: { stores: 34, growth: "+30.8%", freeStores: 8, promoCount: 8, promoDiscountBDT: 1550 },
  7: { stores: 42, growth: "+23.5%", freeStores: 9, promoCount: 9, promoDiscountBDT: 1750 },
  8: { stores: 52, growth: "+23.8%", freeStores: 11, promoCount: 10, promoDiscountBDT: 2000 },
  9: { stores: 64, growth: "+23.1%", freeStores: 13, promoCount: 11, promoDiscountBDT: 2200 },
  10: { stores: 78, growth: "+21.9%", freeStores: 15, promoCount: 12, promoDiscountBDT: 2400 },
  11: { stores: 94, growth: "+20.5%", freeStores: 18, promoCount: 13, promoDiscountBDT: 2600 },
  12: { stores: 112, growth: "+19.1%", freeStores: 21, promoCount: 14, promoDiscountBDT: 2750 },
};

export const MONTHLY_DATA_2026: Record<number, MonthlySalesSnapshot> = {
  1: { stores: 120, growth: "+7.1%", freeStores: 22, promoCount: 12, promoDiscountBDT: 2200 },
  2: { stores: 128, growth: "+6.7%", freeStores: 23, promoCount: 13, promoDiscountBDT: 2350 },
  3: { stores: 134, growth: "+4.7%", freeStores: 24, promoCount: 14, promoDiscountBDT: 2450 },
  4: { stores: 138, growth: "+3.0%", freeStores: 25, promoCount: 15, promoDiscountBDT: 2600 },
  5: { stores: 142, growth: "+2.9%", freeStores: 26, promoCount: 15, promoDiscountBDT: 2650 },
  6: { stores: 146, growth: "+2.8%", freeStores: 27, promoCount: 16, promoDiscountBDT: 2700 },
  7: { stores: 150, growth: "+2.7%", freeStores: 27, promoCount: 16, promoDiscountBDT: 2750 },
  8: { stores: 152, growth: "+1.3%", freeStores: 28, promoCount: 16, promoDiscountBDT: 2800 },
  9: { stores: 154, growth: "+1.3%", freeStores: 28, promoCount: 16, promoDiscountBDT: 2800 },
};

export function getMerchantDetails(merchantName: string): AdminMerchant {
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
    channels: ["whatsapp", "messenger"],
    courier: "steadfast",
    lastActive: "Active today",
  };
}

export type MonthItem = {
  num: number;
  name: string;
  nameBn: string;
};

export type MonthlySalesSnapshot = {
  stores: number;
  growth: string;
  freeStores: number;
  promoCount: number;
  promoDiscountBDT: number;
};

export type PeriodPlanCard = {
  id: string;
  name: string;
  nameBn?: string;
  badge?: string;
  popular: boolean;
  monthlyRate: number;
  yearlyRate: number;
  messageLimit: number;
  totalStores: number;
  monthlySubs: number;
  yearlySubs: number;
  promoUsers: number;
  promoDiscount: number;
  grossValue: number;
  revenueValue: number;
  isFree: boolean;
  isCustom: boolean;
};

export type ActivePeriodData = {
  grossRevenue: number;
  totalRevenue: number;
  totalMerchants: number;
  totalPaid: number;
  trialMerchants: number;
  growthLabel: string;
  promoCount: number;
  promoDiscountBDT: number;
  planCards: PeriodPlanCard[];
  periodName: string;
  periodNameBn: string;
};

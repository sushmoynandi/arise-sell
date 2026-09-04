export type FestivalOffer = {
  id: string;
  festivalName: string;
  festivalNameBn: string;
  couponCode: string;
  discountPercent: number;
  bonusMessages: number;
  validity: string;
  active: boolean;
};

export type PlanBillingPeriod = "both" | "monthly" | "yearly";

export type AdminPlan = {
  id: string;
  name: string;
  nameBn?: string;
  tagline?: string;
  priceBDT: number;
  yearlyPriceBDT?: number;
  yearlyDiscountPercent?: number;
  billingPeriod: PlanBillingPeriod;
  messageLimit: number;
  maxStores?: number;
  maxSeats?: number;
  catalogLimit?: number;
  courierChannels?: number;
  features: string[];
  badge?: string;
  popular?: boolean;
  activeMerchants?: number;
  monthlySubscribers?: number;
  yearlySubscribers?: number;
  status: "active" | "archived" | "draft";
  showOnHome?: boolean;
};

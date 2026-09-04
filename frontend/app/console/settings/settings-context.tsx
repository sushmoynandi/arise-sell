"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { api } from "@/lib/api-client";
import { TENANT } from "@/data/tenant";

export interface MerchantSettings {
  has_store?: boolean;
  hasStore?: boolean;
  name: string;
  nameBn: string;
  kind: string;
  since?: string;
  plan?: string;
  ordersUsed?: number;
  ordersQuota?: number;
  pages?: number;
  logoHue?: number;
  slug?: string;
  currency?: string;
  timezone?: string;
  dateFormat?: string;
  taxMode?: string;
  orderPrefix?: string;
  website?: string;
  support_email?: string;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  city_division?: string;
  postal_code?: string;
  trade_license?: string;
  isOpenForOrders?: boolean;
  scheduleMode?: "24x7" | "custom";
  openTime?: string;
  closeTime?: string;
  weeklyOffDay?: string;
  enableAwayMsg?: boolean;
  awayMessage?: string;
  // Branding
  brandColor?: string;
  secondaryColor?: string;
  monogramText?: string;
  printWatermark?: boolean;
  facebook_url?: string;
  facebookUrl?: string;
  instagram_url?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsapp_url?: string;
  whatsappUrl?: string;
  mapsUrl?: string;
  // Invoice
  invoice_layout?: "a4" | "thermal" | "pos" | string;
  invoiceLayout?: "a4" | "thermal" | "pos" | string;
  invoicePrefix?: string;
  invoiceTerms?: string;
  invoiceFooter?: string;
  invoiceShowQr?: boolean;
  invoiceShowTax?: boolean;
  invoiceColorAccent?: string;
  invoiceBinVat?: string;
  invoicePaymentNotes?: string;
  invoiceBankWire?: string;
  // Website Orders
  websiteOrdersEnabled?: boolean;
  websiteOrdersPaymentMode?: string;
  websiteOrdersApiUrl?: string;
  websiteOrdersAuthHeader?: string;
  websiteOrdersApiKey?: string;
  websiteOrdersTemplate?: string;
  // Courier
  insideDhakaRate?: number;
  outsideDhakaRate?: number;
  subDhakaRate?: number;
  fraudShieldEnabled?: boolean;
  fraudThreshold?: number;
  courierCredentials?: Record<string, unknown>;
  // Meta
  metaPixelId?: string;
  metaCapiToken?: string;
  metaTestCode?: string;
  metaAutoCatalogSync?: boolean;
  // Product Feed
  productFeedInterval?: string;
  // Notifications
  smsProvider?: string;
  smsApiKey?: string;
  smsSenderId?: string;
  telegramBotToken?: string;
  telegramChatId?: string;
  smsOrderConfirmed?: boolean;
  smsParcelDispatched?: boolean;
  [key: string]: unknown;
}

export const DEFAULT_SETTINGS: MerchantSettings = {
  name: TENANT.name || "Nokshi & Co.",
  nameBn: TENANT.nameBn || "নকশী অ্যান্ড কোং",
  kind: TENANT.kind || "Handloom, home & lifestyle · Dhaka",
  since: "2021",
  plan: "Karkhana",
  ordersUsed: 1043,
  ordersQuota: 1500,
  pages: 3,
  logoHue: 82,
  slug: "nokshi",
  currency: "BDT",
  timezone: "Asia/Dhaka",
  dateFormat: "DD/MM/YYYY",
  taxMode: "inclusive_75",
  orderPrefix: "NOK-",
  website: "https://nokshi.co",
  support_email: "support@nokshi.co",
  phone: "+880 1711-234567",
  whatsapp_number: "+880 1401-411091",
  address: "House 42, Road 11, Dhanmondi, Dhaka 1209",
  city_division: "Dhaka",
  postal_code: "1209",
  trade_license: "TRAD/DNCC/049182/2022",
  isOpenForOrders: true,
  scheduleMode: "custom",
  openTime: "09:00 AM",
  closeTime: "10:00 PM",
  weeklyOffDay: "None (Open 7 Days)",
  enableAwayMsg: true,
  awayMessage:
    "নমস্কার! আমাদের অফিস ও ওয়্যারহাউস এখন বন্ধ আছে। আপনার অর্ডারটি সুরক্ষিতভাবে গ্রহণ করা হয়েছে। আগামীকাল সকাল ১০টায় আমাদের টিম পার্সেল প্যাকেজিং ও ডেলিভারি কনফার্মেশন শুরু করবে। 🌿",
  brandColor: "#0a6e50",
  secondaryColor: "#f2fbf7",
  monogramText: "নকশী",
  printWatermark: true,
  facebookUrl: "https://facebook.com/nokshibd",
  instagramUrl: "https://instagram.com/nokshibd",
  tiktokUrl: "https://tiktok.com/@nokshibd",
  whatsappUrl: "https://wa.me/8801711234567",
  mapsUrl: "https://maps.google.com/?q=Dhanmondi+Dhaka",
  invoiceLayout: "a4",
  invoicePrefix: "NOK-",
  invoiceTerms: "7-day exchange warranty with invoice slip.",
  invoiceFooter: "Thank you for supporting handloom artisans in Bangladesh.",
  invoiceShowQr: true,
  invoiceShowTax: true,
  invoiceColorAccent: "#0a6e50",
  invoiceBinVat: "BIN-002918291-0102",
  invoicePaymentNotes: "01401-411091 (bKash Merchant Payment)",
  invoiceBankWire:
    "City Bank Ltd · Nokshi & Co · A/C 1204918201 · Dhanmondi Branch",
  websiteOrdersEnabled: false,
  websiteOrdersPaymentMode: "payment_link",
  websiteOrdersApiUrl: "https://nokshi.co/api/v1/orders",
  websiteOrdersAuthHeader: "X-API-Key",
  websiteOrdersApiKey: "",
  websiteOrdersTemplate: "",
  insideDhakaRate: 70,
  outsideDhakaRate: 130,
  subDhakaRate: 100,
  fraudShieldEnabled: true,
  fraudThreshold: 25,
  courierCredentials: {},
  metaPixelId: "849201948102948",
  metaCapiToken: "",
  metaTestCode: "TEST91821",
  metaAutoCatalogSync: true,
  productFeedInterval: "hourly",
  smsProvider: "BulkSMSBD",
  smsApiKey: "",
  smsSenderId: "NOKSHI",
  telegramBotToken: "",
  telegramChatId: "",
  smsOrderConfirmed: true,
  smsParcelDispatched: true,
};

export const EMPTY_STORE_SETTINGS: MerchantSettings = {
  has_store: false,
  hasStore: false,
  name: "",
  nameBn: "",
  kind: "",
  since: "",
  plan: "free",
  ordersUsed: 0,
  ordersQuota: 0,
  pages: 0,
  logoHue: 82,
  slug: "",
  currency: "BDT",
  timezone: "Asia/Dhaka",
  dateFormat: "DD/MM/YYYY",
  taxMode: "inclusive_75",
  orderPrefix: "",
  website: "",
  support_email: "",
  phone: "",
  whatsapp_number: "",
  address: "",
  city_division: "",
  postal_code: "",
  trade_license: "",
  isOpenForOrders: true,
  scheduleMode: "custom",
  openTime: "09:00 AM",
  closeTime: "10:00 PM",
  weeklyOffDay: "None (Open 7 Days)",
  enableAwayMsg: true,
  awayMessage: "",
};

interface SettingsContextType {
  settings: MerchantSettings;
  hasStore: boolean;
  isLoading: boolean;
  isSaving: boolean;
  updateSettings: (partial: Partial<MerchantSettings>) => Promise<boolean>;
  createStore: (
    partial: Partial<MerchantSettings>,
  ) => Promise<{ success: boolean; error?: string }>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  hasStore: true,
  isLoading: false,
  isSaving: false,
  updateSettings: async () => false,
  createStore: async () => ({ success: false }),
  refreshSettings: async () => {},
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<MerchantSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const data = await api.merchants.getProfile();
      if (data && typeof data === "object") {
        const profile = data as Record<string, unknown>;
        if (profile.has_store === false || !profile.name) {
          setSettings({
            ...EMPTY_STORE_SETTINGS,
            ...profile,
            has_store: false,
            hasStore: false,
            name: "",
          });
        } else {
          setSettings((prev) => ({
            ...prev,
            ...profile,
            has_store: true,
            hasStore: true,
          }));
        }
      }
    } catch {
      // Fallback silently to default settings on unauthenticated or network error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const createStore = useCallback(
    async (
      partial: Partial<MerchantSettings>,
    ): Promise<{ success: boolean; error?: string }> => {
      setIsSaving(true);
      try {
        const res = await api.merchants.createStore(
          partial as Record<string, unknown>,
        );
        if (res && typeof res === "object") {
          setSettings((prev) => ({
            ...prev,
            ...(res as Record<string, unknown>),
            has_store: true,
            hasStore: true,
          }));
          return { success: true };
        }
        return { success: false, error: "Failed to create store" };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Failed to create store";
        console.error("Failed to create store:", msg);
        return { success: false, error: msg };
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const updateSettings = useCallback(
    async (partial: Partial<MerchantSettings>): Promise<boolean> => {
      setIsSaving(true);
      try {
        const res = await api.merchants.updateSettings(
          partial as Record<string, unknown>,
        );
        if (res && typeof res === "object") {
          setSettings((prev) => ({
            ...prev,
            ...(res as Record<string, unknown>),
            has_store: true,
            hasStore: true,
          }));
        } else {
          setSettings((prev) => ({
            ...prev,
            ...partial,
            has_store: true,
            hasStore: true,
          }));
        }
        return true;
      } catch (err) {
        console.error("Failed to update settings:", err);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  const hasStore = settings.has_store !== false && Boolean(settings.name);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        hasStore,
        isLoading,
        isSaving,
        updateSettings,
        createStore,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

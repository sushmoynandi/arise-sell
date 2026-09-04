/**
 * NextProduct AI - Centralized Frontend API Client
 * Connects the Next.js frontend directly to the FastAPI backend.
 * Handles JWT auth headers, token refresh, and typed request methods.
 */

import { setCookie, deleteCookie } from "./cookies";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface StoreWorkspace {
  id: string;
  name: string;
  slug: string;
  plan: string;
  role: string;
  is_owner: boolean;
  owner_name: string;
  plan_covered_by_owner: boolean;
  is_active: boolean;
  channels_count: number;
  permissions: string[];
  max_stores?: number;
  maxStores?: number;
}

export interface BillingPlan {
  id: string;
  name: string;
  nameBn?: string;
  tagline?: string;
  priceBDT: number;
  yearlyPriceBDT?: number;
  yearlyDiscountPercent?: number;
  billingPeriod?: string;
  messageLimit: number;
  maxStores: number;
  maxSeats: number;
  catalogLimit?: number;
  courierChannels?: number;
  features: string[];
  badge?: string | null;
  popular?: boolean;
  activeMerchants?: number;
  status?: string;
  showOnHome?: boolean;
}

export interface BillingInvoice {
  id: string;
  invoiceNo?: string;
  merchantName: string;
  plan: string;
  amountBDT: number;
  originalAmountBDT?: number;
  discountBDT?: number;
  method: string;
  txId: string;
  date: string;
  status: string;
  description?: string;
}

export interface TeamMemberData {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
  online: boolean;
  hue: number;
  platforms: string[];
  permissions: string[];
  is_owner: boolean;
  avatar_url?: string | null;
}

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("np_access_token");
  }

  public setTokens(access: string, refresh?: string, days: number = 7) {
    if (typeof window === "undefined") return;
    localStorage.setItem("np_access_token", access);
    setCookie("np_access_token", access, days);
    if (refresh) {
      localStorage.setItem("np_refresh_token", refresh);
      setCookie("np_refresh_token", refresh, days);
    }
  }

  public clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("np_access_token");
    localStorage.removeItem("np_refresh_token");
    deleteCookie("np_access_token");
    deleteCookie("np_refresh_token");
    deleteCookie("np_role");
    deleteCookie("np_is_superadmin");
  }

  public async request<T = unknown>(
    endpoint: string,
    options: FetchOptions = {},
  ): Promise<T> {
    const { params, headers, ...customConfig } = options;
    let url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) searchParams.append(key, String(val));
      });
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }

    const token = this.getAccessToken();
    const reqHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    };

    try {
      const res = await fetch(url, {
        ...customConfig,
        headers: reqHeaders,
      });

      if (res.status === 401 && typeof window !== "undefined") {
        const refresh = localStorage.getItem("np_refresh_token");
        if (refresh) {
          try {
            const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh }),
            });
            if (refreshRes.ok) {
              const data = await refreshRes.json();
              this.setTokens(data.access);
              reqHeaders["Authorization"] = `Bearer ${data.access}`;
              const retryRes = await fetch(url, {
                ...customConfig,
                headers: reqHeaders,
              });
              return (await retryRes.json()) as T;
            }
          } catch {
            this.clearTokens();
          }
        }
      }

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ detail: res.statusText }));
        throw new Error(errorData.detail || "API request failed");
      }

      return (await res.json()) as T;
    } catch (err: unknown) {
      console.warn(
        `[ApiClient] ${options.method || "GET"} ${endpoint} warning:`,
        err,
      );
      throw err;
    }
  }

  // --- Auth ---
  public auth = {
    login: (body: { email: string; password: string }) =>
      this.request<{
        access: string;
        refresh: string;
        user: Record<string, unknown>;
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    register: (body: {
      email: string;
      password: string;
      password2?: string;
      first_name?: string;
      last_name?: string;
      full_name?: string;
      store_name?: string;
    }) =>
      this.request<{
        access: string;
        refresh: string;
        user: Record<string, unknown>;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    forgotPassword: (email: string) =>
      this.request<{ success: boolean; message: string; reset_token?: string }>(
        "/auth/forgot-password",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
      ),
    resetPassword: (body: {
      token: string;
      new_password: string;
      confirm_password?: string;
    }) =>
      this.request<{ success: boolean; message: string }>(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    logout: () =>
      this.request<{ success: boolean; message: string }>("/auth/logout", {
        method: "POST",
      }).finally(() => this.clearTokens()),
    google: (body: { credential?: string; access_token?: string }) =>
      this.request<{
        access: string;
        refresh: string;
        user: Record<string, unknown>;
      }>("/auth/google", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: () => this.request<Record<string, unknown>>("/auth/me"),
    updateProfile: (body: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      avatar_url?: string;
      hue?: number;
    }) =>
      this.request<Record<string, unknown>>("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    changePassword: (body: {
      current_password?: string;
      new_password: string;
      confirm_password?: string;
    }) =>
      this.request<{ success: boolean; message: string }>(
        "/auth/change-password",
        {
          method: "POST",
          body: JSON.stringify(body),
        },
      ),
    deleteAccount: (body: { password?: string; confirm_phrase: string }) =>
      this.request<{
        success: boolean;
        scheduled_deletion_at?: string;
        grace_days?: number;
        message: string;
      }>("/auth/account", {
        method: "DELETE",
        body: JSON.stringify(body),
      }).finally(() => this.clearTokens()),
  };

  // --- Live Threads & Inbox ---
  public threads = {
    list: (filter?: string) =>
      this.request<unknown[]>("/threads", { params: { filter } }),
    get: (id: string) => this.request<unknown>(`/threads/${id}`),
    send: (id: string, body: string) =>
      this.request(`/threads/${id}/send`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    takeover: (id: string, mode: "ai" | "human") =>
      this.request(`/threads/${id}/takeover`, {
        method: "PATCH",
        body: JSON.stringify({ mode }),
      }),
    resolve: (id: string) =>
      this.request(`/threads/${id}/resolve`, { method: "PATCH" }),
  };

  // --- Orders & Fulfilment ---
  public orders = {
    list: () => this.request<unknown[]>("/orders"),
    create: (order: Record<string, unknown>) =>
      this.request("/orders", { method: "POST", body: JSON.stringify(order) }),
    bookCourier: (id: string, provider: string, note?: string) =>
      this.request(`/orders/${id}/book-courier`, {
        method: "POST",
        body: JSON.stringify({ provider, note }),
      }),
    getInvoiceUrl: (id: string) => `${API_BASE}/orders/${id}/invoice-pdf`,
  };

  // --- Catalog ---
  public catalog = {
    list: () => this.request<unknown[]>("/catalog/products"),
    syncFeed: () => this.request("/catalog/sync-feed", { method: "POST" }),
  };

  // --- Comments ---
  public comments = {
    listRules: () => this.request<unknown[]>("/comments/rules"),
    createRule: (rule: {
      trigger: string;
      reply: string;
      dm_template?: string;
    }) =>
      this.request("/comments/rules", {
        method: "POST",
        body: JSON.stringify(rule),
      }),
  };

  // --- Pipeline ---
  public pipeline = {
    list: () => this.request<unknown[]>("/pipeline"),
    updateStage: (id: string, stage: string, confirmed: boolean) =>
      this.request(`/pipeline/${id}/stage`, {
        method: "PATCH",
        body: JSON.stringify({ stage, confirmed }),
      }),
  };

  // --- Campaigns & Reach ---
  public campaigns = {
    list: () => this.request<unknown[]>("/campaigns"),
    listPlaybooks: () => this.request<unknown[]>("/campaigns/playbooks"),
  };

  // --- Automations & Signals ---
  public automations = {
    listRules: () => this.request<unknown[]>("/automations/rules"),
    listCapi: () => this.request<unknown[]>("/automations/capi"),
  };

  // --- Integrations & Channels ---
  public integrations = {
    listChannels: () => this.request<unknown[]>("/integrations/channels"),
    sendOtp: (payload: { phone_number: string }) =>
      this.request<{
        success: boolean;
        message: string;
        otp_preview: string;
        expires_in_seconds: number;
      }>("/integrations/whatsapp/send-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    verifyOtp: (payload: {
      phone_number: string;
      otp: string;
      waba_id?: string;
      phone_number_id?: string;
    }) =>
      this.request<{
        success: boolean;
        channel_id: string;
        status: string;
        detail: string;
        is_live: boolean;
      }>("/integrations/whatsapp/verify-otp", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    embeddedSignup: (payload: {
      code?: string;
      waba_id?: string;
      phone_number_id?: string;
      phone_number?: string;
    }) =>
      this.request("/integrations/whatsapp/embedded-signup", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    toggleChannel: (channelId: string) =>
      this.request(`/integrations/channels/${channelId}/toggle`, {
        method: "POST",
      }),
  };

  // --- AI Brain & Knowledge ---
  public brain = {
    getPersona: () => this.request<unknown>("/brain/persona"),
    updatePersona: (persona: {
      voice: string;
      signature: string;
      reply_window: string;
      emoji_budget: string;
    }) =>
      this.request("/brain/persona", {
        method: "POST",
        body: JSON.stringify(persona),
      }),
    getGuardrails: () => this.request<unknown[]>("/brain/guardrails"),
    getKnowledge: () => this.request<unknown[]>("/brain/knowledge"),
    addKnowledge: (entry: {
      topic: string;
      content: string;
      sample?: string;
    }) =>
      this.request("/brain/knowledge", {
        method: "POST",
        body: JSON.stringify(entry),
      }),
    getEvals: () => this.request<unknown>("/brain/evals"),
  };

  // --- AI Playground ---
  public playground = {
    testChat: (message: string) =>
      this.request("/ai/test-chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
  };

  // --- Merchant Settings ---
  public merchants = {
    getProfile: () => this.request<unknown>("/merchants/profile"),
    quickCreateStore: () =>
      this.request<unknown>("/merchants/quick-create-store", {
        method: "POST",
      }),
    createStore: (storeData: Record<string, unknown>) =>
      this.request<unknown>("/merchants/store", {
        method: "POST",
        body: JSON.stringify(storeData),
      }),
    updateSettings: (settings: Record<string, unknown>) =>
      this.request("/merchants/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      }),
    getTeam: () => this.request<TeamMemberData[]>("/merchants/team"),
    inviteTeamMember: (data: {
      name: string;
      email: string;
      role: string;
      channels: string[];
      permissions: string[];
    }) =>
      this.request<TeamMemberData>("/merchants/team", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateTeamMember: (
      memberId: string,
      data: {
        name?: string;
        role?: string;
        channels?: string[];
        permissions?: string[];
      },
    ) =>
      this.request<TeamMemberData>(`/merchants/team/${memberId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    removeTeamMember: (memberId: string) =>
      this.request<{ success: boolean; message: string }>(
        `/merchants/team/${memberId}`,
        {
          method: "DELETE",
        },
      ),
    getMyStores: () => this.request<StoreWorkspace[]>("/merchants/my-stores"),
    switchStore: (storeId: string) =>
      this.request<{
        success: boolean;
        active_store_id: string;
        store_name: string;
        role: string;
        plan: string;
        is_owner: boolean;
      }>("/merchants/switch-store", {
        method: "POST",
        body: JSON.stringify({ store_id: storeId }),
      }),
    getNotifications: () => this.request<unknown[]>("/merchants/notifications"),
    markNotificationsRead: (ids: string[]) =>
      this.request("/merchants/notifications/mark-read", {
        method: "POST",
        body: JSON.stringify({ ids }),
      }),
    deleteStore: (body: { confirm_phrase: string; password?: string }) =>
      this.request<{
        success: boolean;
        deleted_store_name: string;
        message: string;
      }>("/merchants/store", {
        method: "DELETE",
        body: JSON.stringify(body),
      }),
  };

  // --- Billing ---
  public billing = {
    listPlans: () => this.request<BillingPlan[]>("/billing/plans"),
    listInvoices: () => this.request<BillingInvoice[]>("/billing/invoices"),
    selectPlan: (data: { plan_id: string; billing_period?: string }) =>
      this.request<{
        success: boolean;
        plan: string;
        orders_quota: number;
        message: string;
      }>("/billing/select-plan", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createTopup: (pack: string, payment_method: string) =>
      this.request<{
        success: boolean;
        plan: string;
        orders_quota: number;
        messages_quota: number;
        added_quota: number;
        amount_bdt: number;
        message: string;
      }>("/billing/topup", {
        method: "POST",
        body: JSON.stringify({ pack, payment_method }),
      }),
    redeemCode: (code: string) =>
      this.request<{
        success: boolean;
        plan: string;
        orders_quota: number;
        messages_quota: number;
        max_stores: number;
        max_seats: number;
        message: string;
      }>("/billing/redeem-code", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    getCustomCodes: () =>
      this.request<
        {
          code: string;
          plan_name: string;
          message_limit: number;
          max_stores: number;
          max_seats: number;
          price_bdt: number;
          features: string[];
          active: boolean;
        }[]
      >("/billing/custom-codes"),
  };

  // --- Analytics ---
  public analytics = {
    getDashboard: () => this.request<unknown>("/analytics/dashboard"),
  };

  // --- Admin Super-Console ---
  public admin = {
    login: (body: { email: string; password: string }) =>
      this.request<{
        access: string;
        refresh: string;
        requires_2fa: boolean;
        user: Record<string, unknown>;
      }>("/admin/auth/login", { method: "POST", body: JSON.stringify(body) }),
    verify2FA: (body: { email: string; totp_code: string }) =>
      this.request<{
        access: string;
        refresh: string;
        requires_2fa: boolean;
        user: Record<string, unknown>;
      }>("/admin/auth/verify-2fa", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    getDashboard: () => this.request<unknown>("/admin/dashboard"),
    getActivity: () => this.request<unknown[]>("/admin/dashboard/activity"),
    listMerchants: (params?: { search?: string; status?: string }) =>
      this.request<unknown[]>("/admin/merchants", { params }),
    updateMerchantPlan: (id: string, plan: string) =>
      this.request(`/admin/merchants/${id}/plan`, {
        method: "PATCH",
        body: JSON.stringify({ plan }),
      }),
    listInvoices: () =>
      this.request<unknown[]>("/admin/subscriptions/invoices"),
    refundInvoice: (id: string) =>
      this.request(`/admin/subscriptions/invoices/${id}/refund`, {
        method: "POST",
      }),
    listPlans: () => this.request<Record<string, unknown>[]>("/admin/plans"),
    createPlan: (plan: Record<string, unknown>) =>
      this.request<Record<string, unknown>>("/admin/plans", {
        method: "POST",
        body: JSON.stringify(plan),
      }),
    updatePlan: (id: string, plan: Record<string, unknown>) =>
      this.request<Record<string, unknown>>(`/admin/plans/${id}`, {
        method: "PUT",
        body: JSON.stringify(plan),
      }),
    togglePlanStatus: (id: string) =>
      this.request<Record<string, unknown>>(`/admin/plans/${id}/status`, {
        method: "PATCH",
      }),
    togglePlanHome: (id: string) =>
      this.request<Record<string, unknown>>(`/admin/plans/${id}/toggle-home`, {
        method: "PATCH",
      }),
    deletePlan: (id: string) =>
      this.request<{ success: boolean; message: string }>(
        `/admin/plans/${id}`,
        { method: "DELETE" },
      ),
    listFestivalOffers: () =>
      this.request<Record<string, unknown>[]>("/admin/plans/festival-offers"),
    createFestivalOffer: (offer: Record<string, unknown>) =>
      this.request<Record<string, unknown>>("/admin/plans/festival-offers", {
        method: "POST",
        body: JSON.stringify(offer),
      }),
    updateFestivalOffer: (id: string, offer: Record<string, unknown>) =>
      this.request<Record<string, unknown>>(
        `/admin/plans/festival-offers/${id}`,
        {
          method: "PUT",
          body: JSON.stringify(offer),
        },
      ),
    toggleFestivalOffer: (id: string) =>
      this.request<Record<string, unknown>>(
        `/admin/plans/festival-offers/${id}/toggle`,
        { method: "PATCH" },
      ),
    deleteFestivalOffer: (id: string) =>
      this.request<{ success: boolean; message: string }>(
        `/admin/plans/festival-offers/${id}`,
        { method: "DELETE" },
      ),
    listAiKeys: () =>
      this.request<Record<string, unknown>[]>("/admin/ai-gateway/keys"),
    addAiKey: (key: Record<string, unknown>) =>
      this.request("/admin/ai-gateway/keys", {
        method: "POST",
        body: JSON.stringify(key),
      }),
    deleteAiKey: (id: string) =>
      this.request(`/admin/ai-gateway/keys/${id}`, { method: "DELETE" }),
    setPrimaryAiKey: (id: string) =>
      this.request(`/admin/ai-gateway/keys/${id}/primary`, { method: "PATCH" }),
    pingAiKey: (id: string) =>
      this.request<{
        success: boolean;
        latency?: number;
        msg?: string;
        error?: string;
      }>(`/admin/ai-gateway/keys/${id}/ping`, { method: "POST" }),
    testAiKey: (data: { provider: string; model: string; api_key: string }) =>
      this.request<{ success: boolean; latency: number; msg: string }>(
        "/admin/ai-gateway/test-key",
        { method: "POST", body: JSON.stringify(data) },
      ),
    detectAiKey: (apiKey: string) =>
      this.request<{
        success: boolean;
        provider?:
          | "google"
          | "agentrouter"
          | "openrouter"
          | "openai"
          | "anthropic"
          | "deepseek"
          | "groq"
          | "custom";
        provider_name?: string;
        models?: string[];
        default_model?: string;
        latency_ms?: number;
        msg?: string;
      }>("/admin/ai-gateway/detect-key", {
        method: "POST",
        body: JSON.stringify({ api_key: apiKey }),
      }),
    testAiCascade: (prompt: string) =>
      this.request("/admin/ai-gateway/test-cascade", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
    testCascade: (prompt: string) =>
      this.request("/admin/ai-gateway/test-cascade", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
    listCouriers: () => this.request<unknown[]>("/admin/couriers"),
    pingCourier: (id: string) =>
      this.request(`/admin/couriers/${id}/ping`, { method: "POST" }),
    listMetaApps: () => this.request<unknown[]>("/admin/meta-apps"),
    testMetaHandshake: (id: string) =>
      this.request(`/admin/meta-apps/${id}/test-handshake`, { method: "POST" }),
    listSupportTickets: () => this.request<unknown[]>("/admin/support/tickets"),
    replySupportTicket: (id: string, message: string) =>
      this.request(`/admin/support/tickets/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    patchAiRule: (id: string, suggested_rule: string) =>
      this.request(`/admin/support/tickets/${id}/patch-ai-rule`, {
        method: "POST",
        body: JSON.stringify({ suggested_rule }),
      }),
    getSystemHealth: () => this.request<unknown>("/admin/system/health"),
    broadcastAlert: (title: string, message: string, severity?: string) =>
      this.request("/admin/system/broadcast-alert", {
        method: "POST",
        body: JSON.stringify({ title, message, severity }),
      }),
    listBackups: () => this.request<unknown[]>("/admin/backups"),
    getSettings: () => this.request<unknown>("/admin/settings"),
    toggleKillSwitch: (active: boolean, reason?: string) =>
      this.request("/admin/settings/kill-switch", {
        method: "POST",
        body: JSON.stringify({ active, reason }),
      }),
    listFraudBlacklist: () => this.request<unknown>("/admin/fraud/blacklist"),
    addFraudBlacklist: (phone: string, reason: string) =>
      this.request("/admin/fraud/blacklist", {
        method: "POST",
        body: JSON.stringify({ phone, reason }),
      }),
    toggleMerchantStatus: (id: string) =>
      this.request(`/admin/merchants/${id}/toggle-status`, { method: "POST" }),
    getMerchantsExportUrl: () =>
      `${API_BASE}/admin/backups/export/merchants-csv`,
  };
}

export const api = new ApiClient();
export default api;

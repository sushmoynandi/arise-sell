/**
 * NextProduct AI - Centralized Frontend API Client
 * Connects the Next.js frontend directly to the FastAPI backend.
 * Handles JWT auth headers, token refresh, and typed request methods.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

class ApiClient {
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("np_access_token");
  }

  private setTokens(access: string, refresh?: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("np_access_token", access);
    if (refresh) localStorage.setItem("np_refresh_token", refresh);
  }

  private clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("np_access_token");
    localStorage.removeItem("np_refresh_token");
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
      password2: string;
      first_name: string;
      last_name: string;
    }) =>
      this.request<{
        access: string;
        refresh: string;
        user: Record<string, unknown>;
      }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: () => this.request<Record<string, unknown>>("/auth/me"),
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
    updateSettings: (settings: Record<string, unknown>) =>
      this.request("/merchants/settings", {
        method: "PATCH",
        body: JSON.stringify(settings),
      }),
    getTeam: () => this.request<unknown[]>("/merchants/team"),
  };

  // --- Billing ---
  public billing = {
    listPlans: () => this.request<unknown[]>("/billing/plans"),
    listInvoices: () => this.request<unknown[]>("/billing/invoices"),
    createTopup: (pack: string, payment_method: string) =>
      this.request("/billing/topup", {
        method: "POST",
        body: JSON.stringify({ pack, payment_method }),
      }),
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

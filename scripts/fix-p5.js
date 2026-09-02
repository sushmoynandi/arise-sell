const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// 1. Update lib/use-api.ts
const useApiContent = `"use client";

/**
 * NextProduct AI - Real-Time API Data Hooks
 * Connects UI pages directly to FastAPI endpoints with automatic fallback to domain mock data.
 */

import { useState, useEffect, useCallback } from "react";
import api from "./api-client";

// Import domain mock fallback data with exact export names
import { THREADS as MOCK_THREADS } from "@/data/threads";
import { PRODUCTS as MOCK_PRODUCTS } from "@/data/catalog";
import {
  ORDERS as MOCK_ORDERS,
  PIPELINE as MOCK_PIPELINE,
  STAGES as MOCK_STAGES,
  CAMPAIGNS as MOCK_CAMPAIGNS,
  COMMENT_RULES as MOCK_COMMENT_RULES,
  CAPI_EVENTS as MOCK_CAPI,
} from "@/data/operations";
import {
  PERSONA as MOCK_PERSONA,
  GUARDRAILS as MOCK_GUARDRAILS,
  KNOWLEDGE as MOCK_KNOWLEDGE,
  EVAL_SUITE as MOCK_EVALS,
  PLAYBOOKS as MOCK_PLAYBOOKS,
} from "@/data/brain";
import {
  ADMIN_MERCHANTS as MOCK_MERCHANTS,
  INITIAL_AI_KEYS as MOCK_AI_KEYS,
  INITIAL_COURIERS as MOCK_COURIERS,
  INITIAL_META_APPS as MOCK_META_APPS,
  INITIAL_SUPPORT_TICKETS as MOCK_SUPPORT,
  SYSTEM_SERVICES as MOCK_SERVICES,
  LIVE_ACTIVITY_FEED as MOCK_ACTIVITY,
  INITIAL_BACKUPS as MOCK_BACKUPS,
} from "@/data/admin";
import type { Thread, Product, Order, PipelineCard, Campaign, CommentRule, CapiEvent } from "@/data/types";

// ==========================================
// 1. Live Inbox & Threads Hook
// ==========================================
export function useThreads(filter?: string) {
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [loading, setLoading] = useState(true);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await api.threads.list(filter)) as Thread[];
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((t) => ({
          ...t,
          messages: t.messages ?? (MOCK_THREADS.find((m) => m.id === t.id)?.messages || []),
        }));
        setThreads(normalized);
      }
    } catch {
      setThreads(MOCK_THREADS);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const sendMessage = async (threadId: string, body: string) => {
    try {
      await api.threads.send(threadId, body);
      await fetchThreads();
      return true;
    } catch {
      return false;
    }
  };

  const takeoverThread = async (threadId: string, mode: "ai" | "human") => {
    try {
      await api.threads.takeover(threadId, mode);
      await fetchThreads();
      return true;
    } catch {
      return false;
    }
  };

  const resolveThread = async (threadId: string) => {
    try {
      await api.threads.resolve(threadId);
      await fetchThreads();
      return true;
    } catch {
      return false;
    }
  };

  return { threads, loading, refetch: fetchThreads, sendMessage, takeoverThread, resolveThread };
}

export function useThread(threadId: string | null) {
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchThread = useCallback(async () => {
    if (!threadId) return;
    try {
      setLoading(true);
      const data = (await api.threads.get(threadId)) as Thread;
      if (data) setThread(data);
    } catch {
      const mock = MOCK_THREADS.find((t) => t.id === threadId) || null;
      setThread(mock);
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  return { thread, loading, refetch: fetchThread };
}

// ==========================================
// 2. Orders & Fulfilment Hook
// ==========================================
export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await api.orders.list()) as Order[];
      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
      }
    } catch {
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const bookCourier = async (orderId: string, provider: string, note?: string) => {
    try {
      const res = await api.orders.bookCourier(orderId, provider, note);
      await fetchOrders();
      return res;
    } catch {
      return null;
    }
  };

  return { orders, loading, refetch: fetchOrders, bookCourier };
}

// ==========================================
// 3. Catalog & Products Hook
// ==========================================
export function useCatalog() {
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await api.catalog.list()) as Product[];
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
      }
    } catch {
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const syncFeed = async () => {
    try {
      const res = await api.catalog.syncFeed();
      await fetchProducts();
      return res;
    } catch {
      return null;
    }
  };

  return { products, loading, refetch: fetchProducts, syncFeed };
}

// ==========================================
// 4. Sales Pipeline Hook
// ==========================================
export function usePipeline() {
  const [pipeline, setPipeline] = useState<PipelineCard[]>(MOCK_PIPELINE);
  const [loading, setLoading] = useState(true);

  const fetchPipeline = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await api.pipeline.list()) as PipelineCard[];
      if (Array.isArray(data) && data.length > 0) {
        setPipeline(data);
      }
    } catch {
      setPipeline(MOCK_PIPELINE);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPipeline();
  }, [fetchPipeline]);

  const updateStage = async (cardId: string, stage: string, confirmed: boolean = true) => {
    try {
      await api.pipeline.updateStage(cardId, stage, confirmed);
      await fetchPipeline();
      return true;
    } catch {
      return false;
    }
  };

  return { pipeline, loading, refetch: fetchPipeline, updateStage };
}

// ==========================================
// 5. AI Brain, Persona & Knowledge Hook
// ==========================================
export function useBrain() {
  const [persona, setPersona] = useState(MOCK_PERSONA);
  const [guardrails, setGuardrails] = useState(MOCK_GUARDRAILS);
  const [knowledge, setKnowledge] = useState(MOCK_KNOWLEDGE);
  const [evals, setEvals] = useState(MOCK_EVALS);
  const [playbooks, setPlaybooks] = useState(MOCK_PLAYBOOKS);
  const [loading, setLoading] = useState(true);

  const fetchBrainData = useCallback(async () => {
    try {
      setLoading(true);
      const [p, g, k, e, pb] = await Promise.allSettled([
        api.brain.getPersona(),
        api.brain.getGuardrails(),
        api.brain.getKnowledge(),
        api.brain.getEvals(),
        api.campaigns.listPlaybooks(),
      ]);

      if (p.status === "fulfilled" && p.value) setPersona(p.value as typeof MOCK_PERSONA);
      if (g.status === "fulfilled" && Array.isArray(g.value)) setGuardrails(g.value as typeof MOCK_GUARDRAILS);
      if (k.status === "fulfilled" && Array.isArray(k.value)) setKnowledge(k.value as typeof MOCK_KNOWLEDGE);
      if (e.status === "fulfilled" && e.value) setEvals(e.value as typeof MOCK_EVALS);
      if (pb.status === "fulfilled" && Array.isArray(pb.value)) setPlaybooks(pb.value as typeof MOCK_PLAYBOOKS);
    } catch {
      // Keep mock fallbacks
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBrainData();
  }, [fetchBrainData]);

  const updatePersona = async (data: typeof MOCK_PERSONA) => {
    try {
      const res = await api.brain.updatePersona(data);
      setPersona(res as typeof MOCK_PERSONA);
      return true;
    } catch {
      return false;
    }
  };

  const addKnowledge = async (entry: { topic: string; content: string; sample?: string }) => {
    try {
      await api.brain.addKnowledge(entry);
      await fetchBrainData();
      return true;
    } catch {
      return false;
    }
  };

  return { persona, guardrails, knowledge, evals, playbooks, loading, refetch: fetchBrainData, updatePersona, addKnowledge };
}

// ==========================================
// 6. Super Admin Hooks
// ==========================================
export function useAdminDashboard() {
  const [kpis, setKpis] = useState({
    totalMerchants: 154,
    activePaidMerchants: 126,
    mrrBDT: 173000,
    arrBDT: 2076000,
    platformGmvBDT: 48920000,
    messages24h: 38450,
    aiAutoResolutionRate: 94.4,
    growthMoM: "+18.2%",
  });
  const [activity, setActivity] = useState(MOCK_ACTIVITY);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const [kRes, aRes] = await Promise.allSettled([
        api.admin.getDashboard(),
        api.admin.getActivity(),
      ]);
      if (kRes.status === "fulfilled" && kRes.value) setKpis(kRes.value as typeof kpis);
      if (aRes.status === "fulfilled" && Array.isArray(aRes.value)) setActivity(aRes.value as typeof MOCK_ACTIVITY);
    } catch {
      // Keep default
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  return { kpis, activity, loading, refetch: fetchAdminData };
}

export function useAdminMerchants() {
  const [merchants, setMerchants] = useState(MOCK_MERCHANTS);
  const [loading, setLoading] = useState(true);

  const fetchMerchants = useCallback(async (params?: { search?: string; status?: string }) => {
    try {
      setLoading(true);
      const data = (await api.admin.listMerchants(params)) as typeof MOCK_MERCHANTS;
      if (Array.isArray(data) && data.length > 0) {
        setMerchants(data);
      }
    } catch {
      setMerchants(MOCK_MERCHANTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMerchants();
  }, [fetchMerchants]);

  const updatePlan = async (merchantId: string, plan: string) => {
    try {
      await api.admin.updateMerchantPlan(merchantId, plan);
      await fetchMerchants();
      return true;
    } catch {
      return false;
    }
  };

  const toggleStatus = async (merchantId: string) => {
    try {
      await api.admin.toggleMerchantStatus(merchantId);
      await fetchMerchants();
      return true;
    } catch {
      return false;
    }
  };

  return { merchants, loading, refetch: fetchMerchants, updatePlan, toggleStatus };
}
`;
fs.writeFileSync(path.join(rootDir, 'lib', 'use-api.ts'), useApiContent, 'utf8');
console.log('1. Fixed lib/use-api.ts');

// 2. Update lib/api-client.ts with robust 401 retry handling
let apiClient = fs.readFileSync(path.join(rootDir, 'lib', 'api-client.ts'), 'utf8');
apiClient = apiClient.replace(
  'const retryRes = await fetch(url, { ...customConfig, headers: reqHeaders });\\n              return (await retryRes.json()) as T;',
  `const retryRes = await fetch(url, { ...customConfig, headers: reqHeaders });
              if (!retryRes.ok) {
                const errorData = await retryRes.json().catch(() => ({ detail: retryRes.statusText }));
                throw new Error(errorData.detail || "API request failed");
              }
              return (await retryRes.json()) as T;`
);
fs.writeFileSync(path.join(rootDir, 'lib', 'api-client.ts'), apiClient, 'utf8');
console.log('2. Fixed lib/api-client.ts');

// 3. Mount AuthProvider in app/layout.tsx
const layoutPath = path.join(rootDir, 'app', 'layout.tsx');
let layout = fs.readFileSync(layoutPath, 'utf8');

if (!layout.includes('AuthProvider')) {
  layout = layout.replace(
    'import { LanguageProvider } from "@/lib/i18n";',
    'import { LanguageProvider } from "@/lib/i18n";\nimport { AuthProvider } from "@/lib/auth-context";'
  );
  layout = layout.replace(
    '<LanguageProvider>',
    '<LanguageProvider>\n        <AuthProvider>'
  );
  layout = layout.replace(
    '</LanguageProvider>',
    '</AuthProvider>\n      </LanguageProvider>'
  );
  fs.writeFileSync(layoutPath, layout, 'utf8');
  console.log('3. Mounted AuthProvider in app/layout.tsx');
}

console.log('✅ ALL PHASE 5 REVIEWS APPLIED SUCCESSFULLY!');

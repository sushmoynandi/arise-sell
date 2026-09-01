import { INITIAL_ADMIN_PLANS, type AdminPlan } from "@/data/admin";

const STORAGE_KEY = "nextproduct_admin_plans";

let cachedPlans: AdminPlan[] = INITIAL_ADMIN_PLANS;
let cachedRaw: string | null = null;

export function getStoredPlans(): AdminPlan[] {
  if (typeof window === "undefined") return INITIAL_ADMIN_PLANS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw && cachedPlans) {
      return cachedPlans;
    }
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedRaw = raw;
        cachedPlans = parsed;
        return cachedPlans;
      }
    }
  } catch {}
  return INITIAL_ADMIN_PLANS;
}

export function saveStoredPlans(plans: AdminPlan[]): void {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.stringify(plans);
    cachedRaw = raw;
    cachedPlans = plans;
    localStorage.setItem(STORAGE_KEY, raw);
    window.dispatchEvent(new Event("admin-plans-updated"));
  } catch {}
}

export function subscribePlans(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("admin-plans-updated", handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener("admin-plans-updated", handler);
    window.removeEventListener("storage", handler);
  };
}

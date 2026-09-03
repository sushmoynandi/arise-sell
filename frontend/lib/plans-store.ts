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

export function findMatchingPlan(
  planKey: string,
  plans: AdminPlan[] = INITIAL_ADMIN_PLANS,
): AdminPlan | undefined {
  const cleanKey = planKey
    .toLowerCase()
    .replace("plan-", "")
    .replace(/[^a-z0-9]/g, "");
  return plans.find((p) => {
    const cleanId = p.id
      .toLowerCase()
      .replace("plan-", "")
      .replace(/[^a-z0-9]/g, "");
    const cleanName = p.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (cleanId === cleanKey || cleanName === cleanKey) return true;
    if (cleanKey === "scale" && cleanId === "vipscale") return true;
    if (cleanKey === "starter" && cleanId === "growth") return true;
    if (cleanKey === "freetrial" && cleanId === "free") return true;
    if (cleanKey === "enterprise" && cleanId === "customenterprise")
      return true;
    return false;
  });
}

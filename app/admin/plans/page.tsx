"use client";

import { useState } from "react";
import { INITIAL_ADMIN_PLANS, type AdminPlan } from "@/data/admin";
import { IconCheck, IconClose, IconSpark } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { formatTaka } from "@/lib/format";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<AdminPlan[]>(INITIAL_ADMIN_PLANS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [nameBn, setNameBn] = useState("");
  const [tagline, setTagline] = useState("");
  const [priceBDT, setPriceBDT] = useState(4999);
  const [messageLimit, setMessageLimit] = useState(5000);
  const [catalogLimit, setCatalogLimit] = useState(300);
  const [courierChannels, setCourierChannels] = useState(2);
  const [badge, setBadge] = useState("Special Promo");
  const [featuresStr, setFeaturesStr] = useState(
    "5,000 automated conversations\n300 catalog items indexed\nSteadfast & Pathao Courier integration\nPriority WhatsApp queue"
  );

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newPlan: AdminPlan = {
      id: `plan-${Date.now()}`,
      name,
      nameBn: nameBn || name,
      tagline,
      priceBDT: Number(priceBDT),
      billingPeriod: "monthly",
      messageLimit: Number(messageLimit),
      catalogLimit: Number(catalogLimit),
      courierChannels: Number(courierChannels),
      badge: badge || undefined,
      features: featuresStr.split("\n").filter(Boolean),
      activeMerchants: 0,
      status: "active",
    };

    setPlans((prev) => [...prev, newPlan]);
    setSuccessMsg(`Plan "${name}" created and published live to merchant checkout!`);
    setTimeout(() => setSuccessMsg(null), 4000);
    setCreateModalOpen(false);

    // Reset
    setName("");
    setNameBn("");
    setTagline("");
  };

  const handleToggleStatus = (id: string) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "archived" : "active" }
          : p
      )
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight text-text">
            Subscription Plan & Pricing Tier Builder
          </h1>
          <p className="text-[13.5px] text-text-3">
            Design, price in BDT (৳), and publish custom commercial tiers and seasonal campaign offers in real time.
          </p>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={() => setCreateModalOpen(true)}
          className="gap-1.5 font-semibold text-[13px]"
        >
          <IconSpark width={14} height={14} />
          <span>+ Create Custom Plan</span>
        </Button>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="rounded-2xl border border-signal/20 bg-signal/[0.06] p-4 text-[13px] font-medium text-signal shadow-sm flex items-center gap-2.5 animate-in fade-in">
          <IconCheck width={16} height={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border bg-white p-6 flex flex-col justify-between shadow-sm relative transition-all ${
              plan.popular
                ? "border-signal shadow-md ring-1 ring-signal/15"
                : "border-line hover:border-signal/40"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-6">
                <span className="rounded-full bg-signal px-3 py-1 font-mono text-[10.5px] font-bold text-white shadow-sm">
                  {plan.badge}
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-text text-lg">{plan.name}</h3>
                  <p className="text-[11.5px] text-text-3">{plan.nameBn}</p>
                </div>
                <span
                  className={`inline-block rounded-md px-2 py-0.5 font-mono text-[10px] font-bold ${
                    plan.status === "active"
                      ? "bg-signal/[0.08] text-signal"
                      : "bg-surface-2 text-text-3 border border-line"
                  }`}
                >
                  {plan.status.toUpperCase()}
                </span>
              </div>

              <p className="text-[12.5px] text-text-2">{plan.tagline}</p>

              <div>
                <span className="font-[family-name:var(--font-bricolage)] text-3xl font-bold text-text">
                  {formatTaka(plan.priceBDT)}
                </span>
                <span className="text-text-3 text-[12px]"> / month</span>
              </div>

              {/* Quotas */}
              <div className="rounded-xl border border-line bg-canvas p-3 text-[12px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-3">Message Quota</span>
                  <span className="font-bold text-text">{plan.messageLimit.toLocaleString()} msgs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Product Catalog</span>
                  <span className="font-bold text-text">{plan.catalogLimit} products</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-3">Courier Channels</span>
                  <span className="font-bold text-text">{plan.courierChannels} integrated</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-line">
                  <span className="text-text-3">Subscribed Stores</span>
                  <span className="font-bold text-signal">{plan.activeMerchants} merchants</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-2 text-[12.5px] pt-1">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-text-2">
                    <span className="text-signal mt-0.5">✓</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-line mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleToggleStatus(plan.id)}
                className="text-[12px] font-medium text-text-3 hover:text-text transition-colors cursor-pointer"
              >
                {plan.status === "active" ? "Archive Tier" : "Unarchive"}
              </button>

              <span className="font-mono text-[11px] text-text-3">
                ID: {plan.id}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Plan Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-text">Create Subscription Plan Tier</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg border border-line text-text-2 hover:bg-surface-2 cursor-pointer"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-text">Plan Name (English)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramadan Super Saver"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-text">Bengali Name</label>
                  <input
                    type="text"
                    value={nameBn}
                    onChange={(e) => setNameBn(e.target.value)}
                    placeholder="e.g. রমজান অফার"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Perfect for peak holiday season sales"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-text">Price in BDT (৳)</label>
                  <input
                    type="number"
                    required
                    value={priceBDT}
                    onChange={(e) => setPriceBDT(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-text">Badge Pill (Optional)</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Eid Special"
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-text">Monthly Msgs</label>
                  <input
                    type="number"
                    value={messageLimit}
                    onChange={(e) => setMessageLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-text">Catalog Items</label>
                  <input
                    type="number"
                    value={catalogLimit}
                    onChange={(e) => setCatalogLimit(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-text">Couriers</label>
                  <input
                    type="number"
                    value={courierChannels}
                    onChange={(e) => setCourierChannels(Number(e.target.value))}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">Feature Highlights (One per line)</label>
                <textarea
                  rows={4}
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white p-3 text-[12.5px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="signal"
                  size="md"
                >
                  Publish Plan Tier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

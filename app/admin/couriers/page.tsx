"use client";

import { useState } from "react";
import { INITIAL_COURIERS, type CourierGateway } from "@/data/admin";
import { IconCheck, IconClose } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState<CourierGateway[]>(INITIAL_COURIERS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Form state
  const [courierName, setCourierName] = useState("eCourier Bangladesh");
  const [code, setCode] = useState<CourierGateway["code"]>("ecourier");
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");
  const [coverage, setCoverage] = useState("Nationwide + District Hubs");

  const handleTestPing = (id: string, name: string) => {
    setTestingId(id);
    setTestResult(null);
    setTimeout(() => {
      setTestingId(null);
      setTestResult(`${name} Webhook & API Authenticated! 200 OK.`);
      setTimeout(() => setTestResult(null), 4000);
    }, 800);
  };

  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey) return;

    const newCourier: CourierGateway = {
      id: `cr-${Date.now()}`,
      courierName,
      code,
      apiKeyMasked: `${apiKey.slice(0, 8)}...`,
      secretMasked: secret ? `${secret.slice(0, 4)}...` : "None",
      status: "active",
      defaultCoverage: coverage,
      autoRoutingRule: `Route orders matching ${coverage}`,
      avgLatencyMs: 460,
      totalBookings: 0,
      successRate: 100.0,
    };

    setCouriers((prev) => [...prev, newCourier]);
    setApiKey("");
    setSecret("");
    setAddModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setCouriers((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight text-text">
            Courier API Gateways & Smart Auto-Routing
          </h1>
          <p className="text-[13.5px] text-text-3">
            Multi-carrier automated delivery dispatch with geographical
            auto-routing and instant courier failover.
          </p>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={() => setAddModalOpen(true)}
          className="gap-1.5 font-semibold text-[13px]"
        >
          <span>+ Connect Courier API</span>
        </Button>
      </div>

      {/* Test Feedback Banner */}
      {testResult && (
        <div className="rounded-2xl border border-signal/20 bg-signal/[0.06] p-4 text-[13px] font-medium text-signal shadow-sm flex items-center gap-2.5 animate-in fade-in">
          <IconCheck width={16} height={16} />
          <span>{testResult}</span>
        </div>
      )}

      {/* Smart Geographic Routing Architecture Cards */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-text">
            Active Geographic Dispatch Rules
          </h2>
          <p className="text-[12.5px] text-text-3">
            AI automatically selects the fastest courier based on customer
            address extracted from chat.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-signal/30 bg-signal/[0.04] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-signal text-[13px]">
                📍 Dhaka Metro (Zone 1)
              </span>
              <span className="rounded-md bg-signal text-white px-2 py-0.5 font-mono text-[10px] font-bold">
                PATHAO EXPRESS
              </span>
            </div>
            <p className="text-[12.5px] text-text-2">
              Dhaka North & South City Corporation deliveries are dispatched to
              Pathao for same-day/next-day fast delivery.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text text-[13px]">
                🌍 Outside Dhaka & Sub-Districts (Zone 2)
              </span>
              <span className="rounded-md bg-black text-white px-2 py-0.5 font-mono text-[10px] font-bold">
                STEADFAST COURIER
              </span>
            </div>
            <p className="text-[12.5px] text-text-2">
              All 64 districts, upazilas and rural addresses are routed to
              Steadfast Courier for maximum cash-on-delivery reach.
            </p>
          </div>
        </div>
      </div>

      {/* Courier Accounts Table */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text">
            Connected Courier Gateways
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-text-3 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Courier Name</th>
                <th className="pb-3">API Key</th>
                <th className="pb-3">Coverage & Routing Rule</th>
                <th className="pb-3">Latency</th>
                <th className="pb-3">Total Deliveries</th>
                <th className="pb-3">Success Rate</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {couriers.map((c) => (
                <tr
                  key={c.id}
                  className="hover:bg-surface-2/40 transition-colors"
                >
                  <td className="py-3.5 pr-3 font-bold text-text">
                    {c.courierName}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[12px] text-text-2">
                    {c.apiKeyMasked}
                  </td>
                  <td className="py-3.5 pr-3 text-[12.5px] text-text-2 max-w-xs">
                    {c.autoRoutingRule}
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-signal font-semibold">
                    {c.avgLatencyMs}ms
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-text">
                    {c.totalBookings.toLocaleString()}
                  </td>
                  <td className="py-3.5 pr-3 font-bold text-signal">
                    {c.successRate}%
                  </td>
                  <td className="py-3.5 pr-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-signal">
                      <span className="size-1.5 rounded-full bg-signal" />
                      {c.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTestPing(c.id, c.courierName)}
                        disabled={testingId === c.id}
                        className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-medium text-text hover:border-signal hover:text-signal transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {testingId === c.id ? "Pinging..." : "Test API"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        className="rounded-lg border border-line bg-white px-2 py-1 text-[11.5px] text-red-500 hover:bg-red-50 hover:border-red-200 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connect Courier Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-lg font-bold text-text">
                Connect New Courier Gateway
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg border border-line text-text-2 hover:bg-surface-2 cursor-pointer"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleAddCourier} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  Courier Partner
                </label>
                <select
                  value={code}
                  onChange={(e) => {
                    const c = e.target.value as CourierGateway["code"];
                    setCode(c);
                    if (c === "steadfast")
                      setCourierName("Steadfast Courier Ltd");
                    else if (c === "pathao") setCourierName("Pathao Courier");
                    else if (c === "redx") setCourierName("RedX Logistics");
                    else setCourierName("eCourier Bangladesh");
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                >
                  <option value="steadfast">Steadfast Courier API</option>
                  <option value="pathao">Pathao Merchant API</option>
                  <option value="redx">RedX Logistics API</option>
                  <option value="ecourier">eCourier Bangladesh API</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  API Key / Secret Token
                </label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter courier API key..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  Secret Key / Salt (Optional)
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Enter secret key if applicable..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-text">
                  Default Routing Coverage
                </label>
                <input
                  type="text"
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value)}
                  placeholder="e.g. Dhaka Metro, Outside Dhaka, Nationwide..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text focus:border-signal focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => setAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="signal" size="md">
                  Save & Authenticate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { INITIAL_COURIERS, type CourierGateway } from "@/data/admin";
import {
  IconCheck,
  IconClose,
  IconCopy,
  IconEye,
  IconEyeOff,
  IconPlus,
  IconPulse,
  IconTrash,
  IconTruck,
  IconWarn,
  IconShield,
  IconZap,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { cx } from "@/lib/format";

export default function AdminCouriersPage() {
  const [couriers, setCouriers] = useState<CourierGateway[]>(INITIAL_COURIERS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deletingCourier, setDeletingCourier] = useState<CourierGateway | null>(null);

  // Key reveal & copy state
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Verification state
  const [testingId, setTestingId] = useState<string | null>(null);
  const [verifiedId, setVerifiedId] = useState<string | null>(null);
  const [globalBanner, setGlobalBanner] = useState<string | null>(null);

  // Form state
  const [courierName, setCourierName] = useState("Steadfast Courier Ltd");
  const [code, setCode] = useState<CourierGateway["code"]>("steadfast");
  const [apiKey, setApiKey] = useState("");
  const [secret, setSecret] = useState("");
  const [coverage, setCoverage] = useState("Nationwide (All 64 Districts)");

  // Modal test connection state
  const [modalTesting, setModalTesting] = useState(false);
  const [modalTestResult, setModalTestResult] = useState<{
    success: boolean;
    latency: number;
    msg: string;
  } | null>(null);

  // Copy helper
  const handleCopy = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Toggle token reveal
  const toggleReveal = (id: string) => {
    setRevealedKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Live ping test in table
  const handleTestPing = (courier: CourierGateway) => {
    setTestingId(courier.id);
    setTimeout(() => {
      const lat = Math.floor(Math.random() * 80) + 380;
      setTestingId(null);
      setVerifiedId(courier.id);
      setGlobalBanner(
        `${courier.courierName} API Authenticated (${lat}ms) · Webhook status: 200 OK · Automated parcel dispatch active`,
      );
      setTimeout(() => {
        setVerifiedId(null);
        setGlobalBanner(null);
      }, 4500);
    }, 600);
  };

  // Test inside Modal
  const handleModalTest = () => {
    if (!apiKey.trim()) {
      setModalTestResult({
        success: false,
        latency: 0,
        msg: "Please enter an API Key before testing connection.",
      });
      return;
    }

    setModalTesting(true);
    setModalTestResult(null);

    setTimeout(() => {
      const lat = Math.floor(Math.random() * 90) + 390;
      setModalTesting(false);
      setModalTestResult({
        success: true,
        latency: lat,
        msg: `Connection verified (${lat}ms) · ${courierName} API Endpoint · Status: 200 OK`,
      });
    }, 600);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (deletingCourier) {
      setCouriers((prev) => prev.filter((c) => c.id !== deletingCourier.id));
      setDeletingCourier(null);
    }
  };

  // Submit new courier
  const handleAddCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    const newCourier: CourierGateway = {
      id: `cr-${Date.now()}`,
      courierName,
      code,
      apiKeyMasked: `${apiKey.slice(0, 8)}...${apiKey.slice(-3)}`,
      secretMasked: secret ? `${secret.slice(0, 4)}...` : "None",
      status: "active",
      defaultCoverage: coverage,
      autoRoutingRule: `Route orders for ${coverage}`,
      avgLatencyMs: modalTestResult?.latency || 450,
      totalBookings: 0,
      successRate: 100.0,
    };

    setCouriers((prev) => [...prev, newCourier]);
    setApiKey("");
    setSecret("");
    setModalTestResult(null);
    setAddModalOpen(false);
  };

  const totalBookings = couriers.reduce((acc, c) => acc + c.totalBookings, 0);

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-1">
      {/* ─── 1. Header ─── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text font-(family-name:--font-bricolage) tracking-tight">
              Courier API Gateways
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-3 py-0.5 text-[12px] font-bold text-signal">
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              Smart Auto-Dispatch Active
            </span>
          </div>
          <p className="text-[13.5px] text-text-3 mt-1">
            Automated courier parcel creation, address-based zone routing, and multi-courier failover.
          </p>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={() => {
            setModalTestResult(null);
            setAddModalOpen(true);
          }}
          className="gap-2 font-semibold text-[13px] h-10 px-4.5 self-start sm:self-auto cursor-pointer shadow-xs"
        >
          <IconPlus width={15} height={15} />
          <span>Connect Courier API</span>
        </Button>
      </div>

      {/* ─── Verification Banner ─── */}
      <AnimatePresence>
        {globalBanner && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-xl border border-signal/30 bg-signal/[0.07] p-3.5 text-[13px] font-medium text-signal shadow-2xs flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <IconCheck width={16} height={16} className="shrink-0 text-signal" />
              <span>{globalBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setGlobalBanner(null)}
              className="text-text-3 hover:text-text p-1 cursor-pointer"
            >
              <IconClose width={14} height={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── 2. Top Summary KPI Cards ─── */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">Connected Gateways</span>
            <span className="text-signal font-bold flex items-center gap-1">
              <IconTruck width={13} height={13} />
              Active
            </span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text font-mono">
              {couriers.length} Courier APIs
            </p>
            <p className="text-[11px] text-text-3">
              Steadfast + Pathao + RedX
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">Total Dispatches</span>
            <span className="text-text-2 font-bold">+22.4%</span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text">
              {totalBookings.toLocaleString()} Parcels
            </p>
            <p className="text-[11px] text-text-3">
              98.4% On-time pickup rate
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">Avg Gateway Latency</span>
            <span className="text-signal font-bold">Fast Edge</span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text font-mono">
              460ms
            </p>
            <p className="text-[11px] text-signal font-medium">
              Real-time webhook parcel sync
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-4 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-text-3 font-mono text-[11px]">
            <span className="font-bold uppercase tracking-wider">Resilience</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
              99.9%
            </span>
          </div>
          <div>
            <p className="text-[18px] font-bold text-text font-mono">
              Auto-Failover
            </p>
            <p className="text-[11px] text-text-3">
              Automatic backup on courier timeout
            </p>
          </div>
        </div>
      </div>

      {/* ─── 3. Smart Geographic Auto-Routing Cards ─── */}
      <div className="rounded-xl border border-line bg-white p-4.5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-line/60 pb-2.5">
          <div className="flex items-center gap-2">
            <IconShield width={15} height={15} className="text-signal" />
            <h2 className="text-[14px] font-bold text-text">
              Active Geographic Dispatch Rules
            </h2>
          </div>
          <span className="text-[11.5px] text-text-3 font-mono">
            Zero-human-touch order fulfillment
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-[12.5px]">
          <div className="rounded-xl border border-signal/30 bg-signal/[0.04] p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-signal text-[13px] flex items-center gap-1.5">
                <IconZap width={13} height={13} />
                Zone 1: Dhaka Metro
              </span>
              <span className="rounded-md bg-signal text-white px-2 py-0.5 font-mono text-[10px] font-bold">
                PATHAO EXPRESS
              </span>
            </div>
            <p className="text-[12px] text-text-2 leading-relaxed">
              Dhaka North &amp; South City Corporation deliveries are automatically assigned to Pathao for same-day and next-day express delivery.
            </p>
          </div>

          <div className="rounded-xl border border-line bg-surface-2/40 p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text text-[13px] flex items-center gap-1.5">
                <IconTruck width={13} height={13} />
                Zone 2: Nationwide (64 Districts)
              </span>
              <span className="rounded-md bg-text text-white px-2 py-0.5 font-mono text-[10px] font-bold">
                STEADFAST COURIER
              </span>
            </div>
            <p className="text-[12px] text-text-2 leading-relaxed">
              All district, upazila and rural parcel orders are routed to Steadfast Courier for maximum cash-on-delivery (CoD) coverage.
            </p>
          </div>
        </div>
      </div>

      {/* ─── 4. Connected Courier Gateways Table ─── */}
      <div className="rounded-xl border border-line bg-white shadow-2xs overflow-hidden">
        <div className="p-3.5 border-b border-line bg-surface-2/20 flex items-center justify-between">
          <h2 className="text-[14px] font-bold text-text">
            Connected Courier Gateways ({couriers.length})
          </h2>
          <span className="text-[11.5px] text-text-3 font-mono">
            Multi-Carrier Auto-Failover Enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line bg-surface-2/40 text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
              <tr>
                <th className="py-3 px-4">Courier Partner</th>
                <th className="py-3 px-3">API Key</th>
                <th className="py-3 px-3">Coverage Zone</th>
                <th className="py-3 px-3">Latency</th>
                <th className="py-3 px-3">Total Deliveries</th>
                <th className="py-3 px-3">Success Rate</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {couriers.map((c) => {
                const isRevealed = revealedKeys[c.id];
                const isTesting = testingId === c.id;
                const isDone = verifiedId === c.id;
                const isCopied = copiedKey === c.id;

                return (
                  <tr key={c.id} className="hover:bg-surface-2/30 transition-colors">
                    {/* Courier Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-surface-2 border border-line/70 grid place-items-center shrink-0">
                          <IconTruck width={16} height={16} className="text-signal" />
                        </div>
                        <div>
                          <p className="font-bold text-text leading-tight text-[13.5px]">
                            {c.courierName}
                          </p>
                          <p className="text-[11px] text-text-3 font-mono uppercase mt-0.5">
                            {c.code}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* API Key */}
                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center gap-1.5 font-mono text-[12px] text-text-2 bg-surface-2/60 px-2 py-0.5 rounded-md border border-line/60">
                        <span>
                          {isRevealed
                            ? `${c.apiKeyMasked.replace("...", "_LIVE_KEY_")}`
                            : c.apiKeyMasked}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleReveal(c.id)}
                          className="text-text-3 hover:text-text p-0.5 cursor-pointer"
                          title="Reveal / Hide"
                        >
                          {isRevealed ? (
                            <IconEyeOff width={12} height={12} />
                          ) : (
                            <IconEye width={12} height={12} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopy(c.apiKeyMasked, c.id)}
                          className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                          title="Copy API Key"
                        >
                          {isCopied ? (
                            <IconCheck width={12} height={12} className="text-signal" />
                          ) : (
                            <IconCopy width={12} height={12} />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Coverage Zone */}
                    <td className="py-3.5 px-3 text-[12.5px] text-text-2">
                      {c.defaultCoverage}
                    </td>

                    {/* Latency */}
                    <td className="py-3.5 px-3 font-mono text-[12.5px]">
                      <span className="font-bold text-signal flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-signal" />
                        {c.avgLatencyMs}ms
                      </span>
                    </td>

                    {/* Total Bookings */}
                    <td className="py-3.5 px-3 font-mono text-text">
                      {c.totalBookings.toLocaleString()}
                    </td>

                    {/* Success Rate */}
                    <td className="py-3.5 px-3 font-mono font-bold text-signal">
                      {c.successRate}%
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <span
                        className={cx(
                          "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full",
                          c.status === "active"
                            ? "bg-signal/[0.08] text-signal"
                            : "bg-surface-2 text-text-3 border border-line",
                        )}
                      >
                        <span
                          className={cx(
                            "size-1.5 rounded-full",
                            c.status === "active" ? "bg-signal" : "bg-text-3",
                          )}
                        />
                        {c.status.toUpperCase()}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleTestPing(c)}
                          disabled={isTesting}
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-[11.5px] font-medium text-text-2 hover:border-signal hover:text-signal transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <IconPulse
                            width={11}
                            height={11}
                            className={isTesting ? "animate-spin text-signal" : ""}
                          />
                          <span>
                            {isTesting ? "Testing..." : isDone ? "Verified ✓" : "Ping API"}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingCourier(c)}
                          className="text-text-3 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                          title="Delete Courier"
                        >
                          <IconTrash width={13} height={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 5. Delete Confirmation Dialog ─── */}
      <AnimatePresence>
        {deletingCourier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3">
                <div className="size-9.5 rounded-full bg-rose-50 border border-rose-200 grid place-items-center shrink-0 text-rose-600">
                  <IconWarn width={19} height={19} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text">
                    Remove Courier Gateway?
                  </h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to remove <strong>{deletingCourier.courierName}</strong>? Automated delivery dispatches for this courier will stop.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingCourier(null)}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <IconTrash width={13} height={13} />
                  <span>Yes, Remove</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 6. Connect Courier Modal ─── */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <h3 className="text-[15px] font-bold text-text">
                Connect New Courier Gateway
              </h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleAddCourier} className="space-y-3.5 text-[12.5px]">
              <div>
                <label className="block font-bold text-text mb-1">
                  Courier Partner
                </label>
                <select
                  value={code}
                  onChange={(e) => {
                    const c = e.target.value as CourierGateway["code"];
                    setCode(c);
                    setModalTestResult(null);
                    if (c === "steadfast") {
                      setCourierName("Steadfast Courier Ltd");
                      setCoverage("Nationwide (All 64 Districts)");
                    } else if (c === "pathao") {
                      setCourierName("Pathao Courier");
                      setCoverage("Dhaka Metro Express");
                    } else if (c === "redx") {
                      setCourierName("RedX Logistics");
                      setCoverage("Backup Failover Gateway");
                    } else {
                      setCourierName("eCourier Bangladesh");
                      setCoverage("District Hubs");
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none"
                >
                  <option value="steadfast">Steadfast Courier API</option>
                  <option value="pathao">Pathao Merchant API</option>
                  <option value="redx">RedX Logistics API</option>
                  <option value="ecourier">eCourier Bangladesh API</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Courier Gateway Name
                </label>
                <input
                  type="text"
                  required
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-text">
                  API Key / Merchant Key
                </label>
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    if (modalTestResult) setModalTestResult(null);
                  }}
                  placeholder="Paste merchant API key..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px]"
                />

                {/* Test Verification Banner */}
                {modalTestResult && (
                  <div className="rounded-xl border border-signal/40 bg-signal/[0.08] p-2.5 text-[11.5px] text-signal font-medium flex items-center gap-2">
                    <IconCheck width={14} height={14} className="shrink-0 text-signal" />
                    <span className="font-mono">{modalTestResult.msg}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Secret Key / Password (Optional)
                </label>
                <input
                  type="password"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Leave blank if not required..."
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none font-mono text-[12px]"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Assigned Coverage &amp; Dispatch Zone
                </label>
                <input
                  type="text"
                  value={coverage}
                  onChange={(e) => setCoverage(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={handleModalTest}
                  disabled={modalTesting}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 px-3 py-1.5 text-[12px] font-semibold text-text hover:border-signal hover:text-signal transition-colors cursor-pointer disabled:opacity-50"
                >
                  <IconPulse
                    width={12}
                    height={12}
                    className={modalTesting ? "animate-spin text-signal" : ""}
                  />
                  <span>{modalTesting ? "Testing..." : "Test Connection"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAddModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="signal" size="sm">
                    Save &amp; Connect
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

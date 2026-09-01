"use client";

import { useState } from "react";
import { IconCheck } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

export default function AdminFraudShieldPage() {
  const [notified, setNotified] = useState(false);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 font-mono text-[11.5px] font-bold text-amber-800 shadow-sm">
          <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
          <span>COMING SOON · IN ACTIVE DEVELOPMENT</span>
        </div>
        <h1 className="font-(family-name:--font-bricolage) text-3xl font-bold tracking-tight text-text">
          Fake COD & Fraud Protection Shield
        </h1>
        <p className="text-[14px] text-text-3 max-w-2xl">
          A centralized anti-fraud intelligence network for Bangladeshi social
          commerce to eliminate parcel returns (RTO) and bogus Cash-On-Delivery
          orders.
        </p>
      </div>

      {/* Feature Blueprint Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Capability 1 */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-3">
          <div className="grid size-10 place-items-center rounded-xl bg-red-50 text-red-600 font-bold text-lg">
            🚫
          </div>
          <h3 className="font-bold text-text text-base">
            Cross-Merchant RTO Blacklist
          </h3>
          <p className="text-[13px] text-text-2 leading-relaxed">
            Maintains a synchronized, anonymized database of frequent parcel
            rejecters and fake buyers across all 148+ NextProduct merchants in
            Bangladesh.
          </p>
        </div>

        {/* Capability 2 */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-3">
          <div className="grid size-10 place-items-center rounded-xl bg-signal/[0.08] text-signal font-bold text-lg">
            ⚡
          </div>
          <h3 className="font-bold text-text text-base">
            Smart Advance Charge Enforcement
          </h3>
          <p className="text-[13px] text-text-2 leading-relaxed">
            When a high-risk phone number initiates a chat, AI automatically
            prompts the customer to pay delivery charge upfront (৳১৩০ / ৳৮০ via
            bKash) before confirming the order.
          </p>
        </div>

        {/* Capability 3 */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-3">
          <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700 font-bold text-lg">
            📍
          </div>
          <h3 className="font-bold text-text text-base">
            Courier Delivery Health Scoring
          </h3>
          <p className="text-[13px] text-text-2 leading-relaxed">
            Integrates Steadfast, Pathao, and RedX historical parcel delivery
            success scores directly inside customer chat sessions in real time.
          </p>
        </div>

        {/* Capability 4 */}
        <div className="rounded-2xl border border-line bg-white p-6 shadow-sm space-y-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-600 font-bold text-lg">
            🛡️
          </div>
          <h3 className="font-bold text-text text-base">
            Automated Spam & Bot Throttle
          </h3>
          <p className="text-[13px] text-text-2 leading-relaxed">
            Detects automated spam attacks, malicious token-draining scripts,
            and abusive inquiry loops on WhatsApp and Messenger.
          </p>
        </div>
      </div>

      {/* Beta Activation Callout */}
      <div className="rounded-3xl border border-line bg-linear-to-br from-white to-surface-2 p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-text">
              Target Release: Q4 2026
            </h3>
            <p className="text-[13px] text-text-3">
              Currently undergoing closed beta testing with selected high-volume
              Dhaka merchants.
            </p>
          </div>
          {notified ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-3.5 py-1.5 text-[12.5px] font-semibold text-signal">
              <IconCheck width={14} height={14} />
              <span>Priority Access Requested</span>
            </span>
          ) : (
            <Button
              variant="signal"
              size="md"
              onClick={() => setNotified(true)}
            >
              Request Early Beta Access
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ADMIN_KPI, ADMIN_INVOICES } from "@/data/admin";
import { formatTaka } from "@/lib/format";

export default function AdminSubscriptionsPage() {
  const [invoices] = useState(ADMIN_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<
    (typeof ADMIN_INVOICES)[0] | null
  >(null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight text-text">
          Subscriptions & Billing Revenue
        </h1>
        <p className="text-[13.5px] text-text-3">
          Platform-wide MRR, Bangladeshi payment gateways (bKash, Nagad,
          SSLCommerz) and merchant invoices.
        </p>
      </div>

      {/* Primary MRR / Revenue Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <span className="text-[12px] font-semibold uppercase text-text-3">
            Total Platform MRR
          </span>
          <p className="mt-2 font-(family-name:--font-bricolage) text-2xl font-bold text-text">
            {formatTaka(ADMIN_KPI.mrrBDT)}
          </p>
          <p className="mt-1 text-[12px] text-signal font-medium">
            +18.2% from last month
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <span className="text-[12px] font-semibold uppercase text-text-3">
            Annual Run Rate (ARR)
          </span>
          <p className="mt-2 font-(family-name:--font-bricolage) text-2xl font-bold text-text">
            {formatTaka(ADMIN_KPI.arrBDT)}
          </p>
          <p className="mt-1 text-[12px] text-text-3">
            112 Active Paid Subscriptions
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <span className="text-[12px] font-semibold uppercase text-text-3">
            Payment Success Rate
          </span>
          <p className="mt-2 font-(family-name:--font-bricolage) text-2xl font-bold text-signal">
            99.2%
          </p>
          <p className="mt-1 text-[12px] text-text-3">
            Auto-renewals via bKash & Cards
          </p>
        </div>
      </div>

      {/* Plan Distribution Breakdown */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-text">
          Subscription Plan Breakdown
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text text-[13.5px]">
                Starter Plan
              </span>
              <span className="font-semibold text-signal text-[12.5px]">
                ৳২,৯৯৯/mo
              </span>
            </div>
            <p className="text-[12px] text-text-3">28 Active Merchants</p>
            <p className="text-[13px] font-bold text-text">৳৮৩,৯৭২ MRR</p>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text text-[13.5px]">
                Growth Plan
              </span>
              <span className="font-semibold text-signal text-[12.5px]">
                ৳৫,৯৯৯/mo
              </span>
            </div>
            <p className="text-[12px] text-text-3">52 Active Merchants</p>
            <p className="text-[13px] font-bold text-text">৳৩,১১,৯৪৮ MRR</p>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text text-[13.5px]">
                Scale Plan
              </span>
              <span className="font-semibold text-signal text-[12.5px]">
                ৳৯,৯৯৯/mo
              </span>
            </div>
            <p className="text-[12px] text-text-3">26 Active Merchants</p>
            <p className="text-[13px] font-bold text-text">৳২,৫৯,৯৭৪ MRR</p>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-text text-[13.5px]">
                Enterprise Tier
              </span>
              <span className="font-semibold text-signal text-[12.5px]">
                Custom
              </span>
            </div>
            <p className="text-[12px] text-text-3">6 Enterprise Brands</p>
            <p className="text-[13px] font-bold text-text">৳১,৪৯,৯৯৪ MRR</p>
          </div>
        </div>
      </div>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bold text-text text-[13.5px]">
              bKash Merchant API
            </p>
            <p className="text-[11.5px] text-text-3">68% of Total Volume</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            Live
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bold text-text text-[13.5px]">
              Nagad Direct Gateway
            </p>
            <p className="text-[11.5px] text-text-3">21% of Total Volume</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            Live
          </span>
        </div>

        <div className="rounded-2xl border border-line bg-white p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="font-bold text-text text-[13.5px]">
              SSLCommerz (Cards)
            </p>
            <p className="text-[11.5px] text-text-3">11% of Total Volume</p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            Live
          </span>
        </div>
      </div>

      {/* Invoices & Transactions Table */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text">
              Recent Billing Invoices
            </h2>
            <p className="text-[12.5px] text-text-3">
              Automated payment settlements from merchants
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-text-3 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Invoice ID</th>
                <th className="pb-3">Merchant</th>
                <th className="pb-3">Plan</th>
                <th className="pb-3">Method & TxID</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-surface-2/40 transition-colors"
                >
                  <td className="py-3.5 pr-3 font-mono font-medium text-text">
                    {inv.id}
                  </td>
                  <td className="py-3.5 pr-3 font-bold text-text">
                    {inv.merchantName}
                  </td>
                  <td className="py-3.5 pr-3 text-text-2">{inv.plan}</td>
                  <td className="py-3.5 pr-3 text-text-3">
                    <span className="block text-text-2 font-medium">
                      {inv.method}
                    </span>
                    <span className="font-mono text-[11px]">{inv.txId}</span>
                  </td>
                  <td className="py-3.5 pr-3 font-bold text-text">
                    {formatTaka(inv.amountBDT)}
                  </td>
                  <td className="py-3.5 pr-3 text-text-3">{inv.date}</td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(inv)}
                      className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-medium text-text hover:border-signal hover:text-signal transition-colors cursor-pointer"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4">
            <div className="text-center border-b border-line pb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-signal font-bold">
                Official Receipt
              </span>
              <h3 className="text-xl font-bold text-text mt-1">
                {selectedInvoice.merchantName}
              </h3>
              <p className="text-[12.5px] text-text-3">
                {selectedInvoice.id} · {selectedInvoice.date}
              </p>
            </div>

            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between py-1">
                <span className="text-text-3">Subscription Tier</span>
                <span className="font-semibold text-text">
                  {selectedInvoice.plan}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-3">Payment Channel</span>
                <span className="font-semibold text-text">
                  {selectedInvoice.method}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-3">Transaction ID</span>
                <span className="font-mono text-text">
                  {selectedInvoice.txId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-t border-line pt-2 font-bold text-base">
                <span className="text-text">Total Paid</span>
                <span className="text-signal">
                  {formatTaka(selectedInvoice.amountBDT)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="w-full rounded-xl bg-signal py-2.5 text-[13px] font-semibold text-white hover:bg-signal-deep transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

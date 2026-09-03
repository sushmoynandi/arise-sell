"use client";

import { useState, useMemo } from "react";
import { AdminInvoice } from "@/data/admin";
import { formatTaka, cx } from "@/lib/format";
import {
  IconSearch,
  IconArrowUpRight,
  IconCopy,
  IconCheck,
} from "@/components/ui/icons";

interface InvoicesTableProps {
  invoices: AdminInvoice[];
  onSelectInvoice: (inv: AdminInvoice) => void;
  copiedTxId: string | null;
  onCopyTxId: (txId: string) => void;
}

export function InvoicesTable({
  invoices,
  onSelectInvoice,
  copiedTxId,
  onCopyTxId,
}: InvoicesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMethod, setFilterMethod] = useState<string>("all");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.id.toLowerCase().includes(q) ||
        inv.merchantName.toLowerCase().includes(q) ||
        (inv.promoCode && inv.promoCode.toLowerCase().includes(q)) ||
        inv.txId.toLowerCase().includes(q) ||
        inv.plan.toLowerCase().includes(q);

      const matchesMethod =
        filterMethod === "all"
          ? true
          : filterMethod === "bkash"
            ? inv.method.toLowerCase().includes("bkash")
            : filterMethod === "nagad"
              ? inv.method.toLowerCase().includes("nagad")
              : filterMethod === "ssl"
                ? inv.method.toLowerCase().includes("ssl")
                : filterMethod === "promo"
                  ? Boolean(inv.promoCode)
                  : true;

      return matchesSearch && matchesMethod;
    });
  }, [invoices, searchQuery, filterMethod]);

  return (
    <div className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
      {/* Table Filter Controls */}
      <div className="p-4.5 border-b border-line bg-surface-2/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-[15.5px] font-bold text-text">
              Recent Billing Invoices &amp; Settlements
            </h2>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/8 px-2.5 py-0.5 text-[11.5px] font-bold text-signal font-mono transition-all">
              <span className="size-1.5 rounded-full bg-signal animate-pulse" />
              {filteredInvoices.length}{" "}
              {filteredInvoices.length === 1 ? "Invoice" : "Invoices"}
            </span>
          </div>
          <p className="text-[12px] text-text-3 mt-0.5">
            Automated renewal payments, promo code discounts, and tokenized
            auto-debits. (Click any invoice to view official receipt)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Field */}
          <div className="relative flex items-center">
            <IconSearch
              width={14}
              height={14}
              className="absolute left-3 text-text-3 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search merchant, TxID, or Promo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-xl border border-line bg-white pl-8.5 pr-3 py-1.5 text-[12.5px] text-text focus:border-signal outline-none w-48 sm:w-56"
            />
          </div>

          {/* Filter Method Dropdown */}
          <div className="relative">
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className="appearance-none rounded-xl border border-line bg-white pl-3 pr-8 py-1.5 text-[12px] font-semibold text-text focus:border-signal outline-none cursor-pointer shadow-2xs hover:border-line-2 transition-colors"
            >
              <option value="all">All Invoices</option>
              <option value="bkash">bKash Direct</option>
              <option value="nagad">Nagad Direct</option>
              <option value="ssl">SSLCommerz</option>
              <option value="promo">🏷️ Promo Codes</option>
            </select>
            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-3">
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L5 5L9 1"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-line bg-surface-2/40 text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
            <tr>
              <th className="py-3 px-4.5">Invoice ID</th>
              <th className="py-3 px-4">Merchant Shop</th>
              <th className="py-3 px-4">Plan Tier</th>
              <th className="py-3 px-4">Promo / Discount</th>
              <th className="py-3 px-4">Paid Amount</th>
              <th className="py-3 px-4">Payment Method &amp; TxID</th>
              <th className="py-3 px-4.5 text-right">Billing Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {filteredInvoices.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-text-3 text-[13px]"
                >
                  No invoices found matching &ldquo;{searchQuery}&rdquo;.
                </td>
              </tr>
            ) : (
              filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className="hover:bg-surface-2/40 transition-colors cursor-pointer group"
                  title="Click to view official tax receipt"
                >
                  <td className="py-3.5 px-4.5 font-mono font-bold text-signal group-hover:underline flex items-center gap-1">
                    <span>{inv.id}</span>
                    <IconArrowUpRight
                      width={11}
                      height={11}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </td>
                  <td className="py-3.5 px-4 font-bold text-text">
                    {inv.merchantName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-text-2">
                    <span
                      className={cx(
                        "rounded-md px-2 py-0.5 text-[11.5px] border font-mono font-semibold",
                        inv.plan.toLowerCase().includes("enterprize") ||
                          inv.plan.toLowerCase().includes("custom")
                          ? "bg-signal/8 text-signal border-signal/20"
                          : "bg-surface-2 text-text border-line",
                      )}
                    >
                      {inv.plan}
                    </span>
                  </td>
                  {/* Promo Code Column */}
                  <td className="py-3.5 px-4">
                    {inv.promoCode ? (
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 border border-amber-300/80 px-2 py-0.5 text-[11px] font-mono font-bold text-amber-800">
                          🏷️ {inv.promoCode}
                        </span>
                        <span className="text-[10.5px] text-signal font-mono font-semibold">
                          -{formatTaka(inv.discountBDT || 0)} Discount
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-3 font-mono text-[11px] opacity-60">
                        — Standard
                      </span>
                    )}
                  </td>
                  {/* Paid Amount */}
                  <td className="py-3.5 px-4 font-bold text-text font-(family-name:--font-bricolage) text-[14px]">
                    <div>
                      <span>{formatTaka(inv.amountBDT)}</span>
                      {inv.originalAmountBDT && (
                        <span className="ml-1.5 text-[11px] text-text-3 line-through font-normal font-mono opacity-70">
                          {formatTaka(inv.originalAmountBDT)}
                        </span>
                      )}
                    </div>
                  </td>
                  {/* Payment Method & TxID */}
                  <td className="py-3.5 px-4">
                    <span className="block text-text font-medium text-[12.5px]">
                      {inv.method}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <code className="font-mono text-[11px] text-text-3 bg-surface-2 px-1.5 py-0.5 rounded">
                        {inv.txId}
                      </code>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopyTxId(inv.txId);
                        }}
                        className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                        title="Copy TxID"
                      >
                        {copiedTxId === inv.txId ? (
                          <IconCheck
                            width={12}
                            height={12}
                            className="text-signal"
                          />
                        ) : (
                          <IconCopy width={12} height={12} />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4.5 text-right text-text-3 font-mono text-[12px]">
                    {inv.date}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

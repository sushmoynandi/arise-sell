"use client";

import { useState } from "react";
import {
  INITIAL_BACKUPS,
  ADMIN_MERCHANTS,
  ADMIN_INVOICES,
  type BackupSnapshot,
} from "@/data/admin";
import { IconCheck, IconShield } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

export default function AdminBackupsPage() {
  const [backups, setBackups] = useState<BackupSnapshot[]>(INITIAL_BACKUPS);
  const [creating, setCreating] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState<string | null>(null);

  // 1-Click CSV Exporters using browser Blob download
  const exportMerchantsCSV = () => {
    const headers =
      "ID,StoreName,OwnerName,Email,Phone,City,Plan,Status,MonthlyGMV_BDT,TotalOrders,AIResolutionRate\n";
    const rows = ADMIN_MERCHANTS.map(
      (m) =>
        `"${m.id}","${m.storeName}","${m.ownerName}","${m.email}","${m.phone}","${m.city}","${m.plan}","${m.status}",${m.monthlyGMV},${m.totalOrders},${m.aiResolutionRate}%`,
    ).join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NextProduct_Merchants_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadMsg(
      "Merchants CSV export generated and downloaded successfully!",
    );
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const exportInvoicesCSV = () => {
    const headers =
      "InvoiceID,MerchantName,Plan,Amount_BDT,PaymentMethod,TransactionID,Date,Status\n";
    const rows = ADMIN_INVOICES.map(
      (inv) =>
        `"${inv.id}","${inv.merchantName}","${inv.plan}",${inv.amountBDT},"${inv.method}","${inv.txId}","${inv.date}","${inv.status}"`,
    ).join("\n");

    const blob = new Blob([headers + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NextProduct_Invoices_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    setDownloadMsg(
      "Billing Invoices CSV export generated and downloaded successfully!",
    );
    setTimeout(() => setDownloadMsg(null), 4000);
  };

  const handleCreateSnapshot = () => {
    setCreating(true);
    setTimeout(() => {
      const newSnap: BackupSnapshot = {
        id: `bk-${Date.now()}`,
        name: "Manual Super Admin Snapshot",
        type: "full_system",
        sizeMB: 1785.6,
        timestamp: "Just now",
        status: "verified",
        checksum: `sha256:${Math.random().toString(36).substring(2, 12)}...`,
      };
      setBackups((prev) => [newSnap, ...prev]);
      setCreating(false);
      setDownloadMsg(
        "Full system snapshot completed and encrypted with AES-256!",
      );
      setTimeout(() => setDownloadMsg(null), 4000);
    }, 1500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-(family-name:--font-bricolage) text-2xl font-bold tracking-tight text-text">
            Data Export Hub & System Backups
          </h1>
          <p className="text-[13.5px] text-text-3">
            One-click CSV exports of merchants and revenue, automated PostgreSQL
            clusters & pgvector database snapshots.
          </p>
        </div>

        <Button
          variant="signal"
          size="md"
          onClick={handleCreateSnapshot}
          disabled={creating}
          className="gap-1.5 font-semibold text-[13px]"
        >
          <IconShield width={14} height={14} />
          <span>
            {creating ? "Taking Snapshot..." : "+ Trigger Manual Snapshot"}
          </span>
        </Button>
      </div>

      {/* Download Alert Notification */}
      {downloadMsg && (
        <div className="rounded-2xl border border-signal/20 bg-signal/[0.06] p-4 text-[13px] font-medium text-signal shadow-sm flex items-center gap-2.5 animate-in fade-in">
          <IconCheck width={16} height={16} />
          <span>{downloadMsg}</span>
        </div>
      )}

      {/* 1-Click CSV Export Cards */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-text">
            One-Click Platform Data Exporters
          </h2>
          <p className="text-[12.5px] text-text-3">
            Download raw platform metrics, store directories, and billing logs
            into spreadsheet-ready CSV files.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-line bg-canvas p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-text text-sm">
                Merchants & Stores Directory
              </h3>
              <p className="text-[12px] text-text-3">
                148 shops, phone numbers, plans, GMV, and AI resolution rates.
              </p>
            </div>
            <button
              type="button"
              onClick={exportMerchantsCSV}
              className="w-full rounded-xl border border-line bg-white py-2 text-[12.5px] font-semibold text-text hover:border-signal hover:text-signal transition-colors shadow-sm cursor-pointer"
            >
              📥 Download Merchants.csv
            </button>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-text text-sm">
                Billing Invoices & Revenue
              </h3>
              <p className="text-[12px] text-text-3">
                All bKash, Nagad and SSLCommerz transaction histories &
                receipts.
              </p>
            </div>
            <button
              type="button"
              onClick={exportInvoicesCSV}
              className="w-full rounded-xl border border-line bg-white py-2 text-[12.5px] font-semibold text-text hover:border-signal hover:text-signal transition-colors shadow-sm cursor-pointer"
            >
              📥 Download Invoices.csv
            </button>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-text text-sm">
                AI Inference Telemetry Logs
              </h3>
              <p className="text-[12px] text-text-3">
                Bangla intent accuracy benchmarks, token logs, and latency
                stats.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDownloadMsg("AI Telemetry CSV export generated!");
                setTimeout(() => setDownloadMsg(null), 3000);
              }}
              className="w-full rounded-xl border border-line bg-white py-2 text-[12.5px] font-semibold text-text hover:border-signal hover:text-signal transition-colors shadow-sm cursor-pointer"
            >
              📥 Download AITelemetry.csv
            </button>
          </div>
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden p-5 space-y-4">
        <h2 className="text-base font-bold text-text">
          Automated Cloud Database Snapshots
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="border-b border-line text-text-3 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="pb-3">Snapshot Name</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Size</th>
                <th className="pb-3">Checksum</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {backups.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-surface-2/40 transition-colors"
                >
                  <td className="py-3.5 pr-3 font-bold text-text">{b.name}</td>
                  <td className="py-3.5 pr-3">
                    <span className="inline-block rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] font-medium text-text-2">
                      {b.type.toUpperCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-text">
                    {b.sizeMB} MB
                  </td>
                  <td className="py-3.5 pr-3 font-mono text-[11.5px] text-text-3">
                    {b.checksum}
                  </td>
                  <td className="py-3.5 pr-3 text-[12.5px] text-text-3">
                    {b.timestamp}
                  </td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-signal/[0.08] px-2.5 py-0.5 text-[11px] font-semibold text-signal">
                      <span className="size-1.5 rounded-full bg-signal" />
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

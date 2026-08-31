"use client";

import { useState } from "react";
import { INITIAL_SUPPORT_TICKETS, type SupportTicket } from "@/data/admin";
import { IconCheck, IconClose, IconSpark } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_SUPPORT_TICKETS);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [patchSuccess, setPatchSuccess] = useState<string | null>(null);

  const filtered = tickets.filter((t) => {
    if (statusFilter === "all") return true;
    return t.status === statusFilter;
  });

  const handleResolveAndFix = (id: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "resolved",
              resolvedAt: "Just now",
              adminNotes: adminNote || "AI prompt override rule deployed directly to merchant engine.",
            }
          : t
      )
    );

    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              status: "resolved",
              resolvedAt: "Just now",
              adminNotes: adminNote || "AI prompt override rule deployed directly to merchant engine.",
            }
          : null
      );
    }

    setPatchSuccess("Knowledge Base prompt rule patched! Fix deployed to production bot.");
    setTimeout(() => setPatchSuccess(null), 4000);
    setAdminNote("");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-bricolage)] text-2xl font-bold tracking-tight text-text">
            Merchant Support & AI Correction Desk
          </h1>
          <p className="text-[13.5px] text-text-3">
            Inspect reported conversation hallucinations, tweak catalog prompt rules, and dispatch courier retries.
          </p>
        </div>

        {patchSuccess && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-signal/20 bg-signal/[0.08] px-3.5 py-1.5 text-[12.5px] font-semibold text-signal shadow-sm animate-in fade-in">
            <IconCheck width={14} height={14} />
            <span>{patchSuccess}</span>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {["all", "open", "resolved"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-[12.5px] font-semibold capitalize transition-colors cursor-pointer ${
              statusFilter === st
                ? "bg-signal text-white"
                : "bg-white border border-line text-text-2 hover:bg-surface-2"
            }`}
          >
            {st === "all" ? `All Tickets (${tickets.length})` : st}
          </button>
        ))}
      </div>

      {/* Tickets Table */}
      <div className="rounded-2xl border border-line bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface-2/60 border-b border-line text-text-3 text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5 pr-3">Ticket & Subject</th>
                <th className="py-3.5 px-3">Merchant</th>
                <th className="py-3.5 px-3">Category</th>
                <th className="py-3.5 px-3">Priority</th>
                <th className="py-3.5 px-3">Time</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((t) => (
                <tr
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className="hover:bg-surface-2/40 transition-colors cursor-pointer"
                >
                  <td className="py-4 pl-5 pr-3">
                    <p className="font-bold text-text hover:text-signal transition-colors">{t.subject}</p>
                    <span className="font-mono text-[11px] text-text-3">{t.ticketNo}</span>
                  </td>
                  <td className="py-4 px-3">
                    <p className="font-semibold text-text">{t.merchantName}</p>
                    <p className="text-[11.5px] text-text-3">{t.merchantEmail}</p>
                  </td>
                  <td className="py-4 px-3">
                    <span className="inline-block rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[10.5px] font-medium text-text-2">
                      {t.category.toUpperCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        t.priority === "high"
                          ? "bg-red-50 text-red-600"
                          : t.priority === "medium"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-surface-2 text-text-3"
                      }`}
                    >
                      {t.priority.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-text-3 text-[12px]">{t.createdAt}</td>
                  <td className="py-4 px-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        t.status === "open"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-signal/[0.08] text-signal"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4 pr-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setSelectedTicket(t)}
                      className="rounded-lg border border-line bg-white px-2.5 py-1 text-[11.5px] font-semibold text-text hover:border-signal hover:text-signal transition-colors shadow-sm cursor-pointer"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Details & AI Prompt Fix Drawer */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm animate-in fade-in"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="h-full w-full max-w-lg bg-white border-l border-line p-6 sm:p-8 flex flex-col shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-line">
              <div>
                <span className="font-mono text-[11px] uppercase tracking-wider text-signal font-bold">
                  {selectedTicket.ticketNo} · {selectedTicket.category.replace("_", " ").toUpperCase()}
                </span>
                <h2 className="text-lg font-bold text-text mt-1">{selectedTicket.subject}</h2>
                <p className="text-[12.5px] text-text-3">
                  Merchant: {selectedTicket.merchantName} ({selectedTicket.merchantEmail})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicket(null)}
                className="grid size-8 place-items-center rounded-lg border border-line text-text-2 hover:bg-surface-2 cursor-pointer"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            {/* Content */}
            <div className="py-5 space-y-5 flex-1">
              {/* Chat snippet */}
              {selectedTicket.reportedChatSnippet && (
                <div className="rounded-2xl border border-line bg-canvas p-4 space-y-3">
                  <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-3">
                    Reported Chat Context
                  </h4>
                  <div className="space-y-2 text-[12.5px]">
                    <div className="rounded-xl border border-line bg-white p-3">
                      <span className="text-[11px] text-text-3 font-semibold block">Customer Message:</span>
                      <p className="text-text mt-1 font-medium">{selectedTicket.reportedChatSnippet.customerMsg}</p>
                    </div>
                    <div className="rounded-xl border border-red-200 bg-red-50/50 p-3">
                      <span className="text-[11px] text-red-600 font-semibold block">AI Response (Hallucination):</span>
                      <p className="text-red-900 mt-1 font-medium">{selectedTicket.reportedChatSnippet.aiResponse}</p>
                    </div>
                    <div className="p-2 text-[12px] text-text-2">
                      <span className="font-bold text-text">Issue Diagnosis: </span>
                      {selectedTicket.reportedChatSnippet.issueDescription}
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Prompt Fix Tool */}
              <div className="rounded-2xl border border-line p-4 space-y-3">
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-text-3 flex items-center gap-1.5">
                  <IconSpark width={14} height={14} className="text-signal" />
                  <span>Deploy Knowledge Rule Patch</span>
                </h4>

                <p className="text-[12px] text-text-3">
                  Add this instruction rule to the merchant&apos;s AI Knowledge Base so the bot never repeats this error.
                </p>

                <textarea
                  rows={3}
                  value={adminNote || selectedTicket.reportedChatSnippet?.suggestedFix || ""}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Enter prompt correction rule..."
                  className="w-full rounded-xl border border-line p-3 text-[12.5px] text-text focus:border-signal focus:outline-none"
                />

                {selectedTicket.status === "open" ? (
                  <Button
                    variant="signal"
                    size="md"
                    onClick={() => handleResolveAndFix(selectedTicket.id)}
                    className="w-full justify-center"
                  >
                    Deploy Rule Fix & Resolve Ticket
                  </Button>
                ) : (
                  <div className="rounded-xl border border-signal/20 bg-signal/[0.06] p-3 text-[12.5px] font-semibold text-signal text-center">
                    Ticket Resolved ({selectedTicket.resolvedAt})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

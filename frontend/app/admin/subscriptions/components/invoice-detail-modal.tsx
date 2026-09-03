"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { AdminInvoice } from "@/data/admin";
import { formatTaka, cx } from "@/lib/format";
import { IconCheck, IconClose, IconDownload } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { generateInvoicePdfBlob } from "@/lib/invoice-pdf";
import { getMerchantDetails } from "../data/sales-snapshots";

interface InvoiceDetailModalProps {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onSuccess?: (msg: string) => void;
}

export function InvoiceDetailModal({
  invoice,
  onClose,
  onSuccess,
}: InvoiceDetailModalProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  if (!invoice) return null;

  const merchant = getMerchantDetails(invoice.merchantName);
  const originalPrice = invoice.originalAmountBDT || invoice.amountBDT;
  const discount = invoice.discountBDT || 0;

  const handlePrint = () => {
    const existingIframe = document.getElementById("invoice-print-frame");
    if (existingIframe) existingIframe.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "invoice-print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tax Invoice - ${invoice.id}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 15mm 15mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            body {
              background: #ffffff;
              color: #0f1419;
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .invoice-box {
              width: 100%;
              max-width: 100%;
              margin: 0 auto;
              background: #ffffff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 1px solid #e7e4de;
              padding-bottom: 16px;
              margin-bottom: 16px;
            }
            .company-name {
              font-size: 15px;
              font-weight: 700;
              color: #0f1419;
              margin-top: 4px;
              margin-bottom: 2px;
            }
            .company-details {
              font-size: 11.5px;
              color: #626b76;
              line-height: 1.4;
            }
            .invoice-meta {
              text-align: right;
              font-size: 11.5px;
              font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            }
            .invoice-title {
              font-size: 19px;
              font-weight: 800;
              color: #0f1419;
              display: inline-block;
              vertical-align: middle;
              margin-right: 6px;
            }
            .paid-badge {
              display: inline-block;
              background: rgba(10, 110, 80, 0.1);
              color: #0a6e50;
              font-weight: 700;
              font-size: 10.5px;
              padding: 2px 7px;
              border-radius: 4px;
              vertical-align: middle;
            }
            .billed-to {
              border-bottom: 1px solid #e7e4de;
              padding-bottom: 16px;
              margin-bottom: 16px;
              font-size: 11.5px;
            }
            .billed-to-label {
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              color: #626b76;
              font-family: ui-monospace, monospace;
              margin-bottom: 2px;
            }
            .merchant-name {
              font-size: 14px;
              font-weight: 700;
              color: #0f1419;
              margin-bottom: 2px;
            }
            .merchant-details {
              color: #4a5561;
              line-height: 1.4;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11.5px;
              margin-bottom: 14px;
            }
            thead tr {
              background: rgba(10, 110, 80, 0.06);
              border-top: 1px solid rgba(10, 110, 80, 0.2);
              border-bottom: 1px solid rgba(10, 110, 80, 0.2);
            }
            th {
              padding: 7px 10px;
              font-size: 10px;
              font-weight: 700;
              text-transform: uppercase;
              color: #0a6e50;
              font-family: ui-monospace, monospace;
              text-align: left;
            }
            td {
              padding: 9px 10px;
              border-bottom: 1px solid #f1efeb;
            }
            .item-title {
              font-weight: 700;
              font-size: 12.5px;
              color: #0f1419;
            }
            .item-desc {
              font-size: 10.5px;
              color: #626b76;
              margin-top: 2px;
            }
            .summary-container {
              display: flex;
              justify-content: flex-end;
              margin-top: 4px;
              margin-bottom: 18px;
            }
            .summary-box {
              width: 230px;
              font-size: 11.5px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 2.5px 0;
              color: #626b76;
            }
            .summary-row.discount {
              color: #8a4700;
              font-family: ui-monospace, monospace;
            }
            .summary-row.total {
              border-top: 1px solid #e7e4de;
              margin-top: 5px;
              padding-top: 5px;
              font-weight: 700;
              font-size: 13.5px;
              color: #0f1419;
            }
            .total-amount {
              color: #0a6e50;
              font-size: 16px;
              font-family: ui-monospace, monospace;
            }
            .footer {
              border-top: 1px solid #e7e4de;
              padding-top: 16px;
              text-align: center;
              font-size: 10.5px;
              color: #626b76;
              line-height: 1.4;
            }
            .footer-title {
              font-weight: 600;
              color: #0f1419;
              font-size: 11.5px;
              margin-bottom: 2px;
            }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <img src="/logo.png" alt="AriseSell" style="height: 34px; width: auto; object-fit: contain; margin-bottom: 3px;" />
                <div class="company-name">NextProduct AI Ltd.</div>
                <div class="company-details">
                  <div>House 42, Road 11, Banani, Dhaka-1213</div>
                  <div>support@nextproduct.ai</div>
                  <div style="font-family: ui-monospace, monospace; color: #4a5561; margin-top: 1px;">+880 9612-345678</div>
                </div>
              </div>
              <div class="invoice-meta">
                <div style="margin-bottom: 5px;">
                  <span class="invoice-title">INVOICE</span>
                  <span class="paid-badge">✓ PAID</span>
                </div>
                <div><span style="color: #626b76;">Invoice No: </span><strong style="color: #0a6e50;">${invoice.id}</strong></div>
                <div><span style="color: #626b76;">Date: </span><span>${invoice.date}</span></div>
                <div><span style="color: #626b76;">Method: </span><span>${invoice.method}</span></div>
                <div style="font-size: 10.5px; color: #626b76;">
                  <span>TxID: </span><code style="background: #f1efeb; padding: 2px 4px; border-radius: 3px;">${invoice.txId}</code>
                </div>
              </div>
            </div>

            <div class="billed-to">
              <div class="billed-to-label">Billed To:</div>
              <div class="merchant-name">${invoice.merchantName}</div>
              <div class="merchant-details">
                <div>Attn: ${merchant.ownerName} · ${merchant.city}</div>
                <div style="font-family: ui-monospace, monospace; font-size: 10.5px; color: #626b76;">${merchant.phone} · ${merchant.email}</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Period</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="item-title">${invoice.plan} Subscription Tier</div>
                    <div class="item-desc">AI Comment &amp; Inbox auto-reply, order processing &amp; courier sync</div>
                  </td>
                  <td style="text-align: center; font-family: ui-monospace, monospace;">1 Month</td>
                  <td style="text-align: right; font-family: ui-monospace, monospace;">${formatTaka(originalPrice)}</td>
                  <td style="text-align: right; font-family: ui-monospace, monospace; font-weight: 700;">${formatTaka(originalPrice)}</td>
                </tr>
              </tbody>
            </table>

            <div class="summary-container">
              <div class="summary-box">
                <div class="summary-row">
                  <span>Subtotal:</span>
                  <span style="font-family: ui-monospace, monospace;">${formatTaka(originalPrice)}</span>
                </div>
                ${
                  invoice.promoCode
                    ? `
                <div class="summary-row discount">
                  <span>Discount (${invoice.promoCode}):</span>
                  <span>-${formatTaka(discount)}</span>
                </div>`
                    : ""
                }
                <div class="summary-row">
                  <span>VAT / Tax (0%):</span>
                  <span style="font-family: ui-monospace, monospace;">৳০</span>
                </div>
                <div class="summary-row total">
                  <span>Total Paid:</span>
                  <span class="total-amount">${formatTaka(invoice.amountBDT)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <div class="footer-title">Thank you for partnering with NextProduct AI to power your commerce.</div>
              <div>Official electronic tax invoice &amp; payment receipt. For priority billing support, contact <strong style="color: #0a6e50;">support@nextproduct.ai</strong></div>
            </div>
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    }, 250);
  };

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      const pdfBlob = await generateInvoicePdfBlob(invoice);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice_${invoice.id}_${invoice.merchantName.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onSuccess?.(`Invoice #${invoice.id} (.PDF) downloaded successfully!`);
    } catch (err) {
      console.error("PDF generation error:", err);
      handlePrint();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:fixed print:inset-0 print:p-0 print:m-0 print:bg-white print:z-9999">
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 4 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-lg bg-white rounded-2xl border border-line shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:w-full print:rounded-none print:m-0 print:p-0"
        >
          {/* Modal Action Bar (Screen Only) */}
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-line bg-surface-2/40 print:hidden">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-signal" />
              <span className="text-[12.5px] font-bold text-text">
                Tax Invoice #{invoice.id}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isDownloadingPdf}
                onClick={handleDownloadPdf}
                className="cursor-pointer font-semibold text-[11.5px] h-7.5 px-2.5 gap-1.5 hover:border-signal hover:text-signal disabled:opacity-50"
              >
                <IconDownload
                  width={13}
                  height={13}
                  className={cx(isDownloadingPdf && "animate-bounce")}
                />
                <span>
                  {isDownloadingPdf ? "Generating PDF..." : "Download PDF"}
                </span>
              </Button>
              <Button
                type="button"
                variant="signal"
                size="sm"
                onClick={handlePrint}
                className="cursor-pointer font-semibold text-[11.5px] h-7.5 px-2.5 gap-1.5 shadow-2xs"
              >
                <span>Print / PDF</span>
              </Button>
              <button
                type="button"
                onClick={onClose}
                className="text-text-3 hover:text-text p-1 rounded-lg hover:bg-surface-2 transition-colors cursor-pointer ml-1"
                title="Close"
              >
                <IconClose width={15} height={15} />
              </button>
            </div>
          </div>

          {/* Document Canvas */}
          <div
            id="printable-invoice"
            className="p-5 sm:p-6 space-y-4 bg-white text-text print:p-8 print:space-y-8 print:w-full"
          >
            {/* Header: Company Info + Invoice Metadata */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-line pb-3.5">
              <div className="space-y-0.5">
                <Image
                  src="/logo.png"
                  alt="AriseSell"
                  width={135}
                  height={45}
                  className="h-8.5 w-auto object-contain mb-1"
                  priority
                  unoptimized
                />
                <h2 className="font-bold text-[14px] text-text">
                  NextProduct AI Ltd.
                </h2>
                <div className="text-[11.5px] text-text-3 leading-snug">
                  <p>House 42, Road 11, Banani, Dhaka-1213</p>
                  <p>support@nextproduct.ai</p>
                  <p className="font-mono text-[11px] text-text-2">
                    +880 9612-345678
                  </p>
                </div>
              </div>

              <div className="sm:text-right space-y-0.5 text-[11.5px] font-mono">
                <div className="flex sm:justify-end items-center gap-1.5 mb-1">
                  <h1 className="text-[18px] font-bold tracking-tight text-text font-(family-name:--font-bricolage)">
                    INVOICE
                  </h1>
                  <span className="inline-flex items-center gap-1 font-bold text-signal bg-signal/9 px-2 py-0.5 rounded text-[10.5px]">
                    <IconCheck width={11} height={11} className="stroke-3" />
                    PAID
                  </span>
                </div>
                <p>
                  <span className="text-text-3">Invoice No: </span>
                  <strong className="text-signal font-bold">
                    {invoice.id}
                  </strong>
                </p>
                <p>
                  <span className="text-text-3">Date: </span>
                  <span className="text-text">{invoice.date}</span>
                </p>
                <p className="text-[11px]">
                  <span className="text-text-3">Method: </span>
                  <span className="text-text">{invoice.method}</span>
                </p>
                <p className="text-[10.5px] text-text-3">
                  <span>TxID: </span>
                  <code className="text-text font-semibold bg-surface-2 px-1 py-0.2 rounded border border-line/60">
                    {invoice.txId}
                  </code>
                </p>
              </div>
            </div>

            {/* Billed To */}
            <div className="space-y-0.5 border-b border-line pb-3.5 text-[12px]">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-3 font-mono">
                Billed To:
              </p>
              <p className="font-bold text-text text-[14px]">
                {invoice.merchantName}
              </p>
              <p className="text-text-2">
                Attn: {merchant.ownerName} · {merchant.city}
              </p>
              <p className="text-text-3 font-mono text-[11px]">
                {merchant.phone} · {merchant.email}
              </p>
            </div>

            {/* Service Table */}
            <div>
              <table className="w-full text-left text-[12px] border-collapse">
                <thead>
                  <tr className="bg-signal/6 border-y border-signal/20 text-[10px] font-bold uppercase tracking-wider text-signal font-mono">
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-2 text-center">Period</th>
                    <th className="py-2 px-2 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Amount (BDT)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/60">
                  <tr>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-text text-[13px]">
                        {invoice.plan} Subscription Tier
                      </p>
                      <p className="text-[11px] text-text-3 mt-0.5">
                        AI Comment &amp; Inbox auto-reply, order processing
                        &amp; courier sync
                      </p>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono text-text-2 text-[11.5px] whitespace-nowrap">
                      1 Month
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono text-text">
                      {formatTaka(originalPrice)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono text-text">
                      {formatTaka(originalPrice)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end pt-0.5">
              <div className="w-full sm:w-56 space-y-1 text-[12px]">
                <div className="flex justify-between text-text-3 px-1">
                  <span>Subtotal:</span>
                  <span className="font-mono text-text">
                    {formatTaka(originalPrice)}
                  </span>
                </div>

                {invoice.promoCode && (
                  <div className="flex justify-between text-amber-800 font-mono text-[11px] px-1">
                    <span>Discount ({invoice.promoCode}):</span>
                    <span className="font-bold">-{formatTaka(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-text-3 text-[11px] px-1">
                  <span>VAT / Tax (0%):</span>
                  <span className="font-mono text-text">৳০</span>
                </div>

                <div className="flex justify-between items-baseline pt-1.5 border-t border-line font-bold text-[13.5px] px-1">
                  <span className="text-text">Total Paid:</span>
                  <span className="text-signal font-mono text-[17px]">
                    {formatTaka(invoice.amountBDT)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-line pt-3.5 text-center text-[11px] text-text-3 leading-relaxed">
              <p className="font-semibold text-text text-[12px]">
                Thank you for partnering with NextProduct AI to power your
                commerce.
              </p>
              <p className="text-[10px] text-text-3 mt-0.5">
                Official electronic tax invoice &amp; payment receipt. For
                priority billing support, contact{" "}
                <span className="text-signal font-mono font-medium">
                  support@nextproduct.ai
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

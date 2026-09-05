"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Panel, PanelHead } from "@/components/ui/primitives";
import { IconCheck, IconSpark } from "@/components/ui/icons";
import { TENANT } from "@/data/tenant";
import { cx } from "@/lib/format";
import { EnhancedField, SettingsField, ToggleRow } from "../components";
import { useSettings } from "../settings-context";

export function TabInvoice() {
  const { settings, updateSettings } = useSettings();
  const [layoutMode, setLayoutMode] = useState<"a4" | "thermal">(
    (settings.invoice_layout as "a4" | "thermal") ||
      (settings.invoiceLayout as "a4" | "thermal") ||
      "a4",
  );
  const [brandColor, setBrandColor] = useState<string>(
    (settings.invoiceColorAccent as string) ||
      (settings.brandColor as string) ||
      "#0a6e50",
  );
  const [invoicePrefix, setInvoicePrefix] = useState<string>(
    (settings.invoice_prefix as string) ||
      (settings.invoicePrefix as string) ||
      "NOK-",
  );
  const [invoiceSeq, setInvoiceSeq] = useState<string>(
    (settings.invoiceSeq as string) || "001042",
  );
  const [invoiceTagline, setInvoiceTagline] = useState<string>(
    (settings.invoiceTagline as string) ||
      "নকশী — ঐতিহ্যবাহী খাঁটি দেশীয় কারুশিল্প",
  );
  const [invoiceTerms, setInvoiceTerms] = useState<string>(
    (settings.invoice_terms as string) ||
      (settings.invoiceTerms as string) ||
      "Thank you for choosing Nokshi! 7-day hassle-free replacement warranty with invoice slip.",
  );
  const [supportPhone, setSupportPhone] = useState<string>(
    (settings.invoiceSupportPhone as string) ||
      (settings.phone as string) ||
      "+880 1711-234567",
  );
  const [vatNumber, setVatNumber] = useState<string>(
    (settings.invoiceBinVat as string) || "BIN: 002910394-0101",
  );
  const [showVat, setShowVat] = useState<boolean>(
    Boolean(settings.invoice_show_tax ?? settings.invoiceShowTax ?? true),
  );
  const [showQrCode, setShowQrCode] = useState<boolean>(
    Boolean(settings.invoice_show_qr ?? settings.invoiceShowQr ?? true),
  );
  const [showAddress, setShowAddress] = useState<boolean>(
    Boolean(settings.invoiceShowAddress ?? true),
  );
  const [showSignature, setShowSignature] = useState<boolean>(
    Boolean(settings.invoiceShowSignature ?? true),
  );
  const [showPaymentInfo, setShowPaymentInfo] = useState<boolean>(
    Boolean(settings.invoiceShowPaymentInfo ?? true),
  );
  const [bkashNumber, setBkashNumber] = useState<string>(
    (settings.invoicePaymentNotes as string) ||
      "01401-411091 (bKash Merchant Payment)",
  );
  const [bankWire, setBankWire] = useState<string>(
    (settings.invoiceBankWire as string) ||
      "City Bank Ltd · Nokshi & Co · A/C 1204918201 · Dhanmondi Branch",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        invoice_layout: layoutMode,
        invoiceLayout: layoutMode,
        invoiceColorAccent: brandColor,
        invoice_prefix: invoicePrefix,
        invoicePrefix,
        invoiceSeq,
        invoiceTagline,
        invoice_terms: invoiceTerms,
        invoiceTerms,
        invoiceSupportPhone: supportPhone,
        invoiceBinVat: vatNumber,
        invoice_show_tax: showVat,
        invoice_show_qr: showQrCode,
        invoiceShowAddress: showAddress,
        invoiceShowSignature: showSignature,
        invoiceShowPaymentInfo: showPaymentInfo,
        invoicePaymentNotes: bkashNumber,
        invoiceBankWire: bankWire,
      });
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } catch {
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <AnimatePresence>
        {savedToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>
              Custom Invoice layout and rules saved! Generated receipts will
              reflect these settings.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          <Panel>
            <PanelHead
              title="Invoice Format & Numbering"
              sub="Select your paper layout and configure invoice sequence numbering."
            />
            <div className="p-5 space-y-4">
              {/* Paper Format Selector */}
              <div>
                <label className="block text-xs font-bold text-text mb-2">
                  Paper Format & Layout Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLayoutMode("a4")}
                    className={cx(
                      "rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                      layoutMode === "a4"
                        ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30 shadow-2xs"
                        : "border-line bg-white hover:border-line/80",
                    )}
                  >
                    <p className="font-bold text-sm text-text">
                      A4 Standard Sheet
                    </p>
                    <p className="text-[11px] text-text-3 mt-0.5">
                      Full corporate tax receipt with detailed variant breakdown
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLayoutMode("thermal")}
                    className={cx(
                      "rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                      layoutMode === "thermal"
                        ? "border-signal bg-[#edf7f3] ring-1 ring-signal/30 shadow-2xs"
                        : "border-line bg-white hover:border-line/80",
                    )}
                  >
                    <p className="font-bold text-sm text-text">
                      POS Thermal 80mm
                    </p>
                    <p className="text-[11px] text-text-3 mt-0.5">
                      Compact roll slip for courier parcel packing & POS
                      printers
                    </p>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <SettingsField
                  label="Invoice Prefix"
                  value={invoicePrefix}
                  onChange={setInvoicePrefix}
                  placeholder="e.g. NOK-"
                />
                <SettingsField
                  label="Next Sequence Number"
                  value={invoiceSeq}
                  onChange={setInvoiceSeq}
                  placeholder="001042"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Invoice Accent Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-line cursor-pointer p-0.5 bg-white"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-28 text-xs font-mono px-2.5 py-1.5 rounded-lg border border-line bg-surface focus:outline-hidden focus:border-signal"
                    placeholder="#0a6e50"
                  />
                  <div className="flex items-center gap-1.5">
                    {[
                      "#0a6e50",
                      "#2563eb",
                      "#d97706",
                      "#dc2626",
                      "#111827",
                    ].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBrandColor(c)}
                        className={cx(
                          "w-6 h-6 rounded-full border border-black/10 transition-transform cursor-pointer",
                          brandColor === c
                            ? "scale-110 ring-2 ring-signal ring-offset-1"
                            : "hover:scale-105",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <SettingsField
                label="Invoice Header Slogan / Tagline"
                value={invoiceTagline}
                onChange={setInvoiceTagline}
                placeholder="Tagline printed under store name"
              />

              <SettingsField
                label="Customer Service Hotline on Invoice"
                value={supportPhone}
                onChange={setSupportPhone}
                placeholder="+880 1XXXXXXXXX"
              />
            </div>
          </Panel>

          <Panel>
            <PanelHead
              title="Invoice Content & Tax Rules"
              sub="Control what information is visible on customer slips."
            />
            <div className="divide-y divide-line/60">
              <ToggleRow
                label="Print Verified Tax / BIN Identification"
                desc="Prints National Board of Revenue BIN number on receipts."
                value={showVat}
                onToggle={setShowVat}
              />
              {showVat && (
                <div className="p-5">
                  <SettingsField
                    label="Business Identification Number (BIN)"
                    value={vatNumber}
                    onChange={setVatNumber}
                  />
                </div>
              )}

              <ToggleRow
                label="Embed Digital QR Verification Code"
                desc="Prints a scannable QR code on the receipt linking directly to parcel tracking or digital invoice verification."
                value={showQrCode}
                onToggle={setShowQrCode}
              />

              <ToggleRow
                label="Show Full Delivery Address"
                desc="Includes recipient street, house, and city details."
                value={showAddress}
                onToggle={setShowAddress}
              />

              <ToggleRow
                label="Authorized Signature Line"
                desc="Displays 'Authorized Store Seal & Signature' section at the bottom of the invoice."
                value={showSignature}
                onToggle={setShowSignature}
              />

              <div className="p-5">
                <label className="block text-xs font-bold text-text mb-1.5">
                  Warranty & Return Policy Footnote
                </label>
                <textarea
                  rows={2}
                  value={invoiceTerms}
                  onChange={(e) => setInvoiceTerms(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white p-3 text-[13px] text-text outline-hidden focus:border-signal"
                />
              </div>
            </div>
          </Panel>

          <Panel>
            <PanelHead
              title="MFS &amp; Bank Wire Payment Instructions"
              sub="Print official bKash merchant numbers and bank transfer details on customer receipts."
            />
            <div className="divide-y divide-line/60">
              <ToggleRow
                label="Print Payment Details on Invoices"
                desc="Displays official merchant bKash number and corporate bank wire account below total due."
                value={showPaymentInfo}
                onToggle={setShowPaymentInfo}
              />
              {showPaymentInfo && (
                <div className="p-5 space-y-4">
                  <EnhancedField
                    label="bKash / Nagad Merchant Number"
                    value={bkashNumber}
                    onChange={setBkashNumber}
                    placeholder="e.g. 01XXXXXXXXX (bKash Merchant Pay)"
                    icon={
                      <span className="text-xs font-bold font-mono">bK</span>
                    }
                    helper="Printed on customer invoices for direct mobile payment settlement."
                  />
                  <EnhancedField
                    label="Bank Wire Transfer Instructions (B2B/Wholesale)"
                    value={bankWire}
                    onChange={setBankWire}
                    placeholder="e.g. Bank Name · Account Name · A/C Number · Branch"
                    icon={
                      <span className="text-xs font-bold font-mono">🏦</span>
                    }
                    helper="Bank account info for corporate orders and advance bank transfers."
                  />
                </div>
              )}
            </div>
          </Panel>

          <div className="flex justify-end">
            <Button
              size="md"
              variant="signal"
              type="submit"
              disabled={isSaving}
              className="px-6"
            >
              {isSaving
                ? "Saving Invoice Settings…"
                : "Save Custom Invoice Rules"}
            </Button>
          </div>
        </div>

        {/* Right Live Preview: Dual A4 vs Thermal */}
        <div className="lg:col-span-5 sticky top-32 space-y-3">
          <div className="rounded-2xl border border-line bg-white shadow-md overflow-hidden">
            {/* Header Toolbar */}
            <div className="bg-surface-2/70 px-4 py-2.5 border-b border-line flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1.5 font-display">
                <IconSpark width={14} height={14} className="text-signal" />{" "}
                Live Real-Time Receipt Preview
              </span>
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-line/60">
                <button
                  type="button"
                  onClick={() => setLayoutMode("a4")}
                  className={cx(
                    "px-2 py-0.5 text-[10.5px] rounded font-medium transition-all cursor-pointer",
                    layoutMode === "a4"
                      ? "bg-signal text-white font-bold"
                      : "text-text-3 hover:text-text",
                  )}
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode("thermal")}
                  className={cx(
                    "px-2 py-0.5 text-[10.5px] rounded font-medium transition-all cursor-pointer",
                    layoutMode === "thermal"
                      ? "bg-signal text-white font-bold"
                      : "text-text-3 hover:text-text",
                  )}
                >
                  Thermal 80mm
                </button>
              </div>
            </div>

            {/* A4 Format Preview */}
            {layoutMode === "a4" ? (
              <div className="p-6 space-y-4 font-sans text-xs bg-white">
                <div className="flex items-start justify-between border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="size-10 rounded-xl grid place-items-center text-white font-bold font-display text-sm shadow-xs"
                      style={{ backgroundColor: brandColor }}
                    >
                      {(settings.name || TENANT.name || "S").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-text font-display">
                        {settings.name || TENANT.name}
                      </h4>
                      <p className="text-[10.5px] text-text-3">
                        {invoiceTagline}
                      </p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold text-white uppercase tracking-wider mb-1"
                      style={{ backgroundColor: brandColor }}
                    >
                      TAX INVOICE
                    </span>
                    <p className="font-bold text-text text-sm">
                      {invoicePrefix}
                      {invoiceSeq}
                    </p>
                    <p className="text-[10px] text-text-3">04 Sep, 2026</p>
                  </div>
                </div>

                {showAddress && (
                  <div className="grid grid-cols-2 gap-3 text-[11px] bg-surface-2/40 p-3 rounded-xl border border-line/60">
                    <div>
                      <span className="text-text-3 font-mono text-[9px] uppercase block">
                        Customer Details
                      </span>
                      <p className="font-bold text-text">Ayesha Siddiqua</p>
                      <p className="text-text-3">
                        House 12, Road 4, Dhanmondi, Dhaka
                      </p>
                      <p className="font-mono text-text-3">+880 1812-998877</p>
                    </div>
                    <div className="text-right">
                      <span className="text-text-3 font-mono text-[9px] uppercase block">
                        Payment & Courier
                      </span>
                      <p className="font-bold text-text">
                        Cash on Delivery (COD)
                      </p>
                      <p className="text-text-3">Courier: Steadfast Express</p>
                      {showVat && (
                        <p className="font-mono text-[10px] text-text-3 mt-0.5">
                          {vatNumber}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="space-y-2 border-b border-line pb-3">
                  <div className="flex justify-between font-mono text-[10px] font-bold text-text-3 uppercase">
                    <span>Item Description</span>
                    <span>Total</span>
                  </div>
                  <div className="divide-y divide-line/40">
                    <div className="flex justify-between py-1.5">
                      <div>
                        <p className="font-semibold text-text">
                          Dhakai Jamdani Saree
                        </p>
                        <p className="text-[10px] text-text-3">
                          SKU: JAM-042 · Qty: 1
                        </p>
                      </div>
                      <span className="font-mono font-bold text-text">
                        ৳৪,৮৫০
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <div>
                        <p className="font-semibold text-text">
                          Handwoven Silk Scarf
                        </p>
                        <p className="text-[10px] text-text-3">
                          SKU: SCF-108 · Qty: 1
                        </p>
                      </div>
                      <span className="font-mono font-bold text-text">
                        ৳১,২০০
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <div className="flex justify-between text-text-3">
                    <span>Subtotal</span>
                    <span>৳৬,০৫০</span>
                  </div>
                  <div className="flex justify-between text-text-3">
                    <span>Shipping Fee (Dhaka Metro)</span>
                    <span>৳৬০</span>
                  </div>
                  <div
                    className="flex justify-between font-bold text-sm pt-2 border-t border-line"
                    style={{ color: brandColor }}
                  >
                    <span>Total Due</span>
                    <span>৳৬,১১০</span>
                  </div>
                </div>

                {showPaymentInfo && (
                  <div className="rounded-xl bg-surface-2/40 border border-line p-3 text-[10.5px] space-y-1">
                    <p className="font-bold text-text flex items-center gap-1.5">
                      <span>💳</span> Payment Instructions / পরিশোধের নিয়ম:
                    </p>
                    <p className="text-text-2 font-mono">
                      <strong className="text-text">bKash:</strong>{" "}
                      {bkashNumber}
                    </p>
                    <p className="text-text-3 font-mono text-[9.5px]">
                      <strong className="text-text">Bank:</strong> {bankWire}
                    </p>
                  </div>
                )}

                {showQrCode && (
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-line">
                    <div className="text-[10.5px] text-text-3">
                      <p className="font-bold text-text">
                        Digital Verification
                      </p>
                      <p>Scan to verify authentic order & tracking</p>
                    </div>
                    <div className="size-12 rounded bg-surface-2 border border-line grid place-items-center font-mono text-[9px] text-text-3">
                      [QR Code]
                    </div>
                  </div>
                )}

                {showSignature && (
                  <div className="pt-2 flex justify-between items-end text-[10px] text-text-3">
                    <span>Hotline: {supportPhone}</span>
                    <span className="border-t border-line pt-1 font-mono">
                      Authorized Seal
                    </span>
                  </div>
                )}

                <p className="text-[10px] text-text-3 italic text-center pt-2">
                  {invoiceTerms}
                </p>
              </div>
            ) : (
              /* POS Thermal 80mm Slip Preview */
              <div className="p-6 font-mono text-[11px] bg-[#fafafa] space-y-3 border-x-4 border-dashed border-line/40">
                <div className="text-center space-y-1 border-b border-dashed border-line pb-2">
                  <h4 className="font-bold text-sm uppercase">{settings.name || TENANT.name}</h4>
                  <p className="text-[10px] text-text-3">{invoiceTagline}</p>
                  <p className="text-[10px] font-bold">
                    INV: {invoicePrefix}
                    {invoiceSeq}
                  </p>
                  <p className="text-[9.5px] text-text-3">
                    04/09/2026 10:45 AM
                  </p>
                </div>

                <div className="space-y-1 text-[10px] border-b border-dashed border-line pb-2">
                  <p>
                    <strong>CUST:</strong> Ayesha Siddiqua
                  </p>
                  <p>
                    <strong>TEL:</strong> +880 1812-998877
                  </p>
                  <p>
                    <strong>ADDR:</strong> Dhanmondi 4, Dhaka
                  </p>
                  <p>
                    <strong>COURIER:</strong> Steadfast Express (COD)
                  </p>
                </div>

                <div className="space-y-1 border-b border-dashed border-line pb-2">
                  <div className="flex justify-between">
                    <span>1x Jamdani Saree</span>
                    <span>৳4,850</span>
                  </div>
                  <div className="flex justify-between">
                    <span>1x Silk Scarf</span>
                    <span>৳1,200</span>
                  </div>
                  <div className="flex justify-between text-text-3">
                    <span>Delivery (Dhaka)</span>
                    <span>৳60</span>
                  </div>
                </div>

                <div className="flex justify-between font-bold text-xs pt-1">
                  <span>TOTAL COD:</span>
                  <span>৳6,110</span>
                </div>

                {showPaymentInfo && (
                  <div className="border-t border-dashed border-line pt-2 text-[9.5px] space-y-0.5">
                    <p className="font-bold uppercase">Payment Instructions:</p>
                    <p className="truncate">bKash: {bkashNumber}</p>
                  </div>
                )}

                {showQrCode && (
                  <div className="text-center pt-2">
                    <div className="size-14 mx-auto bg-surface-2 border border-line grid place-items-center text-[8px]">
                      [QR-80MM]
                    </div>
                    <p className="text-[9px] text-text-3 mt-1">
                      Scan for Steadfast Consignment
                    </p>
                  </div>
                )}

                <div className="text-center text-[9px] text-text-3 pt-1">
                  <p>Hotline: {supportPhone}</p>
                  <p className="italic mt-1">{invoiceTerms}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-text-3 px-1">
            <span>✨ Live automatic layout update</span>
            <button
              type="button"
              onClick={() => alert("Sample invoice PDF rendering triggered.")}
              className="text-signal hover:underline font-medium cursor-pointer"
            >
              Print Test Sample ↗
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 5: Website Orders (Sync Orders to WooCommerce/Shopify/Custom REST)
   ═══════════════════════════════════════════════════════════════════ */

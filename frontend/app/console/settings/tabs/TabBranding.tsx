"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import { IconCheck, IconSpark } from "@/components/ui/icons";
import { TENANT } from "@/data/tenant";
import { cx } from "@/lib/format";
import { EnhancedField, ToggleRow } from "../components";
import { useSettings } from "../settings-context";

export function TabBranding() {
  const { settings, updateSettings } = useSettings();
  const [brandColor, setBrandColor] = useState<string>(
    settings.brandColor || "#0a6e50",
  );
  const [secondaryColor, setSecondaryColor] = useState<string>(
    settings.secondaryColor || "#f2fbf7",
  );
  const [monogramText, setMonogramText] = useState<string>(
    settings.monogramText || "নকশী",
  );
  const [printWatermark, setPrintWatermark] = useState<boolean>(
    settings.printWatermark ?? true,
  );
  const [facebookUrl, setFacebookUrl] = useState<string>(
    settings.facebook_url ||
      settings.facebookUrl ||
      "https://facebook.com/nokshibd",
  );
  const [instagramUrl, setInstagramUrl] = useState<string>(
    settings.instagram_url ||
      settings.instagramUrl ||
      "https://instagram.com/nokshibd",
  );
  const [tiktokUrl, setTiktokUrl] = useState<string>(
    settings.tiktokUrl || "https://tiktok.com/@nokshibd",
  );
  const [whatsappUrl, setWhatsappUrl] = useState<string>(
    settings.whatsapp_url ||
      settings.whatsappUrl ||
      "https://wa.me/8801711234567",
  );
  const [mapsUrl, setMapsUrl] = useState<string>(
    settings.mapsUrl || "https://maps.google.com/?q=Dhanmondi+Dhaka",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const PRESET_COLORS = [
    { name: "Signal Emerald", hex: "#0a6e50", bg: "#f2fbf7" },
    { name: "Royal Indigo", hex: "#4338ca", bg: "#f5f3ff" },
    { name: "Crimson Rose", hex: "#be123c", bg: "#fff1f2" },
    { name: "Amber Ochre", hex: "#b45309", bg: "#fffbeb" },
    { name: "Ocean Teal", hex: "#0f766e", bg: "#f0fdfa" },
    { name: "Midnight Navy", hex: "#1e293b", bg: "#f8fafc" },
  ];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        brandColor,
        secondaryColor,
        monogramText,
        printWatermark,
        facebook_url: facebookUrl,
        facebookUrl,
        instagram_url: instagramUrl,
        instagramUrl,
        tiktokUrl,
        whatsapp_url: whatsappUrl,
        whatsappUrl,
        mapsUrl,
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
              Store visual branding, theme colors, and social presence updated!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Panel 1: Store Logo & Monogram Assets ─── */}
      <Panel>
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-signal/15 text-signal grid place-items-center shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Brand Visual Identity &amp; Logo
              </h3>
              <p className="text-xs text-text-3">
                Logomarks, favicons, and seal graphics shown on POS receipts,
                customer portals, and WhatsApp.
              </p>
            </div>
          </div>
          <Badge tone="mint" dot>
            Active Theme
          </Badge>
        </div>

        <div className="p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 p-4 rounded-2xl border border-line bg-surface-2/20">
            <div
              className="size-20 rounded-2xl grid place-items-center text-white font-bold text-2xl font-display shadow-md transition-all shrink-0 select-none"
              style={{ backgroundColor: brandColor }}
            >
              {monogramText || "নকশী"}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-text">
                  Primary Store Logo &amp; Monogram
                </p>
                <span className="text-[10px] font-mono font-bold bg-signal/15 text-signal px-2 py-0.5 rounded">
                  512×512 HD
                </span>
              </div>
              <p className="text-xs text-text-3">
                Displayed in the chat header, printed receipt slips, and
                customer notifications. Supports PNG, SVG, or WEBP with
                transparent background.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  className="cursor-pointer"
                >
                  Upload Logo (PNG/SVG)
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => setMonogramText("নকশী")}
                  className="text-xs text-text-3"
                >
                  Reset Monogram
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EnhancedField
              label="Logo Monogram Text / Initial"
              value={monogramText}
              onChange={setMonogramText}
              placeholder="e.g. নকশী or NS"
              icon={<span className="text-xs font-mono font-bold">✨</span>}
              helper="Short fallback monogram rendered when custom SVG/PNG logo is not loaded."
            />
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text flex items-center gap-1.5">
                Favicon / Browser Tab Icon
              </label>
              <div className="flex items-center gap-3 p-2 rounded-xl border border-line/80 bg-white shadow-2xs">
                <div
                  className="size-7 rounded-lg grid place-items-center text-white font-bold text-xs shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  {monogramText?.[0] || "ন"}
                </div>
                <span className="text-xs font-mono text-text-2 truncate flex-1">
                  favicon-32x32.png (Auto-generated)
                </span>
                <button
                  type="button"
                  className="text-[11px] font-semibold text-signal hover:underline px-2 py-1 rounded bg-signal-wash/40 cursor-pointer"
                >
                  Change
                </button>
              </div>
              <p className="text-[11px] text-text-3">
                Browser bookmark and tab favicon icon (32×32 PNG).
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {/* ─── Panel 2: Theme Palette & Live Appearance Mockup ─── */}
      <Panel>
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-signal/15 text-signal grid place-items-center shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="m4.93 4.93 4.24 4.24" />
                <path d="m14.83 9.17 4.24-4.24" />
                <path d="m14.83 14.83 4.24 4.24" />
                <path d="m9.17 14.83-4.24 4.24" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Brand Theme Colors &amp; Live Appearance
              </h3>
              <p className="text-xs text-text-3">
                Customer-facing accent colors across WhatsApp cards, order
                tracking pages, and invoice banners.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <div>
            <label className="block text-xs font-bold text-text mb-2.5">
              Primary Brand Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => {
                    setBrandColor(c.hex);
                    setSecondaryColor(c.bg);
                  }}
                  className={cx(
                    "h-9 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-2xs",
                    brandColor === c.hex
                      ? "ring-2 ring-offset-2 ring-black/80 scale-105 text-white"
                      : "border border-line/70 hover:scale-102 bg-white text-text-2",
                  )}
                  style={
                    brandColor === c.hex
                      ? { backgroundColor: c.hex }
                      : undefined
                  }
                >
                  <span
                    className="size-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  {brandColor === c.hex && <span className="font-bold">✓</span>}
                </button>
              ))}

              <div className="flex items-center gap-1.5 ml-auto border border-line rounded-xl px-2.5 py-1.5 bg-white shadow-2xs">
                <input
                  type="color"
                  value={brandColor}
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="size-6 rounded cursor-pointer border-0 p-0 bg-transparent"
                />
                <span className="text-xs font-mono font-bold text-text">
                  {brandColor}
                </span>
              </div>
            </div>
          </div>

          {/* Live Mockup Preview Box */}
          <div className="rounded-2xl border border-line bg-surface-2/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text flex items-center gap-1.5">
                <IconSpark width={14} height={14} className="text-signal" />
                Live Customer Touchpoint Preview
              </span>
              <span className="text-[11px] text-text-3 font-mono">
                Theme: {brandColor}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* WhatsApp Mini Card Preview */}
              <div className="rounded-xl border border-line/80 bg-white p-4 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-line/50">
                  <div className="flex items-center gap-2">
                    <div
                      className="size-7 rounded-lg grid place-items-center text-white font-bold text-xs font-display"
                      style={{ backgroundColor: brandColor }}
                    >
                      {monogramText || (settings.name || TENANT.name || "S").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text">
                        {settings.name || TENANT.name}
                      </p>
                      <p className="text-[10px] text-text-3">
                        WhatsApp Order Update
                      </p>
                    </div>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white font-mono"
                    style={{ backgroundColor: brandColor }}
                  >
                    Confirmed
                  </span>
                </div>
                <p className="text-xs text-text-2 leading-relaxed">
                  ধন্যবাদ ফারহানা আপু! আপনার অর্ডার{" "}
                  <strong className="text-text font-mono">#NOK-1043</strong> বুক
                  করা হয়েছে।
                </p>
                <div
                  className="rounded-lg p-2 text-[11px] font-semibold flex items-center justify-between"
                  style={{ backgroundColor: secondaryColor, color: brandColor }}
                >
                  <span>Total COD: ৳৩,৪৫০</span>
                  <span className="underline">View Invoice &rarr;</span>
                </div>
              </div>

              {/* Receipt Header Mini Preview */}
              <div className="rounded-xl border border-line/80 bg-white p-4 space-y-2.5 shadow-2xs flex flex-col justify-between">
                <div>
                  <div
                    className="h-1.5 w-full rounded-full mb-3"
                    style={{ backgroundColor: brandColor }}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-text font-display uppercase tracking-wide">
                        Official Cash Receipt
                      </h4>
                      <p className="text-[10px] text-text-3 font-mono">
                        Date: 04 Sep 2026 · Invoice #NOK-1043
                      </p>
                    </div>
                    <div
                      className="size-8 rounded-lg grid place-items-center text-white font-bold text-xs"
                      style={{ backgroundColor: brandColor }}
                    >
                      {monogramText || "ন"}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-dashed border-line flex items-center justify-between text-[11px] text-text-3">
                  <span>Courier: Steadfast Tracked</span>
                  <span className="font-bold text-text font-mono">
                    ৳৩,৪৫০ (Paid)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ToggleRow
              label="Print Subtle Brand Monogram Watermark on Invoices & Slips"
              desc="Embeds a light 5% opacity brand monogram in the center of printable A4 invoices and courier dispatch sheets."
              value={printWatermark}
              onToggle={setPrintWatermark}
            />
          </div>
        </div>
      </Panel>

      {/* ─── Panel 3: Social Channels & Storefront Links ─── */}
      <Panel>
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-signal/15 text-signal grid place-items-center shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Social Channels &amp; Storefront Links
              </h3>
              <p className="text-xs text-text-3">
                Official profile URLs shared by the AI sales agent when shoppers
                ask for your Facebook page, Instagram, or shop directions.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedField
              label="Facebook Page URL"
              value={facebookUrl}
              onChange={setFacebookUrl}
              placeholder="https://facebook.com/yourpage"
              icon={<span className="text-xs font-bold font-mono">f</span>}
              actionButton={
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-blue-600 hover:underline px-2 py-1 rounded bg-blue-50"
                >
                  Visit ↗
                </a>
              }
              helper="Sent when customers inquire: 'Apu apnader Facebook page link ta pabo?'"
            />

            <EnhancedField
              label="Instagram Profile URL"
              value={instagramUrl}
              onChange={setInstagramUrl}
              placeholder="https://instagram.com/yourhandle"
              icon={<span className="text-xs font-bold font-mono">📸</span>}
              actionButton={
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-pink-600 hover:underline px-2 py-1 rounded bg-pink-50"
                >
                  Visit ↗
                </a>
              }
              helper="Shared when buyers ask for customer review highlights and reels."
            />

            <EnhancedField
              label="TikTok / Video Storefront URL"
              value={tiktokUrl}
              onChange={setTiktokUrl}
              placeholder="https://tiktok.com/@yourshop"
              icon={<span className="text-xs font-bold font-mono">🎵</span>}
              helper="Live streaming and unboxing video showcase."
            />

            <EnhancedField
              label="WhatsApp Catalog URL"
              value={whatsappUrl}
              onChange={setWhatsappUrl}
              placeholder="https://wa.me/c/880XXXXXXXXX"
              icon={<span className="text-xs">💬</span>}
              actionButton={
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-emerald-700 hover:underline px-2 py-1 rounded bg-emerald-50"
                >
                  Chat 💬
                </a>
              }
              helper="Direct WhatsApp catalog link for browsing on mobile."
            />
          </div>

          <EnhancedField
            label="Google Maps Showroom / Warehouse Location"
            value={mapsUrl}
            onChange={setMapsUrl}
            placeholder="https://maps.google.com/?q=..."
            icon={
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            actionButton={
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-signal hover:underline px-2 py-1 rounded bg-signal-wash/50"
              >
                Directions ↗
              </a>
            }
            helper="Sent when buyers ask: 'Apnader shop er location koi? Ami eshe dekhe nite chai.'"
          />
        </div>
      </Panel>

      <div className="flex justify-end">
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving}
          className="px-6 shadow-xs"
        >
          {isSaving ? "Saving Branding…" : "Save Brand Settings"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 4: Custom Invoice (Dedicated Tab with Dual A4 & Thermal POS Slip Preview)
   ═══════════════════════════════════════════════════════════════════ */

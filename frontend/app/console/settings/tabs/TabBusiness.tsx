"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import { IconCheck, IconBrain, IconSpark } from "@/components/ui/icons";
import { cx } from "@/lib/format";
import { EnhancedField } from "../components";
import { useSettings } from "../settings-context";

export function TabBusiness() {
  const { settings, updateSettings, createStore } = useSettings();
  const isNoStore = settings.has_store === false || !settings.name;

  const [storeName, setStoreName] = useState<string>(() =>
    isNoStore ? "" : settings.name || "",
  );
  const [storeNameBn, setStoreNameBn] = useState<string>(() =>
    isNoStore ? "" : settings.nameBn || (settings.name_bn as string) || "",
  );
  const [tagline, setTagline] = useState<string>(() =>
    isNoStore ? "" : (settings.tagline as string) || "",
  );
  const [category, setCategory] = useState<string>(() =>
    isNoStore ? "" : settings.kind || "Fashion, Clothing & Saree Boutique",
  );
  const [website, setWebsite] = useState<string>(() =>
    isNoStore ? "" : settings.website || "",
  );
  const [supportEmail, setSupportEmail] = useState<string>(() =>
    isNoStore ? "" : settings.support_email || "",
  );
  const [phone, setPhone] = useState<string>(() =>
    isNoStore ? "" : settings.phone || "",
  );
  const [whatsappNumber, setWhatsappNumber] = useState<string>(() =>
    isNoStore ? "" : settings.whatsapp_number || "",
  );
  const [address, setAddress] = useState<string>(() =>
    isNoStore ? "" : settings.address || "",
  );
  const [cityDivision, setCityDivision] = useState<string>(() =>
    isNoStore ? "" : settings.city_division || "",
  );
  const [postalCode, setPostalCode] = useState<string>(() =>
    isNoStore ? "" : settings.postal_code || "",
  );
  const [tradeLicense, setTradeLicense] = useState<string>(() =>
    isNoStore ? "" : settings.trade_license || "",
  );

  // Operating Hours
  const [isOpenForOrders, setIsOpenForOrders] = useState<boolean>(
    settings.isOpenForOrders ?? true,
  );
  const [scheduleMode, setScheduleMode] = useState<"24x7" | "custom">(
    settings.scheduleMode || "custom",
  );
  const [openTime, setOpenTime] = useState<string>(
    settings.openTime || "09:00 AM",
  );
  const [closeTime, setCloseTime] = useState<string>(
    settings.closeTime || "10:00 PM",
  );
  const [weeklyOffDay, setWeeklyOffDay] = useState<string>(
    settings.weeklyOffDay || "None (Open 7 Days)",
  );
  const [enableAwayMsg, setEnableAwayMsg] = useState<boolean>(
    settings.enableAwayMsg ?? true,
  );
  const [awayMessage, setAwayMessage] = useState<string>(() =>
    isNoStore ? "" : settings.awayMessage || "",
  );

  // Localization & Regional
  const [currency, setCurrency] = useState<string>(settings.currency || "BDT");
  const [timezone, setTimezone] = useState<string>(
    settings.timezone || "Asia/Dhaka",
  );
  const [dateFormat, setDateFormat] = useState<string>(
    settings.dateFormat || "DD/MM/YYYY",
  );
  const [taxMode, setTaxMode] = useState<string>(
    settings.taxMode || "inclusive_75",
  );
  const [orderPrefix, setOrderPrefix] = useState<string>(() =>
    isNoStore ? "" : settings.orderPrefix || "",
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const [savedToastMessage, setSavedToastMessage] = useState("");

  // Sync state if settings or store presence changes
  useEffect(() => {
    if (isNoStore) {
      setStoreName("");
      setStoreNameBn("");
      setTagline("");
      setCategory("Fashion, Clothing & Saree Boutique");
      setWebsite("");
      setSupportEmail("");
      setPhone("");
      setWhatsappNumber("");
      setAddress("");
      setCityDivision("");
      setPostalCode("");
      setTradeLicense("");
      setOrderPrefix("");
      setAwayMessage("");
    } else {
      setStoreName(settings.name || "");
      setStoreNameBn(settings.nameBn || (settings.name_bn as string) || "");
      setTagline((settings.tagline as string) || "");
      setCategory(settings.kind || "Fashion, Clothing & Saree Boutique");
      setWebsite(settings.website || "");
      setSupportEmail(settings.support_email || "");
      setPhone(settings.phone || "");
      setWhatsappNumber(settings.whatsapp_number || "");
      setAddress(settings.address || "");
      setCityDivision(settings.city_division || "");
      setPostalCode(settings.postal_code || "");
      setTradeLicense(settings.trade_license || "");
      setOrderPrefix(settings.orderPrefix || "");
      setAwayMessage(settings.awayMessage || "");
    }
  }, [isNoStore, settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name: storeName,
        name_bn: storeNameBn,
        nameBn: storeNameBn,
        kind: category,
        tagline,
        website,
        support_email: supportEmail,
        phone,
        whatsapp_number: whatsappNumber,
        address,
        city_division: cityDivision,
        postal_code: postalCode,
        trade_license: tradeLicense,
        isOpenForOrders,
        scheduleMode,
        openTime,
        closeTime,
        weeklyOffDay,
        enableAwayMsg,
        awayMessage,
        currency,
        timezone,
        dateFormat,
        taxMode,
        orderPrefix,
      };

      if (isNoStore) {
        const result = await createStore(payload);
        if (result.success) {
          setSavedToastMessage(
            "Store created successfully! Welcome to your new store workspace.",
          );
          setSavedToast(true);
          setTimeout(() => setSavedToast(false), 4000);
        } else {
          setSavedToastMessage(
            result.error ||
              "Failed to create store. Please check your store name.",
          );
          setSavedToast(true);
          setTimeout(() => setSavedToast(false), 5000);
        }
      } else {
        await updateSettings(payload);
        setSavedToastMessage(
          "Store general information saved and synchronized across all channels!",
        );
        setSavedToast(true);
        setTimeout(() => setSavedToast(false), 3000);
      }
    } catch {
      setSavedToastMessage("An error occurred while saving store details.");
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
            <span>{savedToastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Hero Banner: Create Your Store mode ─── */}
      {isNoStore && (
        <div className="rounded-2xl border border-signal/30 bg-gradient-to-r from-signal/10 via-signal/5 to-transparent p-5 sm:p-7 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="size-11 rounded-2xl bg-signal text-white grid place-items-center shrink-0 shadow-xs">
                <IconSpark className="size-5.5" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl sm:text-2xl font-bold text-text font-display">
                    Create Your Store
                  </h2>
                  <Badge tone="azure">New Store</Badge>
                </div>
                <p className="mt-1 text-xs sm:text-[13px] text-text-2 max-w-2xl leading-relaxed">
                  Fill in your brand store details below. All fields have
                  recommended placeholders to guide you. Once created, your
                  sales channels, catalog, and AI assistant will be ready.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Link Callout to Knowledge Base & AI Brain */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-signal/25 bg-signal-wash/35 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-signal/15 flex items-center justify-center text-signal shrink-0">
            <IconBrain width={18} height={18} />
          </div>
          <div>
            <p className="text-[13px] font-bold text-text">
              Looking for AI Persona, Dialect &amp; Tone?
            </p>
            <p className="text-[11.5px] text-text-3">
              Configure your AI sales assistant&apos;s language dialect, sales
              tone, prompt directives, guardrails, and knowledge base in the
              Knowledge Base.
            </p>
          </div>
        </div>
        <Link
          href="/console/brain"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-line text-[12px] font-semibold text-signal hover:bg-signal hover:text-white transition-all shadow-2xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Open AI Brain</span>
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {/* ─── Panel 1: Store Identity & Trade Profile ─── */}
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
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                {isNoStore
                  ? "Store Identity & Setup"
                  : "Store Identity & Trade Profile"}
              </h3>
              <p className="text-xs text-text-3">
                Official business registration details, branding names, and
                industry category.
              </p>
            </div>
          </div>
          <Badge tone={isNoStore ? "azure" : "mint"} dot={!isNoStore}>
            {isNoStore ? "Setup Required" : "Active Tenant"}
          </Badge>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedField
              label="Business Name (English)"
              value={storeName}
              onChange={setStoreName}
              placeholder="e.g. Nokshi & Co."
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
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              }
              helper="Primary brand name displayed on POS receipts and customer notifications."
            />

            <EnhancedField
              label="Business Name (বাংলা)"
              value={storeNameBn}
              onChange={setStoreNameBn}
              placeholder="e.g. নকশী অ্যান্ড কোং"
              icon={<span className="text-xs font-bold font-mono">🇧🇩</span>}
              helper="Bengali storefront title used in localized Bangla customer greetings."
            />
          </div>

          <EnhancedField
            label="Store Tagline / Slogan"
            value={tagline}
            onChange={setTagline}
            placeholder="e.g. Authentic handloom sarees, silk & artisanal lifestyle products in Dhaka"
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            }
            helper="Short bio highlighted in customer welcome messages and quote estimates."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-bold text-text flex items-center gap-1.5">
                Industry / Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 cursor-pointer shadow-2xs"
              >
                <option value="Fashion, Clothing & Saree Boutique">
                  👗 Fashion &amp; Boutique
                </option>
                <option value="Handicrafts, Handloom & Artisanal Decor">
                  🏺 Handicrafts &amp; Decor
                </option>
                <option value="Electronics, Gadgets & Smart Accessories">
                  📱 Electronics &amp; Gadgets
                </option>
                <option value="Beauty, Cosmetics & Personal Care">
                  💄 Cosmetics &amp; Beauty
                </option>
                <option value="Organic Food, Honey & Grocery">
                  🍯 Organic Food &amp; Grocery
                </option>
                <option value="Furniture & Home Living">
                  🛋️ Furniture &amp; Living
                </option>
                <option value="General Multi-Category Retail">
                  📦 Multi-Category Retail
                </option>
              </select>
              <p className="text-[11px] text-text-3">
                Helps AI adopt appropriate industry terminology.
              </p>
            </div>

            <div className="md:col-span-1">
              <EnhancedField
                label="Store Website URL"
                value={website}
                onChange={setWebsite}
                placeholder="https://nokshi.co"
                badge={isNoStore ? undefined : "Verified 🟢"}
                badgeTone="mint"
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
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                }
                actionButton={
                  !isNoStore && website ? (
                    <a
                      href={website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-signal hover:underline px-2 py-1 rounded-md bg-signal-wash/50"
                    >
                      Visit ↗
                    </a>
                  ) : undefined
                }
                helper="Main public e-commerce store URL."
              />
            </div>

            <div className="md:col-span-1">
              <EnhancedField
                label="Trade License / Tax BIN"
                value={tradeLicense}
                onChange={setTradeLicense}
                placeholder="TRAD/DNCC/XXXXXX"
                badge={isNoStore ? undefined : "Verified"}
                badgeTone="mint"
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                }
                helper="Printed on VAT Mushak-6.3 tax invoices."
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* ─── Panel 2: Customer Care & Fulfillment Hub ─── */}
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
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Customer Care &amp; Fulfillment Location
              </h3>
              <p className="text-xs text-text-3">
                Official contact channels printed on shipping labels, tax
                invoices, and customer receipts.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EnhancedField
              label="Customer Support Email"
              value={supportEmail}
              onChange={setSupportEmail}
              placeholder="support@nokshi.co"
              type="email"
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
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
              helper="Receives buyer inquiries and order copy notifications."
            />

            <EnhancedField
              label="Official Helpline Phone"
              value={phone}
              onChange={setPhone}
              placeholder="+880 1711-234567"
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
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
              }
              helper="Printed on courier parcel waybills for customer contact."
            />

            <EnhancedField
              label="WhatsApp Support Number"
              value={whatsappNumber}
              onChange={setWhatsappNumber}
              placeholder="+880 1401-411091"
              badge={isNoStore ? undefined : "WABA API"}
              badgeTone="mint"
              icon={<span className="text-xs">💬</span>}
              actionButton={
                !isNoStore && whatsappNumber ? (
                  <a
                    href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline px-2 py-1 rounded-md bg-emerald-50"
                  >
                    Chat 💬
                  </a>
                ) : undefined
              }
              helper="Direct WhatsApp customer support hotline."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <EnhancedField
                label="Storefront / Warehouse Address"
                value={address}
                onChange={setAddress}
                placeholder="House, Road, Area, Ward"
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
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                }
                helper="Primary pickup hub address for courier dispatch riders."
              />
            </div>

            <div className="space-y-1.5 md:col-span-1">
              <label className="text-xs font-bold text-text flex items-center gap-1.5">
                City / Division
              </label>
              <select
                value={cityDivision}
                onChange={(e) => setCityDivision(e.target.value)}
                className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 cursor-pointer shadow-2xs"
              >
                <option value="Dhaka">Dhaka Metro</option>
                <option value="Chattogram">Chattogram</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barishal">Barishal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
              <p className="text-[11px] text-text-3">Courier base hub zone.</p>
            </div>

            <div className="md:col-span-1">
              <EnhancedField
                label="Postal / ZIP Code"
                value={postalCode}
                onChange={setPostalCode}
                placeholder="1209"
                icon={<span className="text-xs font-mono font-bold">#</span>}
                helper="Courier zone postal routing code."
              />
            </div>
          </div>
        </div>
      </Panel>

      {/* ─── Panel 3: Operating Hours & Auto-Away Responder ─── */}
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
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Operating Schedule &amp; Auto-Away Responder
              </h3>
              <p className="text-xs text-text-3">
                Define your business hours and how AI handles midnight/holiday
                customer orders.
              </p>
            </div>
          </div>
          <Badge
            tone={isOpenForOrders ? "mint" : "neutral"}
            dot={isOpenForOrders}
          >
            {isOpenForOrders ? "Accepting Orders 🟢" : "Vacation Mode ⏸️"}
          </Badge>
        </div>

        <div className="divide-y divide-line/60">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text">
                Accept Live Orders Online
              </p>
              <p className="text-xs text-text-3 mt-0.5 max-w-xl">
                When active, the AI assistant guides customers through instant
                automated checkout. When paused, it answers inquiries and
                politely schedules orders for next opening.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpenForOrders(!isOpenForOrders)}
              className={cx(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                isOpenForOrders
                  ? "bg-signal"
                  : "bg-neutral-300 dark:bg-neutral-700",
              )}
            >
              <span
                className={cx(
                  "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  isOpenForOrders ? "translate-x-5" : "translate-x-0",
                )}
              />
            </button>
          </div>

          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-text">
                Schedule Mode:
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setScheduleMode("24x7")}
                  className={cx(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                    scheduleMode === "24x7"
                      ? "bg-signal text-white border-signal shadow-xs"
                      : "bg-white text-text-2 border-line hover:bg-surface-2",
                  )}
                >
                  ⚡ 24/7 Round-the-Clock Always Open
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleMode("custom")}
                  className={cx(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
                    scheduleMode === "custom"
                      ? "bg-signal text-white border-signal shadow-xs"
                      : "bg-white text-text-2 border-line hover:bg-surface-2",
                  )}
                >
                  ⏰ Custom Business Hours
                </button>
              </div>
            </div>

            {scheduleMode === "custom" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <EnhancedField
                  label="Daily Opening Time"
                  value={openTime}
                  onChange={setOpenTime}
                  placeholder="09:00 AM"
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
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                  helper="Operations start time."
                />

                <EnhancedField
                  label="Daily Closing Time"
                  value={closeTime}
                  onChange={setCloseTime}
                  placeholder="10:00 PM"
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
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                  helper="Operations closing time."
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text">
                    Weekly Off-Day
                  </label>
                  <select
                    value={weeklyOffDay}
                    onChange={(e) => setWeeklyOffDay(e.target.value)}
                    className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 cursor-pointer shadow-2xs"
                  >
                    <option value="None (Open 7 Days)">
                      None (Open 7 Days)
                    </option>
                    <option value="Friday (শুক্রবার)">Friday (শুক্রবার)</option>
                    <option value="Sunday (রবিবার)">Sunday (রবিবার)</option>
                  </select>
                  <p className="text-[11px] text-text-3">
                    Weekly dispatch pause day.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Automated Away Responder Message */}
          <div className="p-5 space-y-4 bg-surface-2/20">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text">
                  Outside-Hours Auto-Away Message
                </h4>
                <p className="text-xs text-text-3 mt-0.5">
                  The AI automatically reassures customers when they text after
                  business hours, guaranteeing priority morning shipping.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnableAwayMsg(!enableAwayMsg)}
                className={cx(
                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
                  enableAwayMsg
                    ? "bg-signal"
                    : "bg-neutral-300 dark:bg-neutral-700",
                )}
              >
                <span
                  className={cx(
                    "pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    enableAwayMsg ? "translate-x-4" : "translate-x-0",
                  )}
                />
              </button>
            </div>

            {enableAwayMsg && (
              <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4 pt-1">
                <div className="space-y-2">
                  <textarea
                    rows={4}
                    value={awayMessage}
                    onChange={(e) => setAwayMessage(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white p-3 text-[13px] text-text leading-relaxed outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 shadow-2xs"
                  />
                  <div className="flex items-center justify-between text-[11px] text-text-3 font-mono">
                    <span>{awayMessage.length} characters</span>
                    <button
                      type="button"
                      onClick={() =>
                        setAwayMessage(
                          "নমস্কার! আমাদের অফিস ও ওয়্যারহাউস এখন বন্ধ আছে। আপনার অর্ডারটি সুরক্ষিতভাবে গ্রহণ করা হয়েছে। আগামীকাল সকাল ১০টায় আমাদের টিম পার্সেল প্যাকেজিং ও ডেলিভারি কনফার্মেশন শুরু করবে। 🌿",
                        )
                      }
                      className="text-signal hover:underline cursor-pointer"
                    >
                      Reset Default Message
                    </button>
                  </div>
                </div>

                {/* WhatsApp Chat Bubble Simulation Preview */}
                <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 space-y-2.5">
                  <div className="flex items-center gap-2 pb-1 border-b border-emerald-200/60 text-[11px] font-bold text-emerald-900">
                    <span>💬</span>
                    <span>Live WhatsApp Customer Simulation</span>
                  </div>
                  <div className="rounded-2xl rounded-tl-xs bg-[#e7fed6] text-emerald-950 p-3 text-[12px] leading-relaxed shadow-xs border border-emerald-200">
                    <p>{awayMessage}</p>
                    <div className="mt-1.5 flex items-center justify-end gap-1 text-[10px] text-emerald-700 font-mono">
                      <span>11:45 PM</span>
                      <span>✓✓</span>
                    </div>
                  </div>
                  <p className="text-[10.5px] text-emerald-800">
                    Delivered automatically by AI when customer chats outside
                    operating hours.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Panel>

      {/* ─── Panel 4: Currency, Regional & Tax Settings ─── */}
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
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                <path d="M12 18V6" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Currency, Regional &amp; Tax Settings
              </h3>
              <p className="text-xs text-text-3">
                Accounting currency, time display, VAT computation mode, and
                order ID formatting.
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 cursor-pointer shadow-2xs"
            >
              <option value="BDT">BDT (৳) — Bangladeshi Taka</option>
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
            </select>
            <p className="text-[11px] text-text-3">Store checkout currency.</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 cursor-pointer shadow-2xs"
            >
              <option value="Asia/Dhaka">Asia/Dhaka (UTC +06:00)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (UTC +05:30)</option>
              <option value="UTC">UTC (Universal Time)</option>
            </select>
            <p className="text-[11px] text-text-3">
              Order timestamps &amp; reports.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value)}
              className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 cursor-pointer shadow-2xs"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY (04/09/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (2026-09-04)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (09/04/2026)</option>
            </select>
            <p className="text-[11px] text-text-3">
              Printed receipt date format.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text">
              Tax / VAT Calculation
            </label>
            <select
              value={taxMode}
              onChange={(e) => setTaxMode(e.target.value)}
              className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal focus:ring-2 focus:ring-signal/15 cursor-pointer shadow-2xs"
            >
              <option value="inclusive_75">
                Prices include 7.5% Mushak VAT
              </option>
              <option value="inclusive_5">
                Prices include 5% VAT (Cottage)
              </option>
              <option value="exclusive">
                Prices exclude VAT (+7.5% at checkout)
              </option>
              <option value="exempt">VAT Exempt / Zero Rated</option>
            </select>
            <p className="text-[11px] text-text-3">
              NBR Mushak invoice calculation.
            </p>
          </div>

          <div className="md:col-span-4 pt-2 border-t border-line/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-md">
              <label className="text-xs font-bold text-text">
                Order Sequence Prefix
              </label>
              <p className="text-[11px] text-text-3 mt-0.5">
                Customize the automated tracking serial prepended to all new
                order IDs.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-36">
                <EnhancedField
                  label=""
                  value={orderPrefix}
                  onChange={setOrderPrefix}
                  placeholder="e.g. ORD-"
                />
              </div>
              <Badge tone="neutral" className="text-xs font-mono font-bold">
                Preview: #{orderPrefix || "ORD-"}1043
              </Badge>
            </div>
          </div>
        </div>
      </Panel>

      {/* ─── Bottom Save Action ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface border border-line shadow-xs">
        <div>
          <p className="text-sm font-bold text-text">
            {isNoStore
              ? "Ready to create your store?"
              : "Ready to apply changes?"}
          </p>
          <p className="text-xs text-text-3 mt-0.5">
            {isNoStore
              ? "Provisions your store workspace, sets up default channels, and activates your AI assistant."
              : "Synchronizes instantly across customer receipts, courier waybills, and AI sales engine."}
          </p>
        </div>
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving || (isNoStore && !storeName.trim())}
          className="px-6 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSaving ? (
            <>
              <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>{isNoStore ? "Creating Store…" : "Saving Profile…"}</span>
            </>
          ) : (
            <>
              {isNoStore ? (
                <IconSpark width={15} height={15} />
              ) : (
                <IconCheck width={15} height={15} />
              )}
              <span>
                {isNoStore ? "Create Your Store" : "Save General Settings"}
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 2: Account (Profile, Security, Password Change & Danger Zone)
   ═══════════════════════════════════════════════════════════════════ */

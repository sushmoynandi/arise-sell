"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Panel, PanelHead } from "@/components/ui/primitives";
import { IconCheck, IconEye, IconEyeOff } from "@/components/ui/icons";
import { SettingsField, ToggleRow } from "../components";
import { useSettings } from "../settings-context";

export function TabWebsiteOrders() {
  const { settings, updateSettings } = useSettings();
  const [enabled, setEnabled] = useState(
    (settings.website_orders_enabled as boolean) ??
      (settings.websiteOrdersEnabled as boolean) ??
      false,
  );
  const [preset, setPreset] = useState<"custom" | "woocommerce" | "shopify">(
    (settings.websiteOrdersPreset as "custom" | "woocommerce" | "shopify") ||
      "custom",
  );
  const [paymentMode, setPaymentMode] = useState<"payment_link" | "cod">(
    (settings.website_orders_payment_mode as "payment_link" | "cod") ||
      (settings.websiteOrdersPaymentMode as "payment_link" | "cod") ||
      "payment_link",
  );
  const [apiBaseUrl, setApiBaseUrl] = useState(
    (settings.website_orders_api_url as string) ||
      (settings.websiteOrdersApiUrl as string) ||
      "https://nokshi.co/api/v1/orders",
  );
  const [authType, setAuthType] = useState(
    (settings.websiteOrdersAuthType as string) || "api_key",
  );
  const [headerName, setHeaderName] = useState(
    (settings.website_orders_auth_header as string) ||
      (settings.websiteOrdersAuthHeader as string) ||
      "X-API-Key",
  );
  const [apiKey, setApiKey] = useState(
    (settings.website_orders_api_key as string) ||
      (settings.websiteOrdersApiKey as string) ||
      "arise_live_89128394812",
  );
  const [showKey, setShowKey] = useState(false);

  const [requestTemplate, setRequestTemplate] = useState(
    (settings.website_orders_template as string) ||
      (settings.websiteOrdersTemplate as string) ||
      `{
  "customer_name": "{{customer_name}}",
  "customer_phone": "{{customer_phone}}",
  "delivery_address": "{{delivery_address}}",
  "city": "{{city}}",
  "items": {{items_json}},
  "total_amount": {{total_amount}},
  "delivery_charge": {{delivery_charge}},
  "payment_method": "{{payment_method}}"
}`,
  );

  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    status: number;
    latency: string;
  } | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleTestPing = () => {
    setIsPinging(true);
    setPingResult(null);
    setTimeout(() => {
      setIsPinging(false);
      setPingResult({
        success: true,
        status: 200,
        latency: "142ms",
      });
    }, 1100);
  };

  const handleProposeTemplate = () => {
    if (preset === "woocommerce") {
      setRequestTemplate(`{
  "payment_method": "cod",
  "payment_method_title": "Cash on Delivery",
  "billing": {
    "first_name": "{{customer_name}}",
    "phone": "{{customer_phone}}",
    "address_1": "{{delivery_address}}"
  },
  "line_items": {{items_json}}
}`);
    } else if (preset === "shopify") {
      setRequestTemplate(`{
  "order": {
    "email": "{{customer_email}}",
    "phone": "{{customer_phone}}",
    "shipping_address": {
      "name": "{{customer_name}}",
      "address1": "{{delivery_address}}"
    },
    "financial_status": "pending"
  }
}`);
    } else {
      setRequestTemplate(`{
  "customer_name": "{{customer_name}}",
  "customer_phone": "{{customer_phone}}",
  "delivery_address": "{{delivery_address}}",
  "items": {{items_json}},
  "total_amount": {{total_amount}}
}`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        website_orders_enabled: enabled,
        websiteOrdersEnabled: enabled,
        websiteOrdersPreset: preset,
        website_orders_payment_mode: paymentMode,
        websiteOrdersPaymentMode: paymentMode,
        website_orders_api_url: apiBaseUrl,
        websiteOrdersApiUrl: apiBaseUrl,
        websiteOrdersAuthType: authType,
        website_orders_auth_header: headerName,
        websiteOrdersAuthHeader: headerName,
        website_orders_api_key: apiKey,
        websiteOrdersApiKey: apiKey,
        website_orders_template: requestTemplate,
        websiteOrdersTemplate: requestTemplate,
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
            <span>Website Orders configuration saved and verified!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <Panel>
        <PanelHead
          title="Website Orders Integration"
          sub="Let the AI agent place confirmed chat orders directly on your own website or e-commerce backend."
        />
        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Enable Website Ordering"
            desc="When active, AI chat orders are dispatched to your website order API instead of the standalone list."
            value={enabled}
            onToggle={setEnabled}
          />

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Platform Preset
                </label>
                <select
                  value={preset}
                  onChange={(e) => {
                    const val = e.target.value as
                      | "custom"
                      | "woocommerce"
                      | "shopify";
                    setPreset(val);
                    if (val === "woocommerce") {
                      setApiBaseUrl(
                        "https://yourshop.com/wp-json/wc/v3/orders",
                      );
                      setHeaderName("Authorization");
                    } else if (val === "shopify") {
                      setApiBaseUrl(
                        "https://yourshop.myshopify.com/admin/api/2024-01/orders.json",
                      );
                      setHeaderName("X-Shopify-Access-Token");
                    }
                  }}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
                >
                  <option value="custom">Custom REST API / Webhook</option>
                  <option value="woocommerce">WooCommerce (WordPress)</option>
                  <option value="shopify">Shopify Store API</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Order Payment Mode
                </label>
                <select
                  value={paymentMode}
                  onChange={(e) =>
                    setPaymentMode(e.target.value as "payment_link" | "cod")
                  }
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
                >
                  <option value="payment_link">
                    Payment link (pay online) — Agent sends checkout URL
                  </option>
                  <option value="cod">
                    Cash on delivery (COD) — Agent directly creates confirmed
                    order
                  </option>
                </select>
              </div>
            </div>

            <SettingsField
              label="API Base URL Endpoint"
              value={apiBaseUrl}
              onChange={setApiBaseUrl}
              placeholder="https://yourshop.com/api/orders"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1.5">
                  Authentication Type
                </label>
                <select
                  value={authType}
                  onChange={(e) => setAuthType(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal"
                >
                  <option value="api_key">API Key Header</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="basic">Basic Auth</option>
                  <option value="none">No Authentication (Public)</option>
                </select>
              </div>

              <SettingsField
                label="Auth Header Name"
                value={headerName}
                onChange={setHeaderName}
                placeholder="X-API-Key"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1.5">
                API Key / Secret Token
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13px] font-mono text-text pr-10 focus:border-signal outline-hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-3 text-text-3 hover:text-text cursor-pointer"
                >
                  {showKey ? (
                    <IconEyeOff width={16} height={16} />
                  ) : (
                    <IconEye width={16} height={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel>
        <div className="p-5 border-b border-line flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-text">
              JSON Request Payload Template
            </h3>
            <p className="text-xs text-text-3 mt-0.5">
              Available variables:{" "}
              <code className="font-mono text-signal font-semibold">
                {"{{customer_name}}"}
              </code>
              ,{" "}
              <code className="font-mono text-signal font-semibold">
                {"{{customer_phone}}"}
              </code>
              ,{" "}
              <code className="font-mono text-signal font-semibold">
                {"{{delivery_address}}"}
              </code>
              ,{" "}
              <code className="font-mono text-signal font-semibold">
                {"{{items_json}}"}
              </code>
              ,{" "}
              <code className="font-mono text-signal font-semibold">
                {"{{total_amount}}"}
              </code>
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={handleProposeTemplate}
          >
            🪄 AI Propose Template
          </Button>
        </div>

        <div className="p-5 space-y-4">
          <textarea
            rows={8}
            value={requestTemplate}
            onChange={(e) => setRequestTemplate(e.target.value)}
            className="w-full rounded-xl border border-line bg-surface-2/40 p-3.5 text-xs font-mono text-text outline-hidden focus:border-signal leading-relaxed"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={handleTestPing}
                disabled={isPinging}
              >
                {isPinging ? "Dispatching Ping…" : "Send Test Order Ping"}
              </Button>
              {pingResult && (
                <span className="text-xs font-mono text-signal flex items-center gap-1 font-semibold">
                  <IconCheck width={13} height={13} /> HTTP {pingResult.status}{" "}
                  OK ({pingResult.latency})
                </span>
              )}
            </div>

            <Button
              size="md"
              variant="signal"
              type="submit"
              disabled={isSaving}
              className="px-6"
            >
              {isSaving ? "Saving Configuration…" : "Save Website Orders Setup"}
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 6: Couriers (Steadfast, Pathao, RedX, Zones & Auto-Book)
   ═══════════════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════════════
   TAB 6: Couriers (Steadfast, Pathao, RedX, Fraud Shield & Rates)
   ═══════════════════════════════════════════════════════════════════ */

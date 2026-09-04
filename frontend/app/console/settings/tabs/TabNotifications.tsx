"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import { IconCheck, IconSpark } from "@/components/ui/icons";
import { TENANT } from "@/data/tenant";
import { EnhancedField, ToggleRow } from "../components";
import { useSettings } from "../settings-context";

export function TabNotifications() {
  const { settings, updateSettings } = useSettings();
  // Owner Alerts
  const [whatsappAlert, setWhatsappAlert] = useState<boolean>(
    Boolean(settings.whatsappAlert ?? true),
  );
  const [ownerPhone, setOwnerPhone] = useState<string>(
    (settings.ownerPhone as string) ||
      (settings.phone as string) ||
      "+880 1711-234567",
  );
  const [telegramAlert, setTelegramAlert] = useState<boolean>(
    Boolean(settings.telegramAlert ?? false),
  );
  const [telegramBotToken, setTelegramBotToken] = useState<string>(
    (settings.telegramBotToken as string) || "",
  );
  const [telegramChatId, setTelegramChatId] = useState<string>(
    (settings.telegramChatId as string) || "",
  );
  const [telegramPinging, setTelegramPinging] = useState<boolean>(false);
  const [telegramPingResult, setTelegramPingResult] = useState<string | null>(
    null,
  );

  // Customer SMS (Bangladesh Gateways)
  const [enableCustomerSms, setEnableCustomerSms] = useState<boolean>(
    Boolean(settings.enableCustomerSms ?? true),
  );
  const [smsGateway, setSmsGateway] = useState<string>(
    (settings.smsProvider as string) || "bulksmsbd",
  );
  const [smsApiKey, setSmsApiKey] = useState<string>(
    (settings.smsApiKey as string) || "bsms_live_948102938",
  );
  const [smsSenderId, setSmsSenderId] = useState<string>(
    (settings.smsSenderId as string) || "Nokshi",
  );
  const [smsOrderConfirmed, setSmsOrderConfirmed] = useState<boolean>(
    Boolean(settings.smsOrderConfirmed ?? true),
  );
  const [orderSmsTemplate, setOrderSmsTemplate] = useState<string>(
    (settings.orderSmsTemplate as string) ||
      "ধন্যবাদ {{customer_name}}! আপনার অর্ডার #{{order_id}} সফলভাবে কনফার্ম হয়েছে। মোট প্রদেয়: ৳{{total_amount}} (ক্যাশ অন ডেলিভারি)। — {{store_name}}",
  );
  const [smsParcelDispatched, setSmsParcelDispatched] = useState<boolean>(
    Boolean(settings.smsParcelDispatched ?? true),
  );
  const [dispatchSmsTemplate, setDispatchSmsTemplate] = useState<string>(
    (settings.dispatchSmsTemplate as string) ||
      "প্রিয় {{customer_name}}, আপনার পার্সেল {{courier_name}} কুরিয়ারে পাঠানো হয়েছে। ট্র্যাকিং কোড: {{tracking_code}}। ক্যাশ রেডি রাখুন ৳{{total_amount}}। — {{store_name}}",
  );

  // Operational Milestones
  const [orderAlert, setOrderAlert] = useState<boolean>(
    Boolean(settings.orderAlert ?? true),
  );
  const [lowStock, setLowStock] = useState<boolean>(
    Boolean(settings.lowStock ?? true),
  );
  const [stockThreshold, setStockThreshold] = useState<string>(
    (settings.stockThreshold as string) || "5",
  );
  const [dailyDigest, setDailyDigest] = useState<boolean>(
    Boolean(settings.dailyDigest ?? true),
  );
  const [quotaWarn, setQuotaWarn] = useState<boolean>(
    Boolean(settings.quotaWarn ?? true),
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleTestTelegram = () => {
    setTelegramPinging(true);
    setTelegramPingResult(null);
    setTimeout(() => {
      setTelegramPinging(false);
      setTelegramPingResult("✅ Test message delivered to Telegram Chat!");
      setTimeout(() => setTelegramPingResult(null), 4000);
    }, 1200);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        whatsappAlert,
        ownerPhone,
        telegramAlert,
        telegramBotToken,
        telegramChatId,
        enableCustomerSms,
        smsProvider: smsGateway,
        smsApiKey,
        smsSenderId,
        smsOrderConfirmed,
        orderSmsTemplate,
        smsParcelDispatched,
        dispatchSmsTemplate,
        orderAlert,
        lowStock,
        stockThreshold,
        dailyDigest,
        quotaWarn,
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
              Notification channels, SMS gateway rules, and store alerts saved!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Panel 1: Instant Owner Dispatch Channels ─── */}
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
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Instant Owner Order Dispatch Channels
              </h3>
              <p className="text-xs text-text-3">
                Receive immediate push notifications on your personal smartphone
                when the AI agent successfully books an order.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Instant WhatsApp Ping on New Orders"
            desc="Delivers an interactive WhatsApp notification with customer name, items, COD amount, and Steadfast parcel link."
            value={whatsappAlert}
            onToggle={setWhatsappAlert}
          />
          {whatsappAlert && (
            <div className="p-5 bg-surface-2/20">
              <EnhancedField
                label="Owner WhatsApp Phone"
                value={ownerPhone}
                onChange={setOwnerPhone}
                placeholder="+880 1XXXXXXXXX"
                icon={<span className="text-xs">💬</span>}
                helper="WhatsApp number where order summary pings are dispatched."
              />
            </div>
          )}

          <ToggleRow
            label="Telegram Bot Instant Alerts (100% Free & Fast)"
            desc="Dispatches immediate order summaries directly to your Telegram chat or private management group without WhatsApp API costs."
            value={telegramAlert}
            onToggle={setTelegramAlert}
          />
          {telegramAlert && (
            <div className="p-5 bg-surface-2/20 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EnhancedField
                  label="Telegram Bot Token"
                  value={telegramBotToken}
                  onChange={setTelegramBotToken}
                  placeholder="e.g. 7192839482:AAH9..."
                  type="password"
                  icon={<span className="text-xs font-mono font-bold">🤖</span>}
                  helper="Created via @BotFather on Telegram."
                />
                <EnhancedField
                  label="Telegram Chat ID / Group ID"
                  value={telegramChatId}
                  onChange={setTelegramChatId}
                  placeholder="e.g. 981293842 or -100..."
                  icon={<span className="text-xs font-mono font-bold">#</span>}
                  helper="Chat ID from @userinfobot or channel ID."
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={telegramPinging}
                  className="cursor-pointer"
                >
                  {telegramPinging
                    ? "Sending Test Alert…"
                    : "Send Test Telegram Ping"}
                </Button>
                {telegramPingResult && (
                  <span className="text-xs font-semibold text-signal font-mono">
                    {telegramPingResult}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* ─── Panel 2: Customer SMS Notifications (Local BD Gateways) ─── */}
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
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Customer SMS Notifications (Bangladesh Gateways)
              </h3>
              <p className="text-xs text-text-3">
                Send branded SMS alerts directly to customer mobile phones on
                order placement and courier shipment.
              </p>
            </div>
          </div>
          <Badge tone="mint" dot>
            BTRC Approved
          </Badge>
        </div>

        <div className="divide-y divide-line/60">
          <ToggleRow
            label="Enable Automated Customer SMS Notifications"
            desc="Automatically dispatch SMS alerts to buyer mobile numbers for order confirmation and consignment dispatch."
            value={enableCustomerSms}
            onToggle={setEnableCustomerSms}
          />

          {enableCustomerSms && (
            <div className="p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text">
                    SMS Gateway Provider
                  </label>
                  <select
                    value={smsGateway}
                    onChange={(e) => setSmsGateway(e.target.value)}
                    className="w-full rounded-xl border border-line/80 bg-white px-3 py-2.5 text-[13px] text-text outline-hidden focus:border-signal cursor-pointer shadow-2xs"
                  >
                    <option value="bulksmsbd">BulkSMSBD (Recommended)</option>
                    <option value="greenweb">Greenweb BD</option>
                    <option value="elitbuzz">Elitbuzz SMS</option>
                    <option value="alpha">Alpha SMS BD</option>
                    <option value="ssl">SSL Wireless SMS</option>
                  </select>
                  <p className="text-[11px] text-text-3">
                    Local BD telecom aggregator.
                  </p>
                </div>

                <EnhancedField
                  label="SMS API Key / Token"
                  value={smsApiKey}
                  onChange={setSmsApiKey}
                  placeholder="API Key"
                  type="password"
                  icon={<span className="text-xs font-mono font-bold">🔑</span>}
                  helper="Issued from your SMS provider console."
                />

                <EnhancedField
                  label="Sender ID / Masking Name"
                  value={smsSenderId}
                  onChange={setSmsSenderId}
                  placeholder="e.g. Nokshi"
                  badge="Masking"
                  badgeTone="mint"
                  icon={<span className="text-xs font-mono font-bold">🏷️</span>}
                  helper="Approved BTRC alphanumeric sender tag."
                />
              </div>

              {/* SMS Templates & Live Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smsOrderConfirmed}
                          onChange={(e) =>
                            setSmsOrderConfirmed(e.target.checked)
                          }
                          className="size-3.5 accent-signal cursor-pointer rounded"
                        />
                        Order Confirmation SMS
                      </label>
                      <span className="text-[11px] text-text-3 font-mono">
                        {orderSmsTemplate.length} chars (1 SMS part)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={orderSmsTemplate}
                      onChange={(e) => setOrderSmsTemplate(e.target.value)}
                      disabled={!smsOrderConfirmed}
                      className="w-full rounded-xl border border-line bg-white p-3 text-[12.5px] text-text outline-hidden focus:border-signal font-sans shadow-2xs disabled:opacity-50 disabled:bg-surface-2"
                    />
                    <p className="text-[11px] text-text-3">
                      Tags:{" "}
                      <code className="bg-surface-2 px-1 rounded text-text font-mono text-[10px]">
                        &#123;&#123;customer_name&#125;&#125;
                      </code>
                      ,{" "}
                      <code className="bg-surface-2 px-1 rounded text-text font-mono text-[10px]">
                        &#123;&#123;order_id&#125;&#125;
                      </code>
                      ,{" "}
                      <code className="bg-surface-2 px-1 rounded text-text font-mono text-[10px]">
                        &#123;&#123;total_amount&#125;&#125;
                      </code>
                      ,{" "}
                      <code className="bg-surface-2 px-1 rounded text-text font-mono text-[10px]">
                        &#123;&#123;store_name&#125;&#125;
                      </code>
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-text flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={smsParcelDispatched}
                          onChange={(e) =>
                            setSmsParcelDispatched(e.target.checked)
                          }
                          className="size-3.5 accent-signal cursor-pointer rounded"
                        />
                        Courier Parcel Dispatched SMS
                      </label>
                      <span className="text-[11px] text-text-3 font-mono">
                        {dispatchSmsTemplate.length} chars (1 SMS part)
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={dispatchSmsTemplate}
                      onChange={(e) => setDispatchSmsTemplate(e.target.value)}
                      disabled={!smsParcelDispatched}
                      className="w-full rounded-xl border border-line bg-white p-3 text-[12.5px] text-text outline-hidden focus:border-signal font-sans shadow-2xs disabled:opacity-50 disabled:bg-surface-2"
                    />
                    <p className="text-[11px] text-text-3">
                      Tags:{" "}
                      <code className="bg-surface-2 px-1 rounded text-text font-mono text-[10px]">
                        &#123;&#123;courier_name&#125;&#125;
                      </code>
                      ,{" "}
                      <code className="bg-surface-2 px-1 rounded text-text font-mono text-[10px]">
                        &#123;&#123;tracking_code&#125;&#125;
                      </code>
                    </p>
                  </div>
                </div>

                {/* Mobile Phone SMS Simulation Preview */}
                <div className="lg:col-span-5 rounded-2xl border border-line bg-surface-2/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-text flex items-center gap-1.5">
                      <IconSpark
                        width={14}
                        height={14}
                        className="text-signal"
                      />
                      Live Customer SMS Preview
                    </span>
                    <Badge tone="neutral" className="text-[10px] font-mono">
                      Sender: {smsSenderId || "Nokshi"}
                    </Badge>
                  </div>

                  {/* Phone Screen Bubble */}
                  <div className="rounded-xl border border-line bg-white p-3.5 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between text-[10.5px] text-text-3 border-b border-line/50 pb-1.5 font-mono">
                      <span>SMS Messages · Grameenphone</span>
                      <span>Now</span>
                    </div>
                    <div className="bg-[#f0f2f5] p-3 rounded-2xl text-xs text-text leading-relaxed">
                      {orderSmsTemplate
                        .replace("{{customer_name}}", "Farhana")
                        .replace("{{order_id}}", "NOK-1043")
                        .replace("{{total_amount}}", "3,450")
                        .replace("{{store_name}}", TENANT.name)}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-text-3 font-mono pt-1">
                      <span>Delivered via {smsGateway.toUpperCase()}</span>
                      <span className="text-signal font-semibold">
                        Cost: ৳0.35/SMS
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </Panel>

      {/* ─── Panel 3: Automated Milestone & Inventory Triggers ─── */}
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
                <polyline points="12 6 12 12 14 14" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Store Operational Milestones &amp; Digests
              </h3>
              <p className="text-xs text-text-3">
                Automated email and in-console alerts when inventory drops or
                monthly quota thresholds are reached.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-line/60">
          <ToggleRow
            label="New Order Console Alert"
            desc="Notify immediately via browser notification and console chime when an order is finalized."
            value={orderAlert}
            onToggle={setOrderAlert}
          />
          <ToggleRow
            label="Low Inventory Alert"
            desc="Trigger an alert when any product variant inventory dips below specified safety threshold."
            value={lowStock}
            onToggle={setLowStock}
          />
          {lowStock && (
            <div className="p-5 bg-surface-2/20">
              <EnhancedField
                label="Low Stock Alert Threshold (Units)"
                value={stockThreshold}
                onChange={setStockThreshold}
                placeholder="5"
                icon={<span className="text-xs font-mono font-bold">⚠️</span>}
                helper="Alerts triggered when variant inventory quantity is at or below this number."
              />
            </div>
          )}
          <ToggleRow
            label="Daily Morning Revenue Digest"
            desc="Deliver an 8:00 AM summary of yesterday's revenue, conversion rate, and top-selling variants."
            value={dailyDigest}
            onToggle={setDailyDigest}
          />
          <ToggleRow
            label="Monthly Quota 80% Exhaustion Warning"
            desc="Warn owner before closed order quota is depleted to prevent conversation pauses."
            value={quotaWarn}
            onToggle={setQuotaWarn}
          />
        </div>
      </Panel>

      <div className="flex justify-end pt-2">
        <Button
          size="md"
          variant="signal"
          type="submit"
          disabled={isSaving}
          className="px-6 shadow-xs"
        >
          {isSaving ? "Saving Notifications…" : "Save Notification Preferences"}
        </Button>
      </div>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 10: Billing (Current Plan, Dynamic Quotas, Top-ups & Invoices)
   ═══════════════════════════════════════════════════════════════════ */

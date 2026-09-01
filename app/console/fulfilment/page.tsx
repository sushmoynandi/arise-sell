"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PageHeader from "@/components/console/PageHeader";
import {
  Badge,
  Button,
  ChannelChip,
  Panel,
  PanelHead,
  type Tone,
} from "@/components/ui/primitives";
import { IconCheck, IconTruck, IconWarn } from "@/components/ui/icons";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import { ORDERS } from "@/data/operations";
import { TENANT } from "@/data/tenant";
import type { OrderState } from "@/data/types";
import { bdt, cx, phone } from "@/lib/format";

const STATE: Record<OrderState, { label: string; tone: Tone }> = {
  awaiting_confirm: { label: "Awaiting confirm", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "signal" },
  packed: { label: "Packed", tone: "azure" },
  in_transit: { label: "In transit", tone: "iris" },
  delivered: { label: "Delivered", tone: "mint" },
  returned: { label: "Returned", tone: "coral" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

const TRACK: OrderState[] = ["confirmed", "packed", "in_transit", "delivered"];

export default function FulfilmentPage() {
  const [activeId, setActiveId] = useState(ORDERS[0].id);
  const [tab, setTab] = useState<"parcel" | "invoice">("parcel");
  const o = ORDERS.find((x) => x.id === activeId) ?? ORDERS[0];

  const subtotal = o.lines.reduce((a, l) => a + l.qty * l.unit, 0);
  const total = subtotal + o.delivery - o.discount;
  const stepIdx = TRACK.indexOf(o.state);

  return (
    <>
      <PageHeader
        title="Orders & Delivery"
        sub="Automated courier bookings, parcel status, and invoice generation in one unified screen."
        actions={
          <>
            <Badge tone="mint" dot>
              2 pickups scheduled today
            </Badge>
            <Button size="sm">Book all confirmed</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_400px] lg:p-8">
        {/* --------------- order table --------------- */}
        <Panel className="overflow-hidden">
          <PanelHead
            title="Orders"
            sub={`${ORDERS.length} in the last 72 hours`}
            right={
              <Badge tone="neutral">
                COD {bdt(ORDERS.filter((x) => x.pay === "cod").length * 1)}
              </Badge>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-155 text-left">
              <thead>
                <tr className="border-b border-line font-mono text-[10px] uppercase tracking-wider text-text-3">
                  <th className="px-5 py-2.5 font-normal">Order</th>
                  <th className="px-3 py-2.5 font-normal">Customer</th>
                  <th className="px-3 py-2.5 font-normal">Courier</th>
                  <th className="px-3 py-2.5 text-right font-normal">Total</th>
                  <th className="px-5 py-2.5 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {ORDERS.map((row) => {
                  const rowTotal =
                    row.lines.reduce((a, l) => a + l.qty * l.unit, 0) +
                    row.delivery -
                    row.discount;
                  const on = row.id === activeId;
                  return (
                    <tr
                      key={row.id}
                      onClick={() => setActiveId(row.id)}
                      className={cx(
                        "cursor-pointer border-b border-line-soft transition-colors",
                        on ? "bg-surface-2" : "hover:bg-surface-2/50",
                      )}
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-[12px] text-text">
                          {row.ref}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] text-text-3">
                          {row.placedAt}
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        <span className="block text-[13px] text-text">
                          {row.customer}
                        </span>
                        <span className="mt-0.5 block">
                          <ChannelChip
                            channel={row.channel}
                            label={row.district}
                          />
                        </span>
                      </td>
                      <td className="px-3 py-3.5">
                        {row.courier ? (
                          <>
                            <span className="block font-mono text-[11.5px] capitalize text-text-2">
                              {row.courier.provider}
                            </span>
                            <span className="mt-0.5 block font-mono text-[10px] text-text-3">
                              {row.courier.consignment}
                            </span>
                          </>
                        ) : (
                          <span className="text-[11.5px] text-text-3">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3.5 text-right">
                        <span className="font-display text-[14px] font-semibold tracking-tight text-text">
                          {bdt(rowTotal)}
                        </span>
                        <span className="mt-0.5 block font-mono text-[10px] uppercase text-text-3">
                          {row.pay}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={STATE[row.state].tone}>
                          {STATE[row.state].label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* --------------- detail --------------- */}
        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <div className="flex border-b border-line">
              {(["parcel", "invoice"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cx(
                    "relative flex-1 py-3 text-[13px] capitalize transition-colors",
                    tab === t ? "text-text" : "text-text-3 hover:text-text-2",
                  )}
                >
                  {t}
                  {tab === t && (
                    <motion.span
                      layoutId="ful-tab"
                      transition={SPRING}
                      className="absolute inset-x-0 bottom-0 h-[2px] bg-signal"
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "parcel" ? (
                <motion.div
                  key="parcel"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={SPRING_SOFT}
                  className="p-5"
                >
                  <p className="font-mono text-[11px] text-text-3">{o.ref}</p>
                  <h3 className="mt-1 font-display text-[19px] font-semibold tracking-tight">
                    {o.customer}
                  </h3>
                  <p className="mt-1.5 text-[12.5px] leading-snug text-text-2">
                    {o.address}
                  </p>
                  <p className="mt-1 font-mono text-[12px] text-text-2">
                    {phone(o.phone)}
                  </p>

                  {/* tracker */}
                  {o.state !== "returned" && o.state !== "awaiting_confirm" && (
                    <div className="mt-6">
                      <div className="flex items-center">
                        {TRACK.map((s, i) => {
                          const done = i <= stepIdx;
                          return (
                            <div
                              key={s}
                              className="flex flex-1 items-center last:flex-none"
                            >
                              <motion.span
                                initial={false}
                                animate={{
                                  backgroundColor: done
                                    ? "var(--signal)"
                                    : "var(--surface-3)",
                                  scale: i === stepIdx ? 1.15 : 1,
                                }}
                                transition={SPRING}
                                className="grid size-5 shrink-0 place-items-center rounded-full"
                              >
                                {done && (
                                  <IconCheck
                                    width={11}
                                    height={11}
                                    className="text-signal-ink"
                                  />
                                )}
                              </motion.span>
                              {i < TRACK.length - 1 && (
                                <div className="h-px flex-1 overflow-hidden bg-surface-3">
                                  <motion.div
                                    className="h-full bg-signal"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: i < stepIdx ? 1 : 0 }}
                                    style={{ originX: 0 }}
                                    transition={SPRING_SOFT}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-2 flex justify-between font-mono text-[9.5px] text-text-3">
                        {TRACK.map((s) => (
                          <span key={s} className="capitalize">
                            {s.replace("_", " ")}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {o.courier ? (
                    <div className="mt-6 rounded-xl border border-line bg-surface-2/50 p-4">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-8 place-items-center rounded-lg bg-signal text-signal-ink">
                          <IconTruck width={16} height={16} />
                        </span>
                        <div>
                          <p className="text-[13px] font-medium capitalize text-text">
                            {o.courier.provider}
                          </p>
                          <p className="font-mono text-[10.5px] text-text-3">
                            {o.courier.tracking}
                          </p>
                        </div>
                      </div>
                      <dl className="mt-3.5 space-y-1.5 border-t border-line pt-3 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <dt className="text-text-3">Consignment</dt>
                          <dd className="text-text-2">
                            {o.courier.consignment}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-text-3">ETA</dt>
                          <dd className="text-text-2">{o.courier.eta}</dd>
                        </div>
                        {o.courier.note && (
                          <div className="flex justify-between gap-3">
                            <dt className="shrink-0 text-text-3">Note</dt>
                            <dd className="truncate text-text-2">
                              {o.courier.note}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-amber/25 bg-amber/[0.06] p-4">
                      <p className="flex items-center gap-2 text-[12.5px] text-amber">
                        <IconWarn width={14} height={14} />
                        Not booked yet
                      </p>
                      <p className="mt-1.5 text-[11.5px] leading-snug text-text-2">
                        Confirm the order and we&apos;ll create the consignment
                        on your own merchant account.
                      </p>
                      <div className="mt-3 flex gap-1.5">
                        <Button size="sm" className="flex-1">
                          Book Steadfast
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          Book Pathao
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                /* --------------- Bangla invoice --------------- */
                <motion.div
                  key="invoice"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={SPRING_SOFT}
                  className="bg-canvas p-5"
                >
                  <div className="rounded-xl border border-line bg-white p-5 font-(family-name:--font-hind) text-[#111] shadow-[0_1px_2px_rgba(15,20,25,0.06),0_10px_24px_-12px_rgba(15,20,25,0.18)]">
                    <div className="flex items-start justify-between border-b border-black/10 pb-3">
                      <div>
                        <p className="text-[15px] font-bold">{TENANT.nameBn}</p>
                        <p className="mt-0.5 text-[10px] text-black/55">
                          ধানমন্ডি, ঢাকা · ০১৭১০-XXXXXX
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold">চালান</p>
                        <p className="font-mono text-[10px] text-black/55">
                          {o.ref}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px]">
                      <p className="text-black/55">গ্রাহক</p>
                      <p className="font-medium">{o.customer}</p>
                      <p className="text-black/70">{o.address}</p>
                      <p className="font-mono text-black/70">
                        {phone(o.phone)}
                      </p>
                    </div>

                    <table className="mt-4 w-full text-[10.5px]">
                      <thead>
                        <tr className="border-y border-black/10 text-black/55">
                          <th className="py-1.5 text-left font-normal">পণ্য</th>
                          <th className="py-1.5 text-center font-normal">
                            পরিমাণ
                          </th>
                          <th className="py-1.5 text-right font-normal">দর</th>
                          <th className="py-1.5 text-right font-normal">মোট</th>
                        </tr>
                      </thead>
                      <tbody>
                        {o.lines.map((l) => (
                          <tr
                            key={l.sku}
                            className="border-b border-black/6"
                          >
                            <td className="py-2">
                              <span className="block">{l.name}</span>
                              <span className="font-mono text-[9px] text-black/45">
                                {l.sku}
                              </span>
                            </td>
                            <td className="py-2 text-center">{l.qty}</td>
                            <td className="py-2 text-right">
                              ৳{l.unit.toLocaleString("en-IN")}
                            </td>
                            <td className="py-2 text-right font-medium">
                              ৳{(l.qty * l.unit).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    <dl className="mt-3 space-y-1 text-[10.5px]">
                      <div className="flex justify-between">
                        <dt className="text-black/55">সাবটোটাল</dt>
                        <dd>৳{subtotal.toLocaleString("en-IN")}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-black/55">ডেলিভারি চার্জ</dt>
                        <dd>৳{o.delivery}</dd>
                      </div>
                      {o.discount > 0 && (
                        <div className="flex justify-between text-[#0a7c3f]">
                          <dt>ছাড়</dt>
                          <dd>−৳{o.discount}</dd>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-black/10 pt-1.5 text-[13px] font-bold">
                        <dt>সর্বমোট</dt>
                        <dd>৳{total.toLocaleString("en-IN")}</dd>
                      </div>
                    </dl>

                    <p className="mt-3 border-t border-black/10 pt-2.5 text-[9px] leading-relaxed text-black/45">
                      পণ্য বুঝে নেওয়ার আগে অবশ্যই পার্সেল খুলে দেখুন। ৭ দিনের
                      মধ্যে অব্যবহৃত পণ্য বিনিময়যোগ্য। ধন্যবাদ 🌾
                    </p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1">
                      Download PDF
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Send in chat
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Panel>
        </div>
      </div>
    </>
  );
}

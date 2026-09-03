"use client";

import React, { useState } from "react";
import {
  IconCheck,
  IconCopy,
  IconPlus,
  IconTag,
  IconTrash,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { cx } from "@/lib/format";
import { FestivalOffer } from "../types";

interface FestivalTableProps {
  festivalOffers: FestivalOffer[];
  onAddClick: () => void;
  onEditClick: (offer: FestivalOffer) => void;
  onDeleteClick: (offer: FestivalOffer) => void;
  onToggleActive: (id: string) => void;
}

export function FestivalTable({
  festivalOffers,
  onAddClick,
  onEditClick,
  onDeleteClick,
  onToggleActive,
}: FestivalTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="rounded-2xl border border-line bg-white shadow-2xs overflow-hidden">
      <div className="p-4 border-b border-line bg-surface-2/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <IconTag width={16} height={16} className="text-signal" />
          <div>
            <h2 className="text-[15px] font-bold text-text">
              Seasonal &amp; Festival Promo Campaigns
            </h2>
            <p className="text-[12px] text-text-3">
              Manage promotional coupon codes, discounts, and bonus message
              credits.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onAddClick}
          className="gap-1.5 font-semibold text-[12.5px] h-8.5 px-3 border-line text-text hover:border-signal hover:text-signal cursor-pointer"
        >
          <IconPlus width={13} height={13} />
          <span>Add Festival Coupon</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-line bg-surface-2/40 text-[11px] font-bold uppercase tracking-wider text-text-3 font-mono">
            <tr>
              <th className="py-3 px-4.5">Campaign &amp; Coupon</th>
              <th className="py-3 px-4">Discount</th>
              <th className="py-3 px-4">Bonus Messages</th>
              <th className="py-3 px-4">Validity</th>
              <th className="py-3 px-4">Live Status</th>
              <th className="py-3 px-4.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line/60">
            {festivalOffers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-8 text-center text-text-3 text-[13px]"
                >
                  No festival campaigns currently configured. Click &quot;Add
                  Festival Coupon&quot; to create one.
                </td>
              </tr>
            ) : (
              festivalOffers.map((offer) => {
                const isCopied = copiedCode === offer.couponCode;
                return (
                  <tr
                    key={offer.id}
                    className="hover:bg-surface-2/30 transition-colors"
                  >
                    <td className="py-3.5 px-4.5">
                      <div className="flex items-center gap-2.5">
                        <div>
                          <p className="font-bold text-text text-[13.5px]">
                            {offer.festivalName}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-bold text-[11px] bg-surface-2 text-text px-2 py-0.5 rounded border border-line">
                              {offer.couponCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(offer.couponCode)}
                              className="text-text-3 hover:text-signal p-0.5 cursor-pointer"
                              title="Copy coupon code"
                            >
                              {isCopied ? (
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
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-signal font-mono text-[14px]">
                        {offer.discountPercent}% OFF
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-text">
                      +{offer.bonusMessages.toLocaleString()} Messages
                    </td>

                    <td className="py-3.5 px-4 text-text-3 font-mono text-[12px]">
                      {offer.validity}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => onToggleActive(offer.id)}
                        className={cx(
                          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold font-mono transition-colors cursor-pointer",
                          offer.active
                            ? "bg-signal/[0.08] text-signal border border-signal/20"
                            : "bg-surface-2 text-text-3 border border-line",
                        )}
                      >
                        <span
                          className={cx(
                            "size-1.5 rounded-full",
                            offer.active ? "bg-signal" : "bg-text-3",
                          )}
                        />
                        {offer.active ? "LIVE" : "PAUSED"}
                      </button>
                    </td>

                    <td className="py-3.5 px-4.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onEditClick(offer)}
                          className="text-text-3 hover:text-signal hover:bg-surface-2 p-1.5 rounded-lg transition-colors cursor-pointer text-[12px] font-semibold"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteClick(offer)}
                          className="text-text-3 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-lg transition-colors cursor-pointer"
                          title="Delete Offer"
                        >
                          <IconTrash width={13} height={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClose, IconTag, IconTrash, IconWarn } from "@/components/ui/icons";
import { Button } from "@/components/ui/primitives";
import { FestivalOffer } from "../types";

interface FestivalModalsProps {
  editingOffer: FestivalOffer | null;
  onCloseEdit: () => void;
  onSaveEdit: (updated: FestivalOffer) => Promise<void>;

  deletingOffer: FestivalOffer | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => Promise<void>;

  addModalOpen: boolean;
  onCloseAdd: () => void;
  onCreateOffer: (newOffer: {
    festivalName: string;
    couponCode: string;
    discountPercent: number;
    bonusMessages: number;
    validity: string;
  }) => Promise<void>;
}

export function FestivalModals({
  editingOffer,
  onCloseEdit,
  onSaveEdit,
  deletingOffer,
  onCloseDelete,
  onConfirmDelete,
  addModalOpen,
  onCloseAdd,
  onCreateOffer,
}: FestivalModalsProps) {
  // Form State for new Festival Offer
  const [festName, setFestName] = useState("");
  const [festCode, setFestCode] = useState("");
  const [festDiscount, setFestDiscount] = useState("");
  const [festBonus, setFestBonus] = useState("");
  const [festValidity, setFestValidity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Local State
  const [editState, setEditState] = useState<FestivalOffer | null>(
    editingOffer,
  );

  React.useEffect(() => {
    setEditState(editingOffer);
  }, [editingOffer]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!festName || !festCode || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreateOffer({
        festivalName: festName,
        couponCode: festCode.toUpperCase().replace(/\s+/g, ""),
        discountPercent: Number(festDiscount) || 10,
        bonusMessages: Number(festBonus) || 0,
        validity: festValidity || "Limited Time Offer",
      });
      setFestName("");
      setFestCode("");
      setFestDiscount("");
      setFestBonus("");
      setFestValidity("");
      onCloseAdd();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editState || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSaveEdit({
        ...editState,
        couponCode: editState.couponCode.toUpperCase().replace(/\s+/g, ""),
      });
      onCloseEdit();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ─── 1. Edit Festival Offer Modal ─── */}
      {editState && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseEdit();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <IconTag width={16} height={16} className="text-signal" />
                <h3 className="text-[15.5px] font-bold text-text">
                  Edit Festival Offer: {editState.festivalName}
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseEdit}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block font-bold text-text mb-1">
                  Offer Name
                </label>
                <input
                  type="text"
                  required
                  value={editState.festivalName}
                  onChange={(e) =>
                    setEditState({ ...editState, festivalName: e.target.value })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={editState.couponCode}
                    onChange={(e) =>
                      setEditState({ ...editState, couponCode: e.target.value })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={editState.discountPercent}
                    onChange={(e) =>
                      setEditState({
                        ...editState,
                        discountPercent: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Bonus Messages Included
                </label>
                <input
                  type="number"
                  value={editState.bonusMessages}
                  onChange={(e) =>
                    setEditState({
                      ...editState,
                      bonusMessages: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Validity Text
                </label>
                <input
                  type="text"
                  value={editState.validity}
                  onChange={(e) =>
                    setEditState({ ...editState, validity: e.target.value })
                  }
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCloseEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="signal"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── 2. Delete Festival Offer Dialog ─── */}
      <AnimatePresence>
        {deletingOffer && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) onCloseDelete();
            }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="size-9.5 rounded-full bg-rose-50 border border-rose-200 grid place-items-center shrink-0 text-rose-600">
                  <IconWarn width={19} height={19} />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-text">
                    Delete Festival Offer?
                  </h3>
                  <p className="text-[12.5px] text-text-3 mt-1 leading-relaxed">
                    Are you sure you want to delete coupon code{" "}
                    <strong>{deletingOffer.couponCode}</strong>? Stores
                    won&apos;t be able to claim it anymore.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCloseDelete}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={onConfirmDelete}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <IconTrash width={13} height={13} />
                  <span>Yes, Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── 3. Add Festival Coupon Modal ─── */}
      {addModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseAdd();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-line bg-white p-5.5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-2.5">
              <div className="flex items-center gap-2">
                <IconTag width={16} height={16} className="text-signal" />
                <h3 className="text-[15.5px] font-bold text-text">
                  Create Festival / Promo Offer
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseAdd}
                className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
              >
                <IconClose width={14} height={14} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-[13px]">
              <div>
                <label className="block font-bold text-text mb-1">
                  Offer Name
                </label>
                <input
                  type="text"
                  required
                  value={festName}
                  onChange={(e) => setFestName(e.target.value)}
                  placeholder="e.g. Eid Shopping Blitz"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-text mb-1">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    required
                    value={festCode}
                    onChange={(e) => setFestCode(e.target.value)}
                    placeholder="e.g. EID2026"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-text mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={festDiscount}
                    onChange={(e) => setFestDiscount(e.target.value)}
                    placeholder="e.g. 20"
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Bonus Messages Included
                </label>
                <input
                  type="number"
                  value={festBonus}
                  onChange={(e) => setFestBonus(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-text mb-1">
                  Validity Text
                </label>
                <input
                  type="text"
                  value={festValidity}
                  onChange={(e) => setFestValidity(e.target.value)}
                  placeholder="e.g. Valid till Eid Night"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-text focus:border-signal outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCloseAdd}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="signal"
                  size="sm"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Activating..." : "Activate Festival Offer"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

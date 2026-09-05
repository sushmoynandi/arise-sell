"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Badge, Button } from "@/components/ui/primitives";
import { IconCheck, IconClose, IconWarn } from "@/components/ui/icons";
import { CheckPlanSwitchResponse } from "@/lib/api-client";
import { cx } from "@/lib/format";

interface DowngradeReconcileModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictData: CheckPlanSwitchResponse | null;
  billingCycle?: "monthly" | "yearly";
  onConfirm: (reconciliation: {
    keep_store_ids: string[];
    keep_team_member_ids: string[];
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function DowngradeReconcileModal({
  isOpen,
  onClose,
  conflictData,
  billingCycle = "monthly",
  onConfirm,
  isSubmitting = false,
}: DowngradeReconcileModalProps) {
  const defaultStoreIds = React.useMemo(() => {
    if (!conflictData) return [];
    const stores = conflictData.owned_stores || [];
    const activeStore = stores.find((s) => s.is_active);
    const initialStoreIds: string[] = [];

    if (activeStore) {
      initialStoreIds.push(activeStore.id);
    }
    for (const s of stores) {
      if (
        !initialStoreIds.includes(s.id) &&
        initialStoreIds.length < conflictData.target_max_stores
      ) {
        initialStoreIds.push(s.id);
      }
    }
    if (initialStoreIds.length === 0 && stores.length > 0) {
      initialStoreIds.push(stores[0].id);
    }
    return initialStoreIds;
  }, [conflictData]);

  const defaultTeammateIds = React.useMemo(() => {
    if (!conflictData) return [];
    const allowedTeammates = conflictData.target_teammates_allowed;
    if (allowedTeammates > 0) {
      return (conflictData.team_members || [])
        .slice(0, allowedTeammates)
        .map((m) => m.id);
    }
    return [];
  }, [conflictData]);

  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([]);
  const [selectedTeammateIds, setSelectedTeammateIds] = useState<string[]>([]);
  const [lastConflictData, setLastConflictData] =
    useState<CheckPlanSwitchResponse | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Synchronize state during render when conflictData changes
  if (conflictData !== lastConflictData) {
    setLastConflictData(conflictData);
    setSelectedStoreIds(defaultStoreIds);
    setSelectedTeammateIds(defaultTeammateIds);
    setValidationError(null);
  }

  // Pure DOM side effect: scroll to top when opened
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen || !conflictData) return null;

  const maxStores = conflictData.target_max_stores;
  const maxTeammates = conflictData.target_teammates_allowed;
  const isTargetFree = conflictData.target_plan.trim().toLowerCase() === "free";

  const handleToggleStore = (storeId: string) => {
    if (maxStores === 1) {
      setSelectedStoreIds([storeId]);
      setValidationError(null);
      return;
    }

    if (selectedStoreIds.includes(storeId)) {
      if (selectedStoreIds.length === 1) {
        setValidationError("You must keep at least 1 store active.");
        return;
      }
      setSelectedStoreIds((prev) => prev.filter((id) => id !== storeId));
      setValidationError(null);
    } else {
      if (selectedStoreIds.length >= maxStores) {
        setValidationError(
          `Your new plan allows a maximum of ${maxStores} active store${maxStores > 1 ? "s" : ""}. Deselect a store first.`,
        );
        return;
      }
      setSelectedStoreIds((prev) => [...prev, storeId]);
      setValidationError(null);
    }
  };

  const handleToggleTeammate = (teammateId: string) => {
    if (maxTeammates === 0) return;

    if (selectedTeammateIds.includes(teammateId)) {
      setSelectedTeammateIds((prev) => prev.filter((id) => id !== teammateId));
      setValidationError(null);
    } else {
      if (selectedTeammateIds.length >= maxTeammates) {
        setValidationError(
          `Your new plan allows up to ${maxTeammates} team member${maxTeammates === 1 ? "" : "s"}. Deselect another member first.`,
        );
        return;
      }
      setSelectedTeammateIds((prev) => [...prev, teammateId]);
      setValidationError(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setValidationError(null);

    if (conflictData.stores_conflict) {
      if (selectedStoreIds.length === 0) {
        setValidationError("Please select at least 1 store to remain active.");
        return;
      }
      if (selectedStoreIds.length > maxStores) {
        setValidationError(
          `Please select at most ${maxStores} active store${maxStores > 1 ? "s" : ""}.`,
        );
        return;
      }
    }

    if (conflictData.seats_conflict) {
      if (maxTeammates > 0 && selectedTeammateIds.length > maxTeammates) {
        setValidationError(
          `Please select at most ${maxTeammates} team member${maxTeammates === 1 ? "" : "s"} to retain access.`,
        );
        return;
      }
    }

    await onConfirm({
      keep_store_ids: selectedStoreIds,
      keep_team_member_ids: maxTeammates === 0 ? [] : selectedTeammateIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-xl sm:max-w-2xl rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[88vh] flex flex-col"
      >
        {/* Header (Non-shrinking) */}
        <div className="flex items-start justify-between gap-3 border-b border-line pb-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 border border-amber-500/20">
                <IconWarn width={18} height={18} />
              </span>
              <h3 className="text-base sm:text-lg font-bold text-text font-display">
                Plan Capacity Adjustment
              </h3>
            </div>
            <p className="text-xs text-text-3">
              Switching from{" "}
              <strong className="text-text">{conflictData.current_plan}</strong>{" "}
              to{" "}
              <strong className="text-signal">
                {conflictData.target_plan}
              </strong>
              {isTargetFree ? "" : ` (${billingCycle})`} reduces your resource
              limits.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
          >
            <IconClose width={18} height={18} />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div
          ref={contentRef}
          className="space-y-4 overflow-y-auto pr-1 flex-1 min-h-0"
        >
          {/* Validation Error Alert */}
          {validationError && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 font-medium flex items-center gap-2 shadow-2xs">
              <IconWarn width={16} height={16} />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Stores Conflict */}
          {conflictData.stores_conflict && (
            <div className="space-y-3 rounded-xl border border-line bg-surface-2/40 p-3.5 sm:p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold text-text">
                    {maxStores === 1
                      ? "1. Select 1 Active Store"
                      : `1. Select Active Stores (${selectedStoreIds.length}/${maxStores})`}
                  </h4>
                  <p className="text-xs text-text-3 mt-0.5">
                    {maxStores === 1 ? (
                      <>
                        Your new plan supports <strong>1 active store</strong>.
                        Select which store stays active (the other will be{" "}
                        <strong className="text-amber-700">Frozen</strong>).
                      </>
                    ) : (
                      <>
                        Your new plan supports up to{" "}
                        <strong>
                          {maxStores} active store{maxStores > 1 ? "s" : ""}
                        </strong>
                        . Unselected stores will be{" "}
                        <strong className="text-amber-700">
                          Frozen (Inactive)
                        </strong>
                        .
                      </>
                    )}
                  </p>
                </div>
                <Badge tone="amber" dot>
                  {conflictData.active_stores_count} ➔ {maxStores} Allowed
                </Badge>
              </div>

              {/* Stores List */}
              <div className="grid gap-2 pt-1">
                {conflictData.owned_stores.map((store) => {
                  const isSelected = selectedStoreIds.includes(store.id);
                  return (
                    <div
                      key={store.id}
                      onClick={() => handleToggleStore(store.id)}
                      className={cx(
                        "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs select-none",
                        isSelected
                          ? "border-signal/50 bg-[#edf7f3]/50 dark:bg-signal/10 ring-1 ring-signal/25"
                          : "border-line bg-surface hover:border-line-hover opacity-85",
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {/* Radio selector for single store plans, Checkbox for multi-store */}
                        {maxStores === 1 ? (
                          <div
                            className={cx(
                              "size-5 rounded-full border flex items-center justify-center transition-all shrink-0",
                              isSelected
                                ? "border-signal bg-signal text-white ring-2 ring-signal/20"
                                : "border-line bg-surface-2",
                            )}
                          >
                            {isSelected && (
                              <div className="size-2 rounded-full bg-white" />
                            )}
                          </div>
                        ) : (
                          <div
                            className={cx(
                              "size-5 rounded-md border flex items-center justify-center transition-colors text-white shrink-0",
                              isSelected
                                ? "bg-signal border-signal"
                                : "border-line bg-surface-2",
                            )}
                          >
                            {isSelected && <IconCheck width={14} height={14} />}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-text">
                              {store.name}
                            </span>
                            {store.is_active && (
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-surface-2 text-text-3 border border-line">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-text-3 font-mono">
                            /{store.slug}
                          </span>
                        </div>
                      </div>

                      <div>
                        {isSelected ? (
                          <span className="rounded-md bg-signal/15 text-signal border border-signal/30 px-2 py-0.5 text-[11px] font-bold font-mono inline-flex items-center gap-1">
                            ✓ Keeps Active
                          </span>
                        ) : (
                          <span className="rounded-md bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[11px] font-medium font-mono inline-flex items-center gap-1">
                            ❄️ Will be Frozen
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Data Preservation Callout */}
              <div className="rounded-lg bg-surface border border-line/70 px-3 py-2 text-[11px] text-text-3 flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">ℹ️</span>
                <span>
                  <strong>Data Preservation Guarantee:</strong> Frozen stores
                  are safely preserved with all products, orders, customers, and
                  courier settings intact. When you upgrade back to Business or
                  Custom, they will reactivate automatically!
                </span>
              </div>
            </div>
          )}

          {/* Section 2: Seats Conflict */}
          {conflictData.seats_conflict && (
            <div className="space-y-3 rounded-xl border border-line bg-surface-2/40 p-3.5 sm:p-4">
              {maxTeammates === 0 ? (
                /* Sub-case 2A: 0 teammate seats allowed (e.g. Free Plan) */
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-text">
                        2. Team Member Access (0 Seats on{" "}
                        {conflictData.target_plan} Plan)
                      </h4>
                      <p className="text-xs text-text-3 mt-0.5">
                        The {conflictData.target_plan} plan includes{" "}
                        <strong>1 seat only (Store Owner)</strong>. Existing
                        team member access will be revoked.
                      </p>
                    </div>
                    <Badge tone="coral" dot>
                      {conflictData.current_teammates_count} Member
                      {conflictData.current_teammates_count > 1 ? "s" : ""} ➔ 0
                      Seats
                    </Badge>
                  </div>

                  {/* Teammates List - Read only, no dead checkboxes */}
                  <div className="grid gap-2 pt-1">
                    {conflictData.team_members.map((tm) => (
                      <div
                        key={tm.id}
                        className="p-2.5 sm:p-3 rounded-xl border border-line bg-surface flex items-center justify-between gap-3 shadow-2xs select-none opacity-90"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="size-7 rounded-full bg-surface-2 border border-line text-text-3 flex items-center justify-center text-xs font-bold font-mono shrink-0">
                            {tm.name ? tm.name.charAt(0).toUpperCase() : "T"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-bold text-text">
                                {tm.name}
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-2 border border-line text-text-3">
                                {tm.role}
                              </span>
                            </div>
                            <span className="text-[11px] text-text-3 font-mono">
                              {tm.email}
                            </span>
                          </div>
                        </div>

                        <span className="rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px] font-medium font-mono whitespace-nowrap">
                          Access will be revoked
                        </span>
                      </div>
                    ))}
                  </div>

                  <p className="text-[11.5px] text-text-3 flex items-center gap-1.5">
                    <span className="text-amber-600 shrink-0">ℹ️</span>
                    <span>
                      Teammate accounts will be deactivated safely. Their
                      records remain intact and can be restored anytime by
                      upgrading back to Grow, Pro, or Business.
                    </span>
                  </p>
                </>
              ) : (
                /* Sub-case 2B: Some teammate seats allowed (e.g. Pro Plan has 3 teammate seats) */
                <>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-text">
                        2. Retain Team Members ({selectedTeammateIds.length}/
                        {maxTeammates})
                      </h4>
                      <p className="text-xs text-text-3 mt-0.5">
                        Your new plan allows{" "}
                        <strong>
                          {conflictData.target_max_seats} total seats
                        </strong>{" "}
                        (1 Store Owner + up to{" "}
                        <strong>
                          {maxTeammates} team member
                          {maxTeammates === 1 ? "" : "s"}
                        </strong>
                        ).
                      </p>
                    </div>
                    <Badge tone="signal" dot>
                      {conflictData.current_teammates_count + 1} ➔{" "}
                      {conflictData.target_max_seats} Seats
                    </Badge>
                  </div>

                  {/* Teammates List with Interactive Checkboxes */}
                  <div className="grid gap-2 pt-1">
                    {conflictData.team_members.map((tm) => {
                      const isRetained = selectedTeammateIds.includes(tm.id);
                      return (
                        <div
                          key={tm.id}
                          onClick={() => handleToggleTeammate(tm.id)}
                          className={cx(
                            "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 shadow-2xs select-none",
                            isRetained
                              ? "border-signal/50 bg-[#edf7f3]/50 dark:bg-signal/10 ring-1 ring-signal/25"
                              : "border-line bg-surface hover:border-line-hover opacity-85",
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={cx(
                                "size-5 rounded-md border flex items-center justify-center transition-colors text-white shrink-0",
                                isRetained
                                  ? "bg-signal border-signal"
                                  : "border-line bg-surface-2",
                              )}
                            >
                              {isRetained && (
                                <IconCheck width={14} height={14} />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-text">
                                  {tm.name}
                                </span>
                                <span className="text-[10.5px] font-mono px-1.5 py-0.2 rounded bg-surface-2 border border-line text-text-2">
                                  {tm.role}
                                </span>
                              </div>
                              <span className="text-[11px] text-text-3 font-mono">
                                {tm.email}
                              </span>
                            </div>
                          </div>

                          <div>
                            {isRetained ? (
                              <span className="rounded-md bg-signal/15 text-signal border border-signal/30 px-2 py-0.5 text-[11px] font-bold font-mono">
                                ✓ Retain Access
                              </span>
                            ) : (
                              <span className="rounded-md bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 text-[11px] font-medium font-mono">
                                Access Removed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-[11.5px] text-text-3">
                    ⚠️ Teammates not selected will have their store access
                    revoked to fit within the {conflictData.target_max_seats}
                    -seat ceiling.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions (Non-shrinking) */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-line shrink-0">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="font-medium cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="signal"
            type="button"
            onClick={() => handleSubmit()}
            disabled={
              isSubmitting ||
              (conflictData.stores_conflict && selectedStoreIds.length === 0)
            }
            className="font-semibold shadow-xs cursor-pointer"
          >
            {isSubmitting ? "Applying Changes..." : "Confirm & Downgrade Plan"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

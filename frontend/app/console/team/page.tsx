"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import {
  IconCheck,
  IconWarn,
  IconClose,
  IconTrash,
} from "@/components/ui/icons";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/i18n";
import { api, TeamMemberData } from "@/lib/api-client";
import { cx } from "@/lib/format";

// Dynamic Plan Tier Definitions
export interface PlanTierInfo {
  code: string;
  name: string;
  maxBusinesses: number;
  maxMembers: number;
  badgeTone: "neutral" | "mint" | "azure" | "signal" | "amber";
  upgradeTarget?: string;
}

export const PLAN_TIERS: Record<string, PlanTierInfo> = {
  free: {
    code: "free",
    name: "Free",
    maxBusinesses: 1,
    maxMembers: 1,
    badgeTone: "neutral",
    upgradeTarget: "Grow / Go Plan (2 seats)",
  },
  grow: {
    code: "grow",
    name: "Grow",
    maxBusinesses: 1,
    maxMembers: 2,
    badgeTone: "azure",
    upgradeTarget: "Pro Plan (4 seats)",
  },
  pro: {
    code: "pro",
    name: "Pro",
    maxBusinesses: 1,
    maxMembers: 4,
    badgeTone: "mint",
    upgradeTarget: "Business Plan (8 seats)",
  },
  business: {
    code: "business",
    name: "Business",
    maxBusinesses: 2,
    maxMembers: 8,
    badgeTone: "signal",
    upgradeTarget: "Custom Plan (10–30 seats)",
  },
  custom: {
    code: "custom",
    name: "Custom",
    maxBusinesses: 10,
    maxMembers: 30,
    badgeTone: "amber",
  },
};

export function resolvePlanTier(planName?: string | null): PlanTierInfo {
  const normalized = (planName || "").toLowerCase().trim();
  if (normalized.includes("free")) return PLAN_TIERS.free;
  if (
    normalized.includes("grow") ||
    normalized.includes("basic") ||
    normalized.includes("starter") ||
    normalized.includes("go")
  ) {
    return PLAN_TIERS.grow;
  }
  if (normalized.includes("pro")) return PLAN_TIERS.pro;
  if (
    normalized.includes("business") ||
    normalized.includes("karkhana") ||
    normalized.includes("bazaar")
  ) {
    return PLAN_TIERS.business;
  }
  return PLAN_TIERS.custom;
}

export interface LeftbarModuleItem {
  id: string;
  label: string;
  iconKey?: string;
}

export interface LeftbarModuleGroup {
  group: string;
  items: LeftbarModuleItem[];
}

export const LEFTBAR_PERMISSIONS_GROUPS: LeftbarModuleGroup[] = [
  {
    group: "OPERATIONS",
    items: [
      { id: "/console", label: "Dashboard" },
      { id: "/console/inbox", label: "Inbox" },
      { id: "/console/comments", label: "Comments" },
      { id: "/console/orders", label: "Orders" },
      { id: "/console/pipeline", label: "Leads & Pipeline" },
      { id: "/console/team", label: "Team Members" },
    ],
  },
  {
    group: "GROWTH & AUTOMATION",
    items: [
      { id: "/console/campaigns", label: "Campaigns" },
      { id: "/console/automation", label: "Automation Tools" },
      { id: "/console/integrations", label: "Integrations" },
    ],
  },
  {
    group: "AI SALES ENGINE",
    items: [
      { id: "/console/products", label: "Products" },
      { id: "/console/brain", label: "Knowledge Base" },
      { id: "/console/playground", label: "AI Playground" },
    ],
  },
  {
    group: "STORE SETTINGS",
    items: [
      { id: "settings:business", label: "General" },
      { id: "settings:branding", label: "Branding" },
      { id: "settings:invoice", label: "Invoice" },
      { id: "settings:website-orders", label: "Web Orders" },
      { id: "settings:courier", label: "Courier" },
      { id: "settings:meta", label: "Meta CAPI" },
      { id: "settings:product-feed", label: "Feed" },
      { id: "settings:notifications", label: "Alerts" },
      { id: "settings:billing", label: "Billing" },
    ],
  },
];

const PERM_LABEL_MAP: Record<string, string> = {
  "/console": "Dashboard",
  "/console/inbox": "Inbox",
  "/console/comments": "Comments",
  "/console/orders": "Orders",
  "/console/pipeline": "Leads",
  "/console/team": "Team",
  "/console/campaigns": "Campaigns",
  "/console/automation": "Automation",
  "/console/integrations": "Integrations",
  "/console/products": "Products",
  "/console/brain": "Knowledge",
  "/console/playground": "Playground",
  "/console/settings": "Settings",
  "settings:business": "General",
  "settings:branding": "Branding",
  "settings:invoice": "Invoice",
  "settings:website-orders": "Web Orders",
  "settings:courier": "Courier",
  "settings:meta": "Meta CAPI",
  "settings:product-feed": "Feed",
  "settings:notifications": "Alerts",
  "settings:billing": "Billing",
  chat: "Inbox",
  orders: "Orders",
  courier: "Courier",
  catalog: "Products",
  invoices: "Invoices",
  settings: "Settings",
};

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  online: boolean;
  channels: string[];
  permissions: string[];
  is_owner?: boolean;
  avatar_url?: string | null;
}

export default function TeamMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { lang } = useLang();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [profileData, setProfileData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deleteTargetMember, setDeleteTargetMember] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  // Add Member Form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Moderator");
  const [selectedNavHrefs, setSelectedNavHrefs] = useState<string[]>([
    "/console/inbox",
    "/console/comments",
    "/console/orders",
  ]);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Edit Member Form
  const [editRole, setEditRole] = useState("");
  const [editNavHrefs, setEditNavHrefs] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Load team and merchant profile
  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    try {
      const [teamRes, profRes] = await Promise.all([
        api.merchants.getTeam().catch(() => [] as TeamMemberData[]),
        api.merchants.getProfile().catch(() => null),
      ]);

      if (profRes && typeof profRes === "object") {
        setProfileData(profRes as Record<string, unknown>);
      }

      if (Array.isArray(teamRes) && teamRes.length > 0) {
        setMembers(
          teamRes
            .filter((m) => (m.role || "").toLowerCase() !== "superadmin")
            .map((m) => ({
            id: m.id,
            name: m.name || "Teammate",
            email: m.email || "",
            role: m.role || "Member",
            online: m.online ?? true,
            channels:
              m.platforms && m.platforms.length > 0
                ? m.platforms
                : ["Messenger", "WhatsApp"],
            permissions:
              m.permissions && m.permissions.length > 0
                ? m.permissions
                : ["/console/inbox", "/console/orders"],
            is_owner: m.is_owner ?? m.role.toLowerCase() === "owner",
            avatar_url: m.avatar_url || (m.is_owner ? user?.avatar_url : null),
          })),
        );
      } else if (user) {
        const ownerName =
          `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.email.split("@")[0] ||
          "Store Owner";
        setMembers([
          {
            id: "owner",
            name: ownerName,
            email: user.email,
            role: "Owner",
            online: true,
            channels: ["WhatsApp", "Messenger", "Instagram"],
            permissions: ["all"],
            is_owner: true,
            avatar_url: user.avatar_url || null,
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load team members:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  // Handle URL param ?invite=true
  useEffect(() => {
    if (searchParams?.get("invite") === "true") {
      setAddMemberModalOpen(true);
    }
  }, [searchParams]);

  // Derived Dynamic Quotas & Plan Tier
  const planName = String(profileData?.plan || user?.plan || "Free").trim();
  const currentPlan = resolvePlanTier(planName);
  const maxMembers = Math.max(
    currentPlan.maxMembers,
    Number(profileData?.maxSeats || 0) > 0 ? Number(profileData?.maxSeats) : 0,
  );
  const occupiedSeats = members.length;
  const availableSeats = Math.max(0, maxMembers - occupiedSeats);
  const isSeatLimitReached = occupiedSeats >= maxMembers;
  const isStoreOwner =
    user?.role === "owner" ||
    members.some(
      (m) => m.email.toLowerCase() === user?.email.toLowerCase() && m.is_owner,
    );

  // Quick Preset Roles
  const applyPresetRole = (
    preset: "manager" | "support" | "dispatch" | "clear",
    isEdit = false,
  ) => {
    let perms: string[] = [];
    let role = "Moderator";
    if (preset === "manager") {
      role = "Manager";
      perms = [
        "/console",
        "/console/inbox",
        "/console/comments",
        "/console/orders",
        "/console/pipeline",
        "/console/team",
        "/console/campaigns",
        "/console/automation",
        "/console/integrations",
        "/console/products",
        "/console/brain",
        "/console/playground",
        "settings:business",
        "settings:branding",
        "settings:invoice",
        "settings:website-orders",
        "settings:courier",
        "settings:meta",
        "settings:product-feed",
        "settings:notifications",
      ];
    } else if (preset === "support") {
      role = "Support Agent";
      perms = ["/console/inbox", "/console/comments", "/console/pipeline"];
    } else if (preset === "dispatch") {
      role = "Dispatch Staff";
      perms = ["/console/orders", "settings:courier"];
    } else {
      role = "Custom Role";
      perms = [];
    }

    if (isEdit) {
      setEditRole(role);
      setEditNavHrefs(perms);
    } else {
      setNewRole(role);
      setSelectedNavHrefs(perms);
    }
  };

  // Nav href toggling
  const toggleNavHref = (href: string, isEdit = false) => {
    if (isEdit) {
      setEditNavHrefs((prev) =>
        prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
      );
    } else {
      setSelectedNavHrefs((prev) =>
        prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
      );
    }
  };

  // Handle Add Member Submission
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (isSeatLimitReached) {
      setInviteError(
        `Seat capacity limit reached (${occupiedSeats}/${maxMembers}). Please upgrade your plan to add more team members.`,
      );
      return;
    }

    const cleanName = newName.trim();
    const cleanEmail = newEmail.trim().toLowerCase();

    if (!cleanName) {
      setInviteError("Please enter full name.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setInviteError("Please enter a valid email address.");
      return;
    }

    if (members.some((m) => m.email.toLowerCase() === cleanEmail)) {
      setInviteError(
        "A team member with this email already exists in your store.",
      );
      return;
    }

    setIsInviting(true);
    try {
      const res = await api.merchants.inviteTeamMember({
        name: cleanName,
        email: cleanEmail,
        role: newRole || "Moderator",
        channels: ["Messenger", "WhatsApp", "Instagram"],
        permissions:
          selectedNavHrefs.length > 0
            ? selectedNavHrefs
            : ["/console/inbox", "/console/orders"],
      });

      if (res && res.id) {
        setMembers((prev) => [
          ...prev,
          {
            id: res.id,
            name: res.name || cleanName,
            email: res.email || cleanEmail,
            role: res.role || newRole,
            online: res.online ?? true,
            channels: res.platforms || ["Messenger", "WhatsApp"],
            permissions: res.permissions || selectedNavHrefs,
            is_owner: false,
            avatar_url: res.avatar_url || null,
          },
        ]);
      } else {
        await fetchTeamData();
      }

      setAddMemberModalOpen(false);
      setNewName("");
      setNewEmail("");
      setNewRole("Moderator");
      setSelectedNavHrefs([
        "/console/inbox",
        "/console/comments",
        "/console/orders",
      ]);
      showToast(`Successfully invited ${cleanName} to your store team!`);
    } catch (err: unknown) {
      setInviteError(
        err instanceof Error
          ? err.message
          : "Failed to invite team member. Please try again.",
      );
    } finally {
      setIsInviting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditMember = (m: TeamMember) => {
    setEditingMember(m);
    setEditRole(m.role);
    setEditNavHrefs(m.permissions || []);
    setEditError(null);
  };

  // Save Edit Member
  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditError(null);
    setIsUpdating(true);

    try {
      await api.merchants.updateTeamMember(editingMember.id, {
        role: editRole,
        permissions: editNavHrefs,
      });

      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id
            ? {
                ...m,
                role: editRole,
                permissions: editNavHrefs,
              }
            : m,
        ),
      );

      setEditingMember(null);
      showToast(`Permissions updated for ${editingMember.name}.`);
    } catch (err: unknown) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update permissions.",
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async () => {
    if (!deleteTargetMember) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.merchants.removeTeamMember(deleteTargetMember.id);
      setMembers((prev) => prev.filter((m) => m.id !== deleteTargetMember.id));
      showToast(`Removed ${deleteTargetMember.name} from store.`);
      setDeleteTargetMember(null);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to remove member.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-4">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Team Table Panel - Exactly matching image */}
      <Panel>
        <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-text font-display">
                Team Members &amp; Access
              </h3>
              <Badge tone={currentPlan.badgeTone} dot>
                {settingsPlanName(planName, currentPlan.name)} · {occupiedSeats}
                /{maxMembers} Seats
              </Badge>
              {isSeatLimitReached && (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Seats Full
                </span>
              )}
            </div>
            <p className="text-xs text-text-3 mt-1">
              Authorized staff who can review conversations, take over AI
              sessions, and book couriers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isStoreOwner &&
              (isSeatLimitReached ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setAddMemberModalOpen(true)}
                  className="font-semibold shadow-2xs border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  + Add Member (Limit Reached)
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="signal"
                  type="button"
                  onClick={() => setAddMemberModalOpen(true)}
                  className="font-semibold shadow-2xs"
                >
                  + Add Team Member
                </Button>
              ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px]">
            <thead className="border-b border-line bg-surface-2/40 text-[10.5px] uppercase font-bold text-text-3 font-mono">
              <tr>
                <th className="p-4">MEMBER</th>
                <th className="p-4">ROLE</th>
                <th className="p-4">PERMISSIONS</th>
                <th className="p-4">PRESENCE</th>
                <th className="p-4 text-right w-24">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/60">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-text-3"
                  >
                    Loading team members...
                  </td>
                </tr>
              ) : members.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-xs text-text-3"
                  >
                    No team members found.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const isOwner =
                    m.role.toLowerCase() === "owner" || m.is_owner;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-surface-2/30 transition-colors"
                    >
                      {/* 1. MEMBER */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {m.avatar_url || (isOwner && user?.avatar_url) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.avatar_url || user?.avatar_url || ""}
                              alt={m.name}
                              referrerPolicy="no-referrer"
                              className="size-9 rounded-full object-cover border border-line shadow-2xs"
                            />
                          ) : (
                            <div
                              className={cx(
                                "size-9 rounded-full font-bold grid place-items-center text-xs select-none shadow-2xs",
                                isOwner
                                  ? "bg-signal/15 text-signal border border-signal/20 font-display"
                                  : "bg-surface-2 border border-line text-text-2",
                              )}
                            >
                              {m.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-text">{m.name}</p>
                            <p className="text-[11px] text-text-3 font-mono">
                              {m.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 2. ROLE */}
                      <td className="p-4">
                        <span
                          className={cx(
                            "rounded-md px-2 py-0.5 text-[10.5px] font-bold font-mono",
                            isOwner
                              ? "bg-signal/15 text-signal border border-signal/20"
                              : m.role.toLowerCase().includes("manager")
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200/70"
                                : m.role.toLowerCase().includes("dispatch")
                                  ? "bg-amber-50 text-amber-800 border border-amber-200/70"
                                  : m.role.toLowerCase().includes("catalog")
                                    ? "bg-sky-50 text-sky-700 border border-sky-200/70"
                                    : "bg-surface-2 text-text-2 border border-line",
                          )}
                        >
                          {m.role}
                        </span>
                      </td>

                      {/* 3. PERMISSIONS */}
                      <td className="p-4 max-w-lg">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {isOwner ? (
                            <span className="rounded-md bg-signal/10 text-signal border border-signal/20 px-2 py-0.5 text-[10.5px] font-bold font-mono">
                              ⭐ Full Store Access
                            </span>
                          ) : (
                            (() => {
                              const perms = m.permissions || [];
                              const labels = Array.from(
                                new Set(
                                  perms.map((p) => PERM_LABEL_MAP[p] || p),
                                ),
                              );
                              if (labels.length === 0) {
                                return (
                                  <span className="text-xs text-text-3 italic">
                                    No permissions assigned
                                  </span>
                                );
                              }
                              return labels.map((lbl, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-md bg-surface-2 text-text font-medium border border-line/70 px-2 py-0.5 text-[10.5px] font-mono"
                                >
                                  {lbl}
                                </span>
                              ));
                            })()
                          )}
                        </div>
                      </td>

                      {/* 4. PRESENCE */}
                      <td className="p-4">
                        <Badge
                          tone={m.online ? "mint" : "neutral"}
                          dot={m.online}
                        >
                          {m.online ? "Online" : "Offline"}
                        </Badge>
                      </td>

                      {/* 5. ACTIONS */}
                      <td className="p-4 text-right whitespace-nowrap w-24">
                        {isStoreOwner && !isOwner ? (
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditMember(m)}
                              className="h-7 rounded-lg border border-line bg-white hover:border-line-hover hover:bg-surface-2 px-2 text-xs font-semibold text-text transition-all cursor-pointer shadow-2xs inline-flex items-center"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTargetMember({
                                  id: m.id,
                                  name: m.name,
                                  email: m.email,
                                })
                              }
                              title="Delete teammate"
                              className="size-7 rounded-lg border border-line bg-white hover:border-rose-200 hover:bg-rose-50 text-text-3 hover:text-rose-600 transition-all cursor-pointer shadow-2xs inline-flex items-center justify-center"
                            >
                              <IconTrash width={13} height={13} />
                            </button>
                          </div>
                        ) : isOwner ? (
                          <span className="text-[11px] text-text-3/60 font-mono pr-1">
                            Owner
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-3/60 font-mono pr-1">
                            Read Only
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ─────────────────────────────────────────────────────────────
          Add Member Modal (No channels, clean layout)
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {addMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-line bg-white p-5 sm:p-7 shadow-2xl space-y-4 text-left"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3.5">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-bold text-text font-display">
                      Invite Team Member
                    </h3>
                    <Badge tone={currentPlan.badgeTone}>
                      {occupiedSeats}/{maxMembers} Seats
                    </Badge>
                  </div>
                  <p className="text-xs text-text-3 mt-0.5">
                    {availableSeats > 0
                      ? `${availableSeats} seat${availableSeats > 1 ? "s" : ""} available on your ${currentPlan.name} plan.`
                      : `Seat capacity limit reached on ${currentPlan.name} plan.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddMemberModalOpen(false)}
                  className="rounded-lg p-1.5 text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                  title="Close"
                >
                  <IconClose className="size-4" />
                </button>
              </div>

              {/* Error Notice */}
              {inviteError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 flex items-center gap-2">
                  <IconWarn className="size-4 text-red-600 shrink-0" />
                  <span>{inviteError}</span>
                </div>
              )}

              {/* Plan Seat Warning */}
              {isSeatLimitReached && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <IconWarn
                      width={16}
                      height={16}
                      className="text-amber-600 shrink-0"
                    />
                    <span>Plan Seat Limit Reached</span>
                  </div>
                  <p className="text-[12px] text-amber-800 leading-relaxed">
                    Your current <strong>{currentPlan.name} Plan</strong>{" "}
                    includes a maximum of{" "}
                    <strong>
                      {maxMembers} member{maxMembers > 1 ? "s" : ""}
                    </strong>{" "}
                    (all {occupiedSeats} seats are occupied).
                  </p>
                  <Button
                    size="sm"
                    variant="signal"
                    onClick={() => router.push("/console/settings?tab=billing")}
                    className="mt-1"
                  >
                    Upgrade Plan in Billing →
                  </Button>
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4 pt-1">
                {/* 1. Name, Email & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      required
                      disabled={isSeatLimitReached || isInviting}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      required
                      disabled={isSeatLimitReached || isInviting}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">
                      Role Title
                    </label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Chat Moderator"
                      disabled={isSeatLimitReached || isInviting}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* 2. Quick Role Presets */}
                <div className="space-y-1.5 border-t border-line/60 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-text">
                      Quick Permission Presets
                    </label>
                    <span className="text-[11px] text-text-3 font-mono">
                      {selectedNavHrefs.length} modules selected
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => applyPresetRole("manager")}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-surface-2 cursor-pointer"
                    >
                      Manager (All)
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole("support")}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-surface-2 cursor-pointer"
                    >
                      Support Agent
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole("dispatch")}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-surface-2 cursor-pointer"
                    >
                      Dispatch Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole("clear")}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* 3. Granular Permission Modules Checklist */}
                <div className="border border-line rounded-2xl p-3 bg-surface-2/30 max-h-56 overflow-y-auto space-y-3">
                  {LEFTBAR_PERMISSIONS_GROUPS.map((grp) => (
                    <div key={grp.group} className="space-y-1.5">
                      <p className="text-[10.5px] font-bold text-text-3 uppercase tracking-wider font-mono">
                        {grp.group}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {grp.items.map((it) => {
                          const checked = selectedNavHrefs.includes(it.id);
                          return (
                            <label
                              key={it.id}
                              className={cx(
                                "flex items-center gap-2 rounded-xl border p-2 text-xs font-medium cursor-pointer transition-all",
                                checked
                                  ? "border-signal/50 bg-white text-signal font-bold shadow-2xs"
                                  : "border-line bg-white/60 text-text hover:bg-white",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleNavHref(it.id)}
                                className="accent-signal"
                              />
                              <span className="truncate">{it.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
                  <button
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
                    className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    size="sm"
                    variant="signal"
                    type="submit"
                    disabled={isSeatLimitReached || isInviting}
                    className="font-semibold shadow-2xs"
                  >
                    {isInviting ? "Inviting..." : "Send Invitation"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          Edit Member Modal (No channels, clean layout)
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {editingMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-line bg-white p-5 sm:p-7 shadow-2xl space-y-4 text-left"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3.5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text font-display">
                    Edit Permissions: {editingMember.name}
                  </h3>
                  <p className="text-xs text-text-3 mt-0.5">
                    {editingMember.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="rounded-lg p-1.5 text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                >
                  <IconClose className="size-4" />
                </button>
              </div>

              {editError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 flex items-center gap-2">
                  <IconWarn className="size-4 text-red-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditMember} className="space-y-4 pt-1">
                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    required
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none"
                  />
                </div>

                {/* Presets */}
                <div className="space-y-1.5 border-t border-line/60 pt-3">
                  <label className="block text-xs font-bold text-text">
                    Quick Presets
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => applyPresetRole("manager", true)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-surface-2 cursor-pointer"
                    >
                      Manager
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole("support", true)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-surface-2 cursor-pointer"
                    >
                      Support Agent
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole("dispatch", true)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold hover:bg-surface-2 cursor-pointer"
                    >
                      Dispatch Staff
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPresetRole("clear", true)}
                      className="rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Permissions Checklist */}
                <div className="border border-line rounded-2xl p-3 bg-surface-2/30 max-h-56 overflow-y-auto space-y-3">
                  {LEFTBAR_PERMISSIONS_GROUPS.map((grp) => (
                    <div key={grp.group} className="space-y-1.5">
                      <p className="text-[10.5px] font-bold text-text-3 uppercase tracking-wider font-mono">
                        {grp.group}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {grp.items.map((it) => {
                          const checked = editNavHrefs.includes(it.id);
                          return (
                            <label
                              key={it.id}
                              className={cx(
                                "flex items-center gap-2 rounded-xl border p-2 text-xs font-medium cursor-pointer transition-all",
                                checked
                                  ? "border-signal/50 bg-white text-signal font-bold shadow-2xs"
                                  : "border-line bg-white/60 text-text hover:bg-white",
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleNavHref(it.id, true)}
                                className="accent-signal"
                              />
                              <span className="truncate">{it.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <Button
                    size="sm"
                    variant="signal"
                    type="submit"
                    disabled={isUpdating}
                    className="font-semibold shadow-2xs"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          Delete Confirmation Modal
      ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {deleteTargetMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl space-y-4 text-left"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="size-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                  <IconTrash width={20} height={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text font-display">
                    Remove Team Member
                  </h3>
                  <p className="text-xs text-text-3">
                    This action will revoke all console permissions.
                  </p>
                </div>
              </div>

              <p className="text-xs text-text-2 leading-relaxed">
                Are you sure you want to remove{" "}
                <strong>{deleteTargetMember.name}</strong> (
                <span className="font-mono text-[11px]">
                  {deleteTargetMember.email}
                </span>
                ) from your store team? They will no longer be able to log in or
                handle orders.
              </p>

              {deleteError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-line/60">
                <button
                  type="button"
                  onClick={() => setDeleteTargetMember(null)}
                  disabled={isDeleting}
                  className="rounded-xl border border-line px-4 py-2 text-xs font-semibold text-text hover:bg-surface-2 cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDeleteMember}
                  disabled={isDeleting}
                  className="border-red-300 text-red-600 hover:bg-red-50 font-bold"
                >
                  {isDeleting ? "Removing..." : "Remove Teammate"}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function settingsPlanName(planName: string, fallback: string): string {
  const p = planName || fallback;
  return p.toLowerCase().includes("plan") ? p : `${p} Plan`;
}

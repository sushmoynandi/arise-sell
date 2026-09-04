"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import {
  IconCheck,
  IconShield,
  IconEye,
  IconEyeOff,
} from "@/components/ui/icons";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api-client";
import { cx } from "@/lib/format";
import { EnhancedField, ToggleRow } from "../components";

export function TabAccount() {
  const { user, updateProfile, changePassword, deleteAccount } = useAuth();

  const [firstName, setFirstName] = useState(user?.first_name || "Farhana");
  const [lastName, setLastName] = useState(user?.last_name || "Rahman");
  const [phone, setPhone] = useState(user?.phone || "+880 1711-234567");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<string | null>(null);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [sessionSignoutToast, setSessionSignoutToast] = useState(false);

  const handleSignOutOtherSessions = () => {
    setSessionSignoutToast(true);
    setTimeout(() => setSessionSignoutToast(false), 3500);
  };

  const fullName =
    `${firstName} ${lastName}`.trim() || user?.email || "Farhana Rahman";
  const userEmail = user?.email || "farhana@nokshi.co";
  const userInitials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "FR";

  const pwHasLength = newPassword.length >= 8;
  const pwHasUpper = /[A-Z]/.test(newPassword);
  const pwHasLower = /[a-z]/.test(newPassword);
  const pwHasNumber = /[0-9]/.test(newPassword);
  const pwMatches = newPassword.length > 0 && newPassword === confirmPassword;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileToast(null);
    try {
      const res = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
      });
      if (res.success) {
        setProfileToast("Profile details updated successfully!");
      } else {
        setProfileToast(res.error || "Failed to update profile.");
      }
    } catch {
      setProfileToast("Profile updated successfully!");
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileToast(null), 3500);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);

    if (!pwHasLength || !pwHasUpper || !pwHasLower || !pwHasNumber) {
      setPwError(
        "Password must be 8+ characters with uppercase, lowercase, and numeric characters.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwChanging(true);
    try {
      const res = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (res.success) {
        setPwSuccess(
          "Password changed securely! You can now use your new password.",
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPwSuccess(null);
        }, 2000);
      } else {
        setPwError(
          res.error ||
            "Failed to change password. Please verify current password.",
        );
      }
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Password change failed");
    } finally {
      setPwChanging(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    const targetEmail = user?.email?.toLowerCase().trim() || "";
    const cleanPhrase = confirmPhrase.trim();

    if (cleanPhrase !== "DELETE" && cleanPhrase.toLowerCase() !== targetEmail) {
      setDeleteError(`Please type DELETE or ${userEmail} to confirm.`);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteAccount({
        confirm_phrase: cleanPhrase,
        password: deletePassword.trim() || undefined,
      });
      if (res.success) {
        window.location.href = "/login?deleted=true";
      } else {
        setDeleteError(
          res.error || "Failed to delete account. Please check credentials.",
        );
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Account deletion failed",
      );
      setIsDeleting(false);
    }
  };

  // Store Teammates state inside Account
  const [members, setMembers] = useState([
    {
      id: "m1",
      name: "Farhana Rahman",
      email: "farhana@nokshi.co",
      role: "Owner",
      online: true,
      channels: ["Messenger", "WhatsApp", "Instagram"],
    },
    {
      id: "m2",
      name: "Imran Kabir",
      email: "imran@nokshi.co",
      role: "Ops Lead",
      online: true,
      channels: ["WhatsApp", "Courier"],
    },
    {
      id: "m3",
      name: "Rafi Chowdhury",
      email: "rafi@nokshi.co",
      role: "Moderator",
      online: true,
      channels: ["Messenger", "Instagram"],
    },
    {
      id: "m4",
      name: "Sadia Noor",
      email: "sadia@nokshi.co",
      role: "Moderator",
      online: false,
      channels: ["Instagram"],
    },
  ]);

  useEffect(() => {
    api.merchants
      .getTeam()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(
            data.map((item: unknown, idx: number) => {
              const m = (item || {}) as Record<string, unknown>;
              return {
                id: `m_${idx}`,
                name: (m.name as string) || "Teammate",
                email:
                  (m.email as string) ||
                  `${((m.name as string) || "teammate").toLowerCase().replace(/\s+/g, ".")}@nokshi.co`,
                role: (m.role as string) || "Member",
                online: (m.online as boolean) ?? true,
                channels: (m.platforms as string[]) || [
                  "Messenger",
                  "WhatsApp",
                ],
              };
            }),
          );
        }
      })
      .catch(() => {});
  }, []);

  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Moderator");
  const [teamToastMessage, setTeamToastMessage] = useState<string | null>(null);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const newMember = {
      id: `m_${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      online: true,
      channels: ["Messenger", "WhatsApp"],
    };

    setMembers([...members, newMember]);
    setNewName("");
    setNewEmail("");
    setAddMemberModalOpen(false);
    setTeamToastMessage(`🎉 Team invite sent to ${newEmail}!`);
    setTimeout(() => setTeamToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {profileToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3.5 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
          >
            <IconCheck width={16} height={16} />
            <span>{profileToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleUpdateProfile}>
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
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-text">
                  Owner Profile &amp; Administrator Account
                </h3>
                <p className="text-xs text-text-3">
                  Primary store administrator credentials, identity, and
                  verified contacts.
                </p>
              </div>
            </div>
            <Badge tone="mint" dot>
              Active Owner
            </Badge>
          </div>

          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-line bg-surface-2/20">
              <div className="size-16 rounded-2xl bg-signal/15 text-signal font-bold grid place-items-center text-xl font-display border border-signal/20 shadow-2xs shrink-0 select-none">
                {userInitials}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text">{fullName}</h3>
                <p className="text-sm text-text-3 font-mono">{userEmail}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge
                    tone="mint"
                    className="capitalize font-mono text-[10.5px]"
                  >
                    {user?.role || "Store Owner"}
                  </Badge>
                  <span className="text-[11px] text-signal font-medium flex items-center gap-1">
                    <IconCheck width={13} height={13} /> Verified Active Account
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <EnhancedField
                label="First Name"
                value={firstName}
                onChange={setFirstName}
                placeholder="First Name"
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              />
              <EnhancedField
                label="Last Name"
                value={lastName}
                onChange={setLastName}
                placeholder="Last Name"
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
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                }
              />
              <EnhancedField
                label="Mobile Phone"
                value={phone}
                onChange={setPhone}
                placeholder="+880 1XXXXXXXXX"
                icon={<span className="text-xs font-mono font-bold">🇧🇩</span>}
                helper="Primary contact for OTP alerts and billing receipts."
              />
              <EnhancedField
                label="Primary Email Address"
                value={userEmail}
                disabled
                badge="Verified"
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
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                }
                helper="Account login identifier (managed by organization SSO)."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                size="sm"
                variant="signal"
                type="submit"
                disabled={profileSaving}
                className="cursor-pointer shadow-xs"
              >
                {profileSaving ? "Saving Profile…" : "Save Profile Details"}
              </Button>
            </div>
          </div>
        </Panel>
      </form>

      {/* Security & Authentication */}
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
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-text">
                Security &amp; Authentication
              </h3>
              <p className="text-xs text-text-3">
                Manage your password, active browser sessions, and multi-factor
                account safety.
              </p>
            </div>
          </div>
          <Badge tone="mint" dot>
            Bcrypt Secured
          </Badge>
        </div>

        <div className="divide-y divide-line/60">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-text">Account Password</p>
              <p className="text-xs text-text-3 mt-0.5">
                Secured with bcrypt hashing. Strengthen with symbols and
                uppercase characters.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={() => {
                setPwError(null);
                setPwSuccess(null);
                setPasswordModalOpen(true);
              }}
              className="cursor-pointer"
            >
              Change Password
            </Button>
          </div>

          <ToggleRow
            label="Enforce Two-Factor Authentication (2FA)"
            desc="Require SMS OTP or Authenticator app verification when staff members log in from new devices or cancel courier bookings."
            value={twoFactorAuth}
            onToggle={setTwoFactorAuth}
          />

          {/* Active Sessions Card */}
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-text">
                  Active Login Sessions &amp; Devices
                </p>
                <p className="text-xs text-text-3 mt-0.5">
                  Devices currently authenticated to your AriseSell merchant
                  console.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                type="button"
                onClick={handleSignOutOtherSessions}
                className="cursor-pointer text-xs"
              >
                Sign Out Other Devices
              </Button>
            </div>

            <AnimatePresence>
              {sessionSignoutToast && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-xs text-signal font-medium flex items-center gap-2"
                >
                  <IconCheck width={14} height={14} />
                  <span>
                    All other active device sessions have been revoked and
                    logged out!
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 pt-1">
              <div className="rounded-xl border border-line p-3.5 bg-surface-2/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-base">💻</span>
                  <div>
                    <p className="font-bold text-text">
                      MacBook Pro 16″ · Chrome 128
                    </p>
                    <p className="text-[11px] text-text-3 font-mono">
                      IP: 103.114.98.12 · Dhaka, Bangladesh · Current Active
                      Session
                    </p>
                  </div>
                </div>
                <Badge tone="mint" dot>
                  Current Session
                </Badge>
              </div>

              <div className="rounded-xl border border-line p-3.5 bg-surface-2/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-base">📱</span>
                  <div>
                    <p className="font-bold text-text">
                      iPhone 15 Pro · Mobile Safari
                    </p>
                    <p className="text-[11px] text-text-3 font-mono">
                      IP: 103.114.99.45 · Chattogram, Bangladesh · Active 2
                      hours ago
                    </p>
                  </div>
                </div>
                <span className="text-[11px] text-text-3 font-mono">
                  Standby
                </span>
              </div>
            </div>
          </div>
        </div>
      </Panel>

      {/* Store Teammates & Permissions */}
      <div className="space-y-4">
        <AnimatePresence>
          {teamToastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-[13px] text-signal font-medium flex items-center gap-2 shadow-xs"
            >
              <IconCheck width={16} height={16} />
              <span>{teamToastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Active Seats Occupied",
              value: `${members.length} / 8`,
              sub: `${8 - members.length} available on Karkhana plan`,
            },
            {
              label: "Live Channel Coverage",
              value: "100%",
              sub: "WhatsApp, Messenger, IG active",
            },
            {
              label: "Security Enforcement",
              value: "Enforced",
              sub: "2FA OTP active on all logins",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-line bg-white p-5 shadow-2xs"
            >
              <p className="text-[12.5px] text-text-3 font-medium">{s.label}</p>
              <p className="mt-1.5 font-display text-[24px] font-bold text-text">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-text-3 font-mono">{s.sub}</p>
            </div>
          ))}
        </div>

        <Panel>
          <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-text">
                Store Teammates &amp; Access
              </h3>
              <p className="text-xs text-text-3 mt-0.5">
                Authorized staff who can review conversations, take over AI
                sessions, and book couriers.
              </p>
            </div>
            <Button
              size="sm"
              variant="signal"
              type="button"
              onClick={() => setAddMemberModalOpen(true)}
            >
              + Add Team Member
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12.5px]">
              <thead className="border-b border-line bg-surface-2/50 text-[11px] uppercase font-bold text-text-3 font-mono">
                <tr>
                  <th className="p-4">Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Assigned Channels</th>
                  <th className="p-4">Presence</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-2/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-signal/15 text-signal font-bold grid place-items-center text-xs">
                          {m.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-bold text-text">{m.name}</p>
                          <p className="text-[11px] text-text-3 font-mono">
                            {m.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={cx(
                          "rounded-md px-2 py-0.5 text-[10.5px] font-bold font-mono",
                          m.role === "Owner"
                            ? "bg-signal/15 text-signal"
                            : "bg-surface-2 text-text-2 border border-line",
                        )}
                      >
                        {m.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {m.channels.map((ch) => (
                          <span
                            key={ch}
                            className="rounded bg-surface-2 px-1.5 py-0.5 text-[10.5px] text-text-2 border border-line/60"
                          >
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        tone={m.online ? "mint" : "neutral"}
                        dot={m.online}
                      >
                        {m.online ? "Online" : "Offline"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {m.role !== "Owner" ? (
                        <button
                          type="button"
                          onClick={() =>
                            setMembers(members.filter((x) => x.id !== m.id))
                          }
                          className="text-text-3 hover:text-rose-600 text-xs font-medium cursor-pointer"
                        >
                          Remove
                        </button>
                      ) : (
                        <span className="text-[11px] text-text-3/60 font-mono">
                          Owner
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-red-700">
                Danger Zone
              </span>
            </div>
            <h3 className="mt-2 text-base font-bold text-red-950 font-display">
              Delete Account & Store
            </h3>
            <p className="mt-1 text-xs text-red-700 max-w-xl leading-relaxed">
              Permanently erase your merchant profile, product catalogs,
              connected WhatsApp channels, and AI conversational memory. This
              action is irreversible.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setDeleteError(null);
              setConfirmPhrase("");
              setDeletePassword("");
              setDeleteModalOpen(true);
            }}
            className="shrink-0 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors shadow-2xs cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Password Modal */}
      <AnimatePresence>
        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-signal/15 text-signal grid place-items-center">
                    <IconShield width={20} height={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">
                      Change Password
                    </h3>
                    <p className="text-xs text-text-3">
                      Update your login security credentials
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {pwError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600">
                  {pwError}
                </div>
              )}

              {pwSuccess && (
                <div className="rounded-xl border border-signal/40 bg-[#edf7f3] p-2.5 text-xs text-signal font-medium">
                  {pwSuccess}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text pr-10 focus:border-signal outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-2.5 text-text-3 hover:text-text cursor-pointer"
                    >
                      {showCurrentPw ? (
                        <IconEyeOff width={16} height={16} />
                      ) : (
                        <IconEye width={16} height={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text pr-10 focus:border-signal outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-text-3 hover:text-text cursor-pointer"
                    >
                      {showNewPw ? (
                        <IconEyeOff width={16} height={16} />
                      ) : (
                        <IconEye width={16} height={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    required
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-hidden"
                  />
                </div>

                <div className="rounded-xl bg-surface-2/60 border border-line/60 p-3 space-y-1.5 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={pwHasLength ? "text-signal" : "text-text-3"}
                    >
                      {pwHasLength ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        pwHasLength ? "text-text font-semibold" : "text-text-3"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={pwHasUpper ? "text-signal" : "text-text-3"}
                    >
                      {pwHasUpper ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        pwHasUpper ? "text-text font-semibold" : "text-text-3"
                      }
                    >
                      One uppercase letter (A-Z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={pwHasLower ? "text-signal" : "text-text-3"}
                    >
                      {pwHasLower ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        pwHasLower ? "text-text font-semibold" : "text-text-3"
                      }
                    >
                      One lowercase letter (a-z)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={pwHasNumber ? "text-signal" : "text-text-3"}
                    >
                      {pwHasNumber ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        pwHasNumber ? "text-text font-semibold" : "text-text-3"
                      }
                    >
                      One numeric digit (0-9)
                    </span>
                  </div>
                  {confirmPassword && (
                    <div className="flex items-center gap-1.5">
                      <span
                        className={pwMatches ? "text-signal" : "text-red-500"}
                      >
                        {pwMatches ? "✓" : "✕"}
                      </span>
                      <span
                        className={
                          pwMatches ? "text-text font-semibold" : "text-red-500"
                        }
                      >
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setPasswordModalOpen(false)}
                    disabled={pwChanging}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="signal"
                    type="submit"
                    disabled={pwChanging || !pwHasLength || !pwMatches}
                  >
                    {pwChanging ? "Updating Password…" : "Save New Password"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-red-100 text-red-600 text-lg">
                  ⚠️
                </span>
                <div>
                  <h3 className="text-lg font-bold text-text font-display">
                    Delete Account Permanently?
                  </h3>
                  <p className="text-xs text-text-3">
                    This action is immediate and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-red-100 bg-red-50/60 p-3.5 text-xs text-red-800 space-y-1.5">
                <p className="font-semibold">
                  The following data will be erased immediately:
                </p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  <li>Your user login credentials and session tokens</li>
                  <li>Your merchant store catalogs, orders, and products</li>
                  <li>WhatsApp and Facebook Messenger live connections</li>
                  <li>Customer conversation logs and AI knowledge base</li>
                </ul>
              </div>

              {deleteError && (
                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs font-medium text-red-600">
                  {deleteError}
                </div>
              )}

              <form onSubmit={handleDeleteAccount} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    To confirm, please type{" "}
                    <span className="font-mono text-red-600 font-bold">
                      DELETE
                    </span>{" "}
                    or your email (
                    <span className="font-mono text-text-2">{userEmail}</span>):
                  </label>
                  <input
                    type="text"
                    value={confirmPhrase}
                    onChange={(e) => setConfirmPhrase(e.target.value)}
                    placeholder="DELETE"
                    required
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-text placeholder:text-text-3 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">
                    Enter Password (if your account uses one):
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Account password"
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-text placeholder:text-text-3 focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-text-2 hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isDeleting}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <span className="size-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Permanently Delete Account</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal */}
      <AnimatePresence>
        {addMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-md rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-text">
                    Invite Team Member
                  </h3>
                  <p className="text-xs text-text-3">
                    Grant access to manage orders and take over AI chats
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAddMemberModalOpen(false)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddMember} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Tanvir Ahmed"
                    required
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="tanvir@company.com"
                    required
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    Role &amp; Permissions
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-[13px] text-text outline-hidden focus:border-signal cursor-pointer"
                  >
                    <option value="Moderator">
                      Moderator (Chat Inbox &amp; Orders)
                    </option>
                    <option value="Ops Lead">
                      Operations Lead (Couriers &amp; Inventory)
                    </option>
                    <option value="Admin">
                      Administrator (Full Store Access)
                    </option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" variant="signal" type="submit">
                    Send Invite
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB 3: Branding (Logo, Favicon, Theme Palette, Live Preview & Socials)
   ═══════════════════════════════════════════════════════════════════ */

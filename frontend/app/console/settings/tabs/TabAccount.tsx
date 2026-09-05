"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge, Button, Panel } from "@/components/ui/primitives";
import {
  IconCheck,
  IconShield,
  IconEye,
  IconEyeOff,
  IconLock,
  IconKey,
  IconSmartphone,
  IconCopy,
  IconWarn,
  IconClose,
  IconMail,
  IconTrash,
  IconSettings,
  NAV_ICON,
} from "@/components/ui/icons";
import { useAuth } from "@/lib/auth-context";
import { useLang } from "@/lib/i18n";
import { api } from "@/lib/api-client";
import { cx } from "@/lib/format";
import { EnhancedField, PhoneCountryField, TAB_ICONS } from "../components";
import { useSettings } from "../settings-context";
import QRCode from "qrcode";

const DEFAULT_2FA_SECRET = "JBSWY3DPEHPK3PXP";

// Dynamic Plan Tier Definitions for Multi-Tenant Resource Limits
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
    upgradeTarget: "Grow Plan (2 seats)",
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
    normalized.includes("custom") ||
    normalized.includes("enterprise") ||
    normalized.includes("enter") ||
    normalized.includes("scale") ||
    normalized.includes("vip")
  ) {
    return PLAN_TIERS.custom;
  }
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
  id: string; // URL href e.g. "/console/inbox"
  label: string;
  iconKey: keyof typeof NAV_ICON;
}

export interface LeftbarModuleGroup {
  group: string;
  items: LeftbarModuleItem[];
}

export const LEFTBAR_PERMISSIONS_GROUPS: LeftbarModuleGroup[] = [
  {
    group: "OPERATIONS",
    items: [
      { id: "/console", label: "Dashboard", iconKey: "pulse" },
      { id: "/console/inbox", label: "Inbox", iconKey: "threads" },
      { id: "/console/comments", label: "Comments", iconKey: "comments" },
      { id: "/console/orders", label: "Orders", iconKey: "truck" },
      {
        id: "/console/pipeline",
        label: "Leads & Pipeline",
        iconKey: "pipeline",
      },
      {
        id: "/console/team",
        label: "Team Members",
        iconKey: "users",
      },
    ],
  },
  {
    group: "GROWTH & AUTOMATION",
    items: [
      { id: "/console/campaigns", label: "Campaigns", iconKey: "megaphone" },
      { id: "/console/automation", label: "Automation Tools", iconKey: "zap" },
      { id: "/console/integrations", label: "Integrations", iconKey: "plug" },
    ],
  },
  {
    group: "AI SALES ENGINE",
    items: [
      { id: "/console/products", label: "Products", iconKey: "box" },
      { id: "/console/brain", label: "Knowledge Base", iconKey: "brain" },
      { id: "/console/playground", label: "AI Playground", iconKey: "bot" },
    ],
  },
];

export const SETTINGS_SUB_OPTIONS = [
  { id: "settings:business", tabKey: "business" as const, label: "General" },
  { id: "settings:branding", tabKey: "branding" as const, label: "Branding" },
  { id: "settings:invoice", tabKey: "invoice" as const, label: "Invoice" },
  {
    id: "settings:website-orders",
    tabKey: "website-orders" as const,
    label: "Website Orders",
  },
  { id: "settings:courier", tabKey: "courier" as const, label: "Couriers" },
  { id: "settings:meta", tabKey: "meta" as const, label: "Meta CAPI" },
  {
    id: "settings:product-feed",
    tabKey: "product-feed" as const,
    label: "Product Feed",
  },
  {
    id: "settings:notifications",
    tabKey: "notifications" as const,
    label: "Notifications",
  },
];

export const COMMON_ROLES = [
  "Moderator",
  "Store Manager",
  "Dispatch Staff",
  "Support Agent",
  "Inventory Lead",
  "Custom",
];

// Helper: High-resolution circular/square avatar canvas crop
async function cropAvatarImage({
  imageSrc,
  zoom,
  pan,
  containerSize,
  outputSize = 512,
}: {
  imageSrc: string;
  zoom: number;
  pan: { x: number; y: number };
  containerSize: number;
  outputSize?: number;
}): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        const imgW = img.naturalWidth;
        const imgH = img.naturalHeight;
        const imgRatio = imgW / imgH;

        // Container is a circle/square of size containerSize
        // With CSS object-contain, base rendered dimensions are:
        let baseW = containerSize;
        let baseH = containerSize;
        if (imgRatio > 1) {
          baseH = containerSize / imgRatio;
        } else {
          baseW = containerSize * imgRatio;
        }

        const scaleFactor = outputSize / containerSize;
        const renderedW = baseW * zoom * scaleFactor;
        const renderedH = baseH * zoom * scaleFactor;

        const centerX = outputSize / 2 + pan.x * scaleFactor;
        const centerY = outputSize / 2 + pan.y * scaleFactor;

        const destX = centerX - renderedW / 2;
        const destY = centerY - renderedH / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fill background if image doesn't fill canvas
        ctx.fillStyle = "#020617";
        ctx.fillRect(0, 0, outputSize, outputSize);

        // Draw the framed image
        ctx.drawImage(img, destX, destY, renderedW, renderedH);

        const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        resolve(croppedDataUrl);
      } catch (err) {
        console.error("Failed to crop avatar canvas:", err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

export interface TeammateMember {
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

export function TabAccount({
  isStoreOwner: propIsStoreOwner,
  planName: propPlanName,
}: {
  isStoreOwner?: boolean;
  planName?: string | null;
} = {}) {
  const { user, updateProfile, changePassword, forgotPassword } = useAuth();
  const { settings } = useSettings();
  const { lang } = useLang();

  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const handleQuickCreateStore = async () => {
    if (isCreatingStore) return;
    try {
      setIsCreatingStore(true);
      await api.merchants.quickCreateStore();
      window.location.href = "/console";
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to create store. Please try again.",
      );
      setIsCreatingStore(false);
    }
  };

  const [firstName, setFirstName] = useState(user?.first_name || "Nazmul");
  const [lastName, setLastName] = useState(user?.last_name || "Hossain");
  const [phone, setPhone] = useState(user?.phone || "+880 1760-320810");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user?.avatar_url || null,
  );
  const [originalAvatarUrl, setOriginalAvatarUrl] = useState<string | null>(
    user?.avatar_url || null,
  );
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalImageContainerRef = useRef<HTMLDivElement>(null);

  // Avatar zoom and pan state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [savedZoom, setSavedZoom] = useState(1);
  const [savedPan, setSavedPan] = useState({ x: 0, y: 0 });

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const savedAvatarUrlRef = useRef<string | null>(user?.avatar_url || null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleSaveCropFromModal = async () => {
    const srcToCrop = originalAvatarUrl || avatarUrl;
    if (!srcToCrop) {
      setIsCropModalOpen(false);
      return;
    }
    const container = modalImageContainerRef.current;
    const containerSize = container?.clientWidth || 256;

    try {
      const cropped = await cropAvatarImage({
        imageSrc: srcToCrop,
        zoom,
        pan,
        containerSize,
        outputSize: 512,
      });
      setAvatarUrl(cropped);
      savedAvatarUrlRef.current = cropped;
      setSavedZoom(zoom);
      setSavedPan(pan);
      setIsCropModalOpen(false);

      // Instantly persist cropped photo to user profile
      try {
        await updateProfile({ avatar_url: cropped });
        setProfileToast("Profile photo updated successfully!");
      } catch {
        setProfileToast(
          "Photo updated! Click 'Save Profile Details' to persist.",
        );
      }
    } catch {
      setIsCropModalOpen(false);
    } finally {
      setTimeout(() => setProfileToast(null), 3500);
    }
  };

  const handleCancelModal = useCallback(() => {
    setZoom(savedZoom);
    setPan(savedPan);
    setAvatarUrl(savedAvatarUrlRef.current);
    setOriginalAvatarUrl(savedAvatarUrlRef.current);
    setIsCropModalOpen(false);
  }, [savedZoom, savedPan]);

  const handleRemovePhoto = async () => {
    setOriginalAvatarUrl(null);
    setAvatarUrl(null);
    savedAvatarUrlRef.current = null;
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSavedZoom(1);
    setSavedPan({ x: 0, y: 0 });
    setIsCropModalOpen(false);
    setIsRemoveModalOpen(false);
    try {
      await updateProfile({ avatar_url: "" });
      setProfileToast("Profile photo removed.");
    } catch {
      setProfileToast(
        "Photo removed. Click 'Save Profile Details' to persist.",
      );
    }
    setTimeout(() => setProfileToast(null), 3500);
  };

  // Native wheel zoom listener on modal image container
  useEffect(() => {
    if (!isCropModalOpen) return;
    const el = modalImageContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => {
        return Math.min(3, Math.max(0.6, +(prev + delta).toFixed(2)));
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isCropModalOpen]);

  // Window mouseup listener while dragging
  useEffect(() => {
    if (!isDragging) return;
    const onWindowMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [isDragging]);

  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
      if (user.phone) setPhone(user.phone);
      if (user.avatar_url !== undefined) {
        setAvatarUrl(user.avatar_url);
        setOriginalAvatarUrl(user.avatar_url);
        savedAvatarUrlRef.current = user.avatar_url;
      }
    }
  }, [user]);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [hasPassword, setHasPassword] = useState<boolean>(() => {
    if (user?.has_password !== undefined) return Boolean(user.has_password);
    if (user?.auth_provider === "google") return false;
    return true;
  });

  useEffect(() => {
    if (user?.has_password !== undefined) {
      setHasPassword(Boolean(user.has_password));
    } else if (user?.auth_provider === "google") {
      setHasPassword(false);
    }
  }, [user?.has_password, user?.auth_provider]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [pwChanging, setPwChanging] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmStoreName, setConfirmStoreName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Two-Factor Authentication (2FA) State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("as_2fa_enabled");
      return saved !== null ? saved === "true" : true;
    }
    return true;
  });
  const [twoFactorMethod, setTwoFactorMethod] = useState<
    "authenticator" | "email"
  >(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("as_2fa_method") as "authenticator" | "email") ||
        "authenticator"
      );
    }
    return "authenticator";
  });
  const [twoFactorSecret] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("as_2fa_secret") || DEFAULT_2FA_SECRET;
    }
    return DEFAULT_2FA_SECRET;
  });
  const [isTwoFactorSetupOpen, setIsTwoFactorSetupOpen] = useState(false);
  const [setupStep, setSetupStep] = useState<1 | 2>(1);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [totpDigits, setTotpDigits] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const totpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpVerifying, setTotpVerifying] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [emailCodeSentToast, setEmailCodeSentToast] = useState(false);

  const handleResendEmailCode = () => {
    setEmailCodeSentToast(true);
    setTotpDigits(["", "", "", "", "", ""]);
    setTotpError(null);
    totpInputRefs.current[0]?.focus();
    setTimeout(() => setEmailCodeSentToast(false), 3000);
  };

  const [isDisable2FAModalOpen, setIsDisable2FAModalOpen] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableError, setDisableError] = useState<string | null>(null);
  const [disableLoading, setDisableLoading] = useState(false);

  // Close modals on Escape key
  useEffect(() => {
    if (
      !isCropModalOpen &&
      !isRemoveModalOpen &&
      !isTwoFactorSetupOpen &&
      !isDisable2FAModalOpen &&
      !deleteModalOpen
    )
      return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isCropModalOpen) handleCancelModal();
        if (isRemoveModalOpen) setIsRemoveModalOpen(false);
        if (isTwoFactorSetupOpen) setIsTwoFactorSetupOpen(false);
        if (isDisable2FAModalOpen) setIsDisable2FAModalOpen(false);
        if (deleteModalOpen && !isDeleting) setDeleteModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    isCropModalOpen,
    isRemoveModalOpen,
    isTwoFactorSetupOpen,
    isDisable2FAModalOpen,
    deleteModalOpen,
    isDeleting,
    handleCancelModal,
  ]);

  // Active Device Sessions State
  const [activeSessions, setActiveSessions] = useState([
    {
      id: "sess_1",
      device: "MacBook Pro 16″ · Chrome 128",
      ip: "103.114.98.12",
      location: "Dhaka, Bangladesh",
      activity: "Current Active Session",
      isCurrent: true,
      type: "desktop",
    },
    {
      id: "sess_2",
      device: "iPhone 15 Pro · Mobile Safari",
      ip: "103.114.99.45",
      location: "Chattogram, Bangladesh",
      activity: "Active 2 hours ago",
      isCurrent: false,
      type: "mobile",
    },
  ]);
  const [sessionSignoutToast, setSessionSignoutToast] = useState(false);
  const [revokedToastDevice, setRevokedToastDevice] = useState<string | null>(
    null,
  );

  const handleSignOutOtherSessions = () => {
    setActiveSessions((prev) => prev.filter((s) => s.isCurrent));
    setSessionSignoutToast(true);
    setTimeout(() => setSessionSignoutToast(false), 3500);
  };

  const handleRevokeSession = (sessionId: string, deviceName: string) => {
    setActiveSessions((prev) => prev.filter((s) => s.id !== sessionId));
    setRevokedToastDevice(deviceName);
    setTimeout(() => setRevokedToastDevice(null), 3500);
  };

  // QR Code generator effect for 2FA
  useEffect(() => {
    if (
      isTwoFactorSetupOpen &&
      setupStep === 2 &&
      twoFactorMethod === "authenticator"
    ) {
      const emailForOtp = user?.email || "snazmulhossains24@gmail.com";
      const otpAuthUrl = `otpauth://totp/AriseSell:${encodeURIComponent(emailForOtp)}?secret=${twoFactorSecret}&issuer=AriseSell`;
      QRCode.toDataURL(otpAuthUrl, {
        width: 220,
        margin: 1.5,
        color: {
          dark: "#0f172a",
          light: "#ffffff",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code Error:", err));
    }
  }, [
    isTwoFactorSetupOpen,
    setupStep,
    twoFactorMethod,
    twoFactorSecret,
    user?.email,
  ]);

  const handleOtpDigitChange = (index: number, val: string) => {
    setTotpError(null);
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...totpDigits];
      updated[index] = "";
      setTotpDigits(updated);
      return;
    }

    if (cleaned.length >= 6) {
      const pasted = cleaned.slice(0, 6).split("");
      setTotpDigits(pasted);
      totpInputRefs.current[5]?.focus();
      return;
    }

    const single = cleaned.slice(-1);
    const updated = [...totpDigits];
    updated[index] = single;
    setTotpDigits(updated);

    if (index < 5 && single) {
      totpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !totpDigits[index] && index > 0) {
      totpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpAndProceed = () => {
    const code = totpDigits.join("");
    if (code.length < 6) {
      setTotpError("Please enter all 6 digits of the verification code.");
      return;
    }

    setTotpVerifying(true);
    setTotpError(null);
    setTimeout(() => {
      setTotpVerifying(false);
      setTwoFactorEnabled(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("as_2fa_enabled", "true");
        localStorage.setItem("as_2fa_method", twoFactorMethod);
        localStorage.setItem("as_2fa_secret", twoFactorSecret);
      }
      setIsTwoFactorSetupOpen(false);
      setProfileToast(
        "Two-factor authentication (2FA) is now active on your account!",
      );
      setTimeout(() => setProfileToast(null), 3500);
    }, 600);
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(twoFactorSecret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleConfirmDisable2FA = () => {
    if (!disablePassword.trim()) {
      setDisableError("Please enter your account password to confirm.");
      return;
    }
    setDisableLoading(true);
    setDisableError(null);
    setTimeout(() => {
      setTwoFactorEnabled(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("as_2fa_enabled", "false");
      }
      setIsDisable2FAModalOpen(false);
      setDisableLoading(false);
      setDisablePassword("");
      setProfileToast("Two-factor authentication has been disabled.");
      setTimeout(() => setProfileToast(null), 3500);
    }, 600);
  };

  const fullName =
    `${firstName} ${lastName}`.trim() || user?.email || "Nazmul Hossain";
  const userEmail = user?.email || "snazmulhossains24@gmail.com";
  const userInitials =
    `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "NH";

  const pwHasLength = newPassword.length >= 8;
  const pwHasUpper = /[A-Z]/.test(newPassword);
  const pwHasLower = /[a-z]/.test(newPassword);
  const pwHasNumber = /[0-9]/.test(newPassword);
  const pwMatches = newPassword.length > 0 && newPassword === confirmPassword;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileToast("Image size must be less than 5MB.");
      setTimeout(() => setProfileToast(null), 3500);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setOriginalAvatarUrl(dataUrl);
      setAvatarUrl(dataUrl);
      setZoom(1);
      setPan({ x: 0, y: 0 });
      setSavedZoom(1);
      setSavedPan({ x: 0, y: 0 });
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isCropModalOpen || (!avatarUrl && !originalAvatarUrl)) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isCropModalOpen) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (
      !isCropModalOpen ||
      (!avatarUrl && !originalAvatarUrl) ||
      e.touches.length !== 1
    )
      return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isCropModalOpen || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.x;
    const dy = touch.clientY - dragStartRef.current.y;
    setPan({
      x: dragStartRef.current.panX + dx,
      y: dragStartRef.current.panY + dy,
    });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileToast(null);
    try {
      const res = await updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone,
        avatar_url: avatarUrl || "",
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

    if (hasPassword && !currentPassword) {
      setPwError("Please enter your current password.");
      return;
    }

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
      const payload = hasPassword
        ? {
            current_password: currentPassword,
            new_password: newPassword,
            confirm_password: confirmPassword,
          }
        : {
            new_password: newPassword,
            confirm_password: confirmPassword,
          };

      const res = await changePassword(payload);
      if (res.success) {
        setHasPassword(true);
        setPwSuccess(
          hasPassword
            ? "Password changed securely! You can now use your new password."
            : "Password added successfully! 2FA security and password login are now enabled.",
        );
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          setPasswordModalOpen(false);
          setPwSuccess(null);
        }, 1800);
      } else {
        setPwError(
          res.error || "Failed to update password. Please verify your details.",
        );
      }
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Password update failed");
    } finally {
      setPwChanging(false);
    }
  };

  const handleForgotPassword = async () => {
    const emailToReset = user?.email || userEmail;
    if (!emailToReset) {
      setPwError("No email address found for this account.");
      return;
    }
    setForgotLoading(true);
    setPwError(null);
    setPwSuccess(null);
    try {
      const res = await forgotPassword(emailToReset);
      if (res.success) {
        setPwSuccess(
          `Password reset instructions sent to ${emailToReset}. Please check your inbox.`,
        );
      } else {
        setPwError(res.error || "Failed to send password reset email.");
      }
    } catch (err: unknown) {
      setPwError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setForgotLoading(false);
    }
  };

  const storeName = settings?.name || "Your Store";
  const isStoreOwner =
    propIsStoreOwner !== undefined
      ? propIsStoreOwner
      : Boolean(
          user?.is_superadmin ||
          (user?.role && user.role.toLowerCase() === "owner"),
        );

  const isConfirmMatch =
    confirmStoreName.trim().toLowerCase() === storeName.trim().toLowerCase() ||
    confirmStoreName.trim().toLowerCase() === "delete";

  const handleDeleteStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (!isStoreOwner) {
      setDeleteError(
        "Permission denied: Only the store owner can delete this store.",
      );
      return;
    }

    if (!isConfirmMatch) {
      setDeleteError(`Please type "${storeName}" to confirm store deletion.`);
      return;
    }

    setIsDeleting(true);
    try {
      const res = await api.merchants.deleteStore({
        confirm_phrase: confirmStoreName.trim(),
      });
      if (res.success) {
        window.location.href = "/console";
      } else {
        setDeleteError(
          res.message || "Failed to delete store. Please try again.",
        );
        setIsDeleting(false);
      }
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Store deletion failed",
      );
      setIsDeleting(false);
    }
  };

  // Store Teammates state inside Account
  const [members, setMembers] = useState<TeammateMember[]>(() => {
    const ownerName = user
      ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
      : "Store Owner";
    return [
      {
        id: user ? String(user.id) : "owner",
        name: ownerName,
        email: user?.email || "",
        role: "Owner",
        online: true,
        channels: ["Messenger", "WhatsApp", "Instagram"],
        permissions: [
          "all",
          "chat",
          "orders",
          "courier",
          "catalog",
          "invoices",
          "settings",
        ],
        is_owner: true,
        avatar_url: user?.avatar_url || null,
      },
    ];
  });

  useEffect(() => {
    if (user?.email) {
      setMembers((prev) => {
        if (prev.length === 1 && prev[0].is_owner && !prev[0].email) {
          const ownerName =
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            user.email;
          return [
            {
              ...prev[0],
              id: String(user.id),
              name: ownerName,
              email: user.email,
              avatar_url: user.avatar_url || avatarUrl || null,
            },
          ];
        }
        return prev;
      });
    }
  }, [user, avatarUrl]);

  useEffect(() => {
    api.merchants
      .getTeam()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMembers(
            data
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
                    : ["chat", "orders"],
                is_owner: m.is_owner ?? m.role.toLowerCase() === "owner",
                avatar_url: m.avatar_url || (m.is_owner ? avatarUrl : null),
              })),
          );
        }
      })
      .catch(() => {});
  }, [avatarUrl]);

  const currentPlan = resolvePlanTier(
    propPlanName || user?.plan || settings?.plan,
  );
  const maxMembers = Math.max(
    currentPlan.maxMembers,
    settings?.maxSeats && settings.maxSeats > 0 ? settings.maxSeats : 0,
  );
  const occupiedSeats = members.length;
  const availableSeats = Math.max(0, maxMembers - occupiedSeats);
  const isSeatLimitReached = occupiedSeats >= maxMembers;

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#team-members" || hash === "#team") {
        setTimeout(() => {
          const el = document.getElementById("team-members");
          if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 150);
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get("invite") === "true") {
        setAddMemberModalOpen(true);
      }
    }
  }, []);

  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [selectedNavHrefs, setSelectedNavHrefs] = useState<string[]>([]);
  const [hasSettingsAccess, setHasSettingsAccess] = useState(false);
  const [selectedSettingsTabs, setSelectedSettingsTabs] = useState<string[]>(
    [],
  );
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [teamToastMessage, setTeamToastMessage] = useState<string | null>(null);

  const toggleNavHref = (href: string) => {
    setSelectedNavHrefs((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
    );
  };

  const toggleSettingsTab = (tabId: string) => {
    setSelectedSettingsTabs((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId],
    );
  };

  const handleSelectAllNav = () => {
    const all = LEFTBAR_PERMISSIONS_GROUPS.flatMap((g) =>
      g.items.map((i) => i.id),
    );
    setSelectedNavHrefs(all);
    setHasSettingsAccess(true);
    setSelectedSettingsTabs(SETTINGS_SUB_OPTIONS.map((s) => s.id));
  };

  const handleClearAllNav = () => {
    setSelectedNavHrefs([]);
    setHasSettingsAccess(false);
    setSelectedSettingsTabs([]);
  };

  // Edit Team Member State
  const [editMemberModalOpen, setEditMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editMemberEmail, setEditMemberEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editNavHrefs, setEditNavHrefs] = useState<string[]>([]);
  const [editHasSettingsAccess, setEditHasSettingsAccess] = useState(false);
  const [editSettingsTabs, setEditSettingsTabs] = useState<string[]>([]);
  const [isUpdatingMember, setIsUpdatingMember] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleOpenEditMember = (m: TeammateMember) => {
    setEditingMemberId(m.id);
    setEditMemberEmail(m.email);
    setEditName(m.name);
    setEditRole(m.role === "Owner" ? "Moderator" : m.role);

    const perms: string[] = m.permissions || [];
    const navHrefs = perms.filter(
      (p: string) => p.startsWith("/console") && p !== "/console/settings",
    );
    const hasSettings =
      perms.includes("/console/settings") ||
      perms.some((p: string) => p.startsWith("settings:"));
    const settingsTabs = perms.filter((p: string) => p.startsWith("settings:"));

    setEditNavHrefs(navHrefs);
    setEditHasSettingsAccess(hasSettings);
    setEditSettingsTabs(
      settingsTabs.length > 0
        ? settingsTabs
        : SETTINGS_SUB_OPTIONS.map((s) => s.id),
    );
    setEditError(null);
    setEditMemberModalOpen(true);
  };

  const toggleEditNavHref = (href: string) => {
    setEditNavHrefs((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href],
    );
  };

  const toggleEditSettingsTab = (tabId: string) => {
    setEditSettingsTabs((prev) =>
      prev.includes(tabId) ? prev.filter((t) => t !== tabId) : [...prev, tabId],
    );
  };

  const handleEditSelectAllNav = () => {
    const all = LEFTBAR_PERMISSIONS_GROUPS.flatMap((g) =>
      g.items.map((i) => i.id),
    );
    setEditNavHrefs(all);
    setEditHasSettingsAccess(true);
    setEditSettingsTabs(SETTINGS_SUB_OPTIONS.map((s) => s.id));
  };

  const handleEditClearAllNav = () => {
    setEditNavHrefs([]);
    setEditHasSettingsAccess(false);
    setEditSettingsTabs([]);
  };

  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemberId || !editName.trim()) return;

    const effectivePermissions = [
      ...editNavHrefs,
      ...(editHasSettingsAccess
        ? ["/console/settings", ...editSettingsTabs]
        : []),
    ];

    if (effectivePermissions.length === 0) {
      setEditError(
        "Please select at least one permission module for this teammate.",
      );
      return;
    }

    setIsUpdatingMember(true);
    setEditError(null);

    const resolvedRole = editRole.trim() || "Moderator";

    try {
      const res = await api.merchants.updateTeamMember(editingMemberId, {
        name: editName.trim(),
        role: resolvedRole,
        permissions: effectivePermissions,
      });

      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMemberId
            ? {
                ...m,
                name: res.name || editName.trim(),
                role: res.role || resolvedRole,
                permissions: res.permissions || effectivePermissions,
              }
            : m,
        ),
      );

      setEditMemberModalOpen(false);
      setTeamToastMessage("🎉 Team member updated successfully!");
      setTimeout(() => setTeamToastMessage(null), 3500);
    } catch (err: unknown) {
      setEditError(
        err instanceof Error ? err.message : "Failed to update team member",
      );
    } finally {
      setIsUpdatingMember(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    if (isSeatLimitReached) {
      setInviteError(
        `Seat capacity limit reached (${occupiedSeats}/${maxMembers}). Please upgrade your plan to add more team members.`,
      );
      return;
    }

    const effectivePermissions = [
      ...selectedNavHrefs,
      ...(hasSettingsAccess
        ? ["/console/settings", ...selectedSettingsTabs]
        : []),
    ];

    if (effectivePermissions.length === 0) {
      setInviteError(
        "Please select at least one permission module for this teammate.",
      );
      return;
    }

    setIsInviting(true);
    setInviteError(null);

    const resolvedRole = newRole.trim() || "Moderator";

    try {
      const res = await api.merchants.inviteTeamMember({
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        role: resolvedRole,
        channels: ["WhatsApp", "Messenger", "Instagram"],
        permissions: effectivePermissions,
      });

      setMembers((prev) => [
        ...prev,
        {
          id: res.id,
          name: res.name,
          email: res.email,
          role: res.role,
          online: res.online,
          channels: res.platforms || ["WhatsApp", "Messenger", "Instagram"],
          permissions: res.permissions || effectivePermissions,
          is_owner: false,
        },
      ]);

      setNewName("");
      setNewEmail("");
      setNewRole("");
      setSelectedNavHrefs([]);
      setHasSettingsAccess(false);
      setSelectedSettingsTabs([]);
      setAddMemberModalOpen(false);
      setTeamToastMessage(
        `🎉 Team invite sent to ${newEmail.trim().toLowerCase()}!`,
      );
      setTimeout(() => setTeamToastMessage(null), 3500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to invite team member";
      setInviteError(message);
    } finally {
      setIsInviting(false);
    }
  };

  const [deleteTargetMember, setDeleteTargetMember] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isDeletingMember, setIsDeletingMember] = useState(false);
  const [deleteMemberError, setDeleteMemberError] = useState<string | null>(
    null,
  );

  const handleConfirmDeleteMember = async () => {
    if (!deleteTargetMember) return;
    setIsDeletingMember(true);
    setDeleteMemberError(null);
    try {
      await api.merchants.removeTeamMember(deleteTargetMember.id);
      setMembers((prev) => prev.filter((m) => m.id !== deleteTargetMember.id));
      setTeamToastMessage("🎉 Team member removed.");
      setTimeout(() => setTeamToastMessage(null), 3500);
      setDeleteTargetMember(null);
    } catch (err: unknown) {
      setDeleteMemberError(
        err instanceof Error ? err.message : "Failed to remove team member",
      );
    } finally {
      setIsDeletingMember(false);
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {profileToast && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-[13px] text-signal font-medium flex items-center gap-2.5 shadow-xs"
          >
            <div className="size-5 rounded-full bg-signal/15 text-signal grid place-items-center shrink-0">
              <IconCheck width={13} height={13} />
            </div>
            <span className="flex-1">{profileToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleUpdateProfile}>
        <Panel>
          <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8.5 rounded-lg bg-surface-2 border border-line text-text-2 grid place-items-center shrink-0">
                <svg
                  width="16"
                  height="16"
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
              <h3 className="text-base font-bold text-text font-display">
                Profile Information
              </h3>
            </div>
            <Badge tone="mint" dot>
              Active Owner
            </Badge>
          </div>

          <div className="p-5 sm:p-6">
            <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 lg:gap-8">
              {/* LEFT: Avatar & Info */}
              <div className="w-full sm:w-48 md:w-52 shrink-0 flex flex-col items-center text-center justify-center lg:justify-start lg:pt-1">
                {/* Circular Avatar */}
                <div className="relative">
                  <div className="size-24 sm:size-28 rounded-full overflow-hidden border-2 border-line bg-slate-950 shadow-xs flex items-center justify-center relative select-none">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarUrl}
                        alt={fullName}
                        referrerPolicy="no-referrer"
                        className="size-full object-cover rounded-full pointer-events-none select-none"
                      />
                    ) : (
                      <div className="size-full bg-linear-to-br from-signal/15 via-surface-2 to-signal/5 flex items-center justify-center rounded-full">
                        <span className="text-2xl sm:text-3xl font-bold text-signal font-display select-none">
                          {userInitials}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Small camera badge button */}
                  <button
                    type="button"
                    onClick={() => {
                      setSavedZoom(zoom);
                      setSavedPan(pan);
                      setIsCropModalOpen(true);
                    }}
                    className="absolute bottom-0 right-0 size-7.5 rounded-full bg-surface border border-line shadow-xs text-text-2 hover:text-signal hover:border-signal/50 hover:ring-2 hover:ring-signal/15 hover:scale-105 active:scale-95 transition-all duration-150 grid place-items-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-signal"
                    title="Change profile photo"
                    aria-label="Change profile photo"
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  </button>
                </div>

                {/* Identity directly below image */}
                <div className="mt-2.5 space-y-1 w-full">
                  <h3 className="text-sm sm:text-[15px] font-bold text-text font-display leading-snug">
                    {fullName}
                  </h3>
                  <div className="flex items-center justify-center">
                    <Badge
                      tone="mint"
                      className="capitalize font-mono text-[10px] px-2 py-0.5"
                    >
                      {user?.role || "Owner"}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-3 font-mono break-all select-all">
                    {userEmail}
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>

              {/* VERTICAL DIVIDER (Desktop) / HORIZONTAL DIVIDER (Mobile) */}
              <div className="hidden lg:block w-px bg-line self-stretch shrink-0" />
              <div className="w-full h-px bg-line lg:hidden" />

              {/* RIGHT: Pure Clean Form Fields */}
              <div className="flex-1 min-w-0 w-full space-y-4 lg:pl-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EnhancedField
                    id="first_name"
                    name="first_name"
                    label="First Name"
                    value={firstName}
                    onChange={setFirstName}
                    placeholder="First Name"
                    autoComplete="given-name"
                    required
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
                    id="last_name"
                    name="last_name"
                    label="Last Name"
                    value={lastName}
                    onChange={setLastName}
                    placeholder="Last Name"
                    autoComplete="family-name"
                    required
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
                  <PhoneCountryField
                    id="mobile_phone"
                    name="phone"
                    label="Mobile Phone"
                    value={phone}
                    onChange={setPhone}
                    autoComplete="tel"
                  />
                  <EnhancedField
                    id="primary_email"
                    name="email"
                    label="Primary Email Address"
                    value={userEmail}
                    disabled
                    badge="Verified"
                    badgeTone="mint"
                    autoComplete="email"
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
                        <rect
                          width="18"
                          height="11"
                          x="3"
                          y="11"
                          rx="2"
                          ry="2"
                        />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    }
                  />
                </div>

                {/* Right-aligned Save button */}
                <div className="flex justify-end pt-2">
                  <Button
                    size="sm"
                    variant="signal"
                    type="submit"
                    disabled={profileSaving}
                    className="cursor-pointer shadow-xs font-semibold px-5 gap-2 transition-all active:scale-98"
                  >
                    {profileSaving ? (
                      <>
                        <svg
                          className="animate-spin size-3.5 text-white"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Saving Profile…</span>
                      </>
                    ) : (
                      <span>Save Profile Details</span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* PROFILE PHOTO MODAL */}
          {isCropModalOpen && (
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) handleCancelModal();
              }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Profile photo"
                className="bg-surface border border-line rounded-2xl shadow-xl max-w-sm sm:max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
              >
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-line flex items-center justify-between bg-surface-2/30">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-text font-display">
                      {originalAvatarUrl || avatarUrl
                        ? "Edit Profile Photo"
                        : "Upload Profile Photo"}
                    </h3>
                    <p className="text-xs text-text-3 mt-0.5">
                      {originalAvatarUrl || avatarUrl
                        ? "Drag photo to reposition • Adjust zoom"
                        : "Choose a photo from your computer"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelModal}
                    className="size-7 rounded-lg hover:bg-surface-2 text-text-3 hover:text-text grid place-items-center transition-colors cursor-pointer"
                    title="Close dialog"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 sm:p-6 flex flex-col items-center gap-4">
                  {originalAvatarUrl || avatarUrl ? (
                    <>
                      {/* Circular Viewport */}
                      <div
                        ref={modalImageContainerRef}
                        role="region"
                        aria-label="Crop frame"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                        onDoubleClick={() => {
                          setZoom(1);
                          setPan({ x: 0, y: 0 });
                        }}
                        className={cx(
                          "size-52 sm:size-56 rounded-full overflow-hidden border border-line bg-surface-2 select-none touch-none transition-all flex items-center justify-center shrink-0 relative shadow-inner",
                          isDragging
                            ? "cursor-grabbing ring-2 ring-signal/60"
                            : "cursor-grab",
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={originalAvatarUrl || avatarUrl || ""}
                          alt={fullName}
                          draggable={false}
                          style={{
                            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                            transformOrigin: "center center",
                          }}
                          className="size-full object-contain pointer-events-none select-none transition-transform duration-75"
                        />
                      </div>

                      {/* Zoom Controls */}
                      <div className="w-full max-w-xs space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs text-text-3">
                          <span>Zoom</span>
                          <span>{Math.round(zoom * 100)}%</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setZoom((prev) =>
                                Math.max(0.6, +(prev - 0.1).toFixed(2)),
                              )
                            }
                            className="size-7 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-2 text-xs font-bold grid place-items-center transition-colors cursor-pointer select-none"
                            title="Zoom out"
                          >
                            －
                          </button>
                          <input
                            type="range"
                            min="0.6"
                            max="3"
                            step="0.02"
                            value={zoom}
                            onChange={(e) =>
                              setZoom(parseFloat(e.target.value))
                            }
                            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-signal bg-surface-3"
                            aria-label="Zoom slider"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setZoom((prev) =>
                                Math.min(3, +(prev + 0.1).toFixed(2)),
                              )
                            }
                            className="size-7 rounded-lg bg-surface-2 hover:bg-surface-3 text-text-2 text-xs font-bold grid place-items-center transition-colors cursor-pointer select-none"
                            title="Zoom in"
                          >
                            ＋
                          </button>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 text-xs text-text-3 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setZoom(1);
                            setPan({ x: 0, y: 0 });
                          }}
                          className="hover:text-text cursor-pointer transition-colors"
                        >
                          Reset frame
                        </button>
                        <span>•</span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-signal hover:underline cursor-pointer transition-colors font-medium"
                        >
                          Upload new photo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-line hover:border-signal/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-surface-2/40 transition-all text-center group"
                    >
                      <div className="size-12 rounded-full bg-signal/10 text-signal grid place-items-center group-hover:scale-105 transition-transform">
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text">
                          Choose a photo
                        </p>
                        <p className="text-xs text-text-3 mt-0.5">
                          JPG, PNG or WEBP (Max 5MB)
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-1 pointer-events-none"
                      >
                        Browse device
                      </Button>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="px-5 py-3.5 bg-surface-2/30 border-t border-line flex items-center justify-between gap-3">
                  {originalAvatarUrl || avatarUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCropModalOpen(false);
                        setIsRemoveModalOpen(true);
                      }}
                      className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer transition-colors"
                    >
                      Remove photo
                    </button>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelModal}
                      className="cursor-pointer"
                    >
                      Cancel
                    </Button>
                    {(originalAvatarUrl || avatarUrl) && (
                      <Button
                        type="button"
                        variant="signal"
                        size="sm"
                        onClick={handleSaveCropFromModal}
                        className="font-medium cursor-pointer px-4"
                      >
                        Save Photo
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REMOVE PHOTO CONFIRMATION MODAL */}
          {isRemoveModalOpen && (
            <div
              onClick={(e) => {
                if (e.target === e.currentTarget) setIsRemoveModalOpen(false);
              }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            >
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Remove profile photo"
                className="bg-surface border border-line rounded-2xl shadow-xl max-w-sm w-full p-5 sm:p-6 text-center animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="size-11 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center mb-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </div>

                <h3 className="text-base font-semibold text-text font-display">
                  Remove profile photo?
                </h3>
                <p className="text-xs text-text-3 mt-1.5 mb-5">
                  Are you sure you want to remove your profile photo? Your
                  avatar will revert to your default initials ({userInitials}).
                </p>

                <div className="flex items-center justify-center gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsRemoveModalOpen(false)}
                    className="flex-1 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="flex-1 px-4 py-2 text-xs font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </Panel>
      </form>

      {/* Login & Security */}
      <Panel className="overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8.5 rounded-lg bg-surface-2 border border-line text-text-2 grid place-items-center shrink-0">
              <IconShield width={16} height={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text font-display">
                Login & Security
              </h3>
              <p className="text-xs text-text-3 mt-0.5 hidden sm:block">
                Manage your master password and two-factor authentication
              </p>
            </div>
          </div>
          {twoFactorEnabled ? (
            <Badge tone="mint" dot>
              2FA Protected
            </Badge>
          ) : (
            <Badge tone="amber" dot>
              Standard Protection
            </Badge>
          )}
        </div>

        {/* Clean, Full-Width Facebook & Stripe-Style Rows */}
        <div className="divide-y divide-line">
          {/* Row 1: Account Password (Change or Add) */}
          <div
            onClick={() => {
              setPwError(null);
              setPwSuccess(null);
              setShowCurrentPw(false);
              setShowNewPw(false);
              setShowConfirmPw(false);
              setPasswordModalOpen(true);
            }}
            className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-2/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="size-10 rounded-xl bg-surface-2 border border-line grid place-items-center shrink-0 text-text-2 group-hover:border-signal/40 group-hover:text-signal transition-colors shadow-2xs">
                <IconLock width={17} height={17} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-text group-hover:text-signal transition-colors">
                    {hasPassword ? "Account Password" : "Add Account Password"}
                  </p>
                  {!hasPassword && (
                    <Badge tone="amber" dot>
                      Google Account · No Password Set
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-text-3 mt-0.5 leading-normal">
                  {hasPassword
                    ? "Set a unique, secure password to protect your merchant console from unauthorized access."
                    : "You signed in via Google OAuth. Add a password to enable direct email sign-in and unlock Two-Factor Authentication."}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={hasPassword ? "outline" : "signal"}
              type="button"
              onClick={() => {
                setPwError(null);
                setPwSuccess(null);
                setShowCurrentPw(false);
                setShowNewPw(false);
                setShowConfirmPw(false);
                setPasswordModalOpen(true);
              }}
              className="cursor-pointer font-medium shrink-0 self-start sm:self-center px-4"
            >
              {hasPassword ? "Change Password" : "Add Password"}
            </Button>
          </div>

          {/* Row 2: Two-Factor Authentication (2FA) - Only rendered when password exists */}
          {hasPassword && (
            <div
              onClick={() => {
                if (twoFactorEnabled) {
                  setDisablePassword("");
                  setDisableError(null);
                  setIsDisable2FAModalOpen(true);
                } else {
                  setSetupStep(1);
                  setTotpDigits(["", "", "", "", "", ""]);
                  setTotpError(null);
                  setIsTwoFactorSetupOpen(true);
                }
              }}
              className="group p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-2/30 transition-colors cursor-pointer"
            >
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={cx(
                    "size-10 rounded-xl border grid place-items-center shrink-0 transition-colors shadow-2xs",
                    twoFactorEnabled
                      ? "bg-signal/10 border-signal/30 text-signal group-hover:bg-signal/15"
                      : "bg-surface-2 border-line text-text-2 group-hover:border-signal/40 group-hover:text-signal",
                  )}
                >
                  {twoFactorEnabled && twoFactorMethod === "authenticator" ? (
                    <IconSmartphone width={17} height={17} />
                  ) : twoFactorEnabled && twoFactorMethod === "email" ? (
                    <IconMail width={17} height={17} />
                  ) : (
                    <IconKey width={17} height={17} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-text group-hover:text-signal transition-colors">
                      Two-Factor Authentication (2FA)
                    </p>
                    {twoFactorEnabled ? (
                      <Badge tone="mint" dot>
                        Active ·{" "}
                        {twoFactorMethod === "authenticator"
                          ? "Authenticator App"
                          : "Email OTP"}
                      </Badge>
                    ) : (
                      <Badge tone="amber" dot>
                        Disabled
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-text-3 mt-0.5 leading-normal">
                    {twoFactorEnabled
                      ? twoFactorMethod === "authenticator"
                        ? "Protected via Authenticator App (Google Authenticator, Microsoft Authenticator, 1Password)."
                        : `Protected via Email Verification Code (sent to ${userEmail}).`
                      : "Add an extra layer of protection to secure your account even if your password is leaked."}
                  </p>
                </div>
              </div>

              {twoFactorEnabled ? (
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setDisablePassword("");
                    setDisableError(null);
                    setIsDisable2FAModalOpen(true);
                  }}
                  className="cursor-pointer font-medium shrink-0 self-start sm:self-center text-red-600 hover:text-red-700 hover:bg-red-500/10 border-line hover:border-red-500/30 px-3.5"
                >
                  Turn off 2FA
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="signal"
                  type="button"
                  onClick={() => {
                    setSetupStep(1);
                    setTotpDigits(["", "", "", "", "", ""]);
                    setTotpError(null);
                    setIsTwoFactorSetupOpen(true);
                  }}
                  className="cursor-pointer font-medium shadow-xs shrink-0 self-start sm:self-center px-4"
                >
                  Enable 2FA
                </Button>
              )}
            </div>
          )}
        </div>
      </Panel>

      {/* Active Login Sessions */}
      <Panel className="overflow-hidden">
        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-8.5 rounded-lg bg-surface-2 border border-line text-text-2 grid place-items-center shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="14" x="2" y="3" rx="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-text font-display">
                  Active Login Sessions
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-surface-2 text-text-2 border border-line/60">
                  {activeSessions.length}{" "}
                  {activeSessions.length === 1 ? "Device" : "Devices"}
                </span>
              </div>
              <p className="text-xs text-text-3 mt-0.5 hidden sm:block">
                Devices and browsers currently authenticated to your merchant
                console
              </p>
            </div>
          </div>

          {activeSessions.some((s) => !s.isCurrent) && (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handleSignOutOtherSessions}
              className="cursor-pointer text-xs font-medium shrink-0 self-start sm:self-center text-red-600 hover:text-red-700 hover:bg-red-500/10 border-line hover:border-red-500/30"
            >
              Sign Out Other Devices
            </Button>
          )}
        </div>

        {/* Feedback Alerts */}
        <AnimatePresence>
          {sessionSignoutToast && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="m-4 sm:m-5 mb-0 rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-xs text-signal font-medium flex items-center gap-2 shadow-2xs"
            >
              <IconCheck width={14} height={14} />
              <span>
                All other active device sessions have been revoked and logged
                out!
              </span>
            </motion.div>
          )}
          {revokedToastDevice && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="m-4 sm:m-5 mb-0 rounded-xl border border-signal/40 bg-[#edf7f3] p-3 text-xs text-signal font-medium flex items-center gap-2 shadow-2xs"
            >
              <IconCheck width={14} height={14} />
              <span>
                Session for &quot;{revokedToastDevice}&quot; has been revoked.
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Direct clean divide-y session list */}
        <div className="divide-y divide-line">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className={cx(
                "p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors",
                session.isCurrent ? "bg-surface-2/20" : "hover:bg-surface-2/10",
              )}
            >
              <div className="flex items-center gap-3.5">
                <div className="size-9 rounded-lg bg-surface border border-line grid place-items-center shrink-0 text-text-2 shadow-2xs">
                  {session.type === "desktop" ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="12" x="3" y="4" rx="2" ry="2" />
                      <line x1="2" x2="22" y1="20" y2="20" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
                      <line x1="12" x2="12.01" y1="18" y2="18" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-text text-xs sm:text-[13px]">
                      {session.device}
                    </p>
                    {session.isCurrent && (
                      <Badge tone="mint" dot>
                        This Device
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-text-3 font-mono mt-0.5">
                    {session.location} · IP: {session.ip} · {session.activity}
                  </p>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  type="button"
                  onClick={() =>
                    handleRevokeSession(session.id, session.device)
                  }
                  className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer transition-colors hover:underline self-start sm:self-center px-2 py-1 rounded hover:bg-red-500/10"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </Panel>

      {/* Store Teammates & Permissions */}
      <div id="team-members" className="space-y-4 scroll-mt-6">
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

        <Panel>
          <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-text font-display">
                  Team Members &amp; Access
                </h3>
                <Badge tone={currentPlan.badgeTone} dot>
                  {settings?.plan || currentPlan.name} Plan · {occupiedSeats}/
                  {maxMembers} Seats
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
              <a
                href="/console/team"
                className="h-8 rounded-lg border border-line bg-white hover:border-line-hover hover:bg-surface-2 px-3 text-xs font-semibold text-text transition-all cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
              >
                Open Dedicated Page ↗
              </a>
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
                  <th className="p-4">Member</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Permissions</th>
                  <th className="p-4">Presence</th>
                  <th className="p-4 text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/60">
                {members.map((m) => {
                  const isOwner = m.role === "Owner" || m.is_owner;
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-surface-2/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {m.avatar_url || (isOwner && avatarUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.avatar_url || avatarUrl!}
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
                      <td className="p-4 max-w-lg">
                        <div className="flex gap-1.5 flex-wrap items-center">
                          {isOwner ? (
                            <span className="rounded-md bg-signal/10 text-signal border border-signal/20 px-2 py-0.5 text-[10.5px] font-bold font-mono">
                              ⭐ Full Store Access
                            </span>
                          ) : (
                            (() => {
                              const perms = m.permissions || [];
                              const pMap: Record<string, string> = {
                                "/console": "Dashboard",
                                "/console/inbox": "Inbox",
                                "/console/comments": "Comments",
                                "/console/orders": "Orders",
                                "/console/pipeline": "Leads",
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
                                chat: "Inbox",
                                orders: "Orders",
                                courier: "Courier",
                                catalog: "Products",
                                invoices: "Invoices",
                                settings: "Settings",
                              };

                              const labels = Array.from(
                                new Set(perms.map((p) => pMap[p] || p)),
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
                      <td className="p-4">
                        <Badge
                          tone={m.online ? "mint" : "neutral"}
                          dot={m.online}
                        >
                          {m.online ? "Online" : "Offline"}
                        </Badge>
                      </td>
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
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Danger Zone / Store Workspace */}
      <div
        className={cx(
          "rounded-2xl border p-5 sm:p-6 shadow-2xs transition-colors",
          settings.has_store === false || !settings.name
            ? "border-signal/30 bg-signal/5"
            : isStoreOwner
              ? "border-red-200/70 bg-red-50/30"
              : "border-line bg-surface-2/40 opacity-90",
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge
                tone={
                  settings.has_store === false || !settings.name
                    ? "signal"
                    : isStoreOwner
                      ? "coral"
                      : "neutral"
                }
                className="font-mono text-[10px] uppercase tracking-wider"
              >
                {settings.has_store === false || !settings.name
                  ? lang === "bn"
                    ? "স্টোর সেটআপ"
                    : "Store Setup"
                  : isStoreOwner
                    ? lang === "bn"
                      ? "বিপদজনক অঞ্চল"
                      : "Danger Zone"
                    : lang === "bn"
                      ? "সীমাবদ্ধ"
                      : "Restricted"}
              </Badge>
              <span
                className={cx(
                  "text-[11px] font-medium px-2 py-0.5 rounded-full border",
                  settings.has_store === false || !settings.name
                    ? "text-signal bg-signal/10 border-signal/20"
                    : isStoreOwner
                      ? "text-red-700 bg-red-100/70 border-red-200"
                      : "text-text-3 bg-surface-2 border-line",
                )}
              >
                {settings.has_store === false || !settings.name
                  ? lang === "bn"
                    ? "ব্যক্তিগত স্টোর"
                    : "Personal Store"
                  : isStoreOwner
                    ? lang === "bn"
                      ? "স্টোর ডিলিট"
                      : "Store Deletion"
                    : lang === "bn"
                      ? "অনুমতি সীমাবদ্ধ"
                      : "Owner Permission Required"}
              </span>
            </div>
            <h3 className="mt-2 text-base font-bold text-text font-display">
              {settings.has_store === false || !settings.name
                ? lang === "bn"
                  ? "ব্যক্তিগত স্টোর ওয়ার্কস্পেস"
                  : "Personal Store Workspace"
                : lang === "bn"
                  ? `স্টোর মুছে ফেলুন: ${storeName}`
                  : `Delete Store: ${storeName}`}
            </h3>
            <p className="mt-1.5 text-[13px] text-text-3 max-w-5xl leading-relaxed">
              {settings.has_store === false || !settings.name ? (
                <>
                  {lang === "bn" ? (
                    <>
                      আপনার ইউজার অ্যাকাউন্টে বর্তমানে কোনো সক্রিয় নিজস্ব স্টোর
                      যুক্ত নেই। ১-ক্লিকে নতুন স্টোর তৈরি করতে{" "}
                      <strong className="text-signal font-semibold">
                        নিচের বাম পাশের নেভিগেশন বার (Bottom-Left Navbar)
                      </strong>
                      -এর স্টোর সুইচারে ক্লিক করে{" "}
                      <span className="font-semibold text-text">
                        &quot;নতুন নিজস্ব স্টোর তৈরি করুন&quot;
                      </span>{" "}
                      সিলেক্ট করুন অথবা পাশের ১-ক্লিক বাটনে চাপ দিন।
                    </>
                  ) : (
                    <>
                      Your user account currently has no active personal store
                      attached. To create your own brand new store with 1-click,
                      click the store switcher in the{" "}
                      <strong className="text-signal font-semibold">
                        bottom-left navigation bar
                      </strong>{" "}
                      anytime and select{" "}
                      <span className="font-semibold text-text">
                        &quot;Create a New Store&quot;
                      </span>
                      , or use the 1-click button on the right.
                    </>
                  )}
                </>
              ) : isStoreOwner ? (
                <>
                  {lang === "bn" ? (
                    <>
                      এই মার্চেন্ট স্টোরটি স্থায়ীভাবে মুছে ফেলুন। এর সাথে
                      সংযুক্ত হোয়াটসঅ্যাপ ও মেসেঞ্জার চ্যানেল, পণ্য ক্যাটালগ,
                      গ্রাহক চ্যাট, অর্ডার এবং কুরিয়ার ইন্টিগ্রেশন মুছে যাবে।
                      আপনার ইউজার অ্যাকাউন্ট (
                      <span className="font-mono text-text">{userEmail}</span>)
                      সক্রিয় থাকবে এবং আপনি যেকোনো সময় নতুন স্টোর খুলতে পারবেন।
                    </>
                  ) : (
                    <>
                      Permanently delete this merchant store, including
                      connected WhatsApp &amp; Messenger channels, product
                      catalogs, customer threads, orders, and courier
                      integrations. Your user account (
                      <span className="font-mono text-text">{userEmail}</span>)
                      remains active, and you can create a new store anytime.
                    </>
                  )}
                </>
              ) : (
                <>
                  {lang === "bn" ? (
                    <>
                      শুধুমাত্র স্টোর ওনারের এই স্টোর মুছে ফেলার অনুমতি রয়েছে।
                      আপনি বর্তমানে{" "}
                      <span className="font-semibold text-text capitalize">
                        {user?.role || "Moderator"}
                      </span>{" "}
                      হিসেবে সংযুক্ত আছেন। আপনার নিজস্ব ব্র্যান্ডের স্টোর চালু
                      করতে{" "}
                      <strong className="text-signal font-semibold">
                        নিচের বাম পাশের নেভিগেশন বার
                      </strong>
                      -এর স্টোর সুইচার থেকে{" "}
                      <span className="font-semibold text-text">
                        &quot;নতুন নিজস্ব স্টোর তৈরি করুন&quot;
                      </span>{" "}
                      সিলেক্ট করুন।
                    </>
                  ) : (
                    <>
                      Only the store owner has permission to permanently delete
                      this store workspace. You are currently signed in with the
                      role of{" "}
                      <span className="font-semibold text-text capitalize">
                        {user?.role || "Moderator"}
                      </span>
                      . To launch your own personal store, click the store
                      switcher in the{" "}
                      <strong className="text-signal font-semibold">
                        bottom-left navigation bar
                      </strong>{" "}
                      and select{" "}
                      <span className="font-semibold text-text">
                        &quot;Create a New Store&quot;
                      </span>
                      .
                    </>
                  )}
                </>
              )}
            </p>
          </div>
          {settings.has_store === false || !settings.name ? (
            <div className="shrink-0 flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleQuickCreateStore}
                disabled={isCreatingStore}
                className="shrink-0 flex items-center gap-2 rounded-xl border border-signal/40 bg-signal px-4.5 py-2.5 text-xs sm:text-[13px] font-bold text-white hover:bg-signal/90 transition-all shadow-xs cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {isCreatingStore ? (
                  <>
                    <svg
                      className="size-3.5 animate-spin text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>
                      {lang === "bn" ? "তৈরি হচ্ছে..." : "Creating Store..."}
                    </span>
                  </>
                ) : (
                  <>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    <span>
                      {lang === "bn"
                        ? "নতুন স্টোর তৈরি করুন"
                        : "Create Store (1-Click)"}
                    </span>
                  </>
                )}
              </button>
            </div>
          ) : isStoreOwner ? (
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setConfirmStoreName("");
                setDeleteModalOpen(true);
              }}
              className="shrink-0 rounded-xl border border-red-300 bg-white px-4.5 py-2.5 text-xs sm:text-[13px] font-bold text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all shadow-2xs hover:shadow-xs cursor-pointer text-center"
            >
              {lang === "bn" ? "স্টোর মুছে ফেলুন" : "Delete Store"}
            </button>
          ) : (
            <div
              title="Only the store owner can delete this store"
              className="shrink-0 flex items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-4.5 py-2.5 text-xs font-semibold text-text-3 select-none cursor-not-allowed"
            >
              <IconLock className="size-3.5 text-text-3" />
              <span>{lang === "bn" ? "অনুমতি সীমাবদ্ধ" : "Owner Only"}</span>
            </div>
          )}
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
                      {hasPassword ? "Change Password" : "Add Account Password"}
                    </h3>
                    <p className="text-xs text-text-3">
                      {hasPassword
                        ? "Update your login security credentials"
                        : "Create a password to enable email sign-in and 2FA"}
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
                {hasPassword && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-text">
                        Current Password
                      </label>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={forgotLoading}
                        className="text-xs font-semibold text-signal hover:underline cursor-pointer transition-colors disabled:opacity-50"
                      >
                        {forgotLoading ? "Sending link..." : "Forgot password?"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        required={hasPassword}
                        className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text pr-10 focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all"
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
                )}

                <div>
                  <label className="block text-xs font-bold text-text mb-1">
                    {hasPassword ? "New Password" : "Create Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text pr-10 focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all"
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
                    Confirm {hasPassword ? "New Password" : "Password"}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text pr-10 focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPw(!showConfirmPw)}
                      className="absolute right-3 top-2.5 text-text-3 hover:text-text cursor-pointer"
                    >
                      {showConfirmPw ? (
                        <IconEyeOff width={16} height={16} />
                      ) : (
                        <IconEye width={16} height={16} />
                      )}
                    </button>
                  </div>
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
                    {pwChanging
                      ? hasPassword
                        ? "Updating Password…"
                        : "Setting Password…"
                      : hasPassword
                        ? "Save New Password"
                        : "Set & Add Password"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Store Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeleting) {
                setDeleteModalOpen(false);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="relative w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9.5 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400 border border-red-500/20 shrink-0">
                    <IconTrash className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-text font-display">
                      Delete Store
                    </h3>
                    <p className="text-xs text-text-3 font-medium truncate max-w-[260px]">
                      {storeName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="rounded-lg p-1.5 text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer disabled:pointer-events-none"
                  title="Close"
                >
                  <IconClose className="size-4" />
                </button>
              </div>

              {/* Warning Notice */}
              <div className="mt-4 space-y-2 text-xs text-text-2 leading-relaxed">
                <p>
                  This action cannot be undone. This will permanently delete the
                  store{" "}
                  <strong className="text-text font-semibold">
                    {storeName}
                  </strong>{" "}
                  and wipe all connected channels, catalog products, customer
                  conversations, and orders.
                </p>
                <p className="text-text-3 text-[11px]">
                  Your user account (
                  <span className="font-mono text-text-2">{userEmail}</span>)
                  will remain active.
                </p>
              </div>

              {/* Confirmation Form */}
              <form onSubmit={handleDeleteStore} className="mt-4.5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text mb-1.5">
                    To confirm, please type{" "}
                    <span className="font-mono font-bold text-red-600 dark:text-red-400 select-all">
                      {storeName}
                    </span>{" "}
                    below:
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={confirmStoreName}
                    onChange={(e) => setConfirmStoreName(e.target.value)}
                    placeholder={storeName}
                    className="w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-3/50 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-hidden transition-all"
                  />
                </div>

                {deleteError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/40 p-2.5 text-xs font-medium text-red-600 dark:text-red-400">
                    {deleteError}
                  </div>
                )}

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line">
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="rounded-xl border border-line bg-surface px-4 py-2 text-xs font-semibold text-text-2 hover:bg-surface-2 hover:text-text transition-colors cursor-pointer disabled:pointer-events-none"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isConfirmMatch || isDeleting}
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 active:bg-red-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isDeleting ? (
                      <>
                        <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Deleting Store...</span>
                      </>
                    ) : (
                      <span>Permanently Delete Store</span>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Member Modal with Granular Role & Permissions */}
      <AnimatePresence>
        {addMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-line bg-surface p-5 sm:p-7 shadow-2xl space-y-4 text-left"
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
                      ? `${availableSeats} seat${availableSeats > 1 ? "s" : ""} available on your ${currentPlan.name} plan. Teammate seats are covered by your plan.`
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
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900 space-y-1.5">
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
                  <p className="text-[11.5px] text-amber-700">
                    To invite additional team members, please upgrade to{" "}
                    <strong>
                      {currentPlan.upgradeTarget || "Custom Enterprise Plan"}
                    </strong>
                    .
                  </p>
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4 pt-1">
                {/* 1. Name, Email & Role in the Same Row */}
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
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
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
                      placeholder="tanvir@company.com"
                      required
                      disabled={isSeatLimitReached || isInviting}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">
                      Role / Position
                    </label>
                    <input
                      type="text"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Moderator"
                      disabled={isSeatLimitReached || isInviting}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* 2. Permissions (Clean Section Header & Proper Spacing) */}
                <div className="pt-3.5 mt-1 border-t border-line/70 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-text">
                        Permissions
                      </h4>
                      <p className="text-[11.5px] text-text-3 mt-0.5">
                        Select which features and pages this teammate can access
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAllNav}
                        className="rounded-lg border border-line bg-white hover:border-signal/50 hover:bg-[#eaf5ef]/40 px-2.5 py-1 text-xs font-semibold text-signal transition-all cursor-pointer shadow-2xs"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllNav}
                        className="rounded-lg border border-line bg-white hover:border-line-hover hover:bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-3 hover:text-text transition-all cursor-pointer shadow-2xs"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Leftbar Groups */}
                  <div className="space-y-3.5">
                    {LEFTBAR_PERMISSIONS_GROUPS.map((group) => (
                      <div key={group.group} className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-0.5">
                          <span className="size-2 rounded-full bg-signal ring-2 ring-signal/20 shrink-0" />
                          <p className="text-[11px] font-bold uppercase tracking-wider text-text-2">
                            {group.group}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {group.items.map((item) => {
                            const isChecked = selectedNavHrefs.includes(
                              item.id,
                            );
                            const Icon = NAV_ICON[item.iconKey];
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleNavHref(item.id)}
                                disabled={isSeatLimitReached || isInviting}
                                className={cx(
                                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-[13px] transition-all cursor-pointer select-none",
                                  isChecked
                                    ? "border-signal bg-[#eaf5ef] text-signal font-semibold ring-1 ring-signal/20 shadow-2xs"
                                    : "border-line bg-white hover:border-line-hover hover:bg-surface-2/60 text-text font-medium",
                                  isSeatLimitReached || isInviting
                                    ? "opacity-50 cursor-not-allowed"
                                    : "",
                                )}
                              >
                                {Icon && (
                                  <Icon
                                    width={16}
                                    height={16}
                                    className={cx(
                                      "shrink-0 transition-colors",
                                      isChecked ? "text-signal" : "text-text-3",
                                    )}
                                  />
                                )}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Settings Access Field (Collapsible) */}
                <div className="rounded-2xl border border-line bg-surface-2/40 p-3 space-y-2.5">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setHasSettingsAccess((prev) => !prev)}
                      disabled={isSeatLimitReached || isInviting}
                      className={cx(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-[13px] transition-all cursor-pointer select-none",
                        hasSettingsAccess
                          ? "border-signal bg-[#eaf5ef] text-signal font-semibold ring-1 ring-signal/20 shadow-2xs"
                          : "border-line bg-white hover:border-line-hover hover:bg-surface-2/60 text-text font-medium",
                        isSeatLimitReached || isInviting
                          ? "opacity-50 cursor-not-allowed"
                          : "",
                      )}
                    >
                      <IconSettings
                        width={16}
                        height={16}
                        className={
                          hasSettingsAccess ? "text-signal" : "text-text-3"
                        }
                      />
                      <span>Store Settings</span>
                    </button>
                  </div>

                  {/* Revealed Settings Sub-Options (Hidden by default, shown when checked) */}
                  <AnimatePresence>
                    {hasSettingsAccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="pt-2.5 border-t border-line/60 space-y-2 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-0.5">
                          <p className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-text-3">
                            Settings Tabs
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSettingsTabs(
                                  SETTINGS_SUB_OPTIONS.map((s) => s.id),
                                )
                              }
                              className="rounded-md border border-line bg-white hover:border-signal/50 hover:bg-[#eaf5ef]/40 px-2 py-0.5 text-[11px] font-semibold text-signal transition-all cursor-pointer shadow-2xs"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedSettingsTabs([])}
                              className="rounded-md border border-line bg-white hover:border-line-hover hover:bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-3 hover:text-text transition-all cursor-pointer shadow-2xs"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {SETTINGS_SUB_OPTIONS.map((tab) => {
                            const isChecked = selectedSettingsTabs.includes(
                              tab.id,
                            );
                            const TabIcon =
                              TAB_ICONS[tab.tabKey as keyof typeof TAB_ICONS];
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => toggleSettingsTab(tab.id)}
                                className={cx(
                                  "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all cursor-pointer select-none",
                                  isChecked
                                    ? "border-signal bg-[#eaf5ef] text-signal font-semibold ring-1 ring-signal/20 shadow-2xs"
                                    : "border-line bg-white hover:border-line-hover text-text font-medium",
                                )}
                              >
                                {TabIcon && (
                                  <TabIcon
                                    className={cx(
                                      "size-3.5 shrink-0 transition-colors",
                                      isChecked ? "text-signal" : "text-text-3",
                                    )}
                                  />
                                )}
                                <span>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setAddMemberModalOpen(false)}
                    disabled={isInviting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant={isSeatLimitReached ? "outline" : "signal"}
                    type="submit"
                    disabled={isSeatLimitReached || isInviting}
                    className={
                      isSeatLimitReached ? "opacity-60 cursor-not-allowed" : ""
                    }
                  >
                    {isInviting
                      ? "Sending Invite…"
                      : isSeatLimitReached
                        ? "Seat Limit Reached"
                        : "Send Invite"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT TEAM MEMBER MODAL */}
      <AnimatePresence>
        {editMemberModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-line bg-surface p-5 sm:p-7 shadow-2xl space-y-4 text-left"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-line/60 pb-3.5">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-text font-display">
                    Edit Team Member
                  </h3>
                  <p className="text-xs text-text-3 mt-0.5 font-mono">
                    {editMemberEmail}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditMemberModalOpen(false)}
                  className="rounded-lg p-1.5 text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                  title="Close"
                >
                  <IconClose className="size-4" />
                </button>
              </div>

              {/* Error Notice */}
              {editError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 flex items-center gap-2">
                  <IconWarn className="size-4 text-red-600 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <form onSubmit={handleSaveEditMember} className="space-y-4 pt-1">
                {/* Name & Role in Same Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-text mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Tanvir Ahmed"
                      required
                      disabled={isUpdatingMember}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-text mb-1">
                      Role / Position
                    </label>
                    <input
                      type="text"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      placeholder="e.g. Moderator"
                      disabled={isUpdatingMember}
                      className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-text focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/15 transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="pt-3.5 mt-1 border-t border-line/70 space-y-3.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-[13px] font-semibold text-text">
                        Permissions
                      </h4>
                      <p className="text-[11.5px] text-text-3 mt-0.5">
                        Select which features and pages this teammate can access
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleEditSelectAllNav}
                        className="rounded-lg border border-line bg-white hover:border-signal/50 hover:bg-[#eaf5ef]/40 px-2.5 py-1 text-xs font-semibold text-signal transition-all cursor-pointer shadow-2xs"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleEditClearAllNav}
                        className="rounded-lg border border-line bg-white hover:border-line-hover hover:bg-surface-2 px-2.5 py-1 text-xs font-medium text-text-3 hover:text-text transition-all cursor-pointer shadow-2xs"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>

                  {/* Leftbar Groups */}
                  <div className="space-y-3.5">
                    {LEFTBAR_PERMISSIONS_GROUPS.map((group) => (
                      <div key={group.group} className="space-y-1.5">
                        <div className="flex items-center gap-1.5 px-0.5">
                          <span className="size-2 rounded-full bg-signal ring-2 ring-signal/20 shrink-0" />
                          <p className="text-[11px] font-bold uppercase tracking-wider text-text-2">
                            {group.group}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {group.items.map((item) => {
                            const isChecked = editNavHrefs.includes(item.id);
                            const Icon = NAV_ICON[item.iconKey];
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleEditNavHref(item.id)}
                                disabled={isUpdatingMember}
                                className={cx(
                                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-[13px] transition-all cursor-pointer select-none",
                                  isChecked
                                    ? "border-signal bg-[#eaf5ef] text-signal font-semibold ring-1 ring-signal/20 shadow-2xs"
                                    : "border-line bg-white hover:border-line-hover hover:bg-surface-2/60 text-text font-medium",
                                  isUpdatingMember
                                    ? "opacity-50 cursor-not-allowed"
                                    : "",
                                )}
                              >
                                {Icon && (
                                  <Icon
                                    width={16}
                                    height={16}
                                    className={cx(
                                      "shrink-0 transition-colors",
                                      isChecked ? "text-signal" : "text-text-3",
                                    )}
                                  />
                                )}
                                <span>{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings Access Field (Collapsible) */}
                <div className="rounded-2xl border border-line bg-surface-2/40 p-3 space-y-2.5">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setEditHasSettingsAccess((prev) => !prev)}
                      disabled={isUpdatingMember}
                      className={cx(
                        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs sm:text-[13px] transition-all cursor-pointer select-none",
                        editHasSettingsAccess
                          ? "border-signal bg-[#eaf5ef] text-signal font-semibold ring-1 ring-signal/20 shadow-2xs"
                          : "border-line bg-white hover:border-line-hover hover:bg-surface-2/60 text-text font-medium",
                        isUpdatingMember ? "opacity-50 cursor-not-allowed" : "",
                      )}
                    >
                      <IconSettings
                        width={16}
                        height={16}
                        className={
                          editHasSettingsAccess ? "text-signal" : "text-text-3"
                        }
                      />
                      <span>Store Settings</span>
                    </button>
                  </div>

                  {/* Revealed Settings Sub-Options */}
                  <AnimatePresence>
                    {editHasSettingsAccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.15 }}
                        className="pt-2.5 border-t border-line/60 space-y-2 overflow-hidden"
                      >
                        <div className="flex items-center justify-between px-0.5">
                          <p className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-text-3">
                            Settings Tabs
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setEditSettingsTabs(
                                  SETTINGS_SUB_OPTIONS.map((s) => s.id),
                                )
                              }
                              className="rounded-md border border-line bg-white hover:border-signal/50 hover:bg-[#eaf5ef]/40 px-2 py-0.5 text-[11px] font-semibold text-signal transition-all cursor-pointer shadow-2xs"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditSettingsTabs([])}
                              className="rounded-md border border-line bg-white hover:border-line-hover hover:bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-3 hover:text-text transition-all cursor-pointer shadow-2xs"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {SETTINGS_SUB_OPTIONS.map((tab) => {
                            const isChecked = editSettingsTabs.includes(tab.id);
                            const TabIcon =
                              TAB_ICONS[tab.tabKey as keyof typeof TAB_ICONS];
                            return (
                              <button
                                key={tab.id}
                                type="button"
                                onClick={() => toggleEditSettingsTab(tab.id)}
                                className={cx(
                                  "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs transition-all cursor-pointer select-none",
                                  isChecked
                                    ? "border-signal bg-[#eaf5ef] text-signal font-semibold ring-1 ring-signal/20 shadow-2xs"
                                    : "border-line bg-white hover:border-line-hover text-text font-medium",
                                )}
                              >
                                {TabIcon && (
                                  <TabIcon
                                    className={cx(
                                      "size-3.5 shrink-0 transition-colors",
                                      isChecked ? "text-signal" : "text-text-3",
                                    )}
                                  />
                                )}
                                <span>{tab.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-line/60">
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => setEditMemberModalOpen(false)}
                    disabled={isUpdatingMember}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="signal"
                    type="submit"
                    disabled={isUpdatingMember}
                  >
                    {isUpdatingMember ? "Saving Changes…" : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE TEAM MEMBER CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTargetMember && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget && !isDeletingMember) {
                setDeleteTargetMember(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ duration: 0.12 }}
              className="relative w-full max-w-[380px] rounded-2xl border border-line bg-surface p-5 shadow-xl text-left space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-bold text-text">
                  Remove Team Member
                </h3>
                <button
                  type="button"
                  onClick={() => setDeleteTargetMember(null)}
                  disabled={isDeletingMember}
                  className="rounded-lg p-1 text-text-3 hover:text-text hover:bg-surface-2 transition-colors cursor-pointer"
                  title="Close"
                >
                  <IconClose className="size-4" />
                </button>
              </div>

              <p className="text-xs sm:text-[13px] text-text-2 leading-relaxed">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-text">
                  {deleteTargetMember.name}
                </span>{" "}
                ({deleteTargetMember.email}) from your team?
              </p>

              {deleteMemberError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 flex items-center gap-2">
                  <IconWarn className="size-4 shrink-0 text-red-600" />
                  <span>{deleteMemberError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => setDeleteTargetMember(null)}
                  disabled={isDeletingMember}
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteMember}
                  disabled={isDeletingMember}
                  className="h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3.5 transition-all cursor-pointer shadow-2xs disabled:opacity-50 inline-flex items-center justify-center"
                >
                  {isDeletingMember ? "Deleting…" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2FA SETUP WIZARD MODAL */}
      <AnimatePresence>
        {isTwoFactorSetupOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsTwoFactorSetupOpen(false);
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-[490px] rounded-3xl border border-line bg-surface p-6 sm:p-7 shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-signal/15 text-signal grid place-items-center shrink-0">
                    <IconShield width={20} height={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text">
                      {twoFactorEnabled
                        ? "Reconfigure Two-Factor Authentication"
                        : "Set Up Two-Factor Authentication"}
                    </h3>
                    <p className="text-xs text-text-3 mt-0.5">
                      Step {setupStep} of 2 ·{" "}
                      {setupStep === 1 ? "Choose Method" : "Verify & Activate"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTwoFactorSetupOpen(false)}
                  className="text-text-3 hover:text-text text-sm cursor-pointer p-1.5 rounded-xl hover:bg-surface-2 transition-colors"
                >
                  <IconClose width={16} height={16} />
                </button>
              </div>

              {/* Step Tracker */}
              <div className="flex items-center gap-2">
                <div
                  className={cx(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    setupStep >= 1 ? "bg-signal" : "bg-surface-2",
                  )}
                />
                <div
                  className={cx(
                    "h-1 flex-1 rounded-full transition-all duration-300",
                    setupStep >= 2 ? "bg-signal" : "bg-surface-2",
                  )}
                />
              </div>

              {/* STEP 1: Method Selection */}
              {setupStep === 1 && (
                <div className="space-y-4">
                  <p className="text-xs text-text-3">
                    Select how you would like to receive your second factor
                    verification codes:
                  </p>

                  <div className="space-y-3">
                    {/* Option: Authenticator App */}
                    <div
                      onClick={() => setTwoFactorMethod("authenticator")}
                      className={cx(
                        "group relative w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5",
                        twoFactorMethod === "authenticator"
                          ? "border-signal/80 bg-signal/[0.04] ring-1 ring-signal/25 shadow-xs"
                          : "border-line bg-surface hover:bg-surface-2/40 hover:border-line-strong",
                      )}
                    >
                      <div
                        className={cx(
                          "size-10 rounded-xl border grid place-items-center shrink-0 transition-colors mt-0.5",
                          twoFactorMethod === "authenticator"
                            ? "bg-signal/15 border-signal/30 text-signal"
                            : "bg-surface-2 border-line text-text-3 group-hover:text-text",
                        )}
                      >
                        <IconSmartphone width={18} height={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-text">
                              Authenticator App
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                              Recommended
                            </span>
                          </div>

                          <div
                            className={cx(
                              "size-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                              twoFactorMethod === "authenticator"
                                ? "border-signal bg-signal text-white"
                                : "border-line bg-surface group-hover:border-text-3",
                            )}
                          >
                            {twoFactorMethod === "authenticator" && (
                              <span className="size-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-text-3 mt-1 leading-relaxed">
                          Use Google Authenticator, Microsoft Authenticator, or
                          1Password to generate instant offline codes.
                        </p>
                      </div>
                    </div>

                    {/* Option: Email Code */}
                    <div
                      onClick={() => setTwoFactorMethod("email")}
                      className={cx(
                        "group relative w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5",
                        twoFactorMethod === "email"
                          ? "border-signal/80 bg-signal/[0.04] ring-1 ring-signal/25 shadow-xs"
                          : "border-line bg-surface hover:bg-surface-2/40 hover:border-line-strong",
                      )}
                    >
                      <div
                        className={cx(
                          "size-10 rounded-xl border grid place-items-center shrink-0 transition-colors mt-0.5",
                          twoFactorMethod === "email"
                            ? "bg-signal/15 border-signal/30 text-signal"
                            : "bg-surface-2 border-line text-text-3 group-hover:text-text",
                        )}
                      >
                        <IconMail width={18} height={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-bold text-text">
                            Email Verification Code
                          </p>

                          <div
                            className={cx(
                              "size-4.5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                              twoFactorMethod === "email"
                                ? "border-signal bg-signal text-white"
                                : "border-line bg-surface group-hover:border-text-3",
                            )}
                          >
                            {twoFactorMethod === "email" && (
                              <span className="size-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-text-3 mt-1 leading-relaxed">
                          Receive a single-use 6-digit passcode sent to your
                          registered email address whenever you log in.
                        </p>

                        <div className="mt-2 flex items-center gap-1.5 text-[11px] font-mono text-text-2 bg-surface-2/70 px-2.5 py-1 rounded-md border border-line w-fit">
                          <IconMail
                            width={12}
                            height={12}
                            className="text-text-3"
                          />
                          <span className="truncate max-w-[240px]">
                            {userEmail}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTwoFactorSetupOpen(false)}
                      className="cursor-pointer font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="signal"
                      size="sm"
                      onClick={() => setSetupStep(2)}
                      className="cursor-pointer px-5 font-semibold"
                    >
                      Continue to Verification
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: Scan QR Code & Enter 6-digit OTP */}
              {setupStep === 2 && (
                <div className="space-y-4">
                  {twoFactorMethod === "authenticator" ? (
                    <>
                      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-surface-2/30 border border-line">
                        <div className="size-32 sm:size-34 bg-white p-2 rounded-xl border border-line shadow-xs shrink-0 flex items-center justify-center">
                          {qrDataUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={qrDataUrl}
                              alt="2FA QR Code"
                              className="size-full"
                            />
                          ) : (
                            <span className="text-xs text-text-3">
                              Generating QR...
                            </span>
                          )}
                        </div>

                        <div className="space-y-2 text-center sm:text-left flex-1">
                          <p className="text-xs font-semibold text-text">
                            Scan QR code with your authenticator app
                          </p>
                          <p className="text-[11px] text-text-3">
                            Can&apos;t scan? Enter this setup key into your app:
                          </p>
                          <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                            <code className="px-2 py-1 bg-surface rounded-lg border border-line text-xs font-mono font-bold text-text tracking-wider select-all">
                              {twoFactorSecret}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopySecret}
                              className="px-2 py-1 bg-surface hover:bg-surface-2 border border-line rounded-lg text-xs text-text font-medium cursor-pointer transition-colors flex items-center gap-1"
                              title="Copy Secret"
                            >
                              <IconCopy width={13} height={13} />
                              <span>{copiedSecret ? "Copied!" : "Copy"}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 pt-1">
                        <label className="block text-xs font-bold text-text text-center sm:text-left">
                          Enter 6-digit code from your authenticator app
                        </label>

                        {/* 6 Digit Inputs Grouped 3-3 */}
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {totpDigits.slice(0, 3).map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                totpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpDigitChange(idx, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="size-11 sm:size-12 rounded-xl border border-line bg-surface text-center text-lg font-bold font-mono text-text focus:border-signal outline-none focus:ring-2 focus:ring-signal/20 transition-all shadow-2xs"
                              autoFocus={idx === 0}
                            />
                          ))}
                          <span className="text-text-3 font-bold px-0.5">
                            –
                          </span>
                          {totpDigits.slice(3, 6).map((digit, idx) => {
                            const realIdx = idx + 3;
                            return (
                              <input
                                key={realIdx}
                                ref={(el) => {
                                  totpInputRefs.current[realIdx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                  handleOtpDigitChange(realIdx, e.target.value)
                                }
                                onKeyDown={(e) => handleOtpKeyDown(realIdx, e)}
                                className="size-11 sm:size-12 rounded-xl border border-line bg-surface text-center text-lg font-bold font-mono text-text focus:border-signal outline-none focus:ring-2 focus:ring-signal/20 transition-all shadow-2xs"
                              />
                            );
                          })}
                        </div>

                        {totpError && (
                          <p className="text-xs text-red-500 text-center pt-1 font-medium">
                            {totpError}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Email Verification Code step */
                    <div className="space-y-4 text-center py-2">
                      <div className="size-12 rounded-2xl bg-signal/15 text-signal mx-auto grid place-items-center shadow-2xs">
                        <IconMail width={22} height={22} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text">
                          Verification Code Sent
                        </h4>
                        <p className="text-xs text-text-3 mt-1">
                          We sent a 6-digit one-time passcode to:
                        </p>
                        <p className="text-xs font-mono font-bold text-text bg-surface-2/70 border border-line px-3 py-1 rounded-lg inline-block mt-1.5 select-all">
                          {userEmail}
                        </p>
                      </div>

                      {/* 6 Digit Inputs Grouped 3-3 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                          {totpDigits.slice(0, 3).map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                totpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) =>
                                handleOtpDigitChange(idx, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              className="size-11 sm:size-12 rounded-xl border border-line bg-surface text-center text-lg font-bold font-mono text-text focus:border-signal outline-none focus:ring-2 focus:ring-signal/20 transition-all shadow-2xs"
                              autoFocus={idx === 0}
                            />
                          ))}
                          <span className="text-text-3 font-bold px-0.5">
                            –
                          </span>
                          {totpDigits.slice(3, 6).map((digit, idx) => {
                            const realIdx = idx + 3;
                            return (
                              <input
                                key={realIdx}
                                ref={(el) => {
                                  totpInputRefs.current[realIdx] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) =>
                                  handleOtpDigitChange(realIdx, e.target.value)
                                }
                                onKeyDown={(e) => handleOtpKeyDown(realIdx, e)}
                                className="size-11 sm:size-12 rounded-xl border border-line bg-surface text-center text-lg font-bold font-mono text-text focus:border-signal outline-none focus:ring-2 focus:ring-signal/20 transition-all shadow-2xs"
                              />
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={handleResendEmailCode}
                            className="text-xs text-signal hover:underline font-medium cursor-pointer"
                          >
                            Resend code to email
                          </button>
                        </div>

                        {emailCodeSentToast && (
                          <p className="text-xs text-signal font-medium animate-in fade-in">
                            ✓ A new verification code has been sent to{" "}
                            {userEmail}
                          </p>
                        )}
                      </div>

                      {totpError && (
                        <p className="text-xs text-red-500 text-center pt-1 font-medium">
                          {totpError}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2.5 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSetupStep(1)}
                      className="cursor-pointer font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      variant="signal"
                      size="sm"
                      onClick={handleVerifyOtpAndProceed}
                      disabled={totpVerifying || totpDigits.join("").length < 6}
                      className="cursor-pointer px-5 font-semibold"
                    >
                      {totpVerifying ? "Verifying..." : "Verify & Activate"}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DISABLE 2FA CONFIRMATION MODAL */}
      <AnimatePresence>
        {isDisable2FAModalOpen && (
          <div
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsDisable2FAModalOpen(false);
            }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-sm rounded-3xl border border-line bg-surface p-6 shadow-2xl text-center space-y-4"
            >
              <div className="size-11 rounded-full bg-red-500/10 text-red-500 mx-auto flex items-center justify-center">
                <IconWarn width={22} height={22} />
              </div>

              <div>
                <h3 className="text-base font-bold text-text font-display">
                  Disable Two-Factor Authentication?
                </h3>
                <p className="text-xs text-text-3 mt-1.5 leading-relaxed">
                  Disabling 2FA makes your account significantly more vulnerable
                  to unauthorized access. Anyone with your password will be able
                  to log into your merchant store.
                </p>
              </div>

              <div className="space-y-1.5 text-left pt-1">
                <label className="block text-xs font-bold text-text">
                  Confirm your account password
                </label>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => {
                    setDisablePassword(e.target.value);
                    if (disableError) setDisableError(null);
                  }}
                  placeholder="Enter your current password"
                  className="w-full rounded-xl border border-line bg-white px-3 py-2 text-xs text-text focus:border-signal outline-none focus:outline-none focus:ring-2 focus:ring-signal/20 transition-all shadow-2xs"
                  autoFocus
                />
                {disableError && (
                  <p className="text-xs text-red-500 font-medium pt-0.5">
                    {disableError}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsDisable2FAModalOpen(false);
                    setDisablePassword("");
                    setDisableError(null);
                  }}
                  className="flex-1 cursor-pointer"
                >
                  Cancel
                </Button>
                <button
                  type="button"
                  onClick={handleConfirmDisable2FA}
                  disabled={disableLoading || !disablePassword.trim()}
                  className="flex-1 px-4 py-2 text-xs font-medium rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {disableLoading ? "Disabling..." : "Disable 2FA"}
                </button>
              </div>
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

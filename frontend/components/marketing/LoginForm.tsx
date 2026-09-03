"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Wordmark } from "@/components/ui/primitives";
import {
  IconGoogle,
  IconMail,
  IconLock,
  IconEye,
  IconEyeOff,
  IconCheck,
  IconClose,
  IconShield,
} from "@/components/ui/icons";
import { useLang } from "@/lib/i18n";
import { useAuth } from "@/lib/auth-context";
import { useGoogleAuth } from "@/lib/use-google-auth";

export default function LoginForm() {
  const router = useRouter();
  const { t } = useLang();
  const { login, forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { triggerGoogleLogin: handleGoogleLogin, googleLoading } =
    useGoogleAuth({
      redirectPath: "/login",
      onError: (errMsg) => setError(errMsg),
    });

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [, setForgotMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError(
        t(
          "Please enter both your email address and password.",
          "অনুগ্রহ করে আপনার ইমেইল এবং পাসওয়ার্ড লিখুন।",
        ),
      );
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password, rememberMe);
      if (res.success) {
        if (rememberMe) {
          localStorage.setItem("np_remember_7d", "true");
        }
        const target =
          res.user?.has_plan || res.user?.is_superadmin
            ? "/console"
            : "/choose-plan";
        router.replace(target);
        router.refresh();
      } else {
        const errorMsg =
          res.error === "Invalid email or password"
            ? t(
                "Invalid email address or password. Please verify and try again.",
                "ভুল ইমেইল অথবা পাসওয়ার্ড দেওয়া হয়েছে। অনুগ্রহ করে যাচাই করুন।",
              )
            : res.error ||
              t(
                "Sign in failed. Please check your credentials.",
                "লগইন ব্যর্থ হয়েছে। অনুগ্রহ করে তথ্য যাচাই করুন।",
              );
        setError(errorMsg);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      if (res.success) {
        setForgotSent(true);
        if (res.message) setForgotMsg(res.message);
      } else {
        setError(res.error || "Password reset request failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Password reset failed");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-100">
      {/* Ambient background soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 rounded-4xl bg-linear-to-b from-signal/20 via-signal/5 to-transparent blur-2xl opacity-75"
      />

      {/* Main Glassmorphic Login Card */}
      <div className="relative overflow-hidden rounded-3xl border border-black/8 bg-white/85 p-6 sm:p-7 shadow-[0_20px_50px_-15px_rgba(10,110,80,0.15),0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-2xl backdrop-saturate-190">
        {/* Specular glass reflection line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white to-transparent opacity-90"
        />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Wordmark />
          </Link>
          <h1 className="mt-3.5 font-display text-[22px] font-bold tracking-tight text-text">
            {t("Welcome back", "স্বাগতম")}
          </h1>
          <p className="mt-0.5 text-[13px] text-text-2">
            {t(
              "Sign in to manage your AI sales assistant",
              "আপনার এআই বিক্রয় সহকারী পরিচালনা করতে লগইন করুন",
            )}
          </p>
        </div>

        {/* Google OAuth Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="flex h-10.5 w-full items-center justify-center gap-2.5 rounded-xl border border-black/8 bg-white px-4 text-[13.5px] font-medium text-text shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-200 hover:border-black/[0.14] hover:bg-neutral-50/80 hover:shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-text-3 border-t-signal" />
            ) : (
              <IconGoogle className="size-4.25 shrink-0" />
            )}
            <span>{t("Continue with Google", "গুগল দিয়ে প্রবেশ করুন")}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-black/8" />
          <span className="absolute bg-white/95 px-3 text-[11.5px] font-medium text-text-3 backdrop-blur-sm">
            {t("or sign in with email", "অথবা ইমেইল দিয়ে")}
          </span>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-3.5 rounded-xl border border-red-200 bg-red-50/85 px-3 py-2 text-[12.5px] text-red-600 backdrop-blur-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-[12.5px] font-medium text-text">
              {t("Email address", "ইমেইল অ্যাড্রেস")}
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-3">
                <IconMail width={15} height={15} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("merchant@shop.com.bd", "merchant@shop.com.bd")}
                className="h-10 w-full rounded-xl border border-black/9 bg-white/75 pl-9 pr-3 text-[13.5px] text-text placeholder:text-text-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)] transition-all duration-200 focus:border-signal focus:bg-white focus:outline-none focus:ring-3 focus:ring-signal/15"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12.5px] font-medium text-text">
              {t("Password", "পাসওয়ার্ড")}
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-3">
                <IconLock width={15} height={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-10 w-full rounded-xl border border-black/9 bg-white/75 pl-9 pr-9 text-[13.5px] text-text placeholder:text-text-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)] transition-all duration-200 focus:border-signal focus:bg-white focus:outline-none focus:ring-3 focus:ring-signal/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-2.5 flex items-center text-text-3 transition-colors hover:text-text cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <IconEyeOff width={15} height={15} />
                ) : (
                  <IconEye width={15} height={15} />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password Row */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="size-4 rounded-sm border border-black/20 bg-white shadow-sm transition-all peer-checked:border-signal peer-checked:bg-signal" />
                <IconCheck
                  width={11}
                  height={11}
                  className="pointer-events-none absolute left-[2.5px] top-[2.5px] text-white opacity-0 transition-opacity peer-checked:opacity-100"
                />
              </div>
              <span className="text-[12.5px] text-text-2">
                {t("Remember me for 7 days", "আমাকে ৭ দিনের জন্য মনে রাখুন")}
              </span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotSent(false);
                setForgotEmail(email);
                setForgotOpen(true);
              }}
              className="text-[12px] font-medium text-signal transition-colors hover:text-signal-deep hover:underline cursor-pointer"
            >
              {t("Forgot password?", "পাসওয়ার্ড ভুলে গেছেন?")}
            </button>
          </div>

          {/* Primary Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-1.5 flex h-10.5 w-full items-center justify-center rounded-xl border border-signal/20 bg-linear-to-b from-[#0c7855] to-[#07593f] text-[13.5px] font-semibold text-white shadow-[0_3px_12px_rgba(10,110,80,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all duration-200 hover:from-[#0e8861] hover:to-[#096648] hover:shadow-[0_4px_16px_rgba(10,110,80,0.4)] active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <span>{t("Sign in to console", "কনসোলে প্রবেশ করুন")}</span>
            )}
          </button>
        </form>

        {/* Sign up link */}
        <div className="mt-4 text-center text-[12.5px] text-text-3">
          {t("Don't have an account?", "এখনও অ্যাকাউন্ট নেই?")}{" "}
          <Link
            href="/signup"
            className="font-semibold text-signal transition-colors hover:text-signal-deep hover:underline"
          >
            {t("Create account", "অ্যাকাউন্ট তৈরি করুন")}
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-black/8 bg-white p-6 shadow-2xl"
            >
              <button
                onClick={() => setForgotOpen(false)}
                className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-text-3 transition-colors hover:bg-neutral-100 hover:text-text cursor-pointer"
                aria-label="Close"
              >
                <IconClose width={16} height={16} />
              </button>

              {!forgotSent ? (
                <form onSubmit={handleForgotSubmit}>
                  <div className="size-10 rounded-xl bg-signal-wash text-signal grid place-items-center mb-3">
                    <IconShield width={20} height={20} />
                  </div>
                  <h3 className="font-display text-[18px] font-bold text-text">
                    {t("Reset your password", "পাসওয়ার্ড রিসেট করুন")}
                  </h3>
                  <p className="mt-1 text-[13px] text-text-2">
                    {t(
                      "Enter your email address and we'll send you a link to reset your password.",
                      "আপনার ইমেইল অ্যাড্রেস লিখুন। আমরা পাসওয়ার্ড রিসেট করার লিংক পাঠিয়ে দেব।",
                    )}
                  </p>

                  <div className="mt-4">
                    <label className="block text-[12.5px] font-medium text-text">
                      {t("Email address", "ইমেইল")}
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="merchant@shop.com.bd"
                      className="mt-1 h-10 w-full rounded-xl border border-black/10 px-3.5 text-[13.5px] text-text focus:border-signal focus:outline-none focus:ring-3 focus:ring-signal/15"
                    />
                  </div>

                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setForgotOpen(false)}
                      className="flex-1 rounded-xl border border-black/10 py-2.5 text-[13px] font-medium text-text-2 hover:bg-neutral-50 cursor-pointer"
                    >
                      {t("Cancel", "বাতিল")}
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="flex-1 rounded-xl bg-signal py-2.5 text-[13px] font-medium text-white shadow-sm hover:bg-signal-deep cursor-pointer"
                    >
                      {forgotLoading
                        ? t("Sending...", "পাঠানো হচ্ছে...")
                        : t("Send Reset Link", "রিসেট লিংক পাঠান")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-2">
                  <div className="mx-auto size-12 rounded-full bg-emerald-100 text-signal grid place-items-center mb-3">
                    <IconCheck width={22} height={22} />
                  </div>
                  <h3 className="font-display text-[18px] font-bold text-text">
                    {t("Reset link sent!", "রিসেট লিংক পাঠানো হয়েছে!")}
                  </h3>
                  <p className="mt-2 text-[13px] text-text-2">
                    {t(
                      `We have sent password reset instructions to ${forgotEmail}. Please check your inbox.`,
                      `আমরা ${forgotEmail} ঠিকানায় পাসওয়ার্ড রিসেট নির্দেশাবলী পাঠিয়েছি। অনুগ্রহ করে আপনার ইনবক্স চেক করুন।`,
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => setForgotOpen(false)}
                    className="mt-5 w-full rounded-xl bg-signal py-2.5 text-[13.5px] font-medium text-white shadow-sm hover:bg-signal-deep cursor-pointer"
                  >
                    {t("Back to sign in", "লগইনে ফিরে যান")}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

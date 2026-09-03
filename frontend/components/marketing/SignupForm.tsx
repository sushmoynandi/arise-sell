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
} from "@/components/ui/icons";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

export default function SignupForm() {
  const router = useRouter();
  const { t } = useLang();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = [
    t("Too short", "খুব ছোট"),
    t("Weak", "দুর্বল"),
    t("Medium", "মোটামুটি"),
    t("Strong", "শক্তিশালী"),
    t("Very Strong", "খুব শক্তিশালী"),
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError(
        t(
          "Please fill in all the required fields.",
          "অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন।"
        )
      );
      return;
    }

    if (password.length < 6) {
      setError(
        t(
          "Password must be at least 6 characters long.",
          "পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে।"
        )
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        t(
          "Passwords do not match. Please re-check.",
          "পাসওয়ার্ড দুটি মিলছে না। অনুগ্রহ করে চেক করুন।"
        )
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("np_remember_7d", "true");
      localStorage.setItem(
        "np_session_expiry",
        String(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      localStorage.setItem("np_user_email", email);
      setLoading(false);
      router.push("/console");
    }, 900);
  };

  const handleGoogleSignup = () => {
    setGoogleLoading(true);
    setTimeout(() => {
      localStorage.setItem("np_remember_7d", "true");
      localStorage.setItem(
        "np_session_expiry",
        String(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );
      setGoogleLoading(false);
      router.push("/console");
    }, 1000);
  };

  return (
    <div className="relative w-full max-w-100">
      {/* Ambient background soft glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 rounded-4xl bg-linear-to-b from-signal/20 via-signal/5 to-transparent blur-2xl opacity-75"
      />

      {/* Main Glassmorphic Signup Card */}
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
            {t("Create your account", "নতুন অ্যাকাউন্ট তৈরি করুন")}
          </h1>
          <p className="mt-0.5 text-[13px] text-text-2">
            {t(
              "Start 14-day free trial · No credit card required",
              "১৪ দিনের ফ্রি ট্রায়াল শুরু করুন · কোনো ক্রেডিট কার্ড লাগবে না"
            )}
          </p>
        </div>

        {/* Google 1-click Sign up Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="flex h-10 w-full items-center justify-center gap-2.5 rounded-xl border border-black/8 bg-white px-4 text-[13.5px] font-medium text-text shadow-[0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-200 hover:border-black/[0.14] hover:bg-neutral-50/80 hover:shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {googleLoading ? (
              <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-text-3 border-t-signal" />
            ) : (
              <IconGoogle className="size-4.25 shrink-0" />
            )}
            <span>{t("Sign up with Google", "গুগল দিয়ে সহজে শুরু করুন")}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-black/8" />
          <span className="absolute bg-white/95 px-3 text-[11.5px] font-medium text-text-3 backdrop-blur-sm">
            {t("or register with email", "অথবা ইমেইল দিয়ে")}
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

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div>
            <label className="block text-[12.5px] font-medium text-text">
              {t("Email address", "ইমেইল অ্যাড্রেস")} <span className="text-red-500">*</span>
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
                placeholder="merchant@example.com"
                className="h-10 w-full rounded-xl border border-black/9 bg-white/75 pl-9 pr-3 text-[13.5px] text-text placeholder:text-text-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)] transition-all duration-200 focus:border-signal focus:bg-white focus:outline-none focus:ring-3 focus:ring-signal/15"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12.5px] font-medium text-text">
              {t("Password", "পাসওয়ার্ড")} <span className="text-red-500">*</span>
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

            {/* Password strength meter */}
            {password.length > 0 && (
              <div className="mt-1.5">
                <div className="flex h-1.5 w-full gap-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={cx(
                      "h-full transition-all duration-300 rounded-full",
                      strength === 1 && "w-1/4 bg-red-500",
                      strength === 2 && "w-2/4 bg-amber-500",
                      strength === 3 && "w-3/4 bg-blue-500",
                      strength >= 4 && "w-full bg-signal"
                    )}
                  />
                </div>
                <p className="mt-0.5 text-[10.5px] text-text-3">
                  {t("Strength", "পাসওয়ার্ডের মান")}:{" "}
                  <span className="font-semibold text-text">
                    {strengthLabels[strength]}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-[12.5px] font-medium text-text">
                {t("Confirm password", "পাসওয়ার্ড নিশ্চিত করুন")} <span className="text-red-500">*</span>
              </label>
              {confirmPassword && password && (
                <span
                  className={cx(
                    "text-[11px] font-medium",
                    password === confirmPassword ? "text-emerald-600" : "text-red-500"
                  )}
                >
                  {password === confirmPassword
                    ? t("✓ Passwords match", "✓ পাসওয়ার্ড মিলেছে")
                    : t("✕ Passwords do not match", "✕ পাসওয়ার্ড মিলছে না")}
                </span>
              )}
            </div>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-text-3">
                <IconLock width={15} height={15} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="h-10 w-full rounded-xl border border-black/9 bg-white/75 pl-9 pr-9 text-[13.5px] text-text placeholder:text-text-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02),0_1px_0_rgba(255,255,255,0.8)] transition-all duration-200 focus:border-signal focus:bg-white focus:outline-none focus:ring-3 focus:ring-signal/15"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2.5 flex items-center text-text-3 transition-colors hover:text-text cursor-pointer"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <IconEyeOff width={15} height={15} />
                ) : (
                  <IconEye width={15} height={15} />
                )}
              </button>
            </div>
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-0.5">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <div className="relative flex items-center pt-0.5">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="size-4 rounded-[4px] border border-black/[0.2] bg-white shadow-sm transition-all peer-checked:border-signal peer-checked:bg-signal" />
                <IconCheck
                  width={11}
                  height={11}
                  className="pointer-events-none absolute left-[2.5px] top-1 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                />
              </div>
              <span className="text-[11.5px] leading-snug text-text-2">
                {t("I agree to NextProduct's", "আমি NextProduct-এর")}{" "}
                <Link href="/docs" className="text-signal hover:underline">
                  {t("Terms of Service", "শর্তাবলী")}
                </Link>{" "}
                {t("and", "ও")}{" "}
                <Link href="/docs" className="text-signal hover:underline">
                  {t("Privacy Policy", "প্রাইভেসি পলিসি")}
                </Link>
                {t(".", " মেনে নিচ্ছি।")}
              </span>
            </label>
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
              <span>{t("Create Account", "অ্যাকাউন্ট তৈরি করুন")}</span>
            )}
          </button>
        </form>

        {/* Sign in back link */}
        <div className="mt-4 text-center text-[12.5px] text-text-3">
          {t("Already have an account?", "আগে থেকেই অ্যাকাউন্ট আছে?")}{" "}
          <Link
            href="/login"
            className="font-semibold text-signal transition-colors hover:text-[color:var(--signal-deep)] hover:underline"
          >
            {t("Sign in", "লগইন করুন")}
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/ui/primitives";
import { useAuth } from "@/lib/auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const {
    adminLogin,
    adminVerify2FA,
    user,
    loading: authLoading,
    isAuthenticated,
  } = useAuth();

  // If already authenticated as superadmin, redirect to /admin immediately
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.is_superadmin) {
      window.location.replace("/admin");
    }
  }, [authLoading, isAuthenticated, user]);

  // Step 1: Email & Password; Step 2: 2FA TOTP; Step 3: Verified Redirect
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA 6-digit state
  const [totp, setTotp] = useState(["", "", "", "", "", ""]);
  const totpInputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 2) {
      setTimeout(() => totpInputs.current[0]?.focus(), 150);
    }
  }, [step]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your administrator email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(email.trim(), password);
      if (res.success) {
        if (res.requires_2fa) {
          setStep(2);
        } else {
          setStep(3);
          setTimeout(() => {
            window.location.replace("/admin");
          }, 300);
        }
      } else {
        const nextAttempt = attempts + 1;
        setAttempts(nextAttempt);
        setError(
          res.error || `Invalid credentials. Attempt ${nextAttempt} of 5.`,
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleTotpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newTotp = [...totp];
    newTotp[index] = digit;
    setTotp(newTotp);

    if (digit && index < 5) {
      totpInputs.current[index + 1]?.focus();
    }

    if (newTotp.every((d) => d !== "") && index === 5) {
      verify2FA(newTotp.join(""));
    }
  };

  const handleTotpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !totp[index] && index > 0) {
      totpInputs.current[index - 1]?.focus();
    }
  };

  const verify2FA = async (codeString: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await adminVerify2FA(email.trim(), codeString);
      if (res.success) {
        setStep(3);
        setTimeout(() => {
          window.location.replace("/admin");
        }, 300);
      } else {
        const nextAttempt = attempts + 1;
        setAttempts(nextAttempt);
        setError(res.error || "Invalid 2FA code.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "2FA verification failed");
    } finally {
      setLoading(false);
    }
  };

  const fillPrimaryCreds = () => {
    setEmail("admin@arisesell.com");
    setPassword("MasterAdmin@2026!");
    setError(null);
  };

  const fillDemoCreds = () => {
    setEmail("admin@arisesell.com");
    setPassword("MasterAdmin@2026");
    setError(null);
  };

  const fillDemo2FA = () => {
    setTotp(["1", "2", "3", "4", "5", "6"]);
    verify2FA("123456");
  };

  return (
    <div className="min-h-screen bg-canvas text-text flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Spacer */}
      <div />

      {/* Main Center Auth Card */}
      <div className="w-full max-w-100 mx-auto my-auto py-4">
        <div className="rounded-2xl border border-line bg-white p-7 sm:p-8 shadow-xl shadow-black/3 space-y-6">
          {/* Brand Logo & Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center pb-1">
              <Link
                href="/"
                className="inline-block transition-transform hover:opacity-90 active:scale-95"
              >
                <Wordmark />
              </Link>
            </div>

            <h1 className="text-xl font-bold text-text tracking-tight font-display">
              {step === 2 ? "Two-Factor Authentication" : "Admin Sign In"}
            </h1>
            <p className="text-[12.5px] text-text-3">
              {step === 1
                ? "Sign in to access platform controls"
                : step === 2
                  ? "Enter the 6-digit code from your Authenticator app"
                  : "Authentication verified. Redirecting..."}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-[12.5px] text-rose-700 font-medium animate-in fade-in flex items-center gap-2">
              <span className="shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Email & Password */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <label className="text-[12px] font-semibold text-text block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-3">
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
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@arisesell.com"
                    className="w-full rounded-xl border border-line bg-canvas/40 pl-9.5 pr-3.5 py-2.5 text-[13px] text-text placeholder:text-text-3/60 focus:bg-white focus:border-signal focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-semibold text-text block mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-text-3">
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
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-line bg-canvas/40 pl-9.5 pr-10 py-2.5 text-[13px] text-text placeholder:text-text-3/60 focus:bg-white focus:border-signal focus:ring-2 focus:ring-signal/15 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-text-3 hover:text-text cursor-pointer transition-colors"
                  >
                    {showPassword ? (
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
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
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
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Attempts Counter & Admin Quick Auto-Fills */}
              <div className="flex flex-col gap-1.5 pt-0.5">
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="font-mono text-text-3">
                    Attempts:{" "}
                    <strong
                      className={
                        attempts > 0 ? "text-amber-600 font-bold" : "text-text"
                      }
                    >
                      {attempts}
                    </strong>{" "}
                    / 5
                  </span>
                  <span className="text-[11px] text-text-3">
                    2FA Code: <strong className="text-signal font-mono">123456</strong>
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-line/60 text-[11px]">
                  <button
                    type="button"
                    onClick={fillPrimaryCreds}
                    className="text-signal hover:underline font-semibold cursor-pointer"
                  >
                    ⚡ Auto-fill Primary Admin
                  </button>

                  <button
                    type="button"
                    onClick={fillDemoCreds}
                    className="text-text-3 hover:text-text hover:underline font-medium cursor-pointer"
                  >
                    Auto-fill Demo Admin
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || attempts >= 5}
                className="w-full rounded-xl bg-signal py-2.5 text-[13.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to 2FA</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Two-Factor Authentication (2FA TOTP) */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="flex justify-center gap-2">
                {totp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      totpInputs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleTotpChange(i, e.target.value)}
                    onKeyDown={(e) => handleTotpKeyDown(i, e)}
                    className="size-11 rounded-xl border border-line bg-canvas/40 text-center text-lg font-bold font-mono text-text focus:bg-white focus:border-signal focus:ring-2 focus:ring-signal/20 focus:outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-[11.5px]">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-text-3 hover:text-text transition-colors cursor-pointer"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={fillDemo2FA}
                  className="font-semibold text-signal hover:underline cursor-pointer"
                >
                  Auto-fill 2FA (123456)
                </button>
              </div>

              <button
                type="button"
                onClick={() => verify2FA(totp.join(""))}
                disabled={loading || totp.some((d) => d === "")}
                className="w-full rounded-xl bg-signal py-2.5 text-[13.5px] font-bold text-white shadow-xs hover:bg-signal-deep active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="size-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    <span>Authorizing...</span>
                  </>
                ) : (
                  <span>Verify & Sign In</span>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Authenticated Handshake */}
          {step === 3 && (
            <div className="text-center py-6 space-y-2 animate-in zoom-in-95">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-signal/15 text-signal border border-signal/30 text-lg font-bold">
                ✓
              </div>
              <p className="text-[14px] font-bold text-text">
                Session Authorized
              </p>
              <p className="text-[11.5px] text-text-3 font-mono">
                Redirecting to /admin...
              </p>
              <div className="pt-2">
                <a
                  href="/admin"
                  className="text-xs font-semibold text-signal hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Enter Admin Control Center →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Link to Merchant Portal */}
        <div className="text-center mt-4">
          <Link
            href="/login"
            className="text-[12px] text-text-3 hover:text-text transition-colors"
          >
            Are you a merchant?{" "}
            <span className="text-signal font-semibold hover:underline">
              Go to Console Login
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

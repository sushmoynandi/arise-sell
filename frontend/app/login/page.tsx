import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "@/components/marketing/LoginForm";
import { IconShield, IconCheck } from "@/components/ui/icons";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Sign In · ${BRAND.nameFull}`,
  description:
    "Sign in to your merchant dashboard to monitor sales, AI threads, and orders.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-canvas selection:bg-signal-wash selection:text-signal flex flex-col justify-between overflow-x-hidden">
      {/* Background ambient lighting effects */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 h-[560px] w-225 -translate-x-1/2 rounded-full opacity-60 blur-[140px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(10,110,80,0.18), rgba(5,98,68,0.06) 60%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed -bottom-32 right-1/4 h-[400px] w-[600px] rounded-full opacity-40 blur-[130px]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(10,110,80,0.12), transparent)",
        }}
      />

      {/* Center login container */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-6 sm:py-8">
        <div className="w-full max-w-100 mb-3 flex items-center justify-start">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white/80 px-3 py-1 text-[12px] font-medium text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all hover:border-black/15 hover:bg-white hover:text-text hover:shadow-xs"
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
              className="transition-transform group-hover:-translate-x-0.5"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
        <LoginForm />
      </main>

      {/* Bottom security trust markers */}
      <footer className="relative z-10 mx-auto w-full max-w-7xl px-5 py-3 text-center sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-[12.5px] text-text-3">
          <span className="inline-flex items-center gap-1.5">
            <IconShield width={13} height={13} className="text-signal" />
            256-bit SSL Bank-Grade Encryption
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconCheck width={13} height={13} className="text-signal" />
            Verified Meta Tech Partner
          </span>
          <span>
            © {new Date().getFullYear()} {BRAND.nameFull}
          </span>
        </div>
      </footer>
    </div>
  );
}

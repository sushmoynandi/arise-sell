import type { Metadata } from "next";
import Link from "next/link";
import SignupForm from "@/components/marketing/SignupForm";
import LanguageToggle from "@/components/marketing/LanguageToggle";
import { IconShield, IconCheck, IconBolt } from "@/components/ui/icons";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: `Create Account · ${BRAND.nameFull}`,
  description:
    "Start your 14-day free trial. Setup your 24/7 AI sales assistant in 2 minutes.",
};

export default function SignupPage() {
  return (
    <div className="relative min-h-screen bg-canvas selection:bg-signal-wash selection:text-signal flex flex-col justify-between overflow-x-hidden">
      {/* Background ambient lighting effects */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-60 blur-[140px]"
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

      {/* Top minimal header */}
      <header className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="group inline-flex items-center rounded-full border border-black/[0.06] bg-white/70 px-3.5 py-1 text-[12.5px] font-medium text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md transition-all hover:border-black/[0.12] hover:bg-white hover:text-text hover:shadow-sm"
        >
          Back to Home
        </Link>

        <div className="flex items-center gap-3">
          <LanguageToggle size="sm" />
        </div>
      </header>

      {/* Center signup container */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-3 sm:py-5">
        <SignupForm />
      </main>

      {/* Bottom security trust markers */}
      <footer className="relative z-10 mx-auto w-full max-w-[1280px] px-5 py-3 text-center sm:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 text-[12.5px] text-text-3">
          <span className="inline-flex items-center gap-1.5">
            <IconBolt width={13} height={13} className="text-signal" />
            Instant 2-minute activation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconShield width={13} height={13} className="text-signal" />
            256-bit Bank-Grade SSL Encryption
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

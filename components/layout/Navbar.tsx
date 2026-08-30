"use client";

import { useState } from "react";
import Link from "next/link";
import { PRODUCT_NAME } from "@/lib/constants";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "BN">("EN");

  const navLinks = [
    { label: lang === "EN" ? "Home" : "হোম", href: "/" },
    { label: lang === "EN" ? "Features" : "ফিচার্স", href: "#features" },
    { label: lang === "EN" ? "Pricing" : "প্রাইসিং", href: "#pricing" },
    { label: lang === "EN" ? "Integrations" : "ইন্টিগ্রেশন", href: "#integrations" },
    { label: lang === "EN" ? "AI Dashboard" : "ড্যাশবোর্ড", href: "/dashboard" },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 transition-all duration-300 border-b border-slate-200/80 bg-[#f0f4f8]/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center shadow-md shadow-sky-500/30 text-white font-black text-xl">
            ⚡
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            {PRODUCT_NAME}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative py-2 text-sm font-medium text-slate-600 transition-colors hover:text-sky-600"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Action Controls */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={() => setLang(lang === "EN" ? "BN" : "EN")}
            className="group relative flex items-center rounded-full border border-slate-300 bg-white p-0.5 text-xs font-semibold shadow-sm transition-all hover:border-sky-500 cursor-pointer"
          >
            <span className="relative flex items-center rounded-full">
              <span
                className={`absolute top-0 h-full rounded-full bg-sky-500 shadow-sm transition-all duration-300 ${
                  lang === "EN" ? "left-0 w-1/2" : "left-1/2 w-1/2"
                }`}
              ></span>
              <span
                className={`relative z-10 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                  lang === "EN" ? "text-white" : "text-slate-500"
                }`}
              >
                🇬🇧 EN
              </span>
              <span
                className={`relative z-10 flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold transition-colors ${
                  lang === "BN" ? "text-white" : "text-slate-500"
                }`}
              >
                🇧🇩 বাংলা
              </span>
            </span>
          </button>

          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-800 transition-all hover:border-sky-500 hover:bg-white"
          >
            {lang === "EN" ? "Sign In" : "লগইন"}
          </Link>
          <Link
            href="#pricing"
            className="rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2 text-sm shadow-md shadow-sky-500/25 transition-all"
          >
            {lang === "EN" ? "Get Started Free" : "ফ্রি শুরু করুন"}
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-slate-700 hover:text-slate-900"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#f0f4f8] border-b border-slate-200 px-4 pt-2 pb-5 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm font-medium text-slate-700 hover:text-sky-600"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2">
            <Link
              href="/dashboard"
              className="text-center rounded-lg border border-slate-300 bg-white py-2 text-sm font-semibold text-slate-800"
            >
              Sign In
            </Link>
            <Link
              href="#pricing"
              className="text-center rounded-lg bg-sky-500 hover:bg-sky-600 py-2 text-sm font-bold text-white shadow"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

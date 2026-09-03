"use client";

import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/components/ui/primitives";
import {
  IconCheck,
  IconShield,
  IconWhatsApp,
  IconFacebook,
  IconInstagram,
  IconLinkedIn,
  IconYouTube,
  IconGlobe,
} from "@/components/ui/icons";
import { useLang } from "@/lib/i18n";

const SOCIAL_LINKS = [
  {
    name: "WhatsApp",
    href: "https://wa.me/8801710000000",
    icon: IconWhatsApp,
    hoverClass:
      "hover:text-[#25D366] hover:border-[#25D366]/40 hover:bg-[#25D366]/[0.06]",
  },
  {
    name: "Facebook",
    href: "https://facebook.com",
    icon: IconFacebook,
    hoverClass:
      "hover:text-[#1877F2] hover:border-[#1877F2]/40 hover:bg-[#1877F2]/[0.08]",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    icon: IconInstagram,
    hoverClass:
      "hover:text-[#E4405F] hover:border-[#E4405F]/40 hover:bg-[#E4405F]/[0.08]",
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com",
    icon: IconLinkedIn,
    hoverClass:
      "hover:text-[#0A66C2] hover:border-[#0A66C2]/40 hover:bg-[#0A66C2]/[0.08]",
  },
  {
    name: "YouTube",
    href: "https://youtube.com",
    icon: IconYouTube,
    hoverClass:
      "hover:text-[#FF0000] hover:border-[#FF0000]/40 hover:bg-[#FF0000]/[0.08]",
  },
];

const RESOURCE_LINKS = [
  {
    labelEn: "Documentation & API",
    labelBn: "ডকুমেন্টেশন ও এপিআই",
    href: "/docs",
  },
  { labelEn: "Privacy Policy", labelBn: "প্রাইভেসি পলিসি", href: "/docs" },
  { labelEn: "Terms of Service", labelBn: "শর্তাবলী", href: "/docs" },
  { labelEn: "Contact Us", labelBn: "যোগাযোগ", href: "/contact" },
];

export default function SiteFooter() {
  const { t } = useLang();

  return (
    <footer className="relative overflow-hidden border-t border-black/7 bg-linear-to-b from-white via-[#f6faf8] to-[#edf5f1]">
      {/* Soft Ambient Theme Lighting Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-64 w-187.5 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(10,110,80,0.12), rgba(10,110,80,0.02) 60%, transparent)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-20 right-1/4 h-48 w-80 rounded-full opacity-40 blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(10,110,80,0.10), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 pt-12 pb-8 lg:px-8">
        {/* 3-Column Balanced Grid */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.5fr_1fr_1.3fr] lg:gap-14 items-start">
          {/* Column 1: Brand & Status */}
          <div className="space-y-3.5">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <Wordmark />
            </Link>

            <p className="max-w-sm text-[13.5px] leading-relaxed text-text-2">
              {t(
                "Autonomous 24/7 AI Sales Assistant for Bangladeshi eCommerce on WhatsApp, Messenger & Instagram.",
                "হোয়াটসঅ্যাপ, মেসেঞ্জার ও ইনস্টাগ্রামের শপগুলোর জন্য সার্বক্ষণিক নির্ভরযোগ্য এআই বিক্রয়কর্মী।",
              )}
            </p>

            <div className="pt-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/8 bg-white/80 px-3.5 py-1 text-[12.5px] font-medium text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.02)] backdrop-blur-sm">
                <IconGlobe width={13} height={13} className="text-signal" />
                {t(
                  "Banani, Dhaka 1213, Bangladesh",
                  "বনানী, ঢাকা ১২১৩, বাংলাদেশ",
                )}
              </span>
            </div>
          </div>

          {/* Column 2: Resources & Legal */}
          <div className="space-y-3 pt-0.5 md:pl-8 lg:pl-11">
            <h4 className="text-[12.5px] font-bold uppercase tracking-wider text-text">
              {t("Resources & Legal", "রিসোর্স ও পলিসি")}
            </h4>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.labelEn}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-text-2 transition-colors hover:text-signal hover:underline"
                  >
                    {t(link.labelEn, link.labelBn)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Connect With Us */}
          <div className="space-y-3.5 pt-0.5">
            <h4 className="text-[12.5px] font-bold uppercase tracking-wider text-text">
              {t("Connect With Us", "আমাদের সাথে যুক্ত থাকুন")}
            </h4>

            {/* Social Circle Icons */}
            <div className="flex items-center gap-2.5">
              {SOCIAL_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.name}
                    className={`grid size-9 place-items-center rounded-full border border-black/8 bg-white/90 text-text-2 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-sm transition-all duration-150 hover:border-signal/40 hover:-translate-y-0.5 active:scale-95 cursor-pointer ${s.hoverClass}`}
                  >
                    <Icon width={16} height={16} />
                  </a>
                );
              })}
            </div>

            {/* Compact Verified Meta Partner Pill */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-signal/20 bg-white/95 px-4 py-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)] backdrop-blur-md">
              <span className="grid size-4.5 place-items-center rounded-full bg-signal text-white shadow-sm">
                <IconCheck width={10} height={10} />
              </span>
              <span className="text-[12px] font-semibold text-text">
                {t("Verified Meta Tech Partner", "ভেরিফাইড মেটা টেক পার্টনার")}
              </span>
              <span className="text-black/15">·</span>
              <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-text-3">
                <IconShield width={11} height={11} className="text-signal" />
                256-bit SSL
              </span>
            </div>
          </div>
        </div>

        {/* Fine Clean Divider */}
        <div className="my-8 border-t border-black/6" />

        {/* Bottom Centered Copyright */}
        <div className="text-center text-[12.5px] text-text-3">
          <p>
            © {new Date().getFullYear()} {BRAND.nameFull}.{" "}
            {t("All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।")}
          </p>
        </div>
      </div>
    </footer>
  );
}

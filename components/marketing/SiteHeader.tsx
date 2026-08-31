"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Wordmark } from "@/components/ui/primitives";
import { IconArrow, IconClose, IconMenu, IconWhatsApp } from "@/components/ui/icons";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import LanguageToggle from "./LanguageToggle";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

const NAV = [
  { en: "Features", bn: "ফিচার", href: "/platform" },
  { en: "Pricing", bn: "দাম", href: "/pricing" },
  { en: "About us", bn: "আমরা", href: "/story" },
  { en: "Developers", bn: "ডেভেলপার", href: "/docs" },
];

const PHONE = "017 1000 0000";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...SPRING_SOFT, delay: 0.1 }}
        className={cx(
          "fixed inset-x-0 top-0 z-50 bg-white transition-shadow duration-300",
          lifted
            ? "border-b border-line shadow-[0_1px_2px_rgba(15,20,25,0.05)]"
            : "border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-[68px] max-w-[1180px] items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" aria-label="NextProduct home" className="shrink-0">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV.map((l) => {
              const active = pathname === l.href;
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={cx(
                      "rounded-xl px-3.5 py-2 text-[14px] transition-colors",
                      t("", "font-[family-name:var(--font-hind)]"),
                      active
                        ? "bg-[#f2faf6] text-signal"
                        : "text-text-2 hover:bg-surface-2 hover:text-text"
                    )}
                  >
                    {t(l.en, l.bn)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageToggle size="sm" />
            <a
              href="tel:+8801710000000"
              className="flex items-center gap-1.5 text-[13.5px] text-text-2 transition-colors hover:text-signal"
            >
              <IconWhatsApp width={15} height={15} />
              {PHONE}
            </a>
            <span className="h-5 w-px bg-line" />
            <Link
              href="/console"
              className="text-[13.5px] text-text-2 transition-colors hover:text-text"
            >
              {t("Sign in", "লগইন")}
            </Link>
            <Button href="/console" size="md" className="group">
              {t("Start free", "ফ্রি শুরু করুন")}
              <IconArrow
                width={14}
                height={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle size="sm" />
            <button
              onClick={() => setOpen(true)}
              className="grid size-10 place-items-center rounded-xl text-text-2 hover:bg-surface-2"
              aria-label={t("Open menu", "মেনু খুলুন")}
            >
              <IconMenu width={20} height={20} />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-white lg:hidden"
          >
            <div className="flex h-[68px] items-center justify-between px-5">
              <Wordmark />
              <button
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-xl text-text-2 hover:bg-surface-2"
                aria-label={t("Close menu", "মেনু বন্ধ করুন")}
              >
                <IconClose width={20} height={20} />
              </button>
            </div>

            <div className="px-5 pb-2 pt-1">
              <LanguageToggle />
            </div>

            <motion.ul
              className="px-5 pt-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
            >
              {[...NAV, { en: "Sign in", bn: "লগইন", href: "/console" }].map((l) => (
                <motion.li
                  key={l.href}
                  variants={{
                    hidden: { opacity: 0, x: -18 },
                    show: { opacity: 1, x: 0, transition: SPRING },
                  }}
                  className="border-b border-line-soft"
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4"
                  >
                    <span
                      className={cx(
                        "font-display text-[22px] tracking-tight text-text",
                        t("", "font-[family-name:var(--font-hind)]")
                      )}
                    >
                      {t(l.en, l.bn)}
                    </span>
                    <IconArrow width={18} height={18} className="text-text-3" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            <div className="space-y-3 px-5 pt-7">
              <Button href="/console" size="lg" className="w-full">
                {t("Start free — 40 orders", "ফ্রি শুরু করুন — ৪০ অর্ডার")}
              </Button>
              <a
                href="tel:+8801710000000"
                className="flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-[14px] text-text-2"
              >
                <IconWhatsApp width={16} height={16} className="text-signal" />
                {PHONE}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

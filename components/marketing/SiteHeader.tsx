"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Wordmark } from "@/components/ui/primitives";
import { IconArrow, IconClose, IconMenu } from "@/components/ui/icons";
import { SPRING } from "@/components/motion";
import LanguageToggle from "./LanguageToggle";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

type NavItem = {
  en: string;
  bn: string;
  href: string;
  external?: boolean;
};

const NAV: NavItem[] = [
  { en: "Home", bn: "হোম", href: "/" },
  { en: "Features", bn: "ফিচার", href: "/#features" },
  { en: "How It Works", bn: "কীভাবে কাজ করে", href: "/#how-it-works" },
  { en: "Story", bn: "আমাদের গল্প", href: "/#story" },
  { en: "Pricing", bn: "দাম", href: "/#pricing" },
  { en: "Contact", bn: "যোগাযোগ", href: "/contact" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const pathname = usePathname();
  const { t } = useLang();
  const [activeHref, setActiveHref] = useState<string>(() =>
    pathname === "/contact" ? "/contact" : "/",
  );
  const isManualScrollRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href === "/contact") {
      setActiveHref("/contact");
      return;
    }

    if (pathname === "/" || pathname === "") {
      e.preventDefault();
      isManualScrollRef.current = true;
      setActiveHref(href);

      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

      if (href === "/") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (window.location.hash) {
          window.history.pushState(null, "", "/");
        }
      } else {
        const id = href.replace("/#", "").replace("#", "");
        const target = document.getElementById(id);
        if (target) {
          const targetY =
            target.getBoundingClientRect().top + window.pageYOffset - 72;
          window.scrollTo({ top: targetY, behavior: "smooth" });
          window.history.pushState(null, "", href);
        }
      }

      scrollTimerRef.current = setTimeout(() => {
        isManualScrollRef.current = false;
      }, 1600);
    }
  };

  useEffect(() => {
    if (pathname === "/contact") {
      const onScroll = () => setLifted(window.scrollY > 10);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }

    const sections = [
      { id: "pricing", href: "/#pricing" },
      { id: "story", href: "/#story" },
      { id: "how-it-works", href: "/#how-it-works" },
      { id: "features", href: "/#features" },
    ];

    const onScroll = () => {
      setLifted(window.scrollY > 10);

      if (isManualScrollRef.current) {
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          isManualScrollRef.current = false;
        }, 180);
        return;
      }

      if (window.scrollY < 260) {
        setActiveHref("/");
        return;
      }

      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100
      ) {
        setActiveHref("/#pricing");
        return;
      }

      const triggerY = 200;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY && rect.bottom >= triggerY) {
            setActiveHref(s.href);
            return;
          }
        }
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out",
          "backdrop-blur-2xl backdrop-saturate-[180%]",
          lifted
            ? "bg-white/65 border-b border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]"
            : "bg-white/45 border-b border-black/[0.03] shadow-[0_2px_12px_rgba(0,0,0,0.01)]",
        )}
      >
        {/* Specular Liquid Glass Top Glow Line */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-90"
        />

        <nav className="mx-auto flex h-[68px] lg:h-[70px] max-w-[1280px] items-center justify-between gap-4 px-5 lg:px-8">
          <Link
            href="/"
            aria-label="NextProduct home"
            onClick={(e) => handleNavClick(e, "/")}
            className="shrink-0 p-0 m-0 leading-none transition-transform active:scale-[0.98]"
          >
            <Wordmark />
          </Link>

          {/* Right aligned nav items and action buttons */}
          <div className="hidden items-center gap-4 lg:flex">
            {/* Apple-style Liquid Glass Nav Capsule */}
            <div className="relative rounded-full border border-black/[0.06] bg-black/[0.03] p-1 shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),0_1px_1px_rgba(255,255,255,0.7)] backdrop-blur-xl">
              <ul className="flex items-center gap-0.5">
                {NAV.map((l) => {
                  const active = activeHref === l.href;

                  return (
                    <li key={l.href} className="relative">
                      {active && (
                        <motion.div
                          layoutId="liquid-glass-pill"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                          className="absolute inset-0 rounded-full border border-black/[0.06] bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.9)]"
                        />
                      )}
                      {l.external ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cx(
                            "relative z-10 block rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
                            t("", "font-[family-name:var(--font-hind)]"),
                            active
                              ? "text-signal font-semibold"
                              : "text-text-2 hover:text-text",
                          )}
                        >
                          {t(l.en, l.bn)}
                        </a>
                      ) : (
                        <Link
                          href={l.href}
                          onClick={(e) => handleNavClick(e, l.href)}
                          className={cx(
                            "relative z-10 block rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150",
                            t("", "font-[family-name:var(--font-hind)]"),
                            active
                              ? "text-signal font-semibold"
                              : "text-text-2 hover:text-text",
                          )}
                        >
                          {t(l.en, l.bn)}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <span className="h-4 w-px bg-black/[0.08]" />

            <div className="flex items-center gap-2.5">
              <LanguageToggle size="sm" />
              <Button
                href="/login"
                size="sm"
                className="relative overflow-hidden rounded-full border border-signal/20 bg-gradient-to-b from-[#0c7855] to-[#07593f] px-4 py-1.5 text-[12.5px] font-semibold text-white shadow-[0_2px_8px_rgba(10,110,80,0.3),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-[#0e8861] hover:to-[#096648] hover:shadow-[0_4px_12px_rgba(10,110,80,0.4)] active:scale-[0.98]"
              >
                {t("Sign in", "লগইন")}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageToggle size="sm" />
            <button
              onClick={() => setOpen(true)}
              className="grid size-9 place-items-center rounded-full border border-black/[0.06] bg-black/[0.03] text-text-2 transition-colors hover:bg-black/[0.06] hover:text-text"
              aria-label={t("Open menu", "মেনু খুলুন")}
            >
              <IconMenu width={18} height={18} />
            </button>
          </div>
        </nav>
      </header>

      {/* Apple-style Frosted Glass Mobile Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(28px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex flex-col bg-white/80 backdrop-blur-3xl backdrop-saturate-[200%] lg:hidden"
          >
            <div className="flex h-[68px] items-center justify-between border-b border-black/[0.06] px-5">
              <Wordmark />
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-full border border-black/[0.06] bg-black/[0.03] text-text-2 hover:bg-black/[0.06] hover:text-text"
                aria-label={t("Close menu", "মেনু বন্ধ করুন")}
              >
                <IconClose width={18} height={18} />
              </button>
            </div>

            <div className="px-5 pb-2 pt-3">
              <LanguageToggle />
            </div>

            <motion.ul
              className="flex-1 overflow-y-auto px-5 pt-3"
              initial="hidden"
              animate="show"
              variants={{
                show: {
                  transition: { staggerChildren: 0.05, delayChildren: 0.05 },
                },
              }}
            >
              {NAV.map((l) => {
                const active = activeHref === l.href;
                return (
                  <motion.li
                    key={l.href}
                    variants={{
                      hidden: { opacity: 0, x: -16 },
                      show: { opacity: 1, x: 0, transition: SPRING },
                    }}
                    className="border-b border-black/[0.04]"
                  >
                    {l.external ? (
                      <a
                        href={l.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setOpen(false)}
                        className={cx(
                          "flex items-center justify-between py-4 transition-colors",
                          active
                            ? "text-signal font-semibold"
                            : "text-text hover:text-signal",
                        )}
                      >
                        <span
                          className={cx(
                            "font-display text-[20px] tracking-tight",
                            t("", "font-[family-name:var(--font-hind)]"),
                          )}
                        >
                          {t(l.en, l.bn)}
                        </span>
                        <IconArrow
                          width={18}
                          height={18}
                          className="text-text-3"
                        />
                      </a>
                    ) : (
                      <Link
                        href={l.href}
                        onClick={(e) => {
                          handleNavClick(e, l.href);
                          setOpen(false);
                        }}
                        className={cx(
                          "flex items-center justify-between py-4 transition-colors",
                          active
                            ? "text-signal font-semibold"
                            : "text-text hover:text-signal",
                        )}
                      >
                        <span
                          className={cx(
                            "font-display text-[20px] tracking-tight",
                            t("", "font-[family-name:var(--font-hind)]"),
                          )}
                        >
                          {t(l.en, l.bn)}
                        </span>
                        <IconArrow
                          width={18}
                          height={18}
                          className={active ? "text-signal" : "text-text-3"}
                        />
                      </Link>
                    )}
                  </motion.li>
                );
              })}
            </motion.ul>

            <div className="border-t border-black/[0.06] p-5">
              <Button
                href="/login"
                size="lg"
                onClick={() => setOpen(false)}
                className="w-full justify-center rounded-2xl bg-gradient-to-b from-[#0c7855] to-[#07593f] py-4 text-[16px] text-white shadow-[0_2px_8px_rgba(10,110,80,0.35)]"
              >
                {t("Sign in to console", "কনসোলে লগইন করুন")}
                <IconArrow width={16} height={16} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

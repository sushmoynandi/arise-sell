"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SITE_NAV } from "@/lib/brand";
import { Button, Wordmark } from "@/components/ui/primitives";
import { IconArrow, IconClose, IconMenu } from "@/components/ui/icons";
import { SPRING, SPRING_SOFT } from "@/components/motion";
import { cx } from "@/lib/format";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);

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
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          lifted ? "glass border-b border-line/80" : "border-b border-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-6 px-5 lg:px-8">
          <Link href="/" aria-label="NextProduct home" className="shrink-0">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {SITE_NAV.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-[13.5px] text-text-2 transition-colors hover:bg-surface-2 hover:text-text"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/console"
              className="rounded-lg px-3 py-2 text-[13.5px] text-text-2 transition-colors hover:text-text"
            >
              Sign in
            </Link>
            <Button href="/console" size="sm" className="group">
              Open console
              <IconArrow
                width={14}
                height={14}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Button>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-surface-2 md:hidden"
            aria-label="Open menu"
          >
            <IconMenu width={20} height={20} />
          </button>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-canvas md:hidden"
          >
            <div className="flex h-16 items-center justify-between px-5">
              <Wordmark />
              <button
                onClick={() => setOpen(false)}
                className="grid size-9 place-items-center rounded-lg text-text-2 hover:bg-surface-2"
                aria-label="Close menu"
              >
                <IconClose width={20} height={20} />
              </button>
            </div>
            <motion.ul
              className="px-5 pt-6"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } }}
            >
              {[...SITE_NAV, { label: "Sign in", href: "/console" }].map((l) => (
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
                    className="flex items-center justify-between py-4 font-display text-2xl tracking-tight text-text"
                  >
                    {l.label}
                    <IconArrow width={18} height={18} className="text-text-3" />
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
            <div className="px-5 pt-8">
              <Button href="/console" size="lg" className="w-full">
                Open console
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

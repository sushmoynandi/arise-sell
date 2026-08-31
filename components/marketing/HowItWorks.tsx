"use client";

import { motion } from "framer-motion";
import { STEPS } from "@/data/marketing";
import { Reveal, Stagger, StaggerItem, SPRING } from "@/components/motion";
import { Button } from "@/components/ui/primitives";
import { IconArrow } from "@/components/ui/icons";
import { useLang } from "@/lib/i18n";

export default function HowItWorks() {
  const { t } = useLang();
  return (
    <section className="relative border-t border-line py-20 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-[family-name:var(--font-hind)] text-[15px] font-medium text-signal">
              তিন ধাপে শুরু
            </p>
            <h2 className="mt-3 text-balance font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              {t("Live before your tea gets cold.", "চা ঠান্ডা হওয়ার আগেই চালু।")}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-text-2">
              {t(
                "No developer, no installation, no training course. If you can post on Facebook, you can set this up.",
                "ডেভেলপার লাগবে না, ইনস্টল করতে হবে না, ট্রেনিংও লাগবে না। ফেসবুকে পোস্ট দিতে পারলেই এটা সেট করতে পারবেন।"
              )}
            </p>
          </div>
        </Reveal>

        <Stagger className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* connector line on desktop */}
          <div
            aria-hidden
            className="absolute left-0 right-0 top-7 hidden h-px bg-line md:block"
          />
          {STEPS.map((s) => (
            <StaggerItem key={s.title}>
              <div className="relative text-center md:text-left">
                <motion.span
                  whileHover={{ scale: 1.08, rotate: -4 }}
                  transition={SPRING}
                  className="relative z-10 mx-auto grid size-14 place-items-center rounded-2xl bg-signal font-[family-name:var(--font-hind)] text-[22px] font-bold text-white shadow-[0_6px_18px_-6px_rgba(10,110,80,0.5)] md:mx-0"
                >
                  {s.n}
                </motion.span>
                <h3 className="mt-5 font-display text-[19px] font-semibold tracking-tight text-text">
                  {t(s.title, s.titleBn)}
                </h3>
                {t(
                  <p className="mt-1 font-[family-name:var(--font-hind)] text-[14px] text-text-3">
                    {s.titleBn}
                  </p>,
                  null
                )}
                <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed text-text-2 md:mx-0">
                  {t(s.body, s.bodyBn)}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.15} className="mt-12 flex justify-center">
          <Button href="/console" size="lg" className="group">
            {t("Set up my shop", "আমার দোকান সেট করুন")}
            <IconArrow
              width={16}
              height={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

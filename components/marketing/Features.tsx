"use client";

import { motion } from "framer-motion";
import { FEATURES } from "@/data/marketing";
import { FEATURE_ICON, TINTS } from "./featureVisuals";
import { Reveal, Stagger, StaggerItem, SPRING } from "@/components/motion";
import { useLang } from "@/lib/i18n";

export default function Features() {
  const { t } = useLang();
  return (
    <section
      id="features"
      className="relative border-t border-line py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-(family-name:--font-hind) text-[15px] font-medium text-signal">
              {t("যা যা করে দেয়", "যা যা করে দেয়")}
            </p>
            <h2 className="mt-3 text-balance font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              {t(
                "Everything a good salesperson does — without the salary.",
                "একজন ভালো বিক্রয়কর্মী যা করে, সবই — বেতন ছাড়া।",
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-text-2">
              {t(
                "Not a chatbot that answers FAQs. A full-time seller that takes the order, ships the parcel and keeps your customers coming back.",
                "শুধু প্রশ্নের উত্তর দেওয়ার বট নয়। একজন পুরো সময়ের বিক্রয়কর্মী — যে অর্ডার নেয়, পার্সেল পাঠায়, আর কাস্টমারকে ফিরিয়ে আনে।",
              )}
            </p>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => {
            const Icon = FEATURE_ICON[f.icon as keyof typeof FEATURE_ICON];
            const tint = TINTS[f.tint];
            return (
              <StaggerItem key={f.title}>
                <motion.article
                  whileHover={{ y: -5 }}
                  transition={SPRING}
                  className="group h-full rounded-2xl border border-line bg-white p-6 shadow-[0_1px_2px_rgba(15,20,25,0.04)] transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(15,20,25,0.05),0_16px_36px_-16px_rgba(15,20,25,0.18)]"
                >
                  <span
                    className={`grid size-12 place-items-center rounded-2xl ring-1 ${tint.bg} ${tint.fg} ${tint.ring}`}
                  >
                    <Icon />
                  </span>
                  <h3 className="mt-5 font-display text-[17px] font-semibold leading-snug tracking-tight text-text">
                    {t(f.title, f.titleBn)}
                  </h3>
                  {t(
                    <p className="mt-1 font-(family-name:--font-hind) text-[14px] text-text-3">
                      {f.titleBn}
                    </p>,
                    null,
                  )}
                  <p className="mt-3 text-[14px] leading-relaxed text-text-2">
                    {t(f.body, f.bodyBn)}
                  </p>
                </motion.article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

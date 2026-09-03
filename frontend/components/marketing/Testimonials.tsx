"use client";

import { motion } from "framer-motion";
import { TESTIMONIALS } from "@/data/marketing";
import { Avatar } from "@/components/ui/primitives";
import { Reveal, Stagger, StaggerItem, SPRING } from "@/components/motion";
import { useLang } from "@/lib/i18n";

function Stars() {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          className="text-[#e0a92a]"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.4l6.5-.9z"
          />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const { t: t2 } = useLang();
  return (
    <section className="relative border-t border-line bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-(family-name:--font-hind) text-[15px] font-medium text-signal">
              {t2("What shop owners say", "বিক্রেতারা কী বলছেন")}
            </p>
            <h2 className="mt-3 text-balance font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
              {t2(
                "Shop owners who stopped answering messages at 2am.",
                "যাঁরা রাত ২টায় মেসেজের উত্তর দেওয়া বন্ধ করেছেন।",
              )}
            </h2>
          </div>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {TESTIMONIALS.map((x) => (
            <StaggerItem key={x.name}>
              <motion.figure
                whileHover={{ y: -5 }}
                transition={SPRING}
                className="flex h-full flex-col rounded-2xl border border-line bg-canvas p-6 transition-shadow duration-300 hover:shadow-[0_2px_6px_rgba(15,20,25,0.05),0_16px_36px_-18px_rgba(15,20,25,0.2)]"
              >
                <Stars />
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-text">
                  “{t2(x.quote, x.quoteBn)}”
                </blockquote>

                <div className="mt-6 rounded-xl border border-(--signal-line) bg-[#f2faf6] px-4 py-3">
                  <p className="font-display text-[22px] font-semibold leading-none tracking-tight text-signal">
                    {t2(x.result, x.resultBn)}
                  </p>
                  <p className="mt-1 text-[12px] text-text-3">
                    {t2(x.detail, x.detailBn)}
                  </p>
                </div>

                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-5">
                  <Avatar name={x.name} hue={x.hue} size={38} />
                  <div className="min-w-0">
                    <p className="truncate text-[13.5px] font-medium text-text">
                      {t2(x.name, x.nameBn)}
                    </p>
                    <p className="truncate text-[12px] text-text-3">
                      {t2(x.shop, x.shopBn)}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

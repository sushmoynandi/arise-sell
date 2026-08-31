"use client";

import { motion } from "framer-motion";
import { Badge, Eyebrow, Panel } from "@/components/ui/primitives";
import { IconShield } from "@/components/ui/icons";
import { Reveal, SPRING, SPRING_SOFT } from "@/components/motion";
import { EVAL_SUITE } from "@/data/brain";
import { useLang } from "@/lib/i18n";

const GUARDRAIL_ITEMS = [
  {
    en: "Never claim stock the catalog does not show",
    bn: "ক্যাটালগে স্টক না থাকলে কখনোই আছে বলে দাবি করে না",
  },
  {
    en: "Discounts above 5% escalate to a human admin",
    bn: "৫% এর বেশি ডিসকাউন্টের অনুরোধ মানুষের কাছে হস্তান্তর করে",
  },
  {
    en: "Orders over ৳50,000 escalate before confirming",
    bn: "৫০,০০০ টাকার বেশি অর্ডারে কনফার্ম করার আগে মানুষের অনুমতি চায়",
  },
  {
    en: "Never invent a delivery date — quote the courier SLA only",
    bn: "ডেলিভারির কাল্পনিক তারিখ না দিয়ে শুধু কুরিয়ারের অফিশিয়াল সময় জানায়",
  },
];

export default function Trust() {
  const { t } = useLang();

  return (
    <section
      id="trust"
      className="relative border-t border-line py-20 lg:py-28 bg-canvas"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg,transparent,var(--signal-line),transparent)",
        }}
      />
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <div>
            <Reveal>
              <Eyebrow>{t("The part nobody demos", "বিশ্বাসযোগ্যতা ও নিরাপত্তা")}</Eyebrow>
              <h2 className="mt-4 text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
                {t("An AI that sells must", "বিক্রয়কারী এআই যেন")}
                <span className="text-text-3">
                  {" "}
                  {t("never lie about your stock.", "কখনোই স্টকের ব্যাপারে মিথ্যা না বলে।")}
                </span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-text-2">
                {t(
                  "Every prompt change automatically runs through 240 recorded real conversations before touching a buyer — covering Banglish, Sylheti, bargaining, and discount requests.",
                  "কাস্টমারের কাছে পৌঁছানোর আগে প্রতিটি এআই আপডেটকে ২৪০টি বাস্তব চ্যাট টেস্ট কেস পার হতে হয় — যাতে বাংলিশ, দরদাম কিংবা আঞ্চলিক ভাষা সব নির্ভুল থাকে।"
                )}
              </p>
              <p className="mt-3 max-w-md text-[14px] leading-relaxed text-text-3">
                {t(
                  "If price accuracy or order completion drops, the change never ships. You get accurate closed orders instead of customer complaints.",
                  "মূল্যের সঠিকতা বা তথ্য নির্ভুল না হলে আপডেট লাইভ হয় না। ফলে ভুল তথ্যের পরিবর্তে নিশ্চিত সন্তুষ্টি মেলে।"
                )}
              </p>
            </Reveal>

            <Reveal delay={0.1} className="mt-8">
              <ul className="space-y-2.5">
                {GUARDRAIL_ITEMS.map((g, i) => (
                  <motion.li
                    key={g.en}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING, delay: i * 0.06 }}
                    className="flex items-start gap-3"
                  >
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-signal-wash text-signal">
                      <IconShield width={11} height={11} />
                    </span>
                    <span className="text-[13.5px] leading-snug text-text-2">
                      {t(g.en, g.bn)}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* eval report card */}
          <Reveal delay={0.12} className="min-w-0">
            <Panel className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                <div>
                  <h3 className="font-display text-[15px] font-semibold tracking-tight">
                    {t("Automated Eval Suite · Run #482", "স্বয়ংক্রিয় টেস্ট স্যুট · রান #৪৮২")}
                  </h3>
                  <p className="mt-0.5 font-mono text-[11px] text-text-3">
                    {t("240 test scenarios verified", "২৪০টি টেস্ট কেস ভেরিফাইড")}
                  </p>
                </div>
                <Badge tone="mint" dot>
                  {EVAL_SUITE.passed}/{EVAL_SUITE.cases} {t("passed", "পাস")}
                </Badge>
              </div>

              <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2">
                {[
                  {
                    labelEn: "Price accuracy",
                    labelBn: "দামের সঠিকতা",
                    now: "100%",
                    goal: "100%",
                  },
                  {
                    labelEn: "Out-of-stock guardrail",
                    labelBn: "স্টক না থাকার গার্ডরেইল",
                    now: "100%",
                    goal: "100%",
                  },
                  {
                    labelEn: "Address validation rate",
                    labelBn: "ঠিকানা যাচাইয়ের হার",
                    now: "98.4%",
                    goal: "95%",
                  },
                  {
                    labelEn: "Avg response speed",
                    labelBn: "গড় রেসপন্স স্পিড",
                    now: "3.2s",
                    goal: "< 4s",
                  },
                ].map((m, i) => (
                  <motion.div
                    key={m.labelEn}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING_SOFT, delay: i * 0.05 }}
                    className="bg-surface px-5 py-4"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[12.5px] text-text-3">
                        {t(m.labelEn, m.labelBn)}
                      </span>
                      <span className="font-mono text-[11px] text-signal font-semibold">
                        {m.goal}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="font-display text-[24px] font-semibold tracking-tight text-text">
                        {m.now}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-line bg-surface-2/50 px-5 py-3 text-[12px] text-text-3">
                <p>
                  {t(
                    "Guaranteed fail-closed on inventory queries when confidence is below 90%.",
                    "৯০% এর কম নিশ্চয়তা থাকলে স্টক সম্পর্কিত তথ্যে কখনোই আন্দাজে উত্তর দেওয়া হয় না।"
                  )}
                </p>
              </div>
            </Panel>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

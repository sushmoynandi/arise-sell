"use client";

import { motion } from "framer-motion";
import {
  Badge,
  Eyebrow,
  LiveDot,
  Meter,
  Sparkline,
} from "@/components/ui/primitives";
import {
  IconBolt,
  IconEye,
  IconGlobe,
  IconInstagram,
  IconMessenger,
  IconShield,
  IconTruck,
  IconWhatsApp,
  IconWidget,
} from "@/components/ui/icons";
import {
  Reveal,
  Stagger,
  StaggerItem,
  Tilt,
  SPRING,
} from "@/components/motion";
import { CHANNELS } from "@/data/tenant";
import { SERIES } from "@/data/operations";

import { useLang } from "@/lib/i18n";

const CHANNEL_ICONS = {
  whatsapp: IconWhatsApp,
  messenger: IconMessenger,
  instagram: IconInstagram,
  web: IconWidget,
  telegram: IconGlobe,
} as const;

export default function Capabilities() {
  const { t } = useLang();

  return (
    <section
      id="capabilities"
      className="relative border-t border-line py-20 lg:py-28 bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <Reveal>
          <Eyebrow>{t("What it actually does", "কী কী কাজ করে")}</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            {t(
              "Six things a good shop assistant does.",
              "একজন ভালো বিক্রয়কর্মীর ৬টি কাজ।",
            )}
            <span className="text-text-3">
              {" "}
              {t(
                "All six, at 3am, in Bangla.",
                "সবগুলোই করবে রাত ৩টায়, বাংলায়।",
              )}
            </span>
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* --- channels : wide --- */}
          <StaggerItem className="md:col-span-4">
            <Tilt max={4}>
              <div className="panel edge-lift h-full overflow-hidden p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-[19px] font-semibold tracking-tight">
                      {t(
                        "Every channel, one thread",
                        "সব চ্যানেলের কাস্টমার এক জায়গায়",
                      )}
                    </h3>
                    <p className="mt-2 max-w-md text-[14px] leading-relaxed text-text-2">
                      {t(
                        "The same customer on Messenger this morning and WhatsApp tonight is one person with one cart — not two strangers starting over.",
                        "সকালে মেসেঞ্জারে আর রাতে হোয়াটসঅ্যাপে নক করা একই কাস্টমারকে এক ব্যক্তি হিসেবেই চেনে — তথ্য পুনরায় দিতে হয় না।",
                      )}
                    </p>
                  </div>
                  <LiveDot />
                </div>

                <div className="mt-7 space-y-2.5">
                  {CHANNELS.filter((c) => c.live).map((c, i) => {
                    const Icon =
                      CHANNEL_ICONS[c.id as keyof typeof CHANNEL_ICONS];
                    return (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, x: -14 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ ...SPRING, delay: 0.08 * i }}
                        className="flex items-center gap-3"
                      >
                        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-2 text-text-2">
                          <Icon width={15} height={15} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-[13.5px] font-medium text-text">
                              {c.label}
                            </span>
                            <span className="font-mono text-[11px] text-text-3">
                              {c.share}%
                            </span>
                          </div>
                          <div className="mt-1.5">
                            <Meter value={c.share} max={50} />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </Tilt>
          </StaggerItem>

          {/* --- vision : tall --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift flex h-full flex-col justify-between overflow-hidden p-6">
              <div>
                <span className="grid size-9 place-items-center rounded-xl bg-iris/12 text-iris">
                  <IconEye width={17} height={17} />
                </span>
                <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                  {t("Screenshot → SKU", "স্ক্রিনশট থেকে সঠিক পণ্য")}
                </h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                  {t(
                    "Customers send a cropped photo of your own post. It comes back as a variant, in stock, with a price.",
                    "কাস্টমার পোস্টের ছবি ক্রপ করে পাঠালেও রঙ, সাইজ ও স্টক মিলিয়ে সঠিক দাম জানিয়ে দেয়।",
                  )}
                </p>
              </div>
              <div className="mt-6 rounded-xl border border-line bg-surface-2/60 p-3">
                <div className="flex items-center justify-between font-mono text-[10.5px] text-text-3">
                  <span>{t("MATCH ACCURACY", "ম্যাচ সঠিকতা")}</span>
                  <span className="text-iris font-semibold">94%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <motion.div
                    className="h-full rounded-full bg-iris"
                    initial={{ width: 0 }}
                    whileInView={{ width: "94%" }}
                    viewport={{ once: true }}
                    transition={{ ...SPRING, delay: 0.3 }}
                  />
                </div>
                <p className="mt-2.5 font-mono text-[11px] text-text-2">
                  {t(
                    "Jamdani Indigo · 12 in stock",
                    "জামদানি ইন্ডিগো · ১২ পিস স্টকে",
                  )}
                </p>
              </div>
            </div>
          </StaggerItem>

          {/* --- courier --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift h-full p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-mint/12 text-mint">
                <IconTruck width={17} height={17} />
              </span>
              <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                {t("Auto Courier Booking", "স্বয়ংক্রিয় কুরিয়ার বুকিং")}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                {t(
                  "Steadfast and Pathao booked directly on your merchant account. COD money goes directly to your wallet.",
                  "স্টেডফাস্ট ও পাঠাও-এ সরাসরি আপনার মার্চেন্ট অ্যাকাউন্টে পার্সেল বুক হয় এবং সিওডির টাকা আপনার একাউন্টে আসে।",
                )}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                <Badge tone="mint" dot>
                  Steadfast
                </Badge>
                <Badge tone="azure" dot>
                  Pathao
                </Badge>
                <Badge tone="neutral">
                  {t("1-click bulk", "১-ক্লিক বাল্ক")}
                </Badge>
              </div>
            </div>
          </StaggerItem>

          {/* --- guardrails --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift h-full p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-amber/12 text-amber">
                <IconShield width={17} height={17} />
              </span>
              <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                {t("Smart Safety Guardrails", "মিথ্যা তথ্য রোধে গার্ডরেইল")}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                {t(
                  "Never claims stock it can't see. Never invents a fake delivery date. Hands discounts and bulk requests to a human.",
                  "স্টকে না থাকলে কখনোই ভুল তথ্য দেয় না। ভুয়া ডেলিভারির তারিখ বানায় না এবং জটিল ডিসকাউন্ট মানুষের হাতে দেয়।",
                )}
              </p>
              <p className="mt-5 font-mono text-[11px] text-text-3">
                <span className="text-amber font-semibold">93.6%</span>{" "}
                {t("closed fully automated", "সম্পূর্ণ অটোমেটেড ক্লোজড")}
              </p>
            </div>
          </StaggerItem>

          {/* --- growth --- */}
          <StaggerItem className="md:col-span-2">
            <div className="panel edge-lift flex h-full flex-col p-6">
              <span className="grid size-9 place-items-center rounded-xl bg-signal-wash text-signal">
                <IconBolt width={17} height={17} />
              </span>
              <h3 className="mt-4 font-display text-[19px] font-semibold tracking-tight">
                {t("Ads That Learn", "অ্যাড ট্র্যাকিং ও আরও বিক্রি")}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-2">
                {t(
                  "Purchases report server-side to Meta, training your ads to automatically target real buyers.",
                  "প্রতিটি নিশ্চিত বিক্রি ফেসবুকে রিপোর্ট হয়, ফলে আপনার অ্যাড আসল ক্রেতাদের খুঁজে বের করতে পারে।",
                )}
              </p>
              <div className="mt-auto pt-5">
                <Sparkline data={SERIES.revenue} height={40} />
              </div>
            </div>
          </StaggerItem>
        </Stagger>
      </div>
    </section>
  );
}

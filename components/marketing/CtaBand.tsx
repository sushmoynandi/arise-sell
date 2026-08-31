"use client";

import { Button } from "@/components/ui/primitives";
import { IconArrow, IconCheck, IconWhatsApp } from "@/components/ui/icons";
import { Magnetic, Reveal } from "@/components/motion";
import { useLang } from "@/lib/i18n";

const POINTS = [
  { en: "No card needed", bn: "কার্ড লাগবে না" },
  { en: "Live in 10 minutes", bn: "১০ মিনিটেই চালু" },
  { en: "Cancel whenever you like", bn: "যখন খুশি বন্ধ করুন" },
];

const WEEK = [
  {
    d: "Day 1",
    dBn: "১ম দিন",
    t: "Your page is connected and answering in Bangla.",
    tBn: "আপনার পেজ কানেক্ট, বাংলায় উত্তর দেওয়া শুরু।",
  },
  {
    d: "Day 2",
    dBn: "২য় দিন",
    t: "Your catalog is synced; photo matching switches on.",
    tBn: "ক্যাটালগ সিঙ্ক হয়ে গেছে, ছবি মেলানো চালু।",
  },
  {
    d: "Day 4",
    dBn: "৪র্থ দিন",
    t: "First orders confirmed and booked with the courier.",
    tBn: "প্রথম অর্ডার কনফার্ম, কুরিয়ারও বুক।",
  },
  {
    d: "Day 7",
    dBn: "৭ম দিন",
    t: "You see exactly what it closed — and what it cost.",
    tBn: "কত অর্ডার হলো আর কত খরচ হলো, সব দেখতে পাবেন।",
  },
];

export default function CtaBand() {
  const { t } = useLang();
  return (
    <section className="relative overflow-hidden border-t border-line py-20 lg:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 90% at 50% 0%, rgba(10,110,80,0.10), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-[0_2px_8px_rgba(15,20,25,0.05),0_24px_50px_-28px_rgba(15,20,25,0.25)]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="p-8 lg:p-12">
              <Reveal>
                <p className="font-[family-name:var(--font-hind)] text-[16px] font-medium text-signal">
                  {t("Get started today", "আজই শুরু করুন")}
                </p>
                <h2 className="mt-3 text-balance font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-semibold leading-[1.1] tracking-[-0.028em]">
                  {t(
                    "Your next customer is typing right now.",
                    "আপনার পরের কাস্টমার এখনই টাইপ করছে।",
                  )}
                </h2>
                <p className="mt-4 max-w-md text-[15.5px] leading-relaxed text-text-2">
                  {t(
                    "Connect one page, add your products, and let it close forty orders on us. If it doesn't earn its keep, walk away — nothing to cancel, nothing owed.",
                    "একটা পেজ কানেক্ট করুন, পণ্য যোগ করুন, আর প্রথম ৪০টা অর্ডার আমাদের তরফ থেকে ফ্রি। পছন্দ না হলে চলে যান — বাতিল করার কিছু নেই, দেনাও নেই।",
                  )}
                </p>

                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
                  {POINTS.map((p) => (
                    <li
                      key={p.en}
                      className="flex items-center gap-1.5 text-[13.5px] text-text-3"
                    >
                      <IconCheck
                        width={13}
                        height={13}
                        className="text-signal"
                      />
                      {t(p.en, p.bn)}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Magnetic>
                    <Button href="/console" size="lg" className="group">
                      {t(
                        "Start free — 40 orders",
                        "ফ্রি শুরু করুন — ৪০ অর্ডার",
                      )}
                      <IconArrow
                        width={16}
                        height={16}
                        className="transition-transform duration-200 group-hover:translate-x-1"
                      />
                    </Button>
                  </Magnetic>
                  <Magnetic strength={0.18}>
                    <Button
                      href="https://wa.me/8801710000000"
                      target="_blank"
                      size="lg"
                      variant="outline"
                    >
                      <IconWhatsApp width={16} height={16} />
                      {t("Talk to a human", "মানুষের সাথে কথা বলুন")}
                    </Button>
                  </Magnetic>
                </div>
              </Reveal>
            </div>

            {/* warm proof panel */}
            <div className="relative border-t border-line bg-[#f2faf6] p-8 lg:border-l lg:border-t-0 lg:p-12">
              <Reveal delay={0.1}>
                <p className="font-display text-[15px] font-semibold tracking-tight text-text">
                  {t(
                    "What happens in the first week",
                    "প্রথম সপ্তাহে যা যা হবে",
                  )}
                </p>
                <ol className="mt-5 space-y-5">
                  {WEEK.map((w) => (
                    <li key={w.d} className="flex gap-3.5">
                      <span className="mt-0.5 shrink-0 rounded-full bg-white px-2.5 py-1 text-[11.5px] font-semibold text-signal">
                        {t(w.d, w.dBn)}
                      </span>
                      <span className="text-[14px] leading-snug text-text-2">
                        {t(w.t, w.tBn)}
                      </span>
                    </li>
                  ))}
                </ol>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

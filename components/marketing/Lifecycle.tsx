"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge, Eyebrow, Panel } from "@/components/ui/primitives";
import { Reveal, SPRING, SPRING_SOFT } from "@/components/motion";
import { useLang } from "@/lib/i18n";
import { cx } from "@/lib/format";

const STAGES = [
  {
    key: "listening",
    n: "01",
    titleEn: "It hears the question",
    titleBn: "প্রশ্ন বা বার্তা গ্রহণ",
    leadEn: "Bangla script, phonetic Banglish, Sylheti, English — or a screenshot with no words at all.",
    leadBn: "শুদ্ধ বাংলা, ফোনেটিক বাংলিশ, সিলেটি, ইংরেজি — অথবা কোনো লেখা ছাড়া কেবল একটি ছবির স্ক্রিনশট।",
    detailEn:
      "Rapid-fire messages get batched into one thought before the agent answers, so a customer typing four lines in eight seconds gets one reply, not four.",
    detailBn:
      "কাস্টমার পরপর ৪-৫টি মেসেজ পাঠালে সবগুলো একসাথে পড়ে বুঝে তবেই একটি গোছানো ও পূর্ণাঙ্গ উত্তর দেয়।",
    factsEn: [
      ["Languages", "বাংলা · Banglish · English"],
      ["Batch window", "8 seconds"],
      ["First reply", "under 4s median"],
    ],
    factsBn: [
      ["ভাষা সমর্থন", "বাংলা · বাংলিশ · ইংরেজি"],
      ["ব্যাচ সময়", "৮ সেকেন্ড"],
      ["প্রথম উত্তর", "গড় ৩.৮ সেকেন্ডে"],
    ],
    tint: "azure",
  },
  {
    key: "matched",
    n: "02",
    titleEn: "It finds the actual SKU",
    titleBn: "সঠিক পণ্য ও স্টক শনাক্তকরণ",
    leadEn: "A cropped Facebook screenshot becomes a variant ID with a confidence score.",
    leadBn: "ফেসবুক পোস্টের কাটা ছবি দেখেই ক্যাটালগের আসল পণ্য, কালার ও সাইজ ভ্যারিয়েন্ট বের করে ফেলে।",
    detailEn:
      "Catalog images are embedded and indexed, so a photo lands on Jamdani · Indigo · in stock — not a guess. Below the confidence floor it asks instead of assuming.",
    detailBn:
      "ছবি ও স্টক মিলিয়ে নিশ্চিত হয়। কোনো সন্দেহ থাকলে মনগড়া তথ্য না দিয়ে কাস্টমারকে অপশন বেছে নিতে বলে।",
    factsEn: [
      ["Match floor", "0.78 confidence"],
      ["Index refresh", "every feed sync"],
      ["Fallback", "asks, never guesses"],
    ],
    factsBn: [
      ["ম্যাচ সঠিকতা", "৯৪% অ্যাকুরেসি"],
      ["স্টক আপডেট", "স্বয়ংক্রিয় লাইভ সিঙ্ক"],
      ["ফলব্যাক", "আন্দাজে না বলে জিজ্ঞেস করে"],
    ],
    tint: "iris",
  },
  {
    key: "kyc",
    n: "03",
    titleEn: "It collects what shipping needs",
    titleBn: "ডেলিভারি তথ্য সংগ্রহ",
    leadEn: "Name, an 11-digit number that actually validates, and an address a rider can find.",
    leadBn: "নাম, সঠিক ১১ ডিজিটের মোবাইল নাম্বার এবং কুরিয়ার রাইডারের সহজে পৌঁছানোর মতো পূর্ণাঙ্গ ঠিকানা।",
    detailEn:
      "Slots are yours to define. The agent asks for what's missing, re-asks once, and refuses to confirm an order with a malformed number — the single biggest source of failed deliveries.",
    detailBn:
      "ভুল নাম্বার বা অসম্পূর্ণ ঠিকানায় পার্সেল বুকিং ঠেকিয়ে রিটার্ন পার্সেলের খরচ বাঁচায়।",
    factsEn: [
      ["Phone rule", "01[3-9] + 8 digits"],
      ["Address parse", "district · thana · street"],
      ["Custom slots", "unlimited"],
    ],
    factsBn: [
      ["নাম্বার ভ্যালিডেশন", "০১[৩-৯] + ৮ ডিজিট"],
      ["ঠিকানা বিন্যাস", "জেলা · থানা · এরিয়া"],
      ["কাস্টম ফিল্ড", "আনলিমিটেড"],
    ],
    tint: "amber",
  },
  {
    key: "confirmed",
    n: "04",
    titleEn: "It commits the order",
    titleBn: "অর্ডার নিশ্চিতকরণ ও পেমেন্ট",
    leadEn: "Written to your own store, with an idempotency key so a webhook retry can't double-charge.",
    leadBn: "ক্যাশ অন ডেলিভারি (COD) অথবা চ্যাটেই সরাসরি বিকাশ / নগদ পেমেন্ট লিংক পাঠিয়ে অর্ডার চূড়ান্ত করে।",
    detailEn:
      "COD or a bKash link in-chat. High-risk orders — new number, big total, outside Dhaka — get asked for an advance before they ever reach a rider.",
    detailBn:
      "ঢাকার বাইরের বড় অর্ডারে ডেলিভারি চার্জ অগ্রিম নিয়ে ঝুঁকি কমাতে পারে।",
    factsEn: [
      ["Push target", "your order endpoint"],
      ["Dedup", "Idempotency-Key"],
      ["Prepay", "bKash · Nagad link"],
    ],
    factsBn: [
      ["সিঙ্ক", "ড্যাশবোর্ডে লাইভ এন্ট্রি"],
      ["পেমেন্ট মেথড", "বিকাশ · নগদ · সিওডি"],
      ["অ্যাডভান্স", "ঝুঁকিপূর্ণ অর্ডারে অগ্রিম চার্জ"],
    ],
    tint: "signal",
  },
  {
    key: "shipped",
    n: "05",
    titleEn: "It books the courier and closes the loop",
    titleBn: "কুরিয়ার বুকিং ও ট্র্যাকিং",
    leadEn: "Steadfast or Pathao consignment, tracking code back in the chat, invoice in Bangla.",
    leadBn: "স্টেডফাস্ট বা পাঠাও-এ সরাসরি পার্সেল বুকিং, চ্যাটেই কাস্টমারকে ট্র্যাকিং কোড এবং বাংলায় চালান প্রেরণ।",
    detailEn:
      "Then a Purchase event goes server-side to Meta so the ad that started the conversation learns it worked. The whole loop, without a spreadsheet.",
    detailBn:
      "ফেসবুক অ্যাড ট্র্যাকিংয়ের মাধ্যমে বিজ্ঞাপনের আরআই বৃদ্ধি করে পুরো বিক্রয় চক্র স্বয়ংক্রিয়ভাবে সম্পন্ন করে।",
    factsEn: [
      ["Couriers", "Steadfast · Pathao"],
      ["Invoice", "চালান, itemised"],
      ["Attribution", "Meta CAPI"],
    ],
    factsBn: [
      ["কুরিয়ার পার্টনার", "স্টেডফাস্ট · পাঠাও"],
      ["চালান", "আইটেমভিত্তিক বাংলা মেমো"],
      ["অ্যাড ট্র্যাকিং", "মেটা কনভার্সন এপিআই"],
    ],
    tint: "mint",
  },
] as const;

const TINT: Record<string, string> = {
  azure: "var(--azure)",
  iris: "var(--iris)",
  amber: "var(--amber)",
  signal: "var(--signal)",
  mint: "var(--mint)",
};

export default function Lifecycle() {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const s = STAGES[active];

  return (
    <section
      id="lifecycle"
      className="relative border-t border-line py-20 lg:py-28 bg-white"
    >
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <Eyebrow>{t("One engine, five stages", "একটি ইঞ্জিনে বিক্রির ৫টি ধাপ")}</Eyebrow>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
            {t("Most tools stop at the reply.", "সাধারণ চ্যাটবট শুধু কথায় আটকে থাকে।")}
            <span className="text-text-3">
              {" "}
              {t("This one keeps going until the parcel moves.", "NextProduct পার্সেল ডেলিভারি হওয়া পর্যন্ত কাজ চালিয়ে যায়।")}
            </span>
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-12">
          {/* stage list */}
          <div className="flex gap-3 overflow-x-auto pb-2 lg:block lg:overflow-visible lg:pb-0">
            {STAGES.map((st, i) => {
              const on = i === active;
              return (
                <button
                  key={st.key}
                  onClick={() => setActive(i)}
                  className={cx(
                    "group relative w-full min-w-[210px] shrink-0 rounded-xl border px-4 py-3.5 text-left transition-colors duration-200 lg:min-w-0 cursor-pointer",
                    on
                      ? "border-(--signal-line) bg-surface"
                      : "border-transparent hover:bg-surface/60",
                  )}
                >
                  {on && (
                    <motion.span
                      layoutId="stage-rail"
                      transition={SPRING}
                      className="absolute inset-y-2 -left-px w-[2px] rounded-full"
                      style={{ background: TINT[st.tint] }}
                    />
                  )}
                  <div className="flex items-baseline gap-2.5">
                    <span
                      className="font-mono text-[11px] transition-colors"
                      style={{ color: on ? TINT[st.tint] : "var(--text-3)" }}
                    >
                      {st.n}
                    </span>
                    <span
                      className={cx(
                        "font-display text-[15px] font-medium tracking-tight transition-colors",
                        on ? "text-text" : "text-text-2 group-hover:text-text",
                      )}
                    >
                      {t(st.titleEn, st.titleBn)}
                    </span>
                  </div>
                  <p className="mt-1.5 pl-[30px] text-[12.5px] leading-snug text-text-3 lg:pl-0">
                    {t(st.leadEn, st.leadBn)}
                  </p>
                </button>
              );
            })}
          </div>

          {/* detail card */}
          <Panel className="relative overflow-hidden p-7 lg:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full opacity-[0.14] blur-3xl transition-colors duration-500"
              style={{ background: TINT[s.tint] }}
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={SPRING_SOFT}
                className="relative"
              >
                <span
                  className="font-display text-[64px] font-semibold leading-none tracking-tighter opacity-25"
                  style={{ color: TINT[s.tint] }}
                >
                  {s.n}
                </span>
                <h3 className="mt-4 font-display text-[26px] font-semibold tracking-tight text-text">
                  {t(s.titleEn, s.titleBn)}
                </h3>
                <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-text-2">
                  {t(s.leadEn, s.leadBn)}
                </p>
                <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-text-3">
                  {t(s.detailEn, s.detailBn)}
                </p>

                <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                  {(t(s.factsEn, s.factsBn) as readonly (readonly [string, string])[]).map(([k, v]) => (
                    <div key={k} className="bg-surface px-4 py-3.5">
                      <dt className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                        {k}
                      </dt>
                      <dd className="mt-1.5 text-[13.5px] font-medium text-text">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 flex items-center gap-2">
                  <Badge tone="neutral">
                    {t("Live Dashboard Stage", "লাইভ ড্যাশবোর্ড স্টেজ")} ·{" "}
                    <span className="font-mono text-text-2">
                      /console/
                      {s.key === "shipped"
                        ? "fulfilment"
                        : s.key === "matched"
                          ? "catalog"
                          : "pipeline"}
                    </span>
                  </Badge>
                </div>
              </motion.div>
            </AnimatePresence>
          </Panel>
        </div>
      </div>
    </section>
  );
}

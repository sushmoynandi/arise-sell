"use client";

import { Eyebrow, Panel } from "@/components/ui/primitives";
import { Counter, Reveal, Stagger, StaggerItem } from "@/components/motion";
import { useLang } from "@/lib/i18n";

const BELIEFS = [
  {
    titleEn: "The inbox is the storefront",
    titleBn: "ইনবক্সই আসল দোকান",
    bodyEn:
      "In Bangladesh, most online shopping starts with a message, not a cart. Any tool that treats chat as customer support and the website as the real shop has the geometry backwards.",
    bodyBn:
      "বাংলাদেশে বেশিরভাগ অনলাইন কেনাকাটা শুরু হয় মেসেজে, কার্টে নয়। তাই চ্যাট কেবল কাস্টমার সাপোর্ট নয়, বরং ব্যবসার মূল বিক্রয়কেন্দ্র।",
  },
  {
    titleEn: "Bangla is not a translation layer",
    titleBn: "বাংলা কোনো অনুবাদ নয়, সহজাত ভাষা",
    bodyEn:
      "“ভাই এইটা কি আছে” and “vai eita ki ache” are the same sentence in two scripts, and a customer will switch mid-thread. That has to be native, not bolted on after English works.",
    bodyBn:
      "বাংলা হরফ আর বাংলিশ মিলিয়ে কাস্টমাররা যেভাবে কথা বলেন, আমাদের এআই ঠিক সেভাবেই সাবলীলভাবে বোঝে ও উত্তর দেয়।",
  },
  {
    titleEn: "An AI that sells must never lie",
    titleBn: "এআই কখনো মনগড়া তথ্য দেবে না",
    bodyEn:
      "A model that wants to be helpful will invent stock and promise a Tuesday delivery. That costs a real return and a real refund, so guardrails and evals aren't a feature — they're the product.",
    bodyBn:
      "স্টকে না থাকলে কাস্টমারকে মিথ্যা আশ্বাস দেওয়া যাবে না। সঠিক স্টক ভেরিফিকেশন ও ডেলিভারি কমিটমেন্ট নিশ্চিত করাই আমাদের মূল লক্ষ্য।",
  },
  {
    titleEn: "Charge for outcomes, not effort",
    titleBn: "টাকা দেবেন অর্ডারের জন্য, শুধু বার্তার জন্য নয়",
    bodyEn:
      "Per-seat and per-conversation pricing both bill you for effort. We bill on a closed order, which means a slow month costs you less and we only grow when you do.",
    bodyBn:
      "প্রতিটি আজেবাজে মেসেজের জন্য বিল করা অন্যায্য। আপনি সফল অর্ডার পেলে তবেই আমরা চার্জ করি।",
  },
];

const TIMELINE = [
  {
    when: "2024",
    whatEn:
      "Ran a small handloom page on Facebook. Lost more orders to a slow inbox than to price.",
    whatBn:
      "ফেসবুকে নিজেদের একটি পেজ চালাতে গিয়ে দেখলাম, দামের কারণে নয়—দেরিতে রিপ্লাই দেওয়ার কারণে সবচেয়ে বেশি অর্ডার হারাতাম।",
  },
  {
    when: "Early 2025",
    whatEn:
      "Built a crude auto-reply. It answered fast and confidently invented stock. Three returns in a week.",
    whatBn:
      "প্রথমে একটি সাধারণ অটো-রিপ্লাই বানালাম। দ্রুত উত্তর দিত কিন্তু ভুলভাল স্টক বলে ফেলত। এক সপ্তাহে ৩টি রিটার্ন হলো।",
  },
  {
    when: "Mid 2025",
    whatEn:
      "Rebuilt around guardrails and a recorded test suite. Order completion went up when the bot said “I don't know” more often.",
    whatBn:
      "পুরো সিস্টেম কঠোর গার্ডরেইল এবং ২৪০টি টেস্ট কেস দিয়ে নতুন করে সাজানো হলো। অর্ডার কমপ্লিশন একলাফে বেড়ে গেল।",
  },
  {
    when: "2026",
    whatEn:
      "Opened it up to Bangladeshi merchants, and moved billing strictly to closed orders.",
    whatBn:
      "বাংলাদেশের সকল ব্যবসায়ীদের জন্য উন্মুক্ত করা হলো এবং বিলিং সম্পূর্ণ 'ক্লোজড অর্ডার' ভিত্তিক করা হলো।",
  },
];

const NUMBERS = [
  {
    n: 41208,
    labelEn: "threads handled",
    labelBn: "কথোপকথন সম্পন্ন",
    suffix: "",
  },
  {
    n: 240,
    labelEn: "recorded eval cases",
    labelBn: "টেস্ট কেস ভেরিফাইড",
    suffix: "",
  },
  {
    n: 93.6,
    labelEn: "closed without a human",
    labelBn: "মানুষের সাহায্য ছাড়া ক্লোজড",
    suffix: "%",
    d: 1,
  },
  {
    n: 3.8,
    labelEn: "second median first reply",
    labelBn: "গড় প্রথম উত্তরের সময়",
    suffix: "s",
    d: 1,
  },
];

export default function StorySection() {
  const { t } = useLang();

  return (
    <section
      id="story"
      className="relative border-t border-line py-20 lg:py-28 bg-white"
    >
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>{t("Story & Beliefs", "আমাদের গল্প ও লক্ষ্য")}</Eyebrow>
            <h2 className="mt-4 text-balance font-display text-[clamp(1.9rem,3.6vw,2.9rem)] font-semibold leading-[1.08] tracking-[-0.025em]">
              {t(
                "We built this because slow inboxes kill real sales.",
                "দেরিতে রিপ্লাই দেওয়ার কারণে যেন কোনো ব্যবসা কাস্টমার না হারায়।",
              )}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-relaxed text-text-2">
              {t(
                "Not competitor pricing or ad budget — an answer delivered hours late is why buyers leave. NextProduct was created in Dhaka to solve this for good.",
                "কম্পিটিটরের দামের জন্য নয়, ঘণ্টার পর ঘণ্টা মেসেজ ফেলে রাখার কারণেই কাস্টমার অন্য দোকান থেকে কিনে ফেলে। এই সমস্যা দূর করতেই NextProduct তৈরি।",
              )}
            </p>
          </div>
        </Reveal>

        {/* Numbers Strip */}
        <Reveal delay={0.1} className="mt-14">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line shadow-[0_1px_2px_rgba(15,20,25,0.04)] lg:grid-cols-4">
            {NUMBERS.map((s) => (
              <div key={s.labelEn} className="bg-surface px-5 py-6 text-center">
                <dt className="font-display text-[30px] font-semibold leading-none tracking-tight text-signal">
                  <Counter to={s.n} decimals={s.d ?? 0} suffix={s.suffix} />
                </dt>
                <dd className="mt-2 text-[12.5px] leading-snug text-text-3">
                  {t(s.labelEn, s.labelBn)}
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        {/* Beliefs Grid */}
        <div className="mt-20">
          <Reveal>
            <h3 className="text-center font-display text-[22px] font-semibold tracking-tight text-text">
              {t("Four core principles in our product", "আমাদের চারটি মূলনীতি")}
            </h3>
          </Reveal>

          <Stagger className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
            {BELIEFS.map((b, i) => (
              <StaggerItem key={b.titleEn}>
                <Panel interactive className="h-full p-6">
                  <span className="font-mono text-[11px] font-semibold text-signal">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="mt-3 font-display text-[18px] font-semibold tracking-tight">
                    {t(b.titleEn, b.titleBn)}
                  </h4>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-text-2">
                    {t(b.bodyEn, b.bodyBn)}
                  </p>
                </Panel>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        {/* Timeline */}
        <div className="mt-20 border-t border-line pt-16">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h3 className="font-display text-[22px] font-semibold tracking-tight text-text">
                {t("How it started & evolved", "কীভাবে শুরু হয়েছিল")}
              </h3>
            </div>
          </Reveal>

          <div className="mx-auto mt-10 max-w-2xl">
            {TIMELINE.map((item, i) => (
              <Reveal key={item.when} delay={i * 0.06}>
                <div className="relative flex gap-5 pb-8 last:pb-0">
                  {i < TIMELINE.length - 1 && (
                    <span className="absolute left-[5px] top-4 h-full w-px bg-line" />
                  )}
                  <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-signal bg-white" />
                  <div>
                    <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-signal">
                      {item.when}
                    </p>
                    <p className="mt-1 text-[14px] leading-relaxed text-text-2">
                      {t(item.whatEn, item.whatBn)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

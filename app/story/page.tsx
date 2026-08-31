import type { Metadata } from "next";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import CtaBand from "@/components/marketing/CtaBand";
import { Badge, Eyebrow, Panel } from "@/components/ui/primitives";
import { Counter, Reveal, ScrollProgress, Stagger, StaggerItem } from "@/components/motion";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Story",
  description:
    "Built in Dhaka, for shops that sell in the inbox. Why we bill on closed orders and test every prompt change.",
};

const BELIEFS = [
  {
    title: "The inbox is the storefront",
    body: "In Bangladesh, most online shopping starts with a message, not a cart. Any tool that treats chat as customer support and the website as the real shop has the geometry backwards.",
  },
  {
    title: "Bangla is not a translation layer",
    body: "“ভাই এইটা কি আছে” and “vai eita ki ache” are the same sentence in two scripts, and a customer will switch mid-thread. That has to be native, not bolted on after English works.",
  },
  {
    title: "An AI that sells can lie",
    body: "A model that wants to be helpful will invent stock and promise a Tuesday delivery. That costs a real return and a real refund, so guardrails and evals aren't a feature — they're the product.",
  },
  {
    title: "Charge for outcomes",
    body: "Per-seat and per-conversation pricing both bill you for effort. We bill on a closed order, which means a slow month costs you less and we only grow when you do.",
  },
];

const TIMELINE = [
  { when: "2024", what: "Ran a small handloom page on Facebook. Lost more orders to a slow inbox than to price." },
  { when: "Early 2025", what: "Built a crude auto-reply. It answered fast and confidently invented stock. Three returns in a week." },
  { when: "Mid 2025", what: "Rebuilt around guardrails and a recorded test suite. Order completion went up when the bot said “I don't know” more often." },
  { when: "2026", what: "Opened it up to other merchants, and moved billing from conversations to closed orders." },
];

const NUMBERS = [
  { n: 41208, label: "threads handled", suffix: "" },
  { n: 240, label: "recorded eval cases", suffix: "" },
  { n: 93.6, label: "closed without a human", suffix: "%", d: 1 },
  { n: 3.8, label: "second median first reply", suffix: "s", d: 1 },
];

export default function StoryPage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden pb-16 pt-32 lg:pt-40">
          <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-60" />
          <div className="relative mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Story</Eyebrow>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                We started this because we kept losing orders
                <span className="text-text-3"> to a slow inbox.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-text-2">
                Not to a competitor&apos;s price, or a better photo, or a bigger ad budget. To a message
                answered nine hours later, when the customer had already bought from someone else.
              </p>
            </Reveal>

            <Reveal delay={0.12} className="mt-14">
              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
                {NUMBERS.map((s) => (
                  <div key={s.label} className="bg-surface px-5 py-6">
                    <dt className="font-display text-[30px] font-semibold leading-none tracking-tight text-signal">
                      <Counter to={s.n} decimals={s.d ?? 0} suffix={s.suffix} />
                    </dt>
                    <dd className="mt-2.5 text-[12.5px] leading-snug text-text-3">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>

        {/* beliefs */}
        <section className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>What we believe</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                Four opinions, baked into the product.
              </h2>
            </Reveal>

            <Stagger className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
              {BELIEFS.map((b, i) => (
                <StaggerItem key={b.title}>
                  <Panel interactive className="h-full p-6">
                    <span className="font-mono text-[11px] text-signal">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-3 font-display text-[19px] font-semibold tracking-tight">
                      {b.title}
                    </h3>
                    <p className="mt-3 text-[14px] leading-relaxed text-text-2">{b.body}</p>
                  </Panel>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* timeline */}
        <section className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>How it got here</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                Mostly by getting it wrong first.
              </h2>
            </Reveal>

            <div className="mt-12 max-w-2xl">
              {TIMELINE.map((t, i) => (
                <Reveal key={t.when} delay={i * 0.07}>
                  <div className="relative flex gap-6 pb-9 last:pb-0">
                    {i < TIMELINE.length - 1 && (
                      <span className="absolute left-[5px] top-4 h-full w-px bg-line" />
                    )}
                    <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-signal bg-canvas" />
                    <div>
                      <p className="font-mono text-[11px] uppercase tracking-wider text-signal">
                        {t.when}
                      </p>
                      <p className="mt-2 text-[14.5px] leading-relaxed text-text-2">{t.what}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* contact */}
        <section className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Panel className="flex flex-wrap items-center justify-between gap-6 p-8">
                <div>
                  <h2 className="font-display text-[24px] font-semibold tracking-tight">
                    Talk to a person
                  </h2>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-text-2">
                    No qualification form and no discovery call. Send us your catalog URL and a
                    screenshot of your busiest thread, and we&apos;ll tell you honestly whether this
                    helps.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge tone="neutral">Dhaka, Bangladesh</Badge>
                    <Badge tone="mint" dot>
                      replies within the hour
                    </Badge>
                  </div>
                </div>
                <a
                  href={`mailto:${BRAND.supportEmail}`}
                  className="font-display text-[clamp(1.2rem,2.4vw,1.8rem)] font-semibold tracking-tight text-signal transition-opacity hover:opacity-80"
                >
                  {BRAND.supportEmail}
                </a>
              </Panel>
            </Reveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

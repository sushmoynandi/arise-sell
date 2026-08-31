import type { Metadata } from "next";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import PricingTable from "@/components/marketing/PricingTable";
import Faq from "@/components/marketing/Faq";
import CtaBand from "@/components/marketing/CtaBand";
import { Eyebrow, Panel } from "@/components/ui/primitives";
import { Reveal, ScrollProgress } from "@/components/motion";
import { FAQS } from "@/data/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Billed on closed orders, not conversations. Start free with 40 orders a month — no card, no sales call.",
};

const COMPARE = [
  ["What you pay for", "A closed order", "Every conversation", "A monthly seat"],
  ["A chat that never buys", "৳0", "Charged", "Charged"],
  ["A cancelled order", "Credited back", "Charged", "Charged"],
  ["Bad month", "You pay less", "You pay the same", "You pay the same"],
  ["Good month", "You pay more, you earned more", "You pay more", "You pay the same"],
];

export default function PricingPage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden pb-16 pt-32 lg:pt-40">
          <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-60" />
          <div className="relative mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Pricing</Eyebrow>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                You pay when it closes an order.
                <span className="text-text-3"> Not when it says hello.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-text-2">
                Conversations are our cost, not your value. Every other tool in this category bills
                you for the two hundred people who asked &ldquo;দাম কত?&rdquo; and vanished. We don&apos;t.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="relative pb-20">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <PricingTable />
          </div>
        </section>

        {/* pricing model comparison */}
        <section className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Why it matters</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                The billing unit decides whose side the vendor is on.
              </h2>
            </Reveal>

            <Reveal delay={0.1} className="mt-10">
              <Panel className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-text-3" />
                      <th className="px-5 py-4 font-display text-[14px] font-semibold text-signal">
                        NextProduct
                      </th>
                      <th className="px-5 py-4 font-display text-[14px] font-medium text-text-3">
                        Per-conversation tools
                      </th>
                      <th className="px-5 py-4 font-display text-[14px] font-medium text-text-3">
                        A hired page admin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARE.map(([label, a, b, c]) => (
                      <tr key={label} className="border-b border-line-soft last:border-0">
                        <td className="px-5 py-3.5 text-[13px] text-text-3">{label}</td>
                        <td className="px-5 py-3.5 text-[13.5px] font-medium text-text">{a}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-text-3">{b}</td>
                        <td className="px-5 py-3.5 text-[13.5px] text-text-3">{c}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Panel>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
              <Reveal>
                <Eyebrow>Questions</Eyebrow>
                <h2 className="mt-5 text-balance font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                  The ones people actually ask.
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-text-3">
                  Something not covered here? Write to us — a person replies, usually within the
                  hour.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <Faq items={FAQS} />
              </Reveal>
            </div>
          </div>
        </section>

        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

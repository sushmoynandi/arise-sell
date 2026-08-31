import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Spotlights from "@/components/marketing/Spotlights";
import HowItWorks from "@/components/marketing/HowItWorks";
import Testimonials from "@/components/marketing/Testimonials";
import PricingPreview from "@/components/marketing/PricingPreview";
import Faq from "@/components/marketing/Faq";
import CtaBand from "@/components/marketing/CtaBand";
import { Reveal, ScrollProgress } from "@/components/motion";
import { FAQS } from "@/data/plans";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main>
        <Hero />
        <Features />
        <Spotlights />
        <HowItWorks />
        <Testimonials />
        <PricingPreview />

        <section className="border-t border-line py-20 lg:py-28">
          <div className="mx-auto max-w-[1180px] px-5 lg:px-8">
            <Reveal>
              <div className="mx-auto max-w-2xl text-center">
                <p className="font-[family-name:var(--font-hind)] text-[15px] font-medium text-signal">
                  প্রশ্ন ও উত্তর
                </p>
                <h2 className="mt-3 text-balance font-display text-[clamp(1.9rem,3.6vw,2.7rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                  Questions shop owners ask us.
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="mx-auto mt-12 max-w-3xl">
              <Faq items={FAQS} />
            </Reveal>
          </div>
        </section>

        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

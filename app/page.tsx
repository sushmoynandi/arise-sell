import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import Hero from "@/components/marketing/Hero";
import Features from "@/components/marketing/Features";
import Capabilities from "@/components/marketing/Capabilities";
import ReplyDecay from "@/components/marketing/ReplyDecay";
import Spotlights from "@/components/marketing/Spotlights";
import HowItWorks from "@/components/marketing/HowItWorks";
import Lifecycle from "@/components/marketing/Lifecycle";
import ChannelsSection from "@/components/marketing/ChannelsSection";
import StorySection from "@/components/marketing/StorySection";
import PricingPreview from "@/components/marketing/PricingPreview";
import Testimonials from "@/components/marketing/Testimonials";
import Trust from "@/components/marketing/Trust";
import { FaqSection } from "@/components/marketing/Faq";
import CtaBand from "@/components/marketing/CtaBand";
import AIChatAssistant from "@/components/marketing/AIChatAssistant";
import { FAQS } from "@/data/plans";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <Hero />
        <Features />
        <AIChatAssistant />
        <Capabilities />
        <ReplyDecay />
        <Spotlights />
        <HowItWorks />
        <Lifecycle />
        <ChannelsSection />
        <StorySection />
        <PricingPreview />
        <Testimonials />
        <Trust />
        <FaqSection items={FAQS} />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

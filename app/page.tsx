import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/sections/Hero";
import StatsSection from "@/components/sections/StatsSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import HowItWorks from "@/components/sections/HowItWorks";
import ReviewsSection from "@/components/sections/ReviewsSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";
import InteractiveAgentDemo from "@/components/ui/InteractiveAgentDemo";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-900 selection:bg-sky-500 selection:text-white">
      <Navbar />
      <Hero />
      <StatsSection />
      <FeaturesSection />
      <HowItWorks />
      <ReviewsSection />
      <CTASection />
      <Footer />
      <InteractiveAgentDemo />
    </div>
  );
}

import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import Hero from "@/components/marketing/Hero";
import Lifecycle from "@/components/marketing/Lifecycle";
import Capabilities from "@/components/marketing/Capabilities";
import ReplyDecay from "@/components/marketing/ReplyDecay";
import Trust from "@/components/marketing/Trust";
import CtaBand from "@/components/marketing/CtaBand";
import { ScrollProgress } from "@/components/motion";

export default function HomePage() {
  return (
    <>
      <ScrollProgress />
      <SiteHeader />
      <main>
        <Hero />
        <Lifecycle />
        <Capabilities />
        <ReplyDecay />
        <Trust />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

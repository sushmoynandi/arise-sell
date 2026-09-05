import type { Metadata } from "next";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import CtaBand from "@/components/marketing/CtaBand";
import TermsContent from "@/components/marketing/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Official Terms of Service and Merchant Agreement for AriseSell. Conversational commerce SaaS, pay-per-closed-order billing, Meta messaging compliance, and courier fulfillment terms.",
};

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden bg-canvas">
        <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-60" />
        <TermsContent />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

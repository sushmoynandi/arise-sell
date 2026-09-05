import type { Metadata } from "next";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import CtaBand from "@/components/marketing/CtaBand";
import PrivacyContent from "@/components/marketing/PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Official Privacy Policy of AriseSell. How we securely manage, protect, and process data for WhatsApp Cloud API, Messenger, Instagram, and e-commerce fulfillment.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden bg-canvas">
        <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-60" />
        <PrivacyContent />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

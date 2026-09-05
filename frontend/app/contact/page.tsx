import type { Metadata } from "next";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import CtaBand from "@/components/marketing/CtaBand";
import ContactSection from "@/components/marketing/ContactSection";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the AriseSell team in Dhaka. WhatsApp, phone, email, or send an inquiry to automate your sales in Bangla.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-60" />
        <ContactSection />
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

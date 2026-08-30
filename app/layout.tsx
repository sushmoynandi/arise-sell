import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { AgentationProvider } from "@/components/AgentationProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "HuntReady — The Launch Page That Gets You to #1 on Product Hunt",
  description:
    "Build hype before launch day with a referral waitlist, countdown timer, and auto-switching Product Hunt voting CTA. Everything founders need to crush their launch.",
  openGraph: {
    title: "HuntReady — The Launch Page That Gets You to #1 on Product Hunt",
    description:
      "Referral waitlist, countdown timer, demo embed, founder story, press kit, and auto-switching PH voting CTA — all in one page.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HuntReady — Crush Your Product Hunt Launch",
    description:
      "Referral waitlist, countdown timer, and auto-switching PH voting CTA. Built for founders who ship.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakarta.variable}`}>
      <body className="font-[family-name:var(--font-body)] antialiased" suppressHydrationWarning>
        {children}
        <AgentationProvider />
      </body>
    </html>
  );
}

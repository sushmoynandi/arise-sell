import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight, Hind_Siliguri, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AgentationProvider } from "@/components/AgentationProvider";
import { LanguageProvider } from "@/lib/i18n";
import { BRAND } from "@/lib/brand";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

const hind = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  variable: "--font-hind",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${BRAND.domain}`),
  title: {
    default: `${BRAND.nameFull} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.nameFull}`,
  },
  description: BRAND.description,
  keywords: [
    "conversational commerce",
    "Bangla AI agent",
    "WhatsApp commerce Bangladesh",
    "Steadfast API",
    "Pathao courier API",
    "F-commerce automation",
  ],
  openGraph: {
    type: "website",
    siteName: BRAND.nameFull,
    title: `${BRAND.nameFull} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.nameFull} — ${BRAND.tagline}`,
    description: BRAND.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${interTight.variable} ${hind.variable} ${jetbrains.variable}`}
    >
      <body className="bg-canvas text-text antialiased" suppressHydrationWarning>
        <LanguageProvider>{children}</LanguageProvider>
        <AgentationProvider />
      </body>
    </html>
  );
}

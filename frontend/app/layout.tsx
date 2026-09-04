import type { Metadata } from "next";
import {
  Plus_Jakarta_Sans,
  Inter,
  Hind_Siliguri,
  JetBrains_Mono,
} from "next/font/google";
import "./globals.css";
import { AgentationProvider } from "@/components/AgentationProvider";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth-context";
import { BRAND } from "@/lib/brand";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${inter.variable} ${hind.variable} ${jetbrains.variable}`}
    >
      <body
        className="bg-canvas text-text antialiased"
        suppressHydrationWarning
      >
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
        <AgentationProvider />
      </body>
    </html>
  );
}

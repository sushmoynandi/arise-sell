import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Wordmark } from "@/components/ui/primitives";
import { IconCheck, IconWhatsApp } from "@/components/ui/icons";

const COLUMNS = [
  {
    title: "Product",
    titleBn: "প্রোডাক্ট",
    links: [
      { label: "Features", href: "/platform" },
      { label: "Pricing", href: "/pricing" },
      { label: "See the dashboard", href: "/console" },
      { label: "For developers", href: "/docs" },
    ],
  },
  {
    title: "Channels",
    titleBn: "চ্যানেল",
    links: [
      { label: "WhatsApp Business", href: "/platform#channels" },
      { label: "Facebook Messenger", href: "/platform#channels" },
      { label: "Instagram Direct", href: "/platform#channels" },
      { label: "Website chat widget", href: "/platform#channels" },
    ],
  },
  {
    title: "Company",
    titleBn: "কোম্পানি",
    links: [
      { label: "Our story", href: "/story" },
      { label: "Common questions", href: "/pricing#faq" },
      { label: "Contact us", href: `mailto:${BRAND.supportEmail}` },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto max-w-[1180px] px-5 pb-10 pt-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,1fr))] lg:gap-12">
          {/* brand + contact */}
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-text-2">
              The 24-hour salesperson for Bangladeshi shops selling on WhatsApp, Messenger and
              Instagram.
            </p>

            <div className="mt-6 space-y-2.5">
              <a
                href="tel:+8801710000000"
                className="flex items-center gap-2.5 text-[14px] text-text-2 transition-colors hover:text-signal"
              >
                <span className="grid size-8 place-items-center rounded-xl bg-[#e6f4ee] text-signal">
                  <IconWhatsApp width={15} height={15} />
                </span>
                017 1000 0000
              </a>
              <a
                href={`mailto:${BRAND.supportEmail}`}
                className="block text-[14px] text-text-2 transition-colors hover:text-signal"
              >
                {BRAND.supportEmail}
              </a>
              <p className="text-[13.5px] text-text-3">Banani, Dhaka 1213, Bangladesh</p>
            </div>

            <p className="mt-6 flex items-center gap-2 text-[12.5px] text-text-3">
              <IconCheck width={13} height={13} className="text-signal" />
              Verified Meta Tech Provider
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="flex items-baseline gap-2 text-[14px] font-semibold text-text">
                {col.title}
                <span className="font-[family-name:var(--font-hind)] text-[12.5px] font-normal text-text-3">
                  {col.titleBn}
                </span>
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[13.5px] text-text-2 transition-colors hover:text-signal"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[13px] text-text-3 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {BRAND.nameFull} — সব অধিকার সংরক্ষিত।
          </p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/docs" className="transition-colors hover:text-signal">
              Privacy
            </Link>
            <Link href="/docs" className="transition-colors hover:text-signal">
              Terms
            </Link>
            <span>Prices in BDT, VAT included</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

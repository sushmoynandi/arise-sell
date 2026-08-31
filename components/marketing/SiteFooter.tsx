import Link from "next/link";
import { BRAND } from "@/lib/brand";
import { Wordmark, Badge } from "@/components/ui/primitives";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "/platform" },
      { label: "Channels", href: "/platform#channels" },
      { label: "Fulfilment", href: "/platform#fulfilment" },
      { label: "Guardrails & evals", href: "/platform#trust" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Catalog feed spec", href: "/docs#feed" },
      { label: "Order webhook", href: "/docs#orders" },
      { label: "Idempotency", href: "/docs#idempotency" },
      { label: "Console demo", href: "/console" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Story", href: "/story" },
      { label: "Pricing FAQ", href: "/pricing#faq" },
      { label: BRAND.supportEmail, href: `mailto:${BRAND.supportEmail}` },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-line bg-surface">
      {/* oversized wordmark bleed */}
      <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[19vw] font-extrabold leading-none tracking-tighter text-[color:var(--text)]/[0.035]">
        NextProduct
      </div>

      <div className="relative mx-auto max-w-[1180px] px-5 pb-14 pt-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Wordmark />
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-text-3">
              {BRAND.tagline}. Built in Dhaka for shops that sell in the inbox.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge tone="mint" dot>
                All systems normal
              </Badge>
              <Badge tone="neutral">Meta Tech Provider</Badge>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-3">
                {col.title}
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

        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[12.5px] text-text-3 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} {BRAND.nameFull}. Dhaka, Bangladesh.</p>
          <p className="font-mono text-[11.5px]">
            Prices in BDT · COD settled on your own courier account
          </p>
        </div>
      </div>
    </footer>
  );
}

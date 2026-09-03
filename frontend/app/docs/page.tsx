import type { Metadata } from "next";
import SiteHeader from "@/components/marketing/SiteHeader";
import SiteFooter from "@/components/marketing/SiteFooter";
import CtaBand from "@/components/marketing/CtaBand";
import CodeBlock from "@/components/marketing/CodeBlock";
import { Badge, Eyebrow, Panel } from "@/components/ui/primitives";
import { IconCheck, IconShield, IconWarn } from "@/components/ui/icons";
import { Reveal } from "@/components/motion";

export const metadata: Metadata = {
  title: "Developers",
  description:
    "Two endpoints: a catalog feed we pull, and an order webhook we push. HMAC-signed, paginated, fail-closed on stock.",
};

const FEED = `GET https://yourshop.com.bd/np/products?cursor=&limit=250
Authorization: Bearer <feed key>

{
  "version": "2",
  "currency": "BDT",
  "next_cursor": "eyJpZCI6NDI1MH0",
  "products": [
    {
      "external_id": "NK-4001",          // stable, never reused
      "title": "Jamdani Handloom Saree",
      "description": "Half-silk Jamdani woven in Rupganj.",
      "category": "Apparel",
      "price": 6850.00,
      "compare_at": 7900.00,
      "stock": 19,                        // absolute count wins over in_stock
      "images": [
        "https://yourshop.com.bd/media/jd-main.jpg",
        "https://yourshop.com.bd/media/jd-warehouse-raw.jpg"
      ],
      "variations": [
        { "variation_id": "JD-IND", "color": "Indigo", "price": 6850.00, "stock": 12 },
        { "variation_id": "JD-TER", "color": "Terracotta", "price": 6850.00, "stock": 7 },
        { "variation_id": "JD-IVY", "color": "Ivory", "price": 7250.00, "stock": 0 }
      ],
      "tags": ["saree", "jamdani", "handloom"]
    }
  ]
}`;

const ORDER = `POST https://yourshop.com.bd/np/orders
Idempotency-Key: np_ord_8f94e19b73424912
X-NP-Signature: t=1756654800,v1=6f3c9a...
Content-Type: application/json

{
  "event": "order.closed",
  "placed_at": "2026-08-31T15:12:04Z",
  "channel": "whatsapp",
  "customer": {
    "name": "Nabila Hoque",
    "phone": "01712045590",
    "address": {
      "line": "House 42, Road 7, Sector 7, Uttara",
      "district": "Dhaka",
      "thana": "Uttara",
      "delivery_type": "home"
    }
  },
  "lines": [
    {
      "external_id": "NK-4201",
      "variation_id": "JT-NAT",
      "title": "Jute & Leather Tote · Natural",
      "quantity": 1,
      "unit_price": 2980.00
    }
  ],
  "subtotal": 2980.00,
  "delivery_charge": 80.00,
  "discount": 0.00,
  "total": 3060.00,
  "payment": { "method": "cod", "collected": 0.00 }
}`;

const VERIFY = `// Verify X-NP-Signature before you trust the body.
import { createHmac, timingSafeEqual } from "node:crypto";

export function verify(raw: string, header: string, secret: string) {
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string])
  );
  const age = Math.abs(Date.now() / 1000 - Number(parts.t));
  if (age > 300) return false;                    // reject replays older than 5 min

  const expected = createHmac("sha256", secret)
    .update(parts.t + "." + raw)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1 ?? "");
  return a.length === b.length && timingSafeEqual(a, b);
}`;

const RULES = [
  {
    icon: IconShield,
    tone: "signal" as const,
    title: "Signed, not just keyed",
    body: "Every push carries X-NP-Signature — HMAC-SHA256 over a timestamp and the raw body. A leaked key alone can't forge an order, and a captured request can't be replayed after five minutes.",
  },
  {
    icon: IconWarn,
    tone: "amber" as const,
    title: "Stock fails closed",
    body: "If a product arrives with neither stock nor in_stock, we import it as out of stock. An ambiguous feed makes the agent silent about a product — never confidently wrong about it.",
  },
  {
    icon: IconCheck,
    tone: "mint" as const,
    title: "An empty page is an error",
    body: "A feed that previously returned 214 products and suddenly returns [] is treated as a failure, not a catalog wipe. We keep the last good snapshot and tell you in the sync log.",
  },
];

const LIMITS = [
  ["Transport", "HTTPS only · no private, loopback or link-local hosts"],
  ["Redirects", "3 maximum, re-validated at each hop"],
  ["Timeouts", "10s connect · 30s per page"],
  ["Page size", "250 items · 25 MB maximum"],
  ["Pagination", "Cursor-based, stable ordering required"],
  ["Schedule", "Every 6 hours, plus manual sync"],
  ["Egress", "Static IP available for your allowlist"],
  ["Key compare", "Constant-time on your side, please"],
];

export default function DocsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden pb-16 pt-32 lg:pt-40">
          <div className="bg-grid pointer-events-none absolute inset-0 mask-fade-b opacity-60" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Developers</Eyebrow>
              <h1 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Two endpoints.
                <span className="text-text-3">
                  {" "}
                  That&apos;s the whole integration.
                </span>
              </h1>
              <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-text-2">
                One feed we pull from you, one webhook we push to you. Keep your
                Laravel, your WooCommerce, your own database — we don&apos;t
                need to own your catalog to sell from it.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge tone="signal">Contract v2</Badge>
                <Badge tone="neutral">HMAC-SHA256 signed</Badge>
                <Badge tone="neutral">Cursor paginated</Badge>
              </div>
            </Reveal>
          </div>
        </section>

        {/* feed */}
        <section id="feed" className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
              <Reveal>
                <span className="font-mono text-[11px] text-signal">01</span>
                <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-[1.12] tracking-[-0.025em]">
                  The catalog feed
                </h2>
                <p className="mt-4 text-[14.5px] leading-relaxed text-text-2">
                  You expose one authenticated JSON endpoint. We pull it every
                  six hours, download and re-host your images, and rebuild the
                  photo-match index so a customer&apos;s screenshot resolves to
                  a real variation.
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-text-3">
                  <code className="font-mono text-text-2">external_id</code> is
                  the dedup key — keep it stable and never reuse it.{" "}
                  <code className="font-mono text-text-2">variation_id</code>{" "}
                  must match the id your own checkout uses, or orders we push
                  back won&apos;t resolve.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <CodeBlock code={FEED} label="GET /np/products" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* orders */}
        <section id="orders" className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
              <Reveal>
                <span className="font-mono text-[11px] text-signal">02</span>
                <h2 className="mt-3 font-display text-[clamp(1.6rem,3vw,2.2rem)] font-semibold leading-[1.12] tracking-[-0.025em]">
                  The order webhook
                </h2>
                <p className="mt-4 text-[14.5px] leading-relaxed text-text-2">
                  When the agent closes an order, we POST it to you. Return a{" "}
                  <code className="font-mono text-text-2">payment_url</code> and
                  the agent sends a bKash or Nagad link straight into the chat;
                  return nothing and it stays cash on delivery.
                </p>
                <p className="mt-3 text-[13.5px] leading-relaxed text-text-3">
                  Orders are always itemised. There is no single-product
                  shortcut shape to branch on — one line item or nine, the
                  payload is identical.
                </p>
              </Reveal>
              <Reveal delay={0.08}>
                <CodeBlock code={ORDER} label="POST /np/orders" />
              </Reveal>
            </div>
          </div>
        </section>

        {/* idempotency + signing */}
        <section
          id="idempotency"
          className="border-t border-line py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Safety</Eyebrow>
              <h2 className="mt-5 max-w-2xl text-balance font-display text-[clamp(1.7rem,3.2vw,2.5rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                Webhooks retry. Networks lie.
                <span className="text-text-3"> Plan for both.</span>
              </h2>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
              <Reveal>
                <CodeBlock code={VERIFY} label="verify.ts" />
              </Reveal>
              <Reveal delay={0.08} className="space-y-4">
                {RULES.map((r) => (
                  <Panel key={r.title} className="p-5">
                    <span
                      className={`grid size-8 place-items-center rounded-lg ${
                        r.tone === "signal"
                          ? "bg-signal-wash text-signal"
                          : r.tone === "amber"
                            ? "bg-amber/12 text-amber"
                            : "bg-mint/12 text-mint"
                      }`}
                    >
                      <r.icon width={15} height={15} />
                    </span>
                    <h3 className="mt-3.5 font-display text-[15px] font-semibold tracking-tight">
                      {r.title}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-text-2">
                      {r.body}
                    </p>
                  </Panel>
                ))}
              </Reveal>
            </div>
          </div>
        </section>

        {/* limits */}
        <section className="border-t border-line py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <Eyebrow>Fetcher limits</Eyebrow>
              <h2 className="mt-5 font-display text-[clamp(1.7rem,3.2vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.025em]">
                What our crawler will and won&apos;t do.
              </h2>
            </Reveal>
            <Reveal delay={0.08} className="mt-10">
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2">
                {LIMITS.map(([k, v]) => (
                  <div key={k} className="bg-surface px-5 py-4">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-3">
                      {k}
                    </p>
                    <p className="mt-1.5 text-[13.5px] text-text-2">{v}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
        <CtaBand />
      </main>
      <SiteFooter />
    </>
  );
}

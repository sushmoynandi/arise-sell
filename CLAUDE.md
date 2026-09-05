# AriseSell (Ship Studio Project)

Next.js 16 App Router · Tailwind CSS v4 · TypeScript · Framer Motion.

**AriseSell** is a 24/7 conversational commerce engine for Bangladeshi e-commerce and
F-commerce. Positioning: it does not "answer customers" — it **closes and ships the order**.

> **Current state: frontend only.** There is no backend, database or auth. Everything on
> screen is mock data from `data/`. Do not add a backend unless asked.

---

## 1. Product model

The whole product is organised around five stages of one sale:

`Listening → Matched → Details → Confirmed → Shipped`

- **Listening** — Bangla script, phonetic Banglish, Sylheti or English; rapid messages are
  batched into one thought before replying.
- **Matched** — a customer's screenshot is resolved to a real variant via an image index,
  with a confidence score and a floor below which it asks instead of guessing.
- **Details** — name, an 11-digit number validated against `01[3-9]\d{8}`, a parseable address.
- **Confirmed** — pushed to the merchant's own order endpoint with an `Idempotency-Key`;
  COD or an in-chat bKash/Nagad link.
- **Shipped** — Steadfast or Pathao consignment on the merchant's own account, Bangla চালান
  invoice, and a server-side Purchase event to Meta CAPI.

**Billing is per closed order, not per conversation.** Plans: Shuru ৳0 / 40 orders,
Bazaar ৳1,190 / 400, Karkhana ৳3,490 / 1,500, plus Enterprise. Overage ৳4 per order.

---

## 2. Routes

**Marketing:** `/` · `/platform` · `/pricing` · `/docs` · `/story`
**Console:** `/console` (Pulse) · `/console/threads` · `/console/pipeline` ·
`/console/fulfilment` · `/console/catalog` · `/console/reach` · `/console/brain` ·
`/console/signals`
**Mock API:** `GET /api/feed` · `GET|POST /api/orders`
**Legacy redirects:** `/features`, `/about`, `/showcase` → marketing; `/dashboard` → `/console`

Console IA lives in `CONSOLE_NAV` (`lib/brand.ts`). It is grouped **Run** / **Build** and
deliberately merges what other tools separate: orders + courier + invoice = **Fulfilment**;
campaigns + comments + follow-ups = **Reach**; persona + knowledge + guardrails + evals =
**Brain**. Keep that merging intact when adding features — do not reintroduce a page per module.

---

## 3. Design system

**Light, production commerce-admin.** White cards on a soft grey field, hairline borders,
tight low-opacity shadows, one jade accent. Tokens in `app/globals.css`.

Deliberately _not_ a dark developer-tool theme: merchants look at product photography,
invoices and courier slips all day, and light renders those honestly.

- Canvas `#faf9f7`, surfaces `#ffffff` / `#f4f3f0` / `#e8e6e1`, hairline `#e7e4de`
- Text `#0f1419` / `#4a5561` / `#626b76`
- **One** accent: jade `--signal: #0a6e50`, white text on it (`--signal-ink`)
- Status/series only: `--mint --amber --coral --iris --azure`
- Type: Plus Jakarta Sans (display/headings), Inter (body/UI), Hind Siliguri (Bangla),
  JetBrains Mono (data/IDs/code)

**Rules**

- No emoji as iconography — use `components/ui/icons.tsx`.
- Use the `Panel` / `Badge` / `Button` / `Meter` / `Sparkline` primitives rather than
  bespoke markup.
- Bangla text gets `font-[family-name:var(--font-hind)]`.
- Motion comes from `components/motion` — reuse `SPRING`, `Reveal`, `Stagger`, `Counter`,
  `Magnetic`. Don't hand-roll easings.
- Money via `bdt()` in `lib/format.ts`.
- Decoration stays faint. On light, a strong glow or noise layer reads as dirt.

**Colour rule (verified, don't regress):** every status colour also sits on its own 10% tint
(`bg-amber/10 text-amber`), so it must clear 4.5:1 against _that_, not just against white —
which is why the ramp is deeper than typical Tailwind values. The whole UI was audited with a
scripted WCAG pass at 1440px and 380px; all pages are at zero AA failures. Re-run it after
changing any colour token.

**Layout rule (learned the hard way):** any `fr` grid track must be `minmax(0,Nfr)` and any
responsive grid needs a base `grid-cols-1`, otherwise long Bangla strings, code blocks and
tables force horizontal page overflow. `body` uses `overflow-x: clip` — never change it to
`hidden`, which would break sticky headers.

## 4. Demo data

`data/` only. Tenant is **Nokshi & Co.** (fictional Dhaka handloom/home brand).
`types.ts` · `tenant.ts` · `catalog.ts` · `threads.ts` · `operations.ts` · `brain.ts` · `plans.ts`

Order refs use `NP-`; idempotency keys use `np_ord_`. Keep any new demo data in this family —
never reintroduce identifiers from the reference documents in the repo root.

---

## 5. Reference documents

`alap_ai_comprehensive_documentation.md`, `Next_Product_SYSTEM_DOCUMENTATION.md` and
`Multi-Tenant SaaS API.yaml` describe a **different, competing** product that this project is
deliberately distinct from. Use them for domain facts (courier APIs, CAPI events, BD phone
rules) only. **Never copy its naming, information architecture, pricing, or feature ordering.**

---

## 6. Skills & guidelines

Specialized skills live in `.claude/skills/`. Keep `SITE.md` updated as the single source of
truth after any feature or UI change.

### Development commands

- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Build: `npm run build`
- Dev: `npm run dev`

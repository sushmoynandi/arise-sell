# NextProduct AI — Site Documentation

> **The commerce engine that closes the order.**
> A 24/7 conversational commerce platform for Bangladeshi e-commerce and F-commerce.
> Frontend only — every number on screen comes from `data/`. There is no backend yet.

---

## 1. What this product claims to do

Most tools in this category sell "an AI that answers your customers." NextProduct sells
**shipped orders**. The agent reads the Bangla or Banglish message, matches a customer's
screenshot to a real SKU, collects a deliverable address, commits the order to the
merchant's own store, books Steadfast or Pathao, issues a Bangla invoice, and reports the
purchase back to Meta.

That framing drives three decisions you'll see everywhere in the code:

1. **Billing is per closed order**, not per conversation (`data/plans.ts`).
2. **The console is organised by stage of the sale**, not by feature module.
3. **Guardrails and evals are first-class product surfaces**, not settings.

---

## 2. Pages & routes

### Marketing

| Route | Purpose |
|---|---|
| `/` | Landing. Hero with a self-running order simulation, lifecycle stepper, capability bento, reply-time decay chart, eval/trust section, CTA. |
| `/platform` | Channels in depth, the five-stage lifecycle, the eight console surfaces, trust section. |
| `/pricing` | Three plans + enterprise, a billing-model comparison table, FAQ accordion. |
| `/docs` | Developer contract v2 — catalog feed, order webhook, HMAC signature verification, fetcher limits. |
| `/story` | Positioning, four product beliefs, timeline, contact. |

### Console (the logged-in product, on mock data)

| Route | What it owns |
|---|---|
| `/console` | **Pulse** — KPIs, revenue chart, live event stream, "waiting on a human", AI spend ceiling, channel mix. |
| `/console/threads` | **Threads** — unified inbox, Bangla/Banglish transcripts with English glosses, photo-match chips, guardrail trace, human takeover. |
| `/console/pipeline` | **Pipeline** — six-stage kanban. The agent proposes a stage move; a human confirms or rejects it (cards animate between columns). |
| `/console/fulfilment` | **Fulfilment** — orders, courier tracker and the Bangla চালান invoice in one screen. |
| `/console/catalog` | **Catalog** — products, variants, vision-index state, and the feed-sync history log. |
| `/console/reach` | **Reach** — campaigns, comment automation rules, follow-up playbooks. |
| `/console/brain` | **Brain** — persona, guardrails, knowledge, and the eval harness with held-back failures. |
| `/console/signals` | **Signals** — server-side conversion events, ROAS, AI spend breakdown, pipeline health. |

### Mock API (no database — in-memory only)

| Route | Behaviour |
|---|---|
| `GET /api/feed` | Cursor-paginated catalog feed matching the v2 contract on `/docs`. |
| `GET /api/orders` | Lists received orders. |
| `POST /api/orders` | Requires `Idempotency-Key`; validates the BD phone rule `01[3-9]\d{8}`; rejects empty orders; replays return the original ref. |

### Legacy redirects
`/features → /platform`, `/about → /story`, `/showcase → /platform`, `/dashboard → /console`.

---

## 3. Design system

Defined in `app/globals.css`. **Light commerce-admin** — white cards on a soft grey field,
one jade accent. Chosen over a dark theme because merchants read product photos, invoices and
courier slips all day, and light renders those honestly.

| Token | Value | Use |
|---|---|---|
| `--canvas` | `#f7f8f9` | page + app field |
| `--surface` / `--surface-2` / `--surface-3` | `#ffffff` / `#f1f3f5` / `#e4e7eb` | cards & sidebar / fills & hover / inputs & tracks |
| `--line` / `--line-soft` | `#e2e5e9` / `#edeff2` | hairlines, row dividers |
| `--text` / `--text-2` / `--text-3` | `#0f1419` / `#4a5561` / `#626b76` | primary / secondary / tertiary |
| `--signal` | `#0a6e50` | **the** accent — CTAs, active state, positive data |
| `--signal-ink` | `#ffffff` | text on the accent |
| `--mint` `--amber` `--coral` `--iris` `--azure` | status + chart series | never a second brand colour |

**Accessibility:** every page passes WCAG AA at 1440px and 380px, verified by a scripted
contrast audit that measures rendered text against its actual rendered background. Status
colours are deeper than typical Tailwind values because each also has to clear 4.5:1 against
its own 10% tint (`bg-amber/10 text-amber`), not just against white.

**Type:** Bricolage Grotesque (display) · Inter Tight (body) · Hind Siliguri (Bangla) ·
JetBrains Mono (data, IDs, code).

**Utilities:** `.panel`, `.panel-raised`, `.glass`, `.edge-lift`, `.bg-grid`, `.bg-dots`,
`.mask-fade-b`, `.mask-fade-x`, and animation classes `.anim-float`, `.anim-marquee`,
`.anim-ring`, `.anim-shimmer`, `.anim-typing`, `.anim-aurora`, `.anim-caret`, `.anim-dash`.
All motion is disabled under `prefers-reduced-motion`.

## 4. Motion

`components/motion/index.tsx` — one spring vocabulary so nothing feels borrowed.

| Export | Use |
|---|---|
| `SPRING` / `SPRING_SOFT` / `SPRING_POP` | the three house springs |
| `Reveal` | scroll-triggered entrance (fade + rise + deblur) |
| `Stagger` / `StaggerItem` | parent/child choreography |
| `Magnetic` | cursor-attracted buttons |
| `Tilt` | subtle 3D card response |
| `Counter` | easeOutExpo number roll, fires on view |
| `SplitWords` | per-word headline entrance |
| `Marquee` | seamless infinite rail |
| `ScrollProgress` | thin signal-coloured progress bar |

---

## 5. Components

```
components/
  motion/index.tsx        all motion primitives
  ui/primitives.tsx       Wordmark, Button, Badge, Panel, PanelHead, Meter,
                          Sparkline, Avatar, Delta, ChannelChip, Eyebrow, LiveDot
  ui/icons.tsx            line icon set + channel glyphs (no emoji anywhere)
  marketing/
    SiteHeader / SiteFooter
    Hero                  headline + proof numbers + merchant marquee
    LiveClose             the self-running order simulation
    Lifecycle             interactive five-stage explainer
    Capabilities          bento grid
    ReplyDecay            conversion-vs-latency chart
    Trust                 guardrails + eval report card
    PricingTable / Faq / CodeBlock / CtaBand
  console/
    ConsoleShell          sidebar + topbar + mobile drawer
    PageHeader
    LiveStream            simulated push event feed
    RevenueChart          interactive 14-day bar chart
```

---

## 6. Demo data

All in `data/`. The tenant is **Nokshi & Co.**, a fictional Dhaka handloom and home brand.

| File | Contents |
|---|---|
| `types.ts` | shared domain types |
| `tenant.ts` | merchant profile, team, channels, social-proof merchant names |
| `catalog.ts` | 6 products with variants + `FEED_SYNCS` history (one deliberate failure) |
| `threads.ts` | 4 conversations (Banglish, Bangla, bulk handoff, resolved return) + `HERO_SCRIPT` |
| `operations.ts` | pipeline cards, orders, campaigns, comment rules, CAPI events, series, KPIs, spend |
| `brain.ts` | persona, guardrails, knowledge, eval suite, playbooks |
| `plans.ts` | three plans, enterprise, overage, FAQs |

Order refs use the `NP-` prefix; idempotency keys use `np_ord_`.

---

## 7. How to customise

| Want to change | Edit |
|---|---|
| Product name, tagline, nav | `lib/brand.ts` |
| Console navigation / IA | `CONSOLE_NAV` in `lib/brand.ts` |
| Colours, fonts, animations | `app/globals.css` |
| Prices and plan features | `data/plans.ts` |
| Demo merchant and products | `data/tenant.ts`, `data/catalog.ts` |
| Demo conversations | `data/threads.ts` (`HERO_SCRIPT` drives the landing-page simulation) |
| Currency / phone formatting | `lib/format.ts` |

---

## 8. Commands

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # production build
```

---

## 9. Known state

- **Frontend only.** No database, no auth, no real integrations. The console reads static
  data from `data/`; interactions (confirm/reject, tab switches, filters) are local state.
- `POST /api/orders` keeps orders in memory and resets on server restart.
- Product photos are hosted on Unsplash; `next.config.ts` allowlists that host.

## 10. Recent changes

- **Rethemed from dark to light.** The original dark "control room" was a developer-tool
  convention that fought the actual use case — merchants looking at product photography,
  invoices and courier slips. Rebuilt as a light commerce-admin system: white cards on a soft
  grey field, jade accent, tight shadows. Sidebar and footer are now white, the invoice
  preview reads as a physical document, and decorative glows were pulled right back.
- **Accessibility pass.** Scripted WCAG audit across all pages at two viewports; deepened the
  status ramp and `--text-3` until every page hit zero AA failures.
- **Full rebuild.** Replaced the leftover launch-page template with the NextProduct marketing
  site and an eight-route console.
- New dark design system with a single lime signal colour; removed all emoji iconography in
  favour of a hand-built line icon set.
- Restructured the console from an 8-tab single page into eight routed surfaces organised by
  stage of the sale, merging orders/courier/invoice into **Fulfilment**, campaigns/comments/
  follow-ups into **Reach**, and persona/knowledge/guardrails into **Brain**.
- Added surfaces that didn't previously exist: pipeline kanban with human-in-the-loop
  approval, feed-sync observability, AI spend ceilings, and the agent eval harness.
- Moved billing from per-conversation to per-closed-order.
- Upgraded the developer contract to v2: cursor pagination, HMAC-SHA256 request signing,
  fail-closed stock, always-itemised orders.
- Fixed mobile layout: every `fr` grid track is `minmax(0,…)` and every responsive grid has a
  base `grid-cols-1`, so long Bangla strings and code blocks can no longer force horizontal
  page overflow. `body` uses `overflow-x: clip` (not `hidden`) so sticky headers still work.

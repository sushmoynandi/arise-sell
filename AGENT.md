# AGENT.md — Agent Guidelines & Repository Context

## 1. Project Overview

**NextProduct AI** is a 24/7 conversational commerce engine tailored specifically for Bangladeshi e-commerce and F-commerce (Facebook/Messenger/WhatsApp).
- **Core Positioning:** It does not merely "answer customer questions" — it **closes and ships the order**.
- **Tech Stack:** Next.js 16 (App Router), React, Tailwind CSS v4, TypeScript, Framer Motion.
- **Current State:** **Frontend-only.** There is no database, backend server, or authentication. All displayed data is mocked inside `data/`. Do not add a real backend or database unless explicitly requested.

---

## 2. Core Product Lifecycle & Business Model

### Five Stages of a Sale
The entire product model is organized around the five stages of a transaction:
`Listening → Matched → Details → Confirmed → Shipped`

1. **Listening:** Ingests Bangla script, phonetic Banglish, Sylheti, or English. Batches rapid-fire user messages before responding.
2. **Matched:** Resolves customer screenshots/photos to catalog SKUs via vision indexing with a confidence threshold.
3. **Details:** Collects customer name, validated 11-digit BD mobile number (`01[3-9]\d{8}`), and delivery address.
4. **Confirmed:** Dispatches order payload to the merchant's endpoint with an `Idempotency-Key` (`np_ord_...`); supports COD or in-chat bKash/Nagad links.
5. **Shipped:** Books Steadfast/Pathao courier consignments on merchant's account, generates Bangla (চালান) invoice, and fires Meta CAPI Purchase event.

### Pricing Model
- **Billed per closed order** (not per message/conversation).
- Plans: **Shuru** (৳0 / 40 orders), **Bazaar** (৳1,190 / 400 orders), **Karkhana** (৳3,490 / 1,500 orders), and **Enterprise**.

---

## 3. Repository Structure & Routes

### Marketing Routes
- `/`: Landing page with interactive hero, decay curves, interactive demos, and pricing preview.
- `/platform`: Deep dive into multi-channel commerce, the 5-stage lifecycle, and console capabilities.
- `/pricing`: Pricing plans, billing model comparisons, and FAQ.
- `/docs`: Developer API contract v2 (catalog feed, order webhooks, HMAC verification).
- `/story`: Product philosophy, beliefs, timeline, and company story.

### Console Routes (`/console`)
Console navigation (`CONSOLE_NAV` in `lib/brand.ts`) is deliberately grouped into **Run** and **Build**, consolidating related submodules:
- `/console` (**Pulse**): Operational overview, live event stream, alerts requiring human intervention, spend ceilings.
- `/console/threads` (**Threads**): Unified inbox with Bangla/Banglish transcripts, photo match debuggers, and human takeover.
- `/console/pipeline` (**Pipeline**): 6-stage kanban board with AI stage-transition proposals and human approval.
- `/console/fulfilment` (**Fulfilment**): Orders, courier tracking, and printable Bangla invoice view (চালান).
- `/console/catalog` (**Catalog**): Product catalog, variant management, vision indexing status, and sync logs.
- `/console/reach` (**Reach**): Campaigns, comment-to-DM rules, and follow-up playbooks.
- `/console/brain` (**Brain**): AI persona, guardrail definitions, knowledge base, and regression evaluation harnesses.
- `/console/signals` (**Signals**): Conversion events, Meta CAPI health, ROAS, and AI spend analytics.

### Mock API Routes
- `GET /api/feed`: Cursor-paginated catalog feed matching the developer docs.
- `GET /api/orders`: In-memory list of received orders.
- `POST /api/orders`: Order placement mock validating phone format `01[3-9]\d{8}` and `Idempotency-Key`.

---

## 4. Design System & Frontend Conventions

- **Theme:** Light commerce-admin aesthetic (white cards on soft grey `#f7f8f9`, hairline borders `#e2e5e9`, jade accent `--signal: #0a6e50`).
- **Typography:**
  - Display: Bricolage Grotesque (`--font-bricolage`)
  - Body: Inter Tight (`--font-inter`)
  - Bangla: Hind Siliguri (`font-[family-name:var(--font-hind)]`)
  - Data / Code / IDs: JetBrains Mono (`--font-mono`)
- **Icons & UI Primitives:**
  - Do NOT use emoji as icons. Always use custom SVG icons from `components/ui/icons.tsx`.
  - Use UI primitives from `components/ui/` (`Panel`, `Badge`, `Button`, `Meter`, `Sparkline`, etc.).
  - Reuse shared animations from `components/motion/` (`Reveal`, `Stagger`, `Counter`, `Magnetic`, `SPRING`).
  - Format currency using `bdt()` from `lib/format.ts`.
- **Layout & CSS Rules:**
  - Always use `minmax(0, Nfr)` for CSS grid column tracks to prevent horizontal overflow caused by long strings/code blocks.
  - Base responsive grids must include `grid-cols-1`.
  - Body uses `overflow-x: clip` (do not change to `hidden`, as it breaks sticky headers).
  - All status colors on 10% tint (`bg-amber/10 text-amber`) must maintain WCAG AA contrast ratio (> 4.5:1).

---

## 5. Mock Data Guidelines

- All mock data resides in `data/`:
  - `types.ts`, `tenant.ts`, `catalog.ts`, `threads.ts`, `operations.ts`, `brain.ts`, `plans.ts`
- Primary tenant identity: **Nokshi & Co.** (Dhaka handloom/lifestyle brand).
- ID conventions:
  - Orders: `NP-...`
  - Idempotency Keys: `np_ord_...`
- **Important Note:** Reference files (`alap_ai_comprehensive_documentation.md`, `Next_Product_SYSTEM_DOCUMENTATION.md`, and `Multi-Tenant SaaS API.yaml`) describe external/legacy systems. Use them only for domain facts (courier rules, BD phone formats, CAPI specifications). Never mix their legacy naming or IA into this project.

---

## 6. Developer Commands

```bash
# Run local dev server
npm run dev

# Run TypeScript typechecks
npm run typecheck

# Run ESLint
npm run lint

# Production build
npm run build
```

---

## 7. Working Rules for AI Agents

1. **Maintain Documentation:** Keep `SITE.md` and `AGENT.md` updated whenever features, routes, or UI architecture change.
2. **Preserve Frontend Focus:** Do not introduce databases (PostgreSQL, MongoDB, Prisma, etc.) or external backend runtimes unless explicitly instructed.
3. **Strict Design Discipline:** Adhere to typography rules, tokenized colors, Hind Siliguri font for Bangla text, and standard UI primitives.

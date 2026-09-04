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

- **Theme:** Light commerce-admin aesthetic (white cards on soft warm grey `#faf9f7`, hairline borders `#e7e4de`, jade accent `--signal: #0a6e50`).
- **Typography (Enterprise Standard):**
  - **Display / Headings:** Plus Jakarta Sans (`--font-display`, backwards-compatible alias `--font-bricolage`) — clean, modern, authoritative geometric sans.
  - **Body & UI:** Inter (`--font-sans`, backwards-compatible alias `--font-inter-tight`) — high-legibility digital interface standard.
  - **Bangla:** Hind Siliguri (`--font-hind`, `--font-bangla`) — integrated into the global `body` fallback chain (`var(--font-sans), var(--font-hind), ...`) so all mixed Bengali text renders crisp without manual classes.
  - **Data / Code / IDs:** JetBrains Mono (`--font-mono`, `--font-jetbrains`).
- **Secondary Navigation & Tabs:**
  - Do NOT create full-width horizontal navbar strips with borders spanning the whole screen for secondary tabs.
  - Use a floating frosted glass pill capsule (`bg-white/80 backdrop-blur-xl border border-line/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03] rounded-2xl p-1.5`) strictly wrapping the tab options.
  - Tabs styling: `text-[12.5px] 2xl:text-[13px]`, icon `size-4`, button height `h-9 px-3`, smooth spring active pill animation.
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

1. **Permission Required for Git Operations (MANDATORY):**
   - **ALWAYS ask for explicit user permission before running `git commit` and `git push`.**
   - **NEVER** automatically commit or push code without the user's prior approval.
   - When changes are ready, summarize the files modified, propose the commit message, and ask the user if they want to commit and push.
2. **Maintain Documentation:** Keep `SITE.md` and `AGENT.md` updated whenever features, routes, or UI architecture change.
3. **Preserve Architectural Focus:** Maintain robust typing, security, and consistent API contracts between Next.js frontend and FastAPI backend.
4. **Strict Design Discipline:** Adhere to typography rules, tokenized colors, Hind Siliguri font for Bangla text, and standard UI primitives.

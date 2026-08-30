# NextProduct AI (Ship Studio Project)

This is a Next.js 16+ App Router project with Tailwind CSS v4 and TypeScript.
It powers **NextProduct AI**, an enterprise-grade 24/7 conversational AI sales & logistics automation platform specialized for Bangladeshi E-Commerce & F-Commerce.

---

## 1. Project Overview & Architecture

### Core Modules:
1. **Omnichannel Messaging Gateway**:
   - Meta WhatsApp Cloud API (0% ban risk)
   - Facebook Messenger & Instagram Direct (Post comments auto-reply + DM catalog links)
   - Web Chat live customer widget with phone KYC validation.
2. **Bangla / Banglish NLP & Multimodal Vision**:
   - Understands colloquial Bangla script, phonetic Banglish (*"vai ei runner size 42 available ache?"*), and English.
   - Multimodal Vision Engine for matching product screenshot uploads with catalog SKUs.
3. **Logistics Handshake (Steadfast & Pathao Courier)**:
   - Steadfast Courier API (`https://portal.steadfast.com.bd/api/v1/create_order`) with automatic parcel consignment creation and 11-digit phone number regex validation.
   - Pathao Courier API (`https://api-hermes.pathao.com/aladdin/api/v1/orders`) for multi-store pickup and tracking.
4. **API Endpoints**:
   - `GET /api/feed`: Standardized JSON product feed.
   - `POST /api/orders`: Website & in-chat order webhook with `Idempotency-Key` deduplication.
5. **Meta Conversions API (CAPI)**:
   - Server-side pipeline for `Lead`, `QualifiedLead`, and `Purchase` event attribution.
6. **Automated Bangla Invoicing**:
   - Branded printable invoice (চালান) with itemized COD breakdowns and courier tracking codes.

---

## 2. Design System & Theme Tokens

- **Accent Color:** Sky-Blue (`#0ea5e9` / `var(--accent)`, hover: `#0284c7`, light: `#e0f2fe`)
- **Background:** Soft Slate Light (`#f0f4f8` / `var(--background)`)
- **Cards & Surfaces:** Clean White (`#ffffff` / `var(--surface)`)
- **Text:** Slate Navy (`#0f172a` / `var(--foreground)`) & Muted Slate (`#64748b` / `var(--muted)`)
- **Success:** Emerald (`#10b981` / `var(--success)`)

---

## 3. Key Pages & Routes

- **Homepage (`/`)**: High-converting landing page with live rotating headline hero, interactive simulation chat widget, verified client proof, 4-step onboarding, and BDT pricing tiers (৳0 / ৳299 / ৳999).
- **Operations Hub (`/dashboard`)**: Full 8-tab operations dashboard:
  1. `Overview & Telemetry`
  2. `Live Omnichannel Inbox` (Bangla/Banglish NLP + Vision matching + human takeover)
  3. `Orders & Bangla Invoicing` (Itemized PDF invoice viewer)
  4. `Catalog & Feed API` (Live JSON feed sync)
  5. `WhatsApp Broadcasts` (Segmented marketing campaigns)
  6. `Steadfast & Pathao Logistics` (1-Click parcel booking console)
  7. `Meta CAPI Attribution` (Server-side test event validator)
  8. `AI Persona & Schema Mapper` (Guardrails and JSON token mapping)

---

## 4. Skills & Guidelines

You have specialized skills in `.claude/skills/`. Keep `SITE.md` updated as the single source of truth after any feature or UI change.

### Development Commands:
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`

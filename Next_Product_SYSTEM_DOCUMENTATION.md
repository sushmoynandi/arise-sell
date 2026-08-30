# আলাপ AI (alapai.app) — System Documentation

**Scanned:** 30 August 2026
**Scope:** `https://alapai.app` (marketing + dashboard) and `https://api.alapai.app` (REST API)
**Method:** Authenticated browser walk of every dashboard route, marketing site, developer docs, plus extraction of the live OpenAPI 3 schema published at `/api/schema/` and rendered at `/api/docs/`.

---

## 0. How to read this document

Findings are labelled so you can tell what was actually observed from what was reasoned:

| Label | Meaning |
|---|---|
| **[FACT]** | Directly observed — a rendered page, an HTTP response, a field in the published OpenAPI schema. |
| **[INFER]** | Deduced from strong evidence, but not directly visible from outside. Evidence is stated. |
| **[OPINION]** | Engineering judgement / recommendation. |

The backend source code was **not** available during this scan. Everything about the backend is derived from the public OpenAPI schema and observable HTTP behaviour. Section 6 (database) is therefore the most inference-heavy part of the document, and says so explicitly.

---

## 1. Product overview

**[FACT]** আলাপ AI is a multi-tenant SaaS that gives a merchant an AI sales-and-support agent which converses with their customers on Messenger, WhatsApp, Instagram and a website widget, answers product questions, and places orders — targeted primarily at Bangladeshi e-commerce and service businesses.

| Attribute | Value |
|---|---|
| Positioning | "AI Sales & Support Agent for E-commerce" |
| Primary market | Bangladesh (BDT currency, Bangla/Banglish/English, local couriers) |
| Business types supported | `ecommerce`, `services` |
| Tenancy model | Organization → Business → (Users, Team members) |
| Locales | `en`, `bn` (route prefix `/[locale]/…`) |
| Currencies | `BDT`, `USD` |
| Billing unit | **Conversation** (one customer chat in 24h, ~4–5 AI replies), not per message |

### Public pricing (marketing site)

| Plan | Price | Conversations | Headline entitlements |
|---|---|---|---|
| Free | ৳0 one-time | 100 (non-refilling) | Trial, no card |
| Starter | ৳299 / mo | 250 | Full in-chat ordering, leads with phone, white-label (branding removed) |
| Pro | ৳999 / mo | 900 | Messenger + WhatsApp + Instagram, ad-comment auto-reply, courier booking + tracking, re-engagement follow-ups, Bangla invoice with logo, sales dashboard |
| Business | ৳4,999 / mo | 5,000 | Up to 5 Facebook pages, shared team inbox, Meta ad lead tracking, automatic product feed import, priority support |
| Enterprise | Contact | >5,000 | Custom limit, fair-use, dedicated support |

**[FACT]** Overage is metered ("extra conversations continue at a small per-conversation rate") rather than hard-capped — the API exposes `rate_per_message`, `balance_conversations` and `billing_model ∈ {quota, conversation_quota, credit}`.

---

## 2. System architecture

```
                    ┌──────────────────────────────┐
   Customers ──────►│  Meta webhooks               │
   (Messenger,      │  /integration/{ch}/webhook/  │
    WhatsApp,       └──────────────┬───────────────┘
    Instagram)                     │
                                   ▼
  Merchant ──► alapai.app  ──►  api.alapai.app  ──►  LLM / image / video providers
              (Next.js 14+       (Django REST            (Vertex AI, OpenRouter)
               App Router,        Framework,
               RSC, i18n)         JWT auth)         ──►  Couriers (Steadfast, Pathao)
                    ▲                  │
                    │                  ├──►  Merchant Product Feed API  (pull, every 6/24h)
              Cloudflare              ├──►  Merchant Website Order API (push)
              (proxy, RUM)            └──►  Telegram (alerts), Meta CAPI (conversions)
```

### 2.1 Frontend

| Item | Evidence | Status |
|---|---|---|
| Next.js App Router (React Server Components) | `/_next/static/chunks/app/%5Blocale%5D/(auth)/…`, `Vary: RSC, Next-Router-State-Tree, Next-Router-Prefetch`, `?_rsc=` prefetches | **[FACT]** |
| Route groups: `(auth)` for the dashboard, `[locale]` for i18n | chunk filenames | **[FACT]** |
| Served behind Cloudflare | `Server: cloudflare`, `cf-cache-status`, `/cdn-cgi/rum` beacon | **[FACT]** |
| Cloudflare Web Analytics + Google Analytics 4 (`G-XMB0J8X9RY`) | script tags | **[FACT]** |
| No service worker, no IndexedDB, no PWA offline layer | `navigator.serviceWorker.getRegistrations() === 0` | **[FACT]** |
| `localStorage` used only for `active-business` and a session id | enumerated keys | **[FACT]** |
| No WebSocket / SSE client in the dashboard bundle | scan of all `_next` chunks found no `wss://`, `socket.io`, `pusher`, or `EventSource` usage | **[FACT]** |

### 2.2 Backend

| Item | Evidence | Status |
|---|---|---|
| Django + Django REST Framework | Trailing-slash URLs everywhere, DRF ViewSet action naming (`partial_update`, `destroy`, `bulk_delete`), schema title "Multi-Tenant SaaS API" | **[FACT/INFER]** — schema is DRF-shaped beyond reasonable doubt |
| `drf-spectacular` for OpenAPI 3 | `/api/schema/` + `/api/docs/`, operationIds in `v1_products_partial_update` style, `Patched*Request` component naming | **[FACT]** |
| JWT auth, likely `djangorestframework-simplejwt` | `/api/auth/token/refresh/`, `/api/auth/token/verify/`, schema description says "Includes JWT authentication" | **[FACT/INFER]** |
| Google OAuth sign-in | `POST /api/auth/login/google/` | **[FACT]** |
| Separate API origin (`api.alapai.app`) | all XHR | **[FACT]** |
| Asynchronous worker + scheduler (Celery/RQ + beat) | `ScrapeJob` with `pending/running/done/failed` + `started_at`/`finished_at`; `PostAutomation` with `next_run_at`/`last_run_at`/`consecutive_failures`; campaign `launch`/`progress`; feed sync "every 6h or 24h" | **[INFER]** — high confidence |
| Object storage for media | `MediaAsset.file_url`, product images "downloaded and re-hosted" per feed docs | **[INFER]** |

### 2.3 API surface size

**[FACT]** 242 paths / **357 operations** in the published schema, 192 component schemas.

| Module | Ops | Module | Ops |
|---|---:|---|---:|
| `auth` (incl. org, business, team, billing) | 94 | `orders` | 15 |
| `integration` | 44 | `business-knowledge` | 12 |
| `campaigns` | 35 | `scrapers` | 8 |
| `tools` (image/video/auto-post) | 31 | `leads` | 7 |
| `reseller` | 25 | `categories` / `business-kyc-fields` | 6 / 6 |
| `products` | 20 | `conversations` / `alerts` | 6 / 6 |
| `dashboard` | 17 | `courier` / `onboarding` | 5 / 5 |
| — | — | `website-orders`, `lead-stage-events`, `public`, `messages`, `media-assets` | 4, 4, 3, 2, 2 |

---

## 3. Feature inventory

### 3.1 Dashboard navigation (as shipped)

| Group | Page | Route | What it does |
|---|---|---|---|
| Your AI | Products | `/[locale]/products` | Catalog CRUD; import from Facebook posts, from a product feed, CSV upload |
| Your AI | Knowledge Base | `/[locale]/knowledge` | Tabs: AI Persona, FAQ, Delivery, Return & Refund, About, Contact, KYC Fields |
| Your AI | Services | `/[locale]/services` | Free-text service entries (price, sizes, instructions) for service businesses |
| Your AI | Website | `/[locale]/web` | Web scraping — extract products/prices from any e-commerce URL |
| Your AI | Try Your AI | `/[locale]/chat/[threadId]` | Sandbox test chat against the live agent config |
| Go live | Integrations | `/[locale]/integrations` | Website Widget, Facebook/Messenger, WhatsApp, Instagram (private-only) |
| Activity | Dashboard | `/[locale]/dashboard` | Activity + Orders/Revenue KPIs, daily conversations chart, orders-over-time |
| Activity | Inbox | `/[locale]/inbox` | Shared inbox, filters: All / Pending / AI / Human / Resolved |
| Activity | Comments | `/[locale]/comments` | Facebook post/ad comments + AI auto-reply; tags: Bad / Spam / Offensive |
| Activity | Campaigns *(BETA)* | `/[locale]/campaigns` | WhatsApp campaigns: Campaigns, Customers, Templates, Do-not-message |
| Activity | Leads | `/[locale]/leads` | Lead list + CSV export + manual create |
| Activity | Orders | `/[locale]/orders` | Order list, manual create, status workflow, shipment |
| Top bar | Automation | `/[locale]/tools` | Prompt Gallery, Motion Graphics, Auto Posting, image-model selection |
| — | Settings | `/[locale]/settings` | 10 tabs (below) |

**Settings tabs [FACT]:** Account Info (+ Team), Business Settings, Branding, Invoice, Notifications, Meta Ad Conversions, Courier, Product Feed, Website Orders, Billing.

### 3.2 AI agent capabilities

| Capability | Evidence |
|---|---|
| Bangla / Banglish / English conversation | Marketing copy + observed test chat replying in Bangla **[FACT]** |
| Bangla voice-message understanding; optional voice replies | `default_reply_method ∈ {text, voice}` **[FACT]** |
| AI Persona generation from catalog + knowledge | `POST /auth/business/generate-persona/`, "Generate with AI" button **[FACT]** |
| Customer product-photo recognition | `Business.clip_match_threshold`, `Product.embedding_updated_at` **[FACT]** → CLIP-style image embedding match **[INFER]** |
| Retrieval over products + knowledge | `embedding_updated_at` on Product; knowledge entries with AI image descriptions **[INFER]** |
| In-chat order taking (item, size, address, payment) | `Order`, `OrderItem`, order status machine **[FACT]** |
| Configurable KYC slot-filling | `BusinessKYCField {slot_name, label, question_text, ask_when, order}` **[FACT]** |
| Human takeover / return-to-AI / resolve | `dashboard/conversations/{id}/{accept,takeover,send,return-to-ai,resolve}` **[FACT]** |
| Automatic re-engagement follow-ups with quiet hours | `followup_enabled`, `followup_max_attempts`, `followup_delay_minutes`, `followup_tone`, `followup_quiet_start/end`, `timezone`, `followup_proof_snippets`, `followup_allowed_offers`, `followup_excluded_customer_ids` **[FACT]** |
| Holding ("typing…") message while thinking | `holding_message_enabled`, `holding_message_text` **[FACT]** |
| Message debouncing (batch rapid customer messages) | `message_debounce_seconds` **[FACT]** |
| Learning loop from the inbox | `messages/{id}/add-product/`, `add-knowledge/`, `dismiss/` — an operator turns a missed answer into catalog/knowledge **[FACT]** |
| Comment → DM handoff | `comment_dm_enabled`, separate `comment_prompt` **[FACT]** |

### 3.3 Content-generation tools (`/tools`)

| Tool | Detail |
|---|---|
| Prompt Gallery | Community + private templates with `placeholders`, `default_params`, `run_count`, `like_count`, favourites, reporting, moderation status `live/flagged/removed`, visibility `public/unlisted/private` **[FACT]** |
| Motion Graphics | Image→video with `with_audio`, `enhanced_prompt`, `voiceover_script`, `image_analysis` **[FACT]** |
| Auto Posting | Scheduled daily AI-generated product posts to a Facebook page (`post_time`, `timezone`, `next_run_at`, `consecutive_failures`, `run-now`, `toggle`) **[FACT]** |
| Image models | `gemini-3.1-flash-lite-image` (৳4.55, ~5s), `gemini-3.1-flash-image` (৳9.11, ~12s), `openai/gpt-image-2` (৳3.53, ~32s); providers `vertex` \| `openrouter` **[FACT]** |
| Cost accounting | `cost_micro_usd` vs `charged_micro_usd` on every generation — provider cost and merchant charge tracked separately **[FACT]** |

### 3.4 White-label / reseller programme

**[FACT]** A full reseller tier exists in the API but is not exposed in this merchant dashboard: `/api/reseller/{organization_id}/…` with company CRUD, per-company password reset, daily usage, invoices, custom pricing plans, custom FAQs and custom branding. Combined with `/api/public/branding/` and `/api/public/faqs/`, this is a **multi-brand white-label platform**, not just a single SaaS.

---

## 4. Integrations

### 4.1 Messaging channels

| Channel | Status in UI | API |
|---|---|---|
| Website Widget | Available | `integration/widgets/` with `public_key` + `allowed_origins` |
| Facebook / Messenger | Available | `integration/messenger/webhook/`, `messenger/conversations/`, page webhook subscribe, `platform/page/{page_uuid}/` |
| WhatsApp (official Cloud API / BSP) | Available | `integration/whatsapp/webhook/`, `whatsapp/events/`, `whatsapp/templates/…` |
| Instagram | Available, badged **Private only** | `integration/instagram/webhook/` — DMs, comments, and post publishing |
| OAuth callback (generic) | — | `POST /integration/{platform}/callback/` |

**[FACT]** The marketing site claims "Verified Meta Tech Provider" and use of the official WhatsApp Business Platform, with template submission/approval flow (`templates/create/`, `templates/{id}/submit/`, `templates/{id}/sync/`, `templates/quick-setup/`, `templates/polish/`).

### 4.2 Meta Conversions API (CAPI)

**[FACT]** `integration/capi/{config,health,preflight,go-live}/` — server-side conversion events back to Meta ads, with a preflight check and an explicit go-live gate. Surfaced as the "Meta Ad Conversions" settings tab.

### 4.3 Merchant Product Feed API (inbound catalog sync)

**[FACT]** Documented publicly at `/en/docs/product-feed-api`. Contract v1:

| Aspect | Specification |
|---|---|
| Endpoint | `GET {base}/alapai/products?page=N&limit=250` (+ optional `/alapai/health`) |
| Auth | `X-API-Key` or `Authorization: Bearer`, enforced **by the merchant**; constant-time compare mandated |
| Dedup key | `external_id` — stable, never reused |
| Pagination | Required; stable ordering by primary key |
| Stock semantics | `stock` preferred over `in_stock`; **fail-closed** — absent both ⇒ imported out of stock |
| Variations | ≤50 per product, `variation_id` must match the merchant's own checkout id |
| Empty-catalog guard | 200 + `[]` explicitly forbidden; refuses an empty page from a previously non-empty feed |
| Limits | 10s connect, 30s read/page, 25 MB/page, ≤3 redirects, HTTPS only, sync every 6h/24h + manual |
| Flexible ingestion | Also reads Shopify `/products.json`, Google Merchant / Facebook catalog JSON, or any JSON via a saved field mapping (`feed/detect-mapping/`) |
| Signing | **Not** in v1 — no HMAC; static egress IP offered for allowlisting |

Other catalog import paths **[FACT]**: `products/import_from_fb_post/`, `products/latest_fb_posts/`, `products/upload_csv/` + `download_csv_template/`, and the `scrapers/scrape-products/` web-scraping job (token-metered: `total_input_tokens`, `total_output_tokens`).

### 4.4 Merchant Website Order API (outbound order push)

**[FACT]** `website-orders/config/` + `config/test/` + `config/propose-template/`. আলাপ AI can place the order on the merchant's own site; `propose-template` uses AI to draft the request template and response mapping from the merchant's endpoint. `Order.is_website_order` distinguishes these.

### 4.5 Couriers

**[FACT]** `courier/{providers,accounts,accounts/connect,stores}/`; shipment providers enum `steadfast | pathao`. Orders expose `POST /orders/{id}/ship/` and `POST /orders/{id}/shipment/refresh/`. `PlaceShipment` carries recipient name, primary and secondary phone, address, `cod_amount`, `delivery_type`, item description/quantity/weight and a note. The merchant's pickup `store_id` is chosen once in Settings from `courier/stores/`.

### 4.6 Alerts

**[FACT]** `alerts/{settings,link-token,test}/`, `alerts/channels/{id}/`, and `alerts/telegram/webhook/` — Telegram is a supported alert channel, linked via a one-time token.

### 4.7 Third-party services observed

| Service | Use |
|---|---|
| Cloudflare | Proxy/CDN + RUM analytics |
| Google Analytics 4 | Marketing + app analytics |
| Google Vertex AI / OpenRouter | Image & video generation providers |
| Meta Graph API | Messenger, Instagram, WhatsApp, CAPI, page posting |
| Steadfast, Pathao | Courier fulfilment |
| Telegram | Operational alerts |

---

## 5. Domain state machines

**[FACT]** All enums below are taken verbatim from the schema.

| Machine | States |
|---|---|
| Order status | `pending → confirmed → processing → completed`, plus `cancelled`, `failed` |
| Lead stage | `intake → qualified → order_placed → converted`, plus `lost`, `not_qualified` |
| Lead stage event | `pending_review → queued → sent`, plus `failed`, `rejected`, `skipped` |
| Subscription | `trial, active, past_due, suspended, expired, canceled` |
| Invoice | `pending, paid, void, failed` |
| Scrape job | `pending, running, done, failed` |
| Generation | `pending, processing, completed, failed` |
| Prompt template moderation | `live, flagged, removed` |
| Team role | `OWNER, ADMIN, MEMBER, MODERATOR` |
| Moderator section grants | `inbox, orders, leads, comments, products, knowledge, services, chat, web` |
| Knowledge category | `faq, service, delivery, return, about, contact, other` |
| Lead source | `order, booking, manual, ai, agent` |
| Message direction | `inbound, outbound` |

**[FACT]** `LeadStageEvent` has `confidence` plus `confirm`/`reject` endpoints — the AI proposes a stage transition and a human approves it. That is a well-designed human-in-the-loop pattern.

---

## 6. Database and data model

> **Read this caveat first.** The database was not directly observable. What follows is (a) the **effective data model**, which is factual because it comes from the published schema, and (b) an **inference about the storage engines**, with the evidence for each inference stated. Treat 6.1 as fact and 6.2 as a hypothesis to confirm against `settings.py` / `requirements.txt`.

### 6.1 Storage engine — inference

| Layer | Most likely technology | Confidence | Evidence |
|---|---|---|---|
| Primary OLTP store | **PostgreSQL** via Django ORM | High | Django/DRF confirmed; heavy use of JSON-shaped fields (`state_data`, `metadata`, `custom_fields`, `kyc_data`, `params`, `placeholders`, `default_params`, `tags`) which map to `JSONField`/`jsonb`; integer surrogate PKs plus selective UUIDs (`Platform.uuid`, `page_uuid`) |
| Vector search | **pgvector** (or an external vector store) | Medium-High | `Product.embedding_updated_at` is exposed on the product serializer, and `Business.clip_match_threshold` is a similarity cut-off — so embeddings exist and are refreshed per product. A dedicated column beside the product row is the simplest explanation |
| Cache / broker | **Redis** | Medium-High | Async job model (`ScrapeJob`, generations, campaign launch/progress) and a scheduler (`next_run_at`) imply Celery/RQ, which in this stack almost always means Redis |
| Object storage | **S3-compatible bucket / CDN** | Medium-High | `MediaAsset.file_url`, `ProductMedia.image`, feed docs state images are downloaded and re-hosted |
| Analytics | Same OLTP store, aggregated on read | Medium | `orders/analytics/`, `conversations/analytics/`, `followup-stats/` are ordinary endpoints; no separate warehouse surface is visible |

**[FACT] Multi-tenancy is row-level, not schema-level or database-per-tenant.** Every business-owned entity carries an explicit `business` foreign key (`Product.business`, `Order.business`, `Lead.business`, `Conversation.business`, `Category.business`, `BusinessKnowledge.business`, `BusinessKYCField.business`), and `ScrapeJob` carries `tenant_id`. Active tenant is selected by `POST /auth/business/switch/` and cached client-side in `localStorage["active-business"]`.

**[FACT] Money is stored as scaled integers, not floats** — `cost_micro_usd`, `charged_micro_usd`, `balance_raw`, `rate_per_message_raw`, with separate `*_display` strings for the UI. This is correct practice and worth preserving.

### 6.2 Entity catalogue (fields verbatim from the schema)

#### Tenancy & identity

| Entity | Fields |
|---|---|
| `User` | `id, email, first_name, last_name, phone_number, language, is_verified, date_joined, role, membership_role, membership_sections, active_business` |
| `Organization` | name, slug, memberships; owns businesses |
| `OrganizationMembership` | `id, user, user_email, user_name, organization, role ∈ {OWNER, ADMIN, MEMBER, MODERATOR}, allowed_sections, joined_at, invited_by, invited_by_email` |
| `Business` | `id, organization, organization_name, name, slug, description, business_type, is_active, integration_count, created_at, updated_at` |
| `BusinessSettings` | `industry, onboarding_completed, onboarding_step, default_reply_method, comment_dm_enabled, system_prompt, comment_prompt, currency, holding_message_enabled, holding_message_text, order_status_notifications_enabled, clip_match_threshold, message_debounce_seconds, default_image_model, followup_enabled, followup_max_attempts, followup_delay_minutes, followup_tone, followup_quiet_start, followup_quiet_end, timezone, followup_proof_snippets, followup_allowed_offers, followup_excluded_customer_ids, followup_instructions` |
| `BusinessBranding` | white-label assets (logo, name shown to customers) |
| Team member | business, user, `role`, `sections[]` grant list |

#### Catalog

| Entity | Fields |
|---|---|
| `Category` | `id, business, name, slug, description, parent` (self-referential tree) |
| `Product` | `id, business, business_name, name, description, price, regular_price, flash_price, is_discounted, category, category_name, stock, brand, free_delivery, is_active, media[], variations[], discount_policy, embedding_updated_at, created_at, updated_at` |
| `ProductVariation` | `id, product, color, size, sku, price_override, price, stock, is_active, media[]` |
| `ProductMedia` | `id, media_type ∈ {preview, original}, image, sort_order` |
| `MediaAsset` | `id, kind ∈ {image, video, audio}, file_url, mime_type, width, height, visibility, caption, source_template_id, created_at` |

#### Knowledge

| Entity | Fields |
|---|---|
| `BusinessKnowledge` | `id, business, category, title, content, media[], is_active, timestamps` |
| `KnowledgeMedia` | `id, image, title, ai_description, sort_order` — images carry an AI-generated description so they are retrievable by text |
| `BusinessKYCField` | `id, business, slot_name, label, question_text, ask_when, order, is_active` |
| `ScrapeJob` | `id, tenant_id, website_url, status, started_at, finished_at, total_found, total_saved, total_input_tokens, total_output_tokens, error, message` |

#### Conversations

| Entity | Fields |
|---|---|
| `Conversation` | `id, business, messenger_user_id, customer_name, state_data, is_active, message_count, last_message, timestamps` |
| `Message` | `id, conversation, messenger_message_id, direction, content, metadata, created_at` |

**[OPINION]** `state_data` on `Conversation` is the agent's per-customer working memory (cart, KYC slots filled, follow-up counters). It is the single highest-risk field in the schema: opaque, unversioned, and read on every inbound message.

#### Commerce

| Entity | Fields |
|---|---|
| `Order` | `id, business, product, variation, conversation_id, messenger_user_id, customer_name, phone, delivery_address, product_name, variation_color, variation_size, quantity, unit_price, discount_amount, delivery_charge, total_amount, additional_items, is_itemized, is_website_order, status, notes, custom_fields, shipment, timestamps` |
| `OrderItem` | `id, product, variation, product_name, variation_color, variation_size, quantity, unit_price, line_total` |
| `PlaceShipment` | `provider ∈ {steadfast, pathao}, recipient_name, recipient_phone, recipient_secondary_phone, recipient_address, cod_amount, note, item_description, delivery_type, item_quantity, item_weight` |
| `Lead` | `id, business, messenger_user_id, customer_name, phone, delivery_address, kyc_data, lead_stage, deal_value, timestamps` |
| `LeadStageEvent` | `id, stage, source, confidence, status, value, currency, dispatched_at, customer_name, messenger_user_id` |

**[OPINION]** `Order` is a **hybrid schema**: it holds both a single denormalised product (`product`, `variation`, `product_name`, `unit_price`, `quantity`) *and* an itemised path (`additional_items`, `is_itemized`, `OrderItem`). Every consumer must branch on `is_itemized`. This is the clearest piece of accumulated modelling debt in the system — see §8.

#### Billing

| Entity | Fields |
|---|---|
| `Subscription` | `plan, status, interval, interval_count, current_period_start/end, trial_end, cancel_at_period_end, is_free_plan, started_at` |
| `Invoice` | `invoice_number, status, amount, amount_display, currency, period_start/end, due_at, paid_at, plan, issuer, provider` |
| Credit balance | `balance, balance_raw, balance_conversations, currency, balance_unit, rate_per_message, plan, subscription_status, is_free_plan` |
| `ResellerPricingPlan` | `billing_model ∈ {credit, quota}, name, description, currency, validity_days, is_popular, sort_order, interval, interval_count, trial_days, is_recurring, recharge_amount, rate_per_message, bonus_amount, price, message_quota, conversation_quota` (+ `*_display` strings) |

---

## 7. Security review

### What is already right **[FACT]**

- No JWT in `localStorage`, `sessionStorage`, `IndexedDB`, or the server-rendered RSC payload (searched for `eyJ…` patterns — zero hits). Tokens are not exposed to page scripts.
- Short-lived access token + refresh/verify endpoints.
- HTTPS everywhere; API on a separate origin from the app.
- Website widget scoped by `public_key` + `allowed_origins`.
- Granular moderator permissions (`sections[]`), with Integrations, Billing and Team reserved to the owner.
- The Product Feed contract mandates constant-time key comparison, HTTPS-only, no private/loopback hosts, ≤3 redirects, and `APP_DEBUG=false` — this is unusually good third-party integration guidance.
- Campaign opt-out enforced by a first-class `suppressions` resource ("do not message").

### Findings

| # | Severity | Finding | Evidence | Recommendation |
|---|---|---|---|---|
| S1 | **High** | The full OpenAPI schema and Swagger UI are public and unauthenticated at `/api/schema/` and `/api/docs/`, including the entire `reseller` admin surface (25 ops) and every internal field name | Fetched anonymously during this scan | Gate `/api/docs/` and `/api/schema/` behind staff auth, or serve them only in non-production. Publish a curated public spec if partners need one |
| S2 | **Medium** | No security headers on the app HTML: no `Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options`/`frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy`, or `Permissions-Policy` | Response headers for `GET /en` returned only `server`, `cf-cache-status`, `cache-control`, `vary`, `alt-svc` | Add all six. HSTS + `X-Content-Type-Options: nosniff` + `frame-ancestors 'none'` are ~30 minutes of work at the Cloudflare edge |
| S3 | **Medium** | Product Feed v1 has no request signing; a leaked feed key gives a full catalog dump, and replay is undetectable | Stated explicitly in the merchant docs | Ship HMAC-SHA256 request signing with a timestamp + nonce in v2; keep the shared secret as the fallback |
| S4 | **Medium** | Feed keys, courier credentials, Meta tokens and CAPI tokens are all stored server-side per business — a single tenant compromise is broad | `courier/accounts/connect/` "exchange a merchant's courier login for a stored token" | Confirm envelope encryption at rest (KMS-backed, per-tenant DEK) rather than plain columns, and add token rotation + last-used auditing |
| S5 | **Low-Medium** | Catch-all action routes `POST /campaigns/{campaign_id}/{action}/` and `POST /reseller/{org}/companies/{company_id}/{action}/` accept an arbitrary path segment as a verb | Schema | Enumerate the actions as explicit routes; a catch-all is easy to under-authorise and impossible to type |
| S6 | **Low** | The web scraper accepts an arbitrary URL from a tenant | `scrapers/scrape-products/` | Confirm SSRF defences match the feed's (public HTTPS only, no private/loopback/link-local, redirect cap, DNS-rebinding-safe resolution). The feed contract documents these; the scraper should share the same fetcher |
| S7 | **Low** | Two identical API trees (`/api/auth/*` and `/api/v1/auth/*`, 94 ops combined) double the surface that must stay in policy-sync | Schema | Pick `/api/v1/`, `301` the legacy tree, delete after a deprecation window |

---

## 8. Improvement roadmap

Ordered by (impact ÷ effort). **[OPINION]** throughout.

### P0 — do next

| # | Item | Why | Effort |
|---|---|---|---|
| 1 | Add the six security headers (S2) | Free hardening at the CDN edge; clickjacking on a dashboard that can place orders and spend credit is a real risk | S |
| 2 | Close public API docs (S1) | You are currently publishing your reseller/admin surface and full data model to anyone | S |
| 3 | Real-time inbox transport | No WebSocket/SSE exists in the bundle; a shared human-takeover inbox that isn't push-driven means agents miss handoffs or you pay for aggressive polling. Django Channels + Redis, or SSE, or a hosted pub/sub | M |
| 4 | Resolve the `Order` dual shape | Make every order itemised (`OrderItem` always, even for one line); keep the flat fields as read-only computed values for one release, then drop them. Every future report, invoice and courier payload gets simpler | M |
| 5 | Idempotency keys on order creation and campaign launch | Chat-driven order placement over webhooks *will* double-fire. `Idempotency-Key` header + a unique constraint | S |

### P1 — next quarter

| # | Item | Why | Effort |
|---|---|---|---|
| 6 | Collapse `/api/auth/*` vs `/api/v1/auth/*` (S7) | Halves the auth surface to audit | S |
| 7 | Fix schema fidelity: list endpoints typed as `retrieve`, and inconsistent pagination (`Paginated*List` exists for Lead/Order/Product/Generation/MediaAsset/VideoGeneration/PostAutomation/PromptTemplate but not for conversations, messages, campaigns, comments) | Unpaginated collections are a latency cliff for your largest tenants, and a wrong schema makes generated TypeScript clients lie | M |
| 8 | Version and document `Conversation.state_data` | Add a `schema_version` key and a migration path. Today an agent-logic change can silently corrupt in-flight carts | M |
| 9 | Feed sync observability for merchants | Surface last sync time, products created/updated/marked-out-of-stock, and the last error, per sync, in Settings → Product Feed. Silent feed failures look like "the AI is lying about stock" | S |
| 10 | Product Feed v2 with HMAC signing (S3) | Removes replay and makes key leakage survivable | M |
| 11 | Cost guardrails on AI tools | `cost_micro_usd` is tracked but no per-business budget/ceiling is visible. Add monthly caps and alerts before a runaway auto-posting loop bills you | S |
| 12 | Dead-letter + retry policy for webhooks | Meta redelivery is not generous. A durable inbound queue with replay is the difference between "lost 40 customer messages" and "replayed them" | M |
| 13 | Align the marketing feature grid with reality | Four cards are badged COMING SOON — *Instant Notifications*, *Smart Delivery Estimation*, *Sales Dashboard & Analytics*, *Automated Marketing & Retargeting* — but the alerts API (incl. Telegram), the dashboard analytics endpoints and the campaigns module are all shipped. You are under-selling working features | S |

### P2 — strategic

| # | Item | Why |
|---|---|---|
| 14 | Reseller/white-label go-to-market | 25 endpoints, custom plans, branding and FAQs are already built but invisible. This is the highest-leverage unshipped asset in the codebase |
| 15 | Evaluation harness for the agent | Golden-set conversations (Bangla + Banglish) scored on order-completion, hallucinated price/stock, and escalation rate — run on every prompt or model change. Without it, `system_prompt` edits are unfalsifiable |
| 16 | Read-model separation for analytics | Once a tenant crosses ~10⁵ conversations, `orders/analytics/` and `conversations/analytics/` on the OLTP tables will hurt. Pre-aggregate to daily rollup tables |
| 17 | Per-tenant rate limiting and quota enforcement at the edge | Protects the conversation-based billing model from abuse and protects shared LLM capacity |
| 18 | bKash / Nagad payment capture in-chat | COD is handled at the courier layer (`PlaceShipment.cod_amount`), but there is no in-chat prepayment path. Advance payment cuts COD return-to-origin loss, which is the single largest margin leak in Bangladeshi e-commerce |
| 19 | Multi-page / multi-business reporting | Business plan sells "5 Facebook pages from one dashboard"; a cross-page consolidated view is the natural upsell surface |

---

## 9. Open questions (could not be verified from outside)

1. Actual database engine and version; whether `pgvector` or an external vector DB backs product-image matching.
2. Which LLM(s) serve the conversational agent (only image/video model providers are exposed).
3. Encryption-at-rest strategy for merchant OAuth tokens, courier credentials, and feed API keys.
4. Exact JWT storage mechanism and token lifetimes — not in any browser storage and not in the RSC payload, which is good, but the handoff path was not determined.
5. Whether the inbox polls on an interval (no requests were observed in a 20-second idle window on an empty inbox) or is event-driven server-side.
6. Backup/restore, retention policy for conversation transcripts, and PII deletion path (relevant to Meta platform policy).
7. Test coverage and CI, and whether the two API trees share one permission layer.

---

*Compiled from a live scan of alapai.app and its published OpenAPI schema on 30 August 2026. No write operations were performed against the account.*

---
name: nextproduct-backend-builder
description: Build and integrate the NextProduct AI FastAPI backend with the existing Next.js frontend. Covers project setup, database models, API endpoints, webhook ingestion, AI RAG pipeline, frontend wiring, and deployment.
---

# NextProduct AI Backend Builder Skill

## Overview
This skill guides the implementation of a **production-grade FastAPI backend** for the NextProduct AI platform — a multi-tenant SaaS for AI-powered sales & support automation on Facebook, Instagram, WhatsApp, and web chat, targeting Bangladeshi e-commerce.

## Reference Documents (MUST READ BEFORE STARTING)
1. **Implementation Plan:** `plan.md` — Full phase-by-phase roadmap with mock-to-API replacement map
2. **Backend Architecture:** `backend.md` — Component breakdown and tech stack
3. **Domain Types:** `data/types.ts` — TypeScript types that Pydantic schemas MUST match
4. **OpenAPI Spec:** `Multi-Tenant SaaS API.yaml` — Existing API contract reference
5. **System Docs:** `Next_Product_SYSTEM_DOCUMENTATION.md` — Full system behavior documentation

## Tech Stack
- **Framework:** FastAPI (Python 3.12+)
- **ORM:** SQLAlchemy 2.0 (async) with SQLModel optional
- **Schemas:** Pydantic v2
- **Database:** PostgreSQL 16 + pgvector extension
- **Cache/Queue:** Redis 7
- **Task Queue:** Celery 5.x with Redis broker
- **Migrations:** Alembic
- **Auth:** JWT (access + refresh tokens), bcrypt, TOTP 2FA (admin)
- **Testing:** pytest + httpx AsyncClient

## Critical Rules

### 1. Multi-Tenant Isolation (MANDATORY)
Every database query MUST include `business_id` filter. Never allow cross-tenant data leakage.

```python
# CORRECT
stmt = select(Order).where(Order.business_id == current_user.business_id)

# WRONG - tenant data leak!
stmt = select(Order).where(Order.id == order_id)
```

### 2. Schema Parity with Frontend Types
Pydantic response schemas MUST match the TypeScript interfaces in `data/types.ts`:

| TypeScript (`data/types.ts`) | Pydantic Schema |
|---|---|
| `Channel` | `Literal["whatsapp", "messenger", "instagram", "web", "telegram"]` |
| `Lang` | `Literal["bn", "banglish", "en"]` |
| `OrderState` | `Literal["awaiting_confirm", "confirmed", "packed", "in_transit", "delivered", "returned", "cancelled"]` |
| `Thread` | `ThreadResponse` with same fields |
| `Message` | `MessageResponse` with same fields |
| `Product` | `ProductResponse` with same fields |
| `Order` | `OrderResponse` with same fields |

### 3. Webhook Security
- Always verify `X-Hub-Signature-256` using HMAC-SHA256
- Acknowledge within 500ms with HTTP 200, then process async via Celery
- Idempotency: deduplicate by message ID

### 4. API Path Convention
All endpoints follow: `/api/v1/{resource}/`
Admin endpoints: `/api/v1/admin/{resource}/`
Webhooks: `/api/v1/webhooks/{provider}`

### 5. Async Everything
- Use `async def` for all route handlers
- Use `AsyncSession` for database operations
- Use `aiohttp` / `httpx.AsyncClient` for external API calls
- Never use `time.sleep()` — use Celery tasks for delays

## Implementation Order

### Phase 1: Foundation
1. `backend/app/main.py` — FastAPI app with CORS, middleware
2. `backend/app/core/config.py` — Environment config
3. `backend/app/core/database.py` — Async PostgreSQL connection
4. `backend/app/core/security.py` — JWT + bcrypt
5. `backend/app/models/` — All ORM models
6. `backend/alembic/` — Migration setup
7. `backend/docker-compose.yml` — PostgreSQL + Redis

### Phase 2: API Endpoints
Build in dependency order:
1. Auth (login, register, refresh)
2. Threads (inbox — most critical for the product)
3. Orders (fulfilment)
4. Catalog (products)
5. Brain (knowledge base, persona, guardrails)
6. Pipeline, Comments, Campaigns, Automations
7. Settings, Billing, Integrations
8. Admin endpoints

### Phase 3: Webhooks & AI
1. Meta webhook receiver
2. WhatsApp Cloud API processor
3. Celery async task pipeline
4. pgvector knowledge embedding
5. RAG search + LLM generation
6. Human handoff logic

### Phase 4: Frontend Wiring
1. Create `lib/api-client.ts` with JWT auto-refresh
2. Create React hooks per resource (`useThreads`, `useOrders`, etc.)
3. Replace each `data/*.ts` import with the corresponding hook
4. Wire WebSocket for live inbox
5. Wire SSE for dashboard stream

## Mock Data → Seed Script Mapping
When seeding the database, transform these frontend mock files:

| Frontend Mock File | Database Tables to Seed |
|---|---|
| `data/tenant.ts` | `organizations`, `businesses`, `users`, `connected_channels` |
| `data/threads.ts` | `conversations`, `messages` |
| `data/catalog.ts` | `products`, `variants`, `feed_syncs` |
| `data/operations.ts` | `orders`, `order_lines`, `pipeline_cards`, `campaigns`, `comment_rules`, `capi_events` |
| `data/brain.ts` | `ai_config`, `guardrails`, `knowledge_entries`, `eval_suites`, `playbooks` |
| `data/plans.ts` | `subscription_plans` |
| `data/admin.ts` | `admin_users`, `ai_provider_keys`, `courier_gateways`, `meta_app_configs`, `support_tickets`, `invoices`, `backups` |

## Code Review Integration
After completing each phase, submit code for review to the `code-reviewer` subagent. It will check:
- Multi-tenant isolation
- API contract consistency with frontend types
- Security (auth, HMAC, secrets)
- Async correctness
- Test coverage

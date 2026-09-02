
---
name: meta-automation-tester
description: Automated test execution and verification skill for Meta (WhatsApp Cloud API & Facebook Messenger) webhooks, Google Gemini 2.0 Flash NLU reasoning, and real-time full-stack UI transcript fetching.
---

# Meta & WhatsApp Automation Testing Skill

This skill defines the exact procedures for end-to-end execution, testing, and validation of Meta WhatsApp and Facebook Messenger automation with live Google Gemini AI and Next.js frontend streaming.

---

## 1. Architecture & Verification Flow

```
[Inbound Webhook Event] (WhatsApp / Messenger / Instagram)
        │ (HMAC-SHA256 Signature Verification)
        ▼
[FastAPI Webhook Receiver] (/api/v1/webhooks/whatsapp | /api/v1/webhooks/meta)
        │ (< 400ms HTTP 200 Handshake)
        ▼
[Celery Worker Queue] (ai_inference / webhooks)
        │
        ├─► [Dialect & Script Classifier] (Bangla / Banglish / English)
        ├─► [Intent NLU Engine] (Price / Delivery / Order KYC / Variants / Policy)
        ├─► [pgvector RAG Retrieval] (Store FAQ & Delivery Rules)
        ├─► [Screenshot-to-SKU Matcher] (Vision & Text Matching)
        ├─► [Human Handoff Evaluator] (Explicit / Angry Sentiment / Bulk Orders)
        └─► [Google Gemini 2.0 Flash LLM]
        │
        ▼
[Outbound Dispatcher] ──► [WhatsApp Cloud API / Meta Graph API v21.0]
        │
        ▼
[Live Frontend Fetch] ──► [Next.js Inbox & Playground UI]
```

---

## 2. Execution Guidelines

1. **Webhook Security:**
   - Every inbound webhook POST MUST be validated against `X-Hub-Signature-256` using `app.core.security.verify_webhook_signature` with `META_APP_SECRET`.
   - The GET endpoint MUST handle `hub.mode == "subscribe"` and match `hub.verify_token` against `META_VERIFY_TOKEN`, returning raw `hub.challenge`.

2. **AI Inference & Persona:**
   - Execute live prompt generation via `app.services.ai_gateway.execute_ai_gateway_prompt`.
   - When `GOOGLE_API_KEY` is present, route to Google Gemini 2.0 Flash.
   - Maintain the authentic Bangladeshi brand voice: warm, unhurried, uses "আপনি", default Bangla script with signature (`নকশী থেকে 🌾`).

3. **Frontend Integration:**
   - `app/console/playground/page.tsx` and `app/console/test-ai/page.tsx` MUST call `api.playground.testChat(message)` to display intent badges, dialect pills, and matched SKU attachments in real time.
   - `app/console/inbox/page.tsx` and `app/console/threads/page.tsx` MUST use `useThreads()` and `useThread(id)` to reflect live conversation state.

4. **Testing Protocol:**
   - Execute `scripts/test_gemini_webhook.py` to verify the 4 core test cases (Price, Shipping, Order KYC, Human Handoff).
   - Verify that `/openapi.json` returns HTTP 200 with all 70 endpoints active.

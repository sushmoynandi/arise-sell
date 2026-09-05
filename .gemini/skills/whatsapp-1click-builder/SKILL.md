---
name: whatsapp-1click-builder
description: Implementation and architecture skill for 1-Click Meta WhatsApp Embedded Signup onboarding, multi-tenant dynamic channel routing, and autonomous AI conversational commerce.
---

# 1-Click WhatsApp Embedded Signup & Automation Skill

This skill provides the architectural rules, backend endpoints, and frontend components required to deliver 1-click WhatsApp Business onboarding for SaaS merchants on AriseSell.

---

## 1. Technical Flow & Responsibilities

```
[Merchant UI] (/console/integrations)
      │
      ▼ (Clicks "Connect WhatsApp")
[Meta JavaScript SDK - FB.login()] (Embedded Signup Dialog)
      │
      ▼ (Returns { code, waba_id, phone_number_id })
[Backend API] (POST /api/v1/integrations/whatsapp/embedded-signup)
      │
      ├─ 1. Exchange OAuth code for permanent WABA access token
      ├─ 2. Subscribe WABA to AriseSell Webhooks
      ├─ 3. Register or update `connected_channels` table:
      │     - business_id: user.business_id
      │     - channel_type: "whatsapp"
      │     - identifier: phone_number_id
      │     - label: "WhatsApp Business"
      │     - is_live: True
      ▼
[Inbound Webhook Routing] (/api/v1/webhooks/whatsapp)
      │
      ▼
[Dynamic Channel Resolver] (tasks_webhook.py)
      SELECT business_id FROM connected_channels WHERE identifier = phone_number_id
      │
      ▼
[Isolated RAG Knowledge & Catalog Search]
      SELECT * FROM products WHERE business_id = resolved_business_id
      SELECT * FROM ai_personas WHERE business_id = resolved_business_id
      │
      ▼
[Google Gemini 3.5 Flash Reasoning] ──► [WhatsApp Outbound API]
```

---

## 2. Implementation Rules

1. **Backend Integration (`backend/app/api/v1/integrations.py`):**
   - Provide `POST /integrations/whatsapp/embedded-signup` endpoint taking `{ code, waba_id, phone_number_id, phone_number }`.
   - Persist to database in `ConnectedChannel` table.
   - Return `{ success: true, channel_id, label, status: "live" }`.

2. **Multi-Tenant Webhook Routing (`backend/app/workers/tasks_webhook.py` & `tasks_ai.py`):**
   - Extract `phone_number_id` from incoming WhatsApp payload (`entry[0].changes[0].value.metadata.phone_number_id`).
   - Extract Meta Page ID from incoming Messenger payload (`entry[0].id` or `recipient.id`).
   - Query `ConnectedChannel` to find matching `business_id`.
   - Pass resolved `business_id` to `dispatch_ai_reply_task`.

3. **Frontend Integration (`app/console/integrations/page.tsx`):**
   - Add interactive **"Connect WhatsApp in 1-Click"** button.
   - Open Embedded Signup modal with Meta Login flow.
   - Display real-time connection badge (🟢 Live & Automated).

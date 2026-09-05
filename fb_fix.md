# 🛠️ AriseSell — Meta Embedded Signup & WhatsApp AI Reply Master Fix Plan

This document outlines the diagnosis and complete technical resolution for:
1. **Meta Official Automated OTP Flow (Embedded Signup via Meta SDK)** vs. custom OTP.
2. **End-to-End WhatsApp AI Auto-Reply Pipeline (Zero-Drop Webhook Execution)**.

---

## 🔍 1. Root Cause Analysis

### Problem 1: Why Meta should handle the OTP automatically
* **The Issue:** We created an internal custom OTP generator in the modal. But in reality, **Meta (Facebook) handles phone verification and OTP delivery automatically** inside the official Meta Embedded Signup dialog (`FB.login`).
* **The Solution:** 
  1. Integrate the official **Meta JavaScript SDK (`FB.init` & `FB.login`)** with `whatsapp_business_management` and `whatsapp_business_messaging` permissions.
  2. When the merchant clicks **"⚡ Connect with Meta Facebook Login"**, Meta's official popup launches.
  3. Meta asks for the merchant's phone number and sends the official Meta 6-digit SMS code.
  4. Once verified inside Meta's popup, Meta's `sessionInfoListener` sends `{ code, waba_id, phone_number_id }` back to our app.
  5. Our frontend sends these IDs to `POST /api/v1/integrations/whatsapp/embedded-signup` to activate the AI bot immediately.
  6. Provide a 1-click **"⚡ Instant Sandbox Connect"** button for local development and testing before Meta App Review.

---

### Problem 2: Why WhatsApp AI Reply was not firing on incoming messages
* **The Issue:** 
  - When incoming webhooks hit `POST /api/v1/webhooks/whatsapp`, the endpoint tried to dispatch via `process_whatsapp_webhook_event.delay(payload)`.
  - In local development or standalone setups where Redis and Celery worker daemon (`celery -A app.workers.celery_app worker`) are not running in the background, Celery threw a connection error that was caught by `except Exception: pass`, resulting in the webhook message being dropped silently without AI reasoning!
* **The Solution:**
  - **Dual-Engine Webhook Dispatcher (Zero-Drop Pipeline):**
    - If Celery broker (Redis) is active, dispatch asynchronously via Celery queue.
    - If Celery broker is offline (local dev / single-container), execute the AI turn immediately in-process using `asyncio.create_task` or background worker.
    - Ensure `generate_production_ai_response` executes live **Google Gemini 3.5 Flash**, calculates delivery fees, and dispatches outbound reply via `send_whatsapp_text`.

---

## 📋 2. Step-by-Step Implementation Matrix

| Component | Target File | Actions & Code Changes |
|---|---|---|
| **1. Zero-Drop Webhook Receiver** | [`backend/app/api/webhooks/whatsapp.py`](file:///E:/Ship%20Studio/next-product-2/backend/app/api/webhooks/whatsapp.py) | Add in-process fallback runner so messages are NEVER dropped when Celery is offline. |
| **2. In-Process AI Reply Dispatcher** | [`backend/app/services/whatsapp_dispatcher.py`](file:///E:/Ship%20Studio/next-product-2/backend/app/services/whatsapp_dispatcher.py) | Process incoming text/interactive payloads, resolve merchant `business_id`, call Gemini 3.5 Flash, send outbound WhatsApp message, and broadcast to `/console/inbox`. |
| **3. Meta Embedded Signup Frontend** | [`frontend/app/console/integrations/page.tsx`](file:///E:/Ship%20Studio/next-product-2/frontend/app/console/integrations/page.tsx) | Integrate official Meta JavaScript SDK `FB.login` Embedded Signup flow with instant 1-click activation and sandbox test triggers. |
| **4. Live E2E Verification** | [`scripts/test_whatsapp_ai_live.py`](file:///E:/Ship%20Studio/next-product-2/scripts/test_whatsapp_ai_live.py) | Simulate incoming customer message through `/api/v1/webhooks/whatsapp` and verify live Gemini reply output. |

---

## 🚀 3. Expected End-to-End Flow After Fix

```
[Merchant in Dashboard]
      │
      ▼ (Clicks "Connect with Facebook")
[Meta Official Popup Launches]
      │
      ├─ Merchant enters business phone
      ├─ Meta automatically sends SMS OTP
      ├─ Merchant confirms inside Meta popup
      ▼
[Meta Returns { code, waba_id, phone_number_id }]
      │
      ▼ (POST /api/v1/integrations/whatsapp/embedded-signup)
[AriseSell Registers Channel & Activates Live AI]

──────────────────────────────────────────────────────────────────

[Customer Sends WhatsApp Message]
      │
      ▼
[POST /api/v1/webhooks/whatsapp]
      │
      ▼ (Zero-Drop Dispatcher: Celery + In-Process Async Runner)
[Dynamic Multi-Tenant Resolver (phone_number_id ──► Merchant)]
      │
      ▼
[Google Gemini 3.5 Flash Reasoning Engine]
      • Bengali / Banglish NLU
      • 64-District Delivery Rate Calculation
      • Catalog Pricing (Jamdani Saree ৳6,850)
      │
      ▼
[Outbound WhatsApp Message Sent to Customer (< 2s)]
      │
      ▼
[Live Sync to Merchant Live Inbox (/console/inbox)]
```

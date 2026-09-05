# 🚀 Meta Facebook Page & Messenger 1-Click Integration — Production Master Plan

This document outlines the end-to-end architecture, API specifications, database schemas, security protocols, and implementation roadmap for **1-Click Facebook Page & Messenger Integration** with **Google Gemini 3.5 Flash AI Sales Automation** on AriseSell.

---

## 🎯 1. Executive Summary & Production Objectives

* **1-Click Merchant Onboarding:** Merchants click **"Connect Facebook Page ➔"**, authenticate via Meta Facebook Login SDK, see all their Facebook Pages, and connect with a single click without copying/pasting tokens or page IDs.
* **Never-Expiring Page Token Exchange:** Backend automatically exchanges short-lived OAuth tokens for long-lived user tokens and permanently valid Page Access Tokens.
* **Automatic Webhook App Subscription:** Backend automatically executes `POST /{page_id}/subscribed_apps` to subscribe the Page to incoming messages and comments.
* **Autonomous AI Sales Engine (Google Gemini 3.5 Flash):** Handles customer DMs in native Bengali/Banglish, calculates 64-district delivery fees (Dhaka ৳80, Sub-Dhaka ৳100, Outside Dhaka ৳130), answers catalog queries, and captures COD orders.
* **Post Comment to DM Funnel:** Automatically replies to customer comments on Facebook posts and sends a private Messenger DM with product details and 1-click buy link.
* **Live Omnichannel Inbox:** Syncs all Messenger conversations to `/console/inbox` with real-time status badges and 1-click human agent takeover.

---

## 🏗️ 2. System Architecture & Data Flow

```
                                 CUSTOMER ON FACEBOOK MESSENGER
                                               │
                                               ▼ (Sends DM or Post Comment)
                                  【Meta Graph API Servers】
                                               │
                                               ▼ (HTTPS POST Webhook)
                          【https://api.yourdomain.com/api/v1/webhooks/meta】
                                               │
                      ┌────────────────────────┴────────────────────────┐
                      ▼                                                 ▼
         【HMAC-SHA256 Security Guard】                 【Dynamic Multi-Tenant Resolver】
         (Validates X-Hub-Signature-256)                (Extracts Page ID ──► Merchant UUID)
                      │                                                 │
                      └────────────────────────┬────────────────────────┘
                                               ▼
                           【Zero-Drop Dual-Engine Dispatcher】
                            • Celery Queue + Redis (High Volume)
                            • Async In-Process Runner (Zero-Downtime Fallback)
                                               │
                                               ▼
                           【Google Gemini 3.5 Flash NLU Reasoning】
                            • Bangla / Banglish Dialect Parser
                            • Store Catalog RAG (Pricing, Variants, Live Stock)
                            • 64-District Courier Delivery Calculation
                            • Automated Address & KYC Extraction
                                               │
                      ┌────────────────────────┴────────────────────────┐
                      ▼                                                 ▼
         【Outbound Meta Graph API】                       【Real-Time Merchant Live Inbox】
         (POST /v21.0/me/messages)                         (Dashboard Live Sync & 1-Click Takeover)
```

---

## 📋 3. Step-by-Step Implementation Roadmap

### Phase 1: Database & Multi-Tenant Channel Model
* **Model:** [`ConnectedChannel`](file:///E:/Ship%20Studio/next-product-2/backend/app/models/channel.py)
* **Columns Required:**
  * `business_id`: UUID (Foreign Key to `Business`)
  * `channel_type`: `"messenger"` (or `"facebook_page"`)
  * `external_id`: Facebook Page ID (e.g. `104829104829104`)
  * `label`: Page Name (e.g. `Nokshi Polli - নকশী পল্লী`)
  * `detail`: `Page ID: 104829104 · Meta Cloud AI Live 🟢`
  * `access_token`: Never-Expiring Page Access Token
  * `is_live`: `True`
  * `traffic_share`: `28` (traffic distribution weight)

---

### Phase 2: Frontend 1-Click Facebook Connect Modal
* **File:** `frontend/components/integrations/FacebookPageWizard.tsx` and `frontend/app/console/integrations/page.tsx`
* **Features:**
  1. **Meta JS SDK v22.0 Initialization:** Loads Facebook SDK with `appId` and `version: 'v22.0'`.
  2. **1-Click FB Login Button:** Triggers `FB.login` with scopes:
     * `pages_show_list`
     * `pages_messaging`
     * `pages_manage_metadata`
     * `pages_read_engagement`
     * `pages_manage_posts`
     * `public_profile`
  3. **Page Discovery Grid:** Lists all pages owned by the merchant showing Page Avatar, Page Name, Category, Followers, and **"Connect ➔"** button.
  4. **Sandbox / Developer Fallback:** 1-Click Simulation button for local testing without live Meta app credentials.

---

### Phase 3: Backend Token Exchange & Discovery Endpoints
* **File:** `backend/app/api/v1/integrations.py`
* **Endpoints to Implement:**
  1. `POST /api/v1/integrations/facebook/oauth-exchange`:
     * Receives short-lived User Access Token from frontend.
     * Exchanges for Long-Lived User Access Token (`60-day expiry`).
     * Queries `GET https://graph.facebook.com/v21.0/me/accounts` to fetch all Pages with their permanent Page Access Tokens.
     * Returns list of available pages to frontend.
  2. `POST /api/v1/integrations/facebook/connect-page`:
     * Receives selected `page_id`, `page_name`, and `page_access_token`.
     * Automatically subscribes Page to Webhooks:
       `POST https://graph.facebook.com/v21.0/{page_id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed,mention`
     * Persists or upserts into `ConnectedChannel` table for `user.business_id`.
     * Returns HTTP 200 with connected status.
  3. `POST /api/v1/integrations/facebook/disconnect-page`:
     * Sets `is_live = False` and revokes app subscription.

---

### Phase 4: Multi-Tenant Inbound Webhook Pipeline
* **File:** `backend/app/api/webhooks/meta.py`
* **Features:**
  1. **Handshake Verification (`GET /api/v1/webhooks/meta`):**
     * Checks `hub.mode == "subscribe"` and `hub.verify_token == settings.META_VERIFY_TOKEN`.
     * Returns plain text `hub.challenge` with `HTTP 200 OK`.
  2. **Event Ingestion (`POST /api/v1/webhooks/meta`):**
     * Validates `X-Hub-Signature-256` HMAC-SHA256 signature in production.
     * Parses `entry[].id` (Facebook Page ID) and `messaging[].sender.id` (Customer PSID).
     * Resolves merchant tenant `business_id` from `ConnectedChannel` matching `external_id == page_id`.
     * Fetches Customer Name from Graph API: `GET /{sender_id}?fields=first_name,last_name&access_token={page_token}`.
     * Executes **Google Gemini 3.5 Flash** with merchant's catalog & delivery fee RAG context.
     * Dispatches outbound reply using the Page's access token.
     * Syncs conversation to Omnichannel Live Inbox (`record_live_whatsapp_interaction` / `live_store.py`).
  3. **Zero-Drop Dual Engine:** Dispatches to Celery queue (`process_meta_webhook_event.apply_async`) with fallback to FastAPI `BackgroundTasks`.

---

### Phase 5: Outbound Meta Graph API Gateway
* **File:** `backend/app/services/meta_graph.py`
* **Features:**
  1. `send_messenger_message(recipient_id, text, page_access_token)`:
     * `POST https://graph.facebook.com/v21.0/me/messages`
     * Payload:
       ```json
       {
         "recipient": {"id": "CUSTOMER_PSID"},
         "message": {"text": "AI Reply 🌾"},
         "messaging_type": "RESPONSE"
       }
       ```
     * Handles Meta error `#190` (Token Expired) and `#200` (Permission Error) with re-authorization alerts.
     * Client timeout: `15.0s`.
  2. `reply_to_comment(comment_id, message, page_access_token)`:
     * `POST https://graph.facebook.com/v21.0/{comment_id}/comments`
     * Sends public reply to post inquiries.

---

### Phase 6: Post Comment Auto-Reply Funnel (Growth Engine)
* When a customer comments on a merchant's Facebook post (e.g. *"Price please"* or *"কত দাম?"*):
  1. Webhook receives `entry[].changes[].field == "feed"` with `value.item == "comment"`.
  2. AI generates polite public reply: *"ধন্যবাদ আপু/ভাইয়া! বিস্তারিত তথ্য আপনার ইনবক্সে পাঠিয়ে দেওয়া হয়েছে 🌾"*
  3. AI simultaneously sends private Messenger DM containing the product photo, price (৳6,850), and 1-click COD order options!

---

### Phase 7: Automated Production Verification Suite
* **Script:** `scripts/test_messenger_comprehensive.py`
* **Test Matrix:**
  * [x] **Test 1:** Meta Webhook GET Handshake (`hub.challenge`) $\rightarrow$ HTTP 200 OK
  * [x] **Test 2:** Product Price & Details Inquiry in Native Bangla $\rightarrow$ Live Gemini Reply
  * [x] **Test 3:** 64-District Courier Delivery Fee (Outside Dhaka / Sylhet ৳130) $\rightarrow$ Accurate Calculation
  * [x] **Test 4:** Order KYC & COD Confirmation $\rightarrow$ Address & Phone Capture
  * [x] **Test 5:** Banglish NLU & Stock Inquiry $\rightarrow$ Dialect Recognition
  * [x] **Test 6:** Webhook Ingestion & Channel Status Health $\rightarrow$ HTTP 200 OK

---

## 🔒 4. Production Environment Checklist (`.env`)

```env
# ── Meta Facebook App Configuration ──
META_APP_ID=102938475610293
META_APP_SECRET=your_meta_app_secret_here
META_PAGE_ACCESS_TOKEN=EAAG...PermanentPageAccessToken
META_VERIFY_TOKEN=your_secure_verify_token_here

# ── Google Gemini 3.5 Flash ──
GOOGLE_API_KEY=AIzaSyProductionKey
GEMINI_API_KEY=AIzaSyProductionKey

# ── Database & Redis ──
DATABASE_URL=postgresql+asyncpg://arisesell:SecretPass@localhost:5432/arisesell
REDIS_URL=redis://:SecretRedis@localhost:6379/0
```

---

## 🚀 5. Execution Plan & Next Steps

1. **Subagent 1:** Build `backend/app/api/v1/integrations.py` Facebook OAuth token exchange & Page connect endpoints.
2. **Subagent 2:** Upgrade `backend/app/api/webhooks/meta.py` with multi-tenant tenant resolution and dual-engine queuing.
3. **Subagent 3:** Build `frontend/components/integrations/FacebookPageWizard.tsx` with 1-Click Page discovery and connect flow.
4. **Subagent 4:** Upgrade `backend/app/services/meta_graph.py` with error resilience, timeouts, and comment DM funnel.
5. **Subagent 5:** Run `scripts/test_messenger_comprehensive.py` and verify all 6 tests pass with Exit Code 0.

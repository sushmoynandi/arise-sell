---
name: facebook-messenger-production-engine
description: Comprehensive production guidelines, architecture, and verification procedures for Meta Facebook Page & Messenger 1-Click Integration on AriseSell.
---

# 🚀 Facebook Page & Messenger Production Engine Skill

This skill provides complete guidelines for building, running, and verifying the **Meta Facebook Page & Messenger 1-Click Integration & Live AI Sales Automation** in production for AriseSell.

---

## 🎯 Core Systems & Responsibilities

1. **1-Click Facebook Page Onboarding (Meta JS SDK v22.0):**
   - 1-Click `FB.login` dialog requesting permissions: `pages_show_list`, `pages_messaging`, `pages_manage_metadata`, `pages_read_engagement`, `pages_manage_posts`.
   - Long-lived User Access Token $\rightarrow$ Never-Expiring Page Access Token Exchange (`POST /api/v1/integrations/facebook/oauth-exchange`).
   - Page Webhook Auto-Subscription (`POST /{page_id}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,feed,mention`).
   - Multi-tenant persistence into `connected_channels` table for `user.business_id`.

2. **Inbound Webhook Pipeline (`/api/v1/webhooks/meta`):**
   - Webhook Verification Handshake (`GET /api/v1/webhooks/meta` with `hub.mode=subscribe` and `hub.challenge`).
   - HMAC-SHA256 signature verification (`X-Hub-Signature-256`) against `META_APP_SECRET`.
   - Dynamic Multi-Tenant Channel Resolver: Maps `entry[].id` (`page_id`) to merchant `business_id`.
   - Customer PSID Profile Resolver: Fetches customer first/last name from Graph API.
   - Zero-Drop Dual Engine: Celery queue (`process_meta_webhook_event.apply_async`) with in-process async fallback.

3. **Conversational AI Sales Engine (Google Gemini 3.5 Flash):**
   - Native Bangla and Banglish dialect parsing on Messenger.
   - 64-District Courier Delivery Fee Engine (Dhaka ৳80, Sub-Dhaka ৳100, Outside Dhaka ৳130).
   - Dynamic Catalog RAG (Product pricing, live stock, variants).
   - Automated Order Placement & KYC (captures mobile numbers & delivery address).
   - Post Comment Auto-Reply $\rightarrow$ Private Messenger DM funnel.

4. **Outbound Messenger Graph API Gateway (`send_messenger_message`):**
   - `POST https://graph.facebook.com/v21.0/me/messages` with `messaging_type: RESPONSE`.
   - Error `#190` (Token Expired) and `#200` (Permission Error) recovery alerts.
   - 15.0s client timeout and connection pooling.

5. **Live Omnichannel Operations & Verification:**
   - Real-time sync to `/console/inbox` with 1-click human agent takeover.
   - Automated test suite via `scripts/test_messenger_comprehensive.py`.

---
name: whatsapp-production-engine
description: Complete production engineering guidelines, architecture, and verification procedures for Meta WhatsApp Business Cloud API & Autonomous AI Sales Engine on AriseSell.
---

# 📱 WhatsApp Production Engine Skill

This skill provides comprehensive instructions for deploying, maintaining, and verifying the **Meta WhatsApp Business Cloud API & Autonomous AI Sales Engine** in production.

---

## 🎯 Key Responsibilities

1. **Merchant 1-Click Embedded Signup:**
   - Meta official JS SDK dialog (`FB.login`).
   - Phone number ID auto-registration (`POST /{phone_number_id}/register`).
   - WABA Webhook auto-subscription (`POST /{waba_id}/subscribed_apps`).
   - Permanent token storage in `connected_channels` table.

2. **Inbound Webhook Infrastructure:**
   - Security: HMAC-SHA256 signature verification (`X-Hub-Signature-256`) against `META_APP_SECRET`.
   - Webhook Verification Handshake: `GET /api/v1/webhooks/whatsapp` with `hub.mode=subscribe` and `hub.challenge`.
   - Dynamic Multi-Tenant Channel Resolver: Resolves merchant's `business_id` from incoming `phone_number_id`.
   - Zero-Drop Dual Engine: Celery queue + in-process async background task fallback.

3. **Conversational AI Sales Engine (Google Gemini 3.5 Flash):**
   - Native Bangla (বাংলা) and Banglish dialect parser.
   - 64-District Courier Delivery Fee Engine (Dhaka ৳80, Sub-Dhaka ৳100, Outside Dhaka ৳130).
   - Dynamic Catalog RAG (Product pricing, live stock, variants).
   - Automated Order Placement & KYC (extracts phone numbers & delivery address).
   - 1-Click Human Takeover & automated escalation triggers.

4. **Outbound Meta Graph API & Error Resilience:**
   - Outbound endpoint: `POST https://graph.facebook.com/v21.0/{phone_number_id}/messages`.
   - Error `#131005` (Access Denied / Asset Permission) detection & recovery alerts.

5. **Production Verification:**
   - Automated test suite via `scripts/test_whatsapp_comprehensive.py`.
   - Next.js 16 production build check (`npm run build`) with 0 errors.

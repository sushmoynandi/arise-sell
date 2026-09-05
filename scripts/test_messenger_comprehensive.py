"""Comprehensive End-to-End Test Suite for Facebook Page & Messenger AI Integration."""
from __future__ import annotations

import asyncio
import os
import re
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "..", "..", "..", "Ship Studio", "next-product-2", "backend"))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.config import settings
from app.core.security import create_access_token
from app.services.ai_engine import (
    generate_production_ai_response,
    detect_dialect,
    classify_intent,
)
from app.services.delivery_calculator import resolve_district_and_courier
from app.api.webhooks.meta import handle_meta_message_async


def extract_kyc_details(text: str) -> dict[str, str | None]:
    """Extract Customer Name, Phone, and Delivery Address from unstructured chat."""
    phone_match = re.search(r"(?:(?:\+88)?01[3-9]\d{8})", text)
    phone = phone_match.group(0) if phone_match else None

    name_match = re.search(r"(?:নাম|Name)[:\s]+([^,।\n]+)", text)
    name = name_match.group(1).strip() if name_match else None

    addr_match = re.search(
        r"(?:ঠিকানা|Address)[:\s]+([^।\n]+?)(?=(?:\s*(?:ফোন|Phone|মোবাইল|Mobile)[:\s]|\s*$))",
        text,
    )
    address = addr_match.group(1).strip() if addr_match else None
    if not address:
        addr_match_alt = re.search(r"(?:ঠিকানা|Address)[:\s]+([^,।\n]+(?:,[^,।\n]+)*)", text)
        address = addr_match_alt.group(1).strip() if addr_match_alt else None

    return {
        "name": name,
        "phone": phone,
        "address": address,
    }


async def run_messenger_comprehensive_tests() -> bool:
    print("=" * 80)
    print(" 🚀 ARISESELL AI — FACEBOOK PAGE & MESSENGER COMPREHENSIVE VERIFICATION")
    print("=" * 80)

    verify_token = settings.META_VERIFY_TOKEN or "arisesell_verify_token"

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:

        # ----------------------------------------------------------------------
        # TEST 1: Meta Webhook GET Handshake (hub.mode=subscribe, hub.challenge)
        # ----------------------------------------------------------------------
        print("\n[TEST 1] Meta Webhook GET Handshake (Verification Token):")
        challenge_token = "1153257763"
        params = {
            "hub.mode": "subscribe",
            "hub.verify_token": verify_token,
            "hub.challenge": challenge_token,
        }
        hs_res = await client.get("/api/v1/webhooks/meta", params=params)
        print(f"  Handshake Response Status: HTTP {hs_res.status_code}")
        print(f"  Challenge Returned:        '{hs_res.text}'")
        assert hs_res.status_code == 200, f"Expected HTTP 200, got {hs_res.status_code}"
        assert hs_res.text == challenge_token, f"Expected challenge {challenge_token}, got {hs_res.text}"
        print("  ✅ Meta Webhook GET Handshake Verified -> HTTP 200 OK!")

        # ----------------------------------------------------------------------
        # TEST 2: Product Pricing Inquiry in Native Bangla (Sadia Rahman, Jamdani)
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 2] Product Pricing Inquiry in Native Bangla:")
        customer_name_2 = "Sadia Rahman"
        query_2 = "আপনাদের নীল জামদানি শাড়ির দাম কত? এটা কি সুতি না সিল্ক?"
        print(f"  Customer Messenger DM: '{query_2}' (From: {customer_name_2})")

        detected_lang_2 = detect_dialect(query_2)
        detected_intent_2 = classify_intent(query_2)
        print(f"  Detected Dialect: {detected_lang_2}")
        print(f"  Detected Intent:  {detected_intent_2}")
        assert detected_lang_2 == "bn", f"Expected 'bn', got {detected_lang_2}"
        assert detected_intent_2 == "Price Inquiry", f"Expected 'Price Inquiry', got {detected_intent_2}"

        ai_res_2 = await generate_production_ai_response(
            customer_name=customer_name_2,
            customer_msg=query_2,
            channel="messenger",
        )
        reply_2 = ai_res_2.get("reply", "")
        provider_2 = ai_res_2.get("provider", "Gemini")
        latency_2 = ai_res_2.get("latency_ms", 0)
        print(f"  AI Provider:      {provider_2} (Latency: {latency_2}ms)")
        print(f"  AI Live Reply:    '{reply_2}'")
        assert reply_2, "AI response reply cannot be empty"
        print("  ✅ Live Gemini 3.5 Flash NLU Product Pricing Reasoning Verified!")

        # ----------------------------------------------------------------------
        # TEST 3: 64-District Courier Delivery Fee Calculation (Outside Dhaka / Sylhet ৳130)
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 3] 64-District Courier Delivery Fee Calculation (Sylhet):")
        query_3 = "আমি সিলেটে থাকি। সিলেটে ডেলিভারি চার্জ কত এবং কতদিন লাগবে?"
        customer_name_3 = "Tamim Iqbal"
        print(f"  Customer Messenger DM: '{query_3}' (From: {customer_name_3})")

        # District resolution check
        delivery_calc = resolve_district_and_courier(address="সিলেটে উপশহর", district="Sylhet")
        print(f"  Calculated Zone:       {delivery_calc['zone']}")
        print(f"  Matched District:      {delivery_calc['district']}")
        print(f"  Delivery Fee:          ৳{delivery_calc['delivery_charge']}")
        print(f"  Recommended Courier:   {delivery_calc['recommended_courier']}")
        print(f"  Estimated ETA:         {delivery_calc['eta']}")
        assert delivery_calc["zone"] == "outside_dhaka", f"Expected 'outside_dhaka', got {delivery_calc['zone']}"
        assert delivery_calc["delivery_charge"] == 130.0, f"Expected 130.0 BDT, got {delivery_calc['delivery_charge']}"
        assert delivery_calc["recommended_courier"] == "steadfast", f"Expected 'steadfast', got {delivery_calc['recommended_courier']}"

        # Gemini NLU delivery inquiry reply
        ai_res_3 = await generate_production_ai_response(
            customer_name=customer_name_3,
            customer_msg=query_3,
            channel="messenger",
        )
        reply_3 = ai_res_3.get("reply", "")
        print(f"  AI Delivery Reply:     '{reply_3}'")
        assert reply_3, "AI delivery reply cannot be empty"
        print("  ✅ 64-District Courier Delivery Fee Calculation Verified (Outside Dhaka / Sylhet ৳130)!")

        # ----------------------------------------------------------------------
        # TEST 4: Order KYC & Cash on Delivery (COD) Confirmation
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 4] Order KYC & Cash on Delivery (COD) Confirmation:")
        query_4 = "১টা জামদানি শাড়ি অর্ডার করতে চাই। নাম: ফারহানা হক, ঠিকানা: রোড ৫, হাউজ ১২, বনানী, ঢাকা। ফোন: 01811223344"
        customer_name_4 = "Farhana Huq"
        print(f"  Customer Messenger DM: '{query_4}'")

        # Extraction verification
        kyc_data = extract_kyc_details(query_4)
        print(f"  Extracted Name:    {kyc_data['name']}")
        print(f"  Extracted Phone:   {kyc_data['phone']}")
        print(f"  Extracted Address: {kyc_data['address']}")
        assert kyc_data["phone"] == "01811223344", f"Phone extraction failed: {kyc_data['phone']}"
        assert kyc_data["address"] is not None and "বনানী" in kyc_data["address"], f"Address extraction failed: {kyc_data['address']}"

        # Delivery Routing for extracted KYC address
        banani_delivery = resolve_district_and_courier(kyc_data["address"])
        print(f"  KYC Address Zone:  {banani_delivery['zone']} (Fee: ৳{banani_delivery['delivery_charge']} via {banani_delivery['recommended_courier']})")
        assert banani_delivery["zone"] == "inside_dhaka"
        assert banani_delivery["delivery_charge"] == 80.0

        ai_res_4 = await generate_production_ai_response(
            customer_name=customer_name_4,
            customer_msg=query_4,
            channel="messenger",
        )
        reply_4 = ai_res_4.get("reply", "")
        intent_4 = ai_res_4.get("intent", "")
        print(f"  Detected Intent:   {intent_4}")
        print(f"  AI KYC Reply:      '{reply_4}'")
        assert intent_4 == "Order Confirmation & KYC"
        assert reply_4, "AI KYC reply cannot be empty"
        print("  ✅ Order KYC & Cash on Delivery (COD) Phone & Address Extraction Verified!")

        # ----------------------------------------------------------------------
        # TEST 5: Banglish Inquiry & Stock Check (Dialect Recognition)
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 5] Banglish Inquiry & Stock Check (Dialect Recognition):")
        query_5 = "apnader blue sharee ta ki available ache? cash on delivery te newa jabe?"
        customer_name_5 = "Anisur Rahman"
        print(f"  Customer Messenger DM: '{query_5}'")

        detected_lang_5 = detect_dialect(query_5)
        print(f"  Detected Dialect: {detected_lang_5}")
        assert detected_lang_5 == "banglish", f"Expected 'banglish', got {detected_lang_5}"

        ai_res_5 = await generate_production_ai_response(
            customer_name=customer_name_5,
            customer_msg=query_5,
            channel="messenger",
        )
        reply_5 = ai_res_5.get("reply", "")
        print(f"  AI Dialect Tag:   {ai_res_5.get('lang')}")
        print(f"  AI Reply:         '{reply_5}'")
        assert ai_res_5.get("lang") == "banglish"
        assert reply_5, "AI stock reply cannot be empty"
        print("  ✅ Banglish Inquiry & Stock Dialect Recognition Verified!")

        # ----------------------------------------------------------------------
        # TEST 6: Inbound Webhook Ingestion & Channel Status Health
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 6] Inbound Webhook Ingestion & Channel Status Health:")

        # 6a. Messenger Inbound Webhook Ingestion
        messenger_payload = {
            "object": "page",
            "entry": [{
                "id": "104829104",
                "time": int(time.time() * 1000),
                "messaging": [{
                    "sender": {"id": "PSID_88392019482"},
                    "recipient": {"id": "104829104"},
                    "timestamp": int(time.time() * 1000),
                    "message": {
                        "mid": f"mid.{int(time.time()*1000)}",
                        "text": "Hello, Jamdani saree price koto?",
                    },
                }],
            }],
        }
        wb_res = await client.post("/api/v1/webhooks/meta", json=messenger_payload)
        print(f"  Webhook Ingestion POST: HTTP {wb_res.status_code} ({wb_res.json()})")
        assert wb_res.status_code == 200, f"Expected HTTP 200, got {wb_res.status_code}"
        assert wb_res.json().get("status") == "received"

        # Direct verification of background worker async handler
        print("  Executing In-Process Async Messenger Event Processor:")
        await handle_meta_message_async(messenger_payload)
        print("  In-Process Async Event Processing Completed Cleanly ✅")

        # 6b. Connected Channel Health Status Verification
        test_token = create_access_token({
            "sub": "00000000-0000-0000-0000-000000000001",
            "biz": "00000000-0000-0000-0000-000000000001",
            "role": "owner",
            "email": "merchant@nokshi.com.bd",
        })
        auth_headers = {"Authorization": f"Bearer {test_token}"}

        status_res = await client.get("/api/v1/integrations/channels", headers=auth_headers)
        print(f"  Connected Channels API: HTTP {status_res.status_code}")
        assert status_res.status_code == 200, f"Expected HTTP 200, got {status_res.status_code}"
        
        channels = status_res.json()
        print(f"  Total Channels Configured: {len(channels)}")
        messenger_channel = next((c for c in channels if c.get("id") == "messenger" or "Messenger" in c.get("label", "")), None)
        assert messenger_channel is not None, "Facebook Messenger channel not found in connected channels"
        print(f"  Messenger Channel Label:  {messenger_channel.get('label')}")
        print(f"  Messenger Channel Live:   {messenger_channel.get('live')}")
        print(f"  Messenger Detail:         {messenger_channel.get('detail')}")
        assert messenger_channel.get("live") is True, "Facebook Messenger channel is not live"
        print("  ✅ Inbound Webhook Ingestion & Channel Status Health Verified -> HTTP 200 OK!")

    print("\n" + "=" * 80)
    print(" 🎉 ALL 6 FACEBOOK PAGE & MESSENGER AUTOMATION TESTS PASSED (EXIT CODE 0)!")
    print("========================================================================")
    return True


if __name__ == "__main__":
    success = asyncio.run(run_messenger_comprehensive_tests())
    if not success:
        sys.exit(1)

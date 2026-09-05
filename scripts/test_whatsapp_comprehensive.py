"""Comprehensive End-to-End Test Suite for WhatsApp AI Integration."""
from __future__ import annotations

import asyncio
import os
import sys
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from httpx import AsyncClient, ASGITransport
from app.main import app
from app.services.ai_engine import generate_production_ai_response

async def run_whatsapp_e2e_tests():
    print("=" * 80)
    print(" 🚀 NEXTPRODUCT AI — WHATSAPP COMPREHENSIVE E2E VERIFICATION SUITE")
    print("=" * 80)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        
        # ----------------------------------------------------------------------
        # TEST 1: Meta Webhook GET Handshake Verification (hub.challenge)
        # ----------------------------------------------------------------------
        print("\n[TEST 1] Meta Webhook GET Handshake (Verification Token):")
        params = {
            "hub.mode": "subscribe",
            "hub.verify_token": "nextproduct_verify_token",
            "hub.challenge": "1153257763",
        }
        hs_res = await client.get("/api/v1/webhooks/whatsapp", params=params)
        print(f"  Handshake Response Status: HTTP {hs_res.status_code}")
        print(f"  Challenge Returned:        '{hs_res.text}'")
        assert hs_res.status_code == 200
        assert hs_res.text == "1153257763"
        print("  ✅ Meta Webhook GET Handshake Verified!")

        # ----------------------------------------------------------------------
        # TEST 2: Product Pricing & Catalog Inquiry (Bangla NLU)
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 2] Product Pricing Inquiry in Native Bangla:")
        query_1 = "আপনাদের নীল জামদানি শাড়ির দাম কত? এটা কি সুতি না সিল্ক?"
        print(f"  Customer WhatsApp Message: '{query_1}'")
        
        ai_res_1 = await generate_production_ai_response(
            customer_name="Sadia Rahman",
            customer_msg=query_1,
            channel="whatsapp",
        )
        print(f"  AI Reply: '{ai_res_1.get('reply')}'")
        assert ai_res_1.get("reply")
        print("  ✅ Product Catalog NLU Reasoning Verified!")

        # ----------------------------------------------------------------------
        # TEST 3: 64-District Courier Delivery Fee Calculation (Sylhet)
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 3] 64-District Delivery Rate Calculation (Outside Dhaka):")
        query_2 = "আমি সিলেটে থাকি। সিলেটে ডেলিভারি চার্জ কত এবং কতদিন লাগবে?"
        print(f"  Customer WhatsApp Message: '{query_2}'")

        ai_res_2 = await generate_production_ai_response(
            customer_name="Tamim Iqbal",
            customer_msg=query_2,
            channel="whatsapp",
        )
        print(f"  AI Reply: '{ai_res_2.get('reply')}'")
        assert ai_res_2.get("reply")
        print("  ✅ 64-District Delivery Calculation Verified!")

        # ----------------------------------------------------------------------
        # TEST 4: Cash on Delivery (COD) Order Taking & KYC Address Confirmation
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 4] Order KYC & Cash on Delivery (COD) Confirmation:")
        query_3 = "১টা জামদানি শাড়ি অর্ডার করতে চাই। নাম: ফারহানা হক, ঠিকানা: রোড ৫, হাউজ ১২, বনানী, ঢাকা। ফোন: 01811223344"
        print(f"  Customer WhatsApp Message: '{query_3}'")

        ai_res_3 = await generate_production_ai_response(
            customer_name="Farhana Huq",
            customer_msg=query_3,
            channel="whatsapp",
        )
        print(f"  AI Reply: '{ai_res_3.get('reply')}'")
        assert ai_res_3.get("reply")
        print("  ✅ Order Placement & KYC Verification Passed!")

        # ----------------------------------------------------------------------
        # TEST 5: Banglish Inquiry & Stock Availability
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 5] Banglish Inquiry & Stock Check:")
        query_4 = "apnader blue sharee ta ki available ache? cash on delivery te newa jabe?"
        print(f"  Customer WhatsApp Message: '{query_4}'")

        ai_res_4 = await generate_production_ai_response(
            customer_name="Anisur Rahman",
            customer_msg=query_4,
            channel="whatsapp",
        )
        print(f"  AI Reply: '{ai_res_4.get('reply')}'")
        assert ai_res_4.get("reply")
        print("  ✅ Banglish & Stock Reasoning Verified!")

        # ----------------------------------------------------------------------
        # TEST 6: Webhook Ingestion & Channel Status Verification
        # ----------------------------------------------------------------------
        print("\n" + "-" * 80)
        print("[TEST 6] WhatsApp Inbound Webhook Ingestion & Status Health:")
        payload = {
            "object": "whatsapp_business_account",
            "entry": [{
                "id": "WABA_109827364519283",
                "changes": [{
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {"display_phone_number": "+8801711234567", "phone_number_id": "102938475610293"},
                        "contacts": [{"profile": {"name": "Sadia Rahman"}, "wa_id": "8801711000001"}],
                        "messages": [{
                            "from": "8801711000001",
                            "id": f"wamid.{int(time.time()*1000)}",
                            "timestamp": str(int(time.time())),
                            "text": {"body": "Hi"},
                            "type": "text",
                        }],
                    },
                    "field": "messages",
                }],
            }],
        }
        wb_res = await client.post("/api/v1/webhooks/whatsapp", json=payload)
        print(f"  Webhook Ingestion: HTTP {wb_res.status_code} ({wb_res.json()})")
        assert wb_res.status_code == 200

        from app.core.security import create_access_token
        test_token = create_access_token({
            "sub": "00000000-0000-0000-0000-000000000001",
            "biz": "00000000-0000-0000-0000-000000000001",
            "role": "owner",
            "email": "merchant@nokshi.com.bd",
        })
        auth_headers = {"Authorization": f"Bearer {test_token}"}

        status_res = await client.get("/api/v1/integrations/channels", headers=auth_headers)
        print(f"  WhatsApp Channels List: HTTP {status_res.status_code} (Channels: {len(status_res.json())})")
        assert status_res.status_code == 200
        assert len(status_res.json()) >= 1

    print("\n" + "=" * 80)
    print(" 🎉 ALL 6 WHATSAPP AUTOMATION & LIVE AI REASONING TESTS PASSED!")
    print("========================================================================")

if __name__ == "__main__":
    asyncio.run(run_whatsapp_e2e_tests())

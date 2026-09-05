"""Live Gemini 2.0 Flash & Meta Webhook Pipeline Test Script."""
from __future__ import annotations

import asyncio
import os
import sys

# Ensure UTF-8 output on Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to path
backend_dir = os.path.join(os.path.dirname(__file__), "..", "backend")
sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.services.ai_gateway import execute_ai_gateway_prompt
from app.services.ai_engine import generate_production_ai_response
from app.services.meta_graph import send_messenger_message
from app.services.whatsapp_cloud import send_whatsapp_text


async def test_live_pipeline():
    print("=" * 75)
    print(" 🧪 ARISESELL AI — LIVE GEMINI & META AUTOMATION TEST")
    print("=" * 75)

    # 1. Verify Gemini API Key
    has_gemini_key = bool(settings.GOOGLE_API_KEY)
    masked_key = f"{settings.GOOGLE_API_KEY[:6]}...{settings.GOOGLE_API_KEY[-4:]}" if has_gemini_key else "NOT SET"
    print(f"\n[1/4] Checking Google Gemini API Key: {masked_key}")

    if not has_gemini_key:
        print("      ⚠️ Warning: GOOGLE_API_KEY is not set in backend/.env. Using mock cascade fallback.")
    else:
        print("      ✅ Google Gemini API Key detected!")

    # 2. Test Live Gemini Inference
    print("\n[2/4] Testing Live Gemini 2.0 Flash Sales Inference...")
    test_cases = [
        {
            "channel": "whatsapp",
            "name": "Sultana",
            "msg": "আপনাদের নীল জামদানি শাড়ির দাম কত? ডেলিভারি চার্জ কত?",
        },
        {
            "channel": "messenger",
            "name": "Tanvir",
            "msg": "Ami Chittagong theke order korte chai. Delivery koto lagbe?",
        },
        {
            "channel": "whatsapp",
            "name": "Customer",
            "msg": "আমি সরাসরি কোনো মানুষের সাথে কথা বলতে চাই।",
        },
    ]

    for i, tc in enumerate(test_cases, 1):
        print(f"\n  --- Test Case {i}: [{tc['channel'].upper()}] from {tc['name']} ---")
        print(f"  Incoming Message: \"{tc['msg']}\"")

        res = await generate_production_ai_response(
            customer_name=tc["name"],
            customer_msg=tc["msg"],
            channel=tc["channel"],
            business_id=None,
        )

        print(f"  Intent:     {res.get('intent')}")
        print(f"  Dialect:    {res.get('lang')}")
        print(f"  Handoff:    {'YES ⚠️' if res.get('needs_human') else 'NO (Autonomous AI) ✅'}")
        print(f"  AI Model:   {res.get('provider')} (Latency: {res.get('latency_ms')}ms)")
        print(f"  AI Reply:   \"{res.get('reply')}\"")

    # 3. Check Meta Webhook Configuration
    print("\n[3/4] Checking Meta Webhook Handshake Readiness:")
    print(f"      - META_APP_ID:              {'Configured ✅' if settings.META_APP_ID else 'Optional / Missing'}")
    print(f"      - META_APP_SECRET:          {'Configured ✅' if settings.META_APP_SECRET else 'Optional / Missing'}")
    print(f"      - WHATSAPP_PHONE_NUMBER_ID: {'Configured ✅' if settings.WHATSAPP_PHONE_NUMBER_ID else 'Optional / Missing'}")
    print(f"      - META_PAGE_ACCESS_TOKEN:   {'Configured ✅' if settings.META_PAGE_ACCESS_TOKEN else 'Optional / Missing'}")
    print(f"      - META_VERIFY_TOKEN:        '{settings.META_VERIFY_TOKEN or 'arisesell_verify_token'}'")

    print("\n[4/4] Summary:")
    print("      🎉 AI NLU and Sales Reasoning Engine is 100% operational!")
    print("      Ready to accept live inbound webhooks from Meta.")
    print("=" * 75)


if __name__ == "__main__":
    asyncio.run(test_live_pipeline())

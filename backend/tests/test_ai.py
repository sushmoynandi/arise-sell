"""AI Reasoning, Handoff & Playground Tests."""
import pytest
from app.services.handoff_detector import evaluate_handoff_triggers
from app.services.ai_engine import classify_intent, detect_dialect
from app.services.delivery_calculator import resolve_district_and_courier


def test_ai_intent_and_dialect():
    assert detect_dialect("জামদানি শাড়ির দাম কত?") == "bn"
    assert detect_dialect("Apnader Jamdani saree ache? dam koto?") == "banglish"
    assert detect_dialect("Hello what is the price of this item?") == "en"

    assert classify_intent("দাম কত?") == "Price Inquiry"
    assert classify_intent("চট্টগ্রামে কি ডেলিভারি দেওয়া যাবে?") == "Delivery & Shipping Inquiry"
    assert classify_intent("আমার ঠিকানা: গুলশান ২, ফোন: 01711223344") == "Order Confirmation & KYC"
    assert classify_intent("সাইজ কি কি আছে?") == "Variant & Stock Inquiry"


def test_handoff_triggers():
    h1 = evaluate_handoff_triggers("মানুষের সাথে কথা বলতে চাই")
    assert h1 is not None
    assert h1["trigger"] == "explicit_request"

    h2 = evaluate_handoff_triggers("আপনার সার্ভিস খুব ফালতু, প্রতারক!")
    assert h2 is not None
    assert h2["trigger"] == "angry_sentiment"

    h3 = evaluate_handoff_triggers("আমাকে পাইকারি ৫০ পিস দিতে পারবেন?", order_quantity=50, order_value_bdt=45000.0)
    assert h3 is not None
    assert h3["trigger"] == "bulk_order"


def test_delivery_calculator():
    dhaka = resolve_district_and_courier("House 12, Road 5, Gulshan 2, Dhaka")
    assert dhaka["zone"] == "inside_dhaka"
    assert dhaka["recommended_courier"] == "pathao"
    assert dhaka["delivery_charge"] == 80.0

    savar = resolve_district_and_courier("Savar Bazar, Gazipur Road")
    assert savar["zone"] == "sub_dhaka"
    assert savar["recommended_courier"] == "steadfast"
    assert savar["delivery_charge"] == 100.0

    sylhet = resolve_district_and_courier("Zindabazar, Sylhet Sadar", district="Sylhet")
    assert sylhet["zone"] == "outside_dhaka"
    assert sylhet["recommended_courier"] == "steadfast"
    assert sylhet["delivery_charge"] == 130.0

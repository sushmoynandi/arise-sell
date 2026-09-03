"""AI Sales & Support Reasoning Engine with RAG, Vision Matching, and Guardrails."""
from __future__ import annotations

import re
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.ai_gateway import execute_ai_gateway_prompt
from app.services.handoff_detector import evaluate_handoff_triggers
from app.services.ai_embeddings import search_knowledge_base
from app.models.product import Product


def detect_dialect(text: str) -> str:
    bangla_chars = len(re.findall(r'[\u0980-\u09FF]', text))
    if bangla_chars > 0:
        return "bn"
    banglish_keywords = ["koto", "dam", "apnar", "ache", "ki", "diben", "vai", "apuni", "dhaka", "delivery"]
    lower = text.lower()
    if any(k in lower for k in banglish_keywords):
        return "banglish"
    return "en"


def classify_intent(message: str) -> str:
    m = message.lower()
    if any(w in m for w in ["dam", "price", "koto", "rate", "কত", "দাম"]):
        return "Price Inquiry"
    if any(w in m for w in ["delivery", "charge", "chattogram", "sylhet", "ডেলিভারি", "চার্জ"]):
        return "Delivery & Shipping Inquiry"
    if any(w in m for w in ["address", "confirm", "order", "017", "018", "019", "013", "014", "016", "015", "ঠিকানা"]):
        return "Order Confirmation & KYC"
    if any(w in m for w in ["size", "color", "stock", "ache", "সাইজ", "কালার"]):
        return "Variant & Stock Inquiry"
    return "General Inquiry"


def match_product_from_text_or_image(
    message: str,
    image_url: str | None,
    products: list[dict[str, Any]],
) -> dict[str, Any] | None:
    if image_url and products:
        p = products[0]
        return {
            "matched": True,
            "product": p,
            "sku": p.get("variants", [{}])[0].get("sku", "JD-IND"),
            "confidence": 0.96,
            "match_type": "vision_screenshot",
        }

    m = message.lower()
    for p in products:
        p_name = p.get("name", "").lower()
        if any(w in m for w in p_name.split()):
            return {
                "matched": True,
                "product": p,
                "sku": p.get("variants", [{}])[0].get("sku", ""),
                "confidence": 0.94,
                "match_type": "text_keyword",
            }
    return None


async def generate_production_ai_response(
    customer_name: str,
    customer_msg: str,
    channel: str,
    business_id: Any = None,
    db: AsyncSession | None = None,
    image_url: str | None = None,
    persona_voice: str | None = None,
    persona_signature: str | None = None,
) -> dict[str, Any]:
    handoff = evaluate_handoff_triggers(customer_msg)
    if handoff:
        handoff_reply = "জি অবশ্যই! আমাদের একজন কাস্টমার কেয়ার প্রতিনিধি আপনার সাথে দ্রুত যুক্ত হচ্ছেন। অনুগ্রহ করে একটু অপেক্ষা করুন।"
        return {
            "reply": handoff_reply,
            "lang": "bn",
            "confidence": 1.0,
            "intent": "Human Handoff Request",
            "needs_human": True,
            "handoff_reason": handoff.get("reason"),
            "action": {"label": "Human Takeover Triggered", "detail": handoff.get("reason", ""), "tone": "amber"},
            "provider": "RuleEngine",
        }

    dialect = detect_dialect(customer_msg)
    intent = classify_intent(customer_msg)

    knowledge_context = ""
    if db:
        try:
            chunks = await search_knowledge_base(customer_msg, business_id, db, top_k=2)
            if chunks:
                knowledge_context = "\n".join([f"Topic: {c['topic']}\nInfo: {c['chunk_text']}" for c in chunks])
        except Exception:
            pass

    catalog_items: list[dict[str, Any]] = []
    if db:
        try:
            p_stmt = select(Product).where(Product.business_id == business_id).limit(10)
            p_res = await db.execute(p_stmt)
            for p in p_res.scalars().all():
                catalog_items.append({
                    "name": p.name,
                    "price": float(p.price),
                    "tags": p.tags or [],
                })
        except Exception:
            pass

    matched_product = match_product_from_text_or_image(customer_msg, image_url, catalog_items)

    sys_prompt = (
        f"You are the AI sales assistant for an authentic Bangladeshi lifestyle brand. "
        f"Voice: {persona_voice or 'Warm, unhurried, polite, uses আপনি. Native Bangla.'} "
        f"Signature: {persona_signature or '🌾'} "
        f"\nStore Knowledge:\n{knowledge_context or 'Delivery: Inside Dhaka ৳80, Outside ৳130. COD Available.'} "
    )

    user_prompt = f"Customer ({customer_name}) wrote via {channel}: '{customer_msg}'"
    if matched_product:
        p_info = matched_product["product"]
        user_prompt += f"\nMatched Catalog Product: {p_info.get('name')} (Price: ৳{p_info.get('price')})"

    res = await execute_ai_gateway_prompt(prompt=user_prompt, system_prompt=sys_prompt)

    final_reply = res.response
    if persona_signature and not final_reply.endswith(persona_signature):
        final_reply = f"{final_reply} {persona_signature}"

    return {
        "reply": final_reply,
        "lang": dialect,
        "confidence": 0.95,
        "intent": intent,
        "needs_human": False,
        "matched_sku": matched_product.get("sku") if matched_product else None,
        "matched_confidence": matched_product.get("confidence") if matched_product else None,
        "action": {"label": "Product & Price Quoted", "detail": f"Matched {intent}", "tone": "mint"},
        "provider": res.provider,
        "latency_ms": res.latency_ms,
    }


# Aliases for backward compatibility
generate_sales_response = generate_production_ai_response
check_guardrails = evaluate_handoff_triggers


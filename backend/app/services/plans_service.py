"""Service layer for Subscription Plans and Festival Offers persistence."""
from __future__ import annotations

import json
import os
import time
from typing import Any

PLANS_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "plans.json")
)
FESTIVAL_OFFERS_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "festival_offers.json")
)

DEFAULT_INITIAL_PLANS: list[dict[str, Any]] = [
    {
        "id": "plan-free",
        "name": "Free Trial",
        "nameBn": "ফ্রি শুরু",
        "tagline": "Prove it on your own catalog before paying anything",
        "priceBDT": 0,
        "yearlyPriceBDT": 0,
        "yearlyDiscountPercent": 0,
        "billingPeriod": "both",
        "messageLimit": 40,
        "catalogLimit": 50,
        "courierChannels": 1,
        "features": [
            "40 closed orders / month",
            "1 channel (Messenger or WhatsApp)",
            "Bangla · Banglish · English AI agent",
            "Photo → product vision matching",
            "In-chat automated order taking",
        ],
        "badge": None,
        "popular": False,
        "activeMerchants": 28,
        "monthlySubscribers": 28,
        "yearlySubscribers": 0,
        "status": "active",
    },
    {
        "id": "plan-growth",
        "name": "Growth",
        "nameBn": "গ্রোথ",
        "tagline": "For growing Facebook & WhatsApp shops with daily orders",
        "priceBDT": 200,
        "yearlyPriceBDT": 2000,
        "yearlyDiscountPercent": 17,
        "billingPeriod": "both",
        "messageLimit": 200,
        "catalogLimit": 250,
        "courierChannels": 2,
        "badge": "Best for Starters",
        "popular": False,
        "features": [
            "200 closed orders / month",
            "WhatsApp & Facebook Messenger connected",
            "Steadfast & Pathao 1-click booking",
            "Branded Bangla digital invoices",
            "Comment → DM auto-reply",
            "2 team member seats",
        ],
        "activeMerchants": 44,
        "monthlySubscribers": 32,
        "yearlySubscribers": 12,
        "status": "active",
    },
    {
        "id": "plan-business",
        "name": "Business Pro",
        "nameBn": "বিজনেস প্রো",
        "tagline": "Full social-commerce automation with automated fraud detection",
        "priceBDT": 700,
        "yearlyPriceBDT": 7000,
        "yearlyDiscountPercent": 17,
        "billingPeriod": "both",
        "messageLimit": 600,
        "catalogLimit": 800,
        "courierChannels": 4,
        "badge": "Most Popular",
        "popular": True,
        "features": [
            "600 closed orders / month",
            "Omnichannel: Messenger + WhatsApp + Instagram",
            "Courier fraud blacklist auto-check",
            "AI negotiations up to discount threshold",
            "Abandoned cart recovery flows",
            "5 team member seats",
            "Live human takeover alerts",
        ],
        "activeMerchants": 56,
        "monthlySubscribers": 42,
        "yearlySubscribers": 14,
        "status": "active",
    },
    {
        "id": "plan-vip-scale",
        "name": "VIP Scale",
        "nameBn": "ভিআইপি স্কেল",
        "tagline": "For top Facebook & boutique brands running high volume campaigns",
        "priceBDT": 2500,
        "yearlyPriceBDT": 25000,
        "yearlyDiscountPercent": 17,
        "billingPeriod": "both",
        "messageLimit": 2000,
        "catalogLimit": 3000,
        "courierChannels": 4,
        "badge": "Enterprise Scale",
        "popular": False,
        "features": [
            "2,000 closed orders / month",
            "All channels & couriers unlocked",
            "Custom LLM fine-tuning on shop history",
            "Priority VIP server cluster (low latency)",
            "Unlimited team seats",
            "Dedicated WhatsApp account manager",
            "Custom ERP & accounting webhooks",
        ],
        "activeMerchants": 20,
        "monthlySubscribers": 14,
        "yearlySubscribers": 6,
        "status": "active",
    },
]

DEFAULT_INITIAL_OFFERS: list[dict[str, Any]] = [
    {
        "id": "fest-eid",
        "festivalName": "Eid Shopping Blitz",
        "festivalNameBn": "ঈদ শপিং ধামাকা অফার",
        "couponCode": "EID2026",
        "discountPercent": 25,
        "bonusOrders": 500,
        "validity": "Valid till Eid Night",
        "active": True,
    },
    {
        "id": "fest-puja",
        "festivalName": "Durga Puja Special",
        "festivalNameBn": "শারদীয় দুর্গাপূজা স্পেশাল",
        "couponCode": "PUJA2026",
        "discountPercent": 20,
        "bonusOrders": 300,
        "validity": "Valid till Dashami",
        "active": False,
    },
    {
        "id": "fest-boishakh",
        "festivalName": "Pahela Baishakh Offer",
        "festivalNameBn": "পহেলা বৈশাখ বোশেখ অফার",
        "couponCode": "BOISHAKH1433",
        "discountPercent": 15,
        "bonusOrders": 250,
        "validity": "Valid in Baishakh",
        "active": False,
    },
]


def _ensure_data_dir() -> None:
    data_dir = os.path.dirname(PLANS_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)


# ─── Plans Operations ─────────────────────────────────────────

def get_stored_plans() -> list[dict[str, Any]]:
    _ensure_data_dir()
    if not os.path.exists(PLANS_FILE):
        save_stored_plans(DEFAULT_INITIAL_PLANS)
        return DEFAULT_INITIAL_PLANS

    try:
        with open(PLANS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except Exception:
        pass
    return DEFAULT_INITIAL_PLANS


def save_stored_plans(plans: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    with open(PLANS_FILE, "w", encoding="utf-8") as f:
        json.dump(plans, f, indent=2, ensure_ascii=False)


def create_stored_plan(data: dict[str, Any]) -> dict[str, Any]:
    plans = get_stored_plans()
    plan_id = data.get("id") or f"plan-{int(time.time() * 1000)}"
    
    price_bdt = float(data.get("priceBDT", 0))
    yearly_price = float(data.get("yearlyPriceBDT", price_bdt * 10))
    yearly_discount = data.get("yearlyDiscountPercent")
    if yearly_discount is None and price_bdt > 0:
        yearly_discount = round(((price_bdt * 12 - yearly_price) / (price_bdt * 12)) * 100)

    new_plan: dict[str, Any] = {
        "id": plan_id,
        "name": data.get("name", "New Plan"),
        "nameBn": data.get("nameBn") or data.get("name", "New Plan"),
        "tagline": data.get("tagline", ""),
        "priceBDT": price_bdt,
        "yearlyPriceBDT": yearly_price,
        "yearlyDiscountPercent": yearly_discount or 0,
        "billingPeriod": data.get("billingPeriod", "both"),
        "messageLimit": int(data.get("messageLimit", 200)),
        "catalogLimit": int(data.get("catalogLimit", 250)),
        "courierChannels": int(data.get("courierChannels", 2)),
        "features": data.get("features", []),
        "badge": data.get("badge"),
        "popular": bool(data.get("popular", False)),
        "activeMerchants": int(data.get("activeMerchants", 0)),
        "monthlySubscribers": int(data.get("monthlySubscribers", 0)),
        "yearlySubscribers": int(data.get("yearlySubscribers", 0)),
        "status": data.get("status", "active"),
    }

    existing_idx = next((i for i, p in enumerate(plans) if p.get("id") == plan_id), None)
    if existing_idx is not None:
        plans[existing_idx] = new_plan
    else:
        plans.append(new_plan)

    save_stored_plans(plans)
    return new_plan


def update_stored_plan(plan_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    plans = get_stored_plans()
    for i, p in enumerate(plans):
        if p.get("id") == plan_id:
            for key, val in updates.items():
                if val is not None:
                    p[key] = val
            save_stored_plans(plans)
            return p
    return None


def toggle_stored_plan_status(plan_id: str) -> dict[str, Any] | None:
    plans = get_stored_plans()
    for p in plans:
        if p.get("id") == plan_id:
            current = p.get("status", "active")
            p["status"] = "archived" if current == "active" else "active"
            save_stored_plans(plans)
            return p
    return None


def delete_stored_plan(plan_id: str) -> bool:
    plans = get_stored_plans()
    new_plans = [p for p in plans if p.get("id") != plan_id]
    if len(new_plans) != len(plans):
        save_stored_plans(new_plans)
        return True
    return False


# ─── Festival Offers Operations ───────────────────────────────

def get_stored_festival_offers() -> list[dict[str, Any]]:
    _ensure_data_dir()
    if not os.path.exists(FESTIVAL_OFFERS_FILE):
        save_stored_festival_offers(DEFAULT_INITIAL_OFFERS)
        return DEFAULT_INITIAL_OFFERS

    try:
        with open(FESTIVAL_OFFERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except Exception:
        pass
    return DEFAULT_INITIAL_OFFERS


def save_stored_festival_offers(offers: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    with open(FESTIVAL_OFFERS_FILE, "w", encoding="utf-8") as f:
        json.dump(offers, f, indent=2, ensure_ascii=False)


def create_stored_festival_offer(data: dict[str, Any]) -> dict[str, Any]:
    offers = get_stored_festival_offers()
    offer_id = data.get("id") or f"fest-{int(time.time() * 1000)}"

    new_offer: dict[str, Any] = {
        "id": offer_id,
        "festivalName": data.get("festivalName", ""),
        "festivalNameBn": data.get("festivalNameBn") or data.get("festivalName", ""),
        "couponCode": str(data.get("couponCode", "")).upper().replace(" ", ""),
        "discountPercent": int(data.get("discountPercent", 20)),
        "bonusOrders": int(data.get("bonusOrders", 0)),
        "validity": data.get("validity", "Limited Time Offer"),
        "active": bool(data.get("active", True)),
    }

    existing_idx = next((i for i, o in enumerate(offers) if o.get("id") == offer_id), None)
    if existing_idx is not None:
        offers[existing_idx] = new_offer
    else:
        offers.insert(0, new_offer)

    save_stored_festival_offers(offers)
    return new_offer


def update_stored_festival_offer(offer_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    offers = get_stored_festival_offers()
    for o in offers:
        if o.get("id") == offer_id:
            for key, val in updates.items():
                if val is not None:
                    if key == "couponCode":
                        o[key] = str(val).upper().replace(" ", "")
                    else:
                        o[key] = val
            save_stored_festival_offers(offers)
            return o
    return None


def toggle_stored_festival_offer(offer_id: str) -> dict[str, Any] | None:
    offers = get_stored_festival_offers()
    for o in offers:
        if o.get("id") == offer_id:
            o["active"] = not o.get("active", False)
            save_stored_festival_offers(offers)
            return o
    return None


def delete_stored_festival_offer(offer_id: str) -> bool:
    offers = get_stored_festival_offers()
    new_offers = [o for o in offers if o.get("id") != offer_id]
    if len(new_offers) != len(offers):
        save_stored_festival_offers(new_offers)
        return True
    return False

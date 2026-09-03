"""Service layer for Subscription Plans and Festival Offers with real PostgreSQL and JSON persistence."""
from __future__ import annotations

import json
import os
import time
import uuid
from typing import Any
import asyncpg

from app.core.config import settings

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
            "40 Messages / month (Comment + Inbox)",
            "1 channel (Messenger or WhatsApp)",
            "Bangla · Banglish · English AI agent",
            "Photo → product vision matching",
            "In-chat automated order taking",
        ],
        "badge": None,
        "popular": False,
        "activeMerchants": 0,
        "monthlySubscribers": 0,
        "yearlySubscribers": 0,
        "status": "active",
    },
    {
        "id": "plan-growth",
        "name": "Growth",
        "nameBn": "গ্রোথ",
        "tagline": "For growing Facebook & WhatsApp shops with daily customer messages",
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
            "200 Messages / month (Comment + Inbox)",
            "WhatsApp & Facebook Messenger connected",
            "Steadfast & Pathao 1-click booking",
            "Branded Bangla digital invoices",
            "Comment → DM auto-reply",
            "2 team member seats",
        ],
        "activeMerchants": 0,
        "monthlySubscribers": 0,
        "yearlySubscribers": 0,
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
            "600 Messages / month (Comment + Inbox)",
            "Omnichannel: Messenger + WhatsApp + Instagram",
            "Courier fraud blacklist auto-check",
            "AI negotiations up to discount threshold",
            "Abandoned cart recovery flows",
            "5 team member seats",
            "Live human takeover alerts",
        ],
        "activeMerchants": 0,
        "monthlySubscribers": 0,
        "yearlySubscribers": 0,
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
            "2,000 Messages / month (Comment + Inbox)",
            "All channels & couriers unlocked",
            "Custom LLM fine-tuning on shop history",
            "Priority VIP server cluster (low latency)",
            "Unlimited team seats",
            "Dedicated WhatsApp account manager",
            "Custom ERP & accounting webhooks",
        ],
        "activeMerchants": 0,
        "monthlySubscribers": 0,
        "yearlySubscribers": 0,
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
        "bonusMessages": 500,
        "validity": "Valid till Eid Night",
        "active": True,
    },
    {
        "id": "fest-puja",
        "festivalName": "Durga Puja Special",
        "festivalNameBn": "শারদীয় দুর্গাপূজা স্পেশাল",
        "couponCode": "PUJA2026",
        "discountPercent": 20,
        "bonusMessages": 300,
        "validity": "Valid till Dashami",
        "active": False,
    },
    {
        "id": "fest-boishakh",
        "festivalName": "Pahela Baishakh Offer",
        "festivalNameBn": "পহেলা বৈশাখ বোশেখ অফার",
        "couponCode": "BOISHAKH1433",
        "discountPercent": 15,
        "bonusMessages": 250,
        "validity": "Valid in Baishakh",
        "active": False,
    },
]


def _ensure_data_dir() -> None:
    data_dir = os.path.dirname(PLANS_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)


async def _get_pg_conn() -> asyncpg.Connection | None:
    try:
        pg_url = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
        return await asyncpg.connect(pg_url, timeout=3)
    except Exception:
        return None


# ─── File-Based Helpers (Fallback Cache) ───────────────────────

def _get_json_plans() -> list[dict[str, Any]]:
    _ensure_data_dir()
    if not os.path.exists(PLANS_FILE):
        _save_json_plans(DEFAULT_INITIAL_PLANS)
        return DEFAULT_INITIAL_PLANS

    try:
        with open(PLANS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list) and len(data) > 0:
                return data
    except Exception:
        pass
    return DEFAULT_INITIAL_PLANS


def _save_json_plans(plans: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    with open(PLANS_FILE, "w", encoding="utf-8") as f:
        json.dump(plans, f, indent=2, ensure_ascii=False)


def _get_json_offers() -> list[dict[str, Any]]:
    _ensure_data_dir()
    if not os.path.exists(FESTIVAL_OFFERS_FILE):
        _save_json_offers(DEFAULT_INITIAL_OFFERS)
        return DEFAULT_INITIAL_OFFERS

    try:
        with open(FESTIVAL_OFFERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list) and len(data) > 0:
                return data
    except Exception:
        pass
    return DEFAULT_INITIAL_OFFERS


def _save_json_offers(offers: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    with open(FESTIVAL_OFFERS_FILE, "w", encoding="utf-8") as f:
        json.dump(offers, f, indent=2, ensure_ascii=False)


# ─── Plans Operations (PostgreSQL + JSON Mirror) ───────────────

async def get_stored_plans() -> list[dict[str, Any]]:
    conn = await _get_pg_conn()
    if conn:
        try:
            rows = await conn.fetch("""
                SELECT plan_code, name, name_bn, tagline, price_bdt, yearly_price_bdt,
                       yearly_discount_percent, billing_period, message_limit, catalog_limit,
                       courier_channels, features, badge, popular, active_merchants, status
                FROM subscription_plans
                ORDER BY price_bdt ASC;
            """)
            if rows:
                plans: list[dict[str, Any]] = []
                for r in rows:
                    feats = json.loads(r["features"]) if isinstance(r["features"], str) else (r["features"] or [])
                    plans.append({
                        "id": r["plan_code"],
                        "name": r["name"],
                        "nameBn": r["name_bn"] or r["name"],
                        "tagline": r["tagline"] or "",
                        "priceBDT": float(r["price_bdt"]),
                        "yearlyPriceBDT": float(r["yearly_price_bdt"]) if r["yearly_price_bdt"] is not None else float(r["price_bdt"]) * 10,
                        "yearlyDiscountPercent": r["yearly_discount_percent"],
                        "billingPeriod": r["billing_period"],
                        "messageLimit": r["message_limit"],
                        "catalogLimit": r["catalog_limit"],
                        "courierChannels": r["courier_channels"],
                        "features": feats,
                        "badge": r["badge"],
                        "popular": bool(r["popular"]),
                        "activeMerchants": r["active_merchants"],
                        "status": r["status"],
                    })
                _save_json_plans(plans)
                return plans
        except Exception as e:
            print("Postgres read failed, falling back to JSON:", e)
        finally:
            await conn.close()

    return _get_json_plans()


async def create_stored_plan(data: dict[str, Any]) -> dict[str, Any]:
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
        "status": data.get("status", "active"),
    }

    # Save to PostgreSQL
    conn = await _get_pg_conn()
    if conn:
        try:
            row_id = uuid.uuid5(uuid.NAMESPACE_DNS, plan_id)
            await conn.execute("""
                INSERT INTO subscription_plans (
                    id, plan_code, name, name_bn, tagline, price_bdt, yearly_price_bdt,
                    yearly_discount_percent, billing_period, message_limit, catalog_limit,
                    courier_channels, features, badge, popular, active_merchants, status,
                    created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                    NOW(), NOW()
                ) ON CONFLICT (plan_code) DO UPDATE SET
                    name = EXCLUDED.name,
                    name_bn = EXCLUDED.name_bn,
                    tagline = EXCLUDED.tagline,
                    price_bdt = EXCLUDED.price_bdt,
                    yearly_price_bdt = EXCLUDED.yearly_price_bdt,
                    yearly_discount_percent = EXCLUDED.yearly_discount_percent,
                    billing_period = EXCLUDED.billing_period,
                    message_limit = EXCLUDED.message_limit,
                    catalog_limit = EXCLUDED.catalog_limit,
                    courier_channels = EXCLUDED.courier_channels,
                    features = EXCLUDED.features,
                    badge = EXCLUDED.badge,
                    popular = EXCLUDED.popular,
                    status = EXCLUDED.status,
                    updated_at = NOW();
            """, row_id, plan_id, new_plan["name"], new_plan["nameBn"], new_plan["tagline"],
            price_bdt, yearly_price, new_plan["yearlyDiscountPercent"], new_plan["billingPeriod"],
            new_plan["messageLimit"], new_plan["catalogLimit"], new_plan["courierChannels"],
            json.dumps(new_plan["features"]), new_plan["badge"], new_plan["popular"],
            new_plan["activeMerchants"], new_plan["status"]
            )
        except Exception as e:
            print("Postgres insert failed:", e)
        finally:
            await conn.close()

    # Mirror to JSON
    plans = _get_json_plans()
    idx = next((i for i, p in enumerate(plans) if p.get("id") == plan_id), None)
    if idx is not None:
        plans[idx] = new_plan
    else:
        plans.append(new_plan)
    _save_json_plans(plans)

    return new_plan


async def update_stored_plan(plan_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    plans = await get_stored_plans()
    target = next((p for p in plans if p.get("id") == plan_id), None)
    if not target:
        return None

    for key, val in updates.items():
        if val is not None:
            target[key] = val

    return await create_stored_plan(target)


async def toggle_stored_plan_status(plan_id: str) -> dict[str, Any] | None:
    plans = await get_stored_plans()
    for p in plans:
        if p.get("id") == plan_id:
            current = p.get("status", "active")
            p["status"] = "archived" if current == "active" else "active"
            return await create_stored_plan(p)
    return None


async def delete_stored_plan(plan_id: str) -> bool:
    conn = await _get_pg_conn()
    if conn:
        try:
            await conn.execute("DELETE FROM subscription_plans WHERE plan_code = $1;", plan_id)
        except Exception as e:
            print("Postgres delete failed:", e)
        finally:
            await conn.close()

    plans = _get_json_plans()
    new_plans = [p for p in plans if p.get("id") != plan_id]
    if len(new_plans) != len(plans):
        _save_json_plans(new_plans)
        return True
    return False


# ─── Festival Offers Operations (PostgreSQL + JSON Mirror) ────

async def get_stored_festival_offers() -> list[dict[str, Any]]:
    conn = await _get_pg_conn()
    if conn:
        try:
            rows = await conn.fetch("""
                SELECT id, festival_name, festival_name_bn, coupon_code, discount_percent,
                       bonus_messages, validity, active
                FROM festival_offers
                ORDER BY created_at DESC;
            """)
            if rows:
                offers: list[dict[str, Any]] = []
                for r in rows:
                    offers.append({
                        "id": r["id"],
                        "festivalName": r["festival_name"],
                        "festivalNameBn": r["festival_name_bn"] or r["festival_name"],
                        "couponCode": r["coupon_code"],
                        "discountPercent": r["discount_percent"],
                        "bonusMessages": r["bonus_messages"],
                        "validity": r["validity"],
                        "active": r["active"],
                    })
                _save_json_offers(offers)
                return offers
        except Exception as e:
            print("Postgres festival offers read failed:", e)
        finally:
            await conn.close()

    return _get_json_offers()


async def create_stored_festival_offer(data: dict[str, Any]) -> dict[str, Any]:
    offer_id = data.get("id") or f"fest-{int(time.time() * 1000)}"
    new_offer: dict[str, Any] = {
        "id": offer_id,
        "festivalName": data.get("festivalName", ""),
        "festivalNameBn": data.get("festivalNameBn") or data.get("festivalName", ""),
        "couponCode": str(data.get("couponCode", "")).upper().replace(" ", ""),
        "discountPercent": int(data.get("discountPercent", 20)),
        "bonusMessages": int(data.get("bonusMessages", 0)),
        "validity": data.get("validity", "Limited Time Offer"),
        "active": bool(data.get("active", True)),
    }

    conn = await _get_pg_conn()
    if conn:
        try:
            await conn.execute("""
                INSERT INTO festival_offers (
                    id, festival_name, festival_name_bn, coupon_code, discount_percent,
                    bonus_messages, validity, active, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
                ) ON CONFLICT (id) DO UPDATE SET
                    festival_name = EXCLUDED.festival_name,
                    festival_name_bn = EXCLUDED.festival_name_bn,
                    coupon_code = EXCLUDED.coupon_code,
                    discount_percent = EXCLUDED.discount_percent,
                    bonus_messages = EXCLUDED.bonus_messages,
                    validity = EXCLUDED.validity,
                    active = EXCLUDED.active,
                    updated_at = NOW();
            """, new_offer["id"], new_offer["festivalName"], new_offer["festivalNameBn"],
            new_offer["couponCode"], new_offer["discountPercent"], new_offer["bonusMessages"],
            new_offer["validity"], new_offer["active"]
            )
        except Exception as e:
            print("Postgres festival insert failed:", e)
        finally:
            await conn.close()

    offers = _get_json_offers()
    idx = next((i for i, o in enumerate(offers) if o.get("id") == offer_id), None)
    if idx is not None:
        offers[idx] = new_offer
    else:
        offers.insert(0, new_offer)
    _save_json_offers(offers)

    return new_offer


async def update_stored_festival_offer(offer_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
    offers = await get_stored_festival_offers()
    target = next((o for o in offers if o.get("id") == offer_id), None)
    if not target:
        return None

    for key, val in updates.items():
        if val is not None:
            if key == "couponCode":
                target[key] = str(val).upper().replace(" ", "")
            else:
                target[key] = val

    return await create_stored_festival_offer(target)


async def toggle_stored_festival_offer(offer_id: str) -> dict[str, Any] | None:
    offers = await get_stored_festival_offers()
    for o in offers:
        if o.get("id") == offer_id:
            o["active"] = not o.get("active", False)
            return await create_stored_festival_offer(o)
    return None


async def delete_stored_festival_offer(offer_id: str) -> bool:
    conn = await _get_pg_conn()
    if conn:
        try:
            await conn.execute("DELETE FROM festival_offers WHERE id = $1;", offer_id)
        except Exception as e:
            print("Postgres festival delete failed:", e)
        finally:
            await conn.close()

    offers = _get_json_offers()
    new_offers = [o for o in offers if o.get("id") != offer_id]
    if len(new_offers) != len(offers):
        _save_json_offers(new_offers)
        return True
    return False

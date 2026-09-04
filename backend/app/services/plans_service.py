"""Service layer for Subscription Plans and Festival Offers with real PostgreSQL and JSON persistence."""
from __future__ import annotations

import json
import os
import re
import time
import uuid
from datetime import datetime
from typing import Any
import asyncpg

from app.core.config import settings

PLANS_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "plans.json")
)
FESTIVAL_OFFERS_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "festival_offers.json")
)
CUSTOM_CODES_FILE = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "custom_codes.json")
)

DEFAULT_INITIAL_PLANS: list[dict[str, Any]] = []

DEFAULT_INITIAL_OFFERS: list[dict[str, Any]] = []

DEFAULT_INITIAL_CUSTOM_CODES: list[dict[str, Any]] = [
    {
        "code": "CUSTOM-VIP-50K",
        "plan_name": "Custom Enterprise",
        "message_limit": 50000,
        "max_stores": 5,
        "max_seats": 20,
        "price_bdt": 15000.0,
        "features": [
            "50,000 AI Messages / month",
            "5 Connected Store Workspaces",
            "20 Team Member Seats",
            "All Channels: WhatsApp, Messenger, Instagram, Web",
            "Dedicated Enterprise SLA & Account Manager",
            "Custom ERP & POS Webhook Integrations",
        ],
        "active": True,
        "max_uses": 100,
        "used_count": 0,
    },
    {
        "code": "ENTERPRISE-100K",
        "plan_name": "Enterprise Scale",
        "message_limit": 100000,
        "max_stores": 10,
        "max_seats": 30,
        "price_bdt": 25000.0,
        "features": [
            "100,000 AI Messages / month",
            "10 Connected Store Workspaces",
            "30 Team Member Seats",
            "Dedicated High-Concurrency Cloud Node",
            "Custom Fine-Tuned Domain LLM",
            "24/7 Priority Emergency Support",
        ],
        "active": True,
        "max_uses": 100,
        "used_count": 0,
    },
    {
        "code": "CUSTOM-AGENCY",
        "plan_name": "Custom Agency",
        "message_limit": 25000,
        "max_stores": 4,
        "max_seats": 15,
        "price_bdt": 8500.0,
        "features": [
            "25,000 AI Messages / month",
            "4 Connected Store Workspaces",
            "15 Team Member Seats",
            "Multi-Courier Routing & Failover",
            "Full API & Webhook Access",
        ],
        "active": True,
        "max_uses": 100,
        "used_count": 0,
    },
    {
        "code": "ARISE-VIP",
        "plan_name": "Custom VIP",
        "message_limit": 30000,
        "max_stores": 4,
        "max_seats": 15,
        "price_bdt": 9999.0,
        "features": [
            "30,000 AI Messages / month",
            "4 Connected Store Workspaces",
            "15 Team Member Seats",
            "Priority VIP Support",
        ],
        "active": True,
        "max_uses": 100,
        "used_count": 0,
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
        _save_json_plans([])
        return []

    try:
        with open(PLANS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except Exception:
        pass
    return []


def _save_json_plans(plans: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    with open(PLANS_FILE, "w", encoding="utf-8") as f:
        json.dump(plans, f, indent=2, ensure_ascii=False)


def _get_json_offers() -> list[dict[str, Any]]:
    _ensure_data_dir()
    if not os.path.exists(FESTIVAL_OFFERS_FILE):
        _save_json_offers([])
        return []

    try:
        with open(FESTIVAL_OFFERS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list):
                return data
    except Exception:
        pass
    return []


def _save_json_offers(offers: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    with open(FESTIVAL_OFFERS_FILE, "w", encoding="utf-8") as f:
        json.dump(offers, f, indent=2, ensure_ascii=False)


def _get_json_custom_codes() -> list[dict[str, Any]]:
    _ensure_data_dir()
    if not os.path.exists(CUSTOM_CODES_FILE):
        _save_json_custom_codes(DEFAULT_INITIAL_CUSTOM_CODES)
        return DEFAULT_INITIAL_CUSTOM_CODES
    try:
        with open(CUSTOM_CODES_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
            if isinstance(data, list) and len(data) > 0:
                return data
    except Exception:
        pass
    _save_json_custom_codes(DEFAULT_INITIAL_CUSTOM_CODES)
    return DEFAULT_INITIAL_CUSTOM_CODES


def _save_json_custom_codes(codes: list[dict[str, Any]]) -> None:
    _ensure_data_dir()
    with open(CUSTOM_CODES_FILE, "w", encoding="utf-8") as f:
        json.dump(codes, f, indent=2, ensure_ascii=False)


# ─── Plans Operations (PostgreSQL + JSON Mirror) ───────────────

async def get_stored_plans() -> list[dict[str, Any]]:
    conn = await _get_pg_conn()
    if conn:
        try:
            rows = await conn.fetch("""
                SELECT plan_code, name, name_bn, tagline, price_bdt, yearly_price_bdt,
                       yearly_discount_percent, billing_period, message_limit, catalog_limit,
                       courier_channels, features, badge, popular, active_merchants, status,
                       show_on_home, max_stores, max_seats
                FROM subscription_plans
                ORDER BY price_bdt ASC;
            """)
            plans: list[dict[str, Any]] = []
            for r in rows:
                feats = json.loads(r["features"]) if isinstance(r["features"], str) else (r["features"] or [])
                p_name_lower = (r["name"] or "").lower()
                def_stores = 2 if "business" in p_name_lower else (10 if any(k in p_name_lower for k in ["enter", "scale", "custom", "vip"]) else 1)
                def_seats = 1 if "free" in p_name_lower else (4 if "pro" in p_name_lower else (8 if "business" in p_name_lower else (30 if any(k in p_name_lower for k in ["enter", "scale", "custom", "vip"]) else 2)))
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
                    "maxStores": int(r["max_stores"]) if r["max_stores"] is not None else def_stores,
                    "maxSeats": int(r["max_seats"]) if r["max_seats"] is not None else def_seats,
                    "catalogLimit": r["catalog_limit"],
                    "courierChannels": r["courier_channels"],
                    "features": feats,
                    "badge": r["badge"],
                    "popular": bool(r["popular"]),
                    "activeMerchants": r["active_merchants"],
                    "status": r["status"],
                    "showOnHome": bool(r["show_on_home"]) if r["show_on_home"] is not None else True,
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
    yearly_raw = data.get("yearlyPriceBDT")
    discount_raw = data.get("yearlyDiscountPercent")

    yearly_discount = 0
    yearly_price = 0.0

    if price_bdt > 0:
        annual_full = price_bdt * 12
        # Case A: Admin provided discount percent, but yearlyPriceBDT is missing or 0
        if discount_raw is not None and int(discount_raw) > 0 and (yearly_raw is None or float(yearly_raw) == 0):
            yearly_discount = max(0, min(100, int(discount_raw)))
            yearly_price = round(annual_full * (1 - yearly_discount / 100))
        # Case B: Admin provided yearly price
        elif yearly_raw is not None and float(yearly_raw) > 0:
            yearly_price = float(yearly_raw)
            yearly_discount = max(0, min(100, round(((annual_full - yearly_price) / annual_full) * 100)))
        # Case C: Admin provided discount percent (e.g. 0%)
        elif discount_raw is not None:
            yearly_discount = max(0, min(100, int(discount_raw)))
            yearly_price = round(annual_full * (1 - yearly_discount / 100))
        # Case D: Default to 10 months (2 mo free, 17% savings)
        else:
            yearly_price = price_bdt * 10
            yearly_discount = 17

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
        "maxStores": int(data.get("maxStores", 1)),
        "maxSeats": int(data.get("maxSeats", 1)),
        "catalogLimit": int(data.get("catalogLimit", 250)),
        "courierChannels": int(data.get("courierChannels", 2)),
        "features": data.get("features", []),
        "badge": data.get("badge"),
        "popular": bool(data.get("popular", False)),
        "activeMerchants": int(data.get("activeMerchants", 0)),
        "status": "active" if bool(data.get("showOnHome", False)) else data.get("status", "active"),
        "showOnHome": bool(data.get("showOnHome", False)),
    }

    # Save to PostgreSQL
    conn = await _get_pg_conn()
    if conn:
        try:
            row_id = uuid.uuid5(uuid.NAMESPACE_DNS, plan_id)
            await conn.execute("""
                INSERT INTO subscription_plans (
                    id, plan_code, name, name_bn, tagline, price_bdt, yearly_price_bdt,
                    yearly_discount_percent, billing_period, message_limit, max_stores, max_seats,
                    catalog_limit, courier_channels, features, badge, popular, active_merchants, status,
                    show_on_home, created_at, updated_at
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
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
                    max_stores = EXCLUDED.max_stores,
                    max_seats = EXCLUDED.max_seats,
                    catalog_limit = EXCLUDED.catalog_limit,
                    courier_channels = EXCLUDED.courier_channels,
                    features = EXCLUDED.features,
                    badge = EXCLUDED.badge,
                    popular = EXCLUDED.popular,
                    status = EXCLUDED.status,
                    show_on_home = EXCLUDED.show_on_home,
                    updated_at = NOW();
            """, row_id, plan_id, new_plan["name"], new_plan["nameBn"], new_plan["tagline"],
            price_bdt, yearly_price, new_plan["yearlyDiscountPercent"], new_plan["billingPeriod"],
            new_plan["messageLimit"], new_plan["maxStores"], new_plan["maxSeats"],
            new_plan["catalogLimit"], new_plan["courierChannels"],
            json.dumps(new_plan["features"]), new_plan["badge"], new_plan["popular"],
            new_plan["activeMerchants"], new_plan["status"], new_plan["showOnHome"]
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
            new_status = "archived" if current == "active" else "active"
            p["status"] = new_status
            if new_status == "archived":
                p["showOnHome"] = False
            return await create_stored_plan(p)
    return None


async def toggle_stored_plan_home(plan_id: str) -> dict[str, Any] | None:
    plans = await get_stored_plans()
    for p in plans:
        if p.get("id") == plan_id:
            current = bool(p.get("showOnHome", True))
            p["showOnHome"] = not current
            return await create_stored_plan(p)
    return None


async def delete_stored_plan(plan_id: str) -> bool:
    deleted = False
    conn = await _get_pg_conn()
    if conn:
        try:
            res = await conn.execute("DELETE FROM subscription_plans WHERE plan_code = $1;", plan_id)
            if res and res != "DELETE 0":
                deleted = True
        except Exception as e:
            print("Postgres delete failed:", e)
        finally:
            await conn.close()

    plans = _get_json_plans()
    new_plans = [p for p in plans if p.get("id") != plan_id]
    if len(new_plans) != len(plans):
        deleted = True
        _save_json_plans(new_plans)
    return deleted


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
    deleted = False
    conn = await _get_pg_conn()
    if conn:
        try:
            res = await conn.execute("DELETE FROM festival_offers WHERE id = $1;", offer_id)
            if res and res != "DELETE 0":
                deleted = True
        except Exception as e:
            print("Postgres festival delete failed:", e)
        finally:
            await conn.close()

    offers = _get_json_offers()
    new_offers = [o for o in offers if o.get("id") != offer_id]
    if len(new_offers) != len(offers):
        deleted = True
        _save_json_offers(new_offers)
    return deleted


# ─── Custom Enterprise Activation Codes ────────────────────────

def get_custom_activation_codes() -> list[dict[str, Any]]:
    codes = _get_json_custom_codes()
    return [
        {
            "code": c.get("code"),
            "plan_id": c.get("plan_id"),
            "plan_name": c.get("plan_name"),
            "duration_months": c.get("duration_months", 1),
            "message_limit": c.get("message_limit"),
            "max_stores": c.get("max_stores", 5),
            "max_seats": c.get("max_seats", 20),
            "price_bdt": c.get("price_bdt", 15000.0),
            "code_expiry": c.get("code_expiry"),
            "features": c.get("features", []),
            "active": c.get("active", True),
            "used_count": c.get("used_count", 0),
            "max_uses": c.get("max_uses", 1),
            "created_at": c.get("created_at"),
        }
        for c in codes
        if c.get("active", True)
    ]


def create_custom_activation_code(data: dict[str, Any]) -> dict[str, Any]:
    codes = _get_json_custom_codes()
    raw_code = data.get("code")
    plan_name = data.get("plan_name", "Custom Enterprise")
    duration = max(1, int(data.get("duration_months", 1)))

    if raw_code and str(raw_code).strip():
        clean_code = re.sub(r"[^A-Z0-9_-]+", "", str(raw_code).strip().upper())
    else:
        # Auto-generate pattern: e.g. ENTERPRIZE-6M-A8B9 or CUSTOM-5M-X9Y2
        prefix = re.sub(r"[^A-Z0-9]+", "", plan_name.upper())[:10] or "CUSTOM"
        unique_suffix = uuid.uuid4().hex[:4].upper()
        clean_code = f"{prefix}-{duration}M-{unique_suffix}"

    new_code = {
        "code": clean_code,
        "plan_id": data.get("plan_id") or clean_code.lower(),
        "plan_name": plan_name,
        "duration_months": duration,
        "message_limit": int(data.get("message_limit", 50000)),
        "max_stores": int(data.get("max_stores", 5)),
        "max_seats": int(data.get("max_seats", 20)),
        "price_bdt": float(data.get("price_bdt", 0.0)),
        "code_expiry": data.get("code_expiry") or None,
        "features": data.get("features") or [
            f"{int(data.get('message_limit', 50000)):,} AI Messages / month",
            f"{int(data.get('max_stores', 5))} Connected Stores",
            f"{int(data.get('max_seats', 20))} Team Member Seats",
            f"{duration} Months Full Access License",
            "Dedicated Account Manager & SLA",
        ],
        "active": True,
        "max_uses": int(data.get("max_uses", 1)),
        "used_count": 0,
        "created_at": datetime.now().isoformat(),
    }

    # Replace if duplicate code or insert at top
    idx = next((i for i, c in enumerate(codes) if c.get("code", "").upper() == clean_code), None)
    if idx is not None:
        codes[idx] = new_code
    else:
        codes.insert(0, new_code)

    _save_json_custom_codes(codes)
    return new_code


def delete_custom_activation_code(code_str: str) -> bool:
    clean_code = code_str.strip().upper()
    codes = _get_json_custom_codes()
    initial_len = len(codes)
    codes = [c for c in codes if c.get("code", "").strip().upper() != clean_code]
    if len(codes) != initial_len:
        _save_json_custom_codes(codes)
        return True
    return False


def verify_activation_code(code_str: str) -> dict[str, Any]:
    norm_code = code_str.strip().upper()
    codes = _get_json_custom_codes()
    today_str = datetime.now().strftime("%Y-%m-%d")

    for item in codes:
        if item.get("code", "").strip().upper() == norm_code:
            if not item.get("active", True):
                return {"valid": False, "error": "This activation code is deactivated or revoked."}

            expiry = item.get("code_expiry")
            if expiry and today_str > str(expiry).strip():
                return {"valid": False, "error": f"This activation voucher expired on {expiry}. Please request a renewed code from sales."}

            used = int(item.get("used_count", 0))
            max_u = int(item.get("max_uses", 1))
            if used >= max_u:
                return {"valid": False, "error": "This activation code has already been redeemed."}

            return {
                "valid": True,
                "code": item.get("code"),
                "plan_id": item.get("plan_id"),
                "plan_name": item.get("plan_name", "Custom Enterprise"),
                "duration_months": item.get("duration_months", 1),
                "message_limit": item.get("message_limit", 50000),
                "max_stores": item.get("max_stores", 5),
                "max_seats": item.get("max_seats", 20),
                "price_bdt": float(item.get("price_bdt", 0.0)),
                "code_expiry": item.get("code_expiry"),
                "features": item.get("features") or [
                    f"{int(item.get('message_limit', 50000)):,} AI Messages / month",
                    f"{int(item.get('max_stores', 5))} Connected Stores",
                    f"{int(item.get('max_seats', 20))} Team Member Seats",
                    f"{item.get('duration_months', 1)} Months Full Access License",
                    "Dedicated Account Manager & SLA",
                ],
            }
    return {"valid": False, "error": "Invalid activation code. Please check and try again."}


def find_and_redeem_code(code_str: str) -> dict[str, Any] | None:
    norm_code = code_str.strip().upper()
    codes = _get_json_custom_codes()
    today_str = datetime.now().strftime("%Y-%m-%d")

    for item in codes:
        if item.get("code", "").strip().upper() == norm_code:
            if not item.get("active", True):
                return {"error": "This activation code is deactivated or revoked."}

            expiry = item.get("code_expiry")
            if expiry and today_str > str(expiry).strip():
                return {"error": f"This activation voucher expired on {expiry}. Please request a renewed code from sales."}

            used = int(item.get("used_count", 0))
            max_u = int(item.get("max_uses", 1))
            if used >= max_u:
                return {"error": "This activation code has already been redeemed."}

            item["used_count"] = used + 1
            _save_json_custom_codes(codes)
            return item
    return None


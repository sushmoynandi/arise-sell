"""In-memory & Persistent Live Conversation Store for Omnichannel Live Inbox."""
from __future__ import annotations

import os
import json
import datetime
from pathlib import Path
from typing import Any

DATA_FILE = Path(__file__).parent.parent.parent / "live_threads.json"

DEFAULT_THREADS: list[dict[str, Any]] = [
    {
        "id": "wa-8801305087389",
        "customer": "Sushmoy Nandi",
        "handle": "+8801305087389",
        "channel": "whatsapp",
        "lang": "banglish",
        "district": "Dhaka",
        "status": "ai",
        "intent": "Saree Collection & Delivery",
        "value": 2500,
        "unread": 0,
        "lastAt": "Just now",
        "messages": [
            {
                "id": "m1",
                "from": "customer",
                "lang": "banglish",
                "body": "Apnadar Kaca ki Saree aca?",
                "at": "23:46",
            },
            {
                "id": "m2",
                "from": "agent",
                "body": "নমস্কার! আমাদের পেজে আপনাকে অনেক স্বাগত। জি, আমাদের কাছে তাঁত, জামদানি ও কটনসহ বেশ কিছু সুন্দর শাড়ির সংগ্রহ রয়েছে... আমাদের ডেলিভারি চার্জ ঢাকার ভেতরে ৮০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা। 🌾",
                "at": "23:46",
                "action": {
                    "label": "AI Handled (Gemini)",
                    "detail": "Product Catalog & Delivery Quoted",
                    "tone": "signal",
                },
            },
            {
                "id": "m3",
                "from": "customer",
                "lang": "banglish",
                "body": "Tumi kmn aco AJ ratha vat kaiyaco?",
                "at": "23:51",
            },
            {
                "id": "m4",
                "from": "agent",
                "body": "আসসালামু আলাইকুম। আল্লাহর অশেষ রহমতে আমি ভালো আছি, আশা করি আপনিও ভালো আছেন। আমাদের ডেলিভারি চার্জ ঢাকার ভেতরে ৮০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা। বলুন, কোন ধরণের পণ্যের সংগ্রহ দেখাতে পারি? 🌾",
                "at": "23:51",
                "action": {
                    "label": "AI Handled (Gemini)",
                    "detail": "Polite Sales Response",
                    "tone": "signal",
                },
            },
        ],
        "insights": {
            "sentiment": "high_intent",
            "urgency": "normal",
            "suggestedAction": "Ready for Order Confirmation",
        },
    },
    {
        "id": "wa-8801841620810",
        "customer": "Customer (+0810)",
        "handle": "+8801841620810",
        "channel": "whatsapp",
        "lang": "banglish",
        "district": "Dhaka",
        "status": "ai",
        "intent": "Store Catalog & Availability",
        "value": 3500,
        "unread": 0,
        "lastAt": "11:55 pm",
        "messages": [
            {
                "id": "m1",
                "from": "customer",
                "lang": "banglish",
                "body": "Tomar dokane ki ase...",
                "at": "23:54",
            },
            {
                "id": "m2",
                "from": "agent",
                "body": "নমস্কার! আমাদের পেজে আপনাকে স্বাগতম। আমাদের ঐতিহ্যবাহী জামদানি, তাঁত ও কটন শাড়িসহ দেশীয় লাইফস্টাইল পণ্য রয়েছে। 🌾",
                "at": "23:54",
                "action": {
                    "label": "AI Handled (Gemini)",
                    "detail": "Store Overview & Product Offerings",
                    "tone": "signal",
                },
            },
            {
                "id": "m3",
                "from": "customer",
                "lang": "banglish",
                "body": "K Tumi vai",
                "at": "23:55",
            },
            {
                "id": "m4",
                "from": "agent",
                "body": "আমি আপনার শপিং অ্যাসিস্ট্যান্ট! আপনাকে আমাদের যেকোনো পণ্য বা ডেলিভারির বিষয়ে সাহায্য করতে প্রস্তুত। 🌾",
                "at": "23:55",
                "action": {
                    "label": "AI Handled (Gemini)",
                    "detail": "Assistant Introduction",
                    "tone": "signal",
                },
            },
        ],
        "insights": {
            "sentiment": "casual",
            "urgency": "normal",
            "suggestedAction": "Send Product Catalog",
        },
    },
    {
        "id": "wa-8801334186519",
        "customer": "Sifat",
        "handle": "+8801334186519",
        "channel": "whatsapp",
        "lang": "banglish",
        "district": "Dhaka",
        "status": "ai",
        "intent": "Greeting & Store Introduction",
        "value": 1500,
        "unread": 0,
        "lastAt": "11:47 pm",
        "messages": [
            {
                "id": "m1",
                "from": "customer",
                "lang": "banglish",
                "body": "Hi",
                "at": "23:47",
            },
            {
                "id": "m2",
                "from": "agent",
                "body": "নমস্কার! আমাদের পেজে আপনাকে স্বাগতম। আশা করি ভালো আছেন। আজ আপনাকে কীভাবে সাহায্য করতে পারি বলুন তো? 🌾",
                "at": "23:47",
                "action": {
                    "label": "AI Handled (Gemini)",
                    "detail": "Automated Greeting & Sales Introduction",
                    "tone": "signal",
                },
            },
            {
                "id": "m3",
                "from": "customer",
                "lang": "banglish",
                "body": "Apnader sngraho theke kisu dekhan",
                "at": "23:50",
            },
            {
                "id": "m4",
                "from": "agent",
                "body": "আমাদের ঐতিহ্যবাহী সুতি শাড়ি, পাঞ্জাবি, থ্রি-পিস এবং ঘর সাজানোর নানা পণ্যের চমৎকার সংগ্রহ রয়েছে। ডেলিভারি চার্জ ঢাকার ভেতর ৮০৳, বাইরে ১৩০৳। 🌾",
                "at": "23:50",
                "action": {
                    "label": "AI Handled (Gemini)",
                    "detail": "Collection Showcase",
                    "tone": "signal",
                },
            },
        ],
        "insights": {
            "sentiment": "casual",
            "urgency": "normal",
            "suggestedAction": "Show bestsellers",
        },
    },
    {
        "id": "wa-8801718360044",
        "customer": "Farhan Kabir",
        "handle": "+8801718360044",
        "channel": "whatsapp",
        "lang": "banglish",
        "district": "Dhaka",
        "status": "ai",
        "intent": "Jamdani Saree Price",
        "value": 6850,
        "unread": 0,
        "lastAt": "11:42 pm",
        "messages": [
            {
                "id": "m1",
                "from": "customer",
                "lang": "banglish",
                "body": "Jamdani saarir price koto?",
                "at": "23:42",
            },
            {
                "id": "m2",
                "from": "agent",
                "body": "নমস্কার! আমাদের জামদানি শাড়ির প্রতি আগ্রহ দেখানোর জন্য আপনাকে অনেক ধন্যবাদ। আমাদের ঐতিহ্যবাহী সুতি ও হাফ-সিল্ক জামদানি শাড়িগুলোর দাম সাধারণত ২,৫০০ টাকা থেকে ১৫,০০০ টাকা পর্যন্ত হয়ে থাকে... 🌾",
                "at": "23:42",
                "action": {
                    "label": "AI Handled (Gemini)",
                    "detail": "Price & Delivery Quoted",
                    "tone": "signal",
                },
            },
        ],
        "insights": {
            "sentiment": "high_intent",
            "urgency": "high",
            "suggestedAction": "Send Product Images",
        },
    },
]


def _load_threads() -> list[dict[str, Any]]:
    """Load threads from disk or initialize with default threads."""
    if DATA_FILE.exists():
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list) and len(data) > 0:
                    return data
        except Exception:
            pass
    return list(DEFAULT_THREADS)


def _save_threads(threads: list[dict[str, Any]]) -> None:
    """Save threads permanently to disk."""
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(threads, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Live Store Save Error]: {e}", flush=True)


LIVE_THREADS: list[dict[str, Any]] = _load_threads()


def record_live_whatsapp_interaction(
    from_phone: str,
    customer_name: str,
    customer_text: str,
    ai_reply_text: str,
    channel: str = "whatsapp",
) -> None:
    """Record incoming customer message and outgoing AI response into the Live Inbox."""
    global LIVE_THREADS
    now_str = datetime.datetime.now().strftime("%H:%M")
    clean_phone = "".join(filter(str.isdigit, str(from_phone)))
    formatted_handle = f"+{clean_phone}" if clean_phone else from_phone
    thread_id = f"wa-{clean_phone}"

    # Check if thread exists
    existing = next((t for t in LIVE_THREADS if t["id"] == thread_id or "".join(filter(str.isdigit, str(t.get("handle", "")))) == clean_phone), None)

    msg_cust = {
        "id": f"m-{len(existing['messages']) + 1}" if existing else "m1",
        "from": "customer",
        "lang": "banglish",
        "body": customer_text,
        "at": now_str,
    }

    msg_ai = {
        "id": f"m-{len(existing['messages']) + 2}" if existing else "m2",
        "from": "agent",
        "body": ai_reply_text,
        "at": now_str,
        "action": {
            "label": "AI Handled (Gemini)",
            "detail": "Automated reasoning & sales reply",
            "tone": "signal",
        },
    }

    if existing:
        existing["messages"].extend([msg_cust, msg_ai])
        existing["lastAt"] = "Just now"
        existing["unread"] = 0
        existing["status"] = "ai"
        if customer_name and not existing.get("customer", "").startswith("Customer (+"):
            existing["customer"] = customer_name
        # Move to top
        LIVE_THREADS.remove(existing)
        LIVE_THREADS.insert(0, existing)
    else:
        new_thread = {
            "id": thread_id,
            "customer": customer_name or f"Customer (+{clean_phone[-4:] if len(clean_phone)>=4 else clean_phone})",
            "handle": formatted_handle,
            "channel": channel,
            "lang": "bengali",
            "district": "Dhaka",
            "status": "ai",
            "intent": "Product Inquiry & Delivery",
            "value": 2500,
            "unread": 0,
            "lastAt": "Just now",
            "messages": [msg_cust, msg_ai],
            "insights": {
                "sentiment": "high_intent",
                "urgency": "normal",
                "suggestedAction": "Ready for Order Confirmation",
            },
        }
        LIVE_THREADS.insert(0, new_thread)

    _save_threads(LIVE_THREADS)


def record_merchant_reply(
    handle: str,
    reply_body: str,
    thread_id: str | None = None,
    business_id: str | None = None,
) -> dict[str, Any]:
    """Record manual merchant message into the Live Inbox thread."""
    global LIVE_THREADS
    now_str = datetime.datetime.now().strftime("%H:%M")
    clean_phone = "".join(filter(str.isdigit, str(handle)))
    t_id = thread_id or f"wa-{clean_phone}"

    existing = next((t for t in LIVE_THREADS if t["id"] == t_id or "".join(filter(str.isdigit, str(t.get("handle", "")))) == clean_phone), None)

    msg_human = {
        "id": f"m-{len(existing['messages']) + 1}" if existing else "m1",
        "from": "human",
        "body": reply_body,
        "at": now_str,
        "action": {
            "label": "Human Agent Reply",
            "detail": "Sent from Web Dashboard Inbox",
            "tone": "signal",
        },
    }

    if existing:
        existing["messages"].append(msg_human)
        existing["lastAt"] = "Just now"
        existing["status"] = "human"
        if business_id:
            existing["business_id"] = str(business_id)
    else:
        new_thread = {
            "id": t_id,
            "business_id": str(business_id) if business_id else None,
            "customer": f"Customer (+{clean_phone[-4:] if len(clean_phone)>=4 else clean_phone})",
            "handle": f"+{clean_phone}" if clean_phone else handle,
            "channel": "whatsapp",
            "lang": "bengali",
            "district": "Dhaka",
            "status": "human",
            "intent": "Merchant Direct Chat",
            "value": 0,
            "unread": 0,
            "lastAt": "Just now",
            "messages": [msg_human],
        }
        LIVE_THREADS.insert(0, new_thread)

    _save_threads(LIVE_THREADS)
    return msg_human


def get_live_threads() -> list[dict[str, Any]]:
    """Return all recorded live threads."""
    global LIVE_THREADS
    LIVE_THREADS = _load_threads()
    return LIVE_THREADS


def get_ai_messages_count() -> int:
    """Return total count of AI-generated messages/replies across active conversation threads."""
    threads = get_live_threads()
    count = 0
    for t in threads:
        for m in t.get("messages", []):
            if m.get("from") in ["agent", "bot"] or "AI" in m.get("action", {}).get("label", ""):
                count += 1
    return count

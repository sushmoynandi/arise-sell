const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const servicesDir = path.join(rootDir, 'backend', 'app', 'services');
const webhooksDir = path.join(rootDir, 'backend', 'app', 'api', 'webhooks');

// 1. meta_oauth.py
const metaOAuthPy = `"""Meta Facebook Login for Business OAuth Exchange & Page Subscription."""
from __future__ import annotations

import httpx
from typing import Any
from app.core.config import settings

GRAPH_API_VERSION = "v21.0"
GRAPH_API_BASE = f"https://graph.facebook.com/{GRAPH_API_VERSION}"


def get_meta_oauth_url(redirect_uri: str, state: str) -> str:
    client_id = settings.META_APP_SECRET
    scope = "pages_show_list,pages_read_engagement,pages_manage_posts,pages_messaging,whatsapp_business_messaging,instagram_basic,instagram_manage_messages,instagram_manage_comments"
    return (
        f"https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth?"
        f"client_id={client_id}&redirect_uri={redirect_uri}&state={state}&scope={scope}&response_type=code"
    )


async def exchange_meta_code_for_long_lived_token(
    code: str,
    redirect_uri: str,
) -> dict[str, Any]:
    if not settings.META_APP_SECRET:
        return {
            "status": "simulated",
            "access_token": "EAAG...long_lived_token_sample",
            "token_type": "bearer",
            "expires_in": 5184000,
        }

    url = f"{GRAPH_API_BASE}/oauth/access_token"
    params = {
        "client_id": settings.META_APP_SECRET,
        "redirect_uri": redirect_uri,
        "client_secret": settings.META_APP_SECRET,
        "code": code,
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, params=params)
        return res.json()


async def subscribe_page_to_webhooks(page_id: str, page_access_token: str) -> dict[str, Any]:
    url = f"{GRAPH_API_BASE}/{page_id}/subscribed_apps"
    params = {
        "subscribed_fields": "messages,messaging_postbacks,messaging_optins,message_deliveries,message_reads,feed",
        "access_token": page_access_token,
    }

    if not page_access_token or page_access_token.startswith("EAAG..."):
        return {"success": True, "status": "simulated"}

    async with httpx.AsyncClient() as client:
        res = await client.post(url, params=params)
        return res.json()
`;
fs.writeFileSync(path.join(servicesDir, 'meta_oauth.py'), metaOAuthPy, 'utf8');

// 2. courier_steadfast.py
const steadfastPy = `"""Steadfast Courier API Integration for Automated Cash-on-Delivery Dispatch."""
from __future__ import annotations

import uuid
import httpx
from typing import Any
from app.core.config import settings

STEADFAST_BASE_URL = "https://portal.steadfast.com.bd/api/v1"


async def create_steadfast_consignment(
    invoice: str,
    recipient_name: str,
    recipient_phone: str,
    recipient_address: str,
    cod_amount: float,
    note: str = "",
) -> dict[str, Any]:
    if not settings.STEADFAST_API_KEY:
        consignment_id = f"SF-{uuid.uuid4().hex[:7].upper()}"
        return {
            "status": 200,
            "message": "Consignment created successfully (Sandbox)",
            "consignment": {
                "consignment_id": consignment_id,
                "invoice": invoice,
                "tracking_code": f"{consignment_id}BD",
                "recipient_name": recipient_name,
                "recipient_phone": recipient_phone,
                "recipient_address": recipient_address,
                "cod_amount": cod_amount,
                "status": "in_review",
            },
        }

    url = f"{STEADFAST_BASE_URL}/create_order"
    headers = {
        "Api-Key": settings.STEADFAST_API_KEY,
        "Secret-Key": settings.STEADFAST_SECRET_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "invoice": invoice,
        "recipient_name": recipient_name,
        "recipient_phone": recipient_phone,
        "recipient_address": recipient_address,
        "cod_amount": cod_amount,
        "note": note,
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, headers=headers, timeout=15.0)
        return res.json()


async def check_steadfast_status(consignment_id: str) -> dict[str, Any]:
    if not settings.STEADFAST_API_KEY:
        return {"status": 200, "delivery_status": "in_transit", "consignment_id": consignment_id}

    url = f"{STEADFAST_BASE_URL}/status_by_cid/{consignment_id}"
    headers = {
        "Api-Key": settings.STEADFAST_API_KEY,
        "Secret-Key": settings.STEADFAST_SECRET_KEY,
    }

    async with httpx.AsyncClient() as client:
        res = await client.get(url, headers=headers, timeout=10.0)
        return res.json()
`;
fs.writeFileSync(path.join(servicesDir, 'courier_steadfast.py'), steadfastPy, 'utf8');

// 3. courier_pathao.py
const pathaoPy = `"""Pathao Courier Hermes API Integration for Dhaka Metro Express."""
from __future__ import annotations

import uuid
import httpx
from typing import Any
from app.core.config import settings

PATHAO_BASE_URL = "https://api-hermes.pathao.com/aladdin/api/v1"


async def get_pathao_access_token() -> str:
    if not settings.PATHAO_CLIENT_ID:
        return "mock_pathao_token"

    url = f"{PATHAO_BASE_URL}/issue-token"
    payload = {
        "client_id": settings.PATHAO_CLIENT_ID,
        "client_secret": settings.PATHAO_CLIENT_SECRET,
        "grant_type": "client_credentials",
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload)
        data = res.json()
        return data.get("access_token", "")


async def create_pathao_order(
    recipient_name: str,
    recipient_phone: str,
    recipient_address: str,
    recipient_city_id: int = 1,
    recipient_zone_id: int = 1,
    amount_to_collect: float = 0.0,
    item_description: str = "Apparel",
    note: str = "",
) -> dict[str, Any]:
    token = await get_pathao_access_token()

    if not settings.PATHAO_CLIENT_ID:
        consignment_id = f"PTH-{uuid.uuid4().hex[:6].upper()}"
        return {
            "type": "success",
            "message": "Order created successfully (Sandbox)",
            "data": {
                "consignment_id": consignment_id,
                "merchant_order_id": f"MO-{uuid.uuid4().hex[:5].upper()}",
                "order_status": "Pickup Pending",
                "delivery_fee": 80.0,
            },
        }

    url = f"{PATHAO_BASE_URL}/orders"
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "store_id": 1,
        "recipient_name": recipient_name,
        "recipient_phone": recipient_phone,
        "recipient_address": recipient_address,
        "recipient_city": recipient_city_id,
        "recipient_zone": recipient_zone_id,
        "amount_to_collect": amount_to_collect,
        "item_type": 1,
        "item_quantity": 1,
        "item_weight": 0.5,
        "item_description": item_description,
        "special_instruction": note,
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, headers=headers, timeout=15.0)
        return res.json()
`;
fs.writeFileSync(path.join(servicesDir, 'courier_pathao.py'), pathaoPy, 'utf8');

// 4. payment_bkash.py
const bkashPy = `"""bKash Tokenized Merchant Payment API Integration."""
from __future__ import annotations

import uuid
import httpx
from typing import Any
from app.core.config import settings

BKASH_SANDBOX_BASE = "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout"


async def grant_bkash_token() -> str:
    if not settings.BKASH_APP_KEY:
        return "mock_bkash_token"

    url = f"{BKASH_SANDBOX_BASE}/token/grant"
    headers = {
        "username": "sandbox_user",
        "password": "sandbox_password",
        "Content-Type": "application/json",
    }
    payload = {
        "app_key": settings.BKASH_APP_KEY,
        "app_secret": settings.BKASH_APP_SECRET,
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, headers=headers)
        return res.json().get("id_token", "")


async def create_bkash_payment(
    amount: float,
    invoice_number: str,
    callback_url: str,
) -> dict[str, Any]:
    if not settings.BKASH_APP_KEY:
        payment_id = f"TR0011{uuid.uuid4().hex[:6].upper()}"
        return {
            "statusCode": "0000",
            "statusMessage": "Successful",
            "paymentID": payment_id,
            "bkashURL": f"https://sandbox.bka.sh/checkout?paymentID={payment_id}",
            "amount": str(amount),
            "currency": "BDT",
            "intent": "sale",
            "merchantInvoiceNumber": invoice_number,
        }

    token = await grant_bkash_token()
    url = f"{BKASH_SANDBOX_BASE}/create"
    headers = {
        "Authorization": token,
        "X-APP-Key": settings.BKASH_APP_KEY,
        "Content-Type": "application/json",
    }
    payload = {
        "mode": "0011",
        "payerReference": "01700000000",
        "callbackURL": callback_url,
        "amount": str(amount),
        "currency": "BDT",
        "intent": "sale",
        "merchantInvoiceNumber": invoice_number,
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(url, json=payload, headers=headers)
        return res.json()


async def execute_bkash_payment(payment_id: str) -> dict[str, Any]:
    if not settings.BKASH_APP_KEY:
        return {
            "statusCode": "0000",
            "statusMessage": "Successful",
            "paymentID": payment_id,
            "trxID": f"BKH{uuid.uuid4().hex[:8].upper()}",
            "transactionStatus": "Completed",
            "amount": "1450.00",
            "currency": "BDT",
        }

    token = await grant_bkash_token()
    url = f"{BKASH_SANDBOX_BASE}/execute"
    headers = {
        "Authorization": token,
        "X-APP-Key": settings.BKASH_APP_KEY,
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient() as client:
        res = await client.post(url, json={"paymentID": payment_id}, headers=headers)
        return res.json()
`;
fs.writeFileSync(path.join(servicesDir, 'payment_bkash.py'), bkashPy, 'utf8');

// 5. payment_sslcommerz.py
const sslcommerzPy = `"""SSLCommerz Corporate Payment Gateway Adapter."""
from __future__ import annotations

import uuid
import httpx
from typing import Any
from app.core.config import settings

SSLCOMMERZ_SANDBOX_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"


async def create_sslcommerz_payment_session(
    order_id: str,
    amount: float,
    customer_name: str,
    customer_email: str,
    customer_phone: str,
    customer_address: str,
    success_url: str,
    fail_url: str,
    cancel_url: str,
) -> dict[str, Any]:
    if not settings.SSLCOMMERZ_STORE_ID:
        session_id = f"SSL{uuid.uuid4().hex[:8].upper()}"
        return {
            "status": "SUCCESS",
            "sessionkey": session_id,
            "GatewayPageURL": f"https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=pay&SESSIONKEY={session_id}",
        }

    payload = {
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
        "total_amount": amount,
        "currency": "BDT",
        "tran_id": order_id,
        "success_url": success_url,
        "fail_url": fail_url,
        "cancel_url": cancel_url,
        "cus_name": customer_name,
        "cus_email": customer_email or "customer@alapai.app",
        "cus_add1": customer_address,
        "cus_city": "Dhaka",
        "cus_country": "Bangladesh",
        "cus_phone": customer_phone,
        "shipping_method": "Courier",
        "num_of_item": 1,
        "product_name": "Apparel and Lifestyle Goods",
        "product_category": "Ecommerce",
        "product_profile": "general",
    }

    async with httpx.AsyncClient() as client:
        res = await client.post(SSLCOMMERZ_SANDBOX_URL, data=payload)
        return res.json()
`;
fs.writeFileSync(path.join(servicesDir, 'payment_sslcommerz.py'), sslcommerzPy, 'utf8');

// 6. delivery_calculator.py
const deliveryCalcPy = `"""Bangladesh 64-District Aware Auto-Routing & Delivery Fee Calculator."""
from __future__ import annotations

from typing import Any

DHAKA_METRO_AREAS = [
    "dhaka", "gulshan", "banani", "dhanmondi", "uttara", "mirpur", "mohammadpur",
    "badda", "motijheel", "bashundhara", "khilgaon", "rampura", "malibagh",
    "baridhara", "lalbagh", "tejgaon", "shahbagh", "ঢাকা", "গুলশান",
]

SUB_DHAKA_AREAS = [
    "savar", "gazipur", "keraniganj", "narayanganj", "tongi", "সাভার", "গাজীপুর", "নারায়ণগঞ্জ",
]


def resolve_district_and_courier(address: str, district: str | None = None) -> dict[str, Any]:
    combined = f"{address} {district or ''}".lower()

    if any(area in combined for area in DHAKA_METRO_AREAS):
        return {
            "zone": "inside_dhaka",
            "district": "Dhaka",
            "recommended_courier": "pathao",
            "delivery_charge": 80.0,
            "eta": "Next-day Express (within 24 hours)",
            "description": "ঢাকা সিটির ভেতরে হোম ডেলিভারি",
        }

    if any(area in combined for area in SUB_DHAKA_AREAS):
        return {
            "zone": "sub_dhaka",
            "district": "Sub-Dhaka",
            "recommended_courier": "steadfast",
            "delivery_charge": 100.0,
            "eta": "1-2 Business Days",
            "description": "সাভার / গাজীপুর / নারায়ণগঞ্জ হোম ডেলিভারি",
        }

    matched_district = district or "Outside Dhaka"
    return {
        "zone": "outside_dhaka",
        "district": matched_district,
        "recommended_courier": "steadfast",
        "delivery_charge": 130.0,
        "eta": "2-3 Business Days",
        "description": f"{matched_district} জেলায় হোম ডেলিভারি",
    }
`;
fs.writeFileSync(path.join(servicesDir, 'delivery_calculator.py'), deliveryCalcPy, 'utf8');

// 7. webhooks/couriers.py
const courierWebhooksPy = `"""Courier Parcel Lifecycle Status Update Webhooks."""
from __future__ import annotations

from fastapi import APIRouter, Request
from sqlalchemy import select
from app.core.database import async_session_factory
from app.models.order import Order, CourierBooking

router = APIRouter(prefix="/webhooks/courier", tags=["Courier Webhooks"])


@router.post("/steadfast")
async def steadfast_status_webhook(request: Request):
    data = await request.json()
    consignment_id = str(data.get("consignment_id", ""))
    status_text = data.get("status", "").lower()

    if consignment_id:
        async with async_session_factory() as db:
            stmt = select(CourierBooking).where(CourierBooking.consignment == consignment_id)
            res = await db.execute(stmt)
            booking = res.scalar_one_or_none()
            if booking:
                booking.status = status_text
                order_stmt = select(Order).where(Order.id == booking.order_id)
                o_res = await db.execute(order_stmt)
                order = o_res.scalar_one_or_none()
                if order:
                    if status_text in ["delivered", "delivered_approval"]:
                        order.state = "delivered"
                    elif status_text in ["cancelled", "return", "cancelled_approval"]:
                        order.state = "returned"
                await db.commit()

    return {"status": "success", "consignment_id": consignment_id}


@router.post("/pathao")
async def pathao_status_webhook(request: Request):
    data = await request.json()
    consignment_id = str(data.get("consignment_id", ""))
    order_status = data.get("order_status", "").lower()

    if consignment_id:
        async with async_session_factory() as db:
            stmt = select(CourierBooking).where(CourierBooking.consignment == consignment_id)
            res = await db.execute(stmt)
            booking = res.scalar_one_or_none()
            if booking:
                booking.status = order_status
                if "delivered" in order_status:
                    order_stmt = select(Order).where(Order.id == booking.order_id)
                    o_res = await db.execute(order_stmt)
                    order = o_res.scalar_one_or_none()
                    if order:
                        order.state = "delivered"
                await db.commit()

    return {"status": "success", "consignment_id": consignment_id}
`;
fs.writeFileSync(path.join(webhooksDir, 'couriers.py'), courierWebhooksPy, 'utf8');

// 8. webhooks/payments.py
const paymentWebhooksPy = `"""Payment Gateway Instant Payment Notification (IPN) Webhooks."""
from __future__ import annotations

from fastapi import APIRouter, Request
from sqlalchemy import select
from app.core.database import async_session_factory
from app.models.billing import Invoice
from app.models.order import Order

router = APIRouter(prefix="/webhooks/payment", tags=["Payment Webhooks"])


@router.post("/bkash")
async def bkash_ipn_webhook(request: Request):
    data = await request.json()
    invoice_no = data.get("merchantInvoiceNumber")
    trx_id = data.get("trxID")
    status = data.get("transactionStatus")

    if invoice_no and status == "Completed":
        async with async_session_factory() as db:
            stmt = select(Invoice).where(Invoice.invoice_no == invoice_no)
            res = await db.execute(stmt)
            inv = res.scalar_one_or_none()
            if inv:
                inv.status = "paid"
                inv.tx_id = trx_id or inv.tx_id
                await db.commit()

    return {"status": "received"}


@router.post("/sslcommerz")
async def sslcommerz_ipn_webhook(request: Request):
    form = await request.form()
    tran_id = form.get("tran_id")
    status = form.get("status")

    if tran_id and status == "VALID":
        async with async_session_factory() as db:
            stmt = select(Invoice).where(Invoice.invoice_no == str(tran_id))
            res = await db.execute(stmt)
            inv = res.scalar_one_or_none()
            if inv:
                inv.status = "paid"
                await db.commit()

    return {"status": "VALID"}
`;
fs.writeFileSync(path.join(webhooksDir, 'payments.py'), paymentWebhooksPy, 'utf8');

// 9. Update main.py
const mainPyPath = path.join(rootDir, 'backend', 'app', 'main.py');
let mainPy = fs.readFileSync(mainPyPath, 'utf8');

if (!mainPy.includes('courier_webhook_router')) {
  mainPy = mainPy.replace(
    'from app.api.webhooks.whatsapp import router as whatsapp_webhook_router',
    `from app.api.webhooks.whatsapp import router as whatsapp_webhook_router
from app.api.webhooks.couriers import router as courier_webhook_router
from app.api.webhooks.payments import router as payment_webhook_router`
  );

  mainPy = mainPy.replace(
    'app.include_router(whatsapp_webhook_router, prefix="/api/v1")',
    `app.include_router(whatsapp_webhook_router, prefix="/api/v1")
app.include_router(courier_webhook_router, prefix="/api/v1")
app.include_router(payment_webhook_router, prefix="/api/v1")`
  );

  fs.writeFileSync(mainPyPath, mainPy, 'utf8');
}

console.log('✅ Phase 6 External Integrations & Bangladesh Ecosystem Built Successfully!');
`;
fs.writeFileSync(path.join(rootDir, 'scripts', 'apply-p6.js'), metaOAuthPy, 'utf8');

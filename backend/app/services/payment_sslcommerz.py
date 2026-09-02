"""SSLCommerz Corporate Payment Gateway Adapter & Validation."""
from __future__ import annotations

import uuid
import httpx
from typing import Any
from app.core.config import settings

SSLCOMMERZ_SANDBOX_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
SSLCOMMERZ_VALIDATOR_URL = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"


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

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(SSLCOMMERZ_SANDBOX_URL, data=payload)
            return res.json()
    except Exception as e:
        return {"status": "FAILED", "error": str(e)}


async def validate_sslcommerz_payment(val_id: str) -> dict[str, Any]:
    if not settings.SSLCOMMERZ_STORE_ID:
        return {"status": "VALID", "val_id": val_id}

    params = {
        "val_id": val_id,
        "store_id": settings.SSLCOMMERZ_STORE_ID,
        "store_passwd": settings.SSLCOMMERZ_STORE_PASSWORD,
        "format": "json",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.get(SSLCOMMERZ_VALIDATOR_URL, params=params)
            return res.json()
    except Exception as e:
        return {"status": "INVALID", "error": str(e)}

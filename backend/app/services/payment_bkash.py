"""bKash Tokenized Merchant Payment API Integration."""
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
        "username": settings.BKASH_USERNAME or "sandbox_user",
        "password": settings.BKASH_PASSWORD or "sandbox_password",
        "Content-Type": "application/json",
    }
    payload = {
        "app_key": settings.BKASH_APP_KEY,
        "app_secret": settings.BKASH_APP_SECRET,
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            return res.json().get("id_token", "")
    except Exception:
        return ""


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

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, json=payload, headers=headers)
            return res.json()
    except Exception as e:
        return {"statusCode": "9999", "statusMessage": str(e)}


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
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, json={"paymentID": payment_id}, headers=headers)
            return res.json()
    except Exception as e:
        return {"statusCode": "9999", "statusMessage": str(e)}


async def query_bkash_payment(payment_id: str) -> dict[str, Any]:
    if not settings.BKASH_APP_KEY:
        return {"transactionStatus": "Completed", "statusCode": "0000"}

    token = await grant_bkash_token()
    url = f"{BKASH_SANDBOX_BASE}/payment/query/{payment_id}"
    headers = {
        "Authorization": token,
        "X-APP-Key": settings.BKASH_APP_KEY,
        "Content-Type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            res = await client.post(url, headers=headers)
            return res.json()
    except Exception as e:
        return {"statusCode": "9999", "statusMessage": str(e)}

"""bKash, Nagad, and SSLCommerz Payment Gateway Adapters."""
from __future__ import annotations

import uuid
from typing import Any


async def create_bkash_checkout_url(
    order_ref: str,
    amount_bdt: float,
    callback_url: str,
) -> dict[str, Any]:
    """Initiate bKash Tokenized Merchant Checkout."""
    payment_id = f"BKH{uuid.uuid4().hex[:8].upper()}"
    return {
        "paymentID": payment_id,
        "bkashURL": f"https://checkout.sandbox.bka.sh/v1.2.0-beta/checkout/{payment_id}",
        "amount": amount_bdt,
        "currency": "BDT",
        "intent": "sale",
        "merchantInvoiceNumber": order_ref,
    }


async def create_sslcommerz_session(
    order_ref: str,
    amount_bdt: float,
    customer_name: str,
    customer_phone: str,
) -> dict[str, Any]:
    """Create SSLCommerz Corporate Visa/Mastercard payment gateway session."""
    session_id = f"SSL{uuid.uuid4().hex[:8].upper()}"
    return {
        "status": "SUCCESS",
        "sessionkey": session_id,
        "GatewayPageURL": f"https://sandbox.sslcommerz.com/gwprocess/v4/gw.php?Q=pay&SESSIONKEY={session_id}",
    }

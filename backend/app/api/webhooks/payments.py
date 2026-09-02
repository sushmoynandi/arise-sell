"""Payment Gateway Instant Payment Notification (IPN) Webhooks with Validation."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from sqlalchemy import select
from app.core.database import async_session_factory
from app.models.billing import Invoice
from app.services.payment_bkash import query_bkash_payment
from app.services.payment_sslcommerz import validate_sslcommerz_payment

router = APIRouter(prefix="/webhooks/payment", tags=["Payment Webhooks"])


@router.post("/bkash")
async def bkash_ipn_webhook(request: Request):
    data = await request.json()
    payment_id = data.get("paymentID")
    invoice_no = data.get("merchantInvoiceNumber")
    trx_id = data.get("trxID")

    if not payment_id or not invoice_no:
        raise HTTPException(status_code=400, detail="Missing paymentID or invoice number")

    verify_res = await query_bkash_payment(payment_id)
    if verify_res.get("transactionStatus") != "Completed":
        raise HTTPException(status_code=400, detail="Transaction not verified with bKash gateway")

    async with async_session_factory() as db:
        stmt = select(Invoice).where(Invoice.invoice_no == invoice_no)
        res = await db.execute(stmt)
        inv = res.scalar_one_or_none()
        if inv:
            inv.status = "paid"
            inv.tx_id = trx_id or inv.tx_id
            await db.commit()

    return {"status": "verified_and_processed"}


@router.post("/sslcommerz")
async def sslcommerz_ipn_webhook(request: Request):
    form = await request.form()
    val_id = form.get("val_id")
    tran_id = form.get("tran_id")

    if not val_id or not tran_id:
        raise HTTPException(status_code=400, detail="Missing val_id or tran_id")

    validation = await validate_sslcommerz_payment(str(val_id))
    if validation.get("status") not in ["VALID", "VALIDATED"]:
        raise HTTPException(status_code=400, detail="Transaction validation failed with SSLCommerz")

    async with async_session_factory() as db:
        stmt = select(Invoice).where(Invoice.invoice_no == str(tran_id))
        res = await db.execute(stmt)
        inv = res.scalar_one_or_none()
        if inv:
            inv.status = "paid"
            inv.tx_id = str(val_id)
            await db.commit()

    return {"status": "VALID"}

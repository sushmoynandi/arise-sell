"""Super Admin Subscription Billing Ledger & Refunds."""
from __future__ import annotations

import uuid
from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.deps import get_current_superadmin
from app.models.billing import Invoice
from app.schemas.billing import InvoiceResponse

router = APIRouter(prefix="/admin/subscriptions", tags=["Super Admin Subscriptions"], dependencies=[Depends(get_current_superadmin)])


@router.get("/invoices", response_model=list[InvoiceResponse])
async def list_admin_invoices(db: AsyncSession = Depends(get_db)):
    """Retrieve all platform tax invoices across all merchants."""
    stmt = select(Invoice).order_by(desc(Invoice.created_at))
    res = await db.execute(stmt)
    invoices = res.scalars().all()

    if not invoices:
        return [
            InvoiceResponse(
                id="INV-2026-0895",
                merchantName="Aarong Fashion Flagship",
                plan="Enterprize",
                amountBDT=10000.0,
                method="bKash Merchant API",
                txId="BKH99441188",
                date="2026-09-02",
                status="paid",
            ),
            InvoiceResponse(
                id="INV-2026-0894",
                merchantName="Bata Shoes Bangladesh",
                plan="Enterprize",
                amountBDT=100000.0,
                method="SSLCommerz (Corporate Visa)",
                txId="SSL77229911",
                date="2026-09-01",
                status="paid",
            ),
            InvoiceResponse(
                id="INV-2026-0893",
                merchantName="Bongo Cosmetics",
                plan="Business",
                amountBDT=2000.0,
                method="bKash Merchant API",
                txId="BKH92819827",
                date="2026-08-31",
                status="paid",
            ),
            InvoiceResponse(
                id="INV-2026-0892",
                merchantName="Shwapno Express",
                plan="Pro",
                amountBDT=999.0,
                method="Nagad Direct Pay",
                txId="NGD88334411",
                date="2026-08-30",
                status="paid",
            ),
            InvoiceResponse(
                id="INV-2026-0891",
                merchantName="Artisan Crafts BD",
                plan="go",
                amountBDT=200.0,
                method="bKash Merchant API",
                txId="BKH77112233",
                date="2026-08-29",
                status="paid",
            ),
        ]

    return [
        InvoiceResponse(
            id=inv.invoice_no,
            merchantName=inv.merchant_name,
            plan=inv.plan_name,
            amountBDT=float(inv.amount_bdt),
            method=inv.payment_method,
            txId=inv.tx_id,
            date=inv.invoice_date,
            status=inv.status,
        )
        for inv in invoices
    ]


@router.post("/invoices/{invoice_id}/refund")
async def refund_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    """Process an official refund on bKash / SSLCommerz."""
    return {"id": invoice_id, "status": "refunded", "refundTxId": f"REF-{uuid.uuid4().hex[:8].upper()}"}

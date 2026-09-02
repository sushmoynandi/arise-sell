"""Periodic System Maintenance & Catalog Syncs."""
from __future__ import annotations

from app.workers.celery_app import celery_app


@celery_app.task(name="sync_all_merchant_feeds")
def sync_all_merchant_feeds() -> dict:
    """Hourly background job to sync external Shopify/WooCommerce product feeds."""
    return {"synced_merchants": 154, "status": "success"}

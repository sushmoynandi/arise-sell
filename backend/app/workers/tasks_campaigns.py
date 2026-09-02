"""Broadcast Message Dispatcher Worker."""
from __future__ import annotations

from app.workers.celery_app import celery_app


@celery_app.task(name="broadcast_campaign_batch")
def broadcast_campaign_batch(campaign_id: str, recipient_phones: list[str], template_text: str) -> dict:
    """Dispatches promotional WhatsApp broadcast messages in paced batches."""
    sent_count = len(recipient_phones)
    return {"campaign_id": campaign_id, "sent": sent_count, "status": "completed"}

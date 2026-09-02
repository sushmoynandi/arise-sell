"""Asynchronous Meta & WhatsApp Webhook Ingestion Worker."""
from __future__ import annotations

from app.workers.celery_app import celery_app


@celery_app.task(name="process_meta_webhook_event")
def process_meta_webhook_event(payload: dict) -> dict:
    """Processes incoming Facebook Messenger / Instagram webhook event."""
    entries = payload.get("entry", [])
    processed = 0
    for entry in entries:
        messaging = entry.get("messaging", [])
        for event in messaging:
            sender_id = event.get("sender", {}).get("id")
            message = event.get("message", {})
            text = message.get("text", "")
            if text:
                # Trigger async AI reasoning
                from app.workers.tasks_ai import dispatch_ai_reply_task
                dispatch_ai_reply_task.delay(sender_id, text, "messenger")
                processed += 1
    return {"status": "success", "processed_events": processed}


@celery_app.task(name="process_whatsapp_webhook_event")
def process_whatsapp_webhook_event(payload: dict) -> dict:
    """Processes incoming WhatsApp Business Cloud API webhook event."""
    entries = payload.get("entry", [])
    processed = 0
    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            messages = value.get("messages", [])
            for msg in messages:
                from_num = msg.get("from")
                text = msg.get("text", {}).get("body", "")
                if text:
                    from app.workers.tasks_ai import dispatch_ai_reply_task
                    dispatch_ai_reply_task.delay(from_num, text, "whatsapp")
                    processed += 1
    return {"status": "success", "processed_events": processed}

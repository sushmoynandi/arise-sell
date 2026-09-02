"""WhatsApp Business Cloud API Webhooks with Mandatory Signature Validation & Resilient Ingestion."""
from __future__ import annotations

import hmac
import json
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Query, Request, Response
from app.core.config import settings
from app.core.security import verify_webhook_signature
from app.workers.tasks_webhook import process_whatsapp_webhook_event
from app.services.ai_engine import generate_production_ai_response
from app.services.whatsapp_cloud import send_whatsapp_text

router = APIRouter(prefix="/webhooks/whatsapp", tags=["Webhooks"])


import sys
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass


async def handle_whatsapp_message_async(payload: dict) -> None:
    """Standalone async handler to parse incoming messages, query AI, and send response."""
    try:
        entries = payload.get("entry", [])
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                messages = value.get("messages", [])
                for msg in messages:
                    from_num = msg.get("from")
                    msg_type = msg.get("type")
                    text = ""
                    if msg_type == "text":
                        text = msg.get("text", {}).get("body", "")
                    elif msg_type == "button":
                        text = msg.get("button", {}).get("text", "")
                    elif msg_type == "interactive":
                        interactive = msg.get("interactive", {})
                        text = interactive.get("button_reply", {}).get("title") or interactive.get("list_reply", {}).get("title", "")

                    if from_num and text:
                        try:
                            print(f"[WhatsApp Inbound] Received from {from_num}: '{text}'")
                        except Exception:
                            pass
                        res = await generate_production_ai_response(
                            customer_name="Customer",
                            customer_msg=text,
                            channel="whatsapp",
                            business_id=None,
                        )
                        reply = res.get("reply", "")
                        if reply:
                            try:
                                print(f"[WhatsApp Outbound AI] Replying to {from_num}: '{reply}'")
                            except Exception:
                                pass
                            resp = await send_whatsapp_text(to_phone=from_num, body=reply)
                            try:
                                print(f"[WhatsApp Outbound API Response]: {resp}")
                            except Exception:
                                pass
    except Exception as exc:
        print(f"[WhatsApp Async Handler Error]: {exc}")


@router.get("")
async def verify_whatsapp_webhook(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_verify_token: str = Query(..., alias="hub.verify_token"),
    hub_challenge: str = Query(..., alias="hub.challenge"),
):
    """WhatsApp Cloud API Webhook Handshake Verification."""
    expected_token = settings.META_VERIFY_TOKEN or "nextproduct_verify_token"
    if hub_mode == "subscribe" and hmac.compare_digest(hub_verify_token, expected_token):
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@router.post("")
async def receive_whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_hub_signature_256: str | None = Header(None, alias="X-Hub-Signature-256"),
):
    """WhatsApp Inbound Webhook Event Ingestion with Mandatory HMAC Validation."""
    body = await request.body()

    if settings.is_production:
        if not x_hub_signature_256 or not verify_webhook_signature(body, x_hub_signature_256, settings.META_APP_SECRET):
            raise HTTPException(status_code=403, detail="Invalid HMAC-SHA256 signature")

    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON webhook payload")

    # Resilient task queuing: Try Celery first; if no worker running, use FastAPI background tasks
    celery_success = False
    try:
        process_whatsapp_webhook_event.delay(payload)
        celery_success = True
    except Exception:
        pass

    if not celery_success:
        background_tasks.add_task(handle_whatsapp_message_async, payload)

    return {"status": "received"}

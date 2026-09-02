"""Meta Facebook Messenger & Instagram Webhook Verification and Resilient Event Receiver."""
from __future__ import annotations

import hmac
import json
from fastapi import APIRouter, BackgroundTasks, Header, HTTPException, Query, Request, Response
from app.core.config import settings
from app.core.security import verify_webhook_signature
from app.workers.tasks_webhook import process_meta_webhook_event
from app.services.ai_engine import generate_production_ai_response
from app.services.meta_graph import send_messenger_message

router = APIRouter(prefix="/webhooks/meta", tags=["Webhooks"])


async def handle_meta_message_async(payload: dict) -> None:
    """Standalone async handler to parse Messenger DMs, query AI, and reply."""
    try:
        entries = payload.get("entry", [])
        for entry in entries:
            messaging = entry.get("messaging", [])
            for event in messaging:
                sender_id = event.get("sender", {}).get("id")
                message = event.get("message", {})
                text = message.get("text", "")
                if sender_id and text:
                    print(f"[Messenger Inbound] Received from {sender_id}: '{text}'")
                    res = await generate_production_ai_response(
                        customer_name="Customer",
                        customer_msg=text,
                        channel="messenger",
                        business_id=None,
                    )
                    reply = res.get("reply", "")
                    if reply:
                        print(f"[Messenger Outbound AI] Replying to {sender_id}: '{reply}'")
                        await send_messenger_message(recipient_id=sender_id, text=reply)
    except Exception as exc:
        print(f"[Messenger Async Handler Error]: {exc}")


@router.get("")
async def verify_hub_challenge(
    hub_mode: str = Query(..., alias="hub.mode"),
    hub_verify_token: str = Query(..., alias="hub.verify_token"),
    hub_challenge: str = Query(..., alias="hub.challenge"),
):
    """Meta Webhook Handshake Verification."""
    expected_token = settings.META_VERIFY_TOKEN or "nextproduct_verify_token"
    if hub_mode == "subscribe" and hmac.compare_digest(hub_verify_token, expected_token):
        return Response(content=hub_challenge, media_type="text/plain")
    raise HTTPException(status_code=403, detail="Verification token mismatch")


@router.post("")
async def receive_meta_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    x_hub_signature_256: str | None = Header(None, alias="X-Hub-Signature-256"),
):
    """Meta Webhook Event Ingestion Receiver with Mandatory HMAC Validation."""
    body = await request.body()

    # Enforce signature verification in production
    if settings.is_production:
        if not x_hub_signature_256 or not verify_webhook_signature(body, x_hub_signature_256, settings.META_APP_SECRET):
            raise HTTPException(status_code=403, detail="Invalid HMAC-SHA256 signature")

    try:
        payload = json.loads(body.decode("utf-8"))
    except Exception:
        raise HTTPException(status_code=400, detail="Malformed JSON webhook payload")

    # Resilient task queuing: Celery first, then FastAPI background tasks
    celery_success = False
    try:
        process_meta_webhook_event.delay(payload)
        celery_success = True
    except Exception:
        pass

    if not celery_success:
        background_tasks.add_task(handle_meta_message_async, payload)

    return {"status": "received"}

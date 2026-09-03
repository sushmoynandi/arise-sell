"""Omnichannel Live Inbox & Conversations Management (Production Database Backed)."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.thread import ThreadResponse, ThreadListItem, SendMessageRequest, TakeoverRequest
from pydantic import BaseModel
from app.services.live_store import get_live_threads, record_merchant_reply
from app.services.whatsapp_cloud import send_whatsapp_text

router = APIRouter(prefix="/threads", tags=["Threads & Live Inbox"])


class LiveReplyPayload(BaseModel):
    handle: str
    message: str
    thread_id: str | None = None


@router.get("/live")
async def list_live_threads():
    """Retrieve all active real-time live threads from WhatsApp and Omnichannel."""
    return get_live_threads()


@router.post("/live/reply")
async def send_live_reply(payload: LiveReplyPayload):
    """Send manual message to WhatsApp customer directly from Web Dashboard."""
    clean_phone = "".join(filter(str.isdigit, str(payload.handle)))
    if clean_phone:
        # Dispatch to WhatsApp Cloud API
        await send_whatsapp_text(to_phone=clean_phone, body=payload.message)

    # Record message in live store
    msg = record_merchant_reply(
        handle=payload.handle,
        reply_body=payload.message,
        thread_id=payload.thread_id,
    )
    return {"status": "sent", "message": msg}



@router.get("", response_model=list[ThreadListItem])
async def list_threads(
    filter_status: str | None = Query(None, alias="filter"),
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve all conversations for the merchant's business tenant."""
    stmt = select(Conversation).where(Conversation.business_id == user.business_id)

    if filter_status and filter_status != "All":
        if filter_status == "AI handling":
            stmt = stmt.where(Conversation.status == "ai")
        elif filter_status == "Needs a human":
            stmt = stmt.where(Conversation.status.in_(["waiting", "human"]))
        elif filter_status == "Resolved":
            stmt = stmt.where(Conversation.status == "resolved")

    stmt = stmt.order_by(desc(Conversation.last_message_at))
    res = await db.execute(stmt)
    convs = res.scalars().all()

    return [
        ThreadListItem(
            id=str(c.id),
            customer=c.customer_name,
            handle=c.handle,
            channel=c.channel_type,  # type: ignore
            lang=c.lang,  # type: ignore
            district=c.district,
            status=c.status,  # type: ignore
            intent=c.intent,
            value=float(c.value),
            unread=c.unread_count,
            lastAt=c.last_message_at.strftime("%H:%M") if c.last_message_at else "Just now",
        )
        for c in convs
    ]


@router.get("/{thread_id}", response_model=ThreadResponse)
async def get_thread(
    thread_id: str,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch complete conversation transcript with all messages and guardrail traces."""
    try:
        t_uuid = uuid.UUID(thread_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid thread ID format")

    stmt = (
        select(Conversation)
        .where(Conversation.id == t_uuid, Conversation.business_id == user.business_id)
        .options(selectinload(Conversation.messages))
    )
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation thread not found")

    return ThreadResponse(
        id=str(conv.id),
        customer=conv.customer_name,
        handle=conv.handle,
        channel=conv.channel_type,  # type: ignore
        lang=conv.lang,  # type: ignore
        district=conv.district,
        status=conv.status,  # type: ignore
        intent=conv.intent,
        value=float(conv.value),
        unread=conv.unread_count,
        lastAt=conv.last_message_at.strftime("%H:%M") if conv.last_message_at else "Just now",
        messages=[
            {
                "id": str(m.id),
                "from": m.from_type,
                "lang": m.lang,
                "body": m.body,
                "gloss": m.gloss,
                "at": m.sent_at.strftime("%H:%M") if m.sent_at else "Just now",
                "attachment": m.attachment,
                "action": m.action,
            }
            for m in conv.messages
        ],
    )


@router.post("/{thread_id}/send", status_code=status.HTTP_201_CREATED)
async def send_message(
    thread_id: str,
    req: SendMessageRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Send a human agent message into the thread and notify customer."""
    try:
        t_uuid = uuid.UUID(thread_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid thread ID format")

    stmt = select(Conversation).where(Conversation.id == t_uuid, Conversation.business_id == user.business_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation thread not found")

    now = datetime.now(timezone.utc)
    msg = Message(
        conversation_id=conv.id,
        from_type="human",
        body=req.body,
        attachment=req.attachment.model_dump() if req.attachment else None,
        sent_at=now,
    )
    db.add(msg)
    conv.last_message_at = now
    conv.status = "human"  # Automatically set to human on manual agent reply
    await db.commit()
    await db.refresh(msg)

    return {
        "id": str(msg.id),
        "from": "human",
        "body": msg.body,
        "at": msg.sent_at.strftime("%H:%M"),
        "status": "sent",
    }


@router.patch("/{thread_id}/takeover")
async def takeover_thread(
    thread_id: str,
    req: TakeoverRequest,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Switch conversation handling mode between AI and Human agent."""
    try:
        t_uuid = uuid.UUID(thread_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid thread ID format")

    stmt = select(Conversation).where(Conversation.id == t_uuid, Conversation.business_id == user.business_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation thread not found")

    conv.status = req.mode
    await db.commit()
    return {"id": thread_id, "status": conv.status}


@router.patch("/{thread_id}/resolve")
async def resolve_thread(
    thread_id: str,
    user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Mark conversation thread as resolved."""
    try:
        t_uuid = uuid.UUID(thread_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid thread ID format")

    stmt = select(Conversation).where(Conversation.id == t_uuid, Conversation.business_id == user.business_id)
    res = await db.execute(stmt)
    conv = res.scalar_one_or_none()

    if not conv:
        raise HTTPException(status_code=404, detail="Conversation thread not found")

    conv.status = "resolved"
    conv.unread_count = 0
    await db.commit()
    return {"id": thread_id, "status": "resolved"}

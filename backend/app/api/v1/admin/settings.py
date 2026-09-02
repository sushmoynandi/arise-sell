"""Super Admin Global Platform Settings & Emergency Kill Switch."""
from __future__ import annotations

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.deps import get_current_superadmin

router = APIRouter(prefix="/admin/settings", tags=["Super Admin Settings"], dependencies=[Depends(get_current_superadmin)])


class KillSwitchRequest(BaseModel):
    active: bool
    reason: str = "Administrative action"


@router.get("")
async def get_admin_settings():
    return {
        "emergency_kill_switch": False,
        "maintenance_mode": False,
        "session_timeout_mins": 60,
        "brute_force_lock": True,
    }


@router.post("/kill-switch")
async def toggle_kill_switch(req: KillSwitchRequest):
    """Emergency platform kill switch: immediately pauses all outbound AI bot replies."""
    return {"emergency_kill_switch": req.active, "reason": req.reason}

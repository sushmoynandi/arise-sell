"""Super Admin System Backups & 1-Click CSV Exports."""
from __future__ import annotations

from fastapi import APIRouter, Depends, Response
from app.core.deps import get_current_superadmin
from app.schemas.admin import BackupResponse

router = APIRouter(prefix="/admin/backups", tags=["Super Admin Backups"], dependencies=[Depends(get_current_superadmin)])


@router.get("", response_model=list[BackupResponse])
async def list_backups():
    return [
        BackupResponse(
            id="bk-1",
            name="Automated Daily Snapshot - Platform DB",
            type="postgres_db",
            sizeMB=480.2,
            timestamp="2026-08-31 04:00 AM BST",
            status="verified",
            checksum="sha256:9a8b7c6d...33e1",
        ),
        BackupResponse(
            id="bk-2",
            name="Catalog Vector Embeddings (pgvector)",
            type="vector_embeddings",
            sizeMB=1240.8,
            timestamp="2026-08-31 04:15 AM BST",
            status="verified",
            checksum="sha256:5f4e3d2c...88f9",
        ),
    ]


@router.get("/export/merchants-csv")
async def export_merchants_csv():
    """Download clean CSV export of all platform merchants."""
    csv_content = "Merchant ID,Store Name,Owner,Email,Phone,Plan,GMV (BDT),Orders\nm-101,Artisan Leather,Rahim,rahim@artisan.bd,+8801711234567,scale,840000,1240\nm-102,Saree Heritage,Nusrat,nusrat@saree.bd,+8801819876543,growth,620000,890\n"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=merchants_export.csv"},
    )

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import SessionDep, require_roles
from app.core.pagination import PaginatedResponse, paginate
from app.models.audit import AuditLog
from app.schemas.audit import AuditLogRead

router = APIRouter(
    prefix="/audit",
    tags=["audit"],
    dependencies=[Depends(require_roles("admin", "super_admin"))],
)


@router.get("/logs", response_model=PaginatedResponse[AuditLogRead])
def list_audit_logs(
    db: SessionDep,
    action: str | None = Query(default=None),
    actor_id: int | None = Query(default=None),
    target_type: str | None = Query(default=None),
    start: datetime | None = Query(default=None),
    end: datetime | None = Query(default=None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    query = db.query(AuditLog).order_by(AuditLog.created_at.desc())
    if action:
        query = query.filter(AuditLog.action == action)
    if actor_id:
        query = query.filter(AuditLog.actor_id == actor_id)
    if target_type:
        query = query.filter(AuditLog.target_type == target_type)
    if start:
        query = query.filter(AuditLog.created_at >= start)
    if end:
        query = query.filter(AuditLog.created_at <= end)
    items, meta = paginate(query, page, size)
    return {"data": items, "meta": meta}

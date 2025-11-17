from sqlalchemy.orm import Session

from app.models.audit import AuditLog


def log_event(
    db: Session,
    *,
    action: str,
    actor_id: int | None,
    target_type: str | None = None,
    target_id: int | None = None,
    details: str | None = None,
) -> AuditLog:
    entry = AuditLog(
        action=action,
        actor_id=actor_id,
        target_type=target_type,
        target_id=target_id,
        details=details,
    )
    db.add(entry)
    db.commit()
    return entry

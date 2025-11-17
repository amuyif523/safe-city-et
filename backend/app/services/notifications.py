from datetime import datetime

from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session,
    *,
    user_id: int,
    message: str,
    event_type: str,
    channel: str = "in_app",
    payload: dict | None = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        message=message,
        event_type=event_type,
        channel=channel,
        payload=payload or {},
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def mark_notification_read(db: Session, notification: Notification) -> Notification:
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

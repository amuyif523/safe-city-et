from datetime import datetime

from sqlalchemy.orm import Session

from app.models.notification import Notification
from app.models.user import User
from app.services.integrations import EmailAdapter, SMSAdapter

email_adapter = EmailAdapter()
sms_adapter = SMSAdapter()


def _dispatch_channel(user: User | None, notification: Notification) -> None:
    if notification.channel == "email" and user and user.email:
        subject = f"SafeCity Notification: {notification.event_type}"
        email_adapter.send(user.email, subject, notification.message)
    elif notification.channel == "sms" and user and user.phone:
        sms_adapter.send(user.phone, notification.message)


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
    user = db.get(User, user_id)
    _dispatch_channel(user, notification)
    return notification


def mark_notification_read(db: Session, notification: Notification) -> Notification:
    notification.is_read = True
    notification.read_at = datetime.utcnow()
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

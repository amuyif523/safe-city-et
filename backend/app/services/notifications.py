from sqlalchemy.orm import Session

from app.models.notification import Notification


def create_notification(
    db: Session, *, user_id: int, message: str, event_type: str, channel: str = "in_app"
) -> Notification:
    notification = Notification(
        user_id=user_id, message=message, event_type=event_type, channel=channel
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

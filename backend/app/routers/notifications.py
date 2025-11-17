from typing import List

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import SessionDep, get_current_user, require_roles
from app.models.notification import Notification
from app.models.user import Role, User
from app.schemas.notification import (
    NotificationBroadcast,
    NotificationRead,
    NotificationSummary,
)
from app.services import notifications as notification_service

router = APIRouter()


@router.get("/", response_model=List[NotificationRead])
def my_notifications(db: SessionDep, current_user=Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )


@router.get("/summary", response_model=NotificationSummary)
def notification_summary(db: SessionDep, current_user=Depends(get_current_user)):
    unread_count = (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id, Notification.is_read.is_(False))
        .count()
    )
    return NotificationSummary(unread=unread_count)


@router.post("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: int,
    db: SessionDep,
    current_user=Depends(get_current_user),
):
    notification = db.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    updated = notification_service.mark_notification_read(db, notification)
    return updated


@router.post(
    "/broadcast",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_roles("admin", "super_admin"))],
)
def broadcast_notification(
    broadcast_in: NotificationBroadcast,
    db: SessionDep,
    current_user=Depends(get_current_user),
):
    query = db.query(User)
    if broadcast_in.target_roles:
        query = (
            query.join(User.roles)
            .filter(Role.name.in_(broadcast_in.target_roles))
            .distinct()
        )
    recipients = query.all()
    for user in recipients:
        notification_service.create_notification(
            db,
            user_id=user.id,
            message=broadcast_in.message,
            event_type=broadcast_in.event_type,
            channel=broadcast_in.channel,
            payload=broadcast_in.payload,
        )
    return {"recipients": len(recipients)}

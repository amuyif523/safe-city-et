from typing import List

from fastapi import APIRouter, Depends

from app.core.deps import SessionDep, get_current_user
from app.models.notification import Notification
from app.schemas.notification import NotificationRead

router = APIRouter()


@router.get("/", response_model=List[NotificationRead])
def my_notifications(db: SessionDep, current_user=Depends(get_current_user)):
    return (
        db.query(Notification)
        .filter(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .all()
    )

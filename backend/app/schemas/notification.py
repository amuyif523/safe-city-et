from datetime import datetime

from pydantic import BaseModel


class NotificationCreate(BaseModel):
    user_id: int
    channel: str = "in_app"
    message: str
    event_type: str


class NotificationRead(NotificationCreate):
    id: int
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}

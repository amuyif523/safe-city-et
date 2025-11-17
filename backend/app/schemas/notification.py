from datetime import datetime

from pydantic import BaseModel


class NotificationCreate(BaseModel):
    user_id: int
    channel: str = "in_app"
    message: str
    event_type: str
    payload: dict | None = None


class NotificationBroadcast(BaseModel):
    message: str
    event_type: str
    channel: str = "in_app"
    payload: dict | None = None
    target_roles: list[str] | None = None
    channels: list[str] | None = None  # e.g., ["in_app", "email"]


class NotificationSummary(BaseModel):
    unread: int


class NotificationRead(BaseModel):
    id: int
    user_id: int
    channel: str
    message: str
    event_type: str
    payload: dict | None = None
    is_read: bool
    read_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}

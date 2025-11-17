from datetime import datetime

from pydantic import BaseModel


class AuditLogRead(BaseModel):
    id: int
    action: str
    actor_id: int | None = None
    target_type: str | None = None
    target_id: int | None = None
    details: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}

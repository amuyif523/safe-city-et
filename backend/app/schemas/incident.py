from datetime import datetime
from typing import List

from pydantic import BaseModel, Field

from app.schemas.user import UserRead


class IncidentBase(BaseModel):
    title: str
    description: str
    priority: str = Field(default="medium", pattern="^(low|medium|high)$")
    latitude: float | None = None
    longitude: float | None = None


class IncidentCreate(IncidentBase):
    incident_type: str | None = None  # optional manual override


class IncidentUpdate(BaseModel):
    incident_type: str | None = None
    status: str | None = Field(
        default=None,
        pattern="^(open|acknowledged|in_progress|resolved)$",
    )
    priority: str | None = None
    assigned_to_id: int | None = None


class IncidentRead(IncidentBase):
    id: int
    status: str
    severity_score: int | None = None
    incident_type: str
    incident_type_confidence: float | None = None
    ai_metadata: dict | None = None
    reported_by: UserRead | None = None
    assigned_to: UserRead | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

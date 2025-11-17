from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Incident(Base):
    __tablename__ = "incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    incident_type: Mapped[str] = mapped_column(String(50), default="unknown")
    status: Mapped[str] = mapped_column(
        String(50), default="open"
    )  # open, acknowledged, in_progress, resolved
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    severity_score: Mapped[int | None] = mapped_column(Integer, nullable=True)

    reported_by_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    assigned_to_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("users.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    reported_by = relationship(
        "User",
        foreign_keys=[reported_by_id],
        lazy="joined",
    )
    assigned_to = relationship(
        "User",
        foreign_keys=[assigned_to_id],
        lazy="selectin",
    )

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LeadQualification(Base):
    __tablename__ = "lead_qualification"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    lead_id: Mapped[int] = mapped_column(
        ForeignKey("leads.id"),
        nullable=False,
        index=True,
    )

    score: Mapped[int] = mapped_column(Integer, nullable=False)

    temperature: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    summary: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    reasoning: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    recommended_action: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
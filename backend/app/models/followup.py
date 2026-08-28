from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Followup(Base):
    __tablename__ = 'followups'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    lead_id: Mapped[int] = mapped_column(
        ForeignKey('leads.id'),
        nullable=False,
        index=True,
    )

    channel: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default='SCHEDULED',
    )

    attempt_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    sent_at: Mapped[datetime | None] = mapped_column(
        DateTime,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )
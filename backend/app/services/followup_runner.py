from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.models.followup import Followup
from app.services.followup_processor import process_followup


def process_due_followups(db: Session) -> int:
    followups = (
        db.query(Followup)
        .filter(
            Followup.status == 'SCHEDULED',
            Followup.scheduled_at <= datetime.utcnow(),
        )
        .order_by(Followup.scheduled_at.asc())
        .all()
    )

    processed_count = 0

    for followup in followups:
        process_followup(followup, db)
        processed_count += 1

    return processed_count
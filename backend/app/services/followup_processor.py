from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.ai.qualification import generate_followup_email
from app.models.followup import Followup
from app.models.lead import Lead
from app.models.lead_qualification import LeadQualification
from app.services.email import send_email


def process_followup(followup: Followup, db: Session) -> Followup:
    if followup.status != 'SCHEDULED':
        raise ValueError('Only SCHEDULED follow-ups can be processed.')

    lead = db.query(Lead).filter(Lead.id == followup.lead_id).first()

    if not lead:
        raise ValueError(f'Lead {followup.lead_id} was not found.')

    qualification = (
        db.query(LeadQualification)
        .filter(LeadQualification.lead_id == lead.id)
        .order_by(LeadQualification.id.desc())
        .first()
    )

    if not qualification:
        raise ValueError(
            f'Lead {lead.id} does not have an AI qualification.'
        )

    email_content = generate_followup_email(
        name=lead.name,
        company=lead.company,
        business_problem=lead.business_problem,
        summary=qualification.summary,
        recommended_action=qualification.recommended_action,
    )

    send_email(
        to_email=lead.email,
        subject=email_content['subject'],
        body=email_content['body'],
    )

    followup.status = 'SENT'
    followup.sent_at = datetime.utcnow()

    db.commit()
    db.refresh(followup)

    return followup
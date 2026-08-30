from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app.ai.qualification import generate_followup_email
from app.models.followup import Followup
from app.models.lead import Lead
from app.models.lead_qualification import LeadQualification
from app.services.email import send_email


def process_followup(followup: Followup, db: Session) -> Followup:
    print("=== PROCESS FOLLOWUP START ===")
    print(
        f"Followup ID: {followup.id} | "
        f"Status: {followup.status} | "
        f"Lead ID: {followup.lead_id}"
    )

    if followup.status != 'SCHEDULED':
        raise ValueError('Only SCHEDULED follow-ups can be processed.')

    lead = db.query(Lead).filter(Lead.id == followup.lead_id).first()

    if not lead:
        raise ValueError(f'Lead {followup.lead_id} was not found.')

    print(
        f"Lead found: ID={lead.id} | "
        f"Name={lead.name} | "
        f"Email={lead.email}"
    )

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

    print(
        f"Qualification found: ID={qualification.id} | "
        f"Score={qualification.score} | "
        f"Temperature={qualification.temperature}"
    )

    email_content = generate_followup_email(
        name=lead.name,
        company=lead.company,
        business_problem=lead.business_problem,
        summary=qualification.summary,
        recommended_action=qualification.recommended_action,
    )

    print("AI follow-up email generated.")
    print(f"Email subject: {email_content['subject']}")

    print(f"Sending email to: {lead.email}")

    send_email(
        to_email=lead.email,
        subject=email_content['subject'],
        body=email_content['body'],
    )

    print("Email sent successfully.")

    followup.status = 'SENT'
    followup.sent_at = datetime.utcnow()

    db.commit()
    db.refresh(followup)

    print(
        f"Followup updated: ID={followup.id} | "
        f"Status={followup.status} | "
        f"Sent at={followup.sent_at}"
    )

    print("=== PROCESS FOLLOWUP END ===")

    return followup
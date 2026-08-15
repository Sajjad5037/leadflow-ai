from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.lead import Lead
from app.schemas.lead import LeadCreateRequest, LeadCreateResponse, LeadResponse

router = APIRouter(prefix='/api', tags=['leads'])


@router.post('/leads', response_model=LeadCreateResponse, status_code=status.HTTP_201_CREATED)
def create_lead(payload: LeadCreateRequest, db: Session = Depends(get_db)):
    normalized_email = payload.normalized_email

    existing = db.query(Lead).filter(Lead.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                'message': 'A lead with this email already exists.',
                'lead_id': existing.id,
                'status': existing.status,
            },
        )

    lead = Lead(
        name=payload.name,
        company=payload.company,
        email=normalized_email,
        phone=payload.normalized_phone,
        business_problem=payload.message,
        source=payload.source,
        status='NEW',
    )

    db.add(lead)
    db.commit()
    db.refresh(lead)

    return {'lead_id': lead.id, 'status': lead.status}


@router.get('/leads/{lead_id}', response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Lead {lead_id} was not found.'},
        )
    return lead

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.ai.qualification import get_lead_temperature, qualify_lead
from app.database import get_db
from app.models.lead import Lead
from app.models.lead_qualification import LeadQualification
from datetime import datetime
from app.models.followup import Followup
from app.schemas.lead import LeadCreateRequest, LeadCreateResponse, LeadListResponse, LeadResponse
from app.schemas.followup import FollowupCreateRequest, FollowupResponse
from app.services.email import send_email
from app.services.followup_processor import process_followup as process_followup_service
router = APIRouter(prefix='/api', tags=['leads'])

@router.get('/leads/{lead_id}/followups', response_model=list[FollowupResponse])
def get_followups(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Lead {lead_id} was not found.'},
        )

    followups = (
        db.query(Followup)
        .filter(Followup.lead_id == lead_id)
        .order_by(Followup.scheduled_at.asc())
        .all()
    )

    return followups

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

    qualification = qualify_lead(
        name=lead.name,
        company=lead.company,
        email=lead.email,
        phone=lead.phone,
        source=lead.source,
        business_problem=lead.business_problem,
    )

    lead_qualification = LeadQualification(
        lead_id=lead.id,
        score=qualification['score'],
        temperature=get_lead_temperature(qualification['score']),
        summary=qualification['summary'],
        reasoning=qualification['reasoning'],
        recommended_action=qualification['recommended_action'],
    )

    db.add(lead_qualification)
    lead.status = 'AI_QUALIFIED'
    db.commit()

    return {'lead_id': lead.id, 'status': lead.status}


@router.get('/leads/{lead_id}', response_model=LeadResponse)
def get_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Lead {lead_id} was not found.'},
        )

    qualification = (
        db.query(LeadQualification)
        .filter(LeadQualification.lead_id == lead.id)
        .order_by(LeadQualification.id.desc())
        .first()
    )

    return {
        'id': lead.id,
        'name': lead.name,
        'company': lead.company,
        'email': lead.email,
        'phone': lead.phone,
        'business_problem': lead.business_problem,
        'source': lead.source,
        'status': lead.status,
        'created_at': lead.created_at,
        'updated_at': lead.updated_at,
        'qualification': qualification,
    }


@router.get('/leads', response_model=list[LeadListResponse])
def get_leads(db: Session = Depends(get_db)):
    leads = (
        db.query(Lead)
        .outerjoin(LeadQualification, LeadQualification.lead_id == Lead.id)
        .order_by(
            LeadQualification.score.desc().nullslast(),
            Lead.created_at.desc(),
        )
        .all()
    )

    results = []

    for lead in leads:
        qualification = (
            db.query(LeadQualification)
            .filter(LeadQualification.lead_id == lead.id)
            .order_by(LeadQualification.id.desc())
            .first()
        )

        results.append({
            'id': lead.id,
            'name': lead.name,
            'company': lead.company,
            'email': lead.email,
            'phone': lead.phone,
            'business_problem': lead.business_problem,
            'source': lead.source,
            'status': lead.status,
            'created_at': lead.created_at,
            'updated_at': lead.updated_at,
            'qualification': qualification,
        })

    return results
    

@router.get('/followups/upcoming', response_model=list[FollowupResponse])
def get_upcoming_followups(db: Session = Depends(get_db)):
    followups = (
        db.query(Followup)
        .filter(
            Followup.status == 'SCHEDULED',
            Followup.scheduled_at <= func.now(),
        )
        .order_by(Followup.scheduled_at.asc())
        .all()
    )

    return followups
@router.get('/followups/scheduled', response_model=list[FollowupResponse])
def get_scheduled_followups(db: Session = Depends(get_db)):
    followups = (
        db.query(Followup)
        .filter(
            Followup.status == 'SCHEDULED',
            Followup.scheduled_at <= func.now(),
        )
        .order_by(Followup.scheduled_at.asc())
        .all()
    )

    return followups

@router.post('/leads/{lead_id}/followups', response_model=FollowupResponse, status_code=status.HTTP_201_CREATED)
def create_followup(
    lead_id: int,
    payload: FollowupCreateRequest,
    db: Session = Depends(get_db),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()

    if not lead:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Lead {lead_id} was not found.'},
        )

    if payload.lead_id != lead_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={'message': 'Payload lead_id does not match the URL lead_id.'},
        )

    followup = Followup(
        lead_id=lead_id,
        channel=payload.channel,
        scheduled_at=payload.scheduled_at,
        status='SCHEDULED',
        attempt_number=payload.attempt_number,
    )

    db.add(followup)
    db.commit()
    db.refresh(followup)

    return followup

def _process_followup(followup: Followup, db: Session) -> Followup:
    if followup.status != 'SCHEDULED':
        raise ValueError('Only SCHEDULED follow-ups can be processed.')

    lead = db.query(Lead).filter(Lead.id == followup.lead_id).first()

    if not lead:
        raise ValueError(f'Lead {followup.lead_id} was not found.')

    send_email(
        to_email=lead.email,
        subject='HarbourStone Developments Follow-up',
        body=(
            f'Hello {lead.name},\n\n'
            'This is a follow-up regarding your inquiry.\n\n'
            'HarbourStone Developments'
        ),
    )

    followup.status = 'SENT'
    followup.sent_at = datetime.utcnow()

    db.commit()
    db.refresh(followup)

    return followup


@router.post('/followups/{followup_id}/process', response_model=FollowupResponse)
def process_followup(
    followup_id: int,
    db: Session = Depends(get_db),
):
    followup = (
        db.query(Followup)
        .filter(Followup.id == followup_id)
        .first()
    )

    if not followup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={'message': f'Follow-up {followup_id} was not found.'},
        )

    try:
        return process_followup_service(followup, db)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={'message': str(exc)},
        )
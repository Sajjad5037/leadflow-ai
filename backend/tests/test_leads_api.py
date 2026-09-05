from datetime import datetime, timedelta
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from app.database import Base, SessionLocal, engine
from app.main import app
from app.models.followup import Followup
from app.models.lead import Lead
from app.models.lead_qualification import LeadQualification


def setup_function():
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def test_create_lead_success():
    client = TestClient(app)
    payload = {
        "name": "Jane Smith",
        "company": "Acme Studio",
        "email": "Jane@Example.com",
        "phone": "(555) 123-4567",
        "message": "We need help automating our lead follow-up and quoting process.",
        "source": "website",
    }

    response = client.post('/api/leads', json=payload)

    assert response.status_code == 201
    data = response.json()
    assert 'lead_id' in data
    assert data['status'] == 'AI_QUALIFIED'


def test_duplicate_lead_rejected():
    client = TestClient(app)
    payload = {
        "name": "Jane Smith",
        "company": "Acme Studio",
        "email": "jane@example.com",
        "phone": "(555) 123-4567",
        "message": "We need help automating our lead follow-up and quoting process.",
        "source": "website",
    }

    first = client.post('/api/leads', json=payload)
    second = client.post('/api/leads', json=payload)

    assert first.status_code == 201
    assert second.status_code == 409
    assert second.json()['detail']['status'] == 'AI_QUALIFIED'


def test_invalid_lead_rejected():
    client = TestClient(app)
    response = client.post('/api/leads', json={
        "name": "Jane Smith",
        "company": "Acme Studio",
        "email": "not-an-email",
        "phone": "",
        "message": "Too short",
    })

    assert response.status_code == 422


def test_due_followup_is_returned():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() - timedelta(minutes=1),
            status='SCHEDULED',
            attempt_number=1,
        )
        db.add(followup)
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    response = client.get('/api/followups/due')

    assert response.status_code == 200
    assert any(item['id'] == followup_id for item in response.json())


def test_future_followup_is_not_returned():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() + timedelta(minutes=10),
            status='SCHEDULED',
            attempt_number=1,
        )
        db.add(followup)
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    response = client.get('/api/followups/due')

    assert response.status_code == 200
    assert not any(item['id'] == followup_id for item in response.json())


def test_sent_followup_is_not_returned():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() - timedelta(minutes=1),
            status='SENT',
            attempt_number=1,
        )
        db.add(followup)
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    response = client.get('/api/followups/due')

    assert response.status_code == 200
    assert not any(item['id'] == followup_id for item in response.json())


def test_process_followup_success():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        qualification = LeadQualification(
            lead_id=lead.id,
            score=80,
            temperature='HOT',
            summary='High-intent prospective buyer.',
            reasoning='The lead has a clear property enquiry.',
            recommended_action='Send a follow-up email.',
        )
        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() - timedelta(minutes=1),
            status='SCHEDULED',
            attempt_number=1,
        )
        db.add_all([qualification, followup])
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    with (
        patch(
            'app.services.followup_processor.generate_followup_email',
            return_value={
                'subject': 'Following up on your enquiry',
                'body': 'Hello Jane, we would be happy to help.',
            },
        ),
        patch('app.services.followup_processor.send_email') as mock_send_email,
    ):
        response = client.post(f'/api/followups/{followup_id}/process')

    assert response.status_code == 200
    data = response.json()
    assert data['status'] == 'SENT'
    assert data['sent_at'] is not None
    mock_send_email.assert_called_once_with(
        to_email='jane@example.com',
        subject='Following up on your enquiry',
        body='Hello Jane, we would be happy to help.',
    )


def test_sent_followup_cannot_be_processed():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        qualification = LeadQualification(
            lead_id=lead.id,
            score=80,
            temperature='HOT',
            summary='High-intent prospective buyer.',
            reasoning='The lead has a clear property enquiry.',
            recommended_action='Send a follow-up email.',
        )
        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() - timedelta(minutes=1),
            status='SENT',
            attempt_number=1,
        )
        db.add_all([qualification, followup])
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    with (
        patch(
            'app.services.followup_processor.generate_followup_email',
            return_value={
                'subject': 'Following up on your enquiry',
                'body': 'Hello Jane, we would be happy to help.',
            },
        ) as mock_generate_followup_email,
        patch('app.services.followup_processor.send_email') as mock_send_email,
    ):
        response = client.post(f'/api/followups/{followup_id}/process')

    assert response.status_code == 400
    assert response.json()['detail']['message'] == 'Only SCHEDULED follow-ups can be processed.'
    mock_generate_followup_email.assert_not_called()
    mock_send_email.assert_not_called()


def test_future_followup_cannot_be_processed():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        qualification = LeadQualification(
            lead_id=lead.id,
            score=80,
            temperature='HOT',
            summary='High-intent prospective buyer.',
            reasoning='The lead has a clear property enquiry.',
            recommended_action='Send a follow-up email.',
        )
        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() + timedelta(minutes=10),
            status='SCHEDULED',
            attempt_number=1,
        )
        db.add_all([qualification, followup])
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    with (
        patch(
            'app.services.followup_processor.generate_followup_email',
            return_value={
                'subject': 'Following up on your enquiry',
                'body': 'Hello Jane, we would be happy to help.',
            },
        ) as mock_generate_followup_email,
        patch('app.services.followup_processor.send_email') as mock_send_email,
    ):
        response = client.post(f'/api/followups/{followup_id}/process')

    assert response.status_code == 400
    assert response.json()['detail']['message'] == 'Follow-up is not due yet.'
    mock_generate_followup_email.assert_not_called()
    mock_send_email.assert_not_called()


def test_nonexistent_followup_returns_404():
    client = TestClient(app)

    response = client.post('/api/followups/999999/process')

    assert response.status_code == 404
    assert response.json()['detail']['message'] == 'Follow-up 999999 was not found.'


def test_followup_without_qualification_cannot_be_processed():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() - timedelta(minutes=1),
            status='SCHEDULED',
            attempt_number=1,
        )
        db.add(followup)
        db.commit()
        lead_id = lead.id
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    with (
        patch(
            'app.services.followup_processor.generate_followup_email',
        ) as mock_generate_followup_email,
        patch('app.services.followup_processor.send_email') as mock_send_email,
    ):
        response = client.post(f'/api/followups/{followup_id}/process')

    assert response.status_code == 400
    assert response.json()['detail']['message'] == (
        f'Lead {lead_id} does not have an AI qualification.'
    )
    mock_generate_followup_email.assert_not_called()
    mock_send_email.assert_not_called()


def test_ai_email_generation_failure():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        qualification = LeadQualification(
            lead_id=lead.id,
            score=80,
            temperature='HOT',
            summary='High-intent prospective buyer.',
            reasoning='The lead has a clear property enquiry.',
            recommended_action='Send a follow-up email.',
        )
        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() - timedelta(minutes=1),
            status='SCHEDULED',
            attempt_number=1,
        )
        db.add_all([qualification, followup])
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    with (
        patch(
            'app.services.followup_processor.generate_followup_email',
            side_effect=Exception('AI generation failed'),
        ),
        patch('app.services.followup_processor.send_email') as mock_send_email,
        pytest.raises(Exception, match='AI generation failed'),
    ):
        client.post(f'/api/followups/{followup_id}/process')

    mock_send_email.assert_not_called()


def test_email_send_failure():
    db = SessionLocal()
    try:
        lead = Lead(
            name='Jane Smith',
            company='Acme Studio',
            email='jane@example.com',
            phone='(555) 123-4567',
            business_problem='We need help automating our lead follow-up process.',
            source='website',
            status='AI_QUALIFIED',
        )
        db.add(lead)
        db.flush()

        qualification = LeadQualification(
            lead_id=lead.id,
            score=80,
            temperature='HOT',
            summary='High-intent prospective buyer.',
            reasoning='The lead has a clear property enquiry.',
            recommended_action='Send a follow-up email.',
        )
        followup = Followup(
            lead_id=lead.id,
            channel='EMAIL',
            scheduled_at=datetime.utcnow() - timedelta(minutes=1),
            status='SCHEDULED',
            attempt_number=1,
        )
        db.add_all([qualification, followup])
        db.commit()
        followup_id = followup.id
    finally:
        db.close()

    client = TestClient(app)
    with (
        patch(
            'app.services.followup_processor.generate_followup_email',
            return_value={
                'subject': 'Following up on your enquiry',
                'body': 'Hello Jane, we would be happy to help.',
            },
        ) as mock_generate_followup_email,
        patch(
            'app.services.followup_processor.send_email',
            side_effect=Exception('Email send failed'),
        ),
        pytest.raises(Exception, match='Email send failed'),
    ):
        client.post(f'/api/followups/{followup_id}/process')

    db = SessionLocal()
    try:
        followup = db.query(Followup).filter(Followup.id == followup_id).first()
        assert followup.status == 'SCHEDULED'
        assert followup.sent_at is None
    finally:
        db.close()

    mock_generate_followup_email.assert_called_once()

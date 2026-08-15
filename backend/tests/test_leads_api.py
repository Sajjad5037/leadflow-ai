from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


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
    assert data['status'] == 'NEW'


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
    assert second.json()['detail']['status'] == 'NEW'


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

from fastapi.testclient import TestClient

from app.database import Base, engine
from app.main import app


def setup_function():
    Base.metadata.create_all(bind=engine)


def teardown_function():
    Base.metadata.drop_all(bind=engine)


def _valid_payload(**overrides):
    payload = {
        "title": "Sea View Apartment",
        "description": "A spacious two-bedroom apartment with a sea view.",
        "property_type": "APARTMENT",
        "status": "AVAILABLE",
        "price": 15000000,
        "currency": "PKR",
        "location": "Karachi",
        "address": "Clifton Block 5",
        "size_value": 1800,
        "size_unit": "sqft",
        "bedrooms": 2,
        "bathrooms": 2,
        "is_featured": False,
    }
    payload.update(overrides)
    return payload


def test_create_property_success():
    client = TestClient(app)

    response = client.post('/api/properties', json=_valid_payload())

    assert response.status_code == 201
    data = response.json()
    assert data['title'] == 'Sea View Apartment'
    assert data['property_type'] == 'APARTMENT'
    assert data['status'] == 'AVAILABLE'
    assert 'id' in data


def test_create_property_with_negative_price_rejected():
    client = TestClient(app)

    response = client.post('/api/properties', json=_valid_payload(price=-100))

    assert response.status_code == 422


def test_create_property_with_invalid_property_type_rejected():
    client = TestClient(app)

    response = client.post('/api/properties', json=_valid_payload(property_type='CASTLE'))

    assert response.status_code == 422


def test_list_properties():
    client = TestClient(app)

    client.post('/api/properties', json=_valid_payload(title='Property One'))
    client.post('/api/properties', json=_valid_payload(title='Property Two'))

    response = client.get('/api/properties')

    assert response.status_code == 200
    titles = [item['title'] for item in response.json()]
    assert 'Property One' in titles
    assert 'Property Two' in titles


def test_get_property_by_id():
    client = TestClient(app)

    created = client.post('/api/properties', json=_valid_payload()).json()

    response = client.get(f"/api/properties/{created['id']}")

    assert response.status_code == 200
    assert response.json()['id'] == created['id']


def test_get_nonexistent_property_returns_404():
    client = TestClient(app)

    response = client.get('/api/properties/999999')

    assert response.status_code == 404
    assert response.json()['detail']['message'] == 'Property 999999 was not found.'


def test_update_property():
    client = TestClient(app)

    created = client.post('/api/properties', json=_valid_payload()).json()

    response = client.put(
        f"/api/properties/{created['id']}",
        json=_valid_payload(title='Updated Title', price=16000000),
    )

    assert response.status_code == 200
    data = response.json()
    assert data['title'] == 'Updated Title'
    assert float(data['price']) == 16000000


def test_partial_update_property():
    client = TestClient(app)

    created = client.post('/api/properties', json=_valid_payload()).json()

    response = client.put(
        f"/api/properties/{created['id']}",
        json={'bedrooms': 3},
    )

    assert response.status_code == 200
    data = response.json()
    assert data['bedrooms'] == 3
    assert data['title'] == 'Sea View Apartment'


def test_update_nonexistent_property_returns_404():
    client = TestClient(app)

    response = client.put('/api/properties/999999', json={'title': 'Does Not Exist'})

    assert response.status_code == 404
    assert response.json()['detail']['message'] == 'Property 999999 was not found.'


def test_update_property_status():
    client = TestClient(app)

    created = client.post('/api/properties', json=_valid_payload()).json()

    response = client.patch(
        f"/api/properties/{created['id']}/status",
        json={'status': 'RESERVED'},
    )

    assert response.status_code == 200
    assert response.json()['status'] == 'RESERVED'


def test_invalid_property_status_is_rejected():
    client = TestClient(app)

    created = client.post('/api/properties', json=_valid_payload()).json()

    response = client.patch(
        f"/api/properties/{created['id']}/status",
        json={'status': 'NOT_A_REAL_STATUS'},
    )

    assert response.status_code == 422


def test_delete_property():
    client = TestClient(app)

    created = client.post('/api/properties', json=_valid_payload()).json()

    response = client.delete(f"/api/properties/{created['id']}")

    assert response.status_code == 200

    follow_up = client.get(f"/api/properties/{created['id']}")
    assert follow_up.status_code == 404


def test_delete_nonexistent_property_returns_404():
    client = TestClient(app)

    response = client.delete('/api/properties/999999')

    assert response.status_code == 404
    assert response.json()['detail']['message'] == 'Property 999999 was not found.'

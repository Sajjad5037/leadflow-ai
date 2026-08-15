import os
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi.testclient import TestClient
from sqlalchemy import text

from app.database import Base, engine, normalize_database_url
from app.main import app
import psycopg

load_dotenv(Path('.env'))
raw = os.getenv('DATABASE_URL')
assert raw, 'DATABASE_URL missing'
normalized = normalize_database_url(raw)
print('psycopg_version', psycopg.__version__)
print('normalized_scheme', normalized.split('://', 1)[0])

Base.metadata.create_all(bind=engine)
with engine.connect() as conn:
    print('db_connected', conn.execute(text('SELECT 1')).scalar() == 1)

client = TestClient(app)
print('health_status', client.get('/health').status_code)
email = f"leadflow_local_test_{int(time.time() * 1000)}@example.com"
payload = {
    'name': 'Local DB Verification',
    'company': 'LeadFlow QA',
    'email': email,
    'phone': '(555) 321-9876',
    'message': 'Testing production-safe Psycopg 3 database configuration and lead intake behavior.',
    'source': 'local-verify',
}
create = client.post('/api/leads', json=payload)
print('create_status', create.status_code)
print('create_has_lead_id', 'lead_id' in create.json())
duplicate = client.post('/api/leads', json=payload)
print('duplicate_status', duplicate.status_code)
invalid = client.post('/api/leads', json={'name': 'Bad', 'company': '', 'email': 'not-an-email', 'phone': '', 'message': 'x'})
print('invalid_status', invalid.status_code)

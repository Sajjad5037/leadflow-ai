# LeadFlow AI

This repository is the Stage 1 foundation for the LeadFlow AI project as defined in the master specification.

## Scope

This stage establishes the project foundation only:

- React frontend shell
- FastAPI backend shell
- n8n folder for future workflows
- repository documentation and structure

No LeadFlow business logic, GHL integration, or workflow automation is implemented yet.

## Start the frontend

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0
```

## Start the backend

```bash
cd backend
python -m venv .venv
. .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Health checks

- Frontend: http://localhost:5173
- Backend: http://localhost:8000/health

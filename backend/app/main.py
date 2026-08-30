from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
#from apscheduler.schedulers.background import BackgroundScheduler

from app.api.leads import router as leads_router
from app.database import Base, engine
#from app.services.followup_runner import process_due_followups
from app.models.lead import Lead
from app.models.lead_qualification import LeadQualification
from app.models.followup import Followup


app = FastAPI(title='LeadFlow AI API', version='0.1.0')


# def run_followup_runner():
#     db = SessionLocal()
#     try:
#         process_due_followups(db)
#     finally:
#         db.close()


# scheduler = BackgroundScheduler()
# scheduler.add_job(run_followup_runner, 'interval', minutes=1)
# scheduler.start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

Base.metadata.create_all(bind=engine)

app.include_router(leads_router)


@app.get('/health')
def health_check():
    return {
        'status': 'ok',
        'service': 'leadflow-ai-backend',
        'version': app.version,
    }


@app.get('/')
def root():
    return {
        'message': 'LeadFlow AI backend foundation is running.',
        'status': 'ok',
    }

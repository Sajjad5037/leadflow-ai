from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.leads import router as leads_router
from app.database import Base, engine

app = FastAPI(title='LeadFlow AI API', version='0.1.0')

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

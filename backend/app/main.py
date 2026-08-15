from fastapi import FastAPI

app = FastAPI(title='LeadFlow AI API', version='0.1.0')


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

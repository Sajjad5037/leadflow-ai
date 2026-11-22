
@echo off
title Al Qaim Estate Backend

cd /d "C:\Users\Admin\Documents\Al Qaim Estate\backend"

REM Set Google Cloud credentials
set "GOOGLE_APPLICATION_CREDENTIALS=C:\Users\Admin\Documents\Al Qaim Estate\backend\google credentials\krishchatbot-475214-c845c3517129.json"

REM Use the virtual environment's Python directly
set "VENV_PYTHON=C:\Users\Admin\Documents\Al Qaim Estate\.venv-1\Scripts\python.exe"

REM Verify Python environment
echo Checking Python environment...
"%VENV_PYTHON%" -c "import sys; print(sys.executable)"

REM Start FastAPI using the same Python environment
"%VENV_PYTHON%" -m uvicorn app.main:app --reload

pause

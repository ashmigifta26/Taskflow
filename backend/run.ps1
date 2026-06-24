# Start TaskFlow API (from backend folder)
Set-Location $PSScriptRoot
.\venv\Scripts\uvicorn.exe main:app --reload --host 0.0.0.0 --port 8000

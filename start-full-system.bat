@echo off
title AYUSH-Care MediKiosk - Full System Launcher
echo ========================================================
echo   Starting AYUSH-Care Enterprise MediKiosk (Local Mode)
echo ========================================================
echo.

set "PATHEXT=.COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC"
set "PATH=%LOCALAPPDATA%\Programs\Python\Python313;%LOCALAPPDATA%\Programs\Python\Python313\Scripts;C:\Program Files\nodejs;%PATH%"

echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "AYUSH-Care Backend (Port 8000)" cmd /k "cd /d %~dp0\server && python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Waiting 2 seconds for backend initialization...
timeout /t 2 /nobreak >nul

echo Starting React Kiosk Frontend on http://localhost:3000...
cd /d "%~dp0\client"
npm.cmd run dev -- --port 3000 --open

pause

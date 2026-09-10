@echo off
title MediKiosk OPD Platform - Hackathon Live Verification Suite
color 0B
echo ===============================================================================
echo          MEDIKIOSK OPD PLATFORM -- HACKATHON LIVE VERIFICATION SUITE           
echo          Enterprise Robustness: Unit Testing ^& Concurrency Load Benchmark      
echo ===============================================================================
echo.

set "PYTHON_EXE=python"
if exist "%~dp0server\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=%~dp0server\.venv\Scripts\python.exe"
)

echo [*] Target Python: %PYTHON_EXE%
echo [*] Executing Unit Tests ^& High-Concurrency Load Benchmark (20 Kiosks)...
echo.

"%PYTHON_EXE%" "%~dp0scripts\run_judge_showcase.py"

echo.
echo ===============================================================================
echo [*] Opening visual judge report in your browser...
if exist "%~dp0test_report_judge_showcase.html" (
    start "" "%~dp0test_report_judge_showcase.html"
)
echo ===============================================================================
echo.
pause

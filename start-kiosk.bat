@echo off
title AYUSH-Care Client Kiosk (Port 3000)
echo ========================================================
echo Starting AYUSH-Care Patient Intake Kiosk on Port 3000...
echo ========================================================
cd /d "%~dp0\client"
npm.cmd run dev -- --port 3000 --open
pause

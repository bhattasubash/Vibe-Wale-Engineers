@echo off
REM ====================================================================
REM AYUSH-Care Hardware Kiosk Lockdown Launcher (Chrome Kiosk Mode)
REM Locks the terminal into full-screen sandbox without URL bars
REM ====================================================================

set KIOSK_URL=http://localhost:5173
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"

echo Starting AYUSH-Care Hospital Kiosk Terminal in Full-Screen Mode...
%CHROME_PATH% --kiosk --disable-pinch --overscroll-history-navigation=0 --disable-component-update --check-for-update-interval=31536000 %KIOSK_URL%

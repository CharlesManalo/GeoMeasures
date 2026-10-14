@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\client.ps1" -Action Check
set "result=%ERRORLEVEL%"
pause
exit /b %result%

@echo off
cd /d "%~dp0"
start /B python -m http.server 5555 2>nul
if errorlevel 1 start /B py -m http.server 5555 2>nul
timeout /t 2 /nobreak >nul
start "" "http://localhost:5555"
echo Browser should open at http://localhost:5555
echo To stop the server: open Task Manager and end the "python" process, or close this window and run: taskkill /F /IM python.exe
pause

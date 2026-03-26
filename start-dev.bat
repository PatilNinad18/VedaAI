@echo off
echo Starting VedaAI Development Environment...
echo.

echo 1. Starting Backend API Server...
start "Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

echo 2. Starting Frontend...
timeout /t 3 >nul
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo 3. Starting Worker...
timeout /t 3 >nul
start "Worker" cmd /k "cd /d %~dp0backend && npm run worker"

echo.
echo All services started!
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:4000
echo.
echo Press any key to open the frontend...
pause >nul
start http://localhost:3000

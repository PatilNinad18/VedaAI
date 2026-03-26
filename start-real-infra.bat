@echo off
echo Starting VedaAI with Real Infrastructure...
echo.

echo 1. Starting Redis with Docker...
docker run -d -p 6379:6379 --name veda-ai-redis redis:latest
if %errorlevel% neq 0 (
    echo Redis container already exists or Docker not available
    docker start veda-ai-redis 2>nul
)

echo 2. Starting MongoDB with Docker...
docker run -d -p 27017:27017 --name veda-ai-mongo mongo:latest
if %errorlevel% neq 0 (
    echo MongoDB container already exists or Docker not available
    docker start veda-ai-mongo 2>nul
)

echo.
echo 3. Waiting for services to start...
timeout /t 5 >nul

echo 4. Starting Backend API Server...
start "Backend API" cmd /k "cd /d %~dp0backend && npm run dev"

echo 5. Starting Worker...
timeout /t 3 >nul
start "Worker" cmd /k "cd /d %~dp0backend && npm run worker"

echo 6. Starting Frontend...
timeout /t 3 >nul
start "Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All services started with real infrastructure!
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:4000
echo Redis: localhost:6379
echo MongoDB: localhost:27017
echo.
echo Press any key to open the frontend...
pause >nul
start http://localhost:3000

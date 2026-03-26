@echo off
echo Starting VedaAI Database Services...

echo.
echo 1. Starting Redis...
docker run -d --name vedaai-redis -p 6379:6379 redis:7.2-alpine
if %errorlevel% neq 0 (
    echo Redis container already exists or failed to start
    docker start vedaai-redis
)

echo.
echo 2. Starting MongoDB...
docker run -d --name vedaai-mongo -p 27017:27017 mongo:7.0
if %errorlevel% neq 0 (
    echo MongoDB container already exists or failed to start
    docker start vedaai-mongo
)

echo.
echo 3. Checking services...
timeout /t 5 >nul
docker ps --filter "name=vedaai-redis"
docker ps --filter "name=vedaai-mongo"

echo.
echo Database services started!
echo.
echo You can now run:
echo   npm run dev:backend
echo   npm run dev:frontend  
echo   npm run worker
pause

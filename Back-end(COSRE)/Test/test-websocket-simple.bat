@echo off
echo ========================================
echo    Testing WebSocket Endpoints
echo ========================================

echo.
echo 1. Testing Health Check...
curl -s http://localhost:8080/api/health

echo.
echo.
echo 2. Register a test user...
curl -s -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"websocket@test.com\",\"password\":\"password123\",\"fullName\":\"WebSocket Tester\"}"

echo.
echo.
echo 3. Login to get JWT token...
for /f "tokens=*" %%i in ('curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"websocket@test.com\",\"password\":\"password123\"}"') do set LOGIN_RESPONSE=%%i
echo %LOGIN_RESPONSE%

echo.
echo.
echo 4. Testing WebSocket endpoint availability...
echo WebSocket endpoint should be available at: ws://localhost:8080/ws
echo SockJS endpoint should be available at: http://localhost:8080/ws/info

echo.
echo Testing SockJS info endpoint...
curl -s http://localhost:8080/ws/info

echo.
echo.
echo ========================================
echo    WebSocket Test Instructions
echo ========================================
echo.
echo To test WebSocket functionality:
echo.
echo 1. Open websocket-test.html in your browser
echo 2. Click "Connect to WebSocket"
echo 3. Login with credentials: websocket@test.com / password123
echo 4. Subscribe to team chat (Team ID: 1)
echo 5. Send test messages
echo.
echo OR use a WebSocket client tool like:
echo - Postman (WebSocket feature)
echo - wscat (npm install -g wscat)
echo - Browser Developer Tools
echo.
echo WebSocket URL: ws://localhost:8080/ws
echo Subscribe to: /topic/team/1
echo Send to: /app/chat/1
echo.
echo Message format:
echo {
echo   "content": "Hello team!",
echo   "teamId": 1,
echo   "senderId": 1
echo }
echo.

pause
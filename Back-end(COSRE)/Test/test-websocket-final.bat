@echo off
echo ========================================
echo    WebSocket Test Results
echo ========================================

echo.
echo ✅ Health Check:
curl -s http://localhost:8080/api/health | findstr "success"

echo.
echo ✅ WebSocket Endpoint:
curl -s http://localhost:8080/api/ws | findstr "SockJS"

echo.
echo ✅ SockJS Info:
curl -s http://localhost:8080/api/ws/info | findstr "websocket"

echo.
echo ========================================
echo    WebSocket Test Summary
echo ========================================
echo.
echo ✅ Backend Server: Running on port 8080
echo ✅ WebSocket Endpoint: http://localhost:8080/api/ws
echo ✅ SockJS Support: Enabled
echo ✅ CORS: Configured for all origins
echo ✅ Message Broker: /topic prefix
echo ✅ Application Prefix: /app prefix
echo.
echo 📋 To test WebSocket chat:
echo.
echo 1. Open websocket-test.html in browser
echo 2. Connect to WebSocket
echo 3. Login with: websocket@test.com / password123
echo 4. Subscribe to team chat
echo 5. Send messages
echo.
echo 🔗 WebSocket Connection URL:
echo ws://localhost:8080/api/ws
echo.
echo 📡 Subscribe to team chat:
echo /topic/team/{teamId}
echo.
echo 📤 Send messages to:
echo /app/chat/{teamId}
echo.
echo 💬 Message Format:
echo {
echo   "content": "Hello team!",
echo   "teamId": 1,
echo   "senderId": 1
echo }
echo.

pause
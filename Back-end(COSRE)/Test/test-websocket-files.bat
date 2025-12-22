@echo off
echo ========================================
echo    Testing WebSocket Chat & File Upload
echo ========================================

echo.
echo WEBSOCKET CHAT TESTING:
echo.
echo 1. WebSocket Connection:
echo   - Endpoint: ws://localhost:8080/ws
echo   - Use SockJS for fallback support
echo   - Subscribe to: /topic/team/{teamId}
echo   - Send to: /app/chat/{teamId}
echo.

echo 2. Get Chat History (REST):
echo curl -X GET http://localhost:8080/api/teams/1/messages ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo.

echo 3. WebSocket Message Format:
echo {
echo   "content": "Hello team!",
echo   "teamId": 1,
echo   "senderId": 2
echo }
echo.

echo ========================================
echo    FILE UPLOAD & GRADING TESTING
echo ========================================

echo.
echo 1. Upload File:
echo curl -X POST http://localhost:8080/api/files/upload ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
echo   -F "file=@path/to/your/file.pdf"
echo.

echo 2. Access Uploaded File:
echo curl http://localhost:8080/api/files/uploads/filename.pdf
echo.

echo 3. Create Submission:
echo curl -X POST http://localhost:8080/api/submissions ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"link\":\"http://localhost:8080/api/files/uploads/filename.pdf\",\"milestoneId\":1,\"teamId\":1}"
echo.

echo 4. Grade Submission (Lecturer only):
echo curl -X POST http://localhost:8080/api/submissions/grade ^
echo   -H "Authorization: Bearer LECTURER_JWT_TOKEN" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"submissionId\":1,\"grade\":85.5,\"feedback\":\"Good work!\"}"
echo.

echo 5. Get Ungraded Submissions (Lecturer):
echo curl -X GET http://localhost:8080/api/submissions/ungraded ^
echo   -H "Authorization: Bearer LECTURER_JWT_TOKEN"
echo.

echo ========================================
echo    WEBSOCKET CLIENT EXAMPLE (JavaScript)
echo ========================================
echo.
echo const socket = new SockJS('http://localhost:8080/ws');
echo const stompClient = Stomp.over(socket);
echo.
echo stompClient.connect({}, function(frame) {
echo     // Subscribe to team chat
echo     stompClient.subscribe('/topic/team/1', function(message) {
echo         const chatMessage = JSON.parse(message.body);
echo         console.log('Received:', chatMessage);
echo     });
echo.
echo     // Send message
echo     stompClient.send('/app/chat/1', {}, JSON.stringify({
echo         content: 'Hello team!',
echo         teamId: 1,
echo         senderId: 2
echo     }));
echo });
echo.

echo ========================================
echo    Features Implemented
echo ========================================
echo.
echo ✅ Real-time Chat:
echo   - WebSocket with STOMP protocol
echo   - Team-based chat rooms
echo   - Message persistence in database
echo   - Team member permission checks
echo.
echo ✅ File Upload:
echo   - MultipartFile upload to /uploads directory
echo   - File serving with proper content types
echo   - Unique filename generation (UUID)
echo   - File size limit: 10MB
echo.
echo ✅ Grading System:
echo   - Submission creation with file links
echo   - Lecturer grading with scores and feedback
echo   - Ungraded submissions tracking
echo   - Permission-based access control
echo.

pause
@echo off
echo ========================================
echo    Testing Kanban Task Board
echo ========================================

echo.
echo This script demonstrates the Kanban Task Board API endpoints.
echo You need to:
echo 1. Register/Login users to get JWT tokens
echo 2. Create classroom, project, and teams
echo 3. Use JWT tokens in Authorization headers
echo.

echo Example API calls for Kanban Task Board:
echo.

echo 1. Create a task (POST /api/tasks):
echo curl -X POST http://localhost:8080/api/tasks ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"title\":\"Implement Login\",\"description\":\"Create login functionality\",\"teamId\":1,\"priority\":2}"
echo.

echo 2. Get team tasks as Kanban board (GET /api/tasks/teams/{teamId}/kanban):
echo curl -X GET http://localhost:8080/api/tasks/teams/1/kanban ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo.

echo 3. Update task status - Drag and Drop (PUT /api/tasks/{id}/status):
echo curl -X PUT http://localhost:8080/api/tasks/1/status ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"newStatus\":\"DOING\"}"
echo.

echo 4. Assign task to team member (PUT /api/tasks/{id}/assign):
echo curl -X PUT http://localhost:8080/api/tasks/1/assign ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN" ^
echo   -H "Content-Type: application/json" ^
echo   -d "{\"assigneeId\":2}"
echo.

echo 5. Get my assigned tasks (GET /api/tasks/my):
echo curl -X GET http://localhost:8080/api/tasks/my ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo.

echo 6. Get tasks by status (GET /api/tasks/teams/{teamId}/status/{status}):
echo curl -X GET http://localhost:8080/api/tasks/teams/1/status/TODO ^
echo   -H "Authorization: Bearer YOUR_JWT_TOKEN"
echo.

echo ========================================
echo    Kanban Board Features
echo ========================================
echo.
echo ✅ Team Member Permission Check:
echo   - Only team members can view/edit tasks
echo   - Lecturers and Admins have full access
echo   - 403 Forbidden for non-members
echo.
echo ✅ Drag and Drop Support:
echo   - Update task status: TODO → DOING → DONE
echo   - Real-time status updates
echo   - Kanban board view with columns
echo.
echo ✅ Task Management:
echo   - Create tasks with priority and due date
echo   - Assign tasks to team members
echo   - Track task progress and overdue items
echo.
echo ✅ Security Features:
echo   - JWT authentication required
echo   - Role-based access control
echo   - Team membership validation
echo.

echo To test the full workflow:
echo 1. Use the authentication endpoints to get JWT tokens
echo 2. Create classroom, project, and teams using admin endpoints
echo 3. Add students to teams
echo 4. Use the task endpoints with proper JWT tokens
echo.

pause
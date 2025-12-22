@echo off
echo ========================================
echo    Testing Class & Project Management
echo ========================================

echo.
echo 1. Register a lecturer...
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"lecturer@test.com\",\"password\":\"password123\",\"fullName\":\"Test Lecturer\"}"

echo.
echo.
echo 2. Login as lecturer to get token...
for /f "tokens=*" %%i in ('curl -s -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"lecturer@test.com\",\"password\":\"password123\"}" ^| findstr /r "\"token\":\"[^\"]*\""') do set TOKEN_LINE=%%i

echo.
echo.
echo 3. Register some students...
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"student1@test.com\",\"password\":\"password123\",\"fullName\":\"Student One\"}"

echo.
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"student2@test.com\",\"password\":\"password123\",\"fullName\":\"Student Two\"}"

echo.
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"student3@test.com\",\"password\":\"password123\",\"fullName\":\"Student Three\"}"

echo.
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"student4@test.com\",\"password\":\"password123\",\"fullName\":\"Student Four\"}"

echo.
echo.
echo Note: To test class creation and other features, you need to:
echo 1. Extract JWT token from login response
echo 2. Use the token in Authorization header for protected endpoints
echo.
echo Example commands:
echo curl -X POST http://localhost:8080/api/admin/classes -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{\"name\":\"Software Engineering\",\"code\":\"SE2024\"}"
echo.
echo ========================================
echo    Setup Complete - Use tokens manually
echo ========================================
pause
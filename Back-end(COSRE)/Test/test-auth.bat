@echo off
echo ========================================
echo    Testing CollabSphere Authentication
echo ========================================

echo.
echo 1. Testing Registration...
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"password123\",\"fullName\":\"Student Test\"}"

echo.
echo.
echo 2. Testing Login...
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"password123\"}"

echo.
echo.
echo 3. Testing Invalid Login...
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"wrongpassword\"}"

echo.
echo.
echo 4. Testing Duplicate Registration...
curl -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"student@test.com\",\"password\":\"password123\",\"fullName\":\"Student Test\"}"

echo.
echo.
echo ========================================
echo    Authentication Test Complete
echo ========================================
pause
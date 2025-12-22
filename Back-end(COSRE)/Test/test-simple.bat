@echo off
echo ========================================
echo TESTING COLLABSPHERE BASIC FEATURES
echo ========================================

echo.
echo 1. Testing Health Check...
curl -X GET "http://localhost:8080/api/auth/register" -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"123456\",\"fullName\":\"Test User\",\"role\":\"STUDENT\"}"

echo.
echo 2. Testing Login...
curl -X POST "http://localhost:8080/api/auth/login" -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"123456\"}"

echo.
echo 3. Testing Database Tables...
curl -X GET "http://localhost:8080/database/test"

echo.
echo ========================================
echo BASIC TESTING COMPLETED
echo ========================================
pause
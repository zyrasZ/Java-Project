@echo off
echo ========================================
echo    Testing CollabSphere API
echo ========================================

echo Testing Health Check endpoint...
echo.
curl -X GET "http://localhost:8080/api/health" -H "Content-Type: application/json"

echo.
echo.
echo Testing Database Connection...
echo.
curl -X GET "http://localhost:8080/api/database/test" -H "Content-Type: application/json"

echo.
echo.
echo ========================================
echo    API Test Complete
echo ========================================
pause
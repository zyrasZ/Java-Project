@echo off
echo ========================================
echo    CollabSphere Backend Startup
echo ========================================

echo Checking Java installation...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java not found! Please install Java 17 or higher.
    pause
    exit /b 1
)

echo.
echo Starting CollabSphere Backend with H2 Database...
echo Server will be available at: http://localhost:8080/api
echo H2 Console: http://localhost:8080/api/h2-console
echo.
echo Press Ctrl+C to stop the server
echo.

.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

pause
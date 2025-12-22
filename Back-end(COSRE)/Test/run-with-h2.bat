@echo off
echo ========================================
echo    CollabSphere Backend (H2 Database)
echo ========================================
echo.
echo Starting with H2 in-memory database...
echo No MySQL installation required!
echo.
echo Server: http://localhost:8080/api
echo H2 Console: http://localhost:8080/api/h2-console
echo.
echo Press Ctrl+C to stop
echo.

.\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=h2

pause
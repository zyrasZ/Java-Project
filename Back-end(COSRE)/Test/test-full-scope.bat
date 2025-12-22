@echo off
echo ========================================
echo TESTING COLLABSPHERE FULL SCOPE FEATURES
echo ========================================

echo.
echo 1. Testing Staff Import Users API...
curl -X POST "http://localhost:8080/api/staff/import/users" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -F "file=@sample-users.xlsx"

echo.
echo 2. Testing Project Approval Flow...
echo 2a. Submit project for approval:
curl -X PUT "http://localhost:8080/projects/1/submit" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo 2b. Get pending projects:
curl -X GET "http://localhost:8080/projects/pending" ^
  -H "Authorization: Bearer %JWT_TOKEN%"

echo.
echo 2c. Approve project:
curl -X PUT "http://localhost:8080/projects/1/approve?comment=Good project" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -H "Content-Type: application/json"

echo.
echo 3. Testing Whiteboard API...
echo 3a. Get whiteboard data:
curl -X GET "http://localhost:8080/api/whiteboards/1" ^
  -H "Authorization: Bearer %JWT_TOKEN%"

echo.
echo 3b. Save whiteboard data:
curl -X POST "http://localhost:8080/api/whiteboards/1" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"drawings\": [{\"type\": \"line\", \"x\": 100, \"y\": 100}]}"

echo.
echo 4. Testing Rubric System...
echo 4a. Create rubric:
curl -X POST "http://localhost:8080/api/rubrics" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"projectId\": 1, \"name\": \"Project Evaluation\", \"description\": \"Comprehensive project assessment\"}"

echo.
echo 4b. Add criteria:
curl -X POST "http://localhost:8080/api/rubrics/1/criteria" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"Technical Quality\", \"description\": \"Code quality and architecture\", \"weight\": 0.4, \"maxScore\": 10}"

echo.
echo 4c. Grade team with rubric:
curl -X POST "http://localhost:8080/api/rubrics/grades/rubric" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -H "Content-Type: application/json" ^
  -d "{\"teamId\": 1, \"rubricId\": 1, \"scores\": [{\"criteriaId\": 1, \"score\": 8.5, \"feedback\": \"Good technical implementation\"}]}"

echo.
echo ========================================
echo FULL SCOPE TESTING COMPLETED
echo ========================================
pause
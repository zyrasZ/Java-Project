# Hướng dẫn Setup và Chạy CollabSphere

## Yêu cầu hệ thống

✅ **Java 24** - Đã cài đặt
❌ **Maven** - Cần cài đặt
❌ **MySQL** - Cần cài đặt và cấu hình

## Cách 1: Cài đặt Maven

### Download Maven
1. Tải Maven từ: https://maven.apache.org/download.cgi
2. Giải nén vào thư mục (ví dụ: `C:\apache-maven-3.9.5`)
3. Thêm vào PATH:
   - Mở System Properties → Environment Variables
   - Thêm `C:\apache-maven-3.9.5\bin` vào PATH
   - Restart Command Prompt

### Kiểm tra cài đặt
```bash
mvn -version
```

## Cách 2: Sử dụng IDE (Khuyến nghị)

### IntelliJ IDEA
1. Open Project → Chọn thư mục chứa `pom.xml`
2. IDE sẽ tự động import Maven dependencies
3. Chạy `CollabSphereApplication.java` → Run

### VS Code
1. Cài extension: "Extension Pack for Java"
2. Open Folder → Chọn project folder
3. Ctrl+Shift+P → "Java: Run"

### Eclipse
1. File → Import → Existing Maven Projects
2. Browse đến project folder
3. Right-click project → Run As → Spring Boot App

## Cách 3: Sử dụng Maven Wrapper (Tự động tạo)

Nếu có Maven, tạo wrapper:
```bash
mvn wrapper:wrapper
```

Sau đó chạy:
```bash
./mvnw spring-boot:run    # Linux/Mac
mvnw.cmd spring-boot:run  # Windows
```

## Setup MySQL

### Cài đặt MySQL
1. Download từ: https://dev.mysql.com/downloads/mysql/
2. Cài đặt với password root
3. Cập nhật password trong `application.properties`

### Tạo Database
```sql
mysql -u root -p
source database-setup.sql
source sample-data.sql
```

## Test Application

### 1. Health Check
```bash
curl http://localhost:8080/api/health
```

### 2. Database Test
```bash
curl http://localhost:8080/api/database/test
```

### 3. Expected Response
```json
{
  "status": "success",
  "message": "Service is running",
  "data": {
    "status": "UP",
    "timestamp": "2024-12-11T...",
    "service": "CollabSphere Backend",
    "version": "1.0.0"
  }
}
```

## Troubleshooting

### Lỗi MySQL Connection
- Kiểm tra MySQL service đang chạy
- Kiểm tra username/password trong `application.properties`
- Tạo database `collabsphere_db`

### Lỗi Port 8080 đã sử dụng
Thay đổi port trong `application.properties`:
```properties
server.port=8081
```

### Lỗi Java Version
Project yêu cầu Java 17+, hiện tại có Java 24 (OK)

## Chạy với Profile

### Development
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

### Production
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```
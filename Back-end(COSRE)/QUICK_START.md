# 🚀 Quick Start Guide - CollabSphere

## ⚡ Cách nhanh nhất để chạy ứng dụng

### Option 1: Sử dụng IDE (Khuyến nghị) ⭐

#### IntelliJ IDEA
1. **Open Project**: File → Open → Chọn thư mục chứa `pom.xml`
2. **Wait for indexing**: IDE sẽ tự động download dependencies
3. **Run**: Tìm file `CollabSphereApplication.java` → Click Run ▶️
4. **Access**: http://localhost:8080/api/health

#### VS Code
1. **Install Extension**: "Extension Pack for Java"
2. **Open Folder**: Chọn project folder
3. **Run**: Ctrl+Shift+P → "Java: Run" → Chọn `CollabSphereApplication`
4. **Access**: http://localhost:8080/api/health

### Option 2: Cài Maven và chạy command line

#### Cài đặt Maven
1. Download: https://maven.apache.org/download.cgi
2. Giải nén vào `C:\apache-maven-3.9.5`
3. Thêm `C:\apache-maven-3.9.5\bin` vào PATH
4. Restart Command Prompt
5. Test: `mvn -version`

#### Chạy ứng dụng
```bash
mvn spring-boot:run
```

## 🗄️ Setup Database (Tùy chọn)

### Không có MySQL?
- Ứng dụng sẽ tự động tạo H2 in-memory database
- Không cần cài đặt gì thêm

### Có MySQL?
1. Tạo database:
```sql
CREATE DATABASE collabsphere_db;
```

2. Cập nhật password trong `application.properties`:
```properties
spring.datasource.password=your_mysql_password
```

3. Chạy script tạo dữ liệu mẫu:
```bash
mysql -u root -p < database-setup.sql
mysql -u root -p < sample-data.sql
```

## 🧪 Test API

### Health Check
```bash
curl http://localhost:8080/api/health
```

### Expected Response
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

### Database Test
```bash
curl http://localhost:8080/api/database/test
```

## 🔧 Troubleshooting

### ❌ Port 8080 đã sử dụng
Thay đổi port trong `application.properties`:
```properties
server.port=8081
```

### ❌ MySQL Connection Error
- Kiểm tra MySQL service đang chạy
- Kiểm tra username/password
- Hoặc comment MySQL config để dùng H2

### ❌ Java Version Error
- Cần Java 17+
- Hiện tại có Java 24 ✅

## 📁 Project Structure
```
collabsphere-backend/
├── src/main/java/com/collabsphere/
│   ├── CollabSphereApplication.java  ← Main class
│   ├── controller/                   ← REST APIs
│   ├── entity/                       ← Database models
│   ├── config/                       ← Configurations
│   └── dto/                          ← Data transfer objects
├── src/main/resources/
│   └── application.properties        ← Configuration
└── pom.xml                          ← Dependencies
```

## 🎯 Next Steps

1. **Chạy ứng dụng** bằng IDE hoặc Maven
2. **Test Health endpoint**: http://localhost:8080/api/health
3. **Kiểm tra logs** để đảm bảo không có lỗi
4. **Setup MySQL** (tùy chọn) để có persistent data
5. **Bắt đầu phát triển** các API endpoints

---

**💡 Tip**: Sử dụng IDE để development sẽ dễ dàng hơn nhiều so với command line!
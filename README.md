# CollabSphere - Hệ thống Quản lý Học tập Theo Dự án

CollabSphere là một hệ thống quản lý học tập theo dự án toàn diện, được thiết kế để hỗ trợ việc giảng dạy và học tập dựa trên dự án trong môi trường giáo dục. Hệ thống cung cấp các công cụ collaboration, quản lý task, chấm điểm và giao tiếp real-time.

## 🚀 Tính năng chính

### 👥 Quản lý người dùng đa vai trò
- **Admin**: Quản lý toàn hệ thống, người dùng, lớp học
- **Lecturer**: Tạo dự án, quản lý lớp học, chấm điểm
- **Student**: Tham gia dự án, làm việc nhóm, quản lý task
- **Staff**: Import dữ liệu, hỗ trợ quản lý
- **Head Department**: Phê duyệt dự án

### 📚 Quản lý dự án và lớp học
- Tạo và quản lý lớp học với mã lớp
- Workflow phê duyệt dự án (Draft → Pending → Approved/Rejected)
- Tự động chia nhóm sinh viên
- Quản lý milestone và deadline

### 🎯 Hệ thống Task Management
- Kanban board với 3 trạng thái (TODO, DOING, DONE)
- Gán task cho thành viên nhóm
- Theo dõi tiến độ và deadline
- Báo cáo task quá hạn

### 💬 Giao tiếp Real-time
- Chat nhóm với WebSocket
- Collaborative whiteboard
- Thông báo real-time

### 📊 Hệ thống chấm điểm
- Tạo rubric với nhiều tiêu chí
- Chấm điểm có trọng số
- Báo cáo điểm chi tiết

### 📁 Quản lý file
- Upload/download tài liệu
- Hỗ trợ nhiều định dạng file
- Lưu trữ an toàn

## 🏗️ Kiến trúc hệ thống

### Backend (Java Spring Boot)
```
Java-Cosre/
├── src/main/java/com/collabsphere/
│   ├── config/          # Cấu hình hệ thống
│   ├── controller/      # REST API Controllers
│   ├── service/         # Business logic
│   ├── repository/      # Data access layer
│   ├── entity/          # JPA Entities
│   ├── dto/             # Data Transfer Objects
│   └── security/        # JWT & Security config
├── docker-compose.yml   # Docker setup
└── Test/               # Test data & SQL scripts
```

### Frontend (React + Vite)
```
FE-COSRE/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   │   ├── admin/      # Admin interface
│   │   ├── lecturer/   # Lecturer interface
│   │   └── student/    # Student interface
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   └── config/         # App configuration
└── public/             # Static assets
```

## 🛠️ Tech Stack

### Backend
- **Java 17** - Programming language
- **Spring Boot 3.2.0** - Application framework
- **Spring Security 6** - Authentication & Authorization
- **Spring Data JPA** - ORM framework
- **Spring WebSocket** - Real-time communication
- **MySQL 8.0** - Primary database
- **H2 Database** - Development/testing
- **JWT** - Token-based authentication
- **Maven** - Build tool
- **Docker** - Containerization

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Ant Design** - UI component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **SockJS + STOMP** - WebSocket client
- **Liveblocks** - Real-time collaboration
- **TLDraw** - Whiteboard component

## 🚀 Cài đặt và chạy

### Yêu cầu hệ thống
- **Java 17+**
- **Node.js 18+**
- **MySQL 8.0+**
- **Maven 3.6+**
- **Docker** (optional)

### Cách 1: Chạy với Docker (Khuyến nghị)

1. **Clone repository:**
```bash
git clone <repository-url>
cd CollabSphere
```

2. **Chạy với Docker Compose:**
```bash
cd Java-Cosre
docker-compose up -d
```

Hệ thống sẽ khởi động với:
- Backend API: http://localhost:8080/api
- MySQL Database: localhost:3306
- phpMyAdmin: http://localhost:8081

### Cách 2: Chạy thủ công

#### Backend Setup

1. **Tạo database:**
```sql
CREATE DATABASE collabsphere_db;
CREATE USER 'collabsphere'@'localhost' IDENTIFIED BY 'collabsphere123';
GRANT ALL PRIVILEGES ON collabsphere_db.* TO 'collabsphere'@'localhost';
```

2. **Cấu hình database trong `application.properties`:**
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/collabsphere_db
spring.datasource.username=collabsphere
spring.datasource.password=collabsphere123
```

3. **Chạy backend:**
```bash
cd Java-Cosre
mvn spring-boot:run
```

#### Frontend Setup

1. **Cài đặt dependencies:**
```bash
cd FE-COSRE
npm install
```

2. **Chạy development server:**
```bash
npm run dev
```

Frontend sẽ chạy tại: http://localhost:5173

### Kiểm tra hệ thống

- **Backend Health Check:** http://localhost:8080/api/health
- **Database Test:** http://localhost:8080/api/database/test

## 📖 API Documentation

Hệ thống cung cấp RESTful API đầy đủ với các endpoint chính:

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `GET /api/auth/me` - Thông tin user hiện tại

### User Management
- `GET /api/admin/users` - Danh sách người dùng
- `POST /api/admin/users` - Tạo người dùng mới
- `PUT /api/admin/users/{id}` - Cập nhật thông tin

### Project Management
- `GET /api/projects` - Danh sách dự án
- `POST /api/projects` - Tạo dự án mới
- `PUT /api/projects/{id}/approve` - Phê duyệt dự án

### Team & Task Management
- `GET /api/teams/my` - Nhóm của tôi
- `GET /api/tasks/my` - Task của tôi
- `PUT /api/tasks/{id}/status` - Cập nhật trạng thái task

### Real-time Communication
- WebSocket endpoint: `ws://localhost:8080/ws`
- Chat: `/app/chat/{teamId}`
- Whiteboard: `/app/whiteboard/{teamId}`

Chi tiết đầy đủ tại: [FRONTEND_API_DOCUMENTATION.md](Java-Cosre/FRONTEND_API_DOCUMENTATION.md)

## 🔐 Authentication & Security

### JWT Token
- Thời gian sống: 24 giờ
- Header format: `Authorization: Bearer <token>`
- Auto-refresh: Chưa implement (user cần đăng nhập lại)

### Role-based Access Control
```
ADMIN > HEAD_DEPARTMENT > LECTURER > STAFF > STUDENT
```

### CORS Configuration
- Allowed origins: `http://localhost:3000`, `http://localhost:5173`
- Credentials: Enabled
- Methods: GET, POST, PUT, DELETE, OPTIONS

## 📊 Database Schema

### Core Entities
- **User**: Thông tin người dùng và vai trò
- **ClassRoom**: Lớp học và sinh viên
- **Project**: Dự án và trạng thái phê duyệt
- **Team**: Nhóm sinh viên trong dự án
- **Task**: Công việc và trạng thái
- **Message**: Tin nhắn chat nhóm
- **Rubric**: Tiêu chí chấm điểm
- **Submission**: Bài nộp và điểm số

### Relationships
- User ↔ ClassRoom (Many-to-Many)
- Project ↔ ClassRoom (Many-to-One)
- Team ↔ Project (Many-to-One)
- User ↔ Team (Many-to-Many)
- Task ↔ Team (Many-to-One)

## 🧪 Testing

### Test Data
Hệ thống cung cấp test data đầy đủ trong thư mục `Java-Cosre/Test/`:
- 50+ users với các role khác nhau
- 10+ lớp học với sinh viên
- Dự án mẫu với nhóm và task
- Dữ liệu chat và whiteboard

### Load Test Data
```bash
# Với Docker
docker-compose up -d  # Test data tự động load

# Thủ công
mysql -u root -p collabsphere_db < Java-Cosre/Test/database-setup.sql
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/collabsphere_db
SPRING_DATASOURCE_USERNAME=collabsphere
SPRING_DATASOURCE_PASSWORD=collabsphere123

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=86400000

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Application Profiles
- `application.properties` - Production config
- `application-dev.properties` - Development config
- `application-h2.properties` - H2 database config
- `application-test.properties` - Test config

## 📱 Frontend Features

### Student Interface
- Dashboard với thống kê task và nhóm
- Quản lý dự án và nhóm
- Kanban board cho task management
- Team chat với emoji support
- Collaborative whiteboard
- Xem điểm và feedback

### Lecturer Interface
- Quản lý lớp học và sinh viên
- Tạo và phê duyệt dự án
- Tự động chia nhóm
- Chấm điểm với rubric
- Theo dõi tiến độ nhóm

### Admin Interface
- Quản lý người dùng toàn hệ thống
- Thống kê và báo cáo
- Import dữ liệu từ Excel
- Cấu hình hệ thống

## 🚀 Deployment

### Production Deployment
1. **Build backend:**
```bash
cd Java-Cosre
mvn clean package -DskipTests
```

2. **Build frontend:**
```bash
cd FE-COSRE
npm run build
```

3. **Deploy với Docker:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Setup
- **Development**: H2 database, debug logging
- **Production**: MySQL, optimized settings
- **Testing**: In-memory database, test profiles

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Tạo Pull Request

## 📄 License

Dự án này được phát triển cho mục đích giáo dục và nghiên cứu.

## 📞 Support

- **Documentation**: [API Docs](Java-Cosre/FRONTEND_API_DOCUMENTATION.md)
- **Issues**: Tạo issue trên GitHub
- **Email**: support@collabsphere.edu.vn

---

**Phiên bản:** 1.0.0  
**Cập nhật cuối:** November 2024  
**Tác giả:** CollabSphere Development Team
# CollabSphere Database Setup

## Cấu trúc Database

Database `collabsphere_db` bao gồm các bảng chính:

### Core Tables
- **users** - Quản lý người dùng (Admin, Lecturer, Student)
- **classrooms** - Lớp học
- **projects** - Dự án trong lớp
- **milestones** - Cột mốc của dự án
- **teams** - Nhóm làm việc
- **tasks** - Công việc của nhóm
- **submissions** - Bài nộp
- **messages** - Tin nhắn trong nhóm

### Junction Tables (Many-to-Many)
- **classroom_students** - Sinh viên trong lớp
- **team_members** - Thành viên trong nhóm

## Scripts Available

### 1. database-setup.sql
Tạo database, tables và indexes
```bash
mysql -u root -p < database-setup.sql
```

### 2. sample-data.sql
Insert dữ liệu mẫu để test
```bash
mysql -u root -p < sample-data.sql
```

### 3. reset-database.sql
Xóa tất cả dữ liệu và reset auto increment
```bash
mysql -u root -p < reset-database.sql
```

### 4. check-database.sql
Kiểm tra cấu trúc và dữ liệu
```bash
mysql -u root -p < check-database.sql
```

## Thiết lập từng bước

### Bước 1: Tạo Database và Tables
```bash
mysql -u root -p
source database-setup.sql
```

### Bước 2: Insert dữ liệu mẫu (tùy chọn)
```bash
source sample-data.sql
```

### Bước 3: Kiểm tra
```bash
source check-database.sql
```

## Dữ liệu mẫu

### Users
- **Admin**: admin@collabsphere.com
- **Lecturers**: lecturer1@university.edu, lecturer2@university.edu  
- **Students**: student1-4@student.edu

### Password mặc định
Tất cả accounts có password: `password` (đã hash với BCrypt)

### Sample Classes
- **SE2024** - Software Engineering (4 students)
- **DB2024** - Database Systems (2 students)
- **WEB2024** - Web Development (2 students)

### Sample Projects
- E-commerce Website (SE2024)
- Library Management System (DB2024)
- Portfolio Website (WEB2024)

## Indexes

Database được tối ưu với các indexes:
- Email, role cho users
- Code, lecturer cho classrooms
- Classroom, deadline cho projects
- Team, assignee, status, due_date cho tasks
- Timestamp cho messages

## Foreign Key Constraints

Tất cả quan hệ được bảo vệ bằng foreign keys:
- CASCADE DELETE cho quan hệ parent-child
- SET NULL cho quan hệ optional (như assignee)

## Notes

- Sử dụng UTF8MB4 encoding để hỗ trợ emoji và ký tự đặc biệt
- Timestamps tự động cập nhật với created_at/updated_at
- Enum values cho role và task status
- Unique constraints cho email và classroom code
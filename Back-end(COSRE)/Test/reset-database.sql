-- Script để reset database CollabSphere
USE collabsphere_db;

-- Tắt foreign key checks để xóa dữ liệu
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa tất cả dữ liệu từ các bảng
TRUNCATE TABLE messages;
TRUNCATE TABLE submissions;
TRUNCATE TABLE tasks;
TRUNCATE TABLE team_members;
TRUNCATE TABLE teams;
TRUNCATE TABLE milestones;
TRUNCATE TABLE projects;
TRUNCATE TABLE classroom_students;
TRUNCATE TABLE classrooms;
TRUNCATE TABLE users;

-- Bật lại foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE classrooms AUTO_INCREMENT = 1;
ALTER TABLE projects AUTO_INCREMENT = 1;
ALTER TABLE milestones AUTO_INCREMENT = 1;
ALTER TABLE teams AUTO_INCREMENT = 1;
ALTER TABLE tasks AUTO_INCREMENT = 1;
ALTER TABLE submissions AUTO_INCREMENT = 1;
ALTER TABLE messages AUTO_INCREMENT = 1;

SELECT 'Database reset completed successfully!' as Status;
-- Script kiểm tra database CollabSphere
USE collabsphere_db;

-- Kiểm tra các bảng đã được tạo
SELECT 'Checking tables...' as Status;
SHOW TABLES;

-- Kiểm tra cấu trúc các bảng chính
SELECT 'Users table structure:' as Info;
DESCRIBE users;

SELECT 'Classrooms table structure:' as Info;
DESCRIBE classrooms;

SELECT 'Projects table structure:' as Info;
DESCRIBE projects;

SELECT 'Teams table structure:' as Info;
DESCRIBE teams;

SELECT 'Tasks table structure:' as Info;
DESCRIBE tasks;

-- Kiểm tra dữ liệu mẫu
SELECT 'Data summary:' as Info;
SELECT 
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM classrooms) as total_classrooms,
    (SELECT COUNT(*) FROM projects) as total_projects,
    (SELECT COUNT(*) FROM teams) as total_teams,
    (SELECT COUNT(*) FROM tasks) as total_tasks,
    (SELECT COUNT(*) FROM messages) as total_messages;

-- Kiểm tra quan hệ dữ liệu
SELECT 'Sample data check:' as Info;
SELECT 
    u.full_name as lecturer,
    c.name as classroom,
    c.code,
    (SELECT COUNT(*) FROM classroom_students cs WHERE cs.classroom_id = c.id) as student_count
FROM classrooms c
JOIN users u ON c.lecturer_id = u.id;

SELECT 'Projects and teams:' as Info;
SELECT 
    p.title as project,
    c.name as classroom,
    (SELECT COUNT(*) FROM teams t WHERE t.project_id = p.id) as team_count,
    (SELECT COUNT(*) FROM milestones m WHERE m.project_id = p.id) as milestone_count
FROM projects p
JOIN classrooms c ON p.classroom_id = c.id;
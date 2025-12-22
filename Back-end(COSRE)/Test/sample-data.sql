-- Sample data cho CollabSphere
USE collabsphere_db;

-- Insert sample users
INSERT INTO users (email, password, full_name, role, active) VALUES
('admin@collabsphere.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Admin', 'ADMIN', TRUE),
('lecturer1@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Nguyen Van A', 'LECTURER', TRUE),
('lecturer2@university.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dr. Tran Thi B', 'LECTURER', TRUE),
('student1@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Le Van C', 'STUDENT', TRUE),
('student2@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pham Thi D', 'STUDENT', TRUE),
('student3@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hoang Van E', 'STUDENT', TRUE),
('student4@student.edu', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Vu Thi F', 'STUDENT', TRUE);

-- Insert sample classrooms
INSERT INTO classrooms (name, code, lecturer_id) VALUES
('Software Engineering 2024', 'SE2024', 2),
('Database Systems', 'DB2024', 2),
('Web Development', 'WEB2024', 3);

-- Insert classroom students
INSERT INTO classroom_students (classroom_id, student_id) VALUES
(1, 4), (1, 5), (1, 6), (1, 7),  -- SE2024 class
(2, 4), (2, 6),                   -- DB2024 class
(3, 5), (3, 7);                   -- WEB2024 class

-- Insert sample projects
INSERT INTO projects (title, description, deadline, classroom_id) VALUES
('E-commerce Website', 'Build a full-stack e-commerce website with user authentication, product catalog, and payment integration', '2024-12-31 23:59:59', 1),
('Library Management System', 'Design and implement a database system for library management', '2024-11-30 23:59:59', 2),
('Portfolio Website', 'Create a responsive portfolio website using modern web technologies', '2024-10-31 23:59:59', 3);

-- Insert sample milestones
INSERT INTO milestones (title, due_date, project_id) VALUES
('Project Proposal', '2024-09-15 23:59:59', 1),
('Database Design', '2024-10-01 23:59:59', 1),
('Backend API', '2024-11-01 23:59:59', 1),
('Frontend Implementation', '2024-11-15 23:59:59', 1),
('Final Presentation', '2024-12-31 23:59:59', 1),
('ER Diagram', '2024-09-30 23:59:59', 2),
('Database Implementation', '2024-10-31 23:59:59', 2),
('Query Optimization', '2024-11-30 23:59:59', 2),
('Design Mockup', '2024-09-20 23:59:59', 3),
('Responsive Layout', '2024-10-15 23:59:59', 3),
('Final Deployment', '2024-10-31 23:59:59', 3);

-- Insert sample teams
INSERT INTO teams (name, project_id) VALUES
('Team Alpha', 1),
('Team Beta', 1),
('Database Masters', 2),
('Web Wizards', 3);

-- Insert team members
INSERT INTO team_members (team_id, user_id) VALUES
(1, 4), (1, 5),  -- Team Alpha
(2, 6), (2, 7),  -- Team Beta
(3, 4), (3, 6),  -- Database Masters
(4, 5), (4, 7);  -- Web Wizards

-- Insert sample tasks
INSERT INTO tasks (title, description, status, priority, due_date, team_id, assignee_id) VALUES
('Setup Project Repository', 'Create GitHub repository and setup initial project structure', 'DONE', 1, '2024-09-10 17:00:00', 1, 4),
('Design Database Schema', 'Create ER diagram and design database tables', 'DOING', 2, '2024-09-25 17:00:00', 1, 5),
('Implement User Authentication', 'Setup JWT authentication system', 'TODO', 3, '2024-10-05 17:00:00', 1, 4),
('Create Product Catalog API', 'Develop REST APIs for product management', 'TODO', 2, '2024-10-15 17:00:00', 1, 5),
('Setup Frontend Framework', 'Initialize React.js project with routing', 'DONE', 1, '2024-09-12 17:00:00', 2, 6),
('Design UI Components', 'Create reusable UI components', 'DOING', 2, '2024-09-28 17:00:00', 2, 7),
('Implement Shopping Cart', 'Add shopping cart functionality', 'TODO', 3, '2024-10-20 17:00:00', 2, 6);

-- Insert sample submissions
INSERT INTO submissions (link, milestone_id, team_id) VALUES
('https://github.com/team-alpha/ecommerce-proposal', 1, 1),
('https://github.com/team-beta/ecommerce-proposal', 1, 2),
('https://drive.google.com/file/d/sample-er-diagram', 6, 3),
('https://figma.com/design/portfolio-mockup', 9, 4);

-- Insert sample messages
INSERT INTO messages (content, sender_id, team_id) VALUES
('Hello team! Let\'s start working on our project proposal.', 4, 1),
('I\'ve created the GitHub repository. Please check your email for the invitation.', 4, 1),
('Great! I\'ll start working on the database design.', 5, 1),
('Should we use MySQL or PostgreSQL for our database?', 5, 1),
('I think MySQL would be fine for our project scope.', 4, 1),
('Hi everyone! I\'ve setup the React project structure.', 6, 2),
('Perfect! I\'ll start designing the UI components.', 7, 2),
('Let\'s have a meeting tomorrow to discuss the ER diagram.', 4, 3),
('I\'ve uploaded the initial mockup to Figma. Please review!', 5, 4);
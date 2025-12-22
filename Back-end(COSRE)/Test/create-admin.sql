-- Create admin user directly in database
INSERT INTO users (email, password, full_name, role, active) VALUES 
('admin@collabsphere.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Admin', 'ADMIN', true);

-- Create a lecturer user
INSERT INTO users (email, password, full_name, role, active) VALUES 
('lecturer@collabsphere.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Test Lecturer', 'LECTURER', true);

-- Password for both users is: password
-- Insert sample teachers with bcrypt hashed password 'password123'
INSERT INTO users (username, password, role) VALUES
('teacher1', '$2a$10$LNm4E7XPrq2yICOj2jfkru8JFZGYpp7Y/pComt0N2cX5n.aKU9Uj2', 'teacher');

-- Insert sample students with bcrypt hashed password 'password123'
INSERT INTO users (username, password, role) VALUES
('student1', '$2a$10$LNm4E7XPrq2yICOj2jfkru8JFZGYpp7Y/pComt0N2cX5n.aKU9Uj2', 'student'),
('student2', '$2a$10$LNm4E7XPrq2yICOj2jfkru8JFZGYpp7Y/pComt0N2cX5n.aKU9Uj2', 'student'),
('student3', '$2a$10$LNm4E7XPrq2yICOj2jfkru8JFZGYpp7Y/pComt0N2cX5n.aKU9Uj2', 'student');

-- Insert sample journals with proper timestamps
INSERT INTO journals (title, description, teacher_id, created_at, published_at) VALUES
('Math Class - Algebra', 'Introduction to algebraic expressions', 1, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('Science Experiment', 'Chemical reactions lab session', 1, CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('Computer Class', 'Learning about algorithms', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 day');  -- future journal

-- Tag students in journals
-- Math Class: student1 and student2
INSERT INTO journal_students (journal_id, student_id) VALUES 
(1, 2), -- student1
(1, 3); -- student2

-- Science Experiment: all students
INSERT INTO journal_students (journal_id, student_id) VALUES 
(2, 2), -- student1
(2, 3), -- student2
(2, 4); -- student3

-- Computer Class: student2 and student3
INSERT INTO journal_students (journal_id, student_id) VALUES 
(3, 3), -- student2
(3, 4); -- student3

-- Add sample attachments with different types
INSERT INTO attachments (journal_id, type, url) VALUES
-- Math Class attachments
(1, 'pdf', '/uploads/algebra_notes.pdf'),
(1, 'url', 'https://www.khanacademy.org/math/algebra'),

-- Science Experiment attachments
(2, 'image', '/uploads/experiment_photo.jpg'),
(2, 'video', '/uploads/reaction_video.mp4'),
(2, 'pdf', '/uploads/lab_instructions.pdf'),

-- Computer Class attachments
(3, 'url', 'https://www.codecademy.com/learn/algorithms'),
(3, 'pdf', '/uploads/algorithm_slides.pdf');
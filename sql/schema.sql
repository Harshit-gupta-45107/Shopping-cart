CREATE TYPE user_role AS ENUM ('teacher', 'student');
CREATE TYPE attachment_type AS ENUM ('image', 'video', 'url', 'pdf');

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journals table
CREATE TABLE journals (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    teacher_id INTEGER NOT NULL REFERENCES users(id),
    published_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attachments table
CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    journal_id INTEGER NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    type attachment_type NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Journal-Student relation (for tagging students in journals)
CREATE TABLE journal_students (
    journal_id INTEGER NOT NULL REFERENCES journals(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id),
    PRIMARY KEY (journal_id, student_id)
);

-- Add indexes for common query patterns
CREATE INDEX idx_journals_teacher_id ON journals(teacher_id);
CREATE INDEX idx_journals_published_at ON journals(published_at);
CREATE INDEX idx_attachments_journal_id ON attachments(journal_id);
CREATE INDEX idx_journal_students_student_id ON journal_students(student_id);
CREATE INDEX idx_journal_students_journal_id ON journal_students(journal_id);

-- Notifications table
CREATE TYPE notification_type AS ENUM ('journal_tag', 'journal_publish', 'journal_update');
CREATE TYPE notification_status AS ENUM ('unread', 'read');

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    related_journal_id INTEGER REFERENCES journals(id) ON DELETE CASCADE,
    status notification_status DEFAULT 'unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
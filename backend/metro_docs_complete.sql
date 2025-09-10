-- =====================================================
-- MetroDocs Complete Database Schema
-- Automated Task & Document Intelligence System
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS metro_docs_db;
USE metro_docs_db;

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'ENGINEER', 'SUB_DIV_OFFICER', 'DEPOT_MANAGER', 'OTHER') NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. DOCUMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS documents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(500) NOT NULL,
    file_url VARCHAR(1000),
    text LONGTEXT,
    file_type VARCHAR(100),
    file_size BIGINT,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_created_by (created_by),
    INDEX idx_created_at (created_at),
    INDEX idx_title (title(100)),
    FULLTEXT idx_text_search (title, text)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. SUMMARIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS summaries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    summary_en TEXT,
    summary_ml TEXT,
    key_points_json JSON,
    confidence_score DECIMAL(3,2) DEFAULT 0.00,
    processing_time_ms INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_document_id (document_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. TASKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    document_id INT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description_en TEXT,
    description_ml TEXT,
    due_date DATE,
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED', 'CANCELLED') DEFAULT 'PENDING',
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_document_id (document_id),
    INDEX idx_status (status),
    INDEX idx_due_date (due_date),
    INDEX idx_priority (priority),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. TASK ASSIGNMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS task_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    assignee_role ENUM('ENGINEER', 'SUB_DIV_OFFICER', 'DEPOT_MANAGER', 'OTHER') NOT NULL,
    assignee_user_id INT NULL,
    assigned_by INT NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_primary BOOLEAN DEFAULT TRUE,
    
    -- Foreign key constraints
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (assignee_user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_task_id (task_id),
    INDEX idx_assignee_role (assignee_role),
    INDEX idx_assignee_user_id (assignee_user_id),
    INDEX idx_assigned_by (assigned_by),
    UNIQUE KEY unique_primary_assignment (task_id, is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. TASK UPDATES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS task_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_id INT NOT NULL,
    updated_by INT NOT NULL,
    notes TEXT,
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED', 'CANCELLED') NOT NULL,
    progress_percentage INT DEFAULT 0,
    hours_logged DECIMAL(5,2) DEFAULT 0.00,
    attachments JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_task_id (task_id),
    INDEX idx_updated_by (updated_by),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    action VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    entity_type VARCHAR(100),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_id (entity_id),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 8. NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    related_entity_type VARCHAR(100),
    related_entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 9. SYSTEM SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(255) UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type ENUM('STRING', 'NUMBER', 'BOOLEAN', 'JSON') DEFAULT 'STRING',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_setting_key (setting_key),
    INDEX idx_is_public (is_public)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 10. FILE ATTACHMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS file_attachments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1000) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    uploaded_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Indexes for performance
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert default admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES 
('System Administrator', 'admin@metro-docs.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2e', 'ADMIN');

-- Insert sample users
INSERT INTO users (name, email, password_hash, role) VALUES 
('John Engineer', 'john.engineer@metro-docs.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2e', 'ENGINEER'),
('Sarah Officer', 'sarah.officer@metro-docs.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2e', 'SUB_DIV_OFFICER'),
('Mike Manager', 'mike.manager@metro-docs.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2e', 'DEPOT_MANAGER'),
('Lisa Technician', 'lisa.tech@metro-docs.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2e', 'OTHER');

-- Insert sample documents
INSERT INTO documents (title, text, created_by) VALUES 
('Metro Line 1 Maintenance Report', 'The metro line 1 requires immediate attention for track maintenance. Several sections show signs of wear and need replacement. Electrical systems are functioning normally but require routine inspection.', 1),
('Safety Protocol Update', 'New safety protocols have been implemented for all metro operations. All staff must complete the updated training module by the end of the month. Emergency procedures have been revised.', 1),
('Station Renovation Plan', 'Station renovation project for Central Station is scheduled to begin next month. The project includes platform upgrades, new ticketing systems, and accessibility improvements.', 1);

-- Insert sample summaries
INSERT INTO summaries (document_id, summary_en, summary_ml, key_points_json, confidence_score) VALUES 
(1, 'Metro Line 1 requires track maintenance with electrical systems functioning normally.', 'മെട്രോ ലൈൻ 1 ന് ട്രാക്ക് പരിപാലനം ആവശ്യമാണ്, ഇലക്ട്രിക്കൽ സിസ്റ്റങ്ങൾ സാധാരണമായി പ്രവർത്തിക്കുന്നു.', '["Track maintenance required", "Electrical systems normal", "Wear signs detected"]', 0.95),
(2, 'New safety protocols implemented with mandatory training completion by month end.', 'പുതിയ സുരക്ഷാ നടപടികൾ നടപ്പിലാക്കി, മാസാവസാനത്തോടെ നിർബന്ധിത പരിശീലനം പൂർത്തിയാക്കണം.', '["Safety protocols updated", "Training mandatory", "Emergency procedures revised"]', 0.88);

-- Insert sample tasks
INSERT INTO tasks (document_id, title, description_en, due_date, priority, status) VALUES 
(1, 'Track Maintenance - Section A', 'Replace worn tracks in section A of Metro Line 1', '2024-02-15', 'HIGH', 'PENDING'),
(1, 'Electrical System Inspection', 'Routine inspection of electrical systems on Metro Line 1', '2024-02-10', 'MEDIUM', 'IN_PROGRESS'),
(2, 'Safety Training Completion', 'Complete updated safety training module for all staff', '2024-01-31', 'HIGH', 'PENDING'),
(3, 'Station Renovation Planning', 'Finalize renovation plans for Central Station', '2024-02-20', 'MEDIUM', 'PENDING');

-- Insert sample task assignments
INSERT INTO task_assignments (task_id, assignee_role, assignee_user_id, assigned_by) VALUES 
(1, 'ENGINEER', 2, 1),
(2, 'ENGINEER', 2, 1),
(3, 'SUB_DIV_OFFICER', 3, 1),
(4, 'DEPOT_MANAGER', 4, 1);

-- Insert sample task updates
INSERT INTO task_updates (task_id, updated_by, notes, status, progress_percentage) VALUES 
(2, 2, 'Started electrical inspection. Found minor issues in control panel 3.', 'IN_PROGRESS', 25),
(1, 2, 'Preparing materials and tools for track replacement.', 'PENDING', 10);

-- Insert sample audit logs
INSERT INTO audit_logs (action, user_id, entity_type, entity_id, details, ip_address) VALUES 
('USER_LOGIN', 1, 'user', 1, '{"login_time": "2024-01-15T10:30:00Z"}', '192.168.1.100'),
('DOCUMENT_CREATED', 1, 'document', 1, '{"title": "Metro Line 1 Maintenance Report"}', '192.168.1.100'),
('TASK_ASSIGNED', 1, 'task', 1, '{"assignee": "John Engineer", "role": "ENGINEER"}', '192.168.1.100');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id) VALUES 
(2, 'New Task Assigned', 'You have been assigned a new task: Track Maintenance - Section A', 'INFO', 'task', 1),
(3, 'Training Reminder', 'Safety training must be completed by January 31st', 'WARNING', 'task', 3),
(4, 'Project Update', 'Station renovation planning task is now available', 'INFO', 'task', 4);

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES 
('app_name', 'MetroDocs', 'STRING', 'Application name', TRUE),
('max_file_size', '10485760', 'NUMBER', 'Maximum file upload size in bytes (10MB)', FALSE),
('task_auto_escalate_days', '7', 'NUMBER', 'Days after which tasks auto-escalate', FALSE),
('notification_retention_days', '30', 'NUMBER', 'Days to retain notifications', FALSE),
('ai_processing_enabled', 'true', 'BOOLEAN', 'Enable AI document processing', FALSE);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for task details with assignments
CREATE OR REPLACE VIEW task_details AS
SELECT 
    t.id,
    t.title,
    t.description_en,
    t.description_ml,
    t.due_date,
    t.priority,
    t.status,
    t.estimated_hours,
    t.actual_hours,
    t.created_at,
    t.updated_at,
    d.title as document_title,
    d.id as document_id,
    ta.assignee_role,
    ta.assignee_user_id,
    u.name as assignee_name,
    u.email as assignee_email,
    creator.name as created_by_name,
    DATEDIFF(t.due_date, CURDATE()) as days_until_due,
    CASE 
        WHEN t.due_date < CURDATE() AND t.status NOT IN ('COMPLETED', 'CANCELLED') THEN TRUE 
        ELSE FALSE 
    END as is_overdue
FROM tasks t
LEFT JOIN documents d ON t.document_id = d.id
LEFT JOIN task_assignments ta ON t.id = ta.task_id AND ta.is_primary = TRUE
LEFT JOIN users u ON ta.assignee_user_id = u.id
LEFT JOIN users creator ON d.created_by = creator.id;

-- View for user activity summary
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.is_active,
    COUNT(DISTINCT t.id) as total_tasks_assigned,
    COUNT(DISTINCT CASE WHEN t.status = 'COMPLETED' THEN t.id END) as completed_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'IN_PROGRESS' THEN t.id END) as in_progress_tasks,
    COUNT(DISTINCT CASE WHEN t.status = 'ESCALATED' THEN t.id END) as escalated_tasks,
    COUNT(DISTINCT al.id) as total_activities,
    MAX(al.timestamp) as last_activity
FROM users u
LEFT JOIN task_assignments ta ON u.id = ta.assignee_user_id
LEFT JOIN tasks t ON ta.task_id = t.id
LEFT JOIN audit_logs al ON u.id = al.user_id
GROUP BY u.id, u.name, u.email, u.role, u.is_active;

-- View for document processing status
CREATE OR REPLACE VIEW document_processing_status AS
SELECT 
    d.id,
    d.title,
    d.created_at,
    u.name as created_by_name,
    CASE 
        WHEN s.id IS NOT NULL THEN 'PROCESSED'
        ELSE 'PENDING'
    END as processing_status,
    s.confidence_score,
    COUNT(t.id) as tasks_generated,
    COUNT(CASE WHEN t.status = 'COMPLETED' THEN t.id END) as completed_tasks
FROM documents d
LEFT JOIN users u ON d.created_by = u.id
LEFT JOIN summaries s ON d.id = s.document_id
LEFT JOIN tasks t ON d.id = t.document_id
GROUP BY d.id, d.title, d.created_at, u.name, s.id, s.confidence_score;

-- =====================================================
-- STORED PROCEDURES
-- =====================================================

DELIMITER //

-- Procedure to create audit log entry
CREATE PROCEDURE CreateAuditLog(
    IN p_action VARCHAR(255),
    IN p_user_id INT,
    IN p_entity_type VARCHAR(100),
    IN p_entity_id INT,
    IN p_details TEXT,
    IN p_ip_address VARCHAR(45)
)
BEGIN
    INSERT INTO audit_logs (action, user_id, entity_type, entity_id, details, ip_address)
    VALUES (p_action, p_user_id, p_entity_type, p_entity_id, p_details, p_ip_address);
END //

-- Procedure to update task status with audit
CREATE PROCEDURE UpdateTaskStatus(
    IN p_task_id INT,
    IN p_status VARCHAR(50),
    IN p_updated_by INT,
    IN p_notes TEXT,
    IN p_progress_percentage INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update task status
    UPDATE tasks 
    SET status = p_status, updated_at = CURRENT_TIMESTAMP
    WHERE id = p_task_id;
    
    -- Add task update record
    INSERT INTO task_updates (task_id, updated_by, notes, status, progress_percentage)
    VALUES (p_task_id, p_updated_by, p_notes, p_status, p_progress_percentage);
    
    -- Create audit log
    CALL CreateAuditLog('TASK_STATUS_UPDATED', p_updated_by, 'task', p_task_id, 
                       JSON_OBJECT('status', p_status, 'notes', p_notes), NULL);
    
    COMMIT;
END //

-- Procedure to get dashboard statistics
CREATE PROCEDURE GetDashboardStats(IN p_user_id INT)
BEGIN
    DECLARE user_role VARCHAR(50);
    
    -- Get user role
    SELECT role INTO user_role FROM users WHERE id = p_user_id;
    
    -- Return statistics based on user role
    IF user_role = 'ADMIN' THEN
        -- Admin sees all statistics
        SELECT 
            'admin' as user_type,
            (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as total_users,
            (SELECT COUNT(*) FROM documents) as total_documents,
            (SELECT COUNT(*) FROM tasks) as total_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'PENDING') as pending_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'IN_PROGRESS') as in_progress_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'COMPLETED') as completed_tasks,
            (SELECT COUNT(*) FROM tasks WHERE status = 'ESCALATED') as escalated_tasks,
            (SELECT COUNT(*) FROM tasks WHERE due_date < CURDATE() AND status NOT IN ('COMPLETED', 'CANCELLED')) as overdue_tasks;
    ELSE
        -- Other users see only their assigned tasks
        SELECT 
            'user' as user_type,
            (SELECT COUNT(*) FROM task_assignments ta 
             JOIN tasks t ON ta.task_id = t.id 
             WHERE ta.assignee_user_id = p_user_id) as total_tasks,
            (SELECT COUNT(*) FROM task_assignments ta 
             JOIN tasks t ON ta.task_id = t.id 
             WHERE ta.assignee_user_id = p_user_id AND t.status = 'PENDING') as pending_tasks,
            (SELECT COUNT(*) FROM task_assignments ta 
             JOIN tasks t ON ta.task_id = t.id 
             WHERE ta.assignee_user_id = p_user_id AND t.status = 'IN_PROGRESS') as in_progress_tasks,
            (SELECT COUNT(*) FROM task_assignments ta 
             JOIN tasks t ON ta.task_id = t.id 
             WHERE ta.assignee_user_id = p_user_id AND t.status = 'COMPLETED') as completed_tasks,
            (SELECT COUNT(*) FROM task_assignments ta 
             JOIN tasks t ON ta.task_id = t.id 
             WHERE ta.assignee_user_id = p_user_id AND t.status = 'ESCALATED') as escalated_tasks,
            (SELECT COUNT(*) FROM task_assignments ta 
             JOIN tasks t ON ta.task_id = t.id 
             WHERE ta.assignee_user_id = p_user_id AND t.due_date < CURDATE() AND t.status NOT IN ('COMPLETED', 'CANCELLED')) as overdue_tasks;
    END IF;
END //

DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to update task updated_at when task_updates are inserted
DELIMITER //
CREATE TRIGGER update_task_timestamp
AFTER INSERT ON task_updates
FOR EACH ROW
BEGIN
    UPDATE tasks 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE id = NEW.task_id;
END //
DELIMITER ;

-- Trigger to create notification when task is assigned
DELIMITER //
CREATE TRIGGER task_assignment_notification
AFTER INSERT ON task_assignments
FOR EACH ROW
BEGIN
    DECLARE task_title VARCHAR(500);
    DECLARE assignee_name VARCHAR(255);
    
    -- Get task title
    SELECT title INTO task_title FROM tasks WHERE id = NEW.task_id;
    
    -- Get assignee name
    SELECT name INTO assignee_name FROM users WHERE id = NEW.assignee_user_id;
    
    -- Create notification
    INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
    VALUES (NEW.assignee_user_id, 'New Task Assigned', 
            CONCAT('You have been assigned a new task: ', task_title), 
            'INFO', 'task', NEW.task_id);
END //
DELIMITER ;

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX idx_tasks_status_due_date ON tasks(status, due_date);
CREATE INDEX idx_tasks_document_status ON tasks(document_id, status);
CREATE INDEX idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_task_assignments_role_user ON task_assignments(assignee_role, assignee_user_id);

-- =====================================================
-- GRANTS AND PERMISSIONS
-- =====================================================

-- Create application user (replace with your actual credentials)
-- CREATE USER 'metro_docs_user'@'localhost' IDENTIFIED BY 'secure_password_here';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON metro_docs_db.* TO 'metro_docs_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE metro_docs_db.* TO 'metro_docs_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- MAINTENANCE QUERIES
-- =====================================================

-- Query to clean up old audit logs (run monthly)
-- DELETE FROM audit_logs WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Query to clean up old notifications (run weekly)
-- DELETE FROM notifications WHERE is_read = TRUE AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- Query to update task statistics
-- UPDATE tasks SET actual_hours = (
--     SELECT COALESCE(SUM(hours_logged), 0) 
--     FROM task_updates 
--     WHERE task_id = tasks.id
-- );

-- =====================================================
-- BACKUP AND RECOVERY QUERIES
-- =====================================================

-- Full database backup command (run from command line):
-- mysqldump -u root -p metro_docs_db > metro_docs_backup_$(date +%Y%m%d_%H%M%S).sql

-- Restore from backup:
-- mysql -u root -p metro_docs_db < metro_docs_backup_YYYYMMDD_HHMMSS.sql

-- =====================================================
-- END OF SCRIPT
-- =====================================================

-- Display completion message
SELECT 'MetroDocs database schema created successfully!' as message;
SELECT 'Default admin user: admin@metro-docs.com / admin123' as admin_info;
SELECT 'Please change the admin password after first login!' as security_note;

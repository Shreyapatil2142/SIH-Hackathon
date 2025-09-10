const mysql = require('mysql2/promise');
require('dotenv').config();

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'metro_docs_db',
        charset: 'utf8mb4'
      });
      console.log('Connected to MySQL database');
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  async initialize() {
    await this.connect();
    await this.createTables();
  }

  async createTables() {
    const tables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'ENGINEER', 'SUB_DIV_OFFICER', 'DEPOT_MANAGER', 'OTHER') NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Documents table
      `CREATE TABLE IF NOT EXISTS documents (
        id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(500) NOT NULL,
        file_url VARCHAR(1000),
        text LONGTEXT,
        created_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Summaries table
      `CREATE TABLE IF NOT EXISTS summaries (
        id INT PRIMARY KEY AUTO_INCREMENT,
        document_id INT NOT NULL,
        summary_en TEXT,
        summary_ml TEXT,
        key_points_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      )`,

      // Tasks table
      `CREATE TABLE IF NOT EXISTS tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        document_id INT NOT NULL,
        title VARCHAR(500) NOT NULL,
        description_en TEXT,
        description_ml TEXT,
        due_date DATE,
        status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED') DEFAULT 'PENDING',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
      )`,

      // Task assignments table
      `CREATE TABLE IF NOT EXISTS task_assignments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT NOT NULL,
        assignee_role ENUM('ENGINEER', 'SUB_DIV_OFFICER', 'DEPOT_MANAGER', 'OTHER') NOT NULL,
        assignee_user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (assignee_user_id) REFERENCES users(id) ON DELETE SET NULL
      )`,

      // Task updates table
      `CREATE TABLE IF NOT EXISTS task_updates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        task_id INT NOT NULL,
        updated_by INT NOT NULL,
        notes TEXT,
        status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'ESCALATED') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Audit logs table
      `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        action VARCHAR(255) NOT NULL,
        user_id INT NOT NULL,
        details TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,

      // Document categories table
      `CREATE TABLE IF NOT EXISTS document_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#3B82F6',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Document tags table
      `CREATE TABLE IF NOT EXISTS document_tags (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#6B7280',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,

      // Document-category relationships
      `CREATE TABLE IF NOT EXISTS document_category_relations (
        document_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (document_id, category_id),
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES document_categories(id) ON DELETE CASCADE
      )`,

      // Document-tag relationships
      `CREATE TABLE IF NOT EXISTS document_tag_relations (
        document_id INT NOT NULL,
        tag_id INT NOT NULL,
        PRIMARY KEY (document_id, tag_id),
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES document_tags(id) ON DELETE CASCADE
      )`,

      // File attachments table
      `CREATE TABLE IF NOT EXISTS file_attachments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        document_id INT NOT NULL,
        original_name VARCHAR(500) NOT NULL,
        file_name VARCHAR(500) NOT NULL,
        file_path VARCHAR(1000) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        uploaded_by INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
      )`
    ];

    for (const table of tables) {
      try {
        await this.connection.execute(table);
      } catch (error) {
        console.error('Error creating table:', error);
        throw error;
      }
    }

    console.log('Database tables created/verified successfully');
  }

  async query(sql, params = []) {
    try {
      // Ensure connection is available
      if (!this.connection) {
        await this.connect();
      }
      
      // Handle transaction commands that don't support prepared statements
      if (sql.trim().toUpperCase().startsWith('START TRANSACTION') || 
          sql.trim().toUpperCase().startsWith('COMMIT') || 
          sql.trim().toUpperCase().startsWith('ROLLBACK')) {
        await this.connection.query(sql);
        return [];
      }
      
      const [rows] = await this.connection.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      // If connection is lost, try to reconnect
      if (error.code === 'PROTOCOL_CONNECTION_LOST' || error.code === 'ECONNRESET') {
        console.log('Connection lost, attempting to reconnect...');
        await this.connect();
        const [rows] = await this.connection.execute(sql, params);
        return rows;
      }
      throw error;
    }
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }
}

const db = new Database();
module.exports = db;

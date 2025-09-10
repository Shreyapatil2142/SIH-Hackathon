const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  let connection;
  
  try {
    // Connect to MySQL server (without specific database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      charset: 'utf8mb4'
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'metro_docs_db';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created/verified`);

    // Close current connection and reconnect to specific database
    await connection.end();
    
    // Reconnect to the specific database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'root',
      database: dbName,
      charset: 'utf8mb4'
    });
    
    console.log(`Connected to database '${dbName}'`);

    // Create tables
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
      )`
    ];

    for (const table of tables) {
      await connection.execute(table);
    }

    console.log('All tables created/verified successfully');

    // Create default admin user if no users exist
    const users = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (users[0][0].count === 0) {
      const bcrypt = require('bcrypt');
      const adminPassword = await bcrypt.hash('admin123', 12);
      
      await connection.execute(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['System Administrator', 'admin@metro-docs.com', adminPassword, 'ADMIN']
      );
      
      console.log('Default admin user created:');
      console.log('Email: admin@metro-docs.com');
      console.log('Password: admin123');
      console.log('Please change the password after first login!');
    }

    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization if this script is executed directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;

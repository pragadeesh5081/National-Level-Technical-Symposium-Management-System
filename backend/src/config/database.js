// Database configuration using mysql2
const mysql = require('mysql2/promise');
require('dotenv').config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'symposium_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Database migrations for multi-tenant isolation
const migrateDatabase = async () => {
  try {
    const connection = await pool.getConnection();
    
    // Check if admin_id exists in Participant table
    const [cols] = await connection.query("SHOW COLUMNS FROM Participant LIKE 'admin_id'");
    if (cols.length === 0) {
      console.log('Running multi-tenant migrations...');
      
      // Add admin_id to core tables
      await connection.query('ALTER TABLE Participant ADD COLUMN admin_id INT NOT NULL DEFAULT 1');
      await connection.query('ALTER TABLE Event ADD COLUMN admin_id INT NOT NULL DEFAULT 1');
      await connection.query('ALTER TABLE Coordinator ADD COLUMN admin_id INT NOT NULL DEFAULT 1');
      await connection.query('ALTER TABLE Registration ADD COLUMN admin_id INT NOT NULL DEFAULT 1');
      await connection.query('ALTER TABLE Event_Assignment ADD COLUMN admin_id INT NOT NULL DEFAULT 1');
      
      // Update unique constraint on event_name to allow different admins to have same event name
      try {
        await connection.query('ALTER TABLE Event DROP INDEX event_name');
        await connection.query('ALTER TABLE Event ADD UNIQUE (admin_id, event_name)');
      } catch (e) {
        // Index might not exist or already updated
      }
      
      console.log('Multi-tenant migrations completed');
    }
    
    connection.release();
  } catch (error) {
    console.error('Database migration failed:', error.message);
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    
    // Run migrations
    await migrateDatabase();
    
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};

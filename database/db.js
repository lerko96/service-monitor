const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.dirname(process.env.DB_PATH || './database/service-monitor.db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection
const db = new sqlite3.Database(
  process.env.DB_PATH || './database/service-monitor.db',
  (err) => {
    if (err) {
      console.error('Error connecting to database:', err);
    } else {
      console.log('Connected to SQLite database');
      initDatabase();
    }
  }
);

// Initialize database schema
function initDatabase() {
  const schema = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Services table
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      url TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Service checks table
    CREATE TABLE IF NOT EXISTS service_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_id INTEGER NOT NULL,
      status_code INTEGER,
      response_time INTEGER,
      is_up BOOLEAN NOT NULL,
      state TEXT NOT NULL DEFAULT 'DOWN',
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    );
  `;

  db.exec(schema, async (err) => {
    if (err) {
      console.error('Error creating database schema:', err);
    } else {
      console.log('Database schema initialized successfully');
      // Create default admin user if none exists
      await createDefaultAdminUser();
    }
  });
}

// Function to create default admin user
async function createDefaultAdminUser() {
  try {
    const bcrypt = require('bcryptjs');
    
    // Check if any user exists
    const existingUser = await getOne('SELECT id FROM users LIMIT 1');
    
    if (!existingUser) {
      const defaultUsername = 'admin';
      const defaultPassword = 'admin123';  // This can be changed via env var later if needed
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await runQuery(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [defaultUsername, hashedPassword]
      );
      
      console.log('Default admin user created successfully');
      console.log('Default credentials: admin / admin123');
    }
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
}

// Helper function to run queries with promises
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Helper function to get single row
function getOne(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Helper function to get multiple rows
function getAll(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

module.exports = {
  db,
  runQuery,
  getOne,
  getAll
}; 
// SQLite database configuration for immediate testing
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the backend directory
const dbPath = path.join(__dirname, '..', 'symposium_management.db');

// Create SQLite database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    initializeDatabase();
  }
});

// Initialize database with schema
function initializeDatabase() {
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON');
  
  // Create tables
  const createTables = `
    -- Admin Table
    CREATE TABLE IF NOT EXISTS Admin (
      admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      is_active INTEGER DEFAULT 1
    );

    -- Participant Table
    CREATE TABLE IF NOT EXISTS Participant (
      participant_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      college TEXT NOT NULL,
      department TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT,
      registration_date TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Event Table
    CREATE TABLE IF NOT EXISTS Event (
      event_id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL UNIQUE,
      event_type TEXT NOT NULL,
      description TEXT,
      event_date TEXT NOT NULL,
      venue TEXT,
      max_participants INTEGER DEFAULT 100,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Coordinator Table
    CREATE TABLE IF NOT EXISTS Coordinator (
      coordinator_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'student',
      email TEXT UNIQUE,
      phone TEXT,
      department TEXT
    );

    -- Registration Table
    CREATE TABLE IF NOT EXISTS Registration (
      registration_id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      registration_date TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'registered',
      UNIQUE (participant_id, event_id),
      FOREIGN KEY (participant_id) REFERENCES Participant(participant_id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE
    );

    -- Event_Assignment Table
    CREATE TABLE IF NOT EXISTS Event_Assignment (
      assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      coordinator_id INTEGER NOT NULL,
      event_id INTEGER NOT NULL,
      role TEXT DEFAULT 'coordinator',
      assigned_date TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (coordinator_id, event_id),
      FOREIGN KEY (coordinator_id) REFERENCES Coordinator(coordinator_id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE
    );
  `;

  db.exec(createTables, (err) => {
    if (err) {
      console.error('Error creating tables:', err.message);
    } else {
      console.log('Database tables created successfully.');
      insertSampleData();
    }
  });
}

// Insert sample data
function insertSampleData() {
  // Check if data already exists
  db.get('SELECT COUNT(*) as count FROM Participant', (err, row) => {
    if (err) {
      console.error('Error checking data:', err.message);
      return;
    }

    if (row.count > 0) {
      console.log('Sample data already exists.');
      return;
    }

    // Insert sample data
    const insertData = `
      -- Insert Admin data
      INSERT INTO Admin (username, password, email) VALUES
      ('admin', 'admin123', 'admin@symposium.edu'),
      ('coordinator', 'coord456', 'coord@symposium.edu');

      -- Insert Participant data
      INSERT INTO Participant (name, college, department, email, phone) VALUES
      ('Rahul Kumar', 'MIT Chennai', 'Computer Science', 'rahul@mit.edu', '9876543210'),
      ('Priya Sharma', 'IIT Madras', 'Electronics', 'priya@iitm.edu', '9876543211'),
      ('Amit Patel', 'Anna University', 'Mechanical', 'amit@anna.edu', '9876543212'),
      ('Sneha Reddy', 'SRM Institute', 'Information Technology', 'sneha@srm.edu', '9876543213'),
      ('Vijay Kumar', 'VIT Vellore', 'Computer Science', 'vijay@vit.edu', '9876543214'),
      ('Anjali Nair', 'PSG College', 'Electrical', 'anjali@psg.edu', '9876543215'),
      ('Karthik R', 'College of Engineering', 'Civil', 'karthik@ceg.edu', '9876543216'),
      ('Divya S', 'Loyola College', 'Physics', 'divya@loyola.edu', '9876543217');

      -- Insert Event data
      INSERT INTO Event (event_name, event_type, description, event_date, venue, max_participants) VALUES
      ('Web Development Hackathon', 'Technical', '24-hour hackathon to build innovative web applications', '2025-05-15', 'Computer Lab Block A', 50),
      ('Robotics Competition', 'Technical', 'Build and program autonomous robots for specific tasks', '2025-05-16', 'Robotics Lab', 30),
      ('Paper Presentation', 'Non-Technical', 'Present research papers on emerging technologies', '2025-05-17', 'Seminar Hall 1', 100),
      ('Coding Contest', 'Technical', 'Competitive programming challenge with algorithmic problems', '2025-05-18', 'Computer Lab Block B', 60),
      ('Project Exhibition', 'Technical', 'Display innovative engineering projects', '2025-05-19', 'Exhibition Hall', 80),
      ('Technical Quiz', 'Non-Technical', 'Quiz competition covering various technical domains', '2025-05-20', 'Auditorium', 150),
      ('Workshop on AI/ML', 'Workshop', 'Hands-on workshop on Artificial Intelligence and Machine Learning', '2025-05-21', 'Conference Room', 40),
      ('Cultural Night', 'Non-Technical', 'Evening cultural program with various performances', '2025-05-22', 'Open Auditorium', 200);

      -- Insert Coordinator data
      INSERT INTO Coordinator (name, type, email, phone, department) VALUES
      ('Dr. R. Venkatesh', 'faculty', 'venkatesh@mit.edu', '9876543201', 'Computer Science'),
      ('Prof. S. Lakshmi', 'faculty', 'lakshmi@iitm.edu', '9876543202', 'Electronics'),
      ('John Smith', 'student', 'john@student.edu', '9876543203', 'Computer Science'),
      ('Mary Johnson', 'student', 'mary@student.edu', '9876543204', 'Mechanical'),
      ('Dr. A. Kumar', 'faculty', 'akumar@anna.edu', '9876543205', 'Mechanical'),
      ('Sarah Williams', 'student', 'sarah@student.edu', '9876543206', 'Information Technology'),
      ('Prof. P. Gupta', 'faculty', 'pgupta@srm.edu', '9876543207', 'Information Technology'),
      ('Mike Brown', 'student', 'mike@student.edu', '9876543208', 'Electrical');

      -- Insert Registration data
      INSERT INTO Registration (participant_id, event_id, status) VALUES
      (1, 1, 'registered'), -- Rahul -> Web Development Hackathon
      (1, 4, 'registered'), -- Rahul -> Coding Contest
      (2, 1, 'registered'), -- Priya -> Web Development Hackathon
      (2, 3, 'registered'), -- Priya -> Paper Presentation
      (3, 2, 'registered'), -- Amit -> Robotics Competition
      (3, 5, 'registered'), -- Amit -> Project Exhibition
      (4, 1, 'registered'), -- Sneha -> Web Development Hackathon
      (4, 7, 'registered'), -- Sneha -> Workshop on AI/ML
      (5, 4, 'registered'), -- Vijay -> Coding Contest
      (5, 2, 'registered'), -- Vijay -> Robotics Competition
      (6, 3, 'registered'), -- Anjali -> Paper Presentation
      (6, 6, 'registered'), -- Anjali -> Technical Quiz
      (7, 5, 'registered'), -- Karthik -> Project Exhibition
      (7, 2, 'registered'), -- Karthik -> Robotics Competition
      (8, 6, 'registered'), -- Divya -> Technical Quiz
      (8, 8, 'registered'); -- Divya -> Cultural Night

      -- Insert Event_Assignment data
      INSERT INTO Event_Assignment (coordinator_id, event_id, role) VALUES
      (1, 1, 'lead_coordinator'), -- Dr. Venkatesh -> Web Development Hackathon
      (3, 1, 'coordinator'),     -- John -> Web Development Hackathon
      (2, 2, 'lead_coordinator'), -- Prof. Lakshmi -> Robotics Competition
      (4, 2, 'coordinator'),     -- Mary -> Robotics Competition
      (5, 3, 'lead_coordinator'), -- Dr. Kumar -> Paper Presentation
      (6, 3, 'coordinator'),     -- Sarah -> Paper Presentation
      (1, 4, 'lead_coordinator'), -- Dr. Venkatesh -> Coding Contest
      (7, 5, 'lead_coordinator'), -- Prof. Gupta -> Project Exhibition
      (8, 5, 'coordinator'),     -- Mike -> Project Exhibition
      (2, 6, 'lead_coordinator'), -- Prof. Lakshmi -> Technical Quiz
      (5, 7, 'lead_coordinator'), -- Dr. Kumar -> Workshop on AI/ML
      (6, 7, 'coordinator'),     -- Sarah -> Workshop on AI/ML
      (3, 8, 'lead_coordinator'), -- John -> Cultural Night
      (4, 8, 'volunteer');       -- Mary -> Cultural Night
    `;

    db.exec(insertData, (err) => {
      if (err) {
        console.error('Error inserting sample data:', err.message);
      } else {
        console.log('Sample data inserted successfully.');
      }
    });
  });
}

// Promise wrapper for SQLite queries
const dbPromise = {
  // Execute query with parameters
  execute: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Convert to MySQL-like format
          resolve([rows]);
        }
      });
    });
  },

  // Get single row
  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  // Run query (INSERT, UPDATE, DELETE)
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            insertId: this.lastID,
            affectedRows: this.changes
          });
        }
      });
    });
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const result = await dbPromise.get('SELECT COUNT(*) as count FROM Participant');
    console.log('SQLite database connected successfully');
    console.log(`Found ${result.count} participants`);
    return true;
  } catch (error) {
    console.error('SQLite database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  db: dbPromise,
  testConnection
};

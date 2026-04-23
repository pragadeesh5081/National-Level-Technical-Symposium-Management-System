-- National Level Technical Symposium Management System
-- Fixed Database Schema (MySQL 8.0 compatible)

-- Drop existing tables if they exist
DROP TABLE IF EXISTS Event_Assignment;
DROP TABLE IF EXISTS Registration;
DROP TABLE IF EXISTS Event;
DROP TABLE IF EXISTS Coordinator;
DROP TABLE IF EXISTS Participant;
DROP TABLE IF EXISTS Admin;

-- 1. Admin Table
CREATE TABLE Admin (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 2. Participant Table
CREATE TABLE Participant (
    participant_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    college VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (LENGTH(name) >= 2),
    CHECK (LENGTH(college) >= 3)
);

-- 3. Event Table (Fixed - removed CURDATE() from CHECK constraint)
CREATE TABLE Event (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    event_name VARCHAR(200) NOT NULL UNIQUE,
    event_type VARCHAR(50) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    venue VARCHAR(100),
    max_participants INT DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (max_participants > 0)
);

-- 4. Coordinator Table
CREATE TABLE Coordinator (
    coordinator_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('faculty', 'student') NOT NULL DEFAULT 'student',
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    CHECK (type IN ('faculty', 'student'))
);

-- 5. Registration Table (Junction table for Participant-Event relationship)
CREATE TABLE Registration (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    participant_id INT NOT NULL,
    event_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'completed', 'cancelled') DEFAULT 'registered',
    UNIQUE (participant_id, event_id),
    FOREIGN KEY (participant_id) REFERENCES Participant(participant_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    CHECK (status IN ('registered', 'completed', 'cancelled'))
);

-- 6. Event_Assignment Table (Junction table for Coordinator-Event relationship)
CREATE TABLE Event_Assignment (
    assignment_id INT PRIMARY KEY AUTO_INCREMENT,
    coordinator_id INT NOT NULL,
    event_id INT NOT NULL,
    role ENUM('lead_coordinator', 'coordinator', 'volunteer') DEFAULT 'coordinator',
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (coordinator_id, event_id),
    FOREIGN KEY (coordinator_id) REFERENCES Coordinator(coordinator_id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES Event(event_id) ON DELETE CASCADE,
    CHECK (role IN ('lead_coordinator', 'coordinator', 'volunteer'))
);

-- Create indexes for better performance
CREATE INDEX idx_participant_name ON Participant(name);
CREATE INDEX idx_event_date ON Event(event_date);
CREATE INDEX idx_coordinator_type ON Coordinator(type);
CREATE INDEX idx_registration_status ON Registration(status);
CREATE INDEX idx_assignment_role ON Event_Assignment(role);

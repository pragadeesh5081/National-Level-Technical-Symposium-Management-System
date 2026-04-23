-- Sample Data for National Level Technical Symposium Management System
-- DML Statements (INSERT)

USE symposium_management;

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

-- Insert Registration data (Participant <-> Event)
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

-- Insert Event_Assignment data (Coordinator <-> Event)
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

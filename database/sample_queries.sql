-- Sample DQL Queries for National Level Technical Symposium Management System
-- These queries demonstrate various reporting capabilities

USE symposium_management;

-- 1. View all participants
SELECT * FROM Participant ORDER BY name;

-- 2. View all events
SELECT * FROM Event ORDER BY event_date;

-- 3. View all coordinators
SELECT * FROM Coordinator ORDER BY type, name;

-- 4. View all registrations with participant and event details
SELECT 
    r.registration_id,
    p.name AS participant_name,
    p.college,
    e.event_name,
    e.event_date,
    r.registration_date,
    r.status
FROM Registration r
JOIN Participant p ON r.participant_id = p.participant_id
JOIN Event e ON r.event_id = e.event_id
ORDER BY e.event_date, p.name;

-- 5. View all event assignments with coordinator and event details
SELECT 
    ea.assignment_id,
    c.name AS coordinator_name,
    c.type AS coordinator_type,
    e.event_name,
    e.event_date,
    ea.role,
    ea.assigned_date
FROM Event_Assignment ea
JOIN Coordinator c ON ea.coordinator_id = c.coordinator_id
JOIN Event e ON ea.event_id = e.event_id
ORDER BY e.event_date, c.type, c.name;

-- 6. Event-wise participant list (Bonus feature)
SELECT 
    e.event_name,
    e.event_date,
    COUNT(r.participant_id) AS total_participants,
    GROUP_CONCAT(p.name ORDER BY p.name SEPARATOR ', ') AS participants
FROM Event e
LEFT JOIN Registration r ON e.event_id = r.event_id AND r.status = 'registered'
LEFT JOIN Participant p ON r.participant_id = p.participant_id
GROUP BY e.event_id, e.event_name, e.event_date
ORDER BY e.event_date;

-- 7. Coordinator assigned to each event (Bonus feature)
SELECT 
    e.event_name,
    e.event_date,
    GROUP_CONCAT(
        CONCAT(c.name, ' (', c.type, ') - ', ea.role) 
        ORDER BY c.type, c.name 
        SEPARATOR '; '
    ) AS coordinators
FROM Event e
LEFT JOIN Event_Assignment ea ON e.event_id = ea.event_id
LEFT JOIN Coordinator c ON ea.coordinator_id = c.coordinator_id
GROUP BY e.event_id, e.event_name, e.event_date
ORDER BY e.event_date;

-- 8. Participants by college
SELECT 
    college,
    COUNT(*) AS participant_count
FROM Participant
GROUP BY college
ORDER BY participant_count DESC;

-- 9. Events by type
SELECT 
    event_type,
    COUNT(*) AS event_count
FROM Event
GROUP BY event_type
ORDER BY event_count DESC;

-- 10. Upcoming events (events after today)
SELECT 
    event_name,
    event_type,
    event_date,
    venue,
    max_participants
FROM Event
WHERE event_date >= CURDATE()
ORDER BY event_date;

-- 11. Participants registered for multiple events
SELECT 
    p.name,
    p.college,
    COUNT(r.event_id) AS events_registered
FROM Participant p
JOIN Registration r ON p.participant_id = r.participant_id
WHERE r.status = 'registered'
GROUP BY p.participant_id, p.name, p.college
HAVING COUNT(r.event_id) > 1
ORDER BY events_registered DESC, p.name;

-- 12. Events with coordinator details
SELECT 
    e.event_name,
    e.event_date,
    e.venue,
    COUNT(DISTINCT ea.coordinator_id) AS coordinator_count,
    COUNT(DISTINCT r.participant_id) AS participant_count
FROM Event e
LEFT JOIN Event_Assignment ea ON e.event_id = ea.event_id
LEFT JOIN Registration r ON e.event_id = r.event_id AND r.status = 'registered'
GROUP BY e.event_id, e.event_name, e.event_date, e.venue
ORDER BY e.event_date;

-- 13. Faculty vs Student coordinators
SELECT 
    type,
    COUNT(*) AS coordinator_count
FROM Coordinator
GROUP BY type
ORDER BY coordinator_count DESC;

-- 14. Registration statistics by event type
SELECT 
    e.event_type,
    COUNT(DISTINCT e.event_id) AS total_events,
    COUNT(DISTINCT r.participant_id) AS total_registrations,
    AVG(COUNT(DISTINCT r.participant_id)) OVER (PARTITION BY e.event_type) AS avg_participants_per_event
FROM Event e
LEFT JOIN Registration r ON e.event_id = r.event_id AND r.status = 'registered'
GROUP BY e.event_type
ORDER BY total_registrations DESC;

-- 15. Find events without coordinators
SELECT 
    e.event_name,
    e.event_date,
    e.venue
FROM Event e
LEFT JOIN Event_Assignment ea ON e.event_id = ea.event_id
WHERE ea.event_id IS NULL
ORDER BY e.event_date;

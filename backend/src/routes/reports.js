// Reports API routes for bonus features
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET event-wise participant list (Bonus feature)
router.get('/event-participants', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        e.event_id,
        e.event_name,
        e.event_date,
        e.event_type,
        e.venue,
        COUNT(r.participant_id) AS total_participants,
        GROUP_CONCAT(
          DISTINCT CONCAT(p.name, ' (', p.college, ')') 
          ORDER BY p.name 
          SEPARATOR '; '
        ) AS participants_list
      FROM Event e
      LEFT JOIN Registration r ON e.event_id = r.event_id AND r.status = 'registered'
      LEFT JOIN Participant p ON r.participant_id = p.participant_id
      GROUP BY e.event_id, e.event_name, e.event_date, e.event_type, e.venue
      ORDER BY e.event_date
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching event-wise participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event-wise participants',
      message: error.message
    });
  }
});

// GET coordinator assigned to each event (Bonus feature)
router.get('/event-coordinators', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        e.event_id,
        e.event_name,
        e.event_date,
        e.event_type,
        e.venue,
        COUNT(DISTINCT ea.coordinator_id) AS total_coordinators,
        GROUP_CONCAT(
          DISTINCT CONCAT(c.name, ' (', c.type, ') - ', ea.role) 
          ORDER BY ea.role, c.type, c.name 
          SEPARATOR '; '
        ) AS coordinators_list
      FROM Event e
      LEFT JOIN Event_Assignment ea ON e.event_id = ea.event_id
      LEFT JOIN Coordinator c ON ea.coordinator_id = c.coordinator_id
      GROUP BY e.event_id, e.event_name, e.event_date, e.event_type, e.venue
      ORDER BY e.event_date
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching event-wise coordinators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event-wise coordinators',
      message: error.message
    });
  }
});

// GET participants by college
router.get('/participants-by-college', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        college,
        COUNT(*) AS participant_count,
        GROUP_CONCAT(name ORDER BY name SEPARATOR ', ') AS participants
      FROM Participant
      GROUP BY college
      ORDER BY participant_count DESC
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching participants by college:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participants by college',
      message: error.message
    });
  }
});

// GET events by type with statistics
router.get('/events-by-type', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        e.event_type,
        COUNT(DISTINCT e.event_id) AS total_events,
        COUNT(DISTINCT r.participant_id) AS total_registrations,
        COUNT(DISTINCT ea.coordinator_id) AS total_coordinators,
        AVG(COUNT(DISTINCT r.participant_id)) OVER (PARTITION BY e.event_type) AS avg_participants_per_event
      FROM Event e
      LEFT JOIN Registration r ON e.event_id = r.event_id AND r.status = 'registered'
      LEFT JOIN Event_Assignment ea ON e.event_id = ea.event_id
      GROUP BY e.event_type
      ORDER BY total_registrations DESC
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching events by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events by type',
      message: error.message
    });
  }
});

// GET participants registered for multiple events
router.get('/multi-event-participants', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        p.participant_id,
        p.name,
        p.college,
        p.department,
        COUNT(r.event_id) AS events_registered,
        GROUP_CONCAT(e.event_name ORDER BY e.event_date SEPARATOR ', ') AS registered_events
      FROM Participant p
      JOIN Registration r ON p.participant_id = r.participant_id
      JOIN Event e ON r.event_id = e.event_id
      WHERE r.status = 'registered'
      GROUP BY p.participant_id, p.name, p.college, p.department
      HAVING COUNT(r.event_id) > 1
      ORDER BY events_registered DESC, p.name
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching multi-event participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch multi-event participants',
      message: error.message
    });
  }
});

// GET coordinators by workload
router.get('/coordinator-workload', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        c.coordinator_id,
        c.name,
        c.type,
        c.department,
        COUNT(ea.event_id) AS assigned_events,
        GROUP_CONCAT(e.event_name ORDER BY e.event_date SEPARATOR ', ') AS assigned_events_list,
        SUM(CASE WHEN ea.role = 'lead_coordinator' THEN 1 ELSE 0 END) AS lead_coordinator_count
      FROM Coordinator c
      LEFT JOIN Event_Assignment ea ON c.coordinator_id = ea.coordinator_id
      LEFT JOIN Event e ON ea.event_id = e.event_id
      GROUP BY c.coordinator_id, c.name, c.type, c.department
      ORDER BY assigned_events DESC, c.type, c.name
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching coordinator workload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coordinator workload',
      message: error.message
    });
  }
});

// GET comprehensive dashboard statistics
router.get('/dashboard-stats', async (req, res) => {
  try {
    const [participantStats] = await pool.execute('SELECT COUNT(*) AS total FROM Participant');
    const [eventStats] = await pool.execute('SELECT COUNT(*) AS total FROM Event');
    const [coordinatorStats] = await pool.execute('SELECT COUNT(*) AS total FROM Coordinator');
    const [registrationStats] = await pool.execute(`
      SELECT 
        COUNT(*) AS total_registrations,
        SUM(CASE WHEN status = 'registered' THEN 1 ELSE 0 END) AS registered_count,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_count
      FROM Registration
    `);
    const [upcomingEvents] = await pool.execute(`
      SELECT COUNT(*) AS total FROM Event WHERE event_date >= CURDATE()
    `);
    
    const stats = {
      total_participants: participantStats[0].total,
      total_events: eventStats[0].total,
      total_coordinators: coordinatorStats[0].total,
      upcoming_events: upcomingEvents[0].total,
      ...registrationStats[0]
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
});

module.exports = router;

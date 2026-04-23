// Registrations API routes
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all registrations with participant and event details
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        r.registration_id,
        r.participant_id,
        r.event_id,
        r.registration_date,
        r.status,
        p.name AS participant_name,
        p.college,
        p.department,
        e.event_name,
        e.event_type,
        e.event_date,
        e.venue
      FROM Registration r
      JOIN Participant p ON r.participant_id = p.participant_id
      JOIN Event e ON r.event_id = e.event_id
      ORDER BY r.registration_id ASC
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registrations',
      message: error.message
    });
  }
});

// GET registrations by event ID
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.execute(`
      SELECT 
        r.registration_id,
        r.participant_id,
        r.registration_date,
        r.status,
        p.name AS participant_name,
        p.college,
        p.department,
        p.email,
        p.phone
      FROM Registration r
      JOIN Participant p ON r.participant_id = p.participant_id
      WHERE r.event_id = ? AND r.status = 'registered'
      ORDER BY p.name
    `, [eventId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event registrations',
      message: error.message
    });
  }
});

// GET registrations by participant ID
router.get('/participant/:participantId', async (req, res) => {
  try {
    const { participantId } = req.params;
    const [rows] = await pool.execute(`
      SELECT 
        r.registration_id,
        r.event_id,
        r.registration_date,
        r.status,
        e.event_name,
        e.event_type,
        e.event_date,
        e.venue
      FROM Registration r
      JOIN Event e ON r.event_id = e.event_id
      WHERE r.participant_id = ? AND r.status = 'registered'
      ORDER BY e.event_date
    `, [participantId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching participant registrations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participant registrations',
      message: error.message
    });
  }
});

// POST new registration
router.post('/', async (req, res) => {
  try {
    const { participant_id, event_id, status } = req.body;
    
    // Validate required fields
    if (!participant_id || !event_id) {
      return res.status(400).json({
        success: false,
        error: 'Participant ID and Event ID are required'
      });
    }
    
    // Check if participant exists
    const [participantCheck] = await pool.execute(
      'SELECT participant_id FROM Participant WHERE participant_id = ?',
      [participant_id]
    );
    
    if (participantCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }
    
    // Check if event exists
    const [eventCheck] = await pool.execute(
      'SELECT event_id FROM Event WHERE event_id = ?',
      [event_id]
    );
    
    if (eventCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Check if already registered (UNIQUE constraint will also handle this)
    const [existing] = await pool.execute(
      'SELECT registration_id FROM Registration WHERE participant_id = ? AND event_id = ?',
      [participant_id, event_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Participant is already registered for this event'
      });
    }
    
    // Insert new registration
    const [result] = await pool.execute(
      'INSERT INTO Registration (participant_id, event_id, status) VALUES (?, ?, ?)',
      [participant_id, event_id, status || 'registered']
    );
    
    // Fetch the newly created registration with details
    const [newRegistration] = await pool.execute(`
      SELECT 
        r.registration_id,
        r.participant_id,
        r.event_id,
        r.registration_date,
        r.status,
        p.name AS participant_name,
        p.college,
        e.event_name,
        e.event_date
      FROM Registration r
      JOIN Participant p ON r.participant_id = p.participant_id
      JOIN Event e ON r.event_id = e.event_id
      WHERE r.registration_id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      data: newRegistration[0],
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Error creating registration:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Participant is already registered for this event'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create registration',
      message: error.message
    });
  }
});

// PUT update registration status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    if (!status || !['registered', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be one of: registered, cancelled, completed'
      });
    }
    
    // Check if registration exists
    const [existing] = await pool.execute(
      'SELECT registration_id FROM Registration WHERE registration_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }
    
    // Update registration
    await pool.execute(
      'UPDATE Registration SET status = ? WHERE registration_id = ?',
      [status, id]
    );
    
    // Fetch updated registration with details
    const [updated] = await pool.execute(`
      SELECT 
        r.registration_id,
        r.participant_id,
        r.event_id,
        r.registration_date,
        r.status,
        p.name AS participant_name,
        p.college,
        e.event_name,
        e.event_date
      FROM Registration r
      JOIN Participant p ON r.participant_id = p.participant_id
      JOIN Event e ON r.event_id = e.event_id
      WHERE r.registration_id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: updated[0],
      message: 'Registration updated successfully'
    });
  } catch (error) {
    console.error('Error updating registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update registration',
      message: error.message
    });
  }
});

// DELETE registration with auto-reset functionality
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Check if registration exists
    const [existing] = await connection.execute(
      'SELECT registration_id FROM Registration WHERE registration_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Registration not found'
      });
    }
    
    // Delete registration
    await connection.execute(
      'DELETE FROM Registration WHERE registration_id = ?',
      [id]
    );
    
    // Check if table is now empty, if so reset AUTO_INCREMENT
    const [count] = await connection.execute(
      'SELECT COUNT(*) as count FROM Registration'
    );
    
    if (count[0].count === 0) {
      // Use ALTER TABLE instead of TRUNCATE to avoid foreign key issues
      await connection.execute('ALTER TABLE Registration AUTO_INCREMENT = 1');
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Registration deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting registration:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete registration',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// GET registration statistics
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        e.event_name,
        e.event_date,
        COUNT(r.participant_id) as total_registrations,
        SUM(CASE WHEN r.status = 'registered' THEN 1 ELSE 0 END) as registered_count,
        SUM(CASE WHEN r.status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_count,
        SUM(CASE WHEN r.status = 'completed' THEN 1 ELSE 0 END) as completed_count
      FROM Event e
      LEFT JOIN Registration r ON e.event_id = r.event_id
      GROUP BY e.event_id, e.event_name, e.event_date
      ORDER BY e.event_date
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching registration statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch registration statistics',
      message: error.message
    });
  }
});

module.exports = router;

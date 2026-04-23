// Events API routes
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all events
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Event ORDER BY event_id ASC'
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events',
      message: error.message
    });
  }
});

// GET events with participant count
router.get('/with-stats', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        e.*,
        COUNT(DISTINCT r.participant_id) as participant_count,
        COUNT(DISTINCT ea.coordinator_id) as coordinator_count
      FROM Event e
      LEFT JOIN Registration r ON e.event_id = r.event_id AND r.status = 'registered'
      LEFT JOIN Event_Assignment ea ON e.event_id = ea.event_id
      GROUP BY e.event_id
      ORDER BY e.event_id ASC
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching events with stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch events with stats',
      message: error.message
    });
  }
});

// GET single event by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM Event WHERE event_id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event',
      message: error.message
    });
  }
});

// POST new event
router.post('/', async (req, res) => {
  try {
    const { event_name, event_type, description, event_date, venue, max_participants } = req.body;
    
    // Validate required fields
    if (!event_name || !event_type || !event_date) {
      return res.status(400).json({
        success: false,
        error: 'Event name, type, and date are required'
      });
    }
    
    // Check if event name already exists
    const [existing] = await pool.execute(
      'SELECT event_id FROM Event WHERE event_name = ?',
      [event_name]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Event name already exists'
      });
    }
    
    // Insert new event
    const [result] = await pool.execute(
      'INSERT INTO Event (event_name, event_type, description, event_date, venue, max_participants) VALUES (?, ?, ?, ?, ?, ?)',
      [
        event_name,
        event_type,
        description || null,
        event_date,
        venue || null,
        max_participants || 100
      ]
    );
    
    // Fetch the newly created event
    const [newEvent] = await pool.execute(
      'SELECT * FROM Event WHERE event_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: newEvent[0],
      message: 'Event added successfully'
    });
  } catch (error) {
    console.error('Error adding event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add event',
      message: error.message
    });
  }
});

// PUT update event
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { event_name, event_type, description, event_date, venue, max_participants } = req.body;
    
    // Check if event exists
    const [existing] = await pool.execute(
      'SELECT event_id FROM Event WHERE event_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Check if event name already exists for another event
    if (event_name) {
      const [nameCheck] = await pool.execute(
        'SELECT event_id FROM Event WHERE event_name = ? AND event_id != ?',
        [event_name, id]
      );
      
      if (nameCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Event name already exists'
        });
      }
    }
    
    // Update event
    await pool.execute(
      'UPDATE Event SET event_name = ?, event_type = ?, description = ?, event_date = ?, venue = ?, max_participants = ? WHERE event_id = ?',
      [
        event_name,
        event_type,
        description || null,
        event_date,
        venue || null,
        max_participants || 100,
        id
      ]
    );
    
    // Fetch updated event
    const [updated] = await pool.execute(
      'SELECT * FROM Event WHERE event_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: updated[0],
      message: 'Event updated successfully'
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update event',
      message: error.message
    });
  }
});

// DELETE event with auto-reset functionality
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Check if event exists
    const [existing] = await connection.execute(
      'SELECT event_id FROM Event WHERE event_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }
    
    // Delete event (will cascade delete registrations and assignments)
    await connection.execute(
      'DELETE FROM Event WHERE event_id = ?',
      [id]
    );
    
    // Check if table is now empty, if so reset AUTO_INCREMENT
    const [count] = await connection.execute(
      'SELECT COUNT(*) as count FROM Event'
    );
    
    if (count[0].count === 0) {
      // Use ALTER TABLE instead of TRUNCATE to avoid foreign key issues
      await connection.execute('ALTER TABLE Event AUTO_INCREMENT = 1');
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete event',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Reset all events and start from ID 1
router.post('/reset', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Disable foreign key checks temporarily
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete registrations first (to avoid foreign key constraint)
    await connection.execute('DELETE FROM Registration');
    
    // Delete event assignments first (to avoid foreign key constraint)
    await connection.execute('DELETE FROM Event_Assignment');
    
    // Truncate events table
    await connection.execute('TRUNCATE TABLE Event');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'All events deleted and IDs reset to start from 1'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error resetting events:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset events',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

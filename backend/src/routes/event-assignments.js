// Event Assignments API routes
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all event assignments with coordinator and event details
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ea.assignment_id,
        ea.coordinator_id,
        ea.event_id,
        ea.role,
        ea.assigned_date,
        c.name AS coordinator_name,
        c.type AS coordinator_type,
        c.email AS coordinator_email,
        e.event_name,
        e.event_date,
        e.venue
      FROM Event_Assignment ea
      JOIN Coordinator c ON ea.coordinator_id = c.coordinator_id
      JOIN Event e ON ea.event_id = e.event_id
      ORDER BY ea.assignment_id ASC
    `);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching event assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event assignments',
      message: error.message
    });
  }
});

// GET assignments by event ID
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;
    const [rows] = await pool.execute(`
      SELECT 
        ea.assignment_id,
        ea.coordinator_id,
        ea.role,
        ea.assigned_date,
        c.name AS coordinator_name,
        c.type AS coordinator_type,
        c.email,
        c.phone,
        c.department
      FROM Event_Assignment ea
      JOIN Coordinator c ON ea.coordinator_id = c.coordinator_id
      WHERE ea.event_id = ?
      ORDER BY ea.role, c.type, c.name
    `, [eventId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching event assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch event assignments',
      message: error.message
    });
  }
});

// GET assignments by coordinator ID
router.get('/coordinator/:coordinatorId', async (req, res) => {
  try {
    const { coordinatorId } = req.params;
    const [rows] = await pool.execute(`
      SELECT 
        ea.assignment_id,
        ea.event_id,
        ea.role,
        ea.assigned_date,
        e.event_name,
        e.event_type,
        e.event_date,
        e.venue
      FROM Event_Assignment ea
      JOIN Event e ON ea.event_id = e.event_id
      WHERE ea.coordinator_id = ?
      ORDER BY e.event_date
    `, [coordinatorId]);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching coordinator assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coordinator assignments',
      message: error.message
    });
  }
});

// POST new event assignment
router.post('/', async (req, res) => {
  try {
    const { coordinator_id, event_id, role } = req.body;
    
    // Validate required fields
    if (!coordinator_id || !event_id) {
      return res.status(400).json({
        success: false,
        error: 'Coordinator ID and Event ID are required'
      });
    }
    
    // Validate role if provided
    if (role && !['coordinator', 'lead_coordinator', 'volunteer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be one of: coordinator, lead_coordinator, volunteer'
      });
    }
    
    // Check if coordinator exists
    const [coordinatorCheck] = await pool.execute(
      'SELECT coordinator_id FROM Coordinator WHERE coordinator_id = ?',
      [coordinator_id]
    );
    
    if (coordinatorCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Coordinator not found'
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
    
    // Check if already assigned (UNIQUE constraint will also handle this)
    const [existing] = await pool.execute(
      'SELECT assignment_id FROM Event_Assignment WHERE coordinator_id = ? AND event_id = ?',
      [coordinator_id, event_id]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Coordinator is already assigned to this event'
      });
    }
    
    // Insert new assignment
    const [result] = await pool.execute(
      'INSERT INTO Event_Assignment (coordinator_id, event_id, role) VALUES (?, ?, ?)',
      [coordinator_id, event_id, role || 'coordinator']
    );
    
    // Fetch the newly created assignment with details
    const [newAssignment] = await pool.execute(`
      SELECT 
        ea.assignment_id,
        ea.coordinator_id,
        ea.event_id,
        ea.role,
        ea.assigned_date,
        c.name AS coordinator_name,
        c.type AS coordinator_type,
        e.event_name,
        e.event_date
      FROM Event_Assignment ea
      JOIN Coordinator c ON ea.coordinator_id = c.coordinator_id
      JOIN Event e ON ea.event_id = e.event_id
      WHERE ea.assignment_id = ?
    `, [result.insertId]);
    
    res.status(201).json({
      success: true,
      data: newAssignment[0],
      message: 'Coordinator assigned to event successfully'
    });
  } catch (error) {
    console.error('Error creating event assignment:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({
        success: false,
        error: 'Coordinator is already assigned to this event'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to assign coordinator to event',
      message: error.message
    });
  }
});

// PUT update assignment role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    // Validate role
    if (!role || !['coordinator', 'lead_coordinator', 'volunteer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be one of: coordinator, lead_coordinator, volunteer'
      });
    }
    
    // Check if assignment exists
    const [existing] = await pool.execute(
      'SELECT assignment_id FROM Event_Assignment WHERE assignment_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }
    
    // Update assignment
    await pool.execute(
      'UPDATE Event_Assignment SET role = ? WHERE assignment_id = ?',
      [role, id]
    );
    
    // Fetch updated assignment with details
    const [updated] = await pool.execute(`
      SELECT 
        ea.assignment_id,
        ea.coordinator_id,
        ea.event_id,
        ea.role,
        ea.assigned_date,
        c.name AS coordinator_name,
        c.type AS coordinator_type,
        e.event_name,
        e.event_date
      FROM Event_Assignment ea
      JOIN Coordinator c ON ea.coordinator_id = c.coordinator_id
      JOIN Event e ON ea.event_id = e.event_id
      WHERE ea.assignment_id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: updated[0],
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update assignment',
      message: error.message
    });
  }
});

// DELETE assignment with auto-reset functionality
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Check if assignment exists
    const [existing] = await connection.execute(
      'SELECT assignment_id FROM Event_Assignment WHERE assignment_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Assignment not found'
      });
    }
    
    // Delete assignment
    await connection.execute(
      'DELETE FROM Event_Assignment WHERE assignment_id = ?',
      [id]
    );
    
    // Check if table is now empty, if so reset AUTO_INCREMENT
    const [count] = await connection.execute(
      'SELECT COUNT(*) as count FROM Event_Assignment'
    );
    
    if (count[0].count === 0) {
      // Use ALTER TABLE instead of TRUNCATE to avoid foreign key issues
      await connection.execute('ALTER TABLE Event_Assignment AUTO_INCREMENT = 1');
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting assignment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete assignment',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

module.exports = router;

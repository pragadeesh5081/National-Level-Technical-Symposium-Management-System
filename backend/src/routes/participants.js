// Participants API routes
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const ResetService = require('../services/resetService');

// GET all participants
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Participant ORDER BY participant_id ASC'
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participants',
      message: error.message
    });
  }
});

// GET single participant by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM Participant WHERE participant_id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching participant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch participant',
      message: error.message
    });
  }
});

// POST new participant
router.post('/', async (req, res) => {
  try {
    const { name, college, department, email, phone } = req.body;
    
    // Validate required fields
    if (!name || !college || !department) {
      return res.status(400).json({
        success: false,
        error: 'Name, college, and department are required'
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const [existing] = await pool.execute(
        'SELECT participant_id FROM Participant WHERE email = ?',
        [email]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }
    
    // Insert new participant
    const [result] = await pool.execute(
      'INSERT INTO Participant (name, college, department, email, phone) VALUES (?, ?, ?, ?, ?)',
      [name, college, department, email || null, phone || null]
    );
    
    // Fetch the newly created participant
    const [newParticipant] = await pool.execute(
      'SELECT * FROM Participant WHERE participant_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: newParticipant[0],
      message: 'Participant added successfully'
    });
  } catch (error) {
    console.error('Error adding participant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add participant',
      message: error.message
    });
  }
});

// PUT update participant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, college, department, email, phone } = req.body;
    
    // Check if participant exists
    const [existing] = await pool.execute(
      'SELECT participant_id FROM Participant WHERE participant_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }
    
    // Check if email already exists for another participant (if provided)
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT participant_id FROM Participant WHERE email = ? AND participant_id != ?',
        [email, id]
      );
      
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }
    
    // Update participant
    await pool.execute(
      'UPDATE Participant SET name = ?, college = ?, department = ?, email = ?, phone = ? WHERE participant_id = ?',
      [name, college, department, email || null, phone || null, id]
    );
    
    // Fetch updated participant
    const [updated] = await pool.execute(
      'SELECT * FROM Participant WHERE participant_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: updated[0],
      message: 'Participant updated successfully'
    });
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update participant',
      message: error.message
    });
  }
});

// DELETE participant with auto-reset functionality
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Check if participant exists
    const [existing] = await connection.execute(
      'SELECT participant_id FROM Participant WHERE participant_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Participant not found'
      });
    }
    
    // Delete participant (will cascade delete registrations)
    await connection.execute(
      'DELETE FROM Participant WHERE participant_id = ?',
      [id]
    );
    
    // Check if table is now empty, if so reset AUTO_INCREMENT
    const [count] = await connection.execute(
      'SELECT COUNT(*) as count FROM Participant'
    );
    
    if (count[0].count === 0) {
      // Use DELETE instead of TRUNCATE to avoid foreign key issues
      await connection.execute('ALTER TABLE Participant AUTO_INCREMENT = 1');
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Participant deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting participant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete participant',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Reset all participants and start from ID 1
router.post('/reset', async (req, res) => {
  try {
    const result = await ResetService.resetParticipants();
    res.json(result);
  } catch (error) {
    console.error('Error resetting participants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset participants',
      message: error.message
    });
  }
});

module.exports = router;

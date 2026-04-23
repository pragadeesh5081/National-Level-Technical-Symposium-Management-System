// Coordinators API routes
const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// GET all coordinators
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Coordinator ORDER BY coordinator_id ASC'
    );
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching coordinators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coordinators',
      message: error.message
    });
  }
});

// GET single coordinator by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      'SELECT * FROM Coordinator WHERE coordinator_id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Coordinator not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching coordinator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coordinator',
      message: error.message
    });
  }
});

// POST new coordinator
router.post('/', async (req, res) => {
  try {
    const { name, type, email, phone, department } = req.body;
    
    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        success: false,
        error: 'Name and type are required'
      });
    }
    
    // Validate type
    if (!['faculty', 'student'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "faculty" or "student"'
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const [existing] = await pool.execute(
        'SELECT coordinator_id FROM Coordinator WHERE email = ?',
        [email]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }
    
    // Insert new coordinator
    const [result] = await pool.execute(
      'INSERT INTO Coordinator (name, type, email, phone, department) VALUES (?, ?, ?, ?, ?)',
      [name, type, email || null, phone || null, department || null]
    );
    
    // Fetch the newly created coordinator
    const [newCoordinator] = await pool.execute(
      'SELECT * FROM Coordinator WHERE coordinator_id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: newCoordinator[0],
      message: 'Coordinator added successfully'
    });
  } catch (error) {
    console.error('Error adding coordinator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add coordinator',
      message: error.message
    });
  }
});

// PUT update coordinator
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, email, phone, department } = req.body;
    
    // Check if coordinator exists
    const [existing] = await pool.execute(
      'SELECT coordinator_id FROM Coordinator WHERE coordinator_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Coordinator not found'
      });
    }
    
    // Validate type if provided
    if (type && !['faculty', 'student'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "faculty" or "student"'
      });
    }
    
    // Check if email already exists for another coordinator (if provided)
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT coordinator_id FROM Coordinator WHERE email = ? AND coordinator_id != ?',
        [email, id]
      );
      
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }
    
    // Update coordinator
    await pool.execute(
      'UPDATE Coordinator SET name = ?, type = ?, email = ?, phone = ?, department = ? WHERE coordinator_id = ?',
      [name, type, email || null, phone || null, department || null, id]
    );
    
    // Fetch updated coordinator
    const [updated] = await pool.execute(
      'SELECT * FROM Coordinator WHERE coordinator_id = ?',
      [id]
    );
    
    res.json({
      success: true,
      data: updated[0],
      message: 'Coordinator updated successfully'
    });
  } catch (error) {
    console.error('Error updating coordinator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update coordinator',
      message: error.message
    });
  }
});

// DELETE coordinator with auto-reset functionality
router.delete('/:id', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    
    await connection.beginTransaction();
    
    // Check if coordinator exists
    const [existing] = await connection.execute(
      'SELECT coordinator_id FROM Coordinator WHERE coordinator_id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: 'Coordinator not found'
      });
    }
    
    // Delete coordinator (will cascade delete event assignments)
    await connection.execute(
      'DELETE FROM Coordinator WHERE coordinator_id = ?',
      [id]
    );
    
    // Check if table is now empty, if so reset AUTO_INCREMENT
    const [count] = await connection.execute(
      'SELECT COUNT(*) as count FROM Coordinator'
    );
    
    if (count[0].count === 0) {
      // Use ALTER TABLE instead of TRUNCATE to avoid foreign key issues
      await connection.execute('ALTER TABLE Coordinator AUTO_INCREMENT = 1');
    }
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Coordinator deleted successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting coordinator:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete coordinator',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Reset all coordinators and start from ID 1
router.post('/reset', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Disable foreign key checks temporarily
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete event assignments first (to avoid foreign key constraint)
    await connection.execute('DELETE FROM Event_Assignment');
    
    // Truncate coordinators table
    await connection.execute('TRUNCATE TABLE Coordinator');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'All coordinators deleted and IDs reset to start from 1'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error resetting coordinators:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset coordinators',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// GET coordinators by type
router.get('/by-type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    
    if (!['faculty', 'student'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Type must be either "faculty" or "student"'
      });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM Coordinator WHERE type = ? ORDER BY name',
      [type]
    );
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching coordinators by type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch coordinators by type',
      message: error.message
    });
  }
});

module.exports = router;

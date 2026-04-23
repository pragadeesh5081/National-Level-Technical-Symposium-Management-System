const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');

// Master reset endpoint for all tables (force reset regardless of record count)
router.post('/reset-all', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete all data from dependent tables first
    await connection.execute('DELETE FROM Registration');
    await connection.execute('DELETE FROM Event_Assignment');
    
    // Truncate main tables (resets AUTO_INCREMENT automatically)
    await connection.execute('TRUNCATE TABLE Participant');
    await connection.execute('TRUNCATE TABLE Event');
    await connection.execute('TRUNCATE TABLE Coordinator');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'All tables reset successfully - IDs will start from 1'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error resetting all tables:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset tables',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Reset Event Assignments specifically (force reset)
router.post('/event-assignments', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Disable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Delete all event assignments
    await connection.execute('DELETE FROM Event_Assignment');
    
    // Reset AUTO_INCREMENT to 1
    await connection.execute('ALTER TABLE Event_Assignment AUTO_INCREMENT = 1');
    
    // Re-enable foreign key checks
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    await connection.commit();
    
    res.json({
      success: true,
      message: 'Event assignments reset - IDs will start from 1'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error resetting event assignments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset event assignments',
      message: error.message
    });
  } finally {
    connection.release();
  }
});

// Individual reset endpoints (kept for backward compatibility)
router.post('/participants', async (req, res) => {
  try {
    const result = await require('../services/resetService').resetParticipants();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset participants',
      message: error.message
    });
  }
});

router.post('/events', async (req, res) => {
  try {
    const result = await require('../services/resetService').resetEvents();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset events',
      message: error.message
    });
  }
});

router.post('/coordinators', async (req, res) => {
  try {
    const result = await require('../services/resetService').resetCoordinators();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset coordinators',
      message: error.message
    });
  }
});

module.exports = router;

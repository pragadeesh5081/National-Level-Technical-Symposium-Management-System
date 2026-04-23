const { pool } = require('../config/database');

class ResetService {
  static async resetParticipants() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Step 1: Delete all registrations first (to avoid foreign key constraints)
      await connection.execute('DELETE FROM Registration');
      
      // Step 2: Get all participant IDs to delete
      const [participants] = await connection.execute(
        'SELECT participant_id FROM Participant ORDER BY participant_id DESC'
      );
      
      // Step 3: Delete each participant
      for (const participant of participants) {
        await connection.execute(
          'DELETE FROM Participant WHERE participant_id = ?',
          [participant.participant_id]
        );
      }
      
      // Step 4: Reset AUTO_INCREMENT to 1
      await connection.execute('ALTER TABLE Participant AUTO_INCREMENT = 1');
      
      await connection.commit();
      
      return {
        success: true,
        message: 'All participants deleted and IDs reset to start from 1'
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error resetting participants:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async resetEvents() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Step 1: Get all event IDs to delete
      const [events] = await connection.execute(
        'SELECT event_id FROM Event ORDER BY event_id DESC'
      );
      
      // Step 2: Delete registrations first
      await connection.execute('DELETE FROM Registration');
      
      // Step 3: Delete event assignments first
      await connection.execute('DELETE FROM Event_Assignment');
      
      // Step 4: Delete each event
      for (const event of events) {
        await connection.execute(
          'DELETE FROM Event WHERE event_id = ?',
          [event.event_id]
        );
      }
      
      // Step 5: Reset AUTO_INCREMENT to 1
      await connection.execute('ALTER TABLE Event AUTO_INCREMENT = 1');
      
      await connection.commit();
      
      return {
        success: true,
        message: 'All events deleted and IDs reset to start from 1'
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error resetting events:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async resetCoordinators() {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // Step 1: Get all coordinator IDs to delete
      const [coordinators] = await connection.execute(
        'SELECT coordinator_id FROM Coordinator ORDER BY coordinator_id DESC'
      );
      
      // Step 2: Delete event assignments first
      await connection.execute('DELETE FROM Event_Assignment');
      
      // Step 3: Delete each coordinator
      for (const coordinator of coordinators) {
        await connection.execute(
          'DELETE FROM Coordinator WHERE coordinator_id = ?',
          [coordinator.coordinator_id]
        );
      }
      
      // Step 4: Reset AUTO_INCREMENT to 1
      await connection.execute('ALTER TABLE Coordinator AUTO_INCREMENT = 1');
      
      await connection.commit();
      
      return {
        success: true,
        message: 'All coordinators deleted and IDs reset to start from 1'
      };
    } catch (error) {
      await connection.rollback();
      console.error('Error resetting coordinators:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = ResetService;

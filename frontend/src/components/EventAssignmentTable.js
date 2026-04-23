import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const EventAssignmentTable = ({ showMessage }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await apiService.eventAssignments.getAll();
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showMessage('Error fetching assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (assignmentId, newRole) => {
    try {
      await apiService.eventAssignments.update(assignmentId, { role: newRole });
      showMessage('Assignment role updated successfully', 'success');
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment role:', error);
      showMessage('Error updating assignment role', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        await apiService.eventAssignments.delete(id);
        showMessage('Assignment deleted successfully', 'success');
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
        showMessage('Error deleting assignment', 'error');
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'lead_coordinator':
        return '#dc3545';
      case 'coordinator':
        return '#007bff';
      case 'volunteer':
        return '#28a745';
      default:
        return '#6c757d';
    }
  };

  const getTypeColor = (type) => {
    return type === 'faculty' ? '#28a745' : '#007bff';
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Event Assignments...</h2>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #dee2e6'
      }}>
        <h3 style={{ margin: '0' }}>
          Event Assignments ({assignments.length})
        </h3>
      </div>
      
      {assignments.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No event assignments found
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Coordinator</th>
                <th>Type</th>
                <th>Email</th>
                <th>Event</th>
                <th>Event Date</th>
                <th>Venue</th>
                <th>Role</th>
                <th>Assigned Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => (
                <tr key={assignment.assignment_id}>
                  <td>{assignment.assignment_id}</td>
                  <td>
                    <strong>{assignment.coordinator_name}</strong>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      backgroundColor: getTypeColor(assignment.coordinator_type),
                      color: 'white'
                    }}>
                      {assignment.coordinator_type}
                    </span>
                  </td>
                  <td>{assignment.coordinator_email || '-'}</td>
                  <td>
                    <strong>{assignment.event_name}</strong>
                  </td>
                  <td>{new Date(assignment.event_date).toLocaleDateString()}</td>
                  <td>{assignment.venue || '-'}</td>
                  <td>
                    <select
                      className="form-control"
                      value={assignment.role}
                      onChange={(e) => handleRoleChange(assignment.assignment_id, e.target.value)}
                      style={{
                        width: 'auto',
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: getRoleColor(assignment.role),
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      <option value="coordinator" style={{ color: '#333' }}>Coordinator</option>
                      <option value="lead_coordinator" style={{ color: '#333' }}>Lead Coordinator</option>
                      <option value="volunteer" style={{ color: '#333' }}>Volunteer</option>
                    </select>
                  </td>
                  <td>{new Date(assignment.assigned_date).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(assignment.assignment_id)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Summary Statistics */}
      <div style={{ 
        padding: '20px', 
        borderTop: '1px solid #dee2e6',
        backgroundColor: '#f8f9fa'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Assignment Summary</h4>
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
              Lead Coordinators: {assignments.filter(a => a.role === 'lead_coordinator').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              Coordinators: {assignments.filter(a => a.role === 'coordinator').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              Volunteers: {assignments.filter(a => a.role === 'volunteer').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              Faculty: {assignments.filter(a => a.coordinator_type === 'faculty').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              Students: {assignments.filter(a => a.coordinator_type === 'student').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#6c757d', fontWeight: 'bold' }}>
              Total: {assignments.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventAssignmentTable;

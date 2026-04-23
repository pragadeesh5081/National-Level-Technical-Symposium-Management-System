import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const RegistrationTable = ({ showMessage }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await apiService.registrations.getAll();
      setRegistrations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      showMessage('Error fetching registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (registrationId, newStatus) => {
    try {
      await apiService.registrations.update(registrationId, { status: newStatus });
      showMessage('Registration status updated successfully', 'success');
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating registration status:', error);
      showMessage('Error updating registration status', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this registration?')) {
      try {
        await apiService.registrations.delete(id);
        showMessage('Registration deleted successfully', 'success');
        fetchRegistrations();
      } catch (error) {
        console.error('Error deleting registration:', error);
        showMessage('Error deleting registration', 'error');
      }
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    if (filter === 'all') return true;
    return reg.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'registered':
        return '#28a745';
      case 'completed':
        return '#007bff';
      case 'cancelled':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Registrations...</h2>
      </div>
    );
  }

  return (
    <div className="table-container">
      <div style={{ 
        padding: '20px', 
        borderBottom: '1px solid #dee2e6',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: '0' }}>
          Registrations ({filteredRegistrations.length})
        </h3>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <label htmlFor="filter" style={{ margin: '0', fontSize: '14px' }}>Filter:</label>
          <select
            id="filter"
            className="form-control"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="all">All</option>
            <option value="registered">Registered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {registrations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No registrations found
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No registrations found for the selected filter
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Participant</th>
                <th>College</th>
                <th>Department</th>
                <th>Event</th>
                <th>Event Type</th>
                <th>Event Date</th>
                <th>Venue</th>
                <th>Registration Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegistrations.map(registration => (
                <tr key={registration.registration_id}>
                  <td>{registration.registration_id}</td>
                  <td>
                    <strong>{registration.participant_name}</strong>
                  </td>
                  <td>{registration.college}</td>
                  <td>{registration.department}</td>
                  <td>
                    <strong>{registration.event_name}</strong>
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      backgroundColor: '#e9ecef',
                      color: '#495057'
                    }}>
                      {registration.event_type}
                    </span>
                  </td>
                  <td>{new Date(registration.event_date).toLocaleDateString()}</td>
                  <td>{registration.venue || '-'}</td>
                  <td>{new Date(registration.registration_date).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="form-control"
                      value={registration.status}
                      onChange={(e) => handleStatusChange(registration.registration_id, e.target.value)}
                      style={{
                        width: 'auto',
                        fontSize: '12px',
                        padding: '4px 8px',
                        backgroundColor: getStatusColor(registration.status),
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      <option value="registered" style={{ color: '#333' }}>Registered</option>
                      <option value="completed" style={{ color: '#333' }}>Completed</option>
                      <option value="cancelled" style={{ color: '#333' }}>Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(registration.registration_id)}
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
        <h4 style={{ margin: '0 0 15px 0', color: '#495057' }}>Registration Summary</h4>
        <div style={{ display: 'flex', gap: '30px' }}>
          <div>
            <span style={{ color: '#28a745', fontWeight: 'bold' }}>
              Registered: {registrations.filter(r => r.status === 'registered').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#007bff', fontWeight: 'bold' }}>
              Completed: {registrations.filter(r => r.status === 'completed').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#dc3545', fontWeight: 'bold' }}>
              Cancelled: {registrations.filter(r => r.status === 'cancelled').length}
            </span>
          </div>
          <div>
            <span style={{ color: '#6c757d', fontWeight: 'bold' }}>
              Total: {registrations.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationTable;

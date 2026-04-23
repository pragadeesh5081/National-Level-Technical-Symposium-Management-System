import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const EventAssignmentForm = ({ showMessage }) => {
  const [formData, setFormData] = useState({
    coordinator_id: '',
    event_id: '',
    role: 'coordinator'
  });
  const [coordinators, setCoordinators] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoordinators();
    fetchEvents();
  }, []);

  const fetchCoordinators = async () => {
    try {
      const response = await apiService.coordinators.getAll();
      setCoordinators(response.data.data || []);
    } catch (error) {
      console.error('Error fetching coordinators:', error);
      showMessage('Error fetching coordinators', 'error');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await apiService.events.getAll();
      setEvents(response.data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      showMessage('Error fetching events', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.coordinator_id || !formData.event_id) {
      showMessage('Please select both coordinator and event', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiService.eventAssignments.create(formData);
      showMessage('Coordinator assigned to event successfully!', 'success');
      
      // Reset form
      setFormData({
        coordinator_id: '',
        event_id: '',
        role: 'coordinator'
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
      showMessage(error.response?.data?.error || 'Error creating assignment', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>Assign Coordinator to Event</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="coordinator_id">Select Coordinator *</label>
            <select
              id="coordinator_id"
              name="coordinator_id"
              className="form-control"
              value={formData.coordinator_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose a coordinator...</option>
              {coordinators.map(coordinator => (
                <option key={coordinator.coordinator_id} value={coordinator.coordinator_id}>
                  {coordinator.name} ({coordinator.type}){coordinator.department ? ` - ${coordinator.department}` : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="event_id">Select Event *</label>
            <select
              id="event_id"
              name="event_id"
              className="form-control"
              value={formData.event_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose an event...</option>
              {events.map(event => (
                <option key={event.event_id} value={event.event_id}>
                  {event.event_name} - {new Date(event.event_date).toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="role">Role</label>
          <select
            id="role"
            name="role"
            className="form-control"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="coordinator">Coordinator</option>
            <option value="lead_coordinator">Lead Coordinator</option>
            <option value="volunteer">Volunteer</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Assigning...' : 'Assign Coordinator'}
        </button>
      </form>
      
      {coordinators.length === 0 && (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          <strong>Note:</strong> No coordinators available. Please add coordinators first.
        </div>
      )}
      
      {events.length === 0 && (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          <strong>Note:</strong> No events available. Please add events first.
        </div>
      )}
    </div>
  );
};

export default EventAssignmentForm;

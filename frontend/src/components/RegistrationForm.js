import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const RegistrationForm = ({ showMessage }) => {
  const [formData, setFormData] = useState({
    participant_id: '',
    event_id: '',
    status: 'registered'
  });
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchParticipants();
    fetchEvents();
  }, []);

  const fetchParticipants = async () => {
    try {
      const response = await apiService.participants.getAll();
      setParticipants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching participants:', error);
      showMessage('Error fetching participants', 'error');
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
    
    if (!formData.participant_id || !formData.event_id) {
      showMessage('Please select both participant and event', 'error');
      return;
    }

    setLoading(true);
    try {
      await apiService.registrations.create(formData);
      showMessage('Registration successful!', 'success');
      
      // Reset form
      setFormData({
        participant_id: '',
        event_id: '',
        status: 'registered'
      });
    } catch (error) {
      console.error('Error creating registration:', error);
      showMessage(error.response?.data?.error || 'Error creating registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>Register Participant for Event</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="participant_id">Select Participant *</label>
            <select
              id="participant_id"
              name="participant_id"
              className="form-control"
              value={formData.participant_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Choose a participant...</option>
              {participants.map(participant => (
                <option key={participant.participant_id} value={participant.participant_id}>
                  {participant.name} - {participant.college} ({participant.department})
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
                  {event.event_name} - {new Date(event.event_date).toLocaleDateString()} ({event.event_type})
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            className="form-control"
            value={formData.status}
            onChange={handleInputChange}
          >
            <option value="registered">Registered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register Participant'}
        </button>
      </form>
      
      {participants.length === 0 && (
        <div className="alert alert-info" style={{ marginTop: '20px' }}>
          <strong>Note:</strong> No participants available. Please add participants first.
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

export default RegistrationForm;

import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const EventForm = ({ showMessage }) => {
  const [formData, setFormData] = useState({
    event_name: '',
    event_type: 'Technical',
    description: '',
    event_date: '',
    venue: '',
    max_participants: 100
  });
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

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
    
    if (!formData.event_name || !formData.event_type || !formData.event_date) {
      showMessage('Event name, type, and date are required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await apiService.events.update(editingId, formData);
        showMessage('Event updated successfully', 'success');
        setEditingId(null);
      } else {
        await apiService.events.create(formData);
        showMessage('Event added successfully', 'success');
      }
      
      // Reset form
      setFormData({
        event_name: '',
        event_type: 'Technical',
        description: '',
        event_date: '',
        venue: '',
        max_participants: 100
      });
      
      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      showMessage(error.response?.data?.error || 'Error saving event', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setFormData({
      event_name: event.event_name,
      event_type: event.event_type,
      description: event.description || '',
      event_date: event.event_date,
      venue: event.venue || '',
      max_participants: event.max_participants || 100
    });
    setEditingId(event.event_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This will also delete all registrations for this event.')) {
      try {
        await apiService.events.delete(id);
        showMessage('Event deleted successfully', 'success');
        fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        showMessage('Error deleting event', 'error');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      event_name: '',
      event_type: 'Technical',
      description: '',
      event_date: '',
      venue: '',
      max_participants: 100
    });
    setEditingId(null);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>
        {editingId ? 'Edit Event' : 'Add Event'}
      </h2>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_name">Event Name *</label>
              <input
                type="text"
                id="event_name"
                name="event_name"
                className="form-control"
                value={formData.event_name}
                onChange={handleInputChange}
                placeholder="Enter event name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="event_type">Event Type *</label>
              <select
                id="event_type"
                name="event_type"
                className="form-control"
                value={formData.event_type}
                onChange={handleInputChange}
                required
              >
                <option value="Technical">Technical</option>
                <option value="Non-Technical">Non-Technical</option>
                <option value="Workshop">Workshop</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="event_date">Event Date *</label>
              <input
                type="date"
                id="event_date"
                name="event_date"
                className="form-control"
                value={formData.event_date}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="venue">Venue</label>
              <input
                type="text"
                id="venue"
                name="venue"
                className="form-control"
                value={formData.venue}
                onChange={handleInputChange}
                placeholder="Enter venue"
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="max_participants">Max Participants</label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                className="form-control"
                value={formData.max_participants}
                onChange={handleInputChange}
                min="1"
                placeholder="Maximum participants"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                className="form-control"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter event description"
                rows="3"
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingId ? 'Update Event' : 'Add Event')}
            </button>
            
            {editingId && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Events List */}
      <div className="table-container">
        <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
          Events List ({events.length})
        </h3>
        
        {events.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            No events added yet
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Event Name</th>
                <th>Type</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Max Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map(event => (
                <tr key={event.event_id}>
                  <td>{event.event_id}</td>
                  <td>{event.event_name}</td>
                  <td>{event.event_type}</td>
                  <td>{new Date(event.event_date).toLocaleDateString()}</td>
                  <td>{event.venue || '-'}</td>
                  <td>{event.max_participants}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(event)}
                      style={{ marginRight: '5px', fontSize: '12px', padding: '5px 10px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(event.event_id)}
                      style={{ fontSize: '12px', padding: '5px 10px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EventForm;

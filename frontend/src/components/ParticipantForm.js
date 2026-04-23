import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const ParticipantForm = ({ showMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    department: '',
    email: '',
    phone: ''
  });
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchParticipants();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.college || !formData.department) {
      showMessage('Name, college, and department are required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await apiService.participants.update(editingId, formData);
        showMessage('Participant updated successfully', 'success');
        setEditingId(null);
      } else {
        await apiService.participants.create(formData);
        showMessage('Participant added successfully', 'success');
      }
      
      // Reset form
      setFormData({
        name: '',
        college: '',
        department: '',
        email: '',
        phone: ''
      });
      
      // Refresh participants list
      fetchParticipants();
    } catch (error) {
      console.error('Error saving participant:', error);
      showMessage(error.response?.data?.error || 'Error saving participant', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (participant) => {
    setFormData({
      name: participant.name,
      college: participant.college,
      department: participant.department,
      email: participant.email || '',
      phone: participant.phone || ''
    });
    setEditingId(participant.participant_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      try {
        await apiService.participants.delete(id);
        showMessage('Participant deleted successfully', 'success');
        fetchParticipants();
      } catch (error) {
        console.error('Error deleting participant:', error);
        showMessage('Error deleting participant', 'error');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      college: '',
      department: '',
      email: '',
      phone: ''
    });
    setEditingId(null);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>
        {editingId ? 'Edit Participant' : 'Add Participant'}
      </h2>
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter participant name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="college">College *</label>
              <input
                type="text"
                id="college"
                name="college"
                className="form-control"
                value={formData.college}
                onChange={handleInputChange}
                placeholder="Enter college name"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department *</label>
              <input
                type="text"
                id="department"
                name="department"
                className="form-control"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="Enter department"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="form-control"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingId ? 'Update Participant' : 'Add Participant')}
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
      
      {/* Participants List */}
      <div className="table-container">
        <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
          Participants List ({participants.length})
        </h3>
        
        {participants.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            No participants added yet
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>College</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(participant => (
                <tr key={participant.participant_id}>
                  <td>{participant.participant_id}</td>
                  <td>{participant.name}</td>
                  <td>{participant.college}</td>
                  <td>{participant.department}</td>
                  <td>{participant.email || '-'}</td>
                  <td>{participant.phone || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(participant)}
                      style={{ marginRight: '5px', fontSize: '12px', padding: '5px 10px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(participant.participant_id)}
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

export default ParticipantForm;

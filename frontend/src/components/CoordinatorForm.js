import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const CoordinatorForm = ({ showMessage }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'student',
    email: '',
    phone: '',
    department: ''
  });
  const [coordinators, setCoordinators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCoordinators();
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.type) {
      showMessage('Name and type are required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await apiService.coordinators.update(editingId, formData);
        showMessage('Coordinator updated successfully', 'success');
        setEditingId(null);
      } else {
        await apiService.coordinators.create(formData);
        showMessage('Coordinator added successfully', 'success');
      }
      
      // Reset form
      setFormData({
        name: '',
        type: 'student',
        email: '',
        phone: '',
        department: ''
      });
      
      // Refresh coordinators list
      fetchCoordinators();
    } catch (error) {
      console.error('Error saving coordinator:', error);
      showMessage(error.response?.data?.error || 'Error saving coordinator', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coordinator) => {
    setFormData({
      name: coordinator.name,
      type: coordinator.type,
      email: coordinator.email || '',
      phone: coordinator.phone || '',
      department: coordinator.department || ''
    });
    setEditingId(coordinator.coordinator_id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coordinator?')) {
      try {
        await apiService.coordinators.delete(id);
        showMessage('Coordinator deleted successfully', 'success');
        fetchCoordinators();
      } catch (error) {
        console.error('Error deleting coordinator:', error);
        showMessage('Error deleting coordinator', 'error');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      type: 'student',
      email: '',
      phone: '',
      department: ''
    });
    setEditingId(null);
  };

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>
        {editingId ? 'Edit Coordinator' : 'Add Coordinator'}
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
                placeholder="Enter coordinator name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                className="form-control"
                value={formData.type}
                onChange={handleInputChange}
                required
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
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
          </div>
          
          <div className="form-group">
            <label htmlFor="department">Department</label>
            <input
              type="text"
              id="department"
              name="department"
              className="form-control"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Enter department"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingId ? 'Update Coordinator' : 'Add Coordinator')}
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
      
      {/* Coordinators List */}
      <div className="table-container">
        <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
          Coordinators List ({coordinators.length})
        </h3>
        
        {coordinators.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
            No coordinators added yet
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coordinators.map(coordinator => (
                <tr key={coordinator.coordinator_id}>
                  <td>{coordinator.coordinator_id}</td>
                  <td>{coordinator.name}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: coordinator.type === 'faculty' ? '#28a745' : '#007bff',
                      color: 'white'
                    }}>
                      {coordinator.type}
                    </span>
                  </td>
                  <td>{coordinator.email || '-'}</td>
                  <td>{coordinator.phone || '-'}</td>
                  <td>{coordinator.department || '-'}</td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleEdit(coordinator)}
                      style={{ marginRight: '5px', fontSize: '12px', padding: '5px 10px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(coordinator.coordinator_id)}
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

export default CoordinatorForm;

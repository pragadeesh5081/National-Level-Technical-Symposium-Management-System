import React, { useState, useEffect } from 'react';
import './App.css';
import ParticipantForm from './components/ParticipantForm';
import EventForm from './components/EventForm';
import CoordinatorForm from './components/CoordinatorForm';
import RegistrationForm from './components/RegistrationForm';
import RegistrationTable from './components/RegistrationTable';
import EventAssignmentForm from './components/EventAssignmentForm';
import EventAssignmentTable from './components/EventAssignmentTable';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';
import apiService from './services/apiService';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  // Show message function
  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  // Clear message function
  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard showMessage={showMessage} />;
      case 'participants':
        return <ParticipantForm showMessage={showMessage} />;
      case 'events':
        return <EventForm showMessage={showMessage} />;
      case 'coordinators':
        return <CoordinatorForm showMessage={showMessage} />;
      case 'registrations':
        return (
          <div>
            <RegistrationForm showMessage={showMessage} />
            <div style={{ marginTop: '30px' }}>
              <RegistrationTable showMessage={showMessage} />
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div>
            <EventAssignmentForm showMessage={showMessage} />
            <div style={{ marginTop: '30px' }}>
              <EventAssignmentTable showMessage={showMessage} />
            </div>
          </div>
        );
      case 'reports':
        return <Reports showMessage={showMessage} />;
      default:
        return <Dashboard showMessage={showMessage} />;
    }
  };

  return (
    <div className="App">
      <div className="header">
        <h1>National Level Technical Symposium Management System</h1>
      </div>
      
      <div className="container">
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
            <button 
              onClick={clearMessage}
              style={{ 
                float: 'right', 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ×
            </button>
          </div>
        )}
        
        <div className="nav-tabs">
          <button 
            className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`nav-tab ${activeTab === 'participants' ? 'active' : ''}`}
            onClick={() => setActiveTab('participants')}
          >
            Add Participant
          </button>
          <button 
            className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Add Event
          </button>
          <button 
            className={`nav-tab ${activeTab === 'coordinators' ? 'active' : ''}`}
            onClick={() => setActiveTab('coordinators')}
          >
            Add Coordinator
          </button>
          <button 
            className={`nav-tab ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            Registrations
          </button>
          <button 
            className={`nav-tab ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Event Assignments
          </button>
          <button 
            className={`nav-tab ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            Reports
          </button>
        </div>
        
        <div className="tab-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

export default App;

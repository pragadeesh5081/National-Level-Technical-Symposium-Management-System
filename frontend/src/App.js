import React, { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import ParticipantForm from './components/ParticipantForm';
import EventForm from './components/EventForm';
import CoordinatorForm from './components/CoordinatorForm';
import RegistrationForm from './components/RegistrationForm';
import RegistrationTable from './components/RegistrationTable';
import EventAssignmentForm from './components/EventAssignmentForm';
import EventAssignmentTable from './components/EventAssignmentTable';
import Dashboard from './components/Dashboard';
import Reports from './components/Reports';

// ─── Inner App (uses auth context) ───────────────────────────────────────────
function AppInner() {
  const { isAuthenticated, loading, admin, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const clearMessage = () => {
    setMessage('');
    setMessageType('');
  };

  // While checking token validity on refresh
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', gap: 16, color: '#6c757d' }}>
        <p style={{ fontSize: '1.1rem' }}>Loading...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login />;
  }

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
        <div className="header-user">
          <span className="header-username">👤 {admin?.username}</span>
          <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>

      <div className="container">
        {message && (
          <div className={`alert alert-${messageType}`}>
            {message}
            <button
              onClick={clearMessage}
              style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
            >
              ×
            </button>
          </div>
        )}

        <div className="nav-tabs">
          {[
            { key: 'dashboard', label: 'Dashboard' },
            { key: 'participants', label: 'Add Participant' },
            { key: 'events', label: 'Add Event' },
            { key: 'coordinators', label: 'Add Coordinator' },
            { key: 'registrations', label: 'Registrations' },
            { key: 'assignments', label: 'Event Assignments' },
            { key: 'reports', label: 'Reports' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`nav-tab ${activeTab === key ? 'active' : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="tab-content">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
}

// ─── Root App (provides auth context) ────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

export default App;

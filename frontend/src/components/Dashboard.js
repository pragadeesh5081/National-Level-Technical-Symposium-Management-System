import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const Dashboard = ({ showMessage }) => {
  const [stats, setStats] = useState({
    participants: 0,
    events: 0,
    coordinators: 0,
    registrations: 0,
    facultyCoordinators: 0,
    studentCoordinators: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        participantsRes,
        eventsRes,
        coordinatorsRes,
        registrationsRes,
        eventsWithStatsRes,
        registrationsListRes
      ] = await Promise.all([
        apiService.participants.getAll(),
        apiService.events.getAll(),
        apiService.coordinators.getAll(),
        apiService.registrations.getStats(),
        apiService.events.getWithStats(),
        apiService.registrations.getAll()
      ]);

      const participants = participantsRes.data.data || [];
      const events = eventsRes.data.data || [];
      const coordinators = coordinatorsRes.data.data || [];
      const registrationStats = registrationsRes.data.data || [];
      const eventsWithStats = eventsWithStatsRes.data.data || [];
      const registrationsList = registrationsListRes.data.data || [];

      // Calculate stats
      const facultyCount = coordinators.filter(c => c.type === 'faculty').length;
      const studentCount = coordinators.filter(c => c.type === 'student').length;
      
      // Count upcoming events (events after today)
      const today = new Date();
      const upcomingCount = events.filter(event => new Date(event.event_date) >= today).length;

      // Get upcoming events
      const upcoming = events
        .filter(event => new Date(event.event_date) >= today)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 5);

      // Get recent registrations (last 5)
      const recent = registrationsList
        .sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
        .slice(0, 5);

      setStats({
        participants: participants.length,
        events: events.length,
        coordinators: coordinators.length,
        registrations: registrationStats.reduce((sum, stat) => sum + stat.total_registrations, 0),
        facultyCoordinators: facultyCount,
        studentCoordinators: studentCount,
        upcomingEvents: upcomingCount,
      });

      setUpcomingEvents(upcoming);
      setRecentRegistrations(recent);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showMessage('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>Dashboard Overview</h2>
      
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.participants}</div>
          <div className="stat-label">Total Participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.events}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.coordinators}</div>
          <div className="stat-label">Total Coordinators</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.registrations}</div>
          <div className="stat-label">Total Registrations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.facultyCoordinators}</div>
          <div className="stat-label">Faculty Coordinators</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.studentCoordinators}</div>
          <div className="stat-label">Student Coordinators</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.upcomingEvents}</div>
          <div className="stat-label">Upcoming Events</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Upcoming Events */}
        <div className="form-container">
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <p style={{ color: '#6c757d', textAlign: 'center' }}>No upcoming events</p>
          ) : (
            <div>
              {upcomingEvents.map(event => (
                <div key={event.event_id} style={{ 
                  padding: '15px', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '4px', 
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#007bff' }}>{event.event_name}</h4>
                  <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                    <strong>Date:</strong> {new Date(event.event_date).toLocaleDateString()}<br />
                    <strong>Type:</strong> {event.event_type}<br />
                    <strong>Venue:</strong> {event.venue || 'Not specified'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="form-container">
          <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>Recent Registrations</h3>
          {recentRegistrations.length === 0 ? (
            <p style={{ color: '#6c757d', textAlign: 'center' }}>No registrations yet</p>
          ) : (
            <div>
              {recentRegistrations.map(reg => (
                <div key={reg.registration_id} style={{ 
                  padding: '15px', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '4px', 
                  marginBottom: '10px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <h4 style={{ margin: '0 0 5px 0', color: '#28a745' }}>{reg.participant_name}</h4>
                  <p style={{ margin: '0', color: '#6c757d', fontSize: '14px' }}>
                    <strong>Event:</strong> {reg.event_name}<br />
                    <strong>College:</strong> {reg.college}<br />
                    <strong>Date:</strong> {new Date(reg.registration_date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

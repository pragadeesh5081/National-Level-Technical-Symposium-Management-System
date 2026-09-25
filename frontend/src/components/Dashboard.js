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
  const [error, setError] = useState(false);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(false);

      // Use allSettled so one failing call doesn't crash the whole dashboard
      const [
        participantsRes,
        eventsRes,
        coordinatorsRes,
        registrationsRes,
        registrationsListRes
      ] = await Promise.allSettled([
        apiService.participants.getAll(),
        apiService.events.getAll(),
        apiService.coordinators.getAll(),
        apiService.registrations.getStats(),
        apiService.registrations.getAll()
      ]);

      const getValue = (result) =>
        result.status === 'fulfilled' ? (result.value?.data?.data || []) : [];

      const participants = getValue(participantsRes);
      const events = getValue(eventsRes);
      const coordinators = getValue(coordinatorsRes);
      const registrationStats = getValue(registrationsRes);
      const registrationsList = getValue(registrationsListRes);

      // Calculate stats
      const facultyCount = coordinators.filter(c => c.type === 'faculty').length;
      const studentCount = coordinators.filter(c => c.type === 'student').length;

      // Count upcoming events (events after today)
      const today = new Date();
      const upcomingCount = events.filter(event => new Date(event.event_date) >= today).length;

      // Get upcoming events (sorted, top 5)
      const upcoming = events
        .filter(event => new Date(event.event_date) >= today)
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 5);

      // Get recent registrations (last 5)
      const recent = registrationsList
        .sort((a, b) => new Date(b.registration_date) - new Date(a.registration_date))
        .slice(0, 5);

      const totalRegistrations = registrationStats.reduce(
        (sum, stat) => sum + (Number(stat.total_registrations) || 0), 0
      );

      setStats({
        participants: participants.length,
        events: events.length,
        coordinators: coordinators.length,
        registrations: totalRegistrations,
        facultyCoordinators: facultyCount,
        studentCoordinators: studentCount,
        upcomingEvents: upcomingCount,
      });

      setUpcomingEvents(upcoming);
      setRecentRegistrations(recent);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(true);
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

  if (error) {
    return (
      <div className="loading">
        <h2>Failed to load dashboard</h2>
        <p style={{ color: '#6c757d', marginBottom: '20px' }}>
          Please check your connection and try again.
        </p>
        <button className="btn btn-primary" onClick={fetchDashboardData}>
          Retry
        </button>
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

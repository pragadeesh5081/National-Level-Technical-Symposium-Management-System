import React, { useState, useEffect } from 'react';
import apiService from '../services/apiService';

const Reports = ({ showMessage }) => {
  const [activeReport, setActiveReport] = useState('event-participants');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      
      // Fetch all report data in parallel
      const [
        eventParticipantsRes,
        eventCoordinatorsRes,
        participantsByCollegeRes,
        eventsByTypeRes,
        multiEventParticipantsRes,
        coordinatorWorkloadRes
      ] = await Promise.all([
        apiService.reports.getEventParticipants(),
        apiService.reports.getEventCoordinators(),
        apiService.reports.getParticipantsByCollege(),
        apiService.reports.getEventsByType(),
        apiService.reports.getMultiEventParticipants(),
        apiService.reports.getCoordinatorWorkload()
      ]);

      setData({
        eventParticipants: eventParticipantsRes.data.data || [],
        eventCoordinators: eventCoordinatorsRes.data.data || [],
        participantsByCollege: participantsByCollegeRes.data.data || [],
        eventsByType: eventsByTypeRes.data.data || [],
        multiEventParticipants: multiEventParticipantsRes.data.data || [],
        coordinatorWorkload: coordinatorWorkloadRes.data.data || []
      });
      
    } catch (error) {
      console.error('Error fetching reports:', error);
      showMessage('Error fetching reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderEventParticipants = () => (
    <div className="table-container">
      <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
        Event-wise Participant List
      </h3>
      
      {data.eventParticipants.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No data available
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Type</th>
              <th>Venue</th>
              <th>Total Participants</th>
              <th>Participants List</th>
            </tr>
          </thead>
          <tbody>
            {data.eventParticipants.map(event => (
              <tr key={event.event_id}>
                <td><strong>{event.event_name}</strong></td>
                <td>{new Date(event.event_date).toLocaleDateString()}</td>
                <td>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    backgroundColor: '#e9ecef',
                    color: '#495057'
                  }}>
                    {event.event_type}
                  </span>
                </td>
                <td>{event.venue || '-'}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: event.total_participants > 0 ? '#28a745' : '#6c757d',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {event.total_participants}
                  </span>
                </td>
                <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                  {event.participants_list || 'No participants'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderEventCoordinators = () => (
    <div className="table-container">
      <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
        Coordinator Assignments by Event
      </h3>
      
      {data.eventCoordinators.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No data available
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Date</th>
              <th>Type</th>
              <th>Venue</th>
              <th>Total Coordinators</th>
              <th>Coordinators List</th>
            </tr>
          </thead>
          <tbody>
            {data.eventCoordinators.map(event => (
              <tr key={event.event_id}>
                <td><strong>{event.event_name}</strong></td>
                <td>{new Date(event.event_date).toLocaleDateString()}</td>
                <td>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    backgroundColor: '#e9ecef',
                    color: '#495057'
                  }}>
                    {event.event_type}
                  </span>
                </td>
                <td>{event.venue || '-'}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: event.total_coordinators > 0 ? '#007bff' : '#6c757d',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {event.total_coordinators}
                  </span>
                </td>
                <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                  {event.coordinators_list || 'No coordinators assigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderParticipantsByCollege = () => (
    <div className="table-container">
      <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
        Participants by College
      </h3>
      
      {data.participantsByCollege.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No data available
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>College</th>
              <th>Participant Count</th>
              <th>Participants</th>
            </tr>
          </thead>
          <tbody>
            {data.participantsByCollege.map((college, index) => (
              <tr key={index}>
                <td><strong>{college.college}</strong></td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {college.participant_count}
                  </span>
                </td>
                <td style={{ maxWidth: '400px', wordBreak: 'break-word' }}>
                  {college.participants}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderMultiEventParticipants = () => (
    <div className="table-container">
      <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
        Participants Registered for Multiple Events
      </h3>
      
      {data.multiEventParticipants.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No participants registered for multiple events
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Participant Name</th>
              <th>College</th>
              <th>Department</th>
              <th>Events Registered</th>
              <th>Registered Events</th>
            </tr>
          </thead>
          <tbody>
            {data.multiEventParticipants.map(participant => (
              <tr key={participant.participant_id}>
                <td><strong>{participant.name}</strong></td>
                <td>{participant.college}</td>
                <td>{participant.department}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {participant.events_registered}
                  </span>
                </td>
                <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                  {participant.registered_events}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  const renderCoordinatorWorkload = () => (
    <div className="table-container">
      <h3 style={{ padding: '20px', margin: '0', borderBottom: '1px solid #dee2e6' }}>
        Coordinator Workload Analysis
      </h3>
      
      {data.coordinatorWorkload.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
          No data available
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Coordinator Name</th>
              <th>Type</th>
              <th>Department</th>
              <th>Assigned Events</th>
              <th>Lead Coordinator Count</th>
              <th>Assigned Events List</th>
            </tr>
          </thead>
          <tbody>
            {data.coordinatorWorkload.map(coordinator => (
              <tr key={coordinator.coordinator_id}>
                <td><strong>{coordinator.name}</strong></td>
                <td>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '11px',
                    backgroundColor: coordinator.type === 'faculty' ? '#28a745' : '#007bff',
                    color: 'white'
                  }}>
                    {coordinator.type}
                  </span>
                </td>
                <td>{coordinator.department || '-'}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: coordinator.assigned_events > 0 ? '#007bff' : '#6c757d',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {coordinator.assigned_events}
                  </span>
                </td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: coordinator.lead_coordinator_count > 0 ? '#dc3545' : '#6c757d',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {coordinator.lead_coordinator_count}
                  </span>
                </td>
                <td style={{ maxWidth: '300px', wordBreak: 'break-word' }}>
                  {coordinator.assigned_events_list || 'No events assigned'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading">
        <h2>Loading Reports...</h2>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>Reports & Analytics</h2>
      
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeReport === 'event-participants' ? 'active' : ''}`}
          onClick={() => setActiveReport('event-participants')}
        >
          Event Participants
        </button>
        <button 
          className={`nav-tab ${activeReport === 'event-coordinators' ? 'active' : ''}`}
          onClick={() => setActiveReport('event-coordinators')}
        >
          Event Coordinators
        </button>
        <button 
          className={`nav-tab ${activeReport === 'participants-college' ? 'active' : ''}`}
          onClick={() => setActiveReport('participants-college')}
        >
          Participants by College
        </button>
        <button 
          className={`nav-tab ${activeReport === 'multi-event' ? 'active' : ''}`}
          onClick={() => setActiveReport('multi-event')}
        >
          Multi-Event Participants
        </button>
        <button 
          className={`nav-tab ${activeReport === 'coordinator-workload' ? 'active' : ''}`}
          onClick={() => setActiveReport('coordinator-workload')}
        >
          Coordinator Workload
        </button>
      </div>
      
      <div className="tab-content">
        {activeReport === 'event-participants' && renderEventParticipants()}
        {activeReport === 'event-coordinators' && renderEventCoordinators()}
        {activeReport === 'participants-college' && renderParticipantsByCollege()}
        {activeReport === 'multi-event' && renderMultiEventParticipants()}
        {activeReport === 'coordinator-workload' && renderCoordinatorWorkload()}
      </div>
    </div>
  );
};

export default Reports;

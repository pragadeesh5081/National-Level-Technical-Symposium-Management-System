// API service for making HTTP requests to the backend
import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Participants API
export const participantsAPI = {
  // Get all participants
  getAll: () => api.get('/participants'),
  
  // Get participant by ID
  getById: (id) => api.get(`/participants/${id}`),
  
  // Create new participant
  create: (data) => api.post('/participants', data),
  
  // Update participant
  update: (id, data) => api.put(`/participants/${id}`, data),
  
  // Delete participant
  delete: (id) => api.delete(`/participants/${id}`),
};

// Events API
export const eventsAPI = {
  // Get all events
  getAll: () => api.get('/events'),
  
  // Get event by ID
  getById: (id) => api.get(`/events/${id}`),
  
  // Create new event
  create: (data) => api.post('/events', data),
  
  // Update event
  update: (id, data) => api.put(`/events/${id}`, data),
  
  // Delete event
  delete: (id) => api.delete(`/events/${id}`),
  
  // Get events with statistics
  getWithStats: () => api.get('/events/with-stats'),
};

// Coordinators API
export const coordinatorsAPI = {
  // Get all coordinators
  getAll: () => api.get('/coordinators'),
  
  // Get coordinator by ID
  getById: (id) => api.get(`/coordinators/${id}`),
  
  // Create new coordinator
  create: (data) => api.post('/coordinators', data),
  
  // Update coordinator
  update: (id, data) => api.put(`/coordinators/${id}`, data),
  
  // Delete coordinator
  delete: (id) => api.delete(`/coordinators/${id}`),
  
  // Get coordinators by type
  getByType: (type) => api.get(`/coordinators/by-type/${type}`),
};

// Registrations API
export const registrationsAPI = {
  // Get all registrations
  getAll: () => api.get('/registrations'),
  
  // Get registrations by event ID
  getByEvent: (eventId) => api.get(`/registrations/event/${eventId}`),
  
  // Get registrations by participant ID
  getByParticipant: (participantId) => api.get(`/registrations/participant/${participantId}`),
  
  // Create new registration
  create: (data) => api.post('/registrations', data),
  
  // Update registration
  update: (id, data) => api.put(`/registrations/${id}`, data),
  
  // Delete registration
  delete: (id) => api.delete(`/registrations/${id}`),
  
  // Get registration statistics
  getStats: () => api.get('/registrations/stats'),
};

// Event Assignments API
export const eventAssignmentsAPI = {
  // Get all event assignments
  getAll: () => api.get('/event-assignments'),
  
  // Get assignments by event ID
  getByEvent: (eventId) => api.get(`/event-assignments/event/${eventId}`),
  
  // Get assignments by coordinator ID
  getByCoordinator: (coordinatorId) => api.get(`/event-assignments/coordinator/${coordinatorId}`),
  
  // Create new event assignment
  create: (data) => api.post('/event-assignments', data),
  
  // Update assignment
  update: (id, data) => api.put(`/event-assignments/${id}`, data),
  
  // Delete assignment
  delete: (id) => api.delete(`/event-assignments/${id}`),
};

// Reports API (Bonus features)
export const reportsAPI = {
  // Get event-wise participant list
  getEventParticipants: () => api.get('/reports/event-participants'),
  
  // Get coordinator assigned to each event
  getEventCoordinators: () => api.get('/reports/event-coordinators'),
  
  // Get participants by college
  getParticipantsByCollege: () => api.get('/reports/participants-by-college'),
  
  // Get events by type with statistics
  getEventsByType: () => api.get('/reports/events-by-type'),
  
  // Get participants registered for multiple events
  getMultiEventParticipants: () => api.get('/reports/multi-event-participants'),
  
  // Get coordinators by workload
  getCoordinatorWorkload: () => api.get('/reports/coordinator-workload'),
  
  // Get comprehensive dashboard statistics
  getDashboardStats: () => api.get('/reports/dashboard-stats'),
};

// Export all APIs as a single service
const apiService = {
  participants: participantsAPI,
  events: eventsAPI,
  coordinators: coordinatorsAPI,
  registrations: registrationsAPI,
  eventAssignments: eventAssignmentsAPI,
  reports: reportsAPI,
};

export default apiService;

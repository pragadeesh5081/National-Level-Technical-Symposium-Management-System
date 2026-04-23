// Main server file for Symposium Management System
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');

// Import routes
const participantRoutes = require('./routes/participants');
const eventRoutes = require('./routes/events');
const coordinatorRoutes = require('./routes/coordinators');
const registrationRoutes = require('./routes/registrations');
const eventAssignmentRoutes = require('./routes/event-assignments');
const reportsRoutes = require('./routes/reports');
const resetRoutes = require('./routes/reset');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Test database connection on startup
testConnection();

// API Routes
app.use('/api/participants', participantRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/coordinators', coordinatorRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/event-assignments', eventAssignmentRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/reset', resetRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'National Level Technical Symposium Management System API',
    version: '1.0.0',
    endpoints: {
      participants: '/api/participants',
      events: '/api/events',
      coordinators: '/api/coordinators',
      registrations: '/api/registrations',
      eventAssignments: '/api/event-assignments',
      reports: '/api/reports'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested endpoint does not exist'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});

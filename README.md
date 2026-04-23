# National Level Technical Symposium Management System

A comprehensive web-based management system for organizing and managing technical symposiums with admin panel for managing participants, events, coordinators, and registrations.

## Project Overview

This system provides a complete solution for managing national-level technical symposiums with the following features:
- Admin-only access with comprehensive management capabilities
- Participant management with college and department tracking
- Event management with multiple event types and scheduling
- Coordinator assignment (faculty and student coordinators)
- Registration management with status tracking
- Advanced reporting and analytics

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - MySQL database driver
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with responsive design

### Database
- **MySQL** - Relational database management system
- **InnoDB** - Storage engine with foreign key support

## Database Schema

The system uses 6 main tables with all required constraints:

### Tables
1. **Admin** - System administrator accounts
2. **Participant** - Student/participant information
3. **Event** - Symposium events and competitions
4. **Coordinator** - Faculty and student coordinators
5. **Registration** - Junction table for participant-event relationships
6. **Event_Assignment** - Junction table for coordinator-event relationships

### Constraints Used
- **PRIMARY KEY** - Auto-increment primary keys
- **FOREIGN KEY** - Referential integrity with CASCADE DELETE
- **NOT NULL** - Required field constraints
- **UNIQUE** - Prevent duplicate entries
- **CHECK** - Data validation constraints
- **DEFAULT** - Default values for timestamps and status
- **AUTO_INCREMENT** - Automatic primary key generation

## Project Structure

```
symposium-management/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |   |-- database.js     # Database configuration
|   |   |-- routes/
|   |   |   |-- participants.js # Participant API routes
|   |   |   |-- events.js       # Event API routes
|   |   |   |-- coordinators.js # Coordinator API routes
|   |   |   |-- registrations.js # Registration API routes
|   |   |   |-- event-assignments.js # Assignment API routes
|   |   |   |-- reports.js      # Reports API routes
|   |   |-- server.js           # Main server file
|   |-- .env                    # Environment variables
|   |-- package.json            # Backend dependencies
|
|-- frontend/
|   |-- public/
|   |   |-- index.html          # HTML template
|   |-- src/
|   |   |-- components/
|   |   |   |-- Dashboard.js    # Dashboard component
|   |   |   |-- ParticipantForm.js # Participant management
|   |   |   |-- EventForm.js    # Event management
|   |   |   |-- CoordinatorForm.js # Coordinator management
|   |   |   |-- RegistrationForm.js # Registration form
|   |   |   |-- RegistrationTable.js # Registration table
|   |   |   |-- EventAssignmentForm.js # Assignment form
|   |   |   |-- EventAssignmentTable.js # Assignment table
|   |   |   |-- Reports.js      # Reports and analytics
|   |   |-- services/
|   |   |   |-- apiService.js   # API service layer
|   |   |-- App.js              # Main React app
|   |   |-- index.js            # React entry point
|   |   |-- index.css           # Global styles
|   |   |-- App.css             # App-specific styles
|   |-- package.json            # Frontend dependencies
|
|-- database/
|   |-- schema.sql              # Database schema (DDL)
|   |-- sample_data.sql         # Sample data (DML)
|   |-- sample_queries.sql      # Sample queries (DQL)
|
|-- docs/
|   |-- ER-Diagram.md           # ER diagram documentation
|
|-- README.md                   # This file
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

### Database Setup

1. **Create Database**
   ```sql
   CREATE DATABASE symposium_management;
   USE symposium_management;
   ```

2. **Run Schema**
   ```bash
   mysql -u root -p < database/schema.sql
   ```

3. **Insert Sample Data**
   ```bash
   mysql -u root -p < database/sample_data.sql
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Start backend server**
   ```bash
   npm start
   # For development with auto-reload
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start frontend development server**
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Participants
- `GET /api/participants` - Get all participants
- `GET /api/participants/:id` - Get participant by ID
- `POST /api/participants` - Create new participant
- `PUT /api/participants/:id` - Update participant
- `DELETE /api/participants/:id` - Delete participant

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/events/with-stats` - Get events with statistics

### Coordinators
- `GET /api/coordinators` - Get all coordinators
- `GET /api/coordinators/:id` - Get coordinator by ID
- `POST /api/coordinators` - Create new coordinator
- `PUT /api/coordinators/:id` - Update coordinator
- `DELETE /api/coordinators/:id` - Delete coordinator
- `GET /api/coordinators/by-type/:type` - Get coordinators by type

### Registrations
- `GET /api/registrations` - Get all registrations
- `GET /api/registrations/event/:eventId` - Get registrations by event
- `GET /api/registrations/participant/:participantId` - Get registrations by participant
- `POST /api/registrations` - Create new registration
- `PUT /api/registrations/:id` - Update registration
- `DELETE /api/registrations/:id` - Delete registration
- `GET /api/registrations/stats` - Get registration statistics

### Event Assignments
- `GET /api/event-assignments` - Get all assignments
- `GET /api/event-assignments/event/:eventId` - Get assignments by event
- `GET /api/event-assignments/coordinator/:coordinatorId` - Get assignments by coordinator
- `POST /api/event-assignments` - Create new assignment
- `PUT /api/event-assignments/:id` - Update assignment
- `DELETE /api/event-assignments/:id` - Delete assignment

### Reports (Bonus Features)
- `GET /api/reports/event-participants` - Event-wise participant list
- `GET /api/reports/event-coordinators` - Event-wise coordinator assignments
- `GET /api/reports/participants-by-college` - Participants grouped by college
- `GET /api/reports/multi-event-participants` - Participants in multiple events
- `GET /api/reports/coordinator-workload` - Coordinator workload analysis
- `GET /api/reports/dashboard-stats` - Comprehensive dashboard statistics

## Features

### Core Functionality
- **Dashboard** - Overview with statistics and recent activities
- **Participant Management** - Add, edit, delete participants
- **Event Management** - Create and manage symposium events
- **Coordinator Management** - Add faculty and student coordinators
- **Registration Management** - Register participants for events
- **Event Assignments** - Assign coordinators to events

### Bonus Features
- **Event-wise Reports** - Detailed participant lists per event
- **Coordinator Reports** - Assignment tracking and workload analysis
- **College-wise Statistics** - Participant distribution by college
- **Multi-event Participants** - Identify participants in multiple events
- **Advanced Analytics** - Comprehensive reporting and insights

## Database Constraints Implementation

All 7 mandatory constraints are implemented:

1. **PRIMARY KEY**: Auto-increment IDs in all tables
2. **FOREIGN KEY**: Referential integrity with CASCADE DELETE
3. **NOT NULL**: Required fields validation
4. **UNIQUE**: Prevent duplicate usernames, emails, event names
5. **CHECK**: Data validation (dates, lengths, enum values)
6. **DEFAULT**: Default values for timestamps and status fields
7. **AUTO_INCREMENT**: Automatic primary key generation

## Sample Data

The system includes comprehensive sample data:
- 2 Admin users
- 8 Participants from different colleges
- 8 Events of various types
- 8 Coordinators (faculty and student)
- 15 Registrations
- 14 Event assignments

## ER Diagram

The database follows a normalized structure with:
- Many-to-many relationships between Participants and Events
- Many-to-many relationships between Coordinators and Events
- Proper foreign key constraints and referential integrity

See `docs/ER-Diagram.md` for detailed ER diagram documentation.

## Development Notes

### Backend
- RESTful API design with proper HTTP methods
- Error handling with meaningful error messages
- Input validation and sanitization
- Database connection pooling for performance

### Frontend
- Component-based architecture
- Responsive design for mobile and desktop
- Real-time updates without page refresh
- User-friendly error handling and notifications

### Database
- Third Normal Form (3NF) compliance
- Optimized indexes for performance
- Cascade delete for data consistency
- Comprehensive constraints for data integrity

## Future Enhancements

- User authentication and authorization
- Email notifications for registrations
- Certificate generation for participants
- Payment integration for event fees
- Mobile application
- Real-time chat support
- Advanced analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For any issues or questions, please contact the development team or create an issue in the repository.

---

**Project Completion Time**: ~4 hours
**Difficulty Level**: Beginner to Intermediate
**Database**: MySQL with 7 constraints implemented
**API**: RESTful with Express.js
**Frontend**: React with modern UI patterns

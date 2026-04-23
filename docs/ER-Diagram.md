# ER Diagram - National Level Technical Symposium Management System

## Entity Relationship Diagram

```
+-------------+       +----------------+       +-------------+
|   Admin     |       |   Participant  |       |    Event    |
+-------------+       +----------------+       +-------------+
| admin_id (PK)|       | participant_id (PK)|   | event_id (PK)|
| username    |       | name           |       | event_name  |
| password    |       | college        |       | event_type  |
| email       |       | department     |       | description |
| created_at  |       | email          |       | event_date  |
| is_active   |       | phone          |       | venue       |
+-------------+       | registration_date|   | max_participants|
                      +----------------+       | created_at  |
                                              +-------------+
                                                    |
                                                    |
                                                    | 1
                                                    |
                                                    |
+----------------+       +----------------+       +-------------+
|  Coordinator   |       |   Registration |       |Event_Assignment|
+----------------+       +----------------+       +-------------+
|coordinator_id(PK)|     |registration_id(PK)|     |assignment_id(PK)|
| name           |       | participant_id (FK)|   | coordinator_id(FK)|
| type           |       | event_id (FK)  |       | event_id (FK) |
| email          |       | registration_date|   | role         |
| phone          |       | status         |       | assigned_date|
| department     |       +----------------+       +-------------+
+----------------+               |
                                | M
                                |
                                |
+----------------+       +----------------+
|   Event        |<------|   Registration |
+----------------+       +----------------+
| event_id (PK)  |       | registration_id (PK)|
| event_name     |       | participant_id (FK)|
| event_type     |       | event_id (FK)  |
| description    |       | registration_date|
| event_date     |       | status         |
| venue          |       +----------------+
| max_participants|
| created_at     |
+----------------+

+----------------+       +----------------+
|   Event        |<------|Event_Assignment|
+----------------+       +----------------+
| event_id (PK)  |       | assignment_id (PK)|
| event_name     |       | coordinator_id(FK)|
| event_type     |       | event_id (FK)  |
| description    |       | role           |
| event_date     |       | assigned_date  |
| venue          |       +----------------+
| max_participants|
| created_at     |
+----------------+

+----------------+       +----------------+
|  Coordinator   |<------|Event_Assignment|
+----------------+       +----------------+
|coordinator_id(PK)|     | assignment_id (PK)|
| name           |       | coordinator_id(FK)|
| type           |       | event_id (FK)  |
| email          |       | role           |
| phone          |       | assigned_date  |
| department     |       +----------------+
+----------------+
```

## Relationships

### 1. Participant - Event (Many-to-Many)
- **Table**: `Registration` (Junction Table)
- **Relationship**: One participant can register for multiple events, one event can have multiple participants
- **Foreign Keys**: 
  - `participant_id` references `Participant(participant_id)`
  - `event_id` references `Event(event_id)`
- **Constraints**: 
  - UNIQUE (participant_id, event_id) to prevent duplicate registrations
  - CASCADE DELETE on both foreign keys

### 2. Coordinator - Event (Many-to-Many)
- **Table**: `Event_Assignment` (Junction Table)
- **Relationship**: One coordinator can be assigned to multiple events, one event can have multiple coordinators
- **Foreign Keys**:
  - `coordinator_id` references `Coordinator(coordinator_id)`
  - `event_id` references `Event(event_id)`
- **Constraints**:
  - UNIQUE (coordinator_id, event_id) to prevent duplicate assignments
  - CASCADE DELETE on both foreign keys

## Entity Descriptions

### Admin
- **Purpose**: System administrator accounts
- **Primary Key**: admin_id (AUTO_INCREMENT)
- **Constraints**: UNIQUE username, UNIQUE email

### Participant
- **Purpose**: Students/participants in the symposium
- **Primary Key**: participant_id (AUTO_INCREMENT)
- **Constraints**: CHECK for name and college length, UNIQUE email

### Event
- **Purpose**: Symposium events/competitions
- **Primary Key**: event_id (AUTO_INCREMENT)
- **Constraints**: UNIQUE event_name, CHECK for future dates, CHECK for max_participants > 0

### Coordinator
- **Purpose**: Faculty/student coordinators for events
- **Primary Key**: coordinator_id (AUTO_INCREMENT)
- **Constraints**: ENUM type ('faculty', 'student'), CHECK for name length, UNIQUE email

### Registration (Junction Table)
- **Purpose**: Links participants to events
- **Primary Key**: registration_id (AUTO_INCREMENT)
- **Foreign Keys**: participant_id, event_id
- **Constraints**: UNIQUE (participant_id, event_id), CHECK for status values

### Event_Assignment (Junction Table)
- **Purpose**: Links coordinators to events
- **Primary Key**: assignment_id (AUTO_INCREMENT)
- **Foreign Keys**: coordinator_id, event_id
- **Constraints**: UNIQUE (coordinator_id, event_id), CHECK for role values

## Cardinality Summary

| Entity 1 | Relationship | Entity 2 | Cardinality |
|----------|--------------|-----------|-------------|
| Participant | registers for | Event | M:N |
| Coordinator | assigned to | Event | M:N |
| Admin | manages | System | 1:N |

## Constraints Used

1. **PRIMARY KEY**: All main tables have auto-increment primary keys
2. **FOREIGN KEY**: Used in junction tables for referential integrity
3. **NOT NULL**: Required fields in all tables
4. **UNIQUE**: Prevents duplicate usernames, emails, event names
5. **CHECK**: Validates data (dates, lengths, enum values)
6. **DEFAULT**: Sets default values (timestamps, status, role)
7. **AUTO_INCREMENT**: Automatically generates primary keys

## Database Normalization

The database follows **Third Normal Form (3NF)**:
- **1NF**: All attributes contain atomic values
- **2NF**: No partial dependencies on composite keys
- **3NF**: No transitive dependencies

## Implementation Notes

- The database uses **InnoDB** engine to support foreign key constraints
- **CASCADE DELETE** ensures data integrity when parent records are deleted
- **Indexes** are created on frequently queried columns for performance
- **Junction tables** handle many-to-many relationships efficiently

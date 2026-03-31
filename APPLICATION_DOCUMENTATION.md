# Ghana National Emergency Response System (NERS)
## Complete Application Documentation

**Academic Submission Document**  
**Date:** March 31, 2026  
**Version:** 1.0  
**Application:** Comprehensive Emergency Management Platform

---

## TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [System Overview](#system-overview)
3. [Architecture & Design](#architecture--design)
4. [Functional Requirements](#functional-requirements)
5. [Non-Functional Requirements](#non-functional-requirements)
6. [Technical Stack](#technical-stack)
7. [Database Architecture](#database-architecture)
8. [API Documentation](#api-documentation)
9. [Frontend Components & Dashboards](#frontend-components--dashboards)
10. [User Roles & Permissions](#user-roles--permissions)
11. [Real-time Communication](#real-time-communication)
12. [Security & Authentication](#security--authentication)
13. [Deployment Architecture](#deployment-architecture)
14. [Key Features & Functionalities](#key-features--functionalities)

---

## 1. EXECUTIVE SUMMARY

The **Ghana National Emergency Response System (NERS)** is a comprehensive, real-time emergency management platform designed to streamline incident response, coordinate emergency services, and improve citizen safety across Ghana. The system integrates multiple emergency response agencies (hospitals, police, fire brigades) into a unified command-and-control center with advanced GIS mapping, real-time fleet tracking, and automated dispatch capabilities.

### Key Objectives:
- **Real-time Incident Management:** Centralized creation, tracking, and resolution of emergencies
- **Automated Dispatch:** Intelligent assignment of emergency resources based on proximity and availability
- **Multi-Agency Coordination:** Unified dashboard for SYSTEM_ADMIN overseeing all emergency services
- **Performance Analytics:** Comprehensive metrics on response times, resource utilization, and incident patterns
- **Geographic Intelligence:** Map-based visualization of incidents, vehicles, and responders
- **Scalable Infrastructure:** Microservices architecture supporting independent scaling and fault isolation

---

## 2. SYSTEM OVERVIEW

### 2.1 Platform Overview

The NERS platform operates as a **distributed microservices system** with a unified frontend, enabling:
- Independent operation of four specialized backend services
- Real-time synchronization via message queue (RabbitMQ)
- Role-based access control across all interfaces
- Live map visualization and GPS tracking
- Automated incident classification and routing

### 2.2 System Scope

**In Scope:**
- User authentication and authorization
- Incident creation, tracking, and status management
- Vehicle registration and GPS fleet tracking
- Real-time dispatch notifications
- Role-specific dashboard interfaces
- Analytics and performance reporting
- Audit logging of critical operations
- WebSocket-based real-time updates

**Out of Scope:**
- SMS/WhatsApp integration (citizen reporting)
- Mobile app (browser-based only)
- Advanced ML-based predictive incident modeling
- Integration with third-party emergency services (future enhancement)

### 2.3 Stakeholders

| Stakeholder | Role | Responsibilities |
|---|---|---|
| **System Administrator** | SYSTEM_ADMIN | Oversees entire platform, creates incidents, dispatches resources |
| **Hospital Administrator** | HOSPITAL_ADMIN | Manages medical incidents, ambulance fleet |
| **Police Administrator** | POLICE_ADMIN | Manages crime/accident incidents, police vehicles |
| **Fire Administrator** | FIRE_ADMIN | Manages fire incidents, fire truck fleet |
| **Citizens** | Reporters | Report emergencies (via future mobile interface) |

---

## 3. ARCHITECTURE & DESIGN

### 3.1 Microservices Architecture

The system follows a **microservices pattern** with four independent services:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React/Vite)                       │
│              Vercel Deployment – national-emergency-response... │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS API Calls + WebSocket
    ┌────────────┼────────────┬─────────────────┬──────────────┐
    │            │            │                 │              │
┌───▼────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────────▼──┐ ┌──────────▼──┐
│ Auth   │ │ Incident │ │ Dispatch │ │ Analytics│ │  RabbitMQ  │
│Service │ │ Service  │ │ Service  │ │ Service  │ │  MessageQ  │
│Port    │ │Port 3002 │ │Port 3003 │ │Port 3004 │ │ Event Bus  │
│3001    │ │          │ │          │ │          │ │            │
└───┬────┘ └────┬─────┘ └────┬─────┘ └────────┬──┘ └──────────┬──┘
    │           │           │                │                │
┌───▼────┐ ┌────▼─────┐ ┌────▼─────┐ ┌────────▼──┐       │
│  Auth  │ │ Incident │ │ Dispatch │ │ Analytics│       │
│  DB    │ │    DB    │ │    DB    │ │    DB    │       │
│  PgSQL │ │  PgSQL   │ │ MongoDB  │ │  PgSQL   │       │
└────────┘ └──────────┘ └──────────┘ └──────────┘       │
                                                          │
              [All services deployed on Render]
```

### 3.2 Service Responsibilities

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| **Auth Service** | 3001 | PostgreSQL | User registration, JWT token generation, authentication |
| **Incident Service** | 3002 | PostgreSQL | Incident CRUD, responder assignment, role-filtering |
| **Dispatch Service** | 3003 | MongoDB | Vehicle registration, GPS tracking, auto-assignment logic |
| **Analytics Service** | 3004 | PostgreSQL | Event tracking, response time calculation, performance metrics |

### 3.3 Communication Patterns

**Synchronous:** HTTP REST API calls (Frontend ↔ Backend)  
**Asynchronous:** RabbitMQ event streams (Service ↔ Service)  
**Real-time:** WebSocket via Socket.io (Backend → Frontend)

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 Authentication & User Management

#### 4.1.1 User Registration (FR-1)
- **Actor:** New user (from admin setup)
- **Precondition:** User has valid email, password ≥ 6 chars, assigned role
- **Flow:**
  1. POST `/auth/register` with `{name, email, password, role}`
  2. System validates email uniqueness and password strength
  3. Password hashed with bcrypt (salt rounds: 10)
  4. User record created in auth_database
- **Postcondition:** User account active, can now login

#### 4.1.2 User Login (FR-2)
- **Actor:** Any registered user
- **Input:** Email, password
- **Flow:**
  1. POST `/auth/login` with credentials
  2. System locates user by email
  3. Password verified against stored hash
  4. JWT tokens generated (access: 15 min, refresh: 7 days)
  5. Tokens returned to frontend
- **Output:** `{access_token, refresh_token, user: {user_id, name, email, role}}`
- **Error Handling:** Invalid credentials return 401, inactive users return 403

#### 4.1.3 Token Refresh (FR-3)
- **Actor:** Frontend with expired access token
- **Input:** Refresh token
- **Flow:**
  1. POST `/auth/refresh-token` with `{refresh_token}`
  2. System validates refresh token
  3. New access token issued
- **Output:** `{access_token}`
- **Security:** Refresh token must match stored token (one-time use pattern possible)

#### 4.1.4 User Profile (FR-4)
- **Actor:** Authenticated user
- **Flow:** GET `/auth/profile` with Bearer token
- **Output:** `{user_id, name, email, role, is_active}`

#### 4.1.5 Logout (FR-5)
- **Flow:** POST `/auth/logout` with Bearer token
- **Effect:** Frontend clears localStorage, token revoked (optional backend invalidation)

---

### 4.2 Incident Management

#### 4.2.1 Create Incident (FR-6)
- **Actor:** SYSTEM_ADMIN only
- **Input:** 
  ```json
  {
    "citizen_name": "John Doe",
    "citizen_phone": "+233501234567",
    "incident_type": "MEDICAL|FIRE|CRIME|ROAD_ACCIDENT",
    "latitude": 5.6037,
    "longitude": -0.1870,
    "location_description": "Osu Oxford Street",
    "notes": "Patient unresponsive"
  }
  ```
- **Flow:**
  1. POST `/incidents` with authorization check
  2. System validates required fields
  3. Incident record created in incident_database
  4. **Auto-assignment:** Nearest available responder auto-assigned
  5. **Event Publication:** `incident.created` event sent to RabbitMQ
  6. **Real-time Broadcast:** Socket.io notification to all connected admins
- **Output:** `{incident_id, status: "CREATED", assigned_unit: {responder_id, name, ...}}`
- **Automatic:** Geographic haversine calculation finds nearest responder

#### 4.2.2 Get Open Incidents (FR-7)
- **Actor:** Any authenticated user
- **Flow:** GET `/incidents/open?type=MEDICAL&limit=50&offset=0`
- **Role-Filtering:**
  - **SYSTEM_ADMIN:** All incident types
  - **HOSPITAL_ADMIN:** Only MEDICAL
  - **POLICE_ADMIN:** Only CRIME and ROAD_ACCIDENT
  - **FIRE_ADMIN:** Only FIRE
- **Output:** `{incidents: [], count: N}`

#### 4.2.3 Get Single Incident (FR-8)
- **Flow:** GET `/incidents/{incident_id}` with role filtering
- **Output:** Full incident object with assigned responder details
- **Security:** User can only view incidents matching their role filter

#### 4.2.4 Update Incident Status (FR-9)
- **Actor:** SYSTEM_ADMIN only
- **Input:** 
  ```json
  { "status": "CREATED|DISPATCHED|IN_PROGRESS|RESOLVED" }
  ```
- **Flow:**
  1. PUT `/incidents/{incident_id}/status`
  2. State machine validation (e.g., can't jump from CREATED to RESOLVED)
  3. Status updated, timestamps recorded
  4. Event published: `incident.updated`
- **Output:** `{incident_id, status, updated_at}`

#### 4.2.5 Assign Responder (FR-10)
- **Actor:** SYSTEM_ADMIN only
- **Input:**
  ```json
  {
    "unit_id": "responder_12345",
    "unit_type": "POLICE_STATION|FIRE_STATION|HOSPITAL"
  }
  ```
- **Flow:**
  1. PUT `/incidents/{incident_id}/assign`
  2. Verify responder availability
  3. Create assignment record
  4. Update incident's `assigned_responder_id`
  5. Notify responder via Socket.io
- **Output:** `{incident_id, assigned_responder_id}`

#### 4.2.6 Delete Incident (FR-11)
- **Actor:** SYSTEM_ADMIN only
- **Flow:** DELETE `/incidents/{incident_id}`
- **Rule:** Can only delete CREATED incidents (not dispatched/in-progress)
- **Output:** HTTP 204 No Content

---

### 4.3 Vehicle Fleet Management

#### 4.3.1 Register Vehicle (FR-12)
- **Actor:** SYSTEM_ADMIN only
- **Input:**
  ```json
  {
    "registrationNumber": "AMB-001",
    "type": "AMBULANCE|POLICE_CAR|FIRE_TRUCK",
    "driverName": "Kwesi Mensah",
    "driverPhone": "+233501234567",
    "region": "Greater Accra",
    "latitude": 5.6037,
    "longitude": -0.1870
  }
  ```
- **Flow:**
  1. POST `/vehicles/register` with auth verification
  2. Vehicle record created in dispatch_database (MongoDB)
  3. Initial status: "IDLE"
  4. Initial fuel level: 100%
  5. GPS location history initialized
- **Output:** `{vehicle_id, registration_number, type, status, created_at}`

#### 4.3.2 Get Vehicles (FR-13)
- **Actor:** Any authenticated user
- **Flow:** GET `/vehicles?status=IDLE&limit=50`
- **Role-Filtering:**
  - **SYSTEM_ADMIN:** All vehicles
  - **HOSPITAL_ADMIN:** Only AMBULANCE
  - **POLICE_ADMIN:** Only POLICE_CAR
  - **FIRE_ADMIN:** Only FIRE_TRUCK
- **Query Parameters:**
  - `status`: Filter by IDLE|DISPATCHED|ACTIVE|MAINTENANCE
  - `limit`, `offset`: Pagination
- **Output:** `{vehicles: [], count, filtered: boolean, filter_type}`

#### 4.3.3 Update Vehicle Location (FR-14)
- **Actor:** Any authenticated user (real driver updating GPS)
- **Input:**
  ```json
  {
    "latitude": 5.6145,
    "longitude": -0.2082,
    "speed_kmh": 45
  }
  ```
- **Flow:**
  1. PUT `/vehicles/{vehicle_id}/location`
  2. Current location updated in vehicle record
  3. Location history entry created (with timestamp)
  4. Socket.io broadcast to frontend for live map update
- **Output:** `{success: true, message: "Location updated"}`

#### 4.3.4 Get Vehicle Location History (FR-15)
- **Actor:** Role-filtered (based on vehicle type)
- **Flow:** GET `/vehicles/{vehicle_id}/history?limit=100`
- **Output:** `{history: [{latitude, longitude, speed, timestamp}, ...]}`

#### 4.3.5 Update Vehicle Details (FR-16)
- **Actor:** SYSTEM_ADMIN only
- **Editable Fields:** driverName, driverPhone, status, region
- **Flow:** PUT `/vehicles/{vehicle_id}` with updated fields
- **Immutable:** type, registration_number, created_at

---

### 4.4 Analytics & Reporting

#### 4.4.1 Get Response Times (FR-17)
- **Actor:** SYSTEM_ADMIN only
- **Flow:** GET `/analytics/response-times?from=2024-01-01&to=2024-12-31&type=MEDICAL&region=Greater Accra`
- **Calculation:** Average time from incident.created to first responder assignment
- **Output:** `{average_response_time_seconds: 450, total_incidents_analyzed: 127}`

#### 4.4.2 Get Incidents by Region (FR-18)
- **Actor:** SYSTEM_ADMIN only
- **Flow:** GET `/analytics/incidents-by-region?from=2024-01-01`
- **Output:** 
  ```json
  [
    { "region": "Greater Accra", "incident_type": "MEDICAL", "count": 342 },
    { "region": "Ashanti", "incident_type": "FIRE", "count": 89 }
  ]
  ```

#### 4.4.3 Get Resource Utilization (FR-19)
- **Actor:** SYSTEM_ADMIN only
- **Flow:** GET `/analytics/resource-utilization`
- **Metrics:**
  - Average vehicles per incident type
  - Responder availability rates
  - Fleet utilization percentage
- **Output:** Resource allocation statistics

#### 4.4.4 Get Operational Summary (FR-20)
- **Actor:** All authenticated users (summary data only)
- **Flow:** GET `/analytics/summary`
- **Output:**
  ```json
  {
    "totalIncidents": 2547,
    "activeVehicles": 89,
    "onlineStaff": 340,
    "avgResponseTime": 450,
    "resolvedToday": 23
  }
  ```

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance Requirements

| Requirement | Target | Measurement |
|---|---|---|
| **API Response Time** | <200ms | P99 response time for standard queries |
| **Live Map Update** | <500ms | Socket.io update latency for vehicle location |
| **Dashboard Load** | <2s | Initial page load on 4G network |
| **Concurrent Users** | 200+ | Simultaneous active dashboard sessions |
| **Database Query** | <100ms | 95th percentile for complex incident queries |
| **Real-time Broadcast** | <1s | Incident creation to all admin dashboards |

### 5.2 Scalability Requirements

- **Horizontal Scaling:** Each microservice independently scalable via container orchestration
- **Database Sharding:** PostgreSQL read replicas for analytics queries
- **MongoDB Replica Set:** Dispatch service supports horizontal replication
- **Load Balancing:** Render HTTP load balancer distributes requests across instances
- **Message Queue:** RabbitMQ can handle 10,000+ messages/second with consumer scaling

### 5.3 Security Requirements

| Requirement | Implementation |
|---|---|
| **Authentication** | JWT (HS256) with 15-min access tokens |
| **Authorization** | Role-based access control (RBAC) enforced per endpoint |
| **Data Encryption** | TLS 1.3 for all network communications |
| **Password Security** | bcryptjs (10 salt rounds), minimum 6 characters |
| **Token Validation** | JWT_SECRET verified consistently across all 4 services |
| **CORS Policy** | Restricted to Vercel frontend domain |
| **Rate Limiting** | Implemented in production (10 req/s per IP) |
| **Audit Logging** | All user actions logged with timestamp, user_id, action |

### 5.4 Reliability Requirements

| Requirement | Target | Strategy |
|---|---|---|
| **System Uptime** | 99.5% | Health checks on all services, auto-restart |
| **Data Backup** | Daily | Auto-backups via Render managed databases |
| **Disaster Recovery** | RTO: 2h | Database snapshots, code versioning on GitHub |
| **Fault Isolation** | Service independence | One service failure doesn't block others |
| **Graceful Degradation** | Partial functionality | Analytics service down = dashboard shows cached data |

### 5.5 Usability Requirements

- **Mobile Responsive:** Works on tablets (iPad) and large phones (6"+)
- **Accessibility:** WCAG 2.1 AA standards (keyboard navigation, screen reader support)
- **Localization:** Ready for Twi/Akan translations (placeholder in UI)
- **Dark Mode:** Full dark theme support with system preference detection
- **Loading States:** Skeleton screens and progress indicators for async operations

### 5.6 Maintainability Requirements

- **Code Documentation:** JSDoc comments for all public functions
- **Error Messages:** User-friendly messages, detailed server logs
- **Monitoring:** Render dashboard for service health, logs aggregation
- **Version Control:** Git-based with feature branches and PR reviews
- **Configuration:** Environment-based (dev/staging/production) via .env files

---

## 6. TECHNICAL STACK

### 6.1 Backend Technology Stack

| Component | Technology | Version |
|---|---|---|
| **Runtime Environment** | Node.js | 18+ |
| **Web Framework** | Express.js | 4.x |
| **ORM** | Prisma | 5.x |
| **Authentication** | JWT + bcryptjs | jsonwebtoken 9.x, bcryptjs 2.4.3 |
| **Real-time** | Socket.io | 4.x |
| **Message Queue** | RabbitMQ | 3.12+ |
| **Databases** | PostgreSQL, MongoDB | 14.x, 6.0+ |
| **Environment** | dotenv | 16.x |

### 6.2 Frontend Technology Stack

| Component | Technology | Version |
|---|---|---|
| **UI Framework** | React | 18.2.x |
| **Build Tool** | Vite | 5.4.x |
| **Routing** | React Router | 6.x |
| **HTTP Client** | Axios | 1.x |
| **Real-time Client** | Socket.io-client | 4.x |
| **Animations** | Framer Motion | 10.x |
| **CSS Framework** | Tailwind CSS | 3.x |
| **Icons** | Material Symbols | v2 |
| **State Management** | Context API | React built-in |
| **Maps** | Leaflet + Mapbox | leaflet 1.9.x |

### 6.3 Deployment Stack

| Component | Service |
|---|---|
| **Backend Hosting** | Render (4 microservices) |
| **Frontend Hosting** | Vercel |
| **DNS & CDN** | Vercel managed |
| **Version Control** | GitHub |
| **CI/CD** | Render auto-deploy on git push, Vercel auto-deploy |

---

## 7. DATABASE ARCHITECTURE

### 7.1 Auth Service Database (PostgreSQL)

**Schema: `public.user`**

```sql
CREATE TABLE public.user (
    userId          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    passwordHash    VARCHAR(255) NOT NULL,
    role            ENUM('SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_ADMIN') NOT NULL,
    isActive        BOOLEAN DEFAULT true,
    lastLogin       TIMESTAMP,
    createdAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Relationships:** One user → Many incidents (via createdBy)

---

### 7.2 Incident Service Database (PostgreSQL)

**Schema 1: `public.incident`**

```sql
CREATE TABLE public.incident (
    incidentId          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title               VARCHAR(255) NOT NULL,
    description         TEXT,
    type                ENUM('MEDICAL', 'FIRE', 'CRIME', 'ROAD_ACCIDENT') NOT NULL,
    location            VARCHAR(255),
    region              VARCHAR(100),
    latitude            DECIMAL(10, 8) NOT NULL,
    longitude           DECIMAL(11, 8) NOT NULL,
    severity            ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status              ENUM('CREATED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'CREATED',
    reporterName        VARCHAR(255),
    reporterPhone       VARCHAR(20),
    createdBy           UUID,
    assignedResponderId UUID,
    createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolvedAt          TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES public.user(userId),
    FOREIGN KEY (assignedResponderId) REFERENCES public.responder(responderId)
);
```

**Schema 2: `public.responder`**

```sql
CREATE TABLE public.responder (
    responderId         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    email               VARCHAR(255),
    phone               VARCHAR(20),
    type                ENUM('POLICE_STATION', 'FIRE_STATION', 'HOSPITAL') NOT NULL,
    location            VARCHAR(255),
    latitude            DECIMAL(10, 8),
    longitude           DECIMAL(11, 8),
    capacity            INT DEFAULT 10,
    region              VARCHAR(100),
    isActive            BOOLEAN DEFAULT true,
    createdAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Relationships:**
- incident.assignedResponderId → responder.responderId (Many-to-One)
- responder can have multiple incidents assigned

---

### 7.3 Dispatch Service Database (MongoDB)

**Collection: `vehicles`**

```json
{
  "_id": ObjectId,
  "vehicleId": "uuid",
  "registrationNumber": "AMB-001",
  "type": "AMBULANCE|POLICE_CAR|FIRE_TRUCK",
  "region": "Greater Accra",
  "capacity": 4,
  "driverName": "Kwesi Mensah",
  "driverPhone": "+233501234567",
  "status": "IDLE|DISPATCHED|ACTIVE|MAINTENANCE",
  "currentLatitude": 5.6037,
  "currentLongitude": -0.1870,
  "fuelLevel": 100,
  "isActive": true,
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T12:45:00Z")
}
```

**Collection: `locationHistory`**

```json
{
  "_id": ObjectId,
  "vehicleId": "uuid",
  "latitude": 5.6145,
  "longitude": -0.2082,
  "speed": 45.5,
  "timestamp": ISODate("2024-01-15T11:15:00Z")
}
```

**Collection: `vehicleAssignment`**

```json
{
  "_id": ObjectId,
  "vehicleId": "uuid",
  "incidentId": "uuid (from incident_service)",
  "assignmentType": "DISPATCH|MANUAL",
  "status": "ASSIGNED|IN_TRANSIT|ARRIVED|COMPLETED",
  "assignedAt": ISODate("2024-01-15T10:35:00Z"),
  "completedAt": ISODate("2024-01-15T11:20:00Z")
}
```

**Indexes:**
- `vehicles`: Index on `type`, `status`, `region` for query optimization
- `locationHistory`: Index on `vehicleId`, `timestamp` for GPS trail retrieval

---

### 7.4 Analytics Service Database (PostgreSQL)

**Schema: `public.incidentEvent`**

```sql
CREATE TABLE public.incidentEvent (
    eventId                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incidentId              UUID NOT NULL,
    incidentType            VARCHAR(50) NOT NULL,
    location                VARCHAR(255),
    region                  VARCHAR(100),
    severity                VARCHAR(50),
    status                  ENUM('REPORTED', 'RESPONSE_INITIATED', 'IN_PROGRESS', 'RESOLVED') DEFAULT 'REPORTED',
    responseTimeSeconds     INT,
    resolutionTimeSeconds   INT,
    createdAt               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_incident (incidentId),
    INDEX idx_type (incidentType),
    INDEX idx_region (region),
    INDEX idx_date (createdAt)
);
```

**Purpose:** Tracks events asynchronously consumed from RabbitMQ for analytics calculations

---

## 8. API DOCUMENTATION

### 8.1 Authentication Endpoints

```
BASE_URL: https://auth-service.onrender.com:3001
```

#### POST `/auth/register`
Register a new system user
```http
POST /auth/register HTTP/1.1
Content-Type: application/json

{
  "name": "Dr. Ama Boateng",
  "email": "ama.boateng@hospitals.gov.gh",
  "password": "SecurePass123!",
  "role": "HOSPITAL_ADMIN"
}
```
**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. Ama Boateng",
    "email": "ama.boateng@hospitals.gov.gh",
    "role": "HOSPITAL_ADMIN",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### POST `/auth/login`
Authenticate user and obtain JWT tokens
```http
POST /auth/login HTTP/1.1
Content-Type: application/json

{
  "email": "ama.boateng@hospitals.gov.gh",
  "password": "SecurePass123!"
}
```
**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Dr. Ama Boateng",
    "email": "ama.boateng@hospitals.gov.gh",
    "role": "HOSPITAL_ADMIN"
  }
}
```

#### POST `/auth/refresh-token`
Get new access token using refresh token
```http
POST /auth/refresh-token HTTP/1.1
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### GET `/auth/profile`
Get authenticated user's profile
```http
GET /auth/profile HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Response (200):**
```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Dr. Ama Boateng",
  "email": "ama.boateng@hospitals.gov.gh",
  "role": "HOSPITAL_ADMIN",
  "is_active": true
}
```

#### POST `/auth/logout`
Logout user and revoke refresh token
```http
POST /auth/logout HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Response (204):** No Content

---

### 8.2 Incident Endpoints

```
BASE_URL: https://incident-service.onrender.com:3002
Authorization Header Required: Bearer <access_token>
```

#### POST `/incidents`
Create new incident (SYSTEM_ADMIN only)
```http
POST /incidents HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "citizen_name": "Ama Gyamfi",
  "citizen_phone": "+233501234567",
  "incident_type": "MEDICAL",
  "latitude": 5.6037,
  "longitude": -0.1870,
  "location_description": "Korle-Bu Teaching Hospital vicinity",
  "notes": "Patient with severe chest pain"
}
```
**Response (201):**
```json
{
  "incident_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "MEDICAL - Korle-Bu Teaching Hospital vicinity",
  "type": "MEDICAL",
  "location": "Korle-Bu Teaching Hospital vicinity",
  "status": "CREATED",
  "severity": "MEDIUM",
  "assigned_responder": {
    "responder_id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Korle-Bu Emergency",
    "type": "HOSPITAL",
    "distance_km": 0.8
  },
  "created_at": "2024-01-15T10:35:00Z"
}
```

#### GET `/incidents/open`
Get open incidents (role-filtered)
```http
GET /incidents/open?type=MEDICAL&limit=50&offset=0 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Role-Based Filtering:**
- SYSTEM_ADMIN sees: All incident types
- HOSPITAL_ADMIN sees: Only MEDICAL
- POLICE_ADMIN sees: Only CRIME, ROAD_ACCIDENT
- FIRE_ADMIN sees: Only FIRE

**Response (200):**
```json
{
  "incidents": [
    {
      "incident_id": "660e8400-e29b-41d4-a716-446655440000",
      "type": "MEDICAL",
      "location": "Korle-Bu Teaching Hospital vicinity",
      "status": "CREATED",
      "latitude": 5.6037,
      "longitude": -0.1870,
      "reporter_name": "Ama Gyamfi",
      "created_at": "2024-01-15T10:35:00Z"
    }
  ],
  "count": 42
}
```

#### PUT `/incidents/{incident_id}/status`
Update incident status (SYSTEM_ADMIN only)
```http
PUT /incidents/660e8400-e29b-41d4-a716-446655440000/status HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```
**Response (200):**
```json
{
  "incident_id": "660e8400-e29b-41d4-a716-446655440000",
  "status": "IN_PROGRESS",
  "updated_at": "2024-01-15T10:45:00Z"
}
```

---

### 8.3 Vehicle Endpoints

```
BASE_URL: https://dispatch-service.onrender.com:3003
Authorization Header Required: Bearer <access_token>
```

#### POST `/vehicles/register`
Register new emergency vehicle (SYSTEM_ADMIN only)
```http
POST /vehicles/register HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "registrationNumber": "AMB-GES-001",
  "type": "AMBULANCE",
  "driverName": "Kwesi Mensah",
  "driverPhone": "+233501234567",
  "region": "Greater Accra",
  "latitude": 5.5391,
  "longitude": -0.2265
}
```
**Response (201):**
```json
{
  "message": "Vehicle registered successfully",
  "vehicle": {
    "vehicle_id": "770e8400-e29b-41d4-a716-446655440000",
    "registration_number": "AMB-GES-001",
    "type": "AMBULANCE",
    "region": "Greater Accra",
    "status": "IDLE",
    "driver_name": "Kwesi Mensah",
    "created_at": "2024-01-15T10:40:00Z"
  }
}
```

#### GET `/vehicles`
Get vehicles (role-filtered)
```http
GET /vehicles?status=IDLE&limit=20 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Role-Based Filtering:**
- SYSTEM_ADMIN sees: All vehicles
- HOSPITAL_ADMIN sees: Only AMBULANCE
- POLICE_ADMIN sees: Only POLICE_CAR
- FIRE_ADMIN sees: Only FIRE_TRUCK

**Response (200):**
```json
{
  "vehicles": [
    {
      "vehicle_id": "770e8400-e29b-41d4-a716-446655440000",
      "registration_number": "AMB-GES-001",
      "type": "AMBULANCE",
      "driver_name": "Kwesi Mensah",
      "current_location": {
        "latitude": 5.5391,
        "longitude": -0.2265
      },
      "status": "IDLE",
      "fuel_level": 100,
      "is_active": true
    }
  ],
  "count": 7,
  "filtered": true,
  "filter_type": "AMBULANCE"
}
```

#### PUT `/vehicles/{vehicle_id}/location`
Update vehicle GPS location (real-time tracking)
```http
PUT /vehicles/770e8400-e29b-41d4-a716-446655440000/location HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "latitude": 5.6145,
  "longitude": -0.2082,
  "speed_kmh": 67
}
```
**Response (200):**
```json
{
  "success": true,
  "message": "Location updated"
}
```

#### GET `/vehicles/{vehicle_id}/history`
Get vehicle GPS trail
```http
GET /vehicles/770e8400-e29b-41d4-a716-446655440000/history?limit=100 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Response (200):**
```json
{
  "history": [
    {
      "latitude": 5.6145,
      "longitude": -0.2082,
      "speed": 67,
      "timestamp": "2024-01-15T10:50:00Z"
    },
    {
      "latitude": 5.6100,
      "longitude": -0.2000,
      "speed": 55,
      "timestamp": "2024-01-15T10:45:00Z"
    }
  ]
}
```

---

### 8.4 Analytics Endpoints

```
BASE_URL: https://analytics-service.onrender.com:3004
Authorization Header Required: Bearer <access_token>
```

#### GET `/analytics/summary`
Get operational dashboard summary
```http
GET /analytics/summary HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Response (200):**
```json
{
  "totalIncidents": 2547,
  "activeVehicles": 89,
  "onlineStaff": 340,
  "avgResponseTime": 450,
  "resolvedToday": 23,
  "timestamp": "2024-01-15T10:55:00Z"
}
```

#### GET `/analytics/response-times`
Get average incident response times
```http
GET /analytics/response-times?from=2024-01-01&to=2024-01-31&type=MEDICAL HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Response (200):**
```json
{
  "average_response_time_seconds": 450,
  "total_incidents_analyzed": 127,
  "period": "2024-01-01 to 2024-01-31"
}
```

#### GET `/analytics/incidents-by-region`
Get incident statistics by region
```http
GET /analytics/incidents-by-region?from=2024-01-01 HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
**Response (200):**
```json
[
  {
    "region": "Greater Accra",
    "incident_type": "MEDICAL",
    "count": 342
  },
  {
    "region": "Greater Accra",
    "incident_type": "FIRE",
    "count": 87
  }
]
```

---

## 9. FRONTEND COMPONENTS & DASHBOARDS

### 9.1 Application Routes & Flow

```
┌─────────────────────────────────────────────────────┐
│  PUBLIC ROUTES (No Authentication Required)         │
├─────────────────────────────────────────────────────┤
│  /login                  → Login Component           │
│  /register               → Register Component        │
│  /forgot-password        → Forgot Password Component │
│  /reset-password         → Reset Password Component  │
└─────────────────────────────────────────────────────┘
                          ↓ (after login)
┌─────────────────────────────────────────────────────┐
│  PROTECTED ROUTES (Requires Valid JWT Token)        │
├─────────────────────────────────────────────────────┤
│  / (root)                → SystemAdminDashboard      │
│  /hospital               → HospitalAdminDashboard   │
│  /police                 → PoliceAdminDashboard     │
│  /fire                   → FireAdminDashboard       │
│  /analytics              → AnalyticsDashboard       │
│  /profile                → UserProfile Component    │
│  /incidents              → IncidentList Component   │
│  /audit-logs             → AuditLogPage Component   │
└─────────────────────────────────────────────────────┘
```

### 9.2 System Admin Dashboard (/)

**Purpose:** Central command center for system administrators overseeing all emergency services

**Components:**

#### 9.2.1 Dashboard Header
- User greeting: "Welcome back, Kwame!"
- Real-time date/time display
- Logout button

#### 9.2.2 Statistics Cards
- **Total Incidents:** Count of all incidents (CREATED, DISPATCHED, IN_PROGRESS, RESOLVED)
- **Active Units:** Count of vehicles with status IDLE or ACTIVE
- **Staff Online:** Real-time online staff count from analytics service
- **System Uptime:** 99.9% static display

#### 9.2.3 Live Map Panel
- **Type:** Leaflet/Mapbox interactive map
- **Markers:** 
  - Red circles = Incidents (with incident type icon)
  - Blue circles = Vehicles (with vehicle type icon)
- **Features:**
  - Click incident marker → Show incident details
  - Click vehicle marker → Show vehicle info + GPS trail
  - Zoom/pan controls
  - Real-time updates via Socket.io

#### 9.2.4 Fleet Operational Unit
- **Display:** Grid of 3 vehicle type buttons
  - 🚑 Ambulance (AMBULANCE type)
  - 🚓 Police Car (POLICE_CAR type)
  - 🚒 Fire Truck (FIRE_TRUCK type)
- **Action:** Click button → Opens ManageVehicleModal
  - Pre-selects vehicle type
  - Form to register new vehicle
  - POST to `/vehicles/register`

#### 9.2.5 Dispatch Priority Queue
- **Display:** List of open incidents sorted by severity (CRITICAL → HIGH → MEDIUM → LOW)
- **Columns:**
  - Incident ID
  - Type (MEDICAL, FIRE, CRIME, ROAD_ACCIDENT)
  - Location
  - Status (CREATED, DISPATCHED, IN_PROGRESS)
  - Severity badge
- **Actions:** 
  - View full details
  - Assign responder
  - Update status
- **Real-time:** Auto-updates via Socket.io

#### 9.2.6 Modals
- **ManageVehicleModal:** Register new vehicle with form validation
- **LiveTrackingModal:** Real-time GPS tracking visualization for selected vehicle

---

### 9.3 Hospital Admin Dashboard (/hospital)

**Purpose:** Hospital-specific dashboard for managing medical incidents and ambulances

**Components:**

#### 9.3.1 Statistics Cards
- **Active Patrols:** Count of ambulances with status ACTIVE
- **Units Deployed:** Count of ambulances currently assigned to incidents
- **Medical Incidents:** Count of MEDICAL-type incidents
- **Fleet Ready:** Count of ambulances with status IDLE

#### 9.3.2 Live Map
- **Markers Only:** AMBULANCE vehicles + MEDICAL incidents
- **Role-Filtering:** Only medical data visible

#### 9.3.3 Ward Flow Tab
- **FleetStatus Component:** Visual representation of ambulance fleet status
  - Idle count, active count, maintenance count
  - Vehicle list with driver info and GPS location

#### 9.3.4 Triage Queue Tab
- **TriageQueue Component:** Medical incidents queue
  - Sorted by time severity
  - Quick-action buttons (Assign, Update Status)
  - Patient information display

#### 9.3.5 Supply Audit Tab
- **SupplyAudit Component:** Medical supplies inventory
  - Medkit inventory per ambulance
  - Drug stock levels (mock data)
  - Expiration alerts

#### 9.3.6 Settings Tab (NodeConfig)
- Configuration panel for hospital-specific settings
- Ambulance capacity settings
- Default response zone configuration

---

### 9.4 Police Admin Dashboard (/police)

**Purpose:** Police-specific dashboard for managing crime/accident incidents

**Components:**

#### 9.4.1 Statistics Cards
- **Active Patrols:** Count of POLICE_CAR vehicles with status ACTIVE
- **Units Deployed:** Assigned vehicles
- **Unsolved Alerts:** Count of CRIME/ROAD_ACCIDENT with status CREATED
- **Fleet Ready:** Idle police vehicles

#### 9.4.2 Live Map
- **Markers:** POLICE_CAR vehicles + CRIME/ROAD_ACCIDENT incidents
- **Role-Filtering:** Security data only

#### 9.4.3 Radio Band Tabs
- **PatrolMap Component:** Advanced patrol route visualization
  - Heat map of crime areas
  - Patrol coverage zones
  - Incident hotspots

#### 9.4.4 Security Logs Tab
- **SecurityLogs Component:** Historical log of security incidents
  - Searchable by incident ID, location, date
  - Full incident details
  - Dispatch history

#### 9.4.5 Intel Registry Tab
- **IntelRegistry Component:** Intelligence database
  - Crime patterns by location
  - Repeat offender tracking
  - Area risk assessment

#### 9.4.6 Config Tab (PoliceConfig)
- Patrol zone configuration
- Response priority rules
- Unit capacity settings

---

### 9.5 Fire Admin Dashboard (/fire)

**Purpose:** Fire brigade-specific dashboard for fire incidents

**Components:**

#### 9.5.1 Statistics Cards
- **Idle Trucks:** Count of FIRE_TRUCK vehicles with status IDLE
- **Water Reserve:** Mock percentage (94%)
- **Pump Pressure:** Mock gauge (14 bar)
- **Active Teams:** Active firefighting teams

#### 9.5.2 Live Map
- **Markers:** FIRE_TRUCK vehicles + FIRE incidents
- **Role-Filtering:** Fire-related data only

#### 9.5.3 Hydrant Flow Tab
- **ResponseMap Component:** Fire hydrant map
  - Hydrant locations (mock)
  - Water main pressure visualization
  - Fire truck coverage zones

#### 9.5.4 Dispatch Logs Tab
- **DispatchLogs Component:** Fire response history
  - Dispatch time, arrival time, completion time
  - Hydrant usage records
  - Equipment deployment

#### 9.5.5 Gear Inventory Tab
- **GearInventory Component:** Equipment tracking
  - Per-truck equipment status
  - Maintenance schedules
  - Emergency supply levels

#### 9.5.6 Settings Tab (FireNodeSettings)
- Hydrant network configuration
- Equipment maintenance intervals
- Response zone setup

---

### 9.6 Analytics Dashboard (/analytics)

**Purpose:** System-wide performance analytics and reporting (SYSTEM_ADMIN only)

**Components:**

#### 9.6.1 Key Performance Indicators (KPIs)
- **Average Response Time:** Seconds from incident creation to first responder assignment
- **Incident Resolution Rate:** % of incidents resolved within SLA
- **Resource Utilization:** % of vehicles active per incident type
- **Regional Incident Distribution:** Heat map of incidents by region

#### 9.6.2 Charts & Graphs
- **Incident Trend:** Line chart of incidents over past 30 days
- **Incident Type Distribution:** Pie chart (MEDICAL, FIRE, CRIME, ROAD_ACCIDENT)
- **Response Times by Type:** Bar chart comparing average response times
- **Regional Comparison:** Bar chart of incident counts by region

#### 9.6.3 Report Generation
- Export incident data to CSV
- Date range filtering
- Custom drill-down reports

---

### 9.7 Shared Components

#### 9.7.1 ProtectedRoute
```jsx
<ProtectedRoute allowedRoles={['SYSTEM_ADMIN', 'HOSPITAL_ADMIN']}>
  <Component />
</ProtectedRoute>
```
- Verifies token validity
- Checks user role against allowed roles
- Redirects to /login if unauthorized
- Shows loading state while checking auth

#### 9.7.2 LiveMap
```jsx
<LiveMap 
  markers={[...incidents, ...vehicles]}
  center={{ lat: 5.6037, lng: -0.1870 }}
  onMarkerClick={(marker) => handleMarkerClick(marker)}
/>
```
- Interactive Leaflet map
- Real-time marker updates via Socket.io
- Click handlers for marker interaction
- Zoom/pan/search controls

#### 9.7.3 ManageVehicleModal
```jsx
<ManageVehicleModal 
  isOpen={showVehicleModal}
  onClose={() => setShowVehicleModal(false)}
  fixedType={selectedVehicleType}
  onRefresh={() => fetchData()}
/>
```
- Modal form for vehicle registration
- Pre-selected vehicle type (from parent)
- Form validation
- GPS location picker
- Submit to `/vehicles/register`

#### 9.7.4 DispatchNotification
```jsx
<DispatchNotification 
  notification={notification}
  onDismiss={() => hideNotification()}
/>
```
- Toast notification for dispatch events
- Auto-dismiss after 5 seconds
- Success/error/info message types
- Position: top-right corner

#### 9.7.5 StatusBadge
```jsx
<StatusBadge status="IN_PROGRESS" />
```
- Visual badge for incident/vehicle status
- Color-coded based on status:
  - Green = IDLE/RESOLVED
  - Blue = ACTIVE/DISPATCHED
  - Red = CRITICAL/RESOLVED
  - Orange = IN_PROGRESS

#### 9.7.6 AddIncidentModal
```jsx
<AddIncidentModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={(incidentData) => handleSubmit(incidentData)}
/>
```
- Form to create new incident
- Fields: citizen_name, citizen_phone, incident_type, location, notes
- Geolocation picker for lat/lng
- POST to `/incidents`

---

## 10. USER ROLES & PERMISSIONS

### 10.1 Role Hierarchy

| Role | Dashboard | Permissions |
|---|---|---|
| **SYSTEM_ADMIN** | All dashboards + Analytics | Full system control |
| **HOSPITAL_ADMIN** | Hospital only | Medical incidents, ambulances |
| **POLICE_ADMIN** | Police only | Crime/accident incidents, police cars |
| **FIRE_ADMIN** | Fire only | Fire incidents, fire trucks |

### 10.2 Permission Matrix

| Operation | SYSTEM_ADMIN | HOSPITAL_ADMIN | POLICE_ADMIN | FIRE_ADMIN |
|---|---|---|---|---|
| **Create Incident** | ✅ All types | ❌ | ❌ | ❌ |
| **View Incidents** | ✅ All | ✅ MEDICAL only | ✅ CRIME/ROAD_ACCIDENT | ✅ FIRE only |
| **Update Incident Status** | ✅ | ❌ | ❌ | ❌ |
| **Assign Responder** | ✅ | ❌ | ❌ | ❌ |
| **Register Vehicle** | ✅ All types | ❌ | ❌ | ❌ |
| **View Vehicles** | ✅ All | ✅ AMBULANCE only | ✅ POLICE_CAR only | ✅ FIRE_TRUCK only |
| **Update Vehicle Location** | ✅ Any driver | ✅ Driver only | ✅ Driver only | ✅ Driver only |
| **View Analytics** | ✅ Full reports | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ❌ | ❌ | ❌ |

### 10.3 Endpoint Authorization

**All protected endpoints require:**
1. Valid JWT in `Authorization: Bearer <token>` header
2. Token not expired (15-minute window)
3. User role in allowed roles list

**Example Middleware Chain:**
```
Request → authMiddleware (verify JWT) → roleMiddleware (check role) → 
  [optional incidentFilterMiddleware or vehicleFilterMiddleware] → Controller
```

---

## 11. REAL-TIME COMMUNICATION

### 11.1 WebSocket Connection (Socket.io)

**Client-side (frontend):**
```javascript
const socketService = {
  connect(token) {
    this.socket = io('https://incident-service.onrender.com:3002', {
      auth: { token }
    });
    this.socket.on('connect', () => console.log('✅ Socket connected'));
  },
  
  subscribeToIncidents(callback) {
    this.socket.on('incident:update', callback);
  },
  
  subscribeToFleet(callback) {
    this.socket.on('fleet:update', callback);
  }
};
```

**Server-side (Incident Service):**
```javascript
const io = require('socket.io')(httpServer, { cors: { origin: 'https://...' } });

io.on('connection', (socket) => {
  socket.on('incident:create', (data) => {
    // Broadcast to all connected clients
    io.emit('incident:update', data);
  });
});
```

### 11.2 Real-time Events

#### Event: Incident Created
**Trigger:** POST `/incidents`  
**Broadcast To:** All connected SYSTEM_ADMIN users  
**Payload:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "type": "MEDICAL",
  "location": "Korle-Bu",
  "latitude": 5.6037,
  "longitude": -0.1870,
  "status": "CREATED",
  "timestamp": "2024-01-15T10:35:00Z"
}
```
**Effect on Frontend:** 
- New incident marker appears on map
- Incident added to priority queue
- Toast notification: "New MEDICAL incident in Korle-Bu"

#### Event: Vehicle Location Updated
**Trigger:** PUT `/vehicles/{id}/location`  
**Broadcast To:** All connected users with vehicle access  
**Payload:**
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440000",
  "type": "AMBULANCE",
  "latitude": 5.6145,
  "longitude": -0.2082,
  "speed": 67,
  "timestamp": "2024-01-15T10:50:00Z"
}
```
**Effect on Frontend:** 
- Vehicle marker animates to new location
- GPS trail updated on live tracking modal
- Last updated time refreshed

#### Event: Incident Status Changed
**Trigger:** PUT `/incidents/{id}/status`  
**Broadcast To:** All connected users with incident access  
**Payload:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "status": "IN_PROGRESS",
  "timestamp": "2024-01-15T10:45:00Z"
}
```
**Effect on Frontend:** 
- Incident status badge updates
- Color changes (CREATED → blue, IN_PROGRESS → orange, RESOLVED → green)
- Incident moves in priority queue

### 11.3 Message Queue (RabbitMQ)

**Purpose:** Asynchronous inter-service communication

**Event Flow:**
```
Incident Service publishes "incident.created" event
                              ↓
                        RabbitMQ Exchange
                           ↙        ↘
                    Dispatch Queue   Analytics Queue
                           ↓              ↓
                  Dispatch Service  Analytics Service
                  (auto-assigns      (records event
                   vehicles)          for metrics)
```

**Event Structure:**
```json
{
  "event": "incident.created",
  "data": {
    "incident_id": "660e8400-e29b-41d4-a716-446655440000",
    "type": "MEDICAL",
    "latitude": 5.6037,
    "longitude": -0.1870,
    "location": "Korle-Bu",
    "severity": "HIGH",
    "timestamp": "2024-01-15T10:35:00Z"
  }
}
```

---

## 12. SECURITY & AUTHENTICATION

### 12.1 Authentication Flow

```
┌─────────────┐                          ┌──────────────┐
│   Frontend  │                          │  Auth Service│
└──────┬──────┘                          └──────┬───────┘
       │                                         │
       │ 1. POST /auth/login                     │
       │ {"email", "password"}                   │
       ├────────────────────────────────────────→│
       │                                         │
       │                          2. Verify password
       │                          Hash comparison
       │                                         │
       │               3. Generate JWT Tokens    │
       │               (access, refresh)         │
       │                                         │
       │<────────────────────────────────────────┤
       │ {"access_token", "refresh_token", user}│
       │                                         │
```

### 12.2 Token Structure

**Access Token (JWT - HS256):**
```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "ama.boateng@hospitals.gov.gh",
  "role": "HOSPITAL_ADMIN",
  "iat": 1705326600,
  "exp": 1705327500  // 900 seconds = 15 minutes
}

Signature: HMAC-SHA256(
  base64(header) + "." + base64(payload),
  JWT_SECRET
)
```

**JWT_SECRET:** `14b9a637dcc6bc1e89758eaf0a4bb0a9fe019930f28f4876eff2621174026982`
(Same across all 4 services for token verification consistency)

### 12.3 Authorization & Role-Based Access Control (RBAC)

**Method:** Endpoint-level middleware chain

```javascript
// Apply middleware in sequence:
router.post('/incidents', 
  authMiddleware,           // 1. Verify JWT valid
  roleMiddleware(['SYSTEM_ADMIN']),  // 2. Check role
  IncidentController.createIncident  // 3. Handle request
);

router.get('/incidents/open',
  authMiddleware,           // 1. Verify JWT valid
  incidentFilterMiddleware, // 2. Set type filter based on role
  IncidentController.getOpenIncidents  // 3. Filter results
);
```

**Access Denied Response (403):**
```json
{
  "error": "Access denied - insufficient permissions",
  "code": "FORBIDDEN",
  "required_roles": ["SYSTEM_ADMIN"],
  "user_role": "HOSPITAL_ADMIN"
}
```

### 12.4 Password Security

- **Hashing:** bcryptjs with 10 salt rounds (OWASP recommended)
- **Storage:** `passwordHash` in database (never plaintext)
- **Validation:**
  - Minimum 6 characters
  - Compare plaintext input wit hash using `bcrypt.compare()`
- **Reset:** Via temporary token sent to email (future enhancement)

### 12.5 Data Encryption

| Channel | Method | Status |
|---|---|---|
| HTTP Communication | TLS 1.3 | ✅ All HTTPS |
| Database Passwords | bcryptjs | ✅ Hashed |
| JWT Payload | Signed | ✅ HS256 |
| Sensitive Data (phone numbers) | Plaintext in DB | ⚠️ Could add encryption layer |
| RabbitMQ Messages | Plaintext | ⚠️ Could add encryption |

### 12.6 CORS Configuration

**Frontend Domain:** https://national-emergency-response-system-application-onQ1vahjq.vercel.app

**Backend CORS Headers:**
```javascript
app.use(cors({
  origin: 'https://national-emergency-response-system-application-onQ1vahjq.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
```

### 12.7 Rate Limiting (Production)

**Recommended Configuration:**
- 10 requests per second per IP
- 100 requests per minute for login endpoints
- 1000 requests per hour for standard endpoints

### 12.8 Audit Logging

**Logged Actions:**
- User login/logout (timestamp, user_id, IP)
- Incident creation (incident_id, created_by, timestamp)
- Incident status changes (incident_id, old_status, new_status, timestamp)
- Vehicle registration (vehicle_id, registered_by, timestamp)
- Unauthorized access attempts (user/IP, timestamp, action)

**Future Enhancement:** Audit log visualization in AuditLogPage component

---

## 13. DEPLOYMENT ARCHITECTURE

### 13.1 Production Environment

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT TIER                                 │
├──────────────────────────────────────────────────────────────────────┤
│  Browser (Chrome, Safari, Firefox, Edge)                             │
│  → Vercel CDN → national-emergency-response-system-application-... │
│     (Auto-scaling, DDoS protection, SSL/TLS)                         │
└─────────────────────────────────┬──────────────────────────────────┘
                                  │ HTTPS/WSS
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
┌───────▼────────┐      ┌─────────▼────────┐     ┌────────▼───────┐
│  auth-service  │      │ incident-service │     │dispatch-service│
│  (Render)      │      │   (Render)       │     │   (Render)     │
│  Port 3001     │      │   Port 3002      │     │   Port 3003    │
└─────────────────┘      └──────────────────┘     └────────────────┘
        │                         │                         │
        │                         │                    ┌────▼────────────┐
        │                         │                    │analytics-service│
        │                         │                    │   (Render)      │
        │                         │                    │   Port 3004     │
        │                         │                    └─────────────────┘
        │
        ├─────────────────┐      ┌─────────────────────┐
        │                 │      │                     │
┌───────▼─────┐   ┌──────▼───┐ ┌▼──────────────┐    ┌▼──────────────┐
│   Auth DB   │   │ Incident │ │   Dispatch   │    │  Analytics   │
│ (PostgreSQL)│   │   DB     │ │     DB       │    │   DB         │
│  Render     │   │(PostgreSQL)│  (MongoDB)   │    │(PostgreSQL)  │
└─────────────┘   │(Render)   │  (Render MongoDB)  │  (Render)    │
                  └──────────┘ └──────────────┘    └──────────────┘

                    ┌──────────────────┐
                    │   RabbitMQ       │
                    │   Message Broker │
                    │   (Render)       │
                    └──────────────────┘
                           ▲
                    ┌──────┴──────┐
                    │             │
              Incident Service  Analytics Service
              (publishes events)  (consumes events)
```

### 13.2 Render.com Backend Configuration

**Services Deployed:**
1. **auth-service** (Port 3001)
   - Build: `npm install && npm run build` (if applicable)
   - Start: `node src/server.js`
   - Environment: `.env` with JWT_SECRET, DATABASE_URL, NODE_ENV

2. **incident-service** (Port 3002)
   - Start: `node src/server.js`
   - Environment: JWT_SECRET, DATABASE_URL, RABBITMQ_URL

3. **dispatch-service** (Port 3003)
   - Start: `node src/server.js`
   - Environment: JWT_SECRET, MONGODB_URL, RABBITMQ_URL

4. **analytics-service** (Port 3004)
   - Start: `node src/server.js`
   - Environment: JWT_SECRET, DATABASE_URL, RABBITMQ_URL

**Render Health Checks:**
- Each service configured with `/health` endpoint
- 30-second checks, 3-retry timeout
- Auto-restart on failure

### 13.3 Vercel Frontend Deployment

**Repository:** GitHub: `/national_emergency_response_system_application`

**Deployment Steps:**
1. Push code to `main` branch
2. Vercel automatically triggers build
3. Build command: `npm run build` (Vite optimization)
4. Output directory: `dist/`
5. Auto-deployed to CDN

**Environment Variables (Vercel):**
```
VITE_API_BASE_URL=https://auth-service.onrender.com
VITE_SOCKET_URL=https://incident-service.onrender.com:3002
```

### 13.4 Database Backups

| Database | Service | Backup Strategy |
|---|---|---|
| PostgreSQL (Auth, Incident, Analytics) | Render | Daily auto-backups, 30-day retention |
| MongoDB (Dispatch) | Render MongoDB add-on | Daily snapshots |
| Git Repository | GitHub | Version control, branch protection |

### 13.5 Monitoring & Logging

- **Render Dashboard:** Service health, logs, metrics
- **Error Tracking:** Console logs, error stack traces
- **Performance:** Response times, request counts
- **Uptime:** 99%+ target through auto-restart

---

## 14. KEY FEATURES & FUNCTIONALITIES

### 14.1 Core Features

#### 1. **Centralized Incident Management**
- Single point of entry for all emergency reports
- Real-time incident tracking from creation to resolution
- Automatic incident categorization and routing
- Status workflow: CREATED → DISPATCHED → IN_PROGRESS → RESOLVED

#### 2. **Automated Intelligent Dispatch**
- **Geospatial Matching:** Haversine formula calculates nearest available responder
- **Type-Based Routing:**
  - MEDICAL → HOSPITAL responder (ambulance)
  - FIRE → FIRE_STATION responder (fire truck)
  - CRIME/ROAD_ACCIDENT → POLICE_STATION responder (police car)
- **Manual Override:** System admin can override auto-assignment

#### 3. **Real-time GPS Fleet Tracking**
- Live vehicle location updates via WebSocket
- Historical GPS trail visualization
- Speed and fuel level monitoring
- Vehicle status: IDLE, DISPATCHED, ACTIVE, MAINTENANCE

#### 4. **Multi-Agency Integration**
- Role-based data isolation (Hospital admin sees only medical data, etc.)
- Unified dashboard for system admin (oversight all agencies)
- Inter-service communication via RabbitMQ message queue
- Socket.io real-time synchronization

#### 5. **Advanced Analytics & Reporting**
- Response time calculation (incident creation to responder assignment)
- Incident distribution by region and type
- Resource utilization metrics
- Operational summary for dashboards
- Future: Predictive incident modeling

#### 6. **Audit Trail & Compliance**
- All critical actions logged with timestamp and user
- Track incident creation, assignments, status changes
- Audit log export functionality
- Compliance with emergency response standards

### 14.2 Advanced Features

#### 1. **Dark Mode Support**
- System preference detection (prefers-color-scheme)
- Toggle in user profile
- Applied across all dashboards

#### 2. **Responsive Design**
- Mobile-friendly for tablets and large phones
- Touch-optimized controls (buttons, maps)
- Adaptive layout for different screen sizes

#### 3. **Real-time Notifications**
- Toast alerts for incident creation
- Vehicle assignment notifications
- Status change announcements
- Auto-dismiss or persistent options

#### 4. **Interactive Maps**
- Leaflet-based map with Mapbox tiles
- Incident and vehicle marker clustering
- Zoom, pan, search controls
- Click-to-view details overlay

#### 5. **Animated UI Transitions**
- Framer Motion transitions for dashboard tabs
- Smooth marker animations on map
- Card entrance animations
- Progress indicators for async operations

### 14.3 Future Enhancement Opportunities

1. **Mobile App** (iOS/Android via React Native)
2. **SMS/WhatsApp Integration** for citizen reporting
3. **Predictive Analytics** using machine learning
4. **Multi-language Support** (Twi, Ga, more languages)
5. **Integration with External Agencies** (Private hospitals, NGOs)
6. **Drone Deployment Coordination**
7. **Advanced Route Optimization** for multi-incident scenarios
8. **Citizen Feedback Portal** for incident reporting verification

---

## APPENDIX: CONFIGURATION & DEPLOYMENT GUIDE

### A.1 Environment Variables (.env)

**Auth Service:**
```env
PORT=3001
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/auth_database
JWT_SECRET=14b9a637dcc6bc1e89758eaf0a4bb0a9fe019930f28f4876eff2621174026982
JWT_EXPIRE=900
REFRESH_TOKEN_EXPIRE=604800
```

**Incident Service:**
```env
PORT=3002
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/incident_database
JWT_SECRET=14b9a637dcc6bc1e89758eaf0a4bb0a9fe019930f28f4876eff2621174026982
RABBITMQ_URL=amqp://user:password@host:5672
```

**Dispatch Service:**
```env
PORT=3003
NODE_ENV=production
MONGODB_URL=mongodb+srv://user:password@host/dispatch_database
JWT_SECRET=14b9a637dcc6bc1e89758eaf0a4bb0a9fe019930f28f4876eff2621174026982
RABBITMQ_URL=amqp://user:password@host:5672
```

**Analytics Service:**
```env
PORT=3004
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/analytics_database
JWT_SECRET=14b9a637dcc6bc1e89758eaf0a4bb0a9fe019930f28f4876eff2621174026982
RABBITMQ_URL=amqp://user:password@host:5672
```

### A.2 Quick Start Guide

**Backend Setup (Local Development):**
```bash
# Install dependencies
cd BACKEND/auth-service && npm install
cd ../incident-service && npm install
cd ../dispatch-service && npm install
cd ../analytics-service && npm install

# Start services
docker-compose up -d  # Starts all services + databases

# Verify services
curl http://localhost:3001/health
curl http://localhost:3002/health
curl http://localhost:3003/health
curl http://localhost:3004/health
```

**Frontend Setup (Local Development):**
```bash
cd ghana-emergency-frontend
npm install
npm run dev  # Vite dev server on http://localhost:5173
```

### A.3 Testing

**API Testing (Postman/cURL):**
```bash
# Test registration
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Test1234",
    "role": "SYSTEM_ADMIN"
  }'

# Test login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Test1234"
  }'

# Test incident creation (with token)
curl -X POST http://localhost:3002/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <access_token>" \
  -d '{
    "citizen_name": "Ama",
    "citizen_phone": "+233501234567",
    "incident_type": "MEDICAL",
    "latitude": 5.6037,
    "longitude": -0.1870,
    "location_description": "Accra City Center",
    "notes": "Medical emergency"
  }'
```

---

## CONCLUSION

The Ghana National Emergency Response System is a comprehensive, production-ready emergency management platform that successfully integrates multiple agencies into a unified command-and-control system. The microservices architecture ensures scalability, fault isolation, and independent service deployment. With real-time tracking, automated dispatch, and advanced analytics, the system significantly improves emergency response times and resource coordination across Ghana's emergency services.

**Document Version:** 1.0  
**Last Updated:** March 31, 2026  
**Status:** Complete for Academic Submission

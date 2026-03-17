# 🚀 MICROSERVICES BUILD & TEST GUIDE

This document provides detailed, step-by-step instructions for building and testing each microservice individually.

---

## 📋 Quick Navigation

- [MS-1: Auth Service](#ms-1-auth-service)
- [MS-2: Incident Service](#ms-2-incident-service)
- [MS-3: Dispatch Service](#ms-3-dispatch-service)
- [MS-4: Analytics Service](#ms-4-analytics-service)

---

## ⚙️ IMPORTANT: Cloud Database Credentials Setup

Before building any microservice, you MUST configure the cloud database credentials in each `.env` file.

### Where to Put Your Cloud Database Passwords

Each microservice has a `.env` file in its root directory:

```
BACKEND/
├── auth-service/
│   └── .env          ← PUT YOUR CLOUD DB PASSWORD HERE (DB_PASSWORD=your_password)
├── incident-service/
│   └── .env          ← PUT YOUR CLOUD DB PASSWORD HERE (DB_PASSWORD=your_password)
├── dispatch-service/
│   └── .env          ← PUT YOUR CLOUD DB PASSWORD HERE (MONGO_URI=your_connection_string)
└── analytics-service/
    └── .env          ← PUT YOUR CLOUD DB PASSWORD HERE (DB_PASSWORD=your_password)
```

### Step-by-Step Credential Setup

1. **For PostgreSQL Services (Auth, Incident, Analytics):**
   
   Open `.env` file and replace:
   ```
   DB_HOST=your_cloud_db_host.region.rds.amazonaws.com    # Your cloud DB host
   DB_USER=your_cloud_db_username                          # Your database user
   DB_PASSWORD=your_cloud_db_password_here_!!!CHANGE_THIS!!!  # ← YOUR PASSWORD
   ```

2. **For MongoDB Service (Dispatch):**
   
   Open `.env` file and replace:
   ```
   MONGO_URI=mongodb+srv://your_mongodb_username:your_mongodb_password_!!!CHANGE_THIS!!!@your_cluster.mongodb.net/emergency_dispatch_db
   ```

3. **Common Cloud Database Providers:**
   - **AWS RDS PostgreSQL:** https://aws.amazon.com/rds/postgresql/
   - **Azure Database for PostgreSQL:** https://azure.microsoft.com/en-us/services/postgresql/
   - **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
   - **Google Cloud SQL:** https://cloud.google.com/sql

---

## MS-1: AUTH SERVICE

**Purpose:** User authentication and JWT token management
**Port:** 3001
**Database:** PostgreSQL (Cloud)
**Location:** `BACKEND/auth-service/`

### Step 1: Install Dependencies

```bash
cd BACKEND/auth-service
npm install
```

Expected output:
```
added 156 packages in 45s
```

### Step 2: Configure Cloud Database Credentials

1. Open `BACKEND/auth-service/.env`
2. Replace these lines with your cloud database details:
   ```
   DB_HOST=your_cloud_db_host.xyz.rds.amazonaws.com
   DB_USER=your_username
   DB_PASSWORD=your_actual_password_here
   DB_NAME=emergency_auth_db
   ```
3. Save the file

### Step 3: Create Database & Schema

```bash
# Using your cloud database terminal or connection tool (pgAdmin, DBeaver, etc):

# Create the database
CREATE DATABASE emergency_auth_db;

# Connect to the database and run schema:
\c emergency_auth_db;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_ADMIN')),
    password_hash VARCHAR(512) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
```

### Step 4: Start Auth Service

```bash
cd BACKEND/auth-service
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║   🚀 AUTH SERVICE STARTED              ║
║   Port: 3001                           ║
║   Environment: development             ║
║   Database: emergency_auth_db          ║
╚════════════════════════════════════════╝
```

### Step 5: Test Auth Service Endpoints

Open a new terminal and test the following endpoints:

#### Test 5.1: Register User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "System Admin",
    "email": "admin@emergency.gov.gh",
    "password": "SecurePassword123",
    "role": "SYSTEM_ADMIN"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "user": {
    "user_id": "uuid-here",
    "name": "System Admin",
    "email": "admin@emergency.gov.gh",
    "role": "SYSTEM_ADMIN",
    "created_at": "2026-03-16T10:30:00.000Z"
  }
}
```

#### Test 5.2: Login User
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@emergency.gov.gh",
    "password": "SecurePassword123"
  }'
```

Expected response:
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "user_id": "uuid-here",
    "name": "System Admin",
    "email": "admin@emergency.gov.gh",
    "role": "SYSTEM_ADMIN"
  }
}
```

**SAVE THE ACCESS_TOKEN** - You'll need it for the next tests!

#### Test 5.3: Get Profile (Use the access_token from login)
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

Expected response:
```json
{
  "user_id": "uuid-here",
  "name": "System Admin",
  "email": "admin@emergency.gov.gh",
  "role": "SYSTEM_ADMIN",
  "is_active": true
}
```

#### Test 5.4: Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "Auth Service is running ✅",
  "database": "Connected ✅",
  "timestamp": "2026-03-16T10:30:00.000Z"
}
```

### ✅ Auth Service Verification Checklist

- [ ] Service starts without errors
- [ ] Health endpoint returns "Connected ✅"
- [ ] User registration works
- [ ] User login works and returns JWT tokens
- [ ] Profile endpoint works with valid token
- [ ] Invalid token returns 403 error

---

## MS-2: INCIDENT SERVICE

**Purpose:** Create incidents and assign nearest responders
**Port:** 3002
**Database:** PostgreSQL (Cloud)
**Location:** `BACKEND/incident-service/`

### Step 1: Install Dependencies

```bash
cd BACKEND/incident-service
npm install
```

### Step 2: Configure Cloud Database Credentials

Open `BACKEND/incident-service/.env` and replace:
```
DB_HOST=your_cloud_db_host.xyz.rds.amazonaws.com
DB_USER=your_username
DB_PASSWORD=your_actual_password_here
DB_NAME=emergency_incidents_db
JWT_SECRET=same_secret_as_auth_service
```

### Step 3: Create Database & Schema

```bash
# Using your cloud database terminal:

CREATE DATABASE emergency_incidents_db;

\c emergency_incidents_db;

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE responders (
    responder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    responder_type VARCHAR(50) NOT NULL CHECK (responder_type IN ('POLICE_STATION', 'FIRE_STATION', 'HOSPITAL')),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    bed_capacity INTEGER NULL,
    available_beds INTEGER NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
    incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(20) NOT NULL,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('MEDICAL', 'FIRE', 'CRIME', 'ROAD_ACCIDENT', 'OTHER')),
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    location_description TEXT NULL,
    notes TEXT NULL,
    created_by UUID NOT NULL,
    assigned_unit_id UUID NULL REFERENCES responders(responder_id),
    assigned_unit_type VARCHAR(50) NULL,
    assigned_hospital_id UUID NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('CREATED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED')),
    dispatched_at TIMESTAMP NULL,
    resolved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_responders_type ON responders(responder_type);
CREATE INDEX idx_responders_available ON responders(is_available);
CREATE INDEX idx_incidents_status ON incidents(status);

-- Insert sample responders (Accra coordinates)
INSERT INTO responders (name, responder_type, latitude, longitude, is_available, bed_capacity, available_beds)
VALUES 
    ('Accra Central Hospital', 'HOSPITAL', 5.6037, -0.1870, TRUE, 150, 35),
    ('Korle Bu Teaching Hospital', 'HOSPITAL', 5.5928, -0.1914, TRUE, 500, 120),
    ('Accra Central Police Station', 'POLICE_STATION', 5.6007, -0.1885, TRUE, NULL, NULL),
    ('Accra Central Fire Station', 'FIRE_STATION', 5.6010, -0.1870, TRUE, NULL, NULL);
```

### Step 4: Start Incident Service

```bash
cd BACKEND/incident-service
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║   🚀 INCIDENT SERVICE STARTED          ║
║   Port: 3002                           ║
║   Environment: development             ║
║   Database: emergency_incidents_db     ║
╚════════════════════════════════════════╝
```

### Step 5: Test Incident Service Endpoints

**Important:** Use the AUTH TOKEN from MS-1 login

#### Test 5.1: Create Incident
```bash
curl -X POST http://localhost:3002/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "citizen_name": "John Smith",
    "citizen_phone": "+233501234567",
    "incident_type": "MEDICAL",
    "latitude": 5.6037,
    "longitude": -0.1870,
    "location_description": "Makola Market Area",
    "notes": "Patient reported shortness of breath"
  }'
```

Expected response:
```json
{
  "message": "Incident created successfully",
  "incident": {
    "incident_id": "uuid-here",
    "citizen_name": "John Smith",
    "citizen_phone": "+233501234567",
    "incident_type": "MEDICAL",
    "latitude": 5.6037,
    "longitude": -0.1870,
    "status": "CREATED",
    "created_by": "admin-user-id"
  }
}
```

**SAVE THE incident_id** - You'll need it for next tests!

#### Test 5.2: Get Open Incidents
```bash
curl -X GET "http://localhost:3002/incidents/open" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "incidents": [
    {
      "incident_id": "uuid",
      "citizen_name": "John Smith",
      "status": "CREATED",
      ...
    }
  ],
  "count": 1
}
```

#### Test 5.3: Get Specific Incident
```bash
curl -X GET "http://localhost:3002/incidents/YOUR_INCIDENT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response: Full incident object with all details

#### Test 5.4: List All Responders
```bash
curl -X GET "http://localhost:3002/incidents/responders" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "responders": [
    {
      "responder_id": "uuid",
      "name": "Accra Central Hospital",
      "responder_type": "HOSPITAL",
      "latitude": 5.6037,
      "longitude": -0.1870,
      "is_available": true
    }
  ],
  "count": 4
}
```

#### Test 5.5: Update Incident Status
```bash
curl -X PUT "http://localhost:3002/incidents/YOUR_INCIDENT_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "status": "DISPATCHED"
  }'
```

Expected response:
```json
{
  "message": "Incident status updated",
  "incident": {
    "incident_id": "uuid",
    "status": "DISPATCHED",
    ...
  }
}
```

### ✅ Incident Service Verification Checklist

- [ ] Service starts without errors
- [ ] Health endpoint returns "Connected ✅"
- [ ] Create incident works (contains nearest responder)
- [ ] List open incidents works
- [ ] Get specific incident works
- [ ] List responders works
- [ ] Update incident status works

---

## MS-3: DISPATCH SERVICE

**Purpose:** Track vehicle GPS locations in real-time
**Port:** 3003
**Database:** MongoDB (Cloud)
**Location:** `BACKEND/dispatch-service/`

### Step 1: Install Dependencies

```bash
cd BACKEND/dispatch-service
npm install
```

### Step 2: Configure Cloud MongoDB Credentials

Open `BACKEND/dispatch-service/.env` and replace:
```
MONGO_URI=mongodb+srv://your_username:your_password_!!!CHANGE_THIS!!!@your_cluster.mongodb.net/emergency_dispatch_db?retryWrites=true&w=majority
```

**Example for MongoDB Atlas:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a cluster if you don't have one
3. Click "Connect" → "Drivers" → Copy the connection string
4. Replace `<username>` and `<password>` with your credentials

### Step 3: Start Dispatch Service

The service will automatically create collections and indexes:

```bash
cd BACKEND/dispatch-service
npm run dev
```

Expected output:
```
✅ Connected to Dispatch Service MongoDB
╔════════════════════════════════════════╗
║   🚀 DISPATCH SERVICE STARTED          ║
║   Port: 3003                           ║
║   Environment: development             ║
║   Database: MongoDB (Dispatch)         ║
╚════════════════════════════════════════╝
```

### Step 4: Test Dispatch Service Endpoints

**Important:** Use the AUTH TOKEN from MS-1 login

#### Test 4.1: Register Vehicle
```bash
curl -X POST http://localhost:3003/vehicles/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "responder_id": "responder-uuid-from-incident-service",
    "responder_type": "AMBULANCE",
    "driver_user_id": "driver-user-id"
  }'
```

Expected response:
```json
{
  "message": "Vehicle registered successfully",
  "vehicle": {
    "vehicle_id": "uuid-here",
    "responder_id": "responder-uuid",
    "responder_type": "AMBULANCE",
    "status": "IDLE",
    "current_location": {
      "type": "Point",
      "coordinates": [0, 0]
    }
  }
}
```

**SAVE THE vehicle_id** - You'll need it for next tests!

#### Test 4.2: Update Vehicle Location
```bash
curl -X PUT "http://localhost:3003/vehicles/YOUR_VEHICLE_ID/location" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "latitude": 5.6100,
    "longitude": -0.1850,
    "speed_kmh": 45.5
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Location updated"
}
```

#### Test 4.3: Get Current Vehicle Location
```bash
curl -X GET "http://localhost:3003/vehicles/YOUR_VEHICLE_ID/location" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "vehicle_id": "uuid",
  "current_location": {
    "type": "Point",
    "coordinates": [-0.1850, 5.6100]
  },
  "last_seen": "2026-03-16T10:35:00.000Z",
  "status": "IDLE"
}
```

#### Test 4.4: Get All Vehicles
```bash
curl -X GET "http://localhost:3003/vehicles" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "vehicles": [
    {
      "vehicle_id": "uuid",
      "responder_type": "AMBULANCE",
      "status": "IDLE",
      ...
    }
  ],
  "count": 1
}
```

#### Test 4.5: Get Location History
```bash
curl -X GET "http://localhost:3003/vehicles/YOUR_VEHICLE_ID/history?limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "vehicle_id": "uuid",
  "history": [
    {
      "location": {
        "type": "Point",
        "coordinates": [-0.1850, 5.6100]
      },
      "speed_kmh": 45.5,
      "recorded_at": "2026-03-16T10:35:00.000Z"
    }
  ],
  "count": 1
}
```

### ✅ Dispatch Service Verification Checklist

- [ ] Service starts without errors
- [ ] MongoDB connection successful
- [ ] Health endpoint returns "Connected ✅"
- [ ] Register vehicle works
- [ ] Update location works
- [ ] Get current location works
- [ ] Get all vehicles works
- [ ] Get location history works

---

## MS-4: ANALYTICS SERVICE

**Purpose:** Aggregate and analyze emergency response metrics
**Port:** 3004
**Database:** PostgreSQL with TimescaleDB (Cloud)
**Location:** `BACKEND/analytics-service/`

### Step 1: Install Dependencies

```bash
cd BACKEND/analytics-service
npm install
```

### Step 2: Configure Cloud Database Credentials

Open `BACKEND/analytics-service/.env` and replace:
```
DB_HOST=your_cloud_db_host.xyz.rds.amazonaws.com
DB_USER=your_username
DB_PASSWORD=your_actual_password_here
DB_NAME=emergency_analytics_db
JWT_SECRET=same_secret_as_other_services
```

### Step 3: Create Database & Schema with TimescaleDB

```bash
# Using your cloud database terminal:

CREATE DATABASE emergency_analytics_db;

\c emergency_analytics_db;

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE incident_events (
    event_id UUID DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('CREATED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED')),
    incident_type VARCHAR(50) NOT NULL,
    region VARCHAR(100) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    responder_type VARCHAR(50) NULL,
    response_time_sec INTEGER NULL,
    resolution_time_sec INTEGER NULL,
    event_time TIMESTAMPTZ NOT NULL
);

-- Convert to hypertable (time-series optimized)
SELECT create_hypertable('incident_events', 'event_time', if_not_exists => TRUE);

-- Create indexes
CREATE INDEX idx_incident_id ON incident_events(incident_id);
CREATE INDEX idx_incident_type ON incident_events(incident_type);
CREATE INDEX idx_region ON incident_events(region);
CREATE INDEX idx_event_type ON incident_events(event_type);
```

### Step 4: Start Analytics Service

```bash
cd BACKEND/analytics-service
npm run dev
```

Expected output:
```
╔════════════════════════════════════════╗
║   🚀 ANALYTICS SERVICE STARTED         ║
║   Port: 3004                           ║
║   Environment: development             ║
║   Database: emergency_analytics_db     ║
║   Database: TimescaleDB (Time-series)  ║
╚════════════════════════════════════════╝
```

### Step 5: Test Analytics Service Endpoints

**Important:** Use the AUTH TOKEN from MS-1 login

#### Test 5.1: Get Response Times
```bash
curl -X GET "http://localhost:3004/analytics/response-times" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response (may be empty initially):
```json
{
  "average_response_time_seconds": null,
  "filters": {
    "from": null,
    "to": null,
    "type": null,
    "region": null
  }
}
```

#### Test 5.2: Get Incidents by Region
```bash
curl -X GET "http://localhost:3004/analytics/incidents-by-region" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response (empty initially):
```json
{
  "incidents_by_region": [],
  "count": 0,
  "filters": {
    "from": null,
    "to": null
  }
}
```

#### Test 5.3: Get Resource Utilization
```bash
curl -X GET "http://localhost:3004/analytics/resource-utilization" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "resource_utilization": [],
  "count": 0,
  "filters": {
    "from": null,
    "to": null
  }
}
```

#### Test 5.4: Get Daily Summary
```bash
curl -X GET "http://localhost:3004/analytics/daily-summary?date=2026-03-16" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Expected response:
```json
{
  "daily_summary": {
    "date": "2026-03-16",
    "total_incidents": null,
    "resolved_incidents": null,
    "avg_response_time": null
  },
  "date": "2026-03-16"
}
```

### ✅ Analytics Service Verification Checklist

- [ ] Service starts without errors
- [ ] Health endpoint returns "Connected ✅"
- [ ] Get response times endpoint works
- [ ] Get incidents by region endpoint works
- [ ] Get resource utilization endpoint works
- [ ] Get daily summary endpoint works

---

## 🧪 Full System Integration Test

Once all 4 services are running, test the complete flow:

### Step 1: Open 4 Terminals

**Terminal 1:** Auth Service
```bash
cd BACKEND/auth-service && npm run dev
```

**Terminal 2:** Incident Service
```bash
cd BACKEND/incident-service && npm run dev
```

**Terminal 3:** Dispatch Service
```bash
cd BACKEND/dispatch-service && npm run dev
```

**Terminal 4:** Analytics Service
```bash
cd BACKEND/analytics-service && npm run dev
```

### Step 2: Run Integration Tests (Terminal 5)

```bash
# 1. Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "test@test.com",
    "password": "Test123",
    "role": "SYSTEM_ADMIN"
  }'

# 2. Login and get token
TOKEN=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123"}' | jq -r '.access_token')

echo "Token: $TOKEN"

# 3. Create incident
curl -X POST http://localhost:3002/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "citizen_name": "Test Patient",
    "citizen_phone": "+233501234567",
    "incident_type": "MEDICAL",
    "latitude": 5.6037,
    "longitude": -0.1870,
    "location_description": "Test Location"
  }'

# 4. Register vehicle
curl -X POST http://localhost:3003/vehicles/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "responder_id": "test-responder",
    "responder_type": "AMBULANCE"
  }'

# 5. Check analytics
curl -X GET "http://localhost:3004/analytics/response-times" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Expected Final Output

When all services are running correctly, you should see:

```
╔════════════════════════════════════════╗
║   ✅ ALL SERVICES RUNNING              ║
╠════════════════════════════════════════╣
║ Auth Service..................... 3001 ║
║ Incident Service................ 3002 ║
║ Dispatch Service................ 3003 ║
║ Analytics Service............... 3004 ║
╚════════════════════════════════════════╝

Database Status:
✅ PostgreSQL (Auth)
✅ PostgreSQL (Incidents)
✅ MongoDB (Dispatch)
✅ TimescaleDB (Analytics)
```

---

## 🚨 Troubleshooting

### Service won't start
- Check `.env` credentials
- Verify cloud database connectivity
- Check if ports are available: `netstat -ano | findstr :3001`

### "Cannot connect to database"
- Verify database host, username, password
- Check if cloud database allows your IP
- Ensure database exists and schema is created

### "Invalid token" error
- Ensure JWT_SECRET is same in all `.env` files
- Token may have expired, re-login
- Check token format in header: `Bearer <token>`

### Timeout errors
- Cloud database may be slow, increase timeout
- Check network connectivity
- Verify security groups/firewall rules

---

**Document Created:** March 16, 2026
**Last Updated:** March 16, 2026

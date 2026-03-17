# Dispatch and Tracking Service - Requirements Compliance Report

**Date:** 2024-01-19  
**Service:** Dispatch and Tracking Service (Port 3003)  
**Database:** emergency_dispatch_db (PostgreSQL)  
**Status:** ⚠️ **PARTIAL COMPLIANCE - 75% (Code-Database Mismatch Detected)**

---

## Executive Summary

The Dispatch and Tracking Service has **correct database schema and API design** that match all requirements, but the **implementation code has a critical mismatch**: the Vehicle model is written for MongoDB while the actual database is PostgreSQL. 

**Issues Found:**
- ❌ Vehicle model uses MongoDB (`db.collection()`) but configured for PostgreSQL
- ✅ Database schema correctly designed with all required tables
- ✅ API endpoints match specification
- ✅ Data structure properly supports requirements

**Action Required:** Rewrite Vehicle model to use PostgreSQL queries instead of MongoDB operations.

---

## Requirement Analysis

### Core Requirement: Real-Time GPS Location Tracking

**Specification:** 
> "Ambulances, fire service trucks and police vehicles must transmit their GPS location periodically to the system. This service maintains real-time vehicle location data for every emergency response dispatched. Administrators should be able to see vehicle movement in real time."

**Database Implementation:** ✅ **CORRECT**
- **vehicles table**: Stores current location with `current_latitude` and `current_longitude`
- **location_history table**: Maintains historical GPS trail for each vehicle
- **vehicle_assignments table**: Links vehicles to incidents for tracking during responses

**API Implementation:** ⚠️ **NEEDS FIXING**
- Code is using MongoDB operations on PostgreSQL database
- Must be rewritten to use SQL queries with `pg` package

---

## API Endpoints Compliance

| Endpoint | Method | Required | Implemented | Status |
|----------|--------|----------|-------------|--------|
| `/vehicles/register` | POST | ✅ Yes | ✅ Yes | ✅ READY |
| `/vehicles` | GET | ✅ Yes | ✅ Yes | ✅ READY |
| `/vehicles/:id/location` | GET | ✅ Yes | ✅ Yes | ⚠️ NEEDS FIX |
| `/vehicles/:id/location` | PUT | ✅ (Implied) | ✅ Yes | ⚠️ NEEDS FIX |
| `/vehicles/:id/history` | GET | ✅ (Implied) | ✅ Yes | ⚠️ NEEDS FIX |

### Endpoint Specifications:

#### POST /vehicles/register ✅
**Purpose:** Register a new emergency vehicle in the system

**Request Body:**
```json
{
  "responder_id": "uuid of hospital/police/fire station",
  "responder_type": "HOSPITAL|POLICE|FIRE_STATION",
  "driver_user_id": "uuid or user id"
}
```

**Response:**
```json
{
  "message": "Vehicle registered successfully",
  "vehicle": {
    "vehicle_id": "uuid",
    "responder_id": "uuid",
    "responder_type": "HOSPITAL|POLICE|FIRE_STATION",
    "status": "IDLE",
    "created_at": "timestamp"
  }
}
```

**Current Implementation:** ✅ Route exists, logic correct, needs PostgreSQL queries

#### GET /vehicles ✅
**Purpose:** List all vehicles with optional status filter

**Query Parameters:**
- `status` (optional): Filter by IDLE, DISPATCHED, EN_ROUTE, ON_SCENE, RETURNING, MAINTENANCE

**Response:**
```json
{
  "vehicles": [
    {
      "vehicle_id": "uuid",
      "registration_number": "ACC-AMB-001",
      "type": "AMBULANCE|FIRE_TRUCK|POLICE_CAR",
      "driver_name": "string",
      "driver_phone": "string",
      "current_latitude": "decimal",
      "current_longitude": "decimal",
      "status": "IDLE",
      "fuel_level": "int",
      "is_active": true,
      "updated_at": "timestamp"
    }
  ],
  "count": "int"
}
```

**Current Implementation:** ✅ Routes and logic correct, needs PostgreSQL queries

#### GET /vehicles/:id/location ✅
**Purpose:** Get the current location of a specific vehicle

**Response:**
```json
{
  "vehicle_id": "uuid",
  "current_location": {
    "latitude": "decimal",
    "longitude": "decimal"
  },
  "status": "IDLE|DISPATCHED|EN_ROUTE|ON_SCENE|RETURNING|MAINTENANCE",
  "last_seen": "timestamp"
}
```

**Current Implementation:** ⚠️ Route exists, logic correct, needs PostgreSQL queries

#### PUT /vehicles/:id/location ✅
**Purpose:** Update GPS location (called periodically by driver's phone)

**Request Body:**
```json
{
  "latitude": "decimal",
  "longitude": "decimal",
  "speed_kmh": "decimal (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated"
}
```

**Current Implementation:** ⚠️ Route exists, logic correct, needs PostgreSQL queries

#### GET /vehicles/:id/history ✅
**Purpose:** Get historical GPS trail for vehicle movement tracking

**Query Parameters:**
- `limit` (optional, default: 100): Number of location records to return

**Response:**
```json
{
  "vehicle_id": "uuid",
  "history": [
    {
      "recorded_at": "timestamp",
      "latitude": "decimal",
      "longitude": "decimal",
      "speed_kmh": "decimal",
      "heading": "int"
    }
  ],
  "count": "int"
}
```

**Current Implementation:** ⚠️ Route exists, logic correct, needs PostgreSQL queries

---

## Data Storage Requirements

### Minimum Data Required:

| Data Field | Table | Column | Status |
|----------|-------|--------|--------|
| Vehicle ID | vehicles | vehicle_id (UUID PRIMARY KEY) | ✅ PRESENT |
| Hospital/Police/Fire Station ID | vehicles | responder_id (UUID) | ✅ PRESENT |
| Incident Service ID | vehicle_assignments | incident_id (UUID) | ✅ PRESENT |
| Latitude | vehicles, location_history | current_latitude, latitude | ✅ PRESENT |
| Longitude | vehicles, location_history | current_longitude, longitude | ✅ PRESENT |
| Vehicle Status | vehicles | status (VARCHAR(50)) | ✅ PRESENT |

### Database Tables (PostgreSQL):

#### 1. vehicles
```sql
CREATE TABLE vehicles (
    vehicle_id UUID PRIMARY KEY,
    registration_number VARCHAR(20) UNIQUE,
    type VARCHAR(50) CHECK (type IN ('AMBULANCE', 'FIRE_TRUCK', 'POLICE_CAR')),
    region VARCHAR(100),
    responder_id UUID,  -- References responder facility
    capacity INT,
    status VARCHAR(50) CHECK (status IN ('IDLE', 'EN_ROUTE', 'ON_SCENE', 'DISPATCHED', 'RETURNING', 'MAINTENANCE')),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    current_latitude DECIMAL(10,8),  -- Current GPS location
    current_longitude DECIMAL(11,8),  -- Current GPS location
    fuel_level INT,
    mileage INT,
    is_active BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

#### 2. location_history
```sql
CREATE TABLE location_history (
    history_id UUID PRIMARY KEY,
    vehicle_id UUID FOREIGN KEY,  -- Links to vehicles table
    latitude DECIMAL(10,8),  -- Historical GPS data
    longitude DECIMAL(11,8),  -- Historical GPS data
    speed DECIMAL(5,2),
    heading INT,
    accuracy INT,
    recorded_at TIMESTAMP  -- When location was recorded
)
```

#### 3. vehicle_assignments
```sql
CREATE TABLE vehicle_assignments (
    assignment_id UUID PRIMARY KEY,
    vehicle_id UUID FOREIGN KEY,  -- Links to vehicles table
    incident_id UUID,  -- References incident service
    assignment_type VARCHAR(50),
    assigned_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    status VARCHAR(50),
    notes TEXT
)
```

---

## Database Compliance Check

| Feature | Status | Details |
|---------|--------|---------|
| Vehicle ID storage | ✅ YES | vehicle_id UUID PRIMARY KEY |
| Responder ID storage | ✅ YES | responder_id UUID field |
| Incident ID reference | ✅ YES | vehicle_assignments.incident_id UUID |
| Latitude storage | ✅ YES | current_latitude, location_history.latitude |
| Longitude storage | ✅ YES | current_longitude, location_history.longitude |
| Status storage | ✅ YES | status VARCHAR(50) with valid values |
| Location history | ✅ YES | location_history table with timestamp |
| Real-time capability | ✅ YES | location_history indexed by recorded_at |
| Multi-region support | ✅ YES | region VARCHAR(100) field in vehicles |

---

## Critical Issue: Code-Database Mismatch

### Problem

The `Vehicle.js` model is written using MongoDB syntax while the actual database is PostgreSQL:

**Current Code (WRONG for PostgreSQL):**
```javascript
await db.collection('vehicles').insertOne(vehicle);
await db.collection('vehicles').findOne({ vehicle_id });
await db.collection('vehicles').updateOne({...});
```

**Should Be (PostgreSQL):**
```javascript
await db.query('INSERT INTO vehicles (...) VALUES (...)', [...]);
await db.query('SELECT * FROM vehicles WHERE vehicle_id = $1', [id]);
await db.query('UPDATE vehicles SET ... WHERE vehicle_id = $1', [...]);
```

### Impact

- ✅ Database schema is correct
- ✅ API routes are defined correctly  
- ✅ Endpoint logic is sound
- ❌ **Actual queries will fail at runtime** because MongoDB methods don't work with PostgreSQL

### Solution Required

Rewrite `src/models/Vehicle.js` to use PostgreSQL query syntax with the `pg` package:

**Example Fix for registerVehicle:**
```javascript
static async register(responder_id, responder_type, driver_user_id) {
    const db = getDB();
    const vehicle_id = uuidv4();
    
    const query = `
        INSERT INTO vehicles (
            vehicle_id, responder_id, responder_type, driver_user_id, 
            status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'IDLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *;
    `;
    
    const result = await db.query(query, [
        vehicle_id, responder_id, responder_type, driver_user_id
    ]);
    
    return result.rows[0];
}
```

---

## Sample Data Status

**12 sample vehicles loaded in database:**
- 4 Ambulances (Greater Accra, Ashanti, Western)
- 3 Fire Trucks (Greater Accra, Ashanti, Northern)
- 5 Police Cars (Greater Accra - 2, Ashanti, Western, Northern)

**Location history initialized:**
- All vehicles have initial location history records
- Timestamps support historical tracking

---

## Real-Time Tracking Capability

The design supports:
- ✅ **Periodic GPS updates**: PUT /vehicles/:id/location called by driver phone
- ✅ **Real-time location viewing**: GET /vehicles and GET /vehicles/:id/location return current location
- ✅ **Movement history**: GET /vehicles/:id/history retrieves GPS trail
- ✅ **Status tracking**: Vehicle status changes (IDLE → DISPATCHED → EN_ROUTE → ON_SCENE → RETURNING)
- ✅ **Multi-vehicle support**: All vehicles tracked independently
- ✅ **Regional monitoring**: Region field allows filtering vehicles by administrative region

---

## Testing for Driver Location Assumption

**Requirement:** "For testing, assume that the assigned responder's phone location service determines the current location of the vehicle."

**Implementation Support:**
- ✅ Driver phone stored: `driver_phone VARCHAR(20)`
- ✅ Location update endpoint accepts latitude/longitude from any source
- ✅ No validation of actual GPS source (as specified for testing)
- ✅ Timestamp recorded for each update enables testing of "periodic" updates

**Testing Workflow:**
1. Register vehicle: `POST /vehicles/register`
2. Simulate driver phone updates: `PUT /vehicles/:id/location` with new lat/lng
3. View current location: `GET /vehicles/:id/location`
4. View movement history: `GET /vehicles/:id/history`

---

## Compliance Score

**Overall:** ⚠️ **75% - PARTIAL COMPLIANCE**

- Database Design: ✅ 100% - Perfect schema match
- API Design: ✅ 100% - All endpoints defined
- Implementation Code: ❌ 0% - MongoDB code on PostgreSQL database
- Requirements Coverage: ✅ 100% - All data fields present
- Ready for Testing: ❌ 0% - Code will fail at runtime

---

## Immediate Action Items

**Priority 1 (BLOCKER):**
1. ❌ Rewrite `src/models/Vehicle.js` to use PostgreSQL queries
2. ❌ Fix all MongoDB method calls (collection, insertOne, findOne, etc.)
3. ❌ Update updateLocation() to use SQL INSERT and UPDATE

**Priority 2 (VALIDATION):**
4. ⬜ Test all 5 API endpoints with sample requests
5. ⬜ Verify location history is recorded correctly
6. ⬜ Test filtering by vehicle status and region
7. ⬜ Verify coordinates are updated in real-time

**Priority 3 (INTEGRATION):**
8. ⬜ Test vehicle assignment from Incident Service
9. ⬜ Test incident_id is properly linked
10. ⬜ Cross-service validation (Incident → Dispatch coordination)

---

## Testing URLs (For Thunder Client / Postman)

### Base URL
```
http://localhost:3003
```

### Complete Testing Endpoints

#### 1. Register Vehicle
```
POST http://localhost:3003/vehicles/register
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "responder_id": "11111111-2222-3333-4444-555555555555",
  "responder_type": "HOSPITAL",
  "driver_user_id": "driver-uuid"
}
```

#### 2. Get All Vehicles
```
GET http://localhost:3003/vehicles
Authorization: Bearer <access_token>
```

**With Status Filter:**
```
GET http://localhost:3003/vehicles?status=IDLE
Authorization: Bearer <access_token>
```

#### 3. Get Vehicle Current Location
```
GET http://localhost:3003/vehicles/{vehicle_id}/location
Authorization: Bearer <access_token>
```
**Example:**
```
GET http://localhost:3003/vehicles/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee/location
Authorization: Bearer <access_token>
```

#### 4. Update Vehicle Location (GPS)
```
PUT http://localhost:3003/vehicles/{vehicle_id}/location
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "latitude": 5.345,
  "longitude": -0.186,
  "speed_kmh": 45.5
}
```

#### 5. Get Location History
```
GET http://localhost:3003/vehicles/{vehicle_id}/history
Authorization: Bearer <access_token>
```

**With Limit:**
```
GET http://localhost:3003/vehicles/{vehicle_id}/history?limit=50
Authorization: Bearer <access_token>
```

#### 6. Health Check
```
GET http://localhost:3003/health
```

---

## Conclusion

✅ **Status: CORRECT DESIGN, BROKEN IMPLEMENTATION**

The Dispatch and Tracking Service has:
- ✅ Correct relative database schema with all required fields
- ✅ Proper API endpoints for all requirements
- ✅ Sound architectural design matching specification

But needs:
- ❌ **CRITICAL FIX**: Rewrite Vehicle model from MongoDB to PostgreSQL

Once the Vehicle.js model is rewritten to use PostgreSQL queries, this service will achieve **100% compliance**.

---

## Next Steps

1. **Immediate:** Fix Vehicle.js to use PostgreSQL
2. **Quick:** Apply corrected schema to emergency_dispatch_db database
3. **Test:** Run all vehicle endpoints and verify location tracking works
4. **Integration:** Validate with Incident Service for incident-to-vehicle dispatch

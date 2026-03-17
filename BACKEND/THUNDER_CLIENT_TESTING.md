# ⚡ THUNDER CLIENT API TESTING GUIDE

This guide shows you how to test all 4 microservices using Thunder Client in VS Code.

---

## 📦 What is Thunder Client?

Thunder Client is a lightweight REST API testing extension for VS Code. It's similar to Postman but simpler and built into VS Code.

**Advantages:**
- ✅ No separate application needed
- ✅ Lightweight and fast
- ✅ Built-in environment variables
- ✅ Easy collection management
- ✅ Native VS Code integration

---

## 🚀 Step 1: Install Thunder Client Extension

1. **Open VS Code**
2. **Go to Extensions** (Ctrl+Shift+X)
3. **Search for**: "Thunder Client"
4. **Click Install** on the official extension by "Ranga Vadhineni"

**Link:** https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client

---

## 📥 Step 2: Import Pre-made Collection

### Option A: Direct Import

1. **Open Thunder Client** (Click the Thunder icon in VS Code sidebar)
2. **Click Collections** tab
3. **Click the three dots (⋯)** → Import
4. **Navigate to:** `BACKEND/Thunder_Client_Collection.json`
5. **Select and Import**

### Option B: Manual Copy

1. **Open Thunder Client Collections**
2. **Create new collection** → Name it "Emergency Response Platform"
3. **Copy the requests** from the provided list below

---

## 📝 Step 3: Set Up Environment Variables

Environment variables help you store tokens and IDs that change between requests.

### Create Local Environment

1. **Click Environments** in Thunder Client sidebar
2. **Click Create Environment**
3. **Name it:** `Local - Testing`
4. **Add these variables:**

```
access_token = (will be auto-filled after login)
refresh_token = (will be auto-filled after login)
incident_id = (will be auto-filled after creating incident)
vehicle_id = (will be auto-filled after registering vehicle)
```

**To use a variable in requests:** Use `{{variable_name}}`

---

## 💾 Step 4: Update Sample Data in Databases

Before testing, populate the databases with sample data:

```bash
# Connect to PostgreSQL and run:
psql -U postgres -f BACKEND\SAMPLE_DATA.sql

# Or in pgAdmin/DBeaver and paste the contents of SAMPLE_DATA.sql in each database
```

**After running:**
- ✅ Auth database has 4 test users
- ✅ Incident database has 7 sample responders
- ✅ Dispatch database has 5 test vehicles with location history
- ✅ Analytics database has 10 incident events

---

## 🧪 Step 5: Test Each Service

### Part 1: Auth Service (Port 3001)

**Flow:** Health Check → Register → Login → Get Profile

#### Test 1: Health Check
```
GET http://localhost:3001/health

Expected Response:
{
  "status": "Auth Service is running ✅",
  "database": "Connected ✅"
}
```

#### Test 2: Login (Get Access Token)
```
POST http://localhost:3001/auth/login
Headers: Content-Type: application/json

Body:
{
  "email": "admin@emergency.gov.gh",
  "password": "Password123"
}

Expected Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { ... }
}

✅ SAVE THE access_token - You'll need it for all other requests!
```

**To save token automatically in Thunder Client:**
1. **Select the Login request**
2. **Go to Tests tab**
3. **Add this code:**
```javascript
const response = JSON.parse(res.body);
tc.envSet("access_token", response.access_token);
tc.envSet("refresh_token", response.refresh_token);
```

#### Test 3: Get Profile
```
GET http://localhost:3001/auth/profile
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "user_id": "uuid",
  "name": "System Admin",
  "email": "admin@emergency.gov.gh",
  "role": "SYSTEM_ADMIN"
}
```

#### Test 4: Get All Users
```
GET http://localhost:3001/auth/users
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "users": [
    { "user_id": "...", "name": "...", "email": "...", "role": "..." },
    ...
  ],
  "count": 4
}
```

---

### Part 2: Incident Service (Port 3002)

**Flow:** Health Check → Create Incident → Get Open Incidents → Update Status

#### Test 1: Health Check
```
GET http://localhost:3002/health

Expected Response:
{
  "status": "Incident Service is running ✅",
  "database": "Connected ✅"
}
```

#### Test 2: Create Incident (Medical)
```
POST http://localhost:3002/incidents
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{access_token}}

Body:
{
  "citizen_name": "Emma Wilson",
  "citizen_phone": "+233506789012",
  "incident_type": "MEDICAL",
  "latitude": 5.6037,
  "longitude": -0.1870,
  "location_description": "Makola Market",
  "notes": "Patient has severe headache"
}

Expected Response:
{
  "message": "Incident created successfully",
  "incident": {
    "incident_id": "uuid-here",
    "status": "CREATED",
    "assigned_unit_id": null  // If responder auto-assigned
  }
}

✅ SAVE THE incident_id for next tests!
```

**Auto-save incident_id:**
Add to Tests tab:
```javascript
const response = JSON.parse(res.body);
tc.envSet("incident_id", response.incident.incident_id);
```

#### Test 3: Get Open Incidents
```
GET http://localhost:3002/incidents/open
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "incidents": [
    { 
      "incident_id": "...",
      "citizen_name": "Emma Wilson",
      "status": "CREATED",
      ...
    }
  ],
  "count": 3
}
```

#### Test 4: Get Specific Incident
```
GET http://localhost:3002/incidents/{{incident_id}}
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "incident_id": "uuid",
  "citizen_name": "Emma Wilson",
  "status": "CREATED",
  ...
}
```

#### Test 5: Update Incident Status
```
PUT http://localhost:3002/incidents/{{incident_id}}/status
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{access_token}}

Body:
{
  "status": "DISPATCHED"
}

Expected Response:
{
  "message": "Incident status updated",
  "incident": {
    "incident_id": "uuid",
    "status": "DISPATCHED"
  }
}
```

#### Test 6: Get All Responders
```
GET http://localhost:3002/incidents/responders
Headers: Authorization: Bearer {{access_token}}

Expected Response:
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
  "count": 7
}
```

---

### Part 3: Dispatch Service (Port 3003)

**Flow:** Health Check → Register Vehicle → Update Location → Get Location History

#### Test 1: Health Check
```
GET http://localhost:3003/health

Expected Response:
{
  "status": "Dispatch Service is running ✅",
  "database": "Connected ✅"
}
```

#### Test 2: Register Vehicle
```
POST http://localhost:3003/vehicles/register
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{access_token}}

Body:
{
  "responder_id": "responder-006",
  "responder_type": "AMBULANCE"
}

Expected Response:
{
  "message": "Vehicle registered successfully",
  "vehicle": {
    "vehicle_id": "uuid-here",
    "responder_type": "AMBULANCE",
    "status": "IDLE"
  }
}

✅ SAVE THE vehicle_id!
```

**Auto-save vehicle_id:**
```javascript
const response = JSON.parse(res.body);
tc.envSet("vehicle_id", response.vehicle.vehicle_id);
```

#### Test 3: Update Vehicle Location
```
PUT http://localhost:3003/vehicles/{{vehicle_id}}/location
Headers: 
  - Content-Type: application/json
  - Authorization: Bearer {{access_token}}

Body:
{
  "latitude": 5.6100,
  "longitude": -0.1850,
  "speed_kmh": 55.5
}

Expected Response:
{
  "success": true,
  "message": "Location updated"
}
```

#### Test 4: Get Current Vehicle Location
```
GET http://localhost:3003/vehicles/{{vehicle_id}}/location
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "vehicle_id": "uuid",
  "current_location": {
    "type": "Point",
    "coordinates": [-0.1850, 5.6100]
  },
  "last_seen": "2026-03-16T14:30:00.000Z",
  "status": "IDLE"
}
```

#### Test 5: Get All Vehicles
```
GET http://localhost:3003/vehicles
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "vehicles": [
    {
      "vehicle_id": "uuid",
      "responder_type": "AMBULANCE",
      "status": "IDLE",
      ...
    }
  ],
  "count": 6
}
```

#### Test 6: Get Location History
```
GET http://localhost:3003/vehicles/{{vehicle_id}}/history?limit=10
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "vehicle_id": "uuid",
  "history": [
    {
      "location": {
        "type": "Point",
        "coordinates": [-0.1850, 5.6100]
      },
      "speed_kmh": 55.5,
      "recorded_at": "2026-03-16T14:30:00.000Z"
    }
  ],
  "count": 1
}
```

---

### Part 4: Analytics Service (Port 3004)

**Flow:** Health Check → Get Response Times → Get Incidents by Region → Get Daily Summary

#### Test 1: Health Check
```
GET http://localhost:3004/health

Expected Response:
{
  "status": "Analytics Service is running ✅",
  "database": "Connected ✅"
}
```

#### Test 2: Get Average Response Times
```
GET http://localhost:3004/analytics/response-times?from=2026-03-15&to=2026-03-16
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "average_response_time_seconds": 180,
  "filters": {
    "from": "2026-03-15",
    "to": "2026-03-16",
    "type": null,
    "region": null
  }
}
```

#### Test 3: Get Incidents by Region
```
GET http://localhost:3004/analytics/incidents-by-region?from=2026-03-15&to=2026-03-16
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "incidents_by_region": [
    {
      "region": "Darkuman",
      "count": 1,
      "average_response_time": 180
    },
    {
      "region": "Makola",
      "count": 1,
      "average_response_time": 240
    }
  ],
  "count": 2
}
```

#### Test 4: Get Resource Utilization
```
GET http://localhost:3004/analytics/resource-utilization?from=2026-03-15&to=2026-03-16
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "resource_utilization": [
    {
      "responder_type": "HOSPITAL",
      "deployed": 2,
      "available": 5
    },
    {
      "responder_type": "FIRE_TRUCK",
      "deployed": 1,
      "available": 2
    }
  ]
}
```

#### Test 5: Get Daily Summary
```
GET http://localhost:3004/analytics/daily-summary?date=2026-03-16
Headers: Authorization: Bearer {{access_token}}

Expected Response:
{
  "daily_summary": {
    "date": "2026-03-16",
    "total_incidents": 3,
    "resolved_incidents": 1,
    "avg_response_time": 180,
    "by_type": {
      "MEDICAL": 1,
      "FIRE": 1,
      "CRIME": 1
    }
  }
}
```

---

## 📊 Quick Test Sequence

**Recommended order to test everything:**

1. ✅ **Start all 4 services** in separate terminals
2. ✅ **Run INSERT sample data** into databases
3. ✅ **Auth Service Tests**
   - Health Check
   - Login (save access_token)
   - Get Profile
   - Get Users

4. ✅ **Incident Service Tests**
   - Health Check
   - Create Incident (save incident_id)
   - Get Open Incidents
   - Get All Responders
   - Update Status

5. ✅ **Dispatch Service Tests**
   - Health Check
   - Register Vehicle (save vehicle_id)
   - Update Location
   - Get Current Location
   - Get All Vehicles
   - Get History

6. ✅ **Analytics Service Tests**
   - Health Check
   - Get Response Times
   - Get By Region
   - Get Resource Utilization
   - Get Daily Summary

---

## 🔍 Debugging Tips

### Check Response Status

In Thunder Client, the status code appears next to the response:
- **200** = Success
- **201** = Created
- **400** = Bad request (check your JSON)
- **401** = Unauthorized (check your token)
- **500** = Server error (check service logs)

### View Full Response

Click **Response** tab to see:
- Status code
- Response headers
- Response body
- Response time

### Test JavaScript Code

Click **Tests** tab to add assertions:
```javascript
// Check status is 200
tc.assert(res.status === 200, 'Status should be 200');

// Check response has data
tc.assert(res.body.access_token, 'Should have access_token');

// Save variable for next request
tc.envSet("my_var", res.body.data);
```

### View Request Details

Click **Request** tab to verify:
- URL is correct
- Method is correct (GET, POST, etc.)
- Headers are present
- Body is valid JSON

---

## 📚 File Locations

| File | Purpose |
|------|---------|
| `BACKEND/Thunder_Client_Collection.json` | Pre-made collection with all requests |
| `BACKEND/SAMPLE_DATA.sql` | Sample data to populate databases |
| `BACKEND/LOCAL_SETUP_GUIDE.md` | Database setup instructions |
| This file | Thunder Client testing guide |

---

## ✅ Complete Testing Checklist

- [ ] Thunder Client installed in VS Code
- [ ] Collection imported
- [ ] Local environment created
- [ ] PostgreSQL running with sample data
- [ ] All 4 services started (`npm run dev`)
- [ ] Auth service health check passes
- [ ] Successfully logged in and got access_token
- [ ] Incident service health check passes
- [ ] Created incident and got incident_id
- [ ] Dispatch service health check passes
- [ ] Registered vehicle and got vehicle_id
- [ ] Analytics service health check passes
- [ ] All analytics endpoints return data

---

**Now you're ready to thoroughly test your microservices!** 🎉

Each request is fully prepared. Just run them in sequence and watch your APIs work!

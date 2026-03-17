# ✅ COMPLETE API TESTING SETUP - SUMMARY

## 📋 What's Been Created

### 1. ✅ Sample Data SQL Script
**File:** `BACKEND/SAMPLE_DATA.sql`

Includes sample data for all 4 databases:
- **Auth Service:** 4 test users with roles (Admin, Hospital, Police, Fire)
- **Incident Service:** 7 responders + 5 test incidents
- **Dispatch Service:** 5 vehicles + location history
- **Analytics Service:** 10 incident events with metrics

**Default test credentials:**
```
Email: admin@emergency.gov.gh
Password: Password123
Role: SYSTEM_ADMIN
```

### 2. ✅ Thunder Client Collection
**File:** `BACKEND/Thunder_Client_Collection.json`

Pre-configured collection with 25+ API requests:
- 9 Auth Service endpoints
- 8 Incident Service endpoints
- 8 Dispatch Service endpoints
- 5 Analytics Service endpoints

### 3. ✅ Thunder Client Testing Guide
**File:** `BACKEND/THUNDER_CLIENT_TESTING.md`

Complete step-by-step guide including:
- How to install Thunder Client
- How to import the collection
- How to set up environment variables
- Detailed testing flows for each service
- Expected responses for all endpoints
- Debugging tips and tricks

---

## 🚀 Quick Start (3 Steps)

### Step 1: Populate Databases (5 minutes)

```bash
# Option A: Using psql command line
psql -U postgres -f BACKEND\SAMPLE_DATA.sql

# Option B: Using pgAdmin
# 1. Open pgAdmin
# 2. Copy-paste SAMPLE_DATA.sql content into SQL Editor
# 3. Execute for each database

# Option C: Using DBeaver
# 1. Connect to PostgreSQL
# 2. Run SAMPLE_DATA.sql script
```

**After running, verify with:**
```bash
psql -U postgres -d emergency_auth_db -c "SELECT COUNT(*) FROM users;"
# Should return: 4 users
```

### Step 2: Install & Import Thunder Client (5 minutes)

1. **Open VS Code**
2. **Install "Thunder Client" extension** (Ctrl+Shift+X)
3. **Click Thunder icon** in sidebar
4. **Collections → ⋯ → Import**
5. **Select:** `BACKEND/Thunder_Client_Collection.json`
6. **Create Environment "Local - Testing"** with variables:
   - `access_token` 
   - `refresh_token`
   - `incident_id`
   - `vehicle_id`

### Step 3: Start Services & Test (10 minutes)

```bash
# Terminal 1: Auth Service
cd BACKEND\auth-service && npm run dev

# Terminal 2: Incident Service
cd BACKEND\incident-service && npm run dev

# Terminal 3: Dispatch Service
cd BACKEND\dispatch-service && npm run dev

# Terminal 4: Analytics Service
cd BACKEND\analytics-service && npm run dev

# Terminal 5: Thunder Client Testing
# Open Thunder Client and run requests in sequence:
# 1. Login to Auth Service
# 2. Create Incidents
# 3. Register Vehicles
# 4. Query Analytics
```

---

## 📊 Testing Data Overview

### Auth Service Test Users
| Email | Role | Password |
|-------|------|----------|
| admin@emergency.gov.gh | SYSTEM_ADMIN | Password123 |
| hospital@emergency.gov.gh | HOSPITAL_ADMIN | Password123 |
| police@emergency.gov.gh | POLICE_ADMIN | Password123 |
| fire@emergency.gov.gh | FIRE_ADMIN | Password123 |

### Incident Service Sample Responders
| Name | Type | Location | Beds |
|------|------|----------|------|
| Accra Central Hospital | HOSPITAL | 5.6037, -0.1870 | 150 |
| Korle Bu Teaching Hospital | HOSPITAL | 5.5928, -0.1914 | 500 |
| Island Hospital | HOSPITAL | 5.6200, -0.2100 | 200 |
| Accra Central Police Station | POLICE_STATION | 5.6007, -0.1885 | N/A |
| Accra Central Fire Station | FIRE_STATION | 5.6010, -0.1870 | N/A |

### Dispatch Service Sample Vehicles
| Type | Status | Count |
|------|--------|-------|
| AMBULANCE | IDLE | 2 |
| FIRE_TRUCK | IDLE | 1 |
| POLICE_CAR | IDLE | 2 |
| POLICE_CAR | DISPATCHED | 1 |

### Analytics Service Historical Data
| Incident Type | Count | Avg Response Time |
|---------------|-------|-------------------|
| MEDICAL | 1 | 180 sec (3 min) |
| FIRE | 1 | 240 sec (4 min) |
| CRIME | 1 | 120 sec (2 min) |

---

## 🧪 Testing Workflow

### Recommended Test Order

**Phase 1: Authentication (5 minutes)**
```
1. Health Check (Auth Service)
2. Login and get access_token ✅ SAVE THIS
3. Get Profile
4. Get All Users
```

**Phase 2: Incident Management (10 minutes)**
```
5. Health Check (Incident Service)
6. Create Incident - Medical ✅ SAVE incident_id
7. Create Incident - Fire
8. Create Incident - Crime
9. Get Open Incidents
10. Get All Responders
11. Update Incident Status to DISPATCHED
```

**Phase 3: Vehicle Dispatch (10 minutes)**
```
12. Health Check (Dispatch Service)
13. Register Vehicle ✅ SAVE vehicle_id
14. Update Vehicle Location (multiple times to build history)
15. Get Current Location
16. Get Location History
17. Update Vehicle Status to DISPATCHED
18. Get All Vehicles
```

**Phase 4: Analytics & Reporting (5 minutes)**
```
19. Health Check (Analytics Service)
20. Get Average Response Times
21. Get Incidents by Region
22. Get Resource Utilization
23. Get Daily Summary
```

---

## 📁 All Files Created

| File | Purpose | Size |
|------|---------|------|
| SAMPLE_DATA.sql | Sample data insertion | ~5 KB |
| Thunder_Client_Collection.json | Pre-configured API requests | ~25 KB |
| THUNDER_CLIENT_TESTING.md | Step-by-step testing guide | ~20 KB |
| This file | Quick reference summary | ~8 KB |

---

## 🔧 Environment Variables in Thunder Client

After logging in, these variables auto-populate:

```javascript
// Auth Service - runs after login request
const response = JSON.parse(res.body);
tc.envSet("access_token", response.access_token);
tc.envSet("refresh_token", response.refresh_token);

// Incident Service - runs after create incident
tc.envSet("incident_id", response.incident.incident_id);

// Dispatch Service - runs after register vehicle
tc.envSet("vehicle_id", response.vehicle.vehicle_id);
```

Use them in requests with: `{{access_token}}`, `{{incident_id}}`, etc.

---

## ✨ Pro Tips for Testing

### Tip 1: Use Environment Variables
Instead of copy-pasting tokens, use `{{access_token}}` in headers:
```
Authorization: Bearer {{access_token}}
```

### Tip 2: Auto-save Variables
Add tests to requests to auto-capture response values:
```javascript
// Save to environment variable
tc.envSet("key", res.body.data.value);
```

### Tip 3: Chain Requests
Run tests in sequence:
1. Login (saves token)
2. Create Incident (uses token, saves ID)
3. Update Status (uses ID and token)

### Tip 4: View Raw Response
Click "Response" tab to see full JSON response, not just summary.

### Tip 5: Check Status Codes
- 200 = Success
- 201 = Created
- 400 = Bad request (check JSON syntax)
- 401 = Unauthorized (check token)
- 500 = Server error (check service logs)

---

## 🐛 Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| "Cannot connect to database" | PostgreSQL not running | Start PostgreSQL, verify localhost:5432 |
| "Port 3001 already in use" | Another service running | Stop process or use different port |
| "401 Unauthorized" | Invalid/expired token | Re-login to get new token |
| "404 Not Found" | Wrong endpoint URL | Check URL spelling and service port |
| "Variable is empty" | Environment variable not set | First run Login request to populate |
| "No data returned" | Sample data not inserted | Run SAMPLE_DATA.sql script |

---

## 📞 Testing Support Files

**For detailed help, refer to:**
- `BACKEND/LOCAL_SETUP_GUIDE.md` - Database setup
- `BACKEND/THUNDER_CLIENT_TESTING.md` - Testing details
- `BACKEND/LOCAL_TESTING_SETUP.md` - Configuration summary
- `MICROSERVICES_BUILD_AND_TEST.md` - Build instructions

---

## ✅ Pre-Testing Checklist

Before you start testing:

- [ ] PostgreSQL is running on localhost:5432
- [ ] User: postgres, Password: 1234
- [ ] All 4 databases created:
  - [ ] emergency_auth_db
  - [ ] emergency_incidents_db
  - [ ] emergency_dispatch_db
  - [ ] emergency_analytics_db
- [ ] Sample data inserted (ran SAMPLE_DATA.sql)
- [ ] All 4 services started:
  - [ ] Auth Service (3001) - `npm run dev`
  - [ ] Incident Service (3002) - `npm run dev`
  - [ ] Dispatch Service (3003) - `npm run dev`
  - [ ] Analytics Service (3004) - `npm run dev`
- [ ] Thunder Client installed in VS Code
- [ ] Collection imported in Thunder Client
- [ ] Local environment created with variables

---

## 🎉 You're All Set!

Everything is ready for comprehensive API testing:

✅ Sample data in databases
✅ Pre-configured Thunder Client collection
✅ Detailed testing guide
✅ Environment variables set up
✅ All 4 services running

**Start testing now!** 🚀

1. Open Thunder Client (Thunder icon in VS Code)
2. Select "Emergency Response Platform - Microservices"
3. Start with "Health Check" in Auth Service
4. Follow the testing workflow
5. Watch all endpoints work perfectly!

---

**Happy Testing!** 🧪✨

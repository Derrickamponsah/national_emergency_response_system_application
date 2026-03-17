# 🎯 COMPLETE API TESTING GUIDE - Master Reference

## Overview

This guide walks you through testing all 4 microservices using Thunder Client in VS Code with sample data.

---

## 📦 Files You'll Use

| File | Purpose |
|------|---------|
| `SAMPLE_DATA.sql` | SQL script to populate databases |
| `Thunder_Client_Collection.json` | Pre-configured API requests for Thunder Client |
| `INSERT_SAMPLE_DATA.ps1` | PowerShell script to auto-insert sample data |
| `THUNDER_CLIENT_TESTING.md` | Detailed testing guide |
| `API_TESTING_SUMMARY.md` | Quick reference summary |

---

## 🚀 Complete Workflow (30 minutes)

### Phase 1: Database Setup (5 minutes)

**Option A: Manual SQL Execution**
```bash
# Method 1: Using psql command line
psql -U postgres -f BACKEND\SAMPLE_DATA.sql

# Method 2: Using pgAdmin
# 1. Open pgAdmin → Databases → emergency_auth_db
# 2. Tools → Query Tool
# 3. Open SAMPLE_DATA.sql and execute

# Method 3: Using DBeaver
# 1. Right-click BACKEND/SAMPLE_DATA.sql
# 2. Run SQL Script
# 3. Select all 4 databases
```

**Option B: Automated PowerShell Script**
```bash
# Run in PowerShell as Administrator
cd BACKEND
.\INSERT_SAMPLE_DATA.ps1

# Or with custom credentials (if different):
.\INSERT_SAMPLE_DATA.ps1 -Host localhost -Port 5432 -User postgres -Password 1234
```

### Phase 2: Install Thunder Client (3 minutes)

1. **Open VS Code**
2. **Extensions (Ctrl+Shift+X)**
3. **Search:** "Thunder Client"
4. **Install** by Ranga Vadhineni
5. **Restart VS Code**
6. **Click Thunder icon** in left sidebar

### Phase 3: Import Collection (2 minutes)

**In Thunder Client:**
1. **Click Collections** tab
2. **Click three dots (⋯)** 
3. **Select Import**
4. **Choose:** `BACKEND/Thunder_Client_Collection.json`
5. **Click Import**

### Phase 4: Create Environment (2 minutes)

**In Thunder Client:**
1. **Click Environments** tab
2. **Click + Create**
3. **Name:** `Local - Testing`
4. **Add Variables:**
   - `access_token` = (empty - will populate after login)
   - `refresh_token` = (empty)
   - `incident_id` = (empty)
   - `vehicle_id` = (empty)
5. **Save**

### Phase 5: Start All Services (3 minutes)

**Open 4 separate PowerShell windows in BACKEND folder:**

**Terminal 1:**
```bash
cd auth-service
npm run dev
```
Expected: `🚀 AUTH SERVICE STARTED - Port: 3001`

**Terminal 2:**
```bash
cd ..\incident-service
npm run dev
```
Expected: `🚀 INCIDENT SERVICE STARTED - Port: 3002`

**Terminal 3:**
```bash
cd ..\dispatch-service
npm run dev
```
Expected: `🚀 DISPATCH SERVICE STARTED - Port: 3003`

**Terminal 4:**
```bash
cd ..\analytics-service
npm run dev
```
Expected: `🚀 ANALYTICS SERVICE STARTED - Port: 3004`

### Phase 6: Run API Tests (15 minutes)

**In Thunder Client:**

1. **Select** "Emergency Response Platform - Microservices" collection
2. **Select** "Local - Testing" environment
3. **Run in this order:**

#### Test Sequence 1: Authentication (3 min)

```
1. Auth Service → Health Check
   ✅ Verify: Status = 200, database = "Connected ✅"

2. Auth Service → Login
   ✅ Verify: You get access_token
   📌 Environment auto-saves: {{access_token}}, {{refresh_token}}

3. Auth Service → Get Profile
   ✅ Verify: Your user email and role display

4. Auth Service → Get All Users
   ✅ Verify: 4 test users shown
```

#### Test Sequence 2: Incident Management (4 min)

```
5. Incident Service → Health Check
   ✅ Verify: Status = 200, database = "Connected ✅"

6. Incident Service → Create Incident - Medical
   ✅ Verify: incident_id created
   📌 Environment auto-saves: {{incident_id}}

7. Incident Service → Create Incident - Fire
   ✅ Verify: Different incident created

8. Incident Service → Create Incident - Crime
   ✅ Verify: Another incident created

9. Incident Service → Get Open Incidents
   ✅ Verify: Returns 3+ incidents

10. Incident Service → Get All Responders
    ✅ Verify: 7 responders returned

11. Incident Service → Get Specific Incident
    ✅ Verify: Shows incident_id details

12. Incident Service → Update Incident Status to DISPATCHED
    ✅ Verify: Status changed to "DISPATCHED"
```

#### Test Sequence 3: Vehicle Dispatch (4 min)

```
13. Dispatch Service → Health Check
    ✅ Verify: Status = 200, database = "Connected ✅"

14. Dispatch Service → Register Vehicle
    ✅ Verify: vehicle_id created
    📌 Environment auto-saves: {{vehicle_id}}

15. Dispatch Service → Update Vehicle Location
    ✅ Verify: Location updated successfully

16. Dispatch Service → Get Current Vehicle Location
    ✅ Verify: Shows updated coordinates

17. Dispatch Service → Get Location History
    ✅ Verify: Returns location history array

18. Dispatch Service → Get All Vehicles
    ✅ Verify: 6+ vehicles shown

19. Dispatch Service → Update Vehicle Status
    ✅ Verify: Status changed to "DISPATCHED"
```

#### Test Sequence 4: Analytics (3 min)

```
20. Analytics Service → Health Check
    ✅ Verify: Status = 200, database = "Connected ✅"

21. Analytics Service → Get Average Response Times
    ✅ Verify: Returns response time data

22. Analytics Service → Get Incidents by Region
    ✅ Verify: Returns regional breakdown

23. Analytics Service → Get Resource Utilization
    ✅ Verify: Shows resource deployment

24. Analytics Service → Get Daily Summary
    ✅ Verify: Shows daily incident summary
```

---

## 📊 Sample Data Reference

### Auth Service Users
```
username: admin@emergency.gov.gh
password: Password123
role: SYSTEM_ADMIN

username: hospital@emergency.gov.gh
password: Password123
role: HOSPITAL_ADMIN

username: police@emergency.gov.gh
password: Password123
role: POLICE_ADMIN

username: fire@emergency.gov.gh
password: Password123
role: FIRE_ADMIN
```

### Test Incidents Ready to Create
- **Medical:** Makola Market, patient with chest pain
- **Fire:** Danfo Station area, house fire in progress
- **Crime:** Osu Highway, armed robbery

### Test Responders Available
- Accra Central Hospital (150 beds)
- Korle Bu Teaching Hospital (500 beds)
- Island Hospital (200 beds)
- 4 Police & Fire stations

---

## 🎯 Expected Results Per Service

### Auth Service (3001) ✅
- Status code: 200
- Health: Database Connected
- Users: 4 test accounts
- Tokens: JWT access + refresh tokens
- Endpoints: 7 working

### Incident Service (3002) ✅
- Status code: 200
- Health: Database Connected
- Responders: 7 available
- Incidents: Can create unlimited
- Features: Auto-assign nearest responder
- Endpoints: 8 working

### Dispatch Service (3003) ✅
- Status code: 200
- Health: Database Connected
- Vehicles: 5 base + newly registered vehicles
- Locations: Full GeoJSON coordinates
- History: Tracks all location updates
- Endpoints: 8 working

### Analytics Service (3004) ✅
- Status code: 200
- Health: Database Connected
- Events: Historical data available
- Metrics: Response times, regions, utilization
- Data: 10+ historical events
- Endpoints: 5 working

---

## 🔍 How to Use Environment Variables in Thunder Client

### Automatically Save Values

Click the **Tests** tab on a request and add:

```javascript
// Save from login response
if (res.status === 200) {
  const data = JSON.parse(res.body);
  tc.envSet("access_token", data.access_token);
  tc.envSet("refresh_token", data.refresh_token);
}

// Save from create incident
if (res.status === 201) {
  const data = JSON.parse(res.body);
  tc.envSet("incident_id", data.incident.incident_id);
}

// Save from register vehicle
if (res.status === 201) {
  const data = JSON.parse(res.body);
  tc.envSet("vehicle_id", data.vehicle.vehicle_id);
}
```

### Use Variables in Requests

Replace hardcoded values with variables:

```
Authorization: Bearer {{access_token}}
URL: /incidents/{{incident_id}}
URL: /vehicles/{{vehicle_id}}/location
```

---

## ✅ Success Indicators

### You'll Know It's Working When:

1. ✅ All services show "started" messages without errors
2. ✅ Health check returns "Connected ✅"
3. ✅ Login returns tokens (not 401 error)
4. ✅ Can create incidents with auto-assigned responders
5. ✅ Vehicle locations update and show in history
6. ✅ Analytics returns incident metrics
7. ✅ All endpoints respond with 200/201 status
8. ✅ Response times < 500ms
9. ✅ No database connection errors
10. ✅ Data persists between requests

---

## 🐛 Troubleshooting

### Service won't start
```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Check port is free
netstat -ano | findstr :3001

# If port in use, kill process
Get-NetTCPConnection -LocalPort 3001 | Stop-Process -Force
```

### Database connection error
```bash
# Verify connection
psql -U postgres -d emergency_auth_db -c "SELECT 1;"

# Check databases exist
psql -U postgres -l | grep emergency

# Verify sample data exists
psql -U postgres -d emergency_auth_db -c "SELECT COUNT(*) FROM users;"
```

### API returns 401 Unauthorized
```
1. Run Login request again
2. Copy new access_token to {{access_token}} variable
3. Verify Authorization header format: "Bearer TOKEN_HERE"
4. Check JWT_SECRET is same across all services
```

### Thunder Client variable not populating
```
1. Check request Tests tab has correct extraction code
2. Verify response actually contains the field
3. Click Env button to manually view/edit variables
4. Type exact field name from JSON response
```

### No sample data showing up
```
1. Run SAMPLE_DATA.sql again
2. Verify SQL executed without errors
3. Query directly: SELECT COUNT(*) FROM users;
4. Check you're querying correct database
```

---

## 📞 Quick Help Commands

### Test Database Connection
```bash
psql -U postgres -h localhost -d emergency_auth_db -c "SELECT version();"
```

### Insert Sample Data
```bash
# Automated:
cd BACKEND && .\INSERT_SAMPLE_DATA.ps1

# Or manual:
psql -U postgres -f BACKEND\SAMPLE_DATA.sql
```

### Verify Data
```bash
psql -U postgres -d emergency_auth_db -c "SELECT COUNT(*) as users FROM users;"
psql -U postgres -d emergency_incidents_db -c "SELECT COUNT(*) as responders FROM responders;"
psql -U postgres -d emergency_dispatch_db -c "SELECT COUNT(*) as vehicles FROM vehicles;"
psql -U postgres -d emergency_analytics_db -c "SELECT COUNT(*) as events FROM incident_events;"
```

### Stop All Services
```bash
# In each terminal: Ctrl+C
# Or kill all node processes:
Get-Process "node" | Stop-Process -Force
```

---

## 📚 Reference Documentation

| Document | Use For |
|----------|---------|
| `MICROSERVICES_BUILD_AND_TEST.md` | Build & deployment instructions |
| `LOCAL_SETUP_GUIDE.md` | Database setup & verification |
| `THUNDER_CLIENT_TESTING.md` | Detailed endpoint documentation |
| `API_TESTING_SUMMARY.md` | Quick reference & checklist |
| This file | Complete workflow guide |

---

## 🎓 Learning Path

**For Beginners:**
1. Read this master guide first
2. Follow the 30-minute workflow step-by-step
3. Use the sample data provided
4. Test each request in order

**For Advanced Users:**
1. Review endpoint details in `THUNDER_CLIENT_TESTING.md`
2. Modify sample data as needed
3. Test edge cases and error scenarios
4. Create custom test sequences

---

## ✨ Pro Testing Tips

### Tip 1: Test Edge Cases
```json
// Empty fields
{"citizen_name": "", "citizen_phone": ""}

// Invalid types
{"latitude": "not a number"}

// Boundary values
{"response_time_sec": 0, "speed_kmh": -50}
```

### Tip 2: Performance Testing
1. Note response time for each endpoint
2. Typical: 50-200ms for database queries
3. If > 1000ms, investigate database/network

### Tip 3: Data Validation
1. Check all fields in response match request
2. Verify UUIDs are valid format
3. Ensure timestamps are ISO 8601 format
4. Validate coordinates are realistic

### Tip 4: Concurrent Testing
1. Open multiple Thunder Client windows
2. Send same request from both
3. Verify both succeed without conflicts
4. Check databases handle concurrent updates

### Tip 5: Cleanup & Reset
```bash
# Clear environment variables
# Click Env → select variable → delete

# Restart databases
psql -U postgres -d emergency_auth_db -c "DELETE FROM users WHERE email LIKE '%test%';"

# Re-run sample data:
psql -U postgres -f BACKEND\SAMPLE_DATA.sql
```

---

## 🎉 Final Checklist

Before declaring "API Testing Complete":

- [ ] All 4 services running without errors
- [ ] All health checks pass
- [ ] Authentication working (can login)
- [ ] Can create incidents with all types
- [ ] Can register and track vehicles
- [ ] Can query analytics endpoints
- [ ] Environment variables auto-populate
- [ ] Response times acceptable (< 500ms)
- [ ] No database connection errors
- [ ] Sample data persists between tests
- [ ] Can update statuses and locations
- [ ] Full end-to-end workflow works

---

## 🚀 You're Ready!

All testing infrastructure is in place. Follow the 30-minute workflow and you'll have a fully tested microservices platform.

**Happy testing!** 🧪✨

---

**Created:** March 16, 2026
**Last Updated:** March 16, 2026
**Status:** ✅ Complete & Ready for Testing

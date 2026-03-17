# 🚀 LOCAL POSTGRESQL SETUP GUIDE FOR TESTING

This guide helps you set up all microservices locally using PostgreSQL instead of cloud databases.

---

## 📋 Quick Requirements

- **PostgreSQL** installed locally (password: `1234`)
- **User:** postgres
- **Port:** 5432 (default)
- All microservices have `npm install` already completed

---

## ✅ Step 1: Create Local Databases

### Option A: Using pgAdmin (GUI)

1. **Open pgAdmin**
2. **Right-click Databases** → Create → Database
3. **Create these 4 databases:**
   - `emergency_auth_db` (Auth Service)
   - `emergency_incidents_db` (Incident Service)
   - `emergency_dispatch_db` (Dispatch Service)
   - `emergency_analytics_db` (Analytics Service)

4. **In each database, run the SQL script:**
   - Open the **SQL Editor** (Tools → Query Tool)
   - Go to BACKEND folder and open **SETUP_LOCAL_POSTGRES.sql**
   - Copy-paste the relevant SQL section for each database

### Option B: Using Command Line (PowerShell)

```bash
# Install PostgreSQL and set postgres user password to "1234" during setup

# Create databases using psql
psql -U postgres -c "CREATE DATABASE emergency_auth_db;"
psql -U postgres -c "CREATE DATABASE emergency_incidents_db;"
psql -U postgres -c "CREATE DATABASE emergency_dispatch_db;"
psql -U postgres -c "CREATE DATABASE emergency_analytics_db;"

# Run the full SQL script
psql -U postgres -f "BACKEND\SETUP_LOCAL_POSTGRES.sql"
```

### Option C: Using DBeaver (Alternative GUI)

1. Create a new PostgreSQL connection with:
   - Host: `localhost`
   - Port: `5432`
   - User: `postgres`
   - Password: `1234`

2. Execute the SQL script in the SQL Editor

---

## ✅ Step 2: Verify Database Creation

Open any PostgreSQL client (pgAdmin, DBeaver, etc.) and check:

```bash
# List all databases
\l

# Should see:
# - emergency_auth_db
# - emergency_incidents_db
# - emergency_dispatch_db
# - emergency_analytics_db
```

---

## ✅ Step 3: Start All 4 Microservices

**Open 4 separate PowerShell terminals in BACKEND directory:**

### Terminal 1: Auth Service
```powershell
cd auth-service
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════╗
║   🚀 AUTH SERVICE STARTED              ║
║   Port: 3001                           ║
║   Database: emergency_auth_db ✅       ║
╚════════════════════════════════════════╝
```

### Terminal 2: Incident Service
```powershell
cd ..\incident-service
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════╗
║   🚀 INCIDENT SERVICE STARTED          ║
║   Port: 3002                           ║
║   Database: emergency_incidents_db ✅  ║
╚════════════════════════════════════════╝
```

### Terminal 3: Dispatch Service
```powershell
cd ..\dispatch-service
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════╗
║   🚀 DISPATCH SERVICE STARTED          ║
║   Port: 3003                           ║
║   Database: emergency_dispatch_db ✅   ║
╚════════════════════════════════════════╝
```

### Terminal 4: Analytics Service
```powershell
cd ..\analytics-service
npm run dev
```

**Expected output:**
```
╔════════════════════════════════════════╗
║   🚀 ANALYTICS SERVICE STARTED         ║
║   Port: 3004                           ║
║   Database: emergency_analytics_db ✅  ║
╚════════════════════════════════════════╝
```

---

## ✅ Step 4: Test All Services

**Open a 5th PowerShell terminal and run these tests:**

### Test 1: Auth Service Health
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET
```

Expected response: `✅ Auth Service is running`

### Test 2: Register User
```powershell
$body = @{
    name = "Test User"
    email = "test@test.com"
    password = "Test123456"
    role = "SYSTEM_ADMIN"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3001/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

**Expected response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "user_id": "uuid-here",
    "name": "Test User",
    "email": "test@test.com",
    "role": "SYSTEM_ADMIN"
  }
}
```

### Test 3: Login
```powershell
$loginBody = @{
    email = "test@test.com"
    password = "Test123456"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:3001/auth/login" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $loginBody

$response.Content | ConvertFrom-Json | Format-List
```

**Save the `access_token` from response** - You'll need it for next tests!

### Test 4: Incident Service Health
```powershell
Invoke-WebRequest -Uri "http://localhost:3002/health" -Method GET
```

### Test 5: Create Incident
```powershell
$token = "PUT_YOUR_ACCESS_TOKEN_HERE"

$incidentBody = @{
    citizen_name = "John Smith"
    citizen_phone = "+233501234567"
    incident_type = "MEDICAL"
    latitude = 5.6037
    longitude = -0.1870
    location_description = "Makola Market"
    notes = "Patient feeling dizzy"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3002/incidents" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $incidentBody
```

### Test 6: Dispatch Service Health
```powershell
Invoke-WebRequest -Uri "http://localhost:3003/health" -Method GET
```

### Test 7: Register Vehicle
```powershell
$token = "PUT_YOUR_ACCESS_TOKEN_HERE"

$vehicleBody = @{
    responder_id = "test-responder-1"
    responder_type = "AMBULANCE"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3003/vehicles/register" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $vehicleBody
```

### Test 8: Analytics Service Health
```powershell
Invoke-WebRequest -Uri "http://localhost:3004/health" -Method GET
```

---

## 📊 Expected Results

| Service | Status | Database |
|---------|--------|----------|
| Auth Service (3001) | ✅ Running | emergency_auth_db |
| Incident Service (3002) | ✅ Running | emergency_incidents_db |
| Dispatch Service (3003) | ✅ Running | emergency_dispatch_db |
| Analytics Service (3004) | ✅ Running | emergency_analytics_db |

---

## 🆘 Troubleshooting

### ❌ "Cannot connect to database"
- Verify PostgreSQL is running
- Check password is correct: `1234`
- Verify database exists in PostgreSQL
- Check firewall allows localhost:5432

### ❌ "Port 3001 already in use"
```powershell
# Kill process using port
$port = 3001
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) { Stop-Process -Id $process.OwningProcess -Force }
```

### ❌ "Module not found: pg"
```bash
cd auth-service  # or any service
npm install pg
```

### ❌ "Invalid JWT Token"
- Ensure all services use same `JWT_SECRET` in .env
- Token may have expired (valid for 15 minutes)
- Re-login to get new token

### ❌ Services won't start
- Check all .env files have correct credentials
- Verify database schemas are created
- Check node_modules exists: `npm install` again if needed

---

## 📝 Database Connection Details

All microsservices are configured to use:
```
Host: localhost
Port: 5432
User: postgres
Password: 1234
```

**Databases:**
- Auth Service: `emergency_auth_db`
- Incident Service: `emergency_incidents_db`
- Dispatch Service: `emergency_dispatch_db` (using PostgreSQL for now, not MongoDB)
- Analytics Service: `emergency_analytics_db`

---

## ✅ Verification Checklist

- [ ] PostgreSQL installed and running
- [ ] Created 4 databases
- [ ] Ran SQL setup script
- [ ] All 4 microservices start without errors
- [ ] Health check endpoints work
- [ ] Can register a user
- [ ] Can login and get JWT token
- [ ] Can create incident
- [ ] Can register vehicle
- [ ] Can query analytics endpoints

---

**You're now ready to test all microservices locally!** 🎉

Once verified, you can switch back to MongoDB and TimescaleDB for production.

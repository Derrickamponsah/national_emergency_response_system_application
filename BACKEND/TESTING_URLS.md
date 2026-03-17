# 🧪 National Emergency Response Platform - Master API Integration Test Guide

This guide provides a comprehensive, step-by-step workflow to test the entire ecosystem—from registering a new administrator to monitoring real-time dispatch and analytics.

---

## 🏗️ Phase 1: Identity Management (Auth Service - Port 3001)
*Everything begins with an authorized identity. You must be logged in to access operational services.*

### 0. Quick Start (Pre-seeded Credentials)
*If you want to skip registration and use the default system account:*
- **Email:** `admin@emergency.gov.gh`
- **Password:** `password123`

---

### 1. Register a NEW Administrator (Optional)
*Target: Auth Service*
- **URL:** `POST http://localhost:3001/auth/register`
- **Body (JSON):**
    ```json
    {
      "name": "Jane Dispatcher",
      "email": "jane@gmail.com",
      "password": "SecurePass123!",
      "role": "SYSTEM_ADMIN"
    }
    ```
- **Action:** Confirm success. This user is now authorized to create incidents.

### 2. Login to Get Access Token
*Target: Auth Service*
- **URL:** `POST http://localhost:3001/auth/login`

#### 🟢 Option A: Use the Pre-seeded Admin account (Always Works)
```json
{
  "email": "admin@emergency.gov.gh",
  "password": "password123"
}
```

#### 🔵 Option B: Use the account you just registered in Step 1
```json
{
  "email": "jane@gmail.com",
  "password": "SecurePass123!"
}
```
- **Action:** Copy the `access_token` from the response.
- **Note:** In all following services, add the header: `Authorization: Bearer <your_access_token>`.

---

## 🚗 Phase 2: Fleet Readiness (Dispatch Service - Port 3003)
*Before incidents occur, we must register active emergency assets.*

### 3. Register an Ambulance
*Target: Dispatch Service*
- **URL:** `POST http://localhost:3003/vehicles/register`
- **Header:** `Authorization: Bearer <token>`
- **Body (JSON):**
    ```json
    {
      "registrationNumber": "AMB-2026-01",
      "type": "AMBULANCE",
      "region": "Greater Accra",
      "capacity": 2,
      "driverName": "Kwame Mensah",
      "driverPhone": "+233-24-999-0001"
    }
    ```
- **Check:** Status will be `IDLE`. This vehicle is now available for auto-dispatch.

---

## 🚨 Phase 3: Emergency Operation (Incident Service - Port 3002)
*Triggering a live emergency report. This phase tests Database (Pg) + RabbitMQ + Auto-Logic.*

### 4. Create an Incident (Auto-Dispatch Trigger)
*Target: Incident Service*
- **URL:** `POST http://localhost:3002/incidents`
- **Header:** `Authorization: Bearer <token>`
- **Body (JSON):**
    ```json
    {
      "citizen_name": "Samuel Adjei",
      "citizen_phone": "+233-50-678-1234",
      "incident_type": "MEDICAL",
      "latitude": 5.6037,
      "longitude": -0.1870,
      "location_description": "Independence Square, Accra",
      "notes": "Elderly man collapsed near the monument. Unconscious."
    }
    ```
- **Result:** 
    1. Incident is saved to **Aiven Postgres**.
    2. Event `incident.created` is broadcast to **RabbitMQ**.
    3. **Automated Dispatch:** Dispatch Service (3003) will see this and assign `AMB-2026-01`.

---

## 🛰️ Phase 4: Field Tracking (Dispatch Service - Port 3003)
*Simulating real-time movement from the responder's device.*

### 5. Update Vehicle GPS Location (GPS Ping)
*Target: Dispatch Service*
- **URL:** `PUT http://localhost:3003/vehicles/<vehicle_id>/location`
- **Header:** `Authorization: Bearer <token>`
- **Body (JSON):**
    ```json
    {
      "latitude": 5.6045,
      "longitude": -0.1882,
      "speed_kmh": 65.2
    }
    ```
- **Verify:** Use `GET /vehicles/<id>/location` to see the live position update.

---

## 📊 Phase 5: Operational Insights (Analytics Service - Port 3004)
*Verifying that data has been aggregated for the dashboard.*

### 6. Fetch Response Metrics
*Target: Analytics Service*
- **URL:** `GET http://localhost:3004/analytics/response-times`
- **Header:** `Authorization: Bearer <token>`
- **Result:** Check the `total_incidents_analyzed`. It should include the incident created in Phase 3.

### 7. Fetch Incidents by Region
*Target: Analytics Service*
- **URL:** `GET http://localhost:3004/analytics/incidents-by-region`
- **Result:** You should see `Greater Accra` with a count of `1` for `MEDICAL`.

---

## � Quick Reference: POST Endpoints
| Service | Endpoint | Purpose |
| :--- | :--- | :--- |
| **Auth** | `/auth/register` | New Admin Access |
| **Auth** | `/auth/login` | Identity Verification |
| **Incident** | `/incidents` | Live Emergency Reporting |
| **Dispatch** | `/vehicles/register` | Fleet Asset Onboarding |

---

## 🔧 Troubleshooting Master List
- **RabbitMQ:** Ensure the service is running (`localhost:5672`). If disconnected, check terminal logs for "🔄 Reconnecting...".
- **Database (Cloud):** If a service fails to start, verify your `DATABASE_URL` in the `.env` file points to Aiven or Atlas correctly.
- **Port Conflict:** Ensure 3001, 3002, 3003, and 3004 are all free before running `npm run dev`.

---
**Last Updated:** March 17, 2026  
**Status:** 🏗️ Integration Testing collection is READY.

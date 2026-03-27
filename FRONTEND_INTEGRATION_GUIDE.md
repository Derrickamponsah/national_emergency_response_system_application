# 🎨 Frontend Data Integration Guide

This guide maps every UI page to the specific backend fields required for successful integration.

---

## 🔐 1. Authentication (Auth Service - Port 3001)

### **Registration Page**
| Field Name | Type | Validations | Required | Description |
| :--- | :--- | :--- | :--- | :--- |
| `name` | String | Min 2 chars | Yes | Full name of the admin |
| `email` | String | Email Format | Yes | Unique login email |
| `password` | String | Min 6 chars | Yes | Secure password |
| `role` | String | Enum | Yes | `SYSTEM_ADMIN`, `HOSPITAL_ADMIN`, `POLICE_ADMIN`, `FIRE_ADMIN` |

### **Login Page**
| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | String | Yes | Registered email |
| `password` | String | Yes | Account password |
| **Response** | JSON | - | Store `access_token` and `user.role` in LocalStorage/State |

---

## 🚨 2. Incident Management (Incident Service - Port 3002)

### **Create Emergency Page**
| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `citizen_name` | String | Yes | Person reporting the emergency |
| `citizen_phone` | String | Yes | Contact number |
| `incident_type` | String | Yes | `MEDICAL`, `FIRE`, `CRIME`, `ACCIDENT` |
| `latitude` | Float | Yes | GPS Latitude (e.g., 5.6037) |
| `longitude` | Float | Yes | GPS Longitude (e.g., -0.1870) |
| `location_description` | String | No | Landmark or address |
| `notes` | String | No | Additional details for responders |

### **Incident Dashboard (List View)**
| Field to Display | Source | Description |
| :--- | :--- | :--- |
| `incident_id` | `GET /incidents` | Unique reference ID |
| `type` | `GET /incidents` | Emergency type |
| `status` | `GET /incidents` | `CREATED`, `DISPATCHED`, `RESOLVED` |
| `created_at` | `GET /incidents` | Timestamp of the report |

---

## 🚑 3. Fleet & Dispatch (Dispatch Service - Port 3003)

### **Vehicle Onboarding Page**
| Field Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `registrationNumber` | String | Yes | Unique plate/asset number |
| `type` | String | Yes | `AMBULANCE`, `FIRE_TRUCK`, `POLICE_CAR` |
| `region` | String | Yes | Primary area of operation |
| `capacity` | Int | Yes | Number of staff/patients it can hold |
| `driverName` | String | Yes | Assigned driver name |
| `driverPhone` | String | Yes | Direct contact number |

### **Real-time Map Integration**
| Endpoint | Method | Data Used |
| :--- | :--- | :--- |
| `/vehicles/:id/location` | `PUT` | `latitude`, `longitude`, `speed_kmh` (from device) |
| `/vehicles` | `GET` | All vehicle markers to display on map |

---

## 📊 4. Analytics Dashboard (Analytics Service - Port 3004)

### **Metrics Page**
| Chart / Widget | Source Endpoint | Fields to Plot |
| :--- | :--- | :--- |
| **Response Trends** | `/analytics/response-times` | `average_response_time_seconds` |
| **Heatmap** | `/analytics/incidents-by-region` | `region`, `_count._all` |
| **Daily Stats** | `/analytics/daily-summary` | `total_incidents`, `resolved_incidents` |

---

## 💡 Integration Tips
1. **Authorization**: Always include the header `Authorization: Bearer YOUR_TOKEN` for all pages except Login/Register.
2. **Dynamic UI**: Use the `role` from the login response to hide/show pages (e.g., Only `SYSTEM_ADMIN` should see the "Analytics" page).
3. **Location**: Use the browser's Geolocation API (`navigator.geolocation`) to auto-fill the `latitude` and `longitude` in the Incident Create page.

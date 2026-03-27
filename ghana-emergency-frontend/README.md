# 🇬🇭 Ghana Emergency Command Center (Frontend Architecture)

A premium, mission-critical command and control interface designed for the **Ghana National Emergency Response System**. Built with a focus on real-time operational oversight, high-density data visualization, and a "Cyber-Industrial" aesthetic.

---

## 🛠 Technology Stack & Core Infrastructure

The frontend is a specialized React 18 application optimized for performance and rapid situational awareness.

| Technology | Implementation Role |
| :--- | :--- |
| **React 18 + Vite** | High-performance core and ultra-fast development cycle. |
| **Tailwind CSS** | Custom design system with "Glassmorphism" and ultra-premium dark/light modes. |
| **Framer Motion** | Physics-based micro-animations for UI transitions and state changes. |
| **Leaflet & React-Leaflet** | Dynamic "Fleet Geometry" for real-time tracking of active units and incident nodes. |
| **Socket.io-client** | Low-latency bi-directional sync for live incident updates and fleet movement. |
| **Axios** | Interceptor-based service architecture for secure, token-authenticated REST communication. |
| **RBAC Logic** | Role-Based Access Control integrated at the router level for "System-Level" security clearance. |

---

## 🛰 Core Page Architecture & Functionality

The application is structured into specialized "Command Nodes" based on user clearance.

### 1. 🛡 Command Hub (System Admin Dashboard)
The primary strategic interface for nationwide oversight.
- **Live Fleet Geometry**: Real-time map visualizing active incidents (rose nodes) and fleet units (primary nodes).
- **Sub-System Relay Health**: Real-time heartbeat monitoring for Auth, Incident, Fleet, and Registry services.
- **Dispatch Priority Queue**: Immediate oversight of "REPORTED" incidents requiring unit assignment.
- **Operational Metrics**: Real-time KPIs for Total Incidents, Active Units, and System Uptime.

### 📋 Registry & Operational Modules
#### **Incident Control Hub** (`/incidents`)
- **Neural Dispatch Logic**: Interface to input caller data, classify emergencies (MEDICAL, FIRE, CRIME, etc.), and specify geo-descriptors.
- **Active Queue Management**: A live-synced list of all incidents with status badges (CREATED, DISPATCHED, RESOLVED).

#### **Operational Intel Dashboard** (`/analytics`)
- **Response Velocity**: Time-series visualization of aggregate response times across the week.
- **Regional Density Matrix**: Intensity analytics showing incident density per region (Greater Accra, Ashanti, etc.).
- **Strategic KPIs**: Data-driven metrics for daily case loads and fleet efficiency.

### 🏥 Sector-Specific Dashboards
#### **Hospital Admin Dashboard** (`/hospital`)
Specialized for medical coordination, tracking bed occupancy, and unit availability.
#### **Police/Fire Admin Dashboards** (`/police`, `/fire`)
Sector-optimized interfaces for law enforcement and fire department operational oversight.

---

## 🔒 Security & Authorization Flow

- **Clearance Profile**: A dedicated `/profile` node for managing operator credentials and clearance levels.
- **Registry Logs**: A searchable `/audit-logs` registry tracking every critical action taken on the platform.
- **Protected Routing**: Every route is guarded by an `allowedRoles` validation layer, ensuring only authorized personnel access specific command nodes.

---

## 🎨 Design Philosophy: "Strategic Command"
The UI follows a strict "Strategic Command" aesthetic:
- **Tighter Tracking & Italic Typography**: For an urgent, technical feel.
- **Luminescent Status Indicators**: Pulsing emerald/rose nodes for immediate visual cues.
- **Radial Grid Overlays**: Subtle tactical backgrounds for depth and focus.
- **Micro-interactions**: Every button click and data update is animated, providing high tactile feedback to the operator.

---

## 🔨 Deployment & Local Command
1. **Node Synchronization**: `npm install`
2. **Launch Node**: `npm run dev`
3. **Build Binary**: `npm run build`

**Operational Grid: v.5.0.2** / **Status: ACTIVE**

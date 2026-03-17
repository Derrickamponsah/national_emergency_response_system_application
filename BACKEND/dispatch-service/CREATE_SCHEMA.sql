-- ============================================
-- DISPATCH SERVICE DATABASE SCHEMA
-- ============================================
-- Database: emergency_dispatch_db
-- Tables: vehicles, location_history, vehicle_assignments

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- VEHICLES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(20) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('AMBULANCE', 'FIRE_TRUCK', 'POLICE_CAR')),
    region VARCHAR(100),
    capacity INT NOT NULL DEFAULT 4,
    status VARCHAR(50) NOT NULL CHECK (status IN ('IDLE', 'EN_ROUTE', 'ON_SCENE', 'DISPATCHED', 'RETURNING', 'MAINTENANCE')) DEFAULT 'IDLE',
    driver_name VARCHAR(255),
    driver_phone VARCHAR(20),
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    fuel_level INT DEFAULT 100,
    mileage INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LOCATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS location_history (
    history_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    speed DECIMAL(5, 2) DEFAULT 0,
    heading INT DEFAULT 0,
    accuracy INT DEFAULT 0,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- VEHICLE ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    incident_id UUID NOT NULL,
    assignment_type VARCHAR(50) CHECK (assignment_type IN ('DISPATCH', 'SUPPORT', 'REROUTE')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    estimated_arrival_time TIMESTAMP NULL,
    actual_arrival_time TIMESTAMP NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING', 'ASSIGNED', 'ACCEPTED', 'IN_TRANSIT', 'ON_SCENE', 'COMPLETED', 'CANCELLED')) DEFAULT 'PENDING',
    notes TEXT
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_vehicles_type ON vehicles(type);
CREATE INDEX IF NOT EXISTS idx_vehicles_region ON vehicles(region);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicles_location ON vehicles(current_latitude, current_longitude);
CREATE INDEX IF NOT EXISTS idx_location_history_vehicle ON location_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_location_history_recorded_at ON location_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_vehicle ON vehicle_assignments(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_incident ON vehicle_assignments(incident_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_assignments_status ON vehicle_assignments(status);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================
INSERT INTO vehicles (registration_number, type, region, capacity, status, driver_name, driver_phone, current_latitude, current_longitude, fuel_level) VALUES
('ACC-AMB-001', 'AMBULANCE', 'Greater Accra', 2, 'IDLE', 'Kweku Mensah', '+233-24-1111111', 5.345, -0.186, 95),
('ACC-AMB-002', 'AMBULANCE', 'Greater Accra', 2, 'IDLE', 'Ama Owusu', '+233-55-2222222', 5.355, -0.175, 85),
('KUM-AMB-001', 'AMBULANCE', 'Ashanti', 2, 'IDLE', 'Yaw Kusi', '+233-32-2222222', 6.694, -1.624, 90),
('TAK-AMB-001', 'AMBULANCE', 'Western', 2, 'IDLE', 'Abena Frempong', '+233-31-2222222', 4.884, -1.756, 88),
('ACC-FIRE-001', 'FIRE_TRUCK', 'Greater Accra', 8, 'IDLE', 'Yaw Boateng', '+233-24-3333333', 5.345, -0.186, 100),
('KUM-FIRE-001', 'FIRE_TRUCK', 'Ashanti', 8, 'IDLE', 'Kwame Adu', '+233-32-3333333', 6.694, -1.624, 100),
('TAM-FIRE-001', 'FIRE_TRUCK', 'Northern', 8, 'IDLE', 'Alhassan Ibrahim', '+233-71-3333333', 9.377, -0.839, 95),
('ACC-POLICE-001', 'POLICE_CAR', 'Greater Accra', 4, 'DISPATCHED', 'Cynthia Asare', '+233-55-4444444', 5.375, -0.200, 80),
('ACC-POLICE-002', 'POLICE_CAR', 'Greater Accra', 4, 'IDLE', 'Samuel Nyarko', '+233-24-5555555', 5.335, -0.165, 90),
('KUM-POLICE-001', 'POLICE_CAR', 'Ashanti', 4, 'IDLE', 'Kofi Osei', '+233-32-4444444', 6.694, -1.624, 85),
('TAK-POLICE-001', 'POLICE_CAR', 'Western', 4, 'IDLE', 'Erna Mensah', '+233-31-4444444', 4.884, -1.756, 92)
ON CONFLICT (registration_number) DO NOTHING;

-- Insert location history for vehicles
INSERT INTO location_history (vehicle_id, latitude, longitude, speed, heading, recorded_at) 
SELECT vehicle_id, current_latitude, current_longitude, 0, 0, CURRENT_TIMESTAMP - INTERVAL '10 minutes'
FROM vehicles
WHERE is_active = TRUE
ON CONFLICT DO NOTHING;

-- Verify tables created
SELECT 
    tablename,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

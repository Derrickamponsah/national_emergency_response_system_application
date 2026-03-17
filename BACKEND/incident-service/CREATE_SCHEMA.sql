-- ============================================
-- INCIDENT SERVICE DATABASE SCHEMA
-- ============================================
-- Database: emergency_incidents_db
-- Tables: responders, incidents, incident_responders

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- RESPONDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS responders (
    responder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('HOSPITAL', 'POLICE', 'FIRE_STATION')),
    location VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    capacity INT NOT NULL DEFAULT 0,
    current_load INT NOT NULL DEFAULT 0,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INCIDENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS incidents (
    incident_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('MEDICAL', 'FIRE', 'CRIME', 'ROAD_ACCIDENT')),
    location VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')) DEFAULT 'MEDIUM',
    status VARCHAR(50) NOT NULL CHECK (status IN ('CREATED', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED')) DEFAULT 'CREATED',
    assigned_responder_id UUID REFERENCES responders(responder_id),
    reporter_name VARCHAR(255),
    reporter_phone VARCHAR(20),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

-- ============================================
-- INCIDENT RESPONDERS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS incident_responders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents(incident_id) ON DELETE CASCADE,
    responder_id UUID NOT NULL REFERENCES responders(responder_id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    arrived_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    UNIQUE(incident_id, responder_id)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_responders_type ON responders(type);
CREATE INDEX IF NOT EXISTS idx_responders_region ON responders(region);
CREATE INDEX IF NOT EXISTS idx_responders_is_active ON responders(is_active);
CREATE INDEX IF NOT EXISTS idx_responders_location ON responders(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incidents_type ON incidents(type);
CREATE INDEX IF NOT EXISTS idx_incidents_region ON incidents(region);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_assigned_responder ON incidents(assigned_responder_id);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_incident_responders_incident ON incident_responders(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_responders_responder ON incident_responders(responder_id);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================
INSERT INTO responders (name, email, phone, type, location, region, capacity, latitude, longitude, is_active) VALUES
('Accra Central Hospital', 'accra.central@hospital.gov.gh', '+233-21-123456', 'HOSPITAL', 'Accra Central', 'Greater Accra', 150, 5.345, -0.186, TRUE),
('Korle Bu Teaching Hospital', 'korle.bu@hospital.gov.gh', '+233-21-234567', 'HOSPITAL', 'Korle Bu', 'Greater Accra', 500, 5.327, -0.195, TRUE),
('Komfo Anokye Teaching Hospital', 'komfo.anokye@hospital.gov.gh', '+233-32-345678', 'HOSPITAL', 'Kumasi', 'Ashanti', 450, 6.694, -1.624, TRUE),
('Accra Central Police Station', 'accra.police@police.gov.gh', '+233-21-456789', 'POLICE', 'Accra Central', 'Greater Accra', 50, 5.345, -0.186, TRUE),
('Kumasi Police Station', 'kumasi.police@police.gov.gh', '+233-32-567890', 'POLICE', 'Kumasi', 'Ashanti', 45, 6.694, -1.624, TRUE),
('Takoradi Police Station', 'takoradi.police@police.gov.gh', '+233-31-678901', 'POLICE', 'Takoradi', 'Western', 40, 4.884, -1.756, TRUE),
('Accra Central Fire Station', 'accra.fire@fire.gov.gh', '+233-21-789012', 'FIRE_STATION', 'Accra Central', 'Greater Accra', 20, 5.345, -0.186, TRUE),
('Kumasi Fire Station', 'kumasi.fire@fire.gov.gh', '+233-32-890123', 'FIRE_STATION', 'Kumasi', 'Ashanti', 18, 6.694, -1.624, TRUE),
('Tamale Fire Station', 'tamale.fire@fire.gov.gh', '+233-71-901234', 'FIRE_STATION', 'Tamale', 'Northern', 15, 9.377, -0.839, TRUE)
ON CONFLICT (email) DO NOTHING;

INSERT INTO incidents (title, description, type, location, region, latitude, longitude, severity, status, reporter_name, reporter_phone, created_by) VALUES
('Traffic Accident on Ring Road', 'Car collision at Ring Road junction', 'ROAD_ACCIDENT', 'Ring Road, Accra', 'Greater Accra', 5.345, -0.186, 'HIGH', 'CREATED', 'John Doe', '+233-24-1234567', NULL),
('Medical Emergency at Makola', 'Patient with chest pain', 'MEDICAL', 'Makola Market, Accra', 'Greater Accra', 5.355, -0.175, 'CRITICAL', 'CREATED', 'Jane Smith', '+233-55-2345678', NULL),
('Fire in Commercial Building', 'Fire outbreak in 3-storey building', 'FIRE', 'Darkuman, Accra', 'Greater Accra', 5.365, -0.195, 'CRITICAL', 'CREATED', 'Alert Center', '+233-300-123456', NULL),
('Armed Robbery Report', 'Robbery incident reported at Kumasi CBD', 'CRIME', 'Kumasi CBD', 'Ashanti', 6.694, -1.624, 'HIGH', 'CREATED', 'Anonymous', '+233-32-3456789', NULL),
('Medical Assistance Needed', 'Accident victim at Takoradi Port', 'MEDICAL', 'Takoradi Port', 'Western', 4.884, -1.756, 'MEDIUM', 'CREATED', 'Mary Johnson', '+233-31-4567890', NULL),
('Fire at Industrial Site', 'Factory fire reported in Tema', 'FIRE', 'Tema Industrial Zone', 'Greater Accra', 5.633, 0.012, 'CRITICAL', 'CREATED', 'Factory Manager', '+233-24-5678901', NULL),
('Road Accident on Kumasi-Accra Highway', 'Multiple vehicle collision', 'ROAD_ACCIDENT', 'Kumasi-Accra Highway', 'Ashanti', 6.700, -1.600, 'HIGH', 'CREATED', 'Witness', '+233-32-6789012', NULL),
('Criminal Activity in Cape Coast', 'Burglary reported', 'CRIME', 'Cape Coast', 'Central', 5.109, -1.244, 'MEDIUM', 'CREATED', 'Shop Owner', '+233-33-7890123', NULL),
('Medical Emergency in Koforidua', 'Diabetic patient requires hospitalization', 'MEDICAL', 'Koforidua', 'Eastern', 6.099, -0.344, 'HIGH', 'CREATED', 'Family Member', '+233-34-8901234', NULL),
('Fire Prevention Training Incident', 'Training exercise at Tamale Fire Station', 'FIRE', 'Tamale City', 'Northern', 9.377, -0.839, 'LOW', 'CREATED', 'Fire Chief', '+233-71-9012345', NULL)
ON CONFLICT DO NOTHING;

-- Verify tables created
SELECT 
    tablename,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

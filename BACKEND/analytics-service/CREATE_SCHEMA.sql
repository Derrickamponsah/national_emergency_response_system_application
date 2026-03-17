-- ============================================
-- ANALYTICS SERVICE DATABASE SCHEMA
-- ============================================
-- Database: emergency_analytics_db
-- Tables: incident_events, response_metrics, resource_utilization

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- INCIDENT EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS incident_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('MEDICAL', 'FIRE', 'CRIME', 'ROAD_ACCIDENT')),
    location VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    response_time_seconds INT NOT NULL DEFAULT 0,
    resolution_time_seconds INT DEFAULT 0,
    responder_count INT DEFAULT 1,
    vehicle_count INT DEFAULT 0,
    casualties INT DEFAULT 0,
    injuries INT DEFAULT 0,
    status VARCHAR(50) NOT NULL CHECK (status IN ('REPORTED', 'RESPONSE_INITIATED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')) DEFAULT 'REPORTED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL
);

-- ============================================
-- RESPONSE METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS response_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_type VARCHAR(50) NOT NULL,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    avg_response_time_seconds INT,
    avg_resolution_time_seconds INT,
    total_incidents INT DEFAULT 0,
    resolved_incidents INT DEFAULT 0,
    pending_incidents INT DEFAULT 0,
    average_responders_per_incident INT DEFAULT 1,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RESOURCE UTILIZATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS resource_utilization (
    utilization_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_type VARCHAR(50) NOT NULL CHECK (resource_type IN ('AMBULANCE', 'FIRE_TRUCK', 'POLICE_CAR', 'HOSPITAL', 'POLICE_STATION', 'FIRE_STATION')),
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    total_resources INT DEFAULT 0,
    busy_resources INT DEFAULT 0,
    idle_resources INT DEFAULT 0,
    utilization_percentage DECIMAL(5, 2) DEFAULT 0,
    region VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- DAILY SUMMARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_summary (
    summary_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summary_date DATE NOT NULL UNIQUE DEFAULT CURRENT_DATE,
    total_incidents INT DEFAULT 0,
    medical_incidents INT DEFAULT 0,
    fire_incidents INT DEFAULT 0,
    crime_incidents INT DEFAULT 0,
    road_incidents INT DEFAULT 0,
    critical_incidents INT DEFAULT 0,
    high_priority_incidents INT DEFAULT 0,
    avg_response_time_seconds INT DEFAULT 0,
    avg_resolution_time_seconds INT DEFAULT 0,
    total_responders_deployed INT DEFAULT 0,
    total_vehicles_deployed INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- HOSPITAL BED STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hospital_bed_statistics (
    stat_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_id UUID NOT NULL,
    hospital_name VARCHAR(255) NOT NULL,
    region VARCHAR(100),
    total_beds INT DEFAULT 0,
    occupied_beds INT DEFAULT 0,
    available_beds INT DEFAULT 0,
    icu_beds INT DEFAULT 0,
    icu_occupied INT DEFAULT 0,
    emergency_beds INT DEFAULT 0,
    emergency_occupied INT DEFAULT 0,
    occupancy_rate DECIMAL(5, 2) DEFAULT 0,
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- RESPONDER DEPLOYMENT METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS responder_deployment_metrics (
    metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    responder_id UUID NOT NULL,
    responder_name VARCHAR(255) NOT NULL,
    responder_type VARCHAR(50) NOT NULL CHECK (responder_type IN ('HOSPITAL', 'POLICE', 'FIRE_STATION')),
    date_recorded DATE NOT NULL DEFAULT CURRENT_DATE,
    total_deployments INT DEFAULT 0,
    total_incidents_handled INT DEFAULT 0,
    avg_response_time_seconds INT,
    avg_resolution_time_seconds INT,
    total_hours_deployed INT DEFAULT 0,
    availability_percentage DECIMAL(5, 2) DEFAULT 100,
    region VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_incident_events_incident_id ON incident_events(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_events_type ON incident_events(incident_type);
CREATE INDEX IF NOT EXISTS idx_incident_events_region ON incident_events(region);
CREATE INDEX IF NOT EXISTS idx_incident_events_created_at ON incident_events(created_at);
CREATE INDEX IF NOT EXISTS idx_incident_events_status ON incident_events(status);
CREATE INDEX IF NOT EXISTS idx_response_metrics_incident_type ON response_metrics(incident_type);
CREATE INDEX IF NOT EXISTS idx_response_metrics_date ON response_metrics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_type ON resource_utilization(resource_type);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_date ON resource_utilization(date_recorded);
CREATE INDEX IF NOT EXISTS idx_resource_utilization_region ON resource_utilization(region);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(summary_date DESC);
CREATE INDEX IF NOT EXISTS idx_hospital_bed_stats_hospital ON hospital_bed_statistics(hospital_id);
CREATE INDEX IF NOT EXISTS idx_hospital_bed_stats_date ON hospital_bed_statistics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_hospital_bed_stats_region ON hospital_bed_statistics(region);
CREATE INDEX IF NOT EXISTS idx_responder_deployment_responder ON responder_deployment_metrics(responder_id);
CREATE INDEX IF NOT EXISTS idx_responder_deployment_type ON responder_deployment_metrics(responder_type);
CREATE INDEX IF NOT EXISTS idx_responder_deployment_date ON responder_deployment_metrics(date_recorded);
CREATE INDEX IF NOT EXISTS idx_responder_deployment_region ON responder_deployment_metrics(region);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================
INSERT INTO incident_events (incident_id, incident_type, location, region, severity, response_time_seconds, resolution_time_seconds, responder_count, vehicle_count, status, created_at) VALUES
('11111111-1111-1111-1111-111111111111'::UUID, 'MEDICAL', 'Makola Market', 'Greater Accra', 'CRITICAL', 240, 1800, 3, 2, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('22222222-2222-2222-2222-222222222222'::UUID, 'FIRE', 'Darkuman', 'Greater Accra', 'CRITICAL', 180, 3600, 7, 3, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('33333333-3333-3333-3333-333333333333'::UUID, 'CRIME', 'Kumasi CBD', 'Ashanti', 'HIGH', 120, 900, 5, 2, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('44444444-4444-4444-4444-444444444444'::UUID, 'ROAD_ACCIDENT', 'Takoradi Port', 'Western', 'HIGH', 150, 1200, 4, 2, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('55555555-5555-5555-5555-555555555555'::UUID, 'MEDICAL', 'Ho Town', 'Volta', 'MEDIUM', 300, 2400, 2, 1, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '10 hours'),
('66666666-6666-6666-6666-666666666666'::UUID, 'FIRE', 'Tamale', 'Northern', 'MEDIUM', 200, 2700, 4, 2, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
('77777777-7777-7777-7777-777777777777'::UUID, 'MEDICAL', 'Cape Coast', 'Central', 'HIGH', 280, 1500, 3, 1, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '14 hours'),
('88888888-8888-8888-8888-888888888888'::UUID, 'CRIME', 'Koforidua', 'Eastern', 'MEDIUM', 160, 600, 4, 2, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '16 hours'),
('99999999-9999-9999-9999-999999999999'::UUID, 'ROAD_ACCIDENT', 'Bolgatanga', 'Upper East', 'LOW', 200, 900, 2, 1, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '18 hours'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::UUID, 'MEDICAL', 'Wa', 'Upper West', 'MEDIUM', 320, 2100, 3, 2, 'RESOLVED', CURRENT_TIMESTAMP - INTERVAL '20 hours')
ON CONFLICT DO NOTHING;

INSERT INTO response_metrics (incident_type, date_recorded, avg_response_time_seconds, avg_resolution_time_seconds, total_incidents, resolved_incidents, average_responders_per_incident) VALUES
('MEDICAL', CURRENT_DATE, 273, 1880, 3, 3, 3),
('FIRE', CURRENT_DATE, 190, 3150, 2, 2, 6),
('CRIME', CURRENT_DATE, 140, 750, 2, 2, 5),
('ROAD_ACCIDENT', CURRENT_DATE, 175, 1050, 2, 2, 3)
ON CONFLICT DO NOTHING;

INSERT INTO resource_utilization (resource_type, date_recorded, total_resources, busy_resources, idle_resources, utilization_percentage, region) VALUES
('AMBULANCE', CURRENT_DATE, 50, 12, 38, 24.0, 'Greater Accra'),
('AMBULANCE', CURRENT_DATE, 35, 8, 27, 22.9, 'Ashanti'),
('FIRE_TRUCK', CURRENT_DATE, 30, 8, 22, 26.7, 'Greater Accra'),
('FIRE_TRUCK', CURRENT_DATE, 18, 5, 13, 27.8, 'Western'),
('POLICE_CAR', CURRENT_DATE, 80, 15, 65, 18.75, 'Greater Accra'),
('POLICE_CAR', CURRENT_DATE, 60, 12, 48, 20.0, 'Ashanti'),
('HOSPITAL', CURRENT_DATE, 12, 9, 3, 75.0, 'Greater Accra'),
('HOSPITAL', CURRENT_DATE, 8, 6, 2, 75.0, 'Ashanti'),
('POLICE_STATION', CURRENT_DATE, 25, 8, 17, 32.0, 'Greater Accra'),
('FIRE_STATION', CURRENT_DATE, 15, 6, 9, 40.0, 'Greater Accra')
ON CONFLICT DO NOTHING;

INSERT INTO daily_summary (summary_date, total_incidents, medical_incidents, fire_incidents, crime_incidents, road_incidents, critical_incidents, high_priority_incidents, avg_response_time_seconds, avg_resolution_time_seconds, total_responders_deployed, total_vehicles_deployed) VALUES
(CURRENT_DATE, 10, 3, 2, 2, 2, 2, 3, 240, 1750, 32, 15)
ON CONFLICT (summary_date) DO UPDATE SET
    total_incidents = 10,
    medical_incidents = 3,
    fire_incidents = 2,
    crime_incidents = 2,
    road_incidents = 2;

-- ============================================
-- INSERT HOSPITAL BED STATISTICS
-- ============================================
INSERT INTO hospital_bed_statistics (hospital_id, hospital_name, region, total_beds, occupied_beds, available_beds, icu_beds, icu_occupied, emergency_beds, emergency_occupied, occupancy_rate, date_recorded) VALUES
('11111111-2222-3333-4444-555555555555'::UUID, 'Accra Central Hospital', 'Greater Accra', 150, 98, 52, 20, 12, 30, 18, 65.3, CURRENT_DATE),
('22222222-3333-4444-5555-666666666666'::UUID, 'Korle Bu Teaching Hospital', 'Greater Accra', 500, 385, 115, 80, 65, 100, 78, 77.0, CURRENT_DATE),
('33333333-4444-5555-6666-777777777777'::UUID, 'Komfo Anokye Teaching Hospital', 'Ashanti', 450, 325, 125, 75, 58, 90, 72, 72.2, CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT RESPONDER DEPLOYMENT METRICS
-- ============================================
INSERT INTO responder_deployment_metrics (responder_id, responder_name, responder_type, date_recorded, total_deployments, total_incidents_handled, avg_response_time_seconds, avg_resolution_time_seconds, total_hours_deployed, availability_percentage, region) VALUES
('aaaa1111-bbbb-cccc-dddd-eeeeeeeeeeee'::UUID, 'Accra Central Hospital', 'HOSPITAL', CURRENT_DATE, 8, 8, 265, 1890, 12, 95.0, 'Greater Accra'),
('bbbb2222-cccc-dddd-eeee-ffffffffffff'::UUID, 'Komfo Anokye Teaching Hospital', 'HOSPITAL', CURRENT_DATE, 12, 12, 240, 1750, 18, 98.0, 'Ashanti'),
('cccc3333-dddd-eeee-ffff-000000000000'::UUID, 'Takoradi Central Police Station', 'POLICE', CURRENT_DATE, 6, 6, 160, 750, 10, 92.0, 'Western'),
('dddd4444-eeee-ffff-0000-111111111111'::UUID, 'Tamale Fire Station', 'FIRE_STATION', CURRENT_DATE, 4, 4, 190, 2400, 8, 88.0, 'Northern')
ON CONFLICT DO NOTHING;

-- Verify tables created
SELECT 
    tablename,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

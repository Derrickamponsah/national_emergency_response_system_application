-- ============================================
-- AUTH SERVICE DATABASE SCHEMA
-- ============================================
-- Database: emergency_auth_db
-- Tables: users, refresh_tokens

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_ADMIN')),
    password_hash VARCHAR(512) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REFRESH TOKENS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash VARCHAR(512) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked ON refresh_tokens(revoked);

-- ============================================
-- INSERT SAMPLE DATA
-- ============================================
INSERT INTO users (name, email, role, password_hash, is_active) VALUES
('System Admin', 'admin@emergency.gov.gh', 'SYSTEM_ADMIN', '$2b$10$F9w3YqE8Q1h6Z2n5K9p2e.nQxZvM3j7w5L8qR4vS6yT9uI2xA5Ba6', TRUE),
('Hospital Admin', 'hospital@emergency.gov.gh', 'HOSPITAL_ADMIN', '$2b$10$F9w3YqE8Q1h6Z2n5K9p2e.nQxZvM3j7w5L8qR4vS6yT9uI2xA5Ba6', TRUE),
('Police Admin', 'police@emergency.gov.gh', 'POLICE_ADMIN', '$2b$10$F9w3YqE8Q1h6Z2n5K9p2e.nQxZvM3j7w5L8qR4vS6yT9uI2xA5Ba6', TRUE),
('Fire Admin', 'fire@emergency.gov.gh', 'FIRE_ADMIN', '$2b$10$F9w3YqE8Q1h6Z2n5K9p2e.nQxZvM3j7w5L8qR4vS6yT9uI2xA5Ba6', TRUE)
ON CONFLICT (email) DO NOTHING;

-- Verify tables created
SELECT 
    tablename,
    (SELECT COUNT(*) FROM pg_indexes WHERE tablename = t.tablename) as index_count
FROM pg_tables t
WHERE schemaname = 'public'
ORDER BY tablename;

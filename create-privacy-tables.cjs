/**
 * Script to create privacy-related tables
 * 
 * This script creates the tables needed for privacy-related functionality
 * based on the schema defined in shared/privacy-schema.ts
 */

const { Pool } = require('pg');
require('dotenv').config();

// Connect to the database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(queryText, params = []) {
  try {
    const result = await pool.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error.message);
    console.error('Query:', queryText);
    if (error.code === '42P07') {
      console.log('Table already exists, continuing...');
      return null;
    }
    throw error;
  }
}

async function createTables() {
  try {
    console.log('Creating privacy-related tables...');

    // Create ENUMs
    await executeQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consent_category') THEN
          CREATE TYPE consent_category AS ENUM (
            'essential',
            'functional',
            'analytics',
            'advertising',
            'social'
          );
        END IF;
      END$$;
    `);

    await executeQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'deletion_status') THEN
          CREATE TYPE deletion_status AS ENUM (
            'requested',
            'processing',
            'completed',
            'failed',
            'partial'
          );
        END IF;
      END$$;
    `);

    await executeQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'consent_status') THEN
          CREATE TYPE consent_status AS ENUM (
            'granted',
            'denied',
            'withdrawn',
            'expired'
          );
        END IF;
      END$$;
    `);

    await executeQuery(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'geo_region') THEN
          CREATE TYPE geo_region AS ENUM (
            'global',
            'eu',
            'india',
            'california',
            'other'
          );
        END IF;
      END$$;
    `);

    // Cookie consents table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS cookie_consents (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(username),
        category consent_category NOT NULL,
        status consent_status NOT NULL DEFAULT 'denied',
        last_updated TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT
      );
    `);

    // Data requests table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS data_requests (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(username),
        request_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        request_date TIMESTAMP NOT NULL DEFAULT NOW(),
        completion_date TIMESTAMP,
        request_data JSONB,
        verification_token TEXT,
        request_ip TEXT
      );
    `);

    // Policy acknowledgments table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS policy_acknowledgments (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(username),
        policy_version TEXT NOT NULL,
        acknowledged_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT
      );
    `);

    // Data deletions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS data_deletions (
        id SERIAL PRIMARY KEY,
        user_id TEXT,
        request_id INTEGER REFERENCES data_requests(id),
        status deletion_status NOT NULL DEFAULT 'processing',
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        retention_reason TEXT,
        logs JSONB
      );
    `);

    // Data residency table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS data_residency (
        user_id TEXT REFERENCES users(username) PRIMARY KEY,
        preferred_region geo_region NOT NULL DEFAULT 'global',
        detected_region geo_region,
        last_updated TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Communication preferences table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS communication_preferences (
        user_id TEXT REFERENCES users(username) PRIMARY KEY,
        marketing_emails BOOLEAN NOT NULL DEFAULT FALSE,
        product_updates BOOLEAN NOT NULL DEFAULT TRUE,
        security_alerts BOOLEAN NOT NULL DEFAULT TRUE,
        newsletter_frequency TEXT DEFAULT 'weekly',
        last_updated TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Privacy audit logs table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS privacy_audit_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT REFERENCES users(username),
        action TEXT NOT NULL,
        performed_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT,
        details JSONB
      );
    `);

    console.log('Privacy tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await pool.end();
  }
}

createTables();
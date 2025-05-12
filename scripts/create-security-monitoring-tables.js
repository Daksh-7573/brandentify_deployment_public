/**
 * Migration script to create security monitoring tables
 * 
 * This script creates all tables related to security monitoring and threat detection:
 * - security_audit_logs
 * - attack_attempts
 * - system_errors
 * - vulnerability_scan_results
 * - vulnerabilities
 * - penetration_tests
 * - pentest_findings
 */

const { Pool } = require('pg');
require('dotenv').config();

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(queryText, params = []) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(queryText, params);
      return result;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

async function createSecurityTables() {
  try {
    console.log('Creating security monitoring tables...');

    // Create enums
    await executeQuery(`
      DO $$ BEGIN
        -- Create security_severity enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'security_severity') THEN
          CREATE TYPE security_severity AS ENUM (
            'info', 'low', 'medium', 'high', 'critical'
          );
        END IF;
        
        -- Create security_event_type enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'security_event_type') THEN
          CREATE TYPE security_event_type AS ENUM (
            'authentication', 'authorization', 'file_operation', 
            'data_access', 'admin_action', 'system', 
            'attack', 'api', 'vulnerability'
          );
        END IF;
        
        -- Create attack_type enum
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attack_type') THEN
          CREATE TYPE attack_type AS ENUM (
            'xss', 'sql_injection', 'csrf', 'path_traversal',
            'file_upload', 'dos', 'brute_force', 'prompt_injection', 'other'
          );
        END IF;
      END $$;
    `);

    console.log('Created security enum types');

    // Create security_audit_logs table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS security_audit_logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id TEXT REFERENCES users(username),
        event_type security_event_type NOT NULL,
        severity security_severity NOT NULL DEFAULT 'info',
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        request_path TEXT,
        request_method TEXT,
        details JSONB
      );
      
      -- Create index on timestamp for efficient querying
      CREATE INDEX IF NOT EXISTS idx_security_audit_logs_timestamp 
      ON security_audit_logs (timestamp);
      
      -- Create index on user_id for efficient querying
      CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id 
      ON security_audit_logs (user_id);
      
      -- Create index on event_type for efficient querying
      CREATE INDEX IF NOT EXISTS idx_security_audit_logs_event_type 
      ON security_audit_logs (event_type);
    `);

    console.log('Created security_audit_logs table');

    // Create attack_attempts table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS attack_attempts (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        user_id TEXT REFERENCES users(username),
        attack_type attack_type NOT NULL,
        severity security_severity NOT NULL,
        blocked BOOLEAN NOT NULL DEFAULT TRUE,
        ip_address TEXT,
        user_agent TEXT,
        request_path TEXT,
        request_data JSONB,
        headers JSONB,
        mitigation_applied TEXT,
        details JSONB
      );
      
      -- Create index on timestamp for efficient querying
      CREATE INDEX IF NOT EXISTS idx_attack_attempts_timestamp 
      ON attack_attempts (timestamp);
      
      -- Create index on attack_type for efficient querying
      CREATE INDEX IF NOT EXISTS idx_attack_attempts_attack_type 
      ON attack_attempts (attack_type);
      
      -- Create index on severity for efficient querying
      CREATE INDEX IF NOT EXISTS idx_attack_attempts_severity 
      ON attack_attempts (severity);
    `);

    console.log('Created attack_attempts table');

    // Create system_errors table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS system_errors (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
        error_type TEXT NOT NULL,
        component TEXT NOT NULL,
        severity security_severity NOT NULL DEFAULT 'medium',
        message TEXT NOT NULL,
        stack_trace TEXT,
        user_id TEXT REFERENCES users(username),
        request_path TEXT,
        request_method TEXT,
        ip_address TEXT,
        user_agent TEXT,
        affected_data JSONB,
        resolved BOOLEAN NOT NULL DEFAULT FALSE,
        resolution_notes TEXT
      );
      
      -- Create index on timestamp for efficient querying
      CREATE INDEX IF NOT EXISTS idx_system_errors_timestamp 
      ON system_errors (timestamp);
      
      -- Create index on component for efficient querying
      CREATE INDEX IF NOT EXISTS idx_system_errors_component 
      ON system_errors (component);
      
      -- Create index on resolved for efficient querying
      CREATE INDEX IF NOT EXISTS idx_system_errors_resolved 
      ON system_errors (resolved);
    `);

    console.log('Created system_errors table');

    // Create vulnerability_scan_results table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS vulnerability_scan_results (
        id SERIAL PRIMARY KEY,
        scan_id TEXT NOT NULL UNIQUE,
        scan_type TEXT NOT NULL,
        scanner_name TEXT NOT NULL,
        scan_date TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_date TIMESTAMP,
        vulnerability_count INTEGER NOT NULL DEFAULT 0,
        critical_count INTEGER NOT NULL DEFAULT 0,
        high_count INTEGER NOT NULL DEFAULT 0,
        medium_count INTEGER NOT NULL DEFAULT 0,
        low_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        scan_results JSONB,
        scan_config JSONB,
        initiated_by TEXT REFERENCES users(username)
      );
      
      -- Create index on scan_date for efficient querying
      CREATE INDEX IF NOT EXISTS idx_vulnerability_scan_results_scan_date 
      ON vulnerability_scan_results (scan_date);
      
      -- Create index on status for efficient querying
      CREATE INDEX IF NOT EXISTS idx_vulnerability_scan_results_status 
      ON vulnerability_scan_results (status);
    `);

    console.log('Created vulnerability_scan_results table');

    // Create vulnerabilities table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS vulnerabilities (
        id SERIAL PRIMARY KEY,
        scan_id TEXT NOT NULL REFERENCES vulnerability_scan_results(scan_id),
        cve_id TEXT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity security_severity NOT NULL,
        affected_component TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        detection_date TIMESTAMP NOT NULL DEFAULT NOW(),
        fixed_date TIMESTAMP,
        fixed_in_version TEXT,
        fixed_by_user_id TEXT REFERENCES users(username),
        fix_details TEXT,
        mitigation_steps TEXT,
        technical_details JSONB
      );
      
      -- Create index on scan_id for efficient querying
      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_scan_id 
      ON vulnerabilities (scan_id);
      
      -- Create index on severity for efficient querying
      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_severity 
      ON vulnerabilities (severity);
      
      -- Create index on status for efficient querying
      CREATE INDEX IF NOT EXISTS idx_vulnerabilities_status 
      ON vulnerabilities (status);
    `);

    console.log('Created vulnerabilities table');

    // Create penetration_tests table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS penetration_tests (
        id SERIAL PRIMARY KEY,
        test_name TEXT NOT NULL,
        test_date TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_date TIMESTAMP,
        tester TEXT NOT NULL,
        scope TEXT NOT NULL,
        methodologies TEXT NOT NULL,
        findings_count INTEGER NOT NULL DEFAULT 0,
        critical_count INTEGER NOT NULL DEFAULT 0,
        high_count INTEGER NOT NULL DEFAULT 0,
        medium_count INTEGER NOT NULL DEFAULT 0,
        low_count INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL,
        report_url TEXT,
        summary TEXT,
        requested_by TEXT REFERENCES users(username)
      );
      
      -- Create index on test_date for efficient querying
      CREATE INDEX IF NOT EXISTS idx_penetration_tests_test_date 
      ON penetration_tests (test_date);
      
      -- Create index on status for efficient querying
      CREATE INDEX IF NOT EXISTS idx_penetration_tests_status 
      ON penetration_tests (status);
    `);

    console.log('Created penetration_tests table');

    // Create pentest_findings table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS pentest_findings (
        id SERIAL PRIMARY KEY,
        pentest_id INTEGER NOT NULL REFERENCES penetration_tests(id),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity security_severity NOT NULL,
        affected_component TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        reported_date TIMESTAMP NOT NULL DEFAULT NOW(),
        fixed_date TIMESTAMP,
        fixed_by_user_id TEXT REFERENCES users(username),
        fix_details TEXT,
        recommended_mitigation TEXT,
        technical_details JSONB,
        proof_of_concept TEXT
      );
      
      -- Create index on pentest_id for efficient querying
      CREATE INDEX IF NOT EXISTS idx_pentest_findings_pentest_id 
      ON pentest_findings (pentest_id);
      
      -- Create index on severity for efficient querying
      CREATE INDEX IF NOT EXISTS idx_pentest_findings_severity 
      ON pentest_findings (severity);
      
      -- Create index on status for efficient querying
      CREATE INDEX IF NOT EXISTS idx_pentest_findings_status 
      ON pentest_findings (status);
    `);

    console.log('Created pentest_findings table');

    console.log('Successfully created all security monitoring tables!');
  } catch (error) {
    console.error('Error creating security monitoring tables:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await createSecurityTables();
    console.log('Security monitoring database setup completed successfully!');
  } catch (error) {
    console.error('Error during security monitoring database setup:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
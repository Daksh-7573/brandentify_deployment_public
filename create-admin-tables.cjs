/**
 * Script to create admin-related tables in the database
 * 
 * This script creates the necessary tables for the admin panel:
 * - admin_roles: Defines admin roles and their descriptions
 * - admin_permissions: Links roles to specific permissions
 * - admin_users: Links regular users to admin roles
 * - admin_activity_log: Tracks admin actions
 * - content: Stores content items (posts, articles, etc.)
 * - content_tags: Stores tags associated with content
 */

// Load environment variables
require('dotenv').config();

// Database connection
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function executeQuery(queryText, params = []) {
  try {
    const result = await pool.query(queryText, params);
    return result;
  } catch (error) {
    console.error('Error executing query:', error.message);
    throw error;
  }
}

async function createTables() {
  try {
    console.log('Creating admin tables...');
    
    // Start a transaction
    await executeQuery('BEGIN');
    
    // Create admin_roles table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS admin_roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created admin_roles table');
    
    // Create admin_permissions table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS admin_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER NOT NULL REFERENCES admin_roles(id),
        permission_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(role_id, permission_type)
      )
    `);
    console.log('Created admin_permissions table');
    
    // Create admin_users table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        role_id INTEGER NOT NULL REFERENCES admin_roles(id),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created admin_users table');
    
    // Create admin_activity_log table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS admin_activity_log (
        id SERIAL PRIMARY KEY,
        admin_user_id INTEGER NOT NULL REFERENCES admin_users(id),
        action TEXT NOT NULL,
        details TEXT,
        ip_address VARCHAR(50),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created admin_activity_log table');
    
    // Create content table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS content (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        type VARCHAR(50) NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'draft',
        body TEXT,
        excerpt TEXT,
        featured_image VARCHAR(255),
        metadata JSONB,
        author_id INTEGER NOT NULL REFERENCES users(id),
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created content table');
    
    // Create content_tags table if it doesn't exist
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS content_tags (
        id SERIAL PRIMARY KEY,
        content_id INTEGER NOT NULL REFERENCES content(id) ON DELETE CASCADE,
        tag VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(content_id, tag)
      )
    `);
    console.log('Created content_tags table');
    
    // Create default admin role
    const roleResult = await executeQuery(
      'INSERT INTO admin_roles (name, description) VALUES ($1, $2) RETURNING id',
      ['Super Admin', 'Full access to all admin features']
    );
    const roleId = roleResult.rows[0].id;
    console.log(`Created Super Admin role with ID ${roleId}`);
    
    // Add full_access permission to the role
    await executeQuery(
      'INSERT INTO admin_permissions (role_id, permission_type) VALUES ($1, $2)',
      [roleId, 'full_access']
    );
    console.log('Added full_access permission to Super Admin role');
    
    // Make user with ID 4 an admin (assuming this is the logged-in user)
    await executeQuery(
      'INSERT INTO admin_users (user_id, role_id) VALUES ($1, $2) RETURNING id',
      [4, roleId]
    );
    console.log('Added user 4 as an admin');
    
    // Commit the transaction
    await executeQuery('COMMIT');
    
    console.log('All admin tables created successfully');
  } catch (error) {
    // Rollback in case of error
    await executeQuery('ROLLBACK');
    console.error('Error creating admin tables:', error);
  } finally {
    // Close the pool
    pool.end();
  }
}

// Run the script
createTables();
/**
 * Database fix script to permanently resolve looking_for corruption
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixLookingForCorruption() {
  try {
    console.log('Starting looking_for corruption fix...');
    
    // Check current state
    const currentResult = await pool.query('SELECT id, username, looking_for FROM users WHERE id = 2');
    console.log('Current state:', currentResult.rows[0]);
    
    // Force update with explicit transaction
    await pool.query('BEGIN');
    
    const updateResult = await pool.query(
      'UPDATE users SET looking_for = $1 WHERE id = $2 RETURNING id, looking_for',
      ['investment', 2]
    );
    
    console.log('Update result:', updateResult.rows[0]);
    
    await pool.query('COMMIT');
    
    // Verify the update
    const verifyResult = await pool.query('SELECT id, username, looking_for FROM users WHERE id = 2');
    console.log('Verified state:', verifyResult.rows[0]);
    
    console.log('Looking_for corruption fix completed successfully');
    
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error fixing looking_for corruption:', error);
  } finally {
    await pool.end();
  }
}

fixLookingForCorruption();
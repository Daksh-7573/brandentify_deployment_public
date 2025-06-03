/**
 * Script to create the Musk AI user account in the database
 * This user (ID 3) is required for automated pulse generation
 */

import { pool } from './server/db';

async function createMuskUser() {
  const client = await pool.connect();
  
  try {
    console.log('Creating Musk AI user account...');
    
    // Check if user ID 3 already exists
    const existingUser = await client.query('SELECT id FROM users WHERE id = 3');
    
    if (existingUser.rows.length > 0) {
      console.log('Musk AI user already exists with ID 3');
      return;
    }
    
    // Insert Musk AI user with specific ID 3
    const result = await client.query(`
      INSERT INTO users (
        id, username, email, name, title, about_me, industry, domain, 
        profile_completed, email_verified, created_at
      ) VALUES (
        3, 
        'musk_ai_assistant', 
        'musk@brandentifier.ai', 
        'Musk AI Assistant',
        'AI Career Advisor',
        'Expert AI assistant providing career guidance, industry insights, and professional development advice for Brandentifier users.',
        'Technology',
        'Artificial Intelligence',
        100,
        true,
        NOW()
      )
      RETURNING id, username, name
    `);
    
    console.log('Successfully created Musk AI user:', result.rows[0]);
    
    // Reset the sequence to ensure future auto-incremented IDs start from 4 or higher
    await client.query(`SELECT setval('users_id_seq', GREATEST(4, (SELECT MAX(id) FROM users)))`);
    
    console.log('Updated user ID sequence');
    
  } catch (error) {
    console.error('Error creating Musk user:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the script
createMuskUser()
  .then(() => {
    console.log('Musk AI user setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to create Musk user:', error);
    process.exit(1);
  });
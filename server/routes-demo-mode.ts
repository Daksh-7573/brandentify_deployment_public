import express from 'express';
import { pool } from './db';
import { User } from '@shared/schema';
import { Json } from 'type-fest';

// Create a new router for demo mode-related routes
const router = express.Router();

/**
 * Demo mode login endpoint
 * Creates or reuses a demo user account for testing without authentication
 * 
 * This endpoint is especially useful when Firebase authentication is not working
 * or for quick testing without requiring users to create actual accounts
 */
router.post('/api/demo-login', async (req, res) => {
  try {
    console.log('[POST /api/demo-login] Processing demo login request');
    
    // Generate a unique demo username
    const timestamp = new Date().getTime().toString();
    const demoUsername = `demo_${timestamp.substring(timestamp.length - 8)}`;
    const demoEmail = `${demoUsername}@example.com`;
    
    // First check if a demo user exists from the last 24 hours to reuse
    // This reduces database clutter
    const recentDemoUsers = await pool.query(
      'SELECT * FROM users WHERE username LIKE $1 AND created_at > NOW() - INTERVAL \'24 hours\' LIMIT 1',
      ['demo_%']
    );
    
    let demoUser: User | null = null;
    
    if (recentDemoUsers.rows.length > 0) {
      // Reuse existing demo user
      demoUser = recentDemoUsers.rows[0];
      console.log(`[POST /api/demo-login] Reusing existing demo user: ${demoUser?.id} (${demoUser?.username})`);
    } else {
      // Create a new demo user
      const result = await pool.query(
        `INSERT INTO users 
         (username, email, name, photo_url, title, location, is_demo_user) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`,
        [
          demoUsername,
          demoEmail,
          'Demo User',
          '/uploads/default-avatar.png', // Default avatar
          'Professional',
          'Demo Location',
          true // Mark as demo user
        ]
      );
      
      demoUser = result.rows[0];
      console.log(`[POST /api/demo-login] Created new demo user: ${demoUser?.id} (${demoUser?.username})`);
      
      // Optionally add some demo data (skills, experiences) to the demo user
      try {
        if (demoUser && demoUser.id) {
          // Add a few basic skills
          await pool.query(
            `INSERT INTO skills (user_id, name, proficiency) 
             VALUES 
             ($1, 'JavaScript', 4),
             ($1, 'React', 3),
             ($1, 'TypeScript', 3)`,
            [demoUser.id]
          );
          
          // Add a work experience
          await pool.query(
            `INSERT INTO work_experiences 
             (user_id, company, title, start_date, end_date, is_current, description) 
             VALUES 
             ($1, 'Demo Company', 'Software Developer', NOW() - INTERVAL '1 year', NULL, true, 'Working on various web projects using modern technologies.')`,
            [demoUser.id]
          );
          
          console.log(`[POST /api/demo-login] Added demo data for user ${demoUser.id}`);
        }
      } catch (demoDataError) {
        // Non-fatal error if adding demo data fails
        console.error('[POST /api/demo-login] Error adding demo data:', demoDataError);
      }
    }
    
    if (!demoUser) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create or retrieve demo user'
      });
    }
    
    // Return the demo user information
    res.status(200).json({
      success: true,
      demoUser: {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        name: demoUser.name,
        photoURL: demoUser.photoURL, // Use photoURL instead of photo_url
        title: demoUser.title,
        location: demoUser.location
      },
      message: 'Demo mode activated successfully'
    });
  } catch (error) {
    console.error('[POST /api/demo-login] Error creating demo user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating demo user account'
    });
  }
});

/**
 * Endpoint to check if a demo user exists
 * Useful for automatic login for returning demo users
 */
router.get('/api/demo-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the demo user by ID
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1 AND is_demo_user = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Demo user not found'
      });
    }
    
    const demoUser = result.rows[0];
    
    res.status(200).json({
      success: true,
      demoUser: {
        id: demoUser.id,
        username: demoUser.username,
        email: demoUser.email,
        name: demoUser.name,
        photoURL: demoUser.photo_url,
        title: demoUser.title,
        location: demoUser.location
      }
    });
  } catch (error) {
    console.error('[GET /api/demo-user/:id] Error fetching demo user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching demo user'
    });
  }
});

export default router;
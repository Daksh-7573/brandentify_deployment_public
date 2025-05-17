// Server-side authentication routes
const express = require('express');
const router = express.Router();
const { getAuth } = require('firebase-admin/auth');
const admin = require('firebase-admin');
const db = require('./db');

// Create a test user with Firebase Admin (for development only)
router.post('/dev-create-user', async (req, res) => {
  try {
    // Only allow in development environments
    if (!req.hostname.includes('replit.dev') && !req.hostname.includes('replit.app')) {
      return res.status(403).json({ 
        success: false, 
        message: 'This endpoint is only available in development environments'
      });
    }

    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required'
      });
    }

    // Create user with Firebase Admin SDK
    const userRecord = await getAuth().createUser({
      email,
      password,
      emailVerified: true,
      displayName: displayName || 'Test User'
    });

    // Insert into local database
    const [user] = await db.query(
      'INSERT INTO users (username, email, name) VALUES ($1, $2, $3) RETURNING id',
      [userRecord.uid, email, displayName || 'Test User']
    );

    console.log('Created dev test user:', userRecord.uid);

    res.status(201).json({
      success: true,
      message: 'Test user created successfully',
      uid: userRecord.uid,
      email: userRecord.email,
      localId: user?.id
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to create test user',
      error: error.message
    });
  }
});

module.exports = router;
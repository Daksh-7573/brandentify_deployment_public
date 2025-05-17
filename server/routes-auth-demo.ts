/**
 * Demo Auth Routes
 * 
 * This module provides alternative authentication methods that work
 * across all Replit domains without requiring external OAuth providers.
 */

import express, { Request, Response } from 'express';
import { storage } from './storage';

const router = express.Router();

/**
 * Demo login endpoint - works across all domains
 * Creates a user account with the given email and logs in
 */
router.post("/auth/demo-login", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    
    // Generate a stable username from the email
    const username = `user_${email.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`;
    
    // Check if user exists - try both username and email
    let user = await storage.getUserByUsername(username);
    
    if (!user && email) {
      try {
        user = await storage.getUserByEmail(email);
      } catch (err) {
        // Ignore errors from email lookup
      }
    }
    
    if (!user) {
      // Create new user with demo data
      user = await storage.createUser({
        username,
        email,
        name: name || 'Demo User',
        photoURL: null,
        emailVerified: true,
      });
      
      console.log(`Created new demo user: ${user.name} (${user.email})`);
    } else {
      console.log(`Demo user already exists: ${user.name} (${user.email})`);
    }
    
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user
    });
  } catch (error) {
    console.error('Error in demo login:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login'
    });
  }
});

export default router;
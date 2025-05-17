import express, { Request, Response } from 'express';
import { storage } from './storage';
import { z } from 'zod';
import bcrypt from 'bcrypt';

const router = express.Router();

// Set the trust proxy setting
router.use((req, res, next) => {
  req.app.set('trust proxy', true);
  next();
});

/**
 * Direct login endpoint that works across all domains
 * Creates a user account with the given email or logs in if it exists
 */
router.post("/api/direct-login", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }
    
    // Generate a unique username from the email
    const username = email.split('@')[0] + '-' + Math.floor(Math.random() * 10000);
    
    // Check if user already exists by email
    let user = await storage.getUserByEmail(email);
    
    // If user doesn't exist, create a new one
    if (!user) {
      console.log(`Creating new user: ${email}, ${name || 'Demo User'}`);
      
      // Create user in the database
      user = await storage.createUser({
        username,
        email,
        name: name || 'Demo User',
        password: null,  // No password for direct login
        photoURL: null,
        title: 'Professional',
        aboutMe: null,
        industry: 'Technology',
        domain: 'Software Development',
        location: null,
        lookingFor: null,
        whatIOffer: null,
        phoneNumber: null,
        isVerified: true,
        googleId: null,
        facebookId: null,
        twitterId: null,
        appleId: null,
        githubId: null,
        linkedinId: null,
        lastLogin: new Date(),
        createdAt: new Date()
      });
      
      console.log(`New user created with ID: ${user.id}`);
    } else {
      console.log(`User found with ID: ${user.id}, email: ${user.email}`);
      
      // Update last login time
      await storage.updateUser(user.id, {
        lastLogin: new Date()
      });
    }
    
    // Return user data
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        title: user.title
      }
    });
  } catch (error) {
    console.error("Failed to process direct login:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// User status endpoint - get current user based on session
router.get("/api/user-status", async (req: Request, res: Response) => {
  res.status(200).json({
    authenticated: true,
    authMethod: "direct",
    message: "Using direct authentication"
  });
});

export default router;
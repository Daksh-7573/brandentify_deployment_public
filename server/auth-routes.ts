import { Router } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Schema for Google sign-in data
const googleSignInSchema = z.object({
  firebaseUid: z.string(),
  email: z.string().email(),
  name: z.string(),
  photoURL: z.string().optional(),
  googleId: z.string(),
  authProvider: z.literal('google'),
  emailVerified: z.boolean()
});

/**
 * Google Sign-In Endpoint
 * Creates or updates a user account when they authenticate with Google
 */
router.post('/google-signin', async (req, res) => {
  try {
    console.log('Google sign-in request received:', req.body.email);
    
    // Validate request data
    const userData = googleSignInSchema.parse(req.body);
    
    // Check if user already exists by Firebase UID, Google ID, or email
    const existingUser = await db
      .select()
      .from(users)
      .where(or(
        eq(users.firebaseUid, userData.firebaseUid),
        eq(users.googleId, userData.googleId),
        eq(users.email, userData.email)
      ))
      .limit(1);

    let user;

    if (existingUser.length > 0) {
      // Update existing user with latest Google data
      console.log('Updating existing user:', existingUser[0].email);
      
      const [updatedUser] = await db
        .update(users)
        .set({
          firebaseUid: userData.firebaseUid,
          googleId: userData.googleId,
          name: userData.name || existingUser[0].name,
          photoURL: userData.photoURL || existingUser[0].photoURL,
          authProvider: 'google',
          emailVerified: userData.emailVerified,
          lastLoginAt: new Date()
        })
        .where(eq(users.id, existingUser[0].id))
        .returning();
      
      user = updatedUser;
    } else {
      // Create new user account
      console.log('Creating new user account for:', userData.email);
      
      // Generate unique username from email
      const baseUsername = userData.email.split('@')[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;
      
      // Ensure username is unique
      while (true) {
        const existingUsername = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);
        
        if (existingUsername.length === 0) break;
        username = `${baseUsername}${counter}`;
        counter++;
      }

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL,
          firebaseUid: userData.firebaseUid,
          googleId: userData.googleId,
          authProvider: 'google',
          emailVerified: userData.emailVerified,
          lastLoginAt: new Date(),
          profileCompleted: 20 // Basic info from Google
        })
        .returning();
      
      user = newUser;
    }

    console.log('User authentication successful:', user.email);

    // Return user data (excluding sensitive fields)
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      profileCompleted: user.profileCompleted,
      authProvider: user.authProvider,
      emailVerified: user.emailVerified
    };

    res.json({
      success: true,
      message: 'Authentication successful',
      user: safeUser
    });

  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
      error: error.message
    });
  }
});

/**
 * Get current user data
 * Returns user information for the authenticated user
 */
router.get('/user', async (req, res) => {
  try {
    // For now, we'll use a simple session-based approach
    // In production, you'd verify JWT tokens or Firebase tokens
    const userEmail = req.headers['x-user-email'] as string;
    
    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, userEmail))
      .limit(1);

    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return safe user data
    const safeUser = {
      id: user[0].id,
      username: user[0].username,
      email: user[0].email,
      name: user[0].name,
      photoURL: user[0].photoURL,
      profileCompleted: user[0].profileCompleted,
      authProvider: user[0].authProvider,
      emailVerified: user[0].emailVerified
    };

    res.json({
      success: true,
      user: safeUser
    });

  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

export { router as authRoutes };
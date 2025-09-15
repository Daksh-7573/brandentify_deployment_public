import { Router } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';
import crypto from 'crypto';
import type { CookieOptions } from 'express';

const router = Router();

// In-memory session storage (in production, use Redis or similar)
interface OAuthState {
  state: string;
  timestamp: number;
}

interface UserSession {
  userId: number;
  email: string;
  timestamp: number;
}

// Storage for OAuth states and user sessions
const oauthStates = new Map<string, OAuthState>();
const userSessions = new Map<string, UserSession>();

// Session configuration
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const OAUTH_STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const SESSION_COOKIE_NAME = 'brandentifier_session';

// Cookie configuration
const getSecureCookieOptions = (req: any): CookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = req.get('X-Forwarded-Proto') === 'https' || req.protocol === 'https';
  
  return {
    httpOnly: true,
    secure: isProduction && isHttps,
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_MS,
    path: '/'
  };
};

// Clean up expired states and sessions
const cleanupExpiredSessions = () => {
  const now = Date.now();
  
  // Clean OAuth states
  for (const [key, state] of Array.from(oauthStates.entries())) {
    if (now - state.timestamp > OAUTH_STATE_EXPIRY_MS) {
      oauthStates.delete(key);
    }
  }
  
  // Clean user sessions
  for (const [sessionId, session] of Array.from(userSessions.entries())) {
    if (now - session.timestamp > SESSION_EXPIRY_MS) {
      userSessions.delete(sessionId);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

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
 * Generate Google OAuth URL for server-side flow
 * Used for published domains where Firebase popup is blocked
 */
router.get('/google/url', async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth not configured'
      });
    }

    // Generate state parameter for CSRF protection
    const state = crypto.randomBytes(32).toString('hex');
    
    // Store state securely for validation in callback
    oauthStates.set(state, {
      state: state,
      timestamp: Date.now()
    });
    
    console.log('OAuth state generated and stored:', state.substring(0, 8) + '...');
    
    // Determine the callback URL based on the request
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const host = req.get('Host');
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    
    console.log('Generated OAuth redirect URI:', redirectUri);
    
    // Build Google OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'online',
      prompt: 'select_account',
      state: state
    });
    
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    res.json({
      success: true,
      oauthUrl: oauthUrl
      // Note: Don't return the state to prevent client-side tampering
    });
    
  } catch (error: any) {
    console.error('OAuth URL generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate OAuth URL',
      error: error.message
    });
  }
});

/**
 * Handle Google OAuth callback
 * Processes the authorization code and creates/updates user
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;
    
    if (oauthError) {
      console.error('OAuth error from Google:', oauthError);
      return res.redirect(`/auth?error=${encodeURIComponent('Authentication was cancelled or failed')}`);
    }
    
    if (!code) {
      return res.redirect(`/auth?error=${encodeURIComponent('No authorization code received')}`);
    }
    
    if (!state || typeof state !== 'string') {
      console.error('OAuth callback: Missing or invalid state parameter');
      return res.redirect(`/auth?error=${encodeURIComponent('Invalid authentication request')}`);
    }
    
    // Validate CSRF state parameter
    const storedState = oauthStates.get(state);
    if (!storedState) {
      console.error('OAuth callback: Invalid state parameter - not found or expired');
      return res.redirect(`/auth?error=${encodeURIComponent('Authentication session expired')}`);
    }
    
    // Check if state has expired
    if (Date.now() - storedState.timestamp > OAUTH_STATE_EXPIRY_MS) {
      oauthStates.delete(state); // Clean up expired state
      console.error('OAuth callback: State parameter expired');
      return res.redirect(`/auth?error=${encodeURIComponent('Authentication session expired')}`);
    }
    
    // State is valid, remove it (one-time use)
    oauthStates.delete(state);
    console.log('OAuth callback: State validation successful');
    
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.redirect(`/auth?error=${encodeURIComponent('OAuth not configured')}`);
    }
    
    // Determine the redirect URI (must match what was used in the initial request)
    const protocol = req.get('X-Forwarded-Proto') || req.protocol;
    const host = req.get('Host');
    const redirectUri = `${protocol}://${host}/api/auth/google/callback`;
    
    console.log('OAuth callback - exchanging code for tokens');
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect(`/auth?error=${encodeURIComponent('Failed to authenticate with Google')}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Failed to get user info from Google');
      return res.redirect(`/auth?error=${encodeURIComponent('Failed to get user information')}`);
    }
    
    const googleUser = await userResponse.json();
    
    console.log('Google OAuth user data received:', googleUser.email);
    
    // Process user data and create/update account
    const userData = {
      firebaseUid: `google_${googleUser.id}`, // Create a Firebase-style UID
      email: googleUser.email,
      name: googleUser.name,
      photoURL: googleUser.picture,
      googleId: googleUser.id,
      authProvider: 'google' as const,
      emailVerified: googleUser.verified_email || false
    };
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(or(
        eq(users.googleId, userData.googleId),
        eq(users.email, userData.email)
      ))
      .limit(1);

    let user;

    if (existingUser.length > 0) {
      // Update existing user
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
      // Create new user
      console.log('Creating new user account for:', userData.email);
      
      // Generate unique username
      const baseUsername = userData.email.split('@')[0].toLowerCase();
      let username = baseUsername;
      let counter = 1;
      
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
          profileCompleted: 20
        })
        .returning();
      
      user = newUser;
    }

    console.log('OAuth authentication successful for:', user.email);
    
    // Generate secure session ID and store user session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const userSession: UserSession = {
      userId: user.id,
      email: user.email,
      timestamp: Date.now()
    };
    
    // Store session securely in memory (in production, use Redis)
    userSessions.set(sessionId, userSession);
    
    console.log('Session created for user:', user.email, 'Session ID:', sessionId.substring(0, 8) + '...');
    
    // Set secure session cookie
    const cookieOptions = getSecureCookieOptions(req);
    res.cookie(SESSION_COOKIE_NAME, sessionId, cookieOptions);
    
    // Redirect to clean success URL without exposing sensitive data
    res.redirect('/dashboard');
    
  } catch (error: any) {
    console.error('OAuth callback error:', error);
    res.redirect(`/auth?error=${encodeURIComponent('Authentication failed')}`);
  }
});

/**
 * Get current user session data (secure version)
 * Returns user information for the authenticated user based on secure session cookie
 */
router.get('/session', async (req, res) => {
  try {
    // Get session ID from secure cookie
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    
    if (!sessionId) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated - no session found',
        isAuthenticated: false
      });
    }

    // Validate session
    const session = userSessions.get(sessionId);
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session - session not found or expired',
        isAuthenticated: false
      });
    }

    // Check if session has expired
    if (Date.now() - session.timestamp > SESSION_EXPIRY_MS) {
      userSessions.delete(sessionId); // Clean up expired session
      return res.status(401).json({
        success: false,
        message: 'Session expired',
        isAuthenticated: false
      });
    }

    // Get user data from database
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1);

    if (user.length === 0) {
      // User not found - clean up session
      userSessions.delete(sessionId);
      return res.status(404).json({
        success: false,
        message: 'User not found',
        isAuthenticated: false
      });
    }

    // Update session timestamp (sliding expiration)
    session.timestamp = Date.now();

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
      isAuthenticated: true,
      user: safeUser
    });

  } catch (error: any) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      isAuthenticated: false,
      error: error.message
    });
  }
});

/**
 * Logout endpoint - clears session cookie and invalidates session
 */
router.post('/logout', async (req, res) => {
  try {
    const sessionId = req.cookies[SESSION_COOKIE_NAME];
    
    if (sessionId) {
      // Remove session from memory
      const deleted = userSessions.delete(sessionId);
      if (deleted) {
        console.log('Session invalidated:', sessionId.substring(0, 8) + '...');
      }
    }
    
    // Clear session cookie
    res.clearCookie(SESSION_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error: any) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during logout',
      error: error.message
    });
  }
});

/**
 * Legacy user endpoint (deprecated but maintained for compatibility)
 * This endpoint is insecure and should not be used - redirects to secure session endpoint
 */
router.get('/user', (req, res) => {
  console.warn('⚠️  DEPRECATED: /api/auth/user endpoint accessed - redirecting to secure /api/auth/session');
  res.redirect(307, '/api/auth/session');
});

/**
 * Replit Auth Login Redirect
 * Redirects from /api/auth/login to /api/login to match the Replit auth system
 */
router.get('/login', (req, res) => {
  console.log('🔄 Redirecting /api/auth/login to /api/login for Replit auth');
  res.redirect('/api/login');
});

export { router as authRoutes };
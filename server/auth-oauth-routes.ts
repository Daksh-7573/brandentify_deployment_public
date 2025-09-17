/**
 * Custom Google OAuth Routes - Bypasses Firebase
 * 
 * This implementation creates direct OAuth URLs and handles callbacks
 * to avoid Firebase's blocked /__/auth/* routes on published domains
 */
import { Request, Response } from "express";
import { storage } from "./storage";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { getJWTSecret, JWT_EXPIRATION } from './jwt-secret-manager';

// Google OAuth URLs
const GOOGLE_OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Get OAuth credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

// Allowed redirect URIs (whitelist for security) - Using API routes to avoid client route collision
const ALLOWED_REDIRECT_URIS = [
  'https://brandentifier.replit.app/api/auth/google/callback',
  'https://brandentifier.com/api/auth/google/callback',
  'http://localhost:5000/api/auth/google/callback',
  'http://127.0.0.1:5000/api/auth/google/callback'
];

// Trusted domains allowlist for post-OAuth redirects (SECURITY: prevents open-redirect attacks)
const TRUSTED_REDIRECT_DOMAINS = [
  'brandentifier.com',
  'www.brandentifier.com',
  // All Replit domains
  'brandentifier.replit.app',
  // Development domains
  'localhost',
  '127.0.0.1'
];

// Trusted domain patterns (for wildcard matching)
const TRUSTED_DOMAIN_PATTERNS = [
  /^[a-zA-Z0-9-]+\.replit\.app$/,     // *.replit.app
  /^[a-zA-Z0-9-]+\.replit\.dev$/      // *.replit.dev
];

/**
 * SECURITY: Validates if a domain is trusted for post-OAuth redirects
 * This prevents open-redirect attacks by ensuring we only redirect to our own domains
 * 
 * @param hostOrUrl - Can be just a hostname or a full URL
 * @returns boolean - true if the domain is trusted, false otherwise
 */
function isTrustedRedirectDomain(hostOrUrl: string): boolean {
  try {
    // Handle both hostnames and full URLs
    let hostname: string;
    
    if (hostOrUrl.includes('://')) {
      // It's a URL, extract the hostname
      const url = new URL(hostOrUrl);
      hostname = url.hostname;
    } else {
      // It's just a hostname (may include port)
      hostname = hostOrUrl.split(':')[0]; // Remove port if present
    }
    
    // Normalize to lowercase for case-insensitive comparison
    hostname = hostname.toLowerCase();
    
    // Check exact matches against trusted domains
    if (TRUSTED_REDIRECT_DOMAINS.includes(hostname)) {
      return true;
    }
    
    // Check against wildcard patterns (*.replit.app, *.replit.dev)
    for (const pattern of TRUSTED_DOMAIN_PATTERNS) {
      if (pattern.test(hostname)) {
        return true;
      }
    }
    
    // Special handling for localhost with any port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return true;
    }
    
    // Not a trusted domain
    return false;
    
  } catch (error) {
    // If there's any error parsing the domain/URL, reject it for security
    console.error('🚨 [SECURITY] Error parsing domain for validation:', error);
    return false;
  }
}

// Function to determine if a redirect URI is valid
function isValidRedirectUri(uri: string): boolean {
  // Check exact matches first
  if (ALLOWED_REDIRECT_URIS.includes(uri)) {
    return true;
  }
  
  // Allow any Replit preview domain (*.replit.dev) or published domain (*.replit.app)
  const url = new URL(uri);
  if ((url.hostname.endsWith('.replit.dev') || url.hostname.endsWith('.replit.app')) && 
      url.pathname === '/api/auth/google/callback') {
    return true;
  }
  
  return false;
}

// In-memory state storage (in production, use Redis or database)
const stateStore = new Map<string, { timestamp: number, ip: string }>();

// Clean up expired states every 10 minutes
setInterval(() => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  for (const [state, data] of Array.from(stateStore.entries())) {
    if (data.timestamp < fiveMinutesAgo) {
      stateStore.delete(state);
    }
  }
}, 10 * 60 * 1000);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

/**
 * Generate Google OAuth URL - avoids Firebase routing issues
 */
export async function createGoogleOAuthURLRoute(req: Request, res: Response) {
  try {
    console.log('🚀 Creating Google OAuth URL');
    
    // Set cache control headers for auth endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    if (!CLIENT_ID) {
      throw new Error('Google Client ID not configured');
    }
    
    // Use environment-based redirect URI determination - API route to avoid client collision
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isPreviewDomain = host.includes('replit.dev');
    const isPublishedDomain = host.includes('replit.app');
    
    // CRITICAL FIX: Use the SAME domain as the originating request to avoid cookie domain mismatch
    // This ensures that session cookies can be properly shared between OAuth callback and frontend
    let redirectUri;
    let returnHost = host;
    
    if (isDevelopment) {
      redirectUri = 'http://localhost:5000/api/auth/google/callback';
    } else if (host.includes('brandentifier.com')) {
      redirectUri = 'https://brandentifier.com/api/auth/google/callback';
    } else if (isPreviewDomain || isPublishedDomain) {
      // Use the SAME domain as the request origin to fix cookie domain mismatch
      redirectUri = `https://${host}/api/auth/google/callback`;
    } else {
      // Fallback to published domain for unknown domains
      redirectUri = 'https://brandentifier.replit.app/api/auth/google/callback';
    }
    
    // Validate that the redirect URI is allowed
    if (!isValidRedirectUri(redirectUri)) {
      throw new Error(`Redirect URI not allowed: ${redirectUri}`);
    }
    
    console.log('OAuth redirect URI:', redirectUri);
    
    // Create cryptographically secure state parameter with return host
    const stateData = {
      nonce: crypto.randomBytes(16).toString('base64url'),
      returnHost: returnHost,
      timestamp: Date.now(),
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    };
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
    
    // Store state for validation (simplified since data is in state)
    stateStore.set(state, { 
      timestamp: Date.now(), 
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    });
    
    // Build OAuth URL with OpenID Connect scope
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account',
      state: state
    });
    
    const oauthUrl = `${GOOGLE_OAUTH_BASE_URL}?${params.toString()}`;
    
    console.log('✅ Generated OAuth URL successfully');
    
    res.json({
      success: true,
      oauthUrl: oauthUrl,
      redirectUri: redirectUri
    });
    
  } catch (error: any) {
    console.error('❌ Error creating OAuth URL:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create OAuth URL'
    });
  }
}

/**
 * Handle Google OAuth callback - processes the authorization code
 */
export async function handleGoogleOAuthCallbackRoute(req: Request, res: Response) {
  try {
    console.log('🔄 [OAUTH CALLBACK] Processing Google OAuth callback');
    console.log('🔄 [OAUTH CALLBACK] Query params:', req.query);
    console.log('🔄 [OAUTH CALLBACK] Request URL:', req.url);
    console.log('🔄 [OAUTH CALLBACK] Request method:', req.method);
    console.log('🔄 [OAUTH CALLBACK] Request headers:', {
      host: req.get('host'),
      'user-agent': req.get('user-agent'),
      referer: req.get('referer'),
      origin: req.get('origin')
    });
    
    // Set cache control headers for auth callback endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'server-oauth-callback',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Auth-Host': req.get('host') || 'unknown',
      'X-Debug-Firebase-Disabled': 'true'
    });
    
    const { code, state, error } = req.query;
    
    // Handle OAuth errors
    if (error) {
      console.error('OAuth error:', error);
      return res.redirect('/auth?error=oauth_error');
    }
    
    if (!code || !state) {
      console.error('Missing authorization code or state');
      return res.redirect('/auth?error=missing_params');
    }
    
    // Validate state parameter (CSRF protection)
    const stateData = stateStore.get(state as string);
    if (!stateData) {
      console.error('Invalid or expired state parameter');
      return res.redirect('/auth?error=invalid_state');
    }
    
    // Check state age (max 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (stateData.timestamp < fiveMinutesAgo) {
      console.error('Expired state parameter');
      stateStore.delete(state as string);
      return res.redirect('/auth?error=expired_state');
    }
    
    // Remove used state
    stateStore.delete(state as string);
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    // Use environment-based redirect URI determination - API route to avoid client collision
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isPreviewDomain = host.includes('replit.dev');
    const isPublishedDomain = host.includes('replit.app');
    
    // CRITICAL FIX: Use the SAME domain as the callback request to avoid cookie domain mismatch
    // This ensures that session cookies can be properly shared between OAuth callback and frontend
    let redirectUri;
    let returnHost = host;
    
    if (isDevelopment) {
      redirectUri = 'http://localhost:5000/api/auth/google/callback';
    } else if (host.includes('brandentifier.com')) {
      redirectUri = 'https://brandentifier.com/api/auth/google/callback';
    } else if (isPreviewDomain || isPublishedDomain) {
      // Use the SAME domain as the callback request to fix cookie domain mismatch
      redirectUri = `https://${host}/api/auth/google/callback`;
    } else {
      // Fallback to published domain for unknown domains
      redirectUri = 'https://brandentifier.replit.app/api/auth/google/callback';
    }
    
    // Validate that the redirect URI is allowed
    if (!isValidRedirectUri(redirectUri)) {
      throw new Error(`Redirect URI not allowed: ${redirectUri}`);
    }
    
    console.log('🔄 [OAUTH CALLBACK] Exchanging code for token...');
    console.log('🔄 [OAUTH CALLBACK] Using redirect URI:', redirectUri);
    console.log('🔄 [OAUTH CALLBACK] Host detected:', host);
    console.log('🔄 [OAUTH CALLBACK] Development mode:', isDevelopment);
    
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return res.redirect('/auth?error=token_exchange_failed');
    }
    
    const tokenData = await tokenResponse.json();
    console.log('✅ Token exchange successful');
    
    // Get user info from Google
    console.log('🔄 Fetching user info...');
    
    const userResponse = await fetch(GOOGLE_USER_INFO_URL, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });
    
    if (!userResponse.ok) {
      console.error('Failed to fetch user info');
      return res.redirect('/auth?error=user_info_failed');
    }
    
    const googleUser = await userResponse.json();
    console.log('✅ User info received:', {
      email: googleUser.email,
      name: googleUser.name,
      id: googleUser.id
    });
    
    // Create or update user in our database
    const userData = {
      firebaseUid: googleUser.id,
      email: googleUser.email || '',
      name: googleUser.name || 'Google User',
      photoURL: googleUser.picture || '',
      googleId: googleUser.id,
      authProvider: 'google',
      emailVerified: googleUser.verified_email || false
    };
    
    console.log('📡 Saving user to database...');
    
    // Use existing auth logic
    const existingUser = await storage.getUserByEmail(userData.email);
    let user;
    
    if (existingUser) {
      console.log('✅ User exists, updating profile');
      // Update existing user
      user = await storage.updateUser(existingUser.id, {
        name: userData.name,
        photoURL: userData.photoURL
      });
    } else {
      console.log('✅ Creating new user');
      // Create new user
      user = await storage.createUser({
        username: userData.firebaseUid,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL
      });
    }
    
    if (!user) {
      throw new Error('Failed to create or update user');
    }
    
    console.log('✅ User saved successfully:', {
      id: user.id,
      email: user.email,
      name: user.name
    });
    
    // Create secure JWT session
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      authProvider: 'google',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    };
    
    // Sign JWT with secret
    const sessionToken = jwt.sign(tokenPayload, getJWTSecret(), { 
      algorithm: 'HS256',
      expiresIn: JWT_EXPIRATION
    });
    
    // Determine exact domain for production cookie
    const currentHost = req.get('host') || 'localhost:5000';
    const isLocalDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
    const isHttps = !isLocalDev; // All Replit domains (.replit.app and .replit.dev) use HTTPS
    
    // Set session cookie with correct security settings for all HTTPS Replit domains
    const cookieOptions = {
      httpOnly: true,
      secure: isHttps,             // Secure flag for all HTTPS domains (both .replit.app and .replit.dev)
      sameSite: 'lax' as const,    // Use 'lax' for same-site requests to work properly
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    
    // DO NOT set domain for Replit - let browser handle it automatically
    // Setting domain can cause cross-subdomain issues on replit.app
    
    console.log('🍪 Setting cookie with options:', {
      domain: (cookieOptions as any).domain || 'omitted',
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      host: currentHost
    });
    
    res.cookie('brandentifier_session', sessionToken, cookieOptions);
    
    // Store user data for client-side access (sanitized)
    const clientUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      profileCompleted: user.profileCompleted || 0,
      authProvider: 'google',
      emailVerified: user.emailVerified
    };
    
    console.log('✅ [OAUTH CALLBACK] Authentication completed successfully, redirecting to Industry Pulse');
    console.log('✅ [OAUTH CALLBACK] User authenticated:', {
      email: user.email,
      id: user.id,
      username: user.username,
      authProvider: 'google'
    });
    console.log('✅ [OAUTH CALLBACK] Session cookie set successfully');
    console.log('✅ [OAUTH CALLBACK] Redirecting to /industry-pulse');
    
    // SECURITY: Parse state to get return host and validate against trusted domains before redirecting
    let finalRedirectUrl = '/dashboard'; // Default safe fallback
    
    try {
      const decodedState = JSON.parse(Buffer.from(state as string, 'base64url').toString());
      const returnHost = decodedState.returnHost;
      
      if (returnHost && returnHost !== req.get('host')) {
        // SECURITY: Validate returnHost against trusted domains to prevent open-redirect attacks
        if (isTrustedRedirectDomain(returnHost)) {
          // Domain is trusted, construct redirect URL
          if (returnHost.includes('localhost') || returnHost.includes('127.0.0.1')) {
            finalRedirectUrl = `http://${returnHost}/dashboard`;
          } else {
            finalRedirectUrl = `https://${returnHost}/dashboard`;
          }
          console.log('✅ [OAUTH CALLBACK] Validated cross-domain redirect to:', finalRedirectUrl);
          console.log('✅ [OAUTH CALLBACK] Trusted domain confirmed:', returnHost);
          return res.redirect(303, finalRedirectUrl);
        } else {
          // SECURITY: Block untrusted domain redirect attempt and log for monitoring
          console.error('🚨 [SECURITY ALERT] Blocked open-redirect attempt!');
          console.error('🚨 [SECURITY] Untrusted returnHost blocked:', returnHost);
          console.error('🚨 [SECURITY] Request details:', {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('user-agent'),
            referer: req.get('referer'),
            timestamp: new Date().toISOString(),
            requestHost: req.get('host')
          });
          
          // Use safe fallback redirect instead of potentially malicious domain
          console.log('🛡️ [SECURITY] Using safe fallback redirect instead of untrusted domain');
          finalRedirectUrl = '/dashboard';
        }
      }
    } catch (error) {
      // SECURITY: If state parsing fails, log the attempt and use safe fallback
      console.error('🚨 [SECURITY] Could not parse state for return host - potential tampering attempt');
      console.error('🚨 [SECURITY] State parsing error:', error);
      console.error('🚨 [SECURITY] Request details:', {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        referer: req.get('referer'),
        timestamp: new Date().toISOString()
      });
      console.log('⚠️ [OAUTH CALLBACK] Using safe default redirect due to state parsing failure');
      finalRedirectUrl = '/dashboard';
    }
    
    // Same domain redirect - go to dashboard
    console.log('✅ [OAUTH CALLBACK] Same domain redirect to:', finalRedirectUrl);
    return res.redirect(303, finalRedirectUrl);
    
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    res.redirect(`/auth?error=callback_error&message=${encodeURIComponent(error.message)}`);
  }
}

/**
 * Check current session validity - for client-side auth state detection
 * Enhanced with Firebase-to-JWT migration support
 */
export async function checkSessionRoute(req: Request, res: Response) {
  try {
    console.log('🔍 [SESSION CHECK] Checking session validity');
    
    // Set cache control headers for session endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Debug logging for session validation
    const requestHost = req.get('host');
    console.log('🍪 [SESSION CHECK] Session Debug:', {
      host: requestHost,
      cookiePresent: !!req.cookies?.brandentifier_session,
      tokenLength: req.cookies?.brandentifier_session ? req.cookies.brandentifier_session.length : 0,
      userAgent: req.get('user-agent')?.substring(0, 50)
    });
    
    // STEP 1: Check if JWT session cookie exists (primary auth method)
    const sessionToken = req.cookies?.brandentifier_session;
    
    if (sessionToken) {
      console.log('🔍 [SESSION CHECK] JWT session cookie found, validating...');
      
      // Verify JWT token
      try {
        const decoded = jwt.verify(sessionToken, getJWTSecret()) as any;
        console.log('✅ [SESSION CHECK] Valid JWT session found for user:', decoded.email);
        
        // Get fresh user data from database
        const user = await storage.getUserByEmail(decoded.email);
        
        if (!user) {
          console.log('❌ [SESSION CHECK] User not found in database for JWT token');
          // Clear invalid session cookie
          clearSessionCookie(req, res);
          return res.status(401).json({
            success: false,
            error: 'User not found'
          });
        }
        
        // Return sanitized user data (same format as OAuth callback)
        const clientUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          photoURL: user.photoURL,
          profileCompleted: user.profileCompleted || 0,
          authProvider: 'google',
          emailVerified: user.emailVerified
        };
        
        console.log('✅ [SESSION CHECK] JWT session valid, returning user data');
        return res.json({
          success: true,
          user: clientUser,
          sessionType: 'jwt'
        });
        
      } catch (jwtError) {
        console.log('❌ [SESSION CHECK] Invalid or expired JWT token - checking for Firebase fallback');
        // Don't return error yet, check for Firebase data first
        clearSessionCookie(req, res);
      }
    }
    
    // STEP 2: SECURITY FIX - Firebase migration disabled to prevent account spoofing
    // The previous Firebase migration code accepted unverified user data from clients,
    // allowing account spoofing by simply knowing someone's email address.
    // Since Firebase authentication is being phased out, this migration path is now disabled.
    
    const firebaseUserData = req.body?.firebaseUser;
    if (firebaseUserData) {
      console.log('🚨 [SECURITY] Blocked insecure Firebase migration attempt:', {
        email: firebaseUserData.email || 'unknown',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      return res.status(403).json({
        success: false,
        error: 'Firebase migration is disabled for security',
        message: 'Please sign in using Google OAuth to create a secure JWT session.',
        redirectToOAuth: true
      });
    }
    
    // STEP 3: No JWT token and no Firebase data - user needs to authenticate
    console.log('❌ [SESSION CHECK] No valid session found');
    clearSessionCookie(req, res);
    return res.status(401).json({
      success: false,
      error: 'No session found',
      requiresAuth: true
    });
    
  } catch (error: any) {
    console.error('❌ Session check error:', error);
    res.status(500).json({
      success: false,
      error: 'Session check failed'
    });
  }
}

/**
 * Helper function to clear session cookie with proper security settings
 */
function clearSessionCookie(req: Request, res: Response) {
  const currentHost = req.get('host') || 'localhost:5000';
  const isLocalDev = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');
  const isHttps = !isLocalDev; // All Replit domains (.replit.app and .replit.dev) use HTTPS
  
  // Clear cookie with same settings as when it was set
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax' as const,
    path: '/',
    expires: new Date(0), // Set expiration to past date to clear cookie
  };
  
  res.clearCookie('brandentifier_session', cookieOptions);
  console.log('🍪 Session cookie cleared with options:', {
    domain: (cookieOptions as any).domain || 'omitted',
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
    host: currentHost
  });
}

/**
 * Logout endpoint - securely clears JWT session cookie
 */
export async function logoutRoute(req: Request, res: Response) {
  try {
    console.log('🚪 Processing logout request');
    
    // Set cache control headers for logout endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'server-logout',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Auth-Host': req.get('host') || 'unknown'
    });
    
    // Debug logging for logout
    const requestHost = req.get('host');
    const sessionToken = req.cookies?.brandentifier_session;
    
    console.log('🍪 Logout Debug:', {
      host: requestHost,
      cookiePresent: !!sessionToken,
      method: req.method,
      userAgent: req.get('user-agent')?.substring(0, 50)
    });
    
    // Check if we have a session to clear
    if (sessionToken) {
      try {
        // Try to decode the token to get user info for logging
        const decoded = jwt.verify(sessionToken, getJWTSecret()) as any;
        console.log('🚪 Logging out user:', decoded.email);
      } catch (jwtError) {
        console.log('🚪 Clearing invalid/expired session during logout');
      }
    } else {
      console.log('🚪 No session cookie found, but proceeding with logout');
    }
    
    // Always clear the session cookie (even if it doesn't exist or is invalid)
    clearSessionCookie(req, res);
    
    console.log('✅ Logout completed successfully');
    
    // Return success response
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
    
  } catch (error: any) {
    console.error('❌ Logout error:', error);
    
    // Even if there's an error, try to clear the cookie
    try {
      clearSessionCookie(req, res);
    } catch (clearError) {
      console.error('❌ Error clearing cookie during logout error:', clearError);
    }
    
    // Return success anyway - logout should be idempotent
    res.json({
      success: true,
      message: 'Logged out successfully',
      note: 'Logout completed despite error'
    });
  }
}
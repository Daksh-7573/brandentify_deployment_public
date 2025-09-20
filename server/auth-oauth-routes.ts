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

// Google OAuth URLs
const GOOGLE_OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Get OAuth credentials from environment
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// STANDARDIZED: Allowed redirect URIs (whitelist for security) - Using API routes to avoid client route collision
// These URIs must be registered in Google Cloud Console exactly as listed
const ALLOWED_REDIRECT_URIS = [
  'https://brandentifier.replit.app/api/auth/google/callback',  // Primary Replit domain - handles ALL Replit environments
  'https://brandentifier.com/api/auth/google/callback',         // Production domain
  'http://localhost:5000/api/auth/google/callback',            // Development (localhost)
  'http://127.0.0.1:5000/api/auth/google/callback'             // Development (127.0.0.1)
];

// STANDARDIZED: Domain pattern matching for Replit environments
const REPLIT_DOMAIN_PATTERNS = [
  /^[a-zA-Z0-9-]+\.replit\.app$/,                    // Published domains like brandentifier.replit.app
  /^[a-zA-Z0-9-]+\.replit\.dev$/,                    // Preview domains like simple.replit.dev
  /^[a-f0-9-]+\.picard\.replit\.dev$/,               // Basic picard preview pattern
  /^[a-f0-9-]+-[a-f0-9-]+-[a-zA-Z0-9-]+\.picard\.replit\.dev$/ // Full picard subdomain pattern
];

/**
 * STANDARDIZED REDIRECT URI GENERATION
 * 
 * This function ensures consistent redirect URI generation across all OAuth flows.
 * It uses a minimal set of registered URIs to avoid Google Cloud Console complexity.
 * 
 * Strategy: Use stable redirect URIs and handle cross-domain sessions via session handoff
 */
function getStandardizedRedirectUri(host: string): { redirectUri: string; returnHost: string } {
  const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
  const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
  const isBrandentifierCom = host.includes('brandentifier.com');
  
  let redirectUri: string;
  const returnHost = host; // Always preserve original host for post-auth redirect
  
  if (isDevelopment) {
    // Development: Use localhost
    redirectUri = 'http://localhost:5000/api/auth/google/callback';
  } else if (isBrandentifierCom) {
    // Production: Use brandentifier.com
    redirectUri = 'https://brandentifier.com/api/auth/google/callback';
  } else if (isReplitDomain) {
    // ALL REPLIT DOMAINS: Use consistent brandentifier.replit.app (registered in Google Cloud Console)
    // This handles preview domains, published domains, picard domains - everything
    redirectUri = 'https://brandentifier.replit.app/api/auth/google/callback';
  } else {
    // Unknown domains: Default to brandentifier.replit.app for safety
    console.log('⚠️ [URI-STANDARDIZATION] Unknown domain detected, using default Replit redirect URI');
    redirectUri = 'https://brandentifier.replit.app/api/auth/google/callback';
  }
  
  return { redirectUri, returnHost };
}

/**
 * SECURITY: Validate return host against allowed domains
 * 
 * This prevents open redirect attacks by ensuring returnHost is trusted
 */
function validateReturnHost(host: string): string {
  const ALLOWED_RETURN_HOSTS = [
    'brandentifier.com',
    'www.brandentifier.com',
    'brandentifier.replit.app',
    'localhost:5000',
    '127.0.0.1:5000'
  ];
  
  // Check exact matches first
  if (ALLOWED_RETURN_HOSTS.includes(host)) {
    return host;
  }
  
  // Check Replit preview domain patterns (additional security)
  const isValidReplitPreview = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
  if (isValidReplitPreview) {
    return host;
  }
  
  // Default to safe fallback for unrecognized hosts
  console.log('⚠️ [SECURITY] Invalid return host detected, using safe fallback:', {
    providedHost: host,
    fallbackHost: 'brandentifier.replit.app'
  });
  return 'brandentifier.replit.app';
}

/**
 * SECURITY: Create stateless JWT-based state token
 * 
 * This replaces in-memory state storage to work across different server instances
 */
function createStatelessState(data: any): string {
  const payload = {
    ...data,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (15 * 60), // 15 minutes expiry
    jti: crypto.randomBytes(16).toString('base64url') // unique token ID
  };
  
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
}

/**
 * SECURITY: Validate stateless JWT state token
 * 
 * This validates the JWT state token and returns the payload if valid
 */
function validateStatelessState(token: string): any {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { 
      algorithms: ['HS256'],
      maxAge: '15m' // Additional expiry check
    });
    return decoded;
  } catch (error) {
    console.error('❌ [STATE-VALIDATION] JWT state validation failed:', error.message);
    throw new Error('Invalid or expired authentication state');
  }
}

// In-memory state storage (in production, use Redis or database)
const stateStore = new Map<string, { timestamp: number, ip: string }>();

// Session exchange code storage for cross-domain handoff
interface SessionExchangeData {
  sessionToken: string;
  timestamp: number;
  returnHost: string;
  userId: number;
}

const sessionExchangeStore = new Map<string, SessionExchangeData>();

// Clean up expired states and session exchange codes every 5 minutes
setInterval(() => {
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  
  // Clean up expired OAuth states (15 minutes)
  let deletedStateCount = 0;
  for (const [state, data] of Array.from(stateStore.entries())) {
    if (data.timestamp < fifteenMinutesAgo) {
      stateStore.delete(state);
      deletedStateCount++;
    }
  }
  if (deletedStateCount > 0) {
    console.log(`🧹 [STATE-CLEANUP] Removed ${deletedStateCount} expired OAuth states`);
  }
  
  // Clean up expired session exchange codes (5 minutes)
  let deletedExchangeCount = 0;
  for (const [code, data] of Array.from(sessionExchangeStore.entries())) {
    if (data.timestamp < fiveMinutesAgo) {
      sessionExchangeStore.delete(code);
      deletedExchangeCount++;
    }
  }
  if (deletedExchangeCount > 0) {
    console.log(`🧹 [EXCHANGE-CLEANUP] Removed ${deletedExchangeCount} expired session exchange codes`);
  }
}, 5 * 60 * 1000);

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

/**
 * Generate Google OAuth URL - avoids Firebase routing issues
 */
export async function createGoogleOAuthURLRoute(req: Request, res: Response) {
  try {
    console.log('🚀 Creating Google OAuth URL');
    console.log('🔍 [DEBUG] Client ID (first 8 chars):', CLIENT_ID?.substring(0, 8) + '...');
    
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
    
    // STANDARDIZED: Use centralized redirect URI generation with security validation
    const host = req.get('Host') || '';
    const { redirectUri, returnHost: unsafeReturnHost } = getStandardizedRedirectUri(host);
    const returnHost = validateReturnHost(unsafeReturnHost);
    
    console.log('🌐 [OAUTH-URL] Standardized domain analysis:', {
      host,
      redirectUri,
      returnHost,
      isInWhitelist: ALLOWED_REDIRECT_URIS.includes(redirectUri),
      matchedPattern: REPLIT_DOMAIN_PATTERNS.find(pattern => pattern.test(host))?.toString()
    });
    
    console.log('✅ [OAUTH-URL] Standardized redirect URI selected:', redirectUri);
    
    // Validation: Ensure URI is whitelisted
    if (!ALLOWED_REDIRECT_URIS.includes(redirectUri)) {
      console.error('🚨 [OAUTH-URL] CRITICAL: Generated URI not in whitelist!', {
        generatedUri: redirectUri,
        whitelist: ALLOWED_REDIRECT_URIS
      });
      throw new Error('Invalid redirect URI generated - not in whitelist');
    }
    
    console.log('✅ [URI-DEBUG] Whitelist validation passed');
    console.log('🔍 [URI-DEBUG] STANDARDIZED URI ANALYSIS:');
    console.log('📍 Original Host:', host);
    console.log('🎯 Standardized Redirect URI:', redirectUri);
    console.log('🔗 Return Host (for post-auth):', returnHost);
    console.log('📋 Request Headers:', {
      'user-agent': req.get('user-agent')?.substring(0, 100) + '...',
      'referer': req.get('referer'),
      'x-forwarded-proto': req.get('x-forwarded-proto'),
      'x-forwarded-host': req.get('x-forwarded-host'),
      'origin': req.get('origin'),
      'sec-fetch-site': req.get('sec-fetch-site'),
      'sec-fetch-mode': req.get('sec-fetch-mode'),
      'sec-fetch-dest': req.get('sec-fetch-dest')
    });
    console.log('🏷️ Request Context:', {
      method: req.method,
      path: req.path,
      query: req.query,
      isPopupRequest: req.query.popup === 'true' || req.query.flow === 'popup'
    });
    console.log('📝 Whitelist Check:', {
      'isInWhitelist': ALLOWED_REDIRECT_URIS.includes(redirectUri),
      'whitelistedURIs': ALLOWED_REDIRECT_URIS
    });
    
    // SECURITY: Create stateless JWT-based state (works across all server instances)
    const isPopupFlow = req.query.popup === 'true' || req.query.flow === 'popup';
    const stateData = {
      nonce: crypto.randomBytes(16).toString('base64url'),
      returnHost: returnHost,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      isPopup: isPopupFlow,
      initiatingHost: host // Track where auth was initiated
    };
    
    const state = createStatelessState(stateData);
    
    console.log('✅ [SECURITY] Stateless JWT state created for cross-instance compatibility');
    
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
    console.error('❌ [OAUTH-URL-ERROR] Error creating OAuth URL:', {
      errorMessage: error.message,
      errorStack: error.stack,
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString()
    });
    
    // Categorize and provide user-friendly error messages
    let userMessage = 'Unable to start authentication. Please try again.';
    let errorCode = 'OAUTH_URL_CREATION_FAILED';
    
    if (error.message?.includes('Google Client ID')) {
      userMessage = 'Authentication service is temporarily unavailable. Please try again later.';
      errorCode = 'OAUTH_CONFIG_ERROR';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'Network connection issue. Please check your internet and try again.';
      errorCode = 'NETWORK_ERROR';
    }
    
    res.status(500).json({
      success: false,
      error: userMessage,
      errorCode: errorCode,
      canRetry: true,
      suggestedActions: ['Try refreshing the page', 'Check your internet connection', 'Try again in a few minutes']
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
    
    // Handle OAuth errors with detailed logging
    if (error) {
      console.error('❌ [OAUTH-ERROR] Google OAuth error:', {
        error: error,
        host: req.get('host'),
        referer: req.get('referer'),
        userAgent: req.get('user-agent'),
        timestamp: new Date().toISOString()
      });
      
      // Provide specific error messages based on OAuth error types
      let errorMessage = 'Authentication was cancelled or failed. Please try again.';
      if (error === 'access_denied') {
        errorMessage = 'Authentication was cancelled. You need to grant permission to continue.';
      } else if (error === 'invalid_request') {
        errorMessage = 'Authentication request was invalid. Please try again.';
      }
      
      return res.redirect(`/auth?error=oauth_error&message=${encodeURIComponent(errorMessage)}&canRetry=true`);
    }
    
    if (!code || !state) {
      console.error('❌ [OAUTH-CALLBACK-ERROR] Missing authorization code or state:', {
        hasCode: !!code,
        hasState: !!state,
        query: req.query,
        host: req.get('host'),
        timestamp: new Date().toISOString()
      });
      return res.redirect('/auth?error=missing_params&message=Authentication%20response%20incomplete.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // SECURITY: Validate stateless JWT state (works across all server instances)
    let stateData;
    try {
      stateData = validateStatelessState(state as string);
      console.log('✅ [STATE-VALIDATION] Stateless JWT state validation successful:', {
        initiatingHost: stateData.initiatingHost,
        returnHost: stateData.returnHost,
        isPopup: stateData.isPopup,
        jti: stateData.jti,
        currentHost: req.get('host')
      });
    } catch (error: any) {
      console.log('❌ [STATE-VALIDATION] Stateless JWT state validation failed:', {
        error: error.message,
        providedState: typeof state,
        stateLength: typeof state === 'string' ? (state as string).length : 0,
        currentHost: req.get('host')
      });
      
      // Determine error type for user-friendly message
      if (error.message.includes('expired')) {
        return res.redirect('/auth?error=expired_state&message=Authentication%20session%20expired.%20Please%20try%20signing%20in%20again.&canRetry=true');
      } else {
        return res.redirect('/auth?error=invalid_state&message=Invalid%20authentication%20session.%20Please%20try%20signing%20in%20again.&canRetry=true');
      }
    }
    // JWT validation already handled expiry, state is guaranteed valid at this point
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    // SECURITY: Use validated returnHost from JWT state and generate redirect URI for token exchange
    const host = req.get('Host') || '';
    const { redirectUri } = getStandardizedRedirectUri(host);
    const returnHost = validateReturnHost(stateData.returnHost); // Use returnHost from state, validated
    
    console.log('🌐 [OAUTH-CALLBACK] Secure callback analysis:', {
      callbackHost: host,
      redirectUri,
      returnHost: returnHost,
      stateInitiatingHost: stateData.initiatingHost,
      isInWhitelist: ALLOWED_REDIRECT_URIS.includes(redirectUri),
      matchedPattern: REPLIT_DOMAIN_PATTERNS.find(pattern => pattern.test(host))?.toString()
    });
    
    // Validation: Ensure URI consistency
    if (!ALLOWED_REDIRECT_URIS.includes(redirectUri)) {
      console.error('🚨 [OAUTH-CALLBACK] CRITICAL: Generated URI not in whitelist!', {
        generatedUri: redirectUri,
        whitelist: ALLOWED_REDIRECT_URIS
      });
      throw new Error('Invalid redirect URI generated for token exchange - not in whitelist');
    }
    
    console.log('🔄 [OAUTH CALLBACK] Exchanging code for token...');
    console.log('✅ [OAUTH CALLBACK] Using standardized redirect URI:', redirectUri);
    console.log('🔍 [OAUTH CALLBACK] Original host detected:', host);
    console.log('🔗 [OAUTH CALLBACK] Return host for post-auth:', returnHost);
    
    // STANDARDIZED DEBUGGING: Detailed callback context analysis
    console.log('🔍 [CALLBACK-DEBUG] STANDARDIZED CALLBACK ANALYSIS:');
    console.log('📍 Callback Host:', host);
    console.log('🎯 Standardized Token Exchange URI:', redirectUri);
    console.log('🔗 Post-Auth Return Host:', returnHost);
    console.log('📋 Callback Headers:', {
      'user-agent': req.get('user-agent')?.substring(0, 100) + '...',
      'referer': req.get('referer'),
      'x-forwarded-proto': req.get('x-forwarded-proto'),
      'x-forwarded-host': req.get('x-forwarded-host'),
      'origin': req.get('origin'),
      'x-frame-options': req.get('x-frame-options'),
      'sec-fetch-site': req.get('sec-fetch-site'),
      'sec-fetch-mode': req.get('sec-fetch-mode'),
      'sec-fetch-dest': req.get('sec-fetch-dest')
    });
    console.log('🏷️ Callback Context:', {
      method: req.method,
      path: req.path,
      query: req.query,
      state: typeof state,
      code: typeof code
    });
    console.log('📝 URI Validation:', {
      'generatedURI': redirectUri,
      'isInWhitelist': ALLOWED_REDIRECT_URIS.includes(redirectUri),
      'whitelistedURIs': ALLOWED_REDIRECT_URIS
    });
    
    // ERROR HANDLING: Add token exchange error prediction
    if (!ALLOWED_REDIRECT_URIS.includes(redirectUri)) {
      console.log('⚠️ [POTENTIAL-ERROR] Generated URI not in whitelist - Google OAuth will likely fail!');
      console.log('🔧 [SUGGESTION] Either add to Google Cloud Console or fix dynamic generation logic');
    }
    
    // IFRAME CONTEXT ANALYSIS: Check if request came from iframe
    const isIframeContext = req.get('sec-fetch-dest') === 'iframe' || 
                           req.get('sec-fetch-site') === 'cross-site' ||
                           req.get('referer')?.includes('preview');
    console.log('🖼️ [IFRAME-ANALYSIS] Context detection:', {
      'isIframeContext': isIframeContext,
      'sec-fetch-dest': req.get('sec-fetch-dest'),
      'sec-fetch-site': req.get('sec-fetch-site'),
      'referer': req.get('referer')
    });
    
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
      console.error('❌ [TOKEN-EXCHANGE-ERROR] Token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        errorText: errorText,
        host: req.get('host'),
        redirectUri: redirectUri,
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'Authentication failed during token exchange. Please try again.';
      if (tokenResponse.status === 400) {
        errorMessage = 'Invalid authentication request. Please try signing in again.';
      } else if (tokenResponse.status === 401) {
        errorMessage = 'Authentication expired. Please try signing in again.';
      } else if (tokenResponse.status >= 500) {
        errorMessage = 'Authentication service temporarily unavailable. Please try again later.';
      }
      
      return res.redirect(`/auth?error=token_exchange_failed&message=${encodeURIComponent(errorMessage)}&canRetry=true`);
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
      console.error('❌ [USER-INFO-ERROR] Failed to fetch user info:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        host: req.get('host'),
        timestamp: new Date().toISOString()
      });
      
      let errorMessage = 'Unable to retrieve your profile information. Please try again.';
      if (userResponse.status === 401) {
        errorMessage = 'Authentication token expired. Please try signing in again.';
      } else if (userResponse.status === 403) {
        errorMessage = 'Insufficient permissions to access profile. Please try signing in again.';
      }
      
      return res.redirect(`/auth?error=user_info_failed&message=${encodeURIComponent(errorMessage)}&canRetry=true`);
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
    console.log('🔍 [AUTH-FIX] Looking up user by Google ID first:', userData.googleId);
    
    // FIXED: Check by Google ID first to prevent duplicate users across domains
    let existingUser = await storage.getUserByGoogleId(userData.googleId);
    let user;
    
    if (existingUser) {
      console.log('✅ [AUTH-FIX] Found existing user by Google ID:', {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        googleId: existingUser.googleId
      });
      // Update existing user with latest Google info
      user = await storage.updateUser(existingUser.id, {
        name: userData.name,
        photoURL: userData.photoURL,
        googleId: userData.googleId,
        firebaseUid: userData.firebaseUid,
        authProvider: 'google',
        lastLoginAt: new Date()
      });
      console.log('✅ [AUTH-FIX] Updated existing user profile');
    } else {
      // Fallback: check by email for legacy users who may not have googleId stored
      console.log('🔍 [AUTH-FIX] No user found by Google ID, checking by email as fallback');
      const userByEmail = await storage.getUserByEmail(userData.email);
      
      if (userByEmail) {
        console.log('✅ [AUTH-FIX] Found legacy user by email, updating with Google ID');
        // Update legacy user with Google ID fields
        user = await storage.updateUser(userByEmail.id, {
          name: userData.name,
          photoURL: userData.photoURL,
          googleId: userData.googleId,
          firebaseUid: userData.firebaseUid,
          authProvider: 'google',
          lastLoginAt: new Date()
        });
      } else {
        console.log('✅ [AUTH-FIX] Creating new user with Google ID');
        // Create new user with all Google fields
        user = await storage.createUser({
          username: userData.firebaseUid,
          email: userData.email,
          name: userData.name,
          photoURL: userData.photoURL,
          googleId: userData.googleId,
          firebaseUid: userData.firebaseUid,
          authProvider: 'google',
          lastLoginAt: new Date()
        });

        // Assign starter quests immediately for new users
        if (user && user.id) {
          try {
            console.log(`🎯 [STARTER-QUESTS] Assigning starter quests to new user ${user.id} (${user.name})`);
            
            // Assign both career and social starter quests
            const starterCareerQuests = await storage.assignDailyQuestsToUser(user.id);
            const starterSocialQuests = await storage.assignDailySocialQuests(user.id);
            
            const totalStarterQuests = starterCareerQuests.length + starterSocialQuests.length;
            console.log(`✅ [STARTER-QUESTS] Successfully assigned ${starterCareerQuests.length} career + ${starterSocialQuests.length} social = ${totalStarterQuests} starter quests to new user ${user.name}`);
          } catch (starterError) {
            console.error(`❌ [STARTER-QUESTS] Error assigning starter quests to new user ${user.id}:`, starterError);
            // Don't fail the user creation if quest assignment fails
          }
        }
      }
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
    const sessionToken = jwt.sign(tokenPayload, JWT_SECRET, { 
      algorithm: 'HS256'
    });
    
    // SECURITY: Use already validated returnHost from JWT state (no additional parsing needed)
    const finalReturnHost = returnHost; // Already validated earlier from JWT state
    
    console.log('✅ [OAUTH CALLBACK] Authentication completed successfully');
    console.log('✅ [OAUTH CALLBACK] User authenticated:', {
      email: user.email,
      id: user.id,
      username: user.username,
      authProvider: 'google'
    });
    
    // Check if cross-domain session handoff is needed
    const currentHost = req.get('host') || 'localhost:5000';
    const needsCrossDomainHandoff = finalReturnHost !== currentHost;
    
    console.log('🔍 [SESSION-HANDOFF] Domain analysis:', {
      currentHost,
      returnHost: finalReturnHost,
      needsCrossDomainHandoff
    });
    
    if (needsCrossDomainHandoff) {
      // Generate secure session exchange code for cross-domain handoff
      const exchangeCode = crypto.randomBytes(32).toString('base64url');
      
      // Store session exchange data (expires in 5 minutes, single-use)
      sessionExchangeStore.set(exchangeCode, {
        sessionToken,
        timestamp: Date.now(),
        returnHost: finalReturnHost,
        userId: user.id
      });
      
      // Build session acceptance URL on return domain
      const sessionAcceptUrl = finalReturnHost.includes('localhost') 
        ? `http://${finalReturnHost}/auth/accept-session?code=${exchangeCode}`
        : `https://${finalReturnHost}/auth/accept-session?code=${exchangeCode}`;
      
      console.log('🔄 [SESSION-HANDOFF] Cross-domain handoff initiated');
      console.log('✅ [SESSION-HANDOFF] Generated exchange code and redirecting to:', sessionAcceptUrl);
      
      return res.redirect(303, sessionAcceptUrl);
    } else {
      // Same domain - check if this is a popup request first
      // SECURITY: Use popup detection from already validated JWT state
      const isPopupRequest = stateData.isPopup === true;
      console.log('🔍 [POPUP-DETECTION] JWT state-based popup detection:', { isPopup: isPopupRequest });
      
      const isSecure = currentHost.includes('replit.app') || currentHost.includes('replit.dev') || currentHost.includes('brandentifier.com');
      
      const cookieOptions = {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax' as const, // Use 'lax' for better compatibility - fixed for Replit domains
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };
      
      console.log('🍪 [SESSION-HANDOFF] Same domain - setting cookie directly:', {
        domain: (cookieOptions as any).domain || 'omitted',
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
        host: currentHost,
        isPopupRequest
      });
      
      res.cookie('brandentifier_session', sessionToken, cookieOptions);
      
      if (isPopupRequest) {
        // Handle popup authentication - send PostMessage to parent window
        console.log('🪟 [POPUP-AUTH] Popup authentication detected - sending PostMessage to parent');
        
        const popupResponseHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authentication Successful</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
    }
    .container {
      background: rgba(255, 255, 255, 0.1);
      padding: 30px;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      max-width: 400px;
    }
    .spinner {
      border: 3px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top: 3px solid white;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h1 { margin: 0 0 15px; font-size: 24px; }
    p { margin: 0; opacity: 0.9; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Authentication Successful!</h1>
    <p>You have been successfully signed in. This window will close automatically.</p>
  </div>
  
  <script>
    console.log('🪟 [POPUP-CALLBACK] Popup authentication completion page loaded');
    
    try {
      // Check if we have a parent window (popup scenario)
      if (window.opener && !window.opener.closed) {
        console.log('✅ [POPUP-CALLBACK] Parent window detected - sending success message');
        
        // Send success message to parent window
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_COMPLETE',
          success: true,
          user: {
            id: ${user.id},
            email: '${user.email}',
            name: '${user.name?.replace(/'/g, "\\'") || ""}',
            authProvider: 'google'
          },
          timestamp: new Date().toISOString()
        }, window.location.origin);
        
        // Small delay then close popup
        setTimeout(() => {
          console.log('🔄 [POPUP-CALLBACK] Closing popup window');
          window.close();
        }, 2000);
        
      } else {
        console.log('❌ [POPUP-CALLBACK] No parent window found - redirecting to dashboard');
        // Fallback: redirect to dashboard if not in popup context
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error('❌ [POPUP-CALLBACK] Error in popup completion:', error);
      
      // Send error message to parent if possible
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_COMPLETE',
          success: false,
          error: 'Failed to complete popup authentication'
        }, window.location.origin);
      }
      
      // Fallback: redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
    }
  </script>
</body>
</html>`;
        
        return res.send(popupResponseHtml);
      } else {
        // Regular redirect authentication
        console.log('✅ [SESSION-HANDOFF] Same domain redirect to dashboard');
        return res.redirect(303, '/dashboard');
      }
    }
    
  } catch (error: any) {
    console.error('❌ [OAUTH-CALLBACK-CRITICAL] OAuth callback critical error:', {
      errorMessage: error.message,
      errorStack: error.stack,
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      referer: req.get('referer'),
      timestamp: new Date().toISOString(),
      query: req.query
    });
    
    // Categorize critical errors
    let userMessage = 'Authentication failed due to an unexpected error. Please try again.';
    if (error.message?.includes('database') || error.message?.includes('storage')) {
      userMessage = 'Unable to save your authentication. Please try again.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      userMessage = 'Network error during authentication. Please check your connection and try again.';
    } else if (error.message?.includes('Google OAuth')) {
      userMessage = 'Google authentication service error. Please try again later.';
    }
    
    res.redirect(`/auth?error=callback_error&message=${encodeURIComponent(userMessage)}&canRetry=true&errorCode=OAUTH_CALLBACK_ERROR`);
  }
}

/**
 * Accept session from cross-domain handoff - validates exchange code and sets session cookie
 */
export async function acceptSessionRoute(req: Request, res: Response) {
  try {
    console.log('🔄 [SESSION-ACCEPT] Processing session acceptance');
    
    // Set cache control headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'session-accept',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Auth-Host': req.get('host') || 'unknown'
    });
    
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      console.error('❌ [SESSION-ACCEPT] Missing or invalid exchange code');
      return res.redirect('/auth?error=invalid_exchange_code&message=Authentication%20session%20code%20invalid.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // Look up session exchange data
    const exchangeData = sessionExchangeStore.get(code);
    
    if (!exchangeData) {
      console.error('❌ [SESSION-ACCEPT] Exchange code not found or already used:', {
        codeProvided: code.substring(0, 10) + '...',
        storeSize: sessionExchangeStore.size,
        allCodes: Array.from(sessionExchangeStore.keys()).map(k => k.substring(0, 10) + '...')
      });
      return res.redirect('/auth?error=exchange_code_not_found&message=Authentication%20session%20not%20found%20or%20already%20used.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // Check exchange code age (max 5 minutes)
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (exchangeData.timestamp < fiveMinutesAgo) {
      console.error('❌ [SESSION-ACCEPT] Exchange code expired:', {
        codeAge: Math.floor((Date.now() - exchangeData.timestamp) / 1000) + ' seconds',
        maxAge: '300 seconds (5 minutes)'
      });
      sessionExchangeStore.delete(code);
      return res.redirect('/auth?error=exchange_code_expired&message=Authentication%20session%20expired.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // Validate that we're on the correct return host
    const currentHost = req.get('host') || '';
    if (exchangeData.returnHost !== currentHost) {
      console.error('❌ [SESSION-ACCEPT] Host mismatch:', {
        expectedHost: exchangeData.returnHost,
        actualHost: currentHost
      });
      return res.redirect('/auth?error=host_mismatch&message=Authentication%20domain%20mismatch.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    console.log('✅ [SESSION-ACCEPT] Exchange code valid, setting session cookie');
    
    // Remove used exchange code (single-use)
    sessionExchangeStore.delete(code);
    
    // Set session cookie on the correct domain with cross-domain compatibility
    const isSecure = currentHost.includes('replit.app') || currentHost.includes('replit.dev') || currentHost.includes('brandentifier.com');
    
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as const, // Use 'lax' for better compatibility - fixed for Replit domains
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };
    
    console.log('🍪 [SESSION-ACCEPT] Setting session cookie:', {
      domain: (cookieOptions as any).domain || 'omitted',
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      host: currentHost
    });
    
    res.cookie('brandentifier_session', exchangeData.sessionToken, cookieOptions);
    
    console.log('✅ [SESSION-ACCEPT] Session handoff completed successfully');
    console.log('✅ [SESSION-ACCEPT] User ID:', exchangeData.userId);
    console.log('✅ [SESSION-ACCEPT] Redirecting to dashboard');
    
    // Redirect to dashboard on the correct domain
    return res.redirect(303, '/dashboard');
    
  } catch (error: any) {
    console.error('❌ [SESSION-ACCEPT-ERROR] Session acceptance critical error:', {
      errorMessage: error.message,
      errorStack: error.stack,
      host: req.get('host'),
      userAgent: req.get('user-agent'),
      timestamp: new Date().toISOString(),
      query: req.query
    });
    
    let userMessage = 'Failed to complete authentication session. Please try signing in again.';
    if (error.message?.includes('cookie')) {
      userMessage = 'Unable to set authentication cookie. Please enable cookies and try again.';
    } else if (error.message?.includes('domain')) {
      userMessage = 'Authentication domain error. Please try signing in again.';
    }
    
    res.redirect(`/auth?error=session_accept_error&message=${encodeURIComponent(userMessage)}&canRetry=true&errorCode=SESSION_ACCEPT_ERROR`);
  }
}

/**
 * Check current session validity - for client-side auth state detection
 */
export async function checkSessionRoute(req: Request, res: Response) {
  try {
    console.log('🔍 Checking session validity');
    
    // Set cache control headers for session endpoint
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    // Enhanced debug logging for session validation
    const requestHost = req.get('host');
    const sessionCookie = req.cookies?.brandentifier_session;
    const allCookies = req.cookies || {};
    const cookieHeader = req.get('cookie');
    
    console.log('🍪 [SESSION-DEBUG] Enhanced session validation debug:', {
      host: requestHost,
      timestamp: new Date().toISOString(),
      // Cookie analysis
      cookiePresent: !!sessionCookie,
      cookieStart: sessionCookie ? sessionCookie.substring(0, 10) + '...' : 'none',
      cookieLength: sessionCookie ? sessionCookie.length : 0,
      allCookiesCount: Object.keys(allCookies).length,
      cookieNames: Object.keys(allCookies),
      rawCookieHeader: cookieHeader ? cookieHeader.substring(0, 100) + '...' : 'none',
      // Request context
      userAgent: req.get('user-agent')?.substring(0, 50) || 'none',
      origin: req.get('origin') || 'none',
      referer: req.get('referer') || 'none',
      // Security headers
      secFetchSite: req.get('sec-fetch-site') || 'none',
      secFetchMode: req.get('sec-fetch-mode') || 'none',
      // Cross-domain analysis
      isDevelopment: requestHost?.includes('localhost') || requestHost?.includes('127.0.0.1'),
      isReplitDomain: REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(requestHost || '')),
      isBrandentifierCom: requestHost?.includes('brandentifier.com')
    });
    
    // Check if JWT session cookie exists
    const sessionToken = req.cookies?.brandentifier_session;
    
    if (!sessionToken) {
      console.log('❌ [SESSION-DEBUG] No session cookie found - detailed analysis:', {
        cookiePresent: !!sessionCookie,
        cookieType: typeof sessionCookie,
        allCookiesPresent: Object.keys(allCookies).length > 0,
        cookieHeaderPresent: !!cookieHeader,
        possibleCookieIssues: [
          !cookieHeader ? 'No cookie header in request' : null,
          cookieHeader && !sessionCookie ? 'Cookie header present but session cookie missing' : null,
          sessionCookie && typeof sessionCookie !== 'string' ? 'Session cookie wrong type' : null
        ].filter(Boolean),
        suggestedFixes: [
          'Check if cookies are enabled in browser',
          'Verify cookie domain settings',
          'Check if sameSite policy is blocking cookies',
          'Ensure HTTPS is used for secure cookies'
        ]
      });
      
      return res.status(401).json({ 
        success: false, 
        error: 'No session found',
        debug: {
          cookieAnalysis: {
            present: !!sessionCookie,
            type: typeof sessionCookie,
            allCookiesCount: Object.keys(allCookies).length
          },
          suggestions: [
            'Clear browser cookies and try signing in again',
            'Enable cookies in your browser settings',
            'Try signing in from a different browser or incognito mode'
          ]
        }
      });
    }
    
    // Verify JWT token
    try {
      const decoded = jwt.verify(sessionToken, JWT_SECRET) as any;
      console.log('✅ Valid session found for user:', decoded.email);
      console.log('🔍 [SESSION-CHECK] Token payload:', {
        userId: decoded.userId,
        email: decoded.email,
        authProvider: decoded.authProvider
      });
      
      // Get fresh user data from database - try multiple lookup methods
      let user;
      
      // If we have userId in token, try that first (most reliable)
      if (decoded.userId) {
        console.log('🔍 [SESSION-CHECK] Looking up user by ID:', decoded.userId);
        user = await storage.getUser(decoded.userId);
      }
      
      // Fallback to email lookup if no user found by ID
      if (!user) {
        console.log('🔍 [SESSION-CHECK] Fallback: Looking up user by email:', decoded.email);
        user = await storage.getUserByEmail(decoded.email);
      }
      
      if (!user) {
        console.log('❌ [SESSION-CHECK] User not found in database with ID or email');
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }
      
      console.log('✅ [SESSION-CHECK] Found user:', {
        id: user.id,
        email: user.email,
        name: user.name,
        authProvider: user.authProvider || 'unknown'
      });
      
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
      
      console.log('✅ Session valid, returning user data');
      return res.json({
        success: true,
        user: clientUser
      });
      
    } catch (jwtError) {
      console.log('❌ Invalid or expired JWT token:', jwtError);
      return res.status(401).json({
        success: false,
        error: 'Invalid session token'
      });
    }
    
  } catch (error: any) {
    console.error('❌ Session check error:', error);
    res.status(500).json({
      success: false,
      error: 'Session check failed'
    });
  }
}

// INVESTIGATION: Debug endpoint to analyze CSP and iframe context differences
export async function debugContextRoute(req: Request, res: Response) {
  console.log('🔍 [CONTEXT-DEBUG] Debug endpoint called for investigation');
  
  // Capture all headers and context information
  const contextAnalysis = {
    timestamp: new Date().toISOString(),
    host: req.get('host'),
    origin: req.get('origin'),
    referer: req.get('referer'),
    userAgent: req.get('user-agent')?.substring(0, 100) + '...',
    headers: {
      'x-forwarded-proto': req.get('x-forwarded-proto'),
      'x-forwarded-host': req.get('x-forwarded-host'),
      'x-frame-options': req.get('x-frame-options'),
      'content-security-policy': req.get('content-security-policy'),
      'sec-fetch-site': req.get('sec-fetch-site'),
      'sec-fetch-mode': req.get('sec-fetch-mode'),
      'sec-fetch-dest': req.get('sec-fetch-dest'),
      'sec-fetch-user': req.get('sec-fetch-user')
    },
    context: {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      isSecure: req.secure || req.get('x-forwarded-proto') === 'https'
    },
    // Detect iframe context
    iframeDetection: {
      isIframeContext: req.get('sec-fetch-dest') === 'iframe' || 
                      req.get('sec-fetch-site') === 'cross-site' ||
                      req.get('referer')?.includes('preview'),
      secFetchDest: req.get('sec-fetch-dest'),
      secFetchSite: req.get('sec-fetch-site'),
      hasRefererPreview: req.get('referer')?.includes('preview') || false
    },
    // STANDARDIZED OAuth URI analysis
    uriAnalysis: (() => {
      const host = req.get('host') || 'unknown';
      const { redirectUri, returnHost } = getStandardizedRedirectUri(host);
      
      return {
        host,
        generatedRedirectUri: redirectUri,
        returnHost,
        isInWhitelist: ALLOWED_REDIRECT_URIS.includes(redirectUri),
        isStandardized: true,
        isDevelopment: host.includes('localhost') || host.includes('127.0.0.1'),
        isBrandentifierCom: host.includes('brandentifier.com'),
        isReplitDomain: REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host))
      };
    })()
  };
  
  console.log('📊 [CONTEXT-DEBUG] Complete context analysis:', JSON.stringify(contextAnalysis, null, 2));
  
  res.json({
    success: true,
    message: 'Context analysis completed - check server logs for details',
    contextAnalysis
  });
}
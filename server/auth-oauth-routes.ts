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
// SECURITY: JWT_SECRET must be consistent across all instances for cross-instance state validation
const JWT_SECRET_RAW = process.env.JWT_SECRET;
if (!JWT_SECRET_RAW) {
  throw new Error('JWT_SECRET environment variable is required for secure cross-instance OAuth state validation. Set this to the same value across all server instances.');
}
const JWT_SECRET: string = JWT_SECRET_RAW; // TypeScript assertion - guaranteed to be defined after check

// DOMAIN-SPECIFIC: Allowed redirect URI patterns (must be registered in Google Cloud Console)
// Updated strategy: Authenticate on the same domain where user starts to avoid cross-domain issues
const ALLOWED_REDIRECT_URI_PATTERNS = [
  // Production domains
  'https://brandentifier.com/api/auth/google/callback',
  'https://www.brandentifier.com/api/auth/google/callback',
  
  // Replit published domains
  'https://brandentifier.replit.app/api/auth/google/callback',
  
  // Development domains
  'http://localhost:5000/api/auth/google/callback',
  'http://127.0.0.1:5000/api/auth/google/callback',
  
  // Replit preview domain patterns (requires wildcard registration in Google Cloud Console)
  // Pattern: https://*.picard.replit.dev/api/auth/google/callback
  // Pattern: https://*.replit.dev/api/auth/google/callback
];

// DOMAIN-SPECIFIC: Replit domain patterns for same-domain authentication
// REMOVED: Domain patterns (no longer needed with stable redirect URI approach)
// All Replit environments now use the stable callback: brandentifier.replit.app

/**
 * STABLE REDIRECT URI SELECTION
 * 
 * Google OAuth requires exact redirect URI matches - wildcards are NOT supported.
 * This function uses a single stable registered redirect URI for iframe compatibility.
 * 
 * Strategy: Use stable callback for popup authentication, return to original host
 */
function getDomainSpecificRedirectUri(host: string): { redirectUri: string; returnHost: string } {
  const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
  
  let redirectUri: string;
  const returnHost = host; // Track original host for post-auth return
  
  if (isDevelopment) {
    // Development: Use localhost callback (same domain)
    redirectUri = `http://${host}/api/auth/google/callback`;
  } else {
    // All production and preview environments: Use stable registered callback
    // This MUST be exactly registered in Google Cloud Console
    redirectUri = 'https://brandentifier.replit.app/api/auth/google/callback';
  }
  
  console.log('🔗 [STABLE-REDIRECT] Using stable redirect URI strategy:', {
    originalHost: host,
    stableRedirectUri: redirectUri,
    returnHost: returnHost,
    isDevelopment
  });
  
  return { redirectUri, returnHost };
}

/**
 * SECURITY: Validate redirect URI against exact allowed URIs
 * 
 * Google OAuth requires exact matches - no wildcards supported.
 * This prevents redirect_uri_mismatch errors and open redirect attacks.
 */
function validateRedirectUri(redirectUri: string): boolean {
  const ALLOWED_EXACT_URIS = [
    // Production domains
    'https://brandentifier.com/api/auth/google/callback',
    'https://www.brandentifier.com/api/auth/google/callback',
    
    // Replit stable callback (used for all preview environments)
    'https://brandentifier.replit.app/api/auth/google/callback',
    
    // Development domains
    'http://localhost:5000/api/auth/google/callback',
    'http://127.0.0.1:5000/api/auth/google/callback'
  ];
  
  const isValid = ALLOWED_EXACT_URIS.includes(redirectUri);
  
  if (!isValid) {
    console.log('⚠️ [SECURITY] Invalid redirect URI detected:', {
      providedUri: redirectUri,
      allowedExactUris: ALLOWED_EXACT_URIS
    });
  }
  
  return isValid;
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
    exp: Math.floor(Date.now() / 1000) + (20 * 60), // 20 minutes expiry (increased for better cross-domain handoff)
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
      maxAge: '20m' // Additional expiry check (increased for better cross-domain handoff)
    });
    return decoded;
  } catch (error: any) {
    console.error('❌ [STATE-VALIDATION] JWT state validation failed:', error.message);
    throw new Error('Invalid or expired authentication state');
  }
}

// In-memory state storage (in production, use Redis or database)
const stateStore = new Map<string, { timestamp: number, ip: string }>();

// Cross-domain session exchange for stable redirect URI approach
interface SessionExchangeData {
  sessionToken: string;
  timestamp: number;
  returnHost: string;
  userId: number;
}

const sessionExchangeStore = new Map<string, SessionExchangeData>();

// Clean up expired states and session exchange codes every 10 minutes
setInterval(() => {
  const twentyMinutesAgo = Date.now() - 20 * 60 * 1000;
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  
  // Clean up expired OAuth states (20 minutes)
  let deletedStateCount = 0;
  for (const [state, data] of Array.from(stateStore.entries())) {
    if (data.timestamp < twentyMinutesAgo) {
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
    if (data.timestamp < tenMinutesAgo) {
      sessionExchangeStore.delete(code);
      deletedExchangeCount++;
    }
  }
  if (deletedExchangeCount > 0) {
    console.log(`🧹 [EXCHANGE-CLEANUP] Removed ${deletedExchangeCount} expired session exchange codes`);
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
    
    // DOMAIN-SPECIFIC: Use same-domain authentication to eliminate cross-domain issues
    const host = req.get('Host') || '';
    const { redirectUri, returnHost } = getDomainSpecificRedirectUri(host);
    
    console.log('🌐 [OAUTH-URL] Stable redirect analysis:', {
      host,
      redirectUri,
      returnHost,
      isStableRedirect: redirectUri === 'https://brandentifier.replit.app/api/auth/google/callback'
    });
    
    console.log('✅ [OAUTH-URL] Domain-specific redirect URI selected:', redirectUri);
    
    // Validation: Ensure URI matches allowed patterns
    if (!validateRedirectUri(redirectUri)) {
      console.error('🚨 [OAUTH-URL] CRITICAL: Generated URI not valid!', {
        generatedUri: redirectUri,
        host: host
      });
      throw new Error('Invalid redirect URI generated - not matching allowed patterns');
    }
    
    console.log('✅ [URI-DEBUG] Domain-specific validation passed');
    console.log('🔍 [URI-DEBUG] DOMAIN-SPECIFIC URI ANALYSIS:');
    console.log('📍 Original Host:', host);
    console.log('🎯 Domain-Specific Redirect URI:', redirectUri);
    console.log('🔗 Return Host (same domain):', returnHost);
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
    console.log('📝 Domain-Specific Check:', {
      'isValidUri': validateRedirectUri(redirectUri),
      'sameDomainAuth': host === returnHost
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
    
    console.log('✅ [SECURITY] Stateless JWT state created for same-domain authentication');
    
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
  const startTime = Date.now();
  const callbackId = crypto.randomBytes(8).toString('hex');
  
  try {
    console.log(`🔄 [OAUTH-CALLBACK-${callbackId}] ========== STARTING GOOGLE OAUTH CALLBACK ==========`);
    console.log(`🔄 [OAUTH-CALLBACK-${callbackId}] Timestamp: ${new Date().toISOString()}`);
    console.log(`🔄 [OAUTH-CALLBACK-${callbackId}] Request details:`, {
      method: req.method,
      url: req.url,
      fullUrl: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
      host: req.get('host'),
      userAgent: req.get('user-agent')?.substring(0, 100) + '...',
      referer: req.get('referer'),
      origin: req.get('origin'),
      remoteAddress: req.ip || req.connection.remoteAddress
    });
    console.log(`🔄 [OAUTH-CALLBACK-${callbackId}] Query parameters:`, req.query);
    console.log(`🔄 [OAUTH-CALLBACK-${callbackId}] Request headers (filtered):`, {
      host: req.get('host'),
      'user-agent': req.get('user-agent'),
      referer: req.get('referer'),
      origin: req.get('origin'),
      'accept-language': req.get('accept-language'),
      'x-forwarded-for': req.get('x-forwarded-for'),
      'x-forwarded-proto': req.get('x-forwarded-proto'),
      'x-real-ip': req.get('x-real-ip')
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
    console.log(`🔍 [OAUTH-CALLBACK-${callbackId}] Extracted query parameters:`, {
      hasCode: !!code,
      hasState: !!state,
      hasError: !!error,
      codePrefix: code ? (code as string).substring(0, 20) + '...' : null,
      statePrefix: state ? (state as string).substring(0, 20) + '...' : null,
      error: error
    });
    
    // Handle OAuth errors with detailed logging
    if (error) {
      console.error(`❌ [OAUTH-CALLBACK-${callbackId}] Google OAuth error detected:`, {
        error: error,
        errorType: typeof error,
        host: req.get('host'),
        referer: req.get('referer'),
        userAgent: req.get('user-agent')?.substring(0, 100),
        timestamp: new Date().toISOString(),
        callbackDuration: Date.now() - startTime
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
      console.error(`❌ [OAUTH-CALLBACK-${callbackId}] Missing authorization code or state:`, {
        hasCode: !!code,
        hasState: !!state,
        codeType: typeof code,
        stateType: typeof state,
        allQueryParams: Object.keys(req.query),
        query: req.query,
        host: req.get('host'),
        timestamp: new Date().toISOString(),
        callbackDuration: Date.now() - startTime
      });
      return res.redirect('/auth?error=missing_params&message=Authentication%20response%20incomplete.%20Please%20try%20signing%20in%20again.&canRetry=true');
    }
    
    // SECURITY: Validate stateless JWT state (works across all server instances) with retry logic
    let stateData;
    try {
      console.log(`🔐 [OAUTH-CALLBACK-${callbackId}] Starting JWT state validation...`);
      stateData = validateStatelessState(state as string);
      console.log(`✅ [OAUTH-CALLBACK-${callbackId}] JWT state validation successful:`, {
        initiatingHost: stateData.initiatingHost,
        returnHost: stateData.returnHost,
        isPopup: stateData.isPopup,
        jti: stateData.jti,
        currentHost: req.get('host'),
        tokenAge: Math.floor(Date.now() / 1000) - stateData.iat,
        timeToExpiry: stateData.exp - Math.floor(Date.now() / 1000),
        issueTime: new Date(stateData.iat * 1000).toISOString(),
        expiryTime: new Date(stateData.exp * 1000).toISOString()
      });
    } catch (error: any) {
      console.error(`❌ [OAUTH-CALLBACK-${callbackId}] JWT state validation failed:`, {
        error: error.message,
        errorType: error.name,
        errorStack: error.stack,
        providedState: typeof state,
        stateLength: typeof state === 'string' ? (state as string).length : 0,
        statePrefix: typeof state === 'string' ? (state as string).substring(0, 50) + '...' : null,
        currentHost: req.get('host'),
        currentTime: Math.floor(Date.now() / 1000),
        userAgent: req.get('user-agent')?.substring(0, 100),
        callbackDuration: Date.now() - startTime
      });
      
      // Enhanced error categorization with retry guidance
      if (error.message.includes('expired') || error.name === 'TokenExpiredError') {
        console.log('⏰ [AUTH-RECOVERY] JWT token expired - suggesting immediate retry');
        return res.redirect('/auth?error=expired_state&message=Authentication%20session%20expired.%20Please%20try%20signing%20in%20again.&canRetry=true&retryHint=immediate');
      } else if (error.message.includes('signature') || error.name === 'JsonWebTokenError') {
        console.log('🔐 [AUTH-RECOVERY] JWT signature invalid - may be cross-instance issue');
        return res.redirect('/auth?error=invalid_state&message=Authentication%20session%20invalid.%20Please%20try%20signing%20in%20again.&canRetry=true&retryHint=newSession');
      } else {
        console.log('❓ [AUTH-RECOVERY] Unknown JWT validation error - suggesting new session');
        return res.redirect('/auth?error=invalid_state&message=Authentication%20session%20invalid.%20Please%20try%20signing%20in%20again.&canRetry=true&retryHint=newSession');
      }
    }
    // JWT validation already handled expiry, state is guaranteed valid at this point
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    // SECURITY: Use validated returnHost from JWT state and generate redirect URI for token exchange
    const host = req.get('Host') || '';
    const { redirectUri } = getDomainSpecificRedirectUri(host);
    const returnHost = stateData.returnHost; // Direct use since same-domain authentication eliminates cross-domain security concerns
    
    console.log('🌐 [OAUTH-CALLBACK] Secure callback analysis:', {
      callbackHost: host,
      redirectUri,
      returnHost: returnHost,
      stateInitiatingHost: stateData.initiatingHost,
      isValidUri: validateRedirectUri(redirectUri),
      matchedPattern: REPLIT_DOMAIN_PATTERNS.find(pattern => pattern.test(host))?.toString()
    });
    
    // Validation: Ensure URI consistency
    if (!validateRedirectUri(redirectUri)) {
      console.error('🚨 [OAUTH-CALLBACK] CRITICAL: Generated URI not valid!', {
        generatedUri: redirectUri,
        host: host
      });
      throw new Error('Invalid redirect URI generated for token exchange - not matching allowed patterns');
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
      'isValidUri': validateRedirectUri(redirectUri),
      'validUriPatterns': 'Check validateRedirectUri function'
    });
    
    // ERROR HANDLING: Add token exchange error prediction
    if (!validateRedirectUri(redirectUri)) {
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
    
    // CROSS-DOMAIN ANALYSIS: Check if session handoff is needed
    const currentHost = req.get('host') || 'localhost:5000';
    const needsCrossDomainHandoff = finalReturnHost !== currentHost;
    
    console.log('🔍 [SESSION-HANDOFF] Domain analysis:', {
      currentHost,
      returnHost: finalReturnHost,
      needsCrossDomainHandoff,
      authFlowType: needsCrossDomainHandoff ? 'cross-domain' : 'same-domain'
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
      
      console.log('🔄 [SESSION-HANDOFF] Stored session exchange:', {
        codePrefix: exchangeCode.substring(0, 10) + '...',
        returnHost: finalReturnHost,
        userId: user.id,
        storeSize: sessionExchangeStore.size
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
        
        // Send success message to parent window with cross-domain support
        const successMessage = {
          type: 'GOOGLE_AUTH_COMPLETE',
          success: true,
          user: {
            id: ${user.id},
            email: '${user.email}',
            name: '${user.name?.replace(/'/g, "\\'") || ""}',
            authProvider: 'google'
          },
          timestamp: new Date().toISOString(),
          crossDomain: ${needsCrossDomainHandoff},
          returnHost: '${finalReturnHost}',
          sessionExchangeCode: null
        };
        
        // For cross-domain scenarios, include session exchange info
        if (${needsCrossDomainHandoff}) {
          // Generate session exchange code for cross-domain handoff
          const popupExchangeCode = crypto.randomBytes(32).toString('base64url');
          
          // Store session exchange data on server (same as redirect flow)
          sessionExchangeStore.set(popupExchangeCode, {
            sessionToken: ${JSON.stringify(sessionToken)},
            timestamp: Date.now(),
            returnHost: '${finalReturnHost}',
            userId: ${user.id}
          });
          
          console.log('🔄 [POPUP-CALLBACK] Stored session exchange for cross-domain handoff:', {
            codePrefix: popupExchangeCode.substring(0, 10) + '...',
            returnHost: '${finalReturnHost}',
            userId: ${user.id}
          });
          
          // SECURITY: Only send the exchange code - client will construct URL locally
          successMessage.sessionExchangeCode = popupExchangeCode;
        }
        
        // Try multiple target origins for cross-domain compatibility
        const targetOrigins = [
          '${finalReturnHost.includes('localhost') ? `http://${finalReturnHost}` : `https://${finalReturnHost}`}',
          window.location.origin,
          '*' // Last resort for iframe contexts
        ];
        
        targetOrigins.forEach(origin => {
          try {
            window.opener.postMessage(successMessage, origin);
            console.log('📤 [POPUP-CALLBACK] Message sent to origin:', origin);
          } catch (e) {
            console.log('❌ [POPUP-CALLBACK] Failed to send to origin:', origin, e.message);
          }
        });
        
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
      
      // Send error message to parent with cross-domain support
      if (window.opener && !window.opener.closed) {
        const errorMessage = {
          type: 'GOOGLE_AUTH_COMPLETE',
          success: false,
          error: 'Failed to complete popup authentication',
          crossDomain: ${needsCrossDomainHandoff}
        };
        
        // Try multiple target origins
        const targetOrigins = [
          '${finalReturnHost.includes('localhost') ? `http://${finalReturnHost}` : `https://${finalReturnHost}`}',
          window.location.origin,
          '*'
        ];
        
        targetOrigins.forEach(origin => {
          try {
            window.opener.postMessage(errorMessage, origin);
          } catch (e) {
            console.log('❌ [POPUP-ERROR] Failed to send error to origin:', origin);
          }
        });
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
 * Store session exchange data for popup-based cross-domain handoff
 */
export async function storeSessionExchangeRoute(req: Request, res: Response) {
  try {
    console.log('🔄 [STORE-SESSION-EXCHANGE] Processing session exchange storage request');
    
    const { exchangeCode, sessionToken, returnHost, userId } = req.body;
    
    if (!exchangeCode || !sessionToken || !returnHost || !userId) {
      console.error('❌ [STORE-SESSION-EXCHANGE] Missing required data:', {
        hasExchangeCode: !!exchangeCode,
        hasSessionToken: !!sessionToken,
        hasReturnHost: !!returnHost,
        hasUserId: !!userId
      });
      return res.status(400).json({ error: 'Missing required session exchange data' });
    }
    
    // Store session exchange data (expires in 5 minutes, single-use)
    sessionExchangeStore.set(exchangeCode, {
      sessionToken,
      timestamp: Date.now(),
      returnHost,
      userId
    });
    
    console.log('✅ [STORE-SESSION-EXCHANGE] Session exchange stored:', {
      codePrefix: exchangeCode.substring(0, 10) + '...',
      returnHost,
      userId,
      storeSize: sessionExchangeStore.size
    });
    
    res.json({ success: true });
    
  } catch (error: any) {
    console.error('❌ [STORE-SESSION-EXCHANGE-ERROR] Failed to store session exchange:', {
      errorMessage: error.message,
      errorStack: error.stack
    });
    res.status(500).json({ error: 'Failed to store session exchange data' });
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
    
    // Set session cookie on the correct domain
    const isSecure = currentHost.includes('replit.app') || currentHost.includes('replit.dev') || currentHost.includes('brandentifier.com');
    
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'lax' as const,
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
      const { redirectUri, returnHost } = getDomainSpecificRedirectUri(host);
      
      return {
        host,
        generatedRedirectUri: redirectUri,
        returnHost,
        isValidUri: validateRedirectUri(redirectUri),
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
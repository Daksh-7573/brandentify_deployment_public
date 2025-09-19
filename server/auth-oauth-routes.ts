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
import { generateCSRFToken, getCSRFSecret } from './middleware/csrf-protection';

// Google OAuth URLs
const GOOGLE_OAUTH_BASE_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Enhanced OAuth credential management with environment-specific validation
interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  environment: 'development' | 'production';
  valid: boolean;
  errors: string[];
}

/**
 * Validate Google OAuth credential format and requirements
 */
function validateOAuthCredentials(clientId?: string, clientSecret?: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Client ID validation
  if (!clientId) {
    errors.push('GOOGLE_CLIENT_ID is required but not found in environment variables');
  } else if (!clientId.endsWith('.apps.googleusercontent.com')) {
    errors.push('GOOGLE_CLIENT_ID must end with .apps.googleusercontent.com');
  } else if (clientId.length < 50) {
    errors.push('GOOGLE_CLIENT_ID appears to be too short (should be ~72 characters)');
  }
  
  // Client Secret validation
  if (!clientSecret) {
    errors.push('GOOGLE_CLIENT_SECRET is required but not found in environment variables');
  } else if (clientSecret.length < 20) {
    errors.push('GOOGLE_CLIENT_SECRET appears to be too short (should be ~24+ characters)');
  }
  
  return { valid: errors.length === 0, errors };
}

/**
 * Determine environment and get appropriate OAuth credentials
 */
function getOAuthCredentials(): OAuthCredentials {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const environment = nodeEnv === 'production' ? 'production' : 'development';
  
  // Support environment-specific credentials for credential rotation
  const envPrefix = environment === 'production' ? 'PROD_' : 'DEV_';
  
  // Try environment-specific credentials first, then fall back to general ones
  const clientId = process.env[`${envPrefix}GOOGLE_CLIENT_ID`] || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env[`${envPrefix}GOOGLE_CLIENT_SECRET`] || process.env.GOOGLE_CLIENT_SECRET;
  
  const validation = validateOAuthCredentials(clientId, clientSecret);
  
  console.log(`🔐 [OAUTH-CREDENTIALS] Environment: ${environment}`);
  console.log(`🔐 [OAUTH-CREDENTIALS] Using credentials: ${envPrefix ? envPrefix + 'GOOGLE_CLIENT_*' : 'GOOGLE_CLIENT_*'}`);
  console.log(`🔐 [OAUTH-CREDENTIALS] Validation: ${validation.valid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (!validation.valid) {
    console.error('❌ [OAUTH-CREDENTIALS] Validation errors:', validation.errors);
  }
  
  return {
    clientId: clientId || '',
    clientSecret: clientSecret || '',
    environment,
    valid: validation.valid,
    errors: validation.errors
  };
}

// Get and validate OAuth credentials
const oauthCredentials = getOAuthCredentials();
const CLIENT_ID = oauthCredentials.clientId;
const CLIENT_SECRET = oauthCredentials.clientSecret;

// SECURITY FIX: Secure JWT secret management
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');

// CSRF secret is now managed centrally in middleware/csrf-protection.ts
// Use getCSRFSecret() function to access the centralized CSRF secret

// Log credential validation status
if (!oauthCredentials.valid) {
  console.error('❌ [OAUTH-INIT] OAuth credentials validation failed:');
  oauthCredentials.errors.forEach(error => console.error(`   - ${error}`));
}

// Enhanced redirect URI whitelist with comprehensive Replit domain support
// Covers all current and future Replit environments and domain patterns
const STATIC_ALLOWED_REDIRECT_URIS = [
  // Production domains
  'https://brandentifier.com/api/auth/google/callback',
  'https://www.brandentifier.com/api/auth/google/callback',
  
  // Primary Replit published domain
  'https://brandentifier.replit.app/api/auth/google/callback',
  
  // Development environments
  'http://localhost:5000/api/auth/google/callback',
  'http://localhost:3000/api/auth/google/callback',
  'http://127.0.0.1:5000/api/auth/google/callback',
  'http://127.0.0.1:3000/api/auth/google/callback',
  
  // Common Replit development patterns
  'https://replit.com/api/auth/google/callback',
  'https://replit.dev/api/auth/google/callback'
];

// Generate comprehensive Replit domain patterns for current and future support
function generateDynamicRedirectUris(): string[] {
  const dynamicUris: string[] = [];
  
  // Add common Replit app patterns that might be used
  const commonReplitPatterns = [
    'brandentifier-v2', 'brandentifier-staging', 'brandentifier-test',
    'brandentifier-demo', 'brandentifier-beta', 'brandentifier-prod'
  ];
  
  commonReplitPatterns.forEach(pattern => {
    dynamicUris.push(`https://${pattern}.replit.app/api/auth/google/callback`);
  });
  
  return dynamicUris;
}

// Combined allowed redirect URIs
const ALLOWED_REDIRECT_URIS = [
  ...STATIC_ALLOWED_REDIRECT_URIS,
  ...generateDynamicRedirectUris()
];

console.log(`🔗 [REDIRECT-URIS] Total allowed redirect URIs: ${ALLOWED_REDIRECT_URIS.length}`);
console.log(`🔗 [REDIRECT-URIS] Static URIs: ${STATIC_ALLOWED_REDIRECT_URIS.length}, Dynamic URIs: ${generateDynamicRedirectUris().length}`);

// Comprehensive Replit domain pattern matching for all environments
const REPLIT_DOMAIN_PATTERNS = [
  // Published app domains
  /^[a-zA-Z0-9-]+\.replit\.app$/,                    // Published domains like brandentifier.replit.app
  /^[a-zA-Z0-9-]+\.replit\.com$/,                    // Legacy replit.com domains
  
  // Preview and development domains
  /^[a-zA-Z0-9-]+\.replit\.dev$/,                    // Preview domains like simple.replit.dev
  /^[a-zA-Z0-9-]+\.repl\.co$/,                       // Legacy repl.co domains
  
  // Picard development environments (all variations)
  /^[a-f0-9-]+\.picard\.replit\.dev$/,               // Basic picard pattern
  /^[a-f0-9-]+-[a-f0-9-]+-[a-zA-Z0-9-]+\.picard\.replit\.dev$/, // Full picard pattern
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-\w+-\w+\.picard\.replit\.dev$/, // UUID-based picard
  
  // Workspace and team domains
  /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.replit\.app$/,      // Team workspace domains
  /^[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+\.replit\.dev$/,      // Team development domains
  
  // Additional Replit infrastructure patterns
  /^[a-zA-Z0-9-]+\.replitusercontent\.com$/,         // User content domains
  /^[a-zA-Z0-9-]+\.replit-cdn\.com$/,                // CDN domains
  
  // Future-proofing for new Replit domain patterns
  /^[a-zA-Z0-9-]+\.replit\.[a-z]{2,4}$/,              // Generic replit TLD pattern
  /^[a-zA-Z0-9-]+\.repl\.[a-z]{2,4}$/                 // Generic repl TLD pattern
];

/**
 * Check if a domain matches any Replit pattern
 */
function isReplitDomain(domain: string): boolean {
  return REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(domain));
}

/**
 * Enhanced domain classification for better environment detection
 */
function classifyDomain(domain: string): {
  type: 'development' | 'production' | 'replit-published' | 'replit-preview' | 'unknown';
  isReplit: boolean;
  isTrusted: boolean;
} {
  const isDevelopment = domain.includes('localhost') || domain.includes('127.0.0.1');
  const isReplitApp = domain.endsWith('.replit.app');
  const isPicardDev = domain.includes('.picard.replit.dev');
  const isReplitDev = domain.endsWith('.replit.dev');
  const isBrandentifierCom = domain.includes('brandentifier.com');
  const isReplit = isReplitDomain(domain);
  
  let type: 'development' | 'production' | 'replit-published' | 'replit-preview' | 'unknown';
  let isTrusted = false;
  
  if (isDevelopment) {
    type = 'development';
    isTrusted = true;
  } else if (isBrandentifierCom) {
    type = 'production';
    isTrusted = true;
  } else if (isReplitApp) {
    type = 'replit-published';
    isTrusted = true;
  } else if (isPicardDev || isReplitDev) {
    type = 'replit-preview';
    isTrusted = true;
  } else {
    type = 'unknown';
    isTrusted = false;
  }
  
  return { type, isReplit, isTrusted };
}

/**
 * Enhanced redirect URI determination with comprehensive domain support
 * Uses intelligent fallbacks and environment-aware URI selection
 */
function getRedirectUriForHost(host: string): string {
  const domainClassification = classifyDomain(host);
  
  // Construct potential redirect URI based on domain type
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
  const potentialRedirectUri = isLocalhost 
    ? `http://${host}/api/auth/google/callback`
    : `https://${host}/api/auth/google/callback`;
  
  console.log(`🔍 [REDIRECT-URI] Domain analysis:`, {
    host,
    classification: domainClassification,
    potentialUri: potentialRedirectUri
  });
  
  // Check static whitelist first
  if (ALLOWED_REDIRECT_URIS.includes(potentialRedirectUri)) {
    console.log('✅ [REDIRECT-URI] Using whitelisted redirect URI:', potentialRedirectUri);
    return potentialRedirectUri;
  }
  
  // Enhanced environment-specific fallback logic
  switch (domainClassification.type) {
    case 'development':
      const devUri = isLocalhost ? potentialRedirectUri : 'http://localhost:5000/api/auth/google/callback';
      console.log('🔧 [REDIRECT-URI] Development environment, using:', devUri);
      return devUri;
      
    case 'production':
      console.log('🏢 [REDIRECT-URI] Production environment, using brandentifier.com');
      return 'https://brandentifier.com/api/auth/google/callback';
      
    case 'replit-published':
      // For published Replit apps, try to use the specific domain if it looks safe
      if (host.endsWith('.replit.app') && /^[a-zA-Z0-9-]+\.replit\.app$/.test(host)) {
        console.log('📱 [REDIRECT-URI] Published Replit app, using domain-specific URI:', potentialRedirectUri);
        return potentialRedirectUri;
      }
      console.log('📱 [REDIRECT-URI] Published Replit app, using primary fallback');
      return 'https://brandentifier.replit.app/api/auth/google/callback';
      
    case 'replit-preview':
      // For preview environments, always use primary published domain for security
      console.log('🔍 [REDIRECT-URI] Replit preview environment, using primary fallback for security');
      return 'https://brandentifier.replit.app/api/auth/google/callback';
      
    default:
      console.warn('⚠️ [REDIRECT-URI] Unknown domain type, using secure fallback:', host);
      return 'https://brandentifier.replit.app/api/auth/google/callback';
  }
}

// PKCE (Proof Key for Code Exchange) utility functions for OAuth 2.0 security
/**
 * Generate PKCE code_verifier - cryptographically random string
 * Must be 43-128 characters, URL-safe base64url encoded
 */
function generateCodeVerifier(): string {
  // Generate 32 random bytes (256 bits) for maximum security
  const randomBytes = crypto.randomBytes(32);
  // Encode as base64url (URL-safe base64 without padding)
  return randomBytes.toString('base64url');
}

/**
 * Generate PKCE code_challenge from code_verifier using S256 method
 * SHA256 hash of code_verifier, then base64url encoded
 */
function generateCodeChallenge(codeVerifier: string): string {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  // Encode as base64url (URL-safe base64 without padding)
  return hash.digest('base64url');
}

/**
 * Validate PKCE parameters for security compliance
 */
function validatePKCEParameters(codeVerifier: string, codeChallenge: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate code_verifier format and length
  if (!codeVerifier || typeof codeVerifier !== 'string') {
    errors.push('code_verifier must be a non-empty string');
  } else if (codeVerifier.length < 43 || codeVerifier.length > 128) {
    errors.push('code_verifier must be 43-128 characters long');
  } else if (!/^[A-Za-z0-9_-]+$/.test(codeVerifier)) {
    errors.push('code_verifier must be URL-safe base64url encoded');
  }
  
  // Validate code_challenge format
  if (!codeChallenge || typeof codeChallenge !== 'string') {
    errors.push('code_challenge must be a non-empty string');
  } else if (!/^[A-Za-z0-9_-]+$/.test(codeChallenge)) {
    errors.push('code_challenge must be URL-safe base64url encoded');
  }
  
  // Validate code_challenge is correct for code_verifier
  if (codeVerifier && codeChallenge) {
    const expectedChallenge = generateCodeChallenge(codeVerifier);
    if (codeChallenge !== expectedChallenge) {
      errors.push('code_challenge does not match code_verifier using S256 method');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

// Enhanced state storage interface with PKCE support
interface OAuthState {
  timestamp: number;
  ip: string;
  codeVerifier: string; // PKCE code_verifier for security validation
  codeChallenge: string; // PKCE code_challenge for verification
  host: string; // Requesting host for security validation
}

// In-memory state storage with PKCE support (in production, use Redis or database)
const stateStore = new Map<string, OAuthState>();

// Session exchange code storage for cross-domain handoff
interface SessionExchangeData {
  sessionToken: string;
  timestamp: number;
  returnHost: string;
  userId: number;
}

const sessionExchangeStore = new Map<string, SessionExchangeData>();

/**
 * Comprehensive OAuth Configuration Validation at Server Startup
 */
function validateOAuthConfigurationAtStartup(): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: any;
} {
  const startupErrors: string[] = [];
  const startupWarnings: string[] = [];
  
  console.log('🔍 [STARTUP-VALIDATION] Running comprehensive OAuth configuration validation...');
  
  // 1. Credential validation
  if (!oauthCredentials.valid) {
    startupErrors.push('OAuth credentials validation failed');
    oauthCredentials.errors.forEach(error => startupErrors.push(`Credential Error: ${error}`));
  }
  
  // 2. Environment configuration validation
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (nodeEnv === 'production' && !process.env.PROD_GOOGLE_CLIENT_ID && !process.env.GOOGLE_CLIENT_ID) {
    startupWarnings.push('Production environment detected but no production-specific OAuth credentials found');
  }
  
  // 3. JWT Secret validation
  if (!process.env.JWT_SECRET) {
    startupWarnings.push('JWT_SECRET not set - using generated secret (sessions will not persist across restarts)');
  }
  
  // 4. CSRF Secret validation - now managed centrally in middleware
  try {
    getCSRFSecret(); // This will validate and potentially exit if not set in production
    console.log('✅ [CSRF-SECRET] Centralized CSRF secret validation passed');
  } catch (error) {
    startupWarnings.push('CSRF_SECRET validation error - check middleware configuration');
  }
  
  // 5. Redirect URI coverage validation
  const currentHost = process.env.REPLIT_SLUG ? `${process.env.REPLIT_SLUG}.replit.app` : 'localhost:5000';
  const coverageCheck = getRedirectUriForHost(currentHost);
  
  // 6. Domain pattern coverage validation
  const testDomains = [
    'brandentifier.replit.app',
    'test-app.replit.app', 
    'abc123-def456-ghi789.picard.replit.dev',
    'localhost:5000',
    'brandentifier.com'
  ];
  
  const uncoveredDomains = testDomains.filter(domain => {
    const classification = classifyDomain(domain);
    return !classification.isTrusted;
  });
  
  if (uncoveredDomains.length > 0) {
    startupWarnings.push(`Some test domains not properly classified: ${uncoveredDomains.join(', ')}`);
  }
  
  // 7. Scope validation
  const currentScopes = getOAuthScopes(oauthCredentials.environment);
  const scopeValidation = validateOAuthScopes(currentScopes);
  
  if (!scopeValidation.valid) {
    startupErrors.push('OAuth scope validation failed');
    scopeValidation.errors.forEach(error => startupErrors.push(`Scope Error: ${error}`));
  }
  
  startupWarnings.push(...scopeValidation.warnings);
  
  const summary = {
    environment: oauthCredentials.environment,
    credentialsValid: oauthCredentials.valid,
    scopesValid: scopeValidation.valid,
    redirectUriCount: ALLOWED_REDIRECT_URIS.length,
    domainPatternCount: REPLIT_DOMAIN_PATTERNS.length,
    currentHost,
    nodeEnv,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasCsrfSecret: !!getCSRFSecret(),
    hasProductionCredentials: !!(process.env.PROD_GOOGLE_CLIENT_ID || (nodeEnv === 'production' && process.env.GOOGLE_CLIENT_ID))
  };
  
  const overallValid = startupErrors.length === 0;
  
  console.log('📊 [STARTUP-VALIDATION] OAuth Configuration Summary:', summary);
  
  if (overallValid) {
    console.log('✅ [STARTUP-VALIDATION] OAuth configuration validation passed');
  } else {
    console.error('❌ [STARTUP-VALIDATION] OAuth configuration validation failed');
    startupErrors.forEach(error => console.error(`   - ${error}`));
  }
  
  if (startupWarnings.length > 0) {
    console.warn('⚠️ [STARTUP-VALIDATION] OAuth configuration warnings:');
    startupWarnings.forEach(warning => console.warn(`   - ${warning}`));
  }
  
  return {
    valid: overallValid,
    errors: startupErrors,
    warnings: startupWarnings,
    summary
  };
}

// Startup validation will be run after all constants are defined

// Clean up expired states and session exchange codes every 10 minutes
setInterval(() => {
  const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000;
  const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
  const eightMinutesAgo = Date.now() - 8 * 60 * 1000;
  
  // Clean up expired OAuth states (15 minutes) with PKCE support
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
  
  // Clean up expired session exchange codes (10 minutes) with expiration warnings (8 minutes)
  let deletedExchangeCount = 0;
  let warningCount = 0;
  for (const [code, data] of Array.from(sessionExchangeStore.entries())) {
    if (data.timestamp < tenMinutesAgo) {
      sessionExchangeStore.delete(code);
      deletedExchangeCount++;
    } else if (data.timestamp < eightMinutesAgo) {
      console.warn(`⚠️ [EXCHANGE-WARNING] Session exchange code expiring soon: ${code.substring(0, 10)}... (${Math.floor((Date.now() - data.timestamp) / 1000)}s old)`);
      warningCount++;
    }
  }
  if (deletedExchangeCount > 0) {
    console.log(`🧹 [EXCHANGE-CLEANUP] Removed ${deletedExchangeCount} expired session exchange codes`);
  }
  if (warningCount > 0) {
    console.log(`⏰ [EXCHANGE-WARNING] ${warningCount} session exchange codes will expire in 2 minutes`);
  }
}, 10 * 60 * 1000);

// Enhanced OAuth scope configuration and validation
interface OAuthScopeConfig {
  scopes: string[];
  description: string;
  required: boolean;
  purpose: string;
}

const OAUTH_SCOPE_DEFINITIONS: Record<string, OAuthScopeConfig> = {
  'openid': {
    scopes: ['openid'],
    description: 'Required for OpenID Connect authentication',
    required: true,
    purpose: 'Enables secure identity verification'
  },
  'email': {
    scopes: ['email'],
    description: 'Access to user email address',
    required: true,
    purpose: 'User identification and account linking'
  },
  'profile': {
    scopes: ['profile'],
    description: 'Access to basic profile information (name, photo)',
    required: true,
    purpose: 'User profile display and personalization'
  }
};

/**
 * Get optimal OAuth scopes based on environment and requirements
 */
function getOAuthScopes(environment: 'development' | 'production' = 'production'): string {
  // Base required scopes for minimal security footprint
  const requiredScopes = Object.values(OAUTH_SCOPE_DEFINITIONS)
    .filter(config => config.required)
    .flatMap(config => config.scopes);
  
  console.log(`🔒 [OAUTH-SCOPES] Environment: ${environment}`);
  console.log(`🔒 [OAUTH-SCOPES] Required scopes: ${requiredScopes.join(', ')}`);
  
  // Return minimal required scopes for security
  return requiredScopes.join(' ');
}

/**
 * Validate OAuth scope configuration
 */
function validateOAuthScopes(requestedScopes: string): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const scopeArray = requestedScopes.split(' ').filter(s => s.trim());
  
  // Check for required scopes
  const requiredScopes = Object.values(OAUTH_SCOPE_DEFINITIONS)
    .filter(config => config.required)
    .flatMap(config => config.scopes);
  
  for (const requiredScope of requiredScopes) {
    if (!scopeArray.includes(requiredScope)) {
      errors.push(`Missing required OAuth scope: ${requiredScope}`);
    }
  }
  
  // Check for unknown scopes
  const knownScopes = Object.values(OAUTH_SCOPE_DEFINITIONS).flatMap(config => config.scopes);
  for (const scope of scopeArray) {
    if (!knownScopes.includes(scope)) {
      warnings.push(`Unknown OAuth scope: ${scope} (may be valid but not documented)`);
    }
  }
  
  // Security recommendation: minimal scopes
  if (scopeArray.length > 4) {
    warnings.push(`Consider reducing OAuth scopes for better security. Currently requesting: ${scopeArray.length} scopes`);
  }
  
  return { valid: errors.length === 0, errors, warnings };
}

// Log comprehensive OAuth configuration validation status
if (!oauthCredentials.valid) {
  console.error('❌ [OAUTH-INIT] OAuth credentials validation failed:');
  oauthCredentials.errors.forEach(error => console.error(`   - ${error}`));
  
  // Add helpful setup instructions
  console.error('❌ [OAUTH-INIT] Setup Instructions:');
  console.error('   1. Go to Google Cloud Console: https://console.cloud.google.com/');
  console.error('   2. Create or select a project');
  console.error('   3. Enable Google+ API and Google OAuth2 API');
  console.error('   4. Create OAuth 2.0 credentials');
  console.error('   5. Add authorized redirect URIs');
  console.error('   6. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables');
} else {
  console.log('✅ [OAUTH-INIT] OAuth credentials validation successful');
}

// Run comprehensive startup validation now that all constants are defined
const startupValidation = validateOAuthConfigurationAtStartup();

/**
 * Canonicalize host for secure comparison
 * - Converts to lowercase for case-insensitive comparison
 * - Strips default ports (80 for HTTP, 443 for HTTPS)
 * - Handles edge cases for localhost and development environments
 */
function canonicalizeHost(host: string): string {
  if (!host) return '';
  
  // Convert to lowercase for case-insensitive comparison
  let canonicalHost = host.toLowerCase().trim();
  
  // Handle common edge cases
  if (canonicalHost === 'localhost' || canonicalHost === '127.0.0.1') {
    return canonicalHost;
  }
  
  // Strip default ports
  if (canonicalHost.endsWith(':80')) {
    canonicalHost = canonicalHost.replace(':80', '');
  } else if (canonicalHost.endsWith(':443')) {
    canonicalHost = canonicalHost.replace(':443', '');
  }
  
  return canonicalHost;
}

/**
 * Generate CSRF token for localStorage authentication
 */
// CSRF token generation is now imported from middleware/csrf-protection.ts

/**
 * Send hybrid authentication response with both cookie and localStorage token
 * Returns HTML page that sets up localStorage auth and redirects to dashboard
 */
function sendHybridAuthResponse(res: Response, sessionToken: string, userOrId: any) {
  const userId = typeof userOrId === 'object' ? userOrId.id : userOrId;
  const csrfToken = generateCSRFToken(userId);
  
  console.log('🔄 [HYBRID-AUTH] Setting up hybrid authentication response');
  
  const hybridAuthHtml = `
<!DOCTYPE html>
<html>
<head>
    <title>Brandentifier - Authentication Setup</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .auth-container {
            text-align: center;
            background: rgba(255, 255, 255, 0.1);
            padding: 2rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
        }
        .spinner {
            border: 3px solid rgba(255, 255, 255, 0.3);
            border-top: 3px solid white;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            font-size: 18px;
            margin-bottom: 0.5rem;
        }
        .sub-message {
            font-size: 14px;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="spinner"></div>
        <div class="message">Setting up your account...</div>
        <div class="sub-message">Configuring cross-domain authentication</div>
    </div>
    
    <script>
        console.log('🚀 [HYBRID-AUTH] Initializing hybrid authentication setup');
        
        try {
            // Store JWT token in localStorage for cross-domain compatibility
            const token = '${sessionToken}';
            const csrfToken = '${csrfToken}';
            const userData = ${JSON.stringify(typeof userOrId === 'object' ? {
              id: userOrId.id,
              email: userOrId.email,
              name: userOrId.name,
              photoURL: userOrId.photoURL,
              username: userOrId.username
            } : { id: userOrId })};
            
            // Storage keys (matching auth-context.tsx)
            const STORAGE_KEYS = {
                JWT_TOKEN: 'brandentifier_jwt_token',
                USER_DATA: 'brandentifier_user_data',
                CSRF_TOKEN: 'brandentifier_csrf_token',
                AUTH_METHOD: 'brandentifier_auth_method',
                TOKEN_EXPIRY: 'brandentifier_token_expiry'
            };
            
            // Store authentication data in localStorage
            localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
            localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
            localStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, csrfToken);
            localStorage.setItem(STORAGE_KEYS.AUTH_METHOD, 'localStorage');
            
            // Store token expiry for easy checking
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, payload.exp.toString());
            } catch (error) {
                console.warn('[HYBRID-AUTH] Error parsing token for expiry storage:', error);
            }
            
            console.log('✅ [HYBRID-AUTH] Authentication data stored successfully');
            console.log('🔄 [HYBRID-AUTH] Redirecting to dashboard');
            
            // Broadcast storage event for cross-tab sync
            window.dispatchEvent(new StorageEvent('storage', {
                key: STORAGE_KEYS.JWT_TOKEN,
                newValue: token,
                storageArea: localStorage
            }));
            
            // Redirect to dashboard after successful setup
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
            
        } catch (error) {
            console.error('❌ [HYBRID-AUTH] Error setting up authentication:', error);
            
            // Fallback redirect even if localStorage setup fails
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 2000);
        }
    </script>
</body>
</html>`;
  
  res.set({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Auth-Method': 'hybrid',
    'X-CSRF-Token': csrfToken
  });
  
  console.log('📤 [HYBRID-AUTH] Sending hybrid authentication response');
  return res.send(hybridAuthHtml);
}

/**
 * Check if two hosts match after canonicalization
 * Provides robust host comparison with tolerance for case and default ports
 */
function hostsMatch(host1: string, host2: string): boolean {
  const canonical1 = canonicalizeHost(host1);
  const canonical2 = canonicalizeHost(host2);
  
  console.log('🔍 [HOST-COMPARISON] Comparing hosts:', {
    original1: host1,
    original2: host2,
    canonical1,
    canonical2,
    match: canonical1 === canonical2
  });
  
  return canonical1 === canonical2;
}

/**
 * Determine secure cookie options for the given host
 * SECURITY: Never sets domain attribute to parent domains - always host-only or exact FQDN
 */
function getSecureCookieOptions(host: string, isHttps: boolean) {
  const canonicalHost = canonicalizeHost(host);
  
  console.log('🍪 [COOKIE-SECURITY] Analyzing host for secure cookie options:', {
    originalHost: host,
    canonicalHost,
    isHttps,
    isDevelopment: canonicalHost.includes('localhost') || canonicalHost.includes('127.0.0.1')
  });
  
  // CRITICAL SECURITY: Validate domain patterns to prevent parent domain vulnerabilities
  const isPicardDomain = canonicalHost.includes('.picard.replit.dev');
  const isReplitAppDomain = canonicalHost.includes('.replit.app');
  const isBrandentifierCom = canonicalHost.includes('brandentifier.com');
  const isDevelopment = canonicalHost.includes('localhost') || canonicalHost.includes('127.0.0.1');
  
  // Base cookie options with security defaults
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  
  // SECURITY RULE: Always use host-only cookies (no domain attribute) for maximum security
  // This prevents cookie sharing across subdomains which could be a security vulnerability
  console.log('🔒 [COOKIE-SECURITY] Using host-only cookie (no domain attribute) for maximum security');
  
  // Validate that we're not accidentally setting parent domains
  if (isPicardDomain) {
    console.log('✅ [COOKIE-SECURITY] Picard domain detected - using host-only cookie');
  } else if (isReplitAppDomain) {
    console.log('✅ [COOKIE-SECURITY] Replit.app domain detected - using host-only cookie');  
  } else if (isBrandentifierCom) {
    console.log('✅ [COOKIE-SECURITY] Brandentifier.com domain detected - using host-only cookie');
  } else if (isDevelopment) {
    console.log('✅ [COOKIE-SECURITY] Development environment detected - using host-only cookie');
  } else {
    console.warn('⚠️ [COOKIE-SECURITY] Unknown domain pattern - using host-only cookie for safety');
  }
  
  return cookieOptions;
}

/**
 * Get OAuth configuration status for debugging and monitoring
 */
export async function getOAuthConfigStatusRoute(req: Request, res: Response) {
  try {
    console.log('📊 [CONFIG-STATUS] OAuth configuration status requested');
    
    // Run fresh validation
    const currentValidation = validateOAuthConfigurationAtStartup();
    
    const configStatus = {
      timestamp: new Date().toISOString(),
      requestingHost: req.get('host'),
      validation: currentValidation,
      environment: oauthCredentials.environment,
      credentials: {
        clientIdExists: !!CLIENT_ID,
        clientIdFormat: CLIENT_ID ? (CLIENT_ID.endsWith('.apps.googleusercontent.com') ? 'valid' : 'invalid') : 'missing',
        clientSecretExists: !!CLIENT_SECRET,
        jwtSecretExists: !!process.env.JWT_SECRET,
        csrfSecretExists: !!getCSRFSecret()
      },
      redirectUris: {
        total: ALLOWED_REDIRECT_URIS.length,
        static: STATIC_ALLOWED_REDIRECT_URIS.length,
        dynamic: generateDynamicRedirectUris().length,
        currentHostUri: getRedirectUriForHost(req.get('host') || 'localhost:5000')
      },
      domainSupport: {
        totalPatterns: REPLIT_DOMAIN_PATTERNS.length,
        currentHostClassification: classifyDomain(req.get('host') || 'localhost:5000'),
        isReplitDomain: isReplitDomain(req.get('host') || 'localhost:5000')
      },
      scopes: {
        current: getOAuthScopes(oauthCredentials.environment),
        definitions: OAUTH_SCOPE_DEFINITIONS
      }
    };
    
    res.json({
      success: true,
      status: 'OAuth configuration retrieved successfully',
      config: configStatus
    });
    
  } catch (error: any) {
    console.error('❌ [CONFIG-STATUS] Error retrieving OAuth config status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve OAuth configuration status',
      message: error.message
    });
  }
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
    
    // Enhanced environment-based redirect URI determination with better domain handling
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
    const isBrandentifierCom = host.includes('brandentifier.com');
    
    console.log('🌐 [OAUTH-URL] Domain analysis:', {
      host,
      isDevelopment,
      isReplitDomain,
      isBrandentifierCom,
      matchedPattern: REPLIT_DOMAIN_PATTERNS.find(pattern => pattern.test(host))?.toString()
    });
    
    // Use requesting domain as redirect URI when whitelisted, otherwise fallback
    const redirectUri = getRedirectUriForHost(host);
    const returnHost = host;
    
    console.log('✅ [OAUTH-URL] Selected redirect URI:', redirectUri);
    
    // SECURITY ENHANCEMENT: Generate PKCE parameters for OAuth 2.0 protection
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    
    console.log('🔐 [PKCE-SECURITY] Generated PKCE parameters:', {
      codeVerifierLength: codeVerifier.length,
      codeChallengeLength: codeChallenge.length,
      codeChallengePreview: codeChallenge.substring(0, 10) + '...',
      method: 'S256'
    });
    
    // Validate PKCE parameters for security compliance
    const pkceValidation = validatePKCEParameters(codeVerifier, codeChallenge);
    if (!pkceValidation.valid) {
      console.error('❌ [PKCE-SECURITY] PKCE parameter validation failed:', pkceValidation.errors);
      throw new Error('PKCE parameter generation failed validation');
    }
    
    console.log('✅ [PKCE-SECURITY] PKCE parameters validated successfully');
    
    // Create cryptographically secure state parameter with return host
    const stateData = {
      nonce: crypto.randomBytes(16).toString('base64url'),
      returnHost: returnHost,
      timestamp: Date.now(),
      ip: req.ip || req.connection.remoteAddress || 'unknown'
    };
    
    const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
    
    // Enhanced state storage with PKCE parameters for security validation
    stateStore.set(state, { 
      timestamp: Date.now(), 
      ip: req.ip || req.connection.remoteAddress || 'unknown',
      codeVerifier: codeVerifier,
      codeChallenge: codeChallenge,
      host: host
    });
    
    console.log('💾 [PKCE-SECURITY] Stored PKCE parameters in state store for validation');
    
    // Build OAuth URL with PKCE and OpenID Connect scope
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: getOAuthScopes(oauthCredentials.environment),
      access_type: 'online',
      prompt: 'select_account',
      state: state,
      // PKCE parameters for OAuth 2.0 security enhancement
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });
    
    console.log('🔐 [PKCE-SECURITY] OAuth URL includes PKCE protection with S256 method');
    
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
    console.log('🔄 [OAUTH CALLBACK] Request initiated from host:', req.get('host'));
    console.log('🔄 [OAUTH CALLBACK] Request method:', req.method);
    
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
    
    // Enhanced state parameter validation with detailed logging
    const stateData = stateStore.get(state as string);
    const currentTime = Date.now();
    
    console.log('🔐 [STATE-VALIDATION] Validating OAuth state:', {
      stateExists: !!stateData,
      stateStoreSize: stateStore.size,
      currentHost: req.get('host'),
      timestamp: new Date().toISOString()
    });
    
    if (!stateData) {
      console.error('❌ [STATE-VALIDATION] Invalid or missing state parameter:', {
        providedState: state ? `${(state as string).substring(0, 10)}...` : 'null',
        storeHasStates: stateStore.size > 0,
        allStates: Array.from(stateStore.keys()).map(k => k.substring(0, 10) + '...')
      });
      return res.redirect('/auth?error=invalid_state');
    }
    
    // Check state age (max 15 minutes) - Extended from 5 minutes
    const fifteenMinutesAgo = currentTime - 15 * 60 * 1000;
    const stateAge = currentTime - stateData.timestamp;
    
    console.log('⏰ [STATE-VALIDATION] State age check:', {
      stateTimestamp: new Date(stateData.timestamp).toISOString(),
      currentTimestamp: new Date(currentTime).toISOString(),
      stateAgeSeconds: Math.floor(stateAge / 1000),
      maxAgeSeconds: 15 * 60,
      isExpired: stateData.timestamp < fifteenMinutesAgo
    });
    
    if (stateData.timestamp < fifteenMinutesAgo) {
      console.error('❌ [STATE-VALIDATION] Expired state parameter:', {
        stateAge: Math.floor(stateAge / 1000) + ' seconds',
        maxAge: '900 seconds (15 minutes)',
        expiredBy: Math.floor((fifteenMinutesAgo - stateData.timestamp) / 1000) + ' seconds'
      });
      stateStore.delete(state as string);
      return res.redirect('/auth?error=expired_state');
    }
    
    console.log('✅ [STATE-VALIDATION] State validation successful');
    
    // SECURITY ENHANCEMENT: Validate PKCE parameters from state
    const { codeVerifier, codeChallenge, host: storedHost } = stateData;
    
    console.log('🔐 [PKCE-VALIDATION] Validating PKCE parameters from OAuth callback:', {
      hasCodeVerifier: !!codeVerifier,
      hasCodeChallenge: !!codeChallenge,
      codeVerifierLength: codeVerifier?.length,
      codeChallengeLength: codeChallenge?.length,
      storedHost,
      currentHost: req.get('host')
    });
    
    if (!codeVerifier || !codeChallenge) {
      console.error('❌ [PKCE-VALIDATION] Missing PKCE parameters in state:', {
        codeVerifier: !!codeVerifier,
        codeChallenge: !!codeChallenge,
        stateKeys: Object.keys(stateData)
      });
      stateStore.delete(state as string);
      return res.redirect('/auth?error=missing_pkce_params');
    }
    
    // Validate PKCE parameters integrity
    const pkceValidation = validatePKCEParameters(codeVerifier, codeChallenge);
    if (!pkceValidation.valid) {
      console.error('❌ [PKCE-VALIDATION] PKCE parameter validation failed in callback:', {
        errors: pkceValidation.errors,
        codeVerifierPreview: codeVerifier.substring(0, 10) + '...',
        codeChallengePreview: codeChallenge.substring(0, 10) + '...'
      });
      stateStore.delete(state as string);
      return res.redirect('/auth?error=pkce_validation_failed');
    }
    
    console.log('✅ [PKCE-VALIDATION] PKCE parameters validated successfully');
    
    // Remove used state (after PKCE validation)
    stateStore.delete(state as string);
    
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Google OAuth credentials not configured');
    }
    
    // Enhanced environment-based redirect URI determination in callback (matches URL generation)
    const host = req.get('Host') || '';
    const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
    const isReplitDomain = REPLIT_DOMAIN_PATTERNS.some(pattern => pattern.test(host));
    const isBrandentifierCom = host.includes('brandentifier.com');
    
    console.log('🌐 [OAUTH-CALLBACK] Domain analysis for token exchange:', {
      host,
      isDevelopment,
      isReplitDomain,
      isBrandentifierCom,
      matchedPattern: REPLIT_DOMAIN_PATTERNS.find(pattern => pattern.test(host))?.toString()
    });
    
    // Use requesting domain as redirect URI when whitelisted, otherwise fallback (must match URL generation)
    const redirectUri = getRedirectUriForHost(host);
    
    console.log('🔄 [OAUTH CALLBACK] Exchanging code for token...');
    console.log('✅ [OAUTH CALLBACK] Using redirect URI:', redirectUri);
    console.log('🔍 [OAUTH CALLBACK] Host detected:', host);
    console.log('🔧 [OAUTH CALLBACK] Development mode:', isDevelopment);
    console.log('🔐 [PKCE-SECURITY] Including code_verifier in token exchange for PKCE validation');
    
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
        // PKCE code_verifier for OAuth 2.0 security validation
        code_verifier: codeVerifier,
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
    console.log('✅ User info received from Google OAuth');
    
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
    console.log('🔍 [AUTH-FIX] Looking up existing user by Google ID');
    
    // FIXED: Check by Google ID first to prevent duplicate users across domains
    let existingUser = await storage.getUserByGoogleId(userData.googleId);
    let user;
    
    if (existingUser) {
      console.log('✅ [AUTH-FIX] Found existing user by Google ID:', {
        id: existingUser.id,
        hasEmail: !!existingUser.email,
        hasName: !!existingUser.name
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
      }
    }
    
    if (!user) {
      throw new Error('Failed to create or update user');
    }
    
    console.log('✅ User saved successfully:', {
      id: user.id,
      hasEmail: !!user.email,
      hasName: !!user.name
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
    
    // Parse state to get return host for cross-domain session handoff
    let returnHost = req.get('host') || 'localhost:5000';
    
    try {
      const decodedState = JSON.parse(Buffer.from(state as string, 'base64url').toString());
      if (decodedState.returnHost) {
        returnHost = decodedState.returnHost;
      }
    } catch (error) {
      console.log('⚠️ [OAUTH CALLBACK] Could not parse state for return host, using current host');
    }
    
    console.log('✅ [OAUTH CALLBACK] Authentication completed successfully');
    console.log('✅ [OAUTH CALLBACK] User authenticated:', {
      id: user.id,
      hasUsername: !!user.username,
      authProvider: 'google'
    });
    
    // Check if cross-domain session handoff is needed
    const currentHost = req.get('host') || 'localhost:5000';
    const needsCrossDomainHandoff = returnHost !== currentHost;
    
    console.log('🔍 [SESSION-HANDOFF] Domain analysis:', {
      currentHost,
      returnHost,
      needsCrossDomainHandoff
    });
    
    if (needsCrossDomainHandoff) {
      const handoffStartTime = Date.now();
      
      // Generate secure session exchange code for cross-domain handoff
      const exchangeCode = crypto.randomBytes(32).toString('base64url');
      
      console.log('🔄 [SESSION-HANDOFF] Cross-domain handoff initiated:', {
        startTime: new Date(handoffStartTime).toISOString(),
        currentHost,
        returnHost,
        userId: user.id,
        exchangeCodePrefix: exchangeCode.substring(0, 10) + '...'
      });
      
      // Store session exchange data (expires in 10 minutes, single-use)
      const exchangeData = {
        sessionToken,
        timestamp: handoffStartTime,
        returnHost,
        userId: user.id
      };
      
      sessionExchangeStore.set(exchangeCode, exchangeData);
      
      console.log('💾 [SESSION-HANDOFF] Exchange data stored:', {
        exchangeCodePrefix: exchangeCode.substring(0, 10) + '...',
        expiresAt: new Date(handoffStartTime + 10 * 60 * 1000).toISOString(),
        storeSize: sessionExchangeStore.size,
        returnHostPattern: REPLIT_DOMAIN_PATTERNS.find(p => p.test(returnHost))?.toString() || 'no-pattern-match'
      });
      
      // Build session acceptance URL on return domain
      const sessionAcceptUrl = returnHost.includes('localhost') 
        ? `http://${returnHost}/auth/accept-session?code=${exchangeCode}`
        : `https://${returnHost}/auth/accept-session?code=${exchangeCode}`;
      
      console.log('🚀 [SESSION-HANDOFF] Redirecting to session accept URL:', {
        url: sessionAcceptUrl,
        protocol: sessionAcceptUrl.startsWith('https') ? 'HTTPS' : 'HTTP',
        timingMs: Date.now() - handoffStartTime
      });
      
      return res.redirect(303, sessionAcceptUrl);
    } else {
      // Same domain - set cookie and provide token for localStorage (hybrid auth)
      const isHttps = req.secure || req.get('X-Forwarded-Proto') === 'https';
      
      // SECURITY FIX: Use secure cookie options with host-only setting
      const cookieOptions = getSecureCookieOptions(currentHost, isHttps);
      
      console.log('🍪 [SESSION-HANDOFF] Same domain - setting secure host-only cookie:', {
        host: currentHost,
        sameSite: cookieOptions.sameSite,
        secure: cookieOptions.secure,
        isHttps: isHttps,
        hostOnlyMode: true // No domain attribute = host-only cookie
      });
      
      res.cookie('brandentifier_session', sessionToken, cookieOptions);
      
      console.log('✅ [SESSION-HANDOFF] Same domain hybrid auth setup (cookie + localStorage)');
      
      // CRITICAL CSRF FIX: Generate CSRF token for OAuth callback response
      const csrfToken = generateCSRFToken(user.id);
      res.setHeader('X-CSRF-Token', csrfToken);
      console.log('🛡️ [CSRF] Generated CSRF token for OAuth callback');
      
      return sendHybridAuthResponse(res, sessionToken, user);
    }
    
  } catch (error: any) {
    console.error('❌ OAuth callback error:', error);
    res.redirect(`/auth?error=callback_error&message=${encodeURIComponent(error.message)}`);
  }
}

/**
 * Accept session from cross-domain handoff - validates exchange code and sets session cookie
 */
export async function acceptSessionRoute(req: Request, res: Response) {
  let acceptStartTime = Date.now();
  
  try {
    const currentHost = req.get('host') || 'unknown';
    
    console.log('🔄 [SESSION-ACCEPT] Processing session acceptance:', {
      startTime: new Date(acceptStartTime).toISOString(),
      host: currentHost,
      userAgent: req.get('user-agent')?.substring(0, 50) || 'unknown',
      ip: req.ip || 'unknown',
      hasExchangeCode: !!req.query.code
    });
    
    // Set cache control headers
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'X-Auth-Handler': 'session-accept',
      'X-Auth-Timestamp': new Date().toISOString(),
      'X-Auth-Host': currentHost,
      'X-Session-Accept-Start': acceptStartTime.toString()
    });
    
    const { code } = req.query;
    
    // Enhanced validation for missing or malformed exchange codes
    if (!code) {
      console.error('❌ [SESSION-ACCEPT] Missing exchange code parameter:', {
        queryParams: Object.keys(req.query),
        url: req.url,
        referer: req.get('referer') || 'none'
      });
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=missing_exchange_code&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with missing code error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    if (typeof code !== 'string' || code.length < 10) {
      console.error('❌ [SESSION-ACCEPT] Invalid exchange code format:', {
        codeType: typeof code,
        codeLength: typeof code === 'string' ? code.length : 'N/A',
        codePreview: typeof code === 'string' ? code.substring(0, 5) + '...' : 'N/A'
      });
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=invalid_exchange_code&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with invalid code error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    // Enhanced exchange code lookup with detailed diagnostics
    console.log('🔍 [SESSION-ACCEPT] Looking up exchange code:', {
      codePrefix: code.substring(0, 10) + '...',
      storeSize: sessionExchangeStore.size,
      lookupTime: new Date().toISOString()
    });
    
    const exchangeData = sessionExchangeStore.get(code);
    
    if (!exchangeData) {
      const diagnosticInfo = {
        codeProvided: code.substring(0, 10) + '...',
        storeSize: sessionExchangeStore.size,
        allCodes: Array.from(sessionExchangeStore.keys()).map(k => k.substring(0, 10) + '...'),
        possibleCauses: [
          sessionExchangeStore.size === 0 ? 'No exchange codes in store' : null,
          'Code already used (single-use)',
          'Code expired and cleaned up',
          'Code never generated (OAuth flow incomplete)'
        ].filter(Boolean)
      };
      
      console.error('❌ [SESSION-ACCEPT] Exchange code not found or already used:', diagnosticInfo);
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=exchange_code_not_found&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with code not found error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    console.log('✅ [SESSION-ACCEPT] Exchange code found:', {
      userId: exchangeData.userId,
      returnHost: exchangeData.returnHost,
      generatedAt: new Date(exchangeData.timestamp).toISOString(),
      ageSeconds: Math.floor((Date.now() - exchangeData.timestamp) / 1000)
    });
    
    // Enhanced exchange code validation with detailed timing
    acceptStartTime = Date.now();
    const codeAge = acceptStartTime - exchangeData.timestamp;
    const tenMinutesAgo = acceptStartTime - 10 * 60 * 1000;
    const eightMinutesAgo = acceptStartTime - 8 * 60 * 1000;
    
    console.log('⏱️ [SESSION-ACCEPT] Exchange code timing analysis:', {
      codeGeneratedAt: new Date(exchangeData.timestamp).toISOString(),
      currentTime: new Date(acceptStartTime).toISOString(),
      ageSeconds: Math.floor(codeAge / 1000),
      maxAgeSeconds: 10 * 60,
      isExpired: exchangeData.timestamp < tenMinutesAgo,
      isNearExpiry: exchangeData.timestamp < eightMinutesAgo
    });
    
    // Check exchange code age (max 10 minutes)
    if (exchangeData.timestamp < tenMinutesAgo) {
      const errorDetails = {
        codeAge: Math.floor(codeAge / 1000) + ' seconds',
        maxAge: '600 seconds (10 minutes)',
        expiredBy: Math.floor((tenMinutesAgo - exchangeData.timestamp) / 1000) + ' seconds',
        codePrefix: code.substring(0, 10) + '...'
      };
      
      console.error('❌ [SESSION-ACCEPT] Exchange code expired:', errorDetails);
      
      // CLEANUP FIX: Delete expired code immediately since it's clearly expired
      sessionExchangeStore.delete(code);
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = '/auth?error=exchange_code_expired&retry=true';
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with expired code error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    // Warning for codes nearing expiry
    if (exchangeData.timestamp < eightMinutesAgo) {
      console.warn('⚠️ [SESSION-ACCEPT] Exchange code is nearing expiry:', {
        ageSeconds: Math.floor(codeAge / 1000),
        remainingSeconds: 600 - Math.floor(codeAge / 1000)
      });
    }
    
    // SECURITY FIX: Enhanced host validation with canonicalized comparison
    const expectedHost = exchangeData.returnHost;
    
    console.log('🌐 [SESSION-ACCEPT] Host validation with canonicalization:', {
      expectedHost,
      actualHost: currentHost,
      expectedCanonical: canonicalizeHost(expectedHost),
      actualCanonical: canonicalizeHost(currentHost),
      currentHostPattern: REPLIT_DOMAIN_PATTERNS.find(p => p.test(currentHost))?.toString() || 'no-pattern-match',
      expectedHostPattern: REPLIT_DOMAIN_PATTERNS.find(p => p.test(expectedHost))?.toString() || 'no-pattern-match'
    });
    
    // Use robust host comparison with canonicalization
    if (!hostsMatch(expectedHost, currentHost)) {
      const errorDetails = {
        expectedHost,
        actualHost: currentHost,
        expectedCanonical: canonicalizeHost(expectedHost),
        actualCanonical: canonicalizeHost(currentHost),
        isPicardDomain: currentHost.includes('.picard.replit.dev'),
        isReplitDomain: REPLIT_DOMAIN_PATTERNS.some(p => p.test(currentHost))
      };
      
      console.error('❌ [SESSION-ACCEPT] Host mismatch after canonicalization:', errorDetails);
      
      // UX FIX: Return proper redirect instead of JSON response
      const redirectUrl = `/auth?error=host_mismatch&expected=${encodeURIComponent(expectedHost)}&actual=${encodeURIComponent(currentHost)}&retry=true`;
      console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with host mismatch error:', redirectUrl);
      return res.redirect(302, redirectUrl);
    }
    
    const validationEndTime = Date.now();
    
    console.log('✅ [SESSION-ACCEPT] All validations passed, proceeding with cookie setup:', {
      validationDurationMs: validationEndTime - acceptStartTime,
      exchangeCodePrefix: code.substring(0, 10) + '...',
      validatedAt: new Date(validationEndTime).toISOString()
    });
    
    // EXCHANGE CODE CLEANUP FIX: Don't delete exchange code yet - only after successful operations
    
    // SECURITY FIX: Use secure cookie options with host-only setting
    const isHttps = req.secure || req.get('X-Forwarded-Proto') === 'https';
    const cookieOptions = getSecureCookieOptions(currentHost, isHttps);
    
    console.log('🍪 [SESSION-ACCEPT] Setting secure host-only cookie:', {
      host: currentHost,
      sameSite: cookieOptions.sameSite,
      secure: cookieOptions.secure,
      isHttps: isHttps,
      hostOnlyMode: true, // No domain attribute = host-only cookie for maximum security
      isPicardDomain: currentHost.includes('.picard.replit.dev'),
      isReplitDomain: REPLIT_DOMAIN_PATTERNS.some(p => p.test(currentHost))
    });
    
    // Set the session cookie with enhanced security settings
    res.cookie('brandentifier_session', exchangeData.sessionToken, cookieOptions);
    
    console.log('🍪 [SESSION-ACCEPT] Session cookie set successfully:', {
      cookieName: 'brandentifier_session',
      tokenLength: exchangeData.sessionToken.length,
      domain: currentHost,
      options: cookieOptions,
      setAt: new Date().toISOString()
    });
    
    const handoffDuration = Date.now() - acceptStartTime;
    const totalSessionHandoffTime = Date.now() - exchangeData.timestamp;
    
    console.log('✅ [SESSION-ACCEPT] Session handoff completed successfully:', {
      userId: exchangeData.userId,
      handoffDurationMs: handoffDuration,
      totalSessionHandoffMs: totalSessionHandoffTime,
      completedAt: new Date().toISOString(),
      finalHost: currentHost,
      cookieSecure: cookieOptions.secure
    });
    
    // Performance tracking for cross-domain handoffs
    if (totalSessionHandoffTime > 30000) { // More than 30 seconds
      console.warn('⚠️ [SESSION-ACCEPT] Slow session handoff detected:', {
        totalTimeMs: totalSessionHandoffTime,
        threshold: 30000,
        possibleCause: 'Network latency or user delay'
      });
    }
    
    // EXCHANGE CODE CLEANUP FIX: Only delete exchange code after successful cookie setting and redirect
    // This improves error recovery - if redirect fails, code is still available for retry
    sessionExchangeStore.delete(code);
    console.log('✅ [SESSION-ACCEPT] Exchange code deleted after successful operations:', {
      codePrefix: code.substring(0, 10) + '...',
      remainingCodes: sessionExchangeStore.size
    });
    
    // Hybrid auth setup (cookie + localStorage) and redirect to dashboard  
    console.log('✅ [SESSION-ACCEPT] Setting up hybrid authentication (cookie + localStorage)');
    
    // CRITICAL CSRF FIX: Generate CSRF token for session accept response
    const csrfTokenForSessionAccept = generateCSRFToken(exchangeData.userId);
    res.setHeader('X-CSRF-Token', csrfTokenForSessionAccept);
    console.log('🛡️ [CSRF] Generated CSRF token for session accept');
    
    return sendHybridAuthResponse(res, exchangeData.sessionToken, exchangeData.userId);
    
  } catch (error: any) {
    console.error('❌ [SESSION-ACCEPT] Unexpected session acceptance error:', {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500), // Truncated stack trace
      host: req.get('host'),
      exchangeCodeProvided: !!req.query.code,
      timestamp: new Date().toISOString()
    });
    
    // UX FIX: Return proper redirect instead of JSON response for unexpected errors
    const redirectUrl = '/auth?error=session_accept_error&retry=true';
    console.log('🚀 [SESSION-ACCEPT] Redirecting to auth page with unexpected error:', redirectUrl);
    return res.redirect(302, redirectUrl);
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
    
    // Debug logging for session validation
    const requestHost = req.get('host');
    console.log('🍪 Session Debug:', {
      host: requestHost,
      cookiePresent: !!req.cookies?.brandentifier_session,
      cookieStart: req.cookies?.brandentifier_session ? req.cookies.brandentifier_session.substring(0, 20) + '...' : 'none',
      userAgent: req.get('user-agent')?.substring(0, 50)
    });
    
    // Check if JWT session cookie exists
    const sessionToken = req.cookies?.brandentifier_session;
    
    if (!sessionToken) {
      console.log('❌ No session cookie found');
      return res.status(401).json({
        success: false,
        error: 'No session found'
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
      
      // Include CSRF token for localStorage auth requests
      const csrfToken = generateCSRFToken(user.id);
      
      // CRITICAL CSRF FIX: Add X-CSRF-Token header for session endpoint
      res.setHeader('X-CSRF-Token', csrfToken);
      
      return res.json({
        success: true,
        user: clientUser,
        csrfToken: csrfToken
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
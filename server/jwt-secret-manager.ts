/**
 * JWT Secret Management Module
 * 
 * Centralizes JWT secret handling with production security validation
 * - Validates JWT_SECRET is set in production environments
 * - Provides secure access to JWT secret across the application
 * - Fails fast on startup if production requirements aren't met
 * - Allows development environment flexibility
 */

import crypto from 'crypto';

// Production environment check
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV !== 'production';

// JWT configuration
const JWT_EXPIRES = '24h';

/**
 * Validates JWT secret configuration and environment setup
 * @returns {Object} Validation result with success status and details
 */
export function validateJWTSecretConfiguration(): {
  isValid: boolean;
  secret: string;
  environment: string;
  message: string;
  recommendations?: string[];
} {
  const environment = process.env.NODE_ENV || 'development';
  const jwtSecret = process.env.JWT_SECRET;
  
  console.log('🔐 [JWT Secret Manager] Validating JWT configuration...');
  console.log(`🔐 [JWT Secret Manager] Environment: ${environment}`);
  console.log(`🔐 [JWT Secret Manager] JWT_SECRET provided: ${jwtSecret ? 'YES' : 'NO'}`);
  
  if (isProduction) {
    // PRODUCTION: JWT_SECRET is required
    if (!jwtSecret || jwtSecret.trim() === '') {
      return {
        isValid: false,
        secret: '',
        environment,
        message: 'JWT_SECRET environment variable is required in production but not set',
        recommendations: [
          'Set JWT_SECRET environment variable to a secure random string',
          'Use: export JWT_SECRET="$(openssl rand -base64 32)" or similar',
          'Ensure JWT_SECRET is at least 32 characters long',
          'Store JWT_SECRET securely in your deployment environment'
        ]
      };
    }
    
    // Validate secret strength in production
    if (jwtSecret.length < 32) {
      return {
        isValid: false,
        secret: '',
        environment,
        message: 'JWT_SECRET must be at least 32 characters long in production',
        recommendations: [
          'Generate a stronger JWT_SECRET: openssl rand -base64 32',
          'Use a cryptographically secure random string',
          'Minimum 32 characters required for production security'
        ]
      };
    }
    
    console.log('✅ [JWT Secret Manager] Production JWT_SECRET validation passed');
    return {
      isValid: true,
      secret: jwtSecret,
      environment,
      message: 'JWT_SECRET properly configured for production'
    };
    
  } else {
    // DEVELOPMENT: Use provided secret or generate fallback
    let secret = jwtSecret;
    let message = '';
    
    if (!secret) {
      // Generate a secure random secret for development
      secret = crypto.randomBytes(32).toString('base64');
      message = 'Using generated JWT_SECRET for development (will change on restart)';
      console.log('⚠️  [JWT Secret Manager] No JWT_SECRET provided - using generated secret for development');
      console.log('⚠️  [JWT Secret Manager] Set JWT_SECRET env var to maintain sessions across restarts');
    } else {
      message = 'Using provided JWT_SECRET for development';
      console.log('✅ [JWT Secret Manager] Using provided JWT_SECRET for development');
    }
    
    return {
      isValid: true,
      secret,
      environment,
      message,
      recommendations: isDevelopment ? [
        'For consistent development sessions, set JWT_SECRET environment variable',
        'Example: export JWT_SECRET="your-development-secret-here"'
      ] : undefined
    };
  }
}

/**
 * Global JWT configuration - initialized once during startup
 */
let jwtConfig: {
  secret: string;
  environment: string;
  isValid: boolean;
} | null = null;

/**
 * Initialize JWT configuration (must be called during server startup)
 * @throws {Error} If JWT configuration is invalid in production
 */
export function initializeJWTConfiguration(): void {
  const validation = validateJWTSecretConfiguration();
  
  if (!validation.isValid) {
    console.error('❌ [JWT Secret Manager] JWT Configuration Error');
    console.error('❌ [JWT Secret Manager]', validation.message);
    
    if (validation.recommendations) {
      console.error('❌ [JWT Secret Manager] Recommendations:');
      validation.recommendations.forEach((rec, index) => {
        console.error(`❌ [JWT Secret Manager]   ${index + 1}. ${rec}`);
      });
    }
    
    console.error('❌ [JWT Secret Manager] Server startup aborted due to JWT configuration error');
    process.exit(1);
  }
  
  // Store validated configuration
  jwtConfig = {
    secret: validation.secret,
    environment: validation.environment,
    isValid: true
  };
  
  console.log('✅ [JWT Secret Manager] JWT configuration initialized successfully');
  console.log(`✅ [JWT Secret Manager] Environment: ${validation.environment}`);
  console.log(`✅ [JWT Secret Manager] Secret length: ${validation.secret.length} characters`);
  console.log('✅ [JWT Secret Manager]', validation.message);
}

/**
 * Get the validated JWT secret
 * @returns {string} The JWT secret
 * @throws {Error} If JWT configuration hasn't been initialized
 */
export function getJWTSecret(): string {
  if (!jwtConfig) {
    throw new Error('JWT configuration not initialized. Call initializeJWTConfiguration() first.');
  }
  
  return jwtConfig.secret;
}

/**
 * Get JWT configuration details (without exposing the secret)
 * @returns {Object} JWT configuration metadata
 */
export function getJWTConfig(): {
  environment: string;
  isInitialized: boolean;
  secretLength: number;
  expiresIn: string;
} {
  return {
    environment: jwtConfig?.environment || 'unknown',
    isInitialized: jwtConfig !== null,
    secretLength: jwtConfig?.secret?.length || 0,
    expiresIn: JWT_EXPIRES
  };
}

/**
 * JWT token expiration time
 */
export const JWT_EXPIRATION = JWT_EXPIRES;
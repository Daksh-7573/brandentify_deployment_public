import { Express } from 'express';
import helmet from 'helmet';
import session from 'express-session';
import { 
  securityHeaders, 
  secureCors, 
  rateLimit, 
  generateCsrfToken,
  csrfProtection
} from '../middleware/api-security';
import { sanitizeRequest } from '../middleware/auth-middleware';

/**
 * Apply security configurations to Express application
 * @param app Express application
 */
export function applySecurityConfig(app: Express): void {
  // Initialize session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'brandentifier-secure-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));
  // Apply Helmet middleware for security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://trusted-cdn.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://trusted-cdn.com"],
        imgSrc: ["'self'", "data:", "https://trusted-cdn.com"],
        connectSrc: ["'self'", "https://api.openai.com"],
        fontSrc: ["'self'", "https://trusted-cdn.com"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // May need to adjust based on iframe usage
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
    dnsPrefetchControl: { allow: false },
    frameguard: { action: 'deny' },
    hsts: {
      maxAge: 15552000, // 180 days
      includeSubDomains: true,
      preload: true,
    },
    ieNoOpen: true,
    noSniff: true,
    originAgentCluster: true,
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true,
  }));

  // Apply CORS with security headers
  app.use(secureCors);

  // Temporarily disable rate limiting for debugging
  // app.use(rateLimit(300, 60000)); // 300 requests per minute

  // Apply request sanitization
  app.use(sanitizeRequest);
  
  // Add security headers
  app.use(securityHeaders);
  
  // Generate CSRF tokens for all requests
  app.use(generateCsrfToken);
  
  // Apply CSRF protection for non-GET requests
  app.use(csrfProtection);

  // Other security settings
  app.disable('x-powered-by'); // Remove X-Powered-By header
  
  // Set secure cookie configuration
  app.set('trust proxy', 1); // Trust first proxy
  const sessionConfig = {
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Secure in production
      httpOnly: true, // Not accessible via JavaScript
      sameSite: 'lax' as const, // Restricts cross-site usage
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };
  
  app.set('session', sessionConfig);
}

export default applySecurityConfig;
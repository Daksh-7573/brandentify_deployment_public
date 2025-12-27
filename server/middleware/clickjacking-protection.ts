import { Request, Response, NextFunction } from 'express';

/**
 * Clickjacking Protection Middleware
 * 
 * Prevents the site from being embedded in malicious iframes while allowing
 * specific routes (like portfolio embeds) to be embedded when needed.
 * 
 * Uses both X-Frame-Options and CSP frame-ancestors for complete browser support.
 */

// Routes that are allowed to be embedded in iframes (for sharing/embedding features)
const EMBEDDABLE_ROUTES = [
  '/embed/portfolio',
  '/embed/card',
  '/embed/quantum-card',
  '/api/portfolios/embed',
  '/widget/',
  '/share/',
];

// Trusted domains that can embed our content
const TRUSTED_FRAME_ANCESTORS = [
  "'self'",
  'https://brandentifier.com',
  'https://www.brandentifier.com',
  'https://brandentifier.replit.app',
  'https://*.replit.app',
  'https://*.replit.dev',
];

/**
 * Check if a route should be embeddable
 */
function isEmbeddableRoute(path: string): boolean {
  return EMBEDDABLE_ROUTES.some(route => path.startsWith(route));
}

/**
 * Clickjacking protection middleware
 * - Protected routes: X-Frame-Options: DENY + CSP frame-ancestors 'none'
 * - Embeddable routes: X-Frame-Options: ALLOW-FROM + CSP frame-ancestors with trusted domains
 */
export function clickjackingProtection(req: Request, res: Response, next: NextFunction) {
  const path = req.path;
  
  // Skip for static assets (handled by Vite)
  if (path.startsWith('/assets/') || path.startsWith('/src/') || 
      path.includes('.js') || path.includes('.css') || path.includes('.tsx') ||
      path.includes('.jsx') || path.includes('.ts') || path.includes('.mjs')) {
    return next();
  }
  
  // Skip for media/upload paths that may need embedding
  if (path.startsWith('/uploads/') || path.startsWith('/media/')) {
    return next();
  }

  if (isEmbeddableRoute(path)) {
    // Allow embedding from trusted domains only
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Content-Security-Policy', 
      `frame-ancestors ${TRUSTED_FRAME_ANCESTORS.join(' ')}`
    );
  } else {
    // Block all framing for non-embeddable routes
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
  }
  
  next();
}

/**
 * Middleware to add comprehensive security headers
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection (legacy, but still useful for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent page from being loaded in IE compatibility mode
  res.setHeader('X-UA-Compatible', 'IE=edge');
  
  // Referrer policy - send origin only for cross-origin requests
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy - restrict access to sensitive browser features
  res.setHeader('Permissions-Policy', 
    'camera=(), microphone=(), geolocation=(), payment=(self)'
  );
  
  next();
}

export default clickjackingProtection;

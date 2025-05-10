import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Create a rate limiter instance with options
const createRateLimiter = (options: {
  windowMs?: number;
  max?: number;
  message?: string;
  keyGenerator?: (req: Request) => string;
}) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000, // Default: 1 minute
    max: options.max || 60, // Default: 60 requests per minute
    message: options.message || 'Too many requests, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: options.keyGenerator || ((req) => {
      // Default key is IP address
      return req.ip || 'unknown';
    }),
  });
};

// General API rate limiter - allows moderate usage
export const generalApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many API requests, please try again in a minute',
});

// Stricter rate limiter for AI-powered endpoints
export const aiApiLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: 'Too many AI requests, please try again in a minute',
});

// Very strict limiter for sensitive operations (auth, profile updates)
export const sensitiveApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 sensitive operations per 15 minutes
  message: 'Too many sensitive operations attempted, please try again later',
});

// Specific limiter for resume analysis (high CPU/memory usage)
export const resumeAnalysisLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // 3 resume analyses per 5 minutes
  message: 'Resume analysis rate limit reached, please try again in a few minutes',
});

// CORS middleware with security headers
export const corsWithSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Set secure CORS headers
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Set Content Security Policy
  // This is a basic policy - customize based on your application's needs
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' https://trusted-cdn.com; " +
    "style-src 'self' https://trusted-cdn.com; " +
    "img-src 'self' data: https://trusted-cdn.com; " +
    "font-src 'self' https://trusted-cdn.com; " +
    "connect-src 'self' https://api.openai.com;"
  );
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
};

export default {
  generalApiLimiter,
  aiApiLimiter,
  sensitiveApiLimiter,
  resumeAnalysisLimiter,
  corsWithSecurity,
};
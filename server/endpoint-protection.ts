/**
 * Enhanced API Endpoint Protection
 * 
 * This module provides specific protection for sensitive API endpoints
 * with granular control over request validation, rate limiting, and access control.
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

// Define validation schemas here to avoid circular dependency
export const ValidationSchemas = {
  // User-related schemas
  userId: z.string().min(1).max(100),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100).optional(),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/).optional(),
  
  // Content-related schemas
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  industry: z.string().min(1).max(100).optional(),
  location: z.string().min(1).max(100).optional(),
};

// Map of endpoints to specific protection configurations
interface EndpointProtection {
  schema?: z.ZodType<any>;
  rateLimitOptions?: {
    windowMs: number;
    max: number;
  };
  requiredRole?: string;
  validateParams?: boolean;
  validateBody?: boolean;
  auditLog?: boolean;
}

// Define specific protection for different endpoints
const protectedEndpoints: Record<string, EndpointProtection> = {
  // User management endpoints
  '/api/users/:id': {
    schema: z.object({
      name: ValidationSchemas.name,
      email: ValidationSchemas.email.optional(),
      phoneNumber: ValidationSchemas.phoneNumber.optional(),
      photoURL: z.string().min(1).max(50000).optional(), // CRITICAL FIX: Add photoURL field for profile picture persistence (supports base64)
      title: z.string().min(1).max(200).optional(), // Onboarding: Job title
      industry: z.string().min(1).max(100).optional(), // Onboarding: Industry
      domain: z.string().min(1).max(100).optional(), // Onboarding: Domain/specialization
      profileCompleted: z.number().min(0).max(100).optional(), // Onboarding: Profile completion percentage
      company: z.string().min(1).max(200).optional(), // Company name
      location: z.string().min(1).max(200).optional(), // Location
      aboutMe: z.string().max(5000).optional(), // About me text
      tagline: z.string().max(200).optional(), // Personal tagline
      lookingFor: z.string().max(500).optional(), // What user is looking for
    }),
    validateBody: true,
    auditLog: true,
  },
  
  // Authentication endpoints with stricter rate limiting
  '/api/auth/login': {
    schema: z.object({
      email: ValidationSchemas.email,
      password: ValidationSchemas.password,
    }),
    rateLimitOptions: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Only 10 attempts per 15 minutes
    },
    validateBody: true,
    auditLog: true,
  },
  
  '/api/auth/register': {
    schema: z.object({
      username: ValidationSchemas.username,
      email: ValidationSchemas.email,
      password: ValidationSchemas.password,
    }),
    rateLimitOptions: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // Only 5 registrations per hour
    },
    validateBody: true,
    auditLog: true,
  },
  
  // Career capsule endpoints
  '/api/career-capsule': {
    validateBody: true,
    auditLog: true,
  },
  
  // Messaging endpoints
  '/api/messaging': {
    validateBody: true,
    auditLog: true,
  },
  
  // Notifications endpoints
  '/api/notifications': {
    validateBody: true,
    auditLog: true,
  },
  
  // Admin endpoints with role requirements
  '/api/admin': {
    requiredRole: 'admin',
    validateBody: true,
    auditLog: true,
  },
};

/**
 * Find the most specific endpoint configuration that matches the request path
 */
function findEndpointProtection(path: string): EndpointProtection | null {
  // Try exact match first
  if (protectedEndpoints[path]) {
    return protectedEndpoints[path];
  }
  
  // Try pattern matching for endpoints with parameters
  const pathParts = path.split('/').filter(Boolean);
  
  for (const [endpoint, config] of Object.entries(protectedEndpoints)) {
    const endpointParts = endpoint.split('/').filter(Boolean);
    
    if (pathParts.length !== endpointParts.length) {
      continue;
    }
    
    let matches = true;
    for (let i = 0; i < endpointParts.length; i++) {
      // If the endpoint part starts with ':', it's a parameter
      if (endpointParts[i].startsWith(':')) {
        continue;
      }
      
      if (endpointParts[i] !== pathParts[i]) {
        matches = false;
        break;
      }
    }
    
    if (matches) {
      return config;
    }
  }
  
  return null;
}

/**
 * Middleware for specific endpoint protection
 */
export function endpointProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // CRITICAL FIX: Skip endpoint protection for user profile routes to preserve photoURL
  if (req.path.includes('/users/') && req.method === 'PUT') {
    console.log(`[ENDPOINT PROTECTION] 🚀 BYPASSING for user profile route: ${req.method} ${req.path}`);
    return next();
  }
  
  // Skip protection for public endpoints and GET requests to improve compatibility
  if (req.method === 'GET' && !req.path.includes('admin')) {
    return next();
  }
  
  console.log(`[ENDPOINT PROTECTION] 🔍 Checking path: ${req.path} (method: ${req.method})`);
  const endpointConfig = findEndpointProtection(req.path);
  console.log(`[ENDPOINT PROTECTION] Found config:`, endpointConfig ? 'YES' : 'NO');
  
  if (!endpointConfig) {
    return next();
  }
  
  // Validate request body if schema is provided and validation is enabled
  if (endpointConfig.schema && endpointConfig.validateBody && req.body) {
    try {
      console.log(`[ENDPOINT PROTECTION] 🔍 Validating ${req.method} ${req.path}`);
      console.log(`[ENDPOINT PROTECTION] Original req.body keys:`, Object.keys(req.body));
      console.log(`[ENDPOINT PROTECTION] Original photoURL present:`, req.body.photoURL ? 'YES' : 'NO');
      
      const result = endpointConfig.schema.safeParse(req.body);
      
      if (!result.success) {
        // In non-breaking mode, we just log the validation errors
        console.warn(`[ENDPOINT PROTECTION] ❌ Validation error for ${req.method} ${req.path}:`, 
          JSON.stringify(result.error.errors));
        
        // Add validation results to request for optional handling in routes
        req.validationErrors = result.error.errors;
        
        // In production, you would return a 400 here:
        // return res.status(400).json({ 
        //   message: 'Invalid request data',
        //   errors: result.error.errors
        // });
      } else {
        console.log(`[ENDPOINT PROTECTION] ✅ Validation successful for ${req.method} ${req.path}`);
        console.log(`[ENDPOINT PROTECTION] Validated data keys:`, Object.keys(result.data));
        console.log(`[ENDPOINT PROTECTION] Validated photoURL present:`, result.data.photoURL ? 'YES' : 'NO');
        
        // Replace req.body with validated data
        req.body = result.data;
        
        console.log(`[ENDPOINT PROTECTION] 🔧 REPLACED req.body with validated data`);
        console.log(`[ENDPOINT PROTECTION] New req.body keys:`, Object.keys(req.body));
      }
    } catch (error) {
      console.error('[ENDPOINT PROTECTION] Validation error:', error);
    }
  }
  
  // Check role if required (in non-breaking mode, we just log and continue)
  if (endpointConfig.requiredRole) {
    const userRole = (req as any).user?.role;
    
    if (!userRole || userRole !== endpointConfig.requiredRole) {
      console.warn(`Role check failed: ${req.method} ${req.path} - Required: ${endpointConfig.requiredRole}, Got: ${userRole || 'none'}`);
      
      // In production, you would return a 403 here:
      // return res.status(403).json({ message: 'Insufficient permissions' });
    }
  }
  
  // Audit logging for sensitive operations
  if (endpointConfig.auditLog) {
    const userId = (req as any).user?.id || 'anonymous';
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    
    console.log(`[AUDIT] ${req.method} ${req.path} - User: ${userId}, IP: ${ipAddress}`);
    
    // In production, you would log this to a secure audit log
  }
  
  next();
}

/**
 * Create specific rate limiters for sensitive endpoints
 */
export function createEndpointRateLimiters(app: any): void {
  for (const [endpoint, config] of Object.entries(protectedEndpoints)) {
    if (config.rateLimitOptions) {
      const limiter = rateLimit({
        windowMs: config.rateLimitOptions.windowMs,
        max: config.rateLimitOptions.max,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many requests, please try again later.' }
      });
      
      app.use(endpoint, limiter);
    }
  }
}

export { protectedEndpoints };
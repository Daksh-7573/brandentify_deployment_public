import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/auth-service';

/**
 * Extended Request interface with user property
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
        email: string;
        name: string;
        role: string;
        // Add other user properties as needed
      };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT tokens
 * This middleware extracts the token from the Authorization header,
 * verifies it, and attaches the user to the request object
 */
export const authenticateJWT = async (req: Request, res: Response, next: NextFunction) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  // Verify Bearer token format
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  const token = parts[1];
  try {
    // Authenticate token and get user
    const user = await AuthService.authenticateToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user to request for downstream middleware/routes
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

/**
 * Role-based access control middleware
 * Restricts access to routes based on user roles
 * @param allowedRoles Array of roles allowed to access the route
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get user role, default to 'user' if not set
    const userRole = req.user.role || 'user';
    
    // Check if user's role is in the allowed roles list
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions', 
        error: 'FORBIDDEN',
        required: allowedRoles,
        current: userRole
      });
    }

    // Admin users bypass all role checks (can be disabled on high-security routes)
    if (userRole === 'admin') {
      return next();
    }

    next();
  };
};

/**
 * Comprehensive request sanitization middleware to prevent XSS, SQL Injection and other attacks
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Helper function to sanitize strings against multiple attack vectors
  const sanitizeString = (str: string): string => {
    if (!str) return str;
    
    // Basic XSS prevention
    let sanitized = str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
    
    // Protect against SQL injection patterns
    sanitized = sanitized
      .replace(/(\%27)|(\')|(\-\-)|(\%23)|(#)/g, '') // SQL meta-characters
      .replace(/((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(\%2B)|(\%23)|(#))/g, ''); // SQL injection patterns
    
    // Protection against JavaScript insertion
    sanitized = sanitized
      .replace(/javascript:/gi, 'blocked:')
      .replace(/data:text\/html/gi, 'blocked:')
      .replace(/on\w+=/gi, 'blocked=');
      
    return sanitized;
  };

  // Sanitize path parameters
  if (req.params) {
    Object.keys(req.params).forEach(key => {
      if (typeof req.params[key] === 'string') {
        req.params[key] = sanitizeString(req.params[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  // Skip body sanitization for file uploads and multipart forms
  const contentType = req.headers['content-type'] || '';
  const skipBodySanitization = 
    contentType.includes('multipart/form-data') || 
    contentType.includes('application/octet-stream');

  // Sanitize body for JSON and form submissions
  if (req.body && !skipBodySanitization) {
    const sanitizeObject = (obj: any): any => {
      if (!obj) return obj;
      
      // Handle arrays
      if (Array.isArray(obj)) {
        return obj.map(item => {
          if (typeof item === 'string') return sanitizeString(item);
          if (typeof item === 'object' && item !== null) return sanitizeObject(item);
          return item;
        });
      }
      
      // Handle objects
      const sanitized: any = {};
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (Array.isArray(obj[key])) {
          sanitized[key] = obj[key].map((item: any) => {
            if (typeof item === 'string') return sanitizeString(item);
            if (typeof item === 'object' && item !== null) return sanitizeObject(item);
            return item;
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key]; // Keep numbers, booleans, null as-is
        }
      });
      return sanitized;
    };

    req.body = sanitizeObject(req.body);
  }

  // Log sanitization for debugging in development only
  if (process.env.NODE_ENV === 'development') {
    console.debug('Request sanitized');
  }

  next();
};

export default { authenticateJWT, authorize, sanitizeRequest };
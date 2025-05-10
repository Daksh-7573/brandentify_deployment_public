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

    // For now, we'll check if user has a role property (needs to be added to schema)
    // This is a placeholder for future role implementation
    const userRole = (req.user as any).role || 'user';
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

/**
 * Sanitize all request parameters to prevent injection attacks
 */
export const sanitizeRequest = (req: Request, res: Response, next: NextFunction) => {
  // Helper function to sanitize strings
  const sanitizeString = (str: string): string => {
    // Basic XSS prevention - more comprehensive solutions should be used in production
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  // Sanitize body - only if it's not a file upload or multipart form
  if (req.body && req.headers['content-type']?.includes('application/json')) {
    const sanitizeObject = (obj: any): any => {
      if (!obj) return obj;
      
      const sanitized: any = {};
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          sanitized[key] = sanitizeString(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitized[key] = sanitizeObject(obj[key]);
        } else {
          sanitized[key] = obj[key];
        }
      });
      return sanitized;
    };

    req.body = sanitizeObject(req.body);
  }

  next();
};

export default { authenticateJWT, authorize, sanitizeRequest };
import { Request, Response, NextFunction } from 'express';

// Simple performance optimization middleware
export function performanceMiddleware() {
  return (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    
    // Add response headers for performance
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Remove X-Frame-Options to allow iframe embedding
    res.removeHeader('X-Frame-Options');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Cache static API responses for user data, but exclude quest endpoints
    if (req.method === 'GET' && req.path.includes('/users/') && !req.path.includes('/quests')) {
      res.setHeader('Cache-Control', 'public, max-age=30'); // 30 seconds cache
    }
    
    // Quest endpoints need fresh data to reflect completion state changes
    if (req.method === 'GET' && req.path.includes('/quests')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    
    // Log slow requests
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 2000) {
        console.warn(`Slow request detected: ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    
    next();
  };
}

// Simple in-memory cache for user data
const userCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

export function getUserFromCache(key: string) {
  const cached = userCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

export function setUserCache(key: string, data: any) {
  userCache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old entries
  if (userCache.size > 100) {
    const now = Date.now();
    for (const [k, v] of Array.from(userCache.entries())) {
      if (now - v.timestamp > CACHE_TTL) {
        userCache.delete(k);
      }
    }
  }
}
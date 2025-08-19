import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache for frequently requested data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function cacheMiddleware(ttlSeconds: number = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(cacheKey);
    
    // Check if we have valid cached data
    if (cached && Date.now() - cached.timestamp < cached.ttl * 1000) {
      console.log(`Cache hit for ${cacheKey}`);
      return res.json(cached.data);
    }

    // Store original json method
    const originalJson = res.json;
    
    // Override json method to cache response
    res.json = function(data: any) {
      // Cache successful responses only
      if (res.statusCode === 200) {
        cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
          ttl: ttlSeconds
        });
        
        // Clean up old cache entries periodically
        if (cache.size > 100) {
          const now = Date.now();
          for (const [key, value] of cache.entries()) {
            if (now - value.timestamp > value.ttl * 1000) {
              cache.delete(key);
            }
          }
        }
      }
      
      return originalJson.call(this, data);
    };

    next();
  };
}

export function clearCache(pattern?: string) {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}
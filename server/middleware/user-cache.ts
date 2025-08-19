import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache for user data
const userDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 30 * 1000; // 30 seconds

export function getCachedUserData(key: string) {
  const cached = userDataCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for user data: ${key}`);
    return cached.data;
  }
  return null;
}

export function setCachedUserData(key: string, data: any) {
  userDataCache.set(key, { data, timestamp: Date.now() });
  
  // Clean up old entries
  if (userDataCache.size > 50) {
    const now = Date.now();
    for (const [k, v] of userDataCache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        userDataCache.delete(k);
      }
    }
  }
}

export function clearUserDataCache(pattern?: string) {
  if (pattern) {
    for (const key of userDataCache.keys()) {
      if (key.includes(pattern)) {
        userDataCache.delete(key);
      }
    }
  } else {
    userDataCache.clear();
  }
}
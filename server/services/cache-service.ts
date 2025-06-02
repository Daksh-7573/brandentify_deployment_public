/**
 * Enterprise Caching Service
 * Provides Redis-based caching for improved performance and scalability
 */

import Redis from 'ioredis';

interface CacheService {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttl?: number): Promise<void>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  flush(): Promise<void>;
}

class RedisCacheService implements CacheService {
  private redis: Redis;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redis = new Redis(redisUrl, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    this.redis.on('error', (err) => {
      console.error('[Cache Service] Redis connection error:', err);
    });

    this.redis.on('connect', () => {
      console.log('[Cache Service] Redis connected successfully');
    });
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('[Cache Service] Get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, value);
    } catch (error) {
      console.error('[Cache Service] Set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('[Cache Service] Delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error('[Cache Service] Exists error:', error);
      return false;
    }
  }

  async flush(): Promise<void> {
    try {
      await this.redis.flushall();
    } catch (error) {
      console.error('[Cache Service] Flush error:', error);
    }
  }
}

// Fallback in-memory cache for development
class MemoryCacheService implements CacheService {
  private cache = new Map<string, { value: string; expires: number }>();

  async get(key: string): Promise<string | null> {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    this.cache.set(key, {
      value,
      expires: Date.now() + (ttl * 1000)
    });
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    return this.cache.has(key);
  }

  async flush(): Promise<void> {
    this.cache.clear();
  }
}

// Auto-detect cache service based on environment
export const cacheService: CacheService = process.env.REDIS_URL 
  ? new RedisCacheService() 
  : new MemoryCacheService();

// Cache key generators for consistent naming
export const CacheKeys = {
  user: (id: string | number) => `user:${id}`,
  userProjects: (userId: string | number) => `user:${userId}:projects`,
  userSkills: (userId: string | number) => `user:${userId}:skills`,
  userExperiences: (userId: string | number) => `user:${userId}:experiences`,
  userEducations: (userId: string | number) => `user:${userId}:educations`,
  projectCollaborators: (projectId: string | number) => `project:${projectId}:collaborators`,
  projectEndorsements: (projectId: string | number) => `project:${projectId}:endorsements`,
  pulseReactions: (pulseId: string | number) => `pulse:${pulseId}:reactions`,
  userReactionQuota: (userId: string | number) => `user:${userId}:quota`,
  session: (sessionId: string) => `session:${sessionId}`,
  apiResponse: (endpoint: string, params?: string) => `api:${endpoint}${params ? `:${params}` : ''}`
};

// Cache helper functions
export async function cacheApiResponse<T>(
  key: string, 
  fetchFn: () => Promise<T>, 
  ttl: number = 300
): Promise<T> {
  try {
    const cached = await cacheService.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetchFn();
    await cacheService.set(key, JSON.stringify(data), ttl);
    return data;
  } catch (error) {
    console.error('[Cache Helper] Error:', error);
    return await fetchFn();
  }
}

export async function invalidateUserCache(userId: string | number): Promise<void> {
  const keys = [
    CacheKeys.user(userId),
    CacheKeys.userProjects(userId),
    CacheKeys.userSkills(userId),
    CacheKeys.userExperiences(userId),
    CacheKeys.userEducations(userId),
    CacheKeys.userReactionQuota(userId)
  ];

  await Promise.all(keys.map(key => cacheService.del(key)));
}

export async function invalidateProjectCache(projectId: string | number): Promise<void> {
  const keys = [
    CacheKeys.projectCollaborators(projectId),
    CacheKeys.projectEndorsements(projectId)
  ];

  await Promise.all(keys.map(key => cacheService.del(key)));
}
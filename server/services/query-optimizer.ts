/**
 * Query Optimization Service
 * Intelligent caching and query optimization for enterprise scaling
 */

import { cacheService, CacheKeys } from './cache-service';
import { executeWithMetrics } from '../db-pool';

interface QueryConfig {
  ttl?: number; // Time to live in seconds
  forceRefresh?: boolean; // Bypass cache
  enableMetrics?: boolean; // Performance monitoring
}

interface CacheStrategy {
  userProfile: number; // 5 minutes
  userLists: number; // 2 minutes
  staticData: number; // 30 minutes
  searchResults: number; // 1 minute
  realtimeData: number; // 30 seconds
}

const CACHE_TTL: CacheStrategy = {
  userProfile: 300,
  userLists: 120,
  staticData: 1800,
  searchResults: 60,
  realtimeData: 30
};

export class QueryOptimizer {
  private static instance: QueryOptimizer;

  static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  /**
   * Optimized user data fetching with intelligent caching
   */
  async getUserWithCache<T>(
    userId: string | number,
    fetchFn: () => Promise<T>,
    config: QueryConfig = {}
  ): Promise<T> {
    const cacheKey = CacheKeys.user(userId);
    const ttl = config.ttl || CACHE_TTL.userProfile;
    
    if (config.forceRefresh) {
      await cacheService.del(cacheKey);
    }

    const queryName = `getUserWithCache:${userId}`;
    
    return this.executeOptimizedQuery(
      queryName,
      cacheKey,
      fetchFn,
      ttl,
      config.enableMetrics
    );
  }

  /**
   * Optimized list data fetching (projects, skills, experiences, etc.)
   */
  async getUserListWithCache<T>(
    userId: string | number,
    listType: string,
    fetchFn: () => Promise<T>,
    config: QueryConfig = {}
  ): Promise<T> {
    const cacheKey = `${CacheKeys.user(userId)}:${listType}`;
    const ttl = config.ttl || CACHE_TTL.userLists;
    
    if (config.forceRefresh) {
      await cacheService.del(cacheKey);
    }

    const queryName = `getUserList:${userId}:${listType}`;
    
    return this.executeOptimizedQuery(
      queryName,
      cacheKey,
      fetchFn,
      ttl,
      config.enableMetrics
    );
  }

  /**
   * Optimized search queries with short-term caching
   */
  async getSearchResultsWithCache<T>(
    searchQuery: string,
    searchType: string,
    fetchFn: () => Promise<T>,
    config: QueryConfig = {}
  ): Promise<T> {
    // Create cache key from search parameters
    const searchHash = Buffer.from(`${searchType}:${searchQuery}`).toString('base64');
    const cacheKey = `search:${searchHash}`;
    const ttl = config.ttl || CACHE_TTL.searchResults;
    
    if (config.forceRefresh) {
      await cacheService.del(cacheKey);
    }

    const queryName = `getSearchResults:${searchType}`;
    
    return this.executeOptimizedQuery(
      queryName,
      cacheKey,
      fetchFn,
      ttl,
      config.enableMetrics
    );
  }

  /**
   * Optimized real-time data with minimal caching
   */
  async getRealtimeDataWithCache<T>(
    dataKey: string,
    fetchFn: () => Promise<T>,
    config: QueryConfig = {}
  ): Promise<T> {
    const cacheKey = `realtime:${dataKey}`;
    const ttl = config.ttl || CACHE_TTL.realtimeData;
    
    if (config.forceRefresh) {
      await cacheService.del(cacheKey);
    }

    const queryName = `getRealtimeData:${dataKey}`;
    
    return this.executeOptimizedQuery(
      queryName,
      cacheKey,
      fetchFn,
      ttl,
      config.enableMetrics
    );
  }

  /**
   * Core optimized query execution with caching and metrics
   */
  private async executeOptimizedQuery<T>(
    queryName: string,
    cacheKey: string,
    fetchFn: () => Promise<T>,
    ttl: number,
    enableMetrics: boolean = true
  ): Promise<T> {
    try {
      // Try cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        try {
          const result = JSON.parse(cached);
          if (enableMetrics && process.env.NODE_ENV === 'development') {
            console.log(`[Cache Hit] ${queryName}`);
          }
          return result;
        } catch (parseError) {
          // Cache corruption, remove and continue to fetch
          await cacheService.del(cacheKey);
        }
      }

      // Cache miss - fetch from database
      const fetchWithMetrics = enableMetrics 
        ? () => executeWithMetrics(queryName, fetchFn)
        : fetchFn;

      const result = await fetchWithMetrics();

      // Cache the result
      try {
        await cacheService.set(cacheKey, JSON.stringify(result), ttl);
        if (enableMetrics && process.env.NODE_ENV === 'development') {
          console.log(`[Cache Set] ${queryName} (TTL: ${ttl}s)`);
        }
      } catch (cacheError) {
        console.warn(`[Cache Warning] Failed to cache ${queryName}:`, cacheError);
      }

      return result;
    } catch (error) {
      console.error(`[Query Error] ${queryName}:`, error);
      throw error;
    }
  }

  /**
   * Batch invalidation for related data
   */
  async invalidateUserData(userId: string | number): Promise<void> {
    const patterns = [
      CacheKeys.user(userId),
      `${CacheKeys.user(userId)}:projects`,
      `${CacheKeys.user(userId)}:skills`,
      `${CacheKeys.user(userId)}:experiences`,
      `${CacheKeys.user(userId)}:educations`,
      `${CacheKeys.user(userId)}:services`,
      CacheKeys.userReactionQuota(userId)
    ];

    await Promise.all(patterns.map(key => cacheService.del(key)));
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache Invalidation] Cleared ${patterns.length} keys for user ${userId}`);
    }
  }

  /**
   * Batch invalidation for project-related data
   */
  async invalidateProjectData(projectId: string | number, userId?: string | number): Promise<void> {
    const patterns = [
      CacheKeys.projectCollaborators(projectId),
      CacheKeys.projectEndorsements(projectId)
    ];

    if (userId) {
      patterns.push(`${CacheKeys.user(userId)}:projects`);
    }

    await Promise.all(patterns.map(key => cacheService.del(key)));
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache Invalidation] Cleared ${patterns.length} keys for project ${projectId}`);
    }
  }

  /**
   * Performance statistics
   */
  async getCacheStats(): Promise<{
    isRedisConnected: boolean;
    cacheType: string;
  }> {
    return {
      isRedisConnected: process.env.REDIS_URL ? await cacheService.exists('health-check') : false,
      cacheType: process.env.REDIS_URL ? 'Redis' : 'Memory'
    };
  }

  /**
   * Warm up frequently accessed data
   */
  async warmupCache(userId: string | number): Promise<void> {
    // This would be called after user login to pre-populate cache
    const warmupKeys = [
      'projects',
      'skills', 
      'experiences',
      'educations'
    ];

    // Note: Actual implementation would fetch these in background
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Cache Warmup] Preparing cache for user ${userId} (${warmupKeys.length} datasets)`);
    }
  }
}

// Export singleton instance
export const queryOptimizer = QueryOptimizer.getInstance();
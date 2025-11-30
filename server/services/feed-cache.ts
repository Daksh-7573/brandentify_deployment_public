/**
 * Feed Cache Service - Redis-backed for production parity
 * 
 * Caches AI-ranked feeds for 15-30 minutes per user to balance
 * performance and freshness. Uses Redis (with fallback to memory) for consistency
 * between testing and production environments.
 */

import { FeedRankingResult } from './ai-feed-ranker.js';
import { cacheService } from './cache-service.js';

interface CacheEntry {
  result: FeedRankingResult;
  timestamp: number;
  userId: number;
}

export class FeedCache {
  private readonly TTL_SECONDS: number;
  private fallbackCache: Map<number, CacheEntry> = new Map(); // Fallback if Redis unavailable

  constructor(ttlMinutes: number = 20) {
    this.TTL_SECONDS = ttlMinutes * 60;
    
    // Cleanup expired entries every 5 minutes (for fallback cache)
    setInterval(() => this.cleanupFallback(), 5 * 60 * 1000);
  }

  /**
   * Get cached feed for user (if not expired)
   */
  async get(userId: number): Promise<FeedRankingResult | null> {
    const cacheKey = `feed:${userId}`;
    
    try {
      // Try Redis first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        console.log(`[FeedCache] Cache HIT for user ${userId} (Redis)`);
        return JSON.parse(cached);
      }
    } catch (err) {
      console.log(`[FeedCache] Redis read failed, falling back to memory: ${err}`);
      // Fall through to memory cache
    }

    // Fallback to in-memory cache
    const entry = this.fallbackCache.get(userId);
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.TTL_SECONDS * 1000) {
      this.fallbackCache.delete(userId);
      return null;
    }

    console.log(`[FeedCache] Cache HIT for user ${userId} (Memory fallback)`);
    return entry.result;
  }

  /**
   * Store feed in cache
   */
  async set(userId: number, result: FeedRankingResult): Promise<void> {
    const cacheKey = `feed:${userId}`;
    
    try {
      // Store in Redis
      await cacheService.set(cacheKey, JSON.stringify(result), this.TTL_SECONDS);
      console.log(`[FeedCache] Cached feed for user ${userId} (Redis)`);
    } catch (err) {
      console.log(`[FeedCache] Redis write failed, using memory fallback: ${err}`);
      // Fallback to in-memory
      this.fallbackCache.set(userId, {
        result,
        timestamp: Date.now(),
        userId,
      });
    }
  }

  /**
   * Invalidate cache for specific user
   */
  async invalidate(userId: number): Promise<void> {
    const cacheKey = `feed:${userId}`;
    
    try {
      await cacheService.del(cacheKey);
      console.log(`[FeedCache] Invalidated cache for user ${userId} (Redis)`);
    } catch (err) {
      console.log(`[FeedCache] Redis delete failed: ${err}`);
    }

    // Also clear from memory
    const deleted = this.fallbackCache.delete(userId);
    if (deleted) {
      console.log(`[FeedCache] Invalidated cache for user ${userId} (Memory)`);
    }
  }

  /**
   * Invalidate all caches (e.g., when new global pulse created)
   */
  async invalidateAll(): Promise<void> {
    try {
      // Clear Redis cache
      await cacheService.flush();
      console.log(`[FeedCache] Invalidated all cached feeds (Redis)`);
    } catch (err) {
      console.log(`[FeedCache] Redis flush failed: ${err}`);
    }

    // Clear memory
    const count = this.fallbackCache.size;
    this.fallbackCache.clear();
    console.log(`[FeedCache] Invalidated all ${count} cached feeds (Memory)`);
  }

  /**
   * Cleanup expired entries in fallback cache
   */
  private cleanupFallback(): void {
    const now = Date.now();
    const expiredUsers: number[] = [];

    for (const [userId, entry] of this.fallbackCache.entries()) {
      if (now - entry.timestamp > this.TTL_SECONDS * 1000) {
        expiredUsers.push(userId);
      }
    }

    for (const userId of expiredUsers) {
      this.fallbackCache.delete(userId);
    }

    if (expiredUsers.length > 0) {
      console.log(`[FeedCache] Cleaned up ${expiredUsers.length} expired entries (Memory)`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.fallbackCache.size,
      ttlMinutes: this.TTL_SECONDS / 60,
      storageType: 'Redis + Memory Fallback',
    };
  }
}

// Singleton instance
export const feedCache = new FeedCache(20); // 20-minute TTL

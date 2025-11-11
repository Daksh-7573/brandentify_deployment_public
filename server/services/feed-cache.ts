/**
 * Feed Cache Service
 * 
 * Caches AI-ranked feeds for 15-30 minutes per user to balance
 * performance and freshness. Invalidates on new pulses or user actions.
 */

import { FeedRankingResult } from './ai-feed-ranker.js';

interface CacheEntry {
  result: FeedRankingResult;
  timestamp: number;
  userId: number;
}

export class FeedCache {
  private cache: Map<number, CacheEntry>;
  private readonly TTL_MS: number;

  constructor(ttlMinutes: number = 20) {
    this.cache = new Map();
    this.TTL_MS = ttlMinutes * 60 * 1000;
    
    // Cleanup expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get cached feed for user (if not expired)
   */
  get(userId: number): FeedRankingResult | null {
    const entry = this.cache.get(userId);
    
    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.TTL_MS) {
      this.cache.delete(userId);
      return null;
    }

    console.log(`[FeedCache] Cache HIT for user ${userId} (age: ${Math.round(age / 1000)}s)`);
    return entry.result;
  }

  /**
   * Store feed in cache
   */
  set(userId: number, result: FeedRankingResult): void {
    this.cache.set(userId, {
      result,
      timestamp: Date.now(),
      userId,
    });
    console.log(`[FeedCache] Cached feed for user ${userId}`);
  }

  /**
   * Invalidate cache for specific user
   */
  invalidate(userId: number): void {
    const deleted = this.cache.delete(userId);
    if (deleted) {
      console.log(`[FeedCache] Invalidated cache for user ${userId}`);
    }
  }

  /**
   * Invalidate all caches (e.g., when new global pulse created)
   */
  invalidateAll(): void {
    const count = this.cache.size;
    this.cache.clear();
    console.log(`[FeedCache] Invalidated all ${count} cached feeds`);
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredUsers: number[] = [];

    for (const [userId, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.TTL_MS) {
        expiredUsers.push(userId);
      }
    }

    for (const userId of expiredUsers) {
      this.cache.delete(userId);
    }

    if (expiredUsers.length > 0) {
      console.log(`[FeedCache] Cleaned up ${expiredUsers.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      ttlMinutes: this.TTL_MS / (60 * 1000),
    };
  }
}

// Singleton instance
export const feedCache = new FeedCache(20); // 20-minute TTL

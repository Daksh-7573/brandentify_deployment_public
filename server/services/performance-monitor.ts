/**
 * Performance Monitoring Service
 * Tracks system performance and provides scaling insights
 */

import { dbManager } from '../db-pool';
import { cacheService } from './cache-service';

interface PerformanceMetrics {
  timestamp: number;
  responseTime: number;
  activeConnections: number;
  cacheHitRate: number;
  memoryUsage: number;
  cpuUsage: number;
  requestsPerSecond: number;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  database: boolean;
  cache: boolean;
  memory: number;
  uptime: number;
  version: string;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private requestCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;
  private startTime = Date.now();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record API request performance
   */
  recordRequest(responseTime: number): void {
    this.requestCount++;
    
    // Keep only last 100 metrics to prevent memory bloat
    if (this.metrics.length >= 100) {
      this.metrics.shift();
    }

    this.metrics.push({
      timestamp: Date.now(),
      responseTime,
      activeConnections: this.getActiveConnections(),
      cacheHitRate: this.getCacheHitRate(),
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: 0, // Would need external monitoring for real CPU usage
      requestsPerSecond: this.getRequestsPerSecond()
    });
  }

  /**
   * Record cache hit/miss
   */
  recordCacheHit(): void {
    this.cacheHits++;
  }

  recordCacheMiss(): void {
    this.cacheMisses++;
  }

  /**
   * Get system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const dbHealthy = await this.checkDatabaseHealth();
    const cacheHealthy = await this.checkCacheHealth();
    const memory = this.getMemoryUsage();
    
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (!dbHealthy || !cacheHealthy) {
      status = 'critical';
    } else if (memory > 80 || this.getAverageResponseTime() > 2000) {
      status = 'degraded';
    }

    return {
      status,
      database: dbHealthy,
      cache: cacheHealthy,
      memory,
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0'
    };
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary() {
    const recentMetrics = this.metrics.slice(-10);
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length 
      : 0;

    return {
      averageResponseTime: Math.round(avgResponseTime),
      totalRequests: this.requestCount,
      requestsPerSecond: this.getRequestsPerSecond(),
      cacheHitRate: this.getCacheHitRate(),
      uptime: Date.now() - this.startTime,
      memoryUsage: this.getMemoryUsage(),
      activeConnections: this.getActiveConnections()
    };
  }

  /**
   * Get scaling recommendations
   */
  getScalingRecommendations(): string[] {
    const recommendations: string[] = [];
    const avgResponseTime = this.getAverageResponseTime();
    const memory = this.getMemoryUsage();
    const cacheHitRate = this.getCacheHitRate();

    if (avgResponseTime > 1000) {
      recommendations.push('Consider enabling query caching or adding database read replicas');
    }

    if (memory > 80) {
      recommendations.push('Memory usage is high - consider scaling to more instances');
    }

    if (cacheHitRate < 50) {
      recommendations.push('Low cache hit rate - review caching strategy');
    }

    if (this.getActiveConnections() > 15) {
      recommendations.push('High database connection usage - consider connection pooling');
    }

    if (this.getRequestsPerSecond() > 50) {
      recommendations.push('High request volume - consider horizontal scaling');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing well within normal parameters');
    }

    return recommendations;
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      return await dbManager.testConnection();
    } catch {
      return false;
    }
  }

  private async checkCacheHealth(): Promise<boolean> {
    try {
      await cacheService.set('health-check', 'ok', 10);
      const result = await cacheService.get('health-check');
      return result === 'ok';
    } catch {
      return false;
    }
  }

  private getActiveConnections(): number {
    const stats = dbManager.getPoolStats();
    return stats.totalCount - stats.idleCount;
  }

  private getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses;
    return total > 0 ? Math.round((this.cacheHits / total) * 100) : 0;
  }

  private getMemoryUsage(): number {
    const usage = process.memoryUsage();
    const usedMB = usage.heapUsed / 1024 / 1024;
    const totalMB = usage.heapTotal / 1024 / 1024;
    return Math.round((usedMB / totalMB) * 100);
  }

  private getRequestsPerSecond(): number {
    const uptimeSeconds = (Date.now() - this.startTime) / 1000;
    return uptimeSeconds > 0 ? Math.round(this.requestCount / uptimeSeconds) : 0;
  }

  private getAverageResponseTime(): number {
    if (this.metrics.length === 0) return 0;
    const recent = this.metrics.slice(-20);
    return recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
  }
}

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance();
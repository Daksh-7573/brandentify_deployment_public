/**
 * Database Connection Pool Management
 * Optimizes database connections for enterprise scaling
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Enhanced connection pool configuration for high-load scenarios
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  // Connection pool settings for enterprise scaling
  max: parseInt(process.env.DB_POOL_MAX || '20'), // Maximum connections in pool
  min: parseInt(process.env.DB_POOL_MIN || '5'),  // Minimum connections to maintain
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'), // 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'), // 10 seconds
  
  // Performance optimizations
  statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT || '60000'), // 60 seconds
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'), // 30 seconds
  
  // Connection retry configuration
  application_name: 'brandentifier-app',
  
  // SSL configuration for production
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create optimized connection pool
export const pool = new Pool(poolConfig);

// Enhanced database instance with performance monitoring
export const db = drizzle({ 
  client: pool, 
  schema,
  logger: process.env.NODE_ENV === 'development' ? {
    logQuery: (query: string, params: unknown[]) => {
      console.log(`[DB Query] ${query}`, params.length > 0 ? `[Params: ${params.length}]` : '');
    }
  } : false
});

// Connection pool monitoring and health checks
export class DatabaseManager {
  private static instance: DatabaseManager;
  private healthCheckInterval?: NodeJS.Timeout;

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Test initial connection
      await this.testConnection();
      
      // Start health monitoring
      this.startHealthMonitoring();
      
      console.log('[Database Manager] Connection pool initialized successfully');
      console.log(`[Database Manager] Pool config: max=${poolConfig.max}, min=${poolConfig.min}`);
    } catch (error) {
      console.error('[Database Manager] Failed to initialize:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT NOW() as current_time, version() as pg_version');
      client.release();
      
      console.log('[Database Manager] Connection test successful');
      console.log(`[Database Manager] PostgreSQL version: ${result.rows[0].pg_version.split(' ')[1]}`);
      return true;
    } catch (error) {
      console.error('[Database Manager] Connection test failed:', error);
      return false;
    }
  }

  getPoolStats() {
    return {
      totalCount: pool.totalCount,
      idleCount: pool.idleCount,
      waitingCount: pool.waitingCount,
      maxConnections: poolConfig.max,
      minConnections: poolConfig.min
    };
  }

  startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      const stats = this.getPoolStats();
      
      // Log pool statistics periodically
      if (process.env.NODE_ENV === 'development') {
        console.log(`[DB Pool Stats] Total: ${stats.totalCount}, Idle: ${stats.idleCount}, Waiting: ${stats.waitingCount}`);
      }
      
      // Alert if pool is getting overwhelmed
      if (stats.waitingCount > 5) {
        console.warn(`[DB Pool Warning] High waiting count: ${stats.waitingCount} connections waiting`);
      }
      
      // Alert if pool utilization is very high
      const utilization = ((stats.totalCount - stats.idleCount) / stats.maxConnections) * 100;
      if (utilization > 80) {
        console.warn(`[DB Pool Warning] High utilization: ${utilization.toFixed(1)}% of connections in use`);
      }
    }, 60000); // Check every minute
  }

  async gracefulShutdown(): Promise<void> {
    console.log('[Database Manager] Starting graceful shutdown...');
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    try {
      await pool.end();
      console.log('[Database Manager] Connection pool closed successfully');
    } catch (error) {
      console.error('[Database Manager] Error during shutdown:', error);
    }
  }
}

// Query performance monitoring wrapper
export async function executeWithMetrics<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await queryFn();
    const duration = Date.now() - startTime;
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development' && duration > 1000) {
      console.warn(`[Slow Query] ${queryName} took ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Query Error] ${queryName} failed after ${duration}ms:`, error);
    throw error;
  }
}

// Initialize database manager
const dbManager = DatabaseManager.getInstance();

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await dbManager.gracefulShutdown();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await dbManager.gracefulShutdown();
  process.exit(0);
});

export { dbManager };
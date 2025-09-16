import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
export { sql };
import ws from "ws";
import * as schema from "@shared/schema";
import crypto from "crypto";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool for maximum performance
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Optimize for fast connections
  connectionTimeoutMillis: 5000, // 5 seconds
  idleTimeoutMillis: 30000, // 30 seconds
  // Optimize connection pool for better performance
  max: 10, // Fewer connections, better performance
  min: 2,  // Keep minimum connections alive
  acquireTimeoutMillis: 3000, // 3 seconds max wait
});

// Handle pool errors to prevent crashes
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // Don't crash the app, just log the error
});

export const db = drizzle({ client: pool, schema });

// Add a ping function to verify database connection is working
export async function pingDatabase() {
  try {
    console.log("Running database connectivity test");
    const testResult = await pool.query("SELECT 'Database connection test' as test");
    console.log(`Database connection test result: ${testResult.rows[0].test}`);
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

// Retry mechanism for database operations
export async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 3, delay = 500): Promise<T> {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation failed (attempt ${i + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        // Increase delay for next retry (exponential backoff)
        delay *= 2;
      }
    }
  }
  
  throw lastError;
}

// Helper function to execute raw SQL queries with retry
export async function executeRawQuery(query: string, params: any[] = []) {
  return executeWithRetry(async () => {
    try {
      // For static queries, this approach is still needed
      // but should only be used when dynamically building queries
      // or when sql template literals aren't an option
      const preparedQuery = query.replace(/\$(\d+)/g, (_, n) => {
        return `\${params[${parseInt(n) - 1}]}`;
      });
      
      // Create a dynamic eval of sql template literal
      const templateFn = new Function('sql', 'params', `return sql\`${preparedQuery}\``);
      return await db.execute(templateFn(sql, params));
    } catch (error) {
      console.error("Error executing raw query:", error);
      throw error;
    }
  });
}

// 🔍 DATABASE FINGERPRINTING SYSTEM - Secure verification without exposing credentials
export function createDatabaseFingerprint(): string {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return 'NO_DATABASE_URL';
  
  try {
    const url = new URL(databaseUrl);
    // Create secure fingerprint from host + database + port combination
    const fingerprintData = `${url.hostname}:${url.port || '5432'}:${url.pathname}`;
    return crypto.createHash('sha256').update(fingerprintData).digest('hex').substring(0, 16);
  } catch (error) {
    console.error('Error creating database fingerprint:', error);
    return 'FINGERPRINT_ERROR';
  }
}

export function getMaskedDatabaseInfo() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return { error: 'NO_DATABASE_URL' };
  
  try {
    const url = new URL(databaseUrl);
    return {
      fingerprint: createDatabaseFingerprint(),
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.replace('/', ''),
      masked_host: url.hostname.substring(0, 8) + '***',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting masked database info:', error);
    return { error: 'DATABASE_INFO_ERROR', details: error.message };
  }
}

export async function getDatabaseFingerprint() {
  try {
    const maskedInfo = getMaskedDatabaseInfo();
    
    // Get additional database metadata
    const dbResult = await pool.query(`
      SELECT 
        current_database() as database_name,
        current_schema() as schema_name,
        version() as postgres_version,
        inet_server_addr() as server_ip,
        inet_server_port() as server_port,
        NOW() as current_time
    `);
    
    const dbInfo = dbResult.rows[0];
    
    return {
      ...maskedInfo,
      database_name: dbInfo.database_name,
      schema_name: dbInfo.schema_name,
      postgres_version: dbInfo.postgres_version?.substring(0, 20) + '...',
      server_ip: dbInfo.server_ip,
      server_port: dbInfo.server_port,
      current_time: dbInfo.current_time,
      connection_pool: {
        max_connections: 10,
        min_connections: 2,
        total_count: pool.totalCount,
        idle_count: pool.idleCount,
        waiting_count: pool.waitingCount
      }
    };
  } catch (error) {
    console.error('Error getting database fingerprint:', error);
    return { 
      ...getMaskedDatabaseInfo(),
      error: 'DATABASE_QUERY_ERROR', 
      details: error.message 
    };
  }
}

export async function logDatabaseStartupInfo() {
  console.log('\n🔍 DATABASE STARTUP VERIFICATION');
  console.log('=====================================');
  
  const fingerprint = await getDatabaseFingerprint();
  
  console.log(`Database Fingerprint: ${fingerprint.fingerprint}`);
  console.log(`Masked Host: ${fingerprint.masked_host}`);
  console.log(`Database Name: ${fingerprint.database_name}`);
  console.log(`Environment: ${fingerprint.environment}`);
  console.log(`Connection Pool: ${fingerprint.connection_pool?.total_count || 'N/A'} total, ${fingerprint.connection_pool?.idle_count || 'N/A'} idle`);
  
  if (fingerprint.error) {
    console.error(`⚠️ Database Error: ${fingerprint.error}`);
    if (fingerprint.details) {
      console.error(`Error Details: ${fingerprint.details}`);
    }
  } else {
    console.log('✅ Database connection verified');
  }
  
  console.log('=====================================\n');
}

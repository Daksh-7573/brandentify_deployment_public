import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
export { sql };
import * as schema from "@shared/schema";
import crypto from "crypto";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

function normalizeDatabaseUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const sslMode = parsed.searchParams.get("sslmode");

    if (!sslMode || sslMode === "prefer" || sslMode === "require" || sslMode === "verify-ca") {
      parsed.searchParams.set("sslmode", "verify-full");
    }

    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

const secureDatabaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

if (secureDatabaseUrl !== process.env.DATABASE_URL) {
  process.env.DATABASE_URL = secureDatabaseUrl;
  console.log("[DB] DATABASE_URL normalized to use sslmode=verify-full");
}

// Configure the pool for maximum performance
export const pool = new Pool({ 
  connectionString: secureDatabaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
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

export const db = drizzle(pool, { schema });

export async function ensureMuskChatSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS musk_chat_conversations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL DEFAULT 'New chat',
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS musk_chat_conversations_user_updated_idx
      ON musk_chat_conversations (user_id, updated_at DESC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS musk_chat_messages (
      id SERIAL PRIMARY KEY,
      conversation_id INTEGER NOT NULL REFERENCES musk_chat_conversations(id) ON DELETE CASCADE,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
      content TEXT NOT NULL,
      provider_used TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS musk_chat_messages_conversation_created_idx
      ON musk_chat_messages (conversation_id, created_at ASC);
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS musk_resume_uploads (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      conversation_id INTEGER REFERENCES musk_chat_conversations(id) ON DELETE SET NULL,
      file_name TEXT NOT NULL,
      file_url TEXT,
      extracted_text TEXT NOT NULL,
      ai_feedback TEXT NOT NULL,
      score INTEGER,
      provider_used TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS musk_resume_uploads_user_created_idx
      ON musk_resume_uploads (user_id, created_at DESC);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS musk_resume_uploads_conversation_idx
      ON musk_resume_uploads (conversation_id);
  `);
}

export async function ensureQuestEngineSchema() {
  await pool.query(`
    ALTER TABLE quest_definitions
    ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'manual';
  `);

  await pool.query(`
    ALTER TABLE user_quests
    ALTER COLUMN assigned_date TYPE DATE
    USING assigned_date::date;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS quest_assignment_retries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
      retry_count INTEGER NOT NULL DEFAULT 0,
      last_attempt TIMESTAMP DEFAULT NOW(),
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

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

// Safe error wrapper for Node.js compatibility (prevents mutation of read-only error properties)
function wrapErrorSafely(error: unknown): Error {
  // If it's already a regular Error, return as-is
  if (error instanceof Error) {
    return error;
  }
  
  // For ErrorEvent or other non-Error objects, create a safe wrapper
  const message = error instanceof ErrorEvent 
    ? `${error.type}: ${error.message || 'unknown error'}`
    : String(error);
  
  const wrappedError = new Error(message);
  
  // Preserve original error in a property (not the message field)
  Object.defineProperty(wrappedError, 'originalError', {
    value: error,
    enumerable: false,
    writable: true,
    configurable: true
  });
  
  return wrappedError;
}

// Enterprise-grade retry mechanism for database operations with Neon cold-start support
export async function executeWithRetry<T>(operation: () => Promise<T>, maxRetries = 5): Promise<T> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      // Detect Neon-specific paused endpoint error
      const isNeonDisabled = 
        error.message?.includes("endpoint has been disabled") ||
        error.message?.includes("endpoint is paused") ||
        error.message?.includes("compute endpoint is suspended") ||
        error.code === '57P03'; // Neon-specific error code
      
      if (isNeonDisabled) {
        console.warn(`⏸️  Neon endpoint paused. Waiting for cold start... (attempt ${attempt + 1}/${maxRetries})`);
      } else {
        console.error(`❌ Database operation failed (attempt ${attempt + 1}/${maxRetries}):`, error.message || error);
      }
      
      attempt++;
      
      // If max retries reached, throw user-friendly error
      if (attempt >= maxRetries) {
        console.error('🚨 Database permanently failed after all retries');
        throw new Error('Database temporarily unavailable. Please try again in a few moments.');
      }
      
      // Exponential backoff: 2s, 4s, 6s, 8s, 10s (capped at 10s)
      const backoffMs = Math.min(2000 * attempt, 10000);
      console.log(`⏳ Retrying in ${backoffMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffMs));
    }
  }
  
  throw new Error('Unexpected database failure.');
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

// Automatic database warm-up on server start (wakes up Neon from cold start)
export async function warmupDatabase() {
  console.log('\n🔥 Warming up database connection...');
  console.log('=====================================');
  
  try {
    await ensureQuestEngineSchema();
    await ensureMuskChatSchema();

    await executeWithRetry(async () => {
      const result = await pool.query('SELECT 1 as warmup_check, NOW() as warmup_time');
      return result.rows[0];
    });
    
    console.log('✅ Database warm-up complete - ready for queries');
    console.log('=====================================\n');
  } catch (error: any) {
    console.error('🚨 Database warm-up failed:', error.message);
    console.error('⚠️  Server will continue, but database may be unavailable');
    console.error('=====================================\n');
  }
}

// Database heartbeat to prevent Neon auto-pause during active development
let heartbeatInterval: NodeJS.Timeout | null = null;

export function startDatabaseHeartbeat(intervalMinutes: number = 4) {
  // Clear existing heartbeat if any
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
  }
  
  const intervalMs = intervalMinutes * 60 * 1000;
  console.log(`💓 Starting database heartbeat (every ${intervalMinutes} minutes)`);
  
  heartbeatInterval = setInterval(async () => {
    try {
      await pool.query('SELECT 1 as heartbeat');
      console.log('💓 Database heartbeat OK');
    } catch (error: any) {
      console.error('💔 Database heartbeat error:', error.message);
    }
  }, intervalMs);
  
  // Ensure interval doesn't prevent Node.js from exiting
  heartbeatInterval.unref();
}

export function stopDatabaseHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    console.log('💔 Database heartbeat stopped');
  }
}

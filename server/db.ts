import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
export { sql };
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// Check for DATABASE_URL in both locations (environment variable and deployment path)
let databaseUrl = process.env.DATABASE_URL;

// For deployments, check /tmp/replitdb if environment variable is not set
if (!databaseUrl) {
  try {
    const fs = require('fs');
    if (fs.existsSync('/tmp/replitdb')) {
      databaseUrl = fs.readFileSync('/tmp/replitdb', 'utf8').trim();
      console.log('🔧 Using DATABASE_URL from /tmp/replitdb for deployment');
    }
  } catch (error) {
    console.error('Failed to read DATABASE_URL from /tmp/replitdb:', error);
  }
}

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool for maximum performance
export const pool = new Pool({ 
  connectionString: databaseUrl,
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

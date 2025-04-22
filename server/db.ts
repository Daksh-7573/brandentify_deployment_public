import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
export { sql };
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Configure the pool with more robust settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  // Set longer timeouts to prevent disconnects during slowdowns
  connectionTimeoutMillis: 15000, // 15 seconds
  idleTimeoutMillis: 60000, // 1 minute
  // Increase max connections for better concurrency
  max: 20
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

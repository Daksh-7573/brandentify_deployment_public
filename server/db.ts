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

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });

// Helper function to execute raw SQL queries
export async function executeRawQuery(query: string, params: any[] = []) {
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
}

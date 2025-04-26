/**
 * Migration script to add industry column to projects table
 */
import { pool } from "./db";

async function executeQuery(queryText: string, params: any[] = []) {
  try {
    const result = await pool.query(queryText, params);
    return result;
  } catch (error) {
    console.error("Error executing query:", error);
    throw error;
  }
}

async function runMigration() {
  console.log("Starting migration to add industry column to projects table...");
  
  try {
    // Check if the column already exists to avoid errors
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'projects' AND column_name = 'industry'
    `;
    
    const columnExists = await executeQuery(checkColumnQuery);
    
    if (columnExists.rows.length === 0) {
      // Add the industry column
      const addColumnQuery = `
        ALTER TABLE projects
        ADD COLUMN industry TEXT
      `;
      
      await executeQuery(addColumnQuery);
      console.log("Successfully added industry column to projects table");
    } else {
      console.log("Industry column already exists in projects table");
    }
    
    console.log("Migration completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pool.end();
  }
}

// Run the migration
runMigration();
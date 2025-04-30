/**
 * Migration script to add resume-related fields to users table
 */

// Use pg client
const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function executeQuery(queryText, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(queryText, params);
  } finally {
    client.release();
  }
}

async function addResumeFields() {
  console.log("Adding resume-related fields to users table...");
  
  // Check if columns already exist
  const checkQuery = `
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name IN ('has_generated_resume', 'resume_url', 'resume_generated_at');
  `;
  
  const existingColumns = await executeQuery(checkQuery);
  const columnNames = existingColumns.rows.map(row => row.column_name);
  
  const columnsToAdd = [];
  
  // Add has_generated_resume if it doesn't exist
  if (!columnNames.includes('has_generated_resume')) {
    columnsToAdd.push(`ADD COLUMN has_generated_resume BOOLEAN DEFAULT false`);
  }
  
  // Add resume_url if it doesn't exist
  if (!columnNames.includes('resume_url')) {
    columnsToAdd.push(`ADD COLUMN resume_url TEXT`);
  }
  
  // Add resume_generated_at if it doesn't exist
  if (!columnNames.includes('resume_generated_at')) {
    columnsToAdd.push(`ADD COLUMN resume_generated_at TIMESTAMP`);
  }
  
  // Execute alter table if there are columns to add
  if (columnsToAdd.length > 0) {
    const alterTableQuery = `ALTER TABLE users ${columnsToAdd.join(', ')};`;
    await executeQuery(alterTableQuery);
    console.log("Successfully added resume fields to users table");
  } else {
    console.log("All resume fields already exist in users table");
  }
}

addResumeFields()
  .then(() => {
    console.log("Migration completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
import { db, pool } from "../db";
import { sql } from 'drizzle-orm';

async function checkData() {
  try {
    console.log("Checking database data...");
    
    // Check tables in the database
    const tablesResult = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("Tables in database:", tablesResult);
    if (Array.isArray(tablesResult)) {
      console.log(`Found ${tablesResult.length} tables`);
      for (const table of tablesResult) {
        console.log(`- ${table.table_name}`);
      }
    }
    
    // First, check if users table exists
    const userTableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    console.log("Users table exists:", userTableExists);
    
    // Check if user 1 exists by executing raw query
    const userCheckResult = await pool.query('SELECT * FROM users WHERE id = 1');
    console.log("User check result:", userCheckResult.rows.length > 0 ? "User found" : "User not found");
    
    if (userCheckResult.rows.length > 0) {
      console.log("User data:", userCheckResult.rows[0]);

      // Check skills with raw query
      const skillsResult = await pool.query('SELECT * FROM skills WHERE user_id = 1');
      console.log(`Skills for user 1: ${skillsResult.rows.length}`);
      
      // Check work experiences with raw query
      const experiencesResult = await pool.query('SELECT * FROM work_experiences WHERE user_id = 1');
      console.log(`Work experiences for user 1: ${experiencesResult.rows.length}`);
      
      // Check projects with raw query
      const projectsResult = await pool.query('SELECT * FROM projects WHERE user_id = 1');
      console.log(`Projects for user 1: ${projectsResult.rows.length}`);
    }
    
    await pool.end();
  } catch (error) {
    console.error("Error checking data:", error);
    await pool.end();
  }
}

checkData();
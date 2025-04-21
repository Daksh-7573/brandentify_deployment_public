import { db, pool } from "../db";
import { sql } from 'drizzle-orm';

async function checkData() {
  try {
    console.log("Checking database data...");
    
    // Check user
    const user = await db.execute(sql`SELECT * FROM users WHERE id = 1`);
    console.log("User:", user.length > 0 ? "Found" : "Not found");
    
    // Check skills
    const skills = await db.execute(sql`SELECT * FROM skills WHERE user_id = 1`);
    console.log(`Skills for user 1: ${skills.length}`);
    
    // Check work experiences
    const experiences = await db.execute(sql`SELECT * FROM work_experiences WHERE user_id = 1`);
    console.log(`Work experiences for user 1: ${experiences.length}`);
    
    // Check projects
    const projects = await db.execute(sql`SELECT * FROM projects WHERE user_id = 1`);
    console.log(`Projects for user 1: ${projects.length}`);
    
    // Check tables in the database
    const tables = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("Tables in database:");
    tables.forEach((table: any) => {
      console.log(`- ${table.table_name}`);
    });
    
    await pool.end();
  } catch (error) {
    console.error("Error checking data:", error);
    await pool.end();
  }
}

checkData();
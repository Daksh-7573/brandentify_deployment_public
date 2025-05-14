const { Pool, neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getColumnInfo() {
  // Query to get column names from the users table
  const columnQuery = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position;
  `;

  try {
    const usersResult = await pool.query(columnQuery, ["users"]);
    console.log("Users table columns:");
    console.table(usersResult.rows);

    const pulsesResult = await pool.query(columnQuery, ["pulses"]);
    console.log("\nPulses table columns:");
    console.table(pulsesResult.rows);
    
    const workExperiencesResult = await pool.query(columnQuery, ["work_experiences"]);
    console.log("\nWork Experiences table columns:");
    console.table(workExperiencesResult.rows);
    
    const userQuestsResult = await pool.query(columnQuery, ["user_quests"]);
    console.log("\nUser Quests table columns:");
    console.table(userQuestsResult.rows);

    await pool.end();
  } catch (error) {
    console.error("Error fetching column info:", error);
    await pool.end();
  }
}

getColumnInfo();
const { Pool } = require("@neondatabase/serverless");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function getColumnInfo() {
  // Query to get column names from the users table
  const usersQuery = `
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1 
    ORDER BY ordinal_position;
  `;

  try {
    const usersResult = await pool.query(usersQuery, ["users"]);
    console.log("Users table columns:");
    console.table(usersResult.rows);

    const pulsesResult = await pool.query(usersQuery, ["pulses"]);
    console.log("\nPulses table columns:");
    console.table(pulsesResult.rows);

    await pool.end();
  } catch (error) {
    console.error("Error fetching column info:", error);
    await pool.end();
  }
}

getColumnInfo();

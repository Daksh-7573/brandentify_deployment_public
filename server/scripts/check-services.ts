import { db, pool } from "../db";

async function main() {
  try {
    console.log("Checking services in the database...");
    
    // Query to check services table structure
    const tableStructure = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    
    console.log("Services table structure:");
    console.table(tableStructure.rows);
    
    // Check if any services exist
    const servicesCount = await pool.query('SELECT COUNT(*) FROM services');
    console.log(`Total services count: ${servicesCount.rows[0].count}`);
    
    // Get all services for inspection
    const allServices = await pool.query('SELECT * FROM services');
    console.log("Services data:");
    console.log(JSON.stringify(allServices.rows, null, 2));
    
    // Check services by user
    const userIds = await pool.query('SELECT id FROM users');
    
    if (userIds.rows.length > 0) {
      for (const userRow of userIds.rows) {
        const userId = userRow.id;
        const userServices = await pool.query('SELECT COUNT(*) FROM services WHERE user_id = $1', [userId]);
        console.log(`User ID ${userId} has ${userServices.rows[0].count} services`);
      }
    } else {
      console.log("No users found in the database.");
    }
    
  } catch (error) {
    console.error("Error checking services:", error);
  } finally {
    await pool.end();
  }
}

main();
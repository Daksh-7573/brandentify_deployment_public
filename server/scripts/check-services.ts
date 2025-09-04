import { db, pool, sql } from "../db";
import { services, users } from "@shared/schema";
import { count, eq } from "drizzle-orm";

async function main() {
  try {
    console.log("Checking services in the database...");
    
    // Query to check services table structure using sql template literal
    const tableStructure = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'services'
      ORDER BY ordinal_position
    `);
    
    console.log("Services table structure:");
    console.table(tableStructure.rows);
    
    // Check if any services exist using Drizzle query builder
    const servicesCountResult = await db.select({ count: count() }).from(services);
    console.log(`Total services count: ${servicesCountResult[0].count}`);
    
    // Get all services for inspection using Drizzle query builder
    const allServices = await db.select().from(services);
    console.log("Services data:");
    console.log(JSON.stringify(allServices, null, 2));
    
    // Check services by user using Drizzle query builder
    const userIds = await db.select({ id: users.id }).from(users);
    
    if (userIds.length > 0) {
      for (const userRow of userIds) {
        const userId = userRow.id;
        const userServicesResult = await db.select({ count: count() })
          .from(services)
          .where(eq(services.userId, userId));
        console.log(`User ID ${userId} has ${userServicesResult[0].count} services`);
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
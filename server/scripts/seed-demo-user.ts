import { InsertUser } from "@shared/schema";
import { db, pool } from "../db";
import { users } from "@shared/schema";
import * as crypto from "crypto";

async function main() {
  try {
    console.log("Starting demo user seeding script...");
    
    // Check if any users already exist
    const existingUsers = await pool.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(existingUsers.rows[0].count);
    
    if (userCount > 0) {
      console.log(`Database already has ${userCount} users. Skipping creation.`);
      return;
    }
    
    // Define the demo user
    const demoUser: InsertUser = {
      username: "demo_user",
      email: "demo@example.com",
      password: crypto.createHash('sha256').update('password123').digest('hex'),
      name: "Alex Morgan",
      phoneNumber: "+1 (555) 123-4567",
      photoURL: "https://randomuser.me/api/portraits/women/65.jpg",
      title: "Senior Product Designer",
      aboutMe: "Passionate product designer with 8+ years of experience creating exceptional digital experiences.",
      location: "San Francisco, CA",
      industry: "Software",
      domain: "Design",
      lookingFor: "mentoring",
      jobLevel: "mid-senior",
      profileCompleted: 90,
      emailVerified: true,
      visitingCardType: "creative"
    };
    
    // Insert the user
    console.log("Creating demo user...");
    const result = await db.insert(users).values(demoUser).returning();
    
    if (result && result.length > 0) {
      console.log(`Demo user created with ID: ${result[0].id}`);
    } else {
      console.log("Failed to create demo user.");
    }
    
    console.log("Demo user seeding completed!");
  } catch (error) {
    console.error("Error seeding demo user:", error);
  } finally {
    await pool.end();
  }
}

main();
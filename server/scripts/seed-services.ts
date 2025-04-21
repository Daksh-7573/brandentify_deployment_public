import { InsertService, serviceCategoryEnum } from "@shared/schema";
import { db, pool } from "../db";
import { services } from "@shared/schema";

async function main() {
  try {
    console.log("Starting services seeding script...");
    
    // Check if we have any users in the database
    const usersResult = await pool.query('SELECT id FROM users LIMIT 1');
    
    if (usersResult.rows.length === 0) {
      console.log("No users found in the database. Please run the demo user seed script first.");
      return;
    }
    
    const userId = usersResult.rows[0].id;
    console.log(`Found user with ID: ${userId}, will create services for this user.`);
    
    // Define the service data
    const serviceData: InsertService[] = [
      {
        userId,
        title: "UI/UX Design Consultation",
        description: "Expert consultation on user interface and experience design for web and mobile applications.",
        category: "design",
        priceUsd: 150,
        priceInr: 11000,
        isHourly: true,
        features: JSON.stringify([
          "User research and persona development",
          "Wireframing and prototyping",
          "Usability testing",
          "Design system creation"
        ]),
        imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5",
        order: 1,
        isActive: true
      },
      {
        userId,
        title: "Full-Stack Development",
        description: "End-to-end web application development using modern technologies and best practices.",
        category: "development",
        priceUsd: 2500,
        priceInr: 180000,
        isHourly: false,
        features: JSON.stringify([
          "Requirements gathering and analysis",
          "Front-end development with React/Next.js",
          "Back-end API development with Node.js",
          "Database design and implementation",
          "Deployment and CI/CD setup"
        ]),
        imageUrl: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2",
        order: 2,
        isActive: true
      },
      {
        userId,
        title: "Career Coaching",
        description: "Personalized coaching to help you advance in your tech career and achieve your professional goals.",
        category: "coaching",
        priceUsd: 80,
        priceInr: 6000,
        isHourly: true,
        features: JSON.stringify([
          "Resume and portfolio review",
          "Interview preparation",
          "Career path planning",
          "Negotiation strategies",
          "Personal branding"
        ]),
        imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72",
        order: 3,
        isActive: true
      }
    ];
    
    // Check if services already exist
    const existingServices = await pool.query('SELECT COUNT(*) FROM services WHERE user_id = $1', [userId]);
    const serviceCount = parseInt(existingServices.rows[0].count);
    
    if (serviceCount > 0) {
      console.log(`User already has ${serviceCount} services. Skipping creation.`);
      return;
    }
    
    // Insert the services
    for (const service of serviceData) {
      console.log(`Creating service: ${service.title}`);
      await db.insert(services).values(service);
    }
    
    console.log("Services seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding services:", error);
  } finally {
    await pool.end();
  }
}

main();
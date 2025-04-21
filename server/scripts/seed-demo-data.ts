import { db, sql } from "../db";

// Seed demo data for the test user with id=1
async function seedDemoData() {
  try {
    console.log("Starting to seed demo data...");
    
    // Check if user with id=1 exists directly with SQL
    const userResult = await db.execute(sql`SELECT id FROM users WHERE id = 1`);
    
    if (!userResult || userResult.length === 0) {
      console.error("User with id=1 does not exist. Please create this user first.");
      return;
    }
    
    console.log("Found user with ID 1, proceeding with data seeding...");

    // Check if data already exists for this user directly with SQL queries
    const existingSkills = await db.execute(sql`SELECT COUNT(*) FROM skills WHERE user_id = 1`);
    const existingExperiences = await db.execute(sql`SELECT COUNT(*) FROM work_experiences WHERE user_id = 1`);
    const existingProjects = await db.execute(sql`SELECT COUNT(*) FROM projects WHERE user_id = 1`);
    
    const skillCount = parseInt(existingSkills[0]?.count || '0');
    const experienceCount = parseInt(existingExperiences[0]?.count || '0');
    const projectCount = parseInt(existingProjects[0]?.count || '0');

    // Only seed if there's no existing data
    if (skillCount === 0) {
      console.log("Seeding skills...");
      // Add skills
      const skills = [
        { name: "JavaScript", level: "Advanced", proficiency: 90 },
        { name: "React", level: "Advanced", proficiency: 85 },
        { name: "Node.js", level: "Advanced", proficiency: 85 },
        { name: "TypeScript", level: "Advanced", proficiency: 80 },
        { name: "GraphQL", level: "Intermediate", proficiency: 75 },
        { name: "PostgreSQL", level: "Intermediate", proficiency: 70 },
        { name: "AWS", level: "Intermediate", proficiency: 70 },
        { name: "Docker", level: "Intermediate", proficiency: 65 },
        { name: "Python", level: "Intermediate", proficiency: 60 },
        { name: "Machine Learning", level: "Beginner", proficiency: 40 },
      ];

      for (const skill of skills) {
        await db.execute(sql.raw(
          `INSERT INTO skills (user_id, name, level, proficiency) 
           VALUES ($1, $2, $3, $4)`),
          [1, skill.name, skill.level, skill.proficiency]
        );
      }
    } else {
      console.log(`User already has ${skillCount} skills. Skipping skill seeding.`);
    }

    if (experienceCount === 0) {
      console.log("Seeding work experiences...");
      // Add work experiences
      const experiences = [
        {
          title: "Senior Software Engineer",
          company: "TechCorp Inc.",
          location: "San Francisco, CA",
          industry: "Technology",
          startDate: "2020-01-01",
          endDate: null, // Current job
          description: "Leading development of cloud-based enterprise applications. Managing a team of 5 developers. Implementing microservices architecture with Node.js and React."
        },
        {
          title: "Full Stack Developer",
          company: "Web Solutions Ltd.",
          location: "Boston, MA",
          industry: "Software",
          startDate: "2017-03-15",
          endDate: "2019-12-31",
          description: "Developed and maintained client websites and applications. Worked with React, Node.js, and PostgreSQL. Improved site performance by 40% through optimization techniques."
        },
        {
          title: "Junior Developer",
          company: "StartupHub",
          location: "New York, NY",
          industry: "Technology",
          startDate: "2015-06-01",
          endDate: "2017-03-01",
          description: "Built MVPs for early-stage startups. Focused on rapid prototyping and iterative development. Worked primarily with JavaScript and Ruby on Rails."
        }
      ];

      for (const exp of experiences) {
        await db.execute(sql.raw(
          `INSERT INTO work_experiences (user_id, title, company, location, industry, start_date, end_date, description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`),
          [1, exp.title, exp.company, exp.location, exp.industry, exp.startDate, exp.endDate, exp.description]
        );
      }
    } else {
      console.log(`User already has ${existingExperiences.length} experiences. Skipping experience seeding.`);
    }

    if (existingProjects.length === 0) {
      console.log("Seeding projects...");
      // Add projects
      const projects = [
        {
          title: "E-commerce Platform",
          description: "Built a fully-featured e-commerce platform with React, Node.js, and PostgreSQL. Implemented payment processing, inventory management, and user authentication.",
          startDate: "2021-01-15",
          projectUrl: "https://example-ecommerce.com",
          category: "Web Development",
          thumbnailUrl: "https://via.placeholder.com/400x300?text=E-commerce+Platform",
          thumbnailFile: null,
          mediaUrls: JSON.stringify(["https://via.placeholder.com/800x600?text=E-commerce+Screenshot+1", 
                                    "https://via.placeholder.com/800x600?text=E-commerce+Screenshot+2"])
        },
        {
          title: "AI-Powered Content Generator",
          description: "Developed a machine learning application that generates marketing content based on user inputs. Used Python, TensorFlow, and React for the frontend interface.",
          startDate: "2020-06-10",
          projectUrl: "https://content-ai.example.com",
          category: "Machine Learning",
          thumbnailUrl: "https://via.placeholder.com/400x300?text=AI+Content+Generator",
          thumbnailFile: null,
          mediaUrls: JSON.stringify(["https://via.placeholder.com/800x600?text=AI+Generator+Screenshot"])
        },
        {
          title: "Task Management System",
          description: "Created a team collaboration tool with real-time updates, task assignment, and progress tracking. Built with React, Firebase, and WebSockets.",
          startDate: "2019-11-20",
          projectUrl: "https://task-master.example.com",
          category: "Productivity",
          thumbnailUrl: "https://via.placeholder.com/400x300?text=Task+Management",
          thumbnailFile: null,
          mediaUrls: JSON.stringify(["https://via.placeholder.com/800x600?text=Task+Management+Screenshot"])
        }
      ];

      for (const project of projects) {
        await db.execute(sql.raw(
          `INSERT INTO projects (user_id, title, description, start_date, project_url, category, thumbnail_url, thumbnail_file, media_urls) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`),
          [1, project.title, project.description, project.startDate, project.projectUrl, 
           project.category, project.thumbnailUrl, project.thumbnailFile, project.mediaUrls]
        );
      }
    } else {
      console.log(`User already has ${existingProjects.length} projects. Skipping project seeding.`);
    }

    console.log("Demo data seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding demo data:", error);
  }
}

// Execute the seeding function
seedDemoData();
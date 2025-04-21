import { Router, Request, Response } from "express";
import { IStorage } from "./storage";
import { 
  InsertWorkExperience, 
  InsertEducation, 
  InsertSkill, 
  InsertProject,
  InsertProjectCollaborator
} from "@shared/schema";

/**
 * Creates routes for adding demo content to a profile
 */
export function createDemoContentRoutes(storage: IStorage): Router {
  const router = Router();

  // Add demo content to profile based on their userId
  router.post("/api/users/:userId/add-demo-content", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Add demo content based on template type
      const { template = "animated" } = req.body;

      // Track created items
      const results = {
        experiences: [],
        skills: [],
        education: [],
        projects: []
      };

      // Add experiences
      const experiences: InsertWorkExperience[] = [
        {
          userId,
          company: "Innovatech Solutions",
          title: "Senior Software Engineer",
          location: "San Francisco, CA",
          description: "Led the development of cloud-native applications and microservices architecture. Implemented CI/CD pipelines and mentored junior developers in best practices. Reduced deployment time by 40% through automation.",
          startDate: "2022-03-01",
          endDate: null,
          isCurrent: true,
        },
        {
          userId,
          company: "Digital Frontier",
          title: "Software Engineer",
          location: "San Francisco, CA",
          description: "Developed responsive web applications using React, Node.js, and GraphQL. Collaborated with design team to implement UI/UX improvements that increased user engagement by 25%. Implemented robust error handling and monitoring solutions.",
          startDate: "2019-05-15",
          endDate: "2022-02-28",
          isCurrent: false,
        },
        {
          userId,
          company: "TechStart Inc.",
          title: "Junior Developer",
          location: "Seattle, WA",
          description: "Built and maintained RESTful APIs using Express and MongoDB. Participated in agile development cycles and contributed to open-source projects. Optimized database queries resulting in 30% performance improvement.",
          startDate: "2017-08-01",
          endDate: "2019-05-01",
          isCurrent: false,
        }
      ];

      for (const exp of experiences) {
        const created = await storage.createWorkExperience(exp);
        results.experiences.push(created);
      }

      // Add education
      const education: InsertEducation[] = [
        {
          userId,
          institution: "Stanford University",
          degree: "Master of Science",
          field: "Computer Science",
          startDate: "2015-09-01",
          endDate: "2017-06-30",
          description: "Specialized in Machine Learning and Distributed Systems. Thesis on Scalable ML Pipelines for Real-time Data Processing."
        },
        {
          userId,
          institution: "University of Washington",
          degree: "Bachelor of Science",
          field: "Computer Engineering",
          startDate: "2011-09-01",
          endDate: "2015-06-15",
          description: "Graduated with honors. Conducted research on distributed algorithms and participated in ACM programming competitions."
        }
      ];

      for (const edu of education) {
        const created = await storage.createEducation(edu);
        results.education.push(created);
      }

      // Add skills
      const skills: InsertSkill[] = [
        { userId, name: "React.js", level: "Expert", proficiency: 95 },
        { userId, name: "Node.js", level: "Expert", proficiency: 90 },
        { userId, name: "TypeScript", level: "Expert", proficiency: 92 },
        { userId, name: "GraphQL", level: "Advanced", proficiency: 85 },
        { userId, name: "AWS", level: "Advanced", proficiency: 80 },
        { userId, name: "Docker", level: "Advanced", proficiency: 85 },
        { userId, name: "Kubernetes", level: "Intermediate", proficiency: 75 },
        { userId, name: "CI/CD", level: "Advanced", proficiency: 88 },
        { userId, name: "MongoDB", level: "Advanced", proficiency: 82 },
        { userId, name: "PostgreSQL", level: "Advanced", proficiency: 85 },
        { userId, name: "System Design", level: "Advanced", proficiency: 87 },
        { userId, name: "RESTful APIs", level: "Expert", proficiency: 95 }
      ];

      for (const skill of skills) {
        const created = await storage.createSkill(skill);
        results.skills.push(created);
      }

      // Add projects 
      const projectsData = [
        {
          title: "AI-Powered Career Platform",
          description: "A professional networking platform with intelligent career guidance and portfolio showcase. Uses machine learning to match professionals and provide personalized career recommendations.",
          thumbnailUrl: "/images/demo/ui-design-1.svg",
          mediaUrls: ["/images/demo/ui-design-1.svg", "/images/demo/ui-design-2.svg", "/images/demo/ui-design-3.svg"],
          startDate: "2023-11-01",
          category: "Web Development",
          projectUrl: "https://example.com/career-platform"
        },
        {
          title: "Real-time Analytics Dashboard",
          description: "Interactive dashboard for visualizing business metrics in real-time. Features customizable widgets, automated alerts, and multi-device responsiveness.",
          thumbnailUrl: "/images/demo/ui-design-2.svg", 
          mediaUrls: ["/images/demo/ui-design-2.svg"],
          startDate: "2023-05-15",
          category: "Data Visualization",
          projectUrl: "https://example.com/analytics-dashboard"
        },
        {
          title: "Cloud Microservices Framework",
          description: "Scalable microservices architecture template with service discovery, load balancing, and monitoring built-in. Supports multiple programming languages and deployment environments.",
          thumbnailUrl: "/images/demo/ui-design-3.svg",
          mediaUrls: ["/images/demo/ui-design-3.svg"],
          startDate: "2022-08-10",
          category: "Backend Infrastructure",
          projectUrl: "https://github.com/example/microservices-framework"
        }
      ];

      for (const projectData of projectsData) {
        const project: InsertProject = {
          userId,
          title: projectData.title,
          description: projectData.description,
          startDate: projectData.startDate,
          projectUrl: projectData.projectUrl,
          category: projectData.category,
          thumbnailUrl: projectData.thumbnailUrl,
          thumbnailFile: null,
          mediaUrls: projectData.mediaUrls
        };

        const created = await storage.createProject(project);
        results.projects.push(created);
      }

      return res.status(200).json({
        message: "Demo content added successfully",
        results
      });
    } catch (error) {
      console.error("Error adding demo content:", error);
      return res.status(500).json({ message: "Failed to add demo content", error: error.message });
    }
  });

  return router;
}
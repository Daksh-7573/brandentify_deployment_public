import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import OpenAI from "openai";
import { 
  insertUserSchema, 
  insertResumeSchema, 
  insertWorkExperienceSchema,
  insertEducationSchema,
  insertSkillSchema,
  insertChatMessageSchema
} from "@shared/schema";
import { generateCareerAdvice } from "./services/ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.put("/users/:id", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resume routes
  apiRouter.post("/resumes", async (req: Request, res: Response) => {
    try {
      const resumeData = insertResumeSchema.parse(req.body);
      const resume = await storage.createResume(resumeData);
      res.status(201).json(resume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.get("/users/:userId/resume", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const resume = await storage.getResumeByUserId(userId);
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Work Experience routes
  apiRouter.get("/users/:userId/experiences", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const experiences = await storage.getWorkExperiencesByUserId(userId);
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/experiences", async (req: Request, res: Response) => {
    try {
      const experienceData = insertWorkExperienceSchema.parse(req.body);
      const experience = await storage.createWorkExperience(experienceData);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.put("/experiences/:id", async (req: Request, res: Response) => {
    try {
      const experienceId = parseInt(req.params.id);
      const experienceData = req.body;
      
      const experience = await storage.updateWorkExperience(experienceId, experienceData);
      if (!experience) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.json(experience);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.delete("/experiences/:id", async (req: Request, res: Response) => {
    try {
      const experienceId = parseInt(req.params.id);
      const success = await storage.deleteWorkExperience(experienceId);
      
      if (!success) {
        return res.status(404).json({ message: "Experience not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Education routes
  apiRouter.get("/users/:userId/educations", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const educations = await storage.getEducationsByUserId(userId);
      res.json(educations);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/educations", async (req: Request, res: Response) => {
    try {
      const educationData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(educationData);
      res.status(201).json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.put("/educations/:id", async (req: Request, res: Response) => {
    try {
      const educationId = parseInt(req.params.id);
      const educationData = req.body;
      
      const education = await storage.updateEducation(educationId, educationData);
      if (!education) {
        return res.status(404).json({ message: "Education not found" });
      }
      
      res.json(education);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.delete("/educations/:id", async (req: Request, res: Response) => {
    try {
      const educationId = parseInt(req.params.id);
      const success = await storage.deleteEducation(educationId);
      
      if (!success) {
        return res.status(404).json({ message: "Education not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Skills routes
  apiRouter.get("/users/:userId/skills", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const skills = await storage.getSkillsByUserId(userId);
      res.json(skills);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/skills", async (req: Request, res: Response) => {
    try {
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.put("/skills/:id", async (req: Request, res: Response) => {
    try {
      const skillId = parseInt(req.params.id);
      const skillData = req.body;
      
      const skill = await storage.updateSkill(skillId, skillData);
      if (!skill) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.json(skill);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.delete("/skills/:id", async (req: Request, res: Response) => {
    try {
      const skillId = parseInt(req.params.id);
      const success = await storage.deleteSkill(skillId);
      
      if (!success) {
        return res.status(404).json({ message: "Skill not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chat Message routes
  apiRouter.get("/users/:userId/chat-messages", async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const messages = await storage.getChatMessagesByUserId(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/chat-messages", async (req: Request, res: Response) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      
      // If this is a user message, generate an AI response
      if (messageData.sender === 'user') {
        const userId = messageData.userId;
        const userSkills = await storage.getSkillsByUserId(userId);
        const userExperiences = await storage.getWorkExperiencesByUserId(userId);
        const userEducations = await storage.getEducationsByUserId(userId);
        
        const aiResponse = await generateCareerAdvice(
          messageData.message,
          userSkills,
          userExperiences,
          userEducations
        );
        
        // Save the AI response
        const aiMessage = await storage.createChatMessage({
          userId: messageData.userId,
          message: aiResponse,
          sender: 'ai'
        });
        
        res.status(201).json({ userMessage: message, aiMessage });
      } else {
        res.status(201).json(message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Profile data parsing endpoints
  apiRouter.post("/parse-resume", async (req: Request, res: Response) => {
    try {
      const { userId, fileData } = req.body;
      
      if (!fileData) {
        return res.status(400).json({ message: "No file data provided" });
      }

      // Convert base64 to text (assuming PDF text extraction is handled by a hypothetical library)
      // In a real implementation, you would use a PDF parsing library
      let resumeText: string;
      try {
        resumeText = Buffer.from(fileData, 'base64').toString('utf-8');
      } catch (error) {
        console.error("Error converting file to text:", error);
        return res.status(400).json({ 
          message: "Failed to parse resume file. Please try uploading a text-based PDF or Word document.",
          experiences: [],
          educations: [],
          skills: []
        });
      }
      
      // Parse the resume text using our AI service with improved error handling
      try {
        // First, check if we got binary data (simple heuristic)
        const binaryDataIndicators = ['\0', '\x01', '\x02', '\x03', '%PDF'];
        const hasBinaryIndicators = binaryDataIndicators.some(indicator => resumeText.includes(indicator));
        
        if (hasBinaryIndicators) {
          console.log("Detected likely binary file format (PDF/DOCX)");
          
          // For binary files, let's allow the user to extract data from their resume
          // by using OpenAI directly to analyze the file content
          
          // We'll use OpenAI to extract and process the information directly
          const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
          
          // Only use a portion of the data to stay within token limits
          const truncatedContent = Buffer.from(fileData, 'base64').toString('base64').substring(0, 10000);
          
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { 
                role: "system", 
                content: "You are an expert resume analyzer looking at a resume binary file. Extract professional information in a structured format." 
              },
              { 
                role: "user", 
                content: [
                  "Here is a resume file in base64 format (truncated). Please analyze this data and extract the person's work experience, education, skills, job title, and location. This is the binary content of a resume file:",
                  truncatedContent
                ].join("\n\n")
              }
            ],
            temperature: 0.1,
          });
          
          // Now we use the response text as our input for further processing
          resumeText = "Resume extracted from binary file:\n\n" + response.choices[0].message.content;
          console.log("GPT extracted text from binary file for further processing");
        } else {
          // Log a snippet of text content for debugging
          console.log("Resume text sample (first 200 chars):", resumeText.substring(0, 200));
        }
        
        const { parseResumeText } = await import('./services/profile-parser');
        const profileData = await parseResumeText(resumeText);
        
        // Ensure userId is a number
        const userIdNum = typeof userId === 'string' ? parseInt(userId) : Number(userId);
        
        // First, check if user exists and create them if they don't
        try {
          const userResponse = await storage.getUser(userIdNum);
          if (!userResponse) {
            console.log(`User ${userIdNum} not found, creating default user`);
            
            // Create a user with the required fields according to schema
            await storage.createUser({
              username: `user${userIdNum}`,
              email: `user${userIdNum}@example.com`,
              name: "Profile User",
              title: profileData.title || "Professional",
              location: profileData.location || "Not specified",
              photoURL: null
            });
            
            // If there's profile data with title/location, update the user
            if (profileData.title || profileData.location) {
              const updateData: { [key: string]: string } = {};
              if (profileData.title) updateData.title = profileData.title;
              if (profileData.location) updateData.location = profileData.location;
              await storage.updateUser(userIdNum, updateData);
            }
          } else {
            // User exists, update with any new profile info
            // Make sure to update name if existing name is generic
            const updateData: { [key: string]: string } = {};
            
            if (profileData.title) updateData.title = profileData.title;
            if (profileData.location) updateData.location = profileData.location;
            
            // Get the first experience to use job title as name if needed
            if (profileData.experiences && profileData.experiences.length > 0) {
              const firstExp = profileData.experiences[0];
              if (userResponse.name === "Profile User" && firstExp.title) {
                // Use the most recent job title plus "professional" to replace generic name 
                updateData.name = `${firstExp.title.split(' ')[0]} Professional`;
              }
            }
            
            // Only update if we have data to update
            if (Object.keys(updateData).length > 0) {
              console.log("Updating user with profile data:", updateData);
              await storage.updateUser(userIdNum, updateData);
            }
          }
        } catch (error) {
          console.error("Error checking/creating user:", error);
          // Continue anyway to process the rest of the profile
        }
        
        // Only clear existing data if we have new data to add
        // This prevents empty profiles if the extraction fails
        const hasNewData = 
          (profileData.experiences && profileData.experiences.length > 0) ||
          (profileData.educations && profileData.educations.length > 0) ||
          (profileData.skills && profileData.skills.length > 0);
        
        if (hasNewData) {
          console.log("Resume contains valid data, updating profile");
          try {
            // Only delete if we have replacement data
            if (profileData.experiences && profileData.experiences.length > 0) {
              const existingExperiences = await storage.getWorkExperiencesByUserId(userIdNum);
              for (const exp of existingExperiences) {
                await storage.deleteWorkExperience(exp.id);
              }
            }
            
            if (profileData.educations && profileData.educations.length > 0) {
              const existingEducations = await storage.getEducationsByUserId(userIdNum);
              for (const edu of existingEducations) {
                await storage.deleteEducation(edu.id);
              }
            }
            
            if (profileData.skills && profileData.skills.length > 0) {
              const existingSkills = await storage.getSkillsByUserId(userIdNum);
              for (const skill of existingSkills) {
                await storage.deleteSkill(skill.id);
              }
            }
          } catch (error) {
            console.error("Error clearing existing profile data:", error);
            // Continue to add new data
          }
        } else {
          console.log("Resume parsing yielded no data, keeping existing profile");
        }
        
        // Add the userId to all extracted items
        const experiences = profileData.experiences.map((exp: any) => ({ 
          ...exp, 
          userId: userIdNum 
        }));
        
        const educations = profileData.educations.map((edu: any) => ({ 
          ...edu, 
          userId: userIdNum 
        }));
        
        const skills = profileData.skills.map((skill: any) => ({ 
          ...skill, 
          userId: userIdNum 
        }));
      
        res.status(200).json({
          ...profileData,
          experiences,
          educations,
          skills
        });
      } catch (error) {
        console.error('Error processing resume with AI:', error);
        res.status(500).json({ 
          message: "Failed to process resume with AI. The file might be too large or in an unsupported format.",
          experiences: [],
          educations: [],
          skills: []
        });
      }
    } catch (error) {
      console.error('Error in resume parsing route:', error);
      res.status(500).json({ message: "Failed to parse resume" });
    }
  });
  
  // Parse LinkedIn profile and extract data
  apiRouter.post("/parse-linkedin", async (req: Request, res: Response) => {
    try {
      const { userId, profileUrl } = req.body;
      
      if (!profileUrl) {
        return res.status(400).json({ message: "No LinkedIn profile URL provided" });
      }
      
      // Parse the LinkedIn profile using our AI service
      const { parseLinkedInProfile } = await import('./services/profile-parser');
      const profileData = await parseLinkedInProfile(profileUrl);
      
      // Ensure userId is a number
      const userIdNum = typeof userId === 'string' ? parseInt(userId) : Number(userId);
      
      // First, check if user exists and create them if they don't
      try {
        const userResponse = await storage.getUser(userIdNum);
        if (!userResponse) {
          console.log(`User ${userIdNum} not found, creating default user`);
          await storage.createUser({
            username: `user${userIdNum}`,
            email: `user${userIdNum}@example.com`,
            name: "Profile User",
            title: profileData.title || "Professional",
            location: profileData.location || "Not specified",
            photoURL: null
          });
          
          // If there's profile data with title/location, update the user
          if (profileData.title || profileData.location) {
            const updateData: { [key: string]: string } = {};
            if (profileData.title) updateData.title = profileData.title;
            if (profileData.location) updateData.location = profileData.location;
            await storage.updateUser(userIdNum, updateData);
          }
        } else {
          // User exists, update with any new profile info
          // Make sure to update name if existing name is generic
          const updateData: { [key: string]: string } = {};
          
          if (profileData.title) updateData.title = profileData.title;
          if (profileData.location) updateData.location = profileData.location;
          
          // Get the first experience to use job title as name if needed
          if (profileData.experiences && profileData.experiences.length > 0) {
            const firstExp = profileData.experiences[0];
            if (userResponse.name === "Profile User" && firstExp.title) {
              // Use the most recent job title plus "professional" to replace generic name 
              updateData.name = `${firstExp.title.split(' ')[0]} Professional`;
            }
          }
          
          // Only update if we have data to update
          if (Object.keys(updateData).length > 0) {
            console.log("Updating user with LinkedIn profile data:", updateData);
            await storage.updateUser(userIdNum, updateData);
          }
        }
      } catch (error) {
        console.error("Error checking/creating user:", error);
        // Continue anyway to process the rest of the profile
      }
      
      // Only clear existing data if we have new data to add
      // This prevents empty profiles if the extraction fails
      const hasNewData = 
        (profileData.experiences && profileData.experiences.length > 0) ||
        (profileData.educations && profileData.educations.length > 0) ||
        (profileData.skills && profileData.skills.length > 0);
      
      if (hasNewData) {
        console.log("LinkedIn profile has valid data, updating profile");
        try {
          // Only delete if we have replacement data
          if (profileData.experiences && profileData.experiences.length > 0) {
            const existingExperiences = await storage.getWorkExperiencesByUserId(userIdNum);
            for (const exp of existingExperiences) {
              await storage.deleteWorkExperience(exp.id);
            }
          }
          
          if (profileData.educations && profileData.educations.length > 0) {
            const existingEducations = await storage.getEducationsByUserId(userIdNum);
            for (const edu of existingEducations) {
              await storage.deleteEducation(edu.id);
            }
          }
          
          if (profileData.skills && profileData.skills.length > 0) {
            const existingSkills = await storage.getSkillsByUserId(userIdNum);
            for (const skill of existingSkills) {
              await storage.deleteSkill(skill.id);
            }
          }
        } catch (error) {
          console.error("Error clearing existing profile data:", error);
          // Continue to add new data
        }
      } else {
        console.log("LinkedIn profile extraction yielded no data, keeping existing profile");
      }
      
      // Add the userId to all extracted items
      const experiences = profileData.experiences.map((exp: any) => ({ 
        ...exp, 
        userId: userIdNum 
      }));
      
      const educations = profileData.educations.map((edu: any) => ({ 
        ...edu, 
        userId: userIdNum 
      }));
      
      const skills = profileData.skills.map((skill: any) => ({ 
        ...skill, 
        userId: userIdNum 
      }));
      
      res.status(200).json({
        ...profileData,
        experiences,
        educations,
        skills
      });
    } catch (error) {
      console.error('Error parsing LinkedIn profile:', error);
      res.status(500).json({ message: "Failed to parse LinkedIn profile" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

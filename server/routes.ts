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
  
  // Add a special endpoint to clear all demo user profile data (for development purposes)
  apiRouter.get("/debug/reset-demo-profile", async (req: Request, res: Response) => {
    try {
      console.log("Resetting all demo user profile data (experiences, education, skills)");
      
      // Create a tracking object for the result
      const result = {
        deletedExperiences: 0,
        deletedEducation: 0,
        deletedSkills: 0,
        message: "Successfully reset all profile data"
      };
      
      // Clear work experiences
      const experiences = await storage.getWorkExperiencesByUserId(1);
      for (const exp of experiences) {
        await storage.deleteWorkExperience(exp.id);
        result.deletedExperiences++;
      }
      
      // Clear education
      const education = await storage.getEducationsByUserId(1);
      for (const edu of education) {
        await storage.deleteEducation(edu.id);
        result.deletedEducation++;
      }
      
      // Clear skills
      const skills = await storage.getSkillsByUserId(1);
      for (const skill of skills) {
        await storage.deleteSkill(skill.id);
        result.deletedSkills++;
      }
      
      console.log(`Reset complete! Deleted: ${result.deletedExperiences} experiences, ${result.deletedEducation} education items, ${result.deletedSkills} skills`);
      
      // Force a new blank initialization of data
      await storage.reinitializeDemoData();
      
      res.status(200).json(result);
    } catch (error) {
      console.error("Error resetting demo profile:", error);
      res.status(500).json({ message: "Failed to reset demo profile" });
    }
  });
  
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
        console.error("No file data provided in request");
        return res.status(400).json({ 
          error: "No file data provided",
          message: "Please upload a resume file"
        });
      }
      
      console.log(`===== Starting resume parsing for user ${userId} =====`);
      console.log(`File data length: ${fileData.length} characters`);

      // Convert base64 to text (assuming PDF text extraction is handled by a hypothetical library)
      // In a real implementation, you would use a PDF parsing library
      let resumeText: string;
      try {
        resumeText = Buffer.from(fileData, 'base64').toString('utf-8');
        console.log("Successfully decoded base64 data to text");
      } catch (error) {
        console.error("Error converting file to text:", error);
        return res.status(400).json({ 
          error: "Invalid file format",
          message: "Failed to parse resume file. Please try uploading a text-based PDF or Word document.",
          experiences: [],
          educations: [],
          skills: []
        });
      }
      
      // Parse the resume text using our rules-based parser
      try {
        // First, check if we got binary data (simple heuristic)
        const binaryDataIndicators = ['\0', '\x01', '\x02', '\x03', '%PDF'];
        const hasBinaryIndicators = binaryDataIndicators.some(indicator => resumeText.includes(indicator));
        
        console.log(`File format detection: ${hasBinaryIndicators ? 'Binary (PDF/DOCX)' : 'Text'}`);
        
        if (hasBinaryIndicators) {
          console.log("Detected likely binary file format (PDF/DOCX)");
          
          // For binary files, use OpenAI to extract text content from binary
          if (!process.env.OPENAI_API_KEY) {
            console.error("OPENAI_API_KEY is not set. Cannot process binary resume.");
            return res.status(500).json({
              error: "OpenAI API key not configured",
              message: "Unable to process binary files without OpenAI API key configuration",
              experiences: [],
              educations: [],
              skills: []
            });
          }
          
          console.log("OPENAI_API_KEY is available, proceeding with binary file processing");
          
          try {
            // First, let's try to extract text from the PDF directly
            console.log("Attempting to convert base64 PDF data to buffer");
            const fileBuffer = Buffer.from(fileData, 'base64');
            console.log(`File buffer size: ${fileBuffer.length} bytes`);
            
            // Let's check if it's a PDF by looking at magic numbers
            const isPdf = fileBuffer.length > 4 && 
                          fileBuffer[0] === 0x25 && // %
                          fileBuffer[1] === 0x50 && // P
                          fileBuffer[2] === 0x44 && // D
                          fileBuffer[3] === 0x46;   // F
            
            if (isPdf) {
              console.log("PDF format confirmed by file signature");
              try {
                // Process PDF data using pdf.js
                const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
                const pdfjsWorker = await import('pdfjs-dist/legacy/build/pdf.worker.js');
                
                pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
                
                console.log("Loading PDF document with pdf.js");
                const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
                console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
                
                let extractedText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                  console.log(`Extracting text from page ${i} of ${pdf.numPages}`);
                  const page = await pdf.getPage(i);
                  const content = await page.getTextContent();
                  const strings = content.items.map((item: any) => item.str);
                  extractedText += strings.join(' ') + '\n';
                }
                
                console.log(`Text extraction complete. Extracted ${extractedText.length} characters`);
                console.log("Sample (first 300 chars):", extractedText.substring(0, 300).replace(/\n/g, ' '));
                
                // Format structured text directly without OpenAI
                console.log("Formatting extracted text into structured format");

                // Basic job title extraction - look for common patterns
                const titleMatch = extractedText.match(/(?:^|\n)(.*?(?:Engineer|Manager|Developer|Designer|Analyst|Consultant|Specialist|Director|Architect|Lead|Senior|Junior).*?)(?:\n|$)/);
                let jobTitle = titleMatch ? titleMatch[1].trim() : '';
                
                // Basic location extraction
                const locationPattern = /(?:^|\n)([A-Za-z]+,\s*[A-Za-z]{2}|[A-Za-z]+,\s*[A-Za-z]+)(?:\n|$)/;
                const locationMatch = extractedText.match(locationPattern);
                let location = locationMatch ? locationMatch[1].trim() : '';
                
                // Create a structured format with section headers
                const structuredText = `
BASIC INFO
Title: ${jobTitle}
Location: ${location}

WORK EXPERIENCE
${extractedText.substring(0, 5000)}

EDUCATION
${extractedText.substring(0, 5000)}

SKILLS
${extractedText.substring(0, 5000)}
`;
                
                resumeText = structuredText;
                console.log("Created structured format from PDF text");
                console.log("Structured text sample (first 300 chars):", resumeText.substring(0, 300).replace(/\n/g, ' '));
              } catch (pdfError: any) {
                console.error("Error extracting text from PDF:", pdfError);
                throw new Error(`PDF extraction failed: ${pdfError.message}`);
              }
            } else {
              // Not a PDF, try the original approach with OpenAI
              console.log("Not a PDF, attempting direct OpenAI parsing of binary data");
              const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
              
              // Only use a portion of the data to stay within token limits
              const truncatedContent = fileData.substring(0, 25000);
              console.log(`Truncated content length for API: ${truncatedContent.length} characters`);
              
              console.log("Sending request to OpenAI API...");
              const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                  { 
                    role: "system", 
                    content: "You are an expert resume analyzer. Extract professional information in a structured format."
                  },
                  { 
                    role: "user", 
                    content: "I have a resume in base64 format. Please extract any professional information such as work experience, education, skills, job title, and location. Format your response in structured text with clear section headings."
                  }
                ],
                temperature: 0.1,
              });
              
              console.log("OpenAI API response received successfully");
              
              // Now we use the response text as our input for further processing
              resumeText = "Resume extracted from binary file:\n\n" + response.choices[0].message.content;
              console.log("GPT extracted text from binary file for further processing");
              console.log("Extracted text sample (first 300 chars):", resumeText.substring(0, 300).replace(/\n/g, ' '));
            }
          } catch (openaiError: any) {
            console.error("Error in OpenAI processing:", openaiError);
            return res.status(500).json({
              error: "OPENAI_PROCESSING_ERROR",
              message: `Failed to process resume with OpenAI: ${openaiError.message || "Unknown error"}`,
              experiences: [],
              educations: [],
              skills: []
            });
          }
        } else {
          // Plain text resume
          console.log("Plain text resume detected");
          console.log("Resume text sample (first 200 chars):", resumeText.substring(0, 200));
        }
        
        const { parseResumeText } = await import('./services/profile-parser');
        console.log("Calling parseResumeText function...");
        console.log("Resume text to parse (truncated first 500 chars):", resumeText.substring(0, 500));
        
        const profileData = await parseResumeText(resumeText);
        console.log("Resume parsing completed");
        
        // Log the extracted data
        console.log("Raw parsed experiences:", JSON.stringify(profileData.experiences || []).substring(0, 200));
        console.log("Raw parsed educations:", JSON.stringify(profileData.educations || []).substring(0, 200));
        console.log("Raw parsed skills:", JSON.stringify(profileData.skills || []).substring(0, 200));
        
        if (profileData.experiences?.length === 0 && 
            profileData.educations?.length === 0 && 
            profileData.skills?.length === 0) {
          console.log("WARNING: No data was extracted from the resume. Check parser implementation.");
        }
        
        // Check if there was an error in the parsing
        if ('error' in profileData) {
          console.error(`Resume parsing error: ${profileData.error}`);
          return res.status(200).json({
            error: profileData.error,
            message: "We encountered an issue extracting information from your resume. Please try a different file or manually enter your professional information.",
            experiences: [],
            educations: [],
            skills: []
          });
        }
        
        // Log the profile data we've received
        console.log(`Profile data extracted successfully from resume. Found:
        - Experiences: ${profileData.experiences.length}
        - Educations: ${profileData.educations.length}
        - Skills: ${profileData.skills.length}
        - Title: ${profileData.title || 'None'}
        - Location: ${profileData.location || 'None'}`);
        
        // Ensure userId is a number
        const userIdNum = typeof userId === 'string' ? parseInt(userId) : Number(userId);
        
        // Return the extracted data to the client for confirmation by the user
        // This implements the user-confirmation step required by the algorithm
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
      
        return res.status(200).json({
          message: "Please review the extracted information before saving to your profile",
          status: "waiting_confirmation",
          title: profileData.title,
          location: profileData.location,
          experiences,
          educations,
          skills,
          counts: {
            experiences: experiences.length,
            educations: educations.length,
            skills: skills.length
          }
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
  
  // Endpoint to save resume/profile data after user confirmation
  apiRouter.post("/confirm-resume-data", async (req: Request, res: Response) => {
    try {
      const { 
        userId, 
        experiences, 
        educations, 
        skills, 
        title, 
        location,
        overwriteExisting = true // Default to overwriting existing data
      } = req.body;
      
      if (!userId) {
        return res.status(400).json({ 
          error: "Missing user ID",
          message: "User ID is required" 
        });
      }
      
      // Ensure userId is a number
      const userIdNum = typeof userId === 'string' ? parseInt(userId) : Number(userId);
      
      console.log(`Processing confirmed profile data for user ${userIdNum}`);
      console.log(`Received: ${experiences?.length || 0} experiences, ${educations?.length || 0} educations, ${skills?.length || 0} skills`);
      
      // First, check if user exists and update/create as needed
      try {
        const userResponse = await storage.getUser(userIdNum);
        
        // Prepare update data if we have title/location
        const updateData: { [key: string]: string | null } = {};
        if (title) updateData.title = title;
        if (location) updateData.location = location;
        
        if (!userResponse) {
          console.log(`User ${userIdNum} not found, creating user`);
          
          // Create a user with the required fields according to schema
          await storage.createUser({
            username: `user${userIdNum}`,
            email: `user${userIdNum}@example.com`,
            name: "Profile User",
            title: title || null,
            location: location || null,
            photoURL: null
          });
        } else if (Object.keys(updateData).length > 0) {
          // User exists and we have updates
          console.log("Updating user profile information:", updateData);
          await storage.updateUser(userIdNum, updateData);
        }
      } catch (error) {
        console.error("Error checking/updating user:", error);
        // Continue anyway to process the profile data
      }
      
      // Clear existing data if overwrite flag is set
      if (overwriteExisting) {
        console.log("Overwriting existing profile data");
        
        // Clear experiences if we have new ones
        if (experiences && experiences.length > 0) {
          const existingExperiences = await storage.getWorkExperiencesByUserId(userIdNum);
          for (const exp of existingExperiences) {
            await storage.deleteWorkExperience(exp.id);
          }
          console.log(`Cleared ${existingExperiences.length} existing work experiences`);
        }
        
        // Clear educations if we have new ones
        if (educations && educations.length > 0) {
          const existingEducations = await storage.getEducationsByUserId(userIdNum);
          for (const edu of existingEducations) {
            await storage.deleteEducation(edu.id);
          }
          console.log(`Cleared ${existingEducations.length} existing education items`);
        }
        
        // Clear skills if we have new ones
        if (skills && skills.length > 0) {
          const existingSkills = await storage.getSkillsByUserId(userIdNum);
          for (const skill of existingSkills) {
            await storage.deleteSkill(skill.id);
          }
          console.log(`Cleared ${existingSkills.length} existing skills`);
        }
      }
      
      // Save the confirmed data
      const savedItems = {
        experiences: [],
        educations: [],
        skills: []
      };
      
      // Save work experiences
      if (experiences && experiences.length > 0) {
        for (const exp of experiences) {
          // Cast to InsertWorkExperience to fix type error
          const savedExp = await storage.createWorkExperience({
            ...exp,
            userId: userIdNum
          } as any);
          savedItems.experiences.push(savedExp);
        }
        console.log(`Saved ${savedItems.experiences.length} work experiences`);
      }
      
      // Save educations
      if (educations && educations.length > 0) {
        for (const edu of educations) {
          // Cast to InsertEducation to fix type error
          const savedEdu = await storage.createEducation({
            ...edu,
            userId: userIdNum
          } as any);
          savedItems.educations.push(savedEdu);
        }
        console.log(`Saved ${savedItems.educations.length} education items`);
      }
      
      // Save skills
      if (skills && skills.length > 0) {
        for (const skill of skills) {
          // Cast to InsertSkill to fix type error
          const savedSkill = await storage.createSkill({
            ...skill,
            userId: userIdNum
          } as any);
          savedItems.skills.push(savedSkill);
        }
        console.log(`Saved ${savedItems.skills.length} skills`);
      }
      
      return res.status(200).json({
        message: "Profile data saved successfully",
        savedItems,
        counts: {
          experiences: savedItems.experiences.length,
          educations: savedItems.educations.length,
          skills: savedItems.skills.length
        }
      });
    } catch (error: any) {
      console.error("Error saving confirmed profile data:", error);
      return res.status(500).json({
        error: error.message,
        message: "Failed to save profile data"
      });
    }
  });
  
  // Parse LinkedIn profile and extract data
  apiRouter.post("/parse-linkedin", async (req: Request, res: Response) => {
    try {
      const { userId, profileUrl } = req.body;
      
      if (!profileUrl) {
        return res.status(400).json({ message: "No LinkedIn profile URL provided" });
      }
      
      console.log(`===== Starting LinkedIn profile parsing for user ${userId} =====`);
      console.log(`Profile URL: ${profileUrl}`);
      
      // Check if OpenAI API key is set
      if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is not set. Cannot parse LinkedIn profile.");
        return res.status(500).json({ 
          message: "OpenAI API key is missing. Please ask the administrator to configure it.",
          error: "MISSING_API_KEY"
        });
      }
      
      console.log("OPENAI_API_KEY is available, proceeding with profile parsing");
      
      // Parse the LinkedIn profile using our AI service
      const { parseLinkedInProfile } = await import('./services/profile-parser');
      
      console.log("Calling parseLinkedInProfile function...");
      const profileData = await parseLinkedInProfile(profileUrl);
      console.log("LinkedIn profile parsing completed");
      
      // Check if there was an error in the parsing
      if ('error' in profileData) {
        console.error(`LinkedIn parsing error: ${profileData.error}`);
        return res.status(200).json({
          error: profileData.error,
          message: "We encountered an issue accessing your LinkedIn profile. LinkedIn's terms of service may restrict profile access. Please try uploading a resume instead.",
          experiences: [],
          educations: [],
          skills: []
        });
      }
      
      // Log the profile data we've received
      console.log(`Profile data extracted successfully. Found:
      - Experiences: ${profileData.experiences.length}
      - Educations: ${profileData.educations.length}
      - Skills: ${profileData.skills.length}
      - Title: ${profileData.title || 'None'}
      - Location: ${profileData.location || 'None'}`);
      
      // Ensure userId is a number
      const userIdNum = typeof userId === 'string' ? parseInt(userId) : Number(userId);
      
      // Check if we have any data extracted
      const hasData = 
        (profileData.experiences && profileData.experiences.length > 0) ||
        (profileData.educations && profileData.educations.length > 0) ||
        (profileData.skills && profileData.skills.length > 0);
      
      if (!hasData) {
        console.error("LinkedIn profile extraction yielded no data, sending error response");
        return res.status(200).json({ 
          error: "NO_DATA_EXTRACTED",
          message: "We couldn't extract any information from this LinkedIn profile URL. LinkedIn's terms of service restrict profile access. Please try uploading a resume instead.",
          experiences: [],
          educations: [],
          skills: []
        });
      }
      
      // Add the userId to all extracted items
      console.log("Preparing data for client confirmation");
      
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
      
      // Log the data we've prepared
      console.log(`Prepared data for client confirmation:
      - Experiences: ${experiences.length}
      - Educations: ${educations.length}
      - Skills: ${skills.length}`);
      
      // Return the data to the client for confirmation
      return res.status(200).json({
        message: "Please review the extracted information before saving to your profile",
        status: "waiting_confirmation",
        title: profileData.title,
        location: profileData.location,
        experiences,
        educations,
        skills,
        counts: {
          experiences: experiences.length,
          educations: educations.length,
          skills: skills.length
        }
      });
      
      console.log("===== LinkedIn profile parsing completed successfully =====");
    } catch (error: any) {
      console.error('Error parsing LinkedIn profile:', error);
      return res.status(500).json({ 
        message: "Failed to parse LinkedIn profile", 
        error: error.message || "Unknown error"
      });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

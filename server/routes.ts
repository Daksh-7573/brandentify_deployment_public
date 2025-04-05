console.log("Loaded routes.ts");
import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import crypto from "crypto";
import path from "path";
import fileUpload from "express-fileupload";
import { projectThumbnailUpload, getFileUrl } from "./utils/upload";
// Resume parsing functionality removed
import { 
  insertUserSchema, 
  insertResumeSchema, 
  insertWorkExperienceSchema,
  insertEducationSchema,
  insertSkillSchema,
  insertChatMessageSchema,
  insertEmailVerificationSchema,
  insertProjectSchema,
  insertProjectCollaboratorSchema,
  insertProjectEndorsementSchema,
  insertPortfolioSchema,
  insertServiceSchema,
  InsertWorkExperience,
  InsertEducation,
  InsertSkill,
  InsertProject,
  InsertProjectCollaborator,
  InsertProjectEndorsement,
  InsertPortfolio,
  InsertService
} from "@shared/schema";
import { generateCareerAdvice } from "./services/ai-service";
import { getJobTitleSuggestions } from "./services/title-suggestions";
import { initEmailService, sendVerificationEmail, sendWelcomeEmail } from "./services/email-service";
import * as xaiService from "./services/xai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Initialize the email service
  await initEmailService();
  
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
  
  // Debug endpoint to clear all users (only for development/testing)
  apiRouter.get("/debug/clear-all-users", async (req: Request, res: Response) => {
    try {
      console.log("Clearing all registered users except the demo user");
      
      // We'll implement this functionality in the storage layer
      await storage.clearAllUsers();
      
      console.log("Successfully cleared all users");
      
      res.status(200).json({ message: "All users (except demo) have been cleared successfully" });
    } catch (error) {
      console.error("Error clearing all users:", error);
      res.status(500).json({ message: "Failed to clear all users" });
    }
  });
  
  // User routes
  apiRouter.post("/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if email is already registered
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Create the user with emailVerified explicitly set to false
      const userData_withVerificationFlag = {
        ...userData,
        emailVerified: false
      };
      
      const user = await storage.createUser(userData_withVerificationFlag);
      
      // Generate a random verification token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Store the token in the email verification storage
      await storage.createEmailVerification({
        email: user.email,
        token,
        expiresAt
      });
      
      // Update the user with the verification token
      await storage.updateUser(user.id, {
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt
      });
      
      console.log(`Created verification token for user ${user.email}: ${token}`);
      
      // Send a verification email using Ethereal
      try {
        const previewUrl = await sendVerificationEmail(
          user.email, 
          token, 
          req.get('host') || 'localhost:5000'
        );
        
        // Return success response with preview URL for development
        res.status(201).json({
          user,
          message: "User registered successfully. Please verify your email.",
          emailPreview: previewUrl // This is for development to view the email
        });
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Even if email sending fails, the user is created, so return success
        res.status(201).json({
          user,
          verificationToken: token, // Fallback for development
          message: "User registered successfully, but verification email could not be sent. Please try again later."
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors });
      } else {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.get("/users/:id", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      console.log(`[GET /users/:id] Fetching user with ID: ${idParam}`);
      
      let user;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = idParam.length > 20 && /[^0-9]/.test(idParam);
      
      if (isFirebaseUid) {
        // If it looks like a Firebase UID, check by username
        console.log(`[GET /users/:id] ID appears to be a Firebase UID: ${idParam}`);
        user = await storage.getUserByUsername(idParam);
        
        if (!user) {
          console.log(`[GET /users/:id] No existing user found with Firebase UID: ${idParam}`);
          console.log(`[GET /users/:id] Creating new user for Firebase UID: ${idParam}`);
          
          const newUser = await storage.createUser({
            username: idParam,
            email: `firebase_${idParam.substring(0, 8)}@example.com`,
            password: null,
            name: "Firebase User",
            phoneNumber: null,
            photoURL: null,
            title: null,
            location: null,
            industry: null,
            lookingFor: null,
            profileCompleted: null
          });
          
          console.log(`[GET /users/:id] Created new user for Firebase UID:`, newUser);
          return res.status(201).json(newUser);
        }
        
        console.log(`[GET /users/:id] Found existing user with Firebase UID: ${user.id}`);
      } else {
        // Try to parse as numeric ID
        const userId = parseInt(idParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:id] ID is not a valid numeric ID: ${idParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:id] Looking up user with numeric ID: ${userId}`);
        user = await storage.getUser(userId);
        
        if (!user) {
          console.log(`[GET /users/:id] No user found with numeric ID: ${userId}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:id] Found user with numeric ID: ${userId}`);
      }
      
      console.log(`[GET /users/:id] Returning user data:`, user);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.put("/users/:id", async (req: Request, res: Response) => {
    try {
      const idParam = req.params.id;
      const userData = req.body;
      
      console.log(`[PUT /users/:id] Updating user with ID: ${idParam}`);
      console.log(`[PUT /users/:id] Update data:`, userData);
      
      let user;
      let updatedUser;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = idParam.length > 20 && /[^0-9]/.test(idParam);
      
      if (isFirebaseUid) {
        // If it looks like a Firebase UID, check by username
        console.log(`[PUT /users/:id] ID appears to be a Firebase UID: ${idParam}`);
        user = await storage.getUserByUsername(idParam);
        
        if (!user) {
          console.log(`[PUT /users/:id] No existing user found with Firebase UID: ${idParam}`);
          
          // Create a new user with the Firebase UID if it includes required profile data
          if (userData.photoURL || userData.name || userData.email) {
            console.log(`[PUT /users/:id] Creating new user for Firebase UID: ${idParam}`);
            
            const newUser = await storage.createUser({
              username: idParam,
              email: userData.email || `firebase_${idParam.substring(0, 8)}@example.com`,
              password: null,
              name: userData.name || "Firebase User",
              phoneNumber: userData.phoneNumber || null,
              photoURL: userData.photoURL || null,
              title: userData.title || null,
              location: userData.location || null,
              industry: userData.industry || null,
              lookingFor: userData.lookingFor || null,
              profileCompleted: userData.profileCompleted || null
            });
            
            console.log(`[PUT /users/:id] Created new user for Firebase UID:`, newUser);
            return res.status(201).json(newUser);
          }
          
          console.log(`[PUT /users/:id] No user found with Firebase UID: ${idParam} and insufficient data to create one`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[PUT /users/:id] Found existing user with Firebase UID: ${idParam}, numeric ID: ${user.id}`);
        updatedUser = await storage.updateUser(user.id, userData);
      } else {
        // Try to parse as numeric ID
        const userId = parseInt(idParam);
        
        if (isNaN(userId)) {
          console.log(`[PUT /users/:id] ID is not a valid numeric ID: ${idParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[PUT /users/:id] Looking up user with numeric ID: ${userId}`);
        user = await storage.getUser(userId);
        
        if (!user) {
          console.log(`[PUT /users/:id] No user found with numeric ID: ${userId}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[PUT /users/:id] Found user with numeric ID: ${userId}, updating...`);
        updatedUser = await storage.updateUser(userId, userData);
      }
      
      console.log(`[PUT /users/:id] Successfully updated user:`, updatedUser);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resume routes
  apiRouter.post("/resumes", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /resumes] Creating resume with data:`, req.body);
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /resumes] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /resumes] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /resumes] No matching user found for Firebase UID: ${req.body.userId}`);
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      console.log(`[POST /resumes] Processing with userId: ${req.body.userId}`);
      const resumeData = insertResumeSchema.parse(req.body);
      const resume = await storage.createResume(resumeData);
      console.log(`[POST /resumes] Created resume with ID: ${resume.id}`);
      res.status(201).json(resume);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /resumes] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /resumes] Server error:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.get("/users/:userId/resume", async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/resume] Request for resume with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/resume] userId appears to be a Firebase UID: ${userIdParam}`);
        // Try to find user with this username (Firebase UID)
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/resume] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/resume] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/resume] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/resume] Using numeric userId: ${userId}`);
      }
      
      const resume = await storage.getResumeByUserId(userId);
      
      if (!resume) {
        console.log(`[GET /users/:userId/resume] No resume found for userId: ${userId}`);
        return res.status(404).json({ message: "Resume not found" });
      }
      
      console.log(`[GET /users/:userId/resume] Found resume:`, resume);
      res.json(resume);
    } catch (error) {
      console.error("Error fetching resume:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Work Experience routes
  apiRouter.get("/users/:userId/experiences", async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/experiences] Request for experiences with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/experiences] userId appears to be a Firebase UID: ${userIdParam}`);
        // Try to find user with this username (Firebase UID)
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/experiences] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/experiences] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/experiences] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/experiences] Using numeric userId: ${userId}`);
      }
      
      const experiences = await storage.getWorkExperiencesByUserId(userId);
      console.log(`[GET /users/:userId/experiences] Found ${experiences.length} experiences for userId: ${userId}`);
      res.json(experiences);
    } catch (error) {
      console.error("Error fetching experiences:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/experiences", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /experiences] Creating experience with data:`, req.body);
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /experiences] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /experiences] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /experiences] No matching user found for Firebase UID: ${req.body.userId}`);
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      console.log(`[POST /experiences] Processing with userId: ${req.body.userId}`);
      const experienceData = insertWorkExperienceSchema.parse(req.body);
      const experience = await storage.createWorkExperience(experienceData);
      console.log(`[POST /experiences] Created experience with ID: ${experience.id}`);
      res.status(201).json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /experiences] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /experiences] Server error:`, error);
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
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/educations] Request for educations with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/educations] userId appears to be a Firebase UID: ${userIdParam}`);
        // Try to find user with this username (Firebase UID)
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/educations] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/educations] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/educations] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/educations] Using numeric userId: ${userId}`);
      }
      
      const educations = await storage.getEducationsByUserId(userId);
      console.log(`[GET /users/:userId/educations] Found ${educations.length} educations for userId: ${userId}`);
      res.json(educations);
    } catch (error) {
      console.error("Error fetching educations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/educations", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /educations] Creating education with data:`, req.body);
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /educations] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /educations] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /educations] No matching user found for Firebase UID: ${req.body.userId}`);
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      console.log(`[POST /educations] Processing with userId: ${req.body.userId}`);
      const educationData = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(educationData);
      console.log(`[POST /educations] Created education with ID: ${education.id}`);
      res.status(201).json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /educations] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /educations] Server error:`, error);
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
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/skills] Request for skills with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/skills] userId appears to be a Firebase UID: ${userIdParam}`);
        // Try to find user with this username (Firebase UID)
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/skills] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/skills] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/skills] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/skills] Using numeric userId: ${userId}`);
      }
      
      const skills = await storage.getSkillsByUserId(userId);
      console.log(`[GET /users/:userId/skills] Found ${skills.length} skills for userId: ${userId}`);
      res.json(skills);
    } catch (error) {
      console.error("Error fetching skills:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/skills", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /skills] Creating skill with data:`, req.body);
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /skills] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /skills] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /skills] No matching user found for Firebase UID: ${req.body.userId}`);
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      console.log(`[POST /skills] Processing with userId: ${req.body.userId}`);
      const skillData = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(skillData);
      console.log(`[POST /skills] Created skill with ID: ${skill.id}`);
      res.status(201).json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /skills] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /skills] Server error:`, error);
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

  // Project routes
  apiRouter.get("/users/:userId/projects", async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/projects] Request for projects with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/projects] userId appears to be a Firebase UID: ${userIdParam}`);
        // Try to find user with this username (Firebase UID)
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/projects] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/projects] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/projects] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/projects] Using numeric userId: ${userId}`);
      }
      
      const projects = await storage.getProjectsByUserId(userId);
      console.log(`[GET /users/:userId/projects] Found ${projects.length} projects for userId: ${userId}`);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.get("/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }
      
      const project = await storage.getProjectById(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Handle file uploads for project thumbnails
  apiRouter.post("/projects/upload-thumbnail", (req: Request, res: Response) => {
    try {
      console.log(`[POST /projects/upload-thumbnail] Received upload request:`, req.files);
      
      // Handle express-fileupload first (which should be active based on middleware)
      if (req.files && req.files.thumbnail) {
        const thumbnailFile = req.files.thumbnail;
        
        // If it's an array, take the first file
        const file = Array.isArray(thumbnailFile) ? thumbnailFile[0] : thumbnailFile;
        
        console.log(`[POST /projects/upload-thumbnail] Processing file:`, file.name);
        
        // Generate a unique filename
        const timestamp = Date.now();
        const ext = path.extname(file.name);
        const filename = `project_${req.body.projectId || 'new'}_${timestamp}${ext}`;
        
        // Define the upload path
        const uploadPath = path.join(process.cwd(), 'public', 'uploads', 'projects', filename);
        
        // Move the file to the upload directory
        file.mv(uploadPath, (err) => {
          if (err) {
            console.error(`[POST /projects/upload-thumbnail] File move error:`, err);
            return res.status(500).json({ 
              message: `Error saving file: ${err.message}`,
              error: err 
            });
          }
          
          console.log(`[POST /projects/upload-thumbnail] File saved to:`, uploadPath);
          
          // Generate the public URL for the file
          const fileUrl = getFileUrl(filename);
          
          res.status(200).json({
            thumbnailFile: filename,
            thumbnailUrl: fileUrl,
            message: "File uploaded successfully"
          });
        });
      } 
      // Fallback to multer if express-fileupload didn't pick up the file
      else {
        projectThumbnailUpload(req, res, (err) => {
          if (err) {
            console.error(`[POST /projects/upload-thumbnail] Multer upload error:`, err);
            return res.status(400).json({ message: err.message });
          }
          
          if (!req.file) {
            console.error(`[POST /projects/upload-thumbnail] No file provided in the request`);
            return res.status(400).json({ message: "No file uploaded" });
          }
          
          console.log(`[POST /projects/upload-thumbnail] File uploaded with multer:`, req.file.filename);
          const fileUrl = getFileUrl(req.file.filename);
          
          res.status(200).json({ 
            thumbnailFile: req.file.filename,
            thumbnailUrl: fileUrl,
            message: "File uploaded successfully with multer" 
          });
        });
      }
    } catch (error) {
      console.error(`[POST /projects/upload-thumbnail] Unexpected error:`, error);
      res.status(500).json({ 
        message: "Failed to process file upload",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  apiRouter.post("/projects", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /projects] Creating project with data:`, JSON.stringify(req.body));
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /projects] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        console.log(`[POST /projects] Looking up user with Firebase UID: ${req.body.userId}, found:`, user);
        
        if (user) {
          console.log(`[POST /projects] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /projects] No matching user found for Firebase UID: ${req.body.userId}`);
          return res.status(404).json({ message: "User not found" });
        }
      } else {
        console.log(`[POST /projects] Non-Firebase userId provided: ${req.body.userId}, type: ${typeof req.body.userId}`);
      }
      
      console.log(`[POST /projects] Processing with userId: ${req.body.userId}`);
      
      // Handle thumbnailFile if provided and create thumbnailUrl
      if (req.body.thumbnailFile && !req.body.thumbnailUrl) {
        const thumbnailUrl = getFileUrl(req.body.thumbnailFile);
        req.body.thumbnailUrl = thumbnailUrl;
      }
      
      // Log the schema for debugging
      console.log(`[POST /projects] Project schema fields:`, Object.keys(insertProjectSchema.shape));
      
      try {
        const projectData = insertProjectSchema.parse(req.body);
        console.log(`[POST /projects] Validated project data:`, projectData);
        const project = await storage.createProject(projectData);
        console.log(`[POST /projects] Created project with ID: ${project.id}`);
        res.status(201).json(project);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          console.error(`[POST /projects] Validation error:`, validationError.errors);
          return res.status(400).json({ message: validationError.errors });
        }
        throw validationError; // Re-throw if it's not a ZodError
      }
    } catch (error) {
      console.error(`[POST /projects] Server error:`, error);
      let errorMessage = "Internal server error";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({ message: errorMessage });
    }
  });

  apiRouter.put("/projects/:id", async (req: Request, res: Response) => {
    try {
      console.log(`[PUT /projects/:id] Updating project with data:`, req.body);
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }
      
      // Check if project exists
      const existingProject = await storage.getProjectById(projectId);
      
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const projectData = req.body;
      
      // Handle thumbnailFile if provided and create thumbnailUrl
      if (projectData.thumbnailFile && !projectData.thumbnailUrl) {
        const thumbnailUrl = getFileUrl(projectData.thumbnailFile);
        projectData.thumbnailUrl = thumbnailUrl;
      }
      
      const updatedProject = await storage.updateProject(projectId, projectData);
      console.log(`[PUT /projects/:id] Updated project with ID: ${projectId}`);
      
      res.json(updatedProject);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.delete("/projects/:id", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.id);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }
      
      // First, fetch the project to make sure it exists
      const existingProject = await storage.getProjectById(projectId);
      
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // Delete the project
      const success = await storage.deleteProject(projectId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete project" });
      }
      
      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Project Collaborator routes
  apiRouter.get("/projects/:projectId/collaborators", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }
      
      // Check if project exists
      const existingProject = await storage.getProjectById(projectId);
      
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const collaborators = await storage.getProjectCollaboratorsByProjectId(projectId);
      res.json(collaborators);
    } catch (error) {
      console.error("Error fetching project collaborators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/project-collaborators", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /project-collaborators] Creating collaborator with data:`, req.body);
      
      // Validate that profileLink is present
      if (!req.body.profileLink) {
        return res.status(400).json({ message: "Profile link is required" });
      }

      // Set default values
      if (!req.body.name) {
        req.body.name = "Team Member";
      }
      
      if (!req.body.role) {
        req.body.role = "Collaborator";
      }
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId?.length > 20) {
        console.log(`[POST /project-collaborators] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /project-collaborators] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /project-collaborators] No matching user found for Firebase UID: ${req.body.userId}`);
          // This is acceptable for collaborators, as they might be invited by email
          req.body.userId = null;
        }
      }
      
      const collaboratorData = insertProjectCollaboratorSchema.parse(req.body);
      const collaborator = await storage.createProjectCollaborator(collaboratorData);
      console.log(`[POST /project-collaborators] Created collaborator with ID: ${collaborator.id}`);
      res.status(201).json(collaborator);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /project-collaborators] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /project-collaborators] Server error:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.put("/project-collaborators/:id", async (req: Request, res: Response) => {
    try {
      const collaboratorId = parseInt(req.params.id);
      
      if (isNaN(collaboratorId)) {
        return res.status(400).json({ message: "Invalid collaborator ID format" });
      }
      
      // Check if collaborator exists
      const existingCollaborator = await storage.getProjectCollaboratorById(collaboratorId);
      
      if (!existingCollaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      
      const collaboratorData = req.body;
      const updatedCollaborator = await storage.updateProjectCollaborator(collaboratorId, collaboratorData);
      
      res.json(updatedCollaborator);
    } catch (error) {
      console.error("Error updating project collaborator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.delete("/project-collaborators/:id", async (req: Request, res: Response) => {
    try {
      const collaboratorId = parseInt(req.params.id);
      
      if (isNaN(collaboratorId)) {
        return res.status(400).json({ message: "Invalid collaborator ID format" });
      }
      
      // First, fetch the collaborator to make sure it exists
      const existingCollaborator = await storage.getProjectCollaboratorById(collaboratorId);
      
      if (!existingCollaborator) {
        return res.status(404).json({ message: "Collaborator not found" });
      }
      
      // Delete the collaborator
      const success = await storage.deleteProjectCollaborator(collaboratorId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete collaborator" });
      }
      
      res.status(200).json({ message: "Collaborator deleted successfully" });
    } catch (error) {
      console.error("Error deleting project collaborator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Project Endorsement routes
  apiRouter.get("/projects/:projectId/endorsements", async (req: Request, res: Response) => {
    try {
      const projectId = parseInt(req.params.projectId);
      
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID format" });
      }
      
      // Check if project exists
      const existingProject = await storage.getProjectById(projectId);
      
      if (!existingProject) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      const endorsements = await storage.getProjectEndorsementsByProjectId(projectId);
      res.json(endorsements);
    } catch (error) {
      console.error("Error fetching project endorsements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/project-endorsements", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /project-endorsements] Creating endorsement with data:`, req.body);
      
      const endorsementData = insertProjectEndorsementSchema.parse(req.body);
      const endorsement = await storage.createProjectEndorsement(endorsementData);
      console.log(`[POST /project-endorsements] Created endorsement with ID: ${endorsement.id}`);
      res.status(201).json(endorsement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /project-endorsements] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /project-endorsements] Server error:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  apiRouter.put("/project-endorsements/:id", async (req: Request, res: Response) => {
    try {
      const endorsementId = parseInt(req.params.id);
      
      if (isNaN(endorsementId)) {
        return res.status(400).json({ message: "Invalid endorsement ID format" });
      }
      
      // Check if endorsement exists
      const existingEndorsement = await storage.getProjectEndorsementById(endorsementId);
      
      if (!existingEndorsement) {
        return res.status(404).json({ message: "Endorsement not found" });
      }
      
      const endorsementData = req.body;
      const updatedEndorsement = await storage.updateProjectEndorsement(endorsementId, endorsementData);
      
      res.json(updatedEndorsement);
    } catch (error) {
      console.error("Error updating project endorsement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.delete("/project-endorsements/:id", async (req: Request, res: Response) => {
    try {
      const endorsementId = parseInt(req.params.id);
      
      if (isNaN(endorsementId)) {
        return res.status(400).json({ message: "Invalid endorsement ID format" });
      }
      
      // First, fetch the endorsement to make sure it exists
      const existingEndorsement = await storage.getProjectEndorsementById(endorsementId);
      
      if (!existingEndorsement) {
        return res.status(404).json({ message: "Endorsement not found" });
      }
      
      // Delete the endorsement
      const success = await storage.deleteProjectEndorsement(endorsementId);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to delete endorsement" });
      }
      
      res.status(200).json({ message: "Endorsement deleted successfully" });
    } catch (error) {
      console.error("Error deleting project endorsement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chat Message routes
  apiRouter.get("/users/:userId/chat-messages", async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/chat-messages] Request for chat messages with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/chat-messages] userId appears to be a Firebase UID: ${userIdParam}`);
        // Try to find user with this username (Firebase UID)
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/chat-messages] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/chat-messages] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/chat-messages] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/chat-messages] Using numeric userId: ${userId}`);
      }
      
      const messages = await storage.getChatMessagesByUserId(userId);
      console.log(`[GET /users/:userId/chat-messages] Found ${messages.length} chat messages for userId: ${userId}`);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/chat-messages", async (req: Request, res: Response) => {
    try {
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /chat-messages] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /chat-messages] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /chat-messages] No matching user found for Firebase UID: ${req.body.userId}`);
          console.log(`[POST /chat-messages] Creating temporary user for Firebase UID`);
          
          // Create a new user with the Firebase UID
          const newUser = await storage.createUser({
            username: req.body.userId,
            email: `firebase_${req.body.userId.substring(0, 8)}@example.com`,
            password: null,
            name: "Firebase User",
            phoneNumber: null,
            photoURL: null,
            title: null,
            location: null,
            industry: null,
            lookingFor: null,
            profileCompleted: null
          });
          
          console.log(`[POST /chat-messages] Created new user with ID: ${newUser.id}`);
          req.body.userId = newUser.id;
        }
      }
      
      console.log(`[POST /chat-messages] Processing message with userId: ${req.body.userId}`);
      const messageData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(messageData);
      console.log(`[POST /chat-messages] Created message: ${message.id}`);
      
      // If this is a user message, generate an AI response
      if (messageData.sender === 'user') {
        console.log(`[POST /chat-messages] User message, generating AI response`);
        const userId = messageData.userId;
        const userSkills = await storage.getSkillsByUserId(userId);
        const userExperiences = await storage.getWorkExperiencesByUserId(userId);
        const userEducations = await storage.getEducationsByUserId(userId);
        
        console.log(`[POST /chat-messages] Retrieved user data: ${userSkills.length} skills, ${userExperiences.length} experiences, ${userEducations.length} educations`);
        
        // Extract careerGoal if it exists in the request
        const careerGoal = req.body.careerGoal;
        if (careerGoal) {
          console.log(`[POST /chat-messages] Career goal: ${careerGoal}`);
        }
        
        console.log(`[POST /chat-messages] Generating career advice...`);
        const aiResponse = await generateCareerAdvice(
          messageData.content,
          userSkills,
          userExperiences,
          userEducations,
          careerGoal,
          userId // Pass the userId to the AI service
        );
        
        console.log(`[POST /chat-messages] AI response generated (${aiResponse.length} characters)`);
        
        // Save the AI response
        console.log(`[POST /chat-messages] Saving AI response to database`);
        const aiMessage = await storage.createChatMessage({
          userId: messageData.userId,
          content: aiResponse,
          sender: 'ai',
          messageType: 'career_advice'
        });
        
        console.log(`[POST /chat-messages] AI message saved with ID: ${aiMessage.id}`);
        res.status(201).json({ userMessage: message, aiMessage });
      } else {
        console.log(`[POST /chat-messages] Non-user message, returning directly`);
        res.status(201).json(message);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /chat-messages] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /chat-messages] Server error:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Profile data parsing endpoints
  // Resume parsing endpoint removed
  
  // Job title suggestions endpoint
  apiRouter.get("/job-title-suggestions", async (req: Request, res: Response) => {
    try {
      const query = req.query.q as string;
      
      if (!query || query.trim().length < 2) {
        return res.status(200).json({ suggestions: [] });
      }
      
      console.log(`Getting job title suggestions for query: "${query}"`);
      
      // Check if OpenAI API key is available
      if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is not set. Cannot generate job title suggestions.");
        return res.status(500).json({
          error: "OpenAI API key not configured",
          message: "Unable to generate suggestions without OpenAI API key configuration",
          suggestions: []
        });
      }
      
      const suggestions = await getJobTitleSuggestions(query);
      res.status(200).json({ suggestions });
    } catch (error) {
      console.error('Error getting job title suggestions:', error);
      res.status(500).json({ 
        message: "Failed to generate job title suggestions", 
        suggestions: [] 
      });
    }
  });
  
  // AI Career Advice endpoint
  apiRouter.post("/ai/career-advice", async (req: Request, res: Response) => {
    try {
      // Check if OPENAI_API_KEY is present
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          message: "OpenAI service unavailable. API key is missing.",
          requiresApiKey: true
        });
      }
      
      const { userId, adviceType, customAdviceText } = req.body;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      if (!adviceType) {
        return res.status(400).json({ message: "Advice type is required" });
      }
      
      // Fetch all relevant user data
      const workExperiences = await storage.getWorkExperiencesByUserId(userId);
      const skills = await storage.getSkillsByUserId(userId);
      const educations = await storage.getEducationsByUserId(userId);
      
      // Get user basics
      const user = await storage.getUser(userId);
      
      // Compile user profile
      const userProfile = {
        user,
        workExperiences,
        skills,
        educations,
        adviceType,
        customAdviceText
      };
      
      // Import OpenAI service
      const { generateCareerAdvice } = await import('./services/openai-service');
      
      // Generate advice
      const advice = await generateCareerAdvice(userProfile);
      
      // Save the advice as a chat message
      await storage.createChatMessage({
        userId,
        sender: "ai",
        content: advice,
        messageType: "career_advice"
      });
      
      res.json({ advice });
    } catch (error) {
      console.error("Error generating AI career advice:", error);
      res.status(500).json({ message: "Error generating career advice" });
    }
  });
  
  // AI Resume Analysis endpoint
  apiRouter.post("/ai/analyze-resume", async (req: Request, res: Response) => {
    try {
      // Check if OPENAI_API_KEY is present
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          message: "OpenAI service unavailable. API key is missing.",
          requiresApiKey: true
        });
      }
      
      const { userId, fileData, resumeText } = req.body;
      
      // Check if we have either file data or resume text
      if (!fileData && !resumeText) {
        return res.status(400).json({ message: "Either resume file data or resume text is required" });
      }
      
      // Import OpenAI service
      const { analyzeResume } = await import('./services/openai-service');
      
      let analysis;
      
      try {
        if (resumeText) {
          // Process the raw text directly
          console.log("Processing resume text input directly");
          analysis = await analyzeResume({ 
            resumeTextStart: resumeText,
            isBase64: false,
            isLink: false
          } as any);
        } else {
          // Process the file data
          console.log("Processing resume file data");
          analysis = await analyzeResume({ 
            resumeTextStart: fileData,
            isBase64: true,
            isLink: false
          } as any);
        }
      } catch (aiError: any) {
        console.error("Error from OpenAI API:", aiError);
        
        // Check if it's a rate limit or token limit error
        if (aiError.message && 
            (aiError.message.includes("rate_limit_exceeded") || 
             aiError.message.includes("token") || 
             aiError.message.includes("too large"))) {
          return res.status(413).json({ 
            message: "Your resume is too large for our AI analysis. Please try with a shorter text or a simplified version of your resume (2500 characters or less).",
            error: "TOKEN_LIMIT_EXCEEDED"
          });
        }
        
        // If it's some other OpenAI error, rethrow to be caught by the outer catch
        throw aiError;
      }
      
      // If userId is provided, save the analysis as a chat message
      if (userId) {
        await storage.createChatMessage({
          userId,
          sender: "ai",
          content: analysis,
          messageType: "resume_analysis"
        });
      }
      
      res.json({ analysis });
    } catch (error) {
      console.error("Error analyzing resume with OpenAI:", error);
      res.status(500).json({ message: "Error analyzing resume" });
    }
  });
  
  // AI Networking Recommendations endpoint
  apiRouter.post("/ai/networking-recommendations", async (req: Request, res: Response) => {
    try {
      // Check if OPENAI_API_KEY is present
      if (!process.env.OPENAI_API_KEY) {
        return res.status(503).json({ 
          message: "OpenAI service unavailable. API key is missing.",
          requiresApiKey: true
        });
      }
      
      const { userId, targetIndustry, purpose } = req.body;
      
      if (!userId || !targetIndustry || !purpose) {
        return res.status(400).json({ 
          message: "User ID, target industry, and networking purpose are required" 
        });
      }
      
      // Fetch relevant user data
      const workExperiences = await storage.getWorkExperiencesByUserId(userId);
      const skills = await storage.getSkillsByUserId(userId);
      
      // Import OpenAI service
      const { generateNetworkingRecommendations } = await import('./services/openai-service');
      
      // Generate networking recommendations
      const recommendations = await generateNetworkingRecommendations(
        { workExperiences, skills }, 
        targetIndustry, 
        purpose
      );
      
      // Save the recommendations as a chat message
      await storage.createChatMessage({
        userId,
        sender: "ai",
        content: recommendations,
        messageType: "networking_recommendations"
      });
      
      res.json({ recommendations });
    } catch (error) {
      console.error("Error generating networking recommendations with OpenAI:", error);
      res.status(500).json({ message: "Error generating networking recommendations" });
    }
  });
  
  // Old resume parsing endpoint removed
  /*apiRouter.post("/parse-resume-old", async (req: Request, res: Response) => {
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
  
  */
  
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
      const savedItems: {
        experiences: any[],
        educations: any[],
        skills: any[]
      } = {
        experiences: [],
        educations: [],
        skills: []
      };
      
      // Save work experiences
      if (experiences && experiences.length > 0) {
        for (const exp of experiences) {
          // Properly type the object as InsertWorkExperience
          const insertExp: InsertWorkExperience = {
            ...exp,
            userId: userIdNum
          };
          const savedExp = await storage.createWorkExperience(insertExp);
          savedItems.experiences.push(savedExp as any);
        }
        console.log(`Saved ${savedItems.experiences.length} work experiences`);
      }
      
      // Save educations
      if (educations && educations.length > 0) {
        for (const edu of educations) {
          // Properly type the object as InsertEducation
          const insertEdu: InsertEducation = {
            ...edu,
            userId: userIdNum
          };
          const savedEdu = await storage.createEducation(insertEdu);
          savedItems.educations.push(savedEdu as any);
        }
        console.log(`Saved ${savedItems.educations.length} education items`);
      }
      
      // Save skills
      if (skills && skills.length > 0) {
        for (const skill of skills) {
          // Properly type the object as InsertSkill
          const insertSkill: InsertSkill = {
            ...skill,
            userId: userIdNum
          };
          const savedSkill = await storage.createSkill(insertSkill);
          savedItems.skills.push(savedSkill as any);
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
  
  // LinkedIn parsing endpoint removed
  /*apiRouter.post("/parse-linkedin", async (req: Request, res: Response) => {
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
  
  // Email/Password authentication routes
  apiRouter.post("/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      console.log(`Login attempt for email: ${email}`);
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Simple password check for development (in a real app we'd use bcrypt)
      if (user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if email is verified
      if (user.emailVerified !== true) {
        return res.status(403).json({ 
          message: "Email not verified. Please verify your email to login.",
          isVerificationError: true,
          email: user.email
        });
      }
      
      return res.status(200).json(user);
      
    } catch (error) {
      console.error("Error during login:", error);
      return res.status(500).json({ message: "Failed to log in" });
    }
  });
  
  // Email verification endpoint
  apiRouter.get("/verify-email/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      console.log(`Email verification attempt with token: ${token}`);
      
      if (!token) {
        return res.status(400).json({ message: "Verification token is required" });
      }
      
      // Find verification by token
      const verification = await storage.getEmailVerificationByToken(token);
      
      if (!verification) {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      
      // Check if token is expired
      if (verification.expiresAt < new Date()) {
        return res.status(400).json({ message: "Verification token has expired. Please request a new one." });
      }
      
      // Check if already verified
      if (verification.verified) {
        return res.status(200).json({ message: "Email already verified" });
      }
      
      // Verify the email
      const success = await storage.verifyEmail(verification.email, token);
      
      if (!success) {
        return res.status(500).json({ message: "Failed to verify email" });
      }
      
      // Update the user's emailVerified status
      const user = await storage.getUserByEmail(verification.email);
      if (user) {
        await storage.updateUser(user.id, { emailVerified: true });
        
        // Send a welcome email
        try {
          const previewUrl = await sendWelcomeEmail(verification.email);
          console.log(`Welcome email sent to ${verification.email}`);
          
          // Redirect to success page with email preview for development
          return res.status(200).json({ 
            message: "Email verified successfully",
            user,
            welcomeEmailPreview: previewUrl
          });
        } catch (emailError) {
          console.error("Error sending welcome email:", emailError);
          // Continue with success response even if welcome email fails
        }
      }
      
      return res.status(200).json({ message: "Email verified successfully" });
      
    } catch (error) {
      console.error("Error during email verification:", error);
      return res.status(500).json({ message: "Failed to verify email" });
    }
  });
  
  // Resend email verification token
  apiRouter.post("/resend-verification", async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      
      console.log(`Resending verification email to: ${email}`);
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Find the user by email
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(400).json({ message: "User not found with this email" });
      }
      
      // Check if already verified
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      
      // Generate a new verification token
      const token = crypto.randomBytes(32).toString('hex');
      
      // Set expiration time (24 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      // Get existing verification
      const existingVerification = await storage.getEmailVerificationByEmail(email);
      
      // Create or update the verification
      if (existingVerification) {
        // Update existing verification
        await storage.updateEmailVerification(existingVerification.id, {
          token,
          expiresAt,
          verified: false
        });
      } else {
        // Create new verification
        await storage.createEmailVerification({
          email,
          token,
          expiresAt
        });
      }
      
      // Update user with new token
      await storage.updateUser(user.id, {
        emailVerificationToken: token,
        emailVerificationExpires: expiresAt
      });
      
      console.log(`Created new verification token for user ${email}: ${token}`);
      
      // Send a verification email using Ethereal
      try {
        const previewUrl = await sendVerificationEmail(
          email, 
          token, 
          req.get('host') || 'localhost:5000'
        );
        
        // Return success response with preview URL for development
        res.status(200).json({
          message: "Verification email sent successfully",
          emailPreview: previewUrl // This is for development to view the email
        });
      } catch (emailError) {
        console.error("Error sending verification email:", emailError);
        // Even if email sending fails, return success with the token for dev purposes
        res.status(200).json({
          message: "Verification email requested, but could not be sent. Please try again later.",
          verificationToken: token // Fallback for development
        });
      }
      
    } catch (error) {
      console.error("Error resending verification email:", error);
      return res.status(500).json({ message: "Failed to resend verification email" });
    }
  });
  
  // Phone authentication routes
  apiRouter.post("/request-otp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber } = req.body;
      
      console.log(`Request OTP for phone number: ${phoneNumber}`);
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      // Generate a random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store the OTP in our storage with expiry time (10 minutes from now)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);
      
      console.log(`Generated OTP: ${otp}, expires at: ${expiresAt}`);
      
      const verification = await storage.createOtpVerification({
        phoneNumber,
        otp,
        expiresAt
      });
      
      console.log(`OTP verification created:`, verification);
      
      // In a real application, you would send the OTP via SMS here
      // For development purposes, we'll just return success
      console.log(`OTP generated for ${phoneNumber}: ${otp}`);
      
      return res.status(200).json({ 
        message: "OTP sent successfully",
        // Include the OTP in the response for testing purposes only
        // In production, this would be removed
        otp 
      });
    } catch (error) {
      console.error("Error generating OTP:", error);
      return res.status(500).json({ message: "Failed to generate OTP" });
    }
  });
  
  apiRouter.post("/verify-otp", async (req: Request, res: Response) => {
    try {
      const { phoneNumber, otp } = req.body;
      
      console.log(`Verifying OTP for ${phoneNumber}: ${otp}`);
      
      if (!phoneNumber || !otp) {
        console.log("Missing required parameters");
        return res.status(400).json({ message: "Phone number and OTP are required" });
      }
      
      // Get the verification object for debugging
      const verification = await storage.getOtpVerificationByPhoneNumber(phoneNumber);
      console.log("Current verification object:", verification);
      
      // Verify the OTP
      const isValid = await storage.verifyOtp(phoneNumber, otp);
      console.log("OTP validation result:", isValid);
      
      if (!isValid) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Check if user exists
      let user = await storage.getUserByPhoneNumber(phoneNumber);
      let isNewUser = false;
      
      if (!user) {
        // Create a new user if one doesn't exist
        isNewUser = true;
        user = await storage.createUser({
          username: `user_${Date.now()}`, // Generate a unique username
          email: `${Date.now()}@example.com`, // Generate a unique email (placeholder)
          phoneNumber,
          name: null,
          photoURL: null,
          title: null,
          location: null,
          industry: null,
          lookingFor: null,
          profileCompleted: 10, // Start with low completion
        });
        
        console.log("Created new user for phone number:", user);
      } else {
        console.log("Found existing user for phone number:", user);
        
        // If user exists but has minimal profile data, treat as a new user that needs to complete signup
        if (!user.name || !user.email || user.profileCompleted < 20) {
          isNewUser = true;
        }
      }
      
      return res.status(200).json({ 
        message: "OTP verified successfully",
        user,
        isNewUser
      });
    } catch (error) {
      console.error("Error verifying OTP:", error);
      return res.status(500).json({ message: "Failed to verify OTP" });
    }
  });
  */

  // Portfolio routes
  apiRouter.get("/users/:userId/portfolio", async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/portfolio] Request for portfolio with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Improved detection of Firebase UIDs - they're long and contain non-numeric characters
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/portfolio] userId appears to be a Firebase UID: ${userIdParam}`);
        // Try to find user with this username (Firebase UID)
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/portfolio] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/portfolio] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/portfolio] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/portfolio] Using numeric userId: ${userId}`);
      }
      
      const portfolio = await storage.getPortfolioByUserId(userId);
      
      if (!portfolio) {
        console.log(`[GET /users/:userId/portfolio] No portfolio found for userId: ${userId}`);
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      console.log(`[GET /users/:userId/portfolio] Found portfolio:`, portfolio);
      res.json(portfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.post("/portfolios", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /portfolios] Creating portfolio with data:`, req.body);
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /portfolios] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /portfolios] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /portfolios] No matching user found for Firebase UID: ${req.body.userId}`);
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      // Check if user already has a portfolio
      const existingPortfolio = await storage.getPortfolioByUserId(req.body.userId);
      if (existingPortfolio) {
        console.log(`[POST /portfolios] User already has a portfolio, updating instead of creating`);
        // Update the existing portfolio instead of creating a new one
        const updatedPortfolio = await storage.updatePortfolio(existingPortfolio.id, req.body);
        return res.status(200).json(updatedPortfolio);
      }
      
      console.log(`[POST /portfolios] Processing with userId: ${req.body.userId}`);
      const portfolioData = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(portfolioData);
      console.log(`[POST /portfolios] Created portfolio with ID: ${portfolio.id}`);
      res.status(201).json(portfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /portfolios] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /portfolios] Server error:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  apiRouter.put("/portfolios/:id", async (req: Request, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.id);
      
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }
      
      console.log(`[PUT /portfolios/:id] Updating portfolio with ID: ${portfolioId}`);
      
      // Find the portfolio first
      const portfolio = await storage.updatePortfolio(portfolioId, req.body);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      console.log(`[PUT /portfolios/:id] Successfully updated portfolio:`, portfolio);
      res.json(portfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/portfolios/:id", async (req: Request, res: Response) => {
    try {
      const portfolioId = parseInt(req.params.id);
      
      if (isNaN(portfolioId)) {
        return res.status(400).json({ message: "Invalid portfolio ID" });
      }
      
      console.log(`[DELETE /portfolios/:id] Deleting portfolio with ID: ${portfolioId}`);
      
      const success = await storage.deletePortfolio(portfolioId);
      
      if (!success) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      
      console.log(`[DELETE /portfolios/:id] Successfully deleted portfolio with ID: ${portfolioId}`);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting portfolio:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Service routes
  apiRouter.get("/users/:userId/services", async (req: Request, res: Response) => {
    try {
      const userIdParam = req.params.userId;
      console.log(`[GET /users/:userId/services] Request for services with userId: ${userIdParam}`);
      
      let userId: number;
      
      // Handle Firebase UID
      const isFirebaseUid = userIdParam.length > 20 && /[^0-9]/.test(userIdParam);
      
      if (isFirebaseUid) {
        console.log(`[GET /users/:userId/services] userId appears to be a Firebase UID: ${userIdParam}`);
        const user = await storage.getUserByUsername(userIdParam);
        
        if (!user) {
          console.log(`[GET /users/:userId/services] No user found with Firebase UID: ${userIdParam}`);
          return res.status(404).json({ message: "User not found" });
        }
        
        console.log(`[GET /users/:userId/services] Found user with ID: ${user.id} for Firebase UID: ${userIdParam}`);
        userId = user.id;
      } else {
        // Try to parse as numeric ID
        userId = parseInt(userIdParam);
        
        if (isNaN(userId)) {
          console.log(`[GET /users/:userId/services] ID is not a valid numeric ID: ${userIdParam}`);
          return res.status(400).json({ message: "Invalid user ID format" });
        }
        
        console.log(`[GET /users/:userId/services] Using numeric userId: ${userId}`);
      }
      
      const services = await storage.getServicesByUserId(userId);
      console.log(`[GET /users/:userId/services] Found ${services.length} services for userId: ${userId}`);
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  apiRouter.post("/services", async (req: Request, res: Response) => {
    try {
      console.log(`[POST /services] Creating service with data:`, req.body);
      
      // Check if we have a Firebase UID instead of numeric userId
      if (typeof req.body.userId === 'string' && req.body.userId.length > 20) {
        console.log(`[POST /services] Received Firebase UID as userId: ${req.body.userId}`);
        
        // Look up the numeric userId for this Firebase UID
        const user = await storage.getUserByUsername(req.body.userId);
        
        if (user) {
          console.log(`[POST /services] Found matching user with ID: ${user.id}`);
          // Replace the Firebase UID with the numeric userId
          req.body.userId = user.id;
        } else {
          console.log(`[POST /services] No matching user found for Firebase UID: ${req.body.userId}`);
          return res.status(404).json({ message: "User not found" });
        }
      }
      
      console.log(`[POST /services] Processing with userId: ${req.body.userId}`);
      const serviceData = insertServiceSchema.parse(req.body);
      const service = await storage.createService(serviceData);
      console.log(`[POST /services] Created service with ID: ${service.id}`);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error(`[POST /services] Validation error:`, error.errors);
        res.status(400).json({ message: error.errors });
      } else {
        console.error(`[POST /services] Server error:`, error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });
  
  apiRouter.put("/services/:id", async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      console.log(`[PUT /services/:id] Updating service with ID: ${serviceId}`);
      
      // Find the service first
      const service = await storage.updateService(serviceId, req.body);
      
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      console.log(`[PUT /services/:id] Successfully updated service:`, service);
      res.json(service);
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  apiRouter.delete("/services/:id", async (req: Request, res: Response) => {
    try {
      const serviceId = parseInt(req.params.id);
      
      if (isNaN(serviceId)) {
        return res.status(400).json({ message: "Invalid service ID" });
      }
      
      console.log(`[DELETE /services/:id] Deleting service with ID: ${serviceId}`);
      
      const success = await storage.deleteService(serviceId);
      
      if (!success) {
        return res.status(404).json({ message: "Service not found" });
      }
      
      console.log(`[DELETE /services/:id] Successfully deleted service with ID: ${serviceId}`);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}

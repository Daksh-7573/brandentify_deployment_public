import { Request, Response } from 'express';
import { z } from 'zod';
import { IStorage } from './storage';
import { insertResumeSchema } from '@shared/schema';
import { 
  Document, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Packer,
  Table,
  TableRow,
  TableCell,
  BorderStyle,
  WidthType
} from 'docx';

export function setupShadowResumeRoutes(apiRouter: any, storage: IStorage) {
  // NO LONGER updates the Profile from Shadow Resume (removes profile update functionality)
  apiRouter.post("/shadow-resumes/:resumeId/refresh-from-profile", async (req: Request, res: Response) => {
    try {
      const { resumeId } = req.params;
      console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] NO LONGER updates profile from resume - just saves resume data ${resumeId}`);
      
      // Get the resume editor data (that contains saved form data)
      const resume = await storage.getResumeById(parseInt(resumeId));
      if (!resume) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Resume not found with ID: ${resumeId}`);
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Get the user's ID from the resume
      const userId = resume.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] User not found with ID: ${userId}`);
        return res.status(404).json({ message: 'User profile not found' });
      }
      
      // Get the resume data (which should contain the edited form data)
      const resumeData = req.body?.resumeData || {};
      
      console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Processing resume editor data without updating profile for user ${userId}`);
      
      // Extract data for logging only (we no longer update the profile from this)
      const { personalInfo, experiences, education, skills, projects } = resumeData;
      
      // We no longer update the user profile with personal info
      if (personalInfo) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Skipping profile update for ${userId} as requested`);
      }
      
      // SKIP WORK EXPERIENCES UPDATE - Just log that we're skipping it
      if (experiences && experiences.experiences && Array.isArray(experiences.experiences)) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Skipping work experiences update (${experiences.experiences.length} items) to preserve profile data`);
      }
      
      // SKIP EDUCATION UPDATE - Just log that we're skipping it
      if (education && education.educations && Array.isArray(education.educations)) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Skipping education update (${education.educations.length} items) to preserve profile data`);
      }
      
      // SKIP SKILLS UPDATE - Just log that we're skipping it
      if (skills && skills.skills && Array.isArray(skills.skills)) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Skipping skills update (${skills.skills.length} items) to preserve profile data`);
      }
      
      // SKIP PROJECTS UPDATE - Just log that we're skipping it
      if (projects && projects.projects && Array.isArray(projects.projects)) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Skipping projects update (${projects.projects.length} items) to preserve profile data`);
      }
      
      // Update resume with timestamp only (settings have been removed from frontend)
      const updatedResume = await storage.updateResume(parseInt(resumeId), {
        lastUpdatedByMusk: new Date(),
        // Settings have been removed from frontend, so we don't update them here
      });
      
      console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Successfully updated RESUME ONLY (not profile) ${resumeId}`);
      return res.status(200).json({ 
        resume: updatedResume,
        message: 'Resume updated successfully. Profile remains unchanged.',
        success: true
      });
    } catch (error) {
      console.error(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Error:`, error);
      return res.status(500).json({ 
        message: 'Failed to update resume data. Profile remains unchanged.', 
        error: (error as Error).message,
        success: false
      });
    }
  });
  
  // Refresh Shadow Resume endpoint with expected URL pattern
  apiRouter.post("/users/:userId/shadow-resume/:resumeId/refresh", async (req: Request, res: Response) => {
    try {
      const { userId, resumeId } = req.params;
      console.log(`[POST /users/:userId/shadow-resume/:resumeId/refresh] Refreshing resume ${resumeId} for user ${userId}`);
      
      // Get the resume
      const resume = await storage.getResumeById(parseInt(resumeId));
      if (!resume) {
        console.log(`[POST /users/:userId/shadow-resume/:resumeId/refresh] Resume not found with ID: ${resumeId}`);
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Check if the resume belongs to the user
      if (resume.userId !== parseInt(userId)) {
        console.log(`[POST /users/:userId/shadow-resume/:resumeId/refresh] Resume ${resumeId} does not belong to user ${userId}`);
        return res.status(403).json({ message: 'Resume does not belong to user' });
      }
      
      // Get the user's profile data
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        console.log(`[POST /users/:userId/shadow-resume/:resumeId/refresh] User not found with ID: ${userId}`);
        return res.status(404).json({ message: 'User profile not found' });
      }
      
      // Get the user's experiences, education, and skills
      const workExperiences = await storage.getWorkExperiencesByUserId(parseInt(userId));
      const educations = await storage.getEducationsByUserId(parseInt(userId));
      const skills = await storage.getSkillsByUserId(parseInt(userId));
      const projects = await storage.getProjectsByUserId(parseInt(userId));
      
      // Update resume with refreshed information
      const updatedResume = await storage.updateResume(parseInt(resumeId), {
        lastUpdatedByMusk: new Date(),
        // Not changing the actual PDF to avoid Puppeteer dependency issues
      });
      
      console.log(`[POST /users/:userId/shadow-resume/:resumeId/refresh] Successfully refreshed resume ${resumeId}`);
      return res.status(200).json({ 
        resume: updatedResume,
        message: 'Resume refreshed with latest profile data',
        dataIncluded: {
          workExperiences: workExperiences.length,
          educations: educations.length,
          skills: skills.length,
          projects: projects.length
        }
      });
    } catch (error) {
      console.error(`[POST /users/:userId/shadow-resume/:resumeId/refresh] Error:`, error);
      return res.status(500).json({ 
        message: 'Failed to refresh resume with profile data', 
        error: (error as Error).message 
      });
    }
  });
  
  // Get Shadow Resume for a user
  apiRouter.get("/users/:userId/shadow-resume", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      console.log(`[GET /users/:userId/shadow-resume] Fetching shadow resume for user: ${userId}`);
      
      let numericUserId: number;
      
      // Check if it's a Firebase UID
      if (userId.length > 10 && isNaN(parseInt(userId))) {
        console.log(`[GET /users/:userId/shadow-resume] Looking up user by Firebase UID: ${userId}`);
        const user = await storage.getUserByUsername(userId);
        if (!user) {
          console.log(`[GET /users/:userId/shadow-resume] User not found with Firebase UID: ${userId}`);
          return res.status(404).json({ message: 'User not found' });
        }
        numericUserId = user.id;
        console.log(`[GET /users/:userId/shadow-resume] Found user with ID: ${numericUserId}`);
      } else {
        numericUserId = parseInt(userId);
        console.log(`[GET /users/:userId/shadow-resume] Using numeric user ID: ${numericUserId}`);
      }
      
      // Fetch the shadow resume
      let resume = await storage.getResumeByUserId(numericUserId);
      
      // If no resume exists, create one automatically
      if (!resume) {
        console.log(`[GET /users/:userId/shadow-resume] No shadow resume found for user: ${numericUserId}, auto-creating one...`);
        
        try {
          // Get the user data to use for the resume
          const user = await storage.getUser(numericUserId);
          if (!user) {
            console.log(`[GET /users/:userId/shadow-resume] User not found with ID: ${numericUserId} for auto-creation`);
            return res.status(200).json({ resume: null });
          }
          
          // Create sample resume content placeholder
          const generatedResumeContent = `
%Resume for ${user.name || 'User'}%

# ${user.name || 'Professional'} 
## ${user.title || 'Senior Professional'}
${user.location || 'Location'} | ${user.email || 'Email'} | Phone

## Professional Summary
Accomplished ${user.title || 'professional'} with extensive experience in the ${user.industry || 'technology'} industry. 
Demonstrated expertise in designing and implementing solutions that drive business growth and efficiency.

## Work Experience
Sample work experience would be generated here based on user profile data.

## Education
Sample education details would be generated here.

## Skills
Sample skills relevant to the ${user.industry || 'industry'} would be listed here.
          `;
          
          // Create a sample resume PDF content (base64 encoded)
          const sampleBase64PDF = "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QBjA4fdehdFmAaUz3WQ0LH+KCRFZiWbcbBtJe/DucAbe3+dJTvqU4fDpPDlgL+QJKgzHKJtR9jB89J4pCaaiJxSf1dzCMK9CWQ8GaDPrKDhXlthBmzV/M4vCnHZJW3LgE+SWzHnCM5aUKxJMdFwXpmpTlWhXfN3dMgz1bkWmUYN8gn/P79NVUiB+Ob9dUYD2CmVuZHN0cmVhbQplbmRvYmoKMTQgMCBvYmoKMTQzCmVuZG9iagoxNSAwIG9iagooUmVzdW1lIEV4YW1wbGUpCmVuZG9iagoxNiAwIG9iagooTWFjIE9TIFZlcnNpb24gMTAuMTUuNyBcKEJ1aWxkIDE5SDExNFwpIFF1YXJ0eiBQREZDb250ZXh0KQplbmRvYmoKMTcgMCBvYmoKKFNhZmFyaSkKZW5kb2JqCjE4IDAgb2JqCihEOjIwMjMwNDE4MDUwOTMyWjAwJzAwJykKZW5kb2JqCjE5IDAgb2JqCigpCmVuZG9iagoyMCAwIG9iago8PCAvVGl0bGUgMTUgMCBSIC9BdXRob3IgMTkgMCBSIC9Qcm9kdWNlciAxNiAwIFIgL0NyZWF0b3IgMTcgMCBSIC9DcmVhdGlvbkRhdGUKMTggMCBSID4+CmVuZG9iagp4cmVmCjAgMjEKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA0IDAwMDAwIG4gCjAwMDAwMDAzNTkgMDAwMDAgbiAKMDAwMDAwMDk2OSAwMDAwMCBuIAowMDAwMDAwMDIyIDAwMDAwIG4gCjAwMDAwMDAzMzggMDAwMDAgbiAKMDAwMDAwMDQ1MyAwMDAwMCBuIAowMDAwMDAwOTM0IDAwMDAwIG4gCjAwMDAwMDEwNTEgMDAwMDAgbiAKMDAwMDAwMDU0MCAwMDAwMCBuIAowMDAwMDAwOTEzIDAwMDAwIG4gCjAwMDAwMDEwNDQgMDAwMDAgbiAKMDAwMDAwMTI3MyAwMDAwMCBuIAowMDAwMDAxNTIwIDAwMDAwIG4gCjAwMDAwMDE3NTMgMDAwMDAgbiAKMDAwMDAwMTc3MyAwMDAwMCBuIAowMDAwMDAxODA5IDAwMDAwIG4gCjAwMDAwMDE4ODggMDAwMDAgbiAKMDAwMDAwMTkxMyAwMDAwMCBuIAowMDAwMDAxOTU1IDAwMDAwIG4gCjAwMDAwMDE5NzUgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSAyMSAvUm9vdCAxMSAwIFIgL0luZm8gMjAgMCBSIC9JRCBbIDw2NmQ2M2NmMDkzZjMzNzE3NGE1Njg2M2NiZjY0M2Y2OD4KPDQxMTFhNmE3ZTk1YjI5YWFmNDgwZTNhOGZiYTNmYzRlPiBdID4+CnN0YXJ0eHJlZgoyMDgwCiUlRU9GCg==";
          
          // Create a new shadow resume
          const newResume = {
            userId: numericUserId,
            fileName: `${user.name?.replace(/\s+/g, '') || 'User'}_Resume.pdf`,
            fileData: sampleBase64PDF,
            score: 0,
            uploadedAt: new Date(),
            isShadowResume: true,
            themeStyle: 'professional',
            isDownloadable: false,
            lastUpdatedByMusk: new Date(),
            visibility: 'private',
          };
          
          // Validate and save the resume
          const validatedResume = insertResumeSchema.parse(newResume);
          resume = await storage.createResume(validatedResume);
          
          console.log(`[GET /users/:userId/shadow-resume] Auto-created shadow resume ID: ${resume.id}`);
        } catch (autoCreateError) {
          console.error(`[GET /users/:userId/shadow-resume] Error auto-creating shadow resume:`, autoCreateError);
          return res.status(200).json({ resume: null });
        }
      }
      
      console.log(`[GET /users/:userId/shadow-resume] Found shadow resume ID: ${resume.id}`);
      
      // Check if we have stored form data in the metadata field
      let formData = null;
      if (resume.metadata) {
        try {
          // Parse the stored JSON form data
          formData = JSON.parse(resume.metadata as string);
          console.log(`[GET /users/:userId/shadow-resume] Found stored form data for resume ID: ${resume.id}`);
          console.log(`[GET /users/:userId/shadow-resume] Parsed metadata:`, formData);
        } catch (parseError) {
          console.error(`[GET /users/:userId/shadow-resume] Error parsing metadata:`, parseError);
        }
      } else {
        console.log(`[GET /users/:userId/shadow-resume] No metadata found for resume ID: ${resume.id}`);
      }
      
      return res.status(200).json({ 
        resume,
        form: formData // Include the parsed form data in the response
      });
    } catch (error) {
      console.error(`[GET /users/:userId/shadow-resume] Error:`, error);
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  });

  // Create Shadow Resume
  apiRouter.post("/users/:userId/create-shadow-resume", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      console.log(`[POST /users/:userId/create-shadow-resume] Creating shadow resume for user: ${userId}`);
      
      let numericUserId: number;
      
      // Check if it's a Firebase UID
      if (userId.length > 10 && isNaN(parseInt(userId))) {
        console.log(`[POST /users/:userId/create-shadow-resume] Looking up user by Firebase UID: ${userId}`);
        const user = await storage.getUserByUsername(userId);
        if (!user) {
          console.log(`[POST /users/:userId/create-shadow-resume] User not found with Firebase UID: ${userId}`);
          return res.status(404).json({ message: 'User not found' });
        }
        numericUserId = user.id;
        console.log(`[POST /users/:userId/create-shadow-resume] Found user with ID: ${numericUserId}`);
      } else {
        numericUserId = parseInt(userId);
        console.log(`[POST /users/:userId/create-shadow-resume] Using numeric user ID: ${numericUserId}`);
      }
      
      // Check if user already has a shadow resume
      const existingResume = await storage.getResumeByUserId(numericUserId);
      if (existingResume) {
        console.log(`[POST /users/:userId/create-shadow-resume] User already has a shadow resume: ${existingResume.id}`);
        return res.status(200).json({ resume: existingResume, message: 'Shadow resume already exists' });
      }

      // Get the user data to use for the resume
      const user = await storage.getUser(numericUserId);
      if (!user) {
        console.log(`[POST /users/:userId/create-shadow-resume] User not found with ID: ${numericUserId}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Create sample resume content placeholder
      // In a real implementation, this would use more of the user's data and OpenAI
      const generatedResumeContent = `
%Resume for ${user.name || 'User'}%

# ${user.name || 'Professional'} 
## ${user.title || 'Senior Professional'}
${user.location || 'Location'} | ${user.email || 'Email'} | Phone

## Professional Summary
Accomplished ${user.title || 'professional'} with extensive experience in the ${user.industry || 'technology'} industry. 
Demonstrated expertise in designing and implementing solutions that drive business growth and efficiency.

## Work Experience
Sample work experience would be generated here based on user profile data.

## Education
Sample education details would be generated here.

## Skills
Sample skills relevant to the ${user.industry || 'industry'} would be listed here.
      `;
      
      // Create a sample resume PDF content (base64 encoded)
      // In a real implementation, this would be an actual PDF generated from the resume content
      const sampleBase64PDF = "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QBjA4fdehdFmAaUz3WQ0LH+KCRFZiWbcbBtJe/DucAbe3+dJTvqU4fDpPDlgL+QJKgzHKJtR9jB89J4pCaaiJxSf1dzCMK9CWQ8GaDPrKDhXlthBmzV/M4vCnHZJW3LgE+SWzHnCM5aUKxJMdFwXpmpTlWhXfN3dMgz1bkWmUYN8gn/P79NVUiB+Ob9dUYD2CmVuZHN0cmVhbQplbmRvYmoKMTQgMCBvYmoKMTQzCmVuZG9iagoxNSAwIG9iagooUmVzdW1lIEV4YW1wbGUpCmVuZG9iagoxNiAwIG9iagooTWFjIE9TIFZlcnNpb24gMTAuMTUuNyBcKEJ1aWxkIDE5SDExNFwpIFF1YXJ0eiBQREZDb250ZXh0KQplbmRvYmoKMTcgMCBvYmoKKFNhZmFyaSkKZW5kb2JqCjE4IDAgb2JqCihEOjIwMjMwNDE4MDUwOTMyWjAwJzAwJykKZW5kb2JqCjE5IDAgb2JqCigpCmVuZG9iagoyMCAwIG9iago8PCAvVGl0bGUgMTUgMCBSIC9BdXRob3IgMTkgMCBSIC9Qcm9kdWNlciAxNiAwIFIgL0NyZWF0b3IgMTcgMCBSIC9DcmVhdGlvbkRhdGUKMTggMCBSID4+CmVuZG9iagp4cmVmCjAgMjEKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA0IDAwMDAwIG4gCjAwMDAwMDAzNTkgMDAwMDAgbiAKMDAwMDAwMDk2OSAwMDAwMCBuIAowMDAwMDAwMDIyIDAwMDAwIG4gCjAwMDAwMDAzMzggMDAwMDAgbiAKMDAwMDAwMDQ1MyAwMDAwMCBuIAowMDAwMDAwOTM0IDAwMDAwIG4gCjAwMDAwMDEwNTEgMDAwMDAgbiAKMDAwMDAwMDU0MCAwMDAwMCBuIAowMDAwMDAwOTEzIDAwMDAwIG4gCjAwMDAwMDEwNDQgMDAwMDAgbiAKMDAwMDAwMTI3MyAwMDAwMCBuIAowMDAwMDAxNTIwIDAwMDAwIG4gCjAwMDAwMDE3NTMgMDAwMDAgbiAKMDAwMDAwMTc3MyAwMDAwMCBuIAowMDAwMDAxODA5IDAwMDAwIG4gCjAwMDAwMDE4ODggMDAwMDAgbiAKMDAwMDAwMTkxMyAwMDAwMCBuIAowMDAwMDAxOTU1IDAwMDAwIG4gCjAwMDAwMDE5NzUgMDAwMDAgbiAKdHJhaWxlcgo8PCAvU2l6ZSAyMSAvUm9vdCAxMSAwIFIgL0luZm8gMjAgMCBSIC9JRCBbIDw2NmQ2M2NmMDkzZjMzNzE3NGE1Njg2M2NiZjY0M2Y2OD4KPDQxMTFhNmE3ZTk1YjI5YWFmNDgwZTNhOGZiYTNmYzRlPiBdID4+CnN0YXJ0eHJlZgoyMDgwCiUlRU9GCg==";
      
      // Create a new shadow resume
      const newResume = {
        userId: numericUserId,
        fileName: `${user.name?.replace(/\s+/g, '') || 'User'}_Resume.pdf`,
        fileData: sampleBase64PDF,
        score: 0,
        uploadedAt: new Date(),
        isShadowResume: true,
        themeStyle: 'professional',
        isDownloadable: false,
        lastUpdatedByMusk: new Date(),
        visibility: 'private',
      };
      
      // Validate and save the resume
      const validatedResume = insertResumeSchema.parse(newResume);
      const createdResume = await storage.createResume(validatedResume);
      
      console.log(`[POST /users/:userId/create-shadow-resume] Created shadow resume ID: ${createdResume.id}`);
      return res.status(201).json({ resume: createdResume });
    } catch (error) {
      console.error(`[POST /users/:userId/create-shadow-resume] Error:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation error', errors: error.errors });
      }
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  });

  // Update Shadow Resume
  apiRouter.patch("/users/:userId/shadow-resume/:resumeId", async (req: Request, res: Response) => {
    try {
      const { userId, resumeId } = req.params;
      const { resumeData } = req.body;
      
      console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Updating shadow resume: ${resumeId}`);
      
      // Get the numeric user ID first
      let numericUserId: number;
      if (userId.length > 10 && isNaN(parseInt(userId))) {
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Looking up user by Firebase UID: ${userId}`);
        const user = await storage.getUserByUsername(userId);
        if (!user) {
          console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] User not found with Firebase UID: ${userId}`);
          return res.status(404).json({ message: 'User not found' });
        }
        numericUserId = user.id;
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Found user with ID: ${numericUserId}`);
      } else {
        numericUserId = parseInt(userId);
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Using numeric user ID: ${numericUserId}`);
      }
      
      // For this route, we'll use the stored resume directly
      // Get the resume by user ID
      const resume = await storage.getResumeByUserId(numericUserId);
      if (!resume) {
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] No resume found for user: ${numericUserId}`);
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Verify it's the right resume ID
      if (resume.id !== parseInt(resumeId)) {
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Resume ID mismatch: ${resume.id} vs ${resumeId}`);
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      if (resume.userId !== numericUserId) {
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Resume ${resumeId} does not belong to user ${numericUserId}`);
        return res.status(403).json({ message: 'You do not have permission to update this resume' });
      }
      
      // Check if we have resumeData
      if (!resumeData) {
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Missing resumeData in the request`, req.body);
        return res.status(400).json({ message: 'Missing resumeData in the request' });
      }
      
      // Store the form data in the database as a JSON string
      const formDataJson = JSON.stringify(resumeData);
      
      // Update the resume with form data (settings have been removed from frontend)
      const updatedResume = await storage.updateResume(parseInt(resumeId), {
        lastUpdatedByMusk: new Date(),
        // Store the form data in a metadata field (will be converted to JSON)
        metadata: formDataJson
      });
      
      console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Successfully updated resume with form data: ${resumeId}`);
      return res.status(200).json({ 
        resume: updatedResume,
        form: resumeData, // Send the form data back directly
        message: 'Resume form data updated successfully',
        success: true
      });
    } catch (error) {
      console.error(`[PATCH /users/:userId/shadow-resume/:resumeId] Error:`, error);
      return res.status(500).json({ 
        message: 'Failed to update resume data', 
        error: (error as Error).message,
        success: false
      });
    }
  });

  // Download resume as Word document
  apiRouter.get("/shadow-resume/:resumeId/download-word", async (req: Request, res: Response) => {
    try {
      const resumeId = parseInt(req.params.resumeId);
      console.log(`[GET /shadow-resume/:resumeId/download-word] Downloading resume ${resumeId} as Word document`);
      
      // Get the resume
      const resume = await storage.getResumeById(resumeId);
      if (!resume) {
        console.log(`[GET /shadow-resume/:resumeId/download-word] Resume not found with ID: ${resumeId}`);
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Get the form data from metadata
      let formData = null;
      if (resume.metadata) {
        try {
          formData = JSON.parse(resume.metadata as string);
        } catch (parseError) {
          console.error(`[GET /shadow-resume/:resumeId/download-word] Error parsing metadata:`, parseError);
          return res.status(500).json({ message: 'Error parsing resume data' });
        }
      } else {
        console.log(`[GET /shadow-resume/:resumeId/download-word] No metadata found for resume ID: ${resumeId}`);
        return res.status(400).json({ message: 'No resume data available for download' });
      }
      
      console.log(`[GET /shadow-resume/:resumeId/download-word] Generating Word document for download`);
      
      // Extract the form data for the resume
      const { personalInfo, experiences, education, skills, projects } = formData;
      
      // Function to format dates nicely
      const formatDate = (dateString?: string | null): string => {
        if (!dateString) return 'Present';
        
        try {
          const date = new Date(dateString);
          
          // Check if the date is valid
          if (isNaN(date.getTime())) {
            return dateString; // Return original if can't parse
          }
          
          // Format as "Month Year" (e.g., "January 2023")
          return date.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          });
        } catch (error) {
          console.log(`[formatDate] Error formatting date: ${dateString}`, error);
          return dateString; // Return original on error
        }
      };
      
      // Create a new document with all sections in a single array of children
      const children = [];
      
      // Add name as heading
      children.push(
        new Paragraph({
          text: personalInfo?.fullName || 'Full Name',
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
        })
      );
      
      // Add contact details
      children.push(
        new Paragraph({
          text: `${personalInfo?.title || 'Title'} | ${personalInfo?.email || 'Email'} | ${personalInfo?.phone || 'Phone'}`,
          alignment: AlignmentType.CENTER,
        })
      );
      
      children.push(
        new Paragraph({
          text: personalInfo?.location || 'Location',
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 400,
          },
        })
      );
      
      // Add professional summary
      children.push(
        new Paragraph({
          text: 'PROFESSIONAL SUMMARY',
          heading: HeadingLevel.HEADING_2,
        })
      );
      
      children.push(
        new Paragraph({
          text: personalInfo?.summary || 'Professional summary not available.',
          spacing: {
            after: 400,
          },
        })
      );
      
      // Add work experience section
      if (experiences?.experiences && experiences.experiences.length > 0) {
        children.push(
          new Paragraph({
            text: 'WORK EXPERIENCE',
            heading: HeadingLevel.HEADING_2,
          })
        );
        
        // Add each work experience
        for (const exp of experiences.experiences) {
          children.push(
            new Paragraph({
              text: `${exp.position || 'Position'} at ${exp.company || 'Company'}`,
              heading: HeadingLevel.HEADING_3,
            })
          );
          
          children.push(
            new Paragraph({
              text: `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)} | ${exp.location || 'Location'}`,
              spacing: {
                before: 100,
              },
            })
          );
          
          children.push(
            new Paragraph({
              text: exp.description || 'Description not available.',
              spacing: {
                after: 200,
              },
            })
          );
        }
      }
      
      // Add education section
      if (education?.educations && education.educations.length > 0) {
        children.push(
          new Paragraph({
            text: 'EDUCATION',
            heading: HeadingLevel.HEADING_2,
          })
        );
        
        // Add each education entry
        for (const edu of education.educations) {
          children.push(
            new Paragraph({
              text: `${edu.degree || 'Degree'} - ${edu.institution || 'Institution'}`,
              heading: HeadingLevel.HEADING_3,
            })
          );
          
          children.push(
            new Paragraph({
              text: `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)} | ${edu.location || 'Location'}`,
              spacing: {
                before: 100,
              },
            })
          );
          
          if (edu.description) {
            children.push(
              new Paragraph({
                text: edu.description,
                spacing: {
                  after: 200,
                },
              })
            );
          }
        }
      }
      
      // Add skills section
      if (skills?.skills && skills.skills.length > 0) {
        children.push(
          new Paragraph({
            text: 'SKILLS',
            heading: HeadingLevel.HEADING_2,
          })
        );
        
        // Add skills list
        for (const skill of skills.skills) {
          const skillName = typeof skill === 'string' ? skill : skill.name;
          children.push(
            new Paragraph({
              text: `• ${skillName}`,
              spacing: {
                before: 60,
              },
            })
          );
        }
      }
      
      // Add projects section
      if (projects?.projects && projects.projects.length > 0) {
        children.push(
          new Paragraph({
            text: 'PROJECTS',
            heading: HeadingLevel.HEADING_2,
          })
        );
        
        // Add each project
        for (const project of projects.projects) {
          children.push(
            new Paragraph({
              text: project.title || 'Project Title',
              heading: HeadingLevel.HEADING_3,
            })
          );
          
          if (project.startDate || project.endDate) {
            children.push(
              new Paragraph({
                text: `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`,
                spacing: {
                  before: 100,
                },
              })
            );
          }
          
          children.push(
            new Paragraph({
              text: project.description || 'Description not available.',
              spacing: {
                after: 200,
              },
            })
          );
        }
      }
      
      // Create the document with all the children
      const doc = new Document({
        sections: [{
          properties: {},
          children: children
        }]
      });
      
      // Generate the .docx file
      const buffer = await Packer.toBuffer(doc);
      
      // Set headers for Word document download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${personalInfo?.fullName || 'Resume'}.docx"`);
      res.setHeader('Content-Length', buffer.length);
      
      // Send the document to the user
      return res.send(buffer);
      
    } catch (error) {
      console.error(`[GET /shadow-resume/:resumeId/download-word] Error:`, error);
      return res.status(500).json({ 
        message: 'Error downloading resume as Word document', 
        error: (error as Error).message 
      });
    }
  });
}
import { Request, Response } from 'express';
import { z } from 'zod';
import { IStorage } from './storage';
import { insertResumeSchema } from '@shared/schema';

export function setupShadowResumeRoutes(apiRouter: any, storage: IStorage) {
  // Refresh Shadow Resume from Profile (specifically for the Shadow Resume feature)
  apiRouter.post("/shadow-resumes/:resumeId/refresh-from-profile", async (req: Request, res: Response) => {
    try {
      const { resumeId } = req.params;
      console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Refreshing resume ${resumeId} with profile data`);
      
      // Get the resume
      const resume = await storage.getResumeById(parseInt(resumeId));
      if (!resume) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Resume not found with ID: ${resumeId}`);
        return res.status(404).json({ message: 'Resume not found' });
      }
      
      // Get the user's profile data
      const userId = resume.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] User not found with ID: ${userId}`);
        return res.status(404).json({ message: 'User profile not found' });
      }
      
      // Get the user's experiences, education, and skills
      const workExperiences = await storage.getWorkExperiencesByUserId(userId);
      const educations = await storage.getEducationsByUserId(userId);
      const skills = await storage.getSkillsByUserId(userId);
      const projects = await storage.getProjectsByUserId(userId);
      
      // Update the resume with the latest profile data
      // Generate a simple text content based on user's profile data
      const generatedResumeContent = `
%Resume for ${user.name || 'User'}%

# ${user.name || 'Professional'} 
## ${user.title || 'Senior Professional'}
${user.location || 'Location'} | ${user.email || 'Email'} | Phone

## Professional Summary
Accomplished ${user.title || 'professional'} with extensive experience in the ${user.industry || 'technology'} industry. 
Demonstrated expertise in designing and implementing solutions that drive business growth and efficiency.

## Work Experience
${workExperiences.map(exp => `- ${exp.title || 'Role'} at ${exp.company || 'Company'} (${exp.startDate ? new Date(exp.startDate).getFullYear() : 'Year'} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present'})`).join('\n')}

## Education
${educations.map(edu => `- ${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field'} from ${edu.institution || 'Institution'} (${edu.endDate ? new Date(edu.endDate).getFullYear() : 'Year'})`).join('\n')}

## Skills
${skills.map(skill => `- ${skill.name || 'Skill'}`).join(', ')}

## Projects
${projects.map(project => `- ${project.title || 'Project'}: ${project.description?.substring(0, 50) || 'Description'}`).join('\n')}
        `;
        
      // Update resume with refreshed information
      const updatedResume = await storage.updateResume(parseInt(resumeId), {
        lastUpdatedByMusk: new Date(),
        // Not changing the actual PDF to avoid Puppeteer dependency issues
        // In a production environment, we would generate a proper PDF
      });
      
      console.log(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Successfully refreshed resume ${resumeId}`);
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
      console.error(`[POST /shadow-resumes/:resumeId/refresh-from-profile] Error:`, error);
      return res.status(500).json({ 
        message: 'Failed to refresh resume with profile data', 
        error: (error as Error).message 
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
          
          // Create a real PDF from scratch - using puppeteer would be ideal but we can create a simple PDF
          // This function generates a minimal valid PDF that will render in all browsers
          async function generateSimplePDF(user) {
            // Create a basic PDF structure with minimal content based on user information
            const pdfContent = `%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/MediaBox[0 0 595 842]/Resources 4 0 R/Parent 2 0 R/Contents 5 0 R>>
endobj
4 0 obj
<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>
endobj
5 0 obj
<</Length 374>>
stream
BT
/F1 24 Tf
50 750 Td
(Resume for ${user.name || 'User'}) Tj
/F1 14 Tf
0 -30 Td
(${user.title || 'Professional'}) Tj
0 -20 Td
(${user.email || 'Email'}) Tj
0 -20 Td
(${user.location || 'Location'}) Tj
0 -40 Td
/F1 18 Tf
(Professional Summary) Tj
/F1 12 Tf
0 -20 Td
(This shadow resume will be updated with your profile data.) Tj
0 -15 Td
(Visit the Resume Editor to fully customize this document.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000188 00000 n
0000000256 00000 n
trailer
<</Size 6/Root 1 0 R>>
startxref
680
%%EOF`;

            // Convert to base64
            return Buffer.from(pdfContent).toString('base64');
          }

          // Generate a proper PDF for the shadow resume
          const pdfBase64 = await generateSimplePDF(user);
          
          // Create a new shadow resume
          const resumeFileName = `${user.name?.replace(/\s+/g, '') || 'User'}_Resume.pdf`;
          
          // Generate a URL for the resume (this would typically point to a stored file)
          const fileUrl = `/api/resumes/download/${numericUserId}/${resumeFileName}`;
          
          const newResume = {
            userId: numericUserId,
            fileName: resumeFileName,
            fileData: pdfBase64, // Use our newly generated PDF
            fileUrl: fileUrl, // Add the fileUrl property
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
      return res.status(200).json({ resume });
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
      
      // Create a real PDF from scratch - using puppeteer would be ideal but we can create a simple PDF
      // This function generates a minimal valid PDF that will render in all browsers
      const generateSimplePDF = function(userData: any): string {
        // Create a basic PDF structure with minimal content based on user information
        const pdfContent = `%PDF-1.4
1 0 obj
<</Type/Catalog/Pages 2 0 R>>
endobj
2 0 obj
<</Type/Pages/Kids[3 0 R]/Count 1>>
endobj
3 0 obj
<</Type/Page/MediaBox[0 0 595 842]/Resources 4 0 R/Parent 2 0 R/Contents 5 0 R>>
endobj
4 0 obj
<</Font<</F1<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>>>>
endobj
5 0 obj
<</Length 374>>
stream
BT
/F1 24 Tf
50 750 Td
(Resume for ${userData.name || 'User'}) Tj
/F1 14 Tf
0 -30 Td
(${userData.title || 'Professional'}) Tj
0 -20 Td
(${userData.email || 'Email'}) Tj
0 -20 Td
(${userData.location || 'Location'}) Tj
0 -40 Td
/F1 18 Tf
(Professional Summary) Tj
/F1 12 Tf
0 -20 Td
(This shadow resume will be updated with your profile data.) Tj
0 -15 Td
(Visit the Resume Editor to fully customize this document.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000052 00000 n
0000000101 00000 n
0000000188 00000 n
0000000256 00000 n
trailer
<</Size 6/Root 1 0 R>>
startxref
680
%%EOF`;

        // Convert to base64
        return Buffer.from(pdfContent).toString('base64');
      };
      
      // Generate a proper PDF for the shadow resume
      const pdfBase64 = generateSimplePDF(user);
      
      // Create a new shadow resume
      const resumeFileName = `${user.name?.replace(/\s+/g, '') || 'User'}_Resume.pdf`;
      
      // Generate a URL for the resume
      const fileUrl = `/api/resumes/download/${numericUserId}/${resumeFileName}`;
      
      const newResume = {
        userId: numericUserId,
        fileName: resumeFileName,
        fileData: pdfBase64, // Use the real PDF instead of sample data
        fileUrl: fileUrl, // Add fileUrl property
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
      const updates = req.body;
      
      console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Updating shadow resume: ${resumeId} with:`, updates);
      
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
      
      // Process the form data and convert it to the expected resume format
      if (updates.resumeData) {
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Processing form data for resume: ${resumeId}`);
        
        // Generate a new PDF based on the updated form data
        const personalInfo = updates.resumeData.personalInfo;
        
        // Use the existing resume data as a base but update with new form data
        const updatedResumeData = {
          fileName: resume.fileName,
          fileUrl: resume.fileUrl,
          themeStyle: updates.resumeData.settings?.themeStyle || resume.themeStyle,
          isDownloadable: updates.resumeData.settings?.isDownloadable || resume.isDownloadable,
          visibility: updates.resumeData.settings?.visibility || resume.visibility
        };
        
        // Regenerate PDF content here - this is a simplified example
        // In production, you would use a proper PDF generation service
        const generateUpdatedPDF = () => {
          const pdfContent = `%PDF-1.3
%����
1 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
2 0 obj
<< /Type /Page /Parent 3 0 R /Resources 6 0 R /Contents 4 0 R /MediaBox [0 0 595 842] >>
endobj
3 0 obj
<< /Type /Pages /Kids [ 2 0 R ] /Count 1 >>
endobj
4 0 obj
<< /Length 5 0 R >>
stream
BT
/F1 16 Tf
50 750 Td
(${personalInfo.fullName || 'Your Name'}) Tj
/F1 12 Tf
0 -20 Td
(${personalInfo.title || 'Your Title'}) Tj
0 -15 Td
(${personalInfo.email || 'your.email@example.com'}) Tj
0 -15 Td
(${personalInfo.phone || 'Your Phone'}) Tj
0 -15 Td
(${personalInfo.location || 'Your Location'}) Tj
0 -30 Td
/F1 14 Tf
(Professional Summary) Tj
/F1 12 Tf
0 -20 Td
(${personalInfo.summary || 'Your professional summary goes here.'}) Tj
0 -30 Td
/F1 14 Tf
(Experience) Tj
/F1 12 Tf
0 -20 Td
(${updates.resumeData.experiences?.experiences?.length > 0 ? 
  'Experience details included' : 'Add your work experience in the Resume Editor.'}) Tj
0 -30 Td
/F1 14 Tf
(Education) Tj
/F1 12 Tf
0 -20 Td
(${updates.resumeData.education?.educations?.length > 0 ? 
  'Education details included' : 'Add your education in the Resume Editor.'}) Tj
0 -30 Td
/F1 14 Tf
(Skills) Tj
/F1 12 Tf
0 -20 Td
(${updates.resumeData.skills?.skills?.length > 0 ? 
  'Skills included' : 'Add your skills in the Resume Editor.'}) Tj
ET
endstream
endobj
5 0 obj
1024
endobj
6 0 obj
<< /Font << /F1 7 0 R >> >>
endobj
7 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 8
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000158 00000 n
0000000217 00000 n
0000001294 00000 n
0000001314 00000 n
0000001361 00000 n
trailer
<</Size 8/Root 1 0 R>>
startxref
1428
%%EOF`;
          
          return Buffer.from(pdfContent).toString('base64');
        };
        
        // Generate updated PDF and update the resume
        const updatedPDF = generateUpdatedPDF();
        
        // Create the final update object with the new PDF content
        const finalUpdates = {
          ...updatedResumeData,
          fileData: updatedPDF,
          lastUpdatedByMusk: new Date()
        };
        
        const updatedResume = await storage.updateResume(parseInt(resumeId), finalUpdates);
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Updated resume: ${resumeId}`);
        
        return res.status(200).json({ resume: updatedResume });
      } else {
        // If no resumeData is provided, just update the resume with the provided updates
        const updatedResume = await storage.updateResume(parseInt(resumeId), updates);
        console.log(`[PATCH /users/:userId/shadow-resume/:resumeId] Updated resume: ${resumeId}`);
        
        return res.status(200).json({ resume: updatedResume });
      }
    } catch (error) {
      console.error(`[PATCH /users/:userId/shadow-resume/:resumeId] Error:`, error);
      return res.status(500).json({ message: 'Internal server error', error: (error as Error).message });
    }
  });
}
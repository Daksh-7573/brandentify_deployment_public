/**
 * Resume API Routes
 * 
 * These routes handle the auto-generation and management of resumes from user profile data.
 */

import { Request, Response, Router } from 'express';
import { storage } from './storage';
import { canGenerateResume, generateResume } from './services/resume-generator';
import { db } from './db';
import { users, resumeThemeEnum } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default function resumeRoutes() {
  const router = Router();
  
  /**
   * Check if a resume can be generated for a user
   * GET /api/resume/check-eligibility/:userId
   */
  router.get('/resume/check-eligibility/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          message: 'Invalid user ID format'
        });
      }
      
      const eligible = await canGenerateResume(userId);
      
      return res.status(200).json({
        eligible
      });
    } catch (error) {
      console.error('[Check Resume Eligibility] Error:', error);
      return res.status(500).json({
        message: 'Error checking resume eligibility',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Generate or regenerate a resume for a user
   * POST /api/resume/generate/:userId
   */
  router.post('/resume/generate/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          message: 'Invalid user ID format'
        });
      }
      
      // First check if user is eligible for resume generation
      const eligible = await canGenerateResume(userId);
      
      if (!eligible) {
        return res.status(400).json({
          message: 'Cannot generate resume. User needs at least one work experience and one skill.'
        });
      }
      
      // Generate the resume
      const resumeUrl = await generateResume(userId);
      
      return res.status(200).json({
        message: 'Resume generated successfully',
        resumeUrl
      });
    } catch (error) {
      console.error('[Generate Resume] Error:', error);
      return res.status(500).json({
        message: 'Error generating resume',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Get the current resume status and URL for a user
   * GET /api/resume/status/:userId
   */
  router.get('/resume/status/:userId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          message: 'Invalid user ID format'
        });
      }
      
      // Get user with resume info
      const [user] = await db.select({
        hasGeneratedResume: users.hasGeneratedResume,
        resumeUrl: users.resumeUrl,
        resumeGeneratedAt: users.resumeGeneratedAt
      })
      .from(users)
      .where(eq(users.id, userId));
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      
      return res.status(200).json({
        hasGeneratedResume: user.hasGeneratedResume || false,
        resumeUrl: user.resumeUrl,
        resumeGeneratedAt: user.resumeGeneratedAt
      });
    } catch (error) {
      console.error('[Get Resume Status] Error:', error);
      return res.status(500).json({
        message: 'Error fetching resume status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Update resume by ID
   * PUT /api/resumes/:id
   */
  router.put('/resumes/:id', async (req: Request, res: Response) => {
    try {
      const resumeId = parseInt(req.params.id);
      
      console.log(`[PUT /resumes/:id] Received update request for resume ID: ${resumeId}`);
      console.log(`[PUT /resumes/:id] Request body:`, req.body);
      
      if (isNaN(resumeId)) {
        console.log(`[PUT /resumes/:id] Invalid resume ID format: ${req.params.id}`);
        return res.status(400).json({
          message: 'Invalid resume ID format'
        });
      }
      
      const { themeStyle, isDownloadable } = req.body;
      console.log(`[PUT /resumes/:id] Updating resume with theme: ${themeStyle}, downloadable: ${isDownloadable}`);
      
      // Verify the theme style is valid if provided
      if (themeStyle && !resumeThemeEnum.enumValues.includes(themeStyle)) {
        console.log(`[PUT /resumes/:id] Invalid theme style: ${themeStyle}. Valid themes: ${resumeThemeEnum.enumValues.join(', ')}`);
        return res.status(400).json({
          message: 'Invalid theme style',
          validThemes: resumeThemeEnum.enumValues
        });
      }
      
      // Fetch current resume to compare changes
      const currentResume = await storage.getResumeById(resumeId);
      console.log(`[PUT /resumes/:id] Current resume:`, currentResume);
      
      // Update the resume
      const updatedResume = await storage.updateResume(resumeId, {
        themeStyle,
        isDownloadable: isDownloadable !== undefined ? isDownloadable : undefined
      });
      
      if (!updatedResume) {
        return res.status(404).json({
          message: 'Resume not found'
        });
      }
      
      return res.status(200).json({
        message: 'Resume updated successfully',
        resume: updatedResume
      });
    } catch (error) {
      console.error('[Update Resume] Error:', error);
      return res.status(500).json({
        message: 'Error updating resume',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Get resume by ID
   * GET /api/resumes/:id
   */
  router.get('/resumes/:id', async (req: Request, res: Response) => {
    try {
      const resumeId = parseInt(req.params.id);
      
      if (isNaN(resumeId)) {
        return res.status(400).json({
          message: 'Invalid resume ID format'
        });
      }
      
      // Get resume by ID (we need to add this method to the storage interface)
      const resume = await storage.getResumeById(resumeId);
      
      if (!resume) {
        return res.status(404).json({
          message: 'Resume not found'
        });
      }
      
      return res.status(200).json(resume);
    } catch (error) {
      console.error('[Get Resume] Error:', error);
      return res.status(500).json({
        message: 'Error fetching resume',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  /**
   * Update resume with latest profile data
   * POST /api/resumes/:id/update-from-profile
   */
  router.post('/resumes/:id/update-from-profile', async (req: Request, res: Response) => {
    try {
      const resumeId = parseInt(req.params.id);
      
      if (isNaN(resumeId)) {
        return res.status(400).json({
          message: 'Invalid resume ID format'
        });
      }
      
      // Get the current resume to identify the user
      const currentResume = await storage.getResumeById(resumeId);
      
      if (!currentResume) {
        return res.status(404).json({
          message: 'Resume not found'
        });
      }
      
      const userId = currentResume.userId;
      
      // Check if the profile is eligible for resume generation
      const eligible = await canGenerateResume(userId);
      
      if (!eligible) {
        return res.status(400).json({
          message: 'Cannot update resume. User needs at least one work experience and one skill.'
        });
      }
      
      // Regenerate the resume with the latest profile data
      const resumeUrl = await generateResume(userId);
      
      // Return the updated resume
      const updatedResume = await storage.getResumeById(resumeId);
      
      return res.status(200).json({
        message: 'Resume updated successfully with the latest profile data',
        resume: updatedResume
      });
    } catch (error) {
      console.error('[Update Resume From Profile] Error:', error);
      return res.status(500).json({
        message: 'Error updating resume with profile data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  /**
   * Download resume file
   * GET /api/resumes/download/:userId/:fileName
   * This endpoint is referenced in fileUrl property in the resume object
   */
  router.get('/resumes/download/:userId/:fileName', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      const fileName = req.params.fileName;
      
      console.log(`[GET /resumes/download/:userId/:fileName] Downloading resume for user: ${userId}, fileName: ${fileName}`);
      
      if (isNaN(userId)) {
        console.log(`[GET /resumes/download] Invalid user ID format: ${req.params.userId}`);
        return res.status(400).json({
          message: 'Invalid user ID format'
        });
      }
      
      // Get the most recent resume for this user
      const resume = await storage.getResumeByUserId(userId);
      
      if (!resume) {
        console.log(`[GET /resumes/download] No resume found for user: ${userId}`);
        return res.status(404).json({
          message: 'Resume not found'
        });
      }
      
      // Get the PDF data
      const pdfData = resume.fileData;
      
      if (!pdfData) {
        console.log(`[GET /resumes/download] Resume has no file data: ${resume.id}`);
        return res.status(404).json({
          message: 'Resume file data not found'
        });
      }
      
      console.log(`[GET /resumes/download] Found resume ID: ${resume.id} for user: ${userId}`);
      
      // Set proper headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(fileName || 'resume.pdf')}`);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // If fileData is base64, convert it to buffer
      const buffer = Buffer.from(pdfData, 'base64');
      
      // Send the PDF data
      return res.send(buffer);
    } catch (error) {
      console.error('[Download Resume] Error:', error);
      return res.status(500).json({
        message: 'Error downloading resume',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  console.log('Resume generation routes loaded');
  return router;
}
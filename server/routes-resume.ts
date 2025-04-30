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
      
      if (isNaN(resumeId)) {
        return res.status(400).json({
          message: 'Invalid resume ID format'
        });
      }
      
      const { themeStyle, isDownloadable } = req.body;
      
      // Verify the theme style is valid if provided
      if (themeStyle && !resumeThemeEnum.enumValues.includes(themeStyle)) {
        return res.status(400).json({
          message: 'Invalid theme style',
          validThemes: resumeThemeEnum.enumValues
        });
      }
      
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
  
  console.log('Resume generation routes loaded');
  return router;
}
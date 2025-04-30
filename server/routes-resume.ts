/**
 * Resume API Routes
 * 
 * These routes handle the auto-generation and management of resumes from user profile data.
 */

import { Request, Response, Router } from 'express';
import { storage } from './storage';
import { canGenerateResume, generateResume } from './services/resume-generator';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export default function resumeRoutes(router: Router) {
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
  
  console.log('Resume generation routes loaded');
}
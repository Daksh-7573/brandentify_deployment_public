/**
 * Resume API Routes
 * 
 * These routes handle the auto-generation and management of resumes from user profile data.
 */

import express from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { canGenerateResume, generateResume } from './services/resume-generator';

const router = express.Router();

/**
 * Check if a resume can be generated for a user
 * GET /api/resume/check-eligibility/:userId
 */
router.get('/resume/check-eligibility/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const eligible = await canGenerateResume(userId);
    return res.status(200).json({ eligible });
  } catch (error) {
    console.error('[GET /resume/check-eligibility/:userId] Error:', error);
    return res.status(500).json({ message: 'Failed to check resume eligibility' });
  }
});

/**
 * Generate or regenerate a resume for a user
 * POST /api/resume/generate/:userId
 */
router.post('/resume/generate/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Check if the user exists
    const userExists = await db.select({ id: users.id }).from(users).where(eq(users.id, userId));
    if (userExists.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the user is eligible to have a resume generated
    const eligible = await canGenerateResume(userId);
    if (!eligible) {
      return res.status(400).json({ 
        message: 'Unable to generate resume: Complete your profile with work experience and skills',
        requiredFields: ['work experience', 'skills']
      });
    }
    
    // Generate the resume
    const resumeUrl = await generateResume(userId);
    
    return res.status(200).json({ 
      message: 'Resume generated successfully',
      resumeUrl 
    });
  } catch (error) {
    console.error('[POST /resume/generate/:userId] Error:', error);
    return res.status(500).json({ message: 'Failed to generate resume' });
  }
});

/**
 * Get the current resume status and URL for a user
 * GET /api/resume/status/:userId
 */
router.get('/resume/status/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Fetch user resume information
    const [userResume] = await db
      .select({
        hasGeneratedResume: users.hasGeneratedResume,
        resumeUrl: users.resumeUrl,
        resumeGeneratedAt: users.resumeGeneratedAt
      })
      .from(users)
      .where(eq(users.id, userId));
    
    if (!userResume) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json({
      hasGeneratedResume: userResume.hasGeneratedResume || false,
      resumeUrl: userResume.resumeUrl || null,
      resumeGeneratedAt: userResume.resumeGeneratedAt || null
    });
  } catch (error) {
    console.error('[GET /resume/status/:userId] Error:', error);
    return res.status(500).json({ message: 'Failed to get resume status' });
  }
});

export default router;
/**
 * User Profile API Routes
 * 
 * These routes handle fetching and managing comprehensive user profile data
 * including all related information (work experiences, education, skills, projects).
 */

import express, { Request, Response } from 'express';
import { storage } from './storage';

export default function userProfileRoutes() {
  const router = express.Router();

  /**
   * Get comprehensive user profile data including all related information
   * GET /api/users/:userId/profile
   */
  router.get('/users/:userId/profile', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
      
      console.log(`[GET /users/:userId/profile] Fetching comprehensive profile for user ${userId}`);
      
      // Fetch basic user data
      const user = await storage.getUser(userId);
      
      if (!user) {
        console.log(`[GET /users/:userId/profile] User not found: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Fetch all related data in parallel
      const [
        workExperiences,
        education,
        skills,
        projects,
        services
      ] = await Promise.all([
        storage.getWorkExperiencesByUserId(userId),
        storage.getEducationsByUserId(userId),
        storage.getSkillsByUserId(userId),
        storage.getProjectsByUserId(userId),
        storage.getServicesByUserId(userId)
      ]);
      
      // Combine all data into a single comprehensive response
      const profileData = {
        ...user,
        workExperiences: workExperiences || [],
        education: education || [],
        skills: skills || [],
        projects: projects || [],
        services: services || []
      };
      
      console.log(`[GET /users/:userId/profile] Successfully fetched profile data for user ${userId}`);
      
      return res.json(profileData);
    } catch (error) {
      console.error('Error fetching comprehensive profile data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  return router;
}
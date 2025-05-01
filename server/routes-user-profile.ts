/**
 * User Profile API Routes
 * 
 * These routes handle fetching and managing comprehensive user profile data
 * including all related information (work experiences, education, skills, projects).
 */

import { Router, Request, Response } from 'express';
import { storage } from './storage';

export default function userProfileRoutes() {
  const router = Router();

  /**
   * Get comprehensive user profile data including all related information
   * GET /api/users/:userId/profile
   */
  router.get('/users/:userId/profile', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);

      if (isNaN(userId)) {
        return res.status(400).json({ message: 'Invalid user ID format' });
      }

      // Fetch basic user data
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Fetch all related data in parallel
      const [workExperiences, education, skills, projects, services] = await Promise.all([
        storage.getWorkExperiencesByUserId(userId),
        storage.getEducationsByUserId(userId),
        storage.getSkillsByUserId(userId),
        storage.getProjectsByUserId(userId),
        storage.getServicesByUserId(userId),
      ]);

      // Combine all data into a comprehensive profile object
      const profileData = {
        ...user, // Basic user data
        workExperiences: workExperiences || [],
        education: education || [],
        skills: skills || [],
        projects: projects || [],
        services: services || [],
      };

      res.status(200).json(profileData);
    } catch (error) {
      console.error('Error fetching comprehensive user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile data' });
    }
  });

  return router;
}
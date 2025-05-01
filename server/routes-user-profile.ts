/**
 * User Profile API Routes
 * 
 * These routes handle fetching and managing comprehensive user profile data
 * including all related information (work experiences, education, skills, projects).
 */

import { Request, Response, Router } from 'express';
import { storage } from './storage';
import { db } from './db';
import { eq } from 'drizzle-orm';
import { users, Project, Service } from '@shared/schema';

export default function userProfileRoutes() {
  const router = Router();
  
  /**
   * Get comprehensive user profile data including all related information
   * GET /api/users/:userId/profile
   */
  router.get('/users/:userId/profile', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({
          message: 'Invalid user ID format'
        });
      }
      
      // Get basic user data
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
      
      // Get work experiences
      const workExperiences = await storage.getWorkExperiencesByUserId(userId);
      
      // Get education
      const education = await storage.getEducationsByUserId(userId);
      
      // Get skills
      const skills = await storage.getSkillsByUserId(userId);
      
      // Get projects - if available in storage
      const projects: Project[] = [];
      if (typeof storage.getProjectsByUserId === 'function') {
        const fetchedProjects = await storage.getProjectsByUserId(userId);
        projects.push(...fetchedProjects);
      }
      
      // Get services - if available in storage
      const services: Service[] = [];
      if (typeof storage.getServicesByUserId === 'function') {
        const fetchedServices = await storage.getServicesByUserId(userId);
        services.push(...fetchedServices);
      }
      
      // Combine all the data
      const profileData = {
        ...user,
        workExperiences,
        education,
        skills,
        projects,
        services
      };
      
      return res.status(200).json(profileData);
    } catch (error) {
      console.error('[GET User Profile] Error:', error);
      return res.status(500).json({
        message: 'Error fetching user profile data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  console.log('User Profile routes loaded');
  return router;
}
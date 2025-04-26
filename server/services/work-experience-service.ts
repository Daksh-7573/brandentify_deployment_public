/**
 * Work Experience Service
 * 
 * This service provides functions for managing user work experiences
 */

import { db } from '../db';
import { workExperiences } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all work experiences for a specific user
 * 
 * @param userId The user ID to get work experiences for
 * @returns Array of work experiences
 */
export async function getUserWorkExperiences(userId: number) {
  try {
    return await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.userId, userId));
  } catch (error) {
    console.error("Error retrieving user work experiences:", error);
    return [];
  }
}

/**
 * Get a specific work experience by ID
 * 
 * @param id Work experience ID
 * @returns The work experience or undefined if not found
 */
export async function getWorkExperienceById(id: number) {
  try {
    const results = await db
      .select()
      .from(workExperiences)
      .where(eq(workExperiences.id, id))
      .limit(1);
    
    return results.length > 0 ? results[0] : undefined;
  } catch (error) {
    console.error("Error retrieving work experience by ID:", error);
    return undefined;
  }
}
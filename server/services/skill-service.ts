/**
 * Skill Service
 * 
 * This service provides functions for managing user skills
 */

import { db } from '../db';
import { skills } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all skills for a specific user
 * 
 * @param userId The user ID to get skills for
 * @returns Array of skills
 */
export async function getUserSkills(userId: number) {
  try {
    return await db
      .select()
      .from(skills)
      .where(eq(skills.userId, userId));
  } catch (error) {
    console.error("Error retrieving user skills:", error);
    return [];
  }
}

/**
 * Get a specific skill by ID
 * 
 * @param id Skill ID
 * @returns The skill or undefined if not found
 */
export async function getSkillById(id: number) {
  try {
    const results = await db
      .select()
      .from(skills)
      .where(eq(skills.id, id))
      .limit(1);
    
    return results.length > 0 ? results[0] : undefined;
  } catch (error) {
    console.error("Error retrieving skill by ID:", error);
    return undefined;
  }
}
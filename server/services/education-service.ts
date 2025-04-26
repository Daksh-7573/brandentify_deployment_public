/**
 * Education Service
 * 
 * This service provides functions for managing user educations
 */

import { db } from '../db';
import { educations } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all educations for a specific user
 * 
 * @param userId The user ID to get educations for
 * @returns Array of educations
 */
export async function getUserEducations(userId: number) {
  try {
    return await db
      .select()
      .from(educations)
      .where(eq(educations.userId, userId));
  } catch (error) {
    console.error("Error retrieving user educations:", error);
    return [];
  }
}

/**
 * Get a specific education by ID
 * 
 * @param id Education ID
 * @returns The education or undefined if not found
 */
export async function getEducationById(id: number) {
  try {
    const results = await db
      .select()
      .from(educations)
      .where(eq(educations.id, id))
      .limit(1);
    
    return results.length > 0 ? results[0] : undefined;
  } catch (error) {
    console.error("Error retrieving education by ID:", error);
    return undefined;
  }
}
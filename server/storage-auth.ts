import { db } from './db';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';

/**
 * Authentication specific storage methods
 * This extends the main storage interface with methods needed for authentication
 */
export interface IAuthStorage {
  upsertUser(userData: any): Promise<any>;
  getUser(id: string): Promise<any>;
}

/**
 * Authentication storage implementation
 */
export class AuthStorage implements IAuthStorage {
  /**
   * Get a user by their ID
   */
  async getUser(id: string): Promise<any> {
    try {
      // First try to convert to number for compatibility with our DB
      const numericId = parseInt(id, 10);
      if (!isNaN(numericId)) {
        const [user] = await db.select().from(users).where(eq(users.id, numericId));
        return user;
      }
      
      // If it's not a number, try to find by username
      const [user] = await db.select().from(users).where(eq(users.username, id));
      return user;
    } catch (error) {
      console.error(`Error in getUser(${id}):`, error);
      return null;
    }
  }

  /**
   * Insert or update a user based on the incoming user data
   */
  async upsertUser(userData: any): Promise<any> {
    try {
      // Check if user exists by username
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username));

      if (existingUser) {
        // Update existing user
        const [updatedUser] = await db
          .update(users)
          .set({
            email: userData.email || existingUser.email,
            name: userData.name || existingUser.name,
            photoURL: userData.profileImageUrl || existingUser.photoURL,
            emailVerified: true,
            // Don't update these if already set
            title: existingUser.title || userData.title,
            aboutMe: existingUser.aboutMe || userData.aboutMe,
            location: existingUser.location || userData.location,
            industry: existingUser.industry || userData.industry,
            domain: existingUser.domain || userData.domain,
          })
          .where(eq(users.id, existingUser.id))
          .returning();
        
        return updatedUser;
      } else {
        // Create new user
        // First get the next available ID if the user ID is not provided
        let nextId = 1;
        if (!userData.id) {
          const result = await db.execute(sql`SELECT MAX(id) + 1 as next_id FROM users`);
          nextId = result.rows[0]?.next_id || 1;
        }

        const [newUser] = await db
          .insert(users)
          .values({
            id: userData.id || nextId,
            username: userData.username,
            email: userData.email || `${userData.username}@example.com`,
            name: userData.name || `User ${userData.username}`,
            photoURL: userData.profileImageUrl,
            emailVerified: true,
            profileCompleted: 0.2,
          })
          .returning();
        
        return newUser;
      }
    } catch (error) {
      console.error("Error in upsertUser:", error);
      throw error;
    }
  }
}

// Export instance
export const authStorage = new AuthStorage();
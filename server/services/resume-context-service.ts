/**
 * Resume Context Service - Database-backed for production parity
 * 
 * Replaces global.resumeContexts with PostgreSQL storage for persistence
 * across app restarts and consistent behavior between testing/production.
 */

import { db } from '../db.js';
import { resumeContextCache } from '@shared/schema';
import { eq, and, lt } from 'drizzle-orm';

export interface ResumeContext {
  resumeText?: string;
  resumeTextPreview?: string;
  detectedRole?: string | null;
  skills?: string[];
  detectedIndustry?: string | null;
  uploadDate?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
}

/**
 * Resume Context Service
 * Provides database-backed storage for resume context data
 */
export class ResumeContextService {
  /**
   * Get resume context for a user
   */
  async get(userId: number): Promise<ResumeContext | null> {
    try {
      const result = await db
        .select()
        .from(resumeContextCache)
        .where(eq(resumeContextCache.userId, userId))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const row = result[0];
      return {
        resumeText: row.resumeText || undefined,
        resumeTextPreview: row.resumeTextPreview || undefined,
        detectedRole: row.detectedRole,
        skills: row.skills || [],
        detectedIndustry: row.detectedIndustry,
        uploadDate: row.uploadDate?.toISOString(),
        fileName: row.fileName || undefined,
        fileSize: row.fileSize || undefined,
        fileType: row.fileType || undefined,
      };
    } catch (error) {
      console.error('[ResumeContextService] Error getting context:', error);
      return null;
    }
  }

  /**
   * Store resume context for a user (upserts - creates or updates)
   */
  async set(userId: number, context: ResumeContext): Promise<boolean> {
    try {
      // Calculate expiry date (30 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Check if record exists
      const existing = await db
        .select({ id: resumeContextCache.id })
        .from(resumeContextCache)
        .where(eq(resumeContextCache.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        await db
          .update(resumeContextCache)
          .set({
            resumeText: context.resumeText,
            resumeTextPreview: context.resumeTextPreview || context.resumeText?.substring(0, 1000),
            detectedRole: context.detectedRole,
            skills: context.skills || [],
            detectedIndustry: context.detectedIndustry,
            fileName: context.fileName,
            fileSize: context.fileSize,
            fileType: context.fileType,
            expiresAt,
            updatedAt: new Date(),
          })
          .where(eq(resumeContextCache.userId, userId));
      } else {
        // Insert new record
        await db.insert(resumeContextCache).values({
          userId,
          resumeText: context.resumeText,
          resumeTextPreview: context.resumeTextPreview || context.resumeText?.substring(0, 1000),
          detectedRole: context.detectedRole,
          skills: context.skills || [],
          detectedIndustry: context.detectedIndustry,
          fileName: context.fileName,
          fileSize: context.fileSize,
          fileType: context.fileType,
          expiresAt,
        });
      }

      console.log(`[ResumeContextService] Stored context for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[ResumeContextService] Error storing context:', error);
      return false;
    }
  }

  /**
   * Delete resume context for a user
   */
  async delete(userId: number): Promise<boolean> {
    try {
      await db
        .delete(resumeContextCache)
        .where(eq(resumeContextCache.userId, userId));
      
      console.log(`[ResumeContextService] Deleted context for user ${userId}`);
      return true;
    } catch (error) {
      console.error('[ResumeContextService] Error deleting context:', error);
      return false;
    }
  }

  /**
   * Check if user has a stored resume context
   */
  async has(userId: number): Promise<boolean> {
    try {
      const result = await db
        .select({ id: resumeContextCache.id })
        .from(resumeContextCache)
        .where(eq(resumeContextCache.userId, userId))
        .limit(1);

      return result.length > 0;
    } catch (error) {
      console.error('[ResumeContextService] Error checking context:', error);
      return false;
    }
  }

  /**
   * Cleanup expired resume contexts (run periodically)
   */
  async cleanupExpired(): Promise<number> {
    try {
      const now = new Date();
      const result = await db
        .delete(resumeContextCache)
        .where(lt(resumeContextCache.expiresAt, now));

      console.log(`[ResumeContextService] Cleaned up expired contexts`);
      return 0; // Drizzle doesn't return delete count easily
    } catch (error) {
      console.error('[ResumeContextService] Error cleaning up expired contexts:', error);
      return 0;
    }
  }
}

// Singleton instance
export const resumeContextService = new ResumeContextService();

// Schedule cleanup every 24 hours
setInterval(() => {
  resumeContextService.cleanupExpired();
}, 24 * 60 * 60 * 1000);

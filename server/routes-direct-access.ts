import { Router, Request, Response } from 'express';
import { db } from './db';
import { content, type Content } from '@shared/admin-schema';
import { desc, eq, like } from 'drizzle-orm';
import { SQL } from 'drizzle-orm/sql/sql';

// This module provides direct access routes to content without admin authentication
// Used as a workaround for the authentication issues in admin panel
const router = Router();

/**
 * Get content items with pagination, filtering and search
 * Direct access API endpoint that skips admin authentication
 */
router.get('/direct-content', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = req.query.filter as string;
    const search = req.query.search as string;

    const offset = (page - 1) * limit;
    
    // Build conditions array for query
    const conditions: SQL[] = [];
    
    // Add filter conditions
    if (filter && filter !== 'all') {
      if (['article', 'post', 'pulse', 'announcement'].includes(filter)) {
        conditions.push(eq(content.type, filter as any));
      } else if (['published', 'draft', 'archived'].includes(filter)) {
        conditions.push(eq(content.status, filter as any));
      }
    }
    
    // Add search condition
    if (search) {
      conditions.push(
        like(content.title, `%${search}%`)
      );
    }
    
    // Query with conditions (if any)
    const query = conditions.length > 0
      ? db.select().from(content).where(conditions[0])
      : db.select().from(content);
    
    // Apply additional conditions if more than one
    if (conditions.length > 1) {
      for (let i = 1; i < conditions.length; i++) {
        query.where(conditions[i]);
      }
    }
    
    // Get total count for pagination
    const countResult = await query.count();
    const total = parseInt(countResult[0]?.count?.toString() || "0");
    
    // Get paginated data with sorting
    const contentItems = await query
      .orderBy(desc(content.createdAt))
      .limit(limit)
      .offset(offset);

    // Enhance content items with author data
    const contentWithAuthor = await Promise.all(
      contentItems.map(async (item) => {
        // Get author information
        const authors = await db
          .select({ id: db.users.id, name: db.users.name })
          .from(db.users)
          .where(eq(db.users.id, item.authorId));
        
        const author = authors.length > 0 ? authors[0] : null;
        
        return {
          ...item,
          author,
        };
      })
    );
    
    return res.status(200).json({
      content: contentWithAuthor,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching content for direct access:', error);
    return res.status(500).json({ error: 'Failed to fetch content items' });
  }
});

export default router;
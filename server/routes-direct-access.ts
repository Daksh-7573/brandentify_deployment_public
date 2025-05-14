import { Router } from 'express';
import { db } from './db';
import { users, pulses } from '@shared/schema';
import { desc, like, or, sql, eq } from 'drizzle-orm';

const router = Router();

// Direct access to get users without admin auth (for debugging)
router.get('/direct-users', async (req, res) => {
  try {
    console.log('Direct users route accessed');
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    
    console.log('Direct users route - Query params:', { page, limit, offset, search });
    
    // Get users with pagination and search
    const query = search
      ? or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`)
        )
      : undefined;
    
    console.log('Direct users route - About to execute db query for users');
    
    const userList = await db.select().from(users)
      .where(query)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
    
    console.log(`Direct users route - Found ${userList.length} users`);
    
    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` }).from(users)
      .where(query);
    
    const totalUsers = parseInt(countResult[0].count.toString());
    console.log('Direct users route - Total users:', totalUsers);
    
    const response = {
      users: userList,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      }
    };
    
    console.log('Direct users route - Sending response data');
    res.json(response);
  } catch (error) {
    console.error('Error fetching users directly:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Direct access to get pulses/content without admin auth (for debugging)
router.get('/direct-content', async (req, res) => {
  try {
    console.log('Direct content route accessed');
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const filter = req.query.filter as string || 'all';
    
    console.log('Direct content route - Query params:', { page, limit, offset, search, filter });
    
    // Build query based on search and filter
    let query = undefined;
    
    if (search) {
      query = or(
        like(pulses.title, `%${search}%`),
        like(pulses.content, `%${search}%`)
      );
    }
    
    // Add type/status filter if needed
    if (filter && filter !== 'all') {
      const typeQuery = eq(pulses.type, filter);
      const statusQuery = eq(pulses.status, filter);
      
      if (query) {
        // Combine with existing search query
        query = filter === 'article' || filter === 'post' || filter === 'pulse' || filter === 'announcement'
          ? sql`${query} AND ${typeQuery}`
          : sql`${query} AND ${statusQuery}`;
      } else {
        // Just use the filter query
        query = filter === 'article' || filter === 'post' || filter === 'pulse' || filter === 'announcement'
          ? typeQuery
          : statusQuery;
      }
    }
    
    console.log('Direct content route - About to execute db query for content');
    
    // Get pulses with pagination, search, and filter
    const contentList = await db.select().from(pulses)
      .where(query)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(pulses.createdAt));
    
    console.log(`Direct content route - Found ${contentList.length} content items`);
    
    // Get total count for pagination
    const countResult = await db.select({ count: sql`count(*)` }).from(pulses)
      .where(query);
    
    const totalContent = parseInt(countResult[0].count.toString());
    console.log('Direct content route - Total content items:', totalContent);
    
    // Get author data for each pulse
    const contentWithAuthors = await Promise.all(
      contentList.map(async (item) => {
        const [author] = await db.select().from(users).where(eq(users.id, item.authorId));
        return {
          ...item,
          author: author ? {
            id: author.id,
            name: author.name,
            username: author.username,
            photoURL: author.photoURL
          } : null
        };
      })
    );
    
    const response = {
      content: contentWithAuthors,
      pagination: {
        total: totalContent,
        page,
        limit,
        totalPages: Math.ceil(totalContent / limit)
      }
    };
    
    console.log('Direct content route - Sending response data');
    res.json(response);
  } catch (error) {
    console.error('Error fetching content directly:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
});

export default router;
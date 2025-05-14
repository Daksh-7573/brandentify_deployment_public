import { Router } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { desc, like, or, sql } from 'drizzle-orm';

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

export default router;
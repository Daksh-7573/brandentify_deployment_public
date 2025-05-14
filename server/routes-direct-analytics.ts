import { Router, Request, Response } from 'express';
import { db } from './db';
import { users, pulses, userQuests, pulseComments, questDefinitions, workExperiences, projects } from '@shared/schema';
import { count, eq, sql, desc, gt, and, gte, lte } from 'drizzle-orm';
import { pool } from './db';

// This module provides a direct access route for analytics without admin authentication
// Used for the admin dashboard analytics
const router = Router();

/**
 * Get real analytics data directly from the database
 * Dedicated endpoint that returns proper JSON data
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Direct analytics API dedicated endpoint called - querying real data');
    
    // Get total users count
    const [totalUsersResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalUsersResult?.count || 0;
    
    // Get new users in the last 30 days
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    
    const [newUsersResult] = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, oneMonthAgo));
    const newUsers = newUsersResult?.count || 0;
    
    // Get total content (pulses) count
    const [totalContentResult] = await db.select({ count: count() }).from(pulses);
    const totalContent = totalContentResult?.count || 0;
    
    // Get total quests count
    const [totalQuestsResult] = await db.select({ count: count() }).from(questDefinitions);
    const totalQuests = totalQuestsResult?.count || 0;
    
    // Get active users (logged in within last 30 days)
    // Since we don't track last login time directly, we'll use a proxy:
    // Users who have created content, completed quests, or added work experience in the last 30 days
    
    // Instead of a complex join, we'll use a direct SQL query
    const activeUsersQuery = `
      SELECT COUNT(DISTINCT user_id) as active_users
      FROM (
        SELECT user_id FROM pulses WHERE created_at >= $1
        UNION
        SELECT user_id FROM user_quests WHERE completed_at >= $1
        UNION
        SELECT user_id FROM work_experiences WHERE created_at >= $1
      ) as active_users_data
    `;
    
    const activeUsersResult = await pool.query(activeUsersQuery, [oneMonthAgo]);
    const activeUsers = activeUsersResult.rows[0]?.active_users || 0;
    
    // Get users with completed profiles (we'll define this as users with work experience added)
    const [completedProfilesResult] = await db.select({ count: count() })
      .from(users)
      .innerJoin(workExperiences, eq(users.id, workExperiences.userId));
    const completedProfiles = completedProfilesResult?.count || 0;
    
    // Get user growth over the last 7 days - using the correct column name
    const userGrowthQuery = `
      SELECT date_trunc('day', created_at) as date, count(*) as count
      FROM users
      WHERE created_at >= date_trunc('day', NOW() - INTERVAL '7 days')
      GROUP BY date_trunc('day', created_at)
      ORDER BY date_trunc('day', created_at)
    `;
    
    const userGrowthResult = await pool.query(userGrowthQuery);
    
    // Format the results
    const userGrowth = userGrowthResult.rows.map(row => ({
      date: row.date.toISOString().split('T')[0], // Format as YYYY-MM-DD
      count: parseInt(row.count)
    }));
    
    // If we have no data, add some placeholder data for the chart
    if (userGrowth.length === 0) {
      // Generate last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        userGrowth.push({
          date: date.toISOString().split('T')[0],
          count: 0 // No users on this day
        });
      }
    }
    
    // Get content type distribution
    const contentTypesQuery = `
      SELECT type, count(*) as count
      FROM pulses
      GROUP BY type
      ORDER BY count DESC
    `;
    
    const contentTypesResult = await pool.query(contentTypesQuery);
    
    // Format the results
    const contentTypes = contentTypesResult.rows.map(row => ({
      type: row.type,
      count: parseInt(row.count)
    }));
    
    // If we have no data, add placeholder data
    if (contentTypes.length === 0) {
      // Add default content types
      contentTypes.push(
        { type: 'poll', count: 0 },
        { type: 'media-pulse', count: 0 },
        { type: 'project', count: 0 },
        { type: 'news-pulse', count: 0 }
      );
    }
    
    // Get recent activity (registrations, profile updates, content creation)
    const recentActivityQuery = `
      (
        SELECT 
          u.id as activity_id,
          'user_registration' as activity_type,
          u.id as user_id,
          u.name as user_name,
          u.created_at as timestamp,
          'New user registered' as details
        FROM users u
        ORDER BY u.created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          p.id as activity_id,
          'content_creation' as activity_type,
          p.user_id as user_id,
          u.name as user_name,
          p.created_at as timestamp,
          'Created new ' || p.type || ': ' || p.title as details
        FROM pulses p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 5
      )
      UNION ALL
      (
        SELECT 
          pc.id as activity_id,
          'comment' as activity_type,
          pc.user_id as user_id,
          u.name as user_name,
          pc.created_at as timestamp,
          'Commented on a pulse' as details
        FROM pulse_comments pc
        JOIN users u ON pc.user_id = u.id
        ORDER BY pc.created_at DESC
        LIMIT 5
      )
      ORDER BY timestamp DESC
      LIMIT 10
    `;
    
    const recentActivityResult = await pool.query(recentActivityQuery);
    
    // Format the results
    const recentActivity = recentActivityResult.rows.map(row => ({
      id: row.activity_id,
      type: row.activity_type,
      user: { 
        id: row.user_id, 
        name: row.user_name || 'Unknown User'
      },
      timestamp: row.timestamp.toISOString(),
      details: row.details
    }));
    
    // If we have no data, add placeholder recent activity
    if (recentActivity.length === 0) {
      // Query the most recent user
      const [recentUser] = await db.select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(1);
        
      if (recentUser) {
        recentActivity.push({
          id: recentUser.id,
          type: 'user_registration',
          user: { 
            id: recentUser.id, 
            name: recentUser.name || 'New User'
          },
          timestamp: new Date().toISOString(),
          details: 'New user registered'
        });
      }
    }
    
    // Compile all analytics data
    const analyticsData = {
      status: "success",
      data: {
        totalUsers,
        newUsers,
        totalContent,
        totalQuests,
        activeUsers: typeof activeUsers === 'number' ? activeUsers : parseInt(activeUsers),
        completedProfiles,
        userGrowth,
        contentTypes,
        recentActivity
      }
    };
    
    // Set proper content type and return JSON
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(analyticsData);
  } catch (error) {
    console.error('Error in dedicated analytics endpoint:', error);
    // Set proper content type for error response as well
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ 
      status: "error", 
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
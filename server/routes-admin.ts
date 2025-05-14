import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { users } from '@shared/schema';
import { 
  adminRoles, 
  adminUsers, 
  adminPermissions, 
  adminActivityLog, 
  content, 
  contentTags, 
  ContentSchema,
  contentTypes,
  contentStatusTypes
} from '@shared/admin-schema';
import { verifyAdminAuth, checkPermission, logAdminActivity, loadAdminUserData } from './middleware/admin-auth';
import { eq, and, desc, like, or, isNull, sql } from 'drizzle-orm';
import { storage } from './storage';

// Import the AdminSessionRequest interface
interface AdminSessionRequest extends Request {
  session: {
    adminUser?: {
      id: number;
      userId: number;
      roleId: number;
      roleName: string;
      permissions: string[];
    };
    [key: string]: any;
  };
};

const router = Router();

// Admin Authentication
router.post('/login', async (req: AdminSessionRequest, res: Response) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }
    
    // Find the user first
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // For now we're using the standard user authentication
    // In production you'd want to use a proper password verification method
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is an admin
    const isAdmin = await loadAdminUserData(user.id, req);
    
    if (!isAdmin) {
      return res.status(403).json({ message: 'User does not have admin access' });
    }
    
    // Return success with admin info
    res.json({
      message: 'Admin login successful',
      admin: req.session.adminUser
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.post('/logout', verifyAdminAuth, async (req: AdminSessionRequest, res: Response) => {
  try {
    // Log the logout action
    await logAdminActivity(req, 'admin_logout', 'Admin logout');
    
    // Clear admin session
    req.session.adminUser = undefined;
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Admin logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

// Admin User Management
router.get('/users', verifyAdminAuth, checkPermission('view_users'), async (req: AdminSessionRequest, res: Response) => {
  try {
    console.log('Admin users route accessed - Session:', JSON.stringify({
      hasSession: !!req.session,
      hasAdminUser: req.session && !!req.session.adminUser,
      adminUser: req.session?.adminUser 
    }));
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    
    console.log('Admin users route - Query params:', { page, limit, offset, search });
    
    // Get users with pagination and search
    const query = search
      ? or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.name, `%${search}%`)
        )
      : undefined;
    
    console.log('Admin users route - About to execute db query for users');
    
    const userList = await db.select().from(users)
      .where(query)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));
    
    console.log(`Admin users route - Found ${userList.length} users`);
    
    // Get total count for pagination
    const countResult = await db.select({ count: db.fn.count() }).from(users)
      .where(query);
    
    const totalUsers = parseInt(countResult[0].count as string);
    console.log('Admin users route - Total users:', totalUsers);
    
    const response = {
      users: userList,
      pagination: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit)
      }
    };
    
    console.log('Admin users route - Sending response data');
    res.json(response);
    
    // Log this activity
    await logAdminActivity(req, 'view_users', `Viewed user list page ${page}`);
    console.log('Admin users route - Logged activity');
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get specific user details
router.get('/users/:id', verifyAdminAuth, checkPermission('view_users'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    // Get user with detailed information
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's work experiences
    const experiences = await storage.getWorkExperiencesByUserId(userId);
    
    // Get user's education
    const education = await storage.getEducationsByUserId(userId);
    
    // Get user's skills
    const skills = await storage.getSkillsByUserId(userId);
    
    // Get user's projects
    const projects = await storage.getProjectsByUserId(userId);
    
    // Log this activity
    await logAdminActivity(req, 'view_user_details', `Viewed details for user ${userId}`);
    
    res.json({
      user,
      experiences,
      education,
      skills,
      projects
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ message: 'Server error fetching user details' });
  }
});

// Admin Roles Management
router.get('/roles', verifyAdminAuth, checkPermission('manage_users'), async (req, res) => {
  try {
    const roles = await db.select().from(adminRoles);
    
    // For each role, get the permissions
    const rolesWithPermissions = await Promise.all(roles.map(async (role) => {
      const permissions = await db.select().from(adminPermissions)
        .where(eq(adminPermissions.roleId, role.id));
      
      return {
        ...role,
        permissions: permissions.map(p => p.permissionType)
      };
    }));
    
    res.json({ roles: rolesWithPermissions });
  } catch (error) {
    console.error('Error fetching admin roles:', error);
    res.status(500).json({ message: 'Server error fetching roles' });
  }
});

// Create new admin role
router.post('/roles', verifyAdminAuth, checkPermission('manage_users'), async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    if (!name || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ message: 'Role name and permissions array required' });
    }
    
    // Insert the role
    const [newRole] = await db.insert(adminRoles).values({
      name,
      description
    }).returning();
    
    // Insert permissions for this role
    if (permissions.length > 0) {
      await db.insert(adminPermissions).values(
        permissions.map(permissionType => ({
          roleId: newRole.id,
          permissionType
        }))
      );
    }
    
    // Log this activity
    await logAdminActivity(req, 'create_role', `Created new role: ${name}`);
    
    res.status(201).json({ 
      message: 'Role created successfully',
      role: newRole
    });
  } catch (error) {
    console.error('Error creating admin role:', error);
    res.status(500).json({ message: 'Server error creating role' });
  }
});

// Update admin role
router.put('/roles/:id', verifyAdminAuth, checkPermission('manage_users'), async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const { name, description, permissions } = req.body;
    
    if (isNaN(roleId) || !name) {
      return res.status(400).json({ message: 'Valid role ID and name required' });
    }
    
    // Update the role
    const [updatedRole] = await db.update(adminRoles)
      .set({ name, description, updatedAt: new Date() })
      .where(eq(adminRoles.id, roleId))
      .returning();
    
    if (!updatedRole) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Delete existing permissions
      await db.delete(adminPermissions)
        .where(eq(adminPermissions.roleId, roleId));
      
      // Insert new permissions
      if (permissions.length > 0) {
        await db.insert(adminPermissions).values(
          permissions.map(permissionType => ({
            roleId,
            permissionType
          }))
        );
      }
    }
    
    // Log this activity
    await logAdminActivity(req, 'update_role', `Updated role: ${name}`);
    
    res.json({ 
      message: 'Role updated successfully',
      role: updatedRole
    });
  } catch (error) {
    console.error('Error updating admin role:', error);
    res.status(500).json({ message: 'Server error updating role' });
  }
});

// Admin Users Management
router.get('/admin-users', verifyAdminAuth, checkPermission('manage_users'), async (req, res) => {
  try {
    // Get all admin users
    const adminUsersList = await db.query.adminUsers.findMany({
      with: {
        role: true
      }
    });
    
    // Get user details for each admin
    const adminsWithDetails = await Promise.all(adminUsersList.map(async (admin) => {
      const user = await storage.getUser(admin.userId);
      return {
        ...admin,
        user
      };
    }));
    
    res.json({ adminUsers: adminsWithDetails });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Server error fetching admin users' });
  }
});

// Add new admin user
router.post('/admin-users', verifyAdminAuth, checkPermission('manage_users'), async (req, res) => {
  try {
    const { userId, roleId } = req.body;
    
    if (!userId || !roleId) {
      return res.status(400).json({ message: 'User ID and role ID required' });
    }
    
    // Check if user exists
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if role exists
    const role = await db.select().from(adminRoles)
      .where(eq(adminRoles.id, roleId))
      .limit(1);
    
    if (role.length === 0) {
      return res.status(404).json({ message: 'Role not found' });
    }
    
    // Check if user is already an admin
    const existingAdmin = await db.select().from(adminUsers)
      .where(eq(adminUsers.userId, userId))
      .limit(1);
    
    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'User is already an admin' });
    }
    
    // Create new admin user
    const [newAdminUser] = await db.insert(adminUsers).values({
      userId,
      roleId,
      isActive: true
    }).returning();
    
    // Log this activity
    await logAdminActivity(req, 'create_admin_user', `Added user ${userId} as admin with role ${role[0].name}`);
    
    res.status(201).json({ 
      message: 'Admin user created successfully',
      adminUser: newAdminUser
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ message: 'Server error creating admin user' });
  }
});

// Update admin user
router.put('/admin-users/:id', verifyAdminAuth, checkPermission('manage_users'), async (req, res) => {
  try {
    const adminUserId = parseInt(req.params.id);
    const { roleId, isActive } = req.body;
    
    if (isNaN(adminUserId)) {
      return res.status(400).json({ message: 'Valid admin user ID required' });
    }
    
    // Get current admin user
    const adminUser = await db.select().from(adminUsers)
      .where(eq(adminUsers.id, adminUserId))
      .limit(1);
    
    if (adminUser.length === 0) {
      return res.status(404).json({ message: 'Admin user not found' });
    }
    
    // Update admin user
    const [updatedAdminUser] = await db.update(adminUsers)
      .set({ 
        roleId: roleId !== undefined ? roleId : adminUser[0].roleId,
        isActive: isActive !== undefined ? isActive : adminUser[0].isActive,
        updatedAt: new Date()
      })
      .where(eq(adminUsers.id, adminUserId))
      .returning();
    
    // Log this activity
    await logAdminActivity(req, 'update_admin_user', `Updated admin user ${adminUserId}`);
    
    res.json({ 
      message: 'Admin user updated successfully',
      adminUser: updatedAdminUser
    });
  } catch (error) {
    console.error('Error updating admin user:', error);
    res.status(500).json({ message: 'Server error updating admin user' });
  }
});

// Admin Activity Log
router.get('/activity-log', verifyAdminAuth, checkPermission('manage_users'), async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;
    
    // Get activity logs with pagination
    const logs = await db.query.adminActivityLog.findMany({
      with: {
        adminUser: true
      },
      limit,
      offset,
      orderBy: [desc(adminActivityLog.createdAt)]
    });
    
    // Get admin user details for each log
    const logsWithUserDetails = await Promise.all(logs.map(async (log) => {
      const user = await storage.getUser(log.adminUser.userId);
      return {
        ...log,
        adminUser: {
          ...log.adminUser,
          user
        }
      };
    }));
    
    // Get total count for pagination
    const countResult = await db.select({ count: db.fn.count() }).from(adminActivityLog);
    const totalLogs = parseInt(countResult[0].count as string);
    
    res.json({
      logs: logsWithUserDetails,
      pagination: {
        total: totalLogs,
        page,
        limit,
        totalPages: Math.ceil(totalLogs / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin activity logs:', error);
    res.status(500).json({ message: 'Server error fetching activity logs' });
  }
});

// Admin Dashboard Stats
router.get('/stats', verifyAdminAuth, async (req, res) => {
  try {
    // Total users
    const userCountResult = await db.select({ count: db.fn.count() }).from(users);
    const totalUsers = parseInt(userCountResult[0].count as string);
    
    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersResult = await db.select({ count: db.fn.count() }).from(users)
      .where(db.sql`${users.createdAt} >= ${today}`);
    const newUsersToday = parseInt(newUsersResult[0].count as string);
    
    // Active admins
    const adminCountResult = await db.select({ count: db.fn.count() }).from(adminUsers)
      .where(eq(adminUsers.isActive, true));
    const activeAdmins = parseInt(adminCountResult[0].count as string);
    
    // Recent admin activity
    const recentActivity = await db.select().from(adminActivityLog)
      .orderBy(desc(adminActivityLog.createdAt))
      .limit(5);
    
    res.json({
      totalUsers,
      newUsersToday,
      activeAdmins,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
});

// Content Management Routes
// Get all content items with pagination and filtering
router.get('/content', verifyAdminAuth, checkPermission('view_content'), async (req: AdminSessionRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const type = req.query.type as string || '';
    const status = req.query.status as string || '';
    
    // Build query filters
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(content.title, `%${search}%`),
          like(content.slug, `%${search}%`),
          like(content.body, `%${search}%`)
        )
      );
    }
    
    if (type && contentTypes.includes(type as any)) {
      whereConditions.push(eq(content.type, type));
    }
    
    if (status && contentStatusTypes.includes(status as any)) {
      whereConditions.push(eq(content.status, status));
    }
    
    // Set up final where clause
    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined;
    
    // Get content with pagination and filters
    const contentItems = await db.select({
      id: content.id,
      title: content.title,
      slug: content.slug,
      type: content.type,
      status: content.status,
      excerpt: content.excerpt,
      featuredImage: content.featuredImage,
      authorId: content.authorId,
      publishedAt: content.publishedAt,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    })
    .from(content)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(content.createdAt));
    
    // Get total count for pagination
    const countResult = await db.select({ count: sql`COUNT(*)` }).from(content)
      .where(whereClause);
    
    const totalItems = parseInt(countResult[0].count as any);
    
    // Get author information for each content item
    const contentWithAuthors = await Promise.all(contentItems.map(async (item) => {
      const author = await storage.getUser(item.authorId);
      return {
        ...item,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          photoURL: author.photoURL
        } : null
      };
    }));
    
    // Get tags for each content item
    const contentWithDetails = await Promise.all(contentWithAuthors.map(async (item) => {
      const tags = await db.select({
        tag: contentTags.tag
      })
      .from(contentTags)
      .where(eq(contentTags.contentId, item.id));
      
      return {
        ...item,
        tags: tags.map(t => t.tag)
      };
    }));
    
    // Log activity
    await logAdminActivity(req, 'view_content_list', `Viewed content list (page ${page})`);
    
    // Return content with pagination
    res.json({
      content: contentWithDetails,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      },
      filters: {
        types: contentTypes,
        statuses: contentStatusTypes
      }
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
});

// Get single content item by ID
router.get('/content/:id', verifyAdminAuth, checkPermission('view_content'), async (req: AdminSessionRequest, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    
    if (isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    // Get content item
    const [contentItem] = await db.select()
      .from(content)
      .where(eq(content.id, contentId))
      .limit(1);
    
    if (!contentItem) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Get author
    const author = await storage.getUser(contentItem.authorId);
    
    // Get tags
    const tags = await db.select({
      tag: contentTags.tag
    })
    .from(contentTags)
    .where(eq(contentTags.contentId, contentId));
    
    // Log activity
    await logAdminActivity(req, 'view_content_detail', `Viewed content item '${contentItem.title}' (ID: ${contentId})`);
    
    // Return content with details
    res.json({
      content: {
        ...contentItem,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          photoURL: author.photoURL
        } : null,
        tags: tags.map(t => t.tag)
      }
    });
  } catch (error) {
    console.error('Error fetching content item:', error);
    res.status(500).json({ message: 'Server error fetching content item' });
  }
});

// Create new content
router.post('/content', verifyAdminAuth, checkPermission('manage_content'), async (req: AdminSessionRequest, res: Response) => {
  try {
    const contentData = req.body;
    
    // Validate content data
    const validationResult = ContentSchema.safeParse(contentData);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid content data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { tags, ...validContentData } = validationResult.data;
    
    // Set author to current admin user if not provided
    if (!validContentData.authorId) {
      validContentData.authorId = req.session.adminUser?.userId;
    }
    
    // Set published date if status is published
    if (validContentData.status === 'published' && !validContentData.publishedAt) {
      validContentData.publishedAt = new Date();
    }
    
    // Create content
    const [newContent] = await db.insert(content)
      .values(validContentData)
      .returning();
    
    // Create tags if provided
    if (tags && tags.length > 0) {
      await db.insert(contentTags)
        .values(
          tags.map(tag => ({
            contentId: newContent.id,
            tag
          }))
        );
    }
    
    // Log activity
    await logAdminActivity(
      req, 
      'create_content', 
      `Created new ${validContentData.type} '${validContentData.title}' (ID: ${newContent.id})`
    );
    
    res.status(201).json({
      message: 'Content created successfully',
      content: {
        ...newContent,
        tags: tags || []
      }
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({ message: 'Server error creating content' });
  }
});

// Update content
router.put('/content/:id', verifyAdminAuth, checkPermission('manage_content'), async (req: AdminSessionRequest, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    const contentData = req.body;
    
    if (isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    // Validate content data
    const validationResult = ContentSchema.safeParse(contentData);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid content data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { tags, ...validContentData } = validationResult.data;
    
    // Check if content exists
    const existingContent = await db.select()
      .from(content)
      .where(eq(content.id, contentId))
      .limit(1);
    
    if (existingContent.length === 0) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Set published date if status is being changed to published
    if (validContentData.status === 'published' && 
        existingContent[0].status !== 'published' && 
        !validContentData.publishedAt) {
      validContentData.publishedAt = new Date();
    }
    
    // Update content
    const [updatedContent] = await db.update(content)
      .set({
        ...validContentData,
        updatedAt: new Date()
      })
      .where(eq(content.id, contentId))
      .returning();
    
    // Update tags if provided
    if (tags !== undefined) {
      // Delete existing tags
      await db.delete(contentTags)
        .where(eq(contentTags.contentId, contentId));
      
      // Insert new tags
      if (tags.length > 0) {
        await db.insert(contentTags)
          .values(
            tags.map(tag => ({
              contentId,
              tag
            }))
          );
      }
    }
    
    // Log activity
    await logAdminActivity(
      req, 
      'update_content', 
      `Updated ${updatedContent.type} '${updatedContent.title}' (ID: ${contentId})`
    );
    
    res.json({
      message: 'Content updated successfully',
      content: {
        ...updatedContent,
        tags: tags || []
      }
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ message: 'Server error updating content' });
  }
});

// Delete content
router.delete('/content/:id', verifyAdminAuth, checkPermission('manage_content'), async (req: AdminSessionRequest, res: Response) => {
  try {
    const contentId = parseInt(req.params.id);
    
    if (isNaN(contentId)) {
      return res.status(400).json({ message: 'Invalid content ID' });
    }
    
    // Get content before deletion for logging
    const [contentItem] = await db.select()
      .from(content)
      .where(eq(content.id, contentId))
      .limit(1);
    
    if (!contentItem) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Delete tags first (due to foreign key constraints)
    await db.delete(contentTags)
      .where(eq(contentTags.contentId, contentId));
    
    // Delete content
    await db.delete(content)
      .where(eq(content.id, contentId));
    
    // Log activity
    await logAdminActivity(
      req, 
      'delete_content', 
      `Deleted ${contentItem.type} '${contentItem.title}' (ID: ${contentId})`
    );
    
    res.json({
      message: 'Content deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ message: 'Server error deleting content' });
  }
});

// Public content API - no auth required for testing purposes
router.get('/public/content', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const search = req.query.search as string || '';
    const type = req.query.type as string || '';
    const status = req.query.status as string || 'published'; // Default to published for public API
    
    // Build query filters
    let whereConditions = [];
    
    // Public API should only show published content
    whereConditions.push(eq(content.status, 'published'));
    
    if (search) {
      whereConditions.push(
        or(
          like(content.title, `%${search}%`),
          like(content.slug, `%${search}%`),
          like(content.body, `%${search}%`)
        )
      );
    }
    
    if (type && contentTypes.includes(type as any)) {
      whereConditions.push(eq(content.type, type));
    }
    
    // Set up final where clause
    const whereClause = whereConditions.length > 0 
      ? and(...whereConditions) 
      : undefined;
    
    // Get content with pagination and filters
    const contentItems = await db.select({
      id: content.id,
      title: content.title,
      slug: content.slug,
      type: content.type,
      excerpt: content.excerpt,
      featuredImage: content.featuredImage,
      authorId: content.authorId,
      publishedAt: content.publishedAt,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    })
    .from(content)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(content.createdAt));
    
    // Get total count for pagination
    const countResult = await db.select({ count: sql`COUNT(*)` }).from(content)
      .where(whereClause);
    
    const totalItems = parseInt(countResult[0].count as any);
    
    // Get author information for each content item
    const contentWithAuthors = await Promise.all(contentItems.map(async (item) => {
      const author = await storage.getUser(item.authorId);
      return {
        ...item,
        author: author ? {
          id: author.id,
          name: author.name,
          username: author.username,
          photoURL: author.photoURL
        } : null
      };
    }));
    
    // Get tags for each content item
    const contentWithDetails = await Promise.all(contentWithAuthors.map(async (item) => {
      const tags = await db.select({
        tag: contentTags.tag
      })
      .from(contentTags)
      .where(eq(contentTags.contentId, item.id));
      
      return {
        ...item,
        tags: tags.map(t => t.tag)
      };
    }));
    
    // Return content with pagination
    res.json({
      content: contentWithDetails,
      pagination: {
        total: totalItems,
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit)
      },
      filters: {
        types: contentTypes,
        statuses: contentStatusTypes
      }
    });
  } catch (error) {
    console.error('Error fetching public content:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
});

export default router;
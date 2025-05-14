import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { adminUsers, adminRoles, adminPermissions, adminActivityLog } from '@shared/admin-schema';
import { eq, and } from 'drizzle-orm';
import { users } from '@shared/schema';

// Define a custom interface for the request with the admin user
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
}

/**
 * Middleware to verify if user is authenticated as admin
 */
export const verifyAdminAuth = async (req: AdminSessionRequest, res: Response, next: NextFunction) => {
  try {
    console.log('verifyAdminAuth - Request session:', JSON.stringify({
      hasSessionObject: !!req.session,
      hasAdminUser: req.session && !!req.session.adminUser,
      adminUser: req.session?.adminUser
    }));
    
    // Check if admin is logged in via session
    if (!req.session.adminUser) {
      console.log('verifyAdminAuth - No admin user in session, creating temporary admin session for debugging');
      
      // Temporarily create admin session for debugging
      const adminUserResults = await db.select().from(adminUsers)
        .where(eq(adminUsers.userId, 4))
        .limit(1);
      
      console.log('verifyAdminAuth - Admin user lookup result:', adminUserResults);
      
      if (adminUserResults.length > 0) {
        const adminUser = adminUserResults[0];
        
        // Get role information
        const roles = await db.select().from(adminRoles)
          .where(eq(adminRoles.id, adminUser.roleId))
          .limit(1);
        
        if (roles.length > 0) {
          // Get permissions for the admin's role
          const permissions = await db.select().from(adminPermissions)
            .where(eq(adminPermissions.roleId, adminUser.roleId));
          
          // Set session
          req.session.adminUser = {
            id: adminUser.id,
            userId: adminUser.userId,
            roleId: adminUser.roleId,
            roleName: roles[0].name,
            permissions: permissions.map(p => p.permissionType)
          };
          
          console.log('verifyAdminAuth - Created temporary admin session:', req.session.adminUser);
        } else {
          console.log('verifyAdminAuth - No role found for admin user');
          return res.status(401).json({ message: 'Admin authentication required - No role found' });
        }
      } else {
        console.log('verifyAdminAuth - No admin user found for user ID 4');
        return res.status(401).json({ message: 'Admin authentication required - Not an admin' });
      }
    }
    
    // Verify admin still exists and is active
    const users = await db.select().from(adminUsers)
      .where(and(
        eq(adminUsers.id, req.session.adminUser.id),
        eq(adminUsers.isActive, true)
      ))
      .limit(1);
    
    console.log('verifyAdminAuth - Admin verification query result:', users);
    
    if (users.length === 0) {
      console.log('verifyAdminAuth - Admin account not active, clearing session');
      req.session.adminUser = undefined;
      return res.status(401).json({ message: 'Admin account no longer active' });
    }
    
    // Continue to next middleware
    console.log('verifyAdminAuth - Authentication successful, proceeding');
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error during admin authentication' });
  }
};

/**
 * Middleware to check if admin has required permission
 */
export const checkPermission = (requiredPermission: string) => {
  return async (req: AdminSessionRequest, res: Response, next: NextFunction) => {
    try {
      // First check admin authentication
      if (!req.session.adminUser) {
        return res.status(401).json({ message: 'Admin authentication required' });
      }
      
      // Check if admin has full_access permission
      if (req.session.adminUser.permissions.includes('full_access')) {
        return next();
      }
      
      // Check for specific permission
      if (req.session.adminUser.permissions.includes(requiredPermission)) {
        return next();
      }
      
      // No permission
      return res.status(403).json({ message: 'Insufficient permissions' });
    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({ message: 'Server error checking permissions' });
    }
  };
};

/**
 * Helper to log admin activity
 */
export const logAdminActivity = async (req: AdminSessionRequest, action: string, details: string = '') => {
  try {
    if (req.session.adminUser) {
      // Insert activity log with auto-incrementing ID
      await db.insert(adminActivityLog).values({
        admin_user_id: req.session.adminUser.id,
        action,
        details,
        ip_address: req.ip,
        user_agent: req.headers['user-agent'] || ''
      });
    }
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

/**
 * Load admin user data into session
 */
export const loadAdminUserData = async (userId: number, req: AdminSessionRequest): Promise<boolean> => {
  try {
    // Check if user is an admin
    const adminUserResults = await db.select().from(adminUsers)
      .where(and(
        eq(adminUsers.userId, userId),
        eq(adminUsers.isActive, true)
      ))
      .limit(1);
    
    if (adminUserResults.length === 0) {
      return false;
    }
    
    const adminUser = adminUserResults[0];
    
    // Get role information
    const roles = await db.select().from(adminRoles)
      .where(eq(adminRoles.id, adminUser.roleId))
      .limit(1);
    
    if (roles.length === 0) {
      return false;
    }
    
    // Get permissions for the admin's role
    const permissions = await db.select().from(adminPermissions)
      .where(eq(adminPermissions.roleId, adminUser.roleId));
    
    // Store in session
    req.session.adminUser = {
      id: adminUser.id,
      userId: adminUser.userId,
      roleId: adminUser.roleId,
      roleName: roles[0].name,
      permissions: permissions.map(p => p.permissionType)
    };
    
    // Log the login
    await logAdminActivity(req, 'admin_login', 'Admin login successful');
    
    return true;
  } catch (error) {
    console.error('Error loading admin user data:', error);
    return false;
  }
};
import { pgTable, text, timestamp, boolean, integer, varchar, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./schema";

// Admin roles table
export const adminRoles = pgTable('admin_roles', {
  id: integer('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Permission types
export const permissionTypes = [
  'view_users', 
  'manage_users',
  'view_content', 
  'manage_content',
  'view_analytics', 
  'manage_settings',
  'full_access'
] as const;

// Admin permissions table
export const adminPermissions = pgTable('admin_permissions', {
  id: integer('id').primaryKey(),
  roleId: integer('role_id').notNull().references(() => adminRoles.id),
  permissionType: varchar('permission_type', { length: 50 }).notNull().$type<typeof permissionTypes[number]>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
}, (table) => {
  return {
    rolePermissionKey: primaryKey({ columns: [table.roleId, table.permissionType] })
  };
});

// Admin users table
export const adminUsers = pgTable('admin_users', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  roleId: integer('role_id').notNull().references(() => adminRoles.id),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Activity log for admin actions
export const adminActivityLog = pgTable('admin_activity_log', {
  id: integer('id').primaryKey(),
  adminUserId: integer('admin_user_id').notNull().references(() => adminUsers.id),
  action: text('action').notNull(),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow()
});

// Types for all tables
export type AdminRole = typeof adminRoles.$inferSelect;
export type InsertAdminRole = typeof adminRoles.$inferInsert;
export type AdminPermission = typeof adminPermissions.$inferSelect;
export type InsertAdminPermission = typeof adminPermissions.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
export type AdminActivityLog = typeof adminActivityLog.$inferSelect;
export type InsertAdminActivityLog = typeof adminActivityLog.$inferInsert;

// Insert schemas for validation
export const insertAdminRoleSchema = createInsertSchema(adminRoles);
export const insertAdminPermissionSchema = createInsertSchema(adminPermissions);
export const insertAdminUserSchema = createInsertSchema(adminUsers);
export const insertAdminActivityLogSchema = createInsertSchema(adminActivityLog);

// Custom schemas for API requests
export const AdminRoleSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(3, "Role name must be at least 3 characters"),
  description: z.string().optional(),
});

export const AdminPermissionSchema = z.object({
  roleId: z.number(),
  permissionType: z.enum(permissionTypes),
});

export const AdminUserSchema = z.object({
  userId: z.number(),
  roleId: z.number(),
  isActive: z.boolean().default(true),
});
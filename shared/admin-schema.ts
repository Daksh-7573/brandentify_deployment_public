import { pgTable, text, timestamp, boolean, integer, varchar, primaryKey, json } from "drizzle-orm/pg-core";
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

// Content types
export const contentTypes = [
  'article',
  'post',
  'pulse',
  'announcement'
] as const;

// Content status types
export const contentStatusTypes = [
  'draft',
  'published',
  'archived'
] as const;

// Content table
export const content = pgTable('content', {
  id: integer('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 50 }).notNull().$type<typeof contentTypes[number]>(),
  status: varchar('status', { length: 20 }).notNull().$type<typeof contentStatusTypes[number]>().default('draft'),
  body: text('body'),
  excerpt: text('excerpt'),
  featuredImage: varchar('featured_image', { length: 255 }),
  metadata: json('metadata'),
  authorId: integer('author_id').notNull().references(() => users.id),
  publishedAt: timestamp('published_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Content tags table
export const contentTags = pgTable('content_tags', {
  id: integer('id').primaryKey(),
  contentId: integer('content_id').notNull().references(() => content.id),
  tag: varchar('tag', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => {
  return {
    contentTagsKey: primaryKey({ columns: [table.contentId, table.tag] })
  };
});

// Types for content tables
export type Content = typeof content.$inferSelect;
export type InsertContent = typeof content.$inferInsert;
export type ContentTag = typeof contentTags.$inferSelect;
export type InsertContentTag = typeof contentTags.$inferInsert;

// Insert schemas for validation
export const insertContentSchema = createInsertSchema(content);
export const insertContentTagSchema = createInsertSchema(contentTags);

// Custom schemas for API requests
export const ContentSchema = z.object({
  id: z.number().optional(),
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  type: z.enum(contentTypes),
  status: z.enum(contentStatusTypes).default('draft'),
  body: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().url("Feature image must be a valid URL").optional(),
  metadata: z.record(z.any()).optional(),
  authorId: z.number(),
  publishedAt: z.date().optional(),
  tags: z.array(z.string()).optional()
});
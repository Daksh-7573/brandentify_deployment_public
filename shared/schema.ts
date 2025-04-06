import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, decimal } from "drizzle-orm/pg-core"; 
import { pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password"),
  phoneNumber: text("phone_number").unique(), // Added phone number for mobile login
  name: text("name"),
  photoURL: text("photo_url"),
  title: text("title"), // Job title
  location: text("location"), // User location
  industry: text("industry"), // User's industry
  lookingFor: text("looking_for"), // What the user is looking for (networking type)
  profileCompleted: integer("profile_completed").default(0), // Percentage
  emailVerified: boolean("email_verified").default(false), // Whether email is verified
  emailVerificationToken: text("email_verification_token"), // Token for email verification
  emailVerificationExpires: timestamp("email_verification_expires"), // When token expires
  createdAt: timestamp("created_at").defaultNow(),
});

// Resume model
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileData: text("file_data").notNull(), // Base64 encoded data
  score: integer("score").default(0), // AI-generated score
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Work Experience model
export const workExperiences = pgTable("work_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  industry: text("industry"),
  domain: text("domain"),
  location: text("location"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
});

// Education model
export const educations = pgTable("educations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  degree: text("degree").notNull(),
  institution: text("institution").notNull(),
  location: text("location"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
});

// Skill model
export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  level: text("level").notNull(), // Beginner, Intermediate, Advanced
  proficiency: integer("proficiency").default(0), // Percentage
});

// AI Chat messages model
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(), // actual message content
  sender: text("sender").notNull(), // user or ai
  messageType: text("message_type").default("general"), // general, career_advice, resume_analysis, networking_recommendations
  timestamp: timestamp("timestamp").defaultNow(),
});

// OTP verification model for phone login
export const otpVerifications = pgTable("otp_verifications", {
  id: serial("id").primaryKey(),
  phoneNumber: text("phone_number").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email verification model
export const emailVerifications = pgTable("email_verifications", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  token: text("token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Projects model
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: text("start_date"),
  projectUrl: text("project_url"),
  category: text("category"), // Web Development, Mobile App, Design, etc.
  thumbnailUrl: text("thumbnail_url"), // URL to the main thumbnail image for the project
  thumbnailFile: text("thumbnail_file"), // Filename for uploaded image
  mediaUrls: jsonb("media_urls").default('[]'), // URLs to images, videos, or documents stored as JSON array
  // isVisible field removed as requested
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project collaborators model
export const projectCollaborators = pgTable("project_collaborators", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  name: text("name").notNull().default("Team Member"), // Default name for all team members
  email: text("email"),
  role: text("role").notNull().default("Collaborator"), // Default role for all team members
  profileLink: text("profile_link").notNull(), // Required Brandentifier profile link for connecting users
  userId: integer("user_id").references(() => users.id), // Optional: if the collaborator is on the platform
  inviteStatus: text("invite_status").default("Pending"), // Pending, Accepted, Declined
  inviteToken: text("invite_token"),
  inviteExpires: timestamp("invite_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project endorsements model
export const projectEndorsements = pgTable("project_endorsements", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email"),
  clientTitle: text("client_title"), // Job title of the client
  clientCompany: text("client_company"),
  message: text("message"),
  rating: integer("rating"), // e.g., 1-5 stars
  isVerified: boolean("is_verified").default(false), // Whether the endorsement has been verified by the client
  verificationToken: text("verification_token"),
  verificationExpires: timestamp("verification_expires"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, emailVerified: true, emailVerificationToken: true, emailVerificationExpires: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, uploadedAt: true });
export const insertWorkExperienceSchema = createInsertSchema(workExperiences).omit({ id: true });
export const insertEducationSchema = createInsertSchema(educations).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({ id: true, verified: true, createdAt: true });
export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({ id: true, verified: true, createdAt: true });

// Project schemas
export const insertProjectSchema = createInsertSchema(projects).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertProjectCollaboratorSchema = createInsertSchema(projectCollaborators).omit({ 
  id: true, 
  createdAt: true, 
  inviteStatus: true, 
  inviteToken: true, 
  inviteExpires: true 
});
export const insertProjectEndorsementSchema = createInsertSchema(projectEndorsements).omit({ 
  id: true, 
  createdAt: true, 
  isVerified: true, 
  verificationToken: true, 
  verificationExpires: true 
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type WorkExperience = typeof workExperiences.$inferSelect;
export type InsertWorkExperience = z.infer<typeof insertWorkExperienceSchema>;

export type Education = typeof educations.$inferSelect;
export type InsertEducation = z.infer<typeof insertEducationSchema>;

export type Skill = typeof skills.$inferSelect;
export type InsertSkill = z.infer<typeof insertSkillSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;

export type OtpVerification = typeof otpVerifications.$inferSelect;
export type InsertOtpVerification = z.infer<typeof insertOtpVerificationSchema>;

export type EmailVerification = typeof emailVerifications.$inferSelect;
export type InsertEmailVerification = z.infer<typeof insertEmailVerificationSchema>;

// Project related types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type ProjectCollaborator = typeof projectCollaborators.$inferSelect;
export type InsertProjectCollaborator = z.infer<typeof insertProjectCollaboratorSchema>;

export type ProjectEndorsement = typeof projectEndorsements.$inferSelect;
export type InsertProjectEndorsement = z.infer<typeof insertProjectEndorsementSchema>;

// Service category enum for categorizing user services
export const serviceCategoryEnum = pgEnum("service_category", [
  "consulting", 
  "development",
  "design",
  "marketing",
  "writing",
  "coaching",
  "teaching",
  "other"
]);

// Portfolio layout enum
export const portfolioLayoutEnum = pgEnum("portfolio_layout", [
  "professional", 
  "creative", 
  "minimal", 
  "technical",
  "executive",
  "minimalist_pro" // Added "The Minimalist Pro" theme with snake_case format
]);

// Portfolio model
export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  layout: portfolioLayoutEnum("layout").notNull().default("professional"),
  customTitle: text("custom_title"), // Custom title for the portfolio
  customBio: text("custom_bio"), // Additional bio information
  customizationOptions: jsonb("customization_options").default("{}"), // JSON data for customization (colors, fonts, etc.)
  isPublished: boolean("is_published").default(false), // Whether portfolio is public
  publicUrl: text("public_url"), // Custom URL for the portfolio
  featuredProjects: jsonb("featured_projects").default("[]"), // IDs of featured projects
  featuredSkills: jsonb("featured_skills").default("[]"), // IDs of featured skills
  featuredExperiences: jsonb("featured_experiences").default("[]"), // IDs of featured work experiences
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema for Portfolio
export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Export types for Portfolio
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

// Services model for showcasing user services with pricing
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: serviceCategoryEnum("category").notNull().default("other"),
  priceInr: decimal("price_inr", { precision: 10, scale: 2 }), // Price in INR
  priceUsd: decimal("price_usd", { precision: 10, scale: 2 }), // Price in USD
  isHourly: boolean("is_hourly").default(false), // Whether price is per hour or fixed
  features: jsonb("features").default("[]"), // Array of features included in the service
  imageUrl: text("image_url"), // URL to service image
  order: integer("order").default(0), // For ordering services (1, 2, 3 for top services)
  isActive: boolean("is_active").default(true), // Whether service is active
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema for Services
export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Export types for Services
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

// Industry Pulse post type enum
export const pulsePostTypeEnum = pgEnum("pulse_post_type", [
  "news",       // News/Trends post
  "poll",       // Poll post
  "video",      // Video post
  "image",      // Image post
]);

// Industry Pulse posts model
export const industryPulsePosts = pgTable("industry_pulse_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  postType: pulsePostTypeEnum("post_type").notNull(),
  title: text("title").notNull(),
  content: text("content"),
  industry: text("industry"),
  tags: jsonb("tags").default("[]"), // Array of tags
  mediaUrl: text("media_url"), // URL for image or video content
  thumbnailUrl: text("thumbnail_url"), // Thumbnail image URL
  videoCaption: text("video_caption"), // Auto-generated captions for video
  pollOptions: jsonb("poll_options").default("[]"), // Array of poll options
  pollExpiration: timestamp("poll_expiration"), // When poll ends
  aiEnhanced: boolean("ai_enhanced").default(false), // Whether content was enhanced by AI
  aiSummary: text("ai_summary"), // AI-generated summary
  viewCount: integer("view_count").default(0), // Number of views
  bookmarkCount: integer("bookmark_count").default(0), // Number of bookmarks
  shareCount: integer("share_count").default(0), // Number of shares
  isPublished: boolean("is_published").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema for Industry Pulse Posts
export const insertIndustryPulsePostSchema = createInsertSchema(industryPulsePosts).omit({
  id: true,
  viewCount: true,
  bookmarkCount: true,
  shareCount: true,
  createdAt: true,
  updatedAt: true
});

// Export types for Industry Pulse Posts
export type IndustryPulsePost = typeof industryPulsePosts.$inferSelect;
export type InsertIndustryPulsePost = z.infer<typeof insertIndustryPulsePostSchema>;

// Industry Pulse reactions model (for reactions like 🔥 Insightful, ⚠️ Misinformed)
export const industryPulseReactions = pgTable("industry_pulse_reactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => industryPulsePosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reactionType: text("reaction_type").notNull(), // "insightful", "misinformed"
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for Industry Pulse Reactions
export const insertIndustryPulseReactionSchema = createInsertSchema(industryPulseReactions).omit({
  id: true,
  createdAt: true
});

// Export types for Industry Pulse Reactions
export type IndustryPulseReaction = typeof industryPulseReactions.$inferSelect;
export type InsertIndustryPulseReaction = z.infer<typeof insertIndustryPulseReactionSchema>;

// Industry Pulse comments model
export const industryPulseComments = pgTable("industry_pulse_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => industryPulsePosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  parentId: integer("parent_id"),  // Manually referenced in SQL to avoid circular reference
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema for Industry Pulse Comments
export const insertIndustryPulseCommentSchema = createInsertSchema(industryPulseComments).omit({
  id: true,
  likes: true,
  createdAt: true,
  updatedAt: true
});

// Export types for Industry Pulse Comments
export type IndustryPulseComment = typeof industryPulseComments.$inferSelect;
export type InsertIndustryPulseComment = z.infer<typeof insertIndustryPulseCommentSchema>;

// Industry Pulse bookmarks model
export const industryPulseBookmarks = pgTable("industry_pulse_bookmarks", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => industryPulsePosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for Industry Pulse Bookmarks
export const insertIndustryPulseBookmarkSchema = createInsertSchema(industryPulseBookmarks).omit({
  id: true,
  createdAt: true
});

// Export types for Industry Pulse Bookmarks
export type IndustryPulseBookmark = typeof industryPulseBookmarks.$inferSelect;
export type InsertIndustryPulseBookmark = z.infer<typeof insertIndustryPulseBookmarkSchema>;

// Industry Pulse poll votes model
export const industryPulsePollVotes = pgTable("industry_pulse_poll_votes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").references(() => industryPulsePosts.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  optionIndex: integer("option_index").notNull(), // Index of the option selected
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for Industry Pulse Poll Votes
export const insertIndustryPulsePollVoteSchema = createInsertSchema(industryPulsePollVotes).omit({
  id: true,
  createdAt: true
});

// Export types for Industry Pulse Poll Votes
export type IndustryPulsePollVote = typeof industryPulsePollVotes.$inferSelect;
export type InsertIndustryPulsePollVote = z.infer<typeof insertIndustryPulsePollVoteSchema>;

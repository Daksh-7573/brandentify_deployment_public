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
  aboutMe: text("about_me"), // About Me section - max 350 words
  location: text("location"), // User location (city/state name)
  industry: text("industry"), // User's industry
  lookingFor: text("looking_for"), // What the user is looking for (networking type)
  visitingCardType: text("visiting_card_type"), // Type of digital visiting card
  profileCompleted: integer("profile_completed").default(0), // Percentage
  emailVerified: boolean("email_verified").default(false), // Whether email is verified
  emailVerificationToken: text("email_verification_token"), // Token for email verification
  emailVerificationExpires: timestamp("email_verification_expires"), // When token expires
  createdAt: timestamp("created_at").defaultNow(),
});

// Resume theme enum
export const resumeThemeEnum = pgEnum("resume_theme", [
  "professional",
  "creative", 
  "minimal", 
  "technical",
  "executive",
  "minimalist_pro",
  "timeline",
  "visual_expert",
  "freelancer_hub",
  "scholar",
  "animated",
  "dynamic_innovator"
]);

// Resume model
export const resumes = pgTable("resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  fileName: text("file_name").notNull(),
  fileData: text("file_data").notNull(), // Base64 encoded data
  score: integer("score").default(0), // AI-generated score
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  isShadowResume: boolean("is_shadow_resume").default(false), // Whether this is a Musk-generated shadow resume
  themeStyle: resumeThemeEnum("theme_style").default("professional"), // Theme style for the resume
  isDownloadable: boolean("is_downloadable").default(false), // Whether others can download this resume
  lastUpdatedByMusk: timestamp("last_updated_by_musk"), // When Musk last updated this resume
  visibility: text("visibility").default("private"), // private, connections, public
});

// Shadow Resume model - stores automatically generated resume content by Musk
export const shadowResumes = pgTable("shadow_resumes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  resumeId: integer("resume_id").references(() => resumes.id), // Link to the generated resume when published
  content: jsonb("content").notNull(), // Structured JSON data containing all resume sections and content
  suggestions: jsonb("suggestions").default('[]'), // New content suggestions from Musk
  history: jsonb("history").default('[]'), // History of changes made to the resume
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Work Experience model
export const workExperiences = pgTable("work_experiences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  industry: text("industry"),
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
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, uploadedAt: true, lastUpdatedByMusk: true });
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

// Insert schema for ShadowResume
export const insertShadowResumeSchema = createInsertSchema(shadowResumes).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;

export type ShadowResume = typeof shadowResumes.$inferSelect;
export type InsertShadowResume = z.infer<typeof insertShadowResumeSchema>;

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

// Pulse type enum
export const pulseTypeEnum = pgEnum("pulse_type", [
  "poll", 
  "media-pulse", 
  "project",
  "news-pulse" // Added News Pulse type for AI-generated industry news
]);

// Pulse category enum
export const pulseCategoryEnum = pgEnum("pulse_category", [
  "certification",
  "launch",
  "award",
  "project",
  "announcement",
  "highlight" // 24-hour temporary content
]);

// Media type enum for Media Pulses
export const mediaTypeEnum = pgEnum("media_type", [
  "image",
  "video"
]);

// Reaction type enum for pulse reactions
export const reactionTypeEnum = pgEnum("reaction_type", [
  "insightful",
  "misinformed",
]);

// Pulses model for user-created content
export const pulses = pgTable("pulses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: pulseTypeEnum("type").notNull(),
  category: pulseCategoryEnum("category"), // Categorization of the pulse
  title: text("title").notNull(),
  content: text("content"),
  industry: text("industry"), // Industry related to the pulse content
  mediaType: mediaTypeEnum("media_type"),
  mediaUrls: jsonb("media_urls").default('[]'), // URLs to images or videos stored as JSON array
  mediaLocalStorageKeys: jsonb("media_local_storage_keys").default('[]'), // Keys to access images/videos in localStorage
  pollOptions: jsonb("poll_options").default('[]'), // For poll type pulses
  projectId: integer("project_id").references(() => projects.id), // For project type pulses
  likes: integer("likes").default(0), // Legacy field - will be replaced by insightful_count
  insightfulCount: integer("insightful_count").default(0), // Count of insightful reactions
  misinformedCount: integer("misinformed_count").default(0), // Count of misinformed reactions
  shareCount: integer("share_count").default(0), // Count of shares
  comments: integer("comments").default(0),
  isPublished: boolean("is_published").default(true),
  expiresAt: timestamp("expires_at"), // When the pulse expires (for highlight category)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pulse comments model
export const pulseComments = pgTable("pulse_comments", {
  id: serial("id").primaryKey(),
  pulseId: integer("pulse_id").references(() => pulses.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Poll votes model - tracks votes on poll options
export const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  pulseId: integer("pulse_id").references(() => pulses.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  optionIndex: integer("option_index").notNull(), // Index of the option that was voted for
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for Pulses
export const insertPulseSchema = createInsertSchema(pulses).omit({
  id: true,
  likes: true,
  comments: true,
  createdAt: true,
  updatedAt: true
});

export const insertPulseCommentSchema = createInsertSchema(pulseComments).omit({
  id: true,
  likes: true,
  createdAt: true
});

export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({
  id: true,
  createdAt: true
});

// Export types for Pulses
export type Pulse = typeof pulses.$inferSelect;
export type InsertPulse = z.infer<typeof insertPulseSchema>;

export type PulseComment = typeof pulseComments.$inferSelect;
export type InsertPulseComment = z.infer<typeof insertPulseCommentSchema>;

export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;

// Hashtags model for tracking hashtags used in pulses
export const hashtags = pgTable("hashtags", {
  id: serial("id").primaryKey(),
  tag: text("tag").notNull().unique(), // The hashtag text (without the # symbol)
  count: integer("count").default(1), // How many times this hashtag has been used
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pulse hashtags relationship model - links pulses with hashtags
export const pulseHashtags = pgTable("pulse_hashtags", {
  id: serial("id").primaryKey(),
  pulseId: integer("pulse_id").references(() => pulses.id).notNull(),
  hashtagId: integer("hashtag_id").references(() => hashtags.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for Hashtags
export const insertHashtagSchema = createInsertSchema(hashtags).omit({
  id: true,
  count: true,
  createdAt: true,
  updatedAt: true
});

export const insertPulseHashtagSchema = createInsertSchema(pulseHashtags).omit({
  id: true,
  createdAt: true
});

// Export types for Hashtags
export type Hashtag = typeof hashtags.$inferSelect;
export type InsertHashtag = z.infer<typeof insertHashtagSchema>;

export type PulseHashtag = typeof pulseHashtags.$inferSelect;
export type InsertPulseHashtag = z.infer<typeof insertPulseHashtagSchema>;

// User-hashtag following relationship model - tracks which hashtags a user follows
export const userHashtagFollows = pgTable("user_hashtag_follows", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  hashtagId: integer("hashtag_id").references(() => hashtags.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for user-hashtag follows
export const insertUserHashtagFollowSchema = createInsertSchema(userHashtagFollows).omit({
  id: true,
  createdAt: true
});

// Export types for user-hashtag follows
export type UserHashtagFollow = typeof userHashtagFollows.$inferSelect;
export type InsertUserHashtagFollow = z.infer<typeof insertUserHashtagFollowSchema>;

// News source categories enum
export const newsSourceCategoryEnum = pgEnum("news_source_category", [
  "technology",
  "business",
  "finance",
  "marketing",
  "design",
  "healthcare",
  "education",
  "engineering",
  "general"
]);

// News sources model - for tracking different news sources
export const newsSources = pgTable("news_sources", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  category: newsSourceCategoryEnum("category").notNull(),
  apiEndpoint: text("api_endpoint"),
  apiKey: text("api_key"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// News articles model - for storing fetched news articles
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").references(() => newsSources.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content"),
  url: text("url"),
  imageUrl: text("image_url"),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  category: newsSourceCategoryEnum("category"),
  industries: jsonb("industries").default('[]'), // Array of industries this article is relevant for
  processed: boolean("processed").default(false), // Whether this article has been processed and posted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// News user preferences model - for tracking user preferences for news
export const newsUserPreferences = pgTable("news_user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  preferredIndustries: jsonb("preferred_industries").default('[]'), // Array of preferred industries
  preferredSources: jsonb("preferred_sources").default('[]'), // Array of preferred source IDs
  excludedSources: jsonb("excluded_sources").default('[]'), // Array of excluded source IDs
  deliveryTime: text("delivery_time").default('17:00'), // 24-hour format for when to deliver news (default 5pm)
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert schemas for News models
export const insertNewsSourceSchema = createInsertSchema(newsSources).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertNewsUserPreferenceSchema = createInsertSchema(newsUserPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Export types for News models
export type NewsSource = typeof newsSources.$inferSelect;
export type InsertNewsSource = z.infer<typeof insertNewsSourceSchema>;

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;

export type NewsUserPreference = typeof newsUserPreferences.$inferSelect;
export type InsertNewsUserPreference = z.infer<typeof insertNewsUserPreferenceSchema>;

// Pulse reactions model - tracks user reactions (insightful, misinformed) to pulses
export const pulseReactions = pgTable("pulse_reactions", {
  id: serial("id").primaryKey(),
  pulseId: integer("pulse_id").references(() => pulses.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  reactionType: reactionTypeEnum("reaction_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// User reaction quotas model - tracks daily quotas for user reactions
export const userReactionQuotas = pgTable("user_reaction_quotas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  insightfulQuotaUsed: integer("insightful_quota_used").default(0),
  misinformedQuotaUsed: integer("misinformed_quota_used").default(0),
  insightfulQuotaMax: integer("insightful_quota_max").default(10),
  misinformedQuotaMax: integer("misinformed_quota_max").default(10),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pulse shares model - tracks when users share pulses with other users
export const pulseShares = pgTable("pulse_shares", {
  id: serial("id").primaryKey(),
  pulseId: integer("pulse_id").references(() => pulses.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  recipientId: integer("recipient_id").references(() => users.id).notNull(),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for the new models
export const insertPulseReactionSchema = createInsertSchema(pulseReactions).omit({
  id: true,
  createdAt: true
});

export const insertUserReactionQuotaSchema = createInsertSchema(userReactionQuotas).omit({
  id: true,
  updatedAt: true
});

export const insertPulseShareSchema = createInsertSchema(pulseShares).omit({
  id: true,
  isRead: true,
  createdAt: true
});

// Export types for the new models
export type PulseReaction = typeof pulseReactions.$inferSelect;
export type InsertPulseReaction = z.infer<typeof insertPulseReactionSchema>;

export type UserReactionQuota = typeof userReactionQuotas.$inferSelect;
export type InsertUserReactionQuota = z.infer<typeof insertUserReactionQuotaSchema>;

export type PulseShare = typeof pulseShares.$inferSelect;
export type InsertPulseShare = z.infer<typeof insertPulseShareSchema>;

// MuskMatch model - tracks AI suggestions for user connections
export const muskMatches = pgTable("musk_matches", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // User receiving the suggestion
  suggestedUserId: integer("suggested_user_id").references(() => users.id).notNull(), // User being suggested
  matchType: text("match_type").notNull(), // Based on lookingFor value pairs
  matchScore: integer("match_score").default(0), // AI-calculated match score (0-100)
  matchReason: text("match_reason"), // AI-generated reason for the match
  industry: text("industry"), // Matched industry
  domain: text("domain"), // Matched domain
  skills: jsonb("skills").default('[]'), // Matched skills as array
  isRead: boolean("is_read").default(false), // Whether the user has seen this suggestion
  isDismissed: boolean("is_dismissed").default(false), // Whether the user has dismissed this suggestion
  isConnected: boolean("is_connected").default(false), // Whether the users have connected
  shownAt: timestamp("shown_at").defaultNow(), // When the match was shown to the user
  expiresAt: timestamp("expires_at"), // When the match suggestion expires
});

// Insert schema for MuskMatch
export const insertMuskMatchSchema = createInsertSchema(muskMatches).omit({
  id: true,
  isRead: true,
  isDismissed: true,
  isConnected: true,
  shownAt: true
});

// Export types for MuskMatch
export type MuskMatch = typeof muskMatches.$inferSelect;
export type InsertMuskMatch = z.infer<typeof insertMuskMatchSchema>;

// Nowboard - For storing micro-actions professionals are taking
export const nowboardCategoryEnum = pgEnum("nowboard_category", [
  "growth",
  "learning",
  "launch",
  "planning",
  "collaboration",
  "visibility"
]);

export const nowboardItems = pgTable("nowboard_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: varchar("content", { length: 150 }).notNull(),
  category: nowboardCategoryEnum("category").notNull(),
  visibility: varchar("visibility", { length: 20 }).notNull().default("public").$type<"public" | "connections-only">(),
  inspiredCount: integer("inspired_count").notNull().default(0),
  relatedSkills: text("related_skills"),
  relatedProject: integer("related_project"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Nowboard inspired-by tracking
export const nowboardInspiredBy = pgTable("nowboard_inspired_by", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  nowboardItemId: integer("nowboard_item_id").notNull().references(() => nowboardItems.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Insert schemas for Nowboard
export const insertNowboardItemSchema = createInsertSchema(nowboardItems).omit({
  id: true,
  inspiredCount: true,
  createdAt: true,
  updatedAt: true
});

export const insertNowboardInspiredBySchema = createInsertSchema(nowboardInspiredBy).omit({
  id: true,
  createdAt: true
});

// Export types for Nowboard
export type NowboardItem = typeof nowboardItems.$inferSelect;
export type InsertNowboardItem = z.infer<typeof insertNowboardItemSchema>;

export type NowboardInspiredBy = typeof nowboardInspiredBy.$inferSelect;
export type InsertNowboardInspiredBy = z.infer<typeof insertNowboardInspiredBySchema>;

// Career Quests Feature
// Quest types enum
export const questTypeEnum = pgEnum("quest_type", [
  "profile_update",
  "pulse_creation",
  "networking",
  "learning",
  "portfolio",
  "resume",
  "visibility"
]);

// Quest status enum
export const questStatusEnum = pgEnum("quest_status", [
  "active",
  "completed",
  "dismissed",
  "expired"
]);

// Badge type enum
export const badgeTypeEnum = pgEnum("badge_type", [
  "quest_initiate",
  "weekly_hustler",
  "musk_learner",
  "thought_leader",
  "portfolio_star",
  "visibility_boosted"
]);

// Quests definition model - stores templates for quests
export const questDefinitions = pgTable("quest_definitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: questTypeEnum("type").notNull(),
  targetCount: integer("target_count").notNull().default(1), // Number of actions needed to complete
  targetAction: text("target_action").notNull(), // Specific action required
  xpReward: integer("xp_reward").notNull().default(50),
  badgeReward: badgeTypeEnum("badge_reward"),
  requiredProfileCompletion: integer("required_profile_completion").default(0), // Minimum profile completion % to get this quest
  requiredCareerStage: text("required_career_stage"), // Only show for certain career stages
  requiredIndustry: text("required_industry"), // Only show for specific industries
  muskTip: text("musk_tip"), // Tip from Musk about this quest
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// User quests model - tracks active and completed quests for each user
export const userQuests = pgTable("user_quests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questDefinitionId: integer("quest_definition_id").references(() => questDefinitions.id).notNull(),
  status: questStatusEnum("status").notNull().default("active"),
  progress: integer("progress").notNull().default(0), // Current progress count
  assignedAt: timestamp("assigned_at").defaultNow(),
  completedAt: timestamp("completed_at"), // When the quest was completed
  weekNumber: integer("week_number").notNull(), // Week of the year (1-52)
  year: integer("year").notNull(), // Year of the quest
  dismissedReason: text("dismissed_reason"), // If dismissed, why
  xpEarned: integer("xp_earned"), // Actual XP earned upon completion
  badgeEarned: badgeTypeEnum("badge_earned"), // Badge earned upon completion
  muskResponse: text("musk_response"), // Custom response from Musk on completion
});

// User XP model - tracks user XP balance and history
export const userXp = pgTable("user_xp", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: integer("balance").notNull().default(0), // Current XP balance
  lifetimeEarned: integer("lifetime_earned").notNull().default(0), // Total XP earned all-time
  currentMonthEarned: integer("current_month_earned").notNull().default(0), // XP earned this month
  lastEarnedAt: timestamp("last_earned_at"), // Last time XP was earned
  lastResetAt: timestamp("last_reset_at"), // Last time monthly XP was reset
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User badges model - tracks badges earned by users
export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  badgeType: badgeTypeEnum("badge_type").notNull(),
  earnedAt: timestamp("earned_at").defaultNow(),
  questId: integer("quest_id").references(() => userQuests.id), // Quest that earned this badge
  displayOnProfile: boolean("display_on_profile").default(true), // Whether to show on profile
  displayOnResume: boolean("display_on_resume").default(false), // Whether to show on downloaded resume
});

// XP transactions model - tracks all XP earned/spent
export const xpTransactions = pgTable("xp_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(), // Can be positive (earned) or negative (spent)
  source: text("source").notNull(), // quest_completion, daily_login, reaction, etc.
  sourceId: integer("source_id"), // ID of the source (quest ID, etc.)
  description: text("description").notNull(), // Human-readable description
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for Career Quests
export const insertQuestDefinitionSchema = createInsertSchema(questDefinitions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserQuestSchema = createInsertSchema(userQuests).omit({
  id: true,
  assignedAt: true,
  completedAt: true
});

export const insertUserXpSchema = createInsertSchema(userXp).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true
});

export const insertXpTransactionSchema = createInsertSchema(xpTransactions).omit({
  id: true,
  createdAt: true
});

// Export types for Career Quests
export type QuestDefinition = typeof questDefinitions.$inferSelect;
export type InsertQuestDefinition = z.infer<typeof insertQuestDefinitionSchema>;

export type UserQuest = typeof userQuests.$inferSelect;
export type InsertUserQuest = z.infer<typeof insertUserQuestSchema>;

export type UserXp = typeof userXp.$inferSelect;
export type InsertUserXp = z.infer<typeof insertUserXpSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type XpTransaction = typeof xpTransactions.$inferSelect;
export type InsertXpTransaction = z.infer<typeof insertXpTransactionSchema>;

// Brand of the Day model - for storing and tracking featured profiles
export const brandsOfTheDay = pgTable("brands_of_the_day", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  industry: text("industry").notNull(),  // Industry category
  domain: text("domain").notNull(),      // Domain/specialty within industry
  brandValueScore: integer("brand_value_score").notNull(), // Score out of 100
  muskComment: text("musk_comment").notNull(), // AI-generated comment about why featured
  scoreBreakdown: jsonb("score_breakdown").notNull(), // Detailed score components
  featuredDate: timestamp("featured_date").notNull().defaultNow(), // When profile was featured
  expiresDate: timestamp("expires_date").notNull(), // When feature expires (24h later)
  hasBeenShared: boolean("has_been_shared").default(false), // Whether user has shared their feature
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for Brand of the Day
export const insertBrandOfTheDaySchema = createInsertSchema(brandsOfTheDay).omit({
  id: true,
  createdAt: true,
  expiresDate: true,
});

// Export types for Brand of the Day
export type BrandOfTheDay = typeof brandsOfTheDay.$inferSelect;
export type InsertBrandOfTheDay = z.infer<typeof insertBrandOfTheDaySchema>;

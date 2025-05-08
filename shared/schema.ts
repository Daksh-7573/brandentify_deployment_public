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
  domain: text("domain"), // User's domain within the industry
  lookingFor: text("looking_for"), // What the user is looking for (networking type)
  whatIOffer: text("what_i_offer"), // What skills/services the user offers - max 250 words
  visitingCardType: text("visiting_card_type"), // Type of digital visiting card
  profileCompleted: integer("profile_completed").default(0), // Percentage
  hasGeneratedResume: boolean("has_generated_resume").default(false), // Whether a resume has been auto-generated
  resumeUrl: text("resume_url"), // URL to the generated resume
  resumeGeneratedAt: timestamp("resume_generated_at"), // When resume was last generated
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
  "dynamic_innovator",
  "animated_odyssey"
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
  metadata: text("metadata"), // Stores form data for Resume Editor
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
  domain: text("domain"),
  location: text("location"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  description: text("description"),
  keyResponsibilities: jsonb("key_responsibilities").default('[]'),
});

// Education model
export const educations = pgTable("educations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  degree: text("degree").notNull(),
  institution: text("institution").notNull(),
  location: text("location"),
  industry: text("industry"),
  domain: text("domain"),
  fieldOfStudy: text("field_of_study"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  skillsAcquired: jsonb("skills_acquired").default('[]'),
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
  industry: text("industry"), // Healthcare, Technology, Finance, etc.
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
  "minimalist_pro", // Added "The Minimalist Pro" theme with snake_case format
  "timeline-storyteller-2", // Timeline Storyteller 2.0 template - comprehensive interactive timeline
  "visual-expert",
  "corporate-executive",
  "dynamic-innovator",
  "animated",
  "animated-odyssey", // New immersive animated template with continuous scrolling
  "freelancer-hub",
  "scholar"
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
const baseServiceSchema = createInsertSchema(services).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Custom schema with more relaxed validation for price fields
export const insertServiceSchema = baseServiceSchema.extend({
  // Make sure category always defaults to "other" if not provided
  category: z.enum(["consulting", "development", "design", "marketing", "writing", "coaching", "teaching", "other"]).default("other"),
  // Allow prices to be string or number or null
  priceInr: z.union([z.number().nullable(), z.string().transform(val => val ? parseFloat(val) : null).nullable()]).nullable().optional(),
  priceUsd: z.union([z.number().nullable(), z.string().transform(val => val ? parseFloat(val) : null).nullable()]).nullable().optional(),
  // Make sure features is always an array
  features: z.array(z.any()).default([])
});

// Export types for Services
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

// Feedback type enum
export const feedbackTypeEnum = pgEnum("feedback_type", [
  "helpful", // Yes/No binary feedback
  "rating", // 1-5 stars
  "text", // Text feedback for improvement
  "save" // Saved to career plan
]);

// Feedback model for Musk response feedback
export const muskFeedbacks = pgTable("musk_feedbacks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  conversationId: text("conversation_id").notNull(), // Unique ID for the conversation
  messageId: text("message_id").notNull(), // ID of the specific message
  feedbackType: feedbackTypeEnum("feedback_type").notNull(),
  rating: integer("rating"), // For star ratings (1-5)
  helpful: boolean("helpful"), // For yes/no feedback
  textFeedback: text("text_feedback"), // For text feedback
  savedToPlan: boolean("saved_to_plan").default(false), // Whether saved to career plan
  context: text("context"), // Context of the conversation (e.g., resume review, career advice)
  promptCategory: text("prompt_category"), // Category of the prompt (e.g., career growth, job search)
  promptDetails: jsonb("prompt_details").default("{}"), // JSON with detailed prompt info
  responseDetails: jsonb("response_details").default("{}"), // JSON with response details
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schema for MuskFeedback
export const insertMuskFeedbackSchema = createInsertSchema(muskFeedbacks).omit({
  id: true,
  createdAt: true
});

// Feedback analysis model for tracking aggregated feedback patterns
export const feedbackAnalytics = pgTable("feedback_analytics", {
  id: serial("id").primaryKey(),
  promptCategory: text("prompt_category").notNull(), // Category of the prompt
  responseType: text("response_type").notNull(), // Type of response (e.g., advice, analysis)
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }), // Average star rating
  helpfulCount: integer("helpful_count").default(0), // Count of helpful responses
  unhelpfulCount: integer("unhelpful_count").default(0), // Count of unhelpful responses
  savedCount: integer("saved_count").default(0), // Times saved to career plan
  careerStage: text("career_stage"), // Target career stage (entry, mid, senior)
  industry: text("industry"), // Target industry
  mostCommonFeedback: jsonb("most_common_feedback").default("[]"), // Top feedback themes
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schema for FeedbackAnalytics
export const insertFeedbackAnalyticsSchema = createInsertSchema(feedbackAnalytics).omit({
  id: true,
  updatedAt: true
});

// Export types for Feedback
export type MuskFeedback = typeof muskFeedbacks.$inferSelect;
export type InsertMuskFeedback = z.infer<typeof insertMuskFeedbackSchema>;
export type FeedbackAnalytics = typeof feedbackAnalytics.$inferSelect;
export type InsertFeedbackAnalytics = z.infer<typeof insertFeedbackAnalyticsSchema>;

// Skill trend data for job market analysis
export const skillTrends = pgTable("skill_trends", {
  id: serial("id").primaryKey(),
  skillName: text("skill_name").notNull(),
  industry: text("industry").notNull(),
  category: text("category").notNull(), // e.g., "technical", "soft", "domain"
  growthRate: decimal("growth_rate", { precision: 5, scale: 2 }).notNull(), // Percentage growth over period
  demandScore: integer("demand_score").notNull(), // 1-100 scale
  timeFrame: text("time_frame").notNull(), // e.g., "6_months", "1_year", "3_years"
  dataSource: text("data_source"), // e.g., "linkedin", "indeed", "stackoverflow"
  jobCount: integer("job_count"), // Number of jobs requiring this skill
  avgSalaryImpact: integer("avg_salary_impact"), // Salary boost this skill provides
  relatedSkills: jsonb("related_skills").default("[]"), // Related skills as array
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert schema for SkillTrends
export const insertSkillTrendSchema = createInsertSchema(skillTrends).omit({
  id: true,
  updatedAt: true
});

// Career paths and job roles
export const careerPathNodes = pgTable("career_path_nodes", {
  id: serial("id").primaryKey(),
  jobTitle: text("job_title").notNull(),
  industry: text("industry").notNull(),
  level: text("level").notNull(), // e.g., "entry", "mid", "senior", "executive"
  avgSalary: integer("avg_salary"),
  requiredSkills: jsonb("required_skills").default("[]"), // Required skills array
  recommendedSkills: jsonb("recommended_skills").default("[]"), // Recommended skills array
  jobDescription: text("job_description"),
  growthOutlook: text("growth_outlook"), // e.g., "growing", "stable", "declining"
  entryBarrier: text("entry_barrier"), // e.g., "low", "medium", "high"
  commonPathways: jsonb("common_pathways").default("{}"), // Previous and next common roles
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert schema for CareerPathNodes
export const insertCareerPathNodeSchema = createInsertSchema(careerPathNodes).omit({
  id: true,
  updatedAt: true
});

// Career transitions between roles
export const careerTransitions = pgTable("career_transitions", {
  id: serial("id").primaryKey(),
  fromNodeId: integer("from_node_id").notNull().references(() => careerPathNodes.id),
  toNodeId: integer("to_node_id").notNull().references(() => careerPathNodes.id),
  transitionDifficulty: text("transition_difficulty").notNull(), // e.g., "easy", "moderate", "difficult"
  skillGaps: jsonb("skill_gaps").default("[]"), // Skills needed to make the transition
  avgTransitionTime: integer("avg_transition_time"), // In months
  recommendedSteps: jsonb("recommended_steps").default("[]"), // Steps to make the transition
  successRate: integer("success_rate"), // Percentage of people who make this transition
  updatedAt: timestamp("updated_at").defaultNow()
});

// Insert schema for CareerTransitions
export const insertCareerTransitionSchema = createInsertSchema(careerTransitions).omit({
  id: true,
  updatedAt: true
});

// Export types for Trend Graph and Job Graph
export type SkillTrend = typeof skillTrends.$inferSelect;
export type InsertSkillTrend = z.infer<typeof insertSkillTrendSchema>;
export type CareerPathNode = typeof careerPathNodes.$inferSelect;
export type InsertCareerPathNode = z.infer<typeof insertCareerPathNodeSchema>;
export type CareerTransition = typeof careerTransitions.$inferSelect;
export type InsertCareerTransition = z.infer<typeof insertCareerTransitionSchema>;

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

// Quest status enum (simplified)
export const questStatusEnum = pgEnum("quest_status", [
  "active",
  "completed",
  "expired"
  // Removed "dismissed" status (quest dismissal functionality removed)
]);

// Mentorship request status enum
export const mentorshipStatusEnum = pgEnum("mentorship_status", [
  "pending",
  "accepted",
  "declined",
  "expired",
  "completed"
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

// Quests definition model - stores templates for quests (simplified version)
export const questDefinitions = pgTable("quest_definitions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: questTypeEnum("type").notNull(),
  targetCount: integer("target_count").notNull().default(1), // Number of actions needed to complete
  targetAction: text("target_action").notNull(), // Specific action required for engagement quests
  xpReward: integer("xp_reward").notNull().default(50),
  badgeReward: badgeTypeEnum("badge_reward"),
  muskTip: text("musk_tip"), // Tip from Musk about this quest
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
  // Removed unused fields:
  // - requiredProfileCompletion
  // - requiredCareerStage
  // - requiredIndustry
});

// User quests model - tracks active and completed quests for each user (simplified version)
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
  xpEarned: integer("xp_earned"), // Actual XP earned upon completion
  badgeEarned: badgeTypeEnum("badge_earned"), // Badge earned upon completion
  muskResponse: text("musk_response"), // Custom response from Musk on completion
  // Removed field:
  // - dismissedReason (quest dismissal functionality removed)
});

// User XP model - tracks user XP balance and history (simplified version)
export const userXp = pgTable("user_xp", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  balance: integer("balance").notNull().default(0), // Current XP balance
  lifetimeEarned: integer("lifetime_earned").notNull().default(0), // Total XP earned all-time
  lastEarnedAt: timestamp("last_earned_at"), // Last time XP was earned
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // Removed unused fields:
  // - currentMonthEarned (monthly XP tracking removed)
  // - lastResetAt (monthly XP resets removed)
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

// Mentorship Connect Feature
// Mentorship requests table - tracks mentorship requests between users
export const mentorshipRequests = pgTable("mentorship_requests", {
  id: serial("id").primaryKey(),
  menteeId: integer("mentee_id").references(() => users.id).notNull(), // User requesting mentorship
  mentorId: integer("mentor_id").references(() => users.id).notNull(), // User being asked to mentor
  message: text("message"), // Custom message from mentee (300 chars max)
  status: mentorshipStatusEnum("status").notNull().default("pending"),
  requestedAt: timestamp("requested_at").defaultNow(),
  respondedAt: timestamp("responded_at"), // When the request was accepted/declined
  startDate: timestamp("start_date"), // When the mentorship started (if accepted)
  endDate: timestamp("end_date"), // When the mentorship ends (30 days after acceptance)
  declineReason: text("decline_reason"), // Optional reason for declining
  isFeedbackRequested: boolean("is_feedback_requested").default(false), // Whether feedback has been requested
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mentorship feedback table - tracks feedback for completed mentorships
export const mentorshipFeedback = pgTable("mentorship_feedback", {
  id: serial("id").primaryKey(), 
  mentorshipId: integer("mentorship_id").references(() => mentorshipRequests.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(), // User giving feedback
  rating: integer("rating").notNull(), // 1-5 star rating
  positiveNotes: text("positive_notes"), // What went well
  improvementNotes: text("improvement_notes"), // What could be improved
  wouldRepeat: boolean("would_repeat").default(false), // Whether they would mentor/be mentored again
  isPublic: boolean("is_public").default(false), // Whether feedback can be shown publicly
  providedAt: timestamp("provided_at").defaultNow(),
});

// Insert schemas for Mentorship Connect
export const insertMentorshipRequestSchema = createInsertSchema(mentorshipRequests).omit({
  id: true,
  status: true,
  requestedAt: true,
  respondedAt: true,
  startDate: true,
  endDate: true,
  isFeedbackRequested: true,
  createdAt: true,
  updatedAt: true
});

export const insertMentorshipFeedbackSchema = createInsertSchema(mentorshipFeedback).omit({
  id: true,
  providedAt: true
});

// Export types for Mentorship Connect
export type MentorshipRequest = typeof mentorshipRequests.$inferSelect;
export type InsertMentorshipRequest = z.infer<typeof insertMentorshipRequestSchema>;

// Career Capsule Feature (formerly Career Roadmap)
// This feature allows users to set 1-5 year career goals and receive AI-generated
// milestones/steps with timeline to achieve those goals.

// Career Capsule enums for goal types
export const careerGoalTypeEnum = pgEnum("career_goal_type", [
  "position_change", // e.g., "Become a Product Manager"
  "skill_acquisition", // e.g., "Master AI/ML"
  "promotion", // e.g., "Get promoted to VP-level"
  "industry_switch", // e.g., "Move from Finance to Tech"
  "entrepreneurship", // e.g., "Launch my own agency"
  "relocation", // e.g., "Work remotely in Canada"
  "education", // e.g., "Get an MBA"
  "certification", // e.g., "Get certified in data science"
  "custom" // Custom user-defined goal
]);

// Status enum for career goals
export const goalStatusEnum = pgEnum("goal_status", [
  "not_started", // Just created, no progress
  "in_progress", // Some milestones completed
  "completed", // All milestones completed
  "abandoned" // User decided to abandon this goal
]);

// Career Goal model - parent container for the capsule
export const careerGoals = pgTable("career_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  goalType: careerGoalTypeEnum("goal_type").notNull(),
  timeframe: integer("timeframe").notNull().default(5), // 1-5 years
  description: text("description"),
  targetIndustry: text("target_industry"), // Target industry for the goal
  targetRole: text("target_role"), // Target role/position
  currentSkills: jsonb("current_skills").default("[]"), // Skills the user currently has
  requiredSkills: jsonb("required_skills").default("[]"), // Skills needed to achieve the goal
  status: goalStatusEnum("status").default("not_started"),
  progress: integer("progress").default(0), // 0-100%
  isPrivate: boolean("is_private").default(true),
  isMuskGenerated: boolean("is_musk_generated").default(true), // Whether AI helped create the capsule
  startDate: timestamp("start_date").defaultNow(),
  targetDate: timestamp("target_date"), // Estimated completion date
  lastUpdated: timestamp("last_updated").defaultNow()
});

// Goal Milestone model - key achievements/steps toward the goal
export const goalMilestones = pgTable("goal_milestones", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => careerGoals.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category"), // e.g., "skill", "networking", "education", "certification"
  timeframeMonths: integer("timeframe_months"), // When this should be completed (in months from start)
  isCompleted: boolean("is_completed").default(false),
  completedDate: timestamp("completed_date"), // When the milestone was completed
  priority: integer("priority").default(2), // 1 (low) to 3 (high)
  difficulty: integer("difficulty").default(2), // 1 (easy) to 3 (hard)
  muskTips: text("musk_tips"), // AI tips on how to accomplish this milestone
  resources: jsonb("resources").default("[]"), // Relevant resources (links, courses, etc.)
  createdAt: timestamp("created_at").defaultNow()
});

// Goal Skills model - specific skills to acquire for the goal
export const goalSkills = pgTable("goal_skills", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => careerGoals.id).notNull(),
  name: text("name").notNull(),
  importance: integer("importance").default(3), // 1-5 scale
  currentLevel: integer("current_level").default(0), // 0-100
  targetLevel: integer("target_level").default(80), // 0-100
  learningResources: jsonb("learning_resources").default("[]"), // Resources for learning this skill
  timeToAcquire: integer("time_to_acquire"), // Estimated time in months
  isAcquired: boolean("is_acquired").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

// Progress Log model - for users to track progress and reflections
export const goalProgressLogs = pgTable("goal_progress_logs", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => careerGoals.id).notNull(),
  title: text("title").notNull().default("Progress Update"),
  content: text("content").notNull(),
  sentiment: text("sentiment"), // e.g., "positive", "neutral", "challenged"
  milestoneId: integer("milestone_id").references(() => goalMilestones.id), // Optional related milestone
  logDate: timestamp("log_date").defaultNow(),
  isPrivate: boolean("is_private").default(true)
});

// Insert schemas for Career Capsule
export const insertCareerGoalSchema = createInsertSchema(careerGoals).omit({
  id: true,
  progress: true,
  startDate: true,
  lastUpdated: true
});

export const insertGoalMilestoneSchema = createInsertSchema(goalMilestones).omit({
  id: true,
  isCompleted: true,
  completedDate: true,
  createdAt: true
});

export const insertGoalSkillSchema = createInsertSchema(goalSkills).omit({
  id: true,
  isAcquired: true,
  createdAt: true,
  updatedAt: true
});

export const insertGoalProgressLogSchema = createInsertSchema(goalProgressLogs).omit({
  id: true,
  logDate: true
});

// Export types for Career Capsule
export type CareerGoal = typeof careerGoals.$inferSelect;
export type InsertCareerGoal = z.infer<typeof insertCareerGoalSchema>;

export type GoalMilestone = typeof goalMilestones.$inferSelect;
export type InsertGoalMilestone = z.infer<typeof insertGoalMilestoneSchema>;

export type GoalSkill = typeof goalSkills.$inferSelect;
export type InsertGoalSkill = z.infer<typeof insertGoalSkillSchema>;

export type GoalProgressLog = typeof goalProgressLogs.$inferSelect;
export type InsertGoalProgressLog = z.infer<typeof insertGoalProgressLogSchema>;

export type MentorshipFeedback = typeof mentorshipFeedback.$inferSelect;
export type InsertMentorshipFeedback = z.infer<typeof insertMentorshipFeedbackSchema>;

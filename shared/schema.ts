import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
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
  message: text("message").notNull(),
  sender: text("sender").notNull(), // user or ai
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

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, emailVerified: true, emailVerificationToken: true, emailVerificationExpires: true });
export const insertResumeSchema = createInsertSchema(resumes).omit({ id: true, uploadedAt: true });
export const insertWorkExperienceSchema = createInsertSchema(workExperiences).omit({ id: true });
export const insertEducationSchema = createInsertSchema(educations).omit({ id: true });
export const insertSkillSchema = createInsertSchema(skills).omit({ id: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
export const insertOtpVerificationSchema = createInsertSchema(otpVerifications).omit({ id: true, verified: true, createdAt: true });
export const insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({ id: true, verified: true, createdAt: true });

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

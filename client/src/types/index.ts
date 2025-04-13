import { WorkExperience as SchemaWorkExperience, Education as SchemaEducation, Service as SchemaService, Skill as SchemaSkill } from "@shared/schema";

// Type aliases for compatibility with existing components
export type UserExperience = SchemaWorkExperience;
export type UserEducation = SchemaEducation;

// Firebase user type definition
export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
};

// User info type for components
export type UserInfo = {
  name: string;
  title: string | null;
  industry: string | null;
  domain: string | null;
  location: string | null;
  email: string | null;
  photoURL: string | null;
  lookingFor: string | null;
  jobLevel: string | null;
};

// Extended types for portfolio templates
export interface ProjectFull {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  startDate: string;
  createdAt: string | null;
  projectUrl: string | null;
  category: string | null;
  thumbnailUrl: string | null;
  thumbnailFile: string | null;
  mediaUrls: string[];
  updatedAt: string | null;
}

export type Skill = SchemaSkill;
export type WorkExperience = SchemaWorkExperience;
export type Education = SchemaEducation;
export type Service = SchemaService;
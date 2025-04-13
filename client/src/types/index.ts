import { WorkExperience, Education } from "@shared/schema";

// Type aliases for compatibility with existing components
export type UserExperience = WorkExperience;
export type UserEducation = Education;

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
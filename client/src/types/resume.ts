/**
 * Resume type definitions
 */

export type ResumeTheme = 
  | 'professional'
  | 'creative'
  | 'minimal'
  | 'technical'
  | 'executive'
  | 'minimalist_pro'
  | 'timeline'
  | 'visual_expert'
  | 'freelancer_hub'
  | 'scholar'
  | 'animated'
  | 'dynamic_innovator';

export type ResumeVisibility = 'private' | 'connections' | 'public';

export interface Resume {
  id: number;
  userId: number;
  fileName: string;
  fileData: string; 
  score?: number;
  uploadedAt: Date;
  isShadowResume: boolean;
  themeStyle: ResumeTheme;
  isDownloadable: boolean;
  lastUpdatedByMusk?: Date;
  visibility: ResumeVisibility;
  // The form property contains the saved form data from the Resume Editor
  form?: {
    personalInfo?: {
      fullName?: string;
      title?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      website?: string;
      summary?: string;
    };
    experiences?: {
      experiences?: Array<{
        title?: string;
        position?: string;
        company?: string;
        location?: string;
        startDate?: string;
        endDate?: string | null;
        description?: string;
        industry?: string;
        domain?: string;
        responsibilities?: string[];
      }>;
    };
    education?: {
      educations?: Array<{
        degree?: string;
        institution?: string;
        location?: string;
        fieldOfStudy?: string;
        startDate?: string;
        endDate?: string | null;
        gpa?: string;
        description?: string;
        industry?: string;
        domain?: string;
        skillsAcquired?: string[];
      }>;
    };
    skills?: {
      skills?: Array<string | {
        name: string;
        level?: string;
        category?: string;
      }>;
    };
    projects?: {
      projects?: Array<{
        title?: string;
        description?: string;
        startDate?: string;
        endDate?: string | null;
        category?: string;
        industry?: string;
        projectUrl?: string;
        thumbnailUrl?: string;
        technologies?: string[];
      }>;
    };
  };
}

export interface ShadowResume {
  id: number;
  userId: number;
  resumeId?: number; 
  content: ResumeContent;
  suggestions: ResumeSuggestion[];
  history: ResumeHistoryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeContent {
  summary: string;
  workExperiences: ResumeWorkExperience[];
  educations: ResumeEducation[];
  skills: ResumeSkill[];
  certifications: ResumeCertification[];
  achievements: string[];
  projects: ResumeProject[];
  languages: ResumeLanguage[];
  interests: string[];
  contactInfo: ResumeContactInfo;
}

export interface ResumeWorkExperience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  description: string;
  bullets: string[];
  skills: string[];
  achievements: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  highlights?: string[];
}

export interface ResumeSkill {
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  category?: string;
}

export interface ResumeCertification {
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
  url?: string;
}

export interface ResumeProject {
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  url?: string;
  skills: string[];
  highlights: string[];
}

export interface ResumeLanguage {
  name: string;
  proficiency: 'Elementary' | 'Limited Working' | 'Professional Working' | 'Full Professional' | 'Native';
}

export interface ResumeContactInfo {
  email: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface ResumeSuggestion {
  id: string;
  sectionType: 'summary' | 'experience' | 'education' | 'skills' | 'certifications' | 'projects';
  content: string;
  reason: string;
  source?: string;
  timestamp: Date;
  accepted: boolean;
}

export interface ResumeHistoryItem {
  id: string;
  timestamp: Date;
  changes: ResumeChange[];
  version: number;
}

export interface ResumeChange {
  type: 'added' | 'removed' | 'modified';
  sectionType: string;
  before?: string;
  after?: string;
  description: string;
}
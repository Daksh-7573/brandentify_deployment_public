export interface UserBasicInfo {
  id?: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  photoURL: string | null;
  title: string | null;
  company: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  brandName: string | null;
  lookingFor: string | null;
}

export interface UserProfessionalBrand {
  tagline: string | null;
  visionStatement: string | null;
  missionStatement: string | null;
  coreValues: string[] | null;
  uniqueValueProposition: string | null;
}

export interface UserAudienceInfo {
  primaryAudience: string[] | null;
  secondaryAudience: string[] | null;
  whatIOffer: string | null;
}

export interface SkillData {
  id: number;
  skillName: string;
  proficiencyLevel: string | null;
  proficiency?: number | null;
  category?: string | null;
  yearsOfExperience?: number | null;
}

export interface ExperienceData {
  id: number;
  title: string;
  company: string;
  startDate: string;
  endDate?: string | null;
  description?: string | null;
  location?: string | null;
  industry?: string | null;
  domain?: string | null;
  keyResponsibilities?: string[];
}

export interface EducationData {
  id: number;
  institution: string;
  degree: string;
  fieldOfStudy?: string | null;
  startDate: string;
  endDate?: string | null;
  location?: string | null;
  industry?: string | null;
  domain?: string | null;
  skillsAcquired?: string[];
}

export interface ProjectData {
  id: number;
  title: string;
  description: string | null;
  projectUrl?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  category?: string | null;
  industry?: string | null;
  domain?: string | null;
  thumbnailUrl?: string | null;
  mediaUrls?: string[];
  clientEndorsement?: string | null;
  technologies?: string[];
  outcome?: string | null;
  impact?: string | null;
  role?: string | null;
  teamSize?: number | null;
  collaborators?: { name: string; photoURL?: string; profileLink?: string }[];
  endorsements?: { clientName: string; photoURL?: string; profileLink?: string; message?: string }[];
}

export interface ServiceData {
  id: number;
  title: string;
  description: string | null;
  icon?: string | null;
  price?: string | null;
  priceInr?: string | null;
  priceUsd?: string | null;
  priceType?: string | null;
  deliveryTime?: string | null;
  isActive: boolean;
}

export interface ExtractedProfileData {
  basicInfo: UserBasicInfo;
  professionalBrand: UserProfessionalBrand;
  audienceInfo: UserAudienceInfo;
  skills: SkillData[];
  experiences: ExperienceData[];
  educations: EducationData[];
  projects: ProjectData[];
  services: ServiceData[];
  currentUserId?: number;
}

export interface PortfolioSection {
  id: string;
  name: string;
  required: boolean;
  order: number;
  visible: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  sections: PortfolioSection[];
  supportedFeatures: {
    animations: boolean;
    parallax: boolean;
    modals: boolean;
    services: boolean;
  };
}

export interface ProfileCompletionResult {
  overallScore: number;
  sectionScores: {
    section: string;
    score: number;
    filled: number;
    total: number;
    missingFields: string[];
  }[];
  suggestions: string[];
}

// Define user information type
export interface UserInfo {
  name: string | null;
  title: string | null;
  industry: string | null;
  domain: string | null;
  location: string | null;
  email: string | null;
  photoURL: string | null;
  lookingFor: string | null;
  jobLevel: string | null;
}

// Define user skill type 
export interface UserSkill {
  id: number;
  userId: number;
  name: string;
  level: string;
  proficiency: number;
}

// Define user experience type
export interface UserExperience {
  id: number;
  userId: number;
  title: string;
  company: string;
  industry: string;
  domain: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current?: boolean;
  description: string;
}

// Define user project type
export interface UserProject {
  id: number;
  userId: number;
  title: string | null;
  description: string | null;
  startDate?: string;
  createdAt?: string | null;
  projectUrl?: string | null;
  category?: string | null;
  thumbnailUrl?: string | null;
  thumbnailFile?: string | null;
  mediaUrls?: string[];
  updatedAt?: string | null;
}

// Define user service type
export interface UserService {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  category: string;
  priceInr: number | null;
  priceUsd: number | null;
  isHourly: boolean;
  features: string | null; // JSONB column stored as string
  imageUrl: string | null;
  order: number | null;
  isActive: boolean;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Define user education type
export interface UserEducation {
  id: number;
  userId: number;
  institution: string;
  degree: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
}
export interface WorkExperience {
  id: number;
  userId: number;
  title: string;
  company: string;
  location: string | null;
  industry: string | null;
  domain: string | null;
  startDate: string;
  endDate: string | null;
  description: string | null;
  keyResponsibilities: string[];
}

export interface Education {
  id: number;
  userId: number;
  institution: string;
  degree: string;
  fieldOfStudy: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  industry: string | null;
  domain: string | null;
  skillsAcquired: any;
}
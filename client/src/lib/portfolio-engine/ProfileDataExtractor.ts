import type {
  ExtractedProfileData,
  UserBasicInfo,
  UserProfessionalBrand,
  UserAudienceInfo,
  UserAboutMe,
  SkillData,
  ExperienceData,
  EducationData,
  ProjectData,
  ServiceData,
} from './types';

function parseJsonArray(value: any): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    if (value.startsWith('{') && value.endsWith('}')) {
      const content = value.slice(1, -1);
      if (!content) return [];
      return content.split(',').map(item => item.replace(/^"|"$/g, '').trim());
    }
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function extractBasicInfo(userData: any): UserBasicInfo {
  return {
    id: userData?.id,
    name: userData?.name || 'Professional',
    email: userData?.email || '',
    phoneNumber: userData?.phoneNumber || null,
    photoURL: userData?.photoURL || null,
    title: userData?.title || null,
    company: userData?.company || null,
    location: userData?.location || null,
    industry: userData?.industry || null,
    domain: userData?.domain || null,
    brandName: userData?.brandName || null,
  };
}

export function extractProfessionalBrand(userData: any): UserProfessionalBrand {
  return {
    tagline: userData?.tagline || null,
    visionStatement: userData?.visionStatement || null,
    missionStatement: userData?.missionStatement || null,
    coreValues: parseJsonArray(userData?.coreValues),
    uniqueValueProposition: userData?.uniqueValueProposition || null,
  };
}

export function extractAudienceInfo(userData: any): UserAudienceInfo {
  return {
    primaryAudience: parseJsonArray(userData?.primaryAudience),
    secondaryAudience: parseJsonArray(userData?.secondaryAudience),
    lookingFor: userData?.lookingFor || null,
    whatIOffer: userData?.whatIOffer || null,
  };
}

export function extractAboutMe(userData: any): UserAboutMe {
  return {
    aboutMe: userData?.aboutMe || null,
    jobLevel: userData?.jobLevel || null,
  };
}

export function extractSkills(skillsData: any[]): SkillData[] {
  if (!Array.isArray(skillsData)) return [];
  return skillsData.map(skill => ({
    id: skill.id,
    skillName: skill.name || skill.skillName || '',
    proficiencyLevel: skill.level || skill.proficiencyLevel || null,
    proficiency: skill.proficiency || null,
  }));
}

export function extractExperiences(experiencesData: any[]): ExperienceData[] {
  if (!Array.isArray(experiencesData)) return [];
  return experiencesData.map(exp => ({
    id: exp.id,
    title: exp.title || '',
    company: exp.company || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || null,
    description: exp.description || null,
    location: exp.location || null,
    industry: exp.industry || null,
    domain: exp.domain || null,
    keyResponsibilities: parseJsonArray(exp.keyResponsibilities),
  }));
}

export function extractEducations(educationsData: any[]): EducationData[] {
  if (!Array.isArray(educationsData)) return [];
  return educationsData.map(edu => ({
    id: edu.id,
    institution: edu.institution || '',
    degree: edu.degree || '',
    fieldOfStudy: edu.fieldOfStudy || null,
    startDate: edu.startDate || '',
    endDate: edu.endDate || null,
    location: edu.location || null,
    skillsAcquired: parseJsonArray(edu.skillsAcquired),
  }));
}

export function extractProjects(projectsData: any[]): ProjectData[] {
  if (!Array.isArray(projectsData)) return [];
  return projectsData.map(proj => ({
    id: proj.id,
    title: proj.title || '',
    description: proj.description || null,
    projectUrl: proj.projectUrl || proj.link || null,
    startDate: proj.startDate || null,
    category: proj.category || null,
    industry: proj.industry || null,
    thumbnailUrl: proj.thumbnailUrl || proj.imageUrl || null,
    mediaUrls: parseJsonArray(proj.mediaUrls),
    clientEndorsement: proj.clientEndorsement || null,
  }));
}

export function extractServices(servicesData: any[]): ServiceData[] {
  if (!Array.isArray(servicesData)) return [];
  return servicesData.map(service => ({
    id: service.id,
    title: service.title || '',
    description: service.description || null,
    icon: service.icon || null,
    price: service.price || null,
    priceType: service.priceType || null,
    deliveryTime: service.deliveryTime || null,
  }));
}

export function extractAllProfileData(
  userData: any,
  collections: {
    skills?: any[];
    experiences?: any[];
    educations?: any[];
    projects?: any[];
    services?: any[];
  },
  currentUserId?: number
): ExtractedProfileData {
  return {
    basicInfo: extractBasicInfo(userData),
    professionalBrand: extractProfessionalBrand(userData),
    audienceInfo: extractAudienceInfo(userData),
    aboutMe: extractAboutMe(userData),
    skills: extractSkills(collections.skills || []),
    experiences: extractExperiences(collections.experiences || []),
    educations: extractEducations(collections.educations || []),
    projects: extractProjects(collections.projects || []),
    services: extractServices(collections.services || []),
    currentUserId,
  };
}

export class ProfileDataExtractor {
  private userData: any;
  private collections: {
    skills?: any[];
    experiences?: any[];
    educations?: any[];
    projects?: any[];
    services?: any[];
  };
  private currentUserId?: number;

  constructor(
    userData: any,
    collections: {
      skills?: any[];
      experiences?: any[];
      educations?: any[];
      projects?: any[];
      services?: any[];
    },
    currentUserId?: number
  ) {
    this.userData = userData;
    this.collections = collections;
    this.currentUserId = currentUserId;
  }

  extract(): ExtractedProfileData {
    return extractAllProfileData(this.userData, this.collections, this.currentUserId);
  }

  getBasicInfo(): UserBasicInfo {
    return extractBasicInfo(this.userData);
  }

  getProfessionalBrand(): UserProfessionalBrand {
    return extractProfessionalBrand(this.userData);
  }

  getAudienceInfo(): UserAudienceInfo {
    return extractAudienceInfo(this.userData);
  }

  getAboutMe(): UserAboutMe {
    return extractAboutMe(this.userData);
  }

  getSkills(): SkillData[] {
    return extractSkills(this.collections.skills || []);
  }

  getExperiences(): ExperienceData[] {
    return extractExperiences(this.collections.experiences || []);
  }

  getEducations(): EducationData[] {
    return extractEducations(this.collections.educations || []);
  }

  getProjects(): ProjectData[] {
    return extractProjects(this.collections.projects || []);
  }

  getServices(): ServiceData[] {
    return extractServices(this.collections.services || []);
  }
}

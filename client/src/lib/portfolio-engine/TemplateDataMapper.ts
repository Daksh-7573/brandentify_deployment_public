import type { ExtractedProfileData, TemplateConfig, PortfolioSection } from './types';

const DEFAULT_SECTIONS: PortfolioSection[] = [
  { id: 'hero', name: 'Hero', required: true, order: 1, visible: true },
  { id: 'about', name: 'About', required: false, order: 2, visible: true },
  { id: 'professional-brand', name: 'Professional Brand', required: false, order: 3, visible: true },
  { id: 'audience', name: 'Target Audience', required: false, order: 4, visible: true },
  { id: 'services', name: 'Services', required: false, order: 5, visible: true },
  { id: 'skills', name: 'Skills', required: false, order: 6, visible: true },
  { id: 'projects', name: 'Projects', required: false, order: 7, visible: true },
  { id: 'experience', name: 'Experience', required: false, order: 8, visible: true },
  { id: 'education', name: 'Education', required: false, order: 9, visible: true },
  { id: 'contact', name: 'Contact', required: false, order: 10, visible: true },
];

export const TEMPLATE_CONFIGS: Record<string, TemplateConfig> = {
  'timeline-storyteller-2': {
    id: 'timeline-storyteller-2',
    name: 'Timeline Storyteller',
    sections: [
      { id: 'hero', name: 'Hero', required: true, order: 1, visible: true },
      { id: 'professional-brand', name: 'Professional Brand', required: false, order: 2, visible: true },
      { id: 'audience', name: 'Target Audience', required: false, order: 3, visible: true },
      { id: 'services', name: 'Services', required: false, order: 4, visible: true },
      { id: 'skills', name: 'Skills & Expertise', required: false, order: 5, visible: true },
      { id: 'projects', name: 'Projects', required: false, order: 6, visible: true },
      { id: 'experience', name: 'Professional Journey', required: false, order: 7, visible: true },
      { id: 'education', name: 'Academic Path', required: false, order: 8, visible: true },
      { id: 'contact', name: 'Contact CTA', required: false, order: 9, visible: true },
    ],
    supportedFeatures: { animations: true, parallax: true, modals: true, services: true },
  },
  'corporate-executive': {
    id: 'corporate-executive',
    name: 'Corporate Executive',
    sections: DEFAULT_SECTIONS,
    supportedFeatures: { animations: true, parallax: false, modals: true, services: true },
  },
  'creative-bold': {
    id: 'creative-bold',
    name: 'Creative Bold',
    sections: DEFAULT_SECTIONS,
    supportedFeatures: { animations: true, parallax: true, modals: true, services: true },
  },
  'holographic-neo': {
    id: 'holographic-neo',
    name: 'Holographic Neo',
    sections: DEFAULT_SECTIONS,
    supportedFeatures: { animations: true, parallax: true, modals: true, services: true },
  },
  'creative-quantum': {
    id: 'creative-quantum',
    name: 'Creative Quantum',
    sections: DEFAULT_SECTIONS,
    supportedFeatures: { animations: true, parallax: true, modals: true, services: true },
  },
  'artistic-portfolio': {
    id: 'artistic-portfolio',
    name: 'Artistic Portfolio',
    sections: DEFAULT_SECTIONS,
    supportedFeatures: { animations: true, parallax: true, modals: true, services: true },
  },
};

export function getTemplateConfig(templateId: string): TemplateConfig {
  return TEMPLATE_CONFIGS[templateId] || {
    id: templateId,
    name: templateId,
    sections: DEFAULT_SECTIONS,
    supportedFeatures: { animations: true, parallax: false, modals: true, services: true },
  };
}

export function mapToTemplateProps(data: ExtractedProfileData): {
  userInfo: {
    id?: number;
    name: string;
    email: string | null;
    title: string;
    company: string | null;
    location: string | null;
    industry: string | null;
    domain: string | null;
    lookingFor: string | null;
    whatIOffer: string | null;
    photoURL: string | null;
    tagline?: string | null;
    visionStatement?: string | null;
    missionStatement?: string | null;
    coreValues?: string[] | null;
    uniqueValueProposition?: string | null;
  };
  userSkills: any[];
  userExperiences: any[];
  userProjects: any[];
  userEducations: any[];
  userServices: any[];
  currentUserId?: number;
} {
  return {
    userInfo: {
      id: data.basicInfo.id,
      name: data.basicInfo.name,
      email: data.basicInfo.email,
      title: data.basicInfo.title || '',
      company: data.basicInfo.company,
      location: data.basicInfo.location,
      industry: data.basicInfo.industry,
      domain: data.basicInfo.domain,
      lookingFor: data.basicInfo.lookingFor,
      whatIOffer: data.audienceInfo.whatIOffer,
      photoURL: data.basicInfo.photoURL,
      tagline: data.professionalBrand.tagline,
      visionStatement: data.professionalBrand.visionStatement,
      missionStatement: data.professionalBrand.missionStatement,
      coreValues: data.professionalBrand.coreValues,
      uniqueValueProposition: data.professionalBrand.uniqueValueProposition,
    },
    userSkills: data.skills.map(skill => ({
      id: skill.id,
      name: skill.skillName,
      skillName: skill.skillName,
      level: skill.proficiencyLevel,
      proficiencyLevel: skill.proficiencyLevel,
      proficiency: skill.proficiency,
    })),
    userExperiences: data.experiences.map(exp => ({
      id: exp.id,
      title: exp.title,
      company: exp.company,
      startDate: exp.startDate,
      endDate: exp.endDate,
      description: exp.description,
      location: exp.location,
      industry: exp.industry,
      domain: exp.domain,
      keyResponsibilities: exp.keyResponsibilities,
    })),
    userProjects: data.projects.map(proj => ({
      id: proj.id,
      title: proj.title,
      description: proj.description,
      projectUrl: proj.projectUrl,
      startDate: proj.startDate,
      endDate: proj.endDate,
      category: proj.category,
      industry: proj.industry,
      thumbnailUrl: proj.thumbnailUrl,
      mediaUrls: proj.mediaUrls,
    })),
    currentUserId: data.currentUserId,
  };
}

export function shouldShowSection(
  sectionId: string,
  data: ExtractedProfileData,
  templateConfig: TemplateConfig
): boolean {
  const section = templateConfig.sections.find(s => s.id === sectionId);
  if (!section || !section.visible) return false;

  switch (sectionId) {
    case 'hero':
      return true;
    case 'about':
      return false; // Removed aboutMe section
    case 'professional-brand':
      return !!(
        data.professionalBrand.visionStatement ||
        data.professionalBrand.missionStatement ||
        (data.professionalBrand.coreValues && data.professionalBrand.coreValues.length > 0) ||
        data.professionalBrand.uniqueValueProposition
      );
    case 'audience':
      return false; // Specifically requested to not show Primary/Secondary audience
    case 'services':
      return data.services.length > 0;
    case 'skills':
      return data.skills.length > 0;
    case 'projects':
      return data.projects.length > 0;
    case 'experience':
      return data.experiences.length > 0;
    case 'education':
      return data.educations.length > 0;
    case 'contact':
      return false; // Requested not to show contact details (Email/Phone)
    default:
      return true;
  }
}

export class TemplateDataMapper {
  private data: ExtractedProfileData;
  private templateId: string;
  private config: TemplateConfig;

  constructor(data: ExtractedProfileData, templateId: string) {
    this.data = data;
    this.templateId = templateId;
    this.config = getTemplateConfig(templateId);
  }

  getTemplateProps() {
    return mapToTemplateProps(this.data);
  }

  getConfig(): TemplateConfig {
    return this.config;
  }

  getVisibleSections(): PortfolioSection[] {
    return this.config.sections.filter(section =>
      shouldShowSection(section.id, this.data, this.config)
    );
  }

  shouldShowSection(sectionId: string): boolean {
    return shouldShowSection(sectionId, this.data, this.config);
  }
}

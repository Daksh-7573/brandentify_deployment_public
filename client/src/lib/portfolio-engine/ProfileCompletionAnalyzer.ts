import type { ExtractedProfileData, ProfileCompletionResult } from './types';

interface SectionWeight {
  name: string;
  weight: number;
  fields: { name: string; path: string; required: boolean }[];
}

const SECTION_WEIGHTS: SectionWeight[] = [
  {
    name: 'Basic Information',
    weight: 25,
    fields: [
      { name: 'Name', path: 'basicInfo.name', required: true },
      { name: 'Email', path: 'basicInfo.email', required: true },
      { name: 'Photo', path: 'basicInfo.photoURL', required: false },
      { name: 'Title', path: 'basicInfo.title', required: true },
      { name: 'Company', path: 'basicInfo.company', required: false },
      { name: 'Location', path: 'basicInfo.location', required: false },
      { name: 'Industry', path: 'basicInfo.industry', required: false },
      { name: 'Domain', path: 'basicInfo.domain', required: false },
    ],
  },
  {
    name: 'Professional Brand',
    weight: 20,
    fields: [
      { name: 'Tagline', path: 'professionalBrand.tagline', required: false },
      { name: 'Vision Statement', path: 'professionalBrand.visionStatement', required: false },
      { name: 'Mission Statement', path: 'professionalBrand.missionStatement', required: false },
      { name: 'Core Values', path: 'professionalBrand.coreValues', required: false },
      { name: 'Unique Value Proposition', path: 'professionalBrand.uniqueValueProposition', required: false },
    ],
  },
  {
    name: 'Target Audience',
    weight: 10,
    fields: [
      { name: 'Looking For', path: 'basicInfo.lookingFor', required: false },
    ],
  },
  {
    name: 'About Me',
    weight: 10,
    fields: [
      { name: 'About Me', path: 'aboutMe.aboutMe', required: false },
    ],
  },
  {
    name: 'Skills',
    weight: 10,
    fields: [
      { name: 'Skills List', path: 'skills', required: false },
    ],
  },
  {
    name: 'Experience',
    weight: 10,
    fields: [
      { name: 'Work Experiences', path: 'experiences', required: false },
    ],
  },
  {
    name: 'Education',
    weight: 5,
    fields: [
      { name: 'Education History', path: 'educations', required: false },
    ],
  },
  {
    name: 'Projects',
    weight: 5,
    fields: [
      { name: 'Project Portfolio', path: 'projects', required: false },
    ],
  },
  {
    name: 'Services',
    weight: 5,
    fields: [
      { name: 'Services Offered', path: 'services', required: false },
    ],
  },
];

function getValueAtPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return null;
    current = current[part];
  }
  return current;
}

function isFieldFilled(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

export function analyzeProfileCompletion(data: ExtractedProfileData): ProfileCompletionResult {
  const sectionScores: ProfileCompletionResult['sectionScores'] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const section of SECTION_WEIGHTS) {
    let filledCount = 0;
    const missingFields: string[] = [];

    for (const field of section.fields) {
      const value = getValueAtPath(data, field.path);
      if (isFieldFilled(value)) {
        filledCount++;
      } else {
        missingFields.push(field.name);
      }
    }

    const sectionScore = section.fields.length > 0 
      ? (filledCount / section.fields.length) * 100 
      : 0;
    
    sectionScores.push({
      section: section.name,
      score: Math.round(sectionScore),
      filled: filledCount,
      total: section.fields.length,
      missingFields,
    });

    totalWeightedScore += sectionScore * section.weight;
    totalWeight += section.weight;
  }

  const overallScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  const suggestions = generateSuggestions(sectionScores);

  return {
    overallScore,
    sectionScores,
    suggestions,
  };
}

function generateSuggestions(sectionScores: ProfileCompletionResult['sectionScores']): string[] {
  const suggestions: string[] = [];

  const prioritySections = ['Basic Information', 'Professional Brand', 'Skills', 'Experience'];

  for (const sectionName of prioritySections) {
    const section = sectionScores.find(s => s.section === sectionName);
    if (section && section.score < 100 && section.missingFields.length > 0) {
      const topMissing = section.missingFields.slice(0, 2);
      if (topMissing.length === 1) {
        suggestions.push(`Add your ${topMissing[0]} to complete your ${sectionName.toLowerCase()}`);
      } else {
        suggestions.push(`Add ${topMissing.join(' and ')} to strengthen your profile`);
      }
    }
  }

  const lowScoreSections = sectionScores
    .filter(s => s.score < 50 && !prioritySections.includes(s.section))
    .slice(0, 2);

  for (const section of lowScoreSections) {
    suggestions.push(`Complete your ${section.section.toLowerCase()} section for a more comprehensive portfolio`);
  }

  return suggestions.slice(0, 5);
}

export function getProfileCompletionSummary(data: ExtractedProfileData): {
  score: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'complete';
  message: string;
} {
  const result = analyzeProfileCompletion(data);

  let level: 'beginner' | 'intermediate' | 'advanced' | 'complete';
  let message: string;

  if (result.overallScore >= 90) {
    level = 'complete';
    message = 'Your profile is complete! Your portfolio will showcase all your achievements.';
  } else if (result.overallScore >= 70) {
    level = 'advanced';
    message = 'Great progress! Add a few more details to make your portfolio stand out.';
  } else if (result.overallScore >= 40) {
    level = 'intermediate';
    message = 'Good start! Complete more sections to create an impactful portfolio.';
  } else {
    level = 'beginner';
    message = 'Start building your brand by adding basic information and skills.';
  }

  return {
    score: result.overallScore,
    level,
    message,
  };
}

export class ProfileCompletionAnalyzer {
  private data: ExtractedProfileData;
  private result: ProfileCompletionResult | null = null;

  constructor(data: ExtractedProfileData) {
    this.data = data;
  }

  analyze(): ProfileCompletionResult {
    if (!this.result) {
      this.result = analyzeProfileCompletion(this.data);
    }
    return this.result;
  }

  getScore(): number {
    return this.analyze().overallScore;
  }

  getSuggestions(): string[] {
    return this.analyze().suggestions;
  }

  getSummary() {
    return getProfileCompletionSummary(this.data);
  }

  getSectionScore(sectionName: string): number {
    const result = this.analyze();
    const section = result.sectionScores.find(s => s.section === sectionName);
    return section?.score || 0;
  }

  getMissingFields(): { section: string; fields: string[] }[] {
    return this.analyze().sectionScores
      .filter(s => s.missingFields.length > 0)
      .map(s => ({ section: s.section, fields: s.missingFields }));
  }
}

/**
 * Platform Activity Mapper
 * 
 * Maps quest types to ACTUAL Brandentify platform activities.
 * Ensures quests generate real, achievable actions instead of external deliverables.
 */

import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

export interface PlatformActivity {
  questType: string;
  targetAction: string;
  platformFeature: string;
  completionMethod: string;
  deliverableFormat: string;
  constraints: string;
  characterLimit?: number;
}

/**
 * Complete mapping of quest types to real Brandentify features
 */
export const PLATFORM_ACTIVITIES: Record<string, PlatformActivity> = {
  // === PROFILE UPDATE QUESTS (Text fields only) ===
  'profile_update_add_uvp': {
    questType: 'profile_update',
    targetAction: 'add_uvp',
    platformFeature: 'Profile → Unique Value Proposition field',
    completionMethod: 'Fill the Unique Value Proposition text field in your profile',
    deliverableFormat: '150 characters max - concise statement',
    constraints: 'Max 150 characters',
    characterLimit: 150
  },
  'profile_update_add_vision': {
    questType: 'profile_update',
    targetAction: 'add_vision',
    platformFeature: 'Profile → Vision Statement field',
    completionMethod: 'Fill the Vision Statement text field in your profile',
    deliverableFormat: '200 characters max - future aspirations',
    constraints: 'Max 200 characters',
    characterLimit: 200
  },
  'profile_update_add_values': {
    questType: 'profile_update',
    targetAction: 'add_values',
    platformFeature: 'Profile → Core Values field',
    completionMethod: 'Add 3-5 core value keywords in your profile',
    deliverableFormat: '3-5 keywords (e.g., Innovation, Integrity, Growth)',
    constraints: '3-5 keywords, max 5 total',
    characterLimit: 50
  },
  'profile_update_add_audience': {
    questType: 'profile_update',
    targetAction: 'add_audience',
    platformFeature: 'Profile → Target Audience fields',
    completionMethod: 'Define primary and secondary audiences in your profile',
    deliverableFormat: 'Select up to 5 audience types for each category',
    constraints: 'Primary: max 5, Secondary: max 5'
  },
  'profile_update_upload_photo': {
    questType: 'profile_update',
    targetAction: 'upload_photo',
    platformFeature: 'Profile → Profile Photo',
    completionMethod: 'Upload a professional profile photo',
    deliverableFormat: '1 professional headshot image (JPG/PNG)',
    constraints: 'Min 400x400px, professional appearance'
  },
  'profile_update_add_skill': {
    questType: 'profile_update',
    targetAction: 'add_skill',
    platformFeature: 'Profile → Skills section',
    completionMethod: 'Add professional skills to your profile',
    deliverableFormat: '3-10 relevant skills',
    constraints: 'Industry-relevant skills only'
  },
  'profile_update_complete_profile': {
    questType: 'profile_update',
    targetAction: 'complete_profile',
    platformFeature: 'Profile → All sections',
    completionMethod: 'Fill all required profile sections to 100%',
    deliverableFormat: 'Complete: About, Title, Location, Industry, Domain',
    constraints: 'Achieve 100% profile completion'
  },

  // === PULSE CREATION QUESTS (Post content on Brandentify feed) ===
  'pulse_creation_create_pulse': {
    questType: 'pulse_creation',
    targetAction: 'create_pulse',
    platformFeature: 'Industry Pulse → Create Post',
    completionMethod: 'Post new content on Brandentify Industry Pulse feed',
    deliverableFormat: '300-800 words + up to 5 images',
    constraints: 'Public post visible in Industry Pulse'
  },
  'pulse_creation_share_achievement': {
    questType: 'pulse_creation',
    targetAction: 'share_achievement',
    platformFeature: 'Industry Pulse → Achievement Post',
    completionMethod: 'Post about a professional achievement with metrics',
    deliverableFormat: '400-600 words with before/after metrics + 2-3 images',
    constraints: 'Must include quantifiable results'
  },
  'pulse_creation_create_pulse_with_hashtags': {
    questType: 'pulse_creation',
    targetAction: 'create_pulse_with_hashtags',
    platformFeature: 'Industry Pulse → Post with Hashtags',
    completionMethod: 'Create pulse post with 3-5 relevant hashtags',
    deliverableFormat: '300-500 words + 3-5 hashtags',
    constraints: 'Use trending or industry-specific hashtags'
  },
  'pulse_creation_create_trending_pulse': {
    questType: 'pulse_creation',
    targetAction: 'create_trending_pulse',
    platformFeature: 'Industry Pulse → Trending Topic Post',
    completionMethod: 'Post about current industry trend or news',
    deliverableFormat: '400-700 words + trend analysis + 2-4 images',
    constraints: 'Topic must be trending in your industry'
  },
  'pulse_creation_create_question_pulse': {
    questType: 'pulse_creation',
    targetAction: 'create_question_pulse',
    platformFeature: 'Industry Pulse → Question Post',
    completionMethod: 'Post an engaging question to spark discussion',
    deliverableFormat: '100-300 words asking thought-provoking question',
    constraints: 'Open-ended question format'
  },
  'pulse_creation_create_poll': {
    questType: 'pulse_creation',
    targetAction: 'create_poll',
    platformFeature: 'Industry Pulse → Poll Creation',
    completionMethod: 'Create an industry poll with 2-4 options',
    deliverableFormat: 'Poll question + 2-4 answer options',
    constraints: 'Industry-relevant poll topic'
  },
  'pulse_creation_create_multimedia_pulse': {
    questType: 'pulse_creation',
    targetAction: 'create_multimedia_pulse',
    platformFeature: 'Industry Pulse → Media-Rich Post',
    completionMethod: 'Create pulse with images, videos, or infographics',
    deliverableFormat: '300-600 words + 3-5 images or 1 video',
    constraints: 'High-quality visual content required'
  },

  // === PORTFOLIO QUESTS (Add projects to portfolio) ===
  'portfolio_add_project': {
    questType: 'portfolio',
    targetAction: 'add_project',
    platformFeature: 'Portfolio → Add Project',
    completionMethod: 'Add a new project to your portfolio section',
    deliverableFormat: 'Project title + description (300-500 words) + 3-5 images + technologies used',
    constraints: 'Include project outcomes and tech stack'
  },
  'portfolio_case_study': {
    questType: 'portfolio',
    targetAction: 'case_study',
    platformFeature: 'Portfolio → Case Study Project',
    completionMethod: 'Add detailed case study to portfolio with problem/solution/results',
    deliverableFormat: '500-800 words with sections: Challenge, Approach, Solution, Results + 5-8 images',
    constraints: 'Must include measurable results'
  },
  'portfolio_tech_portfolio': {
    questType: 'portfolio',
    targetAction: 'tech_portfolio',
    platformFeature: 'Portfolio → Technical Project',
    completionMethod: 'Add technical project with code samples or demos',
    deliverableFormat: 'Project description + tech stack + GitHub link or live demo + screenshots',
    constraints: 'Include technical details and links'
  },
  'portfolio_add_project_technologies': {
    questType: 'portfolio',
    targetAction: 'add_project_technologies',
    platformFeature: 'Portfolio → Update Project Tech Stack',
    completionMethod: 'Add or update technologies used in existing portfolio project',
    deliverableFormat: 'List of 3-10 technologies/tools used',
    constraints: 'Accurate tech stack representation'
  },

  // === NETWORKING QUESTS (Engage with other users) ===
  'networking_comment_on_pulse': {
    questType: 'networking',
    targetAction: 'comment_on_pulse',
    platformFeature: 'Industry Pulse → Comment on Post',
    completionMethod: 'Write thoughtful comment on another user\'s pulse',
    deliverableFormat: '50-200 words adding value to discussion',
    constraints: 'Meaningful contribution, not spam'
  },
  'networking_react_to_pulse': {
    questType: 'networking',
    targetAction: 'react_to_pulse',
    platformFeature: 'Industry Pulse → React to Post',
    completionMethod: 'React to (like/support) another user\'s pulse',
    deliverableFormat: 'Click reaction button on relevant posts',
    constraints: 'React to posts in your industry'
  },
  'networking_share_pulse': {
    questType: 'networking',
    targetAction: 'share_pulse',
    platformFeature: 'Industry Pulse → Share Post',
    completionMethod: 'Share another user\'s pulse with your network',
    deliverableFormat: 'Share button + optional comment (0-100 words)',
    constraints: 'Share valuable content only'
  },
  'networking_make_connection': {
    questType: 'networking',
    targetAction: 'make_connection',
    platformFeature: 'Smart Radar → Connect with User',
    completionMethod: 'Send connection request to relevant professional',
    deliverableFormat: 'Connection request with personalized message (50-150 words)',
    constraints: 'Industry-relevant connections only'
  },
  'networking_strategic_connect': {
    questType: 'networking',
    targetAction: 'strategic_connect',
    platformFeature: 'Smart Radar → Strategic Connection',
    completionMethod: 'Connect with professionals aligned to your goals',
    deliverableFormat: '3-5 connection requests with personalized messages',
    constraints: 'Target audience-aligned connections'
  },
  'networking_daily_pulse_interaction': {
    questType: 'networking',
    targetAction: 'daily_pulse_interaction',
    platformFeature: 'Industry Pulse → Daily Engagement',
    completionMethod: 'Engage with 5+ pulses (comment/react/share)',
    deliverableFormat: '5 meaningful interactions (comments/reactions)',
    constraints: 'Quality over quantity'
  },
  'networking_save_nowboard_opportunity': {
    questType: 'networking',
    targetAction: 'save_nowboard_opportunity',
    platformFeature: 'Nowboard → Save Opportunity',
    completionMethod: 'Save relevant job/project opportunity from Nowboard',
    deliverableFormat: 'Save button on opportunity listing',
    constraints: 'Relevant to your career goals'
  },

  // === LEARNING QUESTS (Skill development) ===
  'learning_add_new_skill': {
    questType: 'learning',
    targetAction: 'add_new_skill',
    platformFeature: 'Profile → Add Skill',
    completionMethod: 'Add a new skill you\'ve learned to your profile',
    deliverableFormat: '1-3 new skills with proficiency level',
    constraints: 'Recently learned or improved skills'
  },
  'learning_trend_research': {
    questType: 'learning',
    targetAction: 'trend_research',
    platformFeature: 'Industry Pulse → Share Research',
    completionMethod: 'Research industry trend and share findings in pulse',
    deliverableFormat: '400-600 words pulse with trend analysis + sources',
    constraints: 'Current industry trends only'
  },

  // === RESUME QUESTS (Resume improvements) ===
  'resume_update_resume': {
    questType: 'resume',
    targetAction: 'update_resume',
    platformFeature: 'Career Tools → Upload Resume',
    completionMethod: 'Upload updated resume to Career Tools',
    deliverableFormat: 'PDF resume file with latest experience',
    constraints: 'Professional formatting required'
  },
  'resume_quantify_achievements': {
    questType: 'resume',
    targetAction: 'quantify_achievements',
    platformFeature: 'Career Tools → Improve Resume',
    completionMethod: 'Update resume with quantified achievements',
    deliverableFormat: 'Add 3-5 bullet points with metrics',
    constraints: 'Include numbers, percentages, or impact'
  },

  // === ENGAGEMENT QUESTS (In-platform interactions) ===
  'engagement_vote_on_poll': {
    questType: 'engagement',
    targetAction: 'vote_on_poll',
    platformFeature: 'Industry Pulse → Vote on Poll',
    completionMethod: 'Vote on industry poll in pulse feed',
    deliverableFormat: 'Select poll option',
    constraints: 'Vote on relevant polls'
  },
  'engagement_deep_engage_single_pulse': {
    questType: 'engagement',
    targetAction: 'deep_engage_single_pulse',
    platformFeature: 'Industry Pulse → Deep Engagement',
    completionMethod: 'Spend time reading, commenting, and discussing single pulse',
    deliverableFormat: '200+ word thoughtful comment on one pulse',
    constraints: 'High-quality, substantive engagement'
  }
};

/**
 * Profile field completeness checker
 */
export interface ProfileCompleteness {
  hasUVP: boolean;
  hasVision: boolean;
  hasValues: boolean;
  hasAudiences: boolean;
  hasPhoto: boolean;
  hasAboutMe: boolean;
  hasDomain: boolean;
  hasIndustry: boolean;
  hasLocation: boolean;
  completionPercentage: number;
  missingFields: string[];
}

export async function checkProfileCompleteness(userId: number): Promise<ProfileCompleteness> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (!user) {
    throw new Error('User not found');
  }

  const hasUVP = !!user.uniqueValueProposition && user.uniqueValueProposition.trim().length > 0;
  const hasVision = !!user.visionStatement && user.visionStatement.trim().length > 0;
  const hasValues = !!user.coreValues && user.coreValues.length >= 3;
  const hasAudiences = (!!user.primaryAudience && user.primaryAudience.length > 0) || 
                       (!!user.secondaryAudience && user.secondaryAudience.length > 0);
  const hasPhoto = !!user.photoURL && user.photoURL.trim().length > 0;
  const hasAboutMe = !!user.aboutMe && user.aboutMe.trim().length > 20;
  const hasDomain = !!user.domain && user.domain.trim().length > 0;
  const hasIndustry = !!user.industry && user.industry.trim().length > 0;
  const hasLocation = !!user.location && user.location.trim().length > 0;

  const missingFields: string[] = [];
  if (!hasUVP) missingFields.push('Unique Value Proposition');
  if (!hasVision) missingFields.push('Vision Statement');
  if (!hasValues) missingFields.push('Core Values');
  if (!hasAudiences) missingFields.push('Target Audiences');
  if (!hasPhoto) missingFields.push('Profile Photo');
  if (!hasAboutMe) missingFields.push('About Me');
  if (!hasDomain) missingFields.push('Domain');
  if (!hasIndustry) missingFields.push('Industry');
  if (!hasLocation) missingFields.push('Location');

  const totalFields = 9;
  const completedFields = totalFields - missingFields.length;
  const completionPercentage = Math.round((completedFields / totalFields) * 100);

  return {
    hasUVP,
    hasVision,
    hasValues,
    hasAudiences,
    hasPhoto,
    hasAboutMe,
    hasDomain,
    hasIndustry,
    hasLocation,
    completionPercentage,
    missingFields
  };
}

/**
 * Get appropriate quest type based on profile state and goals
 */
export function getRecommendedQuestType(
  profileCompleteness: ProfileCompleteness,
  brandGoals: string[]
): string {
  // If profile incomplete, prioritize profile_update quests
  if (profileCompleteness.completionPercentage < 80) {
    if (!profileCompleteness.hasUVP) return 'profile_update_add_uvp';
    if (!profileCompleteness.hasVision) return 'profile_update_add_vision';
    if (!profileCompleteness.hasValues) return 'profile_update_add_values';
    if (!profileCompleteness.hasAudiences) return 'profile_update_add_audience';
    if (!profileCompleteness.hasPhoto) return 'profile_update_upload_photo';
  }

  // Profile complete - focus on goal-aligned activities
  const hasAuthorityGoal = brandGoals.includes('professional_1');
  const hasVisibilityGoal = brandGoals.some(g => g.startsWith('visibility_'));
  const hasNetworkingGoal = brandGoals.some(g => g.startsWith('networking_'));

  if (hasAuthorityGoal) {
    // Authority building -> content creation
    return Math.random() > 0.5 ? 'pulse_creation_share_achievement' : 'portfolio_case_study';
  }

  if (hasVisibilityGoal) {
    // Visibility -> pulses and engagement
    return 'pulse_creation_create_trending_pulse';
  }

  if (hasNetworkingGoal) {
    // Networking -> engagement quests
    return 'networking_strategic_connect';
  }

  // Default: pulse creation
  return 'pulse_creation_create_pulse';
}


/**
 * Feature Access Control System
 * NOTE: All premium restrictions have been temporarily disabled.
 * All users now have full access to all features.
 */

export interface FeatureQuotas {
  // AI Features
  aiChatMessagesPerMonth: number;
  resumeAnalysisPerMonth: number;
  
  // Content Features
  portfolioTemplatesAllowed: number;
  visitingCardTemplatesAllowed: number;
  hashtagSuggestionsPerPost: number;
  careerCapsulesAllowed: number;
  
  // Quest Features
  allowCareerQuests: boolean;
  allowSocialQuests: boolean;
  
  // Reaction Features
  insightfulReactionsDaily: number;
  misinformedReactionsDaily: number;
  
  // Premium Perks
  premiumBadge: boolean;
  prioritySupport: boolean;
  earlyAccess: boolean;
  adFree: boolean;
}

export interface FeatureUsage {
  aiChatCount: number;
  resumeAnalysisCount: number;
  insightfulCount: number;
  misinformedCount: number;
  lastResetDate: string | null;
}

// All users now get unlimited access (premium tier quotas)
export const FREE_TIER_QUOTAS: FeatureQuotas = {
  aiChatMessagesPerMonth: Infinity,
  resumeAnalysisPerMonth: Infinity,
  portfolioTemplatesAllowed: Infinity,
  visitingCardTemplatesAllowed: Infinity,
  hashtagSuggestionsPerPost: 10,
  careerCapsulesAllowed: Infinity,
  allowCareerQuests: true,
  allowSocialQuests: true,
  insightfulReactionsDaily: 20,
  misinformedReactionsDaily: 20,
  premiumBadge: false,
  prioritySupport: true,
  earlyAccess: true,
  adFree: true,
};

export const PREMIUM_TIER_QUOTAS: FeatureQuotas = {
  aiChatMessagesPerMonth: Infinity,
  resumeAnalysisPerMonth: Infinity,
  portfolioTemplatesAllowed: Infinity,
  visitingCardTemplatesAllowed: Infinity,
  hashtagSuggestionsPerPost: 10,
  careerCapsulesAllowed: Infinity,
  allowCareerQuests: true,
  allowSocialQuests: true,
  insightfulReactionsDaily: 20,
  misinformedReactionsDaily: 20,
  premiumBadge: false,
  prioritySupport: true,
  earlyAccess: true,
  adFree: true,
};

// Free users get 2 templates: Corporate Executive and Scholar
export const FREE_PORTFOLIO_TEMPLATES: string[] = ["corporate-executive", "scholar"];
export const FREE_VISITING_CARD_TEMPLATES: string[] = [];

export function getFeatureQuotas(subscriptionTier?: string): FeatureQuotas {
  // Always return premium quotas for all users
  return PREMIUM_TIER_QUOTAS;
}

export function checkAIChatAccess(
  subscriptionTier?: string,
  usage?: FeatureUsage
): { hasAccess: boolean; remaining: number; message?: string } {
  // Always grant access
  return { hasAccess: true, remaining: Infinity };
}

export function checkResumeAnalysisAccess(
  subscriptionTier?: string,
  usage?: FeatureUsage
): { hasAccess: boolean; remaining: number; message?: string } {
  // Always grant access
  return { hasAccess: true, remaining: Infinity };
}

export function checkPortfolioTemplateAccess(
  templateId: string,
  subscriptionTier?: string
): { hasAccess: boolean; message?: string } {
  // Always grant access to all templates
  return { hasAccess: true };
}

export function checkVisitingCardAccess(
  cardType: string,
  subscriptionTier?: string
): { hasAccess: boolean; message?: string } {
  // Always grant access to all card types
  return { hasAccess: true };
}

export function checkQuestTypeAccess(
  questType: 'career' | 'social',
  subscriptionTier?: string
): { hasAccess: boolean; message?: string } {
  // Always grant access to all quest types
  return { hasAccess: true };
}

export function checkCareerCapsuleAccess(
  currentCount: number,
  subscriptionTier?: string
): { hasAccess: boolean; remaining: number; message?: string } {
  // Always grant access
  return { hasAccess: true, remaining: Infinity };
}

export function getHashtagLimit(subscriptionTier?: string): number {
  // Return max limit for all users
  return 10;
}

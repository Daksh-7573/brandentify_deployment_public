/**
 * Feature Access Control System
 * Centralized logic for checking free vs premium feature access
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

export const FREE_TIER_QUOTAS: FeatureQuotas = {
  aiChatMessagesPerMonth: 5,
  resumeAnalysisPerMonth: 1,
  portfolioTemplatesAllowed: 2, // Corporate Executive, Scholar
  visitingCardTemplatesAllowed: 2, // Professional, Quantum Tech
  hashtagSuggestionsPerPost: 3,
  careerCapsulesAllowed: 1,
  allowCareerQuests: true,
  allowSocialQuests: false,
  insightfulReactionsDaily: 10,
  misinformedReactionsDaily: 10,
  premiumBadge: false,
  prioritySupport: false,
  earlyAccess: false,
  adFree: false,
};

export const PREMIUM_TIER_QUOTAS: FeatureQuotas = {
  aiChatMessagesPerMonth: Infinity,
  resumeAnalysisPerMonth: Infinity,
  portfolioTemplatesAllowed: Infinity, // All templates
  visitingCardTemplatesAllowed: Infinity, // All templates
  hashtagSuggestionsPerPost: 10,
  careerCapsulesAllowed: Infinity,
  allowCareerQuests: true,
  allowSocialQuests: true,
  insightfulReactionsDaily: 20,
  misinformedReactionsDaily: 20,
  premiumBadge: true,
  prioritySupport: true,
  earlyAccess: true,
  adFree: true,
};

// Free tier allowed templates
export const FREE_PORTFOLIO_TEMPLATES = ['corporate-executive', 'scholar'];
export const FREE_VISITING_CARD_TEMPLATES = ['professional', 'quantum-tech'];

export function getFeatureQuotas(subscriptionTier?: string): FeatureQuotas {
  return subscriptionTier === 'premium' ? PREMIUM_TIER_QUOTAS : FREE_TIER_QUOTAS;
}

export function checkAIChatAccess(
  subscriptionTier?: string,
  usage?: FeatureUsage
): { hasAccess: boolean; remaining: number; message?: string } {
  const quotas = getFeatureQuotas(subscriptionTier);
  const used = usage?.aiChatCount || 0;
  
  if (quotas.aiChatMessagesPerMonth === Infinity) {
    return { hasAccess: true, remaining: Infinity };
  }
  
  const remaining = quotas.aiChatMessagesPerMonth - used;
  
  if (remaining <= 0) {
    return {
      hasAccess: false,
      remaining: 0,
      message: `You've used all ${quotas.aiChatMessagesPerMonth} AI chat messages this month. Upgrade to Premium for unlimited access!`,
    };
  }
  
  return { hasAccess: true, remaining };
}

export function checkResumeAnalysisAccess(
  subscriptionTier?: string,
  usage?: FeatureUsage
): { hasAccess: boolean; remaining: number; message?: string } {
  const quotas = getFeatureQuotas(subscriptionTier);
  const used = usage?.resumeAnalysisCount || 0;
  
  if (quotas.resumeAnalysisPerMonth === Infinity) {
    return { hasAccess: true, remaining: Infinity };
  }
  
  const remaining = quotas.resumeAnalysisPerMonth - used;
  
  if (remaining <= 0) {
    return {
      hasAccess: false,
      remaining: 0,
      message: `You've used your ${quotas.resumeAnalysisPerMonth} resume analysis this month. Upgrade to Premium for unlimited access!`,
    };
  }
  
  return { hasAccess: true, remaining };
}

export function checkPortfolioTemplateAccess(
  templateId: string,
  subscriptionTier?: string
): { hasAccess: boolean; message?: string } {
  if (subscriptionTier === 'premium') {
    return { hasAccess: true };
  }
  
  if (FREE_PORTFOLIO_TEMPLATES.includes(templateId)) {
    return { hasAccess: true };
  }
  
  return {
    hasAccess: false,
    message: `This template is only available for Premium members. Upgrade to unlock all ${
      12 - FREE_PORTFOLIO_TEMPLATES.length
    }+ premium templates!`,
  };
}

export function checkVisitingCardAccess(
  cardType: string,
  subscriptionTier?: string
): { hasAccess: boolean; message?: string } {
  if (subscriptionTier === 'premium') {
    return { hasAccess: true };
  }
  
  if (FREE_VISITING_CARD_TEMPLATES.includes(cardType)) {
    return { hasAccess: true };
  }
  
  return {
    hasAccess: false,
    message: 'This visiting card design is only available for Premium members. Upgrade to unlock all premium designs!',
  };
}

export function checkQuestTypeAccess(
  questType: 'career' | 'social',
  subscriptionTier?: string
): { hasAccess: boolean; message?: string } {
  const quotas = getFeatureQuotas(subscriptionTier);
  
  if (questType === 'career' && quotas.allowCareerQuests) {
    return { hasAccess: true };
  }
  
  if (questType === 'social' && quotas.allowSocialQuests) {
    return { hasAccess: true };
  }
  
  return {
    hasAccess: false,
    message: 'Social media quests are only available for Premium members. Upgrade to unlock social quests!',
  };
}

export function checkCareerCapsuleAccess(
  currentCount: number,
  subscriptionTier?: string
): { hasAccess: boolean; remaining: number; message?: string } {
  const quotas = getFeatureQuotas(subscriptionTier);
  
  if (quotas.careerCapsulesAllowed === Infinity) {
    return { hasAccess: true, remaining: Infinity };
  }
  
  const remaining = quotas.careerCapsulesAllowed - currentCount;
  
  if (remaining <= 0) {
    return {
      hasAccess: false,
      remaining: 0,
      message: `You've created your maximum of ${quotas.careerCapsulesAllowed} career capsule. Upgrade to Premium for unlimited capsules!`,
    };
  }
  
  return { hasAccess: true, remaining };
}

export function getHashtagLimit(subscriptionTier?: string): number {
  const quotas = getFeatureQuotas(subscriptionTier);
  return quotas.hashtagSuggestionsPerPost;
}

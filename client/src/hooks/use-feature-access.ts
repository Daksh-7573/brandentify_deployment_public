import { useUser } from '@/hooks/use-user';
import {
  getFeatureQuotas,
  checkAIChatAccess,
  checkResumeAnalysisAccess,
  checkPortfolioTemplateAccess,
  checkVisitingCardAccess,
  checkQuestTypeAccess,
  checkCareerCapsuleAccess,
  getHashtagLimit,
  type FeatureQuotas,
  type FeatureUsage,
} from '@/lib/feature-access';

/**
 * React hook for feature access control
 * NOTE: All premium restrictions have been disabled.
 * All users now have full access to all features.
 */
export function useFeatureAccess() {
  const { user } = useUser();
  
  // Always treat all users as having premium access
  const isPremium = true;
  const subscriptionTier = 'premium';
  const quotas = getFeatureQuotas('premium');
  const premiumFeaturesUsage = (user as any)?.premiumFeaturesUsage as FeatureUsage | undefined;
  
  return {
    // User info - always premium
    isPremium: true,
    subscriptionTier: 'premium',
    quotas,
    usage: premiumFeaturesUsage,
    
    // Feature checks - always granted
    aiChat: { hasAccess: true, remaining: Infinity },
    resumeAnalysis: { hasAccess: true, remaining: Infinity },
    
    // Template checks - always granted
    canAccessPortfolioTemplate: (templateId: string) => ({ hasAccess: true }),
    
    canAccessVisitingCard: (cardType: string) => ({ hasAccess: true }),
    
    // Quest checks - always granted
    canAccessQuestType: (questType: 'career' | 'social') => ({ hasAccess: true }),
    
    // Career capsule check - always granted
    canCreateCareerCapsule: (currentCount: number) => ({ hasAccess: true, remaining: Infinity }),
    
    // Hashtag limit - max for everyone
    hashtagLimit: 10,
  };
}

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
 * Provides convenient access to subscription tier limits and checks
 */
export function useFeatureAccess() {
  const { user } = useUser();
  
  const subscriptionTier = (user as any)?.subscriptionTier;
  const premiumFeaturesUsage = (user as any)?.premiumFeaturesUsage as FeatureUsage | undefined;
  
  const isPremium = subscriptionTier === 'premium';
  const quotas = getFeatureQuotas(subscriptionTier);
  
  return {
    // User info
    isPremium,
    subscriptionTier,
    quotas,
    usage: premiumFeaturesUsage,
    
    // Feature checks
    aiChat: checkAIChatAccess(subscriptionTier, premiumFeaturesUsage),
    resumeAnalysis: checkResumeAnalysisAccess(subscriptionTier, premiumFeaturesUsage),
    
    // Template checks
    canAccessPortfolioTemplate: (templateId: string) => 
      checkPortfolioTemplateAccess(templateId, subscriptionTier),
    
    canAccessVisitingCard: (cardType: string) => 
      checkVisitingCardAccess(cardType, subscriptionTier),
    
    // Quest checks
    canAccessQuestType: (questType: 'career' | 'social') => 
      checkQuestTypeAccess(questType, subscriptionTier),
    
    // Career capsule check
    canCreateCareerCapsule: (currentCount: number) => 
      checkCareerCapsuleAccess(currentCount, subscriptionTier),
    
    // Hashtag limit
    hashtagLimit: getHashtagLimit(subscriptionTier),
  };
}

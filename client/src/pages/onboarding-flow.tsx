import { useState, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/simple-auth-context";
import OnboardingWelcome from "./onboarding-welcome";
import OnboardingQuickSetup from "./onboarding-quick-setup";
import OnboardingTier2Comprehensive from "./onboarding-tier2-comprehensive";
import OnboardingTier3 from "./onboarding-tier3";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = 'welcome' | 'quick-setup' | 'tier2-comprehensive' | 'tier3';

interface OnboardingData {
  goalId?: string;
  // Tier 1: Role + Industry
  title?: string;
  industry?: string;
  domain?: string;
  // Tier 2: Profile + Branding
  name?: string;
  company?: string;
  location?: string;
  lookingFor?: string;
  tagline?: string;
  visionStatement?: string;
  missionStatement?: string;
  coreValues?: string[];
  uniqueValueProposition?: string;
  primaryAudience?: string[];
  secondaryAudience?: string[];
  // Tier 3: Skills + Services (Final Step)
  skills?: Array<{ name: string; level: string }>;
  whatIOffer?: string;
}

export default function OnboardingFlow() {
  const { user } = useContext(AuthContext);
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userName = user?.name || 'Professional';
  const userId = user?.id;

  const handleGoalSelected = (goalId: string) => {
    setOnboardingData(prev => ({ ...prev, goalId }));
    setCurrentStep('quick-setup');
  };

  const handleQuickSetupComplete = async (data: { title: string; industry: string; domain?: string }) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const completeData = { ...onboardingData, ...data };

      // 1. Save brand goal
      if (completeData.goalId) {
        await apiRequest('POST', '/api/brand-goals', {
          userId,
          selectedGoals: [completeData.goalId]
        });
      }

      // 2. Update user profile (Tier 1: Role + Industry)
      await apiRequest('PATCH', `/api/users/${userId}`, {
        title: completeData.title,
        industry: completeData.industry,
        domain: completeData.domain,
        profileCompleted: 40 // Tier 1 gives 40% completion
      });

      // 3. Invalidate all relevant queries
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/brand-goals', userId] });

      // 4. Save to local state and move to Tier 2 Comprehensive
      setOnboardingData(prev => ({ ...prev, ...data }));
      setCurrentStep('tier2-comprehensive');

    } catch (error) {
      console.error('[Onboarding] Error saving data:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTier2ComprehensiveComplete = async (data: {
    name?: string;
    company?: string;
    location?: string;
    lookingFor?: string;
    tagline?: string;
    visionStatement?: string;
    missionStatement?: string;
    coreValues?: string[];
    uniqueValueProposition?: string;
    primaryAudience?: string[];
    secondaryAudience?: string[];
  }) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user profile with all Tier 2 comprehensive data
      await apiRequest('PATCH', `/api/users/${userId}`, {
        ...data,
        profileCompleted: 60 // Tier 2 Comprehensive gives 60% completion
      });

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });

      // Save to local state and move to Tier 3
      setOnboardingData(prev => ({ ...prev, ...data }));
      setCurrentStep('tier3');

    } catch (error) {
      console.error('[Onboarding] Error saving Tier 2 Comprehensive data:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTier3Complete = async (data: { skills: Array<{ name: string; level: string }>, whatIOffer?: string }) => {
    if (!userId) return;

    setIsSubmitting(true);

    try {
      // 1. Save skills
      if (data.skills && data.skills.length > 0) {
        for (const skill of data.skills) {
          await apiRequest('POST', '/api/skills', {
            userId,
            name: skill.name,
            level: skill.level,
            proficiency: skill.level === 'Expert' ? 90 : skill.level === 'Advanced' ? 75 : skill.level === 'Intermediate' ? 50 : 25
          });
        }
      }

      // 2. Update user profile (Tier 3: Final Step - 95% completion)
      const updateData: any = {
        profileCompleted: 95 // Tier 3 is now the final step
      };
      if (data.whatIOffer) {
        updateData.whatIOffer = data.whatIOffer;
      }
      await apiRequest('PATCH', `/api/users/${userId}`, updateData);

      // 3. Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/skills', userId] });

      // 4. Trigger instant quest assignment
      console.log('[Onboarding] Triggering instant quest assignment for user', userId);
      try {
        const questResponse = await apiRequest('POST', `/api/assign-initial-quests/${userId}`, {});
        console.log('[Onboarding] Quest assignment result:', questResponse);
      } catch (questError) {
        console.error('[Onboarding] Quest assignment failed (non-blocking):', questError);
      }

      // 5. Success toast
      toast({
        title: "Profile setup complete!",
        description: "✨ Let's preview your professional portfolio!",
      });

      // 6. Redirect to Portfolio Preview page
      setTimeout(() => {
        setLocation('/portfolio-preview');
      }, 500);

    } catch (error) {
      console.error('[Onboarding] Error saving Tier 3 data:', error);
      toast({
        title: "Error",
        description: "Failed to save your skills. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTier3Skip = async () => {
    if (!userId) return;

    setIsSubmitting(true);

    try {
      // Trigger instant quest assignment
      console.log('[Onboarding] Triggering instant quest assignment (skip) for user', userId);
      try {
        const questResponse = await apiRequest('POST', `/api/assign-initial-quests/${userId}`, {});
        console.log('[Onboarding] Quest assignment result:', questResponse);
      } catch (questError) {
        console.error('[Onboarding] Quest assignment failed (non-blocking):', questError);
      }

      toast({
        title: "Profile setup complete!",
        description: "✨ Let's preview your professional portfolio!",
      });

      setTimeout(() => {
        setLocation('/portfolio-preview');
      }, 500);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleBack = () => {
    if (currentStep === 'quick-setup') {
      setCurrentStep('welcome');
    } else if (currentStep === 'tier2-comprehensive') {
      setCurrentStep('quick-setup');
    } else if (currentStep === 'tier3') {
      setCurrentStep('tier2-comprehensive');
    }
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
          <div className="text-white text-lg">Creating your personalized quests...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentStep === 'welcome' && (
        <OnboardingWelcome
          userName={userName}
          onGoalSelected={handleGoalSelected}
        />
      )}

      {currentStep === 'quick-setup' && (
        <OnboardingQuickSetup
          userName={userName}
          selectedGoal={onboardingData.goalId}
          onComplete={handleQuickSetupComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 'tier2-comprehensive' && (
        <OnboardingTier2Comprehensive
          onComplete={handleTier2ComprehensiveComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 'tier3' && (
        <OnboardingTier3
          onComplete={handleTier3Complete}
          onBack={handleBack}
          onSkip={handleTier3Skip}
        />
      )}
    </>
  );
}

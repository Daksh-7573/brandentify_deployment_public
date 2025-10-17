import { useState, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/simple-auth-context";
import OnboardingWelcome from "./onboarding-welcome";
import OnboardingQuickSetup from "./onboarding-quick-setup";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = 'welcome' | 'quick-setup';

interface OnboardingData {
  goalId?: string;
  title?: string;
  industry?: string;
  domain?: string;
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

      // 4. Success toast
      toast({
        title: "Profile setup complete!",
        description: "✨ Your AI coach has created personalized quests for you!",
      });

      // 5. Redirect to Brand Quest page
      setTimeout(() => {
        setLocation('/brand-quests');
      }, 500);

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

  const handleBack = () => {
    setCurrentStep('welcome');
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
    </>
  );
}

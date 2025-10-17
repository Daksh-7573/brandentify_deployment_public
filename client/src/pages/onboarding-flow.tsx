import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { ProfileWizard } from '@/components/onboarding/ProfileWizard';
import { QuestUnlockModal } from '@/components/onboarding/QuestUnlockModal';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";

type OnboardingStep = 'welcome' | 'profile' | 'quest-unlock' | 'complete';

export default function OnboardingFlow() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  // Redirect if user is not authenticated or already completed onboarding
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/auth');
    } else if (!isLoading && user?.onboardingComplete) {
      setLocation('/dashboard');
    }
  }, [user, isLoading, setLocation]);

  // Fetch current onboarding status on mount
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/users/${user.id}/onboarding`);
          const data = await response.json();
          
          // Resume from saved step
          if (data.onboardingStep === 'profile') {
            setCurrentStep('profile');
          } else if (data.onboardingComplete) {
            setCurrentStep('complete');
            setLocation('/dashboard');
          }
        } catch (error) {
          console.error('Error fetching onboarding status:', error);
        }
      }
    };

    fetchOnboardingStatus();
  }, [user?.id, setLocation]);

  // Save brand goal and move to profile wizard
  const handleGoalSelected = async (goalId: string) => {
    try {
      setSelectedGoal(goalId);
      
      // Save the selected goal to brand goals
      await apiRequest('POST', '/api/brand-goals', {
        userId: user?.id,
        selectedGoals: [goalId]
      });

      // Update onboarding step to profile (not welcome!)
      await apiRequest('PATCH', `/api/users/${user?.id}/onboarding`, {
        onboardingStep: 'profile'
      });

      setCurrentStep('profile');
    } catch (error) {
      console.error('Error saving brand goal:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your goal. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Complete profile wizard and trigger quest assignment
  const handleProfileComplete = async () => {
    try {
      // Trigger quest assignment for the user
      await apiRequest('POST', `/api/quest-assignment/${user?.id}`, {
        forceReassign: true
      });

      // Mark onboarding as complete
      await apiRequest('PATCH', `/api/users/${user?.id}/onboarding`, {
        onboardingComplete: true,
        onboardingStep: 'complete'
      });

      setCurrentStep('quest-unlock');
    } catch (error) {
      console.error('Error completing profile:', error);
      // Even if quest assignment fails, show the unlock modal
      setCurrentStep('quest-unlock');
    }
  };

  // Close quest unlock modal and redirect to dashboard
  const handleQuestUnlockClose = () => {
    setCurrentStep('complete');
    // Brief delay for smooth transition
    setTimeout(() => {
      setLocation('/dashboard');
    }, 300);
  };

  if (isLoading || !user) {
    return (
      <div 
        className="min-h-screen w-full flex items-center justify-center"
        style={{ 
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      data-testid="onboarding-flow"
    >
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm" />

      {/* Onboarding modals */}
      <WelcomeModal
        isOpen={currentStep === 'welcome'}
        onComplete={handleGoalSelected}
      />

      <ProfileWizard
        isOpen={currentStep === 'profile'}
        mode="onboarding"
        userId={user.id}
        onComplete={handleProfileComplete}
      />

      <QuestUnlockModal
        isOpen={currentStep === 'quest-unlock'}
        onClose={handleQuestUnlockClose}
      />
    </div>
  );
}

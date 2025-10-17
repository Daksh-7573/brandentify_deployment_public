import { useState, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/simple-auth-context";
import OnboardingWelcome from "./onboarding-welcome";
import OnboardingQuickSetup from "./onboarding-quick-setup";
import OnboardingTier2Comprehensive from "./onboarding-tier2-comprehensive";
import OnboardingTier3 from "./onboarding-tier3";
import OnboardingTier4 from "./onboarding-tier4";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep = 'welcome' | 'quick-setup' | 'tier2-comprehensive' | 'tier3' | 'tier4';

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
  // Tier 3: Skills + Services
  skills?: Array<{ name: string; level: string }>;
  whatIOffer?: string;
  // Tier 4: Projects + Career + Academic
  projects?: Array<{ title: string; description: string }>;
  workExperiences?: Array<{ title: string; company: string; startDate: string; endDate?: string }>;
  educations?: Array<{ degree: string; institution: string; startDate: string; endDate?: string }>;
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

      // 2. Update user profile (Tier 3: Skills + Services)
      const updateData: any = {
        profileCompleted: 75 // Tier 3 gives 75% completion
      };
      if (data.whatIOffer) {
        updateData.whatIOffer = data.whatIOffer;
      }
      await apiRequest('PATCH', `/api/users/${userId}`, updateData);

      // 3. Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });
      await queryClient.invalidateQueries({ queryKey: ['/api/skills', userId] });

      // 4. Save to local state and move to Tier 4
      setOnboardingData(prev => ({ ...prev, ...data }));
      setCurrentStep('tier4');

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
    setCurrentStep('tier4');
  };

  const handleTier4Complete = async (data: {
    projects?: Array<{ title: string; description: string }>;
    workExperiences?: Array<{ title: string; company: string; startDate: string; endDate?: string }>;
    educations?: Array<{ degree: string; institution: string; startDate: string; endDate?: string }>;
  }) => {
    if (!userId) return;

    setIsSubmitting(true);

    try {
      let profileCompletion = 75; // Start from Tier 3 completion

      // 1. Save projects
      if (data.projects && data.projects.length > 0) {
        for (const project of data.projects) {
          await apiRequest('POST', '/api/projects', {
            userId,
            title: project.title,
            description: project.description
          });
        }
        profileCompletion += 7;
      }

      // 2. Save work experiences
      if (data.workExperiences && data.workExperiences.length > 0) {
        for (const work of data.workExperiences) {
          await apiRequest('POST', '/api/work-experiences', {
            userId,
            title: work.title,
            company: work.company,
            startDate: work.startDate,
            endDate: work.endDate || null
          });
        }
        profileCompletion += 7;
      }

      // 3. Save education
      if (data.educations && data.educations.length > 0) {
        for (const edu of data.educations) {
          await apiRequest('POST', '/api/educations', {
            userId,
            degree: edu.degree,
            institution: edu.institution,
            startDate: edu.startDate,
            endDate: edu.endDate || null
          });
        }
        profileCompletion += 6;
      }

      // 4. Update user profile (Tier 4: max 95% completion)
      await apiRequest('PATCH', `/api/users/${userId}`, {
        profileCompleted: Math.min(profileCompletion, 95)
      });

      // 5. Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });

      // 6. Success toast
      toast({
        title: "Profile setup complete!",
        description: "✨ Your AI coach has created personalized quests for you!",
      });

      // 7. Redirect to Brand Quest page
      setTimeout(() => {
        setLocation('/brand-quests');
      }, 500);

    } catch (error) {
      console.error('[Onboarding] Error saving Tier 4 data:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTier4Skip = async () => {
    if (!userId) return;

    setIsSubmitting(true);

    try {
      toast({
        title: "Profile setup complete!",
        description: "✨ Your AI coach has created personalized quests for you!",
      });

      setTimeout(() => {
        setLocation('/brand-quests');
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
    } else if (currentStep === 'tier4') {
      setCurrentStep('tier3');
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

      {currentStep === 'tier4' && (
        <OnboardingTier4
          onComplete={handleTier4Complete}
          onBack={handleBack}
          onSkip={handleTier4Skip}
        />
      )}
    </>
  );
}

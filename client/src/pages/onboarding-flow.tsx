import { useState, useContext } from "react";
import { useLocation } from "wouter";
import { AuthContext } from "@/context/simple-auth-context";
import OnboardingWelcome from "./onboarding-welcome";
import OnboardingQuickSetup from "./onboarding-quick-setup";
import OnboardingTier2Comprehensive from "./onboarding-tier2-comprehensive";
import OnboardingTier3 from "./onboarding-tier3";
import OnboardingShowcase from "./onboarding-showcase";
import OnboardingExperience from "./onboarding-experience";
import OnboardingEducation from "./onboarding-education";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type OnboardingStep =
  | 'welcome'
  | 'quick-setup'
  | 'tier2-comprehensive'
  | 'skills-services'
  | 'showcase'
  | 'experience'
  | 'education';

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
  services?: Array<any>;
  whatIOffer?: string;
  // Projects
  projects?: Array<any>;
  // Experience
  experiences?: Array<any>;
  // Education
  educations?: Array<any>;
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

  const handleQuickSetupComplete = (data: { title: string; industry: string; domain?: string }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep('tier2-comprehensive');
  };

  const handleTier2ComprehensiveComplete = (data: any) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep('skills-services');
  };

  const handleSkillsServicesComplete = (data: any) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep('showcase');
  };

  const handleShowcaseComplete = (data: { projects: any[] }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep('experience');
  };

  const handleExperienceComplete = (data: { experiences: any[] }) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
    setCurrentStep('education');
  };

  const handleFinalSubmit = async (data: { educations: any[] }) => {
    if (!userId) return;

    setIsSubmitting(true);
    const finalData = { ...onboardingData, ...data };

    try {
      if (!finalData.goalId) {
        toast({
          title: "Goal selection required",
          description: "Please select at least one goal to continue.",
          variant: "destructive"
        });
        return;
      }

      if (!finalData.name?.trim()) {
        toast({
          title: "Name is required",
          description: "Please enter your name to continue.",
          variant: "destructive"
        });
        return;
      }

      if (!finalData.title?.trim()) {
        toast({
          title: "Job title is required",
          description: "Please enter your job title to continue.",
          variant: "destructive"
        });
        return;
      }

      if (!finalData.location?.trim()) {
        toast({
          title: "Location is required",
          description: "Please enter your location to continue.",
          variant: "destructive"
        });
        return;
      }

      if (!finalData.industry?.trim()) {
        toast({
          title: "Industry is required",
          description: "Please select your industry to continue.",
          variant: "destructive"
        });
        return;
      }

      if (!finalData.domain?.trim()) {
        toast({
          title: "Domain is required",
          description: "Please select your domain to continue.",
          variant: "destructive"
        });
        return;
      }

      console.log('[Onboarding] Submitting all data...', finalData);

      // 1. Save brand goal
      if (finalData.goalId) {
        await apiRequest('POST', '/api/brand-goals', {
          userId,
          selectedGoals: [finalData.goalId]
        });
      }

      // 2. Save skills
      if (finalData.skills && finalData.skills.length > 0) {
        for (const skill of finalData.skills) {
          await apiRequest('POST', '/api/skills', {
            userId,
            name: skill.name,
            level: skill.level,
            proficiency: skill.level === 'Expert' ? 90 : skill.level === 'Advanced' ? 75 : skill.level === 'Intermediate' ? 50 : 25
          });
        }
      }

      // 3. Save projects
      if (finalData.projects && finalData.projects.length > 0) {
        for (const project of finalData.projects) {
          await apiRequest('POST', '/api/projects', { ...project, userId });
        }
      }

      // 4. Save experiences
      if (finalData.experiences && finalData.experiences.length > 0) {
        for (const exp of finalData.experiences) {
          await apiRequest('POST', '/api/experiences', { ...exp, userId });
        }
      }

      // 5. Save educations
      if (finalData.educations && finalData.educations.length > 0) {
        for (const edu of finalData.educations) {
          await apiRequest('POST', '/api/educations', { ...edu, userId });
        }
      }

      // 6. Update user profile - Final completion
      await apiRequest('PATCH', `/api/users/${userId}`, {
        name: finalData.name,
        title: finalData.title,
        industry: finalData.industry,
        domain: finalData.domain || "all",
        company: finalData.company,
        location: finalData.location,
        lookingFor: finalData.lookingFor,
        tagline: finalData.tagline,
        visionStatement: finalData.visionStatement,
        missionStatement: finalData.missionStatement,
        coreValues: finalData.coreValues,
        uniqueValueProposition: finalData.uniqueValueProposition,
        primaryAudience: finalData.primaryAudience,
        secondaryAudience: finalData.secondaryAudience,
        whatIOffer: finalData.whatIOffer,
        profileCompleted: 100
      });

      // 7. Trigger instant quest assignment
      try {
        await apiRequest('POST', `/api/assign-initial-quests/${userId}`, {});
      } catch (e) {
        console.error('Quest assignment failed:', e);
      }

      // 8. Invalidate queries
      await queryClient.invalidateQueries({ queryKey: ['/api/users', userId] });

      toast({
        title: "Profile setup complete!",
        description: "✨ Welcome to Brandentify. Your AI coach has created personalized quests for you!",
      });

      setTimeout(() => {
        setLocation('/dashboard');
      }, 1000);

    } catch (error) {
      console.error('[Onboarding] Error during final submit:', error);
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
    const steps: OnboardingStep[] = ['welcome', 'quick-setup', 'tier2-comprehensive', 'skills-services', 'showcase', 'experience', 'education'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  if (isSubmitting) {
    return (
      <div className="fixed inset-0 bg-[#050505] flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <div className="w-12 h-12 bg-blue-500 rounded-full animate-ping opacity-20" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Finalizing Your Profile</h2>
          <p className="text-gray-400">Our AI is crafting your personalized career roadmap...</p>
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
          onComplete={handleQuickSetupComplete}
          onBack={handleBack}
        />
      )}

      {currentStep === 'tier2-comprehensive' && (
        <OnboardingTier2Comprehensive
          onComplete={handleTier2ComprehensiveComplete}
          onBack={handleBack}
          onSkip={() => setCurrentStep('skills-services')}
        />
      )}

      {currentStep === 'skills-services' && (
        <OnboardingTier3
          onComplete={handleSkillsServicesComplete}
          onBack={handleBack}
          onSkip={() => setCurrentStep('showcase')}
        />
      )}

      {currentStep === 'showcase' && (
        <OnboardingShowcase
          onComplete={handleShowcaseComplete}
          onBack={handleBack}
          onSkip={() => setCurrentStep('experience')}
        />
      )}

      {currentStep === 'experience' && (
        <OnboardingExperience
          onComplete={handleExperienceComplete}
          onBack={handleBack}
          onSkip={() => setCurrentStep('education')}
        />
      )}

      {currentStep === 'education' && (
        <OnboardingEducation
          onComplete={handleFinalSubmit}
          onBack={handleBack}
          onSkip={() => handleFinalSubmit({ educations: [] })}
        />
      )}
    </>
  );
}


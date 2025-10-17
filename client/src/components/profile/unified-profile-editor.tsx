import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, User, Briefcase, GraduationCap, Lightbulb, FolderKanban, Package, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";

// Step components
import PersonalBrandStep from "./editor-steps/personal-brand-step";
import WorkExperienceStep from "./editor-steps/work-experience-step";
import EducationStep from "./editor-steps/education-step";
import SkillsStep from "./editor-steps/skills-step";
import ProjectsStep from "./editor-steps/projects-step";
import ServicesStep from "./editor-steps/services-step";

interface UnifiedProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  userData?: any;
  userIdentifier: string;
}

const STEPS = [
  { id: 1, title: "Personal & Brand", icon: User, component: PersonalBrandStep },
  { id: 2, title: "Experience", icon: Briefcase, component: WorkExperienceStep },
  { id: 3, title: "Education", icon: GraduationCap, component: EducationStep },
  { id: 4, title: "Skills", icon: Lightbulb, component: SkillsStep },
  { id: 5, title: "Projects", icon: FolderKanban, component: ProjectsStep },
  { id: 6, title: "Services", icon: Package, component: ServicesStep },
];

export function UnifiedProfileEditor({ isOpen, onClose, userData, userIdentifier }: UnifiedProfileEditorProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();

  const progress = (currentStep / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Invalidate all profile-related queries
    queryClient.invalidateQueries({ queryKey: ['/api/users', userIdentifier] });
    queryClient.invalidateQueries({ queryKey: [`/api/users/${userIdentifier}`] });
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    
    onClose();
  };

  const handleStepComplete = () => {
    if (currentStep === STEPS.length) {
      handleComplete();
    } else {
      handleNext();
    }
  };

  // Reset to step 1 when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden bg-transparent border-none shadow-none p-0">
        <div className="neo-glass-card backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl p-6">
          {/* Header */}
          <DialogHeader className="space-y-4 mb-6">
            <DialogTitle className="text-2xl font-bold text-white">
              Edit Your Profile
            </DialogTitle>
            
            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Step {currentStep} of {STEPS.length}</span>
                <span>{Math.round(progress)}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Step indicators */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-1 min-w-[80px] transition-all ${
                      isActive ? 'opacity-100' : isCompleted ? 'opacity-80' : 'opacity-50'
                    }`}
                    data-testid={`step-indicator-${step.id}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive 
                        ? 'bg-white/20 ring-2 ring-white/50' 
                        : isCompleted 
                        ? 'bg-green-500/30' 
                        : 'bg-white/10'
                    }`}>
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-green-400" />
                      ) : (
                        <StepIcon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-white/60'}`} />
                      )}
                    </div>
                    <span className={`text-xs ${isActive ? 'text-white font-medium' : 'text-white/60'}`}>
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </DialogHeader>

          {/* Step content */}
          <div className="overflow-y-auto max-h-[calc(90vh-300px)] mb-6">
            {CurrentStepComponent && (
              <CurrentStepComponent
                userData={userData}
                userIdentifier={userIdentifier}
                onNext={handleStepComplete}
              />
            )}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-testid="button-back"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleStepComplete}
              className="bg-white/20 hover:bg-white/30 text-white"
              data-testid="button-next"
            >
              {currentStep === STEPS.length ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Save & Close
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

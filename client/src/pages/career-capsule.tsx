import { useState, FormEvent, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCareerCapsule, CareerGoal, GoalType } from "@/hooks/use-career-capsule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";
import { CareerCapsulePageSkeleton } from "@/components/ui/page-skeletons/career-capsule-skeleton";
import { CareerCapsuleSEO } from '@/components/seo/career-capsule-seo';
import { CareerCapsuleStructuredData } from '@/components/seo/career-capsule-structured-data';
import { CareerCapsuleFAQSection } from '@/components/seo/career-capsule-faq';

// Utility function to format dates
const formatDate = (dateString: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Get text representation of goal type
const getGoalTypeText = (type: GoalType) => {
  const typeMap: Record<GoalType, string> = {
    position_change: "Position Change",
    skill_acquisition: "Skill Acquisition",
    promotion: "Promotion",
    industry_switch: "Industry Switch",
    entrepreneurship: "Entrepreneurship",
    relocation: "Relocation",
    education: "Education",
    certification: "Certification",
    custom: "Custom",
  };
  return typeMap[type] || type;
};

// Goal status badge color mapping
const getStatusColor = (status: string | null) => {
  switch (status) {
    case "in_progress": return "bg-amber-100 text-amber-800";
    case "completed": return "bg-green-100 text-green-800";
    case "abandoned": return "bg-red-100 text-red-800";
    case "not_started":
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function CareerCapsulePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const userId = user?.id || 0;
  
  const {
    useGoals,
    useCreateGoal,
    useDeleteCapsule,
    useGenerateMilestones,
    useGoalDetails
  } = useCareerCapsule(userId);
  
  const { data: goals, isLoading, refetch: refetchGoals } = useGoals();
  const createGoalMutation = useCreateGoal();
  const deleteCapsuleMutation = useDeleteCapsule();
  
  // State for dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  
  const { data: goalDetailsWithRelated, isLoading: isLoadingDetails, refetch: getGoalDetails } = useGoalDetails(selectedGoalId || 0);
  const goalDetails = goalDetailsWithRelated?.goal;
  
  // Form state
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("position_change");
  const [timeframe, setTimeframe] = useState("3");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for tracking milestone generation
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null);
  const [milestoneGenerating, setMilestoneGenerating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Automatic milestone generation function
  const generateMilestonesAfterCreation = useGenerateMilestones(createdGoalId || 0);
  
  // Effect to trigger milestone generation after goal creation
  useEffect(() => {
    const triggerMilestoneGeneration = async () => {
      if (createdGoalId && !milestoneGenerating) {
        setMilestoneGenerating(true);
        try {
          // Generate milestones for the newly created goal
          await generateMilestonesAfterCreation.mutateAsync({
            goalType,
            customGoal: goalType === 'custom' ? goalTitle : undefined,
            timeframe: parseInt(timeframe),
            description,
            useModel: 'openai', // Default to OpenAI
          });
          
          // Show success dialog
          setShowSuccessDialog(true);
          
          toast({
            title: "Milestones created",
            description: "Musk AI has generated personalized milestones for your career goal.",
          });
        } catch (error) {
          console.error("Error generating milestones:", error);
          toast({
            title: "Milestone generation failed",
            description: "Failed to generate milestones. You can try again from the goal details page.",
            variant: "destructive",
          });
        } finally {
          setMilestoneGenerating(false);
          setCreatedGoalId(null);
        }
      }
    };
    
    triggerMilestoneGeneration();
  }, [createdGoalId, goalType, timeframe, description, goalTitle, generateMilestonesAfterCreation, milestoneGenerating]);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!goalTitle) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your career goal.",
        variant: "destructive",
      });
      return;
    }
    
    // Calculate target date based on timeframe if not provided
    const calculatedTargetDate = targetDate ? new Date(targetDate) : new Date(
      new Date().setFullYear(new Date().getFullYear() + parseInt(timeframe))
    );
    
    setIsSubmitting(true);
    
    try {
      // Create the goal
      const response = await createGoalMutation.mutateAsync({
        title: goalTitle,
        description: description,
        goalType: goalType,
        timeframe: parseInt(timeframe),
        targetDate: calculatedTargetDate,
        status: "not_started",
        isPrivate: false,
        overallProgress: 0,
        isMuskGenerated: false,
      }) as any;
      
      // Store the created goal ID to trigger milestone generation
      if (response?.id) {
        setCreatedGoalId(response.id);
        
        toast({
          title: "Goal created",
          description: "Your career goal has been created. Musk AI is now generating personalized milestones...",
        });
      }
      
      // Reset form
      setGoalTitle("");
      setGoalType("position_change");
      setTimeframe("3");
      setDescription("");
      setTargetDate("");
      
      // Close dialog and refresh goals
      setShowCreateDialog(false);
      refetchGoals();
      
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "Failed to create the career goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleViewDetails = (goalId: number) => {
    setSelectedGoalId(goalId);
    setShowDetailsDialog(true);
  };
  
  const handleOpenDeleteDialog = (capsuleId: number) => {
    console.log("Opening delete dialog for capsule ID:", capsuleId);
    setCapsuleToDelete(capsuleId);
    setShowDeleteDialog(true);
  };

  const handleDeleteCapsule = async () => {
    if (!capsuleToDelete) return;
    
    console.log(`Starting deletion of capsule with ID ${capsuleToDelete}...`);
    setIsDeleting(true);
    try {
      // Call the API to delete the capsule
      const response = await deleteCapsuleMutation.mutateAsync(capsuleToDelete);
      console.log(`Delete API response:`, response);
      
      // Update UI state
      setShowDeleteDialog(false);
      setCapsuleToDelete(null);
      
      // If we're deleting the currently viewed goal, close the details dialog
      if (selectedGoalId === capsuleToDelete) {
        console.log(`Closing detail dialog for deleted capsule ${capsuleToDelete}`);
        setShowDetailsDialog(false);
        setSelectedGoalId(null);
      }
      
      // Force a strong refresh by invalidating all goal-related queries
      console.log(`Invalidating queries for user ${user?.id}...`);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/career-capsule`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}/career-goals`] });
      
      toast({
        title: "Career capsule deleted",
        description: "The career capsule has been successfully deleted."
      });
      
      // Force a manual refresh after a small delay to ensure the backend has processed the deletion
      setTimeout(() => {
        console.log("Performing refetch after deletion...");
        refetchGoals();
      }, 1000);
      
    } catch (error) {
      console.error("Error deleting capsule:", error);
      toast({
        title: "Error",
        description: "Failed to delete the career capsule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      // Final refresh to make sure UI reflects current state
      setTimeout(() => {
        console.log("Final data refresh after deletion process...");
        refetchGoals();
      }, 2000);
    }
  };

  // Load goal details when dialog opens
  useEffect(() => {
    if (showDetailsDialog && selectedGoalId) {
      getGoalDetails();
    }
  }, [showDetailsDialog, selectedGoalId, getGoalDetails]);

  return (
    <>
      <CareerCapsuleSEO />
      <CareerCapsuleStructuredData />
      <div className="min-h-screen text-white selection:bg-white/20 font-['Outfit'] overflow-x-hidden relative">
        {/* Dynamic Background - Premium Dark Theme */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/3 blur-[120px] rounded-full" />
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        </div>
        <main className="relative z-10 container mx-auto px-6 py-8">
          <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Career Capsule</h1>
              <button 
                onClick={() => setShowCreateDialog(true)}
                className="neo-glass-button flex items-center gap-2 py-2 px-3 sm:px-4 text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <span>Create New Goal</span>
              </button>
            </div>
            
            {isLoading ? (
              <CareerCapsulePageSkeleton />
            ) : Array.isArray(goals) && goals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                {/* Display all goals as an array - our backend now always returns an array */}
                {goals.map((goal: CareerGoal) => (
                    <div key={goal.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 hover:transform hover:translate-y-[-2px] sm:hover:translate-y-[-5px] transition-all duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 gap-2 sm:gap-0">
                        <h3 className="text-lg sm:text-xl font-semibold text-white leading-tight">{goal.title}</h3>
                        <Badge 
                          className={`${getStatusColor(goal.status || "not_started")} neo-glass-badge text-xs shrink-0`}
                        >
                          {goal.status === "in_progress" ? "In Progress" : 
                           goal.status === "completed" ? "Completed" : 
                           goal.status === "abandoned" ? "Abandoned" : "Not Started"}
                        </Badge>
                      </div>
                      <div className="text-gray-300 mb-3">
                        <div className="flex flex-col gap-1 mt-1">
                          <span className="text-xs sm:text-sm">{getGoalTypeText(goal.goalType as GoalType)}</span>
                          <span className="text-xs sm:text-sm">Target: {formatDate(String(goal.targetDate || ""))}</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="relative">
                          <div className="w-full bg-white/10 rounded-full h-1.5 sm:h-2 backdrop-blur-sm border border-white/20">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-purple-500 h-1.5 sm:h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20"
                              style={{ width: `${goal.overallProgress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-300 mt-1 sm:mt-2 block font-medium">
                            {goal.overallProgress || 0}% complete
                          </span>
                        </div>
                      </div>
                      <p className="line-clamp-2 text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4">{goal.description || "No description provided"}</p>
                      <div className="pt-2 sm:pt-3 border-t border-white/10">
                        <button 
                          className="neo-glass-button w-full py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-medium text-white transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/20"
                          onClick={() => handleViewDetails(goal.id)}
                        >
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 text-center space-y-3 sm:space-y-4 py-12 sm:py-16">
                <h2 className="text-lg sm:text-xl font-semibold text-white">No career goals yet</h2>
                <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base px-4 sm:px-0">
                  Set 1-5 year career goals and get AI-generated milestones to help you achieve them.
                  Track your progress and stay focused on your career development journey.
                </p>
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="neo-glass-button inline-flex items-center gap-2 py-2.5 px-5 text-sm sm:text-base mt-2"
                >
                  <span>Get Started</span>
                </button>
              </div>
            )}
          </div>

        {/* FAQ Section for AEO (Answer Engine Optimization) */}
        <CareerCapsuleFAQSection />
        </main>
      </div>
    </>
  );
}

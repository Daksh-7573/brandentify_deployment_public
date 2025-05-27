import { useState, FormEvent, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCareerCapsule, CareerGoal, GoalType } from "@/hooks/use-career-capsule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, CheckCircle2, AlertTriangle, Target, Calendar, FileText, Briefcase, ChevronDown } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";
import { NeoGlassSection } from "@/components/layout/neo-glass-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { user } = useAuth();
  const userId = user?.id || 1; // Default to user ID 1 for demo if not logged in
  
  const { 
    useGoals, 
    useGoalDetails,
    useCreateGoal,
    useGenerateMilestones,
    useDeleteCapsule,
    useToggleTaskCompletion,
    useUpdateTask
  } = useCareerCapsule(userId);
  
  const { data: goals, isLoading, refetch: refetchGoals, error } = useGoals();
  
  // Debug logging to understand the data structure
  console.log('Career Goals Data Structure:', JSON.stringify(goals, null, 2));
  
  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("position_change");
  const [timeframe, setTimeframe] = useState("3");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selected goal for details view
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { data: goalDetails, isLoading: isLoadingDetails } = useGoalDetails(selectedGoalId || 0);
  const createGoalMutation = useCreateGoal();
  const deleteCapsuleMutation = useDeleteCapsule();
  
  // Debug logging
  console.log("Career Goals API Response:", { goals, isLoading, error });
  
  // Debug goal details when they change
  useEffect(() => {
    if (selectedGoalId) {
      console.log("Goal Details API Response:", { 
        goalDetails, 
        isLoadingDetails,
        hasMilestones: goalDetails && goalDetails.milestones && goalDetails.milestones.length > 0,
        selectedGoalId
      });
    }
  }, [goalDetails, isLoadingDetails, selectedGoalId]);
  
  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Milestone generation
  const generateMilestones = useGenerateMilestones(selectedGoalId || 0);
  const [showMilestoneGenerationDialog, setShowMilestoneGenerationDialog] = useState(false);
  
  // Task completion toggling
  const toggleTaskCompletion = useToggleTaskCompletion(selectedGoalId || 0);

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
    const calculatedTargetDate = targetDate || new Date(
      new Date().setFullYear(new Date().getFullYear() + parseInt(timeframe))
    ).toISOString();
    
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
      });
      
      // Store the created goal ID to trigger milestone generation
      if (response && response.id) {
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
  
  // Regenerate Milestone function has been removed as requested

  const handleDeleteCapsule = async () => {
    if (!capsuleToDelete) return;
    
    console.log(`Starting deletion of capsule with ID ${capsuleToDelete}...`);
    setIsDeleting(true);
    try {
      // Log before sending the API request
      console.log(`Calling API to delete capsule ID ${capsuleToDelete}...`);
      
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
      console.log(`Invalidating queries for user ${userId}...`);
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-capsule`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-goals`] });
      
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

  return (
    <PageLayout title="Career Capsule">
      <div className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Career Capsule</h1>
          <button 
            onClick={() => setShowCreateDialog(true)}
            className="neo-glass-button flex items-center gap-2 py-2 px-4"
          >
            <span>Create New Goal</span>
          </button>
        </div>
        
        {isLoading ? (
          <NeoGlassSection className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            <p className="text-gray-300">Loading career goals...</p>
          </NeoGlassSection>
        ) : goals ? (
          <div className="career-capsule-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '24px',
            width: '100%'
          }}>
            {/* Display all goals as an array - our backend now always returns an array */}
            {Array.isArray(goals) && goals.length > 0 ? (
              goals.map((goal: CareerGoal) => (
                <NeoGlassSection key={goal.id} className="hover:transform hover:translate-y-[-5px] transition-all duration-300">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-white">{goal.title}</h3>
                      <Badge 
                        className={`${getStatusColor(goal.status || "not_started")} neo-glass-badge`}
                      >
                        {goal.status === "in_progress" ? "In Progress" : 
                         goal.status === "completed" ? "Completed" : 
                         goal.status === "abandoned" ? "Abandoned" : "Not Started"}
                      </Badge>
                    </div>
                    <div className="text-gray-300 mb-3">
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-sm">{getGoalTypeText(goal.goalType as GoalType)}</span>
                        <span className="text-sm">Target: {formatDate(String(goal.targetDate || ""))}</span>
                      </div>
                    </div>
                    <div className="mb-3">
                      <Progress value={goal.progress || 0} className="h-2" />
                      <span className="text-xs text-gray-400 mt-1 block">
                        {goal.progress || 0}% complete
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-gray-300 mb-4">{goal.description || "No description provided"}</p>
                    <div className="pt-2 border-t border-gray-700">
                      <Button 
                        variant="outline" 
                        className="w-full px-5 py-2 rounded-md border border-gray-600 text-white hover:bg-white/5 shadow-sm font-medium transition-all flex items-center justify-center" 
                        onClick={() => handleViewDetails(goal.id)}
                      >
                        <span>View Details</span>
                      </Button>
                    </div>
                  </div>
                </NeoGlassSection>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-gray-300">No career goals found. Create your first career goal to get started.</p>
              </div>
            )}
          </div>
        ) : (
          <NeoGlassSection className="text-center space-y-4 py-16">
            <h2 className="text-xl font-semibold text-white">No career goals yet</h2>
            <p className="text-gray-300 max-w-md mx-auto">
              Set 1-5 year career goals and get AI-generated milestones to help you achieve them.
              Track your progress and stay focused on your career development journey.
            </p>
            <button 
              className="neo-glass-button flex items-center gap-2 py-2 px-4 mt-6"
              onClick={() => setShowCreateDialog(true)}
            >
              <span>Get Started</span>
            </button>
          </NeoGlassSection>
        )}
      </div>

      {/* Dialog for Create Goal */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto neo-glass-card">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Create New Career Goal</DialogTitle>
            <DialogDescription className="text-gray-300">
              Set your career goals with a 1-5 year timeframe and get AI-generated milestones to guide your journey.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basics" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-1">
                <TabsTrigger 
                  value="basics" 
                  className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm rounded-md transition-all duration-200 font-medium"
                >
                  <Target className="h-4 w-4 mr-2" />
                  Goal Basics
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm rounded-md transition-all duration-200 font-medium"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="timeline" 
                  className="text-white/70 data-[state=active]:text-white data-[state=active]:bg-white/10 data-[state=active]:backdrop-blur-sm rounded-md transition-all duration-200 font-medium"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basics" className="space-y-6 pt-6">
                <div className="space-y-6">
                  {/* Goal Title */}
                  <div className="space-y-2">
                    <label className="text-white font-medium text-sm flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Goal Title
                    </label>
                    <input
                      value={goalTitle}
                      onChange={(e) => setGoalTitle(e.target.value)}
                      placeholder="e.g. Become a Product Manager"
                      className="neo-glass-input"
                      required
                    />
                  </div>

                  {/* Goal Type */}
                  <div className="space-y-2">
                    <label className="text-white font-medium text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Goal Type
                    </label>
                    <div className="relative">
                      <select
                        value={goalType}
                        onChange={(e) => setGoalType(e.target.value as GoalType)}
                        className="neo-glass-input appearance-none cursor-pointer pr-10"
                        required
                      >
                        <option value="position_change">Position Change</option>
                        <option value="skill_acquisition">Skill Acquisition</option>
                        <option value="promotion">Promotion</option>
                        <option value="industry_switch">Industry Switch</option>
                        <option value="entrepreneurship">Entrepreneurship</option>
                        <option value="certification">Certification</option>
                        <option value="education">Education</option>
                        <option value="custom">Custom</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-6 pt-6">
                <div className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-white font-medium text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your career goal in detail. What do you want to achieve? Why is this important to you? What specific outcomes are you looking for?"
                      className="neo-glass-input resize-none h-32"
                    />
                  </div>

                  {/* AI Note */}
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm mb-1">AI-Powered Milestones</h4>
                        <p className="text-gray-300 text-sm">
                          Musk AI will automatically generate personalized milestones for your goal based on your goal type, timeframe, and description. These milestones will be tailored to your specific career path and industry.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-6 pt-6">
                <div className="space-y-6">
                  {/* Timeframe */}
                  <div className="space-y-2">
                    <label className="text-white font-medium text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Timeframe
                    </label>
                    <div className="relative">
                      <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                        className="neo-glass-input appearance-none cursor-pointer pr-10"
                        required
                      >
                        <option value="1">1 year</option>
                        <option value="2">2 years</option>
                        <option value="3">3 years</option>
                        <option value="4">4 years</option>
                        <option value="5">5 years</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
                    </div>
                  </div>

                  {/* Target Date (Optional) */}
                  <div className="space-y-2">
                    <label className="text-white font-medium text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Target Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="neo-glass-input"
                    />
                    <p className="text-white/60 text-xs">
                      Leave blank to automatically calculate based on timeframe
                    </p>
                  </div>

                  {/* Timeline Visualization */}
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h4 className="text-white font-medium text-sm mb-3">Timeline Preview</h4>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mb-1"></div>
                        <span className="text-xs text-white/70">Start</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                      <div className="text-center">
                        <div className="w-3 h-3 rounded-full bg-purple-500 mb-1"></div>
                        <span className="text-xs text-white/70">{timeframe} Year{parseInt(timeframe) > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="flex justify-between items-center pt-6 border-t border-white/10 mt-6">
              <div className="text-sm text-white/60">
                All fields will be saved and you can edit them later
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowCreateDialog(false)}
                  className="neo-glass-button flex items-center gap-2 py-2 px-4"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="neo-glass-button flex items-center gap-2 py-2 px-4 bg-blue-600/20 border-blue-500/30 hover:bg-blue-600/30"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      <span>Create Goal</span>
                    </>
                  )}
                </button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog after goal and milestone creation */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px] neo-glass-modal">
          <DialogHeader>
            <DialogTitle className="flex items-center text-white">
              <CheckCircle className="mr-2 h-6 w-6" />
              Career Goal Created Successfully
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Musk AI has crafted a personalized roadmap for your career goal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="neo-glass-highlight p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2 text-white">What happens next?</h3>
              <ul className="space-y-2 text-sm text-gray-200">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-white mt-0.5" />
                  <span>Your goal has been added to your Career Capsule</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-white mt-0.5" />
                  <span>AI-generated milestones have been created to guide your journey</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-white mt-0.5" />
                  <span>You can track your progress and update milestones as you complete them</span>
                </li>
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => {
                setShowSuccessDialog(false);
                if (createdGoalId) {
                  setSelectedGoalId(createdGoalId);
                  setShowDetailsDialog(true);
                }
              }}
              className="neo-glass-button"
            >
              View Goal Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto neo-glass-modal">
          <DialogHeader>
            <DialogTitle className="text-white">
              {goalDetails && typeof goalDetails === 'object' ? 
                (goalDetails.goal?.title || goalDetails.title || "Goal Details") : 
                "Goal Details"
              }
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              {goalDetails && typeof goalDetails === 'object' ? 
                (goalDetails.goal?.description || goalDetails.description || "Loading goal details...") : 
                "Loading goal details..."
              }
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
              <p className="text-gray-300 text-sm">Loading goal details...</p>
            </div>
          ) : goalDetails ? (
            <div className="space-y-6 py-4">
              <div className="flex flex-col md:flex-row md:justify-between gap-4 p-4 neo-glass-highlight rounded-lg mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Goal Type</p>
                  <p className="text-sm text-gray-300">
                    {getGoalTypeText(
                      (goalDetails.goal?.goalType || goalDetails.goalType) as GoalType
                    )}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Target Date</p>
                  <p className="text-sm text-gray-300">
                    {formatDate(
                      (goalDetails.goal?.targetDate || goalDetails.targetDate) as string
                    )}
                  </p>
                </div>
                {/* Progress bar removed */}
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium text-white">Milestones</h3>
                  {(!goalDetails || !goalDetails.milestones || 
                    (goalDetails.milestones && goalDetails.milestones.length === 0)) && (
                    <Button 
                      size="sm" 
                      className="neo-glass-button"
                      onClick={() => {
                        if (selectedGoalId && goalDetails) {
                          console.log("Generating milestones for goal:", selectedGoalId);
                          console.log("Goal details:", goalDetails);
                          generateMilestones.mutate({
                            goalType: goalDetails.goal?.goalType || goalDetails.goalType,
                            description: goalDetails.goal?.description || goalDetails.description,
                            timeframe: goalDetails.goal?.timeframe || goalDetails.timeframe,
                          });
                        }
                      }}
                      disabled={generateMilestones.isPending}
                    >
                      {generateMilestones.isPending ? (
                        <span className="flex items-center">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </span>
                      ) : (
                        "Generate AI Milestones"
                      )}
                    </Button>
                  )}
                </div>
                
                {generateMilestones.isPending && (
                  <div className="mb-3 p-4 rounded-lg neo-glass-loading">
                    <div className="flex items-center text-white font-medium mb-1">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Musk AI is generating your career milestones
                    </div>
                    <p className="text-sm text-gray-300">
                      This may take a moment as Musk analyzes your goal, profile, and current market trends to create personalized milestones.
                    </p>
                  </div>
                )}
                
                {/* Debug info about milestones data */}
                {console.log('Milestone debug info:', { 
                  hasGoalDetails: !!goalDetails,
                  hasMilestonesProperty: goalDetails && 'milestones' in goalDetails,
                  milestonesType: goalDetails && goalDetails.milestones ? typeof goalDetails.milestones : 'undefined',
                  milestonesIsArray: goalDetails && goalDetails.milestones && Array.isArray(goalDetails.milestones),
                  milestonesLength: goalDetails && goalDetails.milestones && Array.isArray(goalDetails.milestones) ? goalDetails.milestones.length : 0,
                  firstMilestone: goalDetails && goalDetails.milestones && Array.isArray(goalDetails.milestones) && goalDetails.milestones.length > 0 ? 
                    { 
                      ...goalDetails.milestones[0], 
                      hasTasks: !!goalDetails.milestones[0].tasks, 
                      tasksLength: goalDetails.milestones[0].tasks ? goalDetails.milestones[0].tasks.length : 0 
                    } : 'none'
                })}
                
                {goalDetails && goalDetails.milestones && goalDetails.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {goalDetails.milestones.map((milestone, index) => {
                      console.log(`Rendering milestone ${index}: id=${milestone.id}, title=${milestone.title}`);
                      console.log(`Milestone ${index} has ${milestone.tasks ? milestone.tasks.length : 0} tasks`);
                      
                      return (
                        <div key={milestone.id} className={`neo-glass-highlight rounded-lg p-4 ${
                          milestone.status === "completed" ? 'border-l-2 border-green-500/50' : ''
                        }`}>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-white">{milestone.title}</h4>
                              {milestone.status === "completed" && (
                                <CheckCircle2 className="h-4 w-4 text-green-400" />
                              )}
                            </div>
                            <Badge 
                              className={`${getStatusColor(milestone.status)} neo-glass-badge`}
                            >
                              {milestone.status === "in_progress" ? "In Progress" : 
                               milestone.status === "completed" ? "Completed" : 
                               milestone.status === "abandoned" ? "Abandoned" : "Not Started"}
                            </Badge>
                          </div>
                          <p className="text-sm mt-1 text-gray-300">{milestone.description}</p>
                          {milestone.targetDate && (
                            <p className="text-xs text-gray-400 mt-2">
                              Due: {formatDate(milestone.targetDate as string)}
                            </p>
                          )}
                          
                          {/* Task progress calculation */}
                          {milestone.tasks && milestone.tasks.length > 0 && (
                            <>
                              <div className="mt-3">
                                {/* Calculate milestone progress */}
                                {(() => {
                                  const totalTasks = milestone.tasks.length;
                                  const completedTasks = milestone.tasks.filter(t => t.isCompleted).length;
                                  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
                                  
                                  return (
                                    <>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-300">{completedTasks} of {totalTasks} tasks completed</span>
                                        <span className="font-medium text-white">{progressPercentage}%</span>
                                      </div>
                                      <div className="w-full bg-gray-800/50 h-2 rounded-full overflow-hidden mb-3 backdrop-blur-sm border border-gray-700/30">
                                        <div 
                                          className="h-full bg-gradient-to-r from-white/20 to-white/40 transition-all duration-500 ease-in-out" 
                                          style={{ width: `${progressPercentage}%` }}
                                        />
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </>
                          )}
                          
                          {/* Display tasks for this milestone */}
                          {milestone.tasks && milestone.tasks.length > 0 ? (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-2 text-white">Tasks:</h5>
                              <div className="space-y-2">
                                {milestone.tasks.map((task, taskIndex) => {
                                  console.log(`Rendering task ${taskIndex} for milestone ${index}: id=${task.id}, title=${task.title}`);
                                  
                                  // Handler for toggling task completion
                                  const handleToggleTask = () => {
                                    if (toggleTaskCompletion.isPending) {
                                      console.log('Task toggle mutation is already pending');
                                      return;
                                    }
                                    
                                    console.log(`Toggling task completion for task ${task.id}, current status: ${task.isCompleted ? 'Completed' : 'Not Completed'}`);
                                    toggleTaskCompletion.mutate(task.id);
                                  };
                                  
                                  const isBeingToggled = toggleTaskCompletion.isPending && toggleTaskCompletion.variables === task.id;
                                  
                                  return (
                                    <div 
                                      key={task.id} 
                                      className={`bg-gray-800/30 backdrop-blur-[5px] p-3 rounded-lg transition-all duration-300 border border-gray-700/40 ${
                                        isBeingToggled ? 'scale-[1.02] shadow-md' : ''
                                      } ${
                                        task.isCompleted ? 'border-l-2 border-green-500/50' : ''
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <Button 
                                            size="icon" 
                                            variant="ghost" 
                                            className={`h-6 w-6 rounded-full transition-colors backdrop-blur-[3px] ${
                                              task.isCompleted ? 'text-green-400 bg-green-500/5' : 'text-gray-300 hover:bg-gray-700/30'
                                            } ${
                                              isBeingToggled ? 'bg-gray-700/50' : ''
                                            }`}
                                            onClick={handleToggleTask}
                                            disabled={toggleTaskCompletion.isPending}
                                          >
                                            {isBeingToggled ? (
                                              <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : task.isCompleted ? (
                                              <CheckCircle2 className="h-5 w-5" />
                                            ) : (
                                              <div className="h-5 w-5 rounded-full border-2 border-current" />
                                            )}
                                          </Button>
                                          <span className={`font-medium text-sm transition-all ${
                                            task.isCompleted ? 'line-through text-gray-400' : 'text-white'
                                          }`}>
                                            {task.title}
                                          </span>
                                        </div>
                                        <Badge 
                                          variant="outline"
                                          className={`transition-colors neo-glass-badge ${
                                            task.isCompleted ? "bg-green-500/10 text-green-300 border-green-500/30" : "text-gray-300 border-gray-700"
                                          }`}
                                        >
                                          {task.isCompleted ? "Completed" : "Pending"}
                                        </Badge>
                                      </div>
                                      <div className={`text-xs mt-1 ml-8 whitespace-pre-line transition-colors ${
                                        task.isCompleted ? 'text-gray-400' : 'text-gray-300'
                                      }`}>
                                        {task.description}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs italic mt-2 text-gray-400">No tasks defined for this milestone</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-300 p-3 bg-gray-800/30 backdrop-blur-sm rounded-lg">
                    {generateMilestones.isPending 
                      ? "Generating milestones..." 
                      : "No milestones yet. Click the button above to have Musk AI generate personalized milestones for your career goal."}
                  </p>
                )}
              </div>
              

              
              {/* Progress Log section removed as requested */}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-300">Failed to load goal details.</p>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                className="hover:bg-red-700/70 border-red-700/30 bg-red-800/30 text-red-200"
                onClick={() => handleOpenDeleteDialog(selectedGoalId || 0)}
              >
                Delete Career Capsule
              </Button>
            </div>
            <Button 
              onClick={() => setShowDetailsDialog(false)}
              className="neo-glass-button"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px] neo-glass-modal">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Career Capsule</DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete this career capsule? This action cannot be undone, and all associated milestones and skills will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 border border-red-600/40 bg-red-500/10 rounded-lg">
              <h4 className="font-medium flex items-center text-red-300">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Warning
              </h4>
              <p className="text-sm text-gray-300 mt-1">
                Deleting this career capsule will remove all your progress tracking for this goal.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              className="neo-glass-button-outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setCapsuleToDelete(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="hover:bg-red-700/70 border-red-700/30 bg-red-800/30 text-red-200"
              onClick={handleDeleteCapsule}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
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
import { Loader2, CheckCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";

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
    useRegenerateMilestones
  } = useCareerCapsule(userId);
  
  const { data: goals, isLoading, refetch: refetchGoals, error } = useGoals();
  
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
  const regenerateMilestones = useRegenerateMilestones(selectedGoalId || 0);
  const [showMilestoneGenerationDialog, setShowMilestoneGenerationDialog] = useState(false);
  const [isRegeneratingMilestones, setIsRegeneratingMilestones] = useState(false);

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
  
  // Handle regenerating milestones
  const handleRegenerateMilestones = async () => {
    if (!selectedGoalId) return;
    
    console.log(`Starting milestone regeneration for capsule ${selectedGoalId}...`);
    setIsRegeneratingMilestones(true);
    
    try {
      // Call the API to regenerate milestones
      await regenerateMilestones.mutateAsync();
      
      toast({
        title: "Milestones regenerated",
        description: "Musk AI has regenerated your milestones with the latest improved AI model.",
      });
      
      // Close the details dialog after regeneration
      setShowDetailsDialog(false);
      
      // Refresh the goals list
      refetchGoals();
      
    } catch (error) {
      console.error("Error regenerating milestones:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate milestones. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingMilestones(false);
    }
  };

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
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Career Capsule</h1>
          <Button onClick={() => setShowCreateDialog(true)}>Create New Goal</Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : goals ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Case 1: goals is an array */}
            {Array.isArray(goals) && goals.map((goal: CareerGoal) => (
              <Card key={goal.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <Badge 
                      className={getStatusColor(goal.status)}
                    >
                      {goal.status === "in_progress" ? "In Progress" : 
                       goal.status === "completed" ? "Completed" : 
                       goal.status === "abandoned" ? "Abandoned" : "Not Started"}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-sm">{getGoalTypeText(goal.goalType as GoalType)}</span>
                      <span className="text-sm">Target: {formatDate(goal.targetDate as string)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-3">
                    <Progress value={goal.progress || 0} className="h-2" />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {goal.progress || 0}% complete
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm">{goal.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleViewDetails(goal.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Case 2: goals contains a goals property that is an array */}
            {!Array.isArray(goals) && goals.goals && Array.isArray(goals.goals) && goals.goals.map((goal: CareerGoal) => (
              <Card key={goal.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{goal.title}</CardTitle>
                    <Badge 
                      className={getStatusColor(goal.status)}
                    >
                      {goal.status === "in_progress" ? "In Progress" : 
                       goal.status === "completed" ? "Completed" : 
                       goal.status === "abandoned" ? "Abandoned" : "Not Started"}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-sm">{getGoalTypeText(goal.goalType as GoalType)}</span>
                      <span className="text-sm">Target: {formatDate(goal.targetDate as string)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-3">
                    <Progress value={goal.progress || 0} className="h-2" />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {goal.progress || 0}% complete
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm">{goal.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleViewDetails(goal.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* Case 3: goals is a single object (not an array) and has no goals property */}
            {!Array.isArray(goals) && (!goals.goals || !Array.isArray(goals.goals)) && goals.id && (
              <Card className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{goals.title}</CardTitle>
                    <Badge 
                      className={getStatusColor(goals.status)}
                    >
                      {goals.status === "in_progress" ? "In Progress" : 
                       goals.status === "completed" ? "Completed" : 
                       goals.status === "abandoned" ? "Abandoned" : "Not Started"}
                    </Badge>
                  </div>
                  <CardDescription>
                    <div className="flex flex-col gap-1 mt-1">
                      <span className="text-sm">{getGoalTypeText(goals.goalType as GoalType)}</span>
                      <span className="text-sm">Target: {formatDate(goals.targetDate as string)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="mb-3">
                    <Progress value={goals.progress || 0} className="h-2" />
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {goals.progress || 0}% complete
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm">{goals.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleViewDetails(goals.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            )}
          </div>
        ) : (
          <div className="text-center space-y-4 py-16 bg-muted/20 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">No career goals yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Set 1-5 year career goals and get AI-generated milestones to help you achieve them.
              Track your progress and stay focused on your career development journey.
            </p>
            <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>Get Started</Button>
          </div>
        )}
      </div>

      {/* Dialog for Create Goal */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Career Goal</DialogTitle>
            <DialogDescription>
              Set your career goals with a 1-5 year timeframe and get AI-generated milestones.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-5 py-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="goal-title" className="text-sm font-medium">
                Goal Title
              </label>
              <input
                id="goal-title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Become a Product Manager"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="goal-type" className="text-sm font-medium">
                Goal Type
              </label>
              <select
                id="goal-type"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            </div>
            
            <div className="space-y-2">
              <label htmlFor="timeframe" className="text-sm font-medium">
                Timeframe (years)
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your career goal in detail..."
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="mt-2 bg-muted/20 p-3 rounded-md">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Note:</span> AI milestones will be automatically generated for your goal based on its type and timeframe.
              </p>
            </div>
            
            <DialogFooter className="flex space-x-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog after goal and milestone creation */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center text-primary">
              <CheckCircle className="mr-2 h-6 w-6" />
              Career Goal Created Successfully
            </DialogTitle>
            <DialogDescription>
              Musk AI has crafted a personalized roadmap for your career goal.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-6">
            <div className="bg-muted/30 p-4 rounded-md mb-4">
              <h3 className="font-medium mb-2">What happens next?</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-primary mt-0.5" />
                  <span>Your goal has been added to your Career Capsule</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-primary mt-0.5" />
                  <span>AI-generated milestones have been created to guide your journey</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-primary mt-0.5" />
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
            >
              View Goal Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            <div className="absolute right-0 top-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive"
                onClick={() => {
                  if (selectedGoalId) {
                    handleOpenDeleteDialog(selectedGoalId);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
                <span className="sr-only">Delete</span>
              </Button>
            </div>
            <DialogTitle>
              {goalDetails && typeof goalDetails === 'object' ? 
                (goalDetails.goal?.title || goalDetails.title || "Goal Details") : 
                "Goal Details"
              }
            </DialogTitle>
            <DialogDescription>
              {goalDetails && typeof goalDetails === 'object' ? 
                (goalDetails.goal?.description || goalDetails.description || "Loading goal details...") : 
                "Loading goal details..."
              }
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : goalDetails ? (
            <div className="space-y-6 py-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium">Goal Type</p>
                  <p className="text-sm">
                    {getGoalTypeText(
                      (goalDetails.goal?.goalType || goalDetails.goalType) as GoalType
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Target Date</p>
                  <p className="text-sm">
                    {formatDate(
                      (goalDetails.goal?.targetDate || goalDetails.targetDate) as string
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Progress</p>
                  <p className="text-sm">
                    {(goalDetails.goal?.progress || goalDetails.progress || 0)}%
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-medium">Milestones</h3>
                  {(!goalDetails || !goalDetails.milestones || 
                    (goalDetails.milestones && goalDetails.milestones.length === 0)) && (
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (selectedGoalId && goalDetails) {
                          console.log("Generating milestones for goal:", selectedGoalId);
                          console.log("Goal details:", goalDetails);
                          generateMilestones.mutate({
                            goalType: goalDetails.goal?.goalType || goalDetails.goalType,
                            description: goalDetails.goal?.description || goalDetails.description,
                            timeframe: goalDetails.goal?.timeframe || goalDetails.timeframe,
                            useModel: 'openai', // Default to OpenAI
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
                  <Alert className="mb-3 bg-muted/30">
                    <AlertTitle className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Musk AI is generating your career milestones
                    </AlertTitle>
                    <AlertDescription>
                      This may take a moment as Musk analyzes your goal, profile, and current market trends to create personalized milestones.
                    </AlertDescription>
                  </Alert>
                )}
                
                {goalDetails && goalDetails.milestones && goalDetails.milestones.length > 0 ? (
                  <div className="space-y-4">
                    {goalDetails.milestones.map((milestone) => (
                      <div key={milestone.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{milestone.title}</h4>
                          <Badge 
                            className={getStatusColor(milestone.status)}
                          >
                            {milestone.status === "in_progress" ? "In Progress" : 
                             milestone.status === "completed" ? "Completed" : 
                             milestone.status === "abandoned" ? "Abandoned" : "Not Started"}
                          </Badge>
                        </div>
                        <p className="text-sm mt-1">{milestone.description}</p>
                        {milestone.targetDate && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Due: {formatDate(milestone.targetDate as string)}
                          </p>
                        )}
                        
                        {/* Display tasks for this milestone */}
                        {milestone.tasks && milestone.tasks.length > 0 && (
                          <div className="mt-3">
                            <h5 className="text-sm font-medium mb-2">Tasks:</h5>
                            <div className="space-y-2">
                              {milestone.tasks.map((task) => (
                                <div key={task.id} className="bg-muted/30 p-2 rounded-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">{task.title}</span>
                                    <Badge 
                                      variant="outline"
                                      className={task.isCompleted ? "bg-green-100 text-green-800" : ""}
                                    >
                                      {task.isCompleted ? "Completed" : "Pending"}
                                    </Badge>
                                  </div>
                                  <div className="text-xs mt-1 whitespace-pre-line">
                                    {task.description}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {generateMilestones.isPending 
                      ? "Generating milestones..." 
                      : "No milestones yet. Click the button above to have Musk AI generate personalized milestones for your career goal."}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Required Skills</h3>
                {goalDetails && goalDetails.skills && goalDetails.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {goalDetails.skills.map((skill) => (
                      <Badge key={skill.id} variant="outline" className="py-1 px-2">
                        {skill.skillName}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills defined for this goal yet.</p>
                )}
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Progress Log</h3>
                {goalDetails && goalDetails.progressLogs && goalDetails.progressLogs.length > 0 ? (
                  <div className="space-y-3">
                    {goalDetails.progressLogs.map((log) => (
                      <div key={log.id} className="bg-muted/20 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-medium uppercase">
                            {log.entryType}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(log.createdAt as string)}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{log.entry}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No progress entries yet.</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-4">Failed to load goal details.</p>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => handleOpenDeleteDialog(selectedGoalId || 0)}
              >
                Delete Career Capsule
              </Button>
              <Button 
                variant="outline"
                onClick={handleRegenerateMilestones}
                disabled={isRegeneratingMilestones}
              >
                {isRegeneratingMilestones ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Regenerating...
                  </>
                ) : (
                  "Regenerate Milestones"
                )}
              </Button>
            </div>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Career Capsule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this career capsule? This action cannot be undone, and all associated milestones, skills, and progress logs will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert variant="destructive">
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Deleting this career capsule will remove all your progress tracking for this goal.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
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
import { useState, FormEvent, useEffect } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCareerCapsule, CareerGoal, GoalType } from "@/hooks/use-career-capsule";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";
import { Loader2, CheckCircle, CheckCircle2, Plus, Calendar, Target, Award, Briefcase } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Import our custom components
import GoalSummary from "@/components/career-capsule/goal-summary";
import MilestoneTimeline, { MilestoneTask, MilestoneYear } from "@/components/career-capsule/milestone-timeline";

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
  
  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [goalTitle, setGoalTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("position_change");
  const [timeframe, setTimeframe] = useState("3");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Selected goal for details view
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const { data: goalDetails, isLoading: isLoadingDetails } = useGoalDetails(selectedGoalId || 0);
  const createGoalMutation = useCreateGoal();
  const deleteCapsuleMutation = useDeleteCapsule();
  
  // Task related mutations
  const toggleTaskCompletion = useToggleTaskCompletion(selectedGoalId || 0);
  const updateTask = useUpdateTask(selectedGoalId || 0);

  // Delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State for tracking milestone generation
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null);
  const [milestoneGenerating, setMilestoneGenerating] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  
  // Active tab for goal view
  const [activeTab, setActiveTab] = useState("all");
  
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
            industry,
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
  }, [createdGoalId, goalType, timeframe, description, goalTitle, industry, generateMilestonesAfterCreation, milestoneGenerating]);

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
        industry: industry,
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
      setIndustry("");
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
    setCapsuleToDelete(capsuleId);
    setShowDeleteDialog(true);
  };
  
  const handleToggleTask = async (taskId: number) => {
    try {
      await toggleTaskCompletion.mutateAsync(taskId);
    } catch (error) {
      console.error("Error toggling task completion:", error);
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleUpdateTask = async (taskId: number, taskData: Partial<MilestoneTask>) => {
    try {
      await updateTask.mutateAsync({ taskId, taskData });
      toast({
        title: "Task updated",
        description: "The task has been successfully updated.",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCapsule = async () => {
    if (!capsuleToDelete) return;
    
    setIsDeleting(true);
    try {
      // Call the API to delete the capsule
      await deleteCapsuleMutation.mutateAsync(capsuleToDelete);
      
      // Update UI state
      setShowDeleteDialog(false);
      setCapsuleToDelete(null);
      
      // If we're deleting the currently viewed goal, close the details dialog
      if (selectedGoalId === capsuleToDelete) {
        setShowDetailsDialog(false);
        setSelectedGoalId(null);
      }
      
      // Force a strong refresh by invalidating all goal-related queries
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-capsule`] });
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/career-goals`] });
      
      toast({
        title: "Career capsule deleted",
        description: "The career capsule has been successfully deleted."
      });
      
      // Force a manual refresh after a small delay to ensure the backend has processed the deletion
      setTimeout(() => {
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
    }
  };

  // Filter goals based on active tab
  const filteredGoals = Array.isArray(goals) ? goals.filter(goal => {
    if (activeTab === 'all') return true;
    if (activeTab === 'in_progress') return goal.status === 'in_progress';
    if (activeTab === 'completed') return goal.status === 'completed';
    if (activeTab === 'not_started') return goal.status === 'not_started' || !goal.status;
    return true;
  }) : [];

  // Transform milestone data for the timeline component
  const transformMilestonesToYears = (): MilestoneYear[] => {
    if (!goalDetails || !goalDetails.milestones || !Array.isArray(goalDetails.milestones)) {
      return [];
    }

    // Group milestones by year (assuming they have a year property)
    const yearGroups: Record<number, any[]> = {};
    goalDetails.milestones.forEach(milestone => {
      const year = milestone.year || 1;
      if (!yearGroups[year]) {
        yearGroups[year] = [];
      }
      yearGroups[year].push(milestone);
    });

    // Convert to MilestoneYear format
    return Object.entries(yearGroups).map(([yearNum, milestones]) => {
      const year = parseInt(yearNum);
      const firstMilestone = milestones[0];
      
      // Calculate progress based on completed tasks
      let completedTasks = 0;
      let totalTasks = 0;
      
      // Collect tasks from all milestones in this year
      const tasks: MilestoneTask[] = [];
      milestones.forEach(milestone => {
        if (milestone.tasks && Array.isArray(milestone.tasks)) {
          totalTasks += milestone.tasks.length;
          completedTasks += milestone.tasks.filter((t: any) => t.isCompleted).length;
          
          tasks.push(...milestone.tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            isCompleted: task.isCompleted,
            dueDate: task.dueDate,
            priority: task.priority || (task.order ? 4 - task.order : 2) // Convert order to priority if needed
          })));
        }
      });
      
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      
      return {
        id: firstMilestone.id,
        year,
        title: `Year ${year}: ${firstMilestone.title || 'Milestone'}`,
        description: firstMilestone.description || '',
        milestone: firstMilestone.milestone || firstMilestone.description || '',
        progress,
        tasks,
      };
    }).sort((a, b) => a.year - b.year); // Sort by year
  };

  return (
    <PageLayout title="Career Capsule">
      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Career Capsule</h1>
            <p className="text-muted-foreground mt-1">
              Set and track your professional goals over 1-5 years with AI-powered milestones
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateDialog(true)} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create New Goal
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : goals && Array.isArray(goals) && goals.length > 0 ? (
          <div>
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>All Goals</span>
                </TabsTrigger>
                <TabsTrigger value="in_progress" className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  <span>In Progress</span>
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completed</span>
                </TabsTrigger>
                <TabsTrigger value="not_started" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Not Started</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.length > 0 ? (
                filteredGoals.map((goal: CareerGoal) => (
                  <GoalSummary
                    key={goal.id}
                    goal={{
                      ...goal,
                      targetDate: goal.targetDate || "",
                      status: goal.status || "not_started",
                    }}
                    onViewDetails={handleViewDetails}
                    onDelete={handleOpenDeleteDialog}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-8 bg-muted/20 rounded-lg">
                  <p className="text-muted-foreground">No goals found matching the selected filter.</p>
                </div>
              )}
            </div>
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
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="position_change">Position Change</option>
                <option value="skill_acquisition">Skill Acquisition</option>
                <option value="promotion">Promotion</option>
                <option value="industry_switch">Industry Switch</option>
                <option value="entrepreneurship">Entrepreneurship</option>
                <option value="relocation">Relocation</option>
                <option value="education">Education</option>
                <option value="certification">Certification</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="industry" className="text-sm font-medium">
                Industry (Optional)
              </label>
              <input
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Technology, Healthcare, Finance"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="timeframe" className="text-sm font-medium">
                Timeframe (Years)
              </label>
              <select
                id="timeframe"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="1">1 Year</option>
                <option value="2">2 Years</option>
                <option value="3">3 Years</option>
                <option value="4">4 Years</option>
                <option value="5">5 Years</option>
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
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-primary">Note:</span> AI milestones will be automatically generated for your goal based on its type and timeframe.
              </p>
            </div>
            
            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Goal"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog after goal creation */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Goal Created Successfully
            </DialogTitle>
            <DialogDescription>
              Your career goal has been created with AI-generated milestones.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Success</AlertTitle>
              <AlertDescription className="space-y-2">
                <div className="flex items-center gap-2 mt-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>AI-generated milestones have been created to guide your journey</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span>You can track your progress and update milestones as you complete them</span>
                </div>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {goalDetails?.goal?.title || "Goal Details"}
            </DialogTitle>
            <DialogDescription>
              {goalDetails?.goal?.description || "Loading goal details..."}
            </DialogDescription>
          </DialogHeader>
          
          <Separator className="my-4" />
          
          <div className="py-1">
            {isLoadingDetails ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Goal summary info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <span className="font-medium">{getGoalTypeText(goalDetails?.goal?.goalType as GoalType)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Target Date</span>
                    <span className="font-medium">{formatDate(String(goalDetails?.goal?.targetDate || ""))}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Industry</span>
                    <span className="font-medium">{goalDetails?.goal?.industry || "Not specified"}</span>
                  </div>
                </div>
                
                {/* Milestone timeline */}
                <MilestoneTimeline 
                  years={transformMilestonesToYears()}
                  goalId={selectedGoalId || 0}
                  onToggleTask={handleToggleTask}
                  onEditTask={handleUpdateTask}
                  isLoading={isLoadingDetails}
                />
              </div>
            )}
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="destructive"
              onClick={() => handleOpenDeleteDialog(selectedGoalId!)}
            >
              Delete Goal
            </Button>
            <Button
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Career Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this career goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Deleting this goal will remove all associated milestones and progress data.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
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
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Goal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
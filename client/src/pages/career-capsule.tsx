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
    useDeleteCapsule
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
  const generateMilestones = useGenerateMilestones();
  
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
  
  // Form submission handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!goalTitle || !goalType || !description || !timeframe) {
      toast({
        title: "Missing Fields",
        description: "Please fill out all required fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await createGoalMutation.mutateAsync({
        title: goalTitle,
        goalType,
        description,
        timeframe: parseInt(timeframe, 10),
      });
      
      console.log("Goal created:", response);
      
      // Reset form state
      setGoalTitle("");
      setGoalType("position_change");
      setTimeframe("3");
      setDescription("");
      setTargetDate("");
      setShowCreateDialog(false);
      
      // Refetch goals
      await refetchGoals();
      
      // Show success message
      toast({
        title: "Career Capsule Created",
        description: "Your new career goal has been added to your capsules",
      });
      
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Failed to Create Capsule",
        description: "There was a problem creating your career capsule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Open goal details dialog
  const handleViewDetails = (goalId: number) => {
    setSelectedGoalId(goalId);
    setShowDetailsDialog(true);
  };
  
  // Handle opening delete dialog
  const handleOpenDeleteDialog = (goalId: number) => {
    setCapsuleToDelete(goalId);
    setShowDetailsDialog(false);
    setShowDeleteDialog(true);
  };
  
  // Handle delete capsule
  const handleDeleteCapsule = async () => {
    if (!capsuleToDelete) return;
    
    setIsDeleting(true);
    
    try {
      await deleteCapsuleMutation.mutateAsync(capsuleToDelete);
      setShowDeleteDialog(false);
      
      // Refetch goals
      await refetchGoals();
      
      // Show success message
      toast({
        title: "Career Capsule Deleted",
        description: "Your career capsule has been deleted",
      });
    } catch (error) {
      console.error("Error deleting capsule:", error);
      toast({
        title: "Failed to Delete Capsule",
        description: "There was a problem deleting your career capsule",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setCapsuleToDelete(null);
    }
  };
  
  return (
    <PageLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Career Capsule</h1>
          <p className="text-muted-foreground">
            Plan and track your career goals with AI-generated milestones
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          Add New Goal
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load career capsules. Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(goals) && goals.map((goal: CareerGoal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{goal.title}</CardTitle>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status === "in_progress" ? "In Progress" : 
                     goal.status === "completed" ? "Completed" : 
                     goal.status === "abandoned" ? "Abandoned" : "Not Started"}
                  </Badge>
                </div>
                <CardDescription>
                  <span className="inline-block mb-1">{getGoalTypeText(goal.goalType as GoalType)}</span>
                  <span className="block">{formatDate(goal.targetDate as string)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="line-clamp-3 text-sm">{goal.description}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  <Progress value={goal.progress || 0} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
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
          
          {/* Handle non-array format for backwards compatibility */}
          {!Array.isArray(goals) && goals && goals.goals && Array.isArray(goals.goals) && goals.goals.map((goal: CareerGoal) => (
            <Card key={goal.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle>{goal.title}</CardTitle>
                  <Badge className={getStatusColor(goal.status)}>
                    {goal.status === "in_progress" ? "In Progress" : 
                     goal.status === "completed" ? "Completed" : 
                     goal.status === "abandoned" ? "Abandoned" : "Not Started"}
                  </Badge>
                </div>
                <CardDescription>
                  <span className="inline-block mb-1">{getGoalTypeText(goal.goalType as GoalType)}</span>
                  <span className="block">{formatDate(goal.targetDate as string)}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="line-clamp-3 text-sm">{goal.description}</p>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{goal.progress || 0}%</span>
                  </div>
                  <Progress value={goal.progress || 0} className="h-2" />
                </div>
              </CardContent>
              <CardFooter className="pt-2">
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
          
          {(!goals || 
            (Array.isArray(goals) && goals.length === 0) ||
            (goals && goals.goals && goals.goals.length === 0)) && (
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>No Career Capsules</CardTitle>
                <CardDescription>
                  You haven't set any career goals yet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>
                  Create your first career capsule to get started. Musk AI will help you break down your goal into actionable milestones.
                </p>
              </CardContent>
              <CardFooter>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Add Your First Goal
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}
      
      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Career Capsule</DialogTitle>
            <DialogDescription>
              Define your career goal and Musk AI will help you break it down into milestones
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="goal-title" className="block text-sm font-medium">
                  Goal Title
                </label>
                <input
                  id="goal-title"
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="E.g., Become CTO, Master React, Switch to Product Management"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="goal-type" className="block text-sm font-medium">
                  Goal Type
                </label>
                <select
                  id="goal-type"
                  className="w-full p-2 border rounded-md"
                  value={goalType}
                  onChange={(e) => setGoalType(e.target.value as GoalType)}
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
                <label htmlFor="timeframe" className="block text-sm font-medium">
                  Timeframe (years)
                </label>
                <select
                  id="timeframe"
                  className="w-full p-2 border rounded-md"
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <option value="1">1 Year</option>
                  <option value="2">2 Years</option>
                  <option value="3">3 Years</option>
                  <option value="5">5 Years</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  className="w-full p-2 border rounded-md min-h-[100px]"
                  placeholder="Describe your career goal in detail. Include your current position, skills, and what you want to achieve."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </span>
                ) : (
                  "Create Capsule"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Goal Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <div className="flex justify-end">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                onClick={() => handleOpenDeleteDialog(selectedGoalId || 0)}
                aria-label="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
                    {goalDetails.milestones.map((milestone: any, index: number) => {
                      console.log(`Rendering milestone ${index}: id=${milestone.id}, title=${milestone.title}`);
                      console.log(`Milestone ${index} has ${milestone.tasks ? milestone.tasks.length : 0} tasks`);
                      
                      // Calculate completion percentage
                      const totalTasks = milestone.tasks ? milestone.tasks.length : 0;
                      const completedTasks = milestone.tasks ? milestone.tasks.filter((task: any) => task.isCompleted).length : 0;
                      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
                      
                      // Get year number from milestone title or default to index + 1
                      const yearMatch = milestone.title.match(/Year (\d+)/i);
                      const yearNumber = yearMatch ? parseInt(yearMatch[1]) : index + 1;
                      
                      // Determine status color and icon
                      const statusInfo: any = {
                        "in_progress": { color: "text-amber-600", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
                        "completed": { color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
                        "abandoned": { color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
                        "not_started": { color: "text-gray-600", bgColor: "bg-gray-50", borderColor: "border-gray-200" }
                      };
                      
                      const status = milestone.status || "not_started";
                      const { color, bgColor, borderColor } = statusInfo[status] || statusInfo.not_started;
                      
                      return (
                        <div key={milestone.id} className={`border rounded-lg overflow-hidden ${borderColor} shadow-sm`}>
                          <div className={`${bgColor} border-b ${borderColor} px-4 py-3`}>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center space-x-2">
                                <div className={`w-8 h-8 rounded-full ${color} bg-white border ${borderColor} flex items-center justify-center font-bold text-sm`}>
                                  {yearNumber}
                                </div>
                                <h4 className="font-medium text-gray-900">{milestone.title}</h4>
                              </div>
                              <Badge 
                                className={getStatusColor(milestone.status)}
                              >
                                {milestone.status === "in_progress" ? "In Progress" : 
                                 milestone.status === "completed" ? "Completed" : 
                                 milestone.status === "abandoned" ? "Abandoned" : "Not Started"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="p-4">
                            <p className="text-sm text-gray-700">{milestone.description}</p>
                            
                            {/* Task progress bar */}
                            {totalTasks > 0 && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span>{completedTasks} of {totalTasks} tasks completed</span>
                                  <span>{completionPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${milestone.status === "completed" ? "bg-green-500" : "bg-primary"}`}
                                    style={{ width: `${completionPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                            
                            {milestone.targetDate && (
                              <div className="flex items-center mt-3 text-xs text-gray-500">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                </svg>
                                <span>Target completion: {formatDate(milestone.targetDate as string)}</span>
                              </div>
                            )}
                            
                            {/* Display tasks for this milestone */}
                            {milestone.tasks && milestone.tasks.length > 0 ? (
                              <div className="mt-4">
                                <h5 className="text-sm font-medium mb-3 flex items-center">
                                  <span className="mr-2">Tasks ({milestone.tasks.length})</span>
                                  <div className="h-px bg-gray-200 flex-grow"></div>
                                </h5>
                                <div className="space-y-4">
                                  {milestone.tasks.map((task: any, taskIndex: number) => {
                                    console.log(`Rendering task ${taskIndex} for milestone ${index}: id=${task.id}, title=${task.title}`);
                                    
                                    // Parse task description to extract priority and due date
                                    const hasPriority = task.description.includes("Priority:");
                                    const hasDueDate = task.description.includes("Due Date:");
                                    
                                    // Extract the main description without the metadata
                                    let mainDescription = task.description;
                                    if (hasPriority || hasDueDate) {
                                      mainDescription = task.description.split("\n\n")[0];
                                    }
                                    
                                    // Extract priority
                                    let priority = "High";
                                    if (hasPriority) {
                                      const priorityMatch = task.description.match(/Priority:\s*(High|Medium|Low)/);
                                      if (priorityMatch && priorityMatch[1]) {
                                        priority = priorityMatch[1];
                                      }
                                    }
                                    
                                    // Extract due date
                                    let dueDate = null;
                                    if (hasDueDate) {
                                      const dueDateMatch = task.description.match(/Due Date:\s*(\d{4}-\d{2}-\d{2})/);
                                      if (dueDateMatch && dueDateMatch[1]) {
                                        dueDate = dueDateMatch[1];
                                      }
                                    }
                                    
                                    // Determine priority color
                                    const priorityColor = priority === "High" 
                                      ? "bg-red-100 text-red-800 border-red-200" 
                                      : priority === "Medium" 
                                        ? "bg-amber-100 text-amber-800 border-amber-200"
                                        : "bg-blue-100 text-blue-800 border-blue-200";
                                    
                                    return (
                                      <div key={task.id} className="border border-gray-200 rounded-md overflow-hidden">
                                        <div className="bg-gray-50 p-3 border-b border-gray-200">
                                          <div className="flex items-center justify-between">
                                            <span className="font-semibold text-sm">{task.title}</span>
                                            <div className="flex items-center space-x-2">
                                              {priority && (
                                                <Badge 
                                                  variant="outline"
                                                  className={priorityColor}
                                                >
                                                  {priority} Priority
                                                </Badge>
                                              )}
                                              <Badge 
                                                variant="outline"
                                                className={task.isCompleted 
                                                  ? "bg-green-100 text-green-800 border-green-200" 
                                                  : "bg-gray-100 text-gray-800 border-gray-200"}
                                              >
                                                {task.isCompleted ? "Completed" : "Pending"}
                                              </Badge>
                                            </div>
                                          </div>
                                          {dueDate && (
                                            <div className="flex items-center mt-1 text-xs text-gray-500">
                                              <span className="inline-block">Due: {formatDate(dueDate)}</span>
                                            </div>
                                          )}
                                        </div>
                                        <div className="p-3 text-sm leading-relaxed">
                                          {mainDescription}
                                          
                                          {/* Display other important info from the task description */}
                                          {task.description.includes("CEO SKILL AREA:") && (
                                            <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs">
                                              <p className="font-medium text-blue-800">CEO Skill Area:</p>
                                              <p className="text-blue-700">This task develops critical executive capabilities aligned with industry best practices.</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs italic mt-2">No tasks defined for this milestone</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                <h3 className="text-lg font-medium">Progress Log</h3>
                {goalDetails && goalDetails.progressLogs && goalDetails.progressLogs.length > 0 ? (
                  <div className="space-y-3">
                    {goalDetails.progressLogs.map((log: any) => (
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
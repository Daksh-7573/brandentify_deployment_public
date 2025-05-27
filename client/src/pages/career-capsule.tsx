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
  const {
    goals,
    isLoading,
    error,
    createGoal,
    deleteGoal,
    generateMilestones,
    toggleTaskCompletion,
    markMilestoneComplete,
    getGoalDetails,
  } = useCareerCapsule();

  // Form state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [capsuleToDelete, setCapsuleToDelete] = useState<CareerGoal | null>(null);
  const [goalDetails, setGoalDetails] = useState<any>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [goalType, setGoalType] = useState<GoalType>("position_change");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState("1");
  const [targetDate, setTargetDate] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!user?.numericId) {
      toast({
        title: "Authentication Error",
        description: "Please log in to create career goals.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const goalData = {
        title,
        goalType,
        description,
        timeframe: parseInt(timeframe),
        targetDate: targetDate || new Date(Date.now() + parseInt(timeframe) * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        userId: user.numericId,
      };

      const response = await createGoal(goalData);
      
      if (response && 'id' in response) {
        const goalId = response.id;
        setSelectedGoalId(goalId);
        
        // Reset form
        setTitle("");
        setGoalType("position_change");
        setDescription("");
        setTimeframe("1");
        setTargetDate("");
        
        setShowCreateDialog(false);
        setShowSuccessDialog(true);
        
        toast({
          title: "Success!",
          description: "Your career goal has been created successfully.",
        });
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Error",
        description: "Failed to create career goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCapsule = async () => {
    if (!capsuleToDelete) return;

    setIsDeleting(true);
    try {
      await deleteGoal(capsuleToDelete.id);
      setShowDeleteDialog(false);
      setCapsuleToDelete(null);
      toast({
        title: "Success",
        description: "Career goal deleted successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete career goal.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenDeleteDialog = (goal: CareerGoal) => {
    setCapsuleToDelete(goal);
    setShowDeleteDialog(true);
  };

  const handleViewDetails = async (goalId: number) => {
    try {
      const details = await getGoalDetails(goalId);
      setGoalDetails(details);
      setShowDetailsDialog(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load goal details.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Career Capsule</h1>
          <p className="text-xl text-white/80">
            Plan your next 5 years with clarity. Musk turns your dreams into doable plans.
          </p>
        </div>

        {/* Create Goal Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="neo-glass-button flex items-center gap-2 py-3 px-6"
          >
            <Target className="h-5 w-5" />
            Create New Career Goal
          </Button>
        </div>

        {/* Goals Grid */}
        {goals && Array.isArray(goals) && goals.length > 0 ? (
          <NeoGlassSection>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal: CareerGoal) => (
                <Card key={goal.id} className="neo-glass-card">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-white">{goal.title}</CardTitle>
                        <CardDescription className="text-white/70">
                          {getGoalTypeText(goal.goalType)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(goal.status)}>
                        {goal.status?.replace('_', ' ') || 'Not Started'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-white/80 text-sm line-clamp-3">
                        {goal.description || 'No description provided'}
                      </p>
                      <div className="flex items-center gap-2 text-white/60 text-sm">
                        <Calendar className="h-4 w-4" />
                        {goal.timeframe && `${goal.timeframe} year${goal.timeframe > 1 ? 's' : ''}`}
                        {goal.targetDate && ` • Target: ${formatDate(goal.targetDate)}`}
                      </div>
                      {goal.progress !== undefined && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-white/70">Progress</span>
                            <span className="text-white">{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(goal.id)}
                      className="flex-1 neo-glass-button"
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDeleteDialog(goal)}
                      className="neo-glass-button text-red-400 border-red-400/30 hover:bg-red-500/20"
                    >
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </NeoGlassSection>
        ) : (
          <NeoGlassSection>
            <div className="text-center py-12">
              <Target className="h-16 w-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Career Goals Yet</h3>
              <p className="text-white/70 mb-6">
                Start planning your future by creating your first career goal.
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="neo-glass-button flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                Create Your First Goal
              </Button>
            </div>
          </NeoGlassSection>
        )}
      </div>

      {/* Create Goal Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Career Goal</DialogTitle>
            <DialogDescription>
              Set up a new career goal with AI-powered milestone generation.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Become a Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Goal Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Goal Type</label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value as GoalType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your career goal in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24"
              />
            </div>

            {/* Timeframe */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
              </select>
            </div>

            {/* Target Date (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Date (Optional)</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Create Goal"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Goal Created Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Your career goal has been added and Musk AI will help you achieve it.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <p className="text-sm text-gray-600">
              You can view and manage your goals in the dashboard.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {goalDetails?.goal?.title}
            </DialogTitle>
            <DialogDescription>
              {goalDetails?.goal?.goalType && getGoalTypeText(goalDetails.goal.goalType)} • {goalDetails?.goal?.timeframe} year timeline
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Goal Overview */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Goal Description</h4>
              <p className="text-sm text-gray-600">
                {goalDetails?.goal?.description || 'No description provided'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetailsDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Career Goal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this career goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
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
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
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
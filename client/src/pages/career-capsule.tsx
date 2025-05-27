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
    </PageLayout>
  );
}
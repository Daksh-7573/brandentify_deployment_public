import { useState } from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { useAuth } from "@/hooks/use-auth";
import { useCareerCapsule, CareerGoal, GoalMilestone, GoalSkill, GoalProgressLog } from "@/hooks/use-career-capsule";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CareerCapsulePage() {
  const { user } = useAuth();
  const userId = user?.id || 0;
  const { useGoals, useCreateGoal } = useCareerCapsule(userId);
  const { data: goals, isLoading } = useGoals();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // For placeholder functionality with toast notifications
  const handleCreateGoal = () => {
    toast({
      title: "Feature in development",
      description: "The Career Capsule feature is currently being redeveloped. This button will soon allow you to create new career goals.",
    });
    setShowCreateDialog(true);
  };

  const handleGetStarted = () => {
    toast({
      title: "Coming soon!",
      description: "The Career Capsule feature will be available soon. Check back later for updates.",
    });
  };

  const handleViewDetails = (goalId: number) => {
    toast({
      title: "Goal details",
      description: `Viewing details for goal ID: ${goalId} - This functionality is coming soon.`,
    });
  };

  // For now, keep the "under redevelopment" message while we implement the full feature
  return (
    <PageLayout title="Career Capsule">
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Career Capsule</h1>
          <Button variant="outline" onClick={handleCreateGoal}>Create New Goal</Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {goals.map((goal: any) => (
              <Card key={goal.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle>{goal.title}</CardTitle>
                  <CardDescription>{new Date(goal.targetDate).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{goal.description}</p>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="ghost" 
                    className="text-primary" 
                    onClick={() => handleViewDetails(goal.id)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center space-y-4 py-16 bg-muted/20 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">No career goals yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              This feature is currently under redevelopment. Soon you'll be able to set 1-5 year career goals 
              and receive AI-generated milestones with a timeline to achieve them.
            </p>
            <Button className="mt-4" onClick={handleGetStarted}>Get Started</Button>
          </div>
        )}
      </div>

      {/* Dialog for Create Goal - Just a placeholder for now */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Career Goal</DialogTitle>
            <DialogDescription>
              This feature is being redeveloped and will be available soon. 
              You'll be able to set career goals with a 1-5 year timeframe and get AI-generated milestones.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <p className="text-sm text-muted-foreground">
              Career Capsule helps you plan your career growth with clear milestones and skills to develop.
              Check back soon for the full functionality!
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowCreateDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
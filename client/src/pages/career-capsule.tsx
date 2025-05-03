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

      {/* Dialog for Create Goal with form fields */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Career Goal</DialogTitle>
            <DialogDescription>
              Set your career goals with a 1-5 year timeframe and get AI-generated milestones.
            </DialogDescription>
          </DialogHeader>
          <form className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="goal-title" className="text-right text-sm font-medium">
                Goal Title
              </label>
              <input
                id="goal-title"
                placeholder="e.g. Become a Product Manager"
                className="col-span-3 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="goal-type" className="text-right text-sm font-medium">
                Goal Type
              </label>
              <select
                id="goal-type"
                className="col-span-3 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="timeframe" className="text-right text-sm font-medium">
                Timeframe (years)
              </label>
              <select
                id="timeframe"
                className="col-span-3 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="1">1 year</option>
                <option value="2">2 years</option>
                <option value="3">3 years</option>
                <option value="4">4 years</option>
                <option value="5">5 years</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <label htmlFor="description" className="text-right text-sm font-medium pt-2">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Describe your career goal in detail..."
                className="col-span-3 flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="industry" className="text-right text-sm font-medium">
                Industry Focus
              </label>
              <input
                id="industry"
                placeholder="e.g. Technology, Healthcare, Finance"
                className="col-span-3 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="col-span-4 flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="use-ai"
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="use-ai" className="text-sm font-medium">
                Generate AI milestones for this goal
              </label>
            </div>
          </form>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({
                title: "Feature in development",
                description: "This form is just a preview. The full functionality will be available soon.",
              });
              setShowCreateDialog(false);
            }}>Create Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
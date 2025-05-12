import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Clock, 
  Flag, 
  GraduationCap, 
  Target, 
  Briefcase, 
  ArrowRightCircle 
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Types for the goal summary component
export interface GoalSummaryProps {
  goal: {
    id: number;
    title: string;
    description: string;
    goalType: string;
    targetDate: string | Date;
    industry?: string;
    status: string;
    progress: number;
    createdAt: string | Date;
    customGoal?: string;
    milestoneCount?: number;
    startDate?: string | Date;
    endDate?: string | Date;
  };
  onDelete?: (goalId: number) => void;
  onViewDetails: (goalId: number) => void;
  className?: string;
}

// Format date from ISO string to human-readable format
const formatDate = (dateString?: string | Date) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
};

// Get text representation of goal type
const getGoalTypeText = (type: string) => {
  const typeMap: Record<string, string> = {
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

// Get icon for goal type
const getGoalTypeIcon = (type: string) => {
  switch (type) {
    case "position_change":
      return <ArrowRightCircle className="text-blue-500" />;
    case "skill_acquisition":
      return <GraduationCap className="text-green-500" />;
    case "promotion":
      return <Target className="text-purple-500" />;
    case "industry_switch":
      return <Briefcase className="text-amber-500" />;
    case "certification":
      return <Flag className="text-red-500" />;
    case "education":
      return <GraduationCap className="text-emerald-500" />;
    default:
      return <Target className="text-primary" />;
  }
};

// Get status badge color and text
const getStatusBadge = (status: string) => {
  switch (status) {
    case "in_progress":
      return <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>;
    case "completed":
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
    case "abandoned":
      return <Badge className="bg-red-100 text-red-800">Abandoned</Badge>;
    case "not_started":
    default:
      return <Badge className="bg-gray-100 text-gray-800">Not Started</Badge>;
  }
};

export default function GoalSummary({ 
  goal, 
  onDelete, 
  onViewDetails,
  className 
}: GoalSummaryProps) {
  const timeRemaining = goal.targetDate ? 
    Math.max(0, Math.floor((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 
    0;

  return (
    <Card className={cn("h-full shadow-sm hover:shadow-md transition-shadow", className)}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getGoalTypeIcon(goal.goalType)}
            <CardTitle className="text-xl">{goal.title}</CardTitle>
          </div>
          {getStatusBadge(goal.status)}
        </div>
        
        <CardDescription className="flex flex-col gap-1 mt-1">
          <span className="flex items-center gap-1 text-sm">
            <span className="font-medium">{getGoalTypeText(goal.goalType)}</span>
            {goal.industry && (
              <>
                <span className="mx-1">•</span>
                <span>{goal.industry}</span>
              </>
            )}
          </span>
          
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Created: {formatDate(goal.createdAt)}
            </span>
            
            <span className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              Target: {formatDate(goal.targetDate)}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-xs">{goal.progress}%</span>
          </div>
          <Progress 
            value={goal.progress || 0} 
            className={cn(
              "h-2",
              goal.progress < 25 ? "bg-red-500" :
              goal.progress < 50 ? "bg-orange-500" :
              goal.progress < 75 ? "bg-yellow-500" :
              "bg-green-500"
            )}
          />
        </div>
        
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {goal.description || "No description provided"}
        </p>
        
        {timeRemaining > 0 && (
          <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {timeRemaining} {timeRemaining === 1 ? 'day' : 'days'} remaining
            </span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="w-full flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1" 
            onClick={() => onViewDetails(goal.id)}
          >
            View Details
          </Button>
          
          {onDelete && (
            <Button 
              variant="outline" 
              className="text-red-600 hover:text-red-700 hover:bg-red-50" 
              onClick={() => onDelete(goal.id)}
            >
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
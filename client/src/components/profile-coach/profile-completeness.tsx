import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { FileCheck } from "lucide-react";

interface ProfileCompletenessProps {
  score: number;
  className?: string;
}

export default function ProfileCompleteness({ score, className }: ProfileCompletenessProps) {
  // Determine progress color based on score
  const getProgressColor = (score: number) => {
    if (score < 40) return "bg-destructive";
    if (score < 70) return "bg-amber-500";
    return "bg-emerald-500";
  };
  
  // Get completion level label
  const getCompletionLevel = (score: number) => {
    if (score < 30) return "Starting Out";
    if (score < 50) return "Basic";
    if (score < 70) return "Intermediate";
    if (score < 90) return "Advanced";
    return "Expert";
  };
  
  // Get recommendations based on score
  const getRecommendations = (score: number) => {
    if (score < 30) {
      return [
        "Fill in your basic profile information",
        "Add at least one work experience entry",
        "Add your education history"
      ];
    }
    
    if (score < 50) {
      return [
        "Add more detail to your work descriptions",
        "List at least 5 skills relevant to your field",
        "Add a project to showcase your work"
      ];
    }
    
    if (score < 70) {
      return [
        "Enhance work descriptions with measurable achievements",
        "Add more skills with proficiency levels",
        "Include more details in your projects"
      ];
    }
    
    if (score < 90) {
      return [
        "Refine your profile with targeted keywords",
        "Add certifications and special achievements",
        "Include quantifiable results in your work history"
      ];
    }
    
    return [
      "Keep your profile up to date with new accomplishments",
      "Regularly refresh your skills with emerging trends",
      "Review and update project outcomes periodically"
    ];
  };
  
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Profile Completeness</CardTitle>
        <CardDescription>
          How complete and effective your profile is
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {getCompletionLevel(score)} Level
            </span>
            <span className="font-medium">{score}%</span>
          </div>
          <Progress
            value={score}
            className={cn("h-2", getProgressColor(score))}
          />
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Next Steps to Improve</h4>
          <ul className="space-y-1.5">
            {getRecommendations(score).map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <FileCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
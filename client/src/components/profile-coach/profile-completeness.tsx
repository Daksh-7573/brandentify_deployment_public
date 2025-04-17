import React from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ProfileCompletenessProps {
  score: number;
  priorities: string[];
  className?: string;
}

export default function ProfileCompleteness({ score, priorities, className = "" }: ProfileCompletenessProps) {
  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 80) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  // Determine progress bar color
  const getProgressColor = () => {
    if (score >= 80) return "bg-green-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
  };

  // Get message based on score
  const getMessage = () => {
    if (score >= 80) return "Excellent! Your profile is well-optimized.";
    if (score >= 50) return "Good progress! Keep improving your profile.";
    return "Your profile needs work to stand out.";
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Profile Completeness</span>
          <span className={`text-2xl font-bold ${getScoreColor()}`}>{score}%</span>
        </CardTitle>
        <CardDescription>{getMessage()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={score} className={`h-2 ${getProgressColor()}`} />

        {priorities && priorities.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Improvement Priorities</span>
            </h3>
            <ul className="space-y-1 text-sm">
              {priorities.map((priority, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">{priority}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
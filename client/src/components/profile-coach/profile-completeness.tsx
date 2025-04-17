import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface ProfileCompletenessProps {
  score: number;
  priorities: string[];
  className?: string;
}

export default function ProfileCompleteness({ score, priorities, className = "" }: ProfileCompletenessProps) {
  // Determine the color based on score
  const getColorClass = () => {
    if (score < 30) return "text-destructive";
    if (score < 70) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Profile Completeness</h3>
          <span className={`text-lg font-bold ${getColorClass()}`}>{score}%</span>
        </div>
        <p className="text-sm text-muted-foreground">
          A complete profile helps you stand out to potential connections and recruiters
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={score} className="h-2" />

        {priorities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-1">
              <AlertTriangle size={16} className="text-yellow-500" />
              Focus on these areas to improve your profile:
            </h4>
            <ul className="space-y-2">
              {priorities.map((priority, index) => (
                <li key={index} className="text-sm flex gap-2">
                  <span className="text-muted-foreground">•</span>
                  {priority}
                </li>
              ))}
            </ul>
          </div>
        )}

        {priorities.length === 0 && score === 100 && (
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">
              Your profile is complete! Great job keeping all your information up to date.
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
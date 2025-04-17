import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckSquare, Tag } from "lucide-react";

interface ProfileImprovementProps {
  priorities: string[];
  keywords: string[];
  className?: string;
}

export default function ProfileImprovement({ priorities, keywords, className }: ProfileImprovementProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">Improvement Opportunities</CardTitle>
        <CardDescription>
          Actionable recommendations to enhance your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center">
              <CheckSquare className="h-4 w-4 mr-2 text-primary" />
              Priority Improvements
            </h3>
            <ul className="space-y-3">
              {priorities.map((priority, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex-shrink-0 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{priority}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center">
              <Tag className="h-4 w-4 mr-2 text-primary" />
              Recommended Keywords
            </h3>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="bg-primary/5">
                  {keyword}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Including these keywords can help your profile appear in more searches and show industry relevance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
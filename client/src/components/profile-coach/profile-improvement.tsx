import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileImprovementProps {
  title: string;
  data: any;
  feedback: any;
  onEdit: (item?: any) => void;
  onAdd?: () => void;
  isCollection?: boolean;
}

export default function ProfileImprovement({
  title,
  data,
  feedback,
  onEdit,
  onAdd,
  isCollection = false,
}: ProfileImprovementProps) {
  // Check if data is empty
  const isEmpty = isCollection ? !data || data.length === 0 : !data;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {isEmpty ? "Add information to improve your profile" : "Review and improve your information"}
          </CardDescription>
        </div>
        {isCollection && onAdd ? (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => onEdit()}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEmpty ? (
          <div className="flex items-center justify-center py-6 border border-dashed rounded-md">
            <div className="text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No {title.toLowerCase()} added yet.{" "}
                {isCollection ? "Add some to improve your profile." : "Complete this section to improve your profile."}
              </p>
            </div>
          </div>
        ) : isCollection ? (
          <div className="space-y-6">
            {/* Display collection items */}
            {data.map((item: any, index: number) => (
              <div key={index} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{getItemTitle(item)}</h3>
                    <p className="text-sm text-muted-foreground">{getItemSubtitle(item)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                )}
                {renderItemDetails(item)}
              </div>
            ))}
            
            {/* Display feedback */}
            {feedback && feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {feedback.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Display single item */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {Object.entries(data).map(([key, value]: [string, any]) => {
                // Skip internal fields, empty values, or reserved fields
                if (
                  key === "id" ||
                  key === "userId" ||
                  key === "createdAt" ||
                  key === "updatedAt" ||
                  key === "emailVerificationToken" ||
                  key === "emailVerificationExpires" ||
                  key === "password" ||
                  !value
                ) {
                  return null;
                }
                
                return (
                  <div key={key} className="mb-2">
                    <div className="text-sm font-medium capitalize">
                      {formatFieldName(key)}
                    </div>
                    <div className="text-sm">{value.toString()}</div>
                  </div>
                );
              })}
            </div>
            
            {/* Display feedback */}
            {feedback && feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Improvement Suggestions</h3>
                <ul className="space-y-2">
                  {feedback.suggestions.map((suggestion: string, index: number) => (
                    <li key={index} className="text-sm flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to get the title of a collection item
function getItemTitle(item: any): string {
  if (item.title) return item.title;
  if (item.name) return item.name;
  if (item.institution) return item.institution;
  if (item.degree) return item.degree;
  return "Untitled";
}

// Helper function to get the subtitle of a collection item
function getItemSubtitle(item: any): string {
  if (item.company) return item.company;
  if (item.institution && item.degree) return item.degree;
  if (item.proficiency) return `${item.proficiency} (${item.yearsOfExperience || 0}+ years)`;
  if (item.startDate) {
    const endDateText = item.endDate ? item.endDate : "Present";
    return `${item.startDate} - ${endDateText}`;
  }
  return "";
}

// Helper function to render additional details for a collection item
function renderItemDetails(item: any): React.ReactNode {
  // For skills, render badges for categories or proficiency
  if (item.proficiency) {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline">{item.proficiency}</Badge>
        {item.yearsOfExperience && (
          <Badge variant="outline">{item.yearsOfExperience}+ years</Badge>
        )}
      </div>
    );
  }

  // For work experience or education, render date range
  if (item.startDate) {
    const dateRange = item.endDate ? `${item.startDate} - ${item.endDate}` : `${item.startDate} - Present`;
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="outline">{dateRange}</Badge>
        {item.location && <Badge variant="outline">{item.location}</Badge>}
      </div>
    );
  }

  return null;
}

// Format field name for display (e.g., "jobTitle" -> "Job Title")
function formatFieldName(key: string): string {
  // Special cases for common fields
  const specialCases: { [key: string]: string } = {
    photoURL: "Profile Photo",
    lookingFor: "Looking For",
  };

  if (specialCases[key]) {
    return specialCases[key];
  }

  // Convert camelCase to Title Case with spaces
  return key
    .replace(/([A-Z])/g, " $1") // Insert a space before all uppercase letters
    .replace(/^./, (str) => str.toUpperCase()); // Uppercase the first letter
}
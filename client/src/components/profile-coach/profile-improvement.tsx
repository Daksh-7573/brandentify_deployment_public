import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2 } from "lucide-react";

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
  // Render data differently based on whether it's a collection or single item
  const renderData = () => {
    if (isCollection) {
      if (!data || data.length === 0) {
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No {title.toLowerCase()} information added yet.
            </p>
            {onAdd && (
              <Button variant="outline" onClick={onAdd} className="gap-1">
                <Plus className="h-4 w-4" />
                Add {title.toLowerCase()}
              </Button>
            )}
          </div>
        );
      }

      return (
        <div className="space-y-4">
          {data.map((item: any, index: number) => (
            <Card key={index} className="overflow-hidden bg-muted/30">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {title === "Work Experience" && `${item.title} at ${item.company}`}
                      {title === "Education" &&
                        `${item.degree} in ${item.fieldOfStudy}, ${item.institution}`}
                      {title === "Skills" && `${item.name} - ${item.proficiency}`}
                      {title === "Projects" && item.title}
                    </CardTitle>
                    <CardDescription>
                      {title === "Work Experience" &&
                        `${item.startDate} - ${item.endDate || "Present"} • ${
                          item.location || "Remote"
                        }`}
                      {title === "Education" &&
                        `${item.startDate} - ${item.endDate || "Present"}`}
                      {title === "Skills" &&
                        `${item.yearsOfExperience || "0"} years of experience`}
                      {title === "Projects" &&
                        `${item.startDate ? `Started ${item.startDate}` : ""} ${
                          item.status ? `• ${item.status}` : ""
                        }`}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              {item.description && (
                <CardContent className="pb-3 pt-0">
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              )}
            </Card>
          ))}
          {onAdd && (
            <div className="pt-2">
              <Button variant="outline" onClick={onAdd} className="w-full gap-1">
                <Plus className="h-4 w-4" />
                Add another {title.toLowerCase()}
              </Button>
            </div>
          )}
        </div>
      );
    } else {
      // Single item display (like basic info)
      if (!data) {
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No information available.</p>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(data)
              .filter(
                ([key]) =>
                  !["id", "password", "emailVerified", "emailVerificationToken", "emailVerificationExpires", "createdAt", "profileCompleted"].includes(key)
              )
              .map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <h4 className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {value ? String(value) : "Not specified"}
                  </p>
                </div>
              ))}
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {isCollection
              ? `Manage your ${title.toLowerCase()} information`
              : `Manage your personal information`}
          </CardDescription>
        </div>
        {!isCollection && (
          <Button variant="outline" onClick={() => onEdit()}>
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>{renderData()}</CardContent>
      <CardFooter className="bg-muted/30 flex flex-col items-start">
        <h3 className="text-sm font-medium mb-2">Recommendations</h3>
        {feedback && feedback.suggestions && feedback.suggestions.length > 0 ? (
          <ul className="text-sm text-muted-foreground space-y-1">
            {feedback.suggestions.map((suggestion: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span>•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            No specific recommendations at this time.
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
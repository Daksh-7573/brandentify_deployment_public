import React from "react";
import { User, MapPin, Building, Briefcase, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/user";

interface ProfileInfoSectionProps {
  userData: UserData;
  onEdit?: () => void;
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({ userData, onEdit }) => {
  // Convert database value to display value for lookingFor
  const convertDbToDisplayValue = (dbValue: string) => {
    if (dbValue === "job_opportunities") return "Job Opportunities";
    if (dbValue === "mentorship") return "Mentorship";
    if (dbValue === "networking") return "Networking";
    if (dbValue === "collaboration") return "Collaboration";
    if (dbValue === "investment") return "Investment";
    if (dbValue === "learning") return "Learning";
    if (dbValue === "career_advice") return "Career Advice";
    if (dbValue === "business_partnerships") return "Business Partnerships";
    return dbValue;
  };
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {/* Name */}
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{userData.name || 'Not specified'}</span>
          </div>
          
          {/* Job Title */}
          {userData.title && (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.title}</span>
            </div>
          )}
          
          {/* Location */}
          {userData.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.location}</span>
            </div>
          )}
          
          {/* Industry & Domain */}
          {(userData.industry || userData.domain) && (
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {[userData.industry, userData.domain].filter(Boolean).join(' • ')}
              </span>
            </div>
          )}
          
          {/* About Me */}
          {userData.aboutMe && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">About Me</div>
              <div className="text-sm text-muted-foreground">{userData.aboutMe}</div>
            </div>
          )}
          
          {/* What I Offer */}
          {userData.whatIOffer && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">What I Offer</div>
              <div className="text-sm text-muted-foreground">{userData.whatIOffer}</div>
            </div>
          )}
          
          {/* Looking For */}
          {userData.lookingFor && (
            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">Looking For</div>
              <div className="text-sm text-muted-foreground">
                {convertDbToDisplayValue(userData.lookingFor)}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoSection;
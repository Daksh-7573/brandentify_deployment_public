import React from "react";
import { User, MapPin, Building, Briefcase, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/user";
import { LOOKING_FOR_OPTIONS } from "@/lib/constants";

interface ProfileInfoSectionProps {
  userData: UserData;
  onEdit?: () => void;
}

const ProfileInfoSection: React.FC<ProfileInfoSectionProps> = ({ userData, onEdit }) => {
  console.log("[PROFILE DISPLAY] ProfileInfoSection rendered with userData:", userData);
  console.log("[PROFILE DISPLAY] userData.lookingFor value:", userData.lookingFor);
  
  // Convert database value to display value for lookingFor
  const convertDbToDisplayValue = (dbValue: string) => {
    const lookingForOptions = {
      "job_opportunities": "Job Opportunities",
      "mentorship": "Mentorship", 
      "networking": "Networking",
      "collaboration": "Collaboration",
      "investment": "Investment",
      "learning": "Learning",
      "career_advice": "Career Advice",
      "business_partnerships": "Business Partnerships"
    };
    console.log("[PROFILE DISPLAY] Converting value:", dbValue);
    console.log("[PROFILE DISPLAY] Type:", typeof dbValue);
    const converted = lookingForOptions[dbValue as keyof typeof lookingForOptions] || dbValue;
    console.log("[PROFILE DISPLAY] Converted to:", converted);
    return converted;
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
          <div className="border-t pt-4">
            <div className="text-sm font-medium mb-2">I am looking for</div>
            <div className="text-sm text-muted-foreground">
              {userData.lookingFor ? convertDbToDisplayValue(userData.lookingFor) : 'Not Specified'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInfoSection;
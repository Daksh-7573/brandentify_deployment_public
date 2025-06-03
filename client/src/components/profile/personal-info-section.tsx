import React from "react";
import { Mail, Phone, Globe, Briefcase, Edit, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/user";

interface PersonalInfoSectionProps {
  userData: UserData;
  onEdit?: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userData, onEdit }) => {
  console.log('PersonalInfoSection userData:', userData);
  
  // Component to display contact information
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit Info
            </Button>
          )}
        </div>
        <div className="space-y-4">
          {/* Professional Summary */}
          {userData.aboutMe && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">Professional Overview</div>
                <div className="text-muted-foreground whitespace-pre-line">{userData.aboutMe}</div>
              </div>
            </div>
          )}
          
          {/* What I Offer - only show if value exists */}
          {userData.whatIOffer && (
            <div className="flex items-start gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm">
                <div className="font-medium mb-1">What I Offer</div>
                <div className="text-muted-foreground">{userData.whatIOffer}</div>
              </div>
            </div>
          )}
          
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{userData.email}</span>
          </div>
          
          {/* Phone Number - only show if value exists */}
          {userData.phoneNumber && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.phoneNumber}</span>
            </div>
          )}
          
          {/* Profile URL */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`} 
              className="text-sm text-primary hover:underline"
            >
              brandentifier.com/@{userData.name ? userData.name.replace(/\s+/g, '') : userData.username}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
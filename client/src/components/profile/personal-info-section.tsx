import React from "react";
import { Mail, Phone, Globe, Tag, Edit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/user";

interface PersonalInfoSectionProps {
  userData: UserData;
  onEdit?: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userData, onEdit }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Contact Information</h3>
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              className="flex items-center gap-1"
            >
              <Edit className="h-4 w-4" />
              Edit Contact
            </Button>
          )}
        </div>
        <div className="space-y-4">
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
          
          {/* Brand Name - only show if value exists */}
          {userData.brandName && (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">@{userData.brandName}</span>
            </div>
          )}
          
          {/* Profile URL */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <a 
              href={`/@${userData.brandName || (userData.name ? userData.name.replace(/\s+/g, '') : userData.username)}`} 
              className="text-sm text-primary hover:underline"
            >
              brandentifier.com/@{userData.brandName || (userData.name ? userData.name.replace(/\s+/g, '') : userData.username)}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoSection;
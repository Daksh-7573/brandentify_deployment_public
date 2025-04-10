import React from "react";
import { Mail, Phone, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface UserData {
  id: number;
  username: string;
  name: string | null;
  email: string;
  photoURL: string | null;
  title: string | null;
  location: string | null;
  industry: string | null;
  lookingFor: string | null;
  phoneNumber: string | null;
}

interface PersonalInfoSectionProps {
  userData: UserData;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userData }) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{userData.email}</span>
          </div>
          
          {/* Phone Number */}
          {userData.phoneNumber ? (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.phoneNumber}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-sm">No phone number added</span>
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
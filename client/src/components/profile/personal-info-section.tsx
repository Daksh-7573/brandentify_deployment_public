import React from "react";
import { Mail, Phone, Globe, Briefcase, Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { UserData } from "@/types/user";

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
          
          {/* Company */}
          {userData.company ? (
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.company}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-sm">No company added</span>
            </div>
          )}
          
          {/* Domain */}
          {userData.domain ? (
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{userData.domain}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Code className="h-4 w-4" />
              <span className="text-sm">No domain/expertise added</span>
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
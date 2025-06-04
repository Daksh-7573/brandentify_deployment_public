import React from "react";
import { Mail, Phone, Globe, Tag, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/user";

interface PersonalInfoSectionProps {
  userData: UserData;
  onEdit?: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userData, onEdit }) => {
  // Add safety check for userData
  if (!userData) {
    return (
      <div className="p-6 text-center">
        <div className="text-white/60">Loading contact information...</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Contact Information</h3>
        {onEdit && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onEdit}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Contact
          </Button>
        )}
      </div>
      
      {/* Unified Contact List */}
      <div className="space-y-4">
        {/* Email (from Google - read-only) */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/60 mb-1">Email Address (from Google)</div>
            <span className="text-white font-medium text-base">{userData.email || "No email"}</span>
            <div className="text-xs text-white/50 mt-1">This email cannot be changed as it's linked to your Google account</div>
          </div>
        </div>
        
        {/* Phone Number */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Phone className="h-6 w-6 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/60 mb-1">Phone Number</div>
            <span className="text-white font-medium text-base">
              {userData.phoneNumber || "Not provided"}
            </span>
            {!userData.phoneNumber && (
              <div className="text-xs text-white/50 mt-1">Add your phone number to help others contact you</div>
            )}
          </div>
        </div>
        
        {/* Brand Name */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Tag className="h-6 w-6 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/60 mb-1">Brand Name</div>
            <span className="text-white font-medium text-base">
              {userData.brandName ? `@${userData.brandName}` : "Not set"}
            </span>
            {!userData.brandName && (
              <div className="text-xs text-white/50 mt-1">Set a unique brand name for custom URLs</div>
            )}
          </div>
        </div>
        
        {/* Profile URL */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <Globe className="h-6 w-6 text-white/70" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-white/60 mb-1">Profile URL</div>
            <a 
              href={`/@${userData.brandName || (userData.name ? userData.name.replace(/\s+/g, '') : userData.username)}`} 
              className="text-white/90 hover:text-white transition-colors duration-200 font-medium text-base block truncate"
              title={`brandentifier.com/@${userData.brandName || (userData.name ? userData.name.replace(/\s+/g, '') : userData.username)}`}
            >
              brandentifier.com/@{userData.brandName || (userData.name ? userData.name.replace(/\s+/g, '') : userData.username)}
            </a>
            <div className="text-xs text-white/50 mt-1">Your public profile link</div>
          </div>
        </div>
      </div>
      
      {/* Additional Contact Summary */}
      <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-lg">
        <div className="text-xs text-white/60 mb-2">Contact Summary</div>
        <div className="text-sm text-white/80">
          Complete your contact information to enhance your professional presence and make it easier for others to connect with you.
        </div>
      </div>
    </>
  );
};

export default PersonalInfoSection;
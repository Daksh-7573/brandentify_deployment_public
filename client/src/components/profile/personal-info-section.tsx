import React from "react";
import { Mail, Phone, Globe, Tag, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserData } from "@/types/user";

interface PersonalInfoSectionProps {
  userData: UserData;
  onEdit?: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ userData, onEdit }) => {
  return (
    <div className="neo-glass-card bg-white/5 backdrop-blur-md border border-white/20 rounded-lg">
      <div className="p-6">
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
        <div className="space-y-4">
          {/* Email (from Google - read-only) */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
            <Mail className="h-5 w-5 text-white/70" />
            <div className="flex-1">
              <div className="text-xs text-white/60 mb-1">Email (from Google)</div>
              <span className="text-white font-medium">{userData.email}</span>
            </div>
          </div>
          
          {/* Phone Number - only show if value exists */}
          {userData.phoneNumber && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Phone className="h-5 w-5 text-white/70" />
              <div className="flex-1">
                <div className="text-xs text-white/60 mb-1">Phone Number</div>
                <span className="text-white font-medium">{userData.phoneNumber}</span>
              </div>
            </div>
          )}
          
          {/* Brand Name - only show if value exists */}
          {userData.brandName && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Tag className="h-5 w-5 text-white/70" />
              <div className="flex-1">
                <div className="text-xs text-white/60 mb-1">Brand Name</div>
                <span className="text-white font-medium">{userData.brandName}</span>
              </div>
            </div>
          )}
          
          {/* Profile URL - automatically generated from Brand Name */}
          {userData.brandName && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
              <Globe className="h-5 w-5 text-white/70" />
              <div className="flex-1">
                <div className="text-xs text-white/60 mb-1">Profile URL</div>
                <a 
                  href={`/${userData.brandName.toLowerCase().replace(/\s+/g, '-')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 cursor-pointer underline decoration-blue-400/50 hover:decoration-blue-300"
                >
                  {`${window.location.origin}/${userData.brandName.toLowerCase().replace(/\s+/g, '-')}`}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoSection;
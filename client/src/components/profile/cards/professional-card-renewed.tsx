import React from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  BadgeCheck,
  Briefcase,
  Hash,
  Globe
} from "lucide-react";
import { UserData } from "@/types/user";

interface ProfessionalCardRenewedProps {
  userData: UserData;
  isIndustryLeader?: boolean;
}

const ProfessionalCardRenewed: React.FC<ProfessionalCardRenewedProps> = ({ 
  userData,
  isIndustryLeader = false
}) => {
  // Use the branded domain as requested
  const profileURL = `brandentifier.com/${userData.name?.replace(/\s+/g, '').toLowerCase() || 'myprofile'}`;
  
  return (
    <div className="professional-card bg-white dark:bg-slate-800 w-full max-w-[360px] mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Card Header with Profile Photo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-28 relative">
        {/* Profile Photo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-14">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 overflow-hidden">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=e2e8f0&color=475569`;
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=e2e8f0&color=475569`}
                  alt={userData.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            
            {/* Verification badge */}
            {isIndustryLeader && (
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full">
                <BadgeCheck className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-14 pb-4 px-4">
        {/* Name and Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {userData.name || "Your Name"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userData.title || "Professional Title"}
          </p>
        </div>

        {/* Info List */}
        <div className="space-y-3 mb-4">
          {/* Industry */}
          {userData.industry && (
            <div className="flex items-center text-sm">
              <Briefcase className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {userData.industry}
              </span>
            </div>
          )}
          
          {/* Domain */}
          {userData.domain && (
            <div className="flex items-center text-sm">
              <Hash className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {userData.domain}
              </span>
            </div>
          )}

          {/* Location */}
          {userData.location && (
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {userData.location}
              </span>
            </div>
          )}
          
          {/* Email */}
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <a 
              href={`mailto:${userData.email}`} 
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate"
            >
              {userData.email}
            </a>
          </div>
          
          {/* Phone */}
          {userData.phoneNumber && (
            <div className="flex items-center text-sm">
              <Phone className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
              <a 
                href={`tel:${userData.phoneNumber}`} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate"
              >
                {userData.phoneNumber}
              </a>
            </div>
          )}
          
          {/* Profile Link */}
          <div className="flex items-center text-sm">
            <Globe className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
            <span className="text-blue-600 dark:text-blue-400 truncate">
              {profileURL}
            </span>
          </div>
        </div>
      </div>
      
      {/* Card Footer - Empty */}
      <div className="bg-gray-50 dark:bg-gray-900 py-2 px-4 text-center">
      </div>
    </div>
  );
};

export default ProfessionalCardRenewed;
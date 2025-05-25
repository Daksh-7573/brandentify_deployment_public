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
    <div className="professional-card bg-white dark:bg-slate-800 w-full h-full rounded-xl overflow-visible shadow-xl border border-blue-200/50 dark:border-blue-800/30 flex flex-col backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 transition-all duration-300 hover:shadow-blue-200/30 dark:hover:shadow-blue-700/20">
      {/* Card Header with Profile Photo */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-28 relative overflow-hidden">
        {/* Neo-Glass Header Background Effects */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-blue-300 blur-xl animate-pulse-slow"></div>
          <div className="absolute -bottom-4 -left-10 w-32 h-32 rounded-full bg-purple-300 blur-xl animate-pulse-slow-delay"></div>
        </div>
        
        {/* Profile Photo */}
        <div className="absolute left-1/2 transform -translate-x-1/2 top-14 z-10">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-4 border-white dark:border-slate-800 bg-white dark:bg-slate-700 overflow-hidden shadow-lg">
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
              <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full shadow-md">
                <BadgeCheck className="h-5 w-5 drop-shadow-md" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-14 pb-4 px-4 flex-1 overflow-visible">
        {/* Name and Title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white drop-shadow-sm">
            {userData.name || "Your Name"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userData.title || "Professional Title"}
          </p>
        </div>

        {/* Professional Info List */}
        <div className="space-y-3 mb-4">
          {/* Industry */}
          <div className="flex items-center text-sm pl-2 border-l-2 border-blue-500/30 hover:border-blue-500/70 transition-colors group">
            <Briefcase className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-md transition-all" />
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {userData.industry || "Add industry"}
            </span>
          </div>
          
          {/* Domain */}
          <div className="flex items-center text-sm pl-2 border-l-2 border-blue-500/30 hover:border-blue-500/70 transition-colors group">
            <Building2 className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-md transition-all" />
            <span className="text-gray-700 dark:text-gray-300 truncate capitalize">
              {userData.domain || "Add domain"}
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm pl-2 border-l-2 border-blue-500/30 hover:border-blue-500/70 transition-colors group">
            <MapPin className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-md transition-all" />
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {userData.location || "Add location"}
            </span>
          </div>
        </div>
        
        {/* Contact Information Section */}
        <div className="mt-6 mb-4">
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3 border-b border-gray-200 dark:border-gray-700 pb-1">
            Contact Information
          </h3>
          
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center text-sm pl-2 border-l-2 border-blue-500/30 hover:border-blue-500/70 transition-colors group">
              <Mail className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-md transition-all" />
              <a 
                href={userData.email ? `mailto:${userData.email}` : "#"} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate"
              >
                {userData.email || "Add email address"}
              </a>
            </div>
            
            {/* Phone */}
            <div className="flex items-center text-sm pl-2 border-l-2 border-blue-500/30 hover:border-blue-500/70 transition-colors group">
              <Phone className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-md transition-all" />
              <a 
                href={userData.phoneNumber ? `tel:${userData.phoneNumber}` : "#"} 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 truncate"
              >
                {userData.phoneNumber || "Add phone number"}
              </a>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center text-sm pl-2 border-l-2 border-blue-500/30 hover:border-blue-500/70 transition-colors group">
              <Globe className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0 drop-shadow-sm group-hover:drop-shadow-md transition-all" />
              <span className="text-blue-600 dark:text-blue-400 truncate">
                {profileURL || "Add website"}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card Footer with Neo-Glass styling */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-600/20 dark:to-purple-600/20 py-3 px-4 text-center border-t border-blue-100 dark:border-blue-900">
        <span className="text-xs text-blue-600/70 dark:text-blue-400/70 font-medium tracking-wide">
          Professional Card
        </span>
      </div>
    </div>
  );
};

export default ProfessionalCardRenewed;
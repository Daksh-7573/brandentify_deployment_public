import React from "react";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";
import { UserData } from "@/types/user";

interface MinimalistCardProps {
  userData: UserData;
}

const MinimalistCard: React.FC<MinimalistCardProps> = ({ userData }) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  return (
    <div className="w-full aspect-[2/3.5] bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Header section with background */}
      <div className="h-20 bg-gradient-to-r from-blue-600 to-blue-800 relative">
        {/* Profile picture */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="h-20 w-20 rounded-full border-4 border-white dark:border-slate-900 overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                className="h-full w-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User");
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                alt={userData.name || "Profile"}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 px-6 pt-12 pb-6 flex flex-col">
        {/* Name and title */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {userData.name || "Your Name"}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userData.title || "Professional"}
          </p>
          
          {/* Industry and Domain */}
          {userData.industry && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {userData.industry.includes(': ') ? (
                <>
                  <span>{userData.industry.split(': ')[0]}</span>
                  <span className="mx-1">•</span>
                  <span>{userData.industry.split(': ')[1]}</span>
                </>
              ) : (
                <span>{userData.industry}</span>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          {/* Company */}
          {userData.company && (
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-gray-800 dark:text-gray-300">{userData.company}</span>
            </div>
          )}
          
          {/* Email */}
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-800 dark:text-gray-300">{userData.email}</span>
          </div>
          
          {/* Phone */}
          <div className="flex items-center gap-3 text-sm">
            <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-800 dark:text-gray-300">
              {userData.phoneNumber || "Add phone number"}
            </span>
          </div>
          
          {/* Profile Link */}
          <div className="flex items-center gap-3 text-sm">
            <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <a 
              href={`/${userData.brandName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200 cursor-pointer underline decoration-blue-600/50 hover:decoration-blue-700"
            >
              {profileLink}
            </a>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="h-6 bg-gradient-to-r from-blue-600 to-blue-800 flex items-center justify-center">
        <span className="text-xs text-white font-light">Quantum Card</span>
      </div>
    </div>
  );
};

export default MinimalistCard;
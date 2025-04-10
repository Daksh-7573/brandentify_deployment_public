import React from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";

interface VisitingCardPreviewProps {
  userData: UserData;
  cardType: string;
}

const VisitingCardPreview: React.FC<VisitingCardPreviewProps> = ({
  userData,
  cardType,
}) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Simple card preview that simulates different styles
  return (
    <div className="visiting-card-preview">
      <div className={`w-full aspect-[2/3.5] rounded-lg overflow-hidden shadow-lg flex flex-col 
        ${cardType === "holographic" ? "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white" :
          cardType === "3d-animated" ? "bg-gradient-to-br from-blue-900 to-blue-700 text-white" :
          cardType === "flip" ? "bg-slate-800 text-white" :
          cardType === "creative" ? "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white" :
          cardType === "artistic" ? "bg-gradient-to-br from-teal-400 to-indigo-500 text-white" :
          "bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800"}
      `}>
        {/* Card header */}
        <div className={`h-24 ${cardType === "minimalist" ? "bg-gradient-to-r from-blue-600 to-blue-800" : "bg-transparent"} relative`}>
          {/* Profile picture */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-12">
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
        <div className="flex-1 px-6 pt-14 pb-6 flex flex-col">
          {/* Name and title */}
          <div className="text-center mb-4">
            <h2 className={`text-xl font-bold ${cardType === "minimalist" ? "text-gray-900 dark:text-white" : "text-white"}`}>
              {userData.name || "Your Name"}
            </h2>
            <p className={`text-sm ${cardType === "minimalist" ? "text-gray-600 dark:text-gray-400" : "text-white/80"}`}>
              {userData.title || "Professional"}
            </p>
            
            {/* Industry and Domain */}
            {userData.industry && (
              <div className={`mt-1 text-xs ${cardType === "minimalist" ? "text-gray-500 dark:text-gray-500" : "text-white/60"}`}>
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
                <Briefcase className={`h-4 w-4 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
                <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>{userData.company}</span>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-3 text-sm">
              <Mail className={`h-4 w-4 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
              <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3 text-sm">
              <Phone className={`h-4 w-4 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
              <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                {userData.phoneNumber || "Add phone number"}
              </span>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-3 text-sm">
              <Globe className={`h-4 w-4 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
              <span className={cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white"}>{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className={`h-6 ${cardType === "minimalist" ? "bg-gradient-to-r from-blue-600 to-blue-800" : "bg-white/10"} flex items-center justify-center`}>
          <span className="text-xs text-white font-light">Digital Visiting Card</span>
        </div>
      </div>
    </div>
  );
};

export default VisitingCardPreview;
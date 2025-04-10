import React from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from "lucide-react";
import ThreeDAnimatedCard from "./cards/3d-animated-card";
import HolographicCard from "./cards/holographic-card";
import FlipCard from "./cards/flip-card";

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
  
  // For 3D animated card style, use the specialized component
  if (cardType === "3d-animated") {
    return (
      <div className="visiting-card-preview">
        <ThreeDAnimatedCard userData={userData} />
      </div>
    );
  }
  
  // For holographic card style, use the specialized component
  if (cardType === "holographic") {
    return (
      <div className="visiting-card-preview">
        <HolographicCard userData={userData} />
      </div>
    );
  }
  
  // For flip card style, use the specialized component
  if (cardType === "flip") {
    return (
      <div className="visiting-card-preview">
        <FlipCard userData={userData} />
      </div>
    );
  }
  
  // Simple card preview that simulates different styles
  return (
    <div className="visiting-card-preview">
      <div className={`w-full aspect-[2/3.5] rounded-lg overflow-hidden shadow-lg flex flex-col 
        ${cardType === "creative" ? "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white" :
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
        <div className="flex-1 px-4 pt-14 pb-4 flex flex-col">
          {/* Name and title */}
          <div className="text-center mb-3">
            <h2 className={`text-xl font-bold ${cardType === "minimalist" ? "text-gray-900 dark:text-white" : "text-white"}`}>
              {userData.name || "Your Name"}
            </h2>
            <p className={`text-sm ${cardType === "minimalist" ? "text-gray-600 dark:text-gray-400" : "text-white/80"}`}>
              {userData.title || "Add your designation"}
            </p>
          </div>
          
          <div className="flex-1 space-y-2 text-xs">
            {/* Domain */}
            {userData.domain && (
              <div className="flex items-center gap-2">
                <Code className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
                <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                  {userData.domain}
                </span>
              </div>
            )}
            
            {/* Industry */}
            {userData.industry && (
              <div className="flex items-center gap-2">
                <Building2 className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
                <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                  {userData.industry}
                </span>
              </div>
            )}
            
            {/* Company */}
            {userData.company && (
              <div className="flex items-center gap-2">
                <Briefcase className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
                <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                  {userData.company}
                </span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div className="flex items-center gap-2">
                <MapPin className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
                <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                  {userData.location}
                </span>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
              <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                {userData.email}
              </span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-2">
              <Phone className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
              <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                {userData.phoneNumber || "Add phone number"}
              </span>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-2">
              <Globe className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
              <span className={cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white"}>
                {profileLink}
              </span>
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
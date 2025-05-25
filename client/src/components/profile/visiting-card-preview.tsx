import React from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from "lucide-react";
import ThreeDAnimatedCard from "./cards/3d-animated-card";
import HolographicCard from "./cards/holographic-card";
import NeoGlowCard from "./cards/neoglow-card";
import CreativeCard from "./cards/creative-card";
import ArtisticCard from "./cards/artistic-card";
import QuantumCard from "./cards/quantum-card";

interface VisitingCardPreviewProps {
  userData: UserData;
  cardType: string;
  isLoading?: boolean;
}

const CardWrapper: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <div className="visiting-card-preview w-full h-full aspect-[2/3.5]">
      <div className="w-full h-full">
        {children}
      </div>
    </div>
  );
};

const VisitingCardPreview: React.FC<VisitingCardPreviewProps> = ({
  userData,
  cardType,
  isLoading = false,
}) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // For 3D animated card style, use the specialized component
  if (cardType === "3d-animated") {
    return (
      <CardWrapper>
        <ThreeDAnimatedCard userData={userData} />
      </CardWrapper>
    );
  }
  
  // For holographic card style, use the specialized component
  if (cardType === "holographic") {
    return (
      <CardWrapper>
        <HolographicCard userData={userData} />
      </CardWrapper>
    );
  }
  
  // For NeoGlow card style, use the specialized component
  if (cardType === "neoglow" || cardType === "clay-paper") {
    return (
      <CardWrapper>
        <NeoGlowCard userData={userData} />
      </CardWrapper>
    );
  }
  
  // For creative card style, use the specialized component
  if (cardType === "creative") {
    return (
      <CardWrapper>
        <CreativeCard userData={userData} />
      </CardWrapper>
    );
  }
  
  // For artistic card style, use the specialized component
  if (cardType === "artistic") {
    return (
      <CardWrapper>
        <ArtisticCard userData={userData} />
      </CardWrapper>
    );
  }
  
  // Professional card style removed as per request
  
  // For quantum card style, use the specialized component
  if (cardType === "quantum") {
    return (
      <CardWrapper>
        <QuantumCard 
          userData={userData}
          isLoading={isLoading}
        />
      </CardWrapper>
    );
  }
  
  // Simple card preview that simulates different styles
  return (
    <CardWrapper>
      <div className={`w-full rounded-lg overflow-hidden shadow-lg flex flex-col 
        ${cardType === "creative" ? "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white" :
          cardType === "artistic" ? "bg-gradient-to-br from-teal-400 to-indigo-500 text-white" :
          "bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800"}
      `}>
        {/* Card header */}
        <div className={`h-24 ${cardType === "minimalist" ? "bg-gradient-to-r from-blue-600 to-blue-800" : "bg-transparent"} relative`}>
          {/* Profile picture with Neo-Glass styling */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-12">
            <div className="relative">
              <div className="h-20 w-20 rounded-full border-4 border-white/80 dark:border-slate-900/80 overflow-hidden bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg backdrop-blur-sm">
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
              {/* Neo-Glass glow effect */}
              <div className="absolute -inset-1 bg-blue-500/20 rounded-full blur-md -z-10"></div>
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
            {/* Domain - always show, display as "General" when value is "all" */}
            {userData.domain && (
              <div className="flex items-center gap-2">
                <Code className={`h-3.5 w-3.5 ${cardType === "minimalist" ? "text-blue-600 dark:text-blue-400" : "text-white/70"}`} />
                <span className={cardType === "minimalist" ? "text-gray-800 dark:text-gray-300" : "text-white"}>
                  {userData.domain === "all" ? "General" : userData.domain}
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
          <span className="text-xs text-white font-light">Quantum Card</span>
        </div>
      </div>
    </CardWrapper>
  );
};

export default VisitingCardPreview;
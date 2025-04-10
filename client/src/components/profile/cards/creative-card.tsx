import React from "react";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";
import { UserData } from "@/types/user";

interface CreativeCardProps {
  userData: UserData;
}

const CreativeCard: React.FC<CreativeCardProps> = ({ userData }) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  return (
    <div className="w-full aspect-[2/3.5] rounded-xl overflow-hidden relative shadow-xl">
      {/* Gradient background with fancy patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 z-0">
        {/* Decorative geometric elements */}
        <div className="absolute top-12 right-12 w-16 h-16 rounded-full bg-white/10"></div>
        <div className="absolute bottom-32 left-4 w-12 h-24 rounded-full bg-white/10 rotate-45"></div>
        <div className="absolute top-40 right-0 w-32 h-32 rounded-full bg-white/10 -rotate-12"></div>
        <div className="absolute bottom-4 left-8 w-40 h-8 rounded-full bg-white/10"></div>
      </div>
      
      {/* Main content layer */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {/* Profile picture with fancy border */}
        <div className="relative mx-auto mb-6">
          <div className="h-28 w-28 rounded-xl overflow-hidden border-4 border-white/30 rotate-12 bg-white/20 backdrop-blur-sm">
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                className="h-full w-full object-cover rotate-[-12deg] scale-[1.1]"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User");
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}`}
                alt={userData.name || "Profile"}
                className="h-full w-full object-cover rotate-[-12deg] scale-[1.1]"
              />
            )}
          </div>
        </div>
        
        {/* Name and title with stylized typography */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif" }}>
            {userData.name || "Your Name"}
          </h2>
          <p className="text-md text-white/80 mt-1 italic" style={{ fontFamily: "'Georgia', serif" }}>
            {userData.title || "Professional"}
          </p>
          
          {/* Industry and Domain */}
          {userData.industry && (
            <div className="mt-1 text-sm text-white/70 font-light">
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
        
        {/* Contact details with creative styling */}
        <div className="flex-1 space-y-4">
          {/* Container with glass effect */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-5 space-y-4">
            {/* Company with icon */}
            {userData.company && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center transform rotate-6">
                  <Briefcase className="h-5 w-5 text-white transform -rotate-6" />
                </div>
                <span className="text-sm text-white">{userData.company}</span>
              </div>
            )}
            
            {/* Email with icon */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center transform rotate-6">
                <Mail className="h-5 w-5 text-white transform -rotate-6" />
              </div>
              <span className="text-sm text-white">{userData.email}</span>
            </div>
            
            {/* Phone with icon */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center transform rotate-6">
                <Phone className="h-5 w-5 text-white transform -rotate-6" />
              </div>
              <span className="text-sm text-white">{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile link with icon */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center transform rotate-6">
                <Globe className="h-5 w-5 text-white transform -rotate-6" />
              </div>
              <span className="text-sm text-white">{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Floating action button */}
        <div className="absolute bottom-6 right-6">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-lg">
            <svg className="h-6 w-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreativeCard;
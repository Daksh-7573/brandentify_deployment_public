import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase, ArrowRight } from "lucide-react";
import { UserData } from "@/types/user";

interface FlipCardProps {
  userData: UserData;
}

const FlipCard: React.FC<FlipCardProps> = ({ userData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Toggle card flip state
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  return (
    <div className="w-full aspect-[2/3.5] perspective-1000 cursor-pointer" onClick={toggleFlip}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front side of the card */}
        <div 
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-xl flex flex-col"
        >
          {/* Header with accent color */}
          <div className="h-28 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-white/90 overflow-hidden border-4 border-white">
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
          
          {/* Main content */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-white mb-1">
              {userData.name || "Your Name"}
            </h2>
            <p className="text-sm text-emerald-400 font-medium mb-3">
              {userData.title || "Professional"}
            </p>
            
            {/* Company */}
            {userData.company && (
              <div className="text-sm text-slate-300 mb-2">
                {userData.company}
              </div>
            )}
            
            {/* Industry and Domain */}
            {userData.industry && (
              <div className="text-xs text-slate-400 mb-6">
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
            
            {/* Prompt to flip */}
            <div className="mt-6 flex items-center text-emerald-400 gap-2 text-sm">
              <span>Tap to view contact info</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
          
          {/* Footer */}
          <div className="h-12 bg-slate-800 flex items-center justify-center border-t border-slate-700">
            <span className="text-xs text-slate-400 font-light tracking-wider">FLIP TO SEE CONTACT INFO</span>
          </div>
        </div>
        
        {/* Back side of the card */}
        <div 
          className="absolute w-full h-full backface-hidden bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-xl flex flex-col rotate-y-180"
        >
          {/* Header */}
          <div className="h-16 bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
            <h3 className="text-white font-medium">Contact Information</h3>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-6 flex flex-col justify-center">
            <div className="space-y-5">
              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Email</p>
                  <p className="text-sm text-white">{userData.email}</p>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Phone</p>
                  <p className="text-sm text-white">{userData.phoneNumber || "Not provided"}</p>
                </div>
              </div>
              
              {/* Website/Profile */}
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">Profile</p>
                  <p className="text-sm text-emerald-400">{profileLink}</p>
                </div>
              </div>
              
              {/* Location */}
              {userData.location && (
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Location</p>
                    <p className="text-sm text-white">{userData.location}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Prompt to flip back */}
            <div className="mt-8 flex items-center justify-center text-emerald-400 gap-2 text-sm">
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Tap to flip back</span>
            </div>
          </div>
          
          {/* Footer */}
          <div className="h-12 bg-slate-800 flex items-center justify-center border-t border-slate-700">
            <span className="text-xs text-slate-400 font-light tracking-wider">DIGITAL BUSINESS CARD</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlipCard;

// Add these styles to your global CSS
const globalStyles = `
.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}
`;
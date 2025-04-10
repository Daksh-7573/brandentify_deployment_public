import React from "react";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";
import { UserData } from "@/types/user";

interface ArtisticCardProps {
  userData: UserData;
}

const ArtisticCard: React.FC<ArtisticCardProps> = ({ userData }) => {
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  return (
    <div className="w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl">
      {/* Watercolor background effect */}
      <div className="absolute inset-0 bg-white">
        {/* SVG watercolor pattern */}
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <filter id="watercolor" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="3" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="50" xChannelSelector="R" yChannelSelector="G" result="displacement" />
              <feGaussianBlur in="displacement" stdDeviation="5" result="blur" />
              <feBlend in="blur" in2="SourceGraphic" mode="multiply" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#f8f5f2" filter="url(#watercolor)" />
          <rect width="100%" height="100%" fill="url(#watercolor-gradient)" opacity="0.7" />
          
          <linearGradient id="watercolor-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffddd2" />
            <stop offset="40%" stopColor="#e29578" />
            <stop offset="60%" stopColor="#83c5be" />
            <stop offset="100%" stopColor="#006d77" />
          </linearGradient>
          
          {/* Paint stroke elements */}
          <path d="M0,50 Q50,30 100,50 T200,50 T300,50 T400,50" stroke="#83c5be" strokeWidth="60" fill="none" opacity="0.3" />
          <path d="M0,150 Q50,130 100,150 T200,150 T300,150 T400,150" stroke="#e29578" strokeWidth="40" fill="none" opacity="0.3" />
        </svg>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {/* Artistic header with hand-drawn line */}
        <div className="mb-6 text-center">
          <div className="relative mx-auto mb-4">
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-[#006d77]/70 mx-auto">
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
            <svg className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-8">
              <path d="M0,4 Q20,8 40,4 T80,4 T120,4 T160,4" stroke="#006d77" strokeWidth="2" fill="none" />
            </svg>
          </div>
          
          {/* Name with artistic font */}
          <h2 className="text-2xl font-bold text-[#006d77]" style={{ fontFamily: "'Georgia', serif" }}>
            {userData.name || "Your Name"}
          </h2>
          <p className="text-md text-[#e29578] italic mt-1" style={{ fontFamily: "'Georgia', serif" }}>
            {userData.title || "Professional"}
          </p>
          
          {/* Industry and Domain with hand-drawn underline */}
          {userData.industry && (
            <div className="relative mt-2 inline-block">
              <div className="text-sm text-[#006d77]/80">
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
              <svg className="absolute -bottom-2 left-0 w-full h-4">
                <path d="M0,2 Q10,4 20,2 T40,2 T60,2 T80,2 T100,2" stroke="#e29578" strokeWidth="1" fill="none" />
              </svg>
            </div>
          )}
        </div>
        
        {/* Contact details with painterly style */}
        <div className="flex-1 space-y-4">
          {/* Organic shape container */}
          <div className="bg-white/80 rounded-3xl p-5 space-y-4 relative overflow-hidden" 
               style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}>
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <path d="M0,50 Q50,30 100,50 T200,50 T300,50 T400,50" stroke="#83c5be" strokeWidth="60" fill="none" />
            </svg>
            
            {/* Company with painted icon */}
            {userData.company && (
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-[#006d77]" />
                </div>
                <span className="text-sm text-[#006d77]" style={{ fontFamily: "'Georgia', serif" }}>{userData.company}</span>
              </div>
            )}
            
            {/* Email with painted icon */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center">
                <Mail className="h-5 w-5 text-[#006d77]" />
              </div>
              <span className="text-sm text-[#006d77]" style={{ fontFamily: "'Georgia', serif" }}>{userData.email}</span>
            </div>
            
            {/* Phone with painted icon */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center">
                <Phone className="h-5 w-5 text-[#006d77]" />
              </div>
              <span className="text-sm text-[#006d77]" style={{ fontFamily: "'Georgia', serif" }}>
                {userData.phoneNumber || "Add phone number"}
              </span>
            </div>
            
            {/* Profile link with painted icon */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#83c5be]/30 flex items-center justify-center">
                <Globe className="h-5 w-5 text-[#006d77]" />
              </div>
              <span className="text-sm text-[#006d77]" style={{ fontFamily: "'Georgia', serif" }}>{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Artistic footer with flowing design */}
        <div className="mt-6 text-center relative">
          <svg className="absolute -top-6 left-0 w-full h-6 opacity-70">
            <path d="M0,4 Q40,0 80,4 T160,4 T240,4 T320,4" stroke="#e29578" strokeWidth="2" fill="none" />
          </svg>
          <div className="relative inline-block px-6 py-1 bg-[#006d77]/10">
            <p className="text-xs text-[#006d77] italic" style={{ fontFamily: "'Georgia', serif" }}>
              Artistic Digital Card
            </p>
          </div>
          <svg className="absolute -bottom-6 left-0 w-full h-6 opacity-70">
            <path d="M0,2 Q40,6 80,2 T160,2 T240,2 T320,2" stroke="#e29578" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default ArtisticCard;
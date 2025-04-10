import React from "react";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from "lucide-react";
import { UserData } from "@/types/user";

interface ArtisticCardProps {
  userData: UserData;
}

const ArtisticCard: React.FC<ArtisticCardProps> = ({ userData }) => {
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Hand-drawn SVG paths for decorative elements
  const decorativePaths = [
    "M0,10 C40,0 60,30 100,20",
    "M0,20 C30,40 70,10 100,30",
    "M0,30 C40,60 60,20 100,40",
    "M0,40 C30,20 70,50 100,30"
  ];
  
  return (
    <div className="w-full aspect-[2/3.5] relative overflow-hidden rounded-lg">
      {/* Paper texture background */}
      <div className="absolute inset-0 bg-amber-50 opacity-80"></div>
      
      {/* Hand-drawn border */}
      <div className="absolute inset-0 border-[5px] border-amber-800/20 rounded-lg" style={{ borderStyle: 'dashed' }}></div>
      
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0,0 C30,10 10,30 0,100" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M100,0 C70,10 90,30 100,100" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0,100 C30,90 10,70 0,0" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M100,100 C70,90 90,70 100,0" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>

      {/* Brush stroke decoration */}
      <div className="absolute inset-0 pointer-events-none">
        {decorativePaths.map((path, index) => (
          <div key={index} className="absolute opacity-10" style={{ top: `${(index + 1) * 20}%` }}>
            <svg width="100%" height="30" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path d={path} stroke="#7c2d12" strokeWidth="15" strokeLinecap="round" fill="none" opacity="0.3" />
            </svg>
          </div>
        ))}
      </div>
      
      {/* Content container */}
      <div className="relative z-10 w-full h-full p-6 flex flex-col">
        {/* Profile photo with hand-drawn frame */}
        <div className="relative mx-auto mb-6">
          <div className="absolute -inset-1 rounded-full border-[3px] border-amber-800/30 -rotate-3"></div>
          <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-amber-800/40 bg-white">
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
          
          {/* Hand-drawn circle around photo */}
          <svg className="absolute -inset-4 w-[calc(100%+32px)] h-[calc(100%+32px)] -z-10 opacity-30">
            <circle cx="50%" cy="50%" r="36%" fill="none" stroke="#7c2d12" strokeWidth="1" strokeDasharray="6,3" />
          </svg>
        </div>
        
        {/* Name and title */}
        <div className="text-center mb-5">
          <h2 className="text-2xl font-serif font-bold text-amber-900 mb-1">
            {userData.name || "Your Name"}
          </h2>
          <p className="text-sm font-serif italic text-amber-700">
            {userData.title || "Add your designation"}
          </p>
          
          {/* Hand-drawn divider */}
          <div className="w-32 h-3 mx-auto my-3 relative">
            <svg width="100%" height="100%" viewBox="0 0 100 10">
              <path d="M0,5 C20,2 40,8 60,5 S80,2 100,5" stroke="#7c2d12" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
        
        {/* Contact details with hand-drawn icon style */}
        <div className="space-y-3 flex-1">
          {userData.company && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Briefcase className="h-4 w-4 text-amber-800" />
              </div>
              <span className="text-sm text-amber-900">{userData.company}</span>
            </div>
          )}
          
          {userData.location && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-amber-800" />
              </div>
              <span className="text-sm text-amber-900">{userData.location}</span>
            </div>
          )}
          
          {userData.industry && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-amber-800" />
              </div>
              <span className="text-sm text-amber-900">{userData.industry}</span>
            </div>
          )}
          
          {userData.domain && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Code className="h-4 w-4 text-amber-800" />
              </div>
              <span className="text-sm text-amber-900">{userData.domain}</span>
            </div>
          )}
          
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Mail className="h-4 w-4 text-amber-800" />
            </div>
            <span className="text-sm text-amber-900">{userData.email}</span>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Phone className="h-4 w-4 text-amber-800" />
            </div>
            <span className="text-sm text-amber-900">{userData.phoneNumber || "Add phone number"}</span>
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
              <Globe className="h-4 w-4 text-amber-800" />
            </div>
            <span className="text-sm text-amber-900">{profileLink}</span>
          </div>
        </div>
        
        {/* Hand-drawn footer */}
        <div className="mt-auto pt-4 text-center">
          <p className="text-xs font-serif italic text-amber-700/70">Digital Visiting Card</p>
        </div>
      </div>
    </div>
  );
};

export default ArtisticCard;
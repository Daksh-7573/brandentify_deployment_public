import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";
import { UserData } from "@/types/user";

interface HolographicCardProps {
  userData: UserData;
}

const HolographicCard: React.FC<HolographicCardProps> = ({ userData }) => {
  // Track mouse position for holographic effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement for the holographic effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;

  // Calculate gradient and transform styles based on mouse position
  const gradientStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(168, 85, 247, 0.4), rgba(80, 70, 230, 0.2), transparent)`,
  };

  const transformStyle = {
    transform: `perspective(1000px) rotateX(${(mousePosition.y - 50) / 20}deg) rotateY(${(mousePosition.x - 50) / 20}deg)`,
    transition: 'transform 0.1s ease-out',
  };

  return (
    <div 
      className="w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl transition-all duration-300"
      onMouseMove={handleMouseMove}
      style={transformStyle}
    >
      <div 
        className="w-full h-full relative backdrop-blur-sm bg-white/10 dark:bg-black/30 border border-white/20 flex flex-col"
        style={{ boxShadow: 'inset 0 0 40px rgba(192, 132, 252, 0.15)' }}
      >
        {/* Holographic overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-60" 
          style={gradientStyle}
        ></div>
        
        {/* Glowing border */}
        <div className="absolute inset-0 border border-purple-500/20 rounded-xl"></div>
        
        {/* Main content container */}
        <div className="relative z-10 flex-1 flex flex-col p-6">
          {/* Profile picture with glow */}
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-70 blur-md"></div>
            <div className="h-24 w-24 rounded-full border-2 border-white/30 overflow-hidden bg-gray-800 relative z-10">
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
          
          {/* Name and title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1 drop-shadow-glow">
              {userData.name || "Your Name"}
            </h2>
            <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-0.5 w-16 mx-auto mb-2 opacity-70"></div>
            <p className="text-sm text-white/80 font-light">
              {userData.title || "Professional"}
            </p>
            
            {/* Industry and Domain */}
            {userData.industry && (
              <div className="mt-1 text-xs text-white/60">
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
          
          {/* Contact details with hover effects */}
          <div className="space-y-4 flex-1">
            {/* Company */}
            {userData.company && (
              <div className="flex items-center gap-3 group">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <Briefcase className="h-4 w-4 text-white/70 group-hover:text-white" />
                </div>
                <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                  {userData.company}
                </span>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <Mail className="h-4 w-4 text-white/70 group-hover:text-white" />
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {userData.email}
              </span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <Phone className="h-4 w-4 text-white/70 group-hover:text-white" />
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {userData.phoneNumber || "Add phone number"}
              </span>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-3 group">
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                <Globe className="h-4 w-4 text-white/70 group-hover:text-white" />
              </div>
              <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {profileLink}
              </span>
            </div>
          </div>
          
          {/* Footer with gradient */}
          <div className="pt-4 text-center">
            <div className="inline-block px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600/40 to-purple-600/40 backdrop-blur-md">
              <span className="text-xs text-white/80 font-light tracking-wider">HOLOGRAPHIC ID</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolographicCard;

// Add this style to your global CSS
const globalStyles = `
.drop-shadow-glow {
  filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.4));
}
`;
import React, { useState } from "react";
import { Mail, Phone, Globe, Briefcase } from "lucide-react";
import { UserData } from "@/types/user";

interface ThreeDAnimatedCardProps {
  userData: UserData;
}

const ThreeDAnimatedCard: React.FC<ThreeDAnimatedCardProps> = ({ userData }) => {
  // Track mouse position for 3D effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Handle mouse movement to create 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;

  // Calculate depth effect based on mouse position
  const cardStyle = {
    transform: `perspective(1000px) rotateY(${(mousePosition.x - 50) / 15}deg) rotateX(${-(mousePosition.y - 50) / 15}deg)`,
    transition: 'transform 0.1s ease-out',
  };

  // Calculate lighting effect based on mouse position
  const glowStyle = {
    background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(66, 153, 225, 0.5), transparent 40%)`,
  };
  
  return (
    <div 
      className="w-full aspect-[2/3.5] relative cursor-pointer"
      onMouseMove={handleMouseMove}
    >
      {/* Card with 3D transformation */}
      <div 
        className="w-full h-full rounded-xl overflow-hidden shadow-xl border border-blue-600/20 bg-gradient-to-br from-gray-900 to-blue-900 flex flex-col"
        style={cardStyle}
      >
        {/* Lighting overlay for 3D effect */}
        <div 
          className="absolute inset-0 opacity-60 pointer-events-none" 
          style={glowStyle}
        ></div>
        
        {/* Neon border effect */}
        <div className="absolute inset-0 rounded-xl border-2 border-blue-500/30 opacity-70 pointer-events-none"></div>
        
        {/* Main content container */}
        <div className="relative z-10 flex-1 flex flex-col p-6 overflow-hidden">
          {/* Top section with profile picture and blurred effect */}
          <div className="relative mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-blue-500 blur-md opacity-70 scale-110"></div>
            <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white/20 relative">
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
          
          {/* Name and title with stylized typography */}
          <div className="text-center mb-8">
            <div className="w-full flex justify-center">
              <div className="text-center relative">
                <div className="absolute inset-0 blur-sm opacity-70 bg-blue-500 translate-y-1"></div>
                <h2 className="text-2xl font-bold text-white relative">
                  {userData.name || "Your Name"}
                </h2>
              </div>
            </div>
            <p className="text-md text-blue-300 mt-2">
              {userData.title || "Professional"}
            </p>
            
            {/* Industry and Domain */}
            {userData.industry && (
              <div className="mt-1 text-sm text-gray-400">
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
          
          {/* Contact details with neon glow */}
          <div className="space-y-4 px-2">
            {/* Company */}
            {userData.company && (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-70"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center relative">
                    <Briefcase className="h-4 w-4 text-blue-300" />
                  </div>
                </div>
                <span className="text-sm text-white">{userData.company}</span>
              </div>
            )}
            
            {/* Email */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-70"></div>
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center relative">
                  <Mail className="h-4 w-4 text-blue-300" />
                </div>
              </div>
              <span className="text-sm text-white">{userData.email}</span>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-70"></div>
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center relative">
                  <Phone className="h-4 w-4 text-blue-300" />
                </div>
              </div>
              <span className="text-sm text-white">{userData.phoneNumber || "Add phone number"}</span>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full blur-md opacity-70"></div>
                <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center relative">
                  <Globe className="h-4 w-4 text-blue-300" />
                </div>
              </div>
              <span className="text-sm text-blue-300">{profileLink}</span>
            </div>
          </div>
        </div>
        
        {/* Footer with neon effect */}
        <div className="h-12 bg-gray-900 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30"></div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-sm bg-blue-500 opacity-70"></div>
              <span className="text-xs text-white relative font-light tracking-widest">3D DIGITAL CARD</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDAnimatedCard;
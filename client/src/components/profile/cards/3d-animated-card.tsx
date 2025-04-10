import React, { useState, useRef, useEffect } from "react";
import { UserData } from "@/types/user";
import { Mail, Phone, Globe, Briefcase, MapPin, Code, Building2 } from "lucide-react";

interface ThreeDAnimatedCardProps {
  userData: UserData;
}

const ThreeDAnimatedCard: React.FC<ThreeDAnimatedCardProps> = ({ userData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [blurAmount, setBlurAmount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (max 10 degrees)
    const rotX = (mouseY / (rect.height / 2)) * -5; // Invert Y rotation for natural tilt
    const rotY = (mouseX / (rect.width / 2)) * 5;
    
    // Calculate blur based on movement (max 2px)
    const movement = Math.abs(mouseX) + Math.abs(mouseY);
    const blur = Math.min(movement / 120, 2);
    
    // Update state
    setRotateX(rotX);
    setRotateY(rotY);
    setBlurAmount(blur);
  };
  
  // Reset on mouse leave
  const handleMouseLeave = () => {
    if (isFlipped) return;
    setRotateX(0);
    setRotateY(0);
    setBlurAmount(0);
  };
  
  // Toggle card flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Reset transforms when flipping
    if (!isFlipped) {
      setRotateX(0);
      setRotateY(0);
      setBlurAmount(0);
    }
  };
  
  // Add styles for 3D perspective
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .perspective-1000 { perspective: 1000px; }
      .preserve-3d { transform-style: preserve-3d; }
      .backface-hidden { backface-visibility: hidden; }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <div className="w-full perspective-1000" onClick={toggleFlip}>
      <div 
        ref={cardRef}
        className="w-full aspect-[2/3.5] rounded-lg overflow-hidden shadow-xl relative preserve-3d cursor-pointer transition-transform duration-500 ease-in-out"
        style={{
          transform: isFlipped 
            ? `rotateY(180deg)` 
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          filter: isFlipped ? "none" : `blur(${blurAmount}px)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-700 text-white backface-hidden flex flex-col"
        >
          {/* Card header */}
          <div className="h-24 relative bg-blue-800/50">
            {/* Light reflections for 3D effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-transparent opacity-70"></div>
            
            {/* Profile picture */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-12 z-10">
              <div className="h-20 w-20 rounded-full border-4 border-white overflow-hidden bg-white flex items-center justify-center shadow-lg">
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
          <div className="flex-1 px-4 pt-14 pb-4 flex flex-col relative">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-transparent opacity-50 pointer-events-none"></div>
            
            {/* Name and title */}
            <div className="text-center mb-3 relative z-10">
              <h2 className="text-xl font-bold text-white">
                {userData.name || "Your Name"}
              </h2>
              <p className="text-sm text-white/80">
                {userData.title || "Add your designation"}
              </p>
            </div>
            
            <div className="flex-1 space-y-2 text-xs relative z-10">
              {/* Domain */}
              {userData.domain && (
                <div className="flex items-center gap-2">
                  <Code className="h-3.5 w-3.5 text-white/70" />
                  <span className="text-white">{userData.domain}</span>
                </div>
              )}
              
              {/* Industry */}
              {userData.industry && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-white/70" />
                  <span className="text-white">{userData.industry}</span>
                </div>
              )}
              
              {/* Company */}
              {userData.company && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5 text-white/70" />
                  <span className="text-white">{userData.company}</span>
                </div>
              )}
              
              {/* Location */}
              {userData.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-white/70" />
                  <span className="text-white">{userData.location}</span>
                </div>
              )}
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-2 text-xs text-white/60 z-10">
              <p>Tap to see contact details</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="h-6 bg-white/10 flex items-center justify-center relative">
            {/* 3D effect shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <span className="text-xs text-white font-light relative z-10">Digital Visiting Card</span>
          </div>
        </div>
        
        {/* Back of card with contact details */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-600 text-white backface-hidden flex flex-col"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="h-16 bg-blue-900/50 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-transparent opacity-70"></div>
            <h2 className="text-lg font-bold text-white relative z-10">Contact Information</h2>
          </div>
          
          <div className="flex-1 p-6 space-y-4 flex flex-col justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent opacity-50 pointer-events-none"></div>
            
            {/* Email */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70">Email</p>
                <p className="text-sm text-white">{userData.email}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70">Phone</p>
                <p className="text-sm text-white">{userData.phoneNumber || "Add phone number"}</p>
              </div>
            </div>
            
            {/* Profile Link */}
            <div className="flex items-center gap-3 relative z-10">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-white/70">Profile</p>
                <p className="text-sm text-white">{profileLink}</p>
              </div>
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-2 text-xs text-white/60 z-10">
              <p>Tap to flip card</p>
            </div>
          </div>
          
          {/* Footer */}
          <div className="h-6 bg-white/10 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            <span className="text-xs text-white font-light relative z-10">Digital Visiting Card</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDAnimatedCard;
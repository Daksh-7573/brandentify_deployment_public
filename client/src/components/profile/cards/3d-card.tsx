import React, { useState, useRef, useEffect } from "react";
import { UserData } from "@/types/user";
import { 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  MapPin, 
  Code, 
  Building2, 
  Linkedin, 
  Link,
  QrCode,
  ArrowDown
} from "lucide-react";

interface ThreeDCardProps {
  userData: UserData;
}

const ThreeDCard: React.FC<ThreeDCardProps> = ({ userData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowOpacity, setGlowOpacity] = useState(0.5);
  const [deviceTilt, setDeviceTilt] = useState({ beta: 0, gamma: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle mouse movement for 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate distance from center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (max 15 degrees)
    const rotX = (mouseY / (rect.height / 2)) * -8; // Invert Y rotation for natural tilt
    const rotY = (mouseX / (rect.width / 2)) * 8;
    
    // Update glow opacity based on movement
    const distanceFromCenter = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
    const maxDistance = Math.sqrt(Math.pow(rect.width / 2, 2) + Math.pow(rect.height / 2, 2));
    const normalizedDistance = distanceFromCenter / maxDistance;
    const newGlowOpacity = 0.5 + normalizedDistance * 0.4; // Between 0.5 and 0.9
    
    // Update state
    setRotateX(rotX);
    setRotateY(rotY);
    setGlowOpacity(newGlowOpacity);
  };
  
  // Reset on mouse leave
  const handleMouseLeave = () => {
    if (isFlipped) return;
    // Revert to device tilt if available, otherwise reset
    if (deviceTilt.beta !== 0 || deviceTilt.gamma !== 0) {
      setRotateX(deviceTilt.beta / 5);
      setRotateY(deviceTilt.gamma / 3);
    } else {
      setRotateX(0);
      setRotateY(0);
    }
    setGlowOpacity(0.5);
  };
  
  // Toggle card flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Reset transforms when flipping
    if (!isFlipped) {
      setRotateX(0);
      setRotateY(0);
    }
  };
  
  // Handle device tilt
  useEffect(() => {
    // Add device orientation listener for mobile tilt effect
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      // Use type assertion to access these properties
      const beta = event.beta as number; // Front-to-back tilt in degrees
      const gamma = event.gamma as number; // Left-to-right tilt in degrees
      
      if (beta !== null && gamma !== null) {
        setDeviceTilt({ beta, gamma });
        
        // Only apply device tilt if not being interacted with mouse
        if (!cardRef.current?.matches(':hover') && !isFlipped) {
          setRotateX(beta / 10); // Divide by 10 to reduce sensitivity
          setRotateY(gamma / 5); // Divide by 5 to reduce sensitivity
        }
      }
    };
    
    // Add device orientation listener
    window.addEventListener('deviceorientation', handleDeviceOrientation as EventListener);
    
    // Add styles for 3D perspective
    const style = document.createElement('style');
    style.textContent = `
      .perspective-1200 { perspective: 1200px; }
      .preserve-3d { transform-style: preserve-3d; }
      .backface-hidden { backface-visibility: hidden; }
      .holographic-text {
        background-image: linear-gradient(
          to right,
          #12c2e9, #c471ed, #f64f59,
          #12c2e9, #c471ed, #f64f59
        );
        background-size: 200% auto;
        color: transparent;
        background-clip: text;
        -webkit-background-clip: text;
        animation: holographic-shimmer 3s linear infinite;
      }
      @keyframes holographic-shimmer {
        0% { background-position: 0% center; }
        100% { background-position: 200% center; }
      }
      .glow-pulse {
        animation: glow-pulse 3s infinite alternate;
      }
      @keyframes glow-pulse {
        0% { filter: drop-shadow(0 0 3px rgba(66, 153, 225, 0.5)); }
        100% { filter: drop-shadow(0 0 8px rgba(66, 153, 225, 0.8)); }
      }
      .bounce-in {
        animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes bounce-in {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation as EventListener);
      document.head.removeChild(style);
    };
  }, [isFlipped]);
  
  // Colors based on theme
  const themeColors = {
    bg: isDarkMode ? 'from-slate-900 to-slate-800' : 'from-white to-gray-100',
    bgBack: isDarkMode ? 'from-slate-800 to-slate-700' : 'from-gray-50 to-gray-200',
    accent: isDarkMode ? 'from-blue-600 to-purple-600' : 'from-blue-500 to-purple-500',
    textPrimary: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-700',
  };
  
  return (
    <div className="w-full perspective-1200" onClick={toggleFlip}>
      <div 
        ref={cardRef}
        className="w-full aspect-[2/3.5] rounded-xl overflow-hidden relative preserve-3d cursor-pointer transition-transform duration-500 ease-out shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
        style={{
          transform: isFlipped 
            ? `rotateY(180deg)` 
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Front of card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${themeColors.bg} backface-hidden flex flex-col`}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          
          {/* Floating glow effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 opacity-50 pointer-events-none"
            style={{ opacity: glowOpacity }}
          ></div>
          
          {/* Edge highlights */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-purple-400/50 to-transparent"></div>
          
          {/* Main content */}
          <div className="flex-1 p-6 flex flex-col items-center relative z-10">
            {/* 3D Profile Picture */}
            <div className="mb-5">
              <div className="w-24 h-24 relative bounce-in">
                {/* Glass sphere effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-300/30 to-purple-300/30 backdrop-blur-sm shadow-[0_0_15px_rgba(66,153,225,0.5)] overflow-hidden">
                  {/* Highlight */}
                  <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/20 rounded-full blur-md transform rotate-45"></div>
                </div>
                
                {/* Profile image */}
                <div className="absolute inset-2 rounded-full overflow-hidden border-2 border-white/20">
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
            
            {/* Name & Title with holographic effect */}
            <div className="text-center mb-6 bounce-in" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-xl font-bold holographic-text mb-1">
                {userData.name || "Your Name"}
              </h2>
              <p className={`text-sm ${themeColors.textSecondary}`}>
                {userData.title || "Add your designation"}
              </p>
            </div>
            
            {/* Info items */}
            <div className="w-full space-y-4 bounce-in" style={{ animationDelay: '0.2s' }}>
              {/* Domain & Industry */}
              <div className="flex flex-col items-center space-y-2">
                {userData.domain && (
                  <div className={`text-sm ${themeColors.textSecondary} flex items-center gap-2`}>
                    <Code className="h-4 w-4" />
                    <span>{userData.domain}</span>
                  </div>
                )}
                
                {userData.industry && (
                  <div className={`text-sm ${themeColors.textSecondary} flex items-center gap-2`}>
                    <Building2 className="h-4 w-4" />
                    <span>{userData.industry}</span>
                  </div>
                )}
              </div>
              
              {/* Company */}
              {userData.company && (
                <div className="flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600/20 to-purple-600/20 glow-pulse">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <span className={`text-sm font-medium ${themeColors.textPrimary}`}>
                      {userData.company}
                    </span>
                  </div>
                </div>
              )}
              
              {/* LinkedIn & Website Links */}
              <div className="flex justify-center gap-4 mt-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center transform hover:scale-110 transition-transform">
                  <Linkedin className="h-5 w-5 text-blue-500" />
                </div>
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center transform hover:scale-110 transition-transform">
                  <Link className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer - Flip instruction */}
          <div className="h-12 flex items-center justify-center relative">
            <div className="flex items-center animate-bounce">
              <ArrowDown className="h-4 w-4 mr-1 text-blue-500" />
              <span className="text-xs text-blue-500 font-medium">Tap to flip</span>
            </div>
          </div>
        </div>
        
        {/* Back of card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br ${themeColors.bgBack} backface-hidden flex flex-col`}
          style={{ transform: "rotateY(180deg)" }}
        >
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          
          {/* Edge highlights */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"></div>
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"></div>
          <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"></div>
          <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-purple-400/50 to-transparent"></div>
          
          {/* Header */}
          <div className="relative py-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
            <h2 className="relative z-10 text-center text-lg font-bold holographic-text">Contact Information</h2>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-6 flex flex-col items-center justify-center relative space-y-6">
            {/* Contact Items - These appear with a bounce effect */}
            {/* Email */}
            <div className="w-full flex items-center space-x-3 bounce-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center glow-pulse">
                <Mail className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className={`text-xs ${themeColors.textSecondary}`}>Email</p>
                <p className={`text-sm font-medium ${themeColors.textPrimary}`}>{userData.email}</p>
              </div>
            </div>
            
            {/* Phone */}
            <div className="w-full flex items-center space-x-3 bounce-in" style={{ animationDelay: '0.1s' }}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center glow-pulse">
                <Phone className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className={`text-xs ${themeColors.textSecondary}`}>Phone</p>
                <p className={`text-sm font-medium ${themeColors.textPrimary}`}>{userData.phoneNumber || "Add phone number"}</p>
              </div>
            </div>
            
            {/* Location */}
            {userData.location && (
              <div className="w-full flex items-center space-x-3 bounce-in" style={{ animationDelay: '0.2s' }}>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center glow-pulse">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className={`text-xs ${themeColors.textSecondary}`}>Location</p>
                  <p className={`text-sm font-medium ${themeColors.textPrimary}`}>{userData.location}</p>
                </div>
              </div>
            )}
            
            {/* QR Code (Simulated) */}
            <div className="mt-4 bounce-in" style={{ animationDelay: '0.3s' }}>
              <div className="w-24 h-24 relative mx-auto">
                <div className="absolute inset-0 rounded-md bg-gradient-to-br from-blue-100 to-white backdrop-blur-sm shadow-[0_0_15px_rgba(66,153,225,0.5)] flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-blue-500" />
                </div>
                <div className="absolute inset-0 rounded-md border border-white/30"></div>
              </div>
              <p className={`text-xs text-center mt-2 ${themeColors.textSecondary}`}>Scan to connect</p>
            </div>
            
            {/* Personal Tagline */}
            {userData.lookingFor && (
              <div className="max-w-xs mx-auto mt-4 text-center bounce-in" style={{ animationDelay: '0.4s' }}>
                <p className={`text-sm italic ${themeColors.textSecondary}`}>"{userData.lookingFor}"</p>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="h-12 flex items-center justify-center relative">
            <div className="flex items-center">
              <span className="text-xs text-blue-500 font-medium">Tap to return</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreeDCard;
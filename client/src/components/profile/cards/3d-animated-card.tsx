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
  ExternalLink, 
  Linkedin, 
  Github, 
  Twitter,
  Instagram,
  QrCode
} from "lucide-react";

interface ThreeDAnimatedCardProps {
  userData: UserData;
}

const ThreeDAnimatedCard: React.FC<ThreeDAnimatedCardProps> = ({ userData }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [showQR, setShowQR] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Handle mouse/touch movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get coordinates from either mouse or touch event
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Calculate distance from center
    const mouseX = clientX - centerX;
    const mouseY = clientY - centerY;
    
    // Calculate rotation (max 15 degrees)
    const rotX = (mouseY / (rect.height / 2)) * -8; // Invert Y rotation for natural tilt
    const rotY = (mouseX / (rect.width / 2)) * 8;
    
    // Calculate glow based on movement (max 8px)
    const movement = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2));
    const normalizedMovement = Math.min(movement / (rect.width / 2), 1);
    const glow = normalizedMovement * 15;
    
    // Update state
    setRotateX(rotX);
    setRotateY(rotY);
    setGlowIntensity(glow);
  };
  
  // Reset on mouse/touch leave
  const handleMovementEnd = () => {
    if (isFlipped) return;
    setRotateX(0);
    setRotateY(0);
    setGlowIntensity(0);
  };
  
  // Toggle card flip
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // Reset transforms when flipping
    if (!isFlipped) {
      setRotateX(0);
      setRotateY(0);
      setGlowIntensity(0);
    }
  };
  
  // Handle QR code display
  const toggleQR = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    setShowQR(!showQR);
  };
  
  // Mock data for QR code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(profileLink)}`;
  
  return (
    <div className="w-full" style={{ perspective: "1200px" }}>
      <div 
        ref={cardRef}
        className="w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-xl relative cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped 
            ? `rotateY(180deg)` 
            : `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.5), 
                     0 0 ${glowIntensity}px ${Math.max(1, glowIntensity / 2)}px rgba(139, 92, 246, ${0.3 + glowIntensity / 30})`,
          transition: "transform 0.6s cubic-bezier(0.15, 1.15, 0.6, 1)"
        }}
        onClick={toggleFlip}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={handleMovementEnd}
        onTouchEnd={handleMovementEnd}
      >
        {/* Front of card */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white flex flex-col overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden"
          }}
        >
          {/* Glass sphere effect for profile picture */}
          <div className="mt-10 relative flex items-center justify-center">
            {/* Circular background glow */}
            <div className="absolute w-36 h-36 rounded-full bg-gradient-to-tr from-fuchsia-600/20 via-transparent to-blue-500/20 opacity-70 blur-sm"></div>
            
            {/* Glass sphere */}
            <div className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 shadow-xl overflow-hidden flex items-center justify-center z-10">
              {/* Inner reflective highlight */}
              <div className="absolute top-0 left-1/4 w-1/2 h-1/4 bg-white/20 rounded-full blur-sm transform rotate-45"></div>
              
              {/* Profile picture with fallback */}
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-28 w-28 rounded-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=6366f1&color=fff";
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=6366f1&color=fff`}
                  alt={userData.name || "Profile"}
                  className="h-28 w-28 rounded-full object-cover"
                />
              )}
              
              {/* Curved glass reflection */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent"></div>
            </div>
            
            {/* Floating orb decorations */}
            <div 
              className="absolute top-5 right-1/4 w-5 h-5 rounded-full bg-indigo-500/40 blur-sm" 
              style={{ 
                animation: "floating 3s ease-in-out infinite",
                animationDelay: "0.5s"
              }}
            ></div>
            <div 
              className="absolute bottom-5 left-1/4 w-3 h-3 rounded-full bg-fuchsia-500/40 blur-sm" 
              style={{ 
                animation: "floating 3s ease-in-out infinite",
                animationDelay: "1s"
              }}
            ></div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 px-6 pt-8 pb-6 flex flex-col relative mt-2">
            {/* Glowing background effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/0 via-fuchsia-900/20 to-transparent blur-md"></div>
            
            {/* Name and title with holographic effect */}
            <div className="text-center mb-6 relative z-10">
              <h2 
                className="text-2xl font-semibold mb-1"
                style={{ 
                  backgroundImage: "linear-gradient(90deg, rgba(99,102,241,1) 0%, rgba(168,85,247,1) 35%, rgba(59,130,246,1) 70%, rgba(99,102,241,1) 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "shine 4s linear infinite"
                }}
              >
                {userData.name || "Your Name"}
              </h2>
              <p className="text-base text-indigo-200 font-light tracking-wide">
                {userData.title || "Add your designation"}
              </p>
            </div>
            
            {/* Information with glow hover effects */}
            <div className="flex-1 space-y-4 text-sm relative z-10">
              {/* Domain with metallic effect */}
              {userData.domain && (
                <div className="flex items-center gap-3">
                  <div 
                    className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center"
                    style={{ 
                      animation: "glowPulse 2s ease-in-out infinite"
                    }}
                  >
                    <Code className="h-4 w-4 text-indigo-300" />
                  </div>
                  <span className="text-indigo-100 font-light">
                    {userData.domain}
                  </span>
                </div>
              )}
              
              {/* Industry */}
              {userData.industry && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-indigo-300" />
                  </div>
                  <span className="text-indigo-100 font-light">
                    {userData.industry}
                  </span>
                </div>
              )}
              
              {/* Company - clickable with glow effect */}
              {userData.company && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-indigo-300" />
                  </div>
                  <a 
                    href="#" 
                    className="text-indigo-100 font-light flex items-center gap-1 hover:text-fuchsia-300 transition-colors group" 
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{userData.company}</span>
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </div>
              )}
              
              {/* Location */}
              {userData.location && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-indigo-300" />
                  </div>
                  <span className="text-indigo-100 font-light">
                    {userData.location}
                  </span>
                </div>
              )}
            </div>
            
            {/* Social links */}
            <div className="flex justify-center gap-4 mt-4 relative z-10">
              <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-400/20 flex items-center justify-center hover:bg-indigo-500/40 transition-colors cursor-pointer">
                <Linkedin className="h-4 w-4 text-indigo-200" />
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-400/20 flex items-center justify-center hover:bg-indigo-500/40 transition-colors cursor-pointer">
                <Twitter className="h-4 w-4 text-indigo-200" />
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-400/20 flex items-center justify-center hover:bg-indigo-500/40 transition-colors cursor-pointer">
                <Github className="h-4 w-4 text-indigo-200" />
              </div>
              <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-400/20 flex items-center justify-center hover:bg-indigo-500/40 transition-colors cursor-pointer">
                <Instagram className="h-4 w-4 text-indigo-200" />
              </div>
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-4 text-xs text-indigo-200/60 z-10">
              <p>Tap to flip for contact info</p>
            </div>
          </div>
          
          {/* Futuristic footer */}
          <div className="h-8 bg-indigo-900/30 backdrop-blur-sm border-t border-indigo-400/10 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-600/10 to-transparent"></div>
            <span className="text-xs text-indigo-200/70 font-light relative z-10 tracking-widest">QUANTUM CARD</span>
          </div>
        </div>
        
        {/* Back of card with contact details */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 text-white flex flex-col"
          style={{ 
            backfaceVisibility: "hidden", 
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          {/* Header with glass effect */}
          <div className="h-16 bg-indigo-900/30 backdrop-blur-sm border-b border-indigo-400/10 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-600/10 to-transparent"></div>
            <h2 
              className="text-lg font-semibold relative z-10"
              style={{ 
                backgroundImage: "linear-gradient(90deg, rgba(99,102,241,1) 0%, rgba(168,85,247,1) 35%, rgba(59,130,246,1) 70%, rgba(99,102,241,1) 100%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "shine 4s linear infinite"
              }}
            >
              Contact Information
            </h2>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-6 flex flex-col relative">
            {/* Radial gradient background */}
            <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }}></div>
            
            {/* QR code section - visible only when button is clicked */}
            {showQR && (
              <div 
                className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6"
                style={{ animation: "qrReveal 0.3s ease-out" }}
              >
                <div 
                  className="w-48 h-48 bg-white p-3 rounded-lg"
                  style={{ animation: "glowPulse 2s ease-in-out infinite" }}
                >
                  <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
                </div>
                <p className="text-sm text-indigo-200 mt-4">{profileLink}</p>
                <button 
                  className="mt-6 px-4 py-2 bg-indigo-600/30 border border-indigo-400/20 rounded-md text-sm text-indigo-200 hover:bg-indigo-500/40 transition-colors"
                  onClick={toggleQR}
                >
                  Close
                </button>
              </div>
            )}
            
            {/* Contact items */}
            <div className="space-y-5">
              {/* Email with glow animation */}
              <div className="flex items-center gap-4">
                <div 
                  className="h-12 w-12 rounded-full bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shadow-lg"
                  style={{ animation: "glowPulse 2s ease-in-out infinite" }}
                >
                  <Mail className="h-5 w-5 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-indigo-300/70 font-light">Email</p>
                  <a 
                    href={`mailto:${userData.email}`} 
                    className="text-indigo-100 text-sm font-light hover:text-fuchsia-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {userData.email}
                  </a>
                </div>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-4">
                <div 
                  className="h-12 w-12 rounded-full bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shadow-lg"
                  style={{ animation: "glowPulse 2s ease-in-out infinite" }}
                >
                  <Phone className="h-5 w-5 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-indigo-300/70 font-light">Phone</p>
                  <a 
                    href={userData.phoneNumber ? `tel:${userData.phoneNumber}` : "#"} 
                    className="text-indigo-100 text-sm font-light hover:text-fuchsia-300 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {userData.phoneNumber || "Add phone number"}
                  </a>
                </div>
              </div>
              
              {/* Profile Link */}
              <div className="flex items-center gap-4">
                <div 
                  className="h-12 w-12 rounded-full bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shadow-lg"
                  style={{ animation: "glowPulse 2s ease-in-out infinite" }}
                >
                  <Globe className="h-5 w-5 text-indigo-300" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-indigo-300/70 font-light">Profile</p>
                  <a 
                    href={`https://${profileLink}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-indigo-100 text-sm font-light hover:text-fuchsia-300 transition-colors flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{profileLink}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
              
              {/* Location with map link */}
              {userData.location && (
                <div className="flex items-center gap-4">
                  <div 
                    className="h-12 w-12 rounded-full bg-indigo-600/20 border border-indigo-400/30 flex items-center justify-center shadow-lg"
                    style={{ animation: "glowPulse 2s ease-in-out infinite" }}
                  >
                    <MapPin className="h-5 w-5 text-indigo-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-indigo-300/70 font-light">Location</p>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(userData.location)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-indigo-100 text-sm font-light hover:text-fuchsia-300 transition-colors flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>{userData.location}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {/* QR Code Button */}
            <div className="flex justify-center mt-6">
              <button 
                className="px-4 py-2 bg-indigo-600/30 border border-indigo-400/20 rounded-md text-sm text-indigo-200 hover:bg-indigo-500/40 transition-colors flex items-center gap-2"
                onClick={toggleQR}
              >
                <QrCode className="h-4 w-4" />
                <span>View QR Code</span>
              </button>
            </div>
            
            {/* Hint text */}
            <div className="text-center mt-auto text-xs text-indigo-200/60 pt-4">
              <p>Tap to flip card</p>
            </div>
          </div>
          
          {/* Futuristic footer */}
          <div className="h-8 bg-indigo-900/30 backdrop-blur-sm border-t border-indigo-400/10 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-600/10 to-transparent"></div>
            <span className="text-xs text-indigo-200/70 font-light relative z-10 tracking-widest">QUANTUM CARD</span>
          </div>
        </div>
      </div>
      
      {/* CSS keyframes and animations */}
      <style jsx>{`
        @keyframes shine {
          to { background-position: 200% center; }
        }
        
        @keyframes floating {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        
        @keyframes glowPulse {
          0% { filter: drop-shadow(0 0 2px rgba(99,102,241,0.6)); }
          50% { filter: drop-shadow(0 0 8px rgba(168,85,247,0.8)); }
          100% { filter: drop-shadow(0 0 2px rgba(99,102,241,0.6)); }
        }
        
        @keyframes qrReveal {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default ThreeDAnimatedCard;
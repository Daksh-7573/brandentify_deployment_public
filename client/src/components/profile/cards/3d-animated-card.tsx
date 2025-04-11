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
  MessageCircle,
  Copy,
  Hash
} from "lucide-react";

interface ThreeDAnimatedCardProps {
  userData: UserData;
}

const ThreeDAnimatedCard: React.FC<ThreeDAnimatedCardProps> = ({ userData }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Handle entrance animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardContentRef.current) {
        cardContentRef.current.style.opacity = "1";
        cardContentRef.current.style.transform = "translateY(0)";
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle mouse/touch movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    setIsHovered(true);
    
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
    const rotX = (mouseY / (rect.height / 2)) * -10; // Invert Y rotation for natural tilt
    const rotY = (mouseX / (rect.width / 2)) * 10;
    
    // Calculate glow based on movement
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
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlowIntensity(0);
  };
  
  // Toggle contact info slide-in
  const toggleContactInfo = () => {
    setShowContactInfo(!showContactInfo);
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(`${type} copied!`);
        setTimeout(() => setCopySuccess(""), 2000);
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  return (
    <div className="w-full" style={{ perspective: "1200px" }}>
      <div 
        ref={cardRef}
        className="w-full aspect-[2/3.5] rounded-[20px] overflow-hidden relative cursor-pointer"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          boxShadow: isHovered 
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.4),
               0 0 ${glowIntensity}px ${Math.max(2, glowIntensity / 2)}px rgba(56, 189, 248, ${0.4 + glowIntensity / 25})`
            : `0 10px 30px -5px rgba(0, 0, 0, 0.3),
               0 0 5px 1px rgba(56, 189, 248, 0.3)`,
          transition: "box-shadow 0.3s ease-out",
        }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        onMouseLeave={handleMovementEnd}
        onTouchEnd={handleMovementEnd}
        onClick={toggleContactInfo}
      >
        {/* Glassmorphism background */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            background: `
              linear-gradient(135deg, 
              rgba(30, 41, 59, 0.8) 0%, 
              rgba(17, 24, 39, 0.9) 100%)
            `,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: "20px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            overflow: "hidden"
          }}
        >
          {/* Animated gradient overlay */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              background: "linear-gradient(45deg, transparent 65%, rgba(56, 189, 248, 0.4) 100%)",
              filter: "blur(5px)",
              animation: isHovered ? "gradientShift 3s ease infinite" : "none"
            }}
          ></div>
          
          {/* Subtle particles */}
          <div className="particles-container absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <div 
                key={i}
                className="particle absolute rounded-full bg-white/10"
                style={{
                  width: `${Math.random() * 4 + 1}px`,
                  height: `${Math.random() * 4 + 1}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: Math.random() * 0.5 + 0.1,
                  animation: `float ${Math.random() * 10 + 10}s linear infinite`
                }}
              ></div>
            ))}
          </div>
        </div>
        
        {/* Card content with entrance animation */}
        <div 
          ref={cardContentRef}
          className="absolute inset-0 z-10 flex flex-col p-6"
          style={{
            opacity: 0,
            transform: "translateY(10px)",
            transition: "opacity 0.6s ease-out, transform 0.6s ease-out"
          }}
        >
          {/* Top section - Profile identity */}
          <div className="flex flex-col items-center mb-6">
            {/* Profile picture with animated glow */}
            <div className="relative mb-4">
              {/* Animated glow ring */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  background: "conic-gradient(from 0deg, #38bdf8, #818cf8, #c084fc, #38bdf8)",
                  filter: "blur(8px)",
                  opacity: isHovered ? 0.8 : 0.4,
                  transform: "scale(1.2)",
                  animation: "spin 5s linear infinite",
                  transition: "opacity 0.3s ease"
                }}
              ></div>
              
              {/* Profile image container */}
              <div className="w-24 h-24 rounded-full overflow-hidden border border-slate-700 relative z-10 transform-gpu" style={{
                boxShadow: "0 0 20px rgba(56, 189, 248, 0.3)"
              }}>
                {userData.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.name || "Profile"} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=1e3a8a&color=fff";
                    }}
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=1e3a8a&color=fff`}
                    alt={userData.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </div>
            
            {/* Name and title */}
            <div className="text-center" style={{ transform: `translateZ(30px)` }}>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-300 mb-1">
                {userData.name || "Your Name"}
              </h2>
              <p className="text-sm text-sky-200/90 font-light">
                {userData.title || "Add your designation"}
              </p>
            </div>
          </div>
          
          {/* Professional details section */}
          <div className="space-y-4 mb-6">
            {/* Industry/domain tags */}
            {industryTags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-5">
                {industryTags.map((tag, index) => (
                  <div 
                    key={index}
                    className="flex items-center px-3 py-1 rounded-full bg-slate-800/60 border border-sky-900/30 text-xs text-sky-300"
                  >
                    <Hash className="h-3 w-3 mr-1 text-sky-400" />
                    {tag.trim()}
                  </div>
                ))}
              </div>
            )}
            
            {/* Company */}
            {userData.company && (
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/60 text-sky-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <span className="text-sm">{userData.company}</span>
              </div>
            )}
            
            {/* Location */}
            {userData.location && (
              <div className="flex items-center gap-3 text-white/90">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/60 text-sky-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <span className="text-sm">{userData.location}</span>
              </div>
            )}
          </div>
          
          {/* Footer section with profile link */}
          <div className="mt-auto">
            <div className="flex items-center justify-center gap-3 text-white/80">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/60 text-sky-400">
                <Globe className="h-4 w-4" />
              </div>
              <span className="text-sm">{profileLink}</span>
            </div>
            
            {/* Tap to view contact info */}
            <div className="text-center mt-4">
              <p className="text-xs text-sky-200/60">Tap to view contact info</p>
            </div>
          </div>
        </div>
        
        {/* Contact information slide-in panel */}
        <div 
          className="absolute inset-x-0 bottom-0 bg-slate-900/90 backdrop-blur-lg border-t border-sky-900/30 p-5 rounded-t-3xl transition-transform duration-300 ease-in-out z-20"
          style={{
            transform: showContactInfo ? "translateY(0)" : "translateY(100%)",
            height: "40%",
            boxShadow: "0 -10px 30px -5px rgba(0, 0, 0, 0.3)"
          }}
        >
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-center text-white mb-4">Contact Information</h3>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-3 text-white group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/70 text-sky-400">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-slate-400">Email</p>
                  <p className="text-sm truncate">{userData.email}</p>
                </div>
                <button 
                  className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(userData.email, "Email");
                  }}
                >
                  <Copy className="h-4 w-4 text-slate-400" />
                </button>
              </div>
              
              {/* Phone */}
              <div className="flex items-center gap-3 text-white group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/70 text-sky-400">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-slate-400">Phone</p>
                  <p className="text-sm truncate">{userData.phoneNumber || "Add phone number"}</p>
                </div>
                {userData.phoneNumber && (
                  <button 
                    className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(userData.phoneNumber || "", "Phone");
                    }}
                  >
                    <Copy className="h-4 w-4 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Copy success message */}
            {copySuccess && (
              <div className="absolute top-2 right-2 bg-sky-500 text-white px-3 py-1 rounded-full text-xs animate-fade-in-out">
                {copySuccess}
              </div>
            )}
            
            <div className="text-center mt-auto">
              <p className="text-xs text-slate-400">Tap card to close</p>
            </div>
          </div>
        </div>
        
        {/* Neon edge glow effect */}
        <div 
          className="absolute inset-0 rounded-[20px] pointer-events-none"
          style={{
            boxShadow: isHovered 
              ? "inset 0 0 0 1px rgba(56, 189, 248, 0.5), 0 0 15px 2px rgba(56, 189, 248, 0.3)" 
              : "inset 0 0 0 1px rgba(56, 189, 248, 0.2), 0 0 5px 1px rgba(56, 189, 248, 0.2)",
            transition: "box-shadow 0.3s ease"
          }}
        ></div>
      </div>
      
      {/* CSS keyframes and animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg) scale(1.2); }
          to { transform: rotate(360deg) scale(1.2); }
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.7; }
          100% { opacity: 0.4; }
        }
        
        @keyframes animate-fade-in-out {
          0% { opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        .animate-fade-in-out {
          animation: animate-fade-in-out 2s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ThreeDAnimatedCard;
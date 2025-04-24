import React, { useState, useRef, useEffect } from "react";
import { UserData } from "@/types/user";
import { 
  Mail, 
  Phone, 
  Globe, 
  Briefcase, 
  MapPin, 
  ExternalLink, 
  Copy,
  Hash,
  Building2,
  Sparkles,
  Volume2,
  VolumeX
} from "lucide-react";

interface ThreeDAnimatedCardProps {
  userData: UserData;
}

const ThreeDAnimatedCard: React.FC<ThreeDAnimatedCardProps> = ({ userData }) => {
  // State variables
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [contactExpanded, setContactExpanded] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [layers, setLayers] = useState<HTMLElement[]>([]);
  
  // Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Colors
  const colors = {
    electricBlue: "#38bdf8",
    silverGray: "#cbd5e1",
    charcoalBlack: "#1e293b",
    mintGreen: "#10b981",
    neonPurple: "#c084fc"
  };
  
  // Set up audio element
  useEffect(() => {
    audioRef.current = new Audio("/sounds/ping-sound.mp3");
    return () => {
      if (audioRef.current) {
        audioRef.current = null;
      }
    };
  }, []);
  
  // Collect elements for parallax effect
  useEffect(() => {
    if (cardRef.current) {
      const layerElements = cardRef.current.querySelectorAll('[data-layer]');
      setLayers(Array.from(layerElements) as HTMLElement[]);
    }
  }, []);
  
  // Handle sound effects
  const playSound = () => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Error playing sound:", e));
    }
  };
  
  // Handle 3D tilt effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    setIsHovered(true);
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate center point of the card
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate mouse position relative to center
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    // Calculate rotation (max 15 degrees)
    const rotX = (mouseY / (rect.height / 2)) * -10; // Invert Y rotation
    const rotY = (mouseX / (rect.width / 2)) * 10;
    
    // Update rotation state
    setRotateX(rotX);
    setRotateY(rotY);
    
    // Apply parallax effect to layers
    layers.forEach(layer => {
      const depth = parseFloat(layer.getAttribute('data-layer') || "0");
      const moveX = mouseX * depth * 0.01;
      const moveY = mouseY * depth * 0.01;
      layer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    });
  };
  
  // Reset on mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    
    // Reset layer positions
    layers.forEach(layer => {
      layer.style.transform = 'translate3d(0, 0, 0)';
    });
  };
  
  // Copy to clipboard with sound feedback
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(`${type} copied!`);
        playSound();
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  // Handle contact info expansion
  const toggleContactInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setContactExpanded(!contactExpanded);
  };
  
  // Toggle sound effects
  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSoundEnabled(!soundEnabled);
  };

  return (
    <div className="w-full h-full" style={{ perspective: "1200px" }}>
      {/* Main Card Container */}
      <div
        ref={cardRef}
        className="w-full h-full rounded-lg overflow-visible relative cursor-pointer"
        style={{
          margin: "0 auto",
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: "transform 0.1s ease-out",
          boxShadow: isHovered 
            ? `0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 15px 2px ${colors.electricBlue}30`
            : "0 10px 30px -5px rgba(0, 0, 0, 0.3)",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Glass background with subtle particles */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.charcoalBlack} 0%, #0f172a 100%)`,
            overflow: "hidden",
            zIndex: 0
          }}
        >
          {/* Subtle background particles */}
          {[...Array(15)].map((_, index) => (
            <div
              key={index}
              className="absolute rounded-full"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                backgroundColor: `${colors.electricBlue}${Math.floor(Math.random() * 40 + 10)}`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
                animation: `floatParticle ${Math.random() * 10 + 15}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
          
          {/* Subtle grid overlay */}
          <div 
            className="absolute inset-0" 
            style={{
              backgroundImage: `
                linear-gradient(90deg, ${colors.electricBlue}08 1px, transparent 1px),
                linear-gradient(0deg, ${colors.electricBlue}08 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
              opacity: 0.3
            }}
          />
        </div>
        
        {/* Card Content Container */}
        <div className="absolute inset-0 p-6 pb-16 flex flex-col z-10 overflow-visible">
          {/* Profile Picture Section */}
          <div 
            className="flex justify-center mb-6 relative"
            data-layer="5"
          >
            {/* Animated glow ring */}
            <div className="relative w-28 h-28">
              {/* Outer glow ring */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  transform: "scale(1.15)",
                  background: `conic-gradient(from 0deg, ${colors.electricBlue}, ${colors.neonPurple}, ${colors.mintGreen}, ${colors.electricBlue})`,
                  filter: "blur(8px)",
                  opacity: isHovered ? 0.8 : 0.5,
                  animation: "spin 8s linear infinite",
                }}
              />
              
              {/* Inner glow ring */}
              <div 
                className="absolute inset-0 rounded-full"
                style={{
                  transform: "scale(1.05)",
                  boxShadow: `0 0 15px ${colors.electricBlue}60`,
                  animation: "pulse 3s infinite alternate ease-in-out",
                }}
              />
              
              {/* Profile image container */}
              <div 
                className="absolute inset-0 rounded-full overflow-hidden border-2"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  animation: "float 5s infinite ease-in-out",
                  boxShadow: `0 0 20px ${colors.electricBlue}40`,
                }}
              >
                {userData.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt={userData.name || "Profile"} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=1e293b&color=38bdf8`;
                    }}
                  />
                ) : (
                  <img 
                    src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=1e293b&color=38bdf8`}
                    alt={userData.name || "Profile"}
                    className="h-full w-full object-cover"
                  />
                )}
                
                {/* Light reflection overlay */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(45deg, transparent 40%, rgba(255, 255, 255, 0.1) 45%, rgba(255, 255, 255, 0.25) 50%, rgba(255, 255, 255, 0.1) 55%, transparent 60%)",
                    animation: "reflectionSweep 5s infinite ease-in-out",
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Name & Job Title Section */}
          <div 
            className="text-center mb-6"
            data-layer="4"
          >
            {/* Name with reflection effect */}
            <h2 
              className="text-2xl font-bold mb-1"
              style={{
                fontFamily: "'Sora', sans-serif",
                color: "white",
                letterSpacing: "0.02em",
                textShadow: `0 0 10px ${colors.electricBlue}40, 0 0 20px ${colors.electricBlue}30`,
                position: "relative",
              }}
            >
              {userData.name || "Your Name"}
              
              {/* Removed light reflection animation on text */}
            </h2>
            
            {/* Job Title */}
            <div 
              className="inline-block px-4 py-1 rounded-md"
              style={{
                background: `linear-gradient(90deg, ${colors.charcoalBlack}90, ${colors.charcoalBlack}70)`,
                border: `1px solid ${colors.electricBlue}30`,
                boxShadow: `0 2px 10px ${colors.electricBlue}20`,
                transform: "translateZ(20px)",
                animation: "float 4s infinite ease-in-out",
                animationDelay: "1s",
              }}
            >
              <p 
                className="text-sm font-medium"
                style={{
                  color: colors.silverGray,
                  textShadow: `0 0 5px ${colors.electricBlue}20`,
                }}
              >
                {userData.title || "Add your designation"}
              </p>
            </div>
          </div>
          
          {/* Industry Tags Section */}
          {industryTags.length > 0 && (
            <div 
              className="flex flex-wrap justify-center gap-2 mb-6"
              data-layer="3"
            >
              {industryTags.slice(0, 3).map((tag, index) => (
                <div 
                  key={index}
                  className="flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: `linear-gradient(90deg, ${colors.charcoalBlack}90, ${colors.charcoalBlack}70)`,
                    border: `1px solid ${[colors.electricBlue, colors.mintGreen, colors.neonPurple][index % 3]}50`,
                    color: [colors.electricBlue, colors.mintGreen, colors.neonPurple][index % 3],
                    boxShadow: `0 0 10px ${[colors.electricBlue, colors.mintGreen, colors.neonPurple][index % 3]}20`,
                    animation: `float ${4 + index * 0.5}s infinite ease-in-out`,
                    animationDelay: `${index * 0.5}s`,
                  }}
                >
                  <Hash className="h-3 w-3 mr-1 opacity-80" />
                  {tag.trim()}
                </div>
              ))}
            </div>
          )}
          
          {/* Company Info - Business Card Style */}
          {userData.company && (
            <div 
              className="mx-auto mb-5 px-4 py-3 rounded-md relative"
              data-layer="2"
              style={{
                width: "85%",
                background: `linear-gradient(135deg, ${colors.charcoalBlack}80, ${colors.charcoalBlack}50)`,
                backdropFilter: "blur(5px)",
                border: `1px solid ${colors.silverGray}20`,
                boxShadow: `0 10px 15px -5px ${colors.charcoalBlack}70`,
                transform: "translateZ(15px)",
                animation: "slideIn 0.5s ease-out",
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${colors.charcoalBlack}, ${colors.charcoalBlack}90)`,
                    border: `1px solid ${colors.silverGray}30`,
                  }}
                >
                  <Building2 
                    className="h-5 w-5"
                    style={{ color: colors.silverGray }}
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Company</p>
                  <p className="text-sm font-medium text-white">
                    {userData.company}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Location with Orbital Style */}
          {userData.location && (
            <div 
              className="flex justify-center mb-6"
              data-layer="2"
            >
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${colors.charcoalBlack}80, ${colors.charcoalBlack}50)`,
                  border: `1px solid ${colors.neonPurple}30`,
                  boxShadow: `0 0 10px ${colors.neonPurple}10`,
                  animation: "orbit 10s infinite linear",
                }}
              >
                <MapPin className="h-4 w-4 text-gray-300" />
                <span className="text-sm text-gray-300">
                  {userData.location}
                </span>
              </div>
            </div>
          )}
          
          {/* Contact Information with Glass Effect */}
          <div 
            className="mt-auto mb-12"
            data-layer="1"
          >
            <div 
              className={`w-full rounded-md overflow-visible transition-all duration-300`}
              style={{
                background: `linear-gradient(135deg, ${colors.charcoalBlack}80, ${colors.charcoalBlack}60)`,
                backdropFilter: "blur(10px)",
                border: `1px solid ${colors.electricBlue}20`,
                boxShadow: `0 0 20px ${colors.electricBlue}10`,
                height: contactExpanded ? "auto" : "40px",
                maxHeight: contactExpanded ? "none" : "40px",
                overflowY: "visible",
                marginBottom: contactExpanded ? "20px" : "0",
              }}
            >
              {/* Contact Header */}
              <div 
                className="flex items-center justify-between px-4 py-2 cursor-pointer"
                onClick={toggleContactInfo}
                style={{
                  borderBottom: contactExpanded ? `1px solid ${colors.electricBlue}20` : "none",
                }}
              >
                <h3 
                  className="text-sm font-medium"
                  style={{ color: contactExpanded ? colors.electricBlue : colors.silverGray }}
                >
                  Contact Information
                </h3>
                <div className="flex items-center gap-2">
                  <Sparkles 
                    className={`h-4 w-4 transition-opacity duration-500 ${contactExpanded ? 'opacity-100' : 'opacity-0'}`}
                    style={{ color: colors.electricBlue }}
                  />
                </div>
              </div>
              
              {/* Contact Details - Only shown when expanded */}
              {contactExpanded && (
                <div className="px-4 py-3 pb-10 space-y-3" style={{ marginBottom: "25px" }}>
                  {/* Email */}
                  <div className="flex items-start">
                    <Mail className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300 ml-2 break-all">
                      {userData.email}
                    </span>
                  </div>
                  
                  {/* Phone Number */}
                  {userData.phoneNumber && (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-300 ml-2 break-all">
                        {userData.phoneNumber}
                      </span>
                    </div>
                  )}
                  
                  {/* Profile Link */}
                  <div className="flex items-start">
                    <Globe className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-300 ml-2 break-all">
                      {profileLink}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Removed View Full Profile and Powered by Musk sections */}
          </div>
        </div>
        
        {/* Copy Success Message */}
        {copySuccess && (
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full z-50 text-xs"
            style={{
              background: colors.electricBlue,
              color: "white",
              boxShadow: `0 0 10px ${colors.electricBlue}50`,
              animation: "fadeInOut 2s forwards",
            }}
          >
            {copySuccess}
          </div>
        )}
        
        {/* Neon Edge Effect */}
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none z-30"
          style={{
            boxShadow: isHovered 
              ? `inset 0 0 0 1px ${colors.electricBlue}50, 0 0 20px 1px ${colors.electricBlue}30` 
              : `inset 0 0 0 1px ${colors.electricBlue}20`,
            transition: "box-shadow 0.3s ease"
          }}
        />
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg) scale(1.15); }
          to { transform: rotate(360deg) scale(1.15); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.4; }
          50% { opacity: 0.8; }
          100% { opacity: 0.4; }
        }
        
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes floatParticle {
          0% { transform: translate(0, 0); }
          25% { transform: translate(10px, 10px); }
          50% { transform: translate(5px, -10px); }
          75% { transform: translate(-10px, 5px); }
          100% { transform: translate(0, 0); }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -10px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
        
        /* Removed animations that were causing distracting background effects */
        
        @keyframes rise {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideIn {
          0% { transform: translateX(-30px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes orbit {
          0% { transform: translateX(-30px); }
          25% { transform: translateY(-15px) translateX(0); }
          50% { transform: translateX(30px); }
          75% { transform: translateY(15px) translateX(0); }
          100% { transform: translateX(-30px); }
        }
        
        @keyframes hueRotate {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(30deg); }
        }
      `}</style>
    </div>
  );
};

export default ThreeDAnimatedCard;
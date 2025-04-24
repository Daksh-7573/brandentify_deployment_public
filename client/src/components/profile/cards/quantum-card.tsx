import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Copy, 
  Zap, 
  Brain, 
  Cpu, 
  Satellite
} from "lucide-react";
import { UserData } from "@/types/user";

interface QuantumCardProps {
  userData: UserData;
}

const QuantumCard: React.FC<QuantumCardProps> = ({ userData }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);
  const profileLink = `brandentifier.com/${userData.name?.replace(/\s+/g, '').toLowerCase() || 'myprofile'}`;
  
  // Futuristic tech color scheme
  const colors = {
    darkBlue: "#0A0F2C",
    purpleBlue: "#1F1B44",
    neonPurple: "#B026FF",
    neonBlue: "#4D4DFF",
    neonTeal: "#05D9E8",
    neonGreen: "#01C38D",
    glassWhite: "rgba(255, 255, 255, 0.1)",
    glassBlack: "rgba(0, 0, 0, 0.2)",
  };
  
  // Load fields one-by-one with animation
  useEffect(() => {
    setDataLoaded(true);
  }, []);
  
  return (
    <div
      className="quantum-card w-full h-full flex flex-col relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        perspective: "1000px",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        transition: "transform 0.3s ease",
      }}
    >
      {/* Main Card Container */}
      <div
        className="card-container relative w-full h-full rounded-xl overflow-hidden flex flex-col"
        style={{
          background: `linear-gradient(135deg, ${colors.darkBlue}, ${colors.purpleBlue})`,
          boxShadow: isHovered 
            ? `0 0 25px ${colors.neonPurple}40, 0 0 15px ${colors.neonBlue}30, inset 0 0 10px ${colors.neonTeal}20`
            : `0 0 15px rgba(0, 0, 0, 0.5)`,
          transition: "all 0.3s ease",
          transformStyle: "preserve-3d",
          transform: isHovered ? "rotateY(5deg) rotateX(2deg)" : "rotateY(0) rotateX(0)",
        }}
      >
        {/* Background Grid Animation */}
        <div 
          className="absolute inset-0 w-full h-full z-0"
          style={{
            background: `
              linear-gradient(90deg, ${colors.glassWhite} 1px, transparent 1px),
              linear-gradient(0deg, ${colors.glassWhite} 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            opacity: 0.1,
          }}
        />
        
        {/* Animated Pulse Effects */}
        <div className="absolute z-0 w-full h-full">
          <div 
            className="absolute rounded-full"
            style={{
              width: "150px",
              height: "150px",
              background: `radial-gradient(circle, ${colors.neonPurple}10 0%, transparent 70%)`,
              top: "10%",
              left: "20%",
              animation: "pulse 8s infinite ease-in-out",
            }}
          />
          <div 
            className="absolute rounded-full"
            style={{
              width: "200px",
              height: "200px",
              background: `radial-gradient(circle, ${colors.neonBlue}10 0%, transparent 70%)`,
              bottom: "10%",
              right: "10%",
              animation: "pulse 10s infinite ease-in-out",
            }}
          />
        </div>
        
        {/* Angled Edge Overlays */}
        <div 
          className="absolute top-0 left-0 w-full h-20 z-10"
          style={{
            background: `linear-gradient(170deg, ${colors.neonPurple}20, transparent)`,
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-full h-20 z-10"
          style={{
            background: `linear-gradient(350deg, ${colors.neonBlue}20, transparent)`,
          }}
        />
        
        {/* Main Content Container */}
        <div className="z-20 flex flex-col p-6 h-full">
          {/* Top Section with Name, Title, Photo */}
          <div 
            className="flex items-center mb-6"
            style={{
              animation: dataLoaded ? "fadeInSlideUp 0.5s ease forwards" : "none",
              opacity: 0,
            }}
          >
            {/* Holographic Profile Image */}
            <div className="mr-4 relative">
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: "80px",
                  height: "80px",
                  background: colors.glassBlack,
                  border: `2px solid ${colors.neonPurple}40`,
                  boxShadow: isHovered 
                    ? `0 0 15px ${colors.neonTeal}40`
                    : `0 0 5px ${colors.neonTeal}20`,
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(45deg, ${colors.neonPurple}20, ${colors.neonBlue}20, transparent)`,
                    animation: "holographicShimmer 3s infinite linear",
                    mixBlendMode: "overlay",
                    zIndex: 2,
                  }}
                />
                <div className="w-full h-full">
                  {userData.photoURL ? (
                    <img 
                      src={userData.photoURL} 
                      alt={userData.name || "Profile"} 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=0A0F2C&color=01C38D`;
                      }}
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=0A0F2C&color=01C38D`}
                      alt={userData.name || "Profile"}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              </div>
              
              {/* Hexagonal Frame Animation */}
              <div 
                className="absolute top-0 left-0 right-0 bottom-0"
                style={{
                  animation: "rotate 10s infinite linear",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    width: "86px",
                    height: "86px",
                    top: "-3px",
                    left: "-3px",
                    background: "transparent",
                    borderRadius: "50%",
                    boxShadow: `0 0 0 2px ${colors.neonBlue}80`,
                    clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)",
                  }}
                />
              </div>
            </div>
            
            {/* Name and Title */}
            <div>
              <h2 
                className="text-xl font-bold mb-1"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Orbitron', sans-serif",
                  textShadow: `0 0 10px ${colors.neonPurple}80`,
                }}
              >
                {userData.name || "Your Name"}
              </h2>
              
              {/* Job Title Chip */}
              {userData.title && (
                <div 
                  className="px-3 py-1 inline-block rounded-md"
                  style={{
                    background: colors.glassBlack,
                    border: `1px solid ${colors.neonGreen}`,
                    boxShadow: `0 0 10px ${colors.neonGreen}40`,
                  }}
                >
                  <span 
                    className="text-sm font-medium"
                    style={{
                      color: colors.neonGreen,
                      fontFamily: "'Rajdhani', sans-serif",
                    }}
                  >
                    {userData.title}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Middle Section - Tags and Location */}
          <div className="mb-6 space-y-4">
            {/* Location with Satellite Icon */}
            {userData.location && (
              <div 
                className="flex items-center"
                style={{
                  animation: dataLoaded ? "fadeInSlideUp 0.7s ease forwards" : "none",
                  opacity: 0,
                }}
              >
                <div 
                  className="rounded-full p-1 mr-2"
                  style={{
                    background: colors.glassBlack,
                    border: `1px solid ${colors.neonTeal}40`,
                  }}
                >
                  <Satellite 
                    size={16} 
                    className="text-white"
                    style={{
                      filter: `drop-shadow(0 0 2px ${colors.neonTeal})`,
                    }}
                  />
                </div>
                <span 
                  className="text-sm"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {userData.location}
                </span>
              </div>
            )}
            
            {/* Industry and Domain Tags */}
            <div 
              className="flex flex-wrap gap-2"
              style={{
                animation: dataLoaded ? "fadeInSlideUp 0.9s ease forwards" : "none",
                opacity: 0,
              }}
            >
              {/* Industry Holographic Chip */}
              {userData.industry && (
                <div 
                  className="px-3 py-1.5 rounded-lg flex items-center"
                  style={{
                    background: `linear-gradient(135deg, ${colors.neonPurple}20, ${colors.neonBlue}10)`,
                    backdropFilter: "blur(4px)",
                    border: `1px solid ${colors.neonPurple}40`,
                    boxShadow: `0 0 10px ${colors.neonPurple}20`,
                  }}
                >
                  <Cpu 
                    size={14} 
                    className="mr-1.5"
                    style={{
                      color: colors.neonPurple,
                      filter: `drop-shadow(0 0 2px ${colors.neonPurple})`,
                    }}
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "'Rajdhani', sans-serif",
                      textShadow: `0 0 5px ${colors.neonPurple}80`,
                    }}
                  >
                    {userData.industry}
                  </span>
                </div>
              )}
              
              {/* Domain Pulse Tag */}
              {userData.domain && (
                <div 
                  className="px-3 py-1.5 rounded-lg flex items-center"
                  style={{
                    background: `linear-gradient(135deg, ${colors.neonBlue}20, ${colors.neonTeal}10)`,
                    backdropFilter: "blur(4px)",
                    border: `1px solid ${colors.neonTeal}40`,
                    boxShadow: `0 0 10px ${colors.neonTeal}20`,
                    animation: "pulse 2s infinite ease-in-out",
                  }}
                >
                  <Brain 
                    size={14} 
                    className="mr-1.5" 
                    style={{
                      color: colors.neonTeal,
                      filter: `drop-shadow(0 0 2px ${colors.neonTeal})`,
                    }}
                  />
                  <span 
                    className="text-xs font-medium"
                    style={{
                      color: "#FFFFFF",
                      fontFamily: "'Rajdhani', sans-serif",
                      textShadow: `0 0 5px ${colors.neonTeal}80`,
                    }}
                  >
                    {userData.domain}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom Section - Contact */}
          <div 
            className="mt-auto space-y-3 mb-1"
            style={{
              animation: dataLoaded ? "fadeInSlideUp 1.1s ease forwards" : "none",
              opacity: 0,
            }}
          >
            {/* Section Heading with Divider */}
            <div className="flex items-center mb-3">
              <div 
                className="flex-grow h-px mr-3"
                style={{
                  background: `linear-gradient(to right, transparent, ${colors.neonBlue}40)`,
                }}
              />
              <span 
                className="text-xs font-medium"
                style={{
                  color: colors.neonBlue,
                  fontFamily: "'Orbitron', sans-serif",
                  letterSpacing: "1px",
                }}
              >
                CONTACT GATEWAY
              </span>
              <div 
                className="flex-grow h-px ml-3"
                style={{
                  background: `linear-gradient(to left, transparent, ${colors.neonBlue}40)`,
                }}
              />
            </div>
            
            {/* Email */}
            <div 
              className="flex items-center rounded-md p-2 cursor-pointer"
              style={{
                background: colors.glassBlack,
                border: `1px solid ${colors.neonBlue}30`,
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                navigator.clipboard.writeText(userData.email);
                setCopySuccess('Email copied!');
                setTimeout(() => setCopySuccess(''), 2000);
              }}
            >
              <Mail 
                size={16} 
                className="mr-3"
                style={{
                  color: colors.neonBlue,
                  filter: `drop-shadow(0 0 2px ${colors.neonBlue})`,
                }}
              />
              <span 
                className="text-sm flex-1 truncate"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {userData.email}
              </span>
              <Copy 
                size={14} 
                style={{
                  color: colors.neonTeal,
                  opacity: 0.7,
                }}
              />
            </div>
            
            {/* Phone Number */}
            {userData.phoneNumber && (
              <div 
                className="flex items-center rounded-md p-2 cursor-pointer"
                style={{
                  background: colors.glassBlack,
                  border: `1px solid ${colors.neonPurple}30`,
                  transition: "all 0.3s ease",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(userData.phoneNumber || '');
                  setCopySuccess('Phone copied!');
                  setTimeout(() => setCopySuccess(''), 2000);
                }}
              >
                <Phone 
                  size={16} 
                  className="mr-3"
                  style={{
                    color: colors.neonPurple,
                    filter: `drop-shadow(0 0 2px ${colors.neonPurple})`,
                  }}
                />
                <span 
                  className="text-sm flex-1 truncate"
                  style={{
                    color: "#FFFFFF",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  {userData.phoneNumber}
                </span>
                <Copy 
                  size={14} 
                  style={{
                    color: colors.neonTeal,
                    opacity: 0.7,
                  }}
                />
              </div>
            )}
            
            {/* Profile URL as Barcode-style */}
            <div 
              className="flex items-center rounded-md p-2 cursor-pointer"
              style={{
                background: colors.glassBlack,
                border: `1px solid ${colors.neonGreen}30`,
                transition: "all 0.3s ease",
              }}
              onClick={() => {
                navigator.clipboard.writeText(profileLink);
                setCopySuccess('URL copied!');
                setTimeout(() => setCopySuccess(''), 2000);
              }}
            >
              <div 
                className="mr-3 h-4 w-10"
                style={{
                  background: `repeating-linear-gradient(90deg, ${colors.neonGreen}, ${colors.neonGreen} 2px, transparent 2px, transparent 4px)`,
                }}
              />
              <span 
                className="text-sm flex-1 truncate"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Rajdhani', sans-serif",
                }}
              >
                {profileLink}
              </span>
              <Copy 
                size={14} 
                style={{
                  color: colors.neonTeal,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Quantum Edge Effect */}
        <div 
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: isHovered 
              ? `inset 0 0 2px ${colors.neonTeal}40, inset 0 0 1px ${colors.neonBlue}40` 
              : `inset 0 0 1px ${colors.neonPurple}30`,
            transition: "box-shadow 0.3s ease",
          }}
        />
        
        {/* Copy Success Message */}
        {copySuccess && (
          <div 
            className="absolute top-4 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full z-50 text-xs"
            style={{
              background: colors.neonTeal,
              color: "#FFFFFF",
              boxShadow: `0 0 10px ${colors.neonTeal}50`,
              animation: "fadeInOut 2s forwards",
              fontFamily: "'Rajdhani', sans-serif",
            }}
          >
            {copySuccess}
          </div>
        )}
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');
        
        @keyframes fadeInSlideUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.7; transform: scale(1); }
        }
        
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes holographicShimmer {
          0% { opacity: 0.3; transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { opacity: 0.5; }
          100% { opacity: 0.3; transform: translateX(100%) translateY(100%) rotate(45deg); }
        }
        
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -10px); }
          10% { opacity: 1; transform: translate(-50%, 0); }
          90% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
      `}</style>
    </div>
  );
};

export default QuantumCard;
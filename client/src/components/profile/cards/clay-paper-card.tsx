import React, { useState, useRef, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building2, 
  Copy,
  Share2,
} from "lucide-react";
import { UserData } from "@/types/user";

// Quantum Orb Color Palette
const orbColors = {
  // Core colors
  darkBlue: "#0f172a",     // Background base
  deepPurple: "#1e1b4b",   // Secondary background
  midnightBlue: "#0f1729", // Dark accent
  
  // Orb and particle effects
  glassBlue: "rgba(56, 189, 248, 0.12)",  // Orb glass
  glassGlow: "rgba(186, 230, 253, 0.05)",  // Outer glow
  particleBlue: "#38bdf8",  // Light blue particles
  particlePurple: "#c084fc", // Light purple particles
  particleWhite: "#f8fafc",  // Light particles
  
  // Text and highlights
  neonBlue: "#38bdf8",     // Primary text/glow
  neonPurple: "#a855f7",   // Secondary text/glow
  neonPink: "#ec4899",     // Accent glow
  textPrimary: "#f8fafc",  // Primary text
  textSecondary: "#94a3b8", // Secondary text
};

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // Interaction states
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [activeRing, setActiveRing] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<number | null>(null);
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Copy to clipboard function
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopySuccess(`${type} copied!`);
        setTimeout(() => setCopySuccess(null), 2000);
      })
      .catch(err => {
        console.error('Error copying text: ', err);
      });
  };
  
  // Handle mouse movement for 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current && orbRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate rotation based on mouse position
      const rotationX = ((e.clientY - centerY) / (rect.height / 2)) * 5; // Max 5deg
      const rotationY = ((centerX - e.clientX) / (rect.width / 2)) * 5;  // Max 5deg
      
      setRotation({ x: rotationX, y: rotationY });
    }
  };
  
  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setHoveredSection(null);
    setActiveRing(null);
    
    // Smoothly transition back to center
    const startTime = Date.now();
    const startRotation = { ...rotation };
    const duration = 500; // ms
    
    const animateReset = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      setRotation({
        x: startRotation.x * (1 - easeProgress),
        y: startRotation.y * (1 - easeProgress)
      });
      
      if (progress < 1) {
        requestAnimationFrame(animateReset);
      }
    };
    
    requestAnimationFrame(animateReset);
  };
  
  // Handle ring clicks
  const toggleRing = (ring: string) => {
    if (activeRing === ring) {
      setActiveRing(null);
    } else {
      setActiveRing(ring);
    }
  };
  
  // Particle animation
  useEffect(() => {
    // Create canvas and set up particle system
    const setupParticles = () => {
      if (!cardRef.current) return;
      
      // Setup automatic rotation
      let angle = 0;
      intervalRef.current = window.setInterval(() => {
        angle += 0.005;
        
        // Apply gentle horizontal rotation
        if (!hoveredSection && activeRing === null) {
          setRotation({
            x: Math.sin(angle) * 2,
            y: Math.cos(angle) * 2
          });
        }
      }, 50);
    };
    
    setupParticles();
    
    // Cleanup
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [hoveredSection, activeRing]);
  
  // Main render
  return (
    <div 
      ref={cardRef}
      className="quantum-orb-card w-full aspect-[2/3.5] relative select-none overflow-hidden rounded-2xl"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: "1000px",
        background: `radial-gradient(circle at center, ${orbColors.deepPurple} 0%, ${orbColors.darkBlue} 70%, ${orbColors.midnightBlue} 100%)`,
        boxShadow: `0 0 30px -5px ${orbColors.glassGlow}, inset 0 0 20px 0px ${orbColors.glassGlow}`
      }}
    >
      {/* Subtle Star Field */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, ${orbColors.glassGlow} 1px, transparent 1px),
            radial-gradient(circle at 50% 80%, ${orbColors.glassGlow} 1px, transparent 1px),
            radial-gradient(circle at 80% 15%, ${orbColors.glassGlow} 1px, transparent 1px),
            radial-gradient(circle at 25% 65%, ${orbColors.glassGlow} 1px, transparent 1px),
            radial-gradient(circle at 70% 45%, ${orbColors.glassGlow} 1px, transparent 1px)
          `,
          backgroundSize: "120px 120px",
          opacity: 0.5
        }}
      />
      
      {/* Moving Orb Container */}
      <div 
        ref={orbRef}
        className="absolute inset-0 flex items-center justify-center z-10 p-4"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: hoveredSection || activeRing ? "transform 0.1s ease-out" : "transform 0.5s ease-out"
        }}
      >
        {/* Main Glass Orb */}
        <div 
          className="relative w-3/4 aspect-square rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${orbColors.glassBlue} 0%, rgba(10, 12, 32, 0.6) 80%)`,
            boxShadow: `0 0 40px -5px ${orbColors.glassGlow}, inset 0 0 20px 0px ${orbColors.glassGlow}`,
            backdropFilter: "blur(2px)",
            border: `1px solid rgba(255, 255, 255, 0.1)`,
            animation: "pulse 8s infinite alternate ease-in-out"
          }}
        >
          {/* Rotating Light Line */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: "transparent",
              border: `1px solid ${orbColors.neonBlue}`,
              opacity: 0.2,
              animation: "rotate 20s infinite linear"
            }}
          />
          
          {/* Second Rotating Light Line */}
          <div 
            className="absolute inset-[5%] rounded-full"
            style={{
              background: "transparent",
              border: `1px solid ${orbColors.neonPurple}`,
              opacity: 0.15,
              animation: "rotate 30s infinite linear reverse"
            }}
          />
          
          {/* Profile Picture Core */}
          <div 
            className="relative w-[45%] aspect-square rounded-full overflow-hidden z-20"
            style={{
              border: `1px solid rgba(255, 255, 255, 0.2)`,
              boxShadow: `0 0 15px 0px ${orbColors.glassGlow}`,
              animation: "pulse 6s infinite alternate ease-in-out"
            }}
            onMouseEnter={() => setHoveredSection('profile')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {userData.photoURL ? (
              <img 
                src={userData.photoURL} 
                alt={userData.name || "Profile"} 
                className="h-full w-full object-cover"
                style={{
                  filter: "brightness(1.1) contrast(1.1)",
                  animation: "rotate3d 20s infinite linear",
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=0f172a&color=38bdf8";
                }}
              />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=0f172a&color=38bdf8`}
                alt={userData.name || "Profile"} 
                className="h-full w-full object-cover"
                style={{
                  animation: "rotate3d 20s infinite linear",
                }}
              />
            )}
            
            {/* Glow overlay */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${orbColors.glassGlow} 0%, transparent 70%)`,
                opacity: hoveredSection === 'profile' ? 0.8 : 0.3,
                transition: "opacity 0.5s ease"
              }}
            />
          </div>
          
          {/* Name & Title */}
          <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{
              animation: "slow-rotate 60s infinite linear",
            }}
          >
            <div 
              className="absolute text-center tracking-wider"
              style={{
                color: orbColors.textPrimary,
                textShadow: `0 0 10px ${orbColors.neonBlue}`,
                fontFamily: "'Orbitron', sans-serif",
                opacity: 0.9,
              }}
            >
              <h2 
                className="text-base font-bold mb-1"
                style={{
                  letterSpacing: "0.15em",
                }}
              >
                {userData.name || "YOUR NAME"}
              </h2>
              <p 
                className="text-[10px]"
                style={{
                  color: orbColors.textSecondary,
                  letterSpacing: "0.1em",
                }}
              >
                {userData.title || "ADD DESIGNATION"}
              </p>
            </div>
          </div>
          
          {/* First Ring - Industry */}
          <div 
            className="absolute w-[150%] aspect-square rounded-full"
            style={{
              border: `1px solid ${activeRing === 'industry' ? orbColors.neonPurple : 'rgba(255, 255, 255, 0.1)'}`,
              opacity: activeRing === 'industry' ? 0.5 : 0.15,
              animation: "slow-rotate 80s infinite linear",
              transition: "all 0.3s ease",
              cursor: "pointer"
            }}
            onClick={() => toggleRing('industry')}
          >
            {/* Industry Marker */}
            <div 
              className="absolute top-[5%] left-1/2 transform -translate-x-1/2"
              style={{
                backgroundColor: orbColors.neonBlue,
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                boxShadow: `0 0 5px 1px ${orbColors.neonBlue}`,
                opacity: hoveredSection === 'industry' || activeRing === 'industry' ? 1 : 0.5,
                transition: "opacity 0.3s ease"
              }}
              onMouseEnter={() => setHoveredSection('industry')}
              onMouseLeave={() => setHoveredSection(null)}
            />
            
            {/* Industry Data Panel */}
            {(hoveredSection === 'industry' || activeRing === 'industry') && industryTags.length > 0 && (
              <div 
                className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-opacity-20 backdrop-blur-md rounded-lg p-2 z-30"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  boxShadow: `0 0 15px -5px ${orbColors.neonBlue}, inset 0 0 5px 0px ${orbColors.neonBlue}`,
                  borderTop: `1px solid ${orbColors.neonBlue}`,
                  borderBottom: `1px solid ${orbColors.neonBlue}`,
                  minWidth: "160px",
                  pointerEvents: "auto"
                }}
              >
                <div className="text-center mb-1">
                  <p 
                    className="text-[10px]"
                    style={{
                      color: orbColors.neonBlue,
                      letterSpacing: "0.1em",
                      fontFamily: "'Orbitron', sans-serif",
                    }}
                  >
                    INDUSTRY
                  </p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-1">
                  {industryTags.map((tag, index) => (
                    <div 
                      key={index}
                      className="text-[9px] px-2 py-1 rounded-md"
                      style={{
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        color: orbColors.textPrimary,
                        border: `1px solid ${orbColors.neonBlue}`,
                      }}
                    >
                      {tag.trim()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Second Ring - Company */}
          {userData.company && (
            <div 
              className="absolute w-[180%] aspect-square rounded-full"
              style={{
                border: `1px solid ${activeRing === 'company' ? orbColors.neonPink : 'rgba(255, 255, 255, 0.1)'}`,
                opacity: activeRing === 'company' ? 0.5 : 0.15,
                animation: "slow-rotate 120s infinite linear reverse",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onClick={() => toggleRing('company')}
            >
              {/* Company Marker */}
              <div 
                className="absolute top-[7%] left-1/2 transform -translate-x-1/2 rotate-45"
                style={{
                  backgroundColor: orbColors.neonPink,
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  boxShadow: `0 0 5px 1px ${orbColors.neonPink}`,
                  opacity: hoveredSection === 'company' || activeRing === 'company' ? 1 : 0.5,
                  transition: "opacity 0.3s ease"
                }}
                onMouseEnter={() => setHoveredSection('company')}
                onMouseLeave={() => setHoveredSection(null)}
              />
              
              {/* Company Data Panel */}
              {(hoveredSection === 'company' || activeRing === 'company') && (
                <div 
                  className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-opacity-20 backdrop-blur-md rounded-lg p-2 z-30"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    boxShadow: `0 0 15px -5px ${orbColors.neonPink}, inset 0 0 5px 0px ${orbColors.neonPink}`,
                    borderTop: `1px solid ${orbColors.neonPink}`,
                    borderBottom: `1px solid ${orbColors.neonPink}`,
                    minWidth: "160px",
                    pointerEvents: "auto"
                  }}
                >
                  <div className="text-center mb-1">
                    <p 
                      className="text-[10px]"
                      style={{
                        color: orbColors.neonPink,
                        letterSpacing: "0.1em",
                        fontFamily: "'Orbitron', sans-serif",
                      }}
                    >
                      COMPANY
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <Building2 className="w-3 h-3" style={{ color: orbColors.neonPink }} />
                    <span 
                      className="text-[11px]"
                      style={{
                        color: orbColors.textPrimary,
                      }}
                    >
                      {userData.company}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Third Ring - Location */}
          {userData.location && (
            <div 
              className="absolute w-[210%] aspect-square rounded-full"
              style={{
                border: `1px solid ${activeRing === 'location' ? orbColors.neonPurple : 'rgba(255, 255, 255, 0.1)'}`,
                opacity: activeRing === 'location' ? 0.5 : 0.15,
                animation: "slow-rotate 160s infinite linear",
                transition: "all 0.3s ease",
                cursor: "pointer"
              }}
              onClick={() => toggleRing('location')}
            >
              {/* Location Marker */}
              <div 
                className="absolute top-[9%] left-1/2 transform -translate-x-1/2 rotate-90"
                style={{
                  backgroundColor: orbColors.neonPurple,
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  boxShadow: `0 0 5px 1px ${orbColors.neonPurple}`,
                  opacity: hoveredSection === 'location' || activeRing === 'location' ? 1 : 0.5,
                  transition: "opacity 0.3s ease"
                }}
                onMouseEnter={() => setHoveredSection('location')}
                onMouseLeave={() => setHoveredSection(null)}
              />
              
              {/* Location Data Panel */}
              {(hoveredSection === 'location' || activeRing === 'location') && (
                <div 
                  className="absolute top-[-40px] left-1/2 transform -translate-x-1/2 bg-opacity-20 backdrop-blur-md rounded-lg p-2 z-30"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    boxShadow: `0 0 15px -5px ${orbColors.neonPurple}, inset 0 0 5px 0px ${orbColors.neonPurple}`,
                    borderTop: `1px solid ${orbColors.neonPurple}`,
                    borderBottom: `1px solid ${orbColors.neonPurple}`,
                    minWidth: "160px",
                    pointerEvents: "auto"
                  }}
                >
                  <div className="text-center mb-1">
                    <p 
                      className="text-[10px]"
                      style={{
                        color: orbColors.neonPurple,
                        letterSpacing: "0.1em",
                        fontFamily: "'Orbitron', sans-serif",
                      }}
                    >
                      LOCATION
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2">
                    <MapPin className="w-3 h-3" style={{ color: orbColors.neonPurple }} />
                    <span 
                      className="text-[11px]"
                      style={{
                        color: orbColors.textPrimary,
                      }}
                    >
                      {userData.location}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Floating Contact Nodes */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {/* Email Node */}
          <div 
            className="absolute top-[18%] right-[15%] cursor-pointer"
            style={{
              animation: "float 8s infinite alternate ease-in-out",
              pointerEvents: "auto"
            }}
            onMouseEnter={() => setHoveredSection('email')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                boxShadow: hoveredSection === 'email' 
                  ? `0 0 12px 2px ${orbColors.neonBlue}`
                  : `0 0 6px 1px ${orbColors.neonBlue}`,
                border: `1px solid ${orbColors.neonBlue}`,
                transition: "all 0.3s ease"
              }}
            >
              <Mail 
                className="w-4 h-4" 
                style={{ 
                  color: hoveredSection === 'email' ? orbColors.textPrimary : orbColors.neonBlue,
                  filter: hoveredSection === 'email' ? `drop-shadow(0 0 3px ${orbColors.neonBlue})` : 'none',
                  transition: "all 0.3s ease"
                }} 
              />
            </div>
            
            {/* Email Panel */}
            {hoveredSection === 'email' && (
              <div 
                className="absolute top-[100%] left-1/2 transform -translate-x-1/2 mt-2 bg-opacity-20 backdrop-blur-md rounded-lg p-2 z-30 whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  boxShadow: `0 0 15px -5px ${orbColors.neonBlue}, inset 0 0 5px 0px ${orbColors.neonBlue}`,
                  borderTop: `1px solid ${orbColors.neonBlue}`,
                  borderBottom: `1px solid ${orbColors.neonBlue}`,
                }}
              >
                <span 
                  className="text-[10px] flex items-center gap-2"
                  style={{
                    color: orbColors.textPrimary,
                  }}
                >
                  {userData.email}
                  <button
                    className="p-1 rounded hover:bg-[rgba(56,189,248,0.2)] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(userData.email, "Email");
                    }}
                    style={{
                      color: orbColors.neonBlue
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
          
          {/* Phone Node */}
          {userData.phoneNumber && (
            <div 
              className="absolute bottom-[23%] left-[15%] cursor-pointer"
              style={{
                animation: "float 7s infinite alternate-reverse ease-in-out",
                pointerEvents: "auto"
              }}
              onMouseEnter={() => setHoveredSection('phone')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div 
                className="flex items-center justify-center w-8 h-8 rounded-full"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.7)',
                  boxShadow: hoveredSection === 'phone' 
                    ? `0 0 12px 2px ${orbColors.neonPink}`
                    : `0 0 6px 1px ${orbColors.neonPink}`,
                  border: `1px solid ${orbColors.neonPink}`,
                  transition: "all 0.3s ease"
                }}
              >
                <Phone 
                  className="w-4 h-4" 
                  style={{ 
                    color: hoveredSection === 'phone' ? orbColors.textPrimary : orbColors.neonPink,
                    filter: hoveredSection === 'phone' ? `drop-shadow(0 0 3px ${orbColors.neonPink})` : 'none',
                    transition: "all 0.3s ease"
                  }} 
                />
              </div>
              
              {/* Phone Panel */}
              {hoveredSection === 'phone' && (
                <div 
                  className="absolute top-[100%] left-1/2 transform -translate-x-1/2 mt-2 bg-opacity-20 backdrop-blur-md rounded-lg p-2 z-30 whitespace-nowrap"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.8)',
                    boxShadow: `0 0 15px -5px ${orbColors.neonPink}, inset 0 0 5px 0px ${orbColors.neonPink}`,
                    borderTop: `1px solid ${orbColors.neonPink}`,
                    borderBottom: `1px solid ${orbColors.neonPink}`,
                  }}
                >
                  <span 
                    className="text-[10px] flex items-center gap-2"
                    style={{
                      color: orbColors.textPrimary,
                    }}
                  >
                    {userData.phoneNumber}
                    <button
                      className="p-1 rounded hover:bg-[rgba(236,72,153,0.2)] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(userData.phoneNumber || "", "Phone");
                      }}
                      style={{
                        color: orbColors.neonPink
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Website Node */}
          <div 
            className="absolute bottom-[25%] right-[18%] cursor-pointer"
            style={{
              animation: "float 9s infinite alternate-reverse ease-in-out",
              pointerEvents: "auto"
            }}
            onMouseEnter={() => setHoveredSection('website')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <div 
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                boxShadow: hoveredSection === 'website' 
                  ? `0 0 12px 2px ${orbColors.neonPurple}`
                  : `0 0 6px 1px ${orbColors.neonPurple}`,
                border: `1px solid ${orbColors.neonPurple}`,
                transition: "all 0.3s ease"
              }}
            >
              <Globe 
                className="w-4 h-4" 
                style={{ 
                  color: hoveredSection === 'website' ? orbColors.textPrimary : orbColors.neonPurple,
                  filter: hoveredSection === 'website' ? `drop-shadow(0 0 3px ${orbColors.neonPurple})` : 'none',
                  transition: "all 0.3s ease"
                }} 
              />
            </div>
            
            {/* Website Panel */}
            {hoveredSection === 'website' && (
              <div 
                className="absolute top-[100%] left-1/2 transform -translate-x-1/2 mt-2 bg-opacity-20 backdrop-blur-md rounded-lg p-2 z-30 whitespace-nowrap"
                style={{
                  backgroundColor: 'rgba(15, 23, 42, 0.8)',
                  boxShadow: `0 0 15px -5px ${orbColors.neonPurple}, inset 0 0 5px 0px ${orbColors.neonPurple}`,
                  borderTop: `1px solid ${orbColors.neonPurple}`,
                  borderBottom: `1px solid ${orbColors.neonPurple}`,
                }}
              >
                <span 
                  className="text-[10px] flex items-center gap-2"
                  style={{
                    color: orbColors.textPrimary,
                  }}
                >
                  {profileLink}
                  <button
                    className="p-1 rounded hover:bg-[rgba(168,85,247,0.2)] transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(`https://${profileLink}`, "Link");
                    }}
                    style={{
                      color: orbColors.neonPurple
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                </span>
              </div>
            )}
          </div>
          
          {/* Share Button */}
          <div 
            className="absolute bottom-[10%] left-1/2 transform -translate-x-1/2"
            style={{
              animation: "pulse 3s infinite alternate ease-in-out"
            }}
          >
            <button
              className="flex items-center gap-1 px-4 py-2 rounded-full"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: "blur(4px)",
                color: orbColors.textPrimary,
                border: `1px solid ${orbColors.neonBlue}`,
                boxShadow: `0 0 10px -3px ${orbColors.neonBlue}`,
              }}
              onClick={() => copyToClipboard(`https://${profileLink}`, "Profile link")}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="text-[11px] uppercase tracking-wider">Share</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Copy Success Message */}
      {copySuccess && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full text-xs z-50 px-3 py-1"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: orbColors.textPrimary,
            border: `1px solid ${orbColors.neonBlue}`,
            boxShadow: `0 0 15px -5px ${orbColors.neonBlue}`,
            backdropFilter: "blur(4px)",
            animation: "fadeInOut 2s forwards"
          }}
        >
          {copySuccess}
        </div>
      )}
      
      {/* Animations and Styles */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
          }
          
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes rotate3d {
            0% { transform: rotate3d(0, 1, 0.2, 0deg); }
            100% { transform: rotate3d(0, 1, 0.2, 360deg); }
          }
          
          @keyframes slow-rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0% { transform: translateY(0px); }
            100% { transform: translateY(-8px); }
          }
          
          /* Font import for neofuturistic text */
          @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700&display=swap');
          
          /* Print styles */
          @media print {
            body * {
              visibility: hidden;
            }
            .quantum-orb-card, .quantum-orb-card * {
              visibility: visible;
              transform: none !important;
              animation: none !important;
            }
            .quantum-orb-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background: #0f172a !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default ClayPaperCard;
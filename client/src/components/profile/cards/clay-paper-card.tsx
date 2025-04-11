import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building2, 
  Hash,
  Copy,
  Briefcase,
  ArrowRight
} from "lucide-react";
import { UserData } from "@/types/user";

// Modern futuristic colors for the orb interface
const orbColors = {
  // Deep space background
  deepSpace: "#0a0e17",
  midnightBlue: "#0f1b2d",
  nebulaPurple: "#2c1e4a",
  
  // Orb elements
  orbGlass: "rgba(220, 230, 255, 0.12)",
  orbCore: "rgba(150, 180, 255, 0.15)",
  ringBlue: "rgba(64, 156, 255, 0.75)",
  ringPurple: "rgba(147, 112, 219, 0.65)",
  ringTeal: "rgba(80, 200, 200, 0.7)",
  
  // Text and highlights
  glowText: "#ffffff",
  highlightBlue: "#4cc4ff",
  highlightPurple: "#a78bfa",
  highlightTeal: "#2dd4bf",
  
  // Particles and effects
  particle1: "rgba(100, 200, 255, 0.8)",
  particle2: "rgba(180, 120, 255, 0.7)",
  particle3: "rgba(120, 220, 220, 0.7)",
};

interface ClayPaperCardProps {
  userData: UserData;
}

const ClayPaperCard: React.FC<ClayPaperCardProps> = ({ userData }) => {
  // State to track hover and interaction
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [activeRing, setActiveRing] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [orbRotation, setOrbRotation] = useState({ x: 0, y: 0 });
  const [isDeepView, setIsDeepView] = useState(false);
  
  // Refs
  const orbRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  
  // Profile link format
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\\s+/g, '') : userData.username}`;
  
  // Define industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\\s*/) : [];
  if (!industryTags.length && userData.industry) {
    industryTags.push(userData.industry);
  }
  
  // Define identity keywords for orbiting text
  const identityKeywords = [
    "Innovator",
    "Problem Solver",
    "Team Builder",
    "Thought Leader",
    "Visionary"
  ];
  
  // Handle mouse movement for orb interaction
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!orbRef.current) return;
      
      const rect = orbRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from center (normalized to -1 to 1)
      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);
      
      // Apply rotation based on mouse position with dampening
      setOrbRotation({
        x: deltaY * -10, // Invert Y axis for natural tilt
        y: deltaX * 10
      });
    };
    
    // Automatic gentle rotation when not interacting
    const autoRotate = () => {
      setOrbRotation(prev => ({
        x: prev.x * 0.95,
        y: prev.y * 0.95
      }));
      
      animationRef.current = requestAnimationFrame(autoRotate);
    };
    
    // Start auto-rotation
    animationRef.current = requestAnimationFrame(autoRotate);
    
    // Add mousemove event listener
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  
  // Clipboard function
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
  
  // Toggle deep view mode
  const toggleDeepView = () => {
    setIsDeepView(!isDeepView);
  };
  
  // Generate random position for floating particles
  const getRandomPosition = () => {
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${5 + Math.random() * 10}s`
    };
  };
  
  return (
    <div 
      ref={orbRef}
      className="orb-interface w-full aspect-[2/3.5] relative select-none overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at center, ${orbColors.midnightBlue} 0%, ${orbColors.deepSpace} 100%)`,
        borderRadius: "24px",
        perspective: "1200px"
      }}
    >
      {/* Background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              backgroundColor: i % 3 === 0 ? orbColors.particle1 : 
                             i % 3 === 1 ? orbColors.particle2 : 
                             orbColors.particle3,
              opacity: Math.random() * 0.7 + 0.3,
              ...getRandomPosition(),
              animation: `floatParticle ${Math.random() * 15 + 10}s infinite linear`
            }}
          />
        ))}
      </div>
      
      {/* Main 3D Orb Container */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          perspective: "1200px",
          transformStyle: "preserve-3d",
        }}
      >
        {/* The Orb - Main 3D Element */}
        <div 
          className="orb relative w-[85%] aspect-square rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${orbColors.orbGlass}, ${orbColors.orbCore})`,
            boxShadow: `0 0 60px rgba(100, 180, 255, 0.15), 
                       inset 0 0 40px rgba(255, 255, 255, 0.1)`,
            backdropFilter: "blur(5px)",
            transform: `rotateX(${orbRotation.x}deg) rotateY(${orbRotation.y}deg)`,
            transformStyle: "preserve-3d",
            transition: "transform 0.1s ease-out"
          }}
          onClick={toggleDeepView}
        >
          {/* Light glint effect */}
          <div 
            className="absolute top-[20%] left-[25%] w-[15%] h-[10%] rounded-full bg-white opacity-30 blur-sm"
            style={{
              animation: "glintSlide 7s infinite ease-in-out"
            }}
          />
          
          {/* Pulsating core light */}
          <div 
            className="absolute inset-[15%] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(120,160,255,0.05) 100%)",
              animation: "pulsate 4s infinite ease-in-out",
              boxShadow: "0 0 30px rgba(100, 180, 255, 0.2)"
            }}
          />
          
          {/* Center core with profile */}
          <div 
            className="absolute inset-[30%] rounded-full flex items-center justify-center overflow-hidden"
            style={{
              background: "rgba(30, 40, 80, 0.3)",
              backdropFilter: "blur(3px)",
              boxShadow: "inset 0 0 20px rgba(100, 180, 255, 0.2)",
              animation: "slowRotate 20s infinite linear"
            }}
          >
            {/* Profile Image */}
            <div 
              className="w-[90%] h-[90%] rounded-full overflow-hidden"
              style={{
                border: "1px solid rgba(255, 255, 255, 0.2)",
                opacity: 0.9
              }}
            >
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL} 
                  alt={userData.name || "Profile"} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + (userData.name || "User") + "&background=152238&color=e2e8f0";
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=152238&color=e2e8f0`}
                  alt={userData.name || "Profile"}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          </div>
          
          {/* First Orbital Ring - Name & Title */}
          <div 
            className={`absolute inset-[-5%] rounded-full border border-opacity-30 z-10
                      ${hoveredSection === 'identity' ? 'ring-glow' : ''}`}
            style={{
              borderColor: orbColors.ringBlue,
              transform: "rotateX(75deg) rotateY(15deg)",
              animation: "rotateSlow 30s infinite linear",
              boxShadow: hoveredSection === 'identity' ? `0 0 15px ${orbColors.ringBlue}, inset 0 0 10px ${orbColors.ringBlue}` : 'none',
              opacity: activeRing === 1 ? 1 : activeRing ? 0.3 : 0.8
            }}
            onMouseEnter={() => {setHoveredSection('identity'); setActiveRing(1);}}
            onMouseLeave={() => {setHoveredSection(null); setActiveRing(null);}}
          >
            {/* Name panel */}
            <div 
              className="absolute top-[20%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded backdrop-blur-md"
              style={{
                background: "rgba(60, 100, 200, 0.15)",
                boxShadow: "0 0 15px rgba(100, 180, 255, 0.3)",
                border: "1px solid rgba(100, 180, 255, 0.2)",
                textAlign: "center"
              }}
            >
              <h2 
                className="text-lg font-bold"
                style={{
                  color: orbColors.glowText,
                  textShadow: `0 0 10px ${orbColors.highlightBlue}`,
                  fontFamily: "'Orbitron', sans-serif"
                }}
              >
                {userData.name || "Your Name"}
              </h2>
              <p
                className="text-xs mt-1"
                style={{
                  color: orbColors.glowText,
                  opacity: 0.8,
                  fontFamily: "'Sora', sans-serif"
                }}
              >
                {userData.title || "Your Position"}
              </p>
            </div>
            
            {/* Identity keywords circling the ring */}
            {identityKeywords.map((keyword, index) => {
              const angle = (index / identityKeywords.length) * 360;
              const radians = (angle * Math.PI) / 180;
              
              return (
                <div 
                  key={index}
                  className="absolute text-xs font-medium"
                  style={{
                    color: orbColors.glowText,
                    opacity: 0.7,
                    fontFamily: "'Sora', sans-serif",
                    textShadow: `0 0 5px ${orbColors.highlightBlue}`,
                    top: `${50 + 45 * Math.sin(radians)}%`,
                    left: `${50 + 45 * Math.cos(radians)}%`,
                    transform: "translate(-50%, -50%)",
                    animation: `pulseOpacity 4s infinite ease-in-out ${index * 0.5}s`
                  }}
                >
                  {keyword}
                </div>
              );
            })}
          </div>
          
          {/* Second Orbital Ring - Industry */}
          <div 
            className={`absolute inset-[-15%] rounded-full border border-opacity-30 z-20
                      ${hoveredSection === 'industry' ? 'ring-glow' : ''}`}
            style={{
              borderColor: orbColors.ringPurple,
              transform: "rotateX(55deg) rotateY(25deg)",
              animation: "rotateSlow 40s infinite linear reverse",
              boxShadow: hoveredSection === 'industry' ? `0 0 15px ${orbColors.ringPurple}, inset 0 0 10px ${orbColors.ringPurple}` : 'none',
              opacity: activeRing === 2 ? 1 : activeRing ? 0.3 : 0.8
            }}
            onMouseEnter={() => {setHoveredSection('industry'); setActiveRing(2);}}
            onMouseLeave={() => {setHoveredSection(null); setActiveRing(null);}}
          >
            {/* Industry panel */}
            <div 
              className="absolute top-[25%] left-[55%] transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded backdrop-blur-md"
              style={{
                background: "rgba(130, 100, 200, 0.15)",
                boxShadow: "0 0 15px rgba(147, 112, 219, 0.3)",
                border: "1px solid rgba(147, 112, 219, 0.2)",
                minWidth: "120px"
              }}
            >
              <div 
                className="text-xs font-bold mb-1 flex items-center"
                style={{
                  color: orbColors.highlightPurple,
                  fontFamily: "'Sora', sans-serif"
                }}
              >
                <Hash size={12} className="mr-1" />
                INDUSTRY
              </div>
              <div className="flex flex-wrap gap-1">
                {industryTags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: "rgba(147, 112, 219, 0.2)",
                      color: orbColors.glowText,
                      border: "1px solid rgba(147, 112, 219, 0.3)",
                      fontFamily: "'Sora', sans-serif"
                    }}
                  >
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Third Orbital Ring - Company & Location */}
          <div 
            className={`absolute inset-[-25%] rounded-full border border-opacity-30 z-30
                      ${hoveredSection === 'company' ? 'ring-glow' : ''}`}
            style={{
              borderColor: orbColors.ringTeal,
              transform: "rotateX(65deg) rotateY(-15deg)",
              animation: "rotateSlow 50s infinite linear",
              boxShadow: hoveredSection === 'company' ? `0 0 15px ${orbColors.ringTeal}, inset 0 0 10px ${orbColors.ringTeal}` : 'none',
              opacity: activeRing === 3 ? 1 : activeRing ? 0.3 : 0.8
            }}
            onMouseEnter={() => {setHoveredSection('company'); setActiveRing(3);}}
            onMouseLeave={() => {setHoveredSection(null); setActiveRing(null);}}
          >
            {/* Company panel */}
            {userData.company && (
              <div 
                className="absolute bottom-[30%] left-[30%] transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded backdrop-blur-md"
                style={{
                  background: "rgba(80, 200, 200, 0.15)",
                  boxShadow: "0 0 15px rgba(80, 200, 200, 0.3)",
                  border: "1px solid rgba(80, 200, 200, 0.2)"
                }}
              >
                <div 
                  className="text-xs font-bold mb-1 flex items-center"
                  style={{
                    color: orbColors.highlightTeal,
                    fontFamily: "'Sora', sans-serif"
                  }}
                >
                  <Building2 size={12} className="mr-1" />
                  COMPANY
                </div>
                <p
                  className="text-sm"
                  style={{
                    color: orbColors.glowText,
                    fontFamily: "'Sora', sans-serif"
                  }}
                >
                  {userData.company}
                </p>
              </div>
            )}
            
            {/* Location panel */}
            {userData.location && (
              <div 
                className="absolute top-[30%] right-[25%] transform -translate-x-1/2 -translate-y-1/2 px-3 py-2 rounded backdrop-blur-md"
                style={{
                  background: "rgba(80, 200, 200, 0.15)",
                  boxShadow: "0 0 15px rgba(80, 200, 200, 0.3)",
                  border: "1px solid rgba(80, 200, 200, 0.2)"
                }}
              >
                <div 
                  className="text-xs font-bold mb-1 flex items-center"
                  style={{
                    color: orbColors.highlightTeal,
                    fontFamily: "'Sora', sans-serif"
                  }}
                >
                  <MapPin size={12} className="mr-1" />
                  LOCATION
                </div>
                <p
                  className="text-sm"
                  style={{
                    color: orbColors.glowText,
                    fontFamily: "'Sora', sans-serif"
                  }}
                >
                  {userData.location}
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Contact Satellites */}
        <div className="absolute inset-0">
          {/* Email satellite */}
          <div 
            className={`absolute rounded-full flex items-center justify-center cursor-pointer
                      ${hoveredSection === 'email' ? 'satellite-glow' : ''}`}
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(100, 180, 255, 0.15)",
              border: "1px solid rgba(100, 180, 255, 0.3)",
              boxShadow: hoveredSection === 'email' ? "0 0 15px rgba(100, 180, 255, 0.5)" : "0 0 5px rgba(100, 180, 255, 0.3)",
              bottom: "20%",
              left: "15%",
              animation: "orbit 25s infinite linear",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={() => setHoveredSection('email')}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => copyToClipboard(userData.email, "Email")}
          >
            <Mail 
              size={18} 
              style={{
                color: orbColors.glowText,
                filter: "drop-shadow(0 0 3px rgba(100, 180, 255, 0.7))"
              }}
            />
            
            {/* Email tooltip */}
            {hoveredSection === 'email' && (
              <div 
                className="absolute left-full ml-3 px-3 py-1.5 rounded backdrop-blur-md whitespace-nowrap z-50"
                style={{
                  background: "rgba(20, 30, 60, 0.7)",
                  border: "1px solid rgba(100, 180, 255, 0.3)",
                  boxShadow: "0 0 10px rgba(100, 180, 255, 0.3)",
                  color: orbColors.glowText,
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "0.75rem"
                }}
              >
                {userData.email}
                <div 
                  className="absolute inset-y-0 -left-2 flex items-center"
                  style={{
                    color: orbColors.highlightBlue
                  }}
                >
                  <ArrowRight size={16} />
                </div>
              </div>
            )}
          </div>
          
          {/* Phone satellite */}
          {userData.phoneNumber && (
            <div 
              className={`absolute rounded-full flex items-center justify-center cursor-pointer
                        ${hoveredSection === 'phone' ? 'satellite-glow' : ''}`}
              style={{
                width: "40px",
                height: "40px",
                background: "rgba(147, 112, 219, 0.15)",
                border: "1px solid rgba(147, 112, 219, 0.3)",
                boxShadow: hoveredSection === 'phone' ? "0 0 15px rgba(147, 112, 219, 0.5)" : "0 0 5px rgba(147, 112, 219, 0.3)",
                top: "20%",
                right: "15%",
                animation: "orbit 30s infinite linear reverse",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={() => setHoveredSection('phone')}
              onMouseLeave={() => setHoveredSection(null)}
              onClick={() => copyToClipboard(userData.phoneNumber || "", "Phone")}
            >
              <Phone 
                size={18} 
                style={{
                  color: orbColors.glowText,
                  filter: "drop-shadow(0 0 3px rgba(147, 112, 219, 0.7))"
                }}
              />
              
              {/* Phone tooltip */}
              {hoveredSection === 'phone' && (
                <div 
                  className="absolute right-full mr-3 px-3 py-1.5 rounded backdrop-blur-md whitespace-nowrap z-50"
                  style={{
                    background: "rgba(20, 30, 60, 0.7)",
                    border: "1px solid rgba(147, 112, 219, 0.3)",
                    boxShadow: "0 0 10px rgba(147, 112, 219, 0.3)",
                    color: orbColors.glowText,
                    fontFamily: "'Sora', sans-serif",
                    fontSize: "0.75rem"
                  }}
                >
                  {userData.phoneNumber}
                  <div 
                    className="absolute inset-y-0 -right-2 flex items-center"
                    style={{
                      color: orbColors.highlightPurple
                    }}
                  >
                    <ArrowRight size={16} className="transform rotate-180" />
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Profile link satellite */}
          <div 
            className={`absolute rounded-full flex items-center justify-center cursor-pointer
                      ${hoveredSection === 'link' ? 'satellite-glow' : ''}`}
            style={{
              width: "40px",
              height: "40px",
              background: "rgba(80, 200, 200, 0.15)",
              border: "1px solid rgba(80, 200, 200, 0.3)",
              boxShadow: hoveredSection === 'link' ? "0 0 15px rgba(80, 200, 200, 0.5)" : "0 0 5px rgba(80, 200, 200, 0.3)",
              bottom: "30%",
              right: "20%",
              animation: "orbit 28s infinite linear",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={() => setHoveredSection('link')}
            onMouseLeave={() => setHoveredSection(null)}
            onClick={() => copyToClipboard(`https://${profileLink}`, "Profile link")}
          >
            <Globe 
              size={18} 
              style={{
                color: orbColors.glowText,
                filter: "drop-shadow(0 0 3px rgba(80, 200, 200, 0.7))"
              }}
            />
            
            {/* Link tooltip */}
            {hoveredSection === 'link' && (
              <div 
                className="absolute bottom-full mb-3 px-3 py-1.5 rounded backdrop-blur-md whitespace-nowrap z-50"
                style={{
                  background: "rgba(20, 30, 60, 0.7)",
                  border: "1px solid rgba(80, 200, 200, 0.3)",
                  boxShadow: "0 0 10px rgba(80, 200, 200, 0.3)",
                  color: orbColors.glowText,
                  fontFamily: "'Sora', sans-serif",
                  fontSize: "0.75rem"
                }}
              >
                {profileLink}
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 text-xs mt-1"
                  style={{
                    color: orbColors.highlightTeal
                  }}
                >
                  <ArrowRight size={16} className="transform rotate-90" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Copy success notification */}
      {copySuccess && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded backdrop-blur-md z-50"
          style={{
            background: "rgba(20, 30, 60, 0.7)",
            border: "1px solid rgba(100, 180, 255, 0.3)",
            boxShadow: "0 0 20px rgba(100, 180, 255, 0.3)",
            color: orbColors.glowText,
            fontFamily: "'Sora', sans-serif",
            animation: "fadeInOut 2s forwards"
          }}
        >
          {copySuccess}
        </div>
      )}
      
      {/* Instructions hint */}
      <div 
        className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs opacity-70"
        style={{
          color: orbColors.glowText,
          fontFamily: "'Sora', sans-serif",
          textAlign: "center",
          animation: "pulseOpacity 4s infinite ease-in-out"
        }}
      >
        Hover rings to explore • Click satellites to copy
      </div>
      
      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -40%) scale(0.9); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -60%) scale(0.9); }
          }
          
          @keyframes rotateSlow {
            from { transform: rotateZ(0deg); }
            to { transform: rotateZ(360deg); }
          }
          
          @keyframes glintSlide {
            0% { opacity: 0; transform: translate(-50px, -30px) scale(1); }
            30% { opacity: 0.3; transform: translate(0, 0) scale(1.2); }
            60% { opacity: 0; transform: translate(50px, 30px) scale(1); }
            100% { opacity: 0; transform: translate(-50px, -30px) scale(1); }
          }
          
          @keyframes pulsate {
            0% { transform: scale(0.95); opacity: 0.7; }
            50% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.7; }
          }
          
          @keyframes orbit {
            from { transform: rotate(0deg) translateX(130px) rotate(0deg); }
            to { transform: rotate(360deg) translateX(130px) rotate(-360deg); }
          }
          
          @keyframes pulseOpacity {
            0% { opacity: 0.4; }
            50% { opacity: 0.8; }
            100% { opacity: 0.4; }
          }
          
          @keyframes slowRotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes floatParticle {
            0% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-10px) translateX(20px); }
            75% { transform: translateY(20px) translateX(10px); }
            100% { transform: translateY(0) translateX(0); }
          }
          
          .satellite-glow {
            animation: pulsate 1.5s infinite ease-in-out !important;
          }
          
          .ring-glow {
            animation: pulsate 3s infinite ease-in-out !important;
          }
        `}
      </style>
    </div>
  );
};

export default ClayPaperCard;
import React, { useState, useEffect, useRef } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Copy,
  Hash,
  Globe,
  ExternalLink,
  ChevronUp,
  ChevronDown,
  Circle,
  CircleDot
} from "lucide-react";
import { UserData } from "@/types/user";

// Clay & Paper Card Color Palette
const colors = {
  // Background colors
  bgDark: "#07071C",         // Base dark background
  bgNavy: "#0C0C2C",         // Navy panel background
  bgCard: "#14142B",         // Card background
  
  // Neon colors
  teal: "#08F7C0",           // Primary neon
  magenta: "#DF09CA",        // Secondary neon
  cyberBlue: "#00A3FF",      // Accent neon
  
  // UI colors
  panelBg: "rgba(20, 20, 43, 0.8)",  // Panel background
  cardOverlay: "rgba(8, 247, 192, 0.03)", // Card overlay
  glassOverlay: "rgba(255, 255, 255, 0.03)",  // Glass highlight
  
  // Text colors
  textPrimary: "#FFFFFF",    // Primary text
  textSecondary: "#B4B4DE",  // Secondary text
  textMuted: "#6B6B95",      // Muted text
  
  // Border and shadows
  border: "rgba(8, 247, 192, 0.2)",  // Border glow
  shadowTeal: "0 0 15px rgba(8, 247, 192, 0.5)",  // Teal shadow
  shadowMagenta: "0 0 15px rgba(223, 9, 202, 0.5)",  // Magenta shadow
};

interface NeoGlowCardProps {
  userData: UserData;
}

const NeoGlowCard: React.FC<NeoGlowCardProps> = ({ userData }) => {
  // Interactive states
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [isContactExpanded, setIsContactExpanded] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState<'online' | 'offline' | 'away'>('online');
  
  // Refs for tilt effect
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  
  // Format profile link
  const profileLink = `brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Industry tags
  const industryTags = userData.industry ? userData.industry.split(/,\s*/).filter(tag => tag.trim()) : [];
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
  
  // Handle mouse movement for subtle 3D effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position - keep subtle (max 3deg)
    const rotationX = ((e.clientY - centerY) / (rect.height / 2)) * 3;
    const rotationY = ((centerX - e.clientX) / (rect.width / 2)) * 3;
    
    setRotation({ x: rotationX, y: rotationY });
  };
  
  // Reset rotation when mouse leaves
  const handleMouseLeave = () => {
    setHoveredSection(null);
    
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
  
  // Animation effect for simulating online status change
  useEffect(() => {
    const interval = setInterval(() => {
      const statuses: Array<'online' | 'offline' | 'away'> = ['online', 'away', 'online'];
      const randomIndex = Math.floor(Math.random() * statuses.length);
      setOnlineStatus(statuses[randomIndex]);
    }, 30000); // Change every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div 
      ref={cardRef}
      className="clay-paper-card w-full aspect-[2/3.5] relative select-none overflow-hidden rounded-2xl"
      style={{
        backgroundColor: colors.bgCard,
        boxShadow: `0 20px 30px -10px rgba(0, 0, 0, 0.5),
                    inset 0 0 0 1px ${colors.border},
                    0 0 20px ${colors.teal}20`,
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: "transform 0.2s ease-out",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Grid Background with Lines */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${colors.teal}30 1px, transparent 1px),
            linear-gradient(to bottom, ${colors.teal}20 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      
      {/* Background Glow Effects */}
      <div 
        className="absolute left-0 top-[10%] w-[70%] h-[20%] opacity-20 blur-3xl"
        style={{ 
          background: `radial-gradient(circle, ${colors.teal} 0%, transparent 70%)`,
          animation: "pulse 8s infinite alternate ease-in-out" 
        }}
      />
      <div 
        className="absolute right-0 bottom-[30%] w-[50%] h-[30%] opacity-15 blur-3xl"
        style={{ 
          background: `radial-gradient(circle, ${colors.magenta} 0%, transparent 70%)`,
          animation: "pulse 10s 2s infinite alternate ease-in-out" 
        }}
      />
      
      {/* Subtle Floating Dots */}
      <div 
        className="absolute top-[15%] right-[10%] w-1 h-1 rounded-full"
        style={{ 
          backgroundColor: colors.teal, 
          animation: "float 6s infinite ease-in-out",
          opacity: 0.6, 
        }}
      />
      <div 
        className="absolute bottom-[25%] left-[15%] w-1 h-1 rounded-full"
        style={{ 
          backgroundColor: colors.cyberBlue, 
          animation: "float 8s 1s infinite ease-in-out",
          opacity: 0.6, 
        }}
      />
      <div 
        className="absolute top-[45%] right-[25%] w-1.5 h-1.5 rounded-full"
        style={{ 
          backgroundColor: colors.magenta, 
          animation: "float 7s 2s infinite ease-in-out",
          opacity: 0.5, 
        }}
      />
      
      {/* Content Layout Grid */}
      <div className="absolute inset-0 flex flex-col p-5 z-10">
        {/* Profile Section */}
        <div className="relative mb-6 flex flex-col items-center">
          {/* Profile Picture with Neon Ring */}
          <div 
            className="relative mb-3 w-24 h-24"
            onMouseEnter={() => setHoveredSection('profile')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {/* Avatar Glow Ring */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                transform: "scale(1.05)",
                background: `radial-gradient(circle, transparent 55%, ${colors.teal} 75%, transparent 75%)`,
                opacity: hoveredSection === 'profile' ? 0.9 : 0.4,
                animation: "pulse 3s infinite alternate ease-in-out",
                transition: "opacity 0.5s ease",
              }}
            />
            
            {/* Rotating Ring */}
            <div 
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 10px ${colors.teal}80, inset 0 0 2px ${colors.teal}`,
                opacity: hoveredSection === 'profile' ? 1 : 0.8,
                transform: "scale(1.02)",
                animation: "rotate 15s linear infinite",
                transition: "opacity 0.3s ease",
              }}
            />
            
            {/* Avatar Container */}
            <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
              {userData.photoURL ? (
                <img 
                  src={userData.photoURL}
                  alt={userData.name || "Profile"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${userData.name || "User"}&background=${colors.bgNavy.substring(1)}&color=${colors.teal.substring(1)}`;
                  }}
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${userData.name || "User"}&background=${colors.bgNavy.substring(1)}&color=${colors.teal.substring(1)}`}
                  alt={userData.name || "Profile"}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Additional Overlay Glow */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 30% 30%, transparent 65%, ${colors.glassOverlay} 100%)`,
                }}
              />
            </div>
            
            {/* Online Status Indicator */}
            <div className="absolute bottom-1 right-1 z-20">
              {onlineStatus === 'online' && (
                <div className="relative">
                  <CircleDot className="h-4 w-4 text-green-500" />
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      boxShadow: `0 0 8px rgba(34, 197, 94, 0.7)`,
                      animation: "pulse 2s infinite",
                    }}
                  />
                </div>
              )}
              {onlineStatus === 'away' && (
                <Circle className="h-4 w-4 text-yellow-500" />
              )}
              {onlineStatus === 'offline' && (
                <Circle className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
          
          {/* Name and Title with Neon Text Effect */}
          <div 
            className="text-center relative"
            style={{
              transform: `translateY(${hoveredSection === 'name' ? '-2px' : '0'})`,
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={() => setHoveredSection('name')}
            onMouseLeave={() => setHoveredSection(null)}
          >
            <h2 
              className="text-xl font-bold mb-1"
              style={{
                color: colors.textPrimary,
                fontFamily: "'Space Grotesk', 'Sora', sans-serif",
                textShadow: hoveredSection === 'name' 
                  ? `0 0 10px ${colors.teal}, 0 0 20px ${colors.teal}60`
                  : `0 0 5px ${colors.teal}80`,
                letterSpacing: "0.05em",
                transition: "text-shadow 0.3s ease",
              }}
            >
              {userData.name || "YOUR NAME"}
            </h2>
            
            {/* Job Title in Glowing Pill */}
            <div 
              className="inline-block px-3 py-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, ${colors.bgNavy}, ${colors.bgCard})`,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 10px ${colors.teal}40`,
              }}
            >
              <p 
                className="text-sm font-medium"
                style={{
                  color: colors.textSecondary,
                  textShadow: `0 0 5px ${colors.teal}60`,
                }}
              >
                {userData.title || "ADD DESIGNATION"}
              </p>
            </div>
          </div>
        </div>
        
        {/* Glow Divider */}
        <div 
          className="w-full h-px mb-5"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.teal}, transparent)`,
            boxShadow: `0 0 8px ${colors.teal}80`,
          }}
        />
        
        {/* Industry Tags Section */}
        {industryTags.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap justify-center gap-2">
              {industryTags.slice(0, 3).map((tag, index) => (
                <div 
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: `${colors.bgNavy}`,
                    color: index === 0 ? colors.teal : index === 1 ? colors.cyberBlue : colors.magenta,
                    border: `1px solid ${index === 0 ? colors.teal : index === 1 ? colors.cyberBlue : colors.magenta}40`,
                    boxShadow: `0 0 8px ${index === 0 ? colors.teal : index === 1 ? colors.cyberBlue : colors.magenta}30`,
                    transform: `translateY(${hoveredSection === `tag-${index}` ? '-2px' : '0'})`,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={() => setHoveredSection(`tag-${index}`)}
                  onMouseLeave={() => setHoveredSection(null)}
                >
                  <Hash className="h-3 w-3 mr-1 opacity-70" />
                  {tag.trim()}
                </div>
              ))}
              
              {industryTags.length > 3 && (
                <div 
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium"
                  style={{
                    backgroundColor: colors.bgNavy,
                    color: colors.textMuted,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  +{industryTags.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Company and Location */}
        <div className="mb-auto space-y-3">
          {/* Company */}
          {userData.company && (
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{
                backgroundColor: colors.panelBg,
                borderLeft: `2px solid ${colors.cyberBlue}`,
                transform: `translateX(${hoveredSection === 'company' ? '3px' : '0'})`,
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={() => setHoveredSection('company')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <Building2 
                className="h-4 w-4 flex-shrink-0"
                style={{
                  color: colors.cyberBlue,
                  filter: `drop-shadow(0 0 3px ${colors.cyberBlue}80)`,
                }}
              />
              <span 
                className="text-sm"
                style={{
                  color: colors.textSecondary,
                }}
              >
                {userData.company}
              </span>
            </div>
          )}
          
          {/* Location */}
          {userData.location && (
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-md"
              style={{
                backgroundColor: colors.panelBg,
                borderLeft: `2px solid ${colors.magenta}`,
                transform: `translateX(${hoveredSection === 'location' ? '3px' : '0'})`,
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={() => setHoveredSection('location')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <MapPin 
                className="h-4 w-4 flex-shrink-0"
                style={{
                  color: colors.magenta,
                  filter: `drop-shadow(0 0 3px ${colors.magenta}80)`,
                }}
              />
              <span 
                className="text-sm"
                style={{
                  color: colors.textMuted,
                }}
              >
                {userData.location}
              </span>
            </div>
          )}
        </div>
        
        {/* Contact Section - Slide Up Panel */}
        <div className="mt-4">
          {/* Contact Header with Toggle */}
          <div 
            className="flex justify-between items-center px-2 py-1.5 mb-2 cursor-pointer"
            style={{
              borderBottom: `1px solid ${colors.border}`,
            }}
            onClick={() => setIsContactExpanded(!isContactExpanded)}
          >
            <h3 
              className="text-xs font-bold tracking-wider"
              style={{
                color: colors.textSecondary,
                letterSpacing: "0.1em",
              }}
            >
              CONTACT INFO
            </h3>
            
            <div
              style={{
                color: colors.teal,
                transform: `rotate(${isContactExpanded ? '0deg' : '180deg'})`,
                transition: "transform 0.3s ease",
              }}
            >
              {isContactExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronUp className="h-4 w-4" />
              )}
            </div>
          </div>
          
          {/* Contact Content */}
          <div
            className="space-y-3 overflow-hidden"
            style={{
              maxHeight: isContactExpanded ? '200px' : '0',
              opacity: isContactExpanded ? 1 : 0,
              transition: "max-height 0.5s ease, opacity 0.3s ease",
            }}
          >
            {/* Email */}
            <div 
              className="flex items-center justify-between px-3 py-2 rounded-md"
              style={{
                backgroundColor: colors.panelBg,
                transform: `translateY(${hoveredSection === 'email' ? '-2px' : '0'})`,
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={() => setHoveredSection('email')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Mail 
                  className="h-4 w-4 flex-shrink-0"
                  style={{
                    color: colors.teal,
                    filter: `drop-shadow(0 0 3px ${colors.teal}80)`,
                  }}
                />
                <span 
                  className="text-sm truncate max-w-[150px]"
                  style={{
                    color: colors.textSecondary,
                  }}
                >
                  {userData.email}
                </span>
              </div>
              
              <button
                className="p-1 rounded hover:bg-black/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  copyToClipboard(userData.email, "Email");
                }}
                title="Copy email"
              >
                <Copy 
                  className="h-3.5 w-3.5" 
                  style={{ color: colors.textMuted }}
                />
              </button>
            </div>
            
            {/* Phone */}
            {userData.phoneNumber && (
              <div 
                className="flex items-center justify-between px-3 py-2 rounded-md"
                style={{
                  backgroundColor: colors.panelBg,
                  transform: `translateY(${hoveredSection === 'phone' ? '-2px' : '0'})`,
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={() => setHoveredSection('phone')}
                onMouseLeave={() => setHoveredSection(null)}
              >
                <div className="flex items-center gap-2">
                  <Phone 
                    className="h-4 w-4 flex-shrink-0"
                    style={{
                      color: colors.cyberBlue,
                      filter: `drop-shadow(0 0 3px ${colors.cyberBlue}80)`,
                      animation: hoveredSection === 'phone' ? 'shake 0.8s ease-in-out infinite' : 'none',
                    }}
                  />
                  <span 
                    className="text-sm truncate max-w-[150px]"
                    style={{
                      color: colors.textSecondary,
                    }}
                  >
                    {userData.phoneNumber}
                  </span>
                </div>
                
                <button
                  className="p-1 rounded hover:bg-black/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(userData.phoneNumber, "Phone");
                  }}
                  title="Copy phone"
                >
                  <Copy 
                    className="h-3.5 w-3.5" 
                    style={{ color: colors.textMuted }}
                  />
                </button>
              </div>
            )}
            
            {/* Profile Link */}
            <div 
              className="flex items-center justify-between px-3 py-2 rounded-md"
              style={{
                backgroundColor: colors.panelBg,
                transform: `translateY(${hoveredSection === 'profile-link' ? '-2px' : '0'})`,
                transition: "transform 0.3s ease",
              }}
              onMouseEnter={() => setHoveredSection('profile-link')}
              onMouseLeave={() => setHoveredSection(null)}
            >
              <div className="flex items-center gap-2">
                <Globe 
                  className="h-4 w-4 flex-shrink-0"
                  style={{
                    color: colors.magenta,
                    filter: `drop-shadow(0 0 3px ${colors.magenta}80)`,
                  }}
                />
                <span 
                  className="text-sm truncate max-w-[150px]"
                  style={{
                    color: colors.textSecondary,
                  }}
                >
                  {profileLink}
                </span>
              </div>
              
              <div className="flex gap-1">
                <button
                  className="p-1 rounded hover:bg-black/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(`https://${profileLink}`, "Link");
                  }}
                  title="Copy link"
                >
                  <Copy 
                    className="h-3.5 w-3.5" 
                    style={{ color: colors.textMuted }}
                  />
                </button>
                <button
                  className="p-1 rounded hover:bg-black/20 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`https://${profileLink}`, '_blank');
                  }}
                  title="Open link"
                >
                  <ExternalLink 
                    className="h-3.5 w-3.5" 
                    style={{ color: colors.textMuted }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copy Success Message */}
      {copySuccess && (
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-2 rounded-lg z-50"
          style={{
            backgroundColor: 'rgba(20, 20, 43, 0.95)',
            color: colors.teal,
            boxShadow: `0 0 20px ${colors.teal}40, 0 0 5px ${colors.teal}30`,
            border: `1px solid ${colors.border}`,
            animation: "fadeInOut 2s forwards",
            backdropFilter: "blur(5px)",
          }}
        >
          <span className="text-sm font-medium">{copySuccess}</span>
        </div>
      )}
      
      {/* Animations */}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
          
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes float {
            0% { transform: translateY(0) rotate(0); }
            50% { transform: translateY(-5px) rotate(3deg); }
            100% { transform: translateY(0) rotate(0); }
          }
          
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(1px); }
            50% { transform: translateX(-1px); }
            75% { transform: translateX(1px); }
            100% { transform: translateX(0); }
          }
          
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
            15% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            85% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          }
          
          /* Font imports */
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Sora:wght@400;500;700&display=swap');
        `}
      </style>
    </div>
  );
};

export default NeoGlowCard;